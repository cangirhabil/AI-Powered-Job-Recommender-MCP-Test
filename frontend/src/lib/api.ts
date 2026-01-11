const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AnalysisResponse {
  summary: string;
  gaps: string;
  roadmap: string;
  keywords: string[];
}

export interface Job {
  title: string;
  companyName?: string;
  location?: string;
  link?: string;
  url?: string;
}

export interface JobsResponse {
  linkedin: Job[];
}

export const analyzeResume = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/analyze-resume`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze resume");
  }

  return response.json();
};

export const fetchJobs = async (keywords: string): Promise<JobsResponse> => {
  const response = await fetch(`${API_URL}/fetch-jobs?keywords=${encodeURIComponent(keywords)}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
};
