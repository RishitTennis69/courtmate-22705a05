
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Star,
  Plus,
  MessageCircle,
  Target,
  Zap,
  Award,
  Activity,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  const upcomingMatches = [
    {
      id: 1,
      opponent: "Sarah Johnson",
      date: "Today, 3:00 PM",
      location: "Central Park Tennis Courts",
      status: "confirmed",
      avatar: "SJ"
    },
    {
      id: 2,
      opponent: "Mike Chen",
      date: "Tomorrow, 10:00 AM", 
      location: "Riverside Tennis Club",
      status: "pending",
      avatar: "MC"
    }
  ];

  const recentMatches = [
    {
      id: 1,
      opponent: "Alex Rivera",
      result: "Won 6-4, 6-2",
      date: "2 days ago",
      ratingChange: "+0.1",
      avatar: "AR"
    },
    {
      id: 2,
      opponent: "Emma Davis", 
      result: "Lost 4-6, 6-3, 4-6",
      date: "1 week ago",
      ratingChange: "-0.05",
      avatar: "ED"
    }
  ];

  const stats = [
    { label: "Current Rating", value: "4.2", change: "+0.1", icon: Star, color: "text-yellow-500" },
    { label: "Matches Played", value: "23", change: "+2", icon: Trophy, color: "text-emerald-500" },
    { label: "Win Rate", value: "68%", change: "+5%", icon: TrendingUp, color: "text-blue-500" },
    { label: "Active Streak", value: "3W", change: "New!", icon: Zap, color: "text-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-bricolage text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.email?.split('@')[0]}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" onClick={signOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="font-bricolage text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-emerald-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Matches */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-bricolage text-2xl text-gray-900">Upcoming Matches</CardTitle>
                  <CardDescription>Your scheduled tennis matches</CardDescription>
                </div>
                <Button className="gradient-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Match
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-blue-500 text-white font-semibold">
                          {match.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{match.opponent}</h3>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {match.date}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {match.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={match.status === 'confirmed' ? 'default' : 'secondary'}>
                        {match.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-bricolage text-2xl text-gray-900">Recent Matches</CardTitle>
                <CardDescription>Your latest match results and rating changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold">
                          {match.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{match.opponent}</h3>
                        <p className="text-sm text-gray-600">{match.result} • {match.date}</p>
                      </div>
                    </div>
                    <Badge variant={match.ratingChange.startsWith('+') ? 'default' : 'destructive'}>
                      {match.ratingChange}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <Card className="glass-card border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-2xl font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bricolage text-xl font-bold text-gray-900 mb-1">
                    {user?.email?.split('@')[0]}
                  </h3>
                  <p className="text-gray-600 mb-4">NTRP Rating: 4.2</p>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-bricolage text-xl text-gray-900">This Month's Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Matches Played</span>
                    <span className="font-medium">8/10</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Rating Improvement</span>
                    <span className="font-medium">+0.2/+0.3</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">New Partners Met</span>
                    <span className="font-medium">5/7</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-bricolage text-xl text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-3" />
                  Find Players
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-3" />
                  Schedule Match
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Messages
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-3" />
                  Join Circles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
