import type {
  Championship,
  Club,
  Match,
  Player,
  Referee,
  Venue,
  RefereeRating,
  MatchEvent,
} from '../types';

export const DEFAULT_ORG_ID = 'org-1';
export const DEFAULT_CHAMPIONSHIP_ID =
  (import.meta.env.VITE_CHAMPIONSHIP_ID as string | undefined) ?? 'ch1';

type Json = Record<string, unknown> | null;

export interface ClubRow {
  id: string;
  organization_id: string;
  name: string;
  short_name: string;
  logo_url: string;
  president_id: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  custom_rules: string | null;
  home_field: string | null;
  has_pending_finance: boolean;
  founded_year: number | null;
  titles: string[] | null;
  stats: Json;
}

export interface ChampionshipRow {
  id: string;
  organization_id: string;
  name: string;
  season: string;
  type: Championship['type'];
  status: Championship['status'];
  rules: Championship['rules'];
  banner_url: string | null;
  public_slug: string | null;
}

export interface PlayerRow {
  id: string;
  club_id: string;
  name: string;
  shirt_number: number;
  position: string;
  status: Player['status'];
  document_status: Player['documentStatus'];
  birth_date: string;
  contract_url: string | null;
  photo_url: string;
  stats: Json;
}

export interface VenueRow {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  contact_phone: string | null;
  capacity: number | null;
  facilities: string[] | null;
  active: boolean;
}

export interface RefereeRow {
  id: string;
  organization_id: string;
  name: string;
  level: Referee['level'];
  photo_url: string;
  matches_officiated: number;
  average_rating: number;
  status: Referee['status'];
  phone: string | null;
  email: string | null;
}

export interface MatchRow {
  id: string;
  championship_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  match_time: string;
  location: string;
  venue_id: string | null;
  status: Match['status'];
  referee_id: string | null;
  report_status: Match['reportStatus'] | null;
  contest_reason: string | null;
  score: { home: number; away: number } | null;
  lineups: Match['lineups'] | null;
  gallery: string[] | null;
  current_minute: number | null;
}

export interface MatchEventRow {
  id: string;
  match_id: string;
  team_id: string;
  player_id: string;
  type: MatchEvent['type'];
  minute: number;
  player_in_id: string | null;
  player_out_id: string | null;
}

export interface RefereeRatingRow {
  id: string;
  match_id: string;
  referee_id: string;
  club_id: string;
  score: number;
  comment: string | null;
  created_at: string;
}

export function rowToClub(r: ClubRow): Club {
  return {
    id: r.id,
    name: r.name,
    shortName: r.short_name,
    logoUrl: r.logo_url,
    presidentId: r.president_id,
    address: r.address ?? undefined,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    customRules: r.custom_rules ?? undefined,
    homeField: r.home_field ?? undefined,
    hasPendingFinance: r.has_pending_finance,
    foundedYear: r.founded_year ?? undefined,
    titles: r.titles ?? undefined,
    stats: (r.stats as Club['stats']) ?? undefined,
  };
}

export function clubToRow(c: Club, organizationId = DEFAULT_ORG_ID): ClubRow {
  return {
    id: c.id,
    organization_id: organizationId,
    name: c.name,
    short_name: c.shortName,
    logo_url: c.logoUrl,
    president_id: c.presidentId,
    address: c.address ?? null,
    phone: c.phone ?? null,
    email: c.email ?? null,
    custom_rules: c.customRules ?? null,
    home_field: c.homeField ?? null,
    has_pending_finance: Boolean(c.hasPendingFinance),
    founded_year: c.foundedYear ?? null,
    titles: c.titles ?? null,
    stats: (c.stats as Json) ?? null,
  };
}

export function rowToChampionship(r: ChampionshipRow): Championship {
  return {
    id: r.id,
    name: r.name,
    season: r.season,
    type: r.type,
    status: r.status,
    rules: r.rules as Championship['rules'],
    bannerUrl: r.banner_url ?? undefined,
  };
}

export function championshipToRow(
  c: Championship,
  organizationId = DEFAULT_ORG_ID,
  publicSlug?: string | null
): ChampionshipRow {
  return {
    id: c.id,
    organization_id: organizationId,
    name: c.name,
    season: c.season,
    type: c.type,
    status: c.status,
    rules: c.rules,
    banner_url: c.bannerUrl ?? null,
    public_slug: publicSlug ?? null,
  };
}

export function rowToPlayer(r: PlayerRow): Player {
  return {
    id: r.id,
    clubId: r.club_id,
    name: r.name,
    shirtNumber: r.shirt_number,
    position: r.position,
    status: r.status,
    documentStatus: r.document_status,
    birthDate: r.birth_date,
    contractUrl: r.contract_url ?? undefined,
    photoUrl: r.photo_url,
    stats: (r.stats as Player['stats']) ?? undefined,
  };
}

