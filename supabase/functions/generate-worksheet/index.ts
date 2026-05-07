// Generate a German DaF/DaZ worksheet via Lovable AI Gateway and persist it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_NIVEAU = ["A1", "A2", "B1", "B2", "C1"] as const;
const ALLOWED_TYPES = [
  "Lückentext",
  "Multiple Choice",
  "Zuordnung",
  "Grammatik",
  "Schreibaufgabe",
  "Wortschatz",
  "Satzbau",
  "Dialog",
  "Leseverstehen",
];

type Body = {
  niveau: string;
  topics: string[];
  taskTypes: string[];
  count: number;
};

const NIVEAU_GUIDE: Record<string, string> = {
  A1:
    "A1 — sehr einfache Sprache, kurze Hauptsätze (max. 6–8 Wörter), Präsens, Grundwortschatz (~600 Wörter). " +
    "Häufige Alltagswörter (Familie, Zahlen, Uhrzeit, Körper, Lebensmittel). Konkrete, unmittelbare Situationen. " +
    "Keine Konjunktionen außer 'und/aber'. Keine Modalverben außer 'können/möchten'. Lücken: ein einzelnes Wort.",
  A2:
    "A2 — kurze, klare Sätze, Perfekt + Präsens, einfache Modalverben (müssen, dürfen, sollen, wollen). " +
    "Wortschatz Alltag/Behörden/Arbeit (~1200 Wörter). Akkusativ/Dativ trennbar üben. Sätze maximal 10–12 Wörter. " +
    "Realistische BAMF-Integrationskurs-Situationen (Anmeldung, Termin, Wohnung, Einkauf).",
  B1:
    "B1 — natürliche Alltagssprache, Nebensätze (weil, wenn, dass, obwohl), Präteritum bei Erzählungen. " +
    "Längere zusammenhängende Texte (60–120 Wörter). Berufssprachkurs-Themen (Bewerbung, Praktikum, Arbeitsplatz, " +
    "Krankschreibung, E-Mails). Idiomatische Wendungen sparsam einsetzen.",
  B2:
    "B2 — abstraktere Themen, Konjunktiv II, Passiv, Genitiv, Partizipialkonstruktionen. " +
    "Berufsorientiert, Argumentation, Stellungnahmen, formelle Schreiben. Texte 120–200 Wörter. " +
    "Idiomatik und Konnektoren (jedoch, allerdings, dennoch, obgleich).",
  C1:
    "C1 — komplexe Texte, Nominalstil, Funktionsverbgefüge, Konnektoren des Diskurses. " +
    "Fachsprachliche Themen (Wissenschaft, Politik, Ethik). Diskussion, differenzierte Argumentation, " +
    "implizite Bedeutungen. Texte 200–350 Wörter.",
};

