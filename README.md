# AI-Powered Job Recommender

An AI-driven platform that analyzes resumes, identifies skill gaps, and recommends relevant jobs from LinkedIn and Naukri.

## 🚀 Built With

- **Frontend:** Next.js, React, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend:** FastAPI (Python), Google Gemini API (gemini-3-flash-preview), Apify (LinkedIn/Naukri Scrapers).
- **Core Features:** PDF Resume Analysis, Career Roadmap Generation, Automated Job Fetching.

## 🛠️ Getting Started

### Prerequisites

You need the following API keys in `backend/app/.env`:

```env
GEMINI_API_KEY=your_gemini_key
APIFY_API_TOKEN=your_apify_token
```

### Installation & Run

#### 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API running at: `http://localhost:8000`

#### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
App running at: `http://localhost:3000`

## 📂 Project Structure

- `backend/`: FastAPI application and AI services.
- `frontend/`: Next.js web interface.
- `lab/`: Experimental scripts for API testing.
- `README.md`: Project documentation.
- `.gitignore`: Files excluded from Git.
