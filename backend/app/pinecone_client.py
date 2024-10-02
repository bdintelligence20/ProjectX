import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from app.embeddings import get_embedding

# Load environment variables from .env file
load_dotenv()

# Retrieve Pinecone API key from environment variables
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Initialize Pinecone instance
pc = Pinecone(api_key=PINECONE_API_KEY, verify_ssl=False)

# Check if the index exists, if not, create it
if 'business-research' not in pc.list_indexes().names():
    pc.create_index(
        name='business-research',
        dimension=1536,  # The dimension of your embeddings
        metric='cosine',  # Similarity metric
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'
        )
    )

# Connect to the existing index
index = pc.index('business-research')

def store_in_pinecone(company_url, scraped_data):
    try:
        # Generate embedding from the scraped data
        embedding = get_embedding(scraped_data)

        if embedding:
            print(f"Generated embedding length: {len(embedding)}")  # Log embedding length

            # Upsert the embedding into Pinecone with the company URL as the ID
            response = index.upsert([(company_url, embedding)])
            print(f"Pinecone upsert response: {response}")  # Log Pinecone response
        else:
            print("Failed to generate embedding.")

        return embedding
    except Exception as e:
        print(f"Error storing data in Pinecone: {str(e)}")
        raise
