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
              Dream<span className="text-pink-200">Builder</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into reality with our powerful tools and creative solutions
          </p>
        </header>

        {/* CTA Buttons */}
        <div className="text-center mb-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="default" className="min-w-48">
              <Zap className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button size="lg" variant="secondary" className="min-w-48">
              <Target className="mr-2 h-5 w-5" />
              Learn More
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Creative Tools</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access powerful design tools that bring your creative vision to life with intuitive interfaces and advanced features.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Team Collaboration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Work seamlessly with your team using real-time collaboration features and shared workspaces.
              </p>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-card shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105 border-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Smart Results</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get intelligent insights and recommendations that help you achieve better results faster than ever before.
              </p>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Trusted by Creators Worldwide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/80 text-lg">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80 text-lg">Projects Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99%</div>
              <div className="text-white/80 text-lg">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80 text-lg">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;