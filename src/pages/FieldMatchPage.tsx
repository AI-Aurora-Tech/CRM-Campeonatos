import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { rowToClub, rowToMatch, type ClubRow, type MatchRow } from '../api/mappers';
import type { Club, Match } from '../types';

export function FieldMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [homeClub, setHomeClub] = useState<Club | null>(null);
  const [awayClub, setAwayClub] = useState<Club | null>(null);
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!matchId || !isSupabaseConfigured) return;
    const sb = getSupabase()!;
    const { data: mrow, error: mErr } = await sb.from('matches').select('*').eq('id', matchId).maybeSingle();
    if (mErr || !mrow) {
      setMsg(mErr?.message ?? 'Jogo não encontrado.');
      return;
    }
    const m = rowToMatch(mrow as MatchRow);
    setMatch(m);
    setHome(m.score?.home ?? 0);
    setAway(m.score?.away ?? 0);

    const { data: h } = await sb.from('clubs').select('*').eq('id', m.homeTeamId).maybeSingle();
    const { data: a } = await sb.from('clubs').select('*').eq('id', m.awayTeamId).maybeSingle();
    if (h) setHomeClub(rowToClub(h as ClubRow));
    if (a) setAwayClub(rowToClub(a as ClubRow));
  }, [matchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveScore = async () => {
    if (!matchId || !isSupabaseConfigured) return;
    const sb = getSupabase()!;
    const { error } = await sb
      .from('matches')
      .update({
        score: { home, away },
        status: 'LIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId);
    setMsg(error ? error.message : 'Placar salvo na nuvem.');
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-6">
        <p className="text-sm">Configure Supabase para o modo campo.</p>
        <Link to="/" className="text-accent text-sm font-bold mt-4 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  if (!matchId) {
    return <p className="p-6 text-sm">ID inválido.</p>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      <header className="p-4 border-b border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Modo campo</span>
        <Link to="/" className="text-[11px] font-bold text-accent">
          CRM
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {msg && <p className="text-xs text-amber-300 text-center max-w-xs">{msg}</p>}
        {match && (
          <>
            <p className="text-center text-sm text-white/70">
              {match.date} {match.time} · {match.location}
            </p>
            <div className="flex items-center gap-8 w-full max-w-md justify-center">
              <div className="flex-1 text-center">
                <p className="text-[10px] uppercase font-bold text-white/50 mb-2">Casa</p>
                <p className="font-black text-lg mb-4">{homeClub?.shortName ?? '—'}</p>
                <div className="flex gap-2 justify-center">
                  <button type="button" className="w-12 h-12 rounded-xl bg-white/10 font-black text-xl" onClick={() => setHome((x) => Math.max(0, x - 1))}>-</button>
                  <span className="w-14 text-center text-4xl font-black">{home}</span>
                  <button type="button" className="w-12 h-12 rounded-xl bg-accent font-black text-xl" onClick={() => setHome((x) => x + 1)}>+</button>
                </div>
              </div>
              <span className="text-2xl font-black text-white/30">x</span>
              <div className="flex-1 text-center">
                <p className="text-[10px] uppercase font-bold text-white/50 mb-2">Visitante</p>
                <p className="font-black text-lg mb-4">{awayClub?.shortName ?? '—'}</p>
                <div className="flex gap-2 justify-center">
                  <button type="button" className="w-12 h-12 rounded-xl bg-white/10 font-black text-xl" onClick={() => setAway((x) => Math.max(0, x - 1))}>-</button>
                  <span className="w-14 text-center text-4xl font-black">{away}</span>
                  <button type="button" className="w-12 h-12 rounded-xl bg-accent font-black text-xl" onClick={() => setAway((x) => x + 1)}>+</button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void saveScore()}
              className="px-8 py-4 rounded-2xl bg-white text-neutral-900 font-black text-sm uppercase tracking-widest"
            >
              Salvar placar
            </button>
            <p className="text-[10px] text-white/40 text-center max-w-sm">
              Envio de foto de súmula: use Storage no CRM ou integre upload direto com política RLS para o bucket do
              campeonato.
            </p>
          </>
        )}
        {!match && !msg && <p className="text-sm text-white/60">Carregando…</p>}
      </main>
    </div>
  );
}
