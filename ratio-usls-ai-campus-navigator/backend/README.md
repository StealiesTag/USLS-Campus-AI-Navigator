# FastAPI / Flask Equivalent for Export

This directory contains the Python equivalents for the backend API and AI logic if you decide to export or run this project with Python.

---

### 1. `backend/main.py` (FastAPI Equivalent)

```python
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

app = FastAPI(title="USLS Campus AI Navigator API")

# Allow CORS for React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini AI Client
def get_ai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    prompt: str
    history: Optional[List[ChatMessage]] = []
    systemInstruction: Optional[str] = "You are a helpful campus assistant and navigator. Answer questions clearly, accurately, and concisely."

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "hasApiKey": bool(os.environ.get("GEMINI_API_KEY"))
    }

@app.post("/api/chat")
def chat_with_gemini(req: ChatRequest):
    client = get_ai_client()
    candidate_models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-3.7-flash",
    ]

    contents = []
    for msg in req.history:
        contents.append({
            "role": "model" if msg.role == "assistant" else "user",
            "parts": [{"text": msg.content}]
        })
    contents.append({
        "role": "user",
        "parts": [{"text": req.prompt}]
    })

    last_error = None
    for model_name in candidate_models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config={
                    "system_instruction": req.systemInstruction,
                    "temperature": 0.7,
                }
            )
            return {
                "text": response.text,
                "modelUsed": model_name
            }
        except Exception as e:
            last_error = e

    raise HTTPException(status_code=500, detail=str(last_error))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
```

---

### 2. `backend/requirements.txt`

```text
fastapi>=0.110.0
uvicorn>=0.28.0
google-genai>=0.2.0
pydantic>=2.6.0
python-dotenv>=1.0.0
```
