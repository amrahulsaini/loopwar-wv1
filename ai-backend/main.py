from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
import os
from google import genai
from typing import List, Optional
from datetime import datetime

app = FastAPI(title="LoopAI Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://loopwar.dev"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "loop_wv1"),
    "password": os.getenv("DB_PASSWORD", "wv1"),
    "database": os.getenv("DB_NAME", "loop_wv1"),
}

# Gemini AI setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

ai_client = genai.Client(api_key=GEMINI_API_KEY)

# System prompt
SYSTEM_PROMPT = """
You are LoopAI, an advanced AI tutor for the LoopWar coding platform. Your role is to help users learn programming concepts through interactive, personalized tutoring.

Key guidelines:
- Be friendly, patient, and encouraging
- Explain concepts clearly with examples
- Adapt your explanations based on user knowledge level
- Use code examples when relevant
- Guide users toward understanding rather than giving direct answers
- Relate concepts to real-world applications
- Encourage best practices and problem-solving skills

Remember: You're part of LoopWar, so reference the platform's features when appropriate.
"""

class ChatRequest(BaseModel):
    user_id: int
    message: str
    conversation_id: Optional[int] = None
    context: Optional[str] = None  # e.g., current problem or topic

class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    timestamp: datetime

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    # Get or create conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation_id = create_conversation(request.user_id, request.context)

    # Get conversation history
    history = get_conversation_history(conversation_id)

    # Prepare messages for Gemini
    messages = [{"role": "user", "parts": [SYSTEM_PROMPT]}]  # System prompt as first message
    
    for msg in history:
        messages.append({"role": "user", "parts": [msg["user_message"]]})
        messages.append({"role": "model", "parts": [msg["ai_response"]]})

    messages.append({"role": "user", "parts": [request.message]})

    try:
        # Generate response
        response = ai_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=messages
        )
        
        ai_response = response.text

        # Save to database
        save_message(conversation_id, request.user_id, request.message, ai_response)

        return ChatResponse(
            conversation_id=conversation_id,
            response=ai_response,
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

def create_conversation(user_id: int, context: Optional[str] = None) -> int:
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    INSERT INTO ai_conversations (user_id, context, created_at)
    VALUES (%s, %s, NOW())
    """
    cursor.execute(query, (user_id, context))
    conversation_id = cursor.lastrowid
    connection.commit()
    cursor.close()
    connection.close()
    
    return conversation_id

def get_conversation_history(conversation_id: int) -> List[dict]:
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    query = """
    SELECT user_message, ai_response, created_at
    FROM ai_messages
    WHERE conversation_id = %s
    ORDER BY created_at ASC
    """
    cursor.execute(query, (conversation_id,))
    history = cursor.fetchall()
    cursor.close()
    connection.close()
    
    return history

def save_message(conversation_id: int, user_id: int, user_message: str, ai_response: str):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = """
    INSERT INTO ai_messages (conversation_id, user_id, user_message, ai_response, created_at)
    VALUES (%s, %s, %s, %s, NOW())
    """
    cursor.execute(query, (conversation_id, user_id, user_message, ai_response))
    connection.commit()
    cursor.close()
    connection.close()

@app.get("/api/ai/conversations/{user_id}")
async def get_user_conversations(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    query = """
    SELECT id, context, created_at, updated_at
    FROM ai_conversations
    WHERE user_id = %s
    ORDER BY updated_at DESC
    """
    cursor.execute(query, (user_id,))
    conversations = cursor.fetchall()
    cursor.close()
    connection.close()
    
    return conversations

@app.get("/api/ai/conversation/{conversation_id}")
async def get_conversation(conversation_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    query = """
    SELECT user_message, ai_response, created_at
    FROM ai_messages
    WHERE conversation_id = %s
    ORDER BY created_at ASC
    """
    cursor.execute(query, (conversation_id,))
    messages = cursor.fetchall()
    cursor.close()
    connection.close()
    
    return messages

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
