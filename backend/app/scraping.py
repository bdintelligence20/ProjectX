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
tokenizer = tiktoken.get_encoding("gpt-3.5-turbo")

def chunk_text(text, max_tokens=8192, overlap=100):
    """
    Chunk text into manageable pieces that fit within the token limit.
    Uses sliding window for overlap to preserve context.
    
    Parameters:
    - text: The full text to be chunked.
    - max_tokens: Maximum tokens per chunk.
    - overlap: Number of tokens that overlap between chunks.
    
    Returns:
    - List of text chunks.
    """
    sentences = sent_tokenize(text)  # Use NLTK to split text into sentences
    chunks = []
    current_chunk = []

    for sentence in sentences:
        tokens = tokenizer.encode(" ".join(current_chunk + [sentence]))
        if len(tokens) <= max_tokens:
            current_chunk.append(sentence)
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
    
    # Add the last chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    # Implement sliding window
    sliding_chunks = []
    for i in range(0, len(chunks)):
        if i == 0:
            sliding_chunks.append(chunks[i])
        else:
            # Combine overlap tokens from the previous chunk
            prev_chunk_tokens = tokenizer.encode(chunks[i - 1])
            current_chunk_tokens = tokenizer.encode(chunks[i])
            combined_chunk = prev_chunk_tokens[-overlap:] + current_chunk_tokens
            sliding_chunks.append(tokenizer.decode(combined_chunk))

    return sliding_chunks

def scrape_website(url, max_depth=3, depth=0):
    """
    Scrape the given website recursively, following internal links.
    
    Parameters:
    - url: The website URL to scrape.
    - max_depth: The maximum depth to follow links (to prevent scraping too deep).
    - depth: Current depth of the recursion.
    
    Returns:
    - List of scraped data from all visited pages.
    """
    if depth > max_depth or url in visited_urls:
        return []
    
    visited_urls.add(url)
    
    try:
        # Make a request to the URL
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise an exception for 4xx/5xx errors

        # Parse the content using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Collect the main content text of the current page
        page_text = soup.get_text(separator=' ', strip=True)
        
        # Chunk the page content to stay within the token limits, using sliding window
        scraped_data = chunk_text(page_text)
        
        # Find all internal links on the page
        base_url = "{0.scheme}://{0.netloc}".format(urlparse(url))
        for link in soup.find_all('a', href=True):
            link_url = urljoin(base_url, link['href'])  # Handle relative URLs
            # Ensure the link is internal (same domain)
            if base_url in link_url and link_url not in visited_urls:
                scraped_data.extend(scrape_website(link_url, max_depth, depth + 1))

        return scraped_data

    except requests.RequestException as e:
        print(f"Error scraping {url}: {str(e)}")
        return []

# Example usage
if __name__ == "__main__":
    url_to_scrape = "https://example.com"
    full_scraped_data = scrape_website(url_to_scrape)
    print(f"Scraped {len(full_scraped_data)} pages from {url_to_scrape}")
