import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from app.embeddings import get_embedding
from app.summarization import summarize_text
from app.scraping import extract_text_from_file
import logging  # Import the file extraction method for PDFs, DOCX, CSVs


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
index = pc.Index(index_name)  # Retrieve the index correctly
def store_in_pinecone(source_id, scraped_data):
    """
    Store embeddings and metadata in Pinecone for each chunk or summarized content.
    Handles websites, file content (PDF, DOCX, CSV), and text.
    """
    try:
        namespace = "global_knowledge_base"  # Unified namespace for all knowledge

        # Process each chunk
        if isinstance(scraped_data, list):
            for i, chunk in enumerate(scraped_data):
                # Ensure chunk is a string before calling get_embedding
                if not isinstance(chunk, str):
                    chunk = str(chunk)

                # Get embedding
                embedding = get_embedding(chunk)
                if embedding is None:
                    logging.error(f"Failed to generate embedding for chunk {i}. Skipping.")
                    continue

                # Check if embedding is a list of floats
                if isinstance(embedding, list) and all(isinstance(val, float) for val in embedding):
                    vector_id = f"{source_id}_chunk_{i}"
                    metadata = {"text": chunk}

                    try:
                        # Upsert into Pinecone and log the response
                        response = index.upsert([(vector_id, embedding, metadata)], namespace=namespace)
                        logging.debug(f"Pinecone upsert response for chunk {i}: {response}")
                    except Exception as e:
                        logging.error(f"Error during Pinecone upsert for chunk {i}: {str(e)}")
                else:
                    logging.error(f"Invalid embedding for chunk {i} from {source_id}. Expected list of floats.")
                    continue
        else:
            # Handle single chunk case
            embedding = get_embedding(scraped_data)
            if embedding is not None and isinstance(embedding, list) and all(isinstance(val, float) for val in embedding):
                vector_id = source_id
                metadata = {"text": scraped_data}

                try:
                    response = index.upsert([(vector_id, embedding, metadata)], namespace=namespace)
                    logging.debug(f"Pinecone upsert response: {response}")
                except Exception as e:
                    logging.error(f"Error during Pinecone upsert for single chunk: {str(e)}")
            else:
                logging.error(f"Failed to generate valid embedding for {source_id}. Expected list of floats.")
    except Exception as e:
        logging.error(f"General error in store_in_pinecone: {str(e)}")

    logging.debug("Completed storing all chunks in Pinecone.")


def query_pinecone(user_query, namespace="global_knowledge_base"):
    """
    Query the unified namespace in Pinecone for the most similar vectors.
    """
    try:
        # Get embedding for the user query
        query_embedding = get_embedding(user_query)

        if query_embedding is None:
            raise ValueError("Failed to generate embedding for the user query.")

        # Query Pinecone for the most similar vectors using the query embedding
        results = index.query(
            vector=query_embedding,
            top_k=10,  # Retrieve the top 10 most relevant vectors for richer context
            namespace=namespace,
            include_metadata=True  # Ensure the metadata (original text) is included
        )

        # Log the Pinecone query results
        print(f"Pinecone query results: {results}")

        # Check if results contain matches
        if 'matches' not in results or not isinstance(results['matches'], list):
            print("Unexpected response structure:", results)
            return []

        # Extract the original text from the metadata of the results
        matched_texts = [
            match['metadata']['text']
            for match in results['matches']
            if 'metadata' in match and 'text' in match['metadata']
        ]
        return matched_texts

    except Exception as e:
        print(f"Error querying Pinecone: {str(e)}")
        return None
