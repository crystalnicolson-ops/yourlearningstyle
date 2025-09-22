import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import QuizResults from "@/components/QuizResults";

import { quizQuestions, LearningStyle } from "@/data/quizQuestions";
// quiz questions and types are imported from src/data/quizQuestions

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, LearningStyle>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (style: LearningStyle) => {
    setAnswers(prev => ({
      ...prev,
      [quizQuestions[currentQuestion].id]: style
    }));

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateResults = () => {
    const scores = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0
    };

    Object.values(answers).forEach(style => {
      scores[style]++;
    });

    return scores;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const progress = ((Object.keys(answers).length) / quizQuestions.length) * 100;

  if (showResults) {
    return <QuizResults scores={calculateResults()} onRetake={resetQuiz} />;
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-primary overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 text-xs sm:text-sm">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-3xl font-bold text-white truncate">VARK Learning Style Quiz</h1>
            <p className="text-white/80 text-xs sm:text-base">Discover your preferred learning style</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4 sm:mb-8">
          <div className="flex justify-between text-white/80 text-xs sm:text-sm mb-2">
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mx-3 sm:mx-auto p-3 sm:p-8 bg-white/95 backdrop-blur-sm max-w-3xl">
          <h2 className="text-base sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-8 text-center leading-tight break-words">
            {question.question}
          </h2>

          <div className="space-y-2 sm:space-y-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full p-3 sm:p-6 h-auto text-left justify-start hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                onClick={() => handleAnswer(option.style)}
              >
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="text-xs sm:text-base leading-snug pr-2 break-words">{option.text}</span>
                  <ChevronRight className="h-3 w-3 sm:h-5 sm:w-5 opacity-50 flex-shrink-0" />
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-4 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
            Choose the option that best describes your preference
          </div>

          {/* Bottom progress indicator */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 text-center">
            <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              Question {currentQuestion + 1} / {quizQuestions.length}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;