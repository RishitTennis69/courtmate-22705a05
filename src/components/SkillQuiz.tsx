
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: { value: string; label: string; points: number }[];
}

interface SkillQuizProps {
  onQuizComplete: (ntrpRating: number) => void;
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "How often do you play tennis?",
    options: [
      { value: "rarely", label: "Rarely or just starting", points: 1 },
      { value: "monthly", label: "1-2 times per month", points: 2 },
      { value: "weekly", label: "1-2 times per week", points: 3 },
      { value: "frequent", label: "3+ times per week", points: 4 }
    ]
  },
  {
    id: 2,
    question: "How would you describe your serve?",
    options: [
      { value: "basic", label: "Basic underhand or soft serve", points: 1 },
      { value: "developing", label: "Overhand serve, sometimes in", points: 2 },
      { value: "consistent", label: "Consistent serve with some pace", points: 3 },
      { value: "advanced", label: "Strong serve with spin and placement", points: 4 },
      { value: "weapon", label: "Serve is a major weapon", points: 5 }
    ]
  },
  {
    id: 3,
    question: "How consistent are your groundstrokes?",
    options: [
      { value: "learning", label: "Still learning basic strokes", points: 1 },
      { value: "inconsistent", label: "Can hit but often miss", points: 2 },
      { value: "moderate", label: "Fairly consistent in rallies", points: 3 },
      { value: "reliable", label: "Very consistent with good pace", points: 4 },
      { value: "advanced", label: "Consistent with spin and angles", points: 5 }
    ]
  },
  {
    id: 4,
    question: "How comfortable are you at the net?",
    options: [
      { value: "avoid", label: "I avoid coming to the net", points: 1 },
      { value: "basic", label: "Basic volleys when forced", points: 2 },
      { value: "comfortable", label: "Comfortable with volleys", points: 3 },
      { value: "aggressive", label: "Actively use net play", points: 4 },
      { value: "expert", label: "Net play is a strength", points: 5 }
    ]
  },
  {
    id: 5,
    question: "How is your court movement and positioning?",
    options: [
      { value: "limited", label: "Limited movement, struggle with positioning", points: 1 },
      { value: "basic", label: "Basic movement, sometimes out of position", points: 2 },
      { value: "good", label: "Good court coverage and positioning", points: 3 },
      { value: "excellent", label: "Excellent movement and anticipation", points: 4 },
      { value: "elite", label: "Elite court coverage and positioning", points: 5 }
    ]
  },
  {
    id: 6,
    question: "How well do you handle pressure situations?",
    options: [
      { value: "struggle", label: "Struggle under pressure", points: 1 },
      { value: "inconsistent", label: "Inconsistent under pressure", points: 2 },
      { value: "decent", label: "Handle pressure reasonably well", points: 3 },
      { value: "thrive", label: "Play well under pressure", points: 4 },
      { value: "clutch", label: "Thrive in pressure situations", points: 5 }
    ]
  },
  {
    id: 7,
    question: "What's your understanding of tennis strategy?",
    options: [
      { value: "basic", label: "Just try to get the ball over", points: 1 },
      { value: "simple", label: "Basic understanding of strategy", points: 2 },
      { value: "good", label: "Good tactical awareness", points: 3 },
      { value: "advanced", label: "Strong strategic thinking", points: 4 },
      { value: "expert", label: "Expert tactical knowledge", points: 5 }
    ]
  },
  {
    id: 8,
    question: "How would you rate your overall match play experience?",
    options: [
      { value: "beginner", label: "New to competitive play", points: 1 },
      { value: "some", label: "Some recreational matches", points: 2 },
      { value: "regular", label: "Regular competitive play", points: 3 },
      { value: "tournament", label: "Tournament experience", points: 4 },
      { value: "advanced", label: "Extensive competitive experience", points: 5 }
    ]
  }
];

const SkillQuiz = ({ onQuizComplete }: SkillQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    const question = questions[currentQuestion];
    const selectedOption = question.options.find(opt => opt.value === selectedAnswer);
    
    if (selectedOption) {
      setAnswers(prev => ({ ...prev, [question.id]: selectedOption.points }));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      // Calculate NTRP rating
      const totalPoints = Object.values({ ...answers, [question.id]: selectedOption?.points || 0 }).reduce((sum, points) => sum + points, 0);
      const averagePoints = totalPoints / questions.length;
      
      // Convert to NTRP scale (1.0 - 5.0)
      let ntrpRating: number;
      if (averagePoints <= 1.5) ntrpRating = 1.5;
      else if (averagePoints <= 2.0) ntrpRating = 2.0;
      else if (averagePoints <= 2.5) ntrpRating = 2.5;
      else if (averagePoints <= 3.0) ntrpRating = 3.0;
      else if (averagePoints <= 3.5) ntrpRating = 3.5;
      else if (averagePoints <= 4.0) ntrpRating = 4.0;
      else if (averagePoints <= 4.5) ntrpRating = 4.5;
      else ntrpRating = 5.0;

      onQuizComplete(ntrpRating);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer("");
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">NTRP Skill Assessment</h3>
        <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
        <Progress value={progress} className="mt-4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option) => (
              <div 
                key={option.value} 
                className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-emerald-50/30 hover:border-emerald-400 ${
                  selectedAnswer === option.value 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleAnswerSelect(option.value)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedAnswer === option.value 
                    ? 'border-emerald-500 bg-emerald-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === option.value && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="flex-1 text-base font-medium text-gray-900">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {currentQuestion === questions.length - 1 ? "Complete Assessment" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default SkillQuiz;
