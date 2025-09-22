import { useState } from "react";
import { Sparkles, FileText, Volume2, Loader2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Flashcards from "./Flashcards";
import VoicePlayer from "./VoicePlayer";
import StudyQuiz from "./StudyQuiz";
import SmartDownloadButton from "./SmartDownloadButton";

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
  const [useBrowserSpeech, setUseBrowserSpeech] = useState(false);
  const [enhancedNotes, setEnhancedNotes] = useState<string>('');
  const selectedVoice = 'alloy'; // Use single reliable voice
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEnhancedNotes = async () => {
    setIsProcessing('enhanced');
    setActiveMode('enhanced');
    // Clear other results
    setFlashcards([]);
    setAudioBase64('');
    setShowQuiz(false);
    
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
    setActiveMode('flashcards');
    // Clear other results
    setEnhancedNotes('');
    setAudioBase64('');
    setShowQuiz(false);
    
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

  const handleQuiz = async () => {
    if (!content) return;

    setIsProcessing('quiz');
    setActiveMode('quiz');
    // Clear other results
    setEnhancedNotes('');
    setFlashcards([]);
    setAudioBase64('');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          content: content + "\n\n[Generate 25-30 unique multiple-choice questions (A–D) with one correct answer. Do not repeat questions.]"
        }
      });

      if (error) {
        console.error('Quiz generation error:', error);
        throw new Error(error.message || 'Failed to generate quiz');
      }

      if (data?.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
        setShowQuiz(true);
        onTransformed("Quiz generated successfully", "quiz");
        toast({
          title: "Quiz generated!",
          description: `${data.questions.length} questions ready.`,
        });
      } else {
        throw new Error('Invalid quiz format received');
      }
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Quiz generation failed",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const generateMoreFlashcards = async () => {
    if (!content) return;
    
    setIsProcessing('more-flashcards');
    
    try {
      const { data, error } = await supabase.functions.invoke('transform-with-gemini', {
        body: { 
          content: content + "\n\n[Generate different flashcards focusing on other aspects, details, and concepts not covered in previous cards]", 
          learningStyle: 'visual' 
        }
      });

      if (error) throw error;

      if (data.type === 'flashcards' && Array.isArray(data.transformedContent)) {
        // Combine with existing flashcards
        setFlashcards(prev => [...prev, ...data.transformedContent]);
        
        toast({
          title: "More flashcards added!",
          description: `Generated ${data.transformedContent.length} additional flashcards`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to generate more flashcards",
        description: error.message || "Unable to create additional flashcards",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAudio = async () => {
    setIsProcessing('audio');
    setActiveMode('audio');
    // Clear other results
    setEnhancedNotes('');
    setFlashcards([]);
    setShowQuiz(false);
    
    try {
      // First transform for auditory learning
      const { data: transformData, error: transformError } = await supabase.functions.invoke('transform-with-gemini', {
        body: { content, learningStyle: 'auditory' }
      });

      if (transformError) throw transformError;

      const speechText = String(transformData.transformedContent || '').slice(0, 4000);
      
      // Prefer cloud TTS first for higher quality
      try {
        const { data: audioData, error: audioError } = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text: speechText,
            voice: selectedVoice
          }
        });

        if (audioError) throw audioError;

        if (audioData?.audioBase64) {
          setUseBrowserSpeech(false);
          setAudioBase64(audioData.audioBase64);
          onTransformed(transformData.transformedContent, 'audio');
          toast({
            title: 'Audio created!',
            description: 'Using high-quality cloud voice',
          });
          setIsProcessing(null);
          return;
        }
      } catch (_) {
        // fallthrough to browser speech
      }
      
      // Fallback to free browser speech if cloud TTS is unavailable
      if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
        setUseBrowserSpeech(true);
        setAudioBase64('browser-speech'); // Special marker for browser speech
        onTransformed(transformData.transformedContent, 'audio');
        toast({
          title: 'Audio ready!',
          description: 'Using free browser speech (cloud TTS unavailable)',
        });
        setIsProcessing(null);
        return;
      }

      throw new Error('Unable to generate audio: cloud TTS failed and browser speech is not available.');
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

  const downloadEnhancedNotes = () => {
    console.log('📝 ENHANCED NOTES DOWNLOAD CLICKED! 📝', { 
      enhancedNotesLength: enhancedNotes?.length,
      enhancedNotesPreview: enhancedNotes?.substring(0, 100) 
    });
    
    if (!enhancedNotes) {
      console.log('❌ No enhanced notes to download');
      toast({
        title: "No enhanced notes to download",
        description: "Generate enhanced notes first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create HTML content that Word can import with formatting
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Enhanced Notes</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            font-size: 28px;
            margin: 30px 0 20px 0;
        }
        h2 {
            color: #1e40af;
            font-size: 22px;
            margin: 25px 0 15px 0;
        }
        h3 {
            color: #1e3a8a;
            font-size: 18px;
            margin: 20px 0 10px 0;
        }
        p {
            margin: 12px 0;
            text-align: justify;
        }
        strong {
            color: #2563eb;
            font-weight: 600;
        }
        em {
            color: #64748b;
            font-style: italic;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        li {
            margin: 5px 0;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 10px;
        }
        .title {
            font-size: 32px;
            color: #0f172a;
            margin: 0;
            font-weight: 700;
        }
        .subtitle {
            color: #64748b;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Enhanced Notes</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
    </div>
    <div class="content">
        ${enhancedNotes
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^• (.*$)/gm, '<li>$1</li>')
          .replace(/^- (.*$)/gm, '<li>$1</li>')
          .replace(/(\n<li.*?>.*?<\/li>)+/gs, '<ul>$&</ul>')
          .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
          .replace(/(\n<li.*?>.*?<\/li>)+/gs, '<ol>$&</ol>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/^(?!<[h|u|o|l])(.+)$/gm, '<p>$1</p>')
          .replace(/<p><\/p>/g, '')
        }
    </div>
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-notes-${Date.now()}.html`;
      document.body.appendChild(a);
      console.log('📝 TRIGGERING ENHANCED NOTES WORD DOWNLOAD');
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ ENHANCED NOTES WORD DOWNLOAD COMPLETED');
      toast({
        title: "✅ Enhanced notes downloaded!",
        description: "HTML file created - opens in Word with formatting",
      });
    } catch (error) {
      console.error('❌ Error downloading enhanced notes:', error);
      toast({
        title: "Enhanced notes download failed",
        description: "There was an error downloading the enhanced notes",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-4">
      {/* Active Mode Header */}
      {activeMode && (
        <Card className="p-4 bg-white/95 backdrop-blur-sm border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeMode === 'enhanced' && <Sparkles className="h-5 w-5 text-primary" />}
              {activeMode === 'flashcards' && <FileText className="h-5 w-5 text-secondary" />}
              {activeMode === 'audio' && <Volume2 className="h-5 w-5 text-accent" />}
              {activeMode === 'quiz' && <Brain className="h-5 w-5 text-quiz" />}
              <span className="font-semibold text-foreground">
                {activeMode === 'enhanced' && 'Enhanced Notes Mode'}
                {activeMode === 'flashcards' && 'Flashcards Mode'}
                {activeMode === 'audio' && 'Audio Mode'}
                {activeMode === 'quiz' && `Quiz Mode - ${quizQuestions.length} Questions`}
              </span>
            </div>
            <SmartDownloadButton
              flashcards={flashcards}
              quiz={quizQuestions}
              enhancedNotes={enhancedNotes}
            />
          </div>
        </Card>
      )}

      {/* 4-button interface */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleEnhancedNotes}
          disabled={!content || isProcessing !== null}
          variant="default"
          size="sm"
          className={`transition-all duration-200 ${
            activeMode === 'enhanced' 
              ? "bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg scale-105" 
              : "bg-primary/80 text-primary-foreground hover:bg-primary hover:scale-105"
          }`}
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
          className={`transition-all duration-200 ${
            activeMode === 'flashcards' 
              ? "bg-secondary text-secondary-foreground ring-2 ring-secondary/50 shadow-lg scale-105" 
              : "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:scale-105"
          }`}
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
          className={`transition-all duration-200 ${
            activeMode === 'audio' 
              ? "bg-accent text-accent-foreground ring-2 ring-accent/50 shadow-lg scale-105" 
              : "bg-accent/80 text-accent-foreground hover:bg-accent hover:scale-105"
          }`}
        >
          {isProcessing === 'audio' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4 mr-2" />
          )}
          Audio
        </Button>

        <Button
          onClick={handleQuiz}
          disabled={!content || isProcessing !== null}
          variant="default"
          size="sm"
          className={`transition-all duration-200 ${
            activeMode === 'quiz' 
              ? "bg-quiz text-quiz-foreground ring-2 ring-quiz/50 shadow-lg scale-105" 
              : "bg-quiz/80 text-quiz-foreground hover:bg-quiz hover:scale-105"
          }`}
        >
          {isProcessing === 'quiz' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          Take Quiz
        </Button>
      </div>


      {/* Results */}
      {showQuiz && quizQuestions.length > 0 ? (
        <StudyQuiz 
          questions={quizQuestions} 
          onBack={() => setShowQuiz(false)}
          onAddQuestions={(newQuestions) => setQuizQuestions(prev => [...prev, ...newQuestions])}
          originalContent={content}
        />
      ) : (
        <>
          {/* Enhanced notes display removed to avoid showing full content */}

          {flashcards.length > 0 && (
            <Flashcards 
              flashcards={flashcards}
              onGenerateMore={generateMoreFlashcards}
              isGenerating={isProcessing === 'more-flashcards'}
            />
          )}

          {audioBase64 && (
            <VoicePlayer 
              audioBase64={audioBase64 === 'browser-speech' ? undefined : audioBase64}
              text={content}
              useBrowserSpeech={useBrowserSpeech}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SimpleTransform;