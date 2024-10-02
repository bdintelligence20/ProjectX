import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# A set to keep track of visited URLs to avoid duplication
visited_urls = set()

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
        response = requests.get(url, timeout=10, verify=False)
        response.raise_for_status()  # Raise an exception for 4xx/5xx errors

        # Parse the content using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Collect the main content text of the current page
        scraped_data = [soup.get_text(separator=' ', strip=True)]
        
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
