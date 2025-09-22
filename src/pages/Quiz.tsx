import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import QuizResults from "@/components/QuizResults";

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    style: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  }[];
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "When learning something new, I prefer to:",
    options: [
      { text: "See diagrams, charts, or visual demonstrations", style: 'visual' },
      { text: "Listen to explanations or discussions", style: 'auditory' },
      { text: "Read detailed instructions or texts", style: 'reading' },
      { text: "Practice hands-on or try it myself", style: 'kinesthetic' }
    ]
  },
  {
    id: 2,
    question: "When remembering information, I find it easier to recall:",
    options: [
      { text: "Pictures, graphs, or visual layouts", style: 'visual' },
      { text: "Conversations or things I've heard", style: 'auditory' },
      { text: "Written notes or text I've read", style: 'reading' },
      { text: "Things I've practiced or physically done", style: 'kinesthetic' }
    ]
  },
  {
    id: 3,
    question: "When giving directions to someone, I would:",
    options: [
      { text: "Draw a map or show them visually", style: 'visual' },
      { text: "Tell them step by step verbally", style: 'auditory' },
      { text: "Write down the directions", style: 'reading' },
      { text: "Walk with them to show the way", style: 'kinesthetic' }
    ]
  },
  {
    id: 4,
    question: "When studying for an exam, I prefer to:",
    options: [
      { text: "Use flashcards, diagrams, or mind maps", style: 'visual' },
      { text: "Discuss topics with others or record myself", style: 'auditory' },
      { text: "Read and rewrite notes multiple times", style: 'reading' },
      { text: "Use practice problems or real examples", style: 'kinesthetic' }
    ]
  },
  {
    id: 5,
    question: "In a classroom, I learn best when:",
    options: [
      { text: "The teacher uses slides, videos, or visual aids", style: 'visual' },
      { text: "There are discussions and verbal explanations", style: 'auditory' },
      { text: "I can take detailed written notes", style: 'reading' },
      { text: "There are activities, labs, or hands-on work", style: 'kinesthetic' }
    ]
  },
  {
    id: 6,
    question: "When I need to concentrate, I:",
    options: [
      { text: "Need a clean, organized visual environment", style: 'visual' },
      { text: "Can work with background music or sounds", style: 'auditory' },
      { text: "Prefer quiet with written materials nearby", style: 'reading' },
      { text: "Need to move around or use fidget tools", style: 'kinesthetic' }
    ]
  },
  {
    id: 7,
    question: "When learning a new skill, I:",
    options: [
      { text: "Watch demonstrations or video tutorials", style: 'visual' },
      { text: "Listen to instructions and explanations", style: 'auditory' },
      { text: "Read manuals or step-by-step guides", style: 'reading' },
      { text: "Jump in and learn by doing", style: 'kinesthetic' }
    ]
  },
  {
    id: 8,
    question: "When problem-solving, I tend to:",
    options: [
      { text: "Visualize the problem and draw it out", style: 'visual' },
      { text: "Talk through it with others", style: 'auditory' },
      { text: "Write down pros and cons", style: 'reading' },
      { text: "Try different approaches until something works", style: 'kinesthetic' }
    ]
  }
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'visual' | 'auditory' | 'reading' | 'kinesthetic'>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (style: 'visual' | 'auditory' | 'reading' | 'kinesthetic') => {
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
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl font-bold text-white">VARK Learning Style Quiz</h1>
            <p className="text-white/80 text-sm sm:text-base">Discover your preferred learning style</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4 sm:mb-8">
          <div className="flex justify-between text-white/80 text-sm mb-2">
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="p-4 sm:p-8 bg-white/95 backdrop-blur-sm max-w-3xl mx-auto">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8 text-center">
            {question.question}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full p-4 sm:p-6 h-auto text-left justify-start hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                onClick={() => handleAnswer(option.style)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm sm:text-base">{option.text}</span>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 opacity-50" />
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
            Choose the option that best describes your preference
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;