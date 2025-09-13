import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Loader } from "lucide-react";

const Success = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Wait a moment for the subscription to be processed
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-gradient-card shadow-card border-0 text-center">
        {loading ? (
          <>
            <Loader className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Setting up your account...
            </h1>
            <p className="text-muted-foreground">
              We're processing your subscription and preparing your notes app.
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Welcome to Notes App!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your subscription is active and your account is ready. Start organizing your thoughts and ideas today.
            </p>
            
            <Button 
              onClick={handleGetStarted}
              className="w-full"
            >
              Get Started
            </Button>
            
            <div className="mt-6 p-4 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                You can manage your subscription anytime from your account settings.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Success;