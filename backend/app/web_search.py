import os
import logging
from googleapiclient.discovery import build
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from dotenv import load_dotenv
import time

# Import existing functions from scraping.py
from .scraping import (
    chunk_text,
    MAX_TOKENS,
    should_visit_link,
    scrape_website
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Get API credentials from environment
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')

def search_and_scrape(query, num_results=3):
    """Search Google and scrape content using existing chunking strategy."""
    if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
        logging.error("Google API credentials not found")
        return []

    try:
        # Initialize Google Custom Search API
        service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY,
                       cache_discovery=False)
        
        # Perform the search
        result = service.cse().list(
            q=query,
            cx=GOOGLE_CSE_ID,
            num=num_results
        ).execute()

        web_contents = []
        session = requests.Session()

        for item in result.get('items', []):
            url = item.get('link')
            if not url or not should_visit_link(url, url, set()):
                continue

            try:
                # Use existing scrape_website function
                scraped_chunks = scrape_website(
                    url, 
                    max_depth=1,  # Limit to single page
                    max_chunks=5   # Limit chunks per page
                )

                if scraped_chunks:
                    # Combine chunks for better context
                    combined_content = ' '.join(scraped_chunks)
                    
                    web_contents.append({
                        'title': item.get('title', ''),
                        'link': url,
                        'content': combined_content,
                        'chunks': scraped_chunks  # Store individual chunks for potential use
                    })

                time.sleep(1)  # Rate limiting

            except Exception as e:
                logging.error(f"Error processing {url}: {str(e)}")
                continue

        return web_contents

    except Exception as e:
        logging.error(f"Error in web search: {str(e)}")
        return []