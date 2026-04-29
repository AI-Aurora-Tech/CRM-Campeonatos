-- RLS, funções, triggers de auditoria, homologação, agendamento, seed demo

-- ---------------------------------------------------------------------------
-- Helper: usuário pertence à organização do registro
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_can_org(p_org text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.user_id = auth.uid() AND m.organization_id = p_org
  );
$$;

CREATE OR REPLACE FUNCTION public.championship_org_id(p_championship text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.championships WHERE id = p_championship LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- Auditoria (matches críticos)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_match_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
    NEW.score IS DISTINCT FROM OLD.score
    OR NEW.report_status IS DISTINCT FROM OLD.report_status
    OR NEW.status IS DISTINCT FROM OLD.status
  ) THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload_before, payload_after)
    VALUES (
      auth.uid(),
      'MATCH_UPDATE',
      'match',
      NEW.id,
      jsonb_build_object(
        'score', OLD.score,
        'report_status', OLD.report_status,
        'status', OLD.status
      ),
      jsonb_build_object(
        'score', NEW.score,
        'report_status', NEW.report_status,
        'status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_matches
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.audit_match_changes();

CREATE OR REPLACE FUNCTION public.audit_player_doc_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.document_status IS DISTINCT FROM OLD.document_status THEN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload_before, payload_after)
    VALUES (
      auth.uid(),
      'PLAYER_DOCUMENT',
      'player',
      NEW.id,
      jsonb_build_object('document_status', OLD.document_status),
      jsonb_build_object('document_status', NEW.document_status)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_players
AFTER UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.audit_player_doc_changes();

CREATE OR REPLACE FUNCTION public.audit_payment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, payload_after)
  VALUES (auth.uid(), 'PAYMENT_INSERT', 'payment', NEW.id, to_jsonb(NEW));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_payments
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.audit_payment_insert();

-- ---------------------------------------------------------------------------
-- Novo usuário → membro da org demo (MVP)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = NEW.id AND organization_id = 'org-1' AND club_id IS NULL
  ) THEN
    INSERT INTO public.organization_members (user_id, organization_id, role, club_id)
    VALUES (NEW.id, 'org-1', 'SUPER_ADMIN', NULL);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Suspensões após homologação (cartões acumulados)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_yellow_card_suspensions(p_match_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  lim int;
  cid text;
BEGIN
  SELECT championship_id INTO cid FROM public.matches WHERE id = p_match_id;
  SELECT COALESCE((c.rules->>'yellowCardLimit')::int, 999) INTO lim
  FROM public.championships c WHERE c.id = cid;

  IF lim IS NULL OR lim < 1 THEN
    RETURN;
  END IF;

  -- Acúmulo no campeonato em jogos já homologados (APPROVED)
  FOR r IN
    SELECT me.player_id, COUNT(*)::int AS yc
    FROM public.match_events me
    JOIN public.matches m2 ON m2.id = me.match_id
    WHERE m2.championship_id = cid
      AND m2.status = 'FINISHED'
      AND m2.report_status = 'APPROVED'
      AND me.type = 'YELLOW_CARD'
    GROUP BY me.player_id
    HAVING COUNT(*) >= lim
  LOOP
    UPDATE public.players SET status = 'SUSPENDED' WHERE id = r.player_id;
    INSERT INTO public.suspensions (player_id, championship_id, reason, source_match_id, starts_on, ends_on)
    SELECT
      r.player_id,
      cid,
      'Acúmulo de cartões amarelos (pós-homologação)',
      p_match_id,
      CURRENT_DATE,
      CURRENT_DATE + 1
    WHERE NOT EXISTS (
      SELECT 1 FROM public.suspensions s
      WHERE s.player_id = r.player_id AND s.championship_id = cid AND s.source_match_id = p_match_id
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_match_homologated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.report_status = 'APPROVED' AND (OLD.report_status IS DISTINCT FROM NEW.report_status) THEN
    NEW.homologated_at := now();
    UPDATE public.match_reports SET state = 'APPROVED', updated_at = now() WHERE match_id = NEW.id;
    PERFORM public.apply_yellow_card_suspensions(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_match_homologation
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.on_match_homologated();

-- ---------------------------------------------------------------------------
-- Round-robin: gera jogos (não apaga existentes; útil para MVP)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_round_robin(
  p_championship_id text,
  p_rounds int DEFAULT 1
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_ids text[];
  n int;
  i int;
  j int;
  d date := CURRENT_DATE;
  inserted int := 0;
  loc text := 'A definir';
  rnd int;
  k int;
BEGIN
  SELECT array_agg(id ORDER BY id) INTO team_ids
  FROM public.clubs c
  WHERE c.organization_id = public.championship_org_id(p_championship_id);

  n := COALESCE(array_length(team_ids, 1), 0);
  IF n < 2 THEN
    RETURN 0;
  END IF;

  FOR rnd IN 1..p_rounds LOOP
    FOR i IN 1..n LOOP
      FOR j IN i + 1..n LOOP
        INSERT INTO public.matches (
          id, championship_id, home_team_id, away_team_id, match_date, match_time, location, status
        ) VALUES (
          'm-' || substr(md5(random()::text || clock_timestamp()::text), 1, 10),
          p_championship_id,
          team_ids[i],
          team_ids[j],
          d + (inserted % 14),
          '10:00',
          loc,
          'SCHEDULED'
        );
        inserted := inserted + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN inserted;
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_schedule_conflicts(p_championship_id text)
RETURNS TABLE (club_id text, match_date date, match_time text, cnt bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT x.team_id AS club_id, x.match_date, x.match_time, COUNT(*) AS cnt
  FROM (
    SELECT m.match_date, m.match_time, m.home_team_id AS team_id FROM public.matches m WHERE m.championship_id = p_championship_id
    UNION ALL
    SELECT m.match_date, m.match_time, m.away_team_id FROM public.matches m WHERE m.championship_id = p_championship_id
  ) x
  GROUP BY x.team_id, x.match_date, x.match_time
  HAVING COUNT(*) > 1;
$$;

CREATE OR REPLACE FUNCTION public.generate_knockout_from_standings(
  p_championship_id text,
  p_pairs int DEFAULT 2
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tid text[];
  n int;
  k int;
  ins int := 0;
  d date := CURRENT_DATE + 30;
BEGIN
  SELECT array_agg(id ORDER BY id) INTO tid
  FROM public.clubs
  WHERE organization_id = (SELECT organization_id FROM public.championships WHERE id = p_championship_id);

  n := COALESCE(array_length(tid, 1), 0);
  IF n < 2 THEN
    RETURN 0;
  END IF;

  FOR k IN 1..LEAST(p_pairs, n / 2) LOOP
    INSERT INTO public.matches (id, championship_id, home_team_id, away_team_id, match_date, match_time, location, status)
    VALUES (
      'ko-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
      p_championship_id,
      tid[k * 2 - 1],
      tid[k * 2],
      d + k,
      '16:00',
      'Mata-mata',
      'SCHEDULED'
    );
    ins := ins + 1;
  END LOOP;
  RETURN ins;
END;
$$;

-- ---------------------------------------------------------------------------
-- Portal público (SECURITY DEFINER — sem PII sensível)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_championship(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'championship', to_jsonb(c.*),
    'clubs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', cl.id,
        'name', cl.name,
        'shortName', cl.short_name,
        'logoUrl', cl.logo_url
      ))
      FROM public.clubs cl
      WHERE cl.organization_id = c.organization_id
    ), '[]'::jsonb),
    'matches', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', m.id,
        'date', m.match_date,
        'time', m.match_time,
        'homeTeamId', m.home_team_id,
        'awayTeamId', m.away_team_id,
        'status', m.status,
        'score', m.score
      ) ORDER BY m.match_date, m.match_time)
      FROM public.matches m
      WHERE m.championship_id = c.id
    ), '[]'::jsonb)
  )
  FROM public.championships c
  WHERE c.public_slug = p_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_championship(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referee_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_report_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_blackouts ENABLE ROW LEVEL SECURITY;

-- Membros: própria linha ou SUPER_ADMIN da mesma org vê todos
CREATE POLICY om_select ON public.organization_members
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organization_members m2
      WHERE m2.user_id = auth.uid()
        AND m2.organization_id = organization_members.organization_id
        AND m2.role = 'SUPER_ADMIN'
        AND m2.club_id IS NULL
    )
  );

