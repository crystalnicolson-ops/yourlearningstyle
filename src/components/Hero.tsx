import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Headphones, BookOpen, Hand, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-300/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Eye className="h-8 w-8 text-white" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Learning<span className="text-pink-200">Style</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Discover your VARK learning style and unlock your full potential with personalized study strategies
          </p>
        </header>

        {/* CTA Buttons */}
        <div className="text-center mb-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/quiz">
              <Button size="lg" variant="default" className="min-w-48">
                <Zap className="mr-2 h-5 w-5" />
                Take Quiz (Free)
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="secondary" className="min-w-48">
                <Target className="mr-2 h-5 w-5" />
                Explore Styles
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Visual</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Learning through seeing
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Auditory</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Learning through hearing
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Reading/Writing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Learning through text
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Hand className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Kinesthetic</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Learning through doing/movement
              </p>
            </div>
          </Card>
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