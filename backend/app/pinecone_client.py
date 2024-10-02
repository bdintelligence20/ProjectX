import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from app.embeddings import get_embedding

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
index = pc.Index(index_name)  # This is the correct way to retrieve an index

def store_in_pinecone(company_url, scraped_data):
    try:
        # Ensure company_url is a string, not a list
        if isinstance(company_url, list):
            company_url = company_url[0]

        # Truncate the URL to ensure the ID length is below 512 characters
        truncated_url = company_url[:500]  # Truncate to 500 characters
        
        # Process each chunk of scraped data if it's a list
        if isinstance(scraped_data, list):
            for i, chunk in enumerate(scraped_data):
                embedding = get_embedding(chunk)
                if embedding:
                    print(f"Generated embedding for chunk {i} from {company_url} with length: {len(embedding)}")
                    
                    # Use domain as namespace
                    namespace = company_url.split("//")[-1].split("/")[0]
                    
                    # Create a unique ID for each chunk (e.g., company_url_chunk_i)
                    vector_id = f"{company_url}_chunk_{i}"
                    
                    # Upsert the embedding with a unique vector ID and namespace
                    response = index.upsert([(vector_id, embedding)], namespace=namespace)
                    print(f"Pinecone upsert response for chunk {i}: {response}")
                else:
                    print(f"Failed to generate embedding for chunk {i}.")
        else:
            # Handle single chunk scenario
            embedding = get_embedding(scraped_data)
            if embedding:
                namespace = company_url.split("//")[-1].split("/")[0]
                vector_id = truncated_url
                response = index.upsert([(vector_id, embedding)], namespace=namespace)
                print(f"Pinecone upsert response: {response}")
            else:
                print(f"Failed to generate embedding for {company_url}.")
                
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

        # Extract the original text from the results
        matched_texts = [match['metadata']['text'] for match in results['matches']]
        return matched_texts
    except Exception as e:
        print(f"Error querying Pinecone: {str(e)}")
        return None
