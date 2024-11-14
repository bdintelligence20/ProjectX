from flask import current_app
from apscheduler.schedulers.background import BackgroundScheduler
import logging
from app.scraping import process_source
import os

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
        self.processed_files = set()
        self.monitored_buckets = list(url_buckets.values()) + list(file_buckets.values())

    def check_and_process_buckets(self):
        with self.app.app_context():
            try:
                for bucket_name in self.monitored_buckets:
                    files = self.supabase.storage.from_(bucket_name).list()
                    
                    for file_info in files:
                        filename = file_info['name']
                        file_key = f"{bucket_name}/{filename}"
                        
                        if file_key not in self.processed_files:
                            try:
                                temp_path = f"/tmp/{filename}"
                                with open(temp_path, 'wb') as f:
                                    file_data = self.supabase.storage.from_(bucket_name).download(filename)
                                    f.write(file_data)

                                file_extension = filename.split('.')[-1].lower()
                                process_source(
                                    file_path=temp_path,
                                    file_type=file_extension,
                                    source_id=filename,
                                    bucket_name=bucket_name,
                                    file_name=filename
                                )
                                
                                self.processed_files.add(file_key)
                                logging.info(f"Processed {filename} from {bucket_name}")

                            except Exception as e:
                                logging.error(f"Failed to process {filename}: {str(e)}")
                            
                            finally:
                                if os.path.exists(temp_path):
                                    os.remove(temp_path)

            except Exception as e:
                logging.error(f"Error in background ingestion: {str(e)}")

    def start(self):
        self.scheduler.add_job(
            self.check_and_process_buckets,
            'interval',
            minutes=5
        )
        self.scheduler.start()

def init_background_ingestion(app):
    ingestion = BackgroundIngestion(app)
    ingestion.start()
    return ingestion