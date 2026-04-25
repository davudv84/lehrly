import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSeedDemoOnce } from "@/hooks/useSeedDemoOnce";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type EditField = "name" | "kuerzel" | "school" | null;

const Profile = () => {
  useSeedDemoOnce();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<EditField>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (editing && profile) {
      setDraft((profile[editing] as string | null) ?? "");
    }
  }, [editing, profile]);

  const save = async () => {
    if (!user || !editing) return;
    const value =
      editing === "kuerzel"
        ? draft.replace(/[^A-Za-zÄÖÜäöüß]/g, "").slice(0, 2).toUpperCase() || null
        : draft.trim() || null;
    const { error } = await supabase
      .from("profiles")
      .update({ [editing]: value })
      .eq("id", user.id);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    setEditing(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome", { replace: true });
  };

  const initials =
    (profile?.kuerzel ?? profile?.name?.split(" ").map((n) => n[0]).join("") ?? "L")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="px-5 pb-8">
      <header
        className="pb-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <h1 className="text-center text-[15px] font-semibold text-text-secondary">
          Profil / Einstellungen
        </h1>
      </header>

      {/* Avatar block */}
      <div className="mt-6 flex flex-col items-center text-center">
        <div className="relative">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-pill bg-brand-gradient text-[24px] font-bold text-white shadow-brand-glow"
          >
            {initials}
          </div>
        </div>
        <p className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-text-primary">
          {profile?.name?.trim() || "Lehrly Nutzer:in"}
        </p>
        <p className="mt-1 text-[13px] text-text-secondary">
          {profile?.default_kurstyp ?? "Lehrkraft"}
          {profile?.school ? ` · ${profile.school}` : ""}
        </p>
        <button
          onClick={() => setEditing("name")}
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[13px] font-medium text-brand"
        >
          <Pencil size={13} /> Bearbeiten
        </button>
      </div>

      {/* Profil section */}
      <Section label="Profil">
        <Row
          label="Name"
          value={profile?.name?.trim() || "Hinzufügen"}
          onClick={() => setEditing("name")}
        />
        <Row
          label="Kürzel"
          value={profile?.kuerzel || "—"}
          onClick={() => setEditing("kuerzel")}
        />
        <Row
          label="Schule"
          value={profile?.school?.trim() || "Hinzufügen"}
          onClick={() => setEditing("school")}
        />
      </Section>

      {/* Standards section */}
      <Section label="Standards">
        <Row label="Standard-Niveau" value={profile?.default_niveau ?? "A2"} />
        <Row label="Standard-Kurstyp" value={profile?.default_kurstyp ?? "Integrationskurs"} />
        <Row label="Standard-Aufgabentypen" value="Lückentext, Wortschatz" />
        <Row label="Standard-Umfang" value="6 Aufgaben" />
      </Section>

      {/* Account */}
      <Section label="Konto">
        <Row label="E-Mail" value={user?.email ?? ""} muted />
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-between border-t border-white/[0.06] px-4 py-3.5 text-left first:border-t-0"
        >
          <span className="flex items-center gap-2 text-[14px] font-medium text-destructive">
            <LogOut size={15} />
            Abmelden
          </span>
        </button>
      </Section>

      <p className="mt-6 text-center text-[11px] text-text-tertiary">Lehrly · v1.0</p>

      {/* Edit dialog */}
      {editing && (
        <EditDialog
          field={editing}
          draft={draft}
          setDraft={setDraft}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className="mt-7">
    <p className="section-label mb-2 px-1">{label}</p>
    <div className="overflow-hidden rounded-card border border-white/[0.06] bg-surface">
      {children}
    </div>
  </section>
);

const Row = ({
  label,
  value,
  onClick,
  muted,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  muted?: boolean;
}) => (
  <TapButton
    onClick={onClick}
    disabled={!onClick}
    className={cn(
      "flex w-full items-center justify-between border-t border-white/[0.06] px-4 py-3.5 text-left first:border-t-0",
      onClick ? "" : "cursor-default",
    )}
  >
    <span className="text-[14px] font-medium text-text-primary">{label}</span>
    <span className="flex items-center gap-1.5">
      <span className={cn("text-[13px]", muted ? "text-text-tertiary" : "text-text-secondary")}>
        {value}
      </span>
      {onClick && <ChevronRight size={16} className="text-text-tertiary" />}
    </span>
  </TapButton>
);

const FIELD_META: Record<Exclude<EditField, null>, { title: string; placeholder: string; max: number }> = {
  name: { title: "Name", placeholder: "z. B. Frau Müller", max: 80 },
  kuerzel: { title: "Kürzel (1–2 Buchstaben)", placeholder: "FM", max: 2 },
  school: { title: "Schule", placeholder: "z. B. VHS München", max: 80 },
};

const EditDialog = ({
  field,
  draft,
  setDraft,
  onCancel,
  onSave,
}: {
  field: Exclude<EditField, null>;
  draft: string;
  setDraft: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) => {
  const meta = FIELD_META[field];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg-base/70 backdrop-blur-md">
      <div
        className="mx-auto w-full max-w-md rounded-t-large border-t border-white/[0.06] bg-bg-elevated p-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-pill bg-white/15" />
        <p className="section-label mb-2">{meta.title}</p>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={meta.max}
          placeholder={meta.placeholder}
          className="h-12 w-full rounded-input border border-white/10 bg-surface px-4 text-[15px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-white/25"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="h-11 flex-1 rounded-input border border-white/10 bg-surface text-[14px] font-medium text-text-secondary"
          >
            Abbrechen
          </button>
          <button
            onClick={onSave}
            className="h-11 flex-1 rounded-input bg-brand-gradient text-[14px] font-semibold text-white shadow-brand-glow"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
