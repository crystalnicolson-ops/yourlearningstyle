import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Target, Users, Zap } from "lucide-react";

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
            <Sparkles className="h-8 w-8 text-white" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Learning<span className="text-pink-200">Style</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Discover your unique learning style and unlock your full potential with personalized study strategies
          </p>
        </header>

        {/* CTA Buttons */}
        <div className="text-center mb-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="default" className="min-w-48">
              <Zap className="mr-2 h-5 w-5" />
              Take Quiz (Free)
            </Button>
            <Button size="lg" variant="secondary" className="min-w-48">
              <Target className="mr-2 h-5 w-5" />
              Explore Styles
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Visual Learning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Learn best through diagrams, charts, images, and visual aids that help you understand and retain information effectively.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Social Learning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Thrive in group settings, discussions, and collaborative environments where you can learn from and with others.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Kinesthetic Learning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Learn through hands-on activities, movement, and physical interaction with your learning materials and environment.
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
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">12</div>
              <div className="text-white/80 text-lg">Learning Styles</div>
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