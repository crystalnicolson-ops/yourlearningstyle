import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/Hero";
import { CheckCircle, FileText, Upload, Cloud, Mail } from "lucide-react";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { email }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Hero />
      
      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need for note-taking
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, powerful, and secure note management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Rich Text Notes</h3>
              <p className="text-muted-foreground">Write and organize your thoughts with our intuitive editor</p>
            </Card>
            
            <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">File Uploads</h3>
              <p className="text-muted-foreground">Attach documents, images, and files to your notes</p>
            </Card>
            
            <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
              <Cloud className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Cloud Storage</h3>
              <p className="text-muted-foreground">Access your notes anywhere with secure cloud sync</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gradient-subtle">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start taking better notes today
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get full access to all features for just $4.99/month
          </p>
          
          <Card className="p-8 bg-gradient-card shadow-card border-0 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">$4.99</div>
              <div className="text-muted-foreground">/month</div>
            </div>
            
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-3" />
                <span className="text-foreground">Unlimited notes</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-3" />
                <span className="text-foreground">File uploads & attachments</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-3" />
                <span className="text-foreground">Cloud storage & sync</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-3" />
                <span className="text-foreground">Access from anywhere</span>
              </div>
            </div>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Starting subscription..." : "Start Your Subscription"}
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground mt-4">
              Cancel anytime. No long-term commitments.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;