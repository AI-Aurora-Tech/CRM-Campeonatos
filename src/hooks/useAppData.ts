import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { DEFAULT_ORG_ID, fetchDashboard } from '../api/dashboard';
import { saveDashboardSnapshot } from '../api/snapshot';
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  MOCK_CHAMPIONSHIP,
  MOCK_CLUBS,
  MOCK_MATCHES,
  MOCK_PLAYERS,
  MOCK_RATINGS,
  MOCK_REFEREES,
  MOCK_USER,
  MOCK_VENUES,
} from '../mockData';
import type {
  Championship,
  Club,
  Match,
  MatchEvent,
  MediaAsset,
  Notification,
  Player,
  Referee,
  RefereeRating,
  User,
  Venue,
} from '../types';

export function useAppData() {
  const supabase = useMemo(() => getSupabase(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState(DEFAULT_ORG_ID);

  const [clubs, setClubs] = useState<Club[]>(MOCK_CLUBS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [referees, setReferees] = useState<Referee[]>(MOCK_REFEREES);
  const [ratings, setRatings] = useState<RefereeRating[]>(MOCK_RATINGS);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [championship, setChampionship] = useState<Championship>(MOCK_CHAMPIONSHIP);

  const lastSavedKey = useRef<string>('');
  /** Evita gravar mock no banco antes do primeiro fetch pós-login. */
  const [dataHydrated, setDataHydrated] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setAuthReady(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const useRemote = Boolean(supabase && session);

  useEffect(() => {
    if (!supabase || !session) {
      setDataHydrated(true);
      return;
    }
    setDataHydrated(false);
  }, [supabase, session]);

  const loadRemote = useCallback(async () => {
    if (!supabase || !session) return;
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const d = await fetchDashboard(supabase);
      setChampionship(d.championship);
      setClubs(d.clubs);
      setPlayers(d.players);
      setVenues(d.venues);
      setReferees(d.referees);
      setMatches(d.matches);
      setRatings(d.ratings);
      setMatchEvents(d.matchEvents);
      setPublicSlug(d.publicSlug);
      setOrganizationId(d.organizationId);
      lastSavedKey.current = '';
      setDataHydrated(true);
    } catch (e) {
      setRemoteError(e instanceof Error ? e.message : String(e));
      setDataHydrated(false);
    } finally {
      setRemoteLoading(false);
    }
  }, [supabase, session]);

  useEffect(() => {
    if (useRemote) void loadRemote();
  }, [useRemote, loadRemote]);

  useEffect(() => {
    if (!useRemote || !supabase || remoteLoading || !dataHydrated) return;

    const payload = {
      championship,
      publicSlug,
      clubs,
      players,
      venues,
      referees,
      matches,
      ratings,
      matchEvents,
    };
    const key = JSON.stringify(payload);
    if (key === lastSavedKey.current) return;

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          await saveDashboardSnapshot(supabase, payload);
          lastSavedKey.current = key;
          setRemoteError(null);
        } catch (e) {
          setRemoteError(e instanceof Error ? e.message : String(e));
        }
      })();
    }, 1800);

    return () => window.clearTimeout(handle);
  }, [
    useRemote,
    supabase,
    remoteLoading,
    championship,
    publicSlug,
    clubs,
    players,
    venues,
    referees,
    matches,
    ratings,
    matchEvents,
    dataHydrated,
  ]);

  const userForUi: User = useMemo(() => {
    if (session?.user) {
      const meta = session.user.user_metadata as { full_name?: string } | undefined;
      return {
        id: session.user.id,
        name: meta?.full_name ?? session.user.email?.split('@')[0] ?? 'Usuário',
        email: session.user.email ?? '',
        role: 'SUPER_ADMIN',
      };
    }
    return MOCK_USER;
  }, [session]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } };
      return supabase.auth.signInWithPassword({ email, password });
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } };
      return supabase.auth.signUp({ email, password });
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setChampionship(MOCK_CHAMPIONSHIP);
    setClubs(MOCK_CLUBS);
    setPlayers(MOCK_PLAYERS);
    setReferees(MOCK_REFEREES);
    setRatings(MOCK_RATINGS);
    setMatches(MOCK_MATCHES);
    setVenues(MOCK_VENUES);
    setMatchEvents([]);
    setPublicSlug(null);
    setOrganizationId(DEFAULT_ORG_ID);
    lastSavedKey.current = '';
    setDataHydrated(true);
  }, [supabase]);

  return {
    supabase,
    isSupabaseConfigured,
    session,
    authReady,
    useRemote,
    remoteLoading,
    remoteError,
    publicSlug,
    organizationId,
    userForUi,
    clubs,
    setClubs,
    players,
    setPlayers,
    referees,
    setReferees,
    ratings,
    setRatings,
    matches,
    setMatches,
    venues,
    setVenues,
    matchEvents,
    setMatchEvents,
    notifications,
    setNotifications,
    mediaAssets,
    setMediaAssets,
    championship,
    setChampionship,
    loadRemote,
    signIn,
    signUp,
    signOut,
  };
}
