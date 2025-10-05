import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleRedirect from "./pages/RoleRedirect";
import StudentDashboard from "./pages/student/StudentDashboard";
import OrgDashboard from "./pages/org/OrgDashboard";
import Lessons from "./pages/Lessons";
import LessonPlayer from "./pages/LessonPlayer";
import Missions from "./pages/Missions";
import MissionSubmission from "./pages/MissionSubmission";
import Profile from "./pages/Profile";
import AvailableBadgesPage from "./pages/AvailableBadgesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            } />
            <Route path="/student/dashboard" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/org/dashboard" element={
              <ProtectedRoute>
                <OrgDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/lessons" element={
              <ProtectedRoute>
                <Lessons />
              </ProtectedRoute>
            } />
            <Route path="/student/lesson/:id" element={
              <ProtectedRoute>
                <LessonPlayer />
              </ProtectedRoute>
            } />
            <Route path="/student/missions" element={
              <ProtectedRoute>
                <Missions />
              </ProtectedRoute>
            } />
            <Route path="/student/mission/:id/submit" element={
              <ProtectedRoute>
                <MissionSubmission />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/student/badges" element={
              <ProtectedRoute>
                <AvailableBadgesPage />
              </ProtectedRoute>
            } />
            {/* Legacy routes - redirect to new structure */}
            <Route path="/lessons" element={
              <ProtectedRoute>
                <Lessons />
              </ProtectedRoute>
            } />
            <Route path="/lesson/:id" element={
              <ProtectedRoute>
                <LessonPlayer />
              </ProtectedRoute>
            } />
            <Route path="/missions" element={
              <ProtectedRoute>
                <Missions />
              </ProtectedRoute>
            } />
            <Route path="/mission/:id/submit" element={
              <ProtectedRoute>
                <MissionSubmission />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/badges" element={
              <ProtectedRoute>
                <AvailableBadgesPage />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
