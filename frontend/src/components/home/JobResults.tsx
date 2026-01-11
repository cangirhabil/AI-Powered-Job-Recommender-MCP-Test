"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/home/JobCard";
import { JobsResponse } from "@/lib/api";

interface JobResultsProps {
  jobs: JobsResponse;
}

export function JobResults({ jobs }: JobResultsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
       <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold flex items-center gap-3">
             <Briefcase className="text-primary" /> 
             Recommended Positions
          </h3>
          <Badge variant="outline" className="border-primary text-primary px-3 py-1">
             {jobs.linkedin.length} Matches Found
          </Badge>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {jobs.linkedin.map((job, i) => (
           <JobCard key={i} job={job} source="LinkedIn" />
         ))}
       </div>
    </motion.div>
  );
}
