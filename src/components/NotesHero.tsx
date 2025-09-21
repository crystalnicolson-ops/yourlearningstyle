import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Search, Zap, Target } from "lucide-react";

const NotesHero = () => {
  return (
    <div className="relative overflow-hidden">
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white">
              Learning<span className="text-white/80">Style</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
            Upload your documents to transform them into personalized learning experiences
          </p>
        </header>

      </div>
    </div>
  );
};

export default NotesHero;