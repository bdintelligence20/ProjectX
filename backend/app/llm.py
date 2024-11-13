import os
from openai import OpenAI
from dotenv import load_dotenv
import logging

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def query_combined_sources(dochub_texts, web_contents, user_question):
    try:
        # Create structured prompts for both sources
        system_prompt = """You are a helpful research assistant that provides comprehensive answers using both internal documentation and web sources. 
        Structure your response in two main sections:

        1. First section titled "### From the Web:" containing insights from web sources
        2. Second section titled "### From DocHub:" containing insights from internal documentation

        For each section:
        - Start with a brief overview
        - Use markdown formatting for clear structure
        - Use bullet points or numbered lists where appropriate
        - Bold **important information**
        - Use `code blocks` for technical content
        - Include relevant quotes when helpful
        - Use tables for comparative data
        
        When citing sources, indicate the specific section or part of the document where the information came from."""

        # Process web content using chunks
        web_context = ""
        for item in web_contents:
            # Create context from chunks with better structure
            chunks = item.get('chunks', [item['content']])
            web_context += f"\nSource: {item['title']} ({item['link']})\n"
            for i, chunk in enumerate(chunks, 1):
                web_context += f"Section {i}:\n{chunk}\n"

        # Process DocHub content (already chunked)
        dochub_context = "\n\n".join(dochub_texts) if dochub_texts else ""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"Web Sources:\n{web_context}" if web_context else "No web sources available."},
            {"role": "system", "content": f"DocHub Sources:\n{dochub_context}" if dochub_context else "No DocHub sources available."},
            {"role": "user", "content": user_question}
        ]

        # Query the OpenAI model
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=10000,
            top_p=1,
            frequency_penalty=0.1,
            presence_penalty=0.5,
        )

        # Format sources with section references
        web_sources = [
            f"{item['title']} ({item['link']}) - {len(item.get('chunks', [1]))} sections"
            for item in web_contents
        ] if web_contents else []
        
        dochub_sources = [f"{text[:50]}..." for text in dochub_texts] if dochub_texts else []

        # Combine response with sources
        main_response = response.choices[0].message.content.strip()
        
        # Add source sections
        if web_sources:
            main_response += "\n\nWEB_SOURCES:\n" + "\n".join(web_sources)
        if dochub_sources:
            main_response += "\n\nDOCHUB_SOURCES:\n" + "\n".join(dochub_sources)

        return main_response

    except Exception as e:
        logging.error(f"Error in combined query: {str(e)}")
        return "I apologize, but I encountered an error processing your request."


def check_quality_with_llm(text):
    try:
        # Create a prompt for text quality assurance
        messages = [
            {"role": "system", "content": """Please check the following text for spelling, grammar, and structure issues.
            Provide your response in the following format:
            
            ### Overview
            Brief overview of the text quality

            ### Corrections
            - List of specific corrections needed
            
            ### Improved Version
            The corrected text in full"""},
            {"role": "user", "content": text}
        ]

        # Query the model
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.2,
            max_tokens=3000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        logging.error(f"Error in check_quality_with_llm: {str(e)}")
        return None

def generate_source_summary(text, source_type):
    try:
        # Create a dynamic prompt based on source type
        system_prompt = f"""You are an expert at summarizing {source_type} documents. 
        Create a comprehensive yet concise summary that includes:
        
        ### Key Points
        - Main findings and important points
        
        ### Main Themes
        - Primary topics and themes discussed
        
        ### Important Data
        - Key statistics and numerical data
        - Significant findings
        
        ### Conclusions
        - Main conclusions and recommendations
        - Notable insights
        
        ### Additional Insights
        - Any other relevant observations
        
        Format the summary using markdown with clear headings, bullet points, and emphasis where appropriate.
        Use tables for comparative data if present."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Please summarize the following {source_type} document:\n\n{text}"}
        ]

        # Query the model
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.5,
            max_tokens=3000,
            top_p=1,
            frequency_penalty=0.3,
            presence_penalty=0.3
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        logging.error(f"Error generating summary: {str(e)}")
        return None

# Helper function for error handling
def handle_llm_error(error, context=""):
    logging.error(f"LLM Error in {context}: {str(error)}")
    return f"""### Error Processing Request
I apologize, but I encountered an error while processing your request.

**Error Context:** {context}
**Error Type:** {type(error).__name__}

Please try again or rephrase your question."""