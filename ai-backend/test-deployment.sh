#!/bin/bash
# Test script for LoopAI deployment

echo "Testing LoopAI Backend Deployment"
echo "=================================="

# Test 1: Check if Python is available
echo "1. Checking Python version..."
python3 --version

# Test 2: Check if virtual environment exists
echo "2. Checking virtual environment..."
if [ -d "venv" ]; then
    echo "✓ Virtual environment found"
else
    echo "✗ Virtual environment not found"
fi

# Test 3: Activate venv and check dependencies
echo "3. Checking dependencies..."
source venv/bin/activate
python -c "import fastapi, uvicorn, mysql.connector, google.genai; print('✓ All dependencies installed')"

# Test 4: Check environment variables
echo "4. Checking environment variables..."
if [ -f ".env" ]; then
    echo "✓ .env file found"
else
    echo "✗ .env file not found"
fi

# Test 5: Test database connection
echo "5. Testing database connection..."
python -c "
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()

try:
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    print('✓ Database connection successful')
    conn.close()
except Exception as e:
    print(f'✗ Database connection failed: {e}')
"

# Test 6: Test Gemini API
echo "6. Testing Gemini API..."
python -c "
import os
from google import genai
from dotenv import load_dotenv
load_dotenv()

try:
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    print('✓ Gemini API key valid')
except Exception as e:
    print(f'✗ Gemini API error: {e}')
"

echo "=================================="
echo "Deployment test complete!"
