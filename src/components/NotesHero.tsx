import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Search, Zap, Target, Eye, Headphones, BookOpen, Hand } from "lucide-react";

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
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4 mb-8">
            Upload your documents to transform them into personalized learning experiences
          </p>

          {/* Learning Styles Information */}
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4 text-white/80" />
                <div className="text-center">
                  <div className="text-white font-medium mb-1">Visual Learning</div>
                  <div className="text-white/70">Interactive flashcards and diagrams</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Headphones className="h-4 w-4 text-white/80" />
                <div className="text-center">
                  <div className="text-white font-medium mb-1">Auditory Learning</div>
                  <div className="text-white/70">Voice recordings and audio content</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4 text-white/80" />
                <div className="text-center">
                  <div className="text-white font-medium mb-1">Reading/Writing</div>
                  <div className="text-white/70">Enhanced notes and summaries</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Hand className="h-4 w-4 text-white/80" />
                <div className="text-center">
                  <div className="text-white font-medium mb-1">Kinesthetic</div>
                  <div className="text-white/70">Interactive quizzes and activities</div>
                </div>
              </div>
            </div>
          </div>
        </header>

      </div>
    </div>
  );
};

export default NotesHero;