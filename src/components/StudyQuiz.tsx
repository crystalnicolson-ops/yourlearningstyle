import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Plus, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    setIsGeneratingMore(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          content: originalContent + `\n\n[Generate ${questions.length + 3} additional unique questions different from these existing ones: ${questions.map(q => q.question).join('; ')}]`
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

  const downloadQuiz = () => {
    if (!questions || questions.length === 0) return;
    
    // Create structured quiz format
    const quizData = {
      title: "Study Quiz",
      questions: questions.map((q, index) => ({
        number: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      })),
      totalQuestions: questions.length,
      exportedAt: new Date().toISOString()
    };
    
    const jsonContent = JSON.stringify(quizData, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Quiz downloaded as JSON!",
    });
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
              variant="outline"
              onClick={downloadQuiz}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
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
          </div>
        </div>

        <Card className="p-8 bg-white/95 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="text-6xl font-bold text-primary">
              {score.percentage}%
            </div>
            <div className="text-xl text-gray-600">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Study Quiz</h2>
          <p className="text-white/80">Test your knowledge • {questions.length} questions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadQuiz}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            onClick={generateMoreQuestions}
            disabled={isGeneratingMore}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
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
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-white/80 text-sm mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="p-8 bg-white/95 backdrop-blur-sm">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
          {question.question}
        </h3>

        <div className="space-y-3">
          {Object.entries(question.options).map(([option, text]) => {
            let buttonClass = "w-full p-4 text-left justify-start border-2 transition-all duration-200";
            
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
                <span className="font-semibold mr-3">{option}.</span>
                {text}
              </Button>
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              <Button onClick={handleNext}>
                {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudyQuiz;