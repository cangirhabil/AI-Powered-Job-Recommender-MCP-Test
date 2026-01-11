"use client";

import { motion } from "framer-motion";
import { Upload, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  file: File | null;
  analyzing: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  triggerFileInput: () => void;
}

export function UploadZone({ 
  file, 
  analyzing, 
  onFileChange, 
  onUpload, 
  fileInputRef,
  triggerFileInput
}: UploadZoneProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="interactive-zone rounded-3xl p-8 md:p-12 border border-white/5 bg-card/30 backdrop-blur-sm text-center">
          
          <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${file ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
             {file ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
          </div>

          <h3 className="text-2xl font-semibold text-white mb-2">
            {file ? "Ready to Analyze" : "Drop your resume here"}
          </h3>
          <p className="text-muted-foreground mb-8">
            {file ? file.name : "Support for PDF documents (Max 5MB)"}
          </p>

          <input 
            type="file" 
            ref={fileInputRef}
            accept=".pdf" 
            onChange={onFileChange} 
            className="hidden" 
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={triggerFileInput}
              className="h-14 px-8 border-white/10 hover:bg-white/5 hover:text-white glass-button"
            >
              {file ? "Change File" : "Select Document"}
            </Button>
            
            <Button 
              size="lg"
              disabled={!file || analyzing}
              onClick={onUpload}
              className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_20px_-5px_var(--color-primary)]"
            >
              {analyzing ? (
                 <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                 </>
              ) : (
                 <>
                  Start Analysis <ChevronRight className="ml-2 w-5 h-5" />
                 </>
              )}
            </Button>
          </div>
      </div>
    </motion.div>
  );
}
