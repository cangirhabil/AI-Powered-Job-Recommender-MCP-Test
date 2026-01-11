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
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.5,
            )
        )
        return response.text
    except Exception as e:
        return f"Error calling Gemini: {str(e)}"

def fetch_linkedin_jobs(search_query, location="india", rows=10):
    """Fetches jobs from LinkedIn via Apify."""
    if not apify_client:
        return []
    
    run_input = {
        "title": search_query,
        "location": location,
        "rows": rows,
        "proxy": {
            "useApifyProxy": True,
            "apifyProxyGroups": ["RESIDENTIAL"],
        }
    }
    run = apify_client.actor("BHzefUZlZRKWxkTck").call(run_input=run_input)
    jobs = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
    return jobs


