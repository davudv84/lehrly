-- 1. Add content column for structured exercises
ALTER TABLE public.worksheets
  ADD COLUMN IF NOT EXISTS content jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Replace seeder with richer content
CREATE OR REPLACE FUNCTION public.seed_demo_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  ws_einkaufen UUID;
  ws_grammatik UUID;
  ws_familie UUID;
  ws_diskussion UUID;
  ws_zahlen UUID;
  ws_konjunktiv UUID;
  ws_arzt UUID;
  ws_arbeit UUID;
  col_alle UUID;
  col_fav UUID;
  col_woche UUID;
  col_a2 UUID;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.worksheets WHERE user_id = uid) THEN
    RETURN;
  END IF;

  -- A2 Wortschatz Einkaufen — 6 Aufgaben, Lückentext
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, has_solution, is_favorite, created_at, content)
  VALUES (uid, 'A2 Wortschatz Einkaufen', 'A2', 'Einkaufen', ARRAY['Lückentext','Wortschatz'], 6, true, true, now() - interval '2 hours',
    jsonb_build_object(
      'title', 'A2 Wortschatz Einkaufen',
      'exercises', jsonb_build_array(
        jsonb_build_object('type','Lückentext','instruction','Ergänze die fehlenden Wörter.',
          'content','Ich gehe in den ____ und kaufe Brot.','solution','Supermarkt'),
        jsonb_build_object('type','Lückentext','instruction','Ergänze die fehlenden Wörter.',
          'content','Ein Kilo Äpfel kostet 2 ____.','solution','Euro'),
        jsonb_build_object('type','Lückentext','instruction','Ergänze die fehlenden Wörter.',
          'content','Die ____ ist heute leider geschlossen.','solution','Bäckerei'),
        jsonb_build_object('type','Wortschatz','instruction','Was kauft man wo? Ordne zu.',
          'content','Brötchen → ?, Fleisch → ?, Obst → ?','solution','Bäckerei, Metzgerei, Markt'),
        jsonb_build_object('type','Lückentext','instruction','Ergänze die fehlenden Wörter.',
          'content','Ich bezahle an der ____.','solution','Kasse'),
        jsonb_build_object('type','Wortschatz','instruction','Nenne 3 Lebensmittel auf Deutsch.',
          'content','___, ___, ___','solution','Brot, Milch, Käse')
      )
    ))
  RETURNING id INTO ws_einkaufen;

  -- B1 Grammatik Einheit — 8 Aufgaben, Grammatik
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, has_solution, created_at, content)
  VALUES (uid, 'B1 Grammatik Einheit', 'B1', 'Grammatik', ARRAY['Multiple Choice','Lückentext','Grammatik'], 8, true, now() - interval '1 day',
    jsonb_build_object(
      'title','B1 Grammatik Einheit (Modalverben)',
      'exercises', jsonb_build_array(
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.',
          'content','Ich ____ heute zum Arzt gehen. (a) muss (b) mussen (c) musst','solution','a) muss'),
        jsonb_build_object('type','Lückentext','instruction','Setze das Modalverb in der richtigen Form ein.',
          'content','Du ____ (können) sehr gut Deutsch sprechen.','solution','kannst'),
        jsonb_build_object('type','Lückentext','instruction','Setze das Modalverb ein.',
          'content','Wir ____ (sollen) heute pünktlich sein.','solution','sollen'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.',
          'content','Sie ____ schon gehen? (a) wollen (b) will (c) wollt','solution','a) wollen'),
        jsonb_build_object('type','Grammatik','instruction','Bilde einen Satz mit "dürfen".',
          'content','Hier / man / nicht / rauchen','solution','Hier darf man nicht rauchen.'),
        jsonb_build_object('type','Lückentext','instruction','Setze das Modalverb ein.',
          'content','Ich ____ (mögen) Schokolade sehr.','solution','mag'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.',
          'content','Ihr ____ leise sein. (a) musst (b) müsst (c) muss','solution','b) müsst'),
        jsonb_build_object('type','Grammatik','instruction','Verneine den Satz.',
          'content','Ich kann heute kommen.','solution','Ich kann heute nicht kommen.')
      )
    ))
  RETURNING id INTO ws_grammatik;

  -- A1 Lückentext Familie — 5 Aufgaben
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at, content)
  VALUES (uid, 'A1 Lückentext Familie', 'A1', 'Familie', ARRAY['Lückentext'], 5, now() - interval '3 days',
    jsonb_build_object(
      'title','A1 Lückentext Familie',
      'exercises', jsonb_build_array(
        jsonb_build_object('type','Lückentext','instruction','Ergänze.',
          'content','Mein ____ heißt Thomas. (Bruder/Schwester)','solution','Bruder'),
        jsonb_build_object('type','Lückentext','instruction','Ergänze.',
          'content','Meine ____ ist 45 Jahre alt. (Mutter/Vater)','solution','Mutter'),
        jsonb_build_object('type','Lückentext','instruction','Ergänze.',
          'content','Ich habe zwei ____. (Geschwister/Großeltern)','solution','Geschwister'),
        jsonb_build_object('type','Lückentext','instruction','Ergänze.',
          'content','Mein ____ wohnt in Berlin. (Onkel/Tante)','solution','Onkel'),
        jsonb_build_object('type','Lückentext','instruction','Ergänze.',
          'content','Wir feiern den Geburtstag meiner ____. (Oma/Opa)','solution','Oma')
      )
    ))
  RETURNING id INTO ws_familie;

  -- C1 Schreibaufgabe Diskussion — 3 Aufgaben
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at, content)
  VALUES (uid, 'C1 Schreibaufgabe Diskussion', 'C1', 'Politik', ARRAY['Schreibaufgabe'], 3, now() - interval '5 days',
    jsonb_build_object(
      'title','C1 Schreibaufgabe Diskussion',
      'exercises', jsonb_build_array(
        jsonb_build_object('type','Schreibaufgabe','instruction','Verfasse einen argumentativen Text (200–250 Wörter).',
          'content','Sollten in Innenstädten autofreie Zonen verpflichtend eingeführt werden? Diskutieren Sie Vor- und Nachteile.',
          'solution','Musterlösung: Argumente pro (Lebensqualität, Klima, Sicherheit) vs. contra (Lieferverkehr, Erreichbarkeit, Wirtschaft) klar gegenüberstellen, eigene Position begründen, mit Beispielen stützen.'),
        jsonb_build_object('type','Schreibaufgabe','instruction','Schreiben Sie einen Leserbrief.',
          'content','Reagieren Sie auf einen Zeitungsartikel zum Thema "Soziale Medien und politische Meinungsbildung".',
          'solution','Musterlösung: Anrede, Bezug zum Artikel, eigene Meinung mit 2–3 Argumenten, Schlussformel.'),
        jsonb_build_object('type','Schreibaufgabe','instruction','Verfasse eine Stellungnahme.',
          'content','"Bedingungsloses Grundeinkommen — Utopie oder Lösung?" Nehmen Sie Stellung.',
          'solution','Musterlösung: These, Antithese, Synthese; differenzierte Schlussfolgerung mit Bezug auf gesellschaftliche Realität.')
      )
    ))
  RETURNING id INTO ws_diskussion;

  -- A1 Zahlen 1–20 — 6 Aufgaben
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at, content)
  VALUES (uid, 'A1 Zahlen 1–20', 'A1', 'Zahlen', ARRAY['Wortschatz','Lückentext'], 6, now() - interval '7 days',
    jsonb_build_object(
      'title','A1 Zahlen 1–20',
      'exercises', jsonb_build_array(
        jsonb_build_object('type','Lückentext','instruction','Schreibe die Zahl als Wort.','content','7 = ____','solution','sieben'),
        jsonb_build_object('type','Lückentext','instruction','Schreibe die Zahl als Wort.','content','12 = ____','solution','zwölf'),
        jsonb_build_object('type','Lückentext','instruction','Schreibe die Zahl als Wort.','content','15 = ____','solution','fünfzehn'),
        jsonb_build_object('type','Wortschatz','instruction','Nenne die nächste Zahl.','content','acht, neun, ____','solution','zehn'),
        jsonb_build_object('type','Lückentext','instruction','Schreibe als Ziffer.','content','dreizehn = ____','solution','13'),
        jsonb_build_object('type','Wortschatz','instruction','Zähle von 1 bis 5.','content','___','solution','eins, zwei, drei, vier, fünf')
      )
    ))
  RETURNING id INTO ws_zahlen;

  -- B1 Konjunktiv II — 7 Aufgaben
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at, content)
  VALUES (uid, 'B1 Grammatik Konjunktiv II', 'B1', 'Grammatik', ARRAY['Multiple Choice'], 7, now() - interval '1 day',
    jsonb_build_object(
      'title','B1 Grammatik Konjunktiv II',
      'exercises', jsonb_build_array(
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Konjunktiv-II-Form.','content','Ich ____ gerne Urlaub machen. (a) hätte (b) hat (c) habe','solution','a) hätte'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.','content','Wenn ich Zeit ____, würde ich kommen. (a) habe (b) hätte (c) haben','solution','b) hätte'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.','content','Er ____ helfen, wenn er könnte. (a) würde (b) wird (c) wurde','solution','a) würde'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.','content','Wir ____ glücklich, wenn das stimmt. (a) wären (b) sind (c) waren','solution','a) wären'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.','content','An deiner Stelle ____ ich es anders machen. (a) würde (b) werde (c) wurde','solution','a) würde'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.','content','Sie ____ es uns sagen sollen. (a) hätte (b) hatte (c) habe','solution','a) hätte'),
        jsonb_build_object('type','Multiple Choice','instruction','Wähle die richtige Form.','content','Wenn du wolltest, ____ wir gehen. (a) könnten (b) konnten (c) können','solution','a) könnten')
      )
    ))
  RETURNING id INTO ws_konjunktiv;

  -- 2 zusätzliche A2-Blätter (für die "A2"-Sammlung)
  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at, content)
  VALUES (uid, 'A2 Arztbesuch Dialog', 'A2', 'Arztbesuch', ARRAY['Lückentext','Wortschatz'], 6, now() - interval '4 days',
    jsonb_build_object('title','A2 Arztbesuch Dialog','exercises', jsonb_build_array(
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Ich habe seit zwei Tagen ____. (Kopfschmerzen)','solution','Kopfschmerzen'),
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Der Arzt schreibt mir ein ____.','solution','Rezept'),
      jsonb_build_object('type','Wortschatz','instruction','Was sagt man beim Arzt?','content','___','solution','Guten Tag, ich habe einen Termin.'),
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Sie müssen dreimal täglich eine ____ nehmen.','solution','Tablette'),
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Mein ____ ist krank, deshalb komme ich heute später.','solution','Kind'),
      jsonb_build_object('type','Wortschatz','instruction','Nenne 3 Körperteile.','content','___','solution','Kopf, Bauch, Rücken')
    )))
  RETURNING id INTO ws_arzt;

  INSERT INTO public.worksheets (user_id, title, niveau, topic, task_types, task_count, created_at, content)
  VALUES (uid, 'A2 Arbeit & Beruf', 'A2', 'Arbeit', ARRAY['Lückentext','Wortschatz'], 6, now() - interval '6 days',
    jsonb_build_object('title','A2 Arbeit & Beruf','exercises', jsonb_build_array(
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Mein ____ heißt Lehrer.','solution','Beruf'),
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Ich arbeite von Montag bis ____.','solution','Freitag'),
      jsonb_build_object('type','Wortschatz','instruction','Nenne 3 Berufe.','content','___','solution','Arzt, Lehrer, Verkäufer'),
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Mein ____ ist sehr nett.','solution','Chef'),
      jsonb_build_object('type','Lückentext','instruction','Ergänze.','content','Heute habe ich ____ frei.','solution','keinen Tag'),
      jsonb_build_object('type','Wortschatz','instruction','Was machst du beruflich?','content','Ich bin ___.','solution','Lehrerin')
    )))
  RETURNING id INTO ws_arbeit;

  -- Templates
  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, usage_count, last_used_at)
  VALUES (uid, 'A2 Wortschatz Wochenplan', 'A2', 'Einkaufen', ARRAY['Lückentext','Wortschatz'], 6, 12, now() - interval '4 hours');

  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, usage_count, last_used_at)
  VALUES (uid, 'B1 Grammatik Einheit', 'B1', 'Arbeit', ARRAY['Grammatik','Multiple Choice'], 8, 8, now() - interval '3 days');

  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, usage_count)
  VALUES (uid, 'A1 Lückentext Familie', 'A1', 'Familie', ARRAY['Lückentext'], 5, 5);

  INSERT INTO public.templates (user_id, title, niveau, topic, task_types, task_count, is_new, usage_count)
  VALUES (uid, 'C1 Schreibaufgabe Diskussion', 'C1', 'Politik', ARRAY['Schreibaufgabe'], 3, true, 3);

  -- Collections
  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'Alle', 'library', 'muted') RETURNING id INTO col_alle;

  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'Fav.', 'star', 'amber') RETURNING id INTO col_fav;

  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'Diese Woche', 'calendar', 'brand') RETURNING id INTO col_woche;

  INSERT INTO public.collections (user_id, title, icon, color)
  VALUES (uid, 'A2', 'folder', 'brand') RETURNING id INTO col_a2;

  -- Memberships
  INSERT INTO public.collection_worksheets (collection_id, worksheet_id) VALUES
    (col_alle, ws_einkaufen), (col_alle, ws_grammatik), (col_alle, ws_familie),
    (col_alle, ws_diskussion), (col_alle, ws_zahlen), (col_alle, ws_konjunktiv),
    (col_alle, ws_arzt), (col_alle, ws_arbeit),
    -- Fav. = 6 Blätter
    (col_fav, ws_einkaufen), (col_fav, ws_grammatik), (col_fav, ws_familie),
    (col_fav, ws_diskussion), (col_fav, ws_zahlen), (col_fav, ws_konjunktiv),
    -- Diese Woche
    (col_woche, ws_einkaufen), (col_woche, ws_grammatik), (col_woche, ws_konjunktiv),
    -- A2 = nur A2-Blätter — wir haben 3 (Einkaufen, Arzt, Arbeit). Wir füllen synthetisch nicht auf, sondern lassen Counter aus tatsächlichem Inhalt entstehen.
    (col_a2, ws_einkaufen), (col_a2, ws_arzt), (col_a2, ws_arbeit);
END;
$$;