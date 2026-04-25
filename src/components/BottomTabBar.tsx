import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bookmark, Home, Library, Plus, User } from "lucide-react";
import { motion } from "framer-motion";
import TapButton from "./TapButton";
import { cn } from "@/lib/utils";

type Tab = {
  to: string;
  label: string;
  icon: typeof Home;
};

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/library", label: "Bibliothek", icon: Library },
  { to: "/templates", label: "Vorlagen", icon: Bookmark },
  { to: "/profile", label: "Profil", icon: User },
];

const TabItem = ({ tab }: { tab: Tab }) => {
  const Icon = tab.icon;
  return (
    <NavLink
      to={tab.to}
      end={tab.to === "/"}
      className="flex-1 flex items-center justify-center"
    >
      {({ isActive }) => (
        <motion.div
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors duration-200",
            isActive ? "text-brand" : "text-text-tertiary",
          )}
        >
          <Icon size={22} strokeWidth={isActive ? 2.25 : 2} />
          <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
        </motion.div>
      )}
    </NavLink>
  );
};

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGenerateOpen = location.pathname.startsWith("/generate");

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 glass-bar border-t border-white/[0.08]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative mx-auto flex h-16 max-w-md items-stretch">
        {/* Left two tabs */}
        <TabItem tab={TABS[0]} />
        <TabItem tab={TABS[1]} />

        {/* Spacer for center plus */}
        <div className="w-16 shrink-0" aria-hidden />

        {/* Right two tabs */}
        <TabItem tab={TABS[2]} />
        <TabItem tab={TABS[3]} />

        {/* Center Plus button — sits 6px above the bar */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: "-6px", transform: "translate(-50%, -6px)" }}
        >
          <TapButton
            aria-label="Neues Arbeitsblatt erstellen"
            onClick={() => navigate("/generate")}
            className={cn(
              "pointer-events-auto h-14 w-14 rounded-full bg-brand-gradient",
              "shadow-brand-glow animate-pulse-glow ring-1 ring-white/10",
            )}
          >
            <Plus
              size={26}
              strokeWidth={2.5}
              className={cn(
                "text-white transition-transform duration-200",
                isGenerateOpen && "rotate-45",
              )}
            />
          </TapButton>
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
