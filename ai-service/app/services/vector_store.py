import os
from typing import List
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.config import settings

class VectorStoreManager:
    def __init__(self):
        # Initialize embeddings model (runs CPU-only by default)
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDINGS_MODEL_NAME,
            cache_folder=os.path.join(settings.CHROMA_DB_DIR, "embeddings_cache")
        )
        # Load or create ChromaDB client
        self.db_dir = os.path.join(settings.CHROMA_DB_DIR, "chroma")
        os.makedirs(self.db_dir, exist_ok=True)
        
        # We initialize Chroma with a default client
        self.vector_store = Chroma(
            persist_directory=self.db_dir,
            embedding_function=self.embeddings,
            collection_name="papers_collection"
        )

    def add_paper(self, paper_id: str, text: str) -> None:
        """
        Split paper text into chunks, generate embeddings, and store them in ChromaDB.
        """
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        
        chunks = text_splitter.split_text(text)
        documents = []
        
        for idx, chunk in enumerate(chunks):
            doc = Document(
                page_content=chunk,
                metadata={
                    "paper_id": paper_id,
                    "chunk_id": f"{paper_id}_{idx}"
                }
            )
            documents.append(doc)
            
        # Add to collection
        self.vector_store.add_documents(documents)

    def query_paper(self, paper_id: str, query: str, k: int = 5) -> List[Document]:
        """
        Query vector store for similarity match restricted to a specific paper.
        """
        # Filter matching paper_id
        search_filter = {"paper_id": paper_id}
        
        results = self.vector_store.similarity_search(
            query,
            k=k,
            filter=search_filter
        )
        return results

    def delete_paper(self, paper_id: str) -> None:
        """
        Delete all chunks and vectors associated with a paper.
        """
        # ChromaDB supports deleting by metadata filters or IDs.
        # We retrieve the ids first and delete them, or delete using standard Chroma client API
        collection = self.vector_store._collection
        collection.delete(where={"paper_id": paper_id})
