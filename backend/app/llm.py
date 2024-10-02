import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Function to query the LLM using the OpenAI client object
def query_llm(matched_texts, user_question):
    try:
        # Combine the matched texts into a single context string
        context = "\n".join(matched_texts)

        # Create the prompt using the context and the user's question
        messages = [
            {"role": "system", "content": f"Context:\n{context}"},
            {"role": "user", "content": user_question}
        ]

        # Query the OpenAI model using the client
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use your desired model here
            messages=messages,
            temperature=0.7,
            max_tokens=5000,
            top_p=1,
            frequency_penalty=0.1,
            presence_penalty=0.5,
            response_format="text"
        )

        # Extract the response text
        return response.choices[0].message['content'].strip()

    except Exception as e:
        print(f"Error querying LLM: {str(e)}")
        return None
