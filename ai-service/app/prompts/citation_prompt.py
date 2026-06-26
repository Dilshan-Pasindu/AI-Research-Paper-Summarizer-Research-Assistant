CITATION_PROMPT_TEMPLATE = """
You are an academic parser. Read the research paper text and extract a list of references/citations mentioned in the paper text.

Your response must be a valid, parseable JSON array of objects, with no markdown styling (do not use ```json ... ```), just the raw JSON text.

Each object in the array must contain:
- "text": The citation text itself as cited in the paper (e.g., "[1]" or "Smith et al. (2020)" or "Vaswani et al., 2017").
- "context": The sentence or phrase in the paper where this citation is referenced.
- "authors": A list of author names (if available).
- "year": The publication year (integer, or null if not available).

Extract up to 15 of the most significant citations found in the text.

Paper Text:
{paper_text}

JSON Output:
"""
