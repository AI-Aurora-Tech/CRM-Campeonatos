import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_CHAMPIONSHIP_ID,
  rowToChampionship,
  rowToClub,
  rowToMatch,
  rowToMatchEvent,
  rowToPlayer,
  rowToRating,
  rowToReferee,
  rowToVenue,
  type ChampionshipRow,
  type ClubRow,
  type MatchEventRow,
  type MatchRow,
  type PlayerRow,
  type RefereeRatingRow,
  type RefereeRow,
  type VenueRow,
} from './mappers';
import type {
  Championship,
  ChampionshipBundle,
  Club,
  Match,
  MatchEvent,
  Player,
  Referee,
  RefereeRating,
  Venue,
} from '../types';

export interface DashboardPayload {
  organizationId: string;
  championshipId: string;
  championship: Championship;
  publicSlug: string | null;
  clubs: Club[];
  players: Player[];
  venues: Venue[];
  referees: Referee[];
  matches: Match[];
  ratings: RefereeRating[];
  matchEvents: MatchEvent[];
}

export async function fetchDashboard(
  client: SupabaseClient,
  championshipId = DEFAULT_CHAMPIONSHIP_ID
): Promise<DashboardPayload> {
  const { data: chRow, error: chErr } = await client
    .from('championships')
    .select('*')
    .eq('id', championshipId)
    .single();
  if (chErr) throw chErr;

  const typedCh = chRow as ChampionshipRow;
  const ch = rowToChampionship(typedCh);
  const orgId = typedCh.organization_id;
  const publicSlug = typedCh.public_slug ?? null;

  const { data: clubsData, error: clubsErr } = await client
    .from('clubs')
    .select('*')
    .eq('organization_id', orgId);
  if (clubsErr) throw clubsErr;

  const clubIds = (clubsData as ClubRow[]).map((c) => c.id);

  const playersRes =
    clubIds.length > 0
      ? await client.from('players').select('*').in('club_id', clubIds)
      : { data: [] as PlayerRow[], error: null as null };
  if (playersRes.error) throw playersRes.error;

  const { data: venuesData, error: venuesErr } = await client
    .from('venues')
    .select('*')
    .eq('organization_id', orgId);
  if (venuesErr) throw venuesErr;

  const { data: refereesData, error: refereesErr } = await client
    .from('referees')
    .select('*')
    .eq('organization_id', orgId);
  if (refereesErr) throw refereesErr;

  const { data: matchesData, error: matchesErr } = await client
    .from('matches')
    .select('*')
    .eq('championship_id', championshipId);
  if (matchesErr) throw matchesErr;

  const matchIds = (matchesData as MatchRow[]).map((m) => m.id);

  const ratingsRes =
    matchIds.length > 0
      ? await client.from('referee_ratings').select('*').in('match_id', matchIds)
      : { data: [] as RefereeRatingRow[], error: null as null };
  if (ratingsRes.error) throw ratingsRes.error;

  const eventsRes =
    matchIds.length > 0
      ? await client.from('match_events').select('*').in('match_id', matchIds)
      : { data: [] as MatchEventRow[], error: null as null };
  if (eventsRes.error) throw eventsRes.error;

  const clubs = (clubsData as ClubRow[]).map(rowToClub);
  const players = (playersRes.data as PlayerRow[]).map(rowToPlayer);
  const venues = (venuesData as VenueRow[]).map(rowToVenue);
  const referees = (refereesData as RefereeRow[]).map(rowToReferee);
  const matches = (matchesData as MatchRow[]).map(rowToMatch);
  const ratings = (ratingsRes.data as RefereeRatingRow[]).map(rowToRating);
  const matchEvents = (eventsRes.data as MatchEventRow[]).map(rowToMatchEvent);

  return {
    organizationId: orgId,
    championshipId: ch.id,
    championship: ch,
    publicSlug,
    clubs,
    players,
    venues,
    referees,
    matches,
    ratings,
    matchEvents,
  };
}

export interface AllBundlesResult {
  bundles: ChampionshipBundle[];
  /** Mapa campeonato -> organização dona (para salvar no escopo certo). */
  orgByChamp: Record<string, string>;
  /** Mapa campeonato -> slug público. */
  publicSlugByChamp: Record<string, string | null>;
  /** Primeiro campeonato (para selecionar por padrão). */
  activeId: string | null;
  organizationId: string | null;
}

