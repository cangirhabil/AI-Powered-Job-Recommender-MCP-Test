"use client";

import { Layout, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/lib/api";

interface JobCardProps {
  job: Job;
  source: string;
}

export function JobCard({ job, source }: JobCardProps) {
  return (
    <Card className="glass-panel group overflow-hidden border-white/5 hover:border-primary/50 transition-all duration-300 flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="space-y-4">
         <div className="flex justify-between items-start">
             <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center font-bold text-lg text-white/50 group-hover:text-white group-hover:bg-white/10 transition-all">
                {job.companyName ? job.companyName.charAt(0) : "C"}
             </div>
             <Badge variant="secondary" className="bg-white/5 text-xs font-light tracking-widest uppercase">
                {source}
             </Badge>
         </div>
         <div>
            <CardTitle className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors">
               {job.title}
            </CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground mt-1">
               {job.companyName}
            </CardDescription>
         </div>
      </CardHeader>
      
      <CardContent className="mt-auto pt-0 space-y-6">
         <div className="flex items-center text-sm text-gray-400 gap-2">
            <Layout className="w-4 h-4 text-accent" />
            <span className="truncate">{job.location || "Remote / Hybrid"}</span>
         </div>
         
         <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all" asChild>
            <a href={job.link || job.url || job.jobUrl || job.applyUrl || "#"} target="_blank" rel="noopener noreferrer">
                Apply Now <ExternalLink className="ml-2 w-4 h-4 opacity-50 group-hover:opacity-100" />
            </a>
         </Button>
      </CardContent>
    </Card>
  );
}
