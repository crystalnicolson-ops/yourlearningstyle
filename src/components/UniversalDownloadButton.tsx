import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FlashcardData {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
}

interface UniversalDownloadButtonProps {
  flashcards?: FlashcardData[];
  quiz?: QuizQuestion[];
  textContent?: string;
  filename?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const UniversalDownloadButton = ({ 
  flashcards, 
  quiz, 
  textContent, 
  filename,
  variant = "outline",
  size = "sm",
  className = ""
}: UniversalDownloadButtonProps) => {
  const { toast } = useToast();

  const downloadContent = () => {
    try {
      // Priority: Flashcards > Quiz > Text Content
      if (flashcards && flashcards.length > 0) {
        // Download as CSV
        const csvHeader = "Question,Answer\n";
        const csvData = flashcards.map(card => 
          `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}"`
        ).join('\n');
        const csvContent = csvHeader + csvData;
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `flashcards-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Flashcards downloaded!",
          description: `Downloaded ${flashcards.length} flashcards as CSV`,
        });
        
      } else if (quiz && quiz.length > 0) {
        // Download as JSON
        const quizData = {
          title: "Study Quiz",
          questions: quiz.map((q, index) => ({
            number: index + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          })),
          totalQuestions: quiz.length,
          exportedAt: new Date().toISOString()
        };
        
        const jsonContent = JSON.stringify(quizData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `quiz-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Quiz downloaded!",
          description: `Downloaded ${quiz.length} questions as JSON`,
        });
        
      } else if (textContent) {
        // Download as TXT
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `notes-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Content downloaded!",
          description: "Downloaded as text file",
        });
        
      } else {
        toast({
          title: "Nothing to download",
          description: "No content available for download",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the content",
        variant: "destructive",
      });
    }
  };

  // Don't show button if no content is available
  if (!flashcards?.length && !quiz?.length && !textContent) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={downloadContent}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );
};

export default UniversalDownloadButton;