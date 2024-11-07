import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from app.scraping import get_embedding
import logging

# Load environment variables
load_dotenv()

# Initialize Pinecone client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Define index name
index_name = 'business-research'

# Check if the index exists, if not, create it
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # Ensure this matches the embedding dimensions
        metric='cosine',  # Define the similarity metric
        spec=ServerlessSpec(cloud='aws', region='us-east-1')
    )

# Connect to the Pinecone index
index = pc.Index(index_name)

def store_in_pinecone(source_id, chunks, namespace="global_knowledge_base"):
    """
    Store embeddings and text metadata in Pinecone for each chunk.
    """
    try:
        for i, chunk in enumerate(chunks):
            # Generate embedding for the chunk
            embedding = get_embedding(chunk)
            if embedding is None:
                logging.error(f"Failed to generate embedding for chunk {i}. Skipping.")
                continue

            # Define a unique vector ID and metadata
            vector_id = f"{source_id}_chunk_{i}"
            metadata = {"text": chunk}

            try:
                # Upsert into Pinecone with metadata
                response = index.upsert([(vector_id, embedding, metadata)], namespace=namespace)
                logging.debug(f"Upserted chunk {i} into Pinecone: {response}")
            except Exception as e:
                logging.error(f"Error during Pinecone upsert for chunk {i}: {str(e)}")
    except Exception as e:
        logging.error(f"Error in store_in_pinecone: {str(e)}")
    logging.debug("Completed storing all chunks in Pinecone.")

def query_pinecone(user_query, namespace="global_knowledge_base"):
    """
    Query the Pinecone index for the most similar vectors to the user query.
    """
    try:
        # Generate embedding for the user query
        query_embedding = get_embedding(user_query)
        if query_embedding is None:
            raise ValueError("Failed to generate embedding for the user query.")

        # Query Pinecone for similar vectors
        results = index.query(
            vector=query_embedding,
            top_k=10,
            namespace=namespace,
            include_metadata=True
        )

        logging.debug(f"Pinecone query results: {results}")

        # Extract the original text from the metadata of the results
        matched_texts = [
            match['metadata']['text']
            for match in results.get('matches', [])
            if 'metadata' in match and 'text' in match['metadata']
        ]
        return matched_texts

    except Exception as e:
        logging.error(f"Error querying Pinecone: {str(e)}")
        return None
