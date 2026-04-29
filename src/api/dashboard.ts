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

export { DEFAULT_CHAMPIONSHIP_ID } from './mappers';
export const DEFAULT_ORG_ID = 'org-1';