-- Leitura por organização (autenticado membro)
CREATE POLICY org_read ON public.organizations
  FOR SELECT TO authenticated USING (public.user_can_org(id));

CREATE POLICY champ_read ON public.championships
  FOR SELECT TO authenticated USING (public.user_can_org(organization_id));
CREATE POLICY champ_write ON public.championships
  FOR ALL TO authenticated USING (public.user_can_org(organization_id)) WITH CHECK (public.user_can_org(organization_id));

CREATE POLICY clubs_read ON public.clubs
  FOR SELECT TO authenticated USING (public.user_can_org(organization_id));
CREATE POLICY clubs_write ON public.clubs
  FOR INSERT TO authenticated WITH CHECK (public.user_can_org(organization_id));
CREATE POLICY clubs_update ON public.clubs
  FOR UPDATE TO authenticated USING (public.user_can_org(organization_id)) WITH CHECK (public.user_can_org(organization_id));
CREATE POLICY clubs_delete ON public.clubs
  FOR DELETE TO authenticated USING (public.user_can_org(organization_id));

CREATE POLICY players_rw ON public.players
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clubs cl WHERE cl.id = players.club_id AND public.user_can_org(cl.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clubs cl WHERE cl.id = players.club_id AND public.user_can_org(cl.organization_id)));

