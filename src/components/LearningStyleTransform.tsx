import { useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Flashcards from "./Flashcards";
import VoicePlayer from "./VoicePlayer";

interface LearningStyleTransformProps {
  content: string;
  onTransformed: (transformedContent: string, style: string) => void;
}

interface FlashcardData {
  question: string;
  answer: string;
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
  const [transformedResult, setTransformedResult] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [audioBase64, setAudioBase64] = useState<string>('');
  const { toast } = useToast();

  const handleTransform = async () => {
    if (!selectedStyle || !content) return;

    setIsTransforming(true);
    setTransformedResult(null);
    setFlashcards([]);
    setAudioBase64('');
    
    try {
      // Use Google AI Studio for better transformations
      const { data: transformData, error: transformError } = await supabase.functions.invoke('transform-with-gemini', {
        body: { content, learningStyle: selectedStyle }
      });

      if (transformError) throw transformError;

      const styleLabel = learningStyles.find(s => s.value === selectedStyle)?.label;
      
      if (selectedStyle === 'visual' && transformData.type === 'flashcards') {
        // Handle flashcards for visual learners
        setFlashcards(Array.isArray(transformData.transformedContent) ? transformData.transformedContent : []);
        setTransformedResult(transformData);
        onTransformed('Flashcards generated', selectedStyle);
        
        toast({
          title: "Flashcards created!",
          description: `Generated ${Array.isArray(transformData.transformedContent) ? transformData.transformedContent.length : 0} flashcards for visual learning`,
        });
      } else if (selectedStyle === 'auditory') {
        // Handle text-to-speech for auditory learners
        const transformedText = transformData.transformedContent;
        
        const { data: audioData, error: audioError } = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text: transformedText,
            voice: 'alloy' // You can make this configurable
          }
        });

        if (audioError) throw audioError;

        setAudioBase64(audioData.audioBase64);
        setTransformedResult({ ...transformData, audioBase64: audioData.audioBase64 });
        onTransformed(transformedText, selectedStyle);
        
        toast({
          title: "Audio generated!",
          description: `Created voice recording for auditory learning`,
        });
      } else {
        // Handle other learning styles (kinesthetic, reading)
        setTransformedResult(transformData);
        onTransformed(transformData.transformedContent, selectedStyle);
        
        toast({
          title: "Content transformed!",
          description: `Adapted for ${styleLabel} learning style`,
        });
      }
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
    <div className="space-y-6">
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

      {/* Render results based on learning style */}
      {selectedStyle === 'visual' && flashcards.length > 0 && (
        <Flashcards 
          flashcards={flashcards} 
          title="Study Flashcards"
        />
      )}

      {selectedStyle === 'auditory' && audioBase64 && (
        <VoicePlayer 
          audioBase64={audioBase64}
          title="Audio Notes"
          text={transformedResult?.transformedContent}
        />
      )}

      {transformedResult && selectedStyle !== 'visual' && selectedStyle !== 'auditory' && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">
              Transformed for {learningStyles.find(s => s.value === selectedStyle)?.label} Learning
            </h3>
          </div>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{transformedResult.transformedContent}</div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LearningStyleTransform;