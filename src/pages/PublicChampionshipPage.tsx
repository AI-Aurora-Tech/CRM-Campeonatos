import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

type PublicPayload = {
  championship?: { name?: string; season?: string };
  clubs?: { id: string; name: string; shortName?: string; logoUrl?: string }[];
  matches?: {
    id: string;
    date: string;
    time: string;
    homeTeamId: string;
    awayTeamId: string;
    status: string;
    score?: { home: number; away: number };
  }[];
};

export function PublicChampionshipPage() {
  const { slug } = useParams<{ slug: string }>();
  const [payload, setPayload] = useState<PublicPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    if (!isSupabaseConfigured) {
      setErr('Supabase não configurado.');
      return;
    }
    const sb = getSupabase()!;
    let cancelled = false;
    void sb.rpc('get_public_championship', { p_slug: slug }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setErr(error.message);
        return;
      }
      if (data == null || (typeof data === 'object' && data !== null && !('championship' in data))) {
        setErr('Campeonato não encontrado para este slug.');
        return;
      }
      setPayload(data as PublicPayload);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <p className="text-sm text-neutral-600">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</p>
        <Link to="/" className="text-accent text-sm font-bold mt-4 inline-block">
          Voltar ao CRM
        </Link>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <p className="text-red-600 text-sm">{err}</p>
        <Link to="/" className="text-accent text-sm font-bold mt-4 inline-block">
          Voltar ao CRM
        </Link>
      </div>
    );
  }

  if (!payload?.championship) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <p className="text-sm text-neutral-600">Carregando tabela pública…</p>
      </div>
    );
  }

  const ch = payload.championship;
  const clubs = payload.clubs ?? [];
  const matches = payload.matches ?? [];

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12">
      <header className="max-w-3xl mx-auto mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Portal público</p>
        <h1 className="text-3xl font-black text-primary tracking-tight">{ch.name}</h1>
        <p className="text-text-muted text-sm mt-1">Temporada {ch.season}</p>
        <Link to="/" className="text-xs font-bold text-accent mt-4 inline-block">
          Área administrativa
        </Link>
      </header>

      <section className="max-w-3xl mx-auto card-utility overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border font-bold text-sm">Jogos</div>
        <ul className="divide-y divide-surface-border">
          {matches.map((m) => {
            const home = clubs.find((c) => c.id === m.homeTeamId);
            const away = clubs.find((c) => c.id === m.awayTeamId);
            return (
              <li key={m.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-text-muted font-bold uppercase">
                    {m.date} · {m.time}
                  </p>
                  <p className="font-bold text-primary mt-1">
                    {home?.shortName ?? '?'} x {away?.shortName ?? '?'}
                  </p>
                </div>
                <div className="font-mono font-black text-lg">
                  {m.status === 'FINISHED' || m.status === 'LIVE'
                    ? `${m.score?.home ?? 0} - ${m.score?.away ?? 0}`
                    : m.status}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="max-w-3xl mx-auto mt-8 text-[11px] text-text-muted">
        Dados oficiais via RPC <code className="bg-neutral-100 px-1 rounded">get_public_championship</code> (sem
        PII). Para SEO avançado, evoluir com SSR ou páginas estáticas.
      </p>
    </div>
  );
}