const TYPE_GUIDE: Record<string, string> = {
  Lückentext:
    "Authentischer zusammenhängender Text (kein Stichwort-Salat) mit 5–10 Lücken. Lücken markieren mit GENAU '_____' " +
    "(5 Unterstriche). Lösung als nummerierte Liste: '1. Wort, 2. Wort, …'. Lücken zielen auf eine Lernstruktur " +
    "(z. B. Artikel, Verbformen, Präpositionen) – nicht zufällig.",
  "Multiple Choice":
    "3–5 Items. Jedes Item: Frage/Stamm in Zeile 1, dann genau drei Optionen in eigenen Zeilen 'a) …', 'b) …', 'c) …'. " +
    "Distraktoren müssen plausibel sein (häufige Lerner-Fehler), nicht offensichtlich falsch. " +
    "Items mit leerer Zeile trennen. Lösung: '1. b, 2. a, 3. c …'.",
  Zuordnung:
    "Zwei Spalten als Liste: linke Seite (Begriff/Anfang) – rechte Seite (Definition/Ende), getrennt durch ' – '. " +
    "Reihenfolge der rechten Seite gemischt. 6–10 Paare. Lösung: '1–c, 2–a, 3–e …' (Buchstaben für rechte Spalte vergeben).",
  Grammatik:
    "Konkrete Strukturübung mit klar erkennbarem Lernziel (z. B. Akkusativ-Artikel, Perfekt mit haben/sein, " +
    "Nebensätze mit weil). 6–10 Items. Format wie Lückentext oder 'Setze in der richtigen Form ein:' " +
    "Lösung kurz und nummeriert.",
  Schreibaufgabe:
    "Realistische kommunikative Situation (E-Mail an Vermieter, Entschuldigung an Schule, Bewerbung). " +
    "Inhalt: Situation + 3–5 Punkte, die genannt werden müssen + Wortvorgaben (Anrede/Gruß). " +
    "Lösung: vollständiger Mustertext (60–150 Wörter je nach Niveau).",
  Wortschatz:
    "Thematischer Wortschatz, gegliedert in 2–4 semantische Gruppen (Substantive mit Artikel, Verben, Adjektive, " +
    "Wendungen). Pro Wort einen kurzen Beispielsatz. Keine bloße Vokabel-Liste ohne Kontext.",
  Satzbau:
    "Wörter in Zufallsreihenfolge mit ' / ' getrennt, ein Satz pro Zeile, nummeriert. Lerner muss Satz korrekt bilden. " +
    "6–8 Sätze, fokussiert auf eine Struktur (Satzklammer, Inversion, Nebensatz). Lösung: vollständige Sätze nummeriert.",
  Dialog:
    "Realistischer Dialog (Arzt–Patient, Vermieter–Mieter, Bewerber–Personaler) mit Sprecherkennzeichnung 'A:' / 'B:'. " +
    "8–14 Wechsel. Lücken in einigen B-Antworten oder am Ende offene Fortsetzung. Lösung: vorgeschlagene Antworten.",
  Leseverstehen:
    "Authentischer Text (Anzeige, E-Mail, Mitteilung, kurzer Bericht) — Länge passend zum Niveau. " +
    "Anschließend 4–6 Verständnisfragen oder richtig/falsch-Items. " +
    "Lösung: Antworten + kurze Begründung mit Textstelle.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supa = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userResp, error: userErr } = await supa.auth.getUser();
    if (userErr || !userResp.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const user = userResp.user;

    const raw = (await req.json()) as Partial<Body>;
    const niveau = String(raw.niveau ?? "");
    const topics = Array.isArray(raw.topics) ? raw.topics.filter(Boolean) : [];
    const taskTypes = Array.isArray(raw.taskTypes)
      ? raw.taskTypes.filter((t) => ALLOWED_TYPES.includes(String(t)))
      : [];
    const count = Math.max(3, Math.min(15, Number(raw.count) || 6));

    if (!ALLOWED_NIVEAU.includes(niveau as any)) {
      return json({ error: "Ungültiges Sprachniveau" }, 400);
    }
    if (taskTypes.length === 0) {
      return json({ error: "Mindestens ein Aufgabentyp erforderlich" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "AI gateway nicht konfiguriert" }, 500);
    }

    const topicLine = topics.length ? topics.join(", ") : "frei wählbar (Alltag in Deutschland)";
    const niveauGuide = NIVEAU_GUIDE[niveau];
    const typeGuide = taskTypes
      .map((t) => `• ${t}: ${TYPE_GUIDE[t] ?? ""}`)
      .join("\n");

    const systemPrompt =
      "Du bist eine erfahrene DaF/DaZ-Dozentin (15 Jahre Integrationskurs- und Berufssprachkurs-Erfahrung, " +
      "telc- und Goethe-zertifiziert). Du erstellst Materialien wie sie in echten BAMF-Kursen verwendet werden — " +
      "qualitativ vergleichbar mit Hueber 'Schritte plus Neu' oder Klett 'Linie 1'.\n\n" +
      "ABSOLUTE QUALITÄTSREGELN:\n" +
      "1. Keine generischen AI-Sätze ('Anna ist glücklich', 'Das Wetter ist schön'). Stattdessen konkrete, " +
      "realistische Alltagssituationen, die Migrant:innen in Deutschland tatsächlich erleben.\n" +
      "2. Authentische deutsche Sprache — natürliche Wortstellung, idiomatisch korrekt, regionale Neutralität.\n" +
      "3. Pädagogisch progressiv: Aufgabe 1 ist die einfachste, jede weitere baut auf vorherigen auf.\n" +
      "4. Jede Aufgabe verfolgt ein klares Lernziel (kein Selbstzweck).\n" +
      "5. Lösungen sind 100 % korrekt (Artikel, Genus, Kasus, Verbformen) und vollständig.\n" +
      "6. Realistische Namen (Aylin, Mehmet, Olena, Fatima, Achmed, Marco, Anh) statt Anna/Tom/Lisa.\n" +
      "7. Kein Lehrbuch-Klang — schreibe wie eine Lehrerin, die montags um 9 Uhr vor 16 Lernern steht.\n\n" +
      "Antworte ausschließlich über den bereitgestellten Tool-Call.";

    const userPrompt =
      `Erstelle ein professionelles DaF/DaZ-Arbeitsblatt für den Unterricht.\n\n` +
      `SPRACHNIVEAU: ${niveau}\n${niveauGuide}\n\n` +
      `THEMA / KONTEXT: ${topicLine}\n` +
      `Verbinde alle Aufgaben um diesen thematischen Faden — kein Patchwork.\n\n` +
      `AUFGABENTYPEN (genau ${count} Aufgaben, Reihenfolge nach Schwierigkeit):\n${typeGuide}\n\n` +
      `WEITERE PFLICHTEN:\n` +
      `• Titel: konkret und ansprechend, z. B. "Beim Hausarzt — Beschwerden beschreiben (${niveau})".\n` +
      `• learning_goal: ein Satz, was Lernende nach diesem Blatt können (Können-Beschreibung).\n` +
      `• teacher_notes: 2–4 kurze Hinweise für die Lehrkraft (Sozialform, Stolpersteine, Erweiterung).\n` +
      `• competencies: 1–3 trainierte Kompetenzen.\n` +
      `• duration_min: realistische Bearbeitungszeit (15–60 Min).\n` +
      `• Pro Aufgabe: type, instruction (klare TN-Anweisung in Du- oder Sie-Form, konsistent), context " +
      `(optional: 1 Satz Situation), content (Aufgabentext nach Typvorgabe), solution (vollständig + korrekt).\n`;

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_worksheet",
                description:
                  "Liefert das vollständige didaktisierte Arbeitsblatt als strukturierte Daten.",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description:
                        "Konkreter, ansprechender Titel mit Niveau-Hinweis. Beispiel: 'Beim Hausarzt — Beschwerden beschreiben (A2)'.",
                    },
                    learning_goal: {
                      type: "string",
                      description:
                        "Ein Satz im Können-Format: 'Die Lernenden können …'.",
                    },
                    teacher_notes: {
                      type: "array",
                      description:
                        "2–4 kurze Hinweise für die Lehrkraft (Sozialform, Differenzierung, Stolpersteine).",
                      items: { type: "string" },
                      minItems: 2,
                      maxItems: 4,
                    },
                    competencies: {
                      type: "array",
                      description:
                        "1–3 trainierte Kompetenzen aus: Lesen, Schreiben, Hören, Sprechen, Wortschatz, Grammatik.",
                      items: {
                        type: "string",
                        enum: [
                          "Lesen",
                          "Schreiben",
                          "Hören",
                          "Sprechen",
                          "Wortschatz",
                          "Grammatik",
                        ],
                      },
                      minItems: 1,
                      maxItems: 3,
                    },
                    duration_min: {
                      type: "number",
                      description: "Geschätzte Bearbeitungszeit in Minuten (15–60).",
                    },
                    exercises: {
                      type: "array",
                      minItems: count,
                      maxItems: count,
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: taskTypes },
                          instruction: {
                            type: "string",
                            description:
                              "Klare, kurze TN-Anweisung auf Deutsch (konsistente Anrede du/Sie).",
                          },
                          context: {
                            type: "string",
                            description:
                              "Optional: 1 Satz Situations-/Kontextrahmen vor der Aufgabe.",
                          },
                          content: {
                            type: "string",
                            description:
                              "Aufgabentext entsprechend dem Typ-Format. Bei Lückentext: Lücken als '_____' (5 Unterstriche). " +
                              "Bei Multiple Choice: Stamm + 'a) …\\nb) …\\nc) …'. Bei Zuordnung/Wortschatz/Satzbau: ein Eintrag pro Zeile.",
                          },
                          solution: {
                            type: "string",
                            description:
                              "Vollständige, klar formatierte Lösung. Nummeriert wenn mehrteilig. " +
                              "Bei Schreibaufgaben: kompletter Mustertext.",
                          },
                        },
                        required: ["type", "instruction", "content", "solution"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: [
                    "title",
                    "learning_goal",
                    "teacher_notes",
                    "competencies",
                    "duration_min",
                    "exercises",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_worksheet" },
          },
        }),
      },
    );

    if (aiRes.status === 429) {
      return json(
        { error: "Zu viele Anfragen — bitte gleich nochmal versuchen." },
        429,
      );
    }
    if (aiRes.status === 402) {
      return json(
        {
          error:
            "AI-Guthaben aufgebraucht. Bitte in Lovable Cloud → Workspace → Usage aufladen.",
        },
        402,
      );
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return json({ error: "AI-Generator fehlgeschlagen" }, 500);
    }

    const aiJson = await aiRes.json();
    const toolCall =
      aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!toolCall) {
      console.error("Missing tool call in AI response", JSON.stringify(aiJson));
      return json({ error: "Antwort des AI-Modells unvollständig" }, 502);
    }

    let parsed: {
      title: string;
      learning_goal?: string;
      teacher_notes?: string[];
      competencies?: string[];
      duration_min?: number;
      exercises: Array<Record<string, string>>;
    };
    try {
      parsed = typeof toolCall === "string" ? JSON.parse(toolCall) : toolCall;
    } catch {
      return json({ error: "AI-Antwort konnte nicht gelesen werden" }, 502);
    }

    const title = parsed.title?.trim() || `${niveau} ${topics[0] ?? "Arbeitsblatt"}`;
    const exercises = (parsed.exercises ?? []).slice(0, count);
    const competencies = Array.isArray(parsed.competencies)
      ? parsed.competencies.slice(0, 3)
      : [];
    const duration_min =
      typeof parsed.duration_min === "number"
        ? Math.max(10, Math.min(90, Math.round(parsed.duration_min)))
        : null;
    const learning_goal =
      typeof parsed.learning_goal === "string" ? parsed.learning_goal.trim() : null;
    const teacher_notes = Array.isArray(parsed.teacher_notes)
      ? parsed.teacher_notes.filter((s) => typeof s === "string").slice(0, 4)
      : [];

    const { data: inserted, error: insertErr } = await supa
      .from("worksheets")
      .insert({
        user_id: user.id,
        title,
        niveau,
        topic: topics[0] ?? null,
        task_types: taskTypes,
        task_count: exercises.length,
        has_solution: true,
        content: {
          title,
          exercises,
          competencies,
          duration_min,
          learning_goal,
          teacher_notes,
        },
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      console.error("Insert error", insertErr);
      return json({ error: "Speichern fehlgeschlagen" }, 500);
    }

    return json({ id: inserted.id, title, exercises });
  } catch (e) {
    console.error("generate-worksheet error", e);
    return json(
      { error: e instanceof Error ? e.message : "Unbekannter Fehler" },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
