-- =============================================================================
-- CRM Campeonatos — Isolamento por dono + login por usuário + regras (zonas)
-- Roda DEPOIS das migrações 20250422120000..03.
--
-- O que este script faz:
--   1) Cria a tabela public.profiles (usuário, e-mail real, troca de senha).
--   2) Cria resolve_login_email(username) p/ login por usuário (resolve o e-mail).
--   3) Remove o gatilho que jogava TODO novo usuário em 'org-1' (isolamento).
--      Cada cliente passa a ter a PRÓPRIA organização (provisionada à parte).
--   4) (Opcional) Limpa os dados demo (org-1).
--   5) Provisiona o cliente diego_fnf (org-fnf + campeonato com zonas de regra).
--
-- IMPORTANTE: o passo 5 espera que o usuário de auth do Diego JÁ EXISTA.
-- Crie-o antes em: Supabase → Authentication → Users → Add user
--   • Email: <o e-mail real do Diego>      (usado para recuperação de senha)
--   • Password: FNF2026
--   • Auto Confirm User: SIM
-- Depois, troque o placeholder EMAIL_DO_DIEGO abaixo e rode este arquivo.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Perfis (1:1 com auth.users) — guarda usuário, e-mail real e flag de senha
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  full_name text,
  email text,                                  -- e-mail real (recuperação de senha)
  must_change_password boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- username case-insensitive único (DIEGO_FNF == diego_fnf)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_profiles_username_lower
  ON public.profiles (lower(username));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- O usuário só enxerga/edita o próprio perfil (ex.: baixar a flag must_change_password)
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2) Login por usuário: resolve username -> e-mail (chamável por anônimo)
--    O front pega o usuário digitado, descobre o e-mail e faz signInWithPassword.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_login_email(p_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles
  WHERE lower(username) = lower(trim(p_username))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_login_email(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Isolamento: novo usuário NÃO entra mais em 'org-1' automaticamente.
--    Cada dono tem a própria organização (provisionada manualmente).
--    Mantemos um gatilho leve que só garante a linha em profiles a partir
--    dos metadados (username / full_name) — sem criar nenhuma organização.
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, email, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, true)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4) (OPCIONAL) Remover dados demo (org-1). Descomente se quiser DB limpo.
--    O CASCADE remove campeonatos/clubes/jogos/etc. da org demo.
-- ---------------------------------------------------------------------------
-- DELETE FROM public.organizations WHERE id = 'org-1';

-- ---------------------------------------------------------------------------
-- 5) Provisionamento do cliente: Diego (FNF)
--    >>> Troque 'EMAIL_DO_DIEGO' pelo e-mail real cadastrado no Auth <<<
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_email text := 'EMAIL_DO_DIEGO';      -- <<< AJUSTE AQUI (mesmo e-mail do Auth)
  v_uid   uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(v_email) LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário de auth com e-mail % não encontrado. Crie-o em Authentication → Add user antes de rodar este passo.', v_email;
  END IF;

  -- Organização própria do cliente (isolada)
  INSERT INTO public.organizations (id, name)
  VALUES ('org-fnf', 'FNF — Diego')
  ON CONFLICT (id) DO NOTHING;

  -- Vínculo do Diego como dono (SUPER_ADMIN) da sua organização
  INSERT INTO public.organization_members (user_id, organization_id, role, club_id)
  VALUES (v_uid, 'org-fnf', 'SUPER_ADMIN', NULL)
  ON CONFLICT (user_id, organization_id, club_id) DO NOTHING;

  -- Perfil: login por usuário "diego_fnf", e-mail real e troca de senha obrigatória
  INSERT INTO public.profiles (user_id, username, full_name, email, must_change_password)
  VALUES (v_uid, 'diego_fnf', 'Diego (FNF)', v_email, true)
  ON CONFLICT (user_id) DO UPDATE
    SET username = EXCLUDED.username,
        email = EXCLUDED.email,
        must_change_password = true;

  -- Campeonato inicial do cliente, já com REGRAS PERSONALIZADAS (zonas de classificação)
  -- Exemplo pedido: 20 times → 1º-5º classificam direto, 6º-10º mata-mata, 11º-20º eliminados.
  INSERT INTO public.championships (id, organization_id, name, season, type, status, rules, public_slug)
  VALUES (
    'ch-fnf-1',
    'org-fnf',
    'Campeonato FNF 2026',
    '2026',
    'POINTS_CORRIDOS',
    'PLANNING',
    jsonb_build_object(
      'yellowCardLimit', 3,
      'pointsPerWin', 3,
      'pointsPerDraw', 1,
      'qualification', jsonb_build_object(
        'enabled', true,
        'zones', jsonb_build_array(
          jsonb_build_object('id','q','label','Classificação direta','from',1,'to',5,'type','QUALIFIED','color','#16a34a'),
          jsonb_build_object('id','p','label','Playoff (Mata-mata)','from',6,'to',10,'type','PLAYOFF','color','#f59e0b'),
          jsonb_build_object('id','e','label','Eliminados','from',11,'to',20,'type','ELIMINATED','color','#dc2626')
        )
      )
    ),
    'fnf-2026'
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
