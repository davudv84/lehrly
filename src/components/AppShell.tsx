import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import BottomTabBar from "./BottomTabBar";
import PageTransition from "./PageTransition";

/**
 * AppShell wraps in-app pages with the bottom tab bar and animated
 * page transitions. Auth and onboarding routes render outside this shell.
 */
const AppShell = () => {
  const location = useLocation();
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg-base">
      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <BottomTabBar />
    </div>
  );
};

export default AppShell;
