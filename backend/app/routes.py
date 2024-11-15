from flask import Blueprint, request, jsonify
from app.scraping import scrape_website, extract_text_from_file, chunk_text, tokenizer, get_embedding, process_source, store_in_supabase
from app.pinecone_client import store_in_pinecone, query_pinecone
from app.llm import query_llm, generate_source_summary
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

        try:
            if source_type == 'url' and 'content' in data:
                url = data.get('content')
                logging.debug(f"Scraping URL: {url} for bucket: {bucket_name}")
                scraped_data = scrape_website(url)

                if scraped_data:
                    # Process in smaller batches for Pinecone
                    batch_size = 50
                    for i in range(0, len(scraped_data), batch_size):
                        batch = scraped_data[i:i + batch_size]
                        store_in_pinecone(url, batch, namespace="global_knowledge_base")

                    # Save scraped data as text in Supabase
                    filename = f"{url.replace('https://', '').replace('/', '_')}.txt"
                    temp_file_path = os.path.join('/tmp', filename)
                    full_text = '\n'.join(scraped_data)
                    
                    with open(temp_file_path, 'w') as f:
                        f.write(full_text)

                    try:
                        # Store file in Supabase
                        store_in_supabase(temp_file_path, bucket_name, filename)
                        logging.debug(f"Successfully stored {filename} in Supabase bucket {bucket_name}")

                        # Generate and store summary
                        summary = generate_source_summary(full_text, category)
                        if summary:
                            supabase.table('source_summaries').insert({
                                'source_id': url,
                                'category': category,
                                'summary': summary
                            }).execute()
                            logging.debug(f"Successfully stored summary for {url}")

                    except Exception as e:
                        logging.error(f"Error in storage operations: {str(e)}")
                        # Continue even if storage fails
                    
                    finally:
                        # Clean up
                        if os.path.exists(temp_file_path):
                            os.remove(temp_file_path)
                    
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

                    # Process chunks in batches for Pinecone
                    batch_size = 50
                    for i in range(0, len(chunks), batch_size):
                        batch = chunks[i:i + batch_size]
                        store_in_pinecone(filename, batch, namespace="global_knowledge_base")

                    try:
                        # Store file in Supabase
                        store_in_supabase(temp_file_path, bucket_name, filename)
                        logging.debug(f"Successfully stored {filename} in Supabase bucket {bucket_name}")

                        # Generate and store summary
                        summary = generate_source_summary(text, category)
                        if summary:
                            supabase.table('source_summaries').insert({
                                'source_id': filename,
                                'category': category,
                                'summary': summary
                            }).execute()
                            logging.debug(f"Successfully stored summary for {filename}")

                    except Exception as e:
                        logging.error(f"Error in storage operations: {str(e)}")
                        # Continue even if storage fails

                    return jsonify({"message": "File processed successfully"}), 200

                finally:
                    # Clean up
                    if os.path.exists(temp_file_path):
                        os.remove(temp_file_path)

            return jsonify({"error": "Invalid source type or content"}), 400

        except Exception as e:
            logging.error(f"Error processing source: {str(e)}")
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        logging.error(f"Error in add_source: {str(e)}")
        return jsonify({"error": str(e)}), 500



