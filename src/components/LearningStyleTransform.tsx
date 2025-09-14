import { useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { transformContentLocally } from "@/lib/localLearningStyleTransform";

interface LearningStyleTransformProps {
  content: string;
  onTransformed: (transformedContent: string, style: string) => void;
}

const learningStyles = [
  { value: 'visual', label: 'Visual', icon: '👁️', description: 'Charts, diagrams, visual organization' },
  { value: 'auditory', label: 'Auditory', icon: '👂', description: 'Conversational, rhythmic, spoken' },
  { value: 'kinesthetic', label: 'Kinesthetic', icon: '🤲', description: 'Hands-on, practical, interactive' },
  { value: 'reading', label: 'Reading/Writing', icon: '📖', description: 'Detailed text, lists, definitions' }
];

const LearningStyleTransform = ({ content, onTransformed }: LearningStyleTransformProps) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState(false);
  const { toast } = useToast();

  const handleTransform = async () => {
    if (!selectedStyle || !content) return;

    setIsTransforming(true);
    
    try {
      // Using local transformation - completely free!
      const transformedContent = transformContentLocally(content, selectedStyle);
      
      onTransformed(transformedContent, selectedStyle);
      
      const styleLabel = learningStyles.find(s => s.value === selectedStyle)?.label;
      toast({
        title: "Content transformed!",
        description: `Adapted for ${styleLabel} learning style (Free version)`,
      });
    } catch (error: any) {
      console.error('Transform error:', error);
      toast({
        title: "Transform failed",
        description: error.message || "Failed to transform content",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-subtle border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">Adapt for Learning Style</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedStyle} onValueChange={setSelectedStyle}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose learning style..." />
          </SelectTrigger>
          <SelectContent>
            {learningStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                <div className="flex items-center gap-2">
                  <span>{style.icon}</span>
                  <div>
                    <div className="font-medium">{style.label}</div>
                    <div className="text-xs text-muted-foreground">{style.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleTransform}
          disabled={!selectedStyle || isTransforming || !content}
          className="whitespace-nowrap"
        >
          {isTransforming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Transforming...
            </>
          ) : (
            'Transform'
          )}
        </Button>
      </div>
    </Card>
  );
};

export default LearningStyleTransform;