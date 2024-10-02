from flask import Blueprint, request, jsonify, make_response
from app.scraping import scrape_website
from app.pinecone_client import store_in_pinecone
from flask_cors import cross_origin

bp = Blueprint('main', __name__)

# Handle POST request to scrape and return data
@bp.route('/scrape', methods=['POST'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def scrape_and_store():
    data = request.json
    company_url = data.get('companyUrl')

    if company_url:
        try:
            # Scrape the website recursively
            scraped_data = scrape_website(company_url)
            
            if scraped_data:
                # Store scraped data in Pinecone
                store_in_pinecone(scraped_data, company_url)
                return jsonify({"message": "Data scraped and stored successfully"}), 200
            else:
                return jsonify({"error": "No data scraped"}), 500

        except Exception as e:
            return jsonify({"error": f"Failed to scrape website: {str(e)}"}), 500

    return jsonify({"error": "Company URL is required"}), 400

# Handle OPTIONS preflight request
@bp.route('/scrape', methods=['OPTIONS'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def options():
    response = make_response()
    return response
