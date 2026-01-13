import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
import google.generativeai as genai
from apify_client import ApifyClient

from pathlib import Path
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
# We don't need a persistent client object like OpenAI, but we can define the model
model = genai.GenerativeModel('gemini-3-flash-preview') if GEMINI_API_KEY else None

# Initialize Apify Client
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
apify_client = ApifyClient(APIFY_API_TOKEN) if APIFY_API_TOKEN else None

def extract_text_from_pdf(pdf_content):
    """Extracts text from PDF bytes."""
    doc = fitz.open(stream=pdf_content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def ask_gemini(prompt, max_tokens=500):
    """Sends a prompt to Gemini and returns the response."""
    if not model:
        return "Gemini API Key is missing."
    
    try:
        # Configure safety settings to be less restrictive for resume analysis
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.5,
            ),
            safety_settings=safety_settings
        )
        
        # Check if response has valid candidates
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            
            # Check finish reason
            # 1 = STOP (normal), 2 = MAX_TOKENS, 3 = SAFETY, 4 = RECITATION, 5 = OTHER
            if candidate.finish_reason == 2:
                # MAX_TOKENS - content was truncated
                if candidate.content and candidate.content.parts:
                    return candidate.content.parts[0].text + "..."
            elif candidate.finish_reason in [3, 4, 5]:
                # SAFETY, RECITATION, or OTHER block
                return "Content could not be generated. Please try again."
            
            # Normal response
            if candidate.content and candidate.content.parts:
                return candidate.content.parts[0].text
        
        # Fallback - try response.text
        return response.text
        
    except Exception as e:
        print(f"Gemini error: {str(e)}")
        return f"Analysis temporarily unavailable. Please try again."

def fetch_linkedin_jobs(search_query, location="Türkiye", rows=10):
    """Fetches jobs from LinkedIn via Apify."""
    if not apify_client:
        print("WARNING: Apify client not initialized - APIFY_API_TOKEN missing")
        return []
    
    try:
        print(f"\n=== LinkedIn Job Search ===")
        print(f"Search Query: '{search_query}'")
        print(f"Location: '{location}'")
        print(f"Requested rows: {rows}")
        
        run_input = {
            "title": search_query,
            "location": location,
            "rows": rows,
            "proxy": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"],
            }
        }
        
        print(f"Calling Apify actor with input: {run_input}")
        run = apify_client.actor("BHzefUZlZRKWxkTck").call(run_input=run_input)
        jobs = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
        
        # Ensure we return maximum 10 jobs
        jobs = jobs[:10]
        
        print(f"✓ Successfully fetched {len(jobs)} jobs")
        if len(jobs) == 0:
            print("WARNING: No jobs found! This might be because:")
            print("  - The search query is too specific or contains technical jargon")
            print("  - The location is too restrictive")
            print("  - LinkedIn has no matching results")
            print(f"  - Try simplifying the search query: '{search_query}'")
        else:
            print(f"Sample job titles: {[job.get('title', 'N/A')[:50] for job in jobs[:3]]}")
        
        return jobs
    except Exception as e:
        print(f"✗ Error fetching LinkedIn jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def analyze_summary(resume_text):
    """Analyzes resume and returns an executive summary."""
    prompt = f"""Analyze this resume and provide a comprehensive executive summary. Include:
1. Professional Profile (role, experience level, specializations)
2. Education (institution, degree, GPA if available)
3. Key Technical Skills
4. Notable Projects and Achievements
5. Work Experience highlights

Be thorough and complete. Do not cut off mid-sentence.

Resume:
{resume_text}"""
    return ask_gemini(prompt, max_tokens=2000)

def analyze_gaps(resume_text):
    """Analyzes resume and identifies gaps."""
    prompt = f"""Analyze this resume and identify gaps that could be improved for better job opportunities. Include:
1. Missing technical skills for the target role
2. Certifications that would strengthen the profile
3. Experience gaps (leadership, team size, project scale)
4. Soft skills that could be highlighted
5. Portfolio/GitHub/online presence improvements

Provide actionable recommendations. Be thorough and complete.

Resume:
{resume_text}"""
    return ask_gemini(prompt, max_tokens=1500)

def analyze_roadmap(resume_text):
    """Creates a career roadmap based on resume."""
    prompt = f"""Based on this resume, create a strategic career roadmap for the next 1-2 years. Include:
1. Short-term goals (0-6 months): Skills to learn immediately
2. Medium-term goals (6-12 months): Certifications and projects
3. Long-term goals (1-2 years): Career positioning and industry exposure
4. Recommended learning resources and platforms
5. Networking and community engagement suggestions

Be specific and actionable. Complete all sections.

Resume:
{resume_text}"""
    return ask_gemini(prompt, max_tokens=1500)

def analyze_keywords(resume_text, summary_text=None):
    """Suggests job search keywords based on resume."""
    if not summary_text:
        # If no summary provided, use first 2000 chars of resume as context
        summary_text = resume_text[:2000]

    prompt = f"""Based on this resume, suggest the best job search keywords.

CRITICAL: Return ONLY a valid JSON array of strings. No explanation, no markdown, just the JSON array.
Example format: ["Software Engineer", "Full Stack Developer", "Python Developer", "Machine Learning", "React"]

IMPORTANT: 
- The FIRST 3-5 items MUST be actual job titles (e.g., "Software Engineer", "Backend Developer")
- **PRIORITY ORDERING:** You MUST order these job titles based on the candidate's STRONGEST profile match. 
  - If the resume is AI-heavy, "AI Engineer" or "Machine Learning Engineer" MUST be first.
  - If the resume is Full Stack heavy, "Full Stack Developer" MUST be first.
  - The most relevant and senior-appropriate role should be at the very top.
  - Be specific: if the user is a Junior, put "Junior..." titles.
- Job titles should be searchable on LinkedIn
- After job titles, you can include key technologies (prioritize the most relevant ones)
- Avoid overly specific technical jargon that wouldn't be used in job titles
- Maximum 10-12 keywords total

Resume Summary:
{summary_text}"""
    
    keywords_raw = ask_gemini(prompt, max_tokens=1000)
    
    import json
    # Parse JSON keywords
    try:
        # Try to extract JSON array from response
        keywords_raw = keywords_raw.strip()
        # Remove markdown code blocks if present
        if keywords_raw.startswith("```"):
            keywords_raw = keywords_raw.split("```")[1]
            if keywords_raw.startswith("json"):
                keywords_raw = keywords_raw[4:]
        keywords_raw = keywords_raw.strip()
        
        keywords = json.loads(keywords_raw)
        if not isinstance(keywords, list):
            keywords = [str(keywords)]
    except json.JSONDecodeError:
        # Fallback: split by comma or newline
        if "," in keywords_raw:
            keywords = [k.strip().strip('"').strip("'") for k in keywords_raw.split(",") if k.strip()]
        else:
            keywords = [k.strip().strip('"').strip("'") for k in keywords_raw.split("\n") if k.strip()]
            
    # Clean up keywords
    keywords = [k for k in keywords if k and len(k) > 2 and not k.startswith("[")]
    return keywords
