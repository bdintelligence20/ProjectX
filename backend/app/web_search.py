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

# Constants
MAX_CONTENT_LENGTH = 1000  # Reduced from 2000 to save memory
MAX_RETRIES = 2  # Reduced from 3 to speed up processing
TIMEOUT = 5  # Reduced timeout
MAX_FILE_SIZE = 1024 * 1024  # 1MB limit

def is_valid_url(url):
    """Check if URL is valid and not a blocked domain."""
    try:
        parsed = urlparse(url)
        blocked_domains = [
            'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
            'linkedin.com', 'pinterest.com', 'reddit.com'
        ]
        return parsed.netloc and not any(domain in parsed.netloc for domain in blocked_domains)
    except:
        return False

def extract_main_content(html):
    """Extract main content efficiently."""
    try:
        # Use lxml parser for better performance
        soup = BeautifulSoup(html, 'lxml')
        
        # Remove unwanted elements
        for element in soup.find_all(['script', 'style', 'nav', 'header', 'footer', 'iframe']):
            element.decompose()

        # Get text content
        text = ' '.join(soup.stripped_strings)
        
        # Clean text
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        return text[:MAX_CONTENT_LENGTH]
    except Exception as e:
        logging.error(f"Error extracting content: {str(e)}")
        return ""

def search_and_scrape(query, num_results=3):  # Reduced from 5 to 3 results
    """Search Google and scrape content with improved efficiency."""
    if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
        logging.error("Google API credentials not found")
        return []

    try:
        # Initialize Google Custom Search API
        service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY,
                       cache_discovery=False)  # Disable file cache
        
        # Perform the search
        result = service.cse().list(
            q=query,
            cx=GOOGLE_CSE_ID,
            num=num_results
        ).execute()

        web_contents = []
        session = requests.Session()  # Use session for better performance
        
        for item in result.get('items', []):
            url = item.get('link')
            if not url or not is_valid_url(url):
                continue

            try:
                # Get the webpage content with timeout and size limit
                response = session.get(
                    url,
                    timeout=TIMEOUT,
                    headers={'User-Agent': 'Mozilla/5.0'},
                    stream=True
                )
                response.raise_for_status()

                # Check content length
                content_length = int(response.headers.get('content-length', 0))
                if content_length > MAX_FILE_SIZE:
                    logging.warning(f"Skipping {url}: Content too large")
                    continue

                # Extract content
                content = extract_main_content(response.text)
                if content:
                    web_contents.append({
                        'title': item.get('title', ''),
                        'link': url,
                        'content': content
                    })

                # Add delay between requests
                time.sleep(1)

            except requests.RequestException as e:
                logging.warning(f"Error scraping {url}: {str(e)}")
                continue
            except Exception as e:
                logging.error(f"Unexpected error processing {url}: {str(e)}")
                continue

        return web_contents

    except Exception as e:
        logging.error(f"Error in web search: {str(e)}")
        return []