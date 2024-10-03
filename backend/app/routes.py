from flask import Blueprint, request, jsonify, make_response
from app.scraping import scrape_website, extract_text_from_file
from app.pinecone_client import store_in_pinecone, query_pinecone
from app.llm import query_llm
from flask_cors import cross_origin
import os

bp = Blueprint('main', __name__)

# Handle POST request to scrape and store data in Pinecone
@bp.route('/scrape', methods=['POST'])
@cross_origin(origins=['https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev'])
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


# Handle POST request to add different source types (URLs, PDFs, DOCX, CSV, Text)
@bp.route('/add-source', methods=['POST'])
@cross_origin(origins=['https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev'])
def add_source():
    data = request.form
    file = request.files.get('file')
    source_type = data.get('sourceType')  # 'text', 'url', 'pdf', 'docx', etc.
    content = data.get('content')  # For text or URLs

    if file:  # Handle file uploads
        filename = file.filename
        filepath = os.path.join('uploads', filename)  # Store the uploaded file
        file.save(filepath)

        # Process file based on its type (PDF, DOCX, CSV)
        file_type = filename.split('.')[-1].lower()
        if file_type in ['pdf', 'docx', 'csv']:
            extracted_text = extract_text_from_file(filepath, file_type)  # Custom function to extract text
            store_in_pinecone(filename, [extracted_text])

            return jsonify({"message": f"File {filename} uploaded, processed, and stored successfully"}), 200
        else:
            return jsonify({"error": "Unsupported file type"}), 400

    elif source_type == 'url':
        scraped_data = scrape_website(content)  # Treat as website URL
        if scraped_data:
            store_in_pinecone(content, scraped_data)
            return jsonify({"message": "Website scraped and stored successfully"}), 200
        else:
            return jsonify({"error": "Failed to scrape the URL"}), 500

    elif source_type == 'text':
        store_in_pinecone('custom_text_source', [content])
        return jsonify({"message": "Text content stored successfully"}), 200

    return jsonify({"error": "Invalid source type or content"}), 400


# Handle POST request to query data using Pinecone and LLM
@bp.route('/query', methods=['POST'])
@cross_origin(origins=['https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev'])
def query():
    data = request.json
    user_question = data.get('userQuestion')
    sources = data.get('sources')  # Receive all sources added by the user

    if user_question and sources:
        try:
            matched_texts = []
            for source in sources:
                namespace = source['title']  # Assuming 'title' is unique for the source
                matched_texts.extend(query_pinecone(user_question, namespace))

            if matched_texts:
                # Pass the matched texts and the user's question to the LLM
                response = query_llm(matched_texts, user_question)
                return jsonify({"answer": response}), 200
            else:
                return jsonify({"answer": "No relevant information was found."}), 404
        except Exception as e:
            return jsonify({"error": f"Failed to query data: {str(e)}"}), 500

    return jsonify({"error": "User question and sources are required"}), 400
