-- =============================================================================
-- Times (clubes) com login próprio via convite + inscrição de atletas
-- Roda DEPOIS de 20260602120000_owner_isolation_login_rules.sql
--
-- Modelo:
--   • O DONO gera um link de convite por clube (create_club_invite).
--   • O TIME abre /convite/:token, cria a conta (signUp) e resgata o convite
--     (redeem_club_invite) → vira CLUB_ADMIN vinculado ao clube.
--   • O TIME só gerencia os atletas do PRÓPRIO clube, e só pode INSERIR
--     enquanto as inscrições estiverem abertas (rules.registrationOpen no
--     campeonato da org).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers de papel / inscrição
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_is_org_admin(p_org text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = p_org
      AND m.role = 'SUPER_ADMIN'
      AND m.club_id IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.user_manages_club(p_club text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    -- CLUB_ADMIN do próprio clube
    SELECT 1 FROM public.organization_members m
    WHERE m.user_id = auth.uid() AND m.club_id = p_club AND m.role = 'CLUB_ADMIN'
  ) OR EXISTS (
    -- ou SUPER_ADMIN da org dona do clube
    SELECT 1
    FROM public.clubs cl
    JOIN public.organization_members m
      ON m.organization_id = cl.organization_id
     AND m.user_id = auth.uid()
     AND m.role = 'SUPER_ADMIN'
     AND m.club_id IS NULL
    WHERE cl.id = p_club
  );
$$;

CREATE OR REPLACE FUNCTION public.org_registration_open(p_org text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.championships c
    WHERE c.organization_id = p_org
      AND COALESCE((c.rules->>'registrationOpen')::boolean, false) = true
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS de atletas: organizador = tudo; clube = só o próprio (insert se aberto)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS players_rw ON public.players;

CREATE POLICY players_select ON public.players
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clubs cl
    WHERE cl.id = players.club_id AND public.user_can_org(cl.organization_id)
  ));

CREATE POLICY players_insert ON public.players
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clubs cl
    WHERE cl.id = players.club_id AND (
      public.user_is_org_admin(cl.organization_id)
      OR (public.user_manages_club(players.club_id) AND public.org_registration_open(cl.organization_id))
    )
  ));

CREATE POLICY players_update ON public.players
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clubs cl
    WHERE cl.id = players.club_id AND (
      public.user_is_org_admin(cl.organization_id) OR public.user_manages_club(players.club_id)
    )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clubs cl
    WHERE cl.id = players.club_id AND (
      public.user_is_org_admin(cl.organization_id) OR public.user_manages_club(players.club_id)
    )
  ));

-- Apagar atleta: apenas o organizador (clube não remove do elenco oficial).
CREATE POLICY players_delete ON public.players
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clubs cl
    WHERE cl.id = players.club_id AND public.user_is_org_admin(cl.organization_id)
  ));

-- ---------------------------------------------------------------------------
-- Convites de clube
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.club_invites (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  token text NOT NULL UNIQUE,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  club_id text NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users (id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  used_at timestamptz,
  used_by uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.club_invites ENABLE ROW LEVEL SECURITY;

-- Organizador da org gerencia os convites da sua org.
DROP POLICY IF EXISTS club_invites_admin ON public.club_invites;
CREATE POLICY club_invites_admin ON public.club_invites
  FOR ALL TO authenticated
  USING (public.user_is_org_admin(organization_id))
  WITH CHECK (public.user_is_org_admin(organization_id));

-- Organizador cria um convite para um clube → retorna o token.
CREATE OR REPLACE FUNCTION public.create_club_invite(p_club_id text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_org text;
  v_token text;
BEGIN
  SELECT organization_id INTO v_org FROM public.clubs WHERE id = p_club_id;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Clube não encontrado';
  END IF;
  IF NOT public.user_is_org_admin(v_org) THEN
    RAISE EXCEPTION 'Apenas o organizador pode gerar convites';
  END IF;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  INSERT INTO public.club_invites (token, organization_id, club_id, created_by)
  VALUES (v_token, v_org, p_club_id, auth.uid());
  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_club_invite(text) TO authenticated;

-- Página de convite (anônimo): valida o token e mostra o nome do clube.
CREATE OR REPLACE FUNCTION public.get_club_invite(p_token text)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'valid', (i.id IS NOT NULL AND i.used_at IS NULL AND i.expires_at > now()),
    'clubId', i.club_id,
    'clubName', cl.name,
    'championshipName', (
      SELECT c.name FROM public.championships c
      WHERE c.organization_id = i.organization_id
      ORDER BY c.created_at DESC LIMIT 1
    )
  )
  FROM public.club_invites i
  JOIN public.clubs cl ON cl.id = i.club_id
  WHERE i.token = p_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_club_invite(text) TO anon, authenticated;

-- Resgate do convite (usuário JÁ autenticado, recém-criado via signUp):
-- cria o vínculo CLUB_ADMIN com o clube e marca o convite como usado.
CREATE OR REPLACE FUNCTION public.redeem_club_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  i public.club_invites%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Faça login antes de resgatar o convite';
  END IF;

  SELECT * INTO i FROM public.club_invites WHERE token = p_token FOR UPDATE;
  IF i.id IS NULL THEN
    RAISE EXCEPTION 'Convite inválido';
  END IF;
  IF i.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Convite já utilizado';
  END IF;
  IF i.expires_at <= now() THEN
    RAISE EXCEPTION 'Convite expirado';
  END IF;

  INSERT INTO public.organization_members (user_id, organization_id, role, club_id)
  VALUES (auth.uid(), i.organization_id, 'CLUB_ADMIN', i.club_id)
  ON CONFLICT (user_id, organization_id, club_id) DO NOTHING;

  -- conta criada pelo próprio time: senha já escolhida, sem troca obrigatória
  UPDATE public.profiles SET must_change_password = false WHERE user_id = auth.uid();

  UPDATE public.club_invites SET used_at = now(), used_by = auth.uid() WHERE id = i.id;

  RETURN jsonb_build_object('clubId', i.club_id, 'organizationId', i.organization_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_club_invite(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Vitrine pública (landing): últimas partidas finalizadas (anônimo)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_landing_matches()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(row ORDER BY (row->>'date') DESC), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', m.id,
      'date', m.match_date,
      'time', m.match_time,
      'championship', c.name,
      'homeName', hc.name,
      'homeLogo', hc.logo_url,
      'awayName', ac.name,
      'awayLogo', ac.logo_url,
      'score', m.score,
      'status', m.status
    ) AS row
    FROM public.matches m
    JOIN public.championships c ON c.id = m.championship_id
    JOIN public.clubs hc ON hc.id = m.home_team_id
    JOIN public.clubs ac ON ac.id = m.away_team_id
    WHERE m.status = 'FINISHED'
    ORDER BY m.match_date DESC, m.match_time DESC
    LIMIT 12
  ) t;
$$;

GRANT EXECUTE ON FUNCTION public.get_landing_matches() TO anon, authenticated;
