from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import process, summary, chat, compare
from app.config import settings

app = FastAPI(
    title="AI Research Paper Summarizer - AI Service",
    description="Python microservice powered by LangChain and Google Gemini for processing papers, running RAG search, and extracting citations.",
    version="1.0.0"
)

# Enable CORS for cross-container communication and local dev testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(process.router)
app.include_router(summary.router)
app.include_router(chat.router)
app.include_router(compare.router)

@app.get("/", tags=["Health"])
async def root_health():
    """
    Service health check endpoint.
    """
    return {
        "status": "online",
        "service": "AI Research Paper Summarizer Service",
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }
