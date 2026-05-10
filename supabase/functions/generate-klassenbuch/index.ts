// Generate a Klassenbucheintrag for an existing worksheet via Lovable AI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userResp } = await supa.auth.getUser();
    if (!userResp?.user) return json({ error: "Not authenticated" }, 401);
    const user = userResp.user;

    const { worksheetId } = (await req.json()) as { worksheetId: string };
    if (!worksheetId) return json({ error: "worksheetId fehlt" }, 400);

    const { data: ws } = await supa
      .from("worksheets")
      .select("id, title, niveau, topic, content")
      .eq("id", worksheetId)
      .maybeSingle();
    if (!ws) return json({ error: "Arbeitsblatt nicht gefunden" }, 404);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI gateway nicht konfiguriert" }, 500);

    const exercises = (ws as any).content?.exercises ?? [];
    const exercisesText = exercises
      .map((e: any, i: number) => `${i + 1}. [${e.type}] ${e.instruction}`)
      .join("\n");

    const userPrompt =
      `Erstelle einen Klassenbucheintrag für dieses DaF/DaZ-Arbeitsblatt. ` +
      `Niveau: ${ws.niveau}. Thema: ${ws.topic ?? "—"}. Aufgaben:\n${exercisesText}\n\n` +
      `Format: 1-Satz-Lerninhalt + Aufgabenübersicht + sprachliche Schwerpunkte + Kompetenzbereiche. ` +
      `Sprache: formelles Lehrer-Deutsch.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Du bist eine erfahrene DaF/DaZ-Lehrkraft und schreibst formelle Klassenbucheinträge auf Deutsch.",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_klassenbuch",
              description: "Strukturierter Klassenbucheintrag.",
              parameters: {
                type: "object",
                properties: {
                  lerninhalt: { type: "string", description: "Ein Satz." },
                  behandelte_aufgaben: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        nummer: { type: "number" },
                        titel: { type: "string" },
                        beschreibung: { type: "string" },
                      },
                      required: ["nummer", "titel", "beschreibung"],
                    },
                  },
                  sprachliche_schwerpunkte: { type: "string" },
                  kompetenzbereiche: {
                    type: "array",
                    items: { type: "string", enum: ["Hören", "Lesen", "Schreiben", "Sprechen"] },
                  },
                },
                required: ["lerninhalt", "behandelte_aufgaben", "sprachliche_schwerpunkte", "kompetenzbereiche"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_klassenbuch" } },
      }),
    });

    if (aiRes.status === 429) return json({ error: "Zu viele Anfragen." }, 429);
    if (aiRes.status === 402) return json({ error: "AI-Guthaben aufgebraucht." }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("KB AI error", aiRes.status, t);
      return json({ error: "Klassenbuch-Generierung fehlgeschlagen" }, 500);
    }

    const aiJson = await aiRes.json();
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return json({ error: "Antwort unvollständig" }, 502);
    const content = typeof args === "string" ? JSON.parse(args) : args;

    const { data: inserted, error: insErr } = await supa
      .from("klassenbuch_entries")
      .insert({
        user_id: user.id,
        worksheet_id: ws.id,
        content: { ...content, datum: new Date().toISOString(), niveau: ws.niveau, thema: ws.topic },
      })
      .select("id")
      .single();
    if (insErr || !inserted) return json({ error: "Speichern fehlgeschlagen" }, 500);

    return json({ id: inserted.id, content });
  } catch (e) {
    console.error("generate-klassenbuch error", e);
    return json({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
