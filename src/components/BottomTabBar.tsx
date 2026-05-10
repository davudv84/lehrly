import { NavLink } from "react-router-dom";
import { ClipboardCheck, Home, Library, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = {
  to: string;
  label: string;
  icon: typeof Home;
};

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/library", label: "Bibliothek", icon: Library },
  { to: "/scan", label: "Korrektur", icon: ClipboardCheck },
  { to: "/profile", label: "Profil", icon: User },
];

const TabItem = ({ tab }: { tab: Tab }) => {
  const Icon = tab.icon;
  const reduce = useReducedMotion();
  return (
    <NavLink to={tab.to} end={tab.to === "/"} className="flex-1 flex items-center justify-center">
      {({ isActive }) => (
        <motion.div
          whileTap={reduce ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.08, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 py-1.5 transition-colors duration-200",
          )}
          style={{ color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}
        >
          {isActive && (
            <span
              aria-hidden
              className="absolute -top-1 h-[1.5px] w-3 rounded-full bg-white"
            />
          )}
          <Icon size={20} strokeWidth={isActive ? 2.1 : 1.7} />
          <span
            className="font-medium uppercase"
            style={{ fontSize: 10, letterSpacing: "0.04em" }}
          >
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline/10"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        backgroundColor: "rgba(14,15,17,0.85)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
      }}
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
