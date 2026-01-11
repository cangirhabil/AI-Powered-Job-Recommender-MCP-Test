from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from .services import (
    extract_text_from_pdf, 
    ask_gemini, 
    fetch_linkedin_jobs
)
import pydantic

app = FastAPI(title="AI Job Recommender API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisResponse(pydantic.BaseModel):
    summary: str
    gaps: str
    roadmap: str
    keywords: List[str]

@app.post("/analyze-resume", response_model=AnalysisResponse)
async def analyze_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await file.read()
        resume_text = extract_text_from_pdf(content)
        
        # 1. Summary
        summary = ask_gemini(f"Summarize this resume highlighting the skills, education, and experience: \n\n{resume_text}", max_tokens=500)
        
        # 2. Gaps
        gaps = ask_gemini(f"Analyze this resume and highlight missing skills, certifications, and experiences needed for better job opportunities: \n\n{resume_text}", max_tokens=400)
        
        # 3. Roadmap
        roadmap = ask_gemini(f"Based on this resume, suggest a future roadmap to improve this person's career prospects (Skill to learn, certification needed, industry exposure): \n\n{resume_text}", max_tokens=400)
        
        # 4. Keywords for job search
        keywords_raw = ask_gemini(
            f"Based on this resume summary, suggest the best job titles and keywords for searching jobs. Give a comma-separated list only, no explanation.\n\nSummary: {summary}",
            max_tokens=100
        )
        keywords = [k.strip() for k in keywords_raw.split(",") if k.strip()]

        return {
            "summary": summary,
            "gaps": gaps,
            "roadmap": roadmap,
            "keywords": keywords
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fetch-jobs")
async def get_jobs(keywords: str, location: str = "india"):
    try:
        # Fetching fewer jobs for speed in demo/dev
        linkedin_jobs = fetch_linkedin_jobs(keywords, location=location, rows=10)
        
        return {
            "linkedin": linkedin_jobs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "AI Job Recommender API is running"}
