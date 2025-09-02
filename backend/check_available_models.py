#!/usr/bin/env python3
"""
Script to check what OpenAI models are currently available
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def list_available_models():
    """List all available OpenAI models"""
    try:
        print("🔍 Checking available OpenAI models...\n")
        
        models = client.models.list()
        
        # Filter for GPT models and sort by name
        gpt_models = [model for model in models.data if 'gpt' in model.id.lower()]
        gpt_models.sort(key=lambda x: x.id)
        
        print(f"Found {len(gpt_models)} GPT models:")
        print("-" * 50)
        
        for model in gpt_models:
            print(f"• {model.id}")
            
        print()
        
        # Check specifically for GPT-5 variants
        gpt5_models = [model for model in gpt_models if 'gpt-5' in model.id]
        
        if gpt5_models:
            print("✅ GPT-5 models found:")
            for model in gpt5_models:
                print(f"  • {model.id}")
        else:
            print("❌ No GPT-5 models found in available models list")
            
            # Check for the latest GPT-4 models as alternatives
            latest_gpt4 = [model for model in gpt_models if any(x in model.id for x in ['gpt-4o', 'gpt-4-turbo'])]
            if latest_gpt4:
                print("\n💡 Latest GPT-4 models available:")
                for model in latest_gpt4[-5:]:  # Show last 5
                    print(f"  • {model.id}")
        
        return gpt5_models
        
    except Exception as e:
        print(f"❌ Error listing models: {str(e)}")
        return []

if __name__ == "__main__":
    list_available_models()
