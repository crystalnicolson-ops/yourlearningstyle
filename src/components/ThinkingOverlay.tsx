import { Brain, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ThinkingOverlayProps {
  isVisible: boolean;
  message: string;
  type?: 'enhanced' | 'flashcards' | 'audio' | 'quiz' | 'visual' | 'auditory' | 'processing' | 'generating' | 'more-flashcards';
}

const ThinkingOverlay = ({ isVisible, message, type = 'processing' }: ThinkingOverlayProps) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'enhanced':
        return <Sparkles className="h-8 w-8 text-primary animate-pulse" />;
      case 'flashcards':
      case 'visual':
        return <Sparkles className="h-8 w-8 text-secondary animate-pulse" />;
      case 'audio':
      case 'auditory':
        return <div className="h-8 w-8 text-accent animate-pulse">🎵</div>;
      case 'quiz':
        return <Sparkles className="h-8 w-8 text-quiz animate-pulse" />;
      default:
        return <Sparkles className="h-8 w-8 text-primary animate-pulse" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'enhanced':
        return 'from-primary/10 to-primary/5';
      case 'flashcards':
      case 'visual':
        return 'from-secondary/10 to-secondary/5';
      case 'audio':
      case 'auditory':
        return 'from-accent/10 to-accent/5';
      case 'quiz':
        return 'from-quiz/10 to-quiz/5';
      default:
        return 'from-primary/10 to-primary/5';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`p-8 max-w-md w-full bg-gradient-to-br ${getGradient()} border-2 border-primary/20 shadow-2xl`}>
        <div className="text-center space-y-6">
          {/* Thinking Animation */}
          <div className="relative">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            
            {/* Animated dots around the main icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-1/2 right-0 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </h3>
            <p className="text-muted-foreground font-medium">{message}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            This may take a few moments...
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ThinkingOverlay;