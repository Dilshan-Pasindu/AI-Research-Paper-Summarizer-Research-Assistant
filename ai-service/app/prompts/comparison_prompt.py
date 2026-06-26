COMPARISON_PROMPT_TEMPLATE = """
You are a senior research committee reviewer. You are given a list of papers, each represented by its title and summary information.
Compare them across the following criteria:
1. Research Problem
2. Methodology
3. Dataset Used
4. Results
5. Strengths
6. Weaknesses

Your response must be a valid, parseable JSON array of objects, with no markdown styling (do not use ```json ... ```), just the raw JSON text.

Each object in the array represents a paper and must have the following structure:
{{
  "id": "The paper ID or unique identifier passed in the input",
  "title": "The title of the paper",
  "researchProblem": "A summary of the research problem addressed (1-2 sentences)",
  "methodology": "Summary of the methodology (1-2 sentences)",
  "dataset": "Datasets used (1 sentence)",
  "results": "Key results (1-2 sentences)",
  "strengths": "Main strengths (bullet points or short sentence)",
  "weaknesses": "Main limitations/weaknesses (bullet points or short sentence)"
}}

Input Papers:
{papers_data}

JSON Output:
"""
