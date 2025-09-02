import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text, max_length=500):
    """
    Summarizes the input text using OpenAI's GPT-5 nano API.
    
    Parameters:
    - text: The text to summarize.
    - max_length: The desired length of the summary (in tokens).
    
    Returns:
    - Summary of the text.
    """
    try:
        # Query the OpenAI model for summarization using chat completions
        response = client.chat.completions.create(
            model="gpt-5-nano",  # Use GPT-5-nano for efficient summarization
            messages=[
                {"role": "system", "content": f"You are a helpful assistant that provides concise summaries. Summarize the following text in approximately {max_length} tokens."},
                {"role": "user", "content": text}
            ],
            max_completion_tokens=max_length
        )
        
        # Return the generated summary
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error summarizing text: {str(e)}")
        return text  # Fallback to the original text if summarization fails
