import os
from supabase import create_client

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_SECRET")
supabase = create_client(supabase_url, supabase_key)

def save_text_to_file(text, filename="file.txt", category="general"):
    # Save text to a temporary file
    temp_file_path = os.path.join('/tmp', filename)
    with open(temp_file_path, 'w') as f:
        f.write(text)

    # Upload to Supabase storage
    try:
        bucket_name = category  # Use category as bucket name or customize as needed
        with open(temp_file_path, 'rb') as f:
            upload_response = supabase.storage.from_(bucket_name).upload(filename, f)

        # Check upload response
        if 'error' in upload_response:
            raise Exception(upload_response['error']['message'])

        # Return the public URL of the uploaded file
        file_url_response = supabase.storage.from_(bucket_name).get_public_url(filename)
        return file_url_response.get('publicURL')

    except Exception as e:
        print(f"Error saving text to file: {str(e)}")
        return None
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
