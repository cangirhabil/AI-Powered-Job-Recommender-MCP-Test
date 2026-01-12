from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional
import json
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

@app.post("/analyze-resume")
async def analyze_resume_stream(file: UploadFile = File(...)):
    """
    Streaming endpoint that sends SSE events as each analysis step completes.
    Each event contains the step name and result.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    content = await file.read()
    resume_text = extract_text_from_pdf(content)
    
    def generate_analysis():
        results = {}
        
        # Step 1: Summary
        yield f"data: {json.dumps({'step': 'summary', 'status': 'processing'})}\n\n"
        summary = ask_gemini(
            f"""Analyze this resume and provide a comprehensive executive summary. Include:
1. Professional Profile (role, experience level, specializations)
2. Education (institution, degree, GPA if available)
3. Key Technical Skills
4. Notable Projects and Achievements
5. Work Experience highlights

Be thorough and complete. Do not cut off mid-sentence.

Resume:
{resume_text}""", 
            max_tokens=2000
        )
        results['summary'] = summary
        yield f"data: {json.dumps({'step': 'summary', 'status': 'complete', 'data': summary})}\n\n"
        
        # Step 2: Gaps
        yield f"data: {json.dumps({'step': 'gaps', 'status': 'processing'})}\n\n"
        gaps = ask_gemini(
            f"""Analyze this resume and identify gaps that could be improved for better job opportunities. Include:
1. Missing technical skills for the target role
2. Certifications that would strengthen the profile
3. Experience gaps (leadership, team size, project scale)
4. Soft skills that could be highlighted
5. Portfolio/GitHub/online presence improvements

Provide actionable recommendations. Be thorough and complete.

Resume:
{resume_text}""", 
            max_tokens=1500
        )
        results['gaps'] = gaps
        yield f"data: {json.dumps({'step': 'gaps', 'status': 'complete', 'data': gaps})}\n\n"
        
        # Step 3: Roadmap  
        yield f"data: {json.dumps({'step': 'roadmap', 'status': 'processing'})}\n\n"
        roadmap = ask_gemini(
            f"""Based on this resume, create a strategic career roadmap for the next 1-2 years. Include:
1. Short-term goals (0-6 months): Skills to learn immediately
2. Medium-term goals (6-12 months): Certifications and projects
3. Long-term goals (1-2 years): Career positioning and industry exposure
4. Recommended learning resources and platforms
5. Networking and community engagement suggestions

Be specific and actionable. Complete all sections.

Resume:
{resume_text}""", 
            max_tokens=1500
        )
        results['roadmap'] = roadmap
        yield f"data: {json.dumps({'step': 'roadmap', 'status': 'complete', 'data': roadmap})}\n\n"
        
        # Step 4: Keywords - JSON format for easier parsing
        yield f"data: {json.dumps({'step': 'keywords', 'status': 'processing'})}\n\n"
        keywords_raw = ask_gemini(
            f"""Based on this resume, suggest the best job search keywords.

CRITICAL: Return ONLY a valid JSON array of strings. No explanation, no markdown, just the JSON array.
Example format: ["Software Engineer", "Full Stack Developer", "Python Developer", "Machine Learning", "React"]

IMPORTANT: 
- The FIRST 3-5 items MUST be actual job titles (e.g., "Software Engineer", "Backend Developer")
- Job titles should be searchable on LinkedIn
- After job titles, you can include key technologies
- Avoid overly specific technical jargon that wouldn't be used in job titles
- Maximum 10-12 keywords total

Resume Summary:
{summary}""",
            max_tokens=1000
        )
        
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
        results['keywords'] = keywords
        yield f"data: {json.dumps({'step': 'keywords', 'status': 'complete', 'data': keywords})}\n\n"
        
        # Final complete event with all data
        yield f"data: {json.dumps({'step': 'done', 'status': 'complete', 'data': results})}\n\n"
    
    return StreamingResponse(
        generate_analysis(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/fetch-jobs")
async def get_jobs(keywords: str, location: str = "Türkiye"):
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
