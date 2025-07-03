
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Trophy, ArrowDown } from "lucide-react";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const features = [
    {
      icon: Users,
      title: "Smart Player Matching",
      description: "AI-powered recommendations based on skill level, playing style, and location"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Google Calendar integration to find mutual availability with other players"
    },
    {
      icon: MessageSquare,
      title: "Community & Chat",
      description: "Connect with players through direct messaging and tennis circles"
    },
    {
      icon: Trophy,
      title: "Dynamic Rating System",
      description: "Adaptive NTRP rating system that evolves based on match performance"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              🎾 The Future of Tennis Social Networking
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Court<span className="text-tennis-yellow">Mate</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find your perfect tennis partner, schedule matches with smart AI recommendations, 
              and join a community of players who share your passion for the game.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-tennis-green hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-xl"
                onClick={handleGetStarted}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-white/70" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Play More Tennis</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              CourtMate brings together intelligent matching, seamless scheduling, and vibrant community features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-tennis-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-tennis-green" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-tennis-green-light/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How CourtMate Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to start playing more tennis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-tennis-green rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Profile</h3>
              <p className="text-muted-foreground">Set up your profile with playing preferences, skill level, and availability through our smart onboarding process.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-tennis-green rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Find Perfect Matches</h3>
              <p className="text-muted-foreground">Our AI analyzes your preferences to recommend compatible players in your area with similar skill levels.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-tennis-green rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Play & Connect</h3>
              <p className="text-muted-foreground">Schedule matches, chat with players, and build lasting connections in the tennis community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 tennis-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Perfect Tennis Partner?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of tennis players who are already using CourtMate to improve their game and meet new people.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-tennis-green hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-xl"
            onClick={handleGetStarted}
          >
            Start Playing Today
          </Button>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
