from apscheduler.schedulers.background import BackgroundScheduler
import logging
from app.scraping import process_source, extract_text_from_file
from app.llm import generate_source_summary
import os
import json

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

    def get_processed_files(self):
        try:
            response = self.supabase.table('processed_files').select('*').execute()
            return {item['file_metadata'] for item in response.data}
        except Exception as e:
            logging.error(f"Error loading processed files: {str(e)}")
            return set()

    def add_processed_file(self, file_metadata):
        try:
            self.supabase.table('processed_files').insert({
                'file_metadata': file_metadata
            }).execute()
        except Exception as e:
            logging.error(f"Error saving processed file: {str(e)}")

    def generate_and_store_summary(self, file_path, file_type, category, source_id):
        try:
            # Check if summary already exists
            existing_summary = self.supabase.table('source_summaries')\
                .select('*')\
                .eq('source_id', source_id)\
                .execute()

            if existing_summary.data:
                logging.info(f"Summary already exists for {source_id}")
                return True

            # Extract text and generate new summary
            text = extract_text_from_file(file_path, file_type)
            summary = generate_source_summary(text, category)
            
            if summary:
                # Store with original category format (with underscores)
                self.supabase.table('source_summaries').insert({
                    'source_id': source_id,
                    'category': category,  # Keep underscores
                    'summary': summary
                }).execute()
                logging.info(f"Summary generated and stored for {source_id}")
                return True
        except Exception as e:
            logging.error(f"Error generating summary: {str(e)}")
            return False

    def process_file(self, bucket_name, filename, file_info):
        temp_path = f"/tmp/{filename}"
        try:
            with open(temp_path, 'wb') as f:
                try:
                    file_data = self.supabase.storage.from_(bucket_name).download(filename)
                    f.write(file_data)
                except Exception as e:
                    if 'Duplicate' in str(e):
                        logging.warning(f"Duplicate file in Supabase: {filename} - continuing with processing")
                    else:
                        raise e

            file_extension = filename.split('.')[-1].lower()
            category = next(
                (k for k, v in {**url_buckets, **file_buckets}.items() 
                 if v == bucket_name), 
                bucket_name
            )

            # Generate and store summary first
            summary_success = self.generate_and_store_summary(
                file_path=temp_path,
                file_type=file_extension,
                category=category,
                source_id=filename
            )

            if summary_success:
                # Only process for Pinecone if summary was successful
                process_source(
                    file_path=temp_path,
                    file_type=file_extension,
                    source_id=filename,
                    bucket_name=bucket_name,
                    file_name=filename
                )

            return summary_success
            
        except Exception as e:
            logging.error(f"Failed to process {filename}: {str(e)}")
            return False
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def check_and_process_buckets(self):
        with self.app.app_context():
            try:
                processed_files = self.get_processed_files()
                
                for bucket_name in self.monitored_buckets:
                    files = self.supabase.storage.from_(bucket_name).list()
                    
                    for file_info in files:
                        filename = file_info['name']
                        file_key = f"{bucket_name}/{filename}"
                        file_metadata = f"{file_key}_{file_info.get('metadata', {}).get('last_modified', '')}"
                        
                        if file_metadata not in processed_files:
                            if self.process_file(bucket_name, filename, file_info):
                                self.add_processed_file(file_metadata)
                                logging.info(f"Processed and summarized {filename} from {bucket_name}")

            except Exception as e:
                logging.error(f"Error in background ingestion: {str(e)}")

    def start(self):
        self.scheduler.add_job(
            self.check_and_process_buckets,
            'interval',
            minutes=5,
            coalesce=True,
            max_instances=1
        )
        self.scheduler.start()

def init_background_ingestion(app):
    ingestion = BackgroundIngestion(app)
    ingestion.start()
    return ingestion