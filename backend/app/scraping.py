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

def chunk_text(text, max_tokens=8192, overlap=200):
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = []
    current_token_count = 0

    for sentence in sentences:
        sentence_tokens = tokenizer.encode(sentence)
        sentence_token_count = len(sentence_tokens)

        # If adding this sentence would exceed max_tokens, finalize the current chunk
        if current_token_count + sentence_token_count > max_tokens:
            chunks.append(" ".join(current_chunk))
            
            # Handle overlap
            overlap_tokens = tokenizer.encode(" ".join(current_chunk[-overlap:]))
            current_chunk = tokenizer.decode(overlap_tokens).split()
            current_token_count = len(overlap_tokens)

        # Append the current sentence to the chunk
        current_chunk.append(sentence)
        current_token_count += sentence_token_count

    # Add remaining chunk if any
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    logging.debug(f"Total chunks created: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        logging.debug(f"Chunk {i} size: {len(tokenizer.encode(chunk))} tokens")
    
    return chunks

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
    return "\n".join([para.text for para in doc.paragraphs])

# Function to extract text from CSV
def extract_text_from_csv(file_path):
    df = pd.read_csv(file_path)
    return df.to_string()

# Main function to scrape a website
def scrape_website(url, max_depth=2, depth=0):
    global visited_count
    if depth > max_depth or visited_count >= MAX_PAGES or url in visited_urls:
        return []

    visited_urls.add(url)
    visited_count += 1
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        # Fallback to UTF-8 encoding
        response.encoding = response.encoding or 'utf-8'

        soup = BeautifulSoup(response.text, 'html.parser')
        page_text = soup.get_text(separator=' ', strip=True)

        # Chunk and store scraped data
        scraped_data = chunk_text(page_text)

        # Base URL for handling relative links
        base_url = "{0.scheme}://{0.netloc}".format(urlparse(url))
        for link in soup.find_all('a', href=True):
            link_url = urljoin(base_url, link['href'])
            if should_visit_link(link_url, base_url):
                scraped_data.extend(scrape_website(link_url, max_depth, depth + 1))

        return scraped_data

    except requests.RequestException as e:
        logging.error(f"Error scraping {url}: {str(e)}")
        return []

# Helper to decide which links to visit
def should_visit_link(link_url, base_url):
    parsed_link = urlparse(link_url)
    parsed_base = urlparse(base_url)

    # Visit only if link is within the same domain and doesn't match exclusion patterns
    return (
        parsed_link.netloc == parsed_base.netloc and
        not link_url.endswith(('.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.mp4')) and
        '/contact-us' not in link_url and  # Example filter for repetitive paths
        link_url not in visited_urls
    )

# Universal text extraction function
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
