import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text, max_length=500):
    """
    Summarizes the input text using OpenAI's GPT-4 API.
    
    Parameters:
    - text: The text to summarize.
    - max_length: The desired length of the summary (in tokens).
    
    Returns:
    - Summary of the text.
    """
    try:
        # Query the OpenAI model for summarization
        response = client.completions.create(
            model="gpt-4",  # Use the desired model
            prompt=f"Summarize the following text in {max_length} tokens:\n\n{text}",
            max_tokens=max_length,
            temperature=0.5
        )
        
        # Return the generated summary
        return response.choices[0].text.strip()

    except Exception as e:
        print(f"Error summarizing text: {str(e)}")
        return text  # Fallback to the original text if summarization fails