CREATE POLICY venues_rw ON public.venues
  FOR ALL TO authenticated USING (public.user_can_org(organization_id)) WITH CHECK (public.user_can_org(organization_id));

CREATE POLICY referees_rw ON public.referees
  FOR ALL TO authenticated USING (public.user_can_org(organization_id)) WITH CHECK (public.user_can_org(organization_id));

CREATE POLICY matches_rw ON public.matches
  FOR ALL TO authenticated
  USING (public.user_can_org(public.championship_org_id(championship_id)))
  WITH CHECK (public.user_can_org(public.championship_org_id(championship_id)));

CREATE POLICY match_events_rw ON public.match_events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_events.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_events.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))));

CREATE POLICY ratings_rw ON public.referee_ratings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = referee_ratings.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = referee_ratings.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))));

CREATE POLICY audit_read ON public.audit_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY fee_rw ON public.fee_definitions
  FOR ALL TO authenticated
  USING (public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = fee_definitions.championship_id)))
  WITH CHECK (public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = fee_definitions.championship_id)));

CREATE POLICY invoices_rw ON public.invoices
  FOR ALL TO authenticated USING (public.user_can_org(organization_id)) WITH CHECK (public.user_can_org(organization_id));

CREATE POLICY payments_rw ON public.payments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = payments.invoice_id AND public.user_can_org(i.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = payments.invoice_id AND public.user_can_org(i.organization_id)));

CREATE POLICY mr_rw ON public.match_reports
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_reports.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_reports.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))));

CREATE POLICY mre_rw ON public.match_report_events
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.match_reports r
    JOIN public.matches m ON m.id = r.match_id
    WHERE r.id = match_report_events.match_report_id AND public.user_can_org(public.championship_org_id(m.championship_id))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.match_reports r
    JOIN public.matches m ON m.id = r.match_id
    WHERE r.id = match_report_events.match_report_id AND public.user_can_org(public.championship_org_id(m.championship_id))
  ));

CREATE POLICY nt_rw ON public.notification_templates
  FOR ALL TO authenticated USING (public.user_can_org(organization_id)) WITH CHECK (public.user_can_org(organization_id));

CREATE POLICY nq_rw ON public.notification_queue
  FOR ALL TO authenticated USING (public.user_can_org(organization_id)) WITH CHECK (public.user_can_org(organization_id));

CREATE POLICY roster_rw ON public.match_roster
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_roster.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_roster.match_id AND public.user_can_org(public.championship_org_id(m.championship_id))));

CREATE POLICY docs_rw ON public.documents
  FOR ALL TO authenticated
  USING (
    championship_id IS NULL
    OR public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = documents.championship_id))
  )
  WITH CHECK (
    championship_id IS NULL
    OR public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = documents.championship_id))
  );

CREATE POLICY reg_rw ON public.regulation_versions
  FOR ALL TO authenticated
  USING (public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = regulation_versions.championship_id)))
  WITH CHECK (public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = regulation_versions.championship_id)));

CREATE POLICY susp_rw ON public.suspensions
  FOR ALL TO authenticated
  USING (public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = suspensions.championship_id)))
  WITH CHECK (public.user_can_org((SELECT organization_id FROM public.championships ch WHERE ch.id = suspensions.championship_id)));

CREATE POLICY ai_rw ON public.ai_suggestions
  FOR ALL TO authenticated
  USING (
    match_id IS NULL
    OR EXISTS (SELECT 1 FROM public.matches m WHERE m.id = ai_suggestions.match_id AND public.user_can_org(public.championship_org_id(m.championship_id)))
  )
  WITH CHECK (
    match_id IS NULL
    OR EXISTS (SELECT 1 FROM public.matches m WHERE m.id = ai_suggestions.match_id AND public.user_can_org(public.championship_org_id(m.championship_id)))
  );

