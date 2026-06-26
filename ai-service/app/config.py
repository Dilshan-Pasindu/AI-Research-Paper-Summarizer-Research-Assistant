import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CHROMA_DB_DIR: str = os.getenv("CHROMA_DB_DIR", "./chromadb_storage")
    EMBEDDINGS_MODEL_NAME: str = os.getenv("EMBEDDINGS_MODEL_NAME", "all-MiniLM-L6-v2")
    PORT: int = int(os.getenv("AI_PORT", 8000))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
