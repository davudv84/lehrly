import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, FileImage, Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import { toast } from "sonner";

type Original = { id: string; title: string; niveau: string };

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

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("worksheets")
        .select("id,title,niveau")
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
      // optional upload to storage
      let imagePath: string | undefined;
      try {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { data: up } = await supabase.storage
          .from("correction-uploads")
          .upload(path, file, { upsert: false });
        if (up?.path) imagePath = up.path;
      } catch {
        /* non-fatal */
      }

      const { data, error } = await supabase.functions.invoke("correct-worksheet", {
        body: {
          imageBase64: preview,
          worksheetId: worksheetId || undefined,
          studentName: studentName || undefined,
          imagePath,
        },
      });
      if (error || (data as any)?.error) {
        toast.error((data as any)?.error || error?.message || "Korrektur fehlgeschlagen");
        setLoading(false);
        return;
      }
      navigate(`/corrections/${(data as any).id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fehler");
      setLoading(false);
    }
  };

  const filtered = search
    ? originals.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()))
    : originals;

  return (
    <div className="px-5 pb-10">
      <header
        className="flex items-center gap-3 pb-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <TapButton
          onClick={() => navigate(-1)}
          aria-label="Zurück"
          className="h-9 w-9 rounded-pill bg-surface-2 text-text-secondary ring-hairline"
        >
          <ArrowLeft size={17} />
        </TapButton>
        <h1 className="font-display text-[20px] font-semibold tracking-[-0.018em] text-text-primary">
          Arbeitsblatt scannen
        </h1>
      </header>

      <p className="text-[13px] text-text-secondary">
        Fotografiere oder lade ein ausgefülltes Arbeitsblatt hoch — die KI korrigiert es automatisch.
      </p>

      {/* Upload */}
      <div className="mt-5">
        {preview ? (
          <div className="relative overflow-hidden rounded-card ring-hairline bg-surface-1">
            <img src={preview} alt="Vorschau" className="w-full max-h-[420px] object-contain bg-black/30" />
            <button
              onClick={() => {
                setPreview(null);
                setFile(null);
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-bg-base/70 text-text-primary"
              aria-label="Entfernen"
            >
              <X size={15} />
            </button>
          </div>
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
            <TapButton
              onClick={() => cameraRef.current?.click()}
              className="flex h-32 flex-col items-center justify-center gap-2 rounded-card bg-surface-1 ring-hairline text-text-primary"
            >
              <Camera size={22} />
              <span className="text-[13px] font-medium">Kamera</span>
            </TapButton>
            <TapButton
              onClick={() => inputRef.current?.click()}
              className="flex h-32 flex-col items-center justify-center gap-2 rounded-card bg-surface-1 ring-hairline text-text-primary"
            >
              <Upload size={22} />
              <span className="text-[13px] font-medium">Hochladen</span>
            </TapButton>
          </div>
        )}
      </div>

      {/* Original picker */}
      <div className="mt-6">
        <p className="section-label mb-2">Original-Arbeitsblatt (optional)</p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche…"
          className="h-10 w-full rounded-input bg-surface-2 px-3 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none ring-hairline"
        />
        <div className="mt-2 max-h-48 overflow-y-auto rounded-card ring-hairline bg-surface-1">
          {filtered.length === 0 && (
            <p className="p-3 text-[12px] text-text-tertiary">Keine Arbeitsblätter gefunden.</p>
          )}
          {filtered.map((o) => (
            <button
              key={o.id}
              onClick={() => setWorksheetId(o.id === worksheetId ? "" : o.id)}
              className={`flex w-full items-center justify-between border-b border-hairline/10 px-3 py-2.5 text-left text-[13px] hover:bg-surface-2 ${
                worksheetId === o.id ? "bg-brand-soft text-brand-hover" : "text-text-primary"
              }`}
            >
              <span className="truncate">{o.title}</span>
              <span className="ml-2 text-[11px] text-text-tertiary">{o.niveau}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Student name */}
      <div className="mt-5">
        <p className="section-label mb-2">Schüler:in (optional)</p>
        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Name"
          className="h-11 w-full rounded-input bg-surface-2 px-3.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none ring-hairline"
        />
      </div>

      <button
        onClick={submit}
        disabled={!preview || loading}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-brand text-[14px] font-medium text-primary-foreground transition-all hover:bg-brand-hover disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Korrigiere Arbeitsblatt…
          </>
        ) : (
          <>
            <FileImage size={16} /> Korrektur starten
          </>
        )}
      </button>
    </div>
  );
};

export default Scan;
