import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SmartDownloadButton from "./SmartDownloadButton";

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

interface StudyQuizProps {
  questions: QuizQuestion[];
  onBack: () => void;
  onAddQuestions: (newQuestions: QuizQuestion[]) => void;
  originalContent: string;
}

const StudyQuiz = ({ questions, onBack, onAddQuestions, originalContent }: StudyQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (option: string) => {
    if (showAnswer) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: option
    }));
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setShowAnswer(false);
  };

  const generateMoreQuestions = async () => {
    // Aim to add up to 10 more, capped at 30 total
    const remaining = Math.max(0, 30 - questions.length);
    if (remaining === 0) {
      toast({
        title: "Limit reached",
        description: "You already have the maximum of 30 questions",
      });
      return;
    }

    const additionalCount = Math.min(10, remaining);
    setIsGeneratingMore(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          content: originalContent,
          count: additionalCount,
          excludeQuestions: questions.map(q => q.question)
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate more questions');
      }

      if (data?.questions && Array.isArray(data.questions)) {
        onAddQuestions(data.questions);
        toast({
          title: "More questions added!",
          description: `Generated ${data.questions.length} additional questions`,
        });
      } else {
        throw new Error('Invalid quiz format received');
      }
    } catch (error: any) {
      console.error('Error generating more questions:', error);
      toast({
        title: "Failed to generate more questions",
        description: error.message || "Unable to add more questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const progress = ((currentQuestion + (showAnswer ? 1 : 0)) / questions.length) * 100;

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Quiz Complete!</h2>
            <p className="text-white/80">{questions.length} questions total</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generateMoreQuestions}
              disabled={isGeneratingMore}
              className="bg-quiz text-quiz-foreground hover:bg-quiz/90"
            >
              {isGeneratingMore ? (
                <>Loading...</>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add More
                </>
              )}
            </Button>
            <SmartDownloadButton
              quiz={questions}
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            />
          </div>
        </div>

        <Card className="p-8 bg-white/95 backdrop-blur-sm">
      <div className="text-center space-y-6">
        <div className="text-5xl sm:text-6xl font-bold text-primary">
          {score.percentage}%
        </div>
        <div className="text-base sm:text-xl text-gray-600">
          You scored {score.correct} out of {score.total} questions correctly
        </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={resetQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={onBack}>
                Back to Notes
              </Button>
            </div>
          </div>
        </Card>

        {/* Detailed Results */}
        <Card className="p-6 bg-white/95 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Review Answers</h3>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                          {userAnswer ? `${userAnswer}: ${question.options[userAnswer as keyof typeof question.options]}` : "Not answered"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600 mt-1">
                          Correct answer: {question.correctAnswer}: {question.options[question.correctAnswer as keyof typeof question.options]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Mobile spacer for fixed progress bar */}
      <div className="sm:hidden h-[calc(env(safe-area-inset-top)+1.75rem)]" />
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10 text-xs sm:text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-sm sm:text-2xl font-bold text-white">Study Quiz</h2>
          <p className="text-white/80 text-[11px] sm:text-sm">Test your knowledge • {questions.length} questions</p>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button 
            onClick={generateMoreQuestions}
            disabled={isGeneratingMore}
            variant="outline"
            size="sm"
            className="h-8 px-2 bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
          >
            {isGeneratingMore ? (
              <>Loading...</>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add More</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </Button>
          <SmartDownloadButton
            quiz={questions}
            variant="outline"
            className="h-8 px-2 bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
          />
        </div>
      </div>

      {/* Mobile fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-[70] sm:hidden bg-gradient-primary/95 backdrop-blur px-4 py-1 border-b border-white/10 pt-[calc(env(safe-area-inset-top)+0.25rem)]">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between text-white/90 text-xs mb-1">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Question */}
      <Card className="p-2 sm:p-6 bg-white/95 backdrop-blur-sm max-w-full relative z-10">
        <div className="flex items-start justify-between mb-2 sm:mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 text-[10px] sm:text-xs px-2 py-1 border border-gray-200">Q {currentQuestion + 1}/{questions.length}</span>
        </div>
        <h3 className="text-sm sm:text-2xl font-semibold text-gray-800 mb-2.5 sm:mb-6 leading-snug">
          {question.question}
        </h3>

        <div className="space-y-1.5 sm:space-y-3">
          {Object.entries(question.options).map(([option, text]) => {
            let buttonClass = "w-full p-1.5 sm:p-4 text-left justify-start border transition-all duration-200 text-xs sm:text-sm";
            
            if (showAnswer) {
              if (option === question.correctAnswer) {
                buttonClass += " bg-green-100 border-green-500 text-green-800";
              } else if (option === selectedAnswer) {
                buttonClass += " bg-red-100 border-red-500 text-red-800";
              } else {
                buttonClass += " bg-gray-100 border-gray-300 text-gray-600";
              }
            } else if (selectedAnswer === option) {
              buttonClass += " bg-primary/10 border-primary text-primary";
            } else {
              buttonClass += " hover:bg-gray-50 border-gray-200";
            }

            return (
              <Button
                key={option}
                variant="ghost"
                className={buttonClass}
                onClick={() => handleAnswer(option)}
                disabled={showAnswer}
              >
                <span className="font-semibold mr-2 flex-shrink-0 text-xs sm:text-sm">{option}.</span>
                <span className="text-xs sm:text-base break-words">{text}</span>
              </Button>
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                {selectedAnswer === question.correctAnswer ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 font-medium">
                      Incorrect. The correct answer is {question.correctAnswer}.
                    </span>
                  </>
                )}
              </div>
              <Button onClick={handleNext} size="sm" className="h-9 text-sm sm:text-base">
                {currentQuestion < questions.length - 1 ? "Next" : "Results"}
              </Button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
};

export default StudyQuiz;