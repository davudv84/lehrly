import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const FullScreenLoader = () => (
  <div className="flex min-h-dvh items-center justify-center bg-bg-base">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand" />
  </div>
);

/**
 * Requires a logged-in user. Sends finished-onboarding users into the app
 * and unfinished ones to /onboarding.
 */
export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location }} />;

  // Onboarding-not-done users should be sent to /onboarding for protected app routes.
  if (profile && !profile.onboarding_completed && !location.pathname.startsWith("/onboarding")) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

/** Sends already-logged-in users away from auth screens. */
export const RedirectIfAuthed = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (user) {
    return <Navigate to={profile?.onboarding_completed ? "/" : "/onboarding"} replace />;
  }
  return <>{children}</>;
};
