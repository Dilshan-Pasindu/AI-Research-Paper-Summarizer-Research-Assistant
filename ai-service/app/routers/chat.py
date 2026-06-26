from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.services.vector_store import VectorStoreManager
from app.services.llm_service import LLMService

router = APIRouter(prefix="/chat", tags=["Chat"])
vector_store = VectorStoreManager()
llm_service = LLMService()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    message: str

class ChatRequest(BaseModel):
    paper_id: str
    question: str
    chat_history: List[ChatMessage]

class ChatResponse(BaseModel):
    answer: str

@router.post("", response_model=ChatResponse)
async def chat_with_paper(request: ChatRequest):
    """
    RAG-based chat with a specific paper. Fetches matching chunks from ChromaDB
    and uses Gemini to answer the question in context.
    """
    try:
        # 1. Retrieve top matching chunks from ChromaDB
        matched_docs = vector_store.query_paper(
            paper_id=request.paper_id,
            query=request.question,
            k=4
        )
        
        if not matched_docs:
            context = "No relevant context found in this research paper."
        else:
            context = "\n\n".join([doc.page_content for doc in matched_docs])
            
        # 2. Format Chat History
        formatted_history = ""
        for msg in request.chat_history:
            role_label = "User" if msg.role == "user" else "Assistant"
            formatted_history += f"{role_label}: {msg.message}\n"
            
        # 3. Answer question
        answer = llm_service.answer_question(
            context=context,
            question=request.question,
            chat_history=formatted_history
        )
        
        return ChatResponse(answer=answer)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process chat request: {str(e)}"
        )
