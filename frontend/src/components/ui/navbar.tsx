"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl z-50 flex items-center px-6 md:px-12 justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
        </div>
        <span className="font-semibold tracking-tight text-white text-lg">
          Job<span className="text-primary">AI</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/5" asChild>
          <Link href="https://github.com/cangirhabil/AI-Powered-Job-Recommender-MCP" target="_blank">
            <Github className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
