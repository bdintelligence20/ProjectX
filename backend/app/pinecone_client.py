import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from app.scraping import get_embedding
import logging
import time

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
        dimension=1536,
        metric='cosine',
        spec=ServerlessSpec(cloud='aws', region='us-east-1')
    )

# Connect to the Pinecone index
index = pc.Index(index_name)

def store_in_pinecone(source_id, chunks, namespace="global_knowledge_base", batch_size=10):
    """
    Store embeddings and text metadata in Pinecone for each chunk with batching.
    """
    vectors_to_upsert = []
    
    try:
        for i, chunk in enumerate(chunks):
            try:
                # Generate embedding for the chunk
                embedding = get_embedding(chunk)
                if embedding is None:
                    logging.error(f"Failed to generate embedding for chunk {i}. Skipping.")
                    continue

                # Add to batch
                vector_id = f"{source_id}_chunk_{i}"
                metadata = {"text": chunk}
                vectors_to_upsert.append((vector_id, embedding, metadata))

                # If batch is full or this is the last chunk, upsert
                if len(vectors_to_upsert) >= batch_size or i == len(chunks) - 1:
                    try:
                        response = index.upsert(vectors=vectors_to_upsert, namespace=namespace)
                        logging.debug(f"Upserted batch of {len(vectors_to_upsert)} vectors")
                        vectors_to_upsert = []  # Clear the batch
                        time.sleep(0.5)  # Add slight delay between batches
                    except Exception as e:
                        logging.error(f"Error during Pinecone batch upsert: {str(e)}")
                        # If batch fails, try individual upserts
                        for vector in vectors_to_upsert:
                            try:
                                index.upsert([vector], namespace=namespace)
                                time.sleep(0.5)
                            except Exception as ve:
                                logging.error(f"Error upserting individual vector: {str(ve)}")
                        vectors_to_upsert = []

            except Exception as e:
                logging.error(f"Error processing chunk {i}: {str(e)}")
                continue

    except Exception as e:
        logging.error(f"Error in store_in_pinecone: {str(e)}")
        # Try to upsert any remaining vectors
        if vectors_to_upsert:
            try:
                index.upsert(vectors=vectors_to_upsert, namespace=namespace)
            except Exception as e:
                logging.error(f"Error upserting final batch: {str(e)}")
                
    logging.debug("Completed storing chunks in Pinecone.")

def query_pinecone(user_query, namespace="global_knowledge_base"):
    """
    Query the Pinecone index for the most similar vectors to the user query.
    """
    max_retries = 3
    retry_delay = 1  # seconds
    
    for attempt in range(max_retries):
        try:
            query_embedding = get_embedding(user_query)
            if query_embedding is None:
                raise ValueError("Failed to generate embedding for the user query.")

            results = index.query(
                vector=query_embedding,
                top_k=10,
                namespace=namespace,
                include_metadata=True
            )

            matched_texts = [
                match['metadata']['text']
                for match in results.get('matches', [])
                if 'metadata' in match and 'text' in match['metadata']
            ]
            return matched_texts

        except Exception as e:
            logging.error(f"Query attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay * (attempt + 1))
                continue
            return None