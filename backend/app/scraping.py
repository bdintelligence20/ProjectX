import spacy
import PyPDF2
import docx
import pandas as pd
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import tiktoken
import logging
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
import os
from pinecone import Pinecone, ServerlessSpec
from supabase import create_client, Client

# Load environment variables and initialize OpenAI, Pinecone, and Supabase clients
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pinecone_client = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_SECRET")
supabase: Client = create_client(supabase_url, supabase_key)

# Pinecone configuration
index_name = "business-research"
if index_name not in pinecone_client.list_indexes().names():
    pinecone_client.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
index = pinecone_client.Index(index_name)

# Initialize tokenizer and set token limits
tokenizer = tiktoken.get_encoding("cl100k_base")
MODEL = "text-embedding-3-small"
MAX_TOKENS = 1500  # Set a fixed max tokens per chunk

def get_embedding(text):
    """Generate an embedding for a text using OpenAI's model."""
    try:
        response = client.embeddings.create(input=[text], model=MODEL)
        if response.data:
            return response.data[0].embedding
    except Exception as e:
        logging.error(f"Error generating embedding: {str(e)}")
    return None

def chunk_text(text, max_tokens=MAX_TOKENS, overlap_tokens=100):
    """
    Chunk text into fixed-size windows with a specified overlap.
    """
    tokens = tokenizer.encode(text)
    chunks = []
    start = 0

    while start < len(tokens):
        end = start + max_tokens
        chunk = tokens[start:end]
        decoded_chunk = tokenizer.decode(chunk)
        chunks.append(decoded_chunk)
        start += max_tokens - overlap_tokens  # Shift by max_tokens minus overlap

    logging.debug(f"Total chunks created: {len(chunks)}")
    return chunks

def store_in_pinecone(source_id, chunks, namespace="global_knowledge_base"):
    """
    Store embeddings, text, and metadata in Pinecone for each chunk.
    """
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        if embedding is None:
            logging.error(f"Failed to generate embedding for chunk {i}. Skipping.")
            continue
        vector_id = f"{source_id}_chunk_{i}"
        metadata = {"text": chunk}
        try:
            index.upsert([(vector_id, embedding, metadata)], namespace=namespace)
            logging.debug(f"Stored chunk {i} in Pinecone with embedding.")
        except Exception as e:
            logging.error(f"Error during Pinecone upsert for chunk {i}: {str(e)}")

def store_in_supabase(file_path, bucket_name, file_name):
    """
    Upload the original document to Supabase.
    """
    with open(file_path, 'rb') as file:
        response = supabase.storage.from_(bucket_name).upload(file_name, file)
        if response.status_code != 200:
            logging.error(f"Error uploading file to Supabase: {response.json()}")
        else:
            logging.debug(f"Uploaded {file_name} to Supabase bucket {bucket_name}.")

# Text extraction functions
def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_csv(file_path):
    df = pd.read_csv(file_path)
    return df.to_string()

def extract_text_from_txt(file_path):
    with open(file_path, 'r') as file:
        return file.read()

def extract_text_from_file(file_path, file_type):
    """Extract text based on file type."""
    if file_type == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        return extract_text_from_docx(file_path)
    elif file_type == 'csv':
        return extract_text_from_csv(file_path)
    elif file_type == 'txt':
        return extract_text_from_txt(file_path)
    else:
        raise ValueError("Unsupported file type")
        
# Adjusted website scraping function with limited recursion and chunk control
def scrape_website(url, max_depth=2, depth=0, visited_urls=None, max_chunks=10):
    if visited_urls is None:
        visited_urls = set()
    
    # Limit recursion depth
    if depth > max_depth or url in visited_urls:
        return []

    visited_urls.add(url)
    try:
        response = requests.get(url, timeout=5)  # Set shorter timeout
        response.raise_for_status()
        response.encoding = response.encoding or 'utf-8'

        soup = BeautifulSoup(response.text, 'html.parser')
        page_text = soup.get_text(separator=' ', strip=True)

        # Chunk the text from the page, limiting chunks
        scraped_data = chunk_text(page_text)[:max_chunks]

        # Process links for additional pages within chunk limit
        base_url = "{0.scheme}://{0.netloc}".format(urlparse(url))
        for link in soup.find_all('a', href=True):
            link_url = urljoin(base_url, link['href'])
            if should_visit_link(link_url, base_url, visited_urls):
                # Extend only if max_chunks not yet reached
                if len(scraped_data) < max_chunks:
                    scraped_data.extend(
                        scrape_website(link_url, max_depth, depth + 1, visited_urls, max_chunks)
                    )
        return scraped_data[:max_chunks]  # Limit total chunks returned
    except requests.RequestException as e:
        logging.error(f"Error scraping {url}: {str(e)}")
        return []

def should_visit_link(link_url, base_url, visited_urls):
    """Helper to decide if a link should be visited."""
    parsed_link = urlparse(link_url)
    parsed_base = urlparse(base_url)
    return (
        parsed_link.netloc == parsed_base.netloc and
        not link_url.endswith(('.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.mp4')) and
        '/contact-us' not in link_url and
        link_url not in visited_urls
    )


# Main processing function
def process_source(file_path, file_type, source_id, bucket_name, file_name):
    # Step 1: Extract text from file
    text = extract_text_from_file(file_path, file_type)

    # Step 2: Chunk the text
    chunks = chunk_text(text)

    # Step 3: Create embeddings and store in Pinecone
    store_in_pinecone(source_id, chunks)

    # Step 4: Store the original document in Supabase
    store_in_supabase(file_path, bucket_name, file_name)
