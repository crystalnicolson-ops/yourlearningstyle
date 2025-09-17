import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Headphones, BookOpen, Hand, RotateCcw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface QuizResultsProps {
  scores: {
    visual: number;
    auditory: number;
    reading: number;
    kinesthetic: number;
  };
  onRetake: () => void;
}

const learningStyles = {
  visual: {
    name: "Visual Learner",
    icon: Eye,
    color: "bg-blue-500",
    description: "You learn best through seeing and visual aids",
    strengths: [
      "Remember information through images and spatial relationships",
      "Prefer charts, diagrams, and visual demonstrations",
      "Think in pictures and visualize concepts",
      "Organize information visually (mind maps, flowcharts)"
    ],
    studyTips: [
      "Use colorful notes and highlighters",
      "Create mind maps and diagrams",
      "Watch educational videos and demonstrations",
      "Use flashcards with images and charts",
      "Organize your study space visually"
    ]
  },
  auditory: {
    name: "Auditory Learner",
    icon: Headphones,
    color: "bg-green-500",
    description: "You learn best through listening and speaking",
    strengths: [
      "Remember information through sound and rhythm",
      "Prefer lectures, discussions, and verbal explanations",
      "Think out loud and benefit from talking through problems",
      "Good at following spoken directions"
    ],
    studyTips: [
      "Record lectures and listen to them again",
      "Study with background music",
      "Join study groups and discuss topics",
      "Read notes out loud",
      "Use audio learning resources and podcasts"
    ]
  },
  reading: {
    name: "Reading/Writing Learner",
    icon: BookOpen,
    color: "bg-purple-500",
    description: "You learn best through reading and writing",
    strengths: [
      "Remember information through written words",
      "Prefer reading textbooks and taking detailed notes",
      "Think through writing and organizing thoughts on paper",
      "Excel at written assignments and reports"
    ],
    studyTips: [
      "Take comprehensive written notes",
      "Rewrite information in your own words",
      "Use lists, outlines, and written summaries",
      "Read additional materials on topics",
      "Practice writing essays and explanations"
    ]
  },
  kinesthetic: {
    name: "Kinesthetic Learner",
    icon: Hand,
    color: "bg-orange-500",
    description: "You learn best through hands-on activities and movement",
    strengths: [
      "Remember information through physical activity",
      "Prefer hands-on experiments and practical applications",
      "Think while moving and benefit from physical activity",
      "Learn through trial and error"
    ],
    studyTips: [
      "Use hands-on activities and experiments",
      "Take study breaks to move around",
      "Use manipulatives and physical models",
      "Practice skills through real-world applications",
      "Study while walking or doing light exercise"
    ]
  }
};

const QuizResults = ({ scores, onRetake }: QuizResultsProps) => {
  // Find the dominant learning style
  const dominantStyle = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
  )[0] as keyof typeof scores;

  const styleInfo = learningStyles[dominantStyle];
  const StyleIcon = styleInfo.icon;

  // Get secondary styles (scores > 0)
  const secondaryStyles = Object.entries(scores)
    .filter(([style, score]) => style !== dominantStyle && score > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Your Learning Style Results</h1>
          <p className="text-white/80 text-lg">Based on your quiz responses</p>
        </div>

        {/* Main Result */}
        <Card className="p-8 bg-white/95 backdrop-blur-sm max-w-4xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 ${styleInfo.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <StyleIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{styleInfo.name}</h2>
            <p className="text-gray-600 text-lg">{styleInfo.description}</p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(scores).map(([style, score]) => {
              const info = learningStyles[style as keyof typeof learningStyles];
              const InfoIcon = info.icon;
              const percentage = (score / 8) * 100;
              
              return (
                <div key={style} className="text-center">
                  <div className={`w-12 h-12 ${style === dominantStyle ? info.color : 'bg-gray-300'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <InfoIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-semibold">{info.name.split(' ')[0]}</div>
                  <div className="text-2xl font-bold text-primary">{score}/8</div>
                  <div className="text-sm text-gray-600">{Math.round(percentage)}%</div>
                </div>
              );
            })}
          </div>

          {/* Strengths */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Learning Strengths:</h3>
            <div className="grid gap-3">
              {styleInfo.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Study Tips */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Personalized Study Tips:</h3>
            <div className="grid gap-3">
              {styleInfo.studyTips.map((tip, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Styles */}
          {secondaryStyles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Secondary Learning Preferences:</h3>
              <div className="flex flex-wrap gap-2">
                {secondaryStyles.map(([style, score]) => {
                  const info = learningStyles[style as keyof typeof learningStyles];
                  return (
                    <Badge key={style} variant="secondary" className="px-3 py-1">
                      {info.name}: {score}/8
                    </Badge>
                  );
                })}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You may also benefit from incorporating these learning approaches
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onRetake} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
            <Link to="/">
              <Button className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Start Learning
              </Button>
            </Link>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Ready to Apply Your Learning Style?</h3>
          <p className="text-gray-600 text-center mb-4">
            Upload your study materials and we'll transform them to match your {styleInfo.name.toLowerCase()} preferences!
          </p>
          <div className="text-center">
            <Link to="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Upload Your First Document
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizResults;