import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Matches from "./pages/Matches";
import FindPlayers from "./pages/FindPlayers";
import Messages from "./pages/Messages";
import Circles from "./pages/Circles";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ProfileCompletionCheck from "./components/ProfileCompletionCheck";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is not authenticated, show routes without sidebar
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // If user is authenticated, show routes with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto">
              {/* You can add additional header content here */}
            </div>
          </header>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Dashboard />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/find-players" 
              element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <FindPlayers />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/matches" 
              element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Matches />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Messages />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/circles" 
              element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Circles />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Admin />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }>
            <AppContent />
          </Suspense>
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
