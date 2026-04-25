import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppShell from "@/components/AppShell";
import Index from "./pages/Index";
import Library from "./pages/Library";
import Templates from "./pages/Templates";
import Profile from "./pages/Profile";
import Generate from "./pages/Generate";
import Onboarding from "./pages/Onboarding";
import Intro from "./pages/Intro";
import { Login, Register } from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  // Generate is rendered as an overlay route on top of the previous location
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        {/* In-app routes share the bottom tab bar */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Index />} />
          <Route path="/library" element={<Library />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Auth + onboarding render outside the shell */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
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
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
