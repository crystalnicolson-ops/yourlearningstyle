import { useState } from "react";
import { Sparkles, FileText, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Flashcards from "./Flashcards";
import VoicePlayer from "./VoicePlayer";

interface SimpleTransformProps {
  content: string;
  onTransformed: (transformedContent: string, type: string) => void;
}

interface FlashcardData {
  question: string;
  answer: string;
}

const SimpleTransform = ({ content, onTransformed }: SimpleTransformProps) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [enhancedNotes, setEnhancedNotes] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('Aria');
  const { toast } = useToast();

  const handleEnhancedNotes = async () => {
    setIsProcessing('enhanced');
    // Clear other results
    setFlashcards([]);
    setAudioBase64('');
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-text-manipulator', {
        body: { 
          prompt: `Transform this content into enhanced, well-formatted notes with:
- Clear headings and subheadings
- Bullet points for key information
- Visual organization with spacing
- Important concepts highlighted
- Summary sections where appropriate

Content to enhance:\n${content}` 
        }
      });

      if (error) throw error;

      setEnhancedNotes(data.transformedText);
      onTransformed(data.transformedText, 'enhanced');
      
      toast({
        title: "Enhanced notes created!",
        description: "Your notes have been formatted and organized",
      });
    } catch (error: any) {
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to enhance notes",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleFlashcards = async () => {
    setIsProcessing('flashcards');
    // Clear other results
    setEnhancedNotes('');
    setAudioBase64('');
    
    try {
      const { data, error } = await supabase.functions.invoke('transform-with-gemini', {
        body: { content, learningStyle: 'visual' }
      });

      if (error) throw error;

      if (data.type === 'flashcards' && Array.isArray(data.transformedContent)) {
        setFlashcards(data.transformedContent);
        onTransformed('Flashcards generated', 'flashcards');
        
        toast({
          title: "Flashcards created!",
          description: `Generated ${data.transformedContent.length} flashcards`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Flashcard creation failed",
        description: error.message || "Failed to create flashcards",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAudio = async () => {
    setIsProcessing('audio');
    // Clear other results
    setEnhancedNotes('');
    setFlashcards([]);
    
    try {
      // First transform for auditory learning
      const { data: transformData, error: transformError } = await supabase.functions.invoke('transform-with-gemini', {
        body: { content, learningStyle: 'auditory' }
      });

      if (transformError) throw transformError;

      // Then convert to speech
      const { data: audioData, error: audioError } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: transformData.transformedContent,
          voice: selectedVoice
        }
      });

      if (audioError) throw audioError;

      setAudioBase64(audioData.audioBase64);
      onTransformed(transformData.transformedContent, 'audio');
      
      toast({
        title: "Audio created!",
        description: "Your notes have been converted to speech",
      });
    } catch (error: any) {
      toast({
        title: "Audio creation failed",
        description: error.message || "Failed to create audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const voices = [
    { value: 'Aria', label: 'Aria (Female)' },
    { value: 'Roger', label: 'Roger (Male)' },
    { value: 'Sarah', label: 'Sarah (Female)' },
    { value: 'Laura', label: 'Laura (Female)' },
    { value: 'Charlie', label: 'Charlie (Male)' },
    { value: 'George', label: 'George (Male)' },
    { value: 'Callum', label: 'Callum (Male)' },
    { value: 'River', label: 'River (Neutral)' },
    { value: 'Liam', label: 'Liam (Male)' },
    { value: 'Charlotte', label: 'Charlotte (Female)' },
    { value: 'Alice', label: 'Alice (Female)' },
  ];

  return (
    <div className="space-y-4">
      {/* Voice selection */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Voice:</span>
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.value} value={voice.value}>
                {voice.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Simple 3-button interface */}
      <div className="flex gap-3">
        <Button
          onClick={handleEnhancedNotes}
          disabled={!content || isProcessing !== null}
          variant="default"
          size="sm"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isProcessing === 'enhanced' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Enhanced Notes
        </Button>

        <Button
          onClick={handleFlashcards}
          disabled={!content || isProcessing !== null}
          variant="default"
          size="sm"
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isProcessing === 'flashcards' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Flashcards
        </Button>

        <Button
          onClick={handleAudio}
          disabled={!content || isProcessing !== null}
          variant="default"
          size="sm"
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isProcessing === 'audio' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4 mr-2" />
          )}
          Audio
        </Button>
      </div>

      {/* Results */}
      {enhancedNotes && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 shadow-lg">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Enhanced Notes</h4>
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
          </div>
          <div className="prose prose-lg max-w-none">
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {enhancedNotes}
              </div>
            </div>
          </div>
        </Card>
      )}

      {flashcards.length > 0 && (
        <Flashcards 
          flashcards={flashcards} 
        />
      )}

      {audioBase64 && (
        <VoicePlayer 
          audioBase64={audioBase64}
        />
      )}
    </div>
  );
};

export default SimpleTransform;