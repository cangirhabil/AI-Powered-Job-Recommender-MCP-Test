import { useState } from "react";
import { toast } from "sonner";
import { analyzeResumeStream, fetchJobs, AnalysisResponse, JobsResponse, AnalysisStep, StreamEvent } from "@/lib/api";

export interface AnalysisProgress {
  currentStep: AnalysisStep | null;
  completedSteps: AnalysisStep[];
  isProcessing: boolean;
}

export function useResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress>({
    currentStep: null,
    completedSteps: [],
    isProcessing: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStepUpdate = (event: StreamEvent) => {
    if (event.status === 'processing') {
      setProgress(prev => ({
        ...prev,
        currentStep: event.step,
        isProcessing: true,
      }));
    } else if (event.status === 'complete' && event.step !== 'done') {
      setProgress(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, event.step],
        isProcessing: false,
      }));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setJobs(null);
    setProgress({
      currentStep: null,
      completedSteps: [],
      isProcessing: false,
    });

    try {
      const result = await analyzeResumeStream(file, handleStepUpdate);
      setAnalysis(result);
      setProgress(prev => ({
        ...prev,
        currentStep: 'done',
        isProcessing: false,
      }));
      toast.success("Resume analyzed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error analyzing resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGetJobs = async () => {
    if (!analysis) return;

    setFetchingJobs(true);
    try {
      // Take only the first 3 keywords, which are typically job titles
      // Avoid technical terms like "LangChain", "RAG", etc. which don't work well in job searches
      const jobTitles = analysis.keywords.slice(0, 3);
      const keywords = jobTitles.join(", ");
      
      console.log("Original keywords:", analysis.keywords);
      console.log("Job titles for search:", jobTitles);
      console.log("Search query:", keywords);
      
      const jobResults = await fetchJobs(keywords);
      console.log("Job results:", jobResults);
      setJobs(jobResults);
      toast.success("Job recommendations updated!");
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Error fetching jobs. Please try again.");
    } finally {
      setFetchingJobs(false);
    }
  };

  return {
    file,
    analyzing,
    fetchingJobs,
    analysis,
    jobs,
    progress,
    setFile,
    handleFileChange,
    handleUpload,
    handleGetJobs,
  };
}
