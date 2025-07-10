import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Trophy, ArrowRight, Zap, MapPin, Shield, Star, Play, CheckCircle, Sparkles, Target, Clock, Award } from "lucide-react";
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

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Advanced algorithms match you with perfect tennis partners based on skill, schedule, and availability",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Users,
      title: "Vibrant Community", 
      description: "Join a community of passionate tennis players and build lasting connections on and off the court",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Integrated calendar system finds the perfect time slots that work for both you and your partner",
      gradient: "from-green-400 to-teal-500"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Make your match details public and easily send them to a trusted contact within the app",
      gradient: "from-red-400 to-pink-500"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Build your tennis identity with our skill assessment and preferences setup",
      icon: Target,
      color: "bg-emerald-500"
    },
    {
      number: "02",
      title: "Find Perfect Matches",
      description: "Discover players who match your skill level, schedule, and availability",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      number: "03",
      title: "Play & Improve",
      description: "Schedule matches, track progress, and elevate your tennis game together",
      icon: Trophy,
      color: "bg-purple-500"
    }
  ];

  const testimonials = [
    {
      name: "Kairav Kumar",
      title: "Youth Regional Champion",
      rating: 5,
      text: "CourtMate has helped me improve so much, I constantly have a match to play when I want one with a player at my skill level. These close matches allow me to gain experience and improve every day. CourtMate is a must use!",
      avatar: "KK",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      name: "Punj Agrawal",
      title: "Youth State Champion",
      rating: 5,
      text: "CourtMate has made it so easy to find tennis partners near me who actually match my level. I've been playing more consistently and having way more fun on the court since I started using the app.",
      avatar: "PA",
      gradient: "from-blue-400 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-xl font-bricolage">C</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bricolage font-bold text-2xl text-gray-900 tracking-tight">CourtMate</span>
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 font-medium border-emerald-200/50 shadow-sm">
                  <Trophy className="w-3 h-3 mr-1" />
                  Tennis Community
                </Badge>
              </div>
            </div>
            
            {/* Navigation Links for larger screens */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#how-it-works" 
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Getting Started
              </a>
              <a 
                href="#features" 
                onClick={(e) => handleSmoothScroll(e, 'features')}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                onClick={(e) => handleSmoothScroll(e, 'testimonials')}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Reviews
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={handleSignIn} 
                className="font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleGetStarted} 
                className="gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-2.5 rounded-xl"
              >
                Get Started Free
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium Design */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-white">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 text-sm font-medium animate-slide-up">
              <Trophy className="mr-2 h-4 w-4" />
              #1 Tennis Community Platform
            </Badge>
            
            <h1 className="font-bricolage text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight animate-slide-up stagger-1">
              Find Your Perfect
              <br />
              <span className="gradient-text-primary">Tennis Partner</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up stagger-2">
              Connect with passionate tennis players, improve your skills, and build lasting friendships. 
              <br className="hidden md:block" />
              <span className="font-medium text-gray-800">Join the future of tennis networking.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up stagger-3">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-10 py-6 text-lg font-semibold gradient-primary text-white shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 animate-glow"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Playing Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Creative Design */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-2 font-medium">
              <Zap className="mr-2 h-4 w-4" />
              Getting Started Is Easy
            </Badge>
            <h2 className="font-bricolage text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Three Simple Steps to
              <br />
              <span className="gradient-text-primary">Tennis Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our community and start your tennis journey in minutes
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
              {/* Connection lines for desktop */}
              <div className="hidden lg:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-purple-200"></div>
              
              {steps.map((step, index) => (
                <div key={index} className="text-center relative group">
                  <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-all duration-300 relative z-10`}>
                    <step.icon className="w-8 h-8 text-white" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="font-bold text-sm text-gray-800">{step.number}</span>
                    </div>
                  </div>
                  
                  <Card className="glass-card floating-card border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="font-bricolage text-2xl text-gray-900">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center leading-relaxed text-gray-600 text-lg">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 py-4 text-lg gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Award className="mr-2 h-5 w-5" />
                Join the Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Modern Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-purple-100 text-purple-700 px-4 py-2 font-medium">
              <Sparkles className="mr-2 h-4 w-4" />
              Why Choose CourtMate?
            </Badge>
            <h2 className="font-bricolage text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              Everything You Need to
              <br />
              <span className="gradient-text-primary">Excel at Tennis</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover powerful features designed to elevate your tennis experience and connect you with the perfect playing partners
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card floating-card border-0 shadow-xl group overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${feature.gradient}`}></div>
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-bricolage text-2xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed text-gray-600 text-lg">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Premium Layout */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="font-bricolage text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              What Tennis Players Are
              <br />
              <span className="gradient-text-primary">Saying</span>
            </h2>
            <p className="text-xl text-gray-600">
              Join many satisfied players who found their perfect tennis partners using CourtMate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card floating-card border-0 shadow-2xl overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${testimonial.gradient}`}></div>
                <CardContent className="p-10">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-8 leading-relaxed text-lg italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className={`w-14 h-14 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bricolage font-semibold text-lg text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.1">
                <circle cx="30" cy="30" r="2"/>
              </g>
            </g>
          </svg>
        </div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="px-4 text-center relative max-w-7xl mx-auto">
          <h2 className="font-bricolage text-4xl md:text-6xl font-bold mb-8 text-white text-shadow">
            Ready to Transform Your
            <br />
            Tennis Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of tennis enthusiasts who are already using CourtMate to find amazing partners, 
            improve their skills, and build lasting tennis friendships.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              className="px-12 py-6 text-xl font-semibold bg-white text-emerald-600 hover:bg-gray-50 shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Play className="mr-3 h-6 w-6" />
              Start Playing Today
            </Button>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Badge className="bg-white/20 text-white px-8 py-4 text-xl font-bold border-2 border-white/30 backdrop-blur-sm shadow-2xl animate-pulse">
                <CheckCircle className="mr-3 h-6 w-6" />
                FREE TO JOIN
              </Badge>
              <div className="text-center sm:text-left">
                <p className="text-emerald-100 font-semibold text-xl">
                  No credit card required
                </p>
                <p className="text-emerald-200 text-lg">
                  Start connecting instantly
                </p>
              </div>
            </div>
          </div>
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
