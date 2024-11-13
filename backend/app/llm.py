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



def generate_source_summary(text, source_type):
    try:
        # Create a dynamic prompt based on source type
        system_prompt = f"""You are an expert at summarizing {source_type} documents. 
        Create a comprehensive yet concise summary that includes:
        1. Key points and findings
        2. Main themes or topics
        3. Important data or statistics (if any)
        4. Conclusions or recommendations
        5. Any notable insights

        Format the summary in a clear, structured way using markdown."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Please summarize the following {source_type} document:\n\n{text}"}
        ]

        # Query the model
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using GPT-4 for better summarization
            messages=messages,
            temperature=0.5,
            max_tokens=3000,
            top_p=1,
            frequency_penalty=0.3,
            presence_penalty=0.3
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return None