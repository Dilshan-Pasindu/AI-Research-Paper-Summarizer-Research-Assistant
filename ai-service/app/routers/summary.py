import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.pdf_processor import PDFProcessor
from app.services.llm_service import LLMService

router = APIRouter(prefix="/summarize", tags=["Summarization"])
llm_service = LLMService()

class SummaryRequest(BaseModel):
    paper_id: str
    file_path: str

class SummaryResponse(BaseModel):
    executiveSummary: str
    problemStatement: str
    methodology: str
    datasetUsed: str
    results: str
    limitations: str
    futureWork: str
    conclusion: str

@router.post("", response_model=SummaryResponse)
async def summarize_paper(request: SummaryRequest):
    """
    Generate a detailed structured summary from an uploaded research paper.
    """
    if not os.path.exists(request.file_path):
        raise HTTPException(
            status_code=404, 
            detail=f"Research paper file not found at path: {request.file_path}"
        )
        
    try:
        # Extract text from PDF
        pdf_data = PDFProcessor.extract_text_and_metadata(request.file_path)
        
        # Generate summary using LLM
        summary_data = llm_service.generate_summary(pdf_data["text"])
        
        return SummaryResponse(**summary_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate summary: {str(e)}"
        )
