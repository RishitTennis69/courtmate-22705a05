
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import FindPlayers from "./pages/FindPlayers";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Circles from "./pages/Circles";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileCompletionCheck from "./components/ProfileCompletionCheck";
import { AuthProvider } from "./contexts/AuthContext";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import MobileBottomNav from "./components/MobileBottomNav";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Dashboard />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/find-players" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <FindPlayers />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/matches" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Matches />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Messages />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/circles" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Circles />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Settings />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <Admin />
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <PWAInstallPrompt />
            <MobileBottomNav />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
