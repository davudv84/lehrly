import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/context/AuthContext";
import { RequireAuth, RedirectIfAuthed } from "@/components/RouteGuards";
import AppShell from "@/components/AppShell";

import Index from "./pages/Index";
import Library from "./pages/Library";
import Templates from "./pages/Templates";
import Profile from "./pages/Profile";
import Generate from "./pages/Generate";
import Onboarding from "./pages/Onboarding";
import Intro from "./pages/Intro";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
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
        </Route>

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
