"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Map, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResponse, JobsResponse } from "@/lib/api";
import { JobResults } from "@/components/home/JobResults";

interface AnalysisDashboardProps {
  analysis: AnalysisResponse;
  jobs: JobsResponse | null;
  fetchingJobs: boolean;
  onGetJobs: () => void;
}

export function AnalysisDashboard({
  analysis,
  jobs,
  fetchingJobs,
  onGetJobs
}: AnalysisDashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-12 pb-24"
    >
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Summary - Spans 8 cols */}
        <div className="lg:col-span-8 group">
          <Card className="glass-panel h-full border-white/5 hover:border-primary/20 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
                 <CardTitle className="text-xl">Executive Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              {analysis.summary}
            </CardContent>
          </Card>
        </div>

        {/* Skills - Spans 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel border-white/5 hover:border-accent/20 transition-all h-full">
            <CardHeader>
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                    <Zap className="w-6 h-6" />
                 </div>
                 <CardTitle className="text-xl">Identified Gaps</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {analysis.gaps}
            </CardContent>
          </Card>
        </div>

        {/* Roadmap - Spans 12 cols (Full Width) */}
        <div className="lg:col-span-12">
           <Card className="glass-panel border-white/5 hover:border-blue-500/20 transition-all">
              <CardHeader>
                 <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Map className="w-6 h-6" />
                     </div>
                     <CardTitle className="text-xl">Strategic Roadmap</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                 {analysis.roadmap}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Keyword Extraction */}
      <div className="flex flex-col items-center space-y-6">
         <h3 className="text-2xl font-semibold tracking-tight">Extracted Skills</h3>
         <div className="flex flex-wrap justify-center gap-3">
            {analysis.keywords.map((kw, i) => (
              <Badge 
                key={i} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border-white/10 text-sm transition-all"
              >
                {kw}
              </Badge>
            ))}
         </div>
         
         {!jobs && (
           <Button 
             size="lg" 
             onClick={onGetJobs} 
             disabled={fetchingJobs}
             className="mt-8 h-14 px-10 text-lg bg-accent text-accent-foreground hover:bg-accent/80 font-bold shadow-[0_0_25px_-5px_var(--color-accent)]"
           >
              {fetchingJobs ? (
                <span className="animate-pulse">Scanning Job Market...</span>
              ) : (
                <span className="flex items-center gap-2">
                  Find Matching Opportunities <Search className="w-5 h-5" />
                </span>
              )}
           </Button>
         )}
      </div>

      {/* Jobs Grid */}
      {jobs && <JobResults jobs={jobs} />}

    </motion.div>
  );
}
