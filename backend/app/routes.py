# routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.scraping import scrape_website, extract_text_from_file
from app.pinecone_client import store_in_pinecone, query_pinecone
from app.llm import query_llm
from flask_cors import cross_origin
import os
import logging
from db_utils import insert_source, get_all_sources
from app import bcrypt, db
from app.models import User

bp = Blueprint('main', __name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Handle user registration
@bp.route('/auth/register', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def register():
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 409

        # Create a new user
        new_user = User(username=username)
        new_user.set_password(password)  # Use the set_password method to hash the password
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@bp.route('/auth/login', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def login():
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):  # Use check_password method here
            # Create a JWT access token for the user
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token), 200

        return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# Protect other routes using @jwt_required

# Handle POST request to scrape and store data in Pinecone
@bp.route('/scrape', methods=['POST'])
@jwt_required()
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def scrape_and_store():
    current_user_id = get_jwt_identity()  # Get the current user from JWT
    logging.debug(f"User {current_user_id} is scraping a website.")
    data = request.json
    company_url = data.get('companyUrl')

    if company_url:
        try:
            # Scrape the website recursively
            logging.debug(f"Scraping website: {company_url}")
            scraped_data = scrape_website(company_url)

            if scraped_data:
                # Store scraped data in Pinecone
                store_in_pinecone(company_url, scraped_data)
                logging.debug(f"Data scraped and stored successfully for URL: {company_url}")
                return jsonify({"message": "Data scraped and stored successfully"}), 200
            else:
                logging.error("No data scraped.")
                return jsonify({"error": "No data scraped"}), 500

        except Exception as e:
            logging.error(f"Failed to scrape website: {str(e)}")
            return jsonify({"error": f"Failed to scrape website: {str(e)}"}), 500

    logging.error("Company URL is required")
    return jsonify({"error": "Company URL is required"}), 400

# Handle POST request to add different source types (URLs, PDFs, DOCX, CSV, Text)
@bp.route('/add-source', methods=['POST'])
@jwt_required()
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def add_source():
    current_user_id = get_jwt_identity()  # Get the current user from JWT
    logging.debug(f"User {current_user_id} is adding a source.")
    try:
        # Handle different content types
        if request.is_json:
            data = request.get_json()
            source_type = data.get('sourceType')
            content = data.get('content')
            title = data.get('title', 'Unnamed Source')
        else:
            data = request.form
            source_type = data.get('sourceType')
            content = data.get('content')
            title = data.get('title', 'Unnamed Source')

        logging.debug(f"Received add source request with data: {data}")

        # Handle URL scraping
        if source_type == 'url' and content:
            logging.debug(f"Scraping URL: {content}")
            scraped_data = scrape_website(content)  # Treat as website URL
            if scraped_data:
                store_in_pinecone(content, scraped_data)
                insert_source(content, 'url', title, scraped_data)
                return jsonify({"message": "Website scraped, stored in Pinecone, and metadata saved"}), 200
            else:
                logging.error("Failed to scrape the URL")
                return jsonify({"error": "Failed to scrape the URL"}), 500

        # Handle other types (file upload, text, etc.)
        file = request.files.get('file')
        if file:
            filename = file.filename
            # Ensure the 'uploads' directory exists
            upload_dir = 'uploads'
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)

            filepath = os.path.join(upload_dir, filename)  # Store the uploaded file
            file.save(filepath)

            # Process file based on its type (PDF, DOCX, CSV)
            file_type = filename.split('.')[-1].lower()
            if file_type in ['pdf', 'docx', 'csv']:
                extracted_text = extract_text_from_file(filepath, file_type)  # Custom function to extract text
                store_in_pinecone(filename, [extracted_text])
                insert_source(filename, file_type, filename, extracted_text)
                return jsonify({"message": f"File {filename} uploaded, processed, stored in Pinecone, and metadata saved"}), 200
            else:
                logging.error("Unsupported file type")
                return jsonify({"error": "Unsupported file type"}), 400

        elif source_type == 'text' and content:
            logging.debug(f"Storing text content: {content}")
            store_in_pinecone('custom_text_source', [content])
            insert_source('custom_text_source', 'text', title, content)
            return jsonify({"message": "Text content stored successfully"}), 200

        logging.error("Invalid source type or content")
        return jsonify({"error": "Invalid source type or content"}), 400

    except Exception as e:
        logging.error(f"Error in add_source: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Handle POST request to query the unified namespace in Pinecone
@bp.route('/query', methods=['POST'])
@jwt_required()
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def query():
    current_user_id = get_jwt_identity()  # Get the current user from JWT
    logging.debug(f"User {current_user_id} is querying the knowledge base.")
    data = request.json
    user_question = data.get('userQuestion')

    if not user_question:
        logging.error("User question is required")
        return jsonify({"error": "User question is required"}), 400

    try:
        # Query the whole vector database (global knowledge base)
        matched_texts = query_pinecone(user_question, namespace="global_knowledge_base")

        if matched_texts:
            # Pass the matched texts and the user's question to the LLM
            response = query_llm(matched_texts, user_question)

            # Include the sources in the response for better traceability
            return jsonify({
                "answer": response,
                "sources": matched_texts
            }), 200
        else:
            logging.info("No relevant information was found.")
            return jsonify({"answer": "No relevant information was found."}), 404

    except Exception as e:
        logging.error(f"Failed to query data: {str(e)}")
        return jsonify({"error": f"Failed to query data: {str(e)}"}), 500

# Handle GET request to retrieve all stored sources
@bp.route('/sources', methods=['GET'])
@jwt_required()
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def get_sources():
    current_user_id = get_jwt_identity()  # Get the current user from JWT
    logging.debug(f"User {current_user_id} is retrieving all sources.")
    try:
        sources = get_all_sources()  # Retrieve all stored sources from the database

        if sources:
            logging.debug(f"Sources retrieved from database: {sources}")
            sources_list = [dict(source) for source in sources]  # Convert SQLite Row objects to dictionaries
            return jsonify(sources_list), 200
        else:
            logging.info("No sources found in database.")
            return jsonify({"message": "No sources available"}), 404

    except Exception as e:
        logging.error(f"Error retrieving sources: {str(e)}")
        return jsonify({"error": str(e)}), 500
