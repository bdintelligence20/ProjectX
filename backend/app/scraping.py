import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import validators

def scrape_website(url, max_pages=20):
    visited = set()  # Track visited URLs to avoid duplicates
    all_text = ""  # Store all text from the website
    
    def scrape_page(url):
        nonlocal all_text
        if len(visited) >= max_pages:
            print(f"Max pages limit reached: {max_pages}")
            return
        
        try:
            # Fetch the page content
            print(f"Scraping URL: {url}")  # Log the URL being scraped
            response = requests.get(url, timeout=10, verify=False)
            response.raise_for_status()  # Raise an error for non-2xx status codes
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Get the text from the current page
            page_text = soup.get_text(separator=" ", strip=True)
            all_text += page_text
            visited.add(url)  # Mark this page as visited
            
            # Find all internal links
            for link in soup.find_all('a', href=True):
                href = link['href']
                full_url = urljoin(url, href)  # Create a full URL from relative links
                
                # Only follow internal links (same domain)
                if validators.url(full_url) and url in full_url and full_url not in visited:
                    scrape_page(full_url)  # Recursively scrape the new page

        except Exception as e:
            print(f"Error scraping {url}: {str(e)}")
    
    # Start scraping from the main URL
    scrape_page(url)
    
    return all_text
