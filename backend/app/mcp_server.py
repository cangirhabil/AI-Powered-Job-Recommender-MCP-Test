from mcp.server.fastmcp import FastMCP
from typing import List
try:
    from .services import (
        extract_text_from_pdf, 
        ask_gemini, 
        fetch_linkedin_jobs, 
        analyze_summary,
        analyze_gaps,
        analyze_roadmap,
        analyze_keywords
    )
except ImportError:
    from services import (
        extract_text_from_pdf, 
        ask_gemini, 
        fetch_linkedin_jobs, 
        analyze_summary,
        analyze_gaps,
        analyze_roadmap,
        analyze_keywords
    )
import json

# Initialize FastMCP server
mcp = FastMCP("Job Recommender MCP Server")

@mcp.tool()
def parse_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from a PDF file.
    Args:
        pdf_bytes: The raw bytes of the PDF file.
    Returns:
        The extracted text from the PDF.
    """
    return extract_text_from_pdf(pdf_bytes)

@mcp.tool()
def analyze_resume_text(text: str, aspect: str) -> str:
    """
    Analyzes a resume text for a specific aspect using Gemini.
    Args:
        text: The text content of the resume.
        aspect: The aspect to analyze. Can be 'summary', 'gaps', 'roadmap', or 'keywords'.
    Returns:
        The analysis result for the requested aspect.
    """
    if aspect == 'summary':
        return analyze_summary(text)

    elif aspect == 'gaps':
        return analyze_gaps(text)

    elif aspect == 'roadmap':
        return analyze_roadmap(text)
    
    elif aspect == 'keywords':
        # Keywords service returns a list, but tool description says str. 
        # But we previously returned whatever ask_gemini returned (str).
        # We can return JSON string for consistency with MCP text-based nature.
        keywords = analyze_keywords(text)
        return json.dumps(keywords)

    else:
        return f"Unknown aspect: {aspect}"

@mcp.tool()
def get_job_recommendations(keywords: str, location: str = "Türkiye") -> List[dict]:
    """
    Fetches job recommendations from LinkedIn based on keywords and location.
    Args:
        keywords: Job search keywords.
        location: Location for the job search (default: "Türkiye").
    Returns:
        A list of job dictionaries.
    """
    return fetch_linkedin_jobs(keywords, location=location, rows=10)
