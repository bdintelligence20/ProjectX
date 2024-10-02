from flask import Blueprint, request, jsonify, make_response
from app.scraping import scrape_website
from app.pinecone_client import store_in_pinecone, query_pinecone
from app.llm import query_llm
from flask_cors import cross_origin

bp = Blueprint('main', __name__)

# Handle POST request to scrape and store data in Pinecone
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
                store_in_pinecone(company_url, scraped_data)
                return jsonify({"message": "Data scraped and stored successfully"}), 200
            else:
                return jsonify({"error": "No data scraped"}), 500

        except Exception as e:
            return jsonify({"error": f"Failed to scrape website: {str(e)}"}), 500

    return jsonify({"error": "Company URL is required"}), 400

# Handle OPTIONS preflight request for CORS
@bp.route('/scrape', methods=['OPTIONS'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def options():
    response = make_response()
    return response

# Handle POST request to query data using Pinecone and LLM
@bp.route('/query', methods=['POST'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def query():
    data = request.json
    user_question = data.get('userQuestion')
    company_url = data.get('companyUrl')

    if user_question and company_url:
        try:
            # Extract the namespace from the company URL
            namespace = company_url.split("//")[-1].split("/")[0]

            # Query Pinecone for similar documents
            matched_texts = query_pinecone(user_question, namespace)

            if matched_texts:
                # Pass the matched texts and the user's question to the LLM
                response = query_llm(matched_texts, user_question)
                return jsonify({"answer": response}), 200
            else:
                return jsonify({"answer": "No relevant information was found."}), 404
        except Exception as e:
            return jsonify({"error": f"Failed to query data: {str(e)}"}), 500

    return jsonify({"error": "User question and Company URL are required"}), 400
