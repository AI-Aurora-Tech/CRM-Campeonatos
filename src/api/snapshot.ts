import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_ORG_ID,
  championshipToRow,
  clubToRow,
  matchEventToRow,
  matchToRow,
  playerToRow,
  ratingToRow,
  refereeToRow,
  venueToRow,
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

export interface SnapshotInput {
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

function mergeMatchEvents(matches: Match[], standalone: MatchEvent[]): MatchEvent[] {
  const byId = new Map<string, MatchEvent>();
  for (const e of standalone) {
    byId.set(e.id, e);
  }
  for (const m of matches) {
    for (const e of m.events ?? []) {
      byId.set(e.id, { ...e, matchId: m.id });
    }
  }
  return [...byId.values()];
}

async function syncIds<T extends { id: string }>(
  client: SupabaseClient,
  table: string,
  orgFilter: { column: string; value: string } | null,
  nextRows: Record<string, unknown>[],
  idSelector: (row: Record<string, unknown>) => string
): Promise<void> {
  let q = client.from(table).select('id');
  if (orgFilter) q = q.eq(orgFilter.column, orgFilter.value);
  const { data: existing, error } = await q;
  if (error) throw error;
  const nextIds = new Set(nextRows.map((r) => idSelector(r)));
  const toRemove = (existing ?? [])
    .map((r: { id: string }) => r.id)
    .filter((id) => !nextIds.has(id));
  if (toRemove.length > 0) {
    const { error: delErr } = await client.from(table).delete().in('id', toRemove);
    if (delErr) throw delErr;
  }
  if (nextRows.length > 0) {
    const { error: upErr } = await client.from(table).upsert(nextRows, { onConflict: 'id' });
    if (upErr) throw upErr;
  }
}

export async function saveDashboardSnapshot(
  client: SupabaseClient,
  input: SnapshotInput
): Promise<void> {
  const orgId = DEFAULT_ORG_ID;
  const ch = input.championship;

  const clubRows = input.clubs.map((c) => clubToRow(c, orgId));
  await syncIds(
    client,
    'clubs',
    { column: 'organization_id', value: orgId },
    clubRows as unknown as Record<string, unknown>[],
    (r) => r.id as string
  );

  const venueRows = input.venues.map((v) => venueToRow(v, orgId));
  await syncIds(
    client,
    'venues',
    { column: 'organization_id', value: orgId },
    venueRows as unknown as Record<string, unknown>[],
    (r) => r.id as string
  );

  const refereeRows = input.referees.map((r) => refereeToRow(r, orgId));
  await syncIds(
    client,
    'referees',
    { column: 'organization_id', value: orgId },
    refereeRows as unknown as Record<string, unknown>[],
    (r) => r.id as string
  );

  const playerRows = input.players.map(playerToRow);
  const orgClubIds = input.clubs.map((c) => c.id);
  const { data: existingPlayers, error: epErr } = await client
    .from('players')
    .select('id')
    .in('club_id', orgClubIds.length ? orgClubIds : ['__none__']);
  if (epErr) throw epErr;
  const nextPlayerIds = new Set(playerRows.map((r) => r.id));
  const playersToDelete = (existingPlayers ?? [])
    .map((r: { id: string }) => r.id)
    .filter((id) => !nextPlayerIds.has(id));
  if (playersToDelete.length > 0) {
    const { error: pDel } = await client.from('players').delete().in('id', playersToDelete);
    if (pDel) throw pDel;
  }
  if (playerRows.length > 0) {
    const { error: pUp } = await client.from('players').upsert(playerRows, { onConflict: 'id' });
    if (pUp) throw pUp;
  }

  const chRow = championshipToRow(ch, orgId, input.publicSlug);
  const { error: chErr } = await client.from('championships').upsert(chRow, { onConflict: 'id' });
  if (chErr) throw chErr;

  const matchRows = input.matches.map(matchToRow);
  await syncIds(
    client,
    'matches',
    { column: 'championship_id', value: ch.id },
    matchRows as unknown as Record<string, unknown>[],
    (r) => r.id as string
  );

  const ratingRows = input.ratings.map((x) => ratingToRow(x));
  if (ratingRows.length > 0) {
    const { error: rtErr } = await client
      .from('referee_ratings')
      .upsert(ratingRows as unknown as Record<string, unknown>[], { onConflict: 'id' });
    if (rtErr) throw rtErr;
  }

  const allEvents = mergeMatchEvents(input.matches, input.matchEvents);
  const matchIds = input.matches.map((m) => m.id);
  if (matchIds.length > 0) {
    const { error: delEv } = await client.from('match_events').delete().in('match_id', matchIds);
    if (delEv) throw delEv;
  }
  if (allEvents.length > 0) {
    const { error: insEv } = await client
      .from('match_events')
      .insert(allEvents.map(matchEventToRow) as unknown as Record<string, unknown>[]);
    if (insEv) throw insEv;
  }
}
