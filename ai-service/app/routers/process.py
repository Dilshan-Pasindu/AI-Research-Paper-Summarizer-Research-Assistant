import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.pdf_processor import PDFProcessor
from app.services.vector_store import VectorStoreManager
from app.services.llm_service import LLMService
from app.config import settings

router = APIRouter(prefix="/process", tags=["Processing"])
vector_store = VectorStoreManager()
llm_service = LLMService()

class ProcessResponse(BaseModel):
    paper_id: str
    title: str
    authors: List[str]
    doi: Optional[str]
    page_count: int
    citations: List[dict]

@router.post("", response_model=ProcessResponse)
async def process_paper(
    paper_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Upload a PDF research paper, extract text, authors, title, DOI, generate
    embeddings, store them in ChromaDB, and parse citation references.
    """
    # 1. Save uploaded file to local temp/upload path
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    temp_file_path = os.path.join(settings.UPLOAD_DIR, f"{paper_id}_{file.filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. Extract text and metadata
        pdf_data = PDFProcessor.extract_text_and_metadata(temp_file_path)
        
        # 3. Add to Vector Store (RAG chunking & embedding storage)
        vector_store.add_paper(paper_id, pdf_data["text"])
        
        # 4. Extract citations using LLM Service
        citations = llm_service.extract_citations(pdf_data["text"])
        
        # Clean up temp file (or keep it for serving, we will keep it for NestJS backend storage)
        # NestJS will store the final path, so FastAPI can either keep or discard it. 
        # Since it is a shared folder, we keep it as the primary PDF document.
        
        return ProcessResponse(
            paper_id=paper_id,
            title=pdf_data["title"],
            authors=pdf_data["authors"],
            doi=pdf_data["doi"],
            page_count=pdf_data["page_count"],
            citations=citations
        )
        
    except Exception as e:
        # Cleanup file if error occurs
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to process PDF paper: {str(e)}")

@router.delete("/{paper_id}")
async def delete_paper_vectors(paper_id: str):
    """
    Remove vectors and chunks associated with paper_id from ChromaDB.
    """
    try:
        vector_store.delete_paper(paper_id)
        return {"status": "success", "message": f"Vectors for paper {paper_id} deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete paper vectors: {str(e)}")