/**
 * Carrega TODOS os campeonatos visíveis ao usuário logado.
 * O RLS já restringe às organizações das quais o usuário é membro,
 * então cada dono recebe apenas os seus torneios.
 */
export async function fetchAllBundles(client: SupabaseClient): Promise<AllBundlesResult> {
  const { data: champData, error: champErr } = await client
    .from('championships')
    .select('*')
    .order('created_at', { ascending: true });
  if (champErr) throw champErr;

  const champs = (champData ?? []) as ChampionshipRow[];
  if (champs.length === 0) {
    return { bundles: [], orgByChamp: {}, publicSlugByChamp: {}, activeId: null, organizationId: null };
  }

  const orgIds = Array.from(new Set(champs.map((c) => c.organization_id)));
  const champIds = champs.map((c) => c.id);

  const { data: clubsData, error: clubsErr } = await client
    .from('clubs')
    .select('*')
    .in('organization_id', orgIds);
  if (clubsErr) throw clubsErr;
  const clubRows = (clubsData as ClubRow[]) ?? [];

  const { data: venuesData, error: venuesErr } = await client
    .from('venues')
    .select('*')
    .in('organization_id', orgIds);
  if (venuesErr) throw venuesErr;
  const venueRows = (venuesData as VenueRow[]) ?? [];

  const { data: refData, error: refErr } = await client
    .from('referees')
    .select('*')
    .in('organization_id', orgIds);
  if (refErr) throw refErr;
  const refRows = (refData as RefereeRow[]) ?? [];

  const { data: matchData, error: matchErr } = await client
    .from('matches')
    .select('*')
    .in('championship_id', champIds);
  if (matchErr) throw matchErr;
  const matchRows = (matchData as MatchRow[]) ?? [];

  const clubIds = clubRows.map((c) => c.id);
  const matchIds = matchRows.map((m) => m.id);

  const playersRes =
    clubIds.length > 0
      ? await client.from('players').select('*').in('club_id', clubIds)
      : { data: [] as PlayerRow[], error: null as null };
  if (playersRes.error) throw playersRes.error;
  const playerRows = (playersRes.data as PlayerRow[]) ?? [];

  const ratingsRes =
    matchIds.length > 0
      ? await client.from('referee_ratings').select('*').in('match_id', matchIds)
      : { data: [] as RefereeRatingRow[], error: null as null };
  if (ratingsRes.error) throw ratingsRes.error;
  const ratingRows = (ratingsRes.data as RefereeRatingRow[]) ?? [];

  const eventsRes =
    matchIds.length > 0
      ? await client.from('match_events').select('*').in('match_id', matchIds)
      : { data: [] as MatchEventRow[], error: null as null };
  if (eventsRes.error) throw eventsRes.error;
  const eventRows = (eventsRes.data as MatchEventRow[]) ?? [];

  const orgByChamp: Record<string, string> = {};
  const publicSlugByChamp: Record<string, string | null> = {};

  const bundles: ChampionshipBundle[] = champs.map((ch) => {
    orgByChamp[ch.id] = ch.organization_id;
    publicSlugByChamp[ch.id] = ch.public_slug ?? null;

    const org = ch.organization_id;
    const orgClubRows = clubRows.filter((c) => c.organization_id === org);
    const orgClubIds = new Set(orgClubRows.map((c) => c.id));
    const champMatchRows = matchRows.filter((m) => m.championship_id === ch.id);
    const champMatchIds = new Set(champMatchRows.map((m) => m.id));

    return {
      championship: rowToChampionship(ch),
      clubs: orgClubRows.map(rowToClub),
      players: playerRows.filter((p) => orgClubIds.has(p.club_id)).map(rowToPlayer),
      venues: venueRows.filter((v) => v.organization_id === org).map(rowToVenue),
      referees: refRows.filter((r) => r.organization_id === org).map(rowToReferee),
      matches: champMatchRows.map(rowToMatch),
      ratings: ratingRows.filter((rt) => champMatchIds.has(rt.match_id)).map(rowToRating),
      matchEvents: eventRows.filter((e) => champMatchIds.has(e.match_id)).map(rowToMatchEvent),
      notifications: [],
      mediaAssets: [],
    };
  });

  return {
    bundles,
    orgByChamp,
    publicSlugByChamp,
    activeId: champs[0].id,
    organizationId: champs[0].organization_id,
  };
}

export { DEFAULT_CHAMPIONSHIP_ID } from './mappers';
export const DEFAULT_ORG_ID = 'org-1';
