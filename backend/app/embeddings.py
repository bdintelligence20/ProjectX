from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = "text-embedding-ada-002"  # Set the desired model (e.g., text-embedding-ada-002)

def get_embedding(text):
    try:
        # Generate embeddings using OpenAI's API with the client
        response = client.embeddings.create(input=[text], model=MODEL)
        embedding = response['data'][0]['embedding']  # Extract the embedding vector
        return embedding
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        return None
