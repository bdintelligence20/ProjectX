import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from app.embeddings import get_embedding
from app.summarization import summarize_text
from app.scraping import extract_text_from_file  # Import the file extraction method for PDFs, DOCX, CSVs

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
        # Process each chunk of scraped data
        if isinstance(scraped_data, list):
            for i, chunk in enumerate(scraped_data):
                # Summarize larger chunks for more efficient embedding
                summary = summarize_text(chunk) if len(chunk) > 1000 else chunk

                # Generate the embedding for each chunk or summary
                embedding = get_embedding(summary)
                if embedding:
                    print(f"Generated embedding for chunk {i} from {source_id} with length: {len(embedding)}")

                    # Use domain or file name as namespace
                    namespace = source_id.split("//")[-1].split("/")[0] if 'http' in source_id else source_id

                    # Create a unique ID for each chunk (e.g., source_id_chunk_i)
                    vector_id = f"{source_id}_chunk_{i}"

                    # Include the chunk or summary as metadata
                    metadata = {"text": chunk}

                    # Upsert the embedding with metadata and namespace
                    response = index.upsert([(vector_id, embedding, metadata)], namespace=namespace)
                    print(f"Pinecone upsert response for chunk {i}: {response}")
                else:
                    print(f"Failed to generate embedding for chunk {i}.")
        else:
            # Handle single chunk scenario (text source, simple file content)
            embedding = get_embedding(scraped_data)
            if embedding:
                namespace = source_id.split("//")[-1].split("/")[0] if 'http' in source_id else source_id
                vector_id = source_id
                metadata = {"text": scraped_data}  # Include the full scraped data as metadata
                response = index.upsert([(vector_id, embedding, metadata)], namespace=namespace)
                print(f"Pinecone upsert response: {response}")
            else:
                print(f"Failed to generate embedding for {source_id}.")
    except Exception as e:
        print(f"Error storing data in Pinecone: {str(e)}")


def query_pinecone(user_query, namespace):
    try:
        # Get embedding for the user query
        query_embedding = get_embedding(user_query)

        # Query Pinecone for the most similar vectors
        results = index.query(
            vector=query_embedding,
            top_k=5,  # Retrieve the top 5 most relevant vectors
            namespace=namespace,
            include_metadata=True  # Ensure the metadata (original text) is included
        )

        # Log the Pinecone query results
        print(f"Pinecone query results: {results}")

        # Extract the original text from the metadata of the results
        matched_texts = [match['metadata']['text'] for match in results['matches'] if 'metadata' in match]
        return matched_texts
    except Exception as e:
        print(f"Error querying Pinecone: {str(e)}")
        return None