CREATE POLICY vb_rw ON public.venue_blackouts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_blackouts.venue_id AND public.user_can_org(v.organization_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_blackouts.venue_id AND public.user_can_org(v.organization_id)));

-- ---------------------------------------------------------------------------
-- Seed (dados demo — mesmo conteúdo conceitual do mockData)
-- ---------------------------------------------------------------------------
INSERT INTO public.organizations (id, name) VALUES ('org-1', 'Federação Demo');

INSERT INTO public.championships (id, organization_id, name, season, type, status, rules, public_slug)
VALUES (
  'ch1',
  'org-1',
  'Copa Regional 2026',
  '2026',
  'POINTS_CORRIDOS',
  'ACTIVE',
  '{"yellowCardLimit":3,"pointsPerWin":3,"pointsPerDraw":1}'::jsonb,
  'copa-regional-2026'
);

INSERT INTO public.clubs (id, organization_id, name, short_name, logo_url, president_id, address, phone, email, custom_rules, home_field, has_pending_finance, founded_year, titles, stats)
VALUES
('c1', 'org-1', 'Esporte Clube Vila Nova', 'EVN', 'https://picsum.photos/seed/evn/100/100', 'u2', 'Rua das Flores, 123', '(11) 98888-7777', 'contato@vilanova.com', 'Proibido chuteiras de trava de alumínio.', 'Campo do XV', false, 1974, ARRAY['Copa Várzea 2022'], '{"totalGoals":124,"cleanSheets":32,"possessionAvg":54}'::jsonb),
('c2', 'org-1', 'União da Várzea', 'UDV', 'https://picsum.photos/seed/udv/100/100', 'u3', 'Av. Principal, 500', '(11) 97777-6666', 'uniao@varzea.org', 'Pagamento da taxa de arbitragem até 30min antes.', 'Arena da Várzea', true, 1992, ARRAY['Taça Independência 2024'], '{"totalGoals":88,"cleanSheets":15,"possessionAvg":48}'::jsonb),
('c3', 'org-1', 'Real Madrid da Quebrada', 'RMQ', 'https://picsum.photos/seed/rmq/100/100', 'u4', 'Beco do Gol, 10', '(11) 96666-5555', 'real@quebrada.net', 'Obrigatório apresentação de RG original.', 'Campo da Paz', false, 2010, ARRAY['Supercopa Local 2023'], '{"totalGoals":210,"cleanSheets":45,"possessionAvg":61}'::jsonb),
('c4', 'org-1', 'Santos do Morro', 'SDM', 'https://picsum.photos/seed/sdm/100/100', 'u5', 'Ladeira da Vila, s/n', '(11) 95555-4444', 'santos@morro.com', 'Torneio interno aos domingos tem prioridade.', 'Estádio Municipal', true, 1985, '{}', '{"totalGoals":45,"cleanSheets":8,"possessionAvg":42}'::jsonb);

INSERT INTO public.venues (id, organization_id, name, address, active, facilities)
VALUES
('v1', 'org-1', 'Campo do XV', 'Rua Itaquera, 450, São Paulo', true, ARRAY['Estacionamento','Refletores','Vestiário']),
('v2', 'org-1', 'Arena da Várzea', 'Av. Brasil, 1900, São Paulo', true, ARRAY['Bar/Lanchonete','Vestiário','Espaço Família']),
('v3', 'org-1', 'Arena Sul', 'Ladeira do Sol, 88, São Paulo', true, ARRAY['Refletores']),
('v4', 'org-1', 'Campo da Paz', 'Rua da Harmonia, 10, São Paulo', false, ARRAY['Estacionamento']);

INSERT INTO public.referees (id, organization_id, name, level, photo_url, matches_officiated, average_rating, status, phone, email)
VALUES
('r1', 'org-1', 'Pierluigi Collina', 'ELITE', 'https://ui-avatars.com/api/?name=Pierluigi+Collina', 154, 4.9, 'AVAILABLE', '(11) 99999-0000', 'collina@arbitros.com'),
('r2', 'org-1', 'Sálvio Spinola', 'OURO', 'https://ui-avatars.com/api/?name=Salvio+Spinola', 82, 4.2, 'AVAILABLE', '(11) 98888-1111', 'salvio@arbitros.com'),
('r3', 'org-1', 'Edina Alves', 'ELITE', 'https://ui-avatars.com/api/?name=Edina+Alves', 45, 4.7, 'UNAVAILABLE', '(11) 97777-2222', 'edina@arbitros.com');

