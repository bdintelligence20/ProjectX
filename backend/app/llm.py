import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Function to query the LLM for general queries
def query_llm(matched_texts, user_question):
    try:
        if not matched_texts:
            print("No matched texts provided to LLM.")
            return "No relevant information was found."

        # Combine the matched texts into a single context string
        context = "\n".join(matched_texts)
        print(f"Context for LLM:\n{context}")

        # Create the prompt using the context and the user's question
        messages = [
            {"role": "system", "content": f"Context:\n{context}"},
            {"role": "user", "content": user_question}
        ]

        # Query the OpenAI model using the client
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # General model for context-based answers
            messages=messages,
            temperature=0.7,
            max_tokens=5000,
            top_p=1,
            frequency_penalty=0.1,
            presence_penalty=0.5,
        )

        # Extract and return the response text
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error querying LLM: {str(e)}")
        return None

# Function to perform QA on text for spelling, grammar, and structure
def check_quality_with_llm(text):
    try:
        # Create a prompt for text quality assurance
        messages = [
            {"role": "system", "content": "Please check the following text for spelling, grammar, and structure issues:"},
            {"role": "user", "content": text}
        ]

        # Query the model
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2,
            max_tokens=3000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        # Extract and return the response
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error in check_quality_with_llm: {str(e)}")
        return None