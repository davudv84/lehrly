import { NavLink } from "react-router-dom";
import { Bookmark, Home, Library, User } from "lucide-react";
import { motion } from "framer-motion";
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
            "relative flex flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-200",
            isActive ? "text-white" : "text-text-tertiary",
          )}
        >
          {isActive && (
            <span
              aria-hidden
              className="absolute -top-1 h-[1.5px] w-4 rounded-full bg-white"
            />
          )}
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
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 glass-bar border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative mx-auto flex h-14 max-w-md items-stretch">
        {TABS.map((t) => (
          <TabItem key={t.to} tab={t} />
        ))}
      </div>
    </nav>
  );
};

export default BottomTabBar;
