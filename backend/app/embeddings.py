from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = "text-embedding-ada-002"  # Set the desired model

def get_embedding(text):
    try:
        response = client.embeddings.create(input=[text], model=MODEL)
        print(f"OpenAI embedding response: {response}")

        if hasattr(response, 'data') and len(response.data) > 0:
            embedding = response.data[0].embedding
            if isinstance(embedding, list) and all(isinstance(val, float) for val in embedding):
                return embedding
            else:
                raise ValueError("Embedding is not a list of floats as expected.")
        else:
            raise ValueError("No data found in OpenAI embedding response.")
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        return None  # Return None to handle gracefully in `store_in_pinecone`
