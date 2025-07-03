
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    location: "",
    skillLevel: "",
    playingStyle: "",
    availability: "",
  });
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-muted-foreground">We'll use this information to match you with the right players.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What's your skill level?</h2>
              <p className="text-muted-foreground">Choose the NTRP rating that best describes your current level.</p>
            </div>
            <RadioGroup value={formData.skillLevel} onValueChange={(value) => handleInputChange('skillLevel', value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="1.0-2.0" id="beginner" />
                  <div className="flex-1">
                    <Label htmlFor="beginner" className="font-medium">1.0 - 2.0 (Beginner)</Label>
                    <p className="text-sm text-muted-foreground">Learning basic strokes and rules</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="2.5-3.0" id="intermediate" />
                  <div className="flex-1">
                    <Label htmlFor="intermediate" className="font-medium">2.5 - 3.0 (Intermediate)</Label>
                    <p className="text-sm text-muted-foreground">Consistent groundstrokes, learning strategy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="3.5-4.0" id="advanced" />
                  <div className="flex-1">
                    <Label htmlFor="advanced" className="font-medium">3.5 - 4.0 (Advanced)</Label>
                    <p className="text-sm text-muted-foreground">Good control, variety of shots</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="4.5+" id="expert" />
                  <div className="flex-1">
                    <Label htmlFor="expert" className="font-medium">4.5+ (Expert)</Label>
                    <p className="text-sm text-muted-foreground">Tournament level play</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What's your playing style?</h2>
              <p className="text-muted-foreground">This helps us match you with compatible players.</p>
            </div>
            <RadioGroup value={formData.playingStyle} onValueChange={(value) => handleInputChange('playingStyle', value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="aggressive" id="aggressive" />
                  <div className="flex-1">
                    <Label htmlFor="aggressive" className="font-medium">Aggressive</Label>
                    <p className="text-sm text-muted-foreground">Fast-paced, attacking style</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="defensive" id="defensive" />
                  <div className="flex-1">
                    <Label htmlFor="defensive" className="font-medium">Defensive</Label>
                    <p className="text-sm text-muted-foreground">Consistent, patient baseline play</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="all-court" id="all-court" />
                  <div className="flex-1">
                    <Label htmlFor="all-court" className="font-medium">All-Court</Label>
                    <p className="text-sm text-muted-foreground">Versatile, adaptable game</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">When do you prefer to play?</h2>
              <p className="text-muted-foreground">We'll help schedule matches during your preferred times.</p>
            </div>
            <RadioGroup value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="mornings" id="mornings" />
                  <div className="flex-1">
                    <Label htmlFor="mornings" className="font-medium">Mornings (6AM - 12PM)</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="afternoons" id="afternoons" />
                  <div className="flex-1">
                    <Label htmlFor="afternoons" className="font-medium">Afternoons (12PM - 6PM)</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="evenings" id="evenings" />
                  <div className="flex-1">
                    <Label htmlFor="evenings" className="font-medium">Evenings (6PM - 10PM)</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="weekends" id="weekends" />
                  <div className="flex-1">
                    <Label htmlFor="weekends" className="font-medium">Weekends</Label>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Getting Started</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="mb-2" />
          <CardDescription>
            Let's set up your tennis profile to find the perfect matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
              {currentStep !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
