import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Search, Zap, Target } from "lucide-react";

const NotesHero = () => {
  return (
    <div className="min-h-[60vh] bg-gradient-primary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-300/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white">
              Learning<span className="text-pink-200">Style</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4 mb-6">
            <strong>Step 1:</strong> Choose your learning style:
          </p>
          
          <div className="flex justify-center items-center gap-8 text-white/90 mb-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-pink-200" />
              <span className="font-medium">Visual Learning</span>
            </div>
            <div className="text-white/50">or</div>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-pink-200" />
              <span className="font-medium">Auditory Learning</span>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed px-4">
            <strong>Step 2:</strong> Upload your documents to get started
          </p>
        </header>

      </div>
    </div>
  );
};

export default NotesHero;