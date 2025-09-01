#!/usr/bin/env python3
"""
Test script to verify GPT-5 model compatibility with OpenAI API
"""

import os
import sys
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def test_model(model_name, test_prompt="Hello, this is a test message."):
    """Test a specific model with a simple prompt"""
    try:
        print(f"Testing {model_name}...")
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "user", "content": test_prompt}
            ],
            max_completion_tokens=50,
            temperature=0.7
        )
        
        result = response.choices[0].message.content.strip()
        print(f"✅ {model_name}: SUCCESS")
        print(f"   Response: {result[:100]}{'...' if len(result) > 100 else ''}")
        return True
        
    except Exception as e:
        print(f"❌ {model_name}: FAILED")
        print(f"   Error: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing GPT-5 Model Compatibility\n")
    
    # Check if API key is available
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY not found in environment variables")
        sys.exit(1)
    
    models_to_test = [
        "gpt-5",
        "gpt-5-mini", 
        "gpt-5-nano"
    ]
    
    results = {}
    
    for model in models_to_test:
        results[model] = test_model(model)
        print()  # Add space between tests
    
    # Summary
    print("📊 Test Summary:")
    print("-" * 40)
    
    success_count = sum(results.values())
    total_count = len(results)
    
    for model, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{model}: {status}")
    
    print(f"\nOverall: {success_count}/{total_count} models working")
    
    if success_count == total_count:
        print("🎉 All GPT-5 models are working correctly!")
        return 0
    else:
        print("⚠️  Some models failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
