import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Headphones, BookOpen, Hand, Zap, Upload, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-300/10 rounded-full blur-2xl"></div>
      
      {/* Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Eye className="h-8 w-8 text-white" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Learning<span className="text-pink-200">Style</span>
            </h1>
          </div>
        </header>

        {/* Get Started Instructions */}
        <div className="text-center mb-12">
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            To get started, upload your notes below and transform them into personalized learning materials
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="https://www.personalitytraits.io" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="default" className="min-w-48">
                <Zap className="mr-2 h-5 w-5" />
                Take Quiz (Free)
              </Button>
            </a>
            <Link to="/">
              <Button size="lg" variant="secondary" className="min-w-48">
                <Upload className="mr-2 h-5 w-5" />
                Upload Documents
              </Button>
            </Link>
          </div>
        </div>


        {/* Learning Styles */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Eye className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Visual</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Headphones className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Auditory</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <BookOpen className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Reading/Writing</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Hand className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Kinesthetic</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Helping Students Learn Better
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">25K+</div>
              <div className="text-white/80 text-lg">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">4</div>
              <div className="text-white/80 text-lg">VARK Learning Styles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-white/80 text-lg">Improved Performance</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">Free</div>
              <div className="text-white/80 text-lg">Assessment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;