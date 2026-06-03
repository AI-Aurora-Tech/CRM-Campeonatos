import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { DEFAULT_ORG_ID, fetchAllBundles } from '../api/dashboard';
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
import type { ChampionshipBundle, User } from '../types';

/** Id sentinela para o estado "dono ainda sem nenhum campeonato" (não persiste). */
export const EMPTY_CHAMP_ID = '__empty__';

function mockBundle(): ChampionshipBundle {
  return {
    championship: MOCK_CHAMPIONSHIP,
    clubs: MOCK_CLUBS,
    players: MOCK_PLAYERS,
    matches: MOCK_MATCHES,
    venues: MOCK_VENUES,
    referees: MOCK_REFEREES,
    ratings: MOCK_RATINGS,
    matchEvents: [],
    notifications: [],
    mediaAssets: [],
  };
}

/** Shell vazio para um dono que ainda não criou torneios. */
function emptyOwnerBundle(): ChampionshipBundle {
  return {
    championship: {
      id: EMPTY_CHAMP_ID,
      name: 'Nenhum campeonato ainda',
      season: String(new Date().getFullYear()),
      type: 'POINTS_CORRIDOS',
      status: 'PLANNING',
      rules: { yellowCardLimit: 3, pointsPerWin: 3, pointsPerDraw: 1 },
    },
    clubs: [],
    players: [],
    matches: [],
    venues: [],
    referees: [],
    ratings: [],
    matchEvents: [],
    notifications: [],
    mediaAssets: [],
  };
}

export function useAppData() {
  const supabase = useMemo(() => getSupabase(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(DEFAULT_ORG_ID);
  /** Senha temporária: força a troca no primeiro login. */
  const [mustChangePassword, setMustChangePassword] = useState(false);
  /** Papel do usuário na org: organizador (SUPER_ADMIN) ou time (CLUB_ADMIN). */
  const [role, setRole] = useState<'SUPER_ADMIN' | 'CLUB_ADMIN' | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);

  // ── Estado multi-campeonato (cada dono carrega só os seus) ────────────────
  const [allBundles, setAllBundles] = useState<ChampionshipBundle[]>([mockBundle()]);
  const [activeChampId, setActiveChampId] = useState<string>(MOCK_CHAMPIONSHIP.id);
  const [orgByChamp, setOrgByChamp] = useState<Record<string, string>>({});
  const [publicSlugByChamp, setPublicSlugByChamp] = useState<Record<string, string | null>>({});

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

  // Carrega a flag de troca de senha obrigatória do perfil do usuário logado.
  useEffect(() => {
    if (!supabase || !session) {
      setMustChangePassword(false);
      return;
    }
    let cancelled = false;
    void supabase
      .from('profiles')
      .select('must_change_password')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setMustChangePassword(Boolean(data?.must_change_password));
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, session]);

  // Papel do usuário (organizador x time) a partir do vínculo na org.
  useEffect(() => {
    if (!supabase || !session) {
      setRole(null);
      setClubId(null);
      return;
    }
    let cancelled = false;
    void supabase
      .from('organization_members')
      .select('role, club_id')
      .eq('user_id', session.user.id)
      .order('role', { ascending: true }) // CLUB_ADMIN < SUPER_ADMIN alfabeticamente
      .then(({ data }) => {
        if (cancelled) return;
        const rows = (data ?? []) as { role: string; club_id: string | null }[];
        // Prioriza vínculo de organizador, se houver.
        const admin = rows.find((r) => r.role === 'SUPER_ADMIN');
        const team = rows.find((r) => r.role === 'CLUB_ADMIN');
        if (admin) {
          setRole('SUPER_ADMIN');
          setClubId(null);
        } else if (team) {
          setRole('CLUB_ADMIN');
          setClubId(team.club_id);
        } else {
          setRole(null);
          setClubId(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, session]);

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
      const res = await fetchAllBundles(supabase);
      const bundles = res.bundles.length > 0 ? res.bundles : [emptyOwnerBundle()];
      setAllBundles(bundles);
      setOrgByChamp(res.orgByChamp);
      setPublicSlugByChamp(res.publicSlugByChamp);
      setOrganizationId(res.organizationId);
      setActiveChampId((prev) =>
        bundles.some((b) => b.championship.id === prev)
          ? prev
          : res.activeId ?? bundles[0].championship.id
      );
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

  const activeBundle =
    allBundles.find((b) => b.championship.id === activeChampId) ?? allBundles[0];
  const activeOrgId = orgByChamp[activeChampId] ?? organizationId ?? DEFAULT_ORG_ID;
  const publicSlug = publicSlugByChamp[activeChampId] ?? null;

  // Salva o campeonato ativo na organização dona (debounce).
  useEffect(() => {
    if (!useRemote || !supabase || remoteLoading || !dataHydrated || !activeBundle) return;
    if (activeBundle.championship.id === EMPTY_CHAMP_ID) return; // shell vazio não persiste
    if (role !== 'SUPER_ADMIN') return; // só o organizador grava o snapshot da org (RLS)

    const payload = {
      championship: activeBundle.championship,
      publicSlug,
      organizationId: activeOrgId,
      clubs: activeBundle.clubs,
      players: activeBundle.players,
      venues: activeBundle.venues,
      referees: activeBundle.referees,
      matches: activeBundle.matches,
      ratings: activeBundle.ratings,
      matchEvents: activeBundle.matchEvents,
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
    dataHydrated,
    activeBundle,
    publicSlug,
    activeOrgId,
    role,
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
    async (identifier: string, password: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } };
      let email = identifier.trim();
      // Login por usuário: se não parecer e-mail, resolve usuário -> e-mail no banco.
      if (!email.includes('@')) {
        const { data: resolved } = await supabase.rpc('resolve_login_email', {
          p_username: email,
        });
        if (typeof resolved === 'string' && resolved) {
          email = resolved;
        } else {
          return { data: null, error: { message: 'Usuário ou senha inválidos' } };
        }
      }
      return supabase.auth.signInWithPassword({ email, password });
    },
    [supabase]
  );

  const changePassword = useCallback(
    async (newPassword: string) => {
      if (!supabase || !session) return { error: { message: 'Sem sessão ativa' } };
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: { message: error.message } };
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('user_id', session.user.id);
      setMustChangePassword(false);
      return { error: null };
    },
    [supabase, session]
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
    setAllBundles([mockBundle()]);
    setActiveChampId(MOCK_CHAMPIONSHIP.id);
    setOrgByChamp({});
    setPublicSlugByChamp({});
    setOrganizationId(DEFAULT_ORG_ID);
    setMustChangePassword(false);
    setRole(null);
    setClubId(null);
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
    orgByChamp,
    userForUi,
    allBundles,
    setAllBundles,
    activeChampId,
    setActiveChampId,
    loadRemote,
    signIn,
    signUp,
    signOut,
    mustChangePassword,
    changePassword,
    role,
    clubId,
  };
}
