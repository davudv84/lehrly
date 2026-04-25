import { cn } from "@/lib/utils";

/** 4-segment password strength meter. */
export function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score += 1;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

const LABELS = ["", "Schwach", "Okay", "Gut", "Stark"] as const;

const PasswordStrength = ({ value }: { value: string }) => {
  const score = getPasswordStrength(value);
  return (
    <div className="mt-2 px-1">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-pill transition-colors",
              i < score ? "bg-brand" : "bg-white/10",
            )}
          />
        ))}
      </div>
      {value && (
        <p className="mt-1.5 text-caption text-text-tertiary">
          Passwortstärke: <span className="text-text-secondary">{LABELS[score]}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrength;
