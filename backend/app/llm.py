import os
import time
from openai import OpenAI
from dotenv import load_dotenv
import tiktoken
import logging
from typing import List, Optional

# Load environment variables from .env
load_dotenv()

# Initialize OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def query_llm(dochub_texts, user_question):
    try:
        system_prompt = """You are a helpful research assistant that provides comprehensive answers using internal documentation."""

        # Function to truncate context while preserving meaning
        def prepare_context(texts, max_chars=2000):
            if not texts:
                return ""
            context = []
            total_chars = 0
            for text in texts:
                if total_chars + len(text) > max_chars:
                    # Take first part of remaining text to reach limit
                    remaining = max_chars - total_chars
                    if remaining > 100:  # Only add if we can include meaningful content
                        context.append(text[:remaining] + "...")
                    break
                context.append(text)
                total_chars += len(text)
            return "\n\n".join(context)

        # Process DocHub content with limits
        dochub_context = prepare_context(dochub_texts, max_chars=2000)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"DocHub Sources:\n{dochub_context}" if dochub_context else "No DocHub sources available."},
            {"role": "user", "content": user_question}
        ]

        # Query the OpenAI model with reduced tokens
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=5000,  # Reduced from 5000
            top_p=1,
            frequency_penalty=0.1,
            presence_penalty=0.5,
        )

        # Format DocHub sources concisely
        dochub_sources = [
            f"{text[:50]}..." for text in dochub_texts[:3]
        ] if dochub_texts else []

        # Combine response with sources
        main_response = response.choices[0].message.content.strip()
        
        if dochub_sources:
            main_response += "\n\nDOCHUB_SOURCES:\n" + "\n".join(dochub_sources)

        return main_response

    except Exception as e:
        logging.error(f"Error in DocHub query: {str(e)}")
        return "I apologize, but I encountered an error processing your request. Please try a more specific question or break it into smaller parts."

def check_quality_with_llm(text):
    try:
        # Create a prompt that emphasizes preserving document structure
        messages = [
            {"role": "system", "content": """
            You are a professional editor focusing on improving text while maintaining its original structure and formatting.
            Focus on:
            1. Grammar and spelling corrections
            2. Sentence structure improvements
            3. Clarity and readability enhancements
            
            Important:
            - Preserve all original formatting (paragraphs, lists, headers)
            - Keep the same basic structure
            - Only make necessary language improvements
            - Maintain the original tone and style
            - Return the text in the exact same format with improvements
            """},
            {"role": "user", "content": f"Improve the following text while maintaining its structure:\n\n{text}"}
        ]

        # Query the model
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2,  # Lower temperature for more consistent corrections
            max_tokens=3000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        # Extract and return the improved text
        return response.choices[0].message.content.strip()

    except Exception as e:
        logging.error(f"Error in check_quality_with_llm: {str(e)}")
        return text  # Return original text if processing fails

class SourceSummaryHandler:
    def __init__(self):
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        self.max_chunk_tokens = 4000  # Safe limit for input tokens
        self.delay_between_calls = 3.0  # Delay between API calls to respect rate limits

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.tokenizer.encode(text))

    def split_text_into_chunks(self, text: str) -> List[str]:
        """Split text into chunks that respect token limits."""
        chunks = []
        paragraphs = text.split('\n')
        current_chunk = []
        current_length = 0
        
        for paragraph in paragraphs:
            paragraph_tokens = self.count_tokens(paragraph)
            
            if current_length + paragraph_tokens <= self.max_chunk_tokens:
                current_chunk.append(paragraph)
                current_length += paragraph_tokens
            else:
                if current_chunk:
                    chunks.append('\n'.join(current_chunk))
                current_chunk = [paragraph]
                current_length = paragraph_tokens
        
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks

    def summarize_chunk(self, chunk: str, category: str) -> Optional[str]:
        """Summarize a single chunk of text."""
        try:
            prompt = f"""Analyze this {category} document section and provide a focused summary that includes:

            1. Key Points: Main findings and important points
            2. Main Themes: Primary topics discussed
            3. Important Data: Key statistics and findings
            4. Notable Insights: Significant observations

            Keep the summary concise and relevant."""

            messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": chunk}
            ]

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",  # Using 3.5-turbo for better rate limits
                messages=messages,
                max_tokens=1000,
                temperature=0.5
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"Error summarizing chunk: {str(e)}")
            return None

    def combine_summaries(self, summaries: List[str], category: str) -> str:
        """Combine multiple summaries into a coherent final summary."""
        try:
            combined_text = "\n\n".join(summaries)
            
            prompt = f"""Create a unified summary of this {category} document from the following section summaries. 
            Organize the information into these sections:

            ### Overview
            Brief overview of the entire document

            ### Key Findings
            - Main points and conclusions
            - Important data and statistics

            ### Main Themes
            - Primary topics and themes discussed

            ### Insights & Recommendations
            - Notable insights
            - Key recommendations or implications

            Make the summary comprehensive yet concise."""

            messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": combined_text}
            ]

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=2000,
                temperature=0.5
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"Error combining summaries: {str(e)}")
            return combined_text

    def generate_summary(self, text: str, category: str) -> str:
        """Main method to handle the complete summarization process."""
        try:
            # Split text into manageable chunks
            chunks = self.split_text_into_chunks(text)
            logging.info(f"Split text into {len(chunks)} chunks")

            # Summarize each chunk with delay between API calls
            chunk_summaries = []
            for i, chunk in enumerate(chunks):
                logging.info(f"Processing chunk {i+1}/{len(chunks)}")
                summary = self.summarize_chunk(chunk, category)
                if summary:
                    chunk_summaries.append(summary)
                time.sleep(self.delay_between_calls)  # Rate limiting delay

            # If we have multiple summaries, combine them
            if len(chunk_summaries) > 1:
                final_summary = self.combine_summaries(chunk_summaries, category)
            elif chunk_summaries:
                final_summary = chunk_summaries[0]
            else:
                raise Exception("No successful summaries generated")

            return final_summary

        except Exception as e:
            logging.error(f"Error in summarization process: {str(e)}")
            return f"Error generating summary: {str(e)}"

# Usage function
def generate_source_summary(text: str, category: str) -> str:
    """Helper function to generate a summary of a source."""
    handler = SourceSummaryHandler()
    try:
        return handler.generate_summary(text, category)
    except Exception as e:
        logging.error(f"Error generating summary: {str(e)}")
        return f"Error generating summary: {str(e)}"

# Helper function for error handling
def handle_llm_error(error, context=""):
    logging.error(f"LLM Error in {context}: {str(error)}")
    return f"""### Error Processing Request
I apologize, but I encountered an error while processing your request.

**Error Context:** {context}
**Error Type:** {type(error).__name__}

Please try again or rephrase your question."""