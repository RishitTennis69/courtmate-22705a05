
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target,
  CheckCircle,
  Star,
  Clock,
  Zap
} from "lucide-react";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    playingStyle: "",
    experience: "",
    availability: "",
    goals: ""
  });
  const navigate = useNavigate();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    {
      title: "Personal Info",
      description: "Tell us about yourself",
      icon: User,
      color: "from-blue-400 to-purple-500"
    },
    {
      title: "Location & Preferences", 
      description: "Where do you like to play?",
      icon: MapPin,
      color: "from-emerald-400 to-teal-500"
    },
    {
      title: "Playing Style",
      description: "What's your tennis style?",
      icon: Target,
      color: "from-orange-400 to-red-500"
    },
    {
      title: "Skill Assessment",
      description: "Help us understand your level",
      icon: Trophy,
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Availability",
      description: "When do you prefer to play?",
      icon: Calendar,
      color: "from-purple-400 to-pink-500"
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-bricolage text-3xl font-bold text-gray-900 mb-2">Welcome to CourtMate!</h2>
              <p className="text-gray-600 text-lg">Let's get to know you better</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-medium text-gray-900">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-base font-medium text-gray-900">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-bricolage text-3xl font-bold text-gray-900 mb-2">Where do you play?</h2>
              <p className="text-gray-600 text-lg">Help us find players near you</p>
            </div>
            
            <div>
              <Label htmlFor="location" className="text-base font-medium text-gray-900">Location</Label>
              <Input
                id="location"
                placeholder="City, State or ZIP code"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-bricolage text-3xl font-bold text-gray-900 mb-2">Playing Style</h2>
              <p className="text-gray-600 text-lg">What describes your tennis style best?</p>
            </div>
            
            <RadioGroup value={formData.playingStyle} onValueChange={(value) => updateFormData("playingStyle", value)}>
              <div className="space-y-3">
                {[
                  { value: "aggressive", label: "Aggressive Baseliner", desc: "Power shots from the baseline" },
                  { value: "defensive", label: "Defensive Counter-Puncher", desc: "Strategic defensive play" },
                  { value: "serve-volley", label: "Serve & Volley", desc: "Net-rushing style" },
                  { value: "all-court", label: "All-Court Player", desc: "Versatile playing style" }
                ].map((style) => (
                  <div key={style.value} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-200">
                    <RadioGroupItem value={style.value} id={style.value} />
                    <div className="flex-1">
                      <Label htmlFor={style.value} className="font-semibold text-gray-900 cursor-pointer">
                        {style.label}
                      </Label>
                      <p className="text-sm text-gray-600">{style.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-bricolage text-3xl font-bold text-gray-900 mb-2">Skill Level</h2>
              <p className="text-gray-600 text-lg">How would you rate your tennis skills?</p>
            </div>
            
            <RadioGroup value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: "beginner", label: "Beginner", desc: "NTRP 1.0-2.5", stars: 1 },
                  { value: "intermediate", label: "Intermediate", desc: "NTRP 3.0-3.5", stars: 3 },
                  { value: "advanced", label: "Advanced", desc: "NTRP 4.0-4.5", stars: 4 },
                  { value: "expert", label: "Expert", desc: "NTRP 5.0+", stars: 5 }
                ].map((level) => (
                  <div key={level.value} className="flex items-center space-x-3 p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-200">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <div className="flex-1">
                      <Label htmlFor={level.value} className="font-semibold text-gray-900 cursor-pointer text-lg">
                        {level.label}
                      </Label>
                      <p className="text-sm text-gray-600 mb-2">{level.desc}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < level.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-bricolage text-3xl font-bold text-gray-900 mb-2">When do you play?</h2>
              <p className="text-gray-600 text-lg">Tell us your preferred playing times</p>
            </div>
            
            <RadioGroup value={formData.availability} onValueChange={(value) => updateFormData("availability", value)}>
              <div className="space-y-3">
                {[
                  { value: "morning", label: "Morning (6 AM - 12 PM)", icon: "🌅" },
                  { value: "afternoon", label: "Afternoon (12 PM - 6 PM)", icon: "☀️" },
                  { value: "evening", label: "Evening (6 PM - 10 PM)", icon: "🌆" },
                  { value: "weekend", label: "Weekends Only", icon: "🏖️" },
                  { value: "flexible", label: "Flexible - Anytime", icon: "⏰" }
                ].map((time) => (
                  <div key={time.value} className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-200">
                    <RadioGroupItem value={time.value} id={time.value} />
                    <span className="text-2xl">{time.icon}</span>
                    <Label htmlFor={time.value} className="font-semibold text-gray-900 cursor-pointer text-lg">
                      {time.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 px-4 py-2 font-medium">
            <Zap className="mr-2 h-4 w-4" />
            Quick Setup
          </Badge>
          <h1 className="font-bricolage text-4xl font-bold text-gray-900 mb-2">
            Let's set up your profile
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            This will help us match you with the perfect tennis partners
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-emerald-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive ? `bg-gradient-to-r ${step.color} shadow-lg scale-110` : 
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <step.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                      stepNumber < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <Card className="glass-card border-0 shadow-2xl max-w-2xl mx-auto">
          <CardContent className="p-12">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-8 py-3 text-lg border-2"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          
          <Button
            onClick={handleNext}
            className="px-8 py-3 text-lg gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {currentStep === totalSteps ? "Complete Setup" : "Next Step"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
