
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Trophy, ArrowRight, Zap, MapPin, Shield, Star } from "lucide-react";
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
      icon: Zap,
      title: "Smart Matching",
      description: "AI-powered algorithm matches you with players of similar skill level and availability"
    },
    {
      icon: Users,
      title: "Local Community",
      description: "Connect with tennis players in your area and build lasting tennis friendships"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Coordinate matches with integrated calendar and availability tracking"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Safe and verified community with trusted player profiles and reviews"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Profile",
      description: "Create your account and complete a simple NTRP assessment"
    },
    {
      number: "2",
      title: "Find Players",
      description: "Browse players at your skill level who match your schedule"
    },
    {
      number: "3",
      title: "Play Tennis",
      description: "Connect, schedule matches, and enjoy playing with perfect partners"
    }
  ];

  const testimonials = [
    {
      name: "Kairav Kumar",
      title: "UTR Tennis Champion",
      rating: 5,
      text: "CourtMate has helped me improve so much. I constantly have a match to play when I want one with a player at my skill level. These close matches allow me to gain experience and mentally be prepared for such situations. CourtMate is a must use!",
      avatar: "KK"
    },
    {
      name: "Punj Agrawal",
      title: "State Level Tennis Champion",
      rating: 5,
      text: "CourtMate has made it so easy to find tennis partners near me who actually match my level. I've been playing more consistently and having way more fun on the court since I started using the website.",
      avatar: "PA"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl">CourtMate</span>
            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Tennis Partner Platform
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-emerald-50/30"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              #1 Tennis Community Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Find Your Perfect
              <br />
              <span className="text-emerald-500">Tennis Partner</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with local tennis players, improve your game, and build lasting friendships on and off the court.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg font-medium bg-emerald-500 hover:bg-emerald-600"
                onClick={handleGetStarted}
              >
                Start Playing Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg border-emerald-200 hover:bg-emerald-50"
              >
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Getting Started
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Tennis Match
              <br />
              <span className="text-emerald-500">in 3 Easy Steps</span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-emerald-200"></div>
              
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold relative z-10">
                    {step.number}
                  </div>
                  <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handleGetStarted}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-emerald-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Why Choose CourtMate?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <br />
              <span className="text-emerald-500">Excel at Tennis</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the largest tennis community platform and discover your perfect playing partner today
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Players Say</h2>
            <p className="text-xl text-muted-foreground">
              Trusted by thousands of tennis enthusiasts worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Perfect Tennis Partner?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of tennis players who are already using CourtMate to improve their game and meet new people.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="px-8 py-6 text-lg font-medium bg-white text-emerald-500 hover:bg-gray-50"
            onClick={handleGetStarted}
          >
            Start Playing Today
            <ArrowRight className="ml-2 h-5 w-5" />
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
