import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  ChevronDown,
  Loader2,
  ScanLine,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import NiveauBadge from "@/components/NiveauBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Original = {
  id: string;
  title: string;
  niveau: string;
  task_types: string[] | null;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const Scan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [originals, setOriginals] = useState<Original[]>([]);
  const [worksheetId, setWorksheetId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("worksheets")
        .select("id,title,niveau,task_types")
        .order("created_at", { ascending: false })
        .limit(50);
      setOriginals((data as Original[] | null) ?? []);
    })();
  }, [user]);

  const onPick = async (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(await fileToBase64(f));
  };

  const submit = async () => {
    if (!file || !preview || !user) {
      toast.error("Bitte zuerst ein Bild auswählen.");
      return;
    }
    setLoading(true);
    try {
      let imagePath: string | undefined;
      try {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { data: up } = await supabase.storage
          .from("correction-uploads")
          .upload(path, file, { upsert: false });
        if (up?.path) imagePath = up.path;
      } catch { /* non-fatal */ }

      const { data, error } = await supabase.functions.invoke("correct-worksheet", {
        body: {
          imageBase64: preview,
          worksheetId: worksheetId || undefined,
          studentName: studentName || undefined,
          imagePath,
        },
      });
      if (error || (data as { error?: string } | null)?.error) {
        toast.error((data as { error?: string } | null)?.error || error?.message || "Korrektur fehlgeschlagen");
        setLoading(false);
        return;
      }
      navigate(`/corrections/${(data as { id: string }).id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
      setLoading(false);
    }
  };

  const filteredAll = search
    ? originals.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()))
    : originals;
  const visible = showAll || search ? filteredAll : filteredAll.slice(0, 3);

  const ready = !!preview;

  return (
    <div className="px-5 pb-32">
      <header
        className="pb-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)" }}
      >
        <p className="section-label">KI-Korrektur</p>
        <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-[-0.022em] text-text-primary">
          Korrektur
        </h1>
        <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-text-secondary">
          Scanne ein ausgefülltes Arbeitsblatt. Lehrly erkennt die Antworten und
          erstellt die Korrektur automatisch.
        </p>
      </header>

      {/* Upload area */}
      {preview ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="relative overflow-hidden rounded-card ring-hairline bg-surface-1"
        >
          <img src={preview} alt="Vorschau" className="w-full max-h-[420px] object-contain bg-black/30" />
          <button
            onClick={() => { setPreview(null); setFile(null); }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-bg-base/70 text-text-primary"
            aria-label="Entfernen"
          >
            <X size={15} />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            hidden
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <ActionCard
            icon={<Camera size={20} />}
            title="Foto aufnehmen"
            subtitle="Arbeitsblatt mit der Kamera scannen"
            onClick={() => cameraRef.current?.click()}
          />
          <ActionCard
            icon={<Upload size={20} />}
            title="Datei hochladen"
            subtitle="PDF oder Bild auswählen"
            onClick={() => inputRef.current?.click()}
          />
        </div>
      )}

      {/* Workflow steps */}
      {!preview && (
        <section className="mt-8">
          <p className="section-label mb-3">So funktioniert's</p>
          <ol className="space-y-2.5">
            <Step n={1} label="Arbeitsblatt hochladen" />
            <Step n={2} label="Original auswählen" />
            <Step n={3} label="Korrektur starten" />
          </ol>
        </section>
      )}

      {/* Original picker */}
      <section className="mt-8">
        <p className="section-label mb-3">Original-Arbeitsblatt</p>
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Titel…"
            className="h-10 w-full rounded-input bg-surface-2 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none ring-hairline focus:bg-surface-3"
          />
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {visible.length === 0 && (
            <p className="rounded-card bg-surface-1 ring-hairline px-4 py-6 text-center text-[12.5px] text-text-tertiary">
              Keine Arbeitsblätter gefunden.
            </p>
          )}
          {visible.map((o) => {
            const selected = worksheetId === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setWorksheetId(selected ? "" : o.id)}
                className={cn(
                  "group flex items-center gap-3 rounded-card bg-surface-1 ring-hairline px-3.5 py-3 text-left transition-all",
                  selected
                    ? "ring-1 ring-brand/60 bg-brand-soft/40"
                    : "hover:bg-surface-2",
                )}
                style={selected ? { borderLeft: "3px solid hsl(var(--brand))" } : undefined}
              >
                <NiveauBadge niveau={o.niveau} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-text-primary">
                    {o.title}
                  </p>
                  {o.task_types && o.task_types.length > 0 && (
                    <p className="mt-0.5 truncate text-[11.5px] text-text-tertiary">
                      {o.task_types.slice(0, 2).join(" · ")}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!search && filteredAll.length > 3 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {showAll ? "Weniger anzeigen" : `Mehr anzeigen (${filteredAll.length - 3})`}
            <ChevronDown
              size={13}
              className={cn("transition-transform", showAll && "rotate-180")}
            />
          </button>
        )}
      </section>

      {/* Student name */}
      <section className="mt-8">
        <p className="section-label mb-2 text-text-tertiary">Schüler:in (optional)</p>
        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Name optional"
          className="h-10 w-full rounded-input bg-surface-2 px-3 text-[13.5px] text-text-primary placeholder:text-text-tertiary outline-none ring-hairline focus:bg-surface-3"
        />
      </section>

      {/* Sticky CTA above bottom nav */}
      <div
        className="fixed inset-x-0 z-30"
        style={{
          bottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
          backgroundColor: "rgba(14,15,17,0.92)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          borderTop: "1px solid hsl(var(--hairline) / 0.1)",
        }}
      >
        <div className="mx-auto w-full max-w-md px-5 py-3">
          {!ready && !loading && (
            <p className="mb-2 text-center text-[12px] text-text-tertiary">
              Lade zuerst ein ausgefülltes Arbeitsblatt hoch.
            </p>
          )}
          <button
            onClick={submit}
            disabled={!ready || loading}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-pill text-[14px] font-medium transition-all",
              ready && !loading
                ? "bg-brand text-primary-foreground hover:bg-brand-hover"
                : "bg-surface-2 text-text-tertiary cursor-not-allowed",
            )}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Korrigiere…
              </>
            ) : (
              <>
                <ScanLine size={16} /> Korrektur starten
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <TapButton
    onClick={onClick}
    className="flex h-36 flex-col items-start justify-between rounded-card bg-surface-1 ring-hairline p-4 text-left hover:bg-surface-2 transition-colors"
  >
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-primary">
      {icon}
    </div>
    <div>
      <p className="text-[13.5px] font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-[11.5px] leading-snug text-text-tertiary">{subtitle}</p>
    </div>
  </TapButton>
);

const Step = ({ n, label }: { n: number; label: string }) => (
  <li className="flex items-center gap-3">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[11px] font-semibold text-text-secondary ring-hairline">
      {n}
    </span>
    <span className="text-[13.5px] text-text-secondary">{label}</span>
  </li>
);

export default Scan;
