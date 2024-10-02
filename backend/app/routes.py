from flask import Blueprint, request, jsonify, make_response
from app.scraping import scrape_website
from flask_cors import cross_origin

bp = Blueprint('main', __name__)

# Handle POST request to scrape and return data
@bp.route('/scrape', methods=['POST'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')  # Allow your frontend origin
def scrape_and_return():
    data = request.json
    company_url = data.get('companyUrl')

    if company_url:
        try:
            scraped_data = scrape_website(company_url)

            if scraped_data:
                response = make_response(jsonify({
                    "message": "Website scraped successfully", 
                    "data": scraped_data[:500]
                }), 200)
                
                # No need to manually add CORS headers here
                return response
            else:
                return jsonify({"error": "No data scraped"}), 500

        except Exception as e:
            return jsonify({"error": f"Failed to scrape website: {str(e)}"}), 500

    return jsonify({"error": "Company URL is required"}), 400

# Handle OPTIONS preflight request (CORS preflight request handler)
@bp.route('/scrape', methods=['OPTIONS'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')  # Ensure preflight uses same CORS origin
def options():
    response = make_response()
    return response