@bp.route('/query', methods=['POST'])
@cross_origin(origins='https://projectx-frontend-3owg.onrender.com')
def query():
    try:
        data = request.json
        user_question = data.get('userQuestion')
        session_id = data.get('sessionId')

        if not user_question or not session_id:
            logging.error("User question and session ID are required")
            return jsonify({"error": "User question and session ID are required"}), 400

        # Step 1: Query Pinecone for relevant context from DocHub
        dochub_texts = query_pinecone(user_question, namespace="global_knowledge_base")

        # Step 2: Generate response if we have any DocHub results
        if dochub_texts:
            response = query_llm(dochub_texts, user_question)

            try:
                # Store the question and answer in Supabase
                supabase.table('chat_messages').insert([
                    {
                        'session_id': session_id,
                        'role': 'user',
                        'content': user_question
                    },
                    {
                        'session_id': session_id,
                        'role': 'system',
                        'content': response
                    }
                ]).execute()
            except Exception as e:
                logging.error(f"Error storing chat messages in Supabase: {str(e)}")

            return jsonify({
                "answer": response,
                "dochubSources": dochub_texts
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
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    try:
        file_type = file.filename.split('.')[-1].lower()
        if file_type not in ['txt', 'pdf', 'docx', 'pptx']:
            return jsonify({"error": "Unsupported file type. Please upload PDF, DOCX, PPTX, or TXT files."}), 400

        file_path = os.path.join('/tmp', secure_filename(file.filename))
        file.save(file_path)

        try:
            # Extract text while preserving structure
            original_text = extract_text_from_file(file_path, file_type)
            if not original_text:
                return jsonify({"error": "Could not extract text from file"}), 400

            # Process the text in chunks while maintaining structure
            chunks = chunk_text(original_text)
            revised_chunks = []
            changes = []
            current_position = 0

            for chunk in chunks:
                # Get LLM suggestions for improvements
                revised_chunk = check_quality_with_llm(chunk)
                revised_chunks.append(revised_chunk)

                # Find differences between original and revised chunks
                diff = difflib.SequenceMatcher(None, chunk, revised_chunk)
                for tag, i1, i2, j1, j2 in diff.get_opcodes():
                    if tag in ['replace', 'insert', 'delete']:
                        change = {
                            'type': tag,
                            'position': current_position + i1,
                            'length': i2 - i1,
                            'original': chunk[i1:i2],
                            'revised': revised_chunk[j1:j2],
                        }
                        changes.append(change)

                current_position += len(chunk)

            # Combine revised chunks
            revised_text = "\n".join(revised_chunks)

            # Extract formatting markers if present (for PDF/DOCX)
            formatting = extract_formatting_markers(original_text, file_type)

            return jsonify({
                "originalText": original_text,
                "revisedText": revised_text,
                "changes": changes,
                "formatting": formatting,
                "fileType": file_type,
                "success": True
            }), 200

        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

    except Exception as e:
        logging.error(f"Error processing file: {str(e)}")
        return jsonify({"error": "An error occurred while processing the file"}), 500

def extract_formatting_markers(text, file_type):
    """Extract formatting information based on file type."""
    formatting = {
        'paragraphs': [],
        'headers': [],
        'lists': [],
        'tables': [],
    }

    if file_type in ['docx', 'pdf']:
        # Identify paragraphs
        paragraphs = re.split(r'\n\s*\n', text)
        current_pos = 0
        for para in paragraphs:
            if para.strip():
                formatting['paragraphs'].append({
                    'start': current_pos,
                    'length': len(para)
                })
            current_pos += len(para) + 2  # +2 for newlines

        # Identify headers (basic heuristic)
        header_pattern = r'^(?:[A-Z][^.!?]*[.!?]|[A-Z][^.!?]*$)'
        for match in re.finditer(header_pattern, text, re.MULTILINE):
            formatting['headers'].append({
                'start': match.start(),
                'length': match.end() - match.start()
            })

        # Identify bullet points and numbered lists
        list_pattern = r'(?:^\s*[\u2022\-*]\s|^\s*\d+\.\s).+'
        for match in re.finditer(list_pattern, text, re.MULTILINE):
            formatting['lists'].append({
                'start': match.start(),
                'length': match.end() - match.start()
            })

    return formatting

def get_relative_changes(original_text, revised_text):
    """Calculate relative position of changes for highlighting."""
    changes = []
    matcher = difflib.SequenceMatcher(None, original_text, revised_text)
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag != 'equal':
            change = {
                'type': tag,
                'original_start': i1,
                'original_end': i2,
                'revised_start': j1,
                'revised_end': j2,
                'original_text': original_text[i1:i2],
                'revised_text': revised_text[j1:j2],
            }
            changes.append(change)
    
    return changes


# Add new route to fetch summaries
@bp.route('/summaries/<category>', methods=['GET'])
@cross_origin(origins=['https://projectx-frontend-3owg.onrender.com'])
def get_category_summaries(category):
    try:
        response = supabase.table('source_summaries')\
            .select('*')\
            .eq('category', category)\
            .order('created_at', desc=True)\
            .execute()
        
        return jsonify(response.data), 200
    except Exception as e:
        logging.error(f"Error fetching summaries: {str(e)}")
        return jsonify({"error": str(e)}), 500