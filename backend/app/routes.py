from flask import Blueprint, request, jsonify
from app.scraping import scrape_website, extract_text_from_file, chunk_text, tokenizer, get_embedding, process_source
from app.pinecone_client import store_in_pinecone, query_pinecone
from app.llm import query_llm
from app.llm import check_quality_with_llm
from app.file_handling import save_text_to_file
from flask_cors import cross_origin
from concurrent.futures import ThreadPoolExecutor
from werkzeug.utils import secure_filename
import traceback
from sqlalchemy import select
import base64
import asyncio
import threading
import os
from supabase import create_client, Client
import urllib.parse
import nltk
import logging

# Configure logging to show all debug messages
logging.basicConfig(level=logging.DEBUG, force=True)

# Add to your existing imports
thread_local = threading.local()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_SECRET")
supabase: Client = create_client(supabase_url, supabase_key)

bp = Blueprint('main', __name__)


@bp.route('/auth/register', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def register():
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Register user via Supabase
        response = supabase.auth.sign_up({
            'email': email,
            'password': password,
        })

        if response.get('error'):
            return jsonify({"error": response['error']['message']}), 400

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        logging.error(f"Internal server error: {traceback.format_exc()}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@bp.route('/auth/login', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def login():
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Log in user via Supabase
        response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password,
        })

        if response.get('error'):
            return jsonify({"error": response['error']['message']}), 401

        return jsonify(response['session']), 200

    except Exception as e:
        logging.error(f"Internal server error: {traceback.format_exc()}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@bp.route('/auth/reset-password', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def reset_password_request():
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Send password reset email via Supabase
        response = supabase.auth.reset_password_email(email)

        if response.get('error'):
            return jsonify({"error": response['error']['message']}), 400

        return jsonify({"message": "Password reset email sent"}), 200

    except Exception as e:
        logging.error(f"Internal server error: {traceback.format_exc()}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@bp.route('/auth/update-password', methods=['POST', 'OPTIONS'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def update_password():
    if request.method == 'OPTIONS':
        return jsonify({"message": "Preflight check passed"}), 200

    try:
        data = request.json
        new_password = data.get('password')
        access_token = request.headers.get('Authorization', '').replace('Bearer ', '')

        if not new_password or not access_token:
            return jsonify({"error": "Password and authentication token are required"}), 400

        # Update password via Supabase
        response = supabase.auth.update_user(
            {'password': new_password},
            access_token
        )

        if response.get('error'):
            return jsonify({"error": response['error']['message']}), 400

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        logging.error(f"Internal server error: {traceback.format_exc()}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# Handle POST request to scrape and store data in Pinecone
@bp.route('/scrape', methods=['POST'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def scrape_and_store():
    try:
        data = request.json
        company_url = data.get('companyUrl')

        if not company_url:
            logging.error("Company URL is required")
            return jsonify({"error": "Company URL is required"}), 400

        logging.debug(f"Scraping website: {company_url}")
        scraped_data = scrape_website(company_url)

        if not scraped_data:
            logging.error("No data scraped.")
            return jsonify({"error": "No data scraped"}), 500

        store_in_pinecone(company_url, scraped_data)
        logging.debug(f"Data scraped and stored successfully for URL: {company_url}")
        return jsonify({"message": "Data scraped and stored successfully"}), 200

    except Exception as e:
        logging.error(f"Failed to scrape website: {str(e)}")
        return jsonify({"error": f"Failed to scrape website: {str(e)}"}), 500


# Define bucket mappings for Supabase
url_buckets = {
    'Business_Research': 'business-research',
    'Competitor_Analysis': 'competitor-analysis',
    'Client_Research': 'client-research',
    'General_Research': 'general-research'
}

file_buckets = {
    'LRMG_Knowledge': 'lrmg-knowledge',
    'Trend_Reports': 'trend-reports',
    'Business_Reports': 'business-reports',
    'Shareholder_Reports': 'shareholder-reports',
    'Qualitative_Data': 'qualitative-data',
    'Quantitative_Data': 'quantitative-data'
}

def get_session():
    if not hasattr(thread_local, "session"):
        thread_local.session = requests.Session()
    return thread_local.session

@bp.route('/add-source', methods=['POST'])
@cross_origin(origins=['https://projectx-frontend-3owg.onrender.com'])
def add_source():
    logging.debug("Starting add_source route.")
    
    try:
        if 'file' in request.files:
            data = request.form
            file = request.files['file']
        else:
            data = request.get_json()
            file = None

        source_type = data.get('sourceType')
        category = data.get('category').replace(" ", "_")
        bucket_name = None

        # Determine the bucket name based on category and source type
        if source_type == 'url':
            bucket_name = url_buckets.get(category)
        elif source_type == 'file':
            bucket_name = file_buckets.get(category)

        if not bucket_name:
            logging.error(f"Invalid category '{category}' or source type '{source_type}'. Bucket not found.")
            return jsonify({"error": "Invalid category or source type"}), 400

        # Process URLs or Files
        try:
            if source_type == 'url' and 'content' in data:
                url = data.get('content')
                logging.debug(f"Scraping URL: {url} for bucket: {bucket_name}")
                scraped_data = scrape_website(url)

                if scraped_data:
                    # Process in smaller batches
                    batch_size = 50  # Adjust based on your needs
                    for i in range(0, len(scraped_data), batch_size):
                        batch = scraped_data[i:i + batch_size]
                        # Store scraped data in Pinecone
                        store_in_pinecone(url, batch, namespace="global_knowledge_base")

                    # Save scraped data as text in Supabase
                    filename = f"{url.replace('https://', '').replace('/', '_')}.txt"
                    temp_file_path = os.path.join('/tmp', filename)
                    with open(temp_file_path, 'w') as f:
                        f.write('\n'.join(scraped_data))

                    store_in_supabase(temp_file_path, bucket_name, filename)
                    os.remove(temp_file_path)  # Clean up
                    return jsonify({"message": "URL processed successfully"}), 200

            elif source_type == 'file' and file:
                filename = secure_filename(file.filename)
                temp_file_path = os.path.join('/tmp', filename)
                file.save(temp_file_path)

                try:
                    file_extension = filename.split('.')[-1].lower()
                    # Extract text and process in chunks
                    text = extract_text_from_file(temp_file_path, file_extension)
                    chunks = chunk_text(text)

                    # Process chunks in batches
                    batch_size = 50  # Adjust based on your needs
                    for i in range(0, len(chunks), batch_size):
                        batch = chunks[i:i + batch_size]
                        store_in_pinecone(filename, batch, namespace="global_knowledge_base")

                    # Store original file in Supabase
                    store_in_supabase(temp_file_path, bucket_name, filename)
                    return jsonify({"message": "File processed successfully"}), 200

                finally:
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)  # Clean up

            return jsonify({"error": "Invalid source type or content"}), 400

        except Exception as e:
            logging.error(f"Error processing source: {str(e)}")
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        logging.error(f"Error in add_source: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
# Handle POST request to query Pinecone
@bp.route('/query', methods=['POST'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def query():
    try:
        data = request.json
        user_question = data.get('userQuestion')
        session_id = data.get('sessionId')  # Get session_id from request

        if not user_question or not session_id:
            logging.error("User question and session ID are required")
            return jsonify({"error": "User question and session ID are required"}), 400

        # Step 1: Query Pinecone for relevant context
        matched_texts = query_pinecone(user_question, namespace="global_knowledge_base")

        if matched_texts:
            # Step 2: Get response from LLM
            response = query_llm(matched_texts, user_question)

            try:
                # Step 3: Store the question and answer in Supabase
                supabase.table('chat_messages').insert([
                    {
                        'session_id': session_id,
                        'role': 'user',
                        'content': user_question
                    }
                ]).execute()

                supabase.table('chat_messages').insert([
                    {
                        'session_id': session_id,
                        'role': 'system',
                        'content': response
                    }
                ]).execute()

            except Exception as e:
                logging.error(f"Error storing chat messages in Supabase: {str(e)}")
                # Continue even if storage fails - prioritize responding to user

            return jsonify({
                "answer": response, 
                "sources": matched_texts
            }), 200

        logging.info("No relevant information found.")
        return jsonify({"answer": "No relevant information found."}), 404

    except Exception as e:
        logging.error(f"Failed to query data: {str(e)}")
        return jsonify({"error": f"Failed to query data: {str(e)}"}), 500
        
# Function to recursively list all files in a bucket
def list_files(bucket_name, path=''):
    files = []
    try:
        response = supabase.storage.from_(bucket_name).list(path=path)
        if 'error' in response:
            logging.error(f"Error retrieving files from bucket '{bucket_name}': {response['error']}")
            return files

        for item in response:
            if item['type'] == 'file':
                files.append({
                    'name': item['name'],
                    'path': f"{path}/{item['name']}".lstrip('/'),
                    'url': f"https://{supabase_url}/storage/v1/object/public/{bucket_name}/{path}/{item['name']}".lstrip('/')
                })
            elif item['type'] == 'folder':
                files.extend(list_files(bucket_name, path=f"{path}/{item['name']}".lstrip('/')))
    except Exception as e:
        logging.error(f"Error listing files in bucket '{bucket_name}': {str(e)}")
    return files

@bp.route('/sources', methods=['GET'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def get_all_sources():
    try:
        # Define buckets for URL and file storage based on category
        url_buckets = {
            'Business_Research': 'business-research',
            'Competitor_Analysis': 'competitor-analysis',
            'Client_Research': 'client-research',
            'General_Research': 'general-research'
        }

        file_buckets = {
            'LRMG_Knowledge': 'lrmg-knowledge',
            'Trend_Reports': 'trend-reports',
            'Business_Reports': 'business-reports',
            'Shareholder_Reports': 'shareholder-reports',
            'Qualitative_Data': 'qualitative-data',
            'Quantitative_Data': 'quantitative-data'
        }

        sources = {
            "files": {},
            "urls": {}
        }

        # Process files for each bucket category
        for category, bucket_name in file_buckets.items():
            file_response = supabase.storage.from_(bucket_name).list()

            if 'error' in file_response:
                logging.error(f"Error retrieving files from bucket '{bucket_name}': {file_response['error']}")
                continue

            sources["files"][category] = [
                {'name': file['name']}
                for file in file_response
                if 'name' in file
            ]

        # Process URLs for each URL category
        for category, bucket_name in url_buckets.items():
            url_response = supabase.storage.from_(bucket_name).list()

            if 'error' in url_response:
                logging.error(f"Error retrieving URLs from bucket '{bucket_name}': {url_response['error']}")
                continue

            sources["urls"][category] = [
                {'name': url['name']}
                for url in url_response
                if 'name' in url
            ]

        logging.debug(f"Sources retrieved from storage: {sources}")
        return jsonify(sources), 200

    except Exception as e:
        logging.error(f"Error retrieving all sources: {str(e)}")
        return jsonify({"error": str(e)}), 500



@bp.route('/qa-tool/upload', methods=['POST'])
@cross_origin(origins=['https://projectx-frontend-3owg.onrender.com'])
def upload_and_process_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_path = os.path.join('/tmp', secure_filename(file.filename))
    file.save(file_path)

    try:
        # Extract and chunk text from the file
        file_type = file.filename.split('.')[-1].lower()
        original_text = extract_text_from_file(file_path, file_type)
        chunks = chunk_text(original_text)

        # Run QA on each chunk and collect revised text
        revised_text = []
        for chunk in chunks:
            revised_text.append(check_quality_with_llm(chunk))

        # Combine chunks for the display
        revised_text_combined = "\n".join(revised_text)

        return jsonify({
            "originalText": original_text,
            "revisedText": revised_text_combined
        }), 200

    finally:
        os.remove(file_path)  # Clean up