import React, { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Trophy, Users, ShieldCheck, BarChart3, Calendar, ArrowRight } from 'lucide-react';

type LandingMatch = {
  id: string;
  date: string;
  time: string;
  championship: string;
  homeName: string;
  homeLogo: string;
  awayName: string;
  awayLogo: string;
  score: { home: number; away: number } | null;
  status: string;
};

type Props = {
  supabase: SupabaseClient | null;
  onSignIn: (identifier: string, password: string) => Promise<{ error: { message: string } | null }>;
};

const FEATURES = [
  { icon: Trophy, title: 'Campeonatos sob medida', desc: 'Pontos corridos, grupos e mata-mata, com regras de classificação personalizadas por zona.' },
  { icon: Users, title: 'Clubes e atletas', desc: 'Times inscrevem seus próprios atletas por convite, com aprovação do organizador.' },
  { icon: Calendar, title: 'Súmulas e calendário', desc: 'Geração de rodadas, súmula digital, homologação e mata-mata automático.' },
  { icon: ShieldCheck, title: 'Arbitragem e disciplina', desc: 'Cartões, suspensões automáticas por acúmulo e avaliação de árbitros.' },
  { icon: BarChart3, title: 'Relatórios e portal público', desc: 'Classificação, artilharia e um portal público para a torcida acompanhar.' },
];

export function LandingPage({ supabase, onSignIn }: Props) {
  const [matches, setMatches] = useState<LandingMatch[]>([]);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase.rpc('get_landing_matches').then(({ data }) => {
      if (!cancelled && Array.isArray(data)) setMatches(data as LandingMatch[]);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await onSignIn(identifier.trim(), password);
      if (err) setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Hero + Login */}
      <div className="bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                <Trophy size={20} className="text-white" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Gestor FC</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-[1.05] tracking-tighter">
              A plataforma completa para <span className="text-accent">organizar campeonatos</span>
            </h1>
            <p className="mt-5 text-white/70 text-base leading-relaxed max-w-lg">
              Do sorteio das rodadas à homologação das súmulas. Organizadores gerenciam seus torneios e
              os times inscrevem seus atletas — tudo em um só lugar.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
              <span>• Classificação por zonas</span>
              <span>• Mata-mata automático</span>
              <span>• Portal público</span>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-white text-neutral-900 rounded-3xl shadow-2xl p-7 max-w-md w-full lg:ml-auto">
            <h2 className="text-lg font-black uppercase tracking-tight">Entrar</h2>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mt-1">
              Organizadores e times
            </p>
            <div className="mt-5 space-y-3">
              <input
                type="text"
                autoComplete="username"
                placeholder="Usuário"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void submit()}
                className="w-full text-sm rounded-xl px-4 py-3 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none"
              />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void submit()}
                className="w-full text-sm rounded-xl px-4 py-3 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="w-full flex items-center justify-center gap-2 text-sm font-black uppercase py-3 rounded-xl bg-accent text-white disabled:opacity-50"
              >
                {busy ? 'Entrando…' : 'Entrar'} <ArrowRight size={16} />
              </button>
              <p className="text-[11px] text-text-muted text-center pt-1">
                É um time? Use o link de convite enviado pelo organizador para criar seu acesso.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black uppercase tracking-tight text-center">O que o sistema faz</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-black text-base">{f.title}</h3>
              <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest matches */}
      {matches.length > 0 && (
        <div className="bg-white border-t border-surface-border">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-8">
              <Calendar size={22} className="text-accent" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Últimas partidas</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map((m) => (
                <div key={m.id} className="border border-surface-border rounded-2xl p-5 bg-neutral-50/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 truncate">{m.championship}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={m.homeLogo} alt="" className="w-7 h-7 rounded-md border border-surface-border bg-white" />
                      <span className="text-sm font-bold truncate">{m.homeName}</span>
                    </div>
                    <span className="text-lg font-black text-primary px-2">
                      {m.score ? `${m.score.home} - ${m.score.away}` : 'x'}
                    </span>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-bold truncate text-right">{m.awayName}</span>
                      <img src={m.awayLogo} alt="" className="w-7 h-7 rounded-md border border-surface-border bg-white" />
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted mt-3 text-center">{m.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-surface-border py-8 text-center text-[11px] text-text-muted">
        Gestor FC — Gestão de Campeonatos
      </footer>
    </div>
  );
}
