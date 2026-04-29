-- CRM Campeonatos: schema core + RLS + seed demo (ids alinhados ao mockData.ts)

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organização e campeonato
-- ---------------------------------------------------------------------------
CREATE TABLE public.organizations (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.championships (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  season text NOT NULL,
  type text NOT NULL CHECK (type IN ('POINTS_CORRIDOS', 'GROUPS', 'KNOCKOUT')),
  status text NOT NULL CHECK (status IN ('PLANNING', 'ACTIVE', 'FINISHED')),
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  banner_url text,
  public_slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clubs (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  short_name text NOT NULL,
  logo_url text NOT NULL,
  president_id text NOT NULL,
  address text,
  phone text,
  email text,
  custom_rules text,
  home_field text,
  has_pending_finance boolean NOT NULL DEFAULT false,
  founded_year int,
  titles text[] DEFAULT '{}',
  stats jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.venues (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  contact_phone text,
  capacity int,
  facilities text[] DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.referees (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  level text NOT NULL CHECK (level IN ('PRATA', 'OURO', 'ELITE')),
  photo_url text NOT NULL,
  matches_officiated int NOT NULL DEFAULT 0,
  average_rating numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('AVAILABLE', 'UNAVAILABLE')),
  phone text,
  email text,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.players (
  id text PRIMARY KEY,
  club_id text NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  name text NOT NULL,
  shirt_number int NOT NULL,
  position text NOT NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  document_status text NOT NULL CHECK (document_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  birth_date date NOT NULL,
  contract_url text,
  photo_url text NOT NULL,
  stats jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.matches (
  id text PRIMARY KEY,
  championship_id text NOT NULL REFERENCES public.championships (id) ON DELETE CASCADE,
  home_team_id text NOT NULL REFERENCES public.clubs (id),
  away_team_id text NOT NULL REFERENCES public.clubs (id),
  match_date date NOT NULL,
  match_time text NOT NULL DEFAULT '00:00',
  location text NOT NULL,
  venue_id text REFERENCES public.venues (id),
  status text NOT NULL CHECK (status IN ('SCHEDULED', 'LIVE', 'FINISHED')),
  referee_id text REFERENCES public.referees (id),
  report_status text CHECK (report_status IN ('PENDING', 'APPROVED', 'CONTESTED')),
  contest_reason text,
  score jsonb,
  lineups jsonb,
  gallery jsonb,
  current_minute int,
  homologated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.match_events (
  id text PRIMARY KEY,
  match_id text NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  team_id text NOT NULL REFERENCES public.clubs (id),
  player_id text NOT NULL REFERENCES public.players (id),
  type text NOT NULL CHECK (type IN ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'ASSIST', 'SUBSTITUTION')),
  minute int NOT NULL,
  player_in_id text REFERENCES public.players (id),
  player_out_id text REFERENCES public.players (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.referee_ratings (
  id text PRIMARY KEY,
  match_id text NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  referee_id text NOT NULL REFERENCES public.referees (id),
  club_id text NOT NULL REFERENCES public.clubs (id),
  score int NOT NULL CHECK (score >= 1 AND score <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Membros e auditoria
-- ---------------------------------------------------------------------------
CREATE TABLE public.organization_members (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  club_id text REFERENCES public.clubs (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'CLUB_ADMIN', 'REFEREE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, club_id)
);

-- Um vínculo “nível organização” (club_id nulo) por usuário/org
CREATE UNIQUE INDEX uniq_org_level_member ON public.organization_members (user_id, organization_id)
  WHERE club_id IS NULL;

CREATE TABLE public.audit_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id uuid REFERENCES auth.users (id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  payload_before jsonb,
  payload_after jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_logs (created_at DESC);

-- ---------------------------------------------------------------------------
-- Financeiro
-- ---------------------------------------------------------------------------
CREATE TABLE public.fee_definitions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  championship_id text NOT NULL REFERENCES public.championships (id) ON DELETE CASCADE,
  name text NOT NULL,
  amount_cents int NOT NULL,
  category text NOT NULL DEFAULT 'registration',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invoices (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  club_id text NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  championship_id text REFERENCES public.championships (id) ON DELETE SET NULL,
  amount_cents int NOT NULL,
  description text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PAID', 'CANCELLED', 'OVERDUE')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id text NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
  external_id text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED')),
  method text NOT NULL DEFAULT 'PIX',
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Súmula / homologação
-- ---------------------------------------------------------------------------
CREATE TABLE public.match_reports (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id text NOT NULL UNIQUE REFERENCES public.matches (id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'DRAFT' CHECK (state IN (
    'DRAFT', 'SUBMITTED_BY_REFEREE', 'CLUBS_ACK', 'CONTESTED', 'LEAGUE_REVIEW', 'APPROVED', 'ADJUSTED'
  )),
  referee_signed_at timestamptz,
  home_signed_at timestamptz,
  away_signed_at timestamptz,
  contest_reason text,
  league_decision text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.match_report_events (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_report_id text NOT NULL REFERENCES public.match_reports (id) ON DELETE CASCADE,
  kind text NOT NULL,
  payload jsonb,
  created_by uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Notificações
-- ---------------------------------------------------------------------------
CREATE TABLE public.notification_templates (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  template_key text NOT NULL,
  subject_template text NOT NULL,
  body_template text NOT NULL,
  UNIQUE (organization_id, template_key)
);

CREATE TABLE public.notification_queue (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id text NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'push')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'SENT', 'FAILED')),
  attempts int NOT NULL DEFAULT 0,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Check-in / roster
-- ---------------------------------------------------------------------------
CREATE TABLE public.match_roster (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id text NOT NULL REFERENCES public.matches (id) ON DELETE CASCADE,
  player_id text NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL CHECK (method IN ('LIST', 'QR')),
  UNIQUE (match_id, player_id)
);

-- ---------------------------------------------------------------------------
-- Documentos e suspensões
-- ---------------------------------------------------------------------------
CREATE TABLE public.documents (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  championship_id text REFERENCES public.championships (id) ON DELETE CASCADE,
  title text NOT NULL,
  storage_path text NOT NULL,
  version int NOT NULL DEFAULT 1,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  deadline date,
  document_type text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.regulation_versions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  championship_id text NOT NULL REFERENCES public.championships (id) ON DELETE CASCADE,
  version int NOT NULL,
  storage_path text NOT NULL,
  valid_from date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (championship_id, version)
);

CREATE TABLE public.suspensions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  player_id text NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  championship_id text NOT NULL REFERENCES public.championships (id) ON DELETE CASCADE,
  reason text NOT NULL,
  source_match_id text REFERENCES public.matches (id) ON DELETE SET NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- IA (sugestão com revisão humana)
-- ---------------------------------------------------------------------------
CREATE TABLE public.ai_suggestions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id text REFERENCES public.matches (id) ON DELETE CASCADE,
  kind text NOT NULL,
  content text NOT NULL,
  reviewed_by uuid REFERENCES auth.users (id),
  reviewed_at timestamptz,
  applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Calendário: bloqueios de campo
-- ---------------------------------------------------------------------------
CREATE TABLE public.venue_blackouts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  venue_id text NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_champ_date ON public.matches (championship_id, match_date, match_time);
CREATE INDEX idx_invoices_club ON public.invoices (club_id, status);
