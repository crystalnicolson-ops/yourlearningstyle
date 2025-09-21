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
    if (!flashcards || flashcards.length === 0) return;
    
    // Create CSV format for flashcards
    const csvHeader = "Question,Answer\n";
    const csvData = flashcards.map(card => 
      `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvData;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Flashcards downloaded as CSV!",
    });
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        {title && <h3 className="text-xl font-semibold">{title}</h3>}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadFlashcards}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
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