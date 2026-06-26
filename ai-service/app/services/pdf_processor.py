import fitz  # PyMuPDF
import re
from typing import Dict, Any, List

class PDFProcessor:
    @staticmethod
    def extract_text_and_metadata(file_path: str) -> Dict[str, Any]:
        """
        Extract text and metadata (title, authors, DOI) from PDF file.
        """
        doc = fitz.open(file_path)
        
        # 1. Extract raw text page by page
        pages_text = []
        for page in doc:
            pages_text.append(page.get_text())
            
        full_text = "\n".join(pages_text)
        
        # 2. Extract standard PDF metadata
        pdf_metadata = doc.metadata or {}
        
        # 3. Detect Title (heuristic: largest font size on page 1, or fall back to metadata)
        title = PDFProcessor._detect_title(doc, pdf_metadata)
        
        # 4. Detect Authors (heuristic: text blocks below title on page 1, or metadata)
        authors = PDFProcessor._detect_authors(doc, pdf_metadata, title)
        
        # 5. Extract DOI using regex
        doi = PDFProcessor._extract_doi(full_text)
        
        return {
            "title": title,
            "authors": authors,
            "doi": doi,
            "text": full_text,
            "page_count": len(doc),
            "pdf_metadata": pdf_metadata
        }

    @staticmethod
    def _detect_title(doc: fitz.Document, metadata: Dict[str, Any]) -> str:
        """
        Detect paper title by analyzing the first page text layout.
        """
        # Try metadata title first if it is set and doesn't look like a filename
        meta_title = metadata.get("title", "").strip()
        if meta_title and not meta_title.endswith(".pdf") and len(meta_title) > 5:
            return meta_title
            
        if len(doc) == 0:
            return "Untitled Document"
            
        # Analyze first page layout
        first_page = doc[0]
        blocks = first_page.get_text("dict")["blocks"]
        
        largest_font = 0
        title_text = ""
        
        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    # Ignore lines with page numbers or tiny sizes
                    if span["size"] > largest_font and len(span["text"].strip()) > 3:
                        largest_font = span["size"]
                        title_text = span["text"].strip()
                    elif abs(span["size"] - largest_font) < 1.0 and len(span["text"].strip()) > 0:
                        # Append text in case title spans multiple lines
                        title_text += " " + span["text"].strip()

        # Clean title text
        title_text = re.sub(r'\s+', ' ', title_text).strip()
        if len(title_text) > 4:
            return title_text
            
        return meta_title or "Untitled Research Paper"

    @staticmethod
    def _detect_authors(doc: fitz.Document, metadata: Dict[str, Any], title: str) -> List[str]:
        """
        Detect authors from the first page or metadata.
        """
        meta_author = metadata.get("author", "").strip()
        if meta_author:
            # Split standard author separators
            authors = re.split(r',|;|and', meta_author)
            authors = [a.strip() for a in authors if a.strip()]
            if authors:
                return authors
                
        if len(doc) == 0:
            return ["Unknown Author"]
            
        # Look for text blocks near the top that aren't the title
        first_page = doc[0]
        text_instances = first_page.get_text("blocks")
        
        # Sort blocks by vertical position (y coordinate)
        text_instances = sorted(text_instances, key=lambda x: x[1])
        
        author_candidates = []
        title_found = False
        
        for block in text_instances:
            text = block[4].strip()
            # If the block contains title keywords, skip it
            if title.lower() in text.lower() or len(text) < 3:
                title_found = True
                continue
                
            # Usually authors come shortly after title (within first page)
            if title_found:
                # Filter out obvious institutions or abstracts
                if "abstract" in text.lower() or "introduction" in text.lower() or "arxiv" in text.lower():
                    break
                # Replace line breaks with spaces
                text_clean = re.sub(r'\n', ' ', text)
                # Split by commas or and
                parts = re.split(r',|and|;', text_clean)
                for part in parts:
                    part_clean = part.strip()
                    # Author names usually don't have digits, emails, or urls, and are relatively short (2-4 words)
                    if (len(part_clean.split()) <= 4 and 
                        not any(char.isdigit() for char in part_clean) and 
                        "@" not in part_clean and 
                        "http" not in part_clean and
                        len(part_clean) > 3):
                        author_candidates.append(part_clean)
                if author_candidates:
                    break
                    
        if author_candidates:
            return author_candidates
            
        return ["Unknown Author"]

    @staticmethod
    def _extract_doi(text: str) -> str:
        """
        Extract Digital Object Identifier (DOI) from paper text.
        """
        # Common DOI regex pattern
        doi_pattern = r'\b(10\.\d{4,9}/[-._;()/:A-Z0-9]+)\b'
        match = re.search(doi_pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
        return ""
