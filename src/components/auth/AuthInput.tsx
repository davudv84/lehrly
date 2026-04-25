import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  error?: string | null;
  /** Renders an Eye toggle on the right for password fields. */
  passwordToggle?: boolean;
};

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon, error, passwordToggle, className, type, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const resolvedType = passwordToggle ? (visible ? "text" : "password") : type;

    return (
      <div className="w-full">
        <div
          className={cn(
            "relative flex h-[52px] items-center rounded-input bg-surface border transition-colors",
            error
              ? "border-destructive/70 focus-within:border-destructive"
              : "border-white/10 focus-within:border-white/25",
          )}
        >
          {icon && (
            <span className="pointer-events-none absolute left-4 text-text-tertiary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={cn(
              "h-full w-full bg-transparent text-body text-text-primary placeholder:text-text-tertiary outline-none",
              icon ? "pl-11" : "pl-4",
              passwordToggle ? "pr-12" : "pr-4",
              className,
            )}
            {...props}
          />
          {passwordToggle && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary"
              aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
              tabIndex={-1}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 px-1 text-caption text-destructive">{error}</p>
        )}
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";

export default AuthInput;
