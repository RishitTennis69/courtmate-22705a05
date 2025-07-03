
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
import MobileOptimizedHeader from "./components/MobileOptimizedHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

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
      <>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <PWAInstallPrompt />
      </>
    );
  }

  // Mobile layout with header and bottom navigation
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <MobileOptimizedHeader />
        <main className="flex-1 overflow-auto">
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
        </main>
        <MobileBottomNav />
        <PWAInstallPrompt />
      </div>
    );
  }

  // Desktop layout with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
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
      <PWAInstallPrompt />
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
