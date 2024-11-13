import os
import logging
from googleapiclient.discovery import build
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from dotenv import load_dotenv
import re
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Get API credentials from environment
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')

def clean_text(text):
    """Clean and normalize text content."""
    # Remove multiple whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    return text.strip()

def is_valid_url(url):
    """Check if URL is valid and not a blocked domain."""
    try:
        parsed = urlparse(url)
        # List of blocked domains
        blocked_domains = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com']
        return parsed.netloc and not any(domain in parsed.netloc for domain in blocked_domains)
    except:
        return False

def extract_main_content(soup):
    """Extract main content from HTML while removing boilerplate."""
    # Remove unwanted tags
    for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form', 'iframe']):
        tag.decompose()
    
    # Find main content (adjust selectors based on common patterns)
    main_content = soup.find('main') or soup.find('article') or soup.find('div', {'class': re.compile(r'content|main|article', re.I)})
    
    if main_content:
        return main_content.get_text(separator=' ', strip=True)
    return soup.get_text(separator=' ', strip=True)

def search_and_scrape(query, num_results=5, max_retries=3):
    """
    Search Google and scrape content from top results with retry logic and rate limiting.
    """
    if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
        logging.error("Google API credentials not found")
        return []

    try:
        # Initialize Google Custom Search API
        service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY)
        
        # Perform the search
        result = service.cse().list(
            q=query,
            cx=GOOGLE_CSE_ID,
            num=num_results
        ).execute()

        web_contents = []
        
        # Process each search result with retry logic
        for item in result.get('items', []):
            url = item.get('link')
            if not url or not is_valid_url(url):
                continue

            for attempt in range(max_retries):
                try:
                    # Add delay between requests
                    time.sleep(1)
                    
                    # Get the webpage content
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                    response = requests.get(url, headers=headers, timeout=10)
                    response.raise_for_status()
                    
                    # Parse HTML
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract main content
                    text = extract_main_content(soup)
                    
                    # Clean and truncate content
                    cleaned_text = clean_text(text)
                    truncated_text = cleaned_text[:2000] + "..." if len(cleaned_text) > 2000 else cleaned_text
                    
                    web_contents.append({
                        'title': item.get('title', ''),
                        'link': url,
                        'content': truncated_text
                    })
                    
                    break  # Success, exit retry loop
                    
                except requests.RequestException as e:
                    logging.warning(f"Attempt {attempt + 1} failed for {url}: {str(e)}")
                    if attempt == max_retries - 1:  # Last attempt
                        logging.error(f"Failed to scrape {url} after {max_retries} attempts")
                    else:
                        time.sleep(2 ** attempt)  # Exponential backoff
                except Exception as e:
                    logging.error(f"Unexpected error scraping {url}: {str(e)}")
                    break  # Exit retry loop for non-request errors

        return web_contents

    except Exception as e:
        logging.error(f"Error in web search: {str(e)}")
        return []

def get_page_metadata(soup, url):
    """Extract metadata from webpage."""
    try:
        metadata = {
            'title': soup.title.string if soup.title else '',
            'description': '',
            'site_name': urlparse(url).netloc,
            'published_date': ''
        }

        # Try to get meta description
        meta_desc = soup.find('meta', {'name': 'description'}) or soup.find('meta', {'property': 'og:description'})
        if meta_desc:
            metadata['description'] = meta_desc.get('content', '')

        # Try to get published date
        date_meta = soup.find('meta', {'property': 'article:published_time'}) or \
                   soup.find('time') or \
                   soup.find('meta', {'name': 'date'})
        if date_meta:
            metadata['published_date'] = date_meta.get('content') or date_meta.get('datetime', '')

        return metadata
    except Exception as e:
        logging.error(f"Error extracting metadata: {str(e)}")
        return None