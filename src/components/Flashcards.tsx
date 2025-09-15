import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FlashcardData {
  question: string;
  answer: string;
}

interface FlashcardsProps {
  flashcards: FlashcardData[];
  title?: string;
}

const Flashcards = ({ flashcards, title }: FlashcardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No flashcards generated yet.</p>
      </Card>
    );
  }

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  const flipCard = () => {
    if (isFlipped) {
      // If showing answer, advance to next card
      nextCard();
    } else {
      // If showing question, flip to answer
      setIsFlipped(true);
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {title && (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <Badge variant="secondary">
            {currentIndex + 1} of {flashcards.length}
          </Badge>
        </div>
      )}

      <div className="relative h-64 perspective-1000">
        <Card 
          className={`absolute inset-0 w-full h-full cursor-pointer transition-transform duration-500 preserve-3d ${
            isFlipped ? '-rotate-y-180' : ''
          }`}
          onClick={flipCard}
        >
          {/* Front side */}
          <div className="absolute inset-0 w-full h-full backface-hidden p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">Question</Badge>
            </div>
            <p className="text-lg font-medium leading-relaxed">
              {currentCard.question}
            </p>
            <div className="absolute bottom-4 right-4">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Back side */}
          <div className="absolute inset-0 w-full h-full backface-hidden -rotate-y-180 p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
            <div className="mb-4">
              <Badge variant="secondary" className="text-xs">Answer</Badge>
            </div>
            <p className="text-lg leading-relaxed">
              {currentCard.answer}
            </p>
            <div className="absolute bottom-4 right-4">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>

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

        <div className="flex gap-1">
          {flashcards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
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
        Click the card to see the answer, then click again to continue
      </div>
    </div>
  );
};

export default Flashcards;