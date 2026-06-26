from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.llm_service import LLMService

router = APIRouter(prefix="/compare", tags=["Comparison"])
llm_service = LLMService()

class PaperSummaryModel(BaseModel):
    executiveSummary: str
    problemStatement: str
    methodology: str
    datasetUsed: str
    results: str
    limitations: str
    futureWork: str
    conclusion: str

class PaperCompareInput(BaseModel):
    id: str
    title: str
    summary: PaperSummaryModel

class CompareRequest(BaseModel):
    papers: List[PaperCompareInput]

@router.post("")
async def compare_papers(request: CompareRequest):
    """
    Compare multiple research papers using their cached summaries.
    Returns a structured comparison matrix in JSON format.
    """
    if len(request.papers) < 2:
        raise HTTPException(
            status_code=400, 
            detail="At least 2 papers must be selected for comparison."
        )
        
    try:
        # Transform inputs into basic dicts for LLM prompt context
        papers_data = []
        for paper in request.papers:
            papers_data.append({
                "id": paper.id,
                "title": paper.title,
                "summary": paper.summary.model_dump()
            })
            
        comparison_matrix = llm_service.compare_papers(papers_data)
        return comparison_matrix
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate comparison matrix: {str(e)}"
        )
