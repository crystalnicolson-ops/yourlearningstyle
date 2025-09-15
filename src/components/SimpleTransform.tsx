import { useState } from "react";
import { Sparkles, FileText, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const { toast } = useToast();

  const handleEnhancedNotes = async () => {
    setIsProcessing('enhanced');
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
          voice: 'alloy'
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

  return (
    <div className="space-y-4">
      {/* Simple 3-button interface */}
      <div className="flex gap-3">
        <Button
          onClick={handleEnhancedNotes}
          disabled={!content || isProcessing !== null}
          variant="outline"
          size="sm"
          className="flex-1"
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
          variant="outline"
          size="sm"
          className="flex-1"
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
          variant="outline"
          size="sm"
          className="flex-1"
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
        <Card className="p-4">
          <h4 className="font-medium mb-3">Enhanced Notes</h4>
          <div className="prose max-w-none text-sm">
            <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded">{enhancedNotes}</div>
          </div>
        </Card>
      )}

      {flashcards.length > 0 && (
        <Flashcards 
          flashcards={flashcards} 
          title="Study Flashcards"
        />
      )}

      {audioBase64 && (
        <VoicePlayer 
          audioBase64={audioBase64}
          title="Audio Notes"
        />
      )}
    </div>
  );
};

export default SimpleTransform;