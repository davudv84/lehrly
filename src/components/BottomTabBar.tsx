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
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-200",
            isActive ? "text-text-primary" : "text-text-tertiary",
          )}
        >
          <Icon size={20} strokeWidth={isActive ? 2.1 : 1.7} />
          <span className="text-[10px] font-medium tracking-tight">
            {tab.label}
          </span>
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
      className="fixed inset-x-0 bottom-0 z-40 glass-bar border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative mx-auto flex h-16 max-w-md items-stretch">
        <TabItem tab={TABS[0]} />
        <TabItem tab={TABS[1]} />

        {/* Spacer for center plus */}
        <div className="w-16 shrink-0" aria-hidden />

        <TabItem tab={TABS[2]} />
        <TabItem tab={TABS[3]} />

        {/* Center Plus button — calmer (no glow, soft ring) */}
        <div
          className="pointer-events-none absolute left-1/2"
          style={{ transform: "translate(-50%, -22px)" }}
        >
          <TapButton
            aria-label="Neues Arbeitsblatt erstellen"
            onClick={() => navigate("/generate")}
            className={cn(
              "pointer-events-auto h-12 w-12 rounded-pill bg-brand text-primary-foreground transition-transform duration-300",
              "shadow-[0_8px_24px_-10px_hsl(var(--brand)/0.5)] ring-1 ring-brand-hover/40",
              "hover:bg-brand-hover",
              isGenerateOpen && "rotate-45",
            )}
          >
            <Plus size={22} strokeWidth={2.2} />
          </TapButton>
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
