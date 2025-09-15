import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Cloud, Search, Zap, Target } from "lucide-react";

const NotesHero = () => {
  return (
    <div className="min-h-[60vh] bg-gradient-primary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-300/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FileText className="h-8 w-8 text-white" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Learning<span className="text-pink-200">Style</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Transform your notes into personalized learning experiences with AI-powered adaptations
          </p>
        </header>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Visual Learning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Transform notes into interactive flashcards
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Auditory Learning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Generate voice recordings from your notes
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI Adaptation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Personalized content for your learning style
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotesHero;