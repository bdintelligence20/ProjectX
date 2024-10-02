from flask import Blueprint, request, jsonify
from app.scraping import scrape_website
from app.pinecone_client import store_in_pinecone

bp = Blueprint('main', __name__)

@bp.route('/scrape', methods=['POST'])
def scrape_and_store():
    data = request.json
    company_url = data.get('companyUrl')
    
    if company_url:
        try:
            # Scrape the website (up to max_pages)
            scraped_data = scrape_website(company_url)
            
            if scraped_data:
                # Store scraped data in Pinecone
                embedding = store_in_pinecone(company_url, scraped_data)
                return jsonify({"message": "Website scraped and data stored successfully", "embedding": embedding}), 200
            else:
                return jsonify({"error": "Failed to scrape website"}), 500
        
        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return jsonify({"error": f"Failed to scrape website: {str(e)}"}), 500
    else:
        return jsonify({"error": "Company URL is required"}), 400