INSERT INTO public.players (id, club_id, name, shirt_number, position, status, document_status, birth_date, photo_url, stats)
VALUES
('p1', 'c1', 'Gabriel Barbosa', 9, 'ATA', 'ACTIVE', 'APPROVED', '1996-08-30', 'https://picsum.photos/seed/p1/150/150', '{"matches":24,"goals":18,"assists":7,"yellowCards":2,"redCards":1,"rating":8.5}'::jsonb),
('p2', 'c1', 'Diego Ribas', 10, 'MEI', 'ACTIVE', 'APPROVED', '1985-02-28', 'https://picsum.photos/seed/p2/150/150', '{"matches":22,"goals":5,"assists":14,"yellowCards":4,"redCards":0,"rating":7.9}'::jsonb),
('p3', 'c2', 'Felipe Melo', 5, 'VOL', 'SUSPENDED', 'APPROVED', '1983-06-26', 'https://picsum.photos/seed/p3/150/150', '{"matches":15,"goals":1,"assists":2,"yellowCards":8,"redCards":3,"rating":6.8}'::jsonb),
('p4', 'c2', 'Hulk', 7, 'ATA', 'ACTIVE', 'APPROVED', '1986-07-25', 'https://picsum.photos/seed/p4/150/150', '{"matches":28,"goals":25,"assists":9,"yellowCards":1,"redCards":0,"rating":9.2}'::jsonb),
('p5', 'c1', 'Weverton', 1, 'GOL', 'ACTIVE', 'APPROVED', '1987-12-13', 'https://picsum.photos/seed/p5/150/150', '{"matches":30,"goals":0,"assists":0,"yellowCards":1,"redCards":0,"rating":8.8}'::jsonb),
('p6', 'c2', 'Everson', 1, 'GOL', 'ACTIVE', 'PENDING', '1990-07-22', 'https://picsum.photos/seed/p6/150/150', '{"matches":25,"goals":0,"assists":0,"yellowCards":2,"redCards":0,"rating":8.2}'::jsonb);

INSERT INTO public.matches (id, championship_id, home_team_id, away_team_id, match_date, match_time, location, venue_id, status, referee_id, report_status, score)
VALUES
('m1', 'ch1', 'c1', 'c2', '2026-04-19', '10:00', 'Campo do XV', 'v1', 'SCHEDULED', 'r1', NULL, NULL),
('m2', 'ch1', 'c3', 'c4', '2026-04-19', '12:30', 'Arena da Várzea', 'v2', 'SCHEDULED', 'r2', NULL, NULL),
('m3', 'ch1', 'c1', 'c3', '2026-04-12', '10:00', 'Campo do XV', 'v1', 'FINISHED', 'r1', 'APPROVED', '{"home":2,"away":1}'::jsonb),
('m4', 'ch1', 'c2', 'c4', '2026-04-11', '15:00', 'Arena Sul', 'v3', 'FINISHED', 'r3', 'PENDING', '{"home":0,"away":0}'::jsonb);

INSERT INTO public.referee_ratings (id, match_id, referee_id, club_id, score, comment, created_at)
VALUES
('rt1', 'm3', 'r1', 'c1', 5, 'Excelente condução física e técnica.', '2026-04-12T12:00:00Z'),
('rt2', 'm3', 'r1', 'c3', 4, 'Apito muito rigoroso, mas justo.', '2026-04-12T12:10:00Z');

INSERT INTO public.fee_definitions (id, championship_id, name, amount_cents, category)
VALUES ('fee-1', 'ch1', 'Taxa de inscrição Sênior', 15000, 'registration');

INSERT INTO public.invoices (id, organization_id, club_id, championship_id, amount_cents, description, due_date, status)
VALUES
('inv-1', 'org-1', 'c2', 'ch1', 15000, 'Inscrição Copa Regional 2026', '2026-05-01', 'OPEN'),
('inv-2', 'org-1', 'c4', 'ch1', 15000, 'Inscrição Copa Regional 2026', '2026-05-01', 'OPEN');

INSERT INTO public.notification_templates (id, organization_id, template_key, subject_template, body_template)
VALUES ('tpl-1', 'org-1', 'MATCH_REMINDER', 'Lembrete: {{match_label}}', 'Olá, o jogo está agendado para {{date}} às {{time}}.');

INSERT INTO public.match_reports (id, match_id, state)
SELECT gen_random_uuid()::text, m.id, CASE WHEN m.report_status = 'APPROVED' THEN 'APPROVED' ELSE 'DRAFT' END
FROM public.matches m
WHERE NOT EXISTS (SELECT 1 FROM public.match_reports r WHERE r.match_id = m.id);
