
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Trophy, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const stats = [
    { icon: Users, label: "Matches Played", value: "12", color: "text-blue-600" },
    { icon: Trophy, label: "Current Rating", value: "4.2", color: "text-green-600" },
    { icon: MessageSquare, label: "Active Chats", value: "8", color: "text-purple-600" },
    { icon: Calendar, label: "Upcoming", value: "3", color: "text-orange-600" },
  ];

  const recentMatches = [
    { opponent: "Sarah Johnson", score: "6-4, 6-2", date: "2 days ago", result: "Win" },
    { opponent: "Mike Chen", score: "4-6, 6-3, 6-4", date: "1 week ago", result: "Win" },
    { opponent: "Emma Davis", score: "6-7, 4-6", date: "2 weeks ago", result: "Loss" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">CourtMate</h1>
            <Badge variant="secondary">Dashboard</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Your latest tennis matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{match.opponent}</p>
                      <p className="text-sm text-muted-foreground">{match.score}</p>
                      <p className="text-xs text-muted-foreground">{match.date}</p>
                    </div>
                    <Badge variant={match.result === 'Win' ? 'default' : 'secondary'}>
                      {match.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>What would you like to do today?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Users className="h-6 w-6" />
                  <span>Find Players</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Calendar className="h-6 w-6" />
                  <span>Schedule Match</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <MessageSquare className="h-6 w-6" />
                  <span>Messages</span>
                </Button>
                <Button className="h-20 flex-col space-y-2" variant="outline">
                  <Trophy className="h-6 w-6" />
                  <span>View Stats</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
