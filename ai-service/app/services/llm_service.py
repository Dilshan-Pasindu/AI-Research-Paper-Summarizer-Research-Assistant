import json
import re
from typing import Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from app.config import settings
from app.prompts.summary_prompt import SUMMARY_PROMPT_TEMPLATE
from app.prompts.chat_prompt import CHAT_PROMPT_TEMPLATE
from app.prompts.citation_prompt import CITATION_PROMPT_TEMPLATE
from app.prompts.comparison_prompt import COMPARISON_PROMPT_TEMPLATE

class LLMService:
    def __init__(self):
        # We use gemini-1.5-flash for faster responses
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2
        )

    def generate_summary(self, paper_text: str) -> Dict[str, Any]:
        """
        Generate structured summary fields using Gemini.
        """
        # Limit paper text to avoid exceeding model context limits (e.g. first 30,000 characters)
        trimmed_text = paper_text[:35000]
        prompt = PromptTemplate.from_template(SUMMARY_PROMPT_TEMPLATE)
        chain = prompt | self.llm
        
        response = chain.invoke({"paper_text": trimmed_text})
        
        try:
            return self._clean_and_parse_json(response.content)
        except Exception as e:
            # Fallback structure in case of parsing failures
            return {
                "executiveSummary": "Error parsing LLM summary response. " + str(e),
                "problemStatement": "Could not extract",
                "methodology": "Could not extract",
                "datasetUsed": "None specified",
                "results": "Could not extract",
                "limitations": "Could not extract",
                "futureWork": "Could not extract",
                "conclusion": response.content[:1000]
            }

    def answer_question(self, context: str, question: str, chat_history: str) -> str:
        """
        Answer a question about a paper using retrieved context.
        """
        prompt = PromptTemplate.from_template(CHAT_PROMPT_TEMPLATE)
        chain = prompt | self.llm
        
        response = chain.invoke({
            "context": context,
            "question": question,
            "chat_history": chat_history
        })
        return response.content

    def extract_citations(self, paper_text: str) -> List[Dict[str, Any]]:
        """
        Extract scientific citations from the text.
        """
        # Take a slice of the text, focusing on the bibliography and general introduction
        # usually citations appear throughout, but full list is at references page.
        # Let's extract references part if it's there, otherwise get middle-end blocks
        ref_keywords = ["references", "bibliography", "works cited"]
        ref_index = -1
        for kw in ref_keywords:
            ref_index = paper_text.lower().rfind(kw)
            if ref_index != -1:
                break
                
        if ref_index != -1:
            snippet = paper_text[ref_index:ref_index + 20000]
        else:
            snippet = paper_text[-15000:]
            
        prompt = PromptTemplate.from_template(CITATION_PROMPT_TEMPLATE)
        chain = prompt | self.llm
        
        response = chain.invoke({"paper_text": snippet})
        
        try:
            return self._clean_and_parse_json(response.content)
        except:
            return []

    def compare_papers(self, papers_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate a comparison matrix of several papers.
        """
        papers_summary_data = []
        for paper in papers_list:
            papers_summary_data.append({
                "id": paper.get("id"),
                "title": paper.get("title"),
                "summary": paper.get("summary") # passes summary columns
            })
            
        prompt = PromptTemplate.from_template(COMPARISON_PROMPT_TEMPLATE)
        chain = prompt | self.llm
        
        response = chain.invoke({"papers_data": json.dumps(papers_summary_data, indent=2)})
        
        try:
            return self._clean_and_parse_json(response.content)
        except:
            # Fallback empty list
            return []

    def _clean_and_parse_json(self, content: Any) -> Any:
        """
        Utility method to extract and parse JSON from string. Handles cases where the model
        includes markdown block tags.
        """
        if not isinstance(content, str):
            content = str(content)
            
        # Strip code blocks
        clean_text = content.strip()
        if clean_text.startswith("```"):
            clean_text = re.sub(r"^```(?:json)?\n", "", clean_text)
            clean_text = re.sub(r"\n```$", "", clean_text)
            clean_text = clean_text.strip()
            
        return json.loads(clean_text)
