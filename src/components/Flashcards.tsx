import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FlashcardData {
  question: string;
  answer: string;
}

interface FlashcardsProps {
  flashcards: FlashcardData[];
  title?: string;
  onGenerateMore?: () => void;
  isGenerating?: boolean;
}

const Flashcards = ({ flashcards, title, onGenerateMore, isGenerating }: FlashcardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { toast } = useToast();

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No flashcards generated yet.</p>
      </Card>
    );
  }

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const downloadFlashcards = () => {
    console.log('🃏 FLASHCARD DOWNLOAD CLICKED! 🃏', { flashcardsLength: flashcards?.length });
    
    if (!flashcards || flashcards.length === 0) {
      console.log('❌ No flashcards to download');
      toast({
        title: "No flashcards to download",
        description: "Generate flashcards first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create Quizlet-compatible tab-separated format with CRLF and UTF-8 BOM
      const tsvData = flashcards.map(card => {
        // Clean the text to remove any problematic characters
        const cleanQuestion = card.question.replace(/[\r\n\t]+/g, ' ').trim();
        const cleanAnswer = card.answer.replace(/[\r\n\t]+/g, ' ').trim();
        return `${cleanQuestion}\t${cleanAnswer}`;
      }).join('\r\n');
      
      console.log('🃏 QUIZLET TSV CONTENT:', tsvData.substring(0, 200) + '...');
      
      const BOM = '\uFEFF';
      const blob = new Blob([BOM, tsvData], { type: 'text/tab-separated-values;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizlet-flashcards-${Date.now()}.tsv`;
      document.body.appendChild(a);
      console.log('🃏 TRIGGERING QUIZLET TSV DOWNLOAD');
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ QUIZLET FLASHCARD DOWNLOAD COMPLETED');
      toast({
        title: "✅ Flashcards downloaded for Quizlet!",
        description: `Downloaded ${flashcards.length} flashcards as .tsv file. Import this directly into Quizlet.`,
      });
    } catch (error) {
      console.error('❌ Error downloading flashcards:', error);
      toast({
        title: "Flashcard download failed",
        description: "There was an error downloading the flashcards",
        variant: "destructive",
      });
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        {title && <h3 className="text-xl font-semibold">{title}</h3>}
        <div className="flex items-center gap-2">
          {onGenerateMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateMore}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate More'}
            </Button>
          )}
        </div>
      </div>

      <Card className="h-64 cursor-pointer" onClick={toggleAnswer}>
        <div className="p-6 flex flex-col justify-center items-center text-center h-full">
          <div className="mb-4">
            <Badge variant={showAnswer ? "secondary" : "outline"} className="text-xs">
              {showAnswer ? "Answer" : "Question"}
            </Badge>
          </div>
          <p className="text-lg leading-relaxed">
            {showAnswer ? currentCard.answer : currentCard.question}
          </p>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={prevCard}
          disabled={flashcards.length <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2 items-center">
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1} of {flashcards.length}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAnswer}
            className="text-xs"
          >
            {showAnswer ? 'Show Question' : 'Show Answer'}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={nextCard}
          disabled={flashcards.length <= 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Click the card or "Show Answer" button to toggle between question and answer
      </div>
    </div>
  );
};

export default Flashcards;