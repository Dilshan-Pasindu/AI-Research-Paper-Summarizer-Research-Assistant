SUMMARY_PROMPT_TEMPLATE = """
You are an expert research assistant. Read the provided research paper text and extract the key information into a highly structured JSON format. 

Your response must be a valid, parseable JSON object with EXACTLY the following keys. Do not include markdown code block syntax (like ```json ... ```) in your raw response, just output the JSON string itself.

JSON Format:
{{
  "executiveSummary": "A concise executive summary of the paper (200-300 words).",
  "problemStatement": "Clearly define the research problem or question this paper addresses.",
  "methodology": "Detail the methodology, framework, algorithms, or techniques used in the research.",
  "datasetUsed": "Describe the datasets used, if any. If no dataset is used, write 'None specified'.",
  "results": "Detail the findings, outcomes, performance metrics, and results obtained.",
  "limitations": "Identify the limitations of the methodology or study mentioned in the paper.",
  "futureWork": "Outline any proposed future research directions or work mentioned by the authors.",
  "conclusion": "A summary of the overall conclusion and impact of the research."
}}

Research Paper Text:
{paper_text}

JSON Output:
"""
