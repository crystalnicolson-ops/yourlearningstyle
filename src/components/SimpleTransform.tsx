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
          prompt: `You are an expert note-taking assistant and educational content enhancer. Transform the provided content into comprehensive, well-structured notes that are both informative and easy to study from.

ENHANCEMENT OBJECTIVES:
• Expand on key concepts with clear explanations and context
• Add relevant background information where helpful
• Create logical flow and organization
• Ensure professional formatting and readability
• Make content more comprehensive but still concise

FORMATTING REQUIREMENTS:
• Use clear hierarchical headings (# ## ###)
• Organize information with bullet points and numbered lists
• Add bold text for **key terms** and *italics* for emphasis
• Include summary sections and takeaway points
• Use proper spacing and line breaks for readability
• Add context boxes or notes where appropriate

CONTENT ENHANCEMENT:
• Explain technical terms and concepts
• Add relevant examples or applications
• Connect related ideas and show relationships
• Include important background context
• Provide practical insights and implications
• Ensure accuracy while making content more accessible

STRUCTURE TEMPLATE:
# [Main Topic/Title]

## Overview
Brief introduction and context

## Key Concepts
### [Concept 1]
- Detailed explanation
- Relevant context
- **Important terms** highlighted

### [Concept 2]
- Clear breakdown
- Examples where helpful

## Important Details
• Critical information organized clearly
• Supporting facts and data
• Relevant background

## Summary & Key Takeaways
• Main points to remember
• Practical applications
• Next steps or further considerations

Transform this content following the above guidelines:

${content}

Make the enhanced notes comprehensive, well-organized, and significantly more valuable than the original content while maintaining accuracy.` 
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

      const speechText = String(transformData.transformedContent || '').slice(0, 4000);
      
      // Try browser speech synthesis first (free!)
      if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
        const utterance = new SpeechSynthesisUtterance(speechText);
        const voices = speechSynthesis.getVoices();
        
        // Find a good voice based on selection
        let selectedBrowserVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('male')
        ) || voices[0];
        
        if (selectedBrowserVoice) {
          utterance.voice = selectedBrowserVoice;
          utterance.rate = 0.9;
          utterance.pitch = 1;
          
          speechSynthesis.speak(utterance);
          
          onTransformed(transformData.transformedContent, 'audio');
          
          toast({
            title: "Audio playing!",
            description: "Using free browser speech (no download available)",
          });
          
          setIsProcessing(null);
          return;
        }
      }
      
      // Fallback to cloud TTS (OpenAI is cheaper than ElevenLabs)
      const { data: audioData, error: audioError } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: speechText,
          voice: selectedVoice
        }
      });

      if (audioError) throw audioError;

      setAudioBase64(audioData.audioBase64);
      onTransformed(transformData.transformedContent, 'audio');
      
      toast({
        title: "Audio created!",
        description: "Using cloud TTS (OpenAI fallback if ElevenLabs fails)",
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

      {/* Voice selection - only show when processing audio or audio exists */}
      {(isProcessing === 'audio' || audioBase64) && (
        <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
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
      )}

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
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/30 shadow-inner">
              <div 
                className="enhanced-notes-content text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: enhancedNotes
                    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-primary border-b-2 border-primary/20 pb-2">$1</h1>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-foreground mt-6">$1</h2>')
                    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-foreground mt-4">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic text-foreground/90">$1</em>')
                    .replace(/^• (.*$)/gm, '<li class="mb-1">$1</li>')
                    .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
                    .replace(/(\n<li.*?>.*?<\/li>)+/gs, '<ul class="list-disc list-inside mb-4 space-y-1">$&</ul>')
                    .replace(/^\d+\. (.*$)/gm, '<li class="mb-1">$1</li>')
                    .replace(/(\n<li.*?>.*?<\/li>)+/gs, '<ol class="list-decimal list-inside mb-4 space-y-1">$&</ol>')
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/^(?!<[h|u|o|l])(.+)$/gm, '<p class="mb-4">$1</p>')
                    .replace(/<p class="mb-4"><\/p>/g, '')
                }}
              />
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