"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Search, Zap, CheckCircle2, Map, Layout, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeResume, fetchJobs, AnalysisResponse, JobsResponse } from "@/lib/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="min-h-screen p-4 md:p-8 text-white relative">
      <Toaster position="top-center" richColors />
      
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto py-12 md:py-20 flex flex-col items-center text-center space-y-6">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          AI Job Recommender
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-300 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Upload your resume and let our AI analyze your skills, find gaps, and recommend the best career path and jobs for you.
        </motion.p>

        {/* Upload Area */}
        <motion.div 
          className="w-full max-w-xl mt-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass-dark border-dashed border-2 border-white/10 hover:border-white/20 transition-all p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
              <Upload className="text-blue-400 w-8 h-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl text-white">Upload Your Resume</CardTitle>
              <CardDescription className="text-gray-400">PDF format recommended (Max 5MB)</CardDescription>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".pdf" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <div className="w-full space-y-4">
              <Button 
                variant="outline" 
                type="button"
                className="w-full h-12 border-white/20 hover:bg-white/5 transition-all text-white"
                onClick={triggerFileInput}
              >
                <div className="flex items-center gap-2 overflow-hidden px-2">
                  <FileText className="shrink-0 w-4 h-4 text-blue-400" />
                  <span className="truncate uppercase font-semibold tracking-wide">
                    {file ? file.name : "Select File"}
                  </span>
                </div>
              </Button>
              <Button 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                disabled={!file || analyzing}
                onClick={handleUpload}
              >
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  "Start AI Analysis"
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {analysis && (
          <motion.section 
            className="max-w-6xl mx-auto py-12 space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-dark border-white/10">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-white">Summary</CardTitle>
                    <CardDescription className="text-gray-400">Resume overview</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-200 leading-relaxed text-sm">
                  {analysis.summary}
                </CardContent>
              </Card>

              <Card className="glass-dark border-white/10">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                    <Zap size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-white">Skill Gaps</CardTitle>
                    <CardDescription className="text-gray-400">Areas to improve</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-200 leading-relaxed text-sm">
                  {analysis.gaps}
                </CardContent>
              </Card>

              <Card className="glass-dark border-white/10">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Map size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-white">Roadmap</CardTitle>
                    <CardDescription className="text-gray-400">Career pathing</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-200 leading-relaxed text-sm">
                  {analysis.roadmap}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-center space-y-6 pt-8">
              <div className="flex flex-wrap justify-center gap-2">
                {analysis.keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/10 text-white border-none px-3 py-1">
                    {kw}
                  </Badge>
                ))}
              </div>
              <Button 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                onClick={handleGetJobs}
                disabled={fetchingJobs}
              >
                {fetchingJobs ? "Scraping Jobs..." : "🔎 Get Job Recommendations"}
              </Button>
            </div>

            {/* Jobs Display */}
            {jobs && (
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                  <h3 className="text-2xl font-bold text-white mb-6">Recommended Jobs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.linkedin.map((job, i) => (
                        <JobCard key={i} job={job} source="LinkedIn" />
                    ))}
                  </div>
              </motion.div>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

function JobCard({ job, source }: { job: any, source: string }) {
    return (
        <Card className="glass-dark border-white/10 hover:bg-white/5 transition-all flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge className="mb-2 bg-blue-500/20 text-blue-300 border-none">{source}</Badge>
                </div>
                <CardTitle className="text-lg text-white font-bold leading-tight">{job.title}</CardTitle>
                <CardDescription className="text-gray-400 font-medium">
                    {job.companyName || job.company}
                </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col gap-4">
                <div className="flex items-center text-sm text-gray-400">
                    <Layout className="w-4 h-4 mr-2" />
                    {job.location || "Remote / India"}
                </div>
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 text-white" asChild>
                    <a href={job.link || job.url} target="_blank" rel="noopener noreferrer">
                        View Position <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}
