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
  const [selectedVoice, setSelectedVoice] = useState<string>('Aria');
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
      // Transform content based on learning style
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
            voice: selectedVoice
          }
        });

        if (audioError) throw audioError;

        setAudioBase64(audioData.audioBase64);
        setTransformedResult({ 
          ...transformData, 
          audioBase64: audioData.audioBase64,
          message: audioData.message
        });
        onTransformed(transformedText, selectedStyle);
        
        toast({
          title: audioData.audioBase64 ? "Audio generated!" : "TTS configured",
          description: audioData.message || `Created voice recording for auditory learning`,
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

  const voiceOptions = [
    { value: 'Aria', label: 'Aria (Default)' },
    { value: 'Roger', label: 'Roger' },
    { value: 'Sarah', label: 'Sarah' },
    { value: 'Laura', label: 'Laura' },
    { value: 'Charlie', label: 'Charlie' },
    { value: 'George', label: 'George' },
    { value: 'Charlotte', label: 'Charlotte' },
    { value: 'Alice', label: 'Alice' },
    { value: 'Liam', label: 'Liam' },
    { value: 'River', label: 'River' }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gradient-subtle border border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Adapt for Learning Style</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {learningStyles.map((style) => {
            const getStyleClasses = (styleValue: string) => {
              const baseClasses = "h-auto p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:scale-105";
              const isSelected = selectedStyle === styleValue;
              
              switch (styleValue) {
                case 'visual':
                  return isSelected 
                    ? `${baseClasses} bg-visual text-white border-visual shadow-lg` 
                    : `${baseClasses} border-visual text-visual hover:bg-visual/10`;
                case 'auditory':
                  return isSelected 
                    ? `${baseClasses} bg-auditory text-white border-auditory shadow-lg` 
                    : `${baseClasses} border-auditory text-auditory hover:bg-auditory/10`;
                case 'kinesthetic':
                  return isSelected 
                    ? `${baseClasses} bg-kinesthetic text-white border-kinesthetic shadow-lg` 
                    : `${baseClasses} border-kinesthetic text-kinesthetic hover:bg-kinesthetic/10`;
                case 'reading':
                  return isSelected 
                    ? `${baseClasses} bg-reading text-white border-reading shadow-lg` 
                    : `${baseClasses} border-reading text-reading hover:bg-reading/10`;
                default:
                  return isSelected ? `${baseClasses} bg-primary text-white` : `${baseClasses} border-border`;
              }
            };

            return (
              <Button
                key={style.value}
                variant="outline"
                onClick={() => setSelectedStyle(style.value)}
                className={getStyleClasses(style.value)}
                disabled={!content || isTransforming}
              >
                <div className="text-2xl">{style.icon}</div>
                <div>
                  <div className="font-semibold">{style.label}</div>
                  <div className="text-xs opacity-75">{style.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
        
        {selectedStyle === 'auditory' && (
          <div className="mb-4 space-y-2">
            <label className="text-sm font-medium">Voice Selection</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button
          onClick={handleTransform}
          disabled={!selectedStyle || isTransforming || !content}
          className="w-full"
          size="lg"
        >
          {isTransforming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating {selectedStyle === 'visual' ? 'Flashcards' : 'Audio'}...
            </>
          ) : (
            <>
              Generate {selectedStyle === 'visual' ? 'Flashcards' : selectedStyle === 'auditory' ? 'Audio' : 'Content'}
              {selectedStyle && <span className="ml-2">{learningStyles.find(s => s.value === selectedStyle)?.icon}</span>}
            </>
          )}
        </Button>
        
        {!content && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Upload a note with content to start transforming
          </p>
        )}
      </Card>

      {/* Render results based on learning style */}
      {selectedStyle === 'visual' && flashcards.length > 0 && (
        <Flashcards 
          flashcards={flashcards} 
          title="Study Flashcards"
        />
      )}

      {selectedStyle === 'auditory' && transformedResult && (
        <VoicePlayer 
          audioBase64={audioBase64}
          title="Audio Notes"
          text={transformedResult?.transformedContent}
          message={transformedResult?.message}
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