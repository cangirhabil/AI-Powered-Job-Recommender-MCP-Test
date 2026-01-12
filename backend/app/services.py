import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
import google.generativeai as genai
from apify_client import ApifyClient

load_dotenv()

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