export function playerToRow(p: Player): PlayerRow {
  return {
    id: p.id,
    club_id: p.clubId,
    name: p.name,
    shirt_number: p.shirtNumber,
    position: p.position,
    status: p.status,
    document_status: p.documentStatus,
    birth_date: p.birthDate,
    contract_url: p.contractUrl ?? null,
    photo_url: p.photoUrl,
    stats: (p.stats as Json) ?? null,
  };
}

export function rowToVenue(r: VenueRow): Venue {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    contactPhone: r.contact_phone ?? undefined,
    capacity: r.capacity ?? undefined,
    facilities: r.facilities ?? undefined,
    active: r.active,
  };
}

export function venueToRow(v: Venue, organizationId = DEFAULT_ORG_ID): VenueRow {
  return {
    id: v.id,
    organization_id: organizationId,
    name: v.name,
    address: v.address,
    contact_phone: v.contactPhone ?? null,
    capacity: v.capacity ?? null,
    facilities: v.facilities ?? null,
    active: v.active,
  };
}

export function rowToReferee(r: RefereeRow): Referee {
  return {
    id: r.id,
    name: r.name,
    level: r.level,
    photoUrl: r.photo_url,
    matchesOfficiated: r.matches_officiated,
    averageRating: Number(r.average_rating),
    status: r.status,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
  };
}

export function refereeToRow(r: Referee, organizationId = DEFAULT_ORG_ID): RefereeRow {
  return {
    id: r.id,
    organization_id: organizationId,
    name: r.name,
    level: r.level,
    photo_url: r.photoUrl,
    matches_officiated: r.matchesOfficiated,
    average_rating: r.averageRating,
    status: r.status,
    phone: r.phone ?? null,
    email: r.email ?? null,
  };
}

export function rowToMatch(r: MatchRow): Match {
  return {
    id: r.id,
    championshipId: r.championship_id,
    homeTeamId: r.home_team_id,
    awayTeamId: r.away_team_id,
    date: r.match_date,
    time: r.match_time,
    location: r.location,
    venueId: r.venue_id ?? undefined,
    status: r.status,
    refereeId: r.referee_id ?? undefined,
    reportStatus: r.report_status ?? undefined,
    contestReason: r.contest_reason ?? undefined,
    score: r.score ?? undefined,
    lineups: r.lineups ?? undefined,
    gallery: r.gallery ?? undefined,
    currentMinute: r.current_minute ?? undefined,
  };
}

export function matchToRow(m: Match): MatchRow {
  return {
    id: m.id,
    championship_id: m.championshipId,
    home_team_id: m.homeTeamId,
    away_team_id: m.awayTeamId,
    match_date: m.date,
    match_time: m.time,
    location: m.location,
    venue_id: m.venueId ?? null,
    status: m.status,
    referee_id: m.refereeId ?? null,
    report_status: m.reportStatus ?? null,
    contest_reason: m.contestReason ?? null,
    score: m.score ?? null,
    lineups: m.lineups ?? null,
    gallery: m.gallery ?? null,
    current_minute: m.currentMinute ?? null,
  };
}

export function rowToMatchEvent(r: MatchEventRow): MatchEvent {
  return {
    id: r.id,
    matchId: r.match_id,
    teamId: r.team_id,
    playerId: r.player_id,
    type: r.type,
    minute: r.minute,
    playerInId: r.player_in_id ?? undefined,
    playerOutId: r.player_out_id ?? undefined,
  };
}

export function matchEventToRow(e: MatchEvent): MatchEventRow {
  return {
    id: e.id,
    match_id: e.matchId,
    team_id: e.teamId,
    player_id: e.playerId,
    type: e.type,
    minute: e.minute,
    player_in_id: e.playerInId ?? null,
    player_out_id: e.playerOutId ?? null,
  };
}

export function rowToRating(r: RefereeRatingRow): RefereeRating {
  return {
    id: r.id,
    matchId: r.match_id,
    refereeId: r.referee_id,
    clubId: r.club_id,
    score: r.score,
    comment: r.comment ?? undefined,
    createdAt: r.created_at,
  };
}

export function ratingToRow(r: RefereeRating): RefereeRatingRow {
  return {
    id: r.id,
    match_id: r.matchId,
    referee_id: r.refereeId,
    club_id: r.clubId,
    score: r.score,
    comment: r.comment ?? null,
    created_at: r.createdAt,
  };
}
