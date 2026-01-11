"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center space-y-8 pt-12">

      <motion.h1 
        className="text-5xl md:text-7xl font-bold tracking-tighter text-white max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Your Future, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">Designed by Intelligence.</span>
      </motion.h1>
      
      <motion.p 
        className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Analyze your resume to uncover hidden skill gaps, generate a personalized roadmap, and find high-fit job opportunities instantly.
      </motion.p>
    </section>
  );
}
