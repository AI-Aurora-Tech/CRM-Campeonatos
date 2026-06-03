import React, { useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Trophy, UserPlus, LogOut, RefreshCw, Calendar, ShieldAlert } from 'lucide-react';
import type { Championship, Club, Match, Player, Standing } from '../types';

type Props = {
  clubId: string | null;
  clubs: Club[];
  players: Player[];
  matches: Match[];
  championship: Championship;
  standings: Standing[];
  supabase: SupabaseClient | null;
  userName: string;
  onReload: () => Promise<void>;
  onSignOut: () => Promise<void>;
};

const STATUS_LABEL: Record<Player['documentStatus'], { label: string; cls: string }> = {
  APPROVED: { label: 'Aprovado', cls: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Em análise', cls: 'bg-yellow-100 text-yellow-700' },
  REJECTED: { label: 'Reprovado', cls: 'bg-red-100 text-red-700' },
};

export function TeamView({
  clubId, clubs, players, matches, championship, standings, supabase, userName, onReload, onSignOut,
}: Props) {
  const club = clubs.find((c) => c.id === clubId) ?? null;
  const roster = useMemo(() => players.filter((p) => p.clubId === clubId), [players, clubId]);
  const myMatches = useMemo(
    () => matches.filter((m) => m.homeTeamId === clubId || m.awayTeamId === clubId)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [matches, clubId]
  );
  const position = standings.findIndex((s) => s.teamId === clubId);
  const registrationOpen = Boolean((championship.rules as { registrationOpen?: boolean }).registrationOpen);

  const [form, setForm] = useState({ name: '', shirtNumber: '', position: 'ATA', birthDate: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const addAthlete = async () => {
    setError(null);
    setOk(null);
    if (!supabase || !clubId) return;
    if (form.name.trim().length < 2) return setError('Informe o nome do atleta.');
    if (!form.birthDate) return setError('Informe a data de nascimento.');
    setBusy(true);
    try {
      const id = `p-${Date.now()}`;
      const { error: insErr } = await supabase.from('players').insert({
        id,
        club_id: clubId,
        name: form.name.trim(),
        shirt_number: Number(form.shirtNumber) || 0,
        position: form.position,
        status: 'ACTIVE',
        document_status: 'PENDING',
        birth_date: form.birthDate,
        photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name.trim())}`,
      });
      if (insErr) {
        setError(insErr.message);
        return;
      }
      setForm({ name: '', shirtNumber: '', position: 'ATA', birthDate: '' });
      setOk('Atleta inscrito! Aguarde a aprovação do organizador.');
      await onReload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {club?.logoUrl
              ? <img src={club.logoUrl} alt="" className="w-11 h-11 rounded-xl bg-white p-1" />
              : <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center"><Trophy size={20} /></div>}
            <div className="min-w-0">
              <h1 className="text-lg font-black uppercase tracking-tight leading-none truncate">{club?.name ?? 'Meu time'}</h1>
              <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest mt-1 truncate">{championship.name} • {userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => void onReload()} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" title="Atualizar"><RefreshCw size={16} /></button>
            <button onClick={() => void onSignOut()} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-[11px] font-black uppercase"><LogOut size={14} /> Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        {/* Elenco + inscrição */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-surface-border">
              <h2 className="font-black uppercase text-sm tracking-tight">Elenco ({roster.length})</h2>
              {position >= 0 && (
                <span className="text-[11px] font-black uppercase text-text-muted">Posição: {position + 1}º</span>
              )}
            </div>
            {roster.length === 0 ? (
              <p className="p-6 text-sm text-text-muted text-center">Nenhum atleta inscrito ainda.</p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {roster.map((p) => {
                  const st = STATUS_LABEL[p.documentStatus];
                  return (
                    <li key={p.id} className="flex items-center gap-3 p-4">
                      <img src={p.photoUrl} alt="" className="w-9 h-9 rounded-lg border border-surface-border" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{p.name}</p>
                        <p className="text-[11px] text-text-muted">#{p.shirtNumber} • {p.position}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Form inscrição */}
          <div className="bg-white border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={18} className="text-accent" />
              <h2 className="font-black uppercase text-sm tracking-tight">Inscrever atleta</h2>
            </div>
            {!registrationOpen ? (
              <div className="flex items-center gap-2 text-sm text-text-muted bg-neutral-50 rounded-xl p-4">
                <ShieldAlert size={16} /> As inscrições estão fechadas no momento. Aguarde a liberação do organizador.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Nome do atleta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="col-span-2 text-sm rounded-xl px-3 py-2.5 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none" />
                  <input type="number" min={0} placeholder="Camisa" value={form.shirtNumber} onChange={(e) => setForm({ ...form, shirtNumber: e.target.value })}
                    className="text-sm rounded-xl px-3 py-2.5 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none" />
                  <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="text-sm rounded-xl px-3 py-2.5 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none">
                    {['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'ATA'].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest">Data de nascimento</label>
                    <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                      className="w-full mt-1 text-sm rounded-xl px-3 py-2.5 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none" />
                  </div>
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                {ok && <p className="text-xs text-green-600">{ok}</p>}
                <button type="button" disabled={busy} onClick={() => void addAthlete()}
                  className="w-full flex items-center justify-center gap-2 text-sm font-black uppercase py-3 rounded-xl bg-accent text-white disabled:opacity-50">
                  <UserPlus size={16} /> {busy ? 'Inscrevendo…' : 'Inscrever atleta'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Meus jogos */}
        <section>
          <div className="bg-white border border-surface-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-surface-border">
              <Calendar size={18} className="text-accent" />
              <h2 className="font-black uppercase text-sm tracking-tight">Meus jogos</h2>
            </div>
            {myMatches.length === 0 ? (
              <p className="p-6 text-sm text-text-muted text-center">Nenhum jogo agendado.</p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {myMatches.map((m) => {
                  const opp = clubs.find((c) => c.id === (m.homeTeamId === clubId ? m.awayTeamId : m.homeTeamId));
                  const isHome = m.homeTeamId === clubId;
                  return (
                    <li key={m.id} className="p-4">
                      <p className="text-[10px] font-black uppercase text-text-muted">{m.date} • {m.time} {isHome ? '• Casa' : '• Fora'}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold truncate">{opp?.name ?? 'A definir'}</span>
                        <span className="text-sm font-black text-primary">
                          {m.score ? (isHome ? `${m.score.home}-${m.score.away}` : `${m.score.away}-${m.score.home}`) : m.status === 'FINISHED' ? '—' : 'vs'}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
