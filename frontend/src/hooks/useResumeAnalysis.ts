import { useState } from "react";
import { toast } from "sonner";
import { analyzeResume, fetchJobs, AnalysisResponse, JobsResponse } from "@/lib/api";

export function useResumeAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [jobs, setJobs] = useState<JobsResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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

    try {
      const result = await analyzeResume(file);
      setAnalysis(result);
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
      const keywords = analysis.keywords.join(", ");
      const jobResults = await fetchJobs(keywords);
      setJobs(jobResults);
      toast.success("Job recommendations updated!");
    } catch (error) {
      console.error(error);
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
    setFile,
    handleFileChange,
    handleUpload,
    handleGetJobs,
  };
}
