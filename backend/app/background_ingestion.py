from apscheduler.schedulers.background import BackgroundScheduler
import logging
from app.scraping import extract_text_from_file, chunk_text, get_embedding
from app.llm import generate_source_summary
from app.pinecone_client import store_in_pinecone, index  # Import index from pinecone_client
import os

# Define bucket mappings
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

class BackgroundIngestion:
    def __init__(self, app):
        self.app = app
        self.scheduler = BackgroundScheduler()
        self.supabase = app.supabase
        self.monitored_buckets = list(url_buckets.values()) + list(file_buckets.values())
        self.index = index  # Store reference to Pinecone index

    def get_bucket_contents(self, bucket_name):
        """Get files and their metadata from a Supabase bucket."""
        try:
            files = self.supabase.storage.from_(bucket_name).list()
            return {
                file['name']: file.get('metadata', {}).get('last_modified', '')
                for file in files if 'name' in file
            }
        except Exception as e:
            logging.error(f"Error getting contents of bucket {bucket_name}: {str(e)}")
            return {}

    def get_existing_vectors(self, filename, namespace="global_knowledge_base"):
        """Check if vectors already exist in Pinecone for this file."""
        try:
            fetch_response = self.index.fetch(
                ids=[f"{filename}_*"],
                namespace=namespace
            )
            return bool(fetch_response.vectors)
        except Exception as e:
            logging.error(f"Error checking Pinecone vectors for {filename}: {str(e)}")
            return False

    def get_existing_summary(self, source_id):
        """Check if summary already exists for this file."""
        try:
            response = self.supabase.table('source_summaries')\
                .select('*')\
                .eq('source_id', source_id)\
                .execute()
            return bool(response.data)
        except Exception as e:
            logging.error(f"Error checking summary for {source_id}: {str(e)}")
            return False

    def process_file(self, bucket_name, filename, file_info):
        """Process a single file if it hasn't been processed before."""
        temp_path = f"/tmp/{filename}"
        try:
            # Check if this file is already processed in both Pinecone and summaries
            vectors_exist = self.get_existing_vectors(filename)
            summary_exists = self.get_existing_summary(filename)
            
            if vectors_exist and summary_exists:
                logging.info(f"File {filename} already fully processed. Skipping.")
                return True

            # Download and process file
            with open(temp_path, 'wb') as f:
                file_data = self.supabase.storage.from_(bucket_name).download(filename)
                f.write(file_data)

            file_extension = filename.split('.')[-1].lower()
            category = next(
                (k for k, v in {**url_buckets, **file_buckets}.items() 
                 if v == bucket_name), 
                bucket_name
            )

            # Extract text from file
            text = extract_text_from_file(temp_path, file_extension)
            if not text:
                logging.error(f"Could not extract text from {filename}")
                return False

            # Generate and store summary if needed
            if not summary_exists:
                logging.info(f"Generating summary for {filename}")
                summary = generate_source_summary(text, category)
                if summary:
                    self.supabase.table('source_summaries').insert({
                        'source_id': filename,
                        'category': category,
                        'summary': summary
                    }).execute()
                    logging.info(f"Generated and stored summary for {filename}")

            # Process for Pinecone if needed
            if not vectors_exist:
                logging.info(f"Processing vectors for {filename}")
                chunks = chunk_text(text)
                store_in_pinecone(filename, chunks, namespace="global_knowledge_base")
                logging.info(f"Processed and stored vectors for {filename}")

            return True

        except Exception as e:
            logging.error(f"Failed to process {filename}: {str(e)}")
            return False
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def check_and_process_buckets(self):
        """Check all monitored buckets and process new or updated files."""
        with self.app.app_context():
            try:
                for bucket_name in self.monitored_buckets:
                    logging.info(f"Checking bucket: {bucket_name}")
                    current_files = self.get_bucket_contents(bucket_name)
                    
                    for filename, metadata in current_files.items():
                        try:
                            logging.info(f"Processing file: {filename}")
                            self.process_file(bucket_name, filename, {'metadata': {'last_modified': metadata}})
                        except Exception as e:
                            logging.error(f"Error processing {filename} from {bucket_name}: {str(e)}")
                            continue

            except Exception as e:
                logging.error(f"Error in background ingestion: {str(e)}")

    def start(self):
        """Start the background scheduler."""
        self.scheduler.add_job(
            self.check_and_process_buckets,
            'interval',
            minutes=5,
            coalesce=True,
            max_instances=1
        )
        self.scheduler.start()
        logging.info("Background ingestion scheduler started")

def init_background_ingestion(app):
    ingestion = BackgroundIngestion(app)
    ingestion.start()
    return ingestion