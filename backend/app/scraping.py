import PyPDF2
import docx
import pandas as pd

# Existing imports
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import nltk
from nltk.tokenize import sent_tokenize
import tiktoken  # For tokenizing

# Download the necessary NLTK resources (if not already installed)
nltk.download('punkt')

# A set to keep track of visited URLs to avoid duplication
visited_urls = set()

# Initialize tokenizer for handling OpenAI's token limits
tokenizer = tiktoken.get_encoding("cl100k_base")

# Function to chunk text for embedding
def chunk_text(text, max_tokens=8192, overlap=100):
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = []

    for sentence in sentences:
        tokens = tokenizer.encode(" ".join(current_chunk + [sentence]))
        if len(tokens) <= max_tokens:
            current_chunk.append(sentence)
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    sliding_chunks = []
    for i in range(len(chunks)):
        if i == 0:
            sliding_chunks.append(chunks[i])
        else:
            prev_chunk_tokens = tokenizer.encode(chunks[i - 1])
            current_chunk_tokens = tokenizer.encode(chunks[i])
            combined_chunk = prev_chunk_tokens[-overlap:] + current_chunk_tokens
            sliding_chunks.append(tokenizer.decode(combined_chunk))

    return sliding_chunks

# Function to extract text from a PDF
def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

# Function to extract text from DOCX
def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)

# Function to extract text from CSV
def extract_text_from_csv(file_path):
    df = pd.read_csv(file_path)
    return df.to_string()

# Function to scrape website as before
def scrape_website(url, max_depth=3, depth=0):
    if depth > max_depth or url in visited_urls:
        return []
    
    visited_urls.add(url)

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        page_text = soup.get_text(separator=' ', strip=True)

        scraped_data = chunk_text(page_text)

        base_url = "{0.scheme}://{0.netloc}".format(urlparse(url))
        for link in soup.find_all('a', href=True):
            link_url = urljoin(base_url, link['href'])
            if base_url in link_url and link_url not in visited_urls:
                scraped_data.extend(scrape_website(link_url, max_depth, depth + 1))

        return scraped_data

    except requests.RequestException as e:
        print(f"Error scraping {url}: {str(e)}")
        return []

# Function to extract text from various file types
def extract_text_from_file(file_path, file_type):
    if file_type == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        return extract_text_from_docx(file_path)
    elif file_type == 'csv':
        return extract_text_from_csv(file_path)
    else:
        raise ValueError("Unsupported file type")

# Example usage
if __name__ == "__main__":
    url_to_scrape = "https://example.com"
    full_scraped_data = scrape_website(url_to_scrape)
    print(f"Scraped {len(full_scraped_data)} pages from {url_to_scrape}")
