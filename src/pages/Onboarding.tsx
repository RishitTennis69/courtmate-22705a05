

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SkillQuiz from "@/components/SkillQuiz";
import UTRConverter from "@/components/UTRConverter";
import CalendarAvailability from "@/components/CalendarAvailability";

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_preferred: boolean;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    location: "",
    availability: "",
    goals: "",
    ntrpRating: 0,
    ratingMethod: "" // "quiz" or "utr"
  });
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 5; // Reduced from 6 steps
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
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

  const handleSkillQuizComplete = (ntrpRating: number) => {
    setFormData(prev => ({ ...prev, ntrpRating, ratingMethod: "quiz" }));
    handleNext();
  };

  const handleUTRConversionComplete = (ntrpRating: number) => {
    setFormData(prev => ({ ...prev, ntrpRating, ratingMethod: "utr" }));
    handleNext();
  };

  const handleAvailabilitySet = (slots: AvailabilitySlot[]) => {
    setAvailabilitySlots(slots);
    handleNext();
  };

  const completeOnboarding = async () => {
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          age: parseInt(formData.age),
          location: formData.location,
          current_rating: formData.ntrpRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Save availability slots
      if (availabilitySlots.length > 0) {
        const { error: availabilityError } = await supabase
          .from('user_availability')
          .insert(
            availabilitySlots.map(slot => ({
              user_id: user?.id,
              ...slot
            }))
          );

        if (availabilityError) throw availabilityError;
      }

      toast({
        title: "Profile Complete!",
        description: "Welcome to CourtMate! Let's find you some tennis partners.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete profile setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const steps = [
    { title: "Personal Info", description: "Tell us about yourself", icon: User, color: "from-blue-400 to-purple-500" },
    { title: "Location", description: "Where do you play?", icon: MapPin, color: "from-emerald-400 to-teal-500" },
    { title: "Rating Method", description: "How to assess your skill?", icon: Target, color: "from-orange-400 to-red-500" },
    { title: "Skill Assessment", description: "Determine your NTRP level", icon: Trophy, color: "from-yellow-400 to-orange-500" },
    { title: "Availability", description: "When do you play?", icon: Calendar, color: "from-green-400 to-blue-500" }
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
              <h2 className="font-bricolage text-3xl font-bold text-gray-900 mb-2">Rate Your Skills</h2>
              <p className="text-gray-600 text-lg">Choose how you'd like to determine your skill level</p>
            </div>
            
            <div className="space-y-4">
              <div 
                className={`flex items-center space-x-3 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/30 ${
                  formData.ratingMethod === "quiz" ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200'
                }`}
                onClick={() => updateFormData("ratingMethod", "quiz")}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  formData.ratingMethod === "quiz" ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                }`}>
                  {formData.ratingMethod === "quiz" && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <Label className="font-semibold text-gray-900 cursor-pointer text-lg">
                    Take NTRP Skill Quiz
                  </Label>
                  <p className="text-sm text-gray-600">Answer questions about your tennis skills and experience</p>
                </div>
              </div>
              <div 
                className={`flex items-center space-x-3 p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/30 ${
                  formData.ratingMethod === "utr" ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200'
                }`}
                onClick={() => updateFormData("ratingMethod", "utr")}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  formData.ratingMethod === "utr" ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                }`}>
                  {formData.ratingMethod === "utr" && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <Label className="font-semibold text-gray-900 cursor-pointer text-lg">
                    Convert UTR Rating
                  </Label>
                  <p className="text-sm text-gray-600">I already have a UTR rating to convert to NTRP</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        if (formData.ratingMethod === "quiz") {
          return <SkillQuiz onQuizComplete={handleSkillQuizComplete} />;
        } else if (formData.ratingMethod === "utr") {
          return <UTRConverter onConversionComplete={handleUTRConversionComplete} />;
        }
        return null;

      case 5:
        return <CalendarAvailability onAvailabilitySet={handleAvailabilitySet} />;

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
            Enhanced Setup
          </Badge>
          <h1 className="font-bricolage text-4xl font-bold text-gray-900 mb-2">
            Let's set up your profile
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Complete assessment to get the best tennis partner matches
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
        <div className="flex justify-center mb-12 overflow-x-auto">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive ? `bg-gradient-to-r ${step.color} shadow-lg scale-110` : 
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-1 rounded-full transition-all duration-300 ${
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
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep !== 4 && ( // Skip navigation on quiz/utr steps as they handle their own
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
              disabled={
                (currentStep === 1 && !formData.age) ||
                (currentStep === 2 && !formData.location) ||
                (currentStep === 3 && !formData.ratingMethod)
              }
              className="px-8 py-3 text-lg gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {currentStep === totalSteps ? "Complete Setup" : "Next Step"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;

