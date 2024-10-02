import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve OpenAI API key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI with the API key
openai.api_key = OPENAI_API_KEY

def get_embedding(text):
    try:
        # Call OpenAI API to generate embeddings
        response = openai.Embedding.create(input=[text], model="text-embedding-ada-002")
        embedding = response['data'][0]['embedding']
        print(f"Generated embedding: {embedding[:10]}")  # Log the first 10 elements for verification
        return embedding
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        raise
