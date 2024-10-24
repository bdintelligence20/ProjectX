from flask import Blueprint, request, jsonify
from app.scraping import scrape_website, extract_text_from_file
from app.pinecone_client import store_in_pinecone, query_pinecone
from app.llm import query_llm
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import logging
import traceback
from sqlalchemy import select
import os
from supabase import create_client, Client

# Configure logging to show all debug messages
logging.basicConfig(level=logging.DEBUG)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

bp = Blueprint('main', __name__)

# Handle user registration with Supabase
@bp.route('/auth/register', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def register():
    if request.method == 'OPTIONS':
        logging.debug("Preflight check passed for registration")
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            logging.error("Email and password are required for registration")
            return jsonify({"error": "Email and password are required"}), 400

        # Register user via Supabase
        response = supabase.auth.sign_up({
            'email': email,
            'password': password,
        })

        if response.get('error'):
            logging.error(f"Error registering user: {response['error']}")
            return jsonify({"error": response['error']['message']}), 400

        logging.info(f"User registered successfully: email={email}")
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        logging.error(f"Internal server error: {traceback.format_exc()}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# Handle user login with Supabase
@bp.route('/auth/login', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def login():
    if request.method == 'OPTIONS':
        logging.debug("Preflight check passed for login")
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            logging.error("Email and password are required for login")
            return jsonify({"error": "Email and password are required"}), 400

        # Log in user via Supabase
        response = supabase.auth.sign_in({
            'email': email,
            'password': password,
        })

        if response.get('error'):
            logging.error(f"Error logging in user: {response['error']}")
            return jsonify({"error": response['error']['message']}), 401

        logging.info(f"User logged in successfully: email={email}")
        return jsonify(response['session']), 200

    except Exception as e:
        logging.error(f"Internal server error: {traceback.format_exc()}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# Handle POST request to scrape and store data in Pinecone
@bp.route('/scrape', methods=['POST'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def scrape_and_store():
    try:
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

    except Exception as e:
        logging.error(f"Error in scrape_and_store: {str(e)}")
        return jsonify({"error": str(e)}), 500


# Handle POST request to add different source types (URLs, PDFs, DOCX, CSV, Text)
@bp.route('/add-source', methods=['POST'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def add_source():
    try:
        data = request.form if request.files else request.get_json()
        source_type = data.get('sourceType')
        category = data.get('category')  # Category selected from the frontend
        logging.debug(f"Received add source request with category: {category}")

        # Define buckets based on category for URLs
        url_buckets = {
            'Business Research': 'business-research',
            'Competitor Analysis': 'competitor-analysis',
            'Client Research': 'client-research',
            'General Research': 'general-research'
        }

        # Define buckets based on category for files
        file_buckets = {
            'LRMG Knowledge': 'lrmg-knowledge',
            'Trend Reports': 'trend-reports',
            'Business Reports': 'business-reports',
            'Shareholder Reports': 'shareholder-reports',
            'Qualitative Data': 'qualitative-data',
            'Quantitative Data': 'quantitative-data'
        }

        # Handle URL scraping
        if source_type == 'url':
            bucket_name = url_buckets.get(category)
            logging.debug(f"Scraping and storing URL in bucket: {bucket_name}")
            scraped_data = scrape_website(data.get('content'))
            if scraped_data:
                store_in_pinecone(data.get('content'), scraped_data)
                return jsonify({"message": f"URL scraped and stored in {bucket_name}"}), 200

        # Handle file uploads
        elif source_type == 'file':
            file = request.files.get('file')
            if file:
                filename = secure_filename(file.filename)  # Secure the filename
                bucket_name = file_buckets.get(category)

                # Convert file to a stream
                file_stream = file.read()  # Ensure it is read as a byte stream

                # Upload file to the correct bucket in Supabase
                upload_response = supabase.storage.from_(bucket_name).upload(f"{category}/{filename}", file_stream)
                if upload_response.get("error"):
                    logging.error(f"Error uploading file: {upload_response['error']}")
                    return jsonify({"error": "File upload failed"}), 500

                # Get the public URL for the uploaded file
                file_url = supabase.storage.from_(bucket_name).get_public_url(f"{category}/{filename}")
                
                # Extract text from the file (if it's a PDF, DOCX, CSV, etc.)
                extracted_text = extract_text_from_file(file_url, filename.split('.')[-1])
                store_in_pinecone(filename, [extracted_text])

                return jsonify({"message": f"File {filename} uploaded to {bucket_name} and processed"}), 200

        logging.error("Invalid source type or content")
        return jsonify({"error": "Invalid source type or content"}), 400

    except Exception as e:
        logging.error(f"Error in add_source: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Handle POST request to query the unified namespace in Pinecone
@bp.route('/query', methods=['POST'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def query():
    try:
        data = request.json
        user_question = data.get('userQuestion')

        if not user_question:
            logging.error("User question is required")
            return jsonify({"error": "User question is required"}), 400

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
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def get_sources():
    try:
        # Retrieve all stored sources from Supabase table
        response = supabase.from_('sources').select('*').execute()

        if response.get('error'):
            logging.error(f"Error retrieving sources from Supabase: {response['error']}")
            return jsonify({"error": "Failed to retrieve sources"}), 500

        sources = response.get('data', [])
        logging.debug(f"Sources retrieved from Supabase: {sources}")

        if sources:
            return jsonify(sources), 200
        else:
            logging.info("No sources found in the database.")
            return jsonify({"message": "No sources available"}), 404

    except Exception as e:
        logging.error(f"Error retrieving sources: {str(e)}")
        return jsonify({"error": str(e)}), 500

