import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { RequireAuth, RedirectIfAuthed } from "@/components/RouteGuards";
import AppShell from "@/components/AppShell";
import FirstLaunch, { ONBOARDED_KEY } from "@/pages/onboarding/FirstLaunch";

import Index from "./pages/Index";
import Library from "./pages/Library";
import Templates from "./pages/Templates";
import Profile from "./pages/Profile";
import Generate from "./pages/Generate";
import Onboarding from "./pages/Onboarding";
import Intro from "./pages/Intro";
import Welcome from "./pages/Welcome";
import WorksheetDetail from "./pages/WorksheetDetail";
import Scan from "./pages/Scan";
import CorrectionResult from "./pages/CorrectionResult";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/Callback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const FirstLaunchGate = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) return; // logged-in users skip the marketing flow
    let onboarded = false;
    try {
      onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
    } catch {
      /* ignore */
    }
    if (onboarded) return;
    // Only intercept the first landing on root or login; never block other paths
    const p = location.pathname;
    if (p === "/" || p === "/auth/login") {
      navigate("/start", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <FirstLaunchGate />
      <Routes location={backgroundLocation ?? location}>
        {/* First-launch onboarding (no auth) */}
        <Route path="/start" element={<FirstLaunch />} />

        {/* Protected in-app routes share the bottom tab bar */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Index />} />
          <Route path="/library" element={<Library />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/worksheets/:id" element={<WorksheetDetail />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/corrections/:id" element={<CorrectionResult />} />
        </Route>

        <Route path="/welcome" element={<Welcome />} />

        {/* Onboarding requires auth but renders outside the shell */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          }
        />

        {/* Auth screens — redirect away if already signed in */}
        <Route
          path="/auth/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/auth/register"
          element={
            <RedirectIfAuthed>
              <Register />
            </RedirectIfAuthed>
          }
        />

        <Route path="/intro" element={<Intro />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {backgroundLocation && (
        <AnimatePresence>
          <Routes>
            <Route path="/generate" element={<Generate />} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
