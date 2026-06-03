/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  Trophy, 
  Users, 
  Calendar, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Check,
  ChevronRight,
  ShieldAlert,
  Search,
  LogOut,
  Menu,
  X,
  Edit,
  Edit3,
  Trash2,
  ArrowLeft,
  Star,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Target,
  Activity,
  TrendingUp,
  Award,
  History,
  Bell,
  Mail,
  Zap,
  Newspaper,
  Flame,
  ExternalLink,
  Share2,
  Image as ImageIcon,
  Camera,
  Upload,
  Filter,
  Shield,
  Heart,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Map,
  Building2,
  AlertTriangle,
  Radio,
  Wallet,
  ClipboardList,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie,
  LineChart as ReLineChart,
  Line,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useAppData } from './hooks/useAppData';
import { AuthPanel } from './components/AuthPanel';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LandingPage } from './components/LandingPage';
import { TeamView } from './components/TeamView';
import { FinancialDashboardView } from './features/FinancialDashboardView';
import { Match, Championship, Standing, MatchEvent, Club, Player, Referee, RefereeRating, RefereeRatingDetail, RefereeClassification, ContestRecord, ContestType, ClubValidationState, Lineup, Notification, NotificationType, MediaAsset, Venue, ChampionshipBundle, QualificationRules, QualificationZone } from './types';
import { zoneForPosition, ZONE_TYPE_PRESETS, buildPlayoffPairs } from './lib/qualification';
import { MOCK_CHAMPIONSHIP, MOCK_CLUBS, MOCK_PLAYERS, MOCK_MATCHES, MOCK_VENUES, MOCK_REFEREES, MOCK_RATINGS } from './mockData';

// Types for navigation
type View = 'dashboard' | 'championships' | 'clubs' | 'players' | 'matches' | 'reports' | 'financial' | 'club-detail' | 'referees' | 'lineup' | 'player-detail' | 'public-portal' | 'media' | 'analytics' | 'venues' | 'eligibility' | 'validation';

// Sub-components for better organization
function ClubsView({ clubs, setClubs, players, onSelectClub, defaultPresidentId }: { clubs: Club[], setClubs: React.Dispatch<React.SetStateAction<Club[]>>, players: Player[], onSelectClub: (id: string) => void, defaultPresidentId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    shortName: '', 
    logoUrl: '', 
    address: '', 
    phone: '', 
    email: '', 
    customRules: '',
    homeField: '',
    hasPendingFinance: false
  });

  const handleOpenModal = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      setFormData({ 
        name: club.name, 
        shortName: club.shortName, 
        logoUrl: club.logoUrl,
        address: club.address || '',
        phone: club.phone || '',
        email: club.email || '',
        customRules: club.customRules || '',
        homeField: club.homeField || '',
        hasPendingFinance: club.hasPendingFinance || false
      });
    } else {
      setEditingClub(null);
      setFormData({ 
        name: '', 
        shortName: '', 
        logoUrl: '', 
        address: '', 
        phone: '', 
        email: '', 
        customRules: '',
        homeField: '',
        hasPendingFinance: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClub) {
      setClubs(clubs.map(c => c.id === editingClub.id ? { ...c, ...formData } : c));
    } else {
      const newClub: Club = {
        id: `club-${Date.now()}`,
        ...formData,
        presidentId: defaultPresidentId
      };
      setClubs([...clubs, newClub]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este clube? Todos os atletas vinculados perderão a filiação.')) {
      setClubs(clubs.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Gestão de Clubes & Entidades</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Novo Clube
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map(club => {
          const clubPlayers = players.filter(p => p.clubId === club.id);
          return (
            <div 
              key={club.id} 
              onClick={() => onSelectClub(club.id)}
              className="card-utility group flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-accent/40 active:scale-[0.99] transition-all"
            >
              {club.hasPendingFinance && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="flex items-center gap-1 bg-red-50 text-red-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg border-l border-b border-red-100 italic">
                    <ShieldAlert size={10} /> Pendência Financeira
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6 pt-2">
                <img src={club.logoUrl} alt={club.name} className="w-16 h-16 rounded-xl border border-surface-border bg-surface-bg p-2 object-contain" />
                <div>
                  <h4 className="font-bold text-lg text-primary">{club.name}</h4>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black bg-neutral-100 text-text-muted px-2 py-0.5 rounded border border-surface-border">{club.shortName}</span>
                     <span className="text-[11px] text-text-muted font-medium">Inscritos: <b className="text-primary">{clubPlayers.length} Atletas</b></span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6 px-1">
                <div className="grid grid-cols-1 gap-2 border-b border-neutral-50 pb-3">
                  <div className="flex items-center gap-2 text-[12px] text-text-muted">
                    <ShieldAlert size={14} className="text-accent" />
                    <span className="truncate"><b>Sede:</b> {club.address || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-text-muted">
                    <Calendar size={14} className="text-accent" />
                    <span className="font-bold text-primary italic">Mando de Campo: {club.homeField || 'Não possui campo'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
                    <FileText size={13} className="opacity-40" />
                    <span>{club.phone || 'Sem telefone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
                    <Settings size={13} className="opacity-40" />
                    <span>{club.email || 'Sem e-mail'}</span>
                  </div>
                </div>

                {club.customRules && (
                  <div className="flex items-start gap-2 text-[11px] bg-neutral-50 p-2 rounded border border-dotted border-surface-border mt-2">
                    <FileText size={12} className="text-accent mt-0.5 shrink-0" />
                    <p className="line-clamp-2 italic text-text-muted">{club.customRules}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                <span className="text-[10px] font-black uppercase tracking-wider text-green-700 px-2 py-0.5 bg-green-50 border border-green-200 rounded">Filiado à Liga</span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(club);
                    }} 
                    className="p-2 text-text-muted hover:text-primary hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(club.id);
                    }} 
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Simplified for MVP */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-primary"><X size={20} /></button>
              </div>
              <h3 className="text-lg font-bold mb-6 text-primary">{editingClub ? 'Editar Clube' : 'Cadastrar Novo Clube'}</h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Nome Completo</label>
                  <input 
                    required 
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Sigla / Nome Curto</label>
                  <input 
                    required 
                    placeholder="Ex: VFC"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono uppercase" 
                    value={formData.shortName} 
                    onChange={e => setFormData({ ...formData, shortName: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Identidade Visual (Logo)</label>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl border border-surface-border bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
                       {formData.logoUrl ? (
                         <img src={formData.logoUrl} className="w-full h-full object-contain" />
                       ) : (
                         <ImageIcon size={20} className="text-neutral-300" />
                       )}
                    </div>
                    <div className="flex-1 space-y-2">
                       <input 
                        placeholder="Cole a URL ou suba um arquivo"
                        className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-[10px]" 
                        value={formData.logoUrl} 
                        onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} 
                      />
                      <FileUpload 
                        onUpload={(url) => setFormData({ ...formData, logoUrl: url })} 
                        label="Upload do Computador" 
                        className="text-[10px] bg-primary text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-tight" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Telefone</label>
                    <input 
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-[13px]" 
                      value={formData.phone} 
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">E-mail</label>
                    <input 
                      type="email"
                      placeholder="clube@uniao.com"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-[13px]" 
                      value={formData.email} 
                      onChange={e => setFormData({ ...formData, email: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Endereço Sede</label>
                  <input 
                    placeholder="Rua, Número, Bairro - Cidade/UF"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-[13px]" 
                    value={formData.address} 
                    onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Campo do Time</label>
                    <input 
                      placeholder="Nome do estádio/campo"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-[13px]" 
                      value={formData.homeField} 
                      onChange={e => setFormData({ ...formData, homeField: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-neutral-50 border border-surface-border rounded-xl">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 text-accent"
                        checked={formData.hasPendingFinance}
                        onChange={e => setFormData({ ...formData, hasPendingFinance: e.target.checked })}
                      />
                      <span className="text-[11px] font-bold uppercase text-text-muted">Pendência Financeira</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Regras Personalizadas</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Padrão de uniforme, taxas específicas, horários de treino..."
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-[13px] resize-none" 
                    value={formData.customRules} 
                    onChange={e => setFormData({ ...formData, customRules: e.target.value })} 
                  />
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full btn-primary h-12">
                    {editingClub ? 'Salvar Alterações' : 'Concluir Cadastro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClubDetailView({ club, players, matches, clubs, standings, championship, onBack, onSelectPlayer }: {
  club: Club, players: Player[], matches: Match[], clubs: Club[],
  standings: Standing[], championship: Championship,
  onBack: () => void, onSelectPlayer?: (id: string) => void
}) {
  const [posFilter, setPosFilter] = useState<'TODOS'|'GOL'|'DEF'|'MEI'|'ATA'>('TODOS');

  const clubPlayers = players.filter(p => p.clubId === club.id);
  const clubMatches = matches.filter(m => m.homeTeamId === club.id || m.awayTeamId === club.id);
  const standing    = standings.find(s => s.teamId === club.id);
  const standingPos = standings.findIndex(s => s.teamId === club.id) + 1;

  // ── Disciplinary ─────────────────────────────────────────────────────────
  const suspendedPlayers = clubPlayers.filter(p => p.status === 'SUSPENDED');
  const atRisk = clubPlayers.filter(p =>
    p.status === 'ACTIVE' && (p.stats?.yellowCards ?? 0) >= championship.rules.yellowCardLimit - 1
  );

  // ── Pendências de validação pós-jogo ─────────────────────────────────────
  const pendingValidations = clubMatches.filter(m => {
    if (m.reportStatus !== 'AWAITING_VALIDATION' && m.reportStatus !== 'IN_REVIEW') return false;
    const side = m.homeTeamId === club.id ? 'home' : 'away';
    return (m.validations?.[side]?.status ?? 'PENDING') === 'PENDING';
  });

  // ── Documents ────────────────────────────────────────────────────────────
  const docApproved = clubPlayers.filter(p => p.documentStatus === 'APPROVED').length;
  const docPending  = clubPlayers.filter(p => p.documentStatus === 'PENDING').length;
  const docRejected = clubPlayers.filter(p => p.documentStatus === 'REJECTED').length;

  // ── Top scorer ───────────────────────────────────────────────────────────
  const topScorer = [...clubPlayers].sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))[0];

  // ── Minutes played (sum across all finished matches) ─────────────────────
  const finishedWithMinutes = clubMatches.filter(m => m.status === 'FINISHED' && m.minutesPlayed);
  const playerMinutes = (pid: string) =>
    finishedWithMinutes.reduce((sum, m) => sum + (m.minutesPlayed?.[pid] ?? 0), 0);

  // ── Matches ──────────────────────────────────────────────────────────────
  const recentMatches   = [...clubMatches].filter(m => m.status === 'FINISHED').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const upcomingMatches = [...clubMatches].filter(m => m.status === 'SCHEDULED').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  // ── Squad filter ─────────────────────────────────────────────────────────
  const posGroups: Record<string, string[]> = { GOL: ['GL','GOL','GK'], DEF: ['ZAG','LAT','DEF'], MEI: ['MEI','VOL'], ATA: ['ATA'] };
  const filteredPlayers = posFilter === 'TODOS' ? clubPlayers : clubPlayers.filter(p => posGroups[posFilter]?.includes(p.position));

  const formBadge = (res: 'W'|'D'|'L') => (
    <div className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-black text-white ${res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-yellow-400' : 'bg-red-500'}`}>
      {res === 'W' ? 'V' : res === 'D' ? 'E' : 'D'}
    </div>
  );

  const opponentOf = (m: Match) => clubs.find(c => c.id === (m.homeTeamId === club.id ? m.awayTeamId : m.homeTeamId));
  const resultOf   = (m: Match) => {
    if (!m.score) return null;
    const myGoals  = m.homeTeamId === club.id ? m.score.home : m.score.away;
    const oppGoals = m.homeTeamId === club.id ? m.score.away : m.score.home;
    return { my: myGoals, opp: oppGoals, outcome: myGoals > oppGoals ? 'W' : myGoals < oppGoals ? 'L' : 'D' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={club.logoUrl} className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg bg-white p-1" />
            <div className="absolute -bottom-1 -right-1 bg-accent text-white p-1 rounded-lg shadow-lg"><Trophy size={14} /></div>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-primary uppercase tracking-tight leading-none">{club.name}</h2>
              {club.foundedYear && <span className="text-[10px] font-black bg-neutral-100 text-text-muted px-2 py-1 rounded border border-surface-border uppercase tracking-widest">Fundado em {club.foundedYear}</span>}
              {club.hasPendingFinance && <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10} /> Pendência Financeira</span>}
              {suspendedPlayers.length > 0 && <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-1 rounded-full uppercase tracking-widest">{suspendedPlayers.length} Suspenso{suspendedPlayers.length > 1 ? 's' : ''}</span>}
              {pendingValidations.length > 0 && <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><ClipboardList size={10} /> {pendingValidations.length} Súmula{pendingValidations.length > 1 ? 's' : ''} p/ Validar</span>}
            </div>
            <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">Entidade Filiada • Liga Amadora de Futebol</p>
          </div>
        </div>
      </div>

      {/* ── Performance na competição ───────────────────────────────────── */}
      {standing ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Posição', value: `${standingPos}º` },
            { label: 'Pontos',  value: standing.points },
            { label: 'Jogos',   value: standing.played },
            { label: 'Vitórias',value: standing.wins },
            { label: 'Empates', value: standing.draws },
            { label: 'Derrotas',value: standing.losses },
            { label: 'Saldo',   value: standing.goalsFor - standing.goalsAgainst > 0 ? `+${standing.goalsFor - standing.goalsAgainst}` : standing.goalsFor - standing.goalsAgainst },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-surface-border rounded-2xl p-4 text-center shadow-sm">
              <p className="text-xl font-black text-primary leading-none mb-1">{value}</p>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{label}</p>
            </div>
          ))}
          {standing.form.length > 0 && (
            <div className="bg-white border border-surface-border rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 col-span-2 sm:col-span-4 lg:col-span-7 lg:flex-row lg:justify-start">
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mr-2">Forma</p>
              {Array.from({ length: 3 }).map((_, i) => {
                const r = standing.form[i];
                return r ? formBadge(r) : <div key={i} className="w-5 h-5 flex items-center justify-center rounded text-[9px] bg-neutral-100 text-neutral-400">—</div>;
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-surface-border rounded-2xl p-4 text-center text-[11px] text-text-muted font-bold uppercase tracking-widest">
          Time ainda não disputou partidas nesta competição
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Elenco com filtro ────────────────────────────────────────── */}
          <div className="card-utility">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-accent" />
                <h3 className="text-sm font-black uppercase tracking-tight">Elenco Registrado</h3>
                <span className="text-[10px] font-bold text-text-muted bg-neutral-100 px-2 py-0.5 rounded-full">{clubPlayers.length}</span>
              </div>
              {/* Document status badges */}
              <div className="flex gap-1.5">
                {docApproved > 0 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">{docApproved} OK</span>}
                {docPending  > 0 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{docPending} Pendente{docPending > 1 ? 's' : ''}</span>}
                {docRejected > 0 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">{docRejected} Rejeitado{docRejected > 1 ? 's' : ''}</span>}
              </div>
            </div>
            {/* Position tabs */}
            <div className="flex gap-1 mb-4 bg-neutral-100 p-1 rounded-xl w-fit">
              {(['TODOS','GOL','DEF','MEI','ATA'] as const).map(p => (
                <button key={p} onClick={() => setPosFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${posFilter === p ? 'bg-white shadow-sm text-primary' : 'text-text-muted hover:text-primary'}`}>
                  {p === 'TODOS' ? 'Todos' : p === 'GOL' ? 'Goleiros' : p === 'DEF' ? 'Defesa' : p === 'MEI' ? 'Meio' : 'Ataque'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPlayers.map(p => (
                <div key={p.id} onClick={() => onSelectPlayer?.(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group ${
                    p.status === 'SUSPENDED' ? 'bg-red-50 border-red-200' : p.documentStatus === 'PENDING' ? 'bg-yellow-50 border-yellow-200' : 'bg-neutral-50 border-surface-border/50 hover:border-accent/40'
                  }`}>
                  <div className="relative shrink-0">
                    <img src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}`} className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                    {p.status === 'SUSPENDED' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <X size={8} className="text-white" />
                      </div>
                    )}
                    {p.documentStatus === 'PENDING' && p.status !== 'SUSPENDED' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Clock size={8} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-primary truncate">#{p.shirtNumber} {p.name}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{p.position}</p>
                      {p.status === 'SUSPENDED' && <span className="text-[8px] font-black text-red-600 uppercase">Suspenso</span>}
                      {p.documentStatus === 'PENDING' && p.status !== 'SUSPENDED' && <span className="text-[8px] font-black text-yellow-600 uppercase">Doc. Pendente</span>}
                      {(p.stats?.yellowCards ?? 0) >= championship.rules.yellowCardLimit - 1 && p.status !== 'SUSPENDED' && (
                        <span className="text-[8px] font-black text-orange-500 uppercase">⚠ {p.stats?.yellowCards} amarelos</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    {p.stats && (
                      <div>
                        <p className="text-[12px] font-black text-accent">{p.stats.rating.toFixed(1)}</p>
                        <p className="text-[8px] font-black text-text-muted uppercase">Média</p>
                      </div>
                    )}
                    {playerMinutes(p.id) > 0 && (
                      <div className="flex items-center gap-0.5 justify-end">
                        <Clock size={8} className="text-text-muted" />
                        <span className="text-[9px] font-black text-text-muted">{playerMinutes(p.id)}'</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div className="col-span-2 text-center py-8 text-text-muted text-sm">Nenhum atleta nesta posição.</div>
              )}
            </div>
          </div>

          {/* ── Últimos resultados ───────────────────────────────────────── */}
          {recentMatches.length > 0 && (
            <div className="card-utility">
              <div className="flex items-center gap-2 mb-4">
                <History size={18} className="text-accent" />
                <h3 className="text-sm font-black uppercase tracking-tight">Últimos Resultados</h3>
              </div>
              <div className="space-y-3">
                {recentMatches.map(m => {
                  const opp = opponentOf(m);
                  const res = resultOf(m);
                  const isHome = m.homeTeamId === club.id;
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-surface-border/50">
                      <div className={`w-1.5 h-10 rounded-full shrink-0 ${res?.outcome === 'W' ? 'bg-green-500' : res?.outcome === 'D' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                      <img src={opp?.logoUrl} className="w-8 h-8 object-contain rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-primary truncate">{isHome ? 'Casa' : 'Fora'} · {opp?.name}</p>
                        <p className="text-[10px] text-text-muted">{new Date(m.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {res && (
                        <div className={`text-right shrink-0`}>
                          <p className="text-base font-black text-primary">{isHome ? res.my : res.opp} · {isHome ? res.opp : res.my}</p>
                          <p className={`text-[9px] font-black uppercase ${res.outcome === 'W' ? 'text-green-600' : res.outcome === 'D' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {res.outcome === 'W' ? 'Vitória' : res.outcome === 'D' ? 'Empate' : 'Derrota'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Próximas partidas ───────────────────────────────────────── */}
          {upcomingMatches.length > 0 && (
            <div className="card-utility">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-accent" />
                <h3 className="text-sm font-black uppercase tracking-tight">Próximas Partidas</h3>
              </div>
              <div className="space-y-3">
                {upcomingMatches.map(m => {
                  const opp = opponentOf(m);
                  const isHome = m.homeTeamId === club.id;
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-surface-border/50">
                      <div className="w-1.5 h-10 rounded-full shrink-0 bg-accent/30" />
                      <img src={opp?.logoUrl} className="w-8 h-8 object-contain rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-primary truncate">{isHome ? 'Casa' : 'Fora'} · {opp?.name}</p>
                        <p className="text-[10px] text-text-muted">{new Date(m.date).toLocaleDateString('pt-BR')} às {m.time}</p>
                      </div>
                      <span className="text-[9px] font-black text-accent bg-accent/10 px-2 py-1 rounded-full uppercase">Agendado</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Títulos ─────────────────────────────────────────────────── */}
          <div className="card-utility">
            <div className="flex items-center gap-2 mb-5">
              <Award size={18} className="text-accent" />
              <h3 className="text-sm font-black uppercase tracking-tight">Histórico de Conquistas</h3>
            </div>
            {club.titles && club.titles.length > 0 ? (
              <div className="space-y-3">
                {club.titles.map((title, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-yellow-50/30 border border-yellow-200/50 rounded-2xl">
                    <div className="w-10 h-10 bg-yellow-400 text-white rounded-xl flex items-center justify-center shadow-lg shrink-0"><Award size={18} /></div>
                    <div>
                      <p className="text-[14px] font-black text-primary leading-tight">{title}</p>
                      <p className="text-[10px] font-bold text-yellow-700/70 uppercase tracking-widest mt-0.5">Glória Eterna • Liga Amadora</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-surface-border rounded-3xl">
                <Trophy size={28} className="mx-auto text-neutral-300 mb-3 opacity-50" />
                <p className="text-sm font-bold text-text-muted">Ainda em busca da primeira taça.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Coluna lateral ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Artilheiro */}
          {topScorer && (topScorer.stats?.goals ?? 0) > 0 && (
            <div className="card-utility bg-primary text-white border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5 p-4"><Trophy size={80} /></div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Artilheiro do Clube</p>
                <div className="flex items-center gap-3">
                  <img src={topScorer.photoUrl || `https://ui-avatars.com/api/?name=${topScorer.name}`} className="w-14 h-14 rounded-xl object-cover border-2 border-white/20" />
                  <div>
                    <p className="font-black text-base leading-tight">{topScorer.name}</p>
                    <p className="text-white/50 text-[10px] uppercase font-bold">{topScorer.position} · #{topScorer.shirtNumber}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 border-t border-white/10 pt-4">
                  <div><p className="text-2xl font-black">{topScorer.stats?.goals ?? 0}</p><p className="text-[9px] text-white/40 uppercase font-black">Gols</p></div>
                  <div><p className="text-2xl font-black">{topScorer.stats?.assists ?? 0}</p><p className="text-[9px] text-white/40 uppercase font-black">Assist.</p></div>
                  <div><p className="text-2xl font-black">{topScorer.stats?.rating?.toFixed(1) ?? '—'}</p><p className="text-[9px] text-white/40 uppercase font-black">Média</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Situação disciplinar */}
          {(suspendedPlayers.length > 0 || atRisk.length > 0) && (
            <div className="card-utility space-y-4">
              <h3 className="font-black text-[11px] border-b border-surface-border pb-3 uppercase tracking-widest text-text-muted">Situação Disciplinar</h3>
              {suspendedPlayers.map(p => (
                <div key={p.id} className="flex items-center gap-2 p-2 bg-red-50 rounded-xl border border-red-100">
                  <img src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}`} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-primary truncate">{p.name}</p>
                    <p className="text-[9px] font-black text-red-600 uppercase">Suspenso</p>
                  </div>
                </div>
              ))}
              {atRisk.map(p => (
                <div key={p.id} className="flex items-center gap-2 p-2 bg-orange-50 rounded-xl border border-orange-100">
                  <img src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}`} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-primary truncate">{p.name}</p>
                    <p className="text-[9px] font-black text-orange-500 uppercase">⚠ {p.stats?.yellowCards} amarelos</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ficha Técnica */}
          <div className="card-utility space-y-4">
            <h3 className="font-black text-[11px] border-b border-surface-border pb-3 uppercase tracking-widest text-text-muted">Ficha Técnica</h3>
            <div className="space-y-4">
              {club.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-accent shrink-0 mt-0.5" />
                  <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Endereço Sede</p><p className="text-sm font-medium">{club.address}</p></div>
                </div>
              )}
              {club.homeField && (
                <div className="flex items-start gap-3">
                  <Map size={15} className="text-accent shrink-0 mt-0.5" />
                  <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Mando de Campo</p><p className="text-sm font-bold text-primary italic">{club.homeField}</p></div>
                </div>
              )}
              {club.phone && (
                <div className="flex items-start gap-3">
                  <Bell size={15} className="text-accent shrink-0 mt-0.5" />
                  <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Telefone</p><p className="text-sm font-medium">{club.phone}</p></div>
                </div>
              )}
              {club.email && (
                <div className="flex items-start gap-3">
                  <Mail size={15} className="text-accent shrink-0 mt-0.5" />
                  <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">E-mail</p><p className="text-sm font-medium break-all">{club.email}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Regras personalizadas */}
          {club.customRules && (
            <div className="card-utility space-y-3">
              <h3 className="font-black text-[11px] border-b border-surface-border pb-3 uppercase tracking-widest text-text-muted">Regras do Clube</h3>
              <p className="text-[12px] text-text-muted leading-relaxed">{club.customRules}</p>
            </div>
          )}

          {/* Pendência financeira */}
          {club.hasPendingFinance && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-black uppercase">Pendência Financeira</span>
              </div>
              <p className="text-[11px] text-red-700 leading-relaxed">Clube com débitos pendentes. Regularização necessária para participar de novas rodadas.</p>
            </div>
          )}

          {/* Stats históricos */}
          <div className="card-utility space-y-4">
            <h3 className="font-black text-[11px] border-b border-surface-border pb-3 uppercase tracking-widest text-text-muted">Estatísticas Históricas</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-lg font-black text-primary">{club.stats?.totalGoals ?? 0}</p><p className="text-[9px] font-black text-text-muted uppercase tracking-wider">Gols Pró</p></div>
              <div><p className="text-lg font-black text-primary">{club.stats?.possessionAvg ?? 0}%</p><p className="text-[9px] font-black text-text-muted uppercase tracking-wider">Posse Méd.</p></div>
              <div><p className="text-lg font-black text-primary">{club.stats?.cleanSheets ?? 0}</p><p className="text-[9px] font-black text-text-muted uppercase tracking-wider">Sem Sofrer</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerDetailView({ player, club, onBack }: { player: Player, club: Club, onBack: () => void }) {
  const stats = player.stats || { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 0 };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
           <span className="text-[11px] font-black uppercase text-text-muted">Ficha Técnica do Atleta</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Card Profile (FIFA STYLE) */}
        <div className="lg:col-span-4 perspective-1000">
           <motion.div 
             initial={{ rotateY: -20, opacity: 0 }}
             animate={{ rotateY: 0, opacity: 1 }}
             className="relative w-full aspect-[2/3] max-w-sm mx-auto bg-[#c5a059] rounded-[2rem] p-1 shadow-2xl overflow-hidden group"
             style={{ 
               background: 'linear-gradient(135deg, #e5c07b 0%, #c5a059 50%, #8e6d2f 100%)',
               boxShadow: '0 25px 50px -12px rgba(142, 109, 47, 0.5)'
             }}
           >
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              
              <div className="absolute inset-2 bg-neutral-900 rounded-[1.8rem] overflow-hidden flex flex-col">
                <div className="p-8 flex flex-col items-center">
                  <div className="text-center mb-2">
                    <p className="text-6xl font-black text-[#e5c07b] leading-none tracking-tighter">{stats.rating.toFixed(1)}</p>
                    <p className="text-xl font-bold text-white/60 tracking-[0.2em] mt-1">{player.position}</p>
                  </div>
                  <div className="w-12 h-0.5 bg-[#e5c07b] opacity-30 my-4" />
                  <img src={club.logoUrl} className="w-10 h-10 object-contain brightness-0 invert opacity-60" />
                </div>

                <div className="flex-1 relative">
                  <img src={player.photoUrl} className="absolute inset-0 w-full h-full object-cover grayscale brightness-125 object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                </div>

                <div className="bg-neutral-800/80 backdrop-blur-md p-6 border-t border-white/5 text-center">
                  <p className="text-xl font-black text-[#e5c07b] uppercase tracking-tight mb-1">{player.name.split(' ').pop()}</p>
                  <p className="text-3xl font-black text-white/10 absolute top-4 right-6 pointer-events-none">#{player.shirtNumber}</p>
                  <div className="flex justify-center gap-4 mt-3">
                     <div className="text-center px-3 border-r border-white/10 last:border-none">
                       <p className="text-[12px] font-black text-white">{stats.goals}</p>
                       <p className="text-[8px] font-black text-white/40 uppercase">GOL</p>
                     </div>
                     <div className="text-center px-3 border-r border-white/10 last:border-none">
                       <p className="text-[12px] font-black text-white">{stats.assists}</p>
                       <p className="text-[8px] font-black text-white/40 uppercase">ASS</p>
                     </div>
                     <div className="text-center px-3 border-r border-white/10 last:border-none">
                       <p className="text-[12px] font-black text-white">{stats.matches}</p>
                       <p className="text-[8px] font-black text-white/40 uppercase">JOG</p>
                     </div>
                  </div>
                </div>
              </div>
           </motion.div>
        </div>

        {/* Detailed Stats */}
        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm">
                 <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                    <Target size={20} />
                 </div>
                 <p className="text-[28px] font-black text-primary leading-none mb-1">{stats.goals}</p>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Gols Oficiais</p>
              </div>
              <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <Activity size={20} />
                 </div>
                 <p className="text-[28px] font-black text-primary leading-none mb-1">{stats.assists}</p>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Assistências</p>
              </div>
              <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm">
                 <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldAlert size={20} />
                 </div>
                 <p className="text-[28px] font-black text-primary leading-none mb-1">{stats.redCards}</p>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Vermelhos</p>
              </div>
              <div className="bg-white border border-surface-border rounded-3xl p-6 shadow-sm">
                 <div className="w-10 h-10 bg-neutral-100 text-primary rounded-2xl flex items-center justify-center mb-4">
                    <Calendar size={20} />
                 </div>
                 <p className="text-[28px] font-black text-primary leading-none mb-1">{stats.matches}</p>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Partidas</p>
              </div>
           </div>

           <div className="card-utility">
              <h3 className="text-sm font-black uppercase tracking-tight mb-6">Desempenho por Temporada</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-accent/10 text-accent rounded-lg">
                          <TrendingUp size={16} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-primary italic underline decoration-accent/30">{club.name}</p>
                          <p className="text-[10px] font-bold text-text-muted uppercase">Copa Regional 2026</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-primary">{stats.rating.toFixed(1)}</p>
                       <p className="text-[9px] font-black text-text-muted uppercase tracking-tight">Rating Geral</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-primary rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <History size={64} />
              </div>
              <div className="relative z-10">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Relatório do Olheiro</h4>
                 <p className="text-[16px] font-medium leading-relaxed max-w-lg">
                    {player.status === 'ACTIVE' 
                      ? `${player.name} vive seu ápice físico. Com ${stats.goals} gols em ${stats.matches} partidas, sua presença no setor ofensivo é fundamental para o ${club.shortName}.`
                      : `${player.name} encontra-se suspenso. Cautela necessária para reduzir o acúmulo de cartões.`}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function FileUpload({ onUpload, label, className }: { onUpload: (url: string) => void, label: string, className?: string }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <label className={`cursor-pointer inline-flex items-center gap-2 ${className}`}>
      <Upload size={14} />
      <span>{label}</span>
      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
    </label>
  );
}

function MediaGalleryView({ 
  assets, 
  setAssets, 
  clubs, 
  matches 
}: { 
  assets: MediaAsset[], 
  setAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>>,
  clubs: Club[],
  matches: Match[]
}) {
  const [filter, setFilter] = useState<MediaAsset['category'] | 'ALL'>('ALL');

  const filteredAssets = filter === 'ALL' ? assets : assets.filter(a => a.category === filter);

  const addAsset = (url: string, category: MediaAsset['category']) => {
    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      url,
      type: 'IMAGE',
      category,
      createdAt: new Date().toISOString()
    };
    setAssets([newAsset, ...assets]);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase leading-none">Galeria de Mídia</h2>
          <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">Acervo Visual da Liga Amadora</p>
        </div>
        <div className="flex gap-2">
           <FileUpload 
             onUpload={(url) => addAsset(url, 'MATCH')} 
             label="Fotos de Jogo" 
             className="btn-primary py-2 text-xs" 
           />
           <FileUpload 
             onUpload={(url) => addAsset(url, 'CHAMPIONSHIP')} 
             label="Banner/Evento" 
             className="btn-outline py-2 text-xs" 
           />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'MATCH', 'CLUB', 'CHAMPIONSHIP', 'GENERAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === cat ? 'bg-accent text-white' : 'bg-white border border-surface-border text-text-muted hover:border-accent/40'
            }`}
          >
            {cat === 'ALL' ? 'Todos' : cat === 'MATCH' ? 'Jogos' : cat === 'CLUB' ? 'Escudos' : cat === 'CHAMPIONSHIP' ? 'Banners' : 'Geral'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAssets.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-surface-border rounded-[3rem]">
             <ImageIcon size={48} className="mx-auto text-neutral-300 mb-4 opacity-50" />
             <p className="text-sm font-bold text-text-muted italic">Nenhuma mídia encontrada nesta categoria.</p>
          </div>
        )}
        {filteredAssets.map(asset => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={asset.id} 
            className="group relative aspect-square bg-white rounded-3xl overflow-hidden border border-surface-border shadow-sm hover:shadow-xl transition-all"
          >
            <img src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
               <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{asset.category}</span>
               <p className="text-[11px] font-bold text-white/70">{new Date(asset.createdAt).toLocaleDateString()}</p>
            </div>
            <button 
              onClick={() => setAssets(assets.filter(a => a.id !== asset.id))}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl scale-0 group-hover:scale-100 transition-transform"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GeminiDataAnalyst({ standings, fairPlayData }: { standings: Standing[], fairPlayData: any[] }) {
  const [insight, setInsight] = React.useState<string>('Analisando padrões da liga...');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const topEfficient = standings.sort((a,b) => (b.goalsFor/b.played) - (a.goalsFor/a.played))[0];
        const bestFairPlay = fairPlayData[0];
        
        const prompt = `Como um analista de dados esportivos, forneça 2 parágrafos curtos em português analisando:
          1. O time mais eficiente: ${topEfficient.teamId} (${topEfficient.goalsFor} gols em ${topEfficient.played} jogos).
          2. O time mais disciplinado (Fair Play): ${bestFairPlay.fullName} (índice ${bestFairPlay.score}).
          Use um tom profissional e inspirador. Mencione como esses dados ajudam na gestão da liga.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });

        setInsight(response.text || 'Obrigado por utilizar a inteligência de dados.');
      } catch (err) {
        console.error(err);
        setInsight('A análise automatizada está temporariamente indisponível.');
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [standings, fairPlayData]);

  return (
    <div className="card-utility bg-gradient-to-br from-primary to-neutral-900 text-white p-8 border-none relative overflow-hidden">
       <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={100} />
       </div>
       <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center animate-pulse">
                <Activity size={18} className="text-white" />
             </div>
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Análise Narrativa (IA Gemini)</h4>
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
               <RefreshCw size={14} className="animate-spin text-accent" />
               <span className="text-sm font-medium italic text-white/50">Cruzando estatísticas da rodada...</span>
            </div>
          ) : (
            <div className="space-y-4">
               <p className="text-[13px] leading-relaxed font-medium text-white/90 italic">
                 {insight}
               </p>
               <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Storytelling Ativado</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
               </div>
            </div>
          )}
       </div>
    </div>
  );
}

function AdvancedAnalyticsView({ 
  clubs, 
  matches, 
  matchEvents,
  standings,
  players
}: { 
  clubs: Club[], 
  matches: Match[], 
  matchEvents: MatchEvent[],
  standings: Standing[],
  players: Player[]
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'awards'>('overview');

  // 1. Efficiency Ranking (Goals per Match)
  const efficiencyData = standings
    .map(s => {
      const club = clubs.find(c => c.id === s.teamId);
      return {
        name: club?.shortName || '?',
        fullName: club?.name,
        efficiency: s.played > 0 ? parseFloat((s.goalsFor / s.played).toFixed(2)) : 0,
        goals: s.goalsFor,
        played: s.played
      };
    })
    .sort((a, b) => b.efficiency - a.efficiency);

  // 2. Fair Play (Least Cards)
  const fairPlayData = clubs.map(club => {
    const events = matchEvents.filter(e => e.teamId === club.id);
    const yellows = events.filter(e => e.type === 'YELLOW_CARD').length;
    const reds = events.filter(e => e.type === 'RED_CARD').length;
    const score = yellows + (reds * 3);
    
    return {
      name: club.shortName,
      fullName: club.name,
      score: score,
      yellows,
      reds
    };
  }).sort((a, b) => a.score - b.score);

  // 3. Offensive vs Defensive Power
  const powerData = standings.map(s => {
    const club = clubs.find(c => c.id === s.teamId);
    return {
      name: club?.shortName || '?',
      offensive: s.goalsFor,
      defensive: s.goalsAgainst
    };
  });

  // 4. Goal Intervals (0-15, 15-30, etc.)
  const goalEvents = matchEvents.filter(e => e.type === 'GOAL');
  const intervals = [
    { name: '0-15\'', count: 0 },
    { name: '15-30\'', count: 0 },
    { name: '30-45\'', count: 0 },
    { name: '45-60\'', count: 0 },
    { name: '60-75\'', count: 0 },
    { name: '75-90\'', count: 0 },
  ];

  goalEvents.forEach(e => {
    const m = e.minute;
    if (m <= 15) intervals[0].count++;
    else if (m <= 30) intervals[1].count++;
    else if (m <= 45) intervals[2].count++;
    else if (m <= 60) intervals[3].count++;
    else if (m <= 75) intervals[4].count++;
    else intervals[5].count++;
  });

  // 5. Result Distribution
  const results = {
    home: matches.filter(m => m.status === 'FINISHED' && m.score && m.score.home > m.score.away).length,
    away: matches.filter(m => m.status === 'FINISHED' && m.score && m.score.away > m.score.home).length,
    draw: matches.filter(m => m.status === 'FINISHED' && m.score && m.score.home === m.score.away).length,
  };

  const pieData = [
    { name: 'Vitória Casa', value: results.home, color: '#1a1a1a' },
    { name: 'Vitória Fora', value: results.away, color: '#4caf50' },
    { name: 'Empate', value: results.draw, color: '#e0e0e0' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
         <div className="flex gap-4">
            <button 
               onClick={() => setActiveTab('overview')} 
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'bg-neutral-100 text-text-muted hover:bg-neutral-200'}`}
            >
               Overview Estratégico
            </button>
            <button 
               onClick={() => setActiveTab('awards')} 
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'awards' ? 'bg-accent text-white shadow-lg' : 'bg-neutral-100 text-text-muted hover:bg-neutral-200'}`}
            >
               🏆 Hall da Fama (Prêmios)
            </button>
         </div>
         <div className="flex gap-2">
            <button className="btn-outline flex items-center gap-2 text-xs py-2 shadow-sm">
               <Share2 size={14} /> Compartilhar Insight
            </button>
            <button className="btn-primary flex items-center gap-2 text-xs py-2 shadow-sm">
               <FileText size={14} /> Exportar Completo
            </button>
         </div>
      </div>

      {activeTab === 'awards' ? (
        <AwardsView players={players} clubs={clubs} matches={matches} matchEvents={matchEvents} />
      ) : (
        <>
          <GeminiDataAnalyst standings={standings} fairPlayData={fairPlayData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="card-utility p-8 bg-white border-surface-border shadow-xl space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-black text-primary uppercase flex items-center gap-2">
                  <Target size={20} className="text-accent" /> Matadores da Liga
               </h3>
               <span className="text-[10px] font-black text-text-muted uppercase bg-neutral-100 px-2 py-1 rounded">Gols / Jogo</span>
            </div>
            
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efficiencyData.slice(0, 8)}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                     <XAxis dataKey="name" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                     <YAxis fontSize={10} axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 'black' }}
                     />
                     <Bar dataKey="efficiency" fill="#4caf50" radius={[6, 6, 0, 0]}>
                        {efficiencyData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#1a1a1a' : (index % 2 === 0 ? '#4caf50' : '#8bc34a')} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl flex items-center gap-4">
               <Award size={24} className="text-accent shrink-0" />
               <p className="text-[11px] text-text-muted leading-relaxed">O <b>{efficiencyData[0]?.fullName}</b> tem o ataque mais letal com {efficiencyData[0]?.efficiency} gols por partida.</p>
            </div>
         </div>

         <div className="card-utility p-8 bg-white border-surface-border shadow-xl space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-black text-primary uppercase flex items-center gap-2">
                  <Shield size={20} className="text-blue-500" /> Troféu Fair Play
               </h3>
               <span className="text-[10px] font-black text-text-muted uppercase bg-neutral-100 px-2 py-1 rounded">Ranking de Menor Indice</span>
            </div>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fairPlayData.slice(0, 6)} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Bar dataKey="score" fill="#2196f3" radius={[0, 4, 4, 0]}>
                        {fairPlayData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#4caf50' : '#2196f3'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border text-center">
               <div>
                  <p className="text-[10px] font-black text-text-muted uppercase mb-1 tracking-tighter">Mais Disciplinado</p>
                  <p className="text-xs font-bold text-green-600 truncate">{fairPlayData[0]?.fullName}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-text-muted uppercase mb-1 tracking-tighter">Ponto de Corte</p>
                  <p className="text-xs font-bold text-primary">Índice {fairPlayData[0]?.score}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="card-utility p-8 bg-neutral-900 text-white border-none shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <TrendingUp size={120} />
         </div>
         <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <Activity size={24} className="text-accent" />
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Equilíbrio de Forças</h3>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Ataque vs Defesa em Números Absolutos</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-4">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                     <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Mais Ofensivo</p>
                     <div className="flex items-center justify-between">
                        <span className="text-xl font-black uppercase text-accent group-hover:scale-105 transition-transform">{powerData.sort((a,b) => b.offensive - a.offensive)[0]?.name}</span>
                        <div className="text-right">
                           <span className="text-2xl font-black block">{powerData.sort((a,b) => b.offensive - a.offensive)[0]?.offensive}</span>
                           <span className="text-[9px] font-black text-white/30 uppercase leading-none">Gols Pró</span>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                     <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Melhor Defesa</p>
                     <div className="flex items-center justify-between">
                        <span className="text-xl font-black uppercase text-blue-400 group-hover:scale-105 transition-transform">{powerData.sort((a,b) => a.defensive - b.defensive)[0]?.name}</span>
                        <div className="text-right">
                           <span className="text-2xl font-black block">{powerData.sort((a,b) => a.defensive - b.defensive)[0]?.defensive}</span>
                           <span className="text-[9px] font-black text-white/30 uppercase leading-none">Gols Sofridos</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="md:col-span-2 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <ReLineChart data={powerData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Line type="monotone" dataKey="offensive" stroke="#ffca28" strokeWidth={3} dot={{ r: 4, fill: '#ffca28' }} name="Ataque" />
                        <Line type="monotone" dataKey="defensive" stroke="#42a5f5" strokeWidth={3} dot={{ r: 4, fill: '#42a5f5' }} name="Defesa" />
                     </ReLineChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
         <div className="lg:col-span-3 card-utility p-8 bg-white border-surface-border shadow-xl space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-black text-primary uppercase flex items-center gap-2">
                  <Clock size={20} className="text-accent" /> Distribuição de Gols
               </h3>
               <p className="text-[10px] font-black text-text-muted uppercase">Minutos mais perigosos</p>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intervals}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} fontSize={10} />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                     <Bar dataKey="count" fill="#1a1a1a" radius={[6, 6, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="lg:col-span-2 card-utility p-8 bg-white border-surface-border shadow-xl space-y-6">
            <h3 className="text-lg font-black text-primary uppercase flex items-center gap-2">
               <PieChart size={20} className="text-accent" /> Tendência de Resultados
            </h3>
            <div className="h-48">
               <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                     <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </RePieChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-3">
               {pieData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] font-bold uppercase">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-text-muted">{item.name}</span>
                     </div>
                     <span className="text-primary">{item.value} Jogos</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
        </>
      )}
    </div>
  );
}

function ChampionshipsView({
  allBundles,
  activeChampId,
  onSelectChampionship,
  onCreateChampionship,
  setChampionship,
  standings,
  matches,
  setMatches,
  supabase,
  useRemote,
  publicSlug,
  onScheduleReload,
}: {
  allBundles: ChampionshipBundle[];
  activeChampId: string;
  onSelectChampionship: (id: string) => void;
  onCreateChampionship: (bundle: ChampionshipBundle) => void;
  setChampionship: React.Dispatch<React.SetStateAction<Championship>>;
  standings: Standing[];
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  supabase: SupabaseClient | null;
  useRemote: boolean;
  publicSlug: string | null;
  onScheduleReload: () => Promise<void>;
}) {
  const activeBundle = allBundles.find(b => b.championship.id === activeChampId)!;
  const championship = activeBundle.championship;
  const activeClubs = activeBundle.clubs;
  const [schedMsg, setSchedMsg] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inviteClubId, setInviteClubId] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  // ── Inscrições de atletas (liga/desliga por campeonato) ──
  const registrationOpen = Boolean((championship.rules as { registrationOpen?: boolean }).registrationOpen);
  const toggleRegistration = () =>
    setChampionship({ ...championship, rules: { ...championship.rules, registrationOpen: !registrationOpen } });

  // ── Convite de time (gera link para o clube criar acesso) ──
  const generateInvite = async () => {
    setInviteMsg(null);
    setInviteLink(null);
    if (!supabase || !useRemote) { setInviteMsg('Faça login para gerar convites.'); return; }
    if (!inviteClubId) { setInviteMsg('Selecione um time.'); return; }
    const { data, error } = await supabase.rpc('create_club_invite', { p_club_id: inviteClubId });
    if (error) { setInviteMsg(error.message); return; }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setInviteLink(`${origin}/convite/${data}`);
  };

  // ── Regras de classificação (zonas personalizadas) ──
  const qual: QualificationRules = championship.rules.qualification ?? { enabled: false, zones: [] };
  const updateQual = (next: QualificationRules) =>
    setChampionship({ ...championship, rules: { ...championship.rules, qualification: next } });
  const addZone = () => {
    const lastTo = qual.zones.reduce((m, z) => Math.max(m, z.to), 0);
    const preset = ZONE_TYPE_PRESETS.QUALIFIED;
    const nz: QualificationZone = {
      id: `z-${Date.now()}`, label: preset.label,
      from: lastTo + 1, to: lastTo + 2, type: 'QUALIFIED', color: preset.color,
    };
    updateQual({ enabled: true, zones: [...qual.zones, nz] });
  };
  const updateZone = (id: string, patch: Partial<QualificationZone>) =>
    updateQual({ ...qual, zones: qual.zones.map(z => z.id === id ? { ...z, ...patch } : z) });
  const removeZone = (id: string) =>
    updateQual({ ...qual, zones: qual.zones.filter(z => z.id !== id) });

  // Gera os confrontos do mata-mata a partir das zonas PLAYOFF + classificação.
  const generatePlayoff = () => {
    const pairs = buildPlayoffPairs(championship.rules, standings);
    if (pairs.length === 0) {
      setSchedMsg('Defina uma zona do tipo "Mata-mata" com 2+ times e jogos disputados para gerar os confrontos.');
      return;
    }
    const base = new Date();
    base.setDate(base.getDate() + 14);
    const dateStr = base.toISOString().slice(0, 10);
    const stamp = Date.now();
    const newMatches: Match[] = pairs.map((p, i) => ({
      id: `ko-${stamp}-${i}`,
      championshipId: championship.id,
      homeTeamId: p.homeTeamId,
      awayTeamId: p.awayTeamId,
      date: dateStr,
      time: '16:00',
      location: 'Mata-mata (Playoff)',
      status: 'SCHEDULED',
    }));
    setMatches(prev => [...prev, ...newMatches]);
    setSchedMsg(`${newMatches.length} confronto(s) de mata-mata gerado(s): ${pairs.map(p => p.seedLabel).join(', ')}.`);
  };

  // New championship form state
  const [form, setForm] = useState({
    name: '', season: new Date().getFullYear().toString(),
    type: 'POINTS_CORRIDOS' as Championship['type'],
    status: 'PLANNING' as Championship['status'],
    yellowCardLimit: 3, pointsPerWin: 3, pointsPerDraw: 1,
    sourceId: '', copyClubs: true, copyPlayers: false,
    copyReferees: false, copyVenues: false,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const source = allBundles.find(b => b.championship.id === form.sourceId);
    const newBundle: ChampionshipBundle = {
      championship: {
        id: `ch-${Date.now()}`,
        name: form.name, season: form.season,
        type: form.type, status: form.status,
        rules: { yellowCardLimit: form.yellowCardLimit, pointsPerWin: form.pointsPerWin, pointsPerDraw: form.pointsPerDraw },
      },
      clubs:      form.sourceId && form.copyClubs    && source ? source.clubs    : [],
      players:    form.sourceId && form.copyPlayers  && source ? source.players  : [],
      referees:   form.sourceId && form.copyReferees && source ? source.referees : [],
      venues:     form.sourceId && form.copyVenues   && source ? source.venues   : [],
      matches: [], ratings: [], matchEvents: [], notifications: [], mediaAssets: [],
    };
    onCreateChampionship(newBundle);
    setIsCreateOpen(false);
    setForm({ name: '', season: new Date().getFullYear().toString(), type: 'POINTS_CORRIDOS', status: 'PLANNING', yellowCardLimit: 3, pointsPerWin: 3, pointsPerDraw: 1, sourceId: '', copyClubs: true, copyPlayers: false, copyReferees: false, copyVenues: false });
  };

  const runRpc = async (name: string, args: Record<string, unknown>) => {
    if (!supabase || !useRemote) { setSchedMsg('Faça login com Supabase para usar o agendador.'); return; }
    setSchedMsg(null);
    const { data, error } = await supabase.rpc(name, args);
    if (error) { setSchedMsg(error.message); return; }
    setSchedMsg(typeof data === 'number' ? `${name}: ${data} linha(s) afetada(s).` : `${name}: ok.`);
    await onScheduleReload();
  };

  const statusLabel = (s: Championship['status']) =>
    s === 'ACTIVE' ? 'Ativo' : s === 'PLANNING' ? 'Planejamento' : 'Encerrado';
  const typeLabel = (t: Championship['type']) =>
    t === 'POINTS_CORRIDOS' ? 'Pts Corridos' : t === 'GROUPS' ? 'Grupos' : 'Mata-Mata';
  const statusColor = (s: Championship['status']) =>
    s === 'ACTIVE' ? 'bg-green-100 text-green-700' : s === 'PLANNING' ? 'bg-yellow-100 text-yellow-700' : 'bg-neutral-200 text-text-muted';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase leading-none">Campeonatos</h2>
          <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">Gerencie e alterne entre edições da sua liga</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Novo Campeonato
        </button>
      </div>

      {/* Championship cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allBundles.map(b => {
          const c = b.championship;
          const isActive = c.id === activeChampId;
          return (
            <button
              key={c.id}
              onClick={() => onSelectChampionship(c.id)}
              className={`text-left p-6 rounded-3xl border-2 transition-all hover:-translate-y-1 ${
                isActive
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-surface-border bg-white hover:border-accent/40 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${isActive ? 'bg-accent text-white' : 'bg-neutral-100 text-primary'}`}>
                  <Trophy size={18} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>
                    {statusLabel(c.status)}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-accent text-white flex items-center gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" /> ATIVO
                    </span>
                  )}
                </div>
              </div>
              <h3 className="font-black text-base text-primary leading-tight mb-1">{c.name}</h3>
              <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mb-4">Temporada {c.season}</p>
              <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-wide border-t border-surface-border pt-4">
                <span>{typeLabel(c.type)}</span>
                <span>{b.clubs.length} times · {b.matches.length} jogos</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-surface-border" />
        <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Campeonato Ativo — {championship.name}</span>
        <div className="flex-1 border-t border-surface-border" />
      </div>

      {publicSlug && (
        <div className="card-utility p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">Portal público</p>
            <p className="text-sm font-bold text-primary break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/p/${publicSlug}` : `/p/${publicSlug}`}
            </p>
          </div>
          <a href={`/p/${publicSlug}`} target="_blank" rel="noreferrer"
            className="text-xs font-black uppercase text-accent border border-accent/30 px-4 py-2 rounded-xl hover:bg-accent/5">
            Abrir em nova aba
          </a>
        </div>
      )}

      <div className="card-utility p-6 space-y-4">
        <h3 className="text-sm font-black uppercase text-primary tracking-tight">Calendário & chaves (Postgres)</h3>
        {schedMsg && <p className="text-xs text-accent font-bold">{schedMsg}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-outline text-xs font-bold uppercase"
            onClick={() => void runRpc('generate_round_robin', { p_championship_id: championship.id, p_rounds: 1 })}>
            Rodada (todos contra todos)
          </button>
          <button type="button" className="btn-outline text-xs font-bold uppercase"
            onClick={async () => {
              if (!supabase || !useRemote) return;
              const { data, error } = await supabase.rpc('detect_schedule_conflicts', { p_championship_id: championship.id });
              if (error) setSchedMsg(error.message);
              else setSchedMsg(`Conflitos: ${JSON.stringify(data ?? [])}`);
            }}>
            Detectar conflitos
          </button>
          <button type="button" className="btn-primary text-xs font-bold uppercase"
            onClick={() => void runRpc('generate_knockout_from_standings', { p_championship_id: championship.id, p_pairs: 2 })}>
            Chave mata-mata (demo)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card-utility bg-white overflow-hidden p-0">
            <div className="h-48 bg-neutral-100 flex items-center justify-center relative overflow-hidden group border-b border-surface-border">
              {championship.bannerUrl
                ? <img src={championship.bannerUrl} className="w-full h-full object-cover" />
                : <div className="text-center"><ImageIcon className="mx-auto text-neutral-300 mb-2 opacity-50" size={40} /><p className="text-xs font-black uppercase text-text-muted tracking-widest">Banner Oficial</p></div>
              }
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FileUpload onUpload={(url) => setChampionship({ ...championship, bannerUrl: url })} label="Alterar Banner" className="bg-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase text-primary shadow-xl" />
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-primary uppercase leading-none tracking-tighter">{championship.name}</h3>
                  <p className="text-[11px] font-bold text-text-muted mt-2 uppercase tracking-widest bg-neutral-100 w-fit px-3 py-1 rounded-lg">Temporada {championship.season}</p>
                </div>
                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${statusColor(championship.status)}`}>
                  {championship.status === 'ACTIVE' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                  {statusLabel(championship.status)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-surface-border">
                <div><p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Formato</p><p className="text-sm font-bold text-primary">{typeLabel(championship.type)}</p></div>
                <div><p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Cartões p/ suspensão</p><p className="text-sm font-bold text-primary">{championship.rules.yellowCardLimit} amarelos</p></div>
                <div><p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Pontuação</p><p className="text-sm font-bold text-primary">{championship.rules.pointsPerWin}V / {championship.rules.pointsPerDraw}E</p></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card-utility p-8 bg-neutral-900 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Trophy size={100} /></div>
            <div className="relative z-10">
              <h4 className="text-[11px] font-black text-white/40 uppercase mb-6 tracking-[0.3em]">Health Check</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${championship.bannerUrl ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/20'}`}><ImageIcon size={16} /></div>
                    <span className="text-xs font-bold uppercase tracking-tight">Banner</span>
                  </div>
                  <CheckCircle size={14} className={championship.bannerUrl ? 'text-green-400' : 'text-white/20'} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><Shield size={16} /></div>
                    <span className="text-xs font-bold uppercase tracking-tight">Logo Federativa</span>
                  </div>
                  <CheckCircle size={14} className="text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inscrições de atletas + convites de times */}
      <div className="card-utility p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-black uppercase text-primary tracking-tight">Inscrições & Times</h3>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mt-1">
              Libere as inscrições e convide os times para cadastrarem seus atletas
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-accent rounded" checked={registrationOpen} onChange={toggleRegistration} />
            <span className={`text-[11px] font-black uppercase ${registrationOpen ? 'text-green-600' : 'text-text-muted'}`}>
              {registrationOpen ? 'Inscrições abertas' : 'Inscrições fechadas'}
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Convidar time</label>
            <select className="w-full mt-1 px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm"
              value={inviteClubId} onChange={e => setInviteClubId(e.target.value)}>
              <option value="">— Selecione um time —</option>
              {activeClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="button" onClick={() => void generateInvite()} className="btn-primary text-xs font-bold uppercase flex items-center gap-2">
            <ExternalLink size={14} /> Gerar link de convite
          </button>
        </div>

        {inviteMsg && <p className="text-xs text-accent font-bold">{inviteMsg}</p>}
        {inviteLink && (
          <div className="flex flex-wrap items-center gap-3 bg-neutral-50 border border-surface-border rounded-xl p-3">
            <code className="text-[11px] text-primary break-all flex-1">{inviteLink}</code>
            <button type="button" onClick={() => { void navigator.clipboard?.writeText(inviteLink); setInviteMsg('Link copiado!'); }}
              className="btn-outline text-[10px] font-bold uppercase">Copiar</button>
          </div>
        )}
      </div>

      {/* Regras de classificação — zonas personalizadas */}
      <div className="card-utility p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-black uppercase text-primary tracking-tight">Regras de Classificação</h3>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mt-1">
              Faixas por posição final na tabela (ex.: 1º–5º classificam, 6º–10º mata-mata, resto eliminado)
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-accent rounded" checked={qual.enabled}
              onChange={e => updateQual({ ...qual, enabled: e.target.checked })} />
            <span className="text-[11px] font-bold uppercase text-text-muted">Aplicar zonas na tabela</span>
          </label>
        </div>

        {qual.zones.length === 0 && (
          <p className="text-xs text-text-muted">Nenhuma zona definida ainda. Clique em “Adicionar zona”.</p>
        )}

        <div className="space-y-3">
          {qual.zones.map(z => (
            <div key={z.id} className="grid grid-cols-12 gap-2 items-center bg-neutral-50 border border-surface-border rounded-xl p-3">
              <input type="color" value={z.color} onChange={e => updateZone(z.id, { color: e.target.value })}
                className="col-span-1 w-9 h-9 rounded cursor-pointer border-0 bg-transparent p-0" title="Cor da zona" />
              <input className="col-span-4 px-3 py-2 bg-white border border-surface-border rounded-lg text-sm focus:outline-none focus:border-accent"
                placeholder="Rótulo (ex.: Classificação direta)" value={z.label} onChange={e => updateZone(z.id, { label: e.target.value })} />
              <div className="col-span-2 flex items-center gap-1">
                <input type="number" min={1} className="w-full px-2 py-2 bg-white border border-surface-border rounded-lg text-sm text-center focus:outline-none focus:border-accent"
                  value={z.from} onChange={e => updateZone(z.id, { from: Math.max(1, +e.target.value) })} />
                <span className="text-text-muted text-xs">à</span>
                <input type="number" min={1} className="w-full px-2 py-2 bg-white border border-surface-border rounded-lg text-sm text-center focus:outline-none focus:border-accent"
                  value={z.to} onChange={e => updateZone(z.id, { to: Math.max(1, +e.target.value) })} />
              </div>
              <select className="col-span-3 px-2 py-2 bg-white border border-surface-border rounded-lg text-sm focus:outline-none focus:border-accent"
                value={z.type} onChange={e => {
                  const t = e.target.value as QualificationZone['type'];
                  updateZone(z.id, { type: t, color: ZONE_TYPE_PRESETS[t].color });
                }}>
                <option value="QUALIFIED">Classifica direto</option>
                <option value="PLAYOFF">Mata-mata</option>
                <option value="ELIMINATED">Eliminado</option>
              </select>
              <button type="button" onClick={() => removeZone(z.id)}
                className="col-span-2 flex items-center justify-center text-red-500 hover:text-red-700" title="Remover zona">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="button" onClick={addZone} className="btn-outline text-xs font-bold uppercase flex items-center gap-2">
            <Plus size={14} /> Adicionar zona
          </button>
          <button type="button" onClick={generatePlayoff} className="btn-primary text-xs font-bold uppercase flex items-center gap-2">
            <Trophy size={14} /> Gerar mata-mata pelas zonas
          </button>
          {matches.some(m => m.location === 'Mata-mata (Playoff)') && (
            <span className="text-[10px] font-bold text-text-muted uppercase">
              {matches.filter(m => m.location === 'Mata-mata (Playoff)').length} confronto(s) de playoff já no calendário
            </span>
          )}
        </div>
      </div>

      {/* Modal Novo Campeonato */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-surface-border flex-shrink-0">
                <h3 className="text-lg font-black text-primary uppercase">Novo Campeonato</h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-text-muted hover:text-primary"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
                {/* Identidade */}
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3 border-b border-surface-border pb-1">Identidade</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Nome do Campeonato</label>
                      <input required className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" placeholder="Ex: Copa Regional 2027" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Temporada</label>
                        <input required className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={form.season} onChange={e => setForm({...form, season: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Status</label>
                        <select className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={form.status} onChange={e => setForm({...form, status: e.target.value as Championship['status']})}>
                          <option value="PLANNING">Planejamento</option>
                          <option value="ACTIVE">Ativo</option>
                          <option value="FINISHED">Encerrado</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Formato</label>
                      <select className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value as Championship['type']})}>
                        <option value="POINTS_CORRIDOS">Pontos Corridos</option>
                        <option value="GROUPS">Fase de Grupos</option>
                        <option value="KNOCKOUT">Mata-Mata</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Regras */}
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3 border-b border-surface-border pb-1">Regras</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Amarelos p/ susp.</label>
                      <input type="number" min={1} className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={form.yellowCardLimit} onChange={e => setForm({...form, yellowCardLimit: +e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Pts por vitória</label>
                      <input type="number" min={1} className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={form.pointsPerWin} onChange={e => setForm({...form, pointsPerWin: +e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Pts por empate</label>
                      <input type="number" min={0} className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={form.pointsPerDraw} onChange={e => setForm({...form, pointsPerDraw: +e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Importar de */}
                {allBundles.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3 border-b border-surface-border pb-1">Importar dados de outro campeonato <span className="normal-case font-normal">(opcional)</span></p>
                    <div className="space-y-3">
                      <select className="w-full px-4 py-2.5 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={form.sourceId} onChange={e => setForm({...form, sourceId: e.target.value})}>
                        <option value="">— Começar do zero —</option>
                        {allBundles.map(b => (
                          <option key={b.championship.id} value={b.championship.id}>{b.championship.name} ({b.championship.season})</option>
                        ))}
                      </select>
                      {form.sourceId && (
                        <div className="grid grid-cols-2 gap-2">
                          {([['copyClubs','Times'], ['copyPlayers','Atletas'], ['copyReferees','Árbitros'], ['copyVenues','Campos']] as const).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 p-3 bg-neutral-50 border border-surface-border rounded-xl cursor-pointer hover:border-accent/40 transition-colors">
                              <input type="checkbox" className="w-4 h-4 text-accent rounded" checked={form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} />
                              <span className="text-[12px] font-bold text-primary">{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 pb-2">
                  <button type="submit" className="w-full btn-primary h-12">Criar Campeonato</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchCenterView({ 
  match, 
  clubs, 
  players, 
  onUpdateMatch, 
  onFinishMatch,
  onExit 
}: { 
  match: Match, 
  clubs: Club[], 
  players: Player[], 
  onUpdateMatch: (m: Match) => void,
  onFinishMatch: (m: Match, events: MatchEvent[], mvpPlayerId?: string) => void,
  onExit: () => void 
}) {
  const [currentMinute, setCurrentMinute] = useState(match.currentMinute || 0);
  const [events, setEvents] = useState<MatchEvent[]>(match.events || []);
  const [homeScore, setHomeScore] = useState(match.score?.home || 0);
  const [awayScore, setAwayScore] = useState(match.score?.away || 0);
  const [isPaused, setIsPaused] = useState(true);
  const [showMvpPicker, setShowMvpPicker] = useState(false);
  const [selectedMvp, setSelectedMvp] = useState<string | null>(null);
  const [pendingSubstitution, setPendingSubstitution] = useState<{
    teamId: string;
    step: 'out' | 'in';
    playerOutId?: string;
    minute: number;
  } | null>(null);

  const homeClub = clubs.find(c => c.id === match.homeTeamId);
  const awayClub = clubs.find(c => c.id === match.awayTeamId);

  const [localLineups, setLocalLineups] = useState<NonNullable<Match['lineups']>>(
    match.lineups || { home: { starters: [], substitutes: [] }, away: { starters: [], substitutes: [] } }
  );
  const [lineupConfirmed, setLineupConfirmed] = useState(!!match.lineups);

  const homePlayers = players.filter(p => p.clubId === match.homeTeamId);
  const awayPlayers = players.filter(p => p.clubId === match.awayTeamId);

  const togglePlayer = (team: 'home' | 'away', playerId: string) => {
    setLocalLineups(prev => {
      const lineup = prev[team];
      if (lineup.starters.includes(playerId)) {
        return { ...prev, [team]: { ...lineup, starters: lineup.starters.filter(id => id !== playerId) } };
      } else {
        return { ...prev, [team]: { ...lineup, starters: [...lineup.starters, playerId] } };
      }
    });
  };

  const getPlayerRole = (team: 'home' | 'away', playerId: string): 'starter' | 'none' => {
    return localLineups[team].starters.includes(playerId) ? 'starter' : 'none';
  };

  const confirmLineup = () => {
    onUpdateMatch({ ...match, lineups: localLineups });
    setLineupConfirmed(true);
    setIsPaused(false);
  };

  // Clock simulation: 1 in-game minute every 3 seconds for demo purposes
  useEffect(() => {
    if (match.status !== 'LIVE' || isPaused) return;

    const timer = setInterval(() => {
      setCurrentMinute(prev => {
        if (prev >= 90) {
          setIsPaused(true);
          return 90;
        }
        const next = prev + 1;
        // Sync with parent occasionally or on finish
        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [match.status, isPaused]);

  // Auto-sync currentMinute to parent
  useEffect(() => {
    onUpdateMatch({ ...match, currentMinute, score: { home: homeScore, away: awayScore }, events });
  }, [currentMinute, homeScore, awayScore, events]);

  const [pendingEvent, setPendingEvent] = useState<{ type: MatchEvent['type'], teamId: string } | null>(null);

  const addEvent = (type: MatchEvent['type'], teamId: string, playerId: string = '', playerInId?: string) => {
    const newEvent: MatchEvent = {
      id: `event-${Date.now()}`,
      matchId: match.id,
      teamId,
      playerId,
      type,
      minute: currentMinute,
      playerInId,
    };
    
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);

    if (type === 'GOAL') {
      if (teamId === match.homeTeamId) setHomeScore(s => s + 1);
      else setAwayScore(s => s + 1);
    }
    if (type === 'SUBSTITUTION' && playerId && playerInId) {
      const subTeam = teamId === match.homeTeamId ? 'home' : 'away';
      setLocalLineups(prev => {
        const curr = prev[subTeam];
        return {
          ...prev,
          [subTeam]: {
            ...curr,
            starters: [...curr.starters.filter(id => id !== playerId), playerInId],
          },
        };
      });
    }
    setPendingEvent(null);
    setPendingSubstitution(null);
  };

  const renderPlayerPicker = () => {
    if (!pendingEvent) return null;
    const team = pendingEvent.teamId === match.homeTeamId ? 'home' : 'away';
    const teamName = team === 'home' ? homeClub?.shortName : awayClub?.shortName;
    const teamPlayers = players
      .filter(p => localLineups[team].starters.includes(p.id))
      .sort((a, b) => (a.shirtNumber ?? 0) - (b.shirtNumber ?? 0));

    return (
      <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-primary uppercase leading-tight">Quem participou?</h3>
              <p className="text-[10px] font-black uppercase text-accent tracking-widest mt-1">{pendingEvent.type} - {teamName}</p>
            </div>
            <button onClick={() => setPendingEvent(null)} className="p-3 bg-neutral-100 rounded-2xl hover:bg-neutral-200 transition-colors"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {teamPlayers.map(p => (
              <button 
                key={p.id} 
                onClick={() => addEvent(pendingEvent.type, pendingEvent.teamId, p.id)}
                className="flex flex-col items-center gap-3 p-4 bg-neutral-50 rounded-2xl hover:bg-accent hover:text-white border border-surface-border hover:border-accent transition-all group"
              >
                <img src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}`} className="w-12 h-12 rounded-xl object-cover border border-surface-border group-hover:border-white/20" />
                <div className="text-center">
                  <p className="text-[8px] font-black opacity-50 uppercase mb-0.5">#{p.shirtNumber}</p>
                  <p className="text-[11px] font-bold truncate w-24">{p.name}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderSubstitutionPicker = () => {
    if (!pendingSubstitution) return null;
    const team = pendingSubstitution.teamId === match.homeTeamId ? 'home' : 'away';
    const club = team === 'home' ? homeClub : awayClub;

    const renderPlayerBtn = (p: Player, selected: boolean, onClick: () => void) => (
      <button
        key={p.id}
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
          selected
            ? 'bg-accent text-white border-accent shadow-md'
            : 'bg-neutral-50 border-surface-border hover:border-accent/40 hover:bg-accent/5'
        }`}
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black flex-shrink-0 ${selected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
          {p.shirtNumber ?? '?'}
        </span>
        <span className="text-[11px] font-bold truncate">{p.name}</span>
      </button>
    );

    if (pendingSubstitution.step === 'out') {
      const onField = players
        .filter(p => localLineups[team].starters.includes(p.id))
        .sort((a, b) => (a.shirtNumber ?? 0) - (b.shirtNumber ?? 0));
      return (
        <div className="fixed inset-0 bg-primary/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-border flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-surface-border bg-neutral-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-primary uppercase flex items-center gap-2">
                  <ArrowDown size={16} className="text-red-500" /> Quem SAI?
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                  <img src={club?.logoUrl} className="w-3 h-3 object-contain" /> {club?.shortName} · {pendingSubstitution.minute}'
                </p>
              </div>
              <button onClick={() => setPendingSubstitution(null)} className="p-2 bg-neutral-100 rounded-xl hover:bg-neutral-200"><X size={16} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar">
              {onField.map(p => renderPlayerBtn(p, false, () =>
                setPendingSubstitution({ ...pendingSubstitution, step: 'in', playerOutId: p.id })
              ))}
            </div>
          </motion.div>
        </div>
      );
    }

    // step === 'in'
    const alreadyIn = new Set(localLineups[team].starters);
    const available = players
      .filter(p => p.clubId === pendingSubstitution.teamId && !alreadyIn.has(p.id))
      .sort((a, b) => (a.shirtNumber ?? 0) - (b.shirtNumber ?? 0));
    const playerOut = players.find(p => p.id === pendingSubstitution.playerOutId);
    return (
      <div className="fixed inset-0 bg-primary/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-border flex flex-col max-h-[85vh]">
          <div className="p-5 border-b border-surface-border bg-neutral-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-primary uppercase flex items-center gap-2">
                <ArrowUp size={16} className="text-green-600" /> Quem ENTRA?
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                Saindo: <span className="font-black text-red-600">#{playerOut?.shirtNumber} {playerOut?.name}</span> · {pendingSubstitution.minute}'
              </p>
            </div>
            <button onClick={() => setPendingSubstitution({ ...pendingSubstitution, step: 'out', playerOutId: undefined })} className="p-2 bg-neutral-100 rounded-xl hover:bg-neutral-200"><ArrowLeft size={16} /></button>
          </div>
          <div className="p-5 grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar">
            {available.length === 0 && (
              <p className="col-span-2 text-center text-[11px] text-text-muted italic py-6">Nenhum jogador disponível para entrar.</p>
            )}
            {available.map(p => renderPlayerBtn(p, false, () =>
              addEvent('SUBSTITUTION', pendingSubstitution.teamId, pendingSubstitution.playerOutId!, p.id)
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderMvpPicker = () => {
    if (!showMvpPicker) return null;

    const originalStarters = [
      ...(match.lineups?.home.starters ?? localLineups.home.starters),
      ...(match.lineups?.away.starters ?? localLineups.away.starters),
    ];
    const subIns = events
      .filter(e => e.type === 'SUBSTITUTION' && e.playerInId)
      .map(e => e.playerInId!);
    const participatingIds = [...new Set([...originalStarters, ...subIns])];
    const participatingPlayers = players.filter(p => participatingIds.includes(p.id));
    const homePart = participatingPlayers.filter(p => p.clubId === match.homeTeamId);
    const awayPart = participatingPlayers.filter(p => p.clubId === match.awayTeamId);

    const renderTeamGroup = (teamPlayers: Player[], club: Club | undefined) => (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <img src={club?.logoUrl} className="w-5 h-5 object-contain" />
          <span className="text-[10px] font-black uppercase text-text-muted">{club?.shortName}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {teamPlayers.sort((a, b) => (a.shirtNumber ?? 0) - (b.shirtNumber ?? 0)).map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedMvp(prev => prev === p.id ? null : p.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                selectedMvp === p.id
                  ? 'bg-accent text-white border-accent shadow-lg shadow-accent/25'
                  : 'bg-neutral-50 border-surface-border hover:border-accent/40 hover:bg-accent/5'
              }`}
            >
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                selectedMvp === p.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>{p.shirtNumber ?? '?'}</span>
              <span className="text-[11px] font-bold truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-primary/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-surface-border flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-surface-border bg-neutral-50 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
                <Star size={18} className="text-amber-500" /> Melhor Jogador da Partida
              </h2>
              <p className="text-[10px] text-text-muted mt-0.5">Selecione o MVP ou encerre sem indicar.</p>
            </div>
            <button onClick={() => setShowMvpPicker(false)} className="p-2 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            {participatingPlayers.length === 0 ? (
              <p className="text-[12px] text-text-muted italic text-center py-8">Nenhum jogador na escalação confirmada.</p>
            ) : (
              <>
                {homePart.length > 0 && renderTeamGroup(homePart, homeClub)}
                {awayPart.length > 0 && renderTeamGroup(awayPart, awayClub)}
              </>
            )}
          </div>

          {selectedMvp && (() => {
            const mvp = players.find(p => p.id === selectedMvp);
            return (
              <div className="px-6 py-3 bg-amber-50 border-t border-amber-200 flex items-center gap-3">
                <Star size={14} className="text-amber-500 flex-shrink-0" />
                <span className="text-[11px] font-black text-amber-800 truncate">
                  #{mvp?.shirtNumber} {mvp?.name}
                </span>
              </div>
            );
          })()}

          <div className="p-5 border-t border-surface-border bg-neutral-50 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={() => onFinishMatch(match, events, undefined)}
              className="btn-outline text-xs"
            >
              Encerrar sem MVP
            </button>
            <button
              onClick={() => onFinishMatch(match, events, selectedMvp ?? undefined)}
              className="px-8 py-2.5 bg-accent text-white font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/20"
            >
              Confirmar e Encerrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderLineupTeamColumn = (team: 'home' | 'away', teamPlayers: Player[], club: Club | undefined) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-surface-border">
        <img src={club?.logoUrl} className="w-8 h-8 object-contain rounded" />
        <div>
          <p className="text-[11px] font-black uppercase text-primary">{club?.name}</p>
          <p className="text-[10px] text-text-muted">
            {localLineups[team].starters.length} titulares selecionados
          </p>
        </div>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        {teamPlayers.length === 0 && (
          <p className="text-[11px] text-text-muted italic p-4 text-center">Nenhum atleta cadastrado neste time.</p>
        )}
        {teamPlayers.sort((a, b) => (a.shirtNumber ?? 0) - (b.shirtNumber ?? 0)).map(p => {
          const role = getPlayerRole(team, p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePlayer(team, p.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                role === 'starter'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-neutral-50 border-surface-border text-text-muted hover:border-accent/40 hover:bg-accent/5'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black flex-shrink-0 ${
                role === 'starter' ? 'bg-green-200 text-green-800' : 'bg-neutral-200 text-neutral-500'
              }`}>
                {p.shirtNumber ?? '?'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black truncate">{p.name}</p>
                <p className="text-[9px] font-bold uppercase opacity-60">{p.position}</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                role === 'starter' ? 'bg-green-200 text-green-800' : 'bg-neutral-200 text-neutral-500'
              }`}>
                {role === 'starter' ? 'T' : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {renderPlayerPicker()}
      {renderSubstitutionPicker()}
      {renderMvpPicker()}

      {/* Inline lineup selection — shown before the coordinator confirms */}
      {!lineupConfirmed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card-utility overflow-hidden border-2 border-accent/40">
          <div className="p-5 bg-accent/5 border-b border-surface-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-primary uppercase tracking-tight">Escalação da Partida</h2>
              <p className="text-[10px] text-text-muted mt-0.5">
                Toque no jogador: <span className="font-black text-green-700">T</span> = Titular ·{' '}
                <span className="font-black text-amber-700">R</span> = Reserva ·{' '}
                <span className="font-black text-neutral-500">—</span> = Fora
              </p>
            </div>
            <button
              onClick={confirmLineup}
              className="px-6 py-2.5 bg-accent text-white font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <Radio size={13} className="animate-pulse" /> Apitar! Iniciar Partida
            </button>
          </div>
          <div className="p-6 flex gap-6 overflow-hidden">
            {renderLineupTeamColumn('home', homePlayers, homeClub)}
            <div className="w-px bg-surface-border flex-shrink-0" />
            {renderLineupTeamColumn('away', awayPlayers, awayClub)}
          </div>
        </motion.div>
      )}
      {/* Real-time Header */}
      <div className="bg-neutral-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-8">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
              match.status === 'LIVE' ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' : 'bg-white/10 text-white/60'
            }`}>
              {match.status === 'LIVE' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
              {match.status === 'LIVE' ? 'Ao Vivo' : 'Encerrado'}
            </div>
            <div className="font-mono text-3xl font-black text-accent tracking-tighter">
              {currentMinute}'
            </div>
          </div>

          <div className="grid grid-cols-3 items-center w-full max-w-3xl gap-8">
            <div className="flex flex-col items-center gap-4">
              <img src={homeClub?.logoUrl} className="w-24 h-24 object-contain brightness-0 invert opacity-80" />
              <h3 className="text-xl font-black uppercase tracking-tight text-center">{homeClub?.name}</h3>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-7xl font-black flex items-center gap-6 tabular-nums">
                <span>{homeScore}</span>
                <span className="text-white/10 font-thin">:</span>
                <span>{awayScore}</span>
              </div>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em] mt-4 italic">{match.location}</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <img src={awayClub?.logoUrl} className="w-24 h-24 object-contain brightness-0 invert opacity-80" />
              <h3 className="text-xl font-black uppercase tracking-tight text-center">{awayClub?.name}</h3>
            </div>
          </div>

          <div className="flex gap-4 mt-12 flex-wrap justify-center">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/10"
            >
              {isPaused ? 'Retomar Relógio' : 'Pausar Relógio'}
            </button>
            <button
              onClick={() => { setSelectedMvp(null); setShowMvpPicker(true); }}
              className="px-8 py-3 bg-accent text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95"
            >
              Finalizar Jogo
            </button>
          </div>
          <a
            href={`/field/${match.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest text-accent/90 hover:text-accent border-b border-accent/30"
          >
            Modo campo (nova aba / PWA)
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-utility p-8">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-black text-primary uppercase flex items-center gap-2">
                <ShieldAlert className="text-accent" /> Control Center
              </h4>
              <p className="text-[10px] font-medium text-text-muted italic">Selecione uma ação e o jogador correspondente</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Home Actions */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-surface-border pb-2">
                  <img src={homeClub?.logoUrl} className="w-6 h-6 object-contain" />
                  <span className="text-[13px] font-black uppercase text-primary">{homeClub?.shortName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPendingEvent({ type: 'GOAL', teamId: match.homeTeamId })} className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl border border-green-100 flex flex-col items-center gap-2 transition-all group">
                    <Trophy size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase">Gol</span>
                  </button>
                  <button onClick={() => setPendingEvent({ type: 'YELLOW_CARD', teamId: match.homeTeamId })} className="p-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl border border-amber-100 flex flex-col items-center gap-2 transition-all">
                    <div className="w-3 h-4 bg-amber-400 rounded-sm" />
                    <span className="text-[10px] font-black uppercase">Amarelo</span>
                  </button>
                  <button onClick={() => setPendingEvent({ type: 'RED_CARD', teamId: match.homeTeamId })} className="p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl border border-red-100 flex flex-col items-center gap-2 transition-all">
                    <div className="w-3 h-4 bg-red-600 rounded-sm" />
                    <span className="text-[10px] font-black uppercase">Vermelho</span>
                  </button>
                  <button onClick={() => setPendingSubstitution({ teamId: match.homeTeamId, step: 'out', minute: currentMinute })} className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl border border-blue-100 flex flex-col items-center gap-2 transition-all">
                    <RefreshCw size={18} />
                    <span className="text-[10px] font-black uppercase">Troca</span>
                  </button>
                </div>
              </div>

              {/* Away Actions */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-surface-border pb-2">
                  <img src={awayClub?.logoUrl} className="w-6 h-6 object-contain" />
                  <span className="text-[13px] font-black uppercase text-primary">{awayClub?.shortName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPendingEvent({ type: 'GOAL', teamId: match.awayTeamId })} className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl border border-green-100 flex flex-col items-center gap-2 transition-all group">
                    <Trophy size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase">Gol</span>
                  </button>
                  <button onClick={() => setPendingEvent({ type: 'YELLOW_CARD', teamId: match.awayTeamId })} className="p-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-2xl border border-amber-100 flex flex-col items-center gap-2 transition-all">
                    <div className="w-3 h-4 bg-amber-400 rounded-sm" />
                    <span className="text-[10px] font-black uppercase">Amarelo</span>
                  </button>
                  <button onClick={() => setPendingEvent({ type: 'RED_CARD', teamId: match.awayTeamId })} className="p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl border border-red-100 flex flex-col items-center gap-2 transition-all">
                    <div className="w-3 h-4 bg-red-600 rounded-sm" />
                    <span className="text-[10px] font-black uppercase">Vermelho</span>
                  </button>
                  <button onClick={() => setPendingSubstitution({ teamId: match.awayTeamId, step: 'out', minute: currentMinute })} className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl border border-blue-100 flex flex-col items-center gap-2 transition-all">
                    <RefreshCw size={18} />
                    <span className="text-[10px] font-black uppercase">Troca</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-utility">
            <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <FileText size={16} /> Linha do Tempo
            </h4>
            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-surface-border">
              {events.length === 0 && (
                <div className="py-20 text-center opacity-30 italic text-sm">Aguardando lances da partida...</div>
              )}
              {events.map((ev, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={ev.id} 
                  className="relative flex items-center gap-6"
                >
                  <div className="absolute -left-[29px] w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  <div className="font-mono font-black text-accent text-lg w-10">
                    {ev.minute}'
                  </div>
                  <div className="flex-1 bg-neutral-50 p-4 rounded-2xl border border-surface-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        ev.type === 'GOAL' ? 'bg-green-100 text-green-700' :
                        ev.type === 'SUBSTITUTION' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {ev.type === 'GOAL' ? <Trophy size={14} /> : 
                         ev.type === 'SUBSTITUTION' ? <RefreshCw size={14} /> : <ShieldAlert size={14} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-text-muted leading-none mb-1">
                          {ev.type === 'GOAL' ? 'GOL!' : 
                           ev.type === 'SUBSTITUTION' ? 'SUBSTITUIÇÃO' : 
                           ev.type === 'YELLOW_CARD' ? 'CARTÃO AMARELO' : 'CARTÃO VERMELHO'}
                        </p>
                        {ev.type === 'SUBSTITUTION' ? (
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                              <ArrowDown size={10} className="text-red-500 flex-shrink-0" />
                              {players.find(p => p.id === ev.playerId)?.name ?? '—'}
                              <span className="text-text-muted font-normal">#{players.find(p => p.id === ev.playerId)?.shirtNumber}</span>
                            </p>
                            {ev.playerInId && (
                              <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                                <ArrowUp size={10} className="text-green-600 flex-shrink-0" />
                                {players.find(p => p.id === ev.playerInId)?.name ?? '—'}
                                <span className="text-text-muted font-normal">#{players.find(p => p.id === ev.playerInId)?.shirtNumber}</span>
                              </p>
                            )}
                            <p className="text-[9px] text-text-muted">{clubs.find(c => c.id === ev.teamId)?.shortName}</p>
                          </div>
                        ) : (
                          <p className="font-bold text-sm text-primary">
                            {clubs.find(c => c.id === ev.teamId)?.shortName} • {ev.playerId ? players.find(p => p.id === ev.playerId)?.name : 'Lance em análise'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Info & Lineups */}
        <div className="space-y-6">
          <div className="card-utility">
            <h4 className="font-black text-[12px] uppercase text-text-muted mb-4">Informações do Jogo</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <MapPin size={16} className="text-accent" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-muted uppercase">Local / Campo</span>
                  <span className="text-xs font-bold">{match.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <Calendar size={16} className="text-accent" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-muted uppercase">Data & Hora</span>
                  <span className="text-xs font-bold">{match.date} • {match.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lineups Toggleable or Summary */}
          <div className="card-utility p-0 overflow-hidden">
             <div className="p-4 bg-neutral-50 border-b border-surface-border">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Escalações Confirmadas</h4>
             </div>
             <div className="p-6 space-y-8">
                <div className="space-y-3">
                   <div className="flex items-center gap-2 mb-2">
                      <img src={homeClub?.logoUrl} className="w-5 h-5 object-contain" />
                      <span className="text-[10px] font-black uppercase">{homeClub?.name}</span>
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                      {match.lineups?.home.starters.map(pid => (
                        <div key={pid} className="flex flex-col items-center gap-1 group">
                           <img src={players.find(p => p.id === pid)?.photoUrl || `https://ui-avatars.com/api/?name=${players.find(p => p.id === pid)?.name}`} className="w-10 h-10 rounded-lg object-cover border border-surface-border" />
                           <span className="text-[9px] font-bold text-text-muted group-hover:text-primary transition-colors">#{players.find(p => p.id === pid)?.shirtNumber}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-2 mb-2">
                      <img src={awayClub?.logoUrl} className="w-5 h-5 object-contain" />
                      <span className="text-[10px] font-black uppercase">{awayClub?.name}</span>
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                      {match.lineups?.away.starters.map(pid => (
                        <div key={pid} className="flex flex-col items-center gap-1 group">
                           <img src={players.find(p => p.id === pid)?.photoUrl || `https://ui-avatars.com/api/?name=${players.find(p => p.id === pid)?.name}`} className="w-10 h-10 rounded-lg object-cover border border-surface-border" />
                           <span className="text-[9px] font-bold text-text-muted group-hover:text-primary transition-colors">#{players.find(p => p.id === pid)?.shirtNumber}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const isPlayerEligible = (player: Player, rules: Championship['rules']): { eligible: boolean, reasons: string[] } => {
  const reasons: string[] = [];
  
  if (player.status !== 'ACTIVE') reasons.push('Atleta está suspenso.');
  if (player.documentStatus !== 'APPROVED') reasons.push('Documentação pendente ou reprovada.');
  
  const birthDate = new Date(player.birthDate);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }

  if (rules.minAge && age < rules.minAge) reasons.push(`Idade mínima permitida: ${rules.minAge} anos (Atleta tem ${age}).`);
  if (rules.maxAge && age > rules.maxAge) reasons.push(`Idade máxima permitida: ${rules.maxAge} anos (Atleta tem ${age}).`);

  return { eligible: reasons.length === 0, reasons };
};

// Posições consideradas "defesa" para o Prêmio Fair Play
const DEFENSE_POSITIONS = ['ZAG', 'LD', 'LE', 'LAT', 'DEF'];

type AwardKey = 'GOLDEN_BOOT' | 'SILVER_BOOT' | 'GOLDEN_GLOVE' | 'STAR' | 'FAIR_PLAY';

function AwardsView({ players, clubs, matches, matchEvents }: { players: Player[], clubs: Club[], matches: Match[], matchEvents: MatchEvent[] }) {
  const [activeAward, setActiveAward] = useState<AwardKey | null>(null);

  // 1. Chuteira de Ouro — Artilharia (ranking completo)
  const scorerRanking = [...players]
    .filter(p => (p.stats?.goals || 0) > 0)
    .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0));
  const topScorer = scorerRanking[0];

  // 2. Chuteira de Prata — Assistências (ranking completo)
  const assisterRanking = [...players]
    .filter(p => (p.stats?.assists || 0) > 0)
    .sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0));
  const topAssister = assisterRanking[0];

  // 3. Luva de Ouro — gols sofridos / jogos disputados (proporcional)
  const goalkeepers = players.filter(p => p.position === 'GOL');
  const goalkeeperStats = goalkeepers.map(gk => {
    const clubMatches = matches.filter(m =>
      m.status === 'FINISHED' &&
      (m.homeTeamId === gk.clubId || m.awayTeamId === gk.clubId)
    );
    const goalsAgainst = clubMatches.reduce((acc, m) => {
      const isHome = m.homeTeamId === gk.clubId;
      return acc + (isHome ? (m.score?.away || 0) : (m.score?.home || 0));
    }, 0);
    const cleanSheets = clubMatches.filter(m => {
      const isHome = m.homeTeamId === gk.clubId;
      return (isHome ? (m.score?.away || 0) : (m.score?.home || 0)) === 0;
    }).length;
    const played = clubMatches.length;
    const ratio = played > 0 ? goalsAgainst / played : Infinity;
    return { gk, ratio, played, goalsAgainst, cleanSheets, clubMatches };
  })
  .filter(s => s.played > 0)
  .sort((a, b) => a.ratio !== b.ratio ? a.ratio - b.ratio : b.cleanSheets - a.cleanSheets);
  const bestGK = goalkeeperStats[0];

  // 4. Craque do Campeonato — mais MVPs (gols como desempate)
  const craqueRanking = [...players]
    .filter(p => (p.stats?.mvpCount || 0) > 0 || (p.stats?.goals || 0) > 0)
    .sort((a, b) => {
      const mvpDiff = (b.stats?.mvpCount || 0) - (a.stats?.mvpCount || 0);
      if (mvpDiff !== 0) return mvpDiff;
      return (b.stats?.goals || 0) - (a.stats?.goals || 0);
    });
  const craque = craqueRanking[0];

  // 5. Prêmio Fair Play — defensores com menor índice disciplinar
  const fairPlayRanking = players
    .filter(p => DEFENSE_POSITIONS.includes(p.position) && (p.stats?.matches || 0) > 0)
    .map(p => ({
      player: p,
      discipline: (p.stats?.yellowCards || 0) + (p.stats?.redCards || 0) * 3,
      matches: p.stats?.matches || 0,
    }))
    .sort((a, b) => a.discipline !== b.discipline ? a.discipline - b.discipline : b.matches - a.matches);
  const fairPlayDefender = fairPlayRanking[0];

  const AwardCard = ({
    award, title, icon, accent, player, subtitle, value, footnote
  }: {
    award: AwardKey;
    title: string;
    icon: React.ReactNode;
    accent: string;
    player?: Player;
    subtitle: string;
    value: string;
    footnote?: string;
  }) => (
    <button
      type="button"
      disabled={!player}
      onClick={() => setActiveAward(award)}
      className="card-utility p-6 bg-white overflow-hidden relative group text-left disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:border-accent/40 enabled:hover:-translate-y-0.5 transition-all"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${accent} rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-700`} />
      <div className="flex items-start gap-4 z-10 relative">
        <div className={`p-3 ${accent} rounded-2xl`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">{title}</h4>
          {player ? (
            <div className="flex items-center gap-3 mt-3">
              <img src={player.photoUrl} className="w-12 h-12 rounded-xl object-cover border border-surface-border" alt="" />
              <div className="min-w-0">
                <p className="font-bold text-primary leading-none uppercase truncate">{player.name}</p>
                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight">
                  {clubs.find(c => c.id === player.clubId)?.shortName} · {player.position}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] italic text-text-muted mt-4">Dados insuficientes</p>
          )}
          {player && (
            <>
              <div className="mt-4 pt-4 border-t border-surface-border flex justify-between items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">{subtitle}</span>
                <span className="text-lg font-black text-primary tabular-nums">{value}</span>
              </div>
              {footnote && <p className="mt-2 text-[10px] font-medium text-text-muted">{footnote}</p>}
              <p className="mt-3 text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1">
                Ver ranking & detalhes <ChevronRight size={12} />
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-8 bg-neutral-900 rounded-[2.5rem] text-white">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Hall da Fama 2026</h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Premiações Automáticas baseadas em Súmulas Oficiais</p>
        </div>
        <div className="p-4 bg-white/10 rounded-2xl">
          <Award size={32} className="text-accent" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <AwardCard
          award="GOLDEN_BOOT"
          title="Chuteira de Ouro"
          icon={<Trophy size={20} className="text-amber-600" />}
          accent="bg-amber-100 text-amber-700"
          player={topScorer}
          subtitle="Gols Marcados"
          value={(topScorer?.stats?.goals ?? 0).toString()}
          footnote="Artilheiro do campeonato"
        />
        <AwardCard
          award="SILVER_BOOT"
          title="Chuteira de Prata"
          icon={<Award size={20} className="text-neutral-500" />}
          accent="bg-neutral-200 text-neutral-700"
          player={topAssister}
          subtitle="Assistências"
          value={(topAssister?.stats?.assists ?? 0).toString()}
          footnote="Maior garçom do campeonato"
        />
        <AwardCard
          award="GOLDEN_GLOVE"
          title="Luva de Ouro"
          icon={<Shield size={20} className="text-blue-600" />}
          accent="bg-blue-100 text-blue-700"
          player={bestGK?.gk}
          subtitle="Gols sofridos / jogo"
          value={bestGK ? bestGK.ratio.toFixed(2) : '—'}
          footnote={bestGK ? `${bestGK.goalsAgainst} sofridos em ${bestGK.played} jogos · ${bestGK.cleanSheets} clean sheet(s)` : undefined}
        />
        <AwardCard
          award="STAR"
          title="Craque do Campeonato"
          icon={<Star size={20} className="text-accent" fill="currentColor" />}
          accent="bg-accent/10 text-accent"
          player={craque}
          subtitle="MVPs"
          value={(craque?.stats?.mvpCount ?? 0).toString()}
          footnote={craque ? `${craque.stats?.goals ?? 0} gol(s) na temporada` : undefined}
        />
        <AwardCard
          award="FAIR_PLAY"
          title="Prêmio Fair Play"
          icon={<Heart size={20} className="text-green-600" />}
          accent="bg-green-100 text-green-700"
          player={fairPlayDefender?.player}
          subtitle="Pts de indisciplina"
          value={fairPlayDefender ? fairPlayDefender.discipline.toString() : '—'}
          footnote={fairPlayDefender ? `${fairPlayDefender.player.stats?.yellowCards ?? 0} amarelo(s) · ${fairPlayDefender.player.stats?.redCards ?? 0} vermelho(s) em ${fairPlayDefender.matches} jogo(s)` : 'Restrito a zagueiros e laterais'}
        />
      </div>

      {activeAward && (
        <AwardDetailModal
          award={activeAward}
          onClose={() => setActiveAward(null)}
          clubs={clubs}
          matches={matches}
          matchEvents={matchEvents}
          scorerRanking={scorerRanking}
          assisterRanking={assisterRanking}
          goalkeeperStats={goalkeeperStats}
          craqueRanking={craqueRanking}
          fairPlayRanking={fairPlayRanking}
        />
      )}
    </div>
  );
}

// ── Modal de detalhes do prêmio ────────────────────────────────────────────
type GKStats = { gk: Player; ratio: number; played: number; goalsAgainst: number; cleanSheets: number; clubMatches: Match[] };
type FairPlayEntry = { player: Player; discipline: number; matches: number };

const AWARD_META: Record<AwardKey, { title: string; metricLabel: string; color: string }> = {
  GOLDEN_BOOT:  { title: 'Chuteira de Ouro',       metricLabel: 'Gols',                color: 'text-amber-600' },
  SILVER_BOOT:  { title: 'Chuteira de Prata',      metricLabel: 'Assistências',        color: 'text-neutral-600' },
  GOLDEN_GLOVE: { title: 'Luva de Ouro',           metricLabel: 'Gols sofridos / jogo', color: 'text-blue-600' },
  STAR:         { title: 'Craque do Campeonato',   metricLabel: 'MVPs',                color: 'text-accent' },
  FAIR_PLAY:    { title: 'Prêmio Fair Play',       metricLabel: 'Pts disciplinar',     color: 'text-green-600' },
};

function AwardDetailModal({
  award, onClose, clubs, matches, matchEvents,
  scorerRanking, assisterRanking, goalkeeperStats, craqueRanking, fairPlayRanking,
}: {
  award: AwardKey;
  onClose: () => void;
  clubs: Club[];
  matches: Match[];
  matchEvents: MatchEvent[];
  scorerRanking: Player[];
  assisterRanking: Player[];
  goalkeeperStats: GKStats[];
  craqueRanking: Player[];
  fairPlayRanking: FairPlayEntry[];
}) {
  const meta = AWARD_META[award];

  // Constrói a lista de candidatos (top 8) com player + valor da métrica
  const ranking: { player: Player; value: string; extra?: string }[] = (() => {
    if (award === 'GOLDEN_BOOT')
      return scorerRanking.slice(0, 8).map(p => ({ player: p, value: `${p.stats?.goals ?? 0}` }));
    if (award === 'SILVER_BOOT')
      return assisterRanking.slice(0, 8).map(p => ({ player: p, value: `${p.stats?.assists ?? 0}` }));
    if (award === 'GOLDEN_GLOVE')
      return goalkeeperStats.slice(0, 8).map(s => ({
        player: s.gk,
        value: s.ratio.toFixed(2),
        extra: `${s.cleanSheets} CS · ${s.goalsAgainst} GS / ${s.played}j`,
      }));
    if (award === 'STAR')
      return craqueRanking.slice(0, 8).map(p => ({
        player: p,
        value: `${p.stats?.mvpCount ?? 0}`,
        extra: `${p.stats?.goals ?? 0} gol(s)`,
      }));
    return fairPlayRanking.slice(0, 8).map(e => ({
      player: e.player,
      value: e.discipline.toString(),
      extra: `${e.matches} jogo(s)`,
    }));
  })();

  const leader = ranking[0]?.player;

  return createPortal(
    <div
      className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-surface-border flex flex-col"
      >
        <div className="p-6 border-b border-surface-border bg-neutral-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className={`font-black uppercase text-sm tracking-tight ${meta.color}`}>{meta.title}</h3>
            {leader && (
              <p className="text-[11px] text-text-muted font-bold mt-0.5">
                Líder: <b className="text-primary">{leader.name}</b> · {clubs.find(c => c.id === leader.clubId)?.shortName}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ranking */}
          <section>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted mb-3">
              Disputa do prêmio (top {ranking.length})
            </h4>
            {ranking.length === 0 ? (
              <p className="text-[12px] text-text-muted italic">Nenhum candidato com dados ainda.</p>
            ) : (
              <div className="divide-y divide-dotted divide-surface-border border border-surface-border rounded-2xl overflow-hidden">
                {ranking.map((row, idx) => {
                  const club = clubs.find(c => c.id === row.player.clubId);
                  return (
                    <div key={row.player.id} className={`flex items-center gap-4 px-4 py-3 ${idx === 0 ? 'bg-amber-50/40' : 'bg-white'}`}>
                      <span className={`text-[13px] font-black w-6 text-center ${idx === 0 ? meta.color : 'text-text-muted'}`}>{idx + 1}º</span>
                      <img src={row.player.photoUrl} className="w-9 h-9 rounded-lg object-cover border border-surface-border" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-primary truncate">{row.player.name}</p>
                        <p className="text-[10px] text-text-muted font-medium truncate">
                          {club?.shortName ?? '—'} · {row.player.position}
                          {row.extra && <> · {row.extra}</>}
                        </p>
                      </div>
                      <span className={`text-[15px] font-black tabular-nums ${idx === 0 ? meta.color : 'text-primary'}`}>{row.value}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-[10px] text-text-muted italic">Métrica: {meta.metricLabel}</p>
          </section>

          {/* Detalhes do líder */}
          {leader && (
            <section>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted mb-3">
                {award === 'GOLDEN_BOOT' && 'Partidas em que o artilheiro fez gol'}
                {award === 'SILVER_BOOT' && 'Partidas em que o garçom deu assistência'}
                {award === 'GOLDEN_GLOVE' && 'Histórico do goleiro (clean sheets em destaque)'}
                {award === 'STAR' && 'Partidas em que foi eleito MVP'}
                {award === 'FAIR_PLAY' && 'Cartões do líder por partida'}
              </h4>
              <LeaderBreakdown
                award={award}
                leader={leader}
                gkStats={award === 'GOLDEN_GLOVE' ? goalkeeperStats[0] : undefined}
                clubs={clubs}
                matches={matches}
                matchEvents={matchEvents}
              />
            </section>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

function LeaderBreakdown({
  award, leader, gkStats, clubs, matches, matchEvents,
}: {
  award: AwardKey;
  leader: Player;
  gkStats?: GKStats;
  clubs: Club[];
  matches: Match[];
  matchEvents: MatchEvent[];
}) {
  const opponentOf = (m: Match) => {
    const isHome = m.homeTeamId === leader.clubId;
    return clubs.find(c => c.id === (isHome ? m.awayTeamId : m.homeTeamId));
  };
  const sideLabel = (m: Match) => m.homeTeamId === leader.clubId ? 'Casa' : 'Fora';
  const matchById = (id: string) => matches.find(m => m.id === id);

  // Fonte unificada de eventos: top-level matchEvents + match.events de cada partida
  const allEvents: MatchEvent[] = [
    ...matchEvents,
    ...matches.flatMap(m => (m.events ?? []).map(e => ({ ...e, matchId: e.matchId || m.id }))),
  ];

  // ── Chuteira de Ouro ── partidas com gols do líder ───────────────────────
  if (award === 'GOLDEN_BOOT') {
    const goalsByMatch = new Map<string, number>();
    allEvents.filter(e => e.playerId === leader.id && e.type === 'GOAL').forEach(e => {
      goalsByMatch.set(e.matchId, (goalsByMatch.get(e.matchId) ?? 0) + 1);
    });
    if (goalsByMatch.size === 0) {
      return <EmptyBreakdown text={`Os ${leader.stats?.goals ?? 0} gol(s) do artilheiro ainda não estão detalhados em eventos de súmula.`} />;
    }
    const rows = Array.from(goalsByMatch.entries())
      .map(([id, count]) => ({ match: matchById(id), count }))
      .filter(r => !!r.match)
      .sort((a, b) => (b.match!.date).localeCompare(a.match!.date));
    return (
      <BreakdownTable
        head={['Data', 'Adversário', 'Local', 'Placar', 'Gols']}
        rows={rows.map(r => [
          r.match!.date,
          opponentOf(r.match!)?.shortName ?? '—',
          sideLabel(r.match!),
          `${r.match!.score?.home ?? 0} - ${r.match!.score?.away ?? 0}`,
          <span key="g" className="text-amber-600 font-black">{r.count}</span>,
        ])}
      />
    );
  }

  // ── Chuteira de Prata ── partidas com assistências do líder ──────────────
  if (award === 'SILVER_BOOT') {
    const assistsByMatch = new Map<string, number>();
    allEvents.filter(e => e.playerId === leader.id && e.type === 'ASSIST').forEach(e => {
      assistsByMatch.set(e.matchId, (assistsByMatch.get(e.matchId) ?? 0) + 1);
    });
    if (assistsByMatch.size === 0) {
      return <EmptyBreakdown text={`As ${leader.stats?.assists ?? 0} assistência(s) ainda não estão detalhadas em eventos de súmula.`} />;
    }
    const rows = Array.from(assistsByMatch.entries())
      .map(([id, count]) => ({ match: matchById(id), count }))
      .filter(r => !!r.match)
      .sort((a, b) => (b.match!.date).localeCompare(a.match!.date));
    return (
      <BreakdownTable
        head={['Data', 'Adversário', 'Local', 'Placar', 'Assistências']}
        rows={rows.map(r => [
          r.match!.date,
          opponentOf(r.match!)?.shortName ?? '—',
          sideLabel(r.match!),
          `${r.match!.score?.home ?? 0} - ${r.match!.score?.away ?? 0}`,
          <span key="a" className="text-neutral-700 font-black">{r.count}</span>,
        ])}
      />
    );
  }

  // ── Luva de Ouro ── histórico do goleiro com clean sheets ────────────────
  if (award === 'GOLDEN_GLOVE' && gkStats) {
    const cleanMinutes = gkStats.cleanSheets * 90; // aproximação
    const sorted = [...gkStats.clubMatches].sort((a, b) => b.date.localeCompare(a.date));
    return (
      <>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <MiniStat label="Clean sheets" value={gkStats.cleanSheets.toString()} accent="text-blue-600" />
          <MiniStat label="Minutos s/ sofrer" value={`${cleanMinutes}'`} accent="text-blue-600" />
          <MiniStat label="Gols sofridos" value={gkStats.goalsAgainst.toString()} accent="text-text-muted" />
        </div>
        <BreakdownTable
          head={['Data', 'Adversário', 'Local', 'Placar', 'Gols sofridos']}
          rows={sorted.map(m => {
            const isHome = m.homeTeamId === leader.clubId;
            const ga = isHome ? (m.score?.away ?? 0) : (m.score?.home ?? 0);
            const gf = isHome ? (m.score?.home ?? 0) : (m.score?.away ?? 0);
            const isClean = ga === 0;
            return [
              m.date,
              opponentOf(m)?.shortName ?? '—',
              isHome ? 'Casa' : 'Fora',
              `${gf} - ${ga}`,
              isClean
                ? <span key="cs" className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">Clean Sheet</span>
                : <span key="ga" className="text-red-600 font-black">{ga}</span>,
            ];
          })}
        />
      </>
    );
  }

  // ── Craque do Campeonato ── partidas em que foi MVP ──────────────────────
  if (award === 'STAR') {
    const mvpMatches = matches.filter(m => m.mvpPlayerId === leader.id).sort((a, b) => b.date.localeCompare(a.date));
    if (mvpMatches.length === 0) {
      return <EmptyBreakdown text={`Os ${leader.stats?.mvpCount ?? 0} MVP(s) ainda não têm referência direta nas partidas registradas.`} />;
    }
    return (
      <BreakdownTable
        head={['Data', 'Adversário', 'Local', 'Placar', 'Marcador']}
        rows={mvpMatches.map(m => {
          const goalsThis = allEvents.filter(e => e.matchId === m.id && e.playerId === leader.id && e.type === 'GOAL').length;
          return [
            m.date,
            opponentOf(m)?.shortName ?? '—',
            sideLabel(m),
            `${m.score?.home ?? 0} - ${m.score?.away ?? 0}`,
            goalsThis > 0
              ? <span key="g" className="text-accent font-black">{goalsThis} gol(s)</span>
              : <span key="g" className="text-text-muted">—</span>,
          ];
        })}
      />
    );
  }

  // ── Fair Play ── cartões do defensor por partida ────────────────────────
  if (award === 'FAIR_PLAY') {
    const cardEvents = allEvents.filter(e => e.playerId === leader.id && (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD'));
    if (cardEvents.length === 0) {
      return (
        <EmptyBreakdown text={`Líder em fair play sem cartões registrados em eventos de súmula. Stats agregadas: ${leader.stats?.yellowCards ?? 0} amarelo(s) · ${leader.stats?.redCards ?? 0} vermelho(s) em ${leader.stats?.matches ?? 0} jogo(s).`} />
      );
    }
    const byMatch = new Map<string, { y: number; r: number }>();
    cardEvents.forEach(e => {
      const v = byMatch.get(e.matchId) ?? { y: 0, r: 0 };
      if (e.type === 'YELLOW_CARD') v.y++; else v.r++;
      byMatch.set(e.matchId, v);
    });
    const rows = Array.from(byMatch.entries())
      .map(([id, c]) => ({ match: matchById(id), c }))
      .filter(r => !!r.match)
      .sort((a, b) => (b.match!.date).localeCompare(a.match!.date));
    return (
      <BreakdownTable
        head={['Data', 'Adversário', 'Local', 'Placar', 'Cartões']}
        rows={rows.map(r => [
          r.match!.date,
          opponentOf(r.match!)?.shortName ?? '—',
          sideLabel(r.match!),
          `${r.match!.score?.home ?? 0} - ${r.match!.score?.away ?? 0}`,
          <span key="c" className="font-black">
            {r.c.y > 0 && <span className="text-amber-600 mr-2">{r.c.y}A</span>}
            {r.c.r > 0 && <span className="text-red-600">{r.c.r}V</span>}
          </span>,
        ])}
      />
    );
  }

  return null;
}

function BreakdownTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="border border-surface-border rounded-2xl overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-neutral-50 text-[10px] uppercase font-black text-text-muted tracking-widest">
          <tr>
            {head.map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-dotted divide-surface-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-neutral-50/50">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 font-medium">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-3 text-center border border-surface-border/60">
      <p className={`text-xl font-black ${accent} leading-none`}>{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mt-1">{label}</p>
    </div>
  );
}

function EmptyBreakdown({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed border-surface-border rounded-2xl p-6 text-center text-[12px] text-text-muted italic">
      {text}
    </div>
  );
}

function DocumentReviewView({ players, clubs, setPlayers }: { players: Player[], clubs: Club[], setPlayers: React.Dispatch<React.SetStateAction<Player[]>> }) {
  const pendingPlayers = players.filter(p => p.documentStatus === 'PENDING');

  const handleUpdateStatus = (id: string, status: Player['documentStatus']) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, documentStatus: status } : p));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-xl font-bold tracking-tight">Análise de Elegibilidade</h2>
            <p className="text-[10px] font-black uppercase text-text-muted">Aprovação de Contratos e Documentos</p>
         </div>
         <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase">{pendingPlayers.length} Pendências</span>
         </div>
      </div>

      <p className="text-[11px] text-text-muted max-w-2xl">
        No Supabase, use o bucket <code className="bg-neutral-100 px-1 rounded text-[10px]">documents</code> (criar no painel) e a tabela <code className="bg-neutral-100 px-1 rounded text-[10px]">documents</code> /{' '}
        <code className="bg-neutral-100 px-1 rounded text-[10px]">regulation_versions</code> para versões e prazos — metadados versionados no Postgres e arquivos no Storage.
      </p>

      <div className="card-utility p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-[10px] font-black uppercase text-text-muted border-b border-surface-border">
            <tr>
              <th className="px-6 py-4">Atleta</th>
              <th className="px-6 py-4">Clube</th>
              <th className="px-6 py-4">Idade</th>
              <th className="px-6 py-4">Documento</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dotted divide-surface-border">
            {pendingPlayers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-text-muted italic text-[11px]">Nenhum documento aguardando revisão.</td>
              </tr>
            )}
            {pendingPlayers.map(p => {
              const birthDate = new Date(p.birthDate);
              const age = new Date().getFullYear() - birthDate.getFullYear();
              return (
                <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.photoUrl} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-bold text-primary">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-text-muted uppercase">{clubs.find(c => c.id === p.clubId)?.shortName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-text-muted">{age} anos</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase text-accent hover:underline">
                       <ExternalLink size={12} /> Ver Contrato
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase border border-red-100 hover:bg-red-100"
                       >
                         Reprovar
                       </button>
                       <button 
                        onClick={() => handleUpdateStatus(p.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[9px] font-black uppercase border border-green-200 hover:bg-green-100"
                       >
                         Aprovar
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PublicPortalView({ clubs, matches, players, standings, championship }: { clubs: Club[], matches: Match[], players: Player[], standings: Standing[], championship: Championship }) {
  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'scorers' | 'clubs' | 'awards'>('standings');

  // Calculate Top Scorers
  const topScorers = players
    .filter(p => p.stats && p.stats.goals > 0)
    .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Public Header - BRANDED */}
      <div className="bg-neutral-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy size={20} className="text-white" />
               </div>
               <div>
                  <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">VARZEA NEWS <span className="text-accent">Portal</span></h1>
                  <p className="text-[10px] md:text-sm font-bold text-white/50 uppercase tracking-[0.3em] mt-1">A Voz da Comunidade • {championship.name}</p>
               </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
               {['standings', 'matches', 'scorers', 'clubs', 'awards'].map((tab) => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-white text-primary shadow-xl scale-105' : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                 >
                   {tab === 'standings' ? 'Tabela' : tab === 'matches' ? 'Resultados' : tab === 'scorers' ? 'Artilharia' : tab === 'awards' ? 'Hall da Fama' : 'Equipes'}
                 </button>
               ))}
            </div>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'standings' && (
          <motion.div key="standings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
             <div className="flex items-center gap-3 mb-2 px-4">
                <TrendingUp size={20} className="text-accent" />
                <h2 className="text-xl font-black text-primary uppercase">Classificação Geral</h2>
             </div>
             
             <div className="bg-white border border-surface-border rounded-[2rem] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-surface-border">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted">Pos.</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted">Equipe</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-text-muted text-center">P</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-text-muted text-center">J</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-text-muted text-center">V</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-text-muted text-center">E</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-text-muted text-center">D</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase text-text-muted text-center">SG</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted text-center">Últimos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {standings.map((s, idx) => {
                        const club = clubs.find(c => c.id === s.teamId);
                        const zone = zoneForPosition(championship.rules, idx + 1);
                        // Fallback ao destaque antigo quando não há zonas configuradas.
                        const fallbackClass = idx < 4 ? 'bg-green-500 text-white' : idx >= standings.length - 2 ? 'bg-red-500 text-white' : 'bg-neutral-100 text-text-muted';
                        return (
                          <tr key={s.teamId} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-5">
                               <span
                                 className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black ${zone ? 'text-white' : fallbackClass}`}
                                 style={zone ? { backgroundColor: zone.color } : undefined}
                                 title={zone?.label}
                               >
                                  {idx + 1}
                               </span>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-3">
                                  <img src={club?.logoUrl} className="w-8 h-8 rounded-lg shadow-sm border border-surface-border p-1 bg-white" />
                                  <span className="font-bold text-sm text-primary">{club?.name}</span>
                               </div>
                            </td>
                            <td className="px-4 py-5 text-center font-black text-primary">{s.points}</td>
                            <td className="px-4 py-5 text-center font-bold text-text-muted text-sm">{s.played}</td>
                            <td className="px-4 py-5 text-center font-bold text-text-muted text-sm">{s.wins}</td>
                            <td className="px-4 py-5 text-center font-bold text-text-muted text-sm">{s.draws}</td>
                            <td className="px-4 py-5 text-center font-bold text-text-muted text-sm">{s.losses}</td>
                            <td className="px-4 py-5 text-center font-bold text-text-muted text-sm">{s.goalsFor - s.goalsAgainst}</td>
                            <td className="px-6 py-5">
                               <div className="flex justify-center gap-1.5 font-black">
                                  {Array.from({ length: 3 }).map((_, i) => {
                                    const res = s.form[i];
                                    if (!res) return (
                                      <div key={i} className="w-5 h-5 flex items-center justify-center rounded-md text-[9px] font-black bg-neutral-100 text-neutral-400">
                                        —
                                      </div>
                                    );
                                    return (
                                      <div key={i} className={`w-5 h-5 flex items-center justify-center rounded-md text-[9px] text-white ${
                                        res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-yellow-400' : 'bg-red-500'
                                      }`}>
                                        {res === 'W' ? 'V' : res === 'D' ? 'E' : 'D'}
                                      </div>
                                    );
                                  })}
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {championship.rules.qualification?.enabled && (championship.rules.qualification.zones?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-x-5 gap-y-2 px-6 py-4 border-t border-surface-border bg-neutral-50/50">
                    {championship.rules.qualification.zones.map(z => (
                      <span key={z.id} className="flex items-center gap-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: z.color }} />
                        {z.label} ({z.from}º{z.to > z.from ? `–${z.to}º` : ''})
                      </span>
                    ))}
                  </div>
                )}
             </div>
          </motion.div>
        )}

        {activeTab === 'matches' && (
          <motion.div key="matches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
             <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                   <Calendar size={20} className="text-accent" />
                   <h2 className="text-xl font-black text-primary uppercase">Próximos Confrontos</h2>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.map(m => {
                  const home = clubs.find(c => c.id === m.homeTeamId);
                  const away = clubs.find(c => c.id === m.awayTeamId);
                  return (
                    <div key={m.id} className="bg-white border border-surface-border rounded-3xl p-8 relative group hover:border-accent/30 transition-all shadow-lg overflow-hidden text-center">
                       {m.status === 'LIVE' && (
                         <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black animate-pulse">
                            <Activity size={10} /> AO VIVO
                         </div>
                       )}
                       <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                             <img src={home?.logoUrl} className="w-16 h-16 mx-auto mb-3 shadow-md rounded-2xl p-2 bg-white border border-surface-border" />
                             <p className="text-xs font-black uppercase tracking-tight text-primary leading-none h-8 flex items-center justify-center">{home?.name}</p>
                          </div>
                          
                          <div className="w-24 text-center">
                             {m.status === 'FINISHED' ? (
                               <div className="text-3xl font-black text-primary mb-1 flex justify-center gap-2">
                                  <span>{m.score?.home}</span>
                                  <span className="opacity-20">-</span>
                                  <span>{m.score?.away}</span>
                               </div>
                             ) : (
                               <div className="text-sm font-black text-white bg-primary px-3 py-2 rounded-xl mb-1 shadow-lg">
                                  {m.time}
                               </div>
                             )}
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{m.date.split('-').reverse().slice(0, 2).join('/')}</p>
                          </div>

                          <div className="flex-1 text-center">
                             <img src={away?.logoUrl} className="w-16 h-16 mx-auto mb-3 shadow-md rounded-2xl p-2 bg-white border border-surface-border" />
                             <p className="text-xs font-black uppercase tracking-tight text-primary leading-none h-8 flex items-center justify-center">{away?.name}</p>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </motion.div>
        )}

        {activeTab === 'scorers' && (
          <motion.div key="scorers" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
             <div className="flex items-center gap-3 mb-2 px-4">
                <Flame size={20} className="text-accent" />
                <h2 className="text-xl font-black text-primary uppercase">Chuteira de Ouro</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {topScorers[0] && (
                  <div className="relative aspect-[4/3] bg-primary rounded-[3rem] overflow-hidden group shadow-2xl">
                     <img src={topScorers[0].photoUrl} className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:scale-105 transition-transform duration-1000" />
                     <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
                     <div className="absolute bottom-0 left-0 p-10 w-full text-white">
                        <div className="flex items-center gap-4 mb-4">
                           <span className="bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">1º LUGAR</span>
                           <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                              <Award size={20} className="text-accent" />
                           </div>
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-2">{topScorers[0].name}</h3>
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2">
                              <img src={clubs.find(c => c.id === topScorers[0].clubId)?.logoUrl} className="w-6 h-6 rounded border border-white/20" />
                              <span className="text-xs font-bold text-white/70">{clubs.find(c => c.id === topScorers[0].clubId)?.name}</span>
                           </div>
                           <div className="w-[1px] h-4 bg-white/20" />
                           <p className="text-3xl font-black text-accent">{topScorers[0].stats?.goals} <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Gols</span></p>
                        </div>
                     </div>
                  </div>
                )}

                <div className="space-y-4">
                   {topScorers.slice(1).map((p, idx) => (
                     <div key={p.id} className="bg-white border border-surface-border rounded-3xl p-6 flex items-center justify-between shadow-sm hover:translate-x-1 transition-all">
                        <div className="flex items-center gap-4">
                           <span className="text-lg font-black text-text-muted">{idx + 2}º</span>
                           <img src={p.photoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm grayscale hover:grayscale-0 transition-all" />
                           <div>
                              <p className="text-[15px] font-black text-primary leading-tight uppercase">{p.name}</p>
                              <p className="text-[11px] font-bold text-text-muted mt-0.5">{clubs.find(c => c.id === p.clubId)?.name}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-accent">{p.stats?.goals}</p>
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-tight">Gols</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'awards' && (
          <motion.div key="awards" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Award Cards (Public Version) */}
              <div className="card-utility bg-primary text-white border-none shadow-2xl relative overflow-hidden group p-8 rounded-3xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-700">
                  <Trophy size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">Artilheiro (Pichichi)</p>
                  {players.sort((a,b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))[0] ? (
                    <>
                      <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">
                        {players.sort((a,b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))[0].name}
                      </h4>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-accent leading-none">
                          {players.sort((a,b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))[0].stats?.goals || 0}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-white/40 mb-1">Gols Marcados</span>
                      </div>
                    </>
                  ) : <p className="text-xs italic opacity-50">Dados insuficientes</p>}
                </div>
              </div>

              <div className="card-utility bg-white shadow-xl relative overflow-hidden group p-8 border-surface-border rounded-3xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 -rotate-12 group-hover:scale-[2] transition-transform duration-700 text-primary">
                  <Shield size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-6">Melhor Goleiro (Luva de Ouro)</p>
                  {players.filter(p => p.position === 'Gol').sort((a,b) => (a.stats?.goalsConceded || 0) - (b.stats?.goalsConceded || 0))[0] ? (
                    <>
                      <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic text-primary">
                        {players.filter(p => p.position === 'Gol').sort((a,b) => (a.stats?.goalsConceded || 0) - (b.stats?.goalsConceded || 0))[0].name}
                      </h4>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-primary leading-none">
                          {players.filter(p => p.position === 'Gol').sort((a,b) => (a.stats?.goalsConceded || 0) - (b.stats?.goalsConceded || 0))[0].stats?.goalsConceded || 0}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-text-muted mb-1">Gols Sofridos</span>
                      </div>
                    </>
                  ) : <p className="text-xs italic opacity-50">Dados insuficientes</p>}
                </div>
              </div>

              <div className="card-utility bg-neutral-900 text-white border-none shadow-2xl relative overflow-hidden group p-8 rounded-3xl">
               <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-45 group-hover:scale-[2] transition-transform duration-700">
                  <Zap size={80} className="text-accent" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">MVP da Competição</p>
                  {players.sort((a,b) => (b.stats?.mvpCount || 0) - (a.stats?.mvpCount || 0))[0] ? (
                    <>
                      <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic text-accent">
                        {players.sort((a,b) => (b.stats?.mvpCount || 0) - (a.stats?.mvpCount || 0))[0].name}
                      </h4>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white leading-none">
                          {players.sort((a,b) => (b.stats?.mvpCount || 0) - (a.stats?.mvpCount || 0))[0].stats?.mvpCount || 0}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-white/40 mb-1">MVP Awards</span>
                      </div>
                    </>
                  ) : <p className="text-xs italic opacity-50">Dados insuficientes</p>}
                </div>
              </div>

              <div className="card-utility bg-white border border-surface-border shadow-xl relative overflow-hidden group p-8 rounded-3xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 group-hover:scale-[2] transition-transform duration-700 text-green-500">
                  <Heart size={80} />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-6">Fair Play (Equipe)</p>
                  {standings.sort((a,b) => {
                    const cardsA = clubs.find(c => c.id === a.teamId)?.stats?.disciplinePoints || 999;
                    const cardsB = clubs.find(c => c.id === b.teamId)?.stats?.disciplinePoints || 999;
                    return cardsA - cardsB;
                  })[0] ? (
                    <>
                      <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic text-primary">
                        {clubs.find(c => c.id === standings.sort((a,b) => {
                          const cardsA = clubs.find(c => c.id === a.teamId)?.stats?.disciplinePoints || 999;
                          const cardsB = clubs.find(c => c.id === b.teamId)?.stats?.disciplinePoints || 999;
                          return cardsA - cardsB;
                        })[0].teamId)?.name}
                      </h4>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-green-500 leading-none">
                          {clubs.find(c => c.id === standings.sort((a,b) => {
                            const cardsA = clubs.find(c => c.id === a.teamId)?.stats?.disciplinePoints || 999;
                            const cardsB = clubs.find(c => c.id === b.teamId)?.stats?.disciplinePoints || 999;
                            return cardsA - cardsB;
                          })[0].teamId)?.stats?.disciplinePoints || 0}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-text-muted mb-1">Pts Disciplina</span>
                      </div>
                    </>
                  ) : <p className="text-xs italic opacity-50">Dados insuficientes</p>}
                </div>
              </div>
            </div>

            {/* Hall of Fame List Card */}
            <div className="card-utility bg-white border-surface-border shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
               <div className="p-8 border-b border-surface-border">
                  <h3 className="text-2xl font-black text-primary uppercase leading-tight">Mural da Glória</h3>
                  <p className="text-xs font-bold text-text-muted mt-1 uppercase tracking-widest">Os Melhores da Temporada</p>
               </div>
               <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent pl-1">Top Artilheiros</h4>
                        <div className="space-y-4">
                           {players.sort((a,b) => (b.stats?.goals || 0) - (a.stats?.goals || 0)).slice(0, 5).map((p, i) => (
                             <div key={p.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                   <span className="text-xl font-black text-primary/20 group-hover:text-accent transition-colors">0{i+1}</span>
                                   <div>
                                      <p className="text-sm font-black text-primary uppercase leading-none">{p.name}</p>
                                      <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5">{clubs.find(c => c.id === p.clubId)?.name}</p>
                                   </div>
                                </div>
                                <span className="text-lg font-black text-primary">{p.stats?.goals || 0}</span>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent pl-1">Votos de MVP</h4>
                        <div className="space-y-4">
                           {players.sort((a,b) => (b.stats?.mvpCount || 0) - (a.stats?.mvpCount || 0)).slice(0, 5).map((p, i) => (
                             <div key={p.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                   <span className="text-xl font-black text-primary/20 group-hover:text-accent transition-colors">0{i+1}</span>
                                   <div>
                                      <p className="text-sm font-black text-primary uppercase leading-none">{p.name}</p>
                                      <p className="text-[10px] font-bold text-text-muted uppercase mt-0.5">{clubs.find(c => c.id === p.clubId)?.name}</p>
                                   </div>
                                </div>
                                <span className="text-lg font-black text-primary">{p.stats?.mvpCount || 0}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'clubs' && (
          <motion.div key="clubs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
             <div className="flex items-center gap-3 mb-2 px-4">
                <Users size={20} className="text-accent" />
                <h2 className="text-xl font-black text-primary uppercase">Clubes Filiados</h2>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {clubs.map(club => (
                  <div key={club.id} className="bg-white border border-surface-border rounded-3xl p-8 text-center group hover:border-accent/40 hover:-translate-y-2 transition-all shadow-lg relative overflow-hidden">
                     <img src={club.logoUrl} className="w-24 h-24 mx-auto mb-6 rounded-[2rem] shadow-xl p-3 bg-white border border-surface-border group-hover:scale-110 transition-transform" />
                     <h3 className="text-lg font-black text-primary uppercase tracking-tight mb-2 leading-none">{club.name}</h3>
                     <div className="flex items-center justify-center gap-3 text-[10px] font-black text-accent tracking-[0.2em]">
                        <span>{club.shortName}</span>
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 pt-10 border-t border-surface-border text-center">
         <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">© 2026 Liga Amadora • Várzea News Portal</p>
      </footer>
    </div>
  );
}

function RefereesView({ referees, setReferees, matches, ratings, clubs }: { referees: Referee[], setReferees: React.Dispatch<React.SetStateAction<Referee[]>>, matches: Match[], ratings: RefereeRating[], clubs: Club[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReferee, setSelectedReferee] = useState<Referee | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  if (selectedReferee) {
    return <RefereeDetailView 
      referee={selectedReferee} 
      matches={matches} 
      ratings={ratings} 
      clubs={clubs}
      onBack={() => setSelectedReferee(null)} 
    />;
  }

  if (showCalendar) {
    return <RefereeCalendarView 
      referees={referees} 
      matches={matches} 
      clubs={clubs}
      onBack={() => setShowCalendar(false)} 
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight uppercase">Comissão de Arbitragem</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowCalendar(true)} className="btn-outline flex items-center gap-2">
            <Calendar size={14} /> Calendário Geral
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">Novo Árbitro</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referees.map(ref => (
          <div key={ref.id} onClick={() => setSelectedReferee(ref)} className="card-utility group cursor-pointer hover:border-accent/40 transition-all flex flex-col justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <img src={ref.photoUrl} className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-surface-border p-1" />
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${ref.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-surface-border ${
                    ref.level === 'ELITE' ? 'bg-amber-50 text-amber-700' : ref.level === 'OURO' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-text-muted'
                  }`}>
                    {ref.level}
                  </span>
                  <div className="flex items-center gap-1 text-accent">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[11px] font-bold">{ref.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <h4 className="font-bold text-[16px] text-primary">{ref.name}</h4>
                <p className="text-[11px] text-text-muted font-medium">{ref.matchesOfficiated} partidas apitadas</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
              <div className="flex -space-x-2">
                {/* Visual indicator of recent assignments could go here */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-neutral-100 border border-white flex items-center justify-center text-[8px] font-bold text-text-muted">
                    {i}
                  </div>
                ))}
              </div>
              <button className="text-[11px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Ver Histórico <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RefereeDetailView({ referee, matches, ratings, clubs, onBack }: { referee: Referee, matches: Match[], ratings: RefereeRating[], clubs: Club[], onBack: () => void }) {
  const refMatches = matches.filter(m => m.refereeId === referee.id);
  const refRatings = ratings.filter(r => r.refereeId === referee.id);

  // Score geral ponderado (recência) — 0 quando não há avaliações
  const computedAvg = computeRefereeGeneralScore(referee.id, matches, ratings);
  const displayAvg = computedAvg > 0 ? computedAvg : referee.averageRating;
  const medal = classifyRating(displayAvg);
  const reliability = computeReliabilityScore(referee.id, matches, ratings);

  // Últimas avaliações (mais recentes primeiro)
  const recentRatings = [...refRatings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Jogos com contestação (qualquer lado contestou)
  const contestedMatches = refMatches.filter(m =>
    m.validations?.home.status === 'CONTESTED' ||
    m.validations?.away.status === 'CONTESTED' ||
    m.errorConfirmed
  );

  const medalIconColor = medal === 'OURO' ? 'text-amber-500' : medal === 'PRATA' ? 'text-neutral-400' : 'text-orange-500';
  const reliabilityColor = reliability >= 80 ? 'text-green-600' : reliability >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <img src={referee.photoUrl} className="w-14 h-14 rounded-2xl border-2 border-accent/20 p-1" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-primary uppercase">{referee.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                referee.level === 'ELITE' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-800 text-white'
              }`}>
                Nível {referee.level}
              </span>
            </div>
            <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">Inscrito na Comissão Regional • {referee.status === 'AVAILABLE' ? 'Disponível' : 'Em Recesso'}</p>
          </div>
        </div>
      </div>

      {/* ── Histórico do Árbitro: Resumo ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-utility flex items-start gap-4">
          <div className="p-3 bg-accent/10 rounded-lg text-accent"><Star size={20} fill="currentColor" /></div>
          <div>
            <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">Score Geral</p>
            <p className="font-black text-[24px] text-primary leading-none">{displayAvg.toFixed(2)}</p>
            <p className="text-[10px] text-text-muted mt-0.5">ponderado por recência</p>
          </div>
        </div>
        <div className="card-utility flex items-start gap-4">
          <div className={`p-3 bg-neutral-50 rounded-lg ${medalIconColor}`}><Award size={20} /></div>
          <div>
            <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">Medalha Atual</p>
            <span className={`text-[12px] font-black px-2 py-1 rounded border uppercase tracking-tight ${classificationStyle(medal)}`}>
              {medal}
            </span>
            <p className="text-[10px] text-text-muted mt-1">
              {medal === 'OURO' ? '4.3 a 5.0' : medal === 'PRATA' ? '3.0 a 4.2' : '1.0 a 2.9'}
            </p>
          </div>
        </div>
        <div className="card-utility flex items-start gap-4">
          <div className={`p-3 rounded-lg bg-neutral-50 ${reliabilityColor}`}><TrendingUp size={20} /></div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">Confiabilidade</p>
            <p className={`font-black text-[24px] leading-none ${reliabilityColor}`}>{reliability}<span className="text-[14px] text-text-muted">/100</span></p>
            <div className="mt-1.5 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${reliability >= 80 ? 'bg-green-500' : reliability >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${reliability}%` }}
              />
            </div>
          </div>
        </div>
        <div className="card-utility flex items-start gap-4">
          <div className={`p-3 rounded-lg ${contestedMatches.length > 0 ? 'bg-red-50 text-red-600' : 'bg-neutral-50 text-text-muted'}`}><ShieldAlert size={20} /></div>
          <div>
            <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">Contestações</p>
            <p className="font-black text-[24px] text-primary leading-none">{contestedMatches.length}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{refMatches.filter(m => m.errorConfirmed).length} erro(s) confirmado(s)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Últimas Avaliações */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted pl-1">Últimas Avaliações</h3>
              <span className="text-[10px] font-bold text-text-muted">Mostrando {recentRatings.length} de {refRatings.length}</span>
            </div>

            {recentRatings.length === 0 ? (
              <div className="card-utility text-center py-10 text-text-muted text-[12px] font-medium italic">
                Nenhuma avaliação registrada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {recentRatings.map(r => {
                  const club = clubs.find(c => c.id === r.clubId);
                  const matchOfRating = matches.find(m => m.id === r.matchId);
                  const home = matchOfRating ? clubs.find(c => c.id === matchOfRating.homeTeamId) : null;
                  const away = matchOfRating ? clubs.find(c => c.id === matchOfRating.awayTeamId) : null;
                  const cls = classifyRating(r.score);
                  return (
                    <div key={r.id} className="card-utility space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <img src={club?.logoUrl} className="w-8 h-8 rounded-lg border border-surface-border bg-white p-0.5" alt="" />
                          <div>
                            <p className="text-[12px] font-bold text-primary leading-tight">{club?.name ?? '—'}</p>
                            {matchOfRating && (
                              <p className="text-[10px] text-text-muted font-medium">
                                {home?.shortName} {matchOfRating.score?.home ?? '-'} x {matchOfRating.score?.away ?? '-'} {away?.shortName} · {matchOfRating.date}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${classificationStyle(cls)}`}>{cls}</span>
                          <div className="flex items-center gap-1 text-accent">
                            <Star size={12} fill="currentColor" />
                            <span className="text-[12px] font-black">{r.score.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {r.detail ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-dotted border-surface-border">
                          {RATING_CRITERIA.map(c => (
                            <div key={c.key} className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-1.5">
                              <span className="text-[10px] font-bold text-text-muted">{c.label}</span>
                              <span className="text-[11px] font-black text-primary">{r.detail![c.key]}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        r.comment && (
                          <p className="text-[12px] text-text-muted italic border-t border-dotted border-surface-border pt-2">"{r.comment}"</p>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Jogos com Contestação */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted pl-1">Jogos com Contestação</h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${contestedMatches.length > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-neutral-50 text-text-muted border border-surface-border'}`}>
                {contestedMatches.length}
              </span>
            </div>

            {contestedMatches.length === 0 ? (
              <div className="card-utility text-center py-10 text-text-muted text-[12px] font-medium italic flex flex-col items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Nenhuma contestação registrada para este árbitro.
              </div>
            ) : (
              <div className="space-y-3">
                {contestedMatches.map(m => {
                  const home = clubs.find(c => c.id === m.homeTeamId);
                  const away = clubs.find(c => c.id === m.awayTeamId);
                  const sides: ('home' | 'away')[] = ['home', 'away'];
                  const matchRatings = ratings.filter(r => r.matchId === m.id);
                  const rawAvg = matchRatings.length > 0
                    ? matchRatings.reduce((s, r) => s + r.score, 0) / matchRatings.length
                    : null;
                  const penalty = matchPenalty(m);
                  const finalScore = matchScore(m, ratings);
                  return (
                    <div key={m.id} className="card-utility space-y-3 border-l-4 border-l-red-300">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-bold text-[13px] text-primary">
                            {home?.shortName} {m.score?.home ?? 0} x {m.score?.away ?? 0} {away?.shortName}
                          </p>
                          <p className="text-[10px] text-text-muted font-medium flex items-center gap-1.5 mt-0.5">
                            <Calendar size={10} /> {m.date} {m.time} · {m.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {m.errorConfirmed && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-red-100 text-red-700 border-red-300">
                              Erro Confirmado
                            </span>
                          )}
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                            m.reportStatus === 'IN_REVIEW' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            m.reportStatus === 'VALIDATED' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-neutral-50 text-text-muted border-surface-border'
                          }`}>
                            {m.reportStatus === 'IN_REVIEW' ? 'Em Revisão' :
                             m.reportStatus === 'VALIDATED' ? 'Validada' :
                             m.reportStatus ?? '—'}
                          </span>
                        </div>
                      </div>

                      {finalScore != null && rawAvg != null && (
                        <div className="flex items-center gap-3 text-[11px] bg-neutral-50 rounded-lg px-3 py-2 border border-surface-border/60">
                          <span className="text-text-muted">Média dos clubes: <b className="text-primary">{rawAvg.toFixed(2)}</b></span>
                          {penalty > 0 && (
                            <span className="text-red-600 font-bold">− {penalty.toFixed(1)} {m.errorConfirmed ? '(erro confirmado)' : '(contestação)'}</span>
                          )}
                          <span className="ml-auto text-text-muted">Score final: <b className="text-primary">{finalScore.toFixed(2)}</b></span>
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t border-dotted border-surface-border">
                        {sides.filter(s => m.validations?.[s].status === 'CONTESTED').map(side => {
                          const cv = m.validations![side];
                          const club = side === 'home' ? home : away;
                          return (
                            <div key={side} className="flex items-start gap-3 bg-red-50/50 border border-red-100 rounded-lg p-3">
                              <img src={club?.logoUrl} className="w-7 h-7 rounded-md border border-surface-border bg-white p-0.5 shrink-0" alt="" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-[11px] font-bold text-primary">{club?.name}</span>
                                  {cv.contest && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                                      {CONTEST_TYPES.find(t => t.value === cv.contest!.type)?.label}
                                    </span>
                                  )}
                                </div>
                                {cv.contest && (
                                  <>
                                    <p className="text-[11px] text-text-main"><b>Descrição:</b> {cv.contest.description}</p>
                                    <p className="text-[11px] text-text-muted"><b>Sugestão:</b> {cv.contest.suggestion}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Partidas Escaladas */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted pl-1">Partidas Escaladas ({refMatches.length})</h3>
            <div className="space-y-3">
              {refMatches.map(m => (
                <div key={m.id} className="p-5 bg-white border border-surface-border rounded-2xl shadow-sm flex items-center justify-between group hover:border-accent/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-text-muted uppercase leading-none mb-1">{m.date.split('-')[2]}</p>
                      <p className="text-lg font-black text-primary leading-none uppercase">{m.date.split('-')[1]}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-text-main uppercase mb-1">
                        {clubs.find(c => c.id === m.homeTeamId)?.shortName} vs {clubs.find(c => c.id === m.awayTeamId)?.shortName}
                      </h4>
                      <p className="text-[11px] text-text-muted font-medium flex items-center gap-2 uppercase tracking-wider">
                        <Clock size={12} /> {m.time} • <ShieldAlert size={12} /> {m.location}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                    m.status === 'FINISHED' ? 'bg-neutral-50 text-text-muted border-neutral-200' : 'bg-accent/10 text-accent border-accent/20'
                  }`}>
                    {m.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="card-utility p-6 space-y-4">
            <h3 className="text-[12px] font-black uppercase text-text-muted border-b border-surface-border pb-3">Informações de Contato</h3>
            <div className="space-y-3">
               <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">WhatsApp de Escala</p>
                  <p className="text-[13px] font-bold text-primary">{referee.phone || '(11) 90000-0000'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">E-mail Corporativo</p>
                  <p className="text-[13px] font-bold text-primary">{referee.email || 'arbitragem@liga.app'}</p>
               </div>
            </div>
          </div>

          <div className="p-6 bg-white border-2 border-dashed border-surface-border rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
               <Plus size={20} className="text-text-muted" />
            </div>
            <p className="text-[11px] font-black uppercase text-text-muted mb-1">Nova Escala</p>
            <p className="text-[10px] text-text-muted">Clique para alocar este árbitro em um novo jogo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefereeCalendarView({ referees, matches, clubs, onBack }: { referees: Referee[], matches: Match[], clubs: Club[], onBack: () => void }) {
  // Simple calendar grid for a 7-day view
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dates = [12, 13, 14, 15, 16, 17, 18, 19]; // Mocking a specific week

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-primary uppercase">Escalas de Arbitragem</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 border border-surface-border rounded-2xl overflow-hidden shadow-2xl bg-white">
        {dates.map((date, idx) => {
          const dayMatches = matches.filter(m => parseInt(m.date.split('-')[2]) === date);
          return (
            <div key={date} className={`min-h-[400px] border-r border-surface-border last:border-0 ${date === 19 ? 'bg-accent/5' : ''}`}>
              <div className="p-4 border-b border-surface-border bg-neutral-50/50 flex flex-col items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{days[idx % 7]}</span>
                <span className={`text-2xl font-black ${date === 19 ? 'text-accent' : 'text-primary'}`}>{date}</span>
              </div>
              <div className="p-2 space-y-2">
                {dayMatches.map(m => {
                  const ref = referees.find(r => r.id === m.refereeId);
                  return (
                    <div key={m.id} className="p-3 bg-white border border-surface-border rounded-xl shadow-sm space-y-2">
                       <div className="flex flex-col">
                         <span className="text-[9px] font-black text-accent uppercase leading-none mb-1">{m.time}</span>
                         <span className="text-[11px] font-bold text-primary truncate leading-none">
                           {clubs.find(c => c.id === m.homeTeamId)?.shortName} x {clubs.find(c => c.id === m.awayTeamId)?.shortName}
                         </span>
                       </div>
                       
                       <div className="flex items-center gap-2 pt-2 border-t border-dotted border-surface-border">
                         {ref ? (
                           <>
                             <img src={ref.photoUrl} className="w-5 h-5 rounded-full border border-surface-border" />
                             <span className="text-[10px] font-bold text-text-muted truncate">{ref.name.split(' ')[0]}</span>
                           </>
                         ) : (
                           <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1">
                             <ShieldAlert size={10} /> S/ Árbitro
                           </span>
                         )}
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function VenuesView({ venues, setVenues, matches, clubs }: { venues: Venue[], setVenues: React.Dispatch<React.SetStateAction<Venue[]>>, matches: Match[], clubs: Club[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactPhone: '',
    capacity: 0,
    active: true,
    facilities: [] as string[],
    clubId: '' as string | undefined
  });

  const handleOpenModal = (venue?: Venue) => {
    if (venue) {
      setEditingVenue(venue);
      setFormData({
        name: venue.name,
        address: venue.address,
        contactPhone: venue.contactPhone || '',
        capacity: venue.capacity || 0,
        active: venue.active,
        facilities: venue.facilities || [],
        clubId: venue.clubId || ''
      });
    } else {
      setEditingVenue(null);
      setFormData({
        name: '',
        address: '',
        contactPhone: '',
        capacity: 0,
        active: true,
        facilities: [],
        clubId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData, clubId: formData.clubId || undefined };
    if (editingVenue) {
      setVenues(venues.map(v => v.id === editingVenue.id ? { ...v, ...dataToSave } : v));
    } else {
      const newVenue: Venue = {
        id: `v-${Date.now()}`,
        ...dataToSave
      };
      setVenues([...venues, newVenue]);
    }
    setIsModalOpen(false);
  };

  // Conflict detection logic
  const getConflicts = (venueId: string) => {
    const venueMatches = matches.filter(m => m.venueId === venueId && m.status === 'SCHEDULED');
    const conflicts: { m1: Match, m2: Match }[] = [];
    
    for (let i = 0; i < venueMatches.length; i++) {
      for (let j = i + 1; j < venueMatches.length; j++) {
        const m1 = venueMatches[i];
        const m2 = venueMatches[j];
        if (m1.date === m2.date && m1.time === m2.time) {
          conflicts.push({ m1, m2 });
        }
      }
    }
    return conflicts;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase leading-none">Gestão de Campos & Sedes</h2>
          <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest italic">Controle de Agenda e Conflitos de Horário</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-neutral-100 p-1 rounded-xl">
             <button 
               onClick={() => setViewMode('list')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-text-muted hover:text-primary'}`}
             >
               Lista
             </button>
             <button 
               onClick={() => setViewMode('calendar')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-text-muted hover:text-primary'}`}
             >
               Agenda
             </button>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Novo Campo
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(venue => {
            const conflicts = getConflicts(venue.id);
            return (
              <div key={venue.id} className={`card-utility group hover:-translate-y-1 transition-all flex flex-col ${!venue.active ? 'opacity-60 grayscale' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-primary">
                    <MapPin size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${venue.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {venue.active ? 'Ativo' : 'Inativo'}
                    </span>
                    {conflicts.length > 0 && (
                      <span className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                        <AlertTriangle size={10} /> Conflito Detectado
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{venue.name}</h4>
                  <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                    <Map size={12} /> {venue.address}
                  </p>
                  {venue.clubId && (() => {
                    const linkedClub = clubs.find(c => c.id === venue.clubId);
                    return linkedClub ? (
                      <div className="flex items-center gap-2 mb-4">
                        <img src={linkedClub.logoUrl} alt={linkedClub.shortName} className="w-5 h-5 object-contain" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-wide">{linkedClub.name}</span>
                      </div>
                    ) : null;
                  })()}
                  {!venue.clubId && <div className="mb-4" />}

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {venue.facilities?.map(f => (
                      <span key={f} className="text-[10px] font-bold bg-neutral-50 text-text-muted px-2 py-0.5 rounded border border-surface-border">{f}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-border flex justify-between items-center">
                  <div className="flex -space-x-2">
                     {matches.filter(m => m.venueId === venue.id).slice(0, 3).map(m => (
                       <div key={m.id} className="w-7 h-7 rounded-full bg-white border-2 border-neutral-100 flex items-center justify-center overflow-hidden shadow-sm">
                          <img src={clubs.find(c => c.id === m.homeTeamId)?.logoUrl} className="w-full h-full object-contain" />
                       </div>
                     ))}
                     {matches.filter(m => m.venueId === venue.id).length > 3 && (
                       <div className="w-7 h-7 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-text-muted">
                         +{matches.filter(m => m.venueId === venue.id).length - 3}
                       </div>
                     )}
                  </div>
                  <button onClick={() => handleOpenModal(venue)} className="text-[10px] font-black uppercase text-accent hover:underline">Editar Detalhes</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-utility p-0 overflow-hidden bg-white border-surface-border shadow-2xl">
           <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-surface-border">
              {['Dom 12', 'Seg 13', 'Ter 14', 'Qua 15', 'Qui 16', 'Sex 17', 'Sáb 18', 'Dom 19'].map((day, dIdx) => {
                const dayDate = `2026-04-${12 + dIdx}`;
                return (
                  <div key={day} className="min-h-[500px] flex flex-col">
                     <div className="p-4 bg-neutral-50 border-b border-surface-border text-center">
                        <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">{day.split(' ')[0]}</span>
                        <p className="text-xl font-black text-primary">{day.split(' ')[1]}</p>
                     </div>
                     <div className="flex-1 p-2 space-y-3">
                        {venues.map(v => {
                          const vMatches = matches.filter(m => m.venueId === v.id && m.date === dayDate);
                          if (vMatches.length === 0) return null;
                          return (
                            <div key={v.id} className="space-y-2">
                               <p className="text-[9px] font-black uppercase text-text-muted flex items-center gap-1 pl-1">
                                  <Building2 size={8} /> {v.name}
                               </p>
                               {vMatches.map(m => {
                                 const isConflict = vMatches.filter(other => other.id !== m.id && other.time === m.time).length > 0;
                                 return (
                                   <div key={m.id} className={`p-3 rounded-xl border-2 transition-all ${isConflict ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-surface-border shadow-xs'}`}>
                                      <div className="flex justify-between items-start mb-1">
                                         <span className={`text-[10px] font-black ${isConflict ? 'text-red-600' : 'text-accent'}`}>{m.time}</span>
                                         {isConflict && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
                                      </div>
                                      <p className="text-[11px] font-bold text-primary truncate">
                                         {clubs.find(c => c.id === m.homeTeamId)?.shortName} x {clubs.find(c => c.id === m.awayTeamId)?.shortName}
                                      </p>
                                      {isConflict && (
                                        <p className="text-[8px] font-black uppercase text-red-500 mt-1 leading-tight">Choque de Horários!</p>
                                      )}
                                   </div>
                                 );
                               })}
                            </div>
                          );
                        })}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {/* Modal - Basic Implementation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 overflow-hidden">
               <h3 className="text-xl font-black text-primary uppercase mb-6">{editingVenue ? 'Editar Campo' : 'Novo Campo'}</h3>
               <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-1">Nome do Campo</label>
                    <input required className="w-full px-4 py-3 bg-neutral-50 border border-surface-border rounded-2xl focus:outline-none focus:border-accent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-1">Endereço Completo</label>
                    <input required className="w-full px-4 py-3 bg-neutral-50 border border-surface-border rounded-2xl focus:outline-none focus:border-accent" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-1">Time Mandante <span className="normal-case font-normal">(opcional)</span></label>
                    <select className="w-full px-4 py-3 bg-neutral-50 border border-surface-border rounded-2xl focus:outline-none focus:border-accent text-sm" value={formData.clubId || ''} onChange={e => setFormData({...formData, clubId: e.target.value || undefined})}>
                      <option value="">— Nenhum time vinculado —</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-1">Capacidade</label>
                        <input type="number" className="w-full px-4 py-3 bg-neutral-50 border border-surface-border rounded-2xl focus:outline-none focus:border-accent text-sm" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-1">Status</label>
                        <select className="w-full px-4 py-3 bg-neutral-50 border border-surface-border rounded-2xl focus:outline-none focus:border-accent text-sm" value={formData.active ? 'true' : 'false'} onChange={e => setFormData({...formData, active: e.target.value === 'true'})}>
                           <option value="true">Ativo</option>
                           <option value="false">Inativo</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-surface-border rounded-2xl text-[11px] font-black uppercase hover:bg-neutral-50">Cancelar</button>
                    <button type="submit" className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase hover:brightness-110">Salvar Dados</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchReportView({ 
  clubs,
  players,
  matches,
  onSave, 
  onCancel 
}: { 
  clubs: Club[],
  players: Player[],
  matches: Match[],
  onSave: (match: Match, events: MatchEvent[]) => void, 
  onCancel: () => void 
}) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [events, setEvents] = useState<Partial<MatchEvent>[]>([]);

  const eligibleMatches = matches.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE');

  const addEvent = (type: MatchEvent['type'], teamId: string) => {
    setEvents([...events, { 
      type, 
      teamId, 
      minute: 0, 
      id: Math.random().toString(),
      playerId: '' 
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!selectedMatch ? (
        <div className="card-utility">
          <h3 className="font-bold text-[18px] mb-6 tracking-tight">Selecione a Partida para Súmula</h3>
          <div className="space-y-3">
            {eligibleMatches.map(m => (
              <button 
                key={m.id} 
                onClick={() => setSelectedMatch(m)}
                className="w-full text-left p-6 border border-surface-border rounded-xl hover:border-accent hover:shadow-md transition-all flex items-center justify-between group bg-white"
              >
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-black text-text-muted">{m.date}</span>
                    <span className="font-mono font-bold text-lg text-primary">{m.time}</span>
                  </div>
                  <div className="h-10 w-[1px] bg-surface-border" />
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-[15px]">{clubs.find(c => c.id === m.homeTeamId)?.name}</span>
                      <span className="text-[10px] text-text-muted font-bold uppercase">Casa</span>
                    </div>
                    <span className="text-accent italic font-black text-xs">x</span>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-[15px]">{clubs.find(c => c.id === m.awayTeamId)?.name}</span>
                      <span className="text-[10px] text-text-muted font-bold uppercase">Visitante</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${m.lineups ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                       {m.lineups ? 'Escalação OK' : 'Sem Escalação'}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-surface-border group-hover:text-accent" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedMatch(null)} className="text-[11px] font-black uppercase text-text-muted hover:text-red-500 flex items-center gap-2 transition-colors">
              <X size={14} /> Cancelar Súmula
            </button>
            <h3 className="font-bold text-lg text-primary">Súmula Digital: <span className="font-mono">{selectedMatch.id}</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 card-utility flex flex-col items-center justify-center py-10 bg-primary text-white border-none rounded-2xl shadow-xl">
              <p className="text-[11px] uppercase font-black text-white/40 tracking-[0.3em] mb-8">Placar Final</p>
              <div className="flex items-center gap-10">
                <div className="flex flex-col items-center gap-4">
                  <span className="font-bold text-xs text-center uppercase tracking-widest text-white/60">{clubs.find(c => c.id === selectedMatch.homeTeamId)?.shortName}</span>
                  <input 
                    type="number" 
                    value={homeScore} 
                    onChange={e => setHomeScore(parseInt(e.target.value))}
                    className="w-20 h-20 bg-white/10 text-center text-3xl font-black rounded-xl border border-white/20 focus:border-accent focus:bg-white/20 focus:outline-none transition-all"
                  />
                </div>
                <div className="text-3xl font-light text-white/20">X</div>
                <div className="flex flex-col items-center gap-4">
                  <span className="font-bold text-xs text-center uppercase tracking-widest text-white/60">{clubs.find(c => c.id === selectedMatch.awayTeamId)?.shortName}</span>
                  <input 
                    type="number" 
                    value={awayScore} 
                    onChange={e => setAwayScore(parseInt(e.target.value))}
                    className="w-20 h-20 bg-white/10 text-center text-3xl font-black rounded-xl border border-white/20 focus:border-accent focus:bg-white/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="card-utility border-none bg-accent/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg text-accent"><ShieldAlert size={20} /></div>
                <h4 className="font-bold text-sm">Relatório Rápido</h4>
              </div>
              <div className="space-y-2">
                <button onClick={() => addEvent('YELLOW_CARD', selectedMatch.homeTeamId)} className="w-full bg-white p-3 rounded-lg border border-surface-border flex items-center justify-between hover:border-accent transition-all text-[11px] font-bold uppercase">
                  <span>Cartão Amarelo</span>
                  <div className="w-2.5 h-3.5 bg-amber-400 rounded-sm" />
                </button>
                <button onClick={() => addEvent('RED_CARD', selectedMatch.homeTeamId)} className="w-full bg-white p-3 rounded-lg border border-surface-border flex items-center justify-between hover:border-accent transition-all text-[11px] font-bold uppercase">
                  <span>Cartão Vermelho</span>
                  <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
                </button>
                <button onClick={() => addEvent('SUBSTITUTION', selectedMatch.homeTeamId)} className="w-full bg-white p-3 rounded-lg border border-surface-border flex items-center justify-between hover:border-accent transition-all text-[11px] font-bold uppercase">
                  <span>Substituição</span>
                  <RefreshCw size={12} className="text-blue-500" />
                </button>
                <button onClick={() => addEvent('GOAL', selectedMatch.homeTeamId)} className="w-full bg-accent text-white p-3 rounded-lg flex items-center justify-between hover:brightness-110 transition-all text-[11px] font-bold uppercase">
                  <span>GOL</span>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-utility">
               <h4 className="text-[11px] font-black uppercase text-text-muted mb-3 border-b border-surface-border pb-2">Elenco Confirmado ({clubs.find(c => c.id === selectedMatch.homeTeamId)?.shortName})</h4>
               <div className="flex flex-wrap gap-1">
                 {selectedMatch.lineups?.home.starters.map(pid => (
                   <span key={pid} className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded">#{players.find(p => p.id === pid)?.shirtNumber}</span>
                 ))}
                 {selectedMatch.lineups?.home.substitutes.map(pid => (
                   <span key={pid} className="text-[10px] font-bold bg-neutral-100 text-text-muted px-2 py-0.5 rounded">#{players.find(p => p.id === pid)?.shirtNumber}</span>
                 ))}
                 {!selectedMatch.lineups && <span className="text-[10px] italic text-red-500">Escalação não definida</span>}
               </div>
            </div>
            <div className="card-utility">
               <h4 className="text-[11px] font-black uppercase text-text-muted mb-3 border-b border-surface-border pb-2">Elenco Confirmado ({clubs.find(c => c.id === selectedMatch.awayTeamId)?.shortName})</h4>
               <div className="flex flex-wrap gap-1">
                 {selectedMatch.lineups?.away.starters.map(pid => (
                   <span key={pid} className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded">#{players.find(p => p.id === pid)?.shirtNumber}</span>
                 ))}
                 {selectedMatch.lineups?.away.substitutes.map(pid => (
                   <span key={pid} className="text-[10px] font-bold bg-neutral-100 text-text-muted px-2 py-0.5 rounded">#{players.find(p => p.id === pid)?.shirtNumber}</span>
                 ))}
                 {!selectedMatch.lineups && <span className="text-[10px] italic text-red-500">Escalação não definida</span>}
               </div>
            </div>
          </div>

          <div className="card-utility">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[13px] flex items-center gap-2">
                <Camera size={16} /> Galeria de Fotos do Jogo
              </h4>
              <FileUpload 
                onUpload={(url) => {
                  const currentGallery = selectedMatch.gallery || [];
                  setSelectedMatch({ ...selectedMatch, gallery: [...currentGallery, url] });
                }} 
                label="Adicionar Foto" 
                className="text-[10px] bg-accent text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-tight" 
              />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
               {(!selectedMatch.gallery || selectedMatch.gallery.length === 0) && (
                 <div className="w-full py-8 text-center bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                    <p className="text-[11px] font-bold text-text-muted italic">Nenhuma foto enviada para este confronto.</p>
                 </div>
               )}
               {selectedMatch.gallery?.map((url, idx) => (
                 <div key={idx} className="relative shrink-0 w-32 aspect-square rounded-xl overflow-hidden border border-surface-border group shadow-sm hover:shadow-md transition-all">
                    <img src={url} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setSelectedMatch({ ...selectedMatch, gallery: selectedMatch.gallery?.filter((_, i) => i !== idx) })}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                 </div>
               ))}
            </div>
          </div>

          <div className="card-utility">
            <h4 className="font-bold text-[13px] mb-4 flex items-center gap-2">
              <FileText size={16} /> Histórico de Lances
            </h4>
            <div className="space-y-2">
              {events.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center opacity-30">
                  <FileText size={32} strokeWidth={1} className="mb-2" />
                  <p className="text-[12px] font-medium italic">Nenhum evento registrado ainda.</p>
                </div>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-surface-border/50 group/event">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-1 w-16">
                        <label className="text-[8px] font-black text-text-muted uppercase">Minuto</label>
                        <input 
                          type="number" 
                          min="0"
                          max="120"
                          value={ev.minute}
                          onChange={(e) => {
                            const newMinute = parseInt(e.target.value) || 0;
                            setEvents(events.map(event => event.id === ev.id ? { ...event, minute: newMinute } : event));
                          }}
                          className="bg-white border border-surface-border rounded-md px-2 py-1 text-[12px] font-mono font-bold focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[8px] font-black text-text-muted uppercase">Evento</label>
                        <span className={`text-[9px] font-black px-2 py-1 rounded tracking-widest uppercase border inline-block ${
                          ev.type === 'GOAL' ? 'bg-green-50 text-green-700 border-green-200' : 
                          ev.type === 'SUBSTITUTION' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          ev.type?.includes('CARD') ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                          'bg-neutral-100 border-neutral-200'
                        }`}>
                          {ev.type?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[8px] font-black text-text-muted uppercase">Atleta(s)</label>
                        <div className="flex items-center gap-2">
                          <select 
                            className="bg-transparent text-[12px] font-bold focus:outline-none cursor-pointer border-b border-surface-border hover:border-accent"
                            value={ev.playerId}
                            onChange={(e) => {
                              setEvents(events.map(event => event.id === ev.id ? { ...event, playerId: e.target.value } : event));
                            }}
                          >
                            <option value="">Selecione o Atleta</option>
                            {(() => {
                              const teamLineup = ev.teamId === selectedMatch.homeTeamId ? selectedMatch.lineups?.home : selectedMatch.lineups?.away;
                              const availablePlayers = teamLineup 
                                ? players.filter(p => [...teamLineup.starters, ...teamLineup.substitutes].includes(p.id))
                                : players.filter(p => p.clubId === ev.teamId);
                              
                              return availablePlayers.map(p => (
                                <option key={p.id} value={p.id}>#{p.shirtNumber} {p.name}</option>
                              ));
                            })()}
                          </select>

                          {ev.type === 'SUBSTITUTION' && (
                            <>
                              <ArrowRight size={10} className="text-text-muted" />
                              <select 
                                className="bg-transparent text-[12px] font-bold focus:outline-none cursor-pointer border-b border-surface-border hover:border-accent"
                                value={ev.playerInId || ''}
                                onChange={(e) => {
                                  setEvents(events.map(event => event.id === ev.id ? { ...event, playerInId: e.target.value } : event));
                                }}
                              >
                                <option value="">Atleta que Entra</option>
                                {(() => {
                                  const teamLineup = ev.teamId === selectedMatch.homeTeamId ? selectedMatch.lineups?.home : selectedMatch.lineups?.away;
                                  const availablePlayers = teamLineup 
                                    ? players.filter(p => teamLineup.substitutes.includes(p.id))
                                    : players.filter(p => p.clubId === ev.teamId);
                                  
                                  return availablePlayers.map(p => (
                                    <option key={p.id} value={p.id}>#{p.shirtNumber} {p.name}</option>
                                  ));
                                })()}
                              </select>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setEvents(events.filter(e => e.id !== ev.id))} className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover/event:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setSelectedMatch(null)} className="btn-outline">Voltar</button>
            <button 
              className="btn-primary" 
              onClick={() => onSave({ 
                ...selectedMatch, 
                score: { home: homeScore, away: awayScore },
                reportStatus: 'PENDING'
              }, events as MatchEvent[])}
              disabled={!selectedMatch.lineups}
            >
              Publicar Súmula Oficial
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Helpers de avaliação de árbitro ────────────────────────────────────────
// Pesos por critério (somam 100). Definem o score ponderado de uma avaliação.
const RATING_WEIGHTS: Record<keyof RefereeRatingDetail, number> = {
  punctuality:   10,
  control:       25,
  rules:         20,
  impartiality:  25,
  communication: 10,
  reportFilling: 10,
};

const RATING_CRITERIA: { key: keyof RefereeRatingDetail; label: string }[] = [
  { key: 'punctuality',   label: 'Pontualidade' },
  { key: 'control',       label: 'Controle da partida' },
  { key: 'rules',         label: 'Aplicação das regras' },
  { key: 'impartiality',  label: 'Imparcialidade' },
  { key: 'communication', label: 'Comunicação' },
  { key: 'reportFilling', label: 'Preenchimento da súmula' },
];

// Score ponderado de uma avaliação individual (escala 1–5).
function averageRatingDetail(d: RefereeRatingDetail): number {
  const sum =
    d.punctuality   * RATING_WEIGHTS.punctuality   +
    d.control       * RATING_WEIGHTS.control       +
    d.rules         * RATING_WEIGHTS.rules         +
    d.impartiality  * RATING_WEIGHTS.impartiality  +
    d.communication * RATING_WEIGHTS.communication +
    d.reportFilling * RATING_WEIGHTS.reportFilling;
  return Number((sum / 100).toFixed(2));
}

// Penalidade aplicada ao score do jogo (na escala 1–5).
// Erro confirmado prevalece sobre contestação simples.
function matchPenalty(m: Match): number {
  if (m.errorConfirmed) return 0.5;
  if (m.validations?.home.status === 'CONTESTED' || m.validations?.away.status === 'CONTESTED') return 0.3;
  return 0;
}

// Score do jogo = média das avaliações dos clubes − penalidade. Limitado a [1, 5].
function matchScore(m: Match, ratings: RefereeRating[]): number | null {
  const matchRatings = ratings.filter(r => r.matchId === m.id);
  if (matchRatings.length === 0) return null;
  const avg = matchRatings.reduce((s, r) => s + r.score, 0) / matchRatings.length;
  return Math.max(1, Number((avg - matchPenalty(m)).toFixed(2)));
}

// Score geral do árbitro com peso linear maior para jogos recentes.
// Mais antigo recebe peso 1; mais recente recebe peso N.
function computeRefereeGeneralScore(refereeId: string, matches: Match[], ratings: RefereeRating[]): number {
  const refMatches = matches
    .filter(m => m.refereeId === refereeId && m.status === 'FINISHED')
    .sort((a, b) => `${a.date}T${a.time || '00:00'}`.localeCompare(`${b.date}T${b.time || '00:00'}`));
  const scored: { score: number; weight: number }[] = [];
  refMatches.forEach((m, idx) => {
    const s = matchScore(m, ratings);
    if (s != null) scored.push({ score: s, weight: idx + 1 });
  });
  if (scored.length === 0) return 0;
  const total  = scored.reduce((acc, x) => acc + x.score * x.weight, 0);
  const totalW = scored.reduce((acc, x) => acc + x.weight, 0);
  return Number((total / totalW).toFixed(2));
}

// Confiabilidade (0–100): 40% média geral + 30% % sem contestação + 30% % avaliações completas.
function computeReliabilityScore(refereeId: string, matches: Match[], ratings: RefereeRating[]): number {
  const refMatches = matches.filter(m => m.refereeId === refereeId && m.status === 'FINISHED');
  const refRatings = ratings.filter(r => r.refereeId === refereeId);
  if (refMatches.length === 0 && refRatings.length === 0) return 0;

  const general  = computeRefereeGeneralScore(refereeId, matches, ratings);
  const avgNorm  = general > 0 ? Math.max(0, Math.min(100, ((general - 1) / 4) * 100)) : 0;

  const noContestPct = refMatches.length > 0
    ? (refMatches.filter(m =>
        m.validations?.home.status !== 'CONTESTED' &&
        m.validations?.away.status !== 'CONTESTED'
      ).length / refMatches.length) * 100
    : 100;

  const completePct = refRatings.length > 0
    ? (refRatings.filter(r => !!r.detail).length / refRatings.length) * 100
    : 0;

  return Math.round(avgNorm * 0.4 + noContestPct * 0.3 + completePct * 0.3);
}

function classifyRating(score: number): RefereeClassification {
  if (score >= 4.3) return 'OURO';
  if (score >= 3)   return 'PRATA';
  return 'BRONZE';
}

function classificationStyle(c: RefereeClassification): string {
  if (c === 'OURO')   return 'bg-amber-100 text-amber-800 border-amber-200';
  if (c === 'PRATA')  return 'bg-neutral-200 text-neutral-700 border-neutral-300';
  return 'bg-orange-100 text-orange-700 border-orange-200';
}

const CONTEST_TYPES: { value: ContestType; label: string }[] = [
  { value: 'GOL',           label: 'Gol' },
  { value: 'CARTAO',        label: 'Cartão' },
  { value: 'SUBSTITUICAO',  label: 'Substituição' },
  { value: 'PLACAR',        label: 'Placar' },
  { value: 'OUTRO',         label: 'Outro' },
];

function deadlineInfo(publishedAt?: string): { remainingMs: number; expired: boolean; label: string } {
  if (!publishedAt) return { remainingMs: 0, expired: false, label: 'Sem prazo definido' };
  const deadline = new Date(publishedAt).getTime() + 48 * 60 * 60 * 1000;
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) return { remainingMs: 0, expired: true, label: 'Prazo expirado' };
  const h = Math.floor(remainingMs / (60 * 60 * 1000));
  const m = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  return { remainingMs, expired: false, label: `${h}h ${m}m restantes` };
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`p-1 rounded transition-all ${value >= n ? 'text-accent' : 'text-neutral-300 hover:text-neutral-400'}`}
        >
          <Star size={20} fill={value >= n ? 'currentColor' : 'none'} />
        </button>
      ))}
      <span className="ml-2 text-[11px] font-bold text-text-muted w-6">{value > 0 ? value : '—'}</span>
    </div>
  );
}

function ValidationCenterView({
  matches,
  clubs,
  referees,
  ratings,
  onSubmitValidation,
  onOrganizerResolve,
}: {
  matches: Match[];
  clubs: Club[];
  referees: Referee[];
  ratings: RefereeRating[];
  onSubmitValidation: (matchId: string, side: 'home' | 'away', decision: 'ACCEPT' | 'CONTEST', detail: RefereeRatingDetail, contest?: ContestRecord) => void;
  onOrganizerResolve: (matchId: string, action: 'VALIDATE' | 'REOPEN' | 'CONFIRM_ERROR') => void;
}) {
  type ModalCtx = { matchId: string; side: 'home' | 'away' } | null;
  const [modalCtx, setModalCtx] = useState<ModalCtx>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [detail, setDetail] = useState<RefereeRatingDetail>({
    punctuality: 0, control: 0, rules: 0, impartiality: 0, communication: 0, reportFilling: 0,
  });
  const [decision, setDecision] = useState<'ACCEPT' | 'CONTEST' | null>(null);
  const [contestType, setContestType] = useState<ContestType>('GOL');
  const [contestDescription, setContestDescription] = useState('');
  const [contestSuggestion, setContestSuggestion] = useState('');
  const [, forceTick] = useState(0);

  // Atualiza countdown a cada minuto
  useEffect(() => {
    const interval = setInterval(() => forceTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const pendingMatches = matches.filter(m =>
    m.reportStatus === 'AWAITING_VALIDATION' ||
    m.reportStatus === 'IN_REVIEW' ||
    m.reportStatus === 'VALIDATED'
  );

  const queue = pendingMatches.filter(m => m.reportStatus !== 'VALIDATED');
  const recent = pendingMatches.filter(m => m.reportStatus === 'VALIDATED').slice(0, 5);

  const openModal = (matchId: string, side: 'home' | 'away') => {
    const match = matches.find(m => m.id === matchId);
    const clubId = match ? (side === 'home' ? match.homeTeamId : match.awayTeamId) : null;
    const existing = clubId ? ratings.find(r => r.matchId === matchId && r.clubId === clubId) : undefined;
    setModalCtx({ matchId, side });
    if (existing?.detail) {
      // Anti-duplicidade: já avaliado — pula etapa 1 e reaproveita a nota
      setDetail(existing.detail);
      setStep(2);
    } else {
      setDetail({ punctuality: 0, control: 0, rules: 0, impartiality: 0, communication: 0, reportFilling: 0 });
      setStep(1);
    }
    setDecision(null);
    setContestType('GOL');
    setContestDescription('');
    setContestSuggestion('');
  };

  const resetModal = () => {
    setModalCtx(null);
    setStep(1);
    setDetail({ punctuality: 0, control: 0, rules: 0, impartiality: 0, communication: 0, reportFilling: 0 });
    setDecision(null);
    setContestType('GOL');
    setContestDescription('');
    setContestSuggestion('');
  };

  const ratingComplete = RATING_CRITERIA.every(c => detail[c.key] >= 1);

  const submit = () => {
    if (!modalCtx || !decision || !ratingComplete) return;
    if (decision === 'CONTEST' && (!contestDescription.trim() || !contestSuggestion.trim())) return;
    const contest: ContestRecord | undefined = decision === 'CONTEST'
      ? { type: contestType, description: contestDescription.trim(), suggestion: contestSuggestion.trim() }
      : undefined;
    onSubmitValidation(modalCtx.matchId, modalCtx.side, decision, detail, contest);
    resetModal();
  };

  const sideLabel = (m: Match, side: 'home' | 'away') => {
    const club = clubs.find(c => c.id === (side === 'home' ? m.homeTeamId : m.awayTeamId));
    return club?.name ?? side;
  };

  const statusBadge = (s?: string) => {
    switch (s) {
      case 'AWAITING_VALIDATION':
        return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-tighter">Aguardando Validação</span>;
      case 'IN_REVIEW':
        return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-orange-50 text-orange-700 border-orange-200 uppercase tracking-tighter">Em Revisão</span>;
      case 'VALIDATED':
        return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200 uppercase tracking-tighter">Validada</span>;
      default:
        return null;
    }
  };

  const clubStatusPill = (cv?: ClubValidationState, expired = false) => {
    const s = cv?.status ?? 'PENDING';
    if (s === 'PENDING' && expired) return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 uppercase">Expirado</span>;
    if (s === 'PENDING')   return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 uppercase">Pendente</span>;
    if (s === 'ACCEPTED')  return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 uppercase">Aceitou</span>;
    return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 uppercase">Contestou</span>;
  };

  const currentMatch = modalCtx ? matches.find(m => m.id === modalCtx.matchId) : null;
  const currentReferee = currentMatch?.refereeId ? referees.find(r => r.id === currentMatch.refereeId) : null;
  const currentClub = currentMatch && modalCtx
    ? clubs.find(c => c.id === (modalCtx.side === 'home' ? currentMatch.homeTeamId : currentMatch.awayTeamId))
    : null;
  const currentExistingRating = currentMatch && currentClub
    ? ratings.find(r => r.matchId === currentMatch.id && r.clubId === currentClub.id)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Central de Validação Pós-Jogo</h2>
          <p className="text-[10px] font-black uppercase text-text-muted">
            Avaliação obrigatória do árbitro + aceite ou contestação em até 48h
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-amber-600 leading-none">{queue.filter(m => m.reportStatus === 'AWAITING_VALIDATION').length}</p>
            <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Aguardando</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-600 leading-none">{queue.filter(m => m.reportStatus === 'IN_REVIEW').length}</p>
            <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Em Revisão</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-600 leading-none">{recent.length}</p>
            <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Validadas</p>
          </div>
        </div>
      </div>

      {queue.length === 0 && (
        <div className="card-utility flex flex-col items-center justify-center py-12 text-text-muted">
          <CheckCircle size={32} className="mb-3 text-green-500" />
          <p className="text-[13px] font-bold">Nenhuma súmula pendente de validação no momento.</p>
        </div>
      )}

      {queue.map(m => {
        const home = clubs.find(c => c.id === m.homeTeamId);
        const away = clubs.find(c => c.id === m.awayTeamId);
        const ref  = referees.find(r => r.id === m.refereeId);
        const dl = deadlineInfo(m.reportPublishedAt);
        const validations = m.validations ?? { home: { status: 'PENDING' }, away: { status: 'PENDING' } };

        return (
          <div key={m.id} className="card-utility space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img src={home?.logoUrl} alt="" className="w-9 h-9 rounded-lg border border-surface-border" />
                  <span className="font-bold text-[14px]">{home?.shortName}</span>
                </div>
                <div className="font-mono text-lg font-black bg-neutral-100 px-3 py-1 rounded">{m.score?.home ?? 0} - {m.score?.away ?? 0}</div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[14px]">{away?.shortName}</span>
                  <img src={away?.logoUrl} alt="" className="w-9 h-9 rounded-lg border border-surface-border" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(m.reportStatus)}
                {dl.expired && m.reportStatus !== 'VALIDATED' && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200 uppercase tracking-tighter flex items-center gap-1">
                    <AlertTriangle size={10} /> Expirado
                  </span>
                )}
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${dl.expired ? 'text-red-600' : 'text-text-muted'}`}>
                  <Clock size={12} /> {dl.label}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <Calendar size={12} /> {m.date} {m.time}
              <span className="w-1 h-1 rounded-full bg-surface-border" />
              <Users size={12} /> Árbitro: <span className="font-bold text-text-main">{ref?.name ?? '—'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['home', 'away'] as const).map(side => {
                const cv = validations[side];
                const club = side === 'home' ? home : away;
                return (
                  <div key={side} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-surface-border/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={club?.logoUrl} alt="" className="w-8 h-8 rounded-lg border border-surface-border shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold truncate">{sideLabel(m, side)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {clubStatusPill(cv, dl.expired)}
                          {cv.contest && (
                            <span className="text-[9px] font-bold text-red-700 truncate max-w-[140px]" title={cv.contest.description}>
                              {CONTEST_TYPES.find(t => t.value === cv.contest!.type)?.label}: {cv.contest.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {cv.status === 'PENDING' && m.reportStatus !== 'VALIDATED' && (
                      <button
                        onClick={() => openModal(m.id, side)}
                        className="px-3 py-1.5 bg-accent text-white text-[10px] font-black uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5 shrink-0"
                      >
                        <Star size={12} /> Avaliar e Decidir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {(m.reportStatus === 'IN_REVIEW' || (m.reportStatus === 'AWAITING_VALIDATION' && dl.expired)) && (
              <div className="border-t border-dashed border-surface-border pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-2 text-[11px] text-text-muted">
                  <ShieldAlert size={14} className={`${dl.expired && m.reportStatus === 'AWAITING_VALIDATION' ? 'text-red-500' : 'text-orange-500'} shrink-0 mt-0.5`} />
                  <span>
                    {m.reportStatus === 'IN_REVIEW'
                      ? 'Há contestação. Cabe ao organizador decidir entre validar a súmula como está ou reabrir o ciclo de validação.'
                      : 'Prazo de 48h expirado sem decisão de todos os clubes. Ação manual do organizador liberada para validar a súmula ou reabrir o ciclo.'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onOrganizerResolve(m.id, 'REOPEN')}
                    className="px-3 py-1.5 bg-neutral-100 text-text-main text-[10px] font-black uppercase rounded-lg hover:bg-neutral-200 flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} /> Reabrir
                  </button>
                  {m.reportStatus === 'IN_REVIEW' && (
                    <button
                      onClick={() => onOrganizerResolve(m.id, 'CONFIRM_ERROR')}
                      className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5"
                      title="Validar a súmula confirmando o erro do árbitro (penalidade −0.5 no score)"
                    >
                      <ShieldAlert size={12} /> Confirmar Erro
                    </button>
                  )}
                  <button
                    onClick={() => onOrganizerResolve(m.id, 'VALIDATE')}
                    className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5"
                  >
                    <Check size={12} /> Validar Decisão
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {recent.length > 0 && (
        <div className="card-utility">
          <h3 className="font-bold text-[13px] mb-3 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" /> Validadas Recentemente
          </h3>
          <div className="divide-y divide-dotted divide-surface-border">
            {recent.map(m => {
              const home = clubs.find(c => c.id === m.homeTeamId);
              const away = clubs.find(c => c.id === m.awayTeamId);
              const matchRatings = ratings.filter(r => r.matchId === m.id);
              const avg = matchRatings.length > 0 ? matchRatings.reduce((s, r) => s + r.score, 0) / matchRatings.length : 0;
              const cls = avg > 0 ? classifyRating(avg) : null;
              return (
                <div key={m.id} className="py-2 flex items-center justify-between text-[12px]">
                  <span><b>{home?.shortName}</b> {m.score?.home}-{m.score?.away} <b>{away?.shortName}</b> — {m.date}</span>
                  {cls && (
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${classificationStyle(cls)}`}>
                      Árbitro {cls} ({avg.toFixed(1)})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalCtx && currentMatch && currentClub && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-surface-border">
            <div className="p-6 border-b border-surface-border bg-neutral-50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-primary uppercase text-sm tracking-tight">
                  {step === 1 ? '1. Avaliação do Árbitro' : '2. Aceitar ou Contestar'}
                </h3>
                <p className="text-[10px] text-text-muted font-bold">
                  Decidindo como <b>{currentClub.name}</b> · Árbitro: {currentReferee?.name ?? '—'}
                </p>
              </div>
              <button onClick={resetModal} className="text-text-muted hover:text-red-500"><X size={20} /></button>
            </div>

            {step === 1 && (
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-[11px] text-text-muted">
                  Avalie de 1 a 5 cada critério. A média define a classificação do árbitro
                  (<b className="text-orange-600">Bronze 1–2.9</b> · <b className="text-neutral-600">Prata 3–4.2</b> · <b className="text-amber-600">Ouro 4.3–5</b>).
                  Esta etapa é obrigatória antes de aceitar ou contestar.
                </p>
                {RATING_CRITERIA.map(c => (
                  <div key={c.key} className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-b-0">
                    <span className="text-[12px] font-bold">{c.label}</span>
                    <StarPicker value={detail[c.key]} onChange={v => setDetail(d => ({ ...d, [c.key]: v }))} />
                  </div>
                ))}
                {ratingComplete && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-text-muted bg-neutral-50 p-3 rounded-lg">
                    Média: <b className="text-primary">{averageRatingDetail(detail).toFixed(2)}</b>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${classificationStyle(classifyRating(averageRatingDetail(detail)))}`}>
                      {classifyRating(averageRatingDetail(detail))}
                    </span>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={resetModal} className="flex-1 btn-outline">Cancelar</button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!ratingComplete}
                    className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {currentExistingRating && (
                  <div className="flex items-start gap-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Você já avaliou este árbitro nesta partida (média <b>{currentExistingRating.score.toFixed(2)}</b>
                      {currentExistingRating.detail && <> · <b>{classifyRating(currentExistingRating.score)}</b></>}).
                      A avaliação não pode ser refeita — defina apenas a decisão abaixo.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDecision('ACCEPT')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${decision === 'ACCEPT' ? 'border-green-500 bg-green-50' : 'border-surface-border hover:border-green-200'}`}
                  >
                    <Check size={20} className="text-green-600" />
                    <span className="text-[12px] font-black uppercase">Aceitar Súmula</span>
                  </button>
                  <button
                    onClick={() => setDecision('CONTEST')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${decision === 'CONTEST' ? 'border-red-500 bg-red-50' : 'border-surface-border hover:border-red-200'}`}
                  >
                    <ShieldAlert size={20} className="text-red-600" />
                    <span className="text-[12px] font-black uppercase">Contestar Súmula</span>
                  </button>
                </div>

                {decision === 'CONTEST' && (
                  <div className="space-y-3 border-t border-surface-border pt-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Tipo</label>
                      <select
                        value={contestType}
                        onChange={e => setContestType(e.target.value as ContestType)}
                        className="w-full bg-neutral-50 border border-surface-border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-accent mt-1"
                      >
                        {CONTEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Descrição</label>
                      <textarea
                        rows={3}
                        value={contestDescription}
                        onChange={e => setContestDescription(e.target.value)}
                        placeholder="O que aconteceu? (ex: gol marcado em posição irregular aos 32min)"
                        className="w-full bg-neutral-50 border border-surface-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-accent resize-none mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Sugestão de correção</label>
                      <textarea
                        rows={2}
                        value={contestSuggestion}
                        onChange={e => setContestSuggestion(e.target.value)}
                        placeholder="Como deveria ficar? (ex: anular o gol e manter placar 2-2)"
                        className="w-full bg-neutral-50 border border-surface-border rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-accent resize-none mt-1"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => currentExistingRating ? resetModal() : setStep(1)}
                    className="flex-1 btn-outline"
                  >
                    {currentExistingRating ? 'Cancelar' : 'Voltar'}
                  </button>
                  <button
                    onClick={submit}
                    disabled={!decision || (decision === 'CONTEST' && (!contestDescription.trim() || !contestSuggestion.trim()))}
                    className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Enviar Decisão
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function GeminiInsights({
  standings,
  supabase,
}: {
  standings: Standing[];
  supabase: SupabaseClient | null;
}) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase.functions.invoke<{ suggestion?: string }>(
          'gemini-suggest',
          { body: { kind: 'standings_insight', standings } }
        );
        if (!error && data?.suggestion) {
          setInsight(data.suggestion);
          setLoading(false);
          return;
        }
      }
      setInsight(
        'Tendência detectada: O equilíbrio técnico do Grupo A sugere que a próxima rodada será decisiva. O Vila Nova deve focar em jogadas laterais para superar a defesa sólida do Real Madrid.'
      );
    } catch {
      setInsight('Não foi possível consultar a IA agora. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white border border-surface-border rounded-[12px] shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-accent/10 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="p-4 bg-accent/10 rounded-2xl text-accent">
          <Trophy size={32} />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-primary mb-1">IA Inteligente: Scout & Insights</h3>
          <p className="text-text-muted text-[13px] mb-4 font-medium italic">
            Processando dados históricos para gerar recomendações táticas.
          </p>
          
          {insight ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-accent/5 rounded-xl border border-accent/20 text-[13px] font-bold text-accent leading-relaxed">
              "{insight}"
            </motion.div>
          ) : (
            <button 
              onClick={generateInsights}
              disabled={loading}
              className="px-6 py-2.5 bg-accent text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Consultando IA...' : 'Analisar Campeonato'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const {
    supabase,
    isSupabaseConfigured: hasSupabase,
    session,
    authReady,
    useRemote,
    remoteLoading,
    remoteError,
    publicSlug,
    userForUi,
    loadRemote,
    signIn,
    signUp,
    signOut,
    mustChangePassword,
    changePassword,
    role,
    clubId,
    // ── Multi-championship bundle state (cada dono carrega só os seus) ──
    allBundles,
    setAllBundles,
    activeChampId,
    setActiveChampId,
    orgByChamp,
    organizationId,
  } = useAppData();

  const activeBundle = allBundles.find(b => b.championship.id === activeChampId) ?? allBundles[0];
  const championship  = activeBundle.championship;
  const clubs         = activeBundle.clubs;
  const players       = activeBundle.players;
  const matches       = activeBundle.matches;
  const venues        = activeBundle.venues;
  const referees      = activeBundle.referees;
  const ratings       = activeBundle.ratings;
  const matchEvents   = activeBundle.matchEvents;
  const notifications = activeBundle.notifications;
  const mediaAssets   = activeBundle.mediaAssets;

  const _patchBundle = (id: string, patch: Partial<ChampionshipBundle>) =>
    setAllBundles(prev => prev.map(b => b.championship.id === id ? { ...b, ...patch } : b));

  // Entidades de organização (clubes/atletas/campos/árbitros) são compartilhadas
  // entre os campeonatos da MESMA org — patch propaga a todos para manter consistência
  // (evita que salvar um torneio apague dados de outro da mesma org).
  const _activeOrg = orgByChamp[activeChampId] ?? organizationId ?? null;
  const _sameOrg = (id: string) => (orgByChamp[id] ?? organizationId ?? null) === _activeOrg;
  const _patchOrgBundles = (patch: Partial<ChampionshipBundle>) =>
    setAllBundles(prev => prev.map(b => _sameOrg(b.championship.id) ? { ...b, ...patch } : b));

  const setChampionship: React.Dispatch<React.SetStateAction<Championship>> = (a) =>
    _patchBundle(activeChampId, { championship: typeof a === 'function' ? a(championship) : a });
  const setClubs: React.Dispatch<React.SetStateAction<Club[]>> = (a) =>
    _patchOrgBundles({ clubs: typeof a === 'function' ? a(clubs) : a });
  const setPlayers: React.Dispatch<React.SetStateAction<Player[]>> = (a) =>
    _patchOrgBundles({ players: typeof a === 'function' ? a(players) : a });
  const setMatches: React.Dispatch<React.SetStateAction<Match[]>> = (a) =>
    _patchBundle(activeChampId, { matches: typeof a === 'function' ? a(matches) : a });
  const setVenues: React.Dispatch<React.SetStateAction<Venue[]>> = (a) =>
    _patchOrgBundles({ venues: typeof a === 'function' ? a(venues) : a });
  const setReferees: React.Dispatch<React.SetStateAction<Referee[]>> = (a) =>
    _patchOrgBundles({ referees: typeof a === 'function' ? a(referees) : a });
  const setRatings: React.Dispatch<React.SetStateAction<RefereeRating[]>> = (a) =>
    _patchBundle(activeChampId, { ratings: typeof a === 'function' ? a(ratings) : a });
  const setMatchEvents: React.Dispatch<React.SetStateAction<MatchEvent[]>> = (a) =>
    _patchBundle(activeChampId, { matchEvents: typeof a === 'function' ? a(matchEvents) : a });
  const setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> = (a) =>
    _patchBundle(activeChampId, { notifications: typeof a === 'function' ? a(notifications) : a });
  const setMediaAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>> = (a) =>
    _patchBundle(activeChampId, { mediaAssets: typeof a === 'function' ? a(mediaAssets) : a });
  // ─────────────────────────────────────────────────────────────────────────

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Calculate Standings (Mock Implementation)
  const standings = useMemo(() => {
    const table: Record<string, Standing> = {};
    const teamForm: Record<string, ('W' | 'D' | 'L')[]> = {};

    clubs.forEach(club => {
      table[club.id] = { teamId: club.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] };
      teamForm[club.id] = [];
    });

    // Sort matches by date and time to ensure form is chronological
    const sortedMatches = [...matches]
      .filter(m => m.status === 'FINISHED' || m.status === 'LIVE')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });

    sortedMatches.forEach(m => {
      const home = table[m.homeTeamId];
      const away = table[m.awayTeamId];
      if (!home || !away) return;

      const homeScore = m.score?.home ?? 0;
      const awayScore = m.score?.away ?? 0;

      home.played++;
      away.played++;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        home.wins++;
        home.points += championship.rules.pointsPerWin;
        teamForm[m.homeTeamId].push('W');
        
        away.losses++;
        teamForm[m.awayTeamId].push('L');
      } else if (homeScore < awayScore) {
        away.wins++;
        away.points += championship.rules.pointsPerWin;
        teamForm[m.awayTeamId].push('W');

        home.losses++;
        teamForm[m.homeTeamId].push('L');
      } else {
        home.draws++;
        away.draws++;
        home.points += championship.rules.pointsPerDraw;
        away.points += championship.rules.pointsPerDraw;
        teamForm[m.homeTeamId].push('D');
        teamForm[m.awayTeamId].push('D');
      }
    });

    // Attach form to table records (last 3 games)
    Object.keys(table).forEach(teamId => {
      table[teamId].form = teamForm[teamId].slice(-3);
    });

    return Object.values(table).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  }, [matches, championship, clubs]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navigateTo = (view: View) => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSaveLineup = (matchId: string, lineups: Match['lineups']) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, lineups } : m));
    setCurrentView('matches');
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  };

  const handleFinishMatch = (match: Match, events: MatchEvent[], mvpPlayerId?: string) => {
    const finalMinute = match.currentMinute ?? 90;
    const minutesPlayed: { [playerId: string]: number } = {};
    const lineups = match.lineups;
    if (lineups) {
      const subEvents = events.filter(e => e.type === 'SUBSTITUTION');
      (['home', 'away'] as const).forEach(side => {
        const teamId = side === 'home' ? match.homeTeamId : match.awayTeamId;
        lineups[side].starters.forEach(pid => {
          const subOut = subEvents.find(e => e.teamId === teamId && e.playerId === pid);
          minutesPlayed[pid] = subOut ? subOut.minute : finalMinute;
        });
        subEvents.filter(e => e.teamId === teamId && e.playerInId).forEach(subIn => {
          const pid = subIn.playerInId!;
          const laterOut = subEvents.find(e => e.teamId === teamId && e.playerId === pid && e.minute > subIn.minute);
          minutesPlayed[pid] = laterOut ? laterOut.minute - subIn.minute : finalMinute - subIn.minute;
        });
      });
    }
    const publishedAt = new Date().toISOString();
    setMatches(prev => prev.map(m => m.id === match.id ? {
      ...match,
      status: 'FINISHED',
      reportStatus: 'AWAITING_VALIDATION',
      reportPublishedAt: publishedAt,
      validations: {
        home: { status: 'PENDING' },
        away: { status: 'PENDING' }
      },
      events,
      mvpPlayerId,
      minutesPlayed,
    } : m));
    if (mvpPlayerId) {
      setPlayers(prev => prev.map(p => p.id === mvpPlayerId ? {
        ...p,
        stats: { ...p.stats, matches: p.stats?.matches ?? 0, goals: p.stats?.goals ?? 0, assists: p.stats?.assists ?? 0, yellowCards: p.stats?.yellowCards ?? 0, redCards: p.stats?.redCards ?? 0, rating: p.stats?.rating ?? 0, mvpCount: (p.stats?.mvpCount ?? 0) + 1 },
      } : p));
    }
    const homeClub = clubs.find(c => c.id === match.homeTeamId);
    const awayClub = clubs.find(c => c.id === match.awayTeamId);
    const validationNotifs: Notification[] = (['home', 'away'] as const).flatMap(side => {
      const club = side === 'home' ? homeClub : awayClub;
      if (!club || !club.email) return [];
      return [{
        id: `not-val-${match.id}-${club.id}-${Date.now()}`,
        type: 'REPORT_VALIDATION_PENDING' as NotificationType,
        clubId: club.id,
        recipientEmail: club.email,
        channel: 'email',
        status: 'QUEUED',
        subject: `Súmula pendente de validação — ${homeClub?.shortName} x ${awayClub?.shortName}`,
        content: `Olá, ${club.name}. A súmula da partida ${homeClub?.shortName} x ${awayClub?.shortName} foi publicada. Avalie o árbitro e aceite ou conteste em até 48h na Central de Validação Pós-Jogo.`,
        matchId: match.id,
      }];
    });
    if (validationNotifs.length > 0) {
      setNotifications(prev => [...validationNotifs, ...prev]);
    }
    setCurrentView('matches');
  };

  const handleApproveReport = (matchId: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, reportStatus: 'APPROVED', contestReason: undefined } : m));
  };

  const handleContestReport = (matchId: string, reason: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, reportStatus: 'CONTESTED', contestReason: reason } : m));
  };

  const handleClubSubmitValidation = (
    matchId: string,
    side: 'home' | 'away',
    decision: 'ACCEPT' | 'CONTEST',
    ratingDetail: RefereeRatingDetail,
    contest?: ContestRecord
  ) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.refereeId) return;
    const clubId = side === 'home' ? match.homeTeamId : match.awayTeamId;

    // Bloqueio anti-duplicidade: um clube só avalia o árbitro uma vez por partida.
    // Se já houver avaliação anterior (ex: organizador reabriu), reaproveita.
    const existing = ratings.find(r => r.matchId === matchId && r.clubId === clubId);
    let ratingIdToUse: string;
    if (existing) {
      ratingIdToUse = existing.id;
    } else {
      const avg = averageRatingDetail(ratingDetail);
      const newRating: RefereeRating = {
        id: `rt-${matchId}-${clubId}-${Date.now()}`,
        matchId,
        refereeId: match.refereeId,
        clubId,
        score: avg,
        detail: ratingDetail,
        createdAt: new Date().toISOString(),
        comment: contest?.description,
      };
      ratingIdToUse = newRating.id;

      const updatedRatings = [...ratings, newRating];
      setRatings(updatedRatings);

      // Atualiza média do árbitro usando o score geral ponderado por recência
      // (média dos clubes por jogo − penalidades, com peso maior para jogos recentes)
      const refAvg = computeRefereeGeneralScore(match.refereeId, matches, updatedRatings);
      setReferees(prev => prev.map(r => r.id === match.refereeId
        ? { ...r, averageRating: refAvg }
        : r));
    }

    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const current = m.validations ?? { home: { status: 'PENDING' }, away: { status: 'PENDING' } };
      const updatedSide: ClubValidationState = {
        status: decision === 'ACCEPT' ? 'ACCEPTED' : 'CONTESTED',
        ratingId: ratingIdToUse,
        decidedAt: new Date().toISOString(),
        contest: decision === 'CONTEST' ? contest : undefined,
      };
      const nextValidations = { ...current, [side]: updatedSide };
      const both = nextValidations.home.status !== 'PENDING' && nextValidations.away.status !== 'PENDING';
      const anyContested = nextValidations.home.status === 'CONTESTED' || nextValidations.away.status === 'CONTESTED';
      let nextStatus = m.reportStatus;
      if (anyContested) nextStatus = 'IN_REVIEW';
      else if (both) nextStatus = 'VALIDATED';
      return { ...m, validations: nextValidations, reportStatus: nextStatus };
    }));
  };

  const handleOrganizerResolve = (matchId: string, action: 'VALIDATE' | 'REOPEN' | 'CONFIRM_ERROR') => {
    const target = matches.find(m => m.id === matchId);
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      if (action === 'VALIDATE')      return { ...m, reportStatus: 'VALIDATED' };
      if (action === 'CONFIRM_ERROR') return { ...m, reportStatus: 'VALIDATED', errorConfirmed: true };
      // Reopen — limpa decisões para que os clubes refaçam
      return {
        ...m,
        reportStatus: 'AWAITING_VALIDATION',
        validations: { home: { status: 'PENDING' }, away: { status: 'PENDING' } },
        reportPublishedAt: new Date().toISOString(),
      };
    }));
    // Recalcula score do árbitro após mudanças nas penalidades
    if (target?.refereeId) {
      const projectedMatches = matches.map(m => {
        if (m.id !== matchId) return m;
        if (action === 'CONFIRM_ERROR') return { ...m, errorConfirmed: true };
        return m;
      });
      const refAvg = computeRefereeGeneralScore(target.refereeId, projectedMatches, ratings);
      setReferees(prev => prev.map(r => r.id === target.refereeId
        ? { ...r, averageRating: refAvg }
        : r));
    }
  };

  // Enquanto a sessão é verificada, evita piscar a UI.
  if (hasSupabase && !authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-text-muted text-sm font-bold uppercase tracking-widest">Carregando…</div>;
  }

  // Porta de entrada pública: com Supabase configurado e sem sessão, mostra a landing/login.
  if (hasSupabase && authReady && !session) {
    return <LandingPage supabase={supabase} onSignIn={signIn} />;
  }

  // Visão do TIME (clube): só o próprio elenco + seus jogos.
  if (role === 'CLUB_ADMIN') {
    return (
      <>
        {mustChangePassword && <ChangePasswordModal forced onChangePassword={changePassword} />}
        <TeamView
          clubId={clubId}
          clubs={clubs}
          players={players}
          matches={matches}
          championship={championship}
          standings={standings}
          supabase={supabase}
          userName={userForUi.name}
          onReload={loadRemote}
          onSignOut={signOut}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex overflow-hidden relative">
      {/* Troca de senha obrigatória (senha temporária do primeiro acesso) */}
      {session && mustChangePassword && (
        <ChangePasswordModal forced onChangePassword={changePassword} />
      )}

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className="w-[220px] bg-primary text-white flex flex-col z-50 fixed lg:relative top-0 left-0 h-screen lg:h-auto shadow-lg"
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-6 h-6 bg-accent rounded-full shadow-lg shadow-accent/20" />
              <div>
                <h1 className="font-extrabold text-lg tracking-tight leading-none">GESTOR FC</h1>
                <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-1">CRM PRO v1.2</p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
              <NavBtn active={currentView === 'dashboard'} icon={<LayoutDashboard size={18} />} label="Painel Geral" onClick={() => navigateTo('dashboard')} />
              <NavBtn active={currentView === 'championships'} icon={<Trophy size={18} />} label="Campeonatos" onClick={() => navigateTo('championships')} />
              <NavBtn active={currentView === 'clubs'} icon={<ShieldAlert size={18} />} label="Clubes & Atletas" onClick={() => navigateTo('clubs')} />
              <NavBtn active={currentView === 'players'} icon={<Users size={18} />} label="Atletas" onClick={() => navigateTo('players')} />
              <NavBtn active={currentView === 'referees'} icon={<Users size={18} />} label="Árbitros" onClick={() => navigateTo('referees')} />
              <NavBtn active={currentView === 'matches'} icon={<Calendar size={18} />} label="Súmulas Digitais" onClick={() => navigateTo('matches')} />
              <NavBtn active={currentView === 'venues'} icon={<MapPin size={18} />} label="Campos & Sedes" onClick={() => navigateTo('venues')} />
              <NavBtn active={currentView === 'eligibility'} icon={<Shield size={18} />} label="Documentos & Elegibilidade" onClick={() => navigateTo('eligibility')} />
              <NavBtn active={currentView === 'financial'} icon={<Wallet size={18} />} label="Financeiro" onClick={() => navigateTo('financial')} />
              <NavBtn active={currentView === 'reports'} icon={<ClipboardList size={18} />} label="Súmula pós-jogo" onClick={() => navigateTo('reports')} />
              <NavBtn active={currentView === 'validation'} icon={<CheckCircle size={18} />} label="Validação Pós-Jogo" onClick={() => navigateTo('validation')} />
              <NavBtn active={currentView === 'analytics'} icon={<BarChart3 size={18} />} label="Relatórios & Analytics" onClick={() => navigateTo('analytics')} />
              <NavBtn active={currentView === 'media'} icon={<ImageIcon size={18} />} label="Mídia & Galeria" onClick={() => navigateTo('media')} />

              <div className="pt-4 mt-4 border-t border-white/10">
                <NavBtn active={currentView === 'public-portal'} icon={<ExternalLink size={18} />} label="Portal Público" onClick={() => navigateTo('public-portal')} />
              </div>
            </nav>

            <div className="p-6 mt-auto space-y-3">
              {hasSupabase && (
                <AuthPanel
                  session={session}
                  authReady={authReady}
                  remoteLoading={remoteLoading}
                  remoteError={remoteError}
                  useRemote={useRemote}
                  onSignIn={signIn}
                  onSignUp={signUp}
                  onSignOut={signOut}
                  onReload={loadRemote}
                />
              )}
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-white/20 overflow-hidden ring-1 ring-white/30">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userForUi.name)}`} alt="avatar" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] font-bold truncate">{userForUi.name}</p>
                  {useRemote && (
                    <p className="text-[9px] text-white/50 truncate">{session?.user?.email}</p>
                  )}
                </div>
                <button type="button" title="Sair" onClick={() => void signOut()} className="p-0 border-0 bg-transparent">
                  <LogOut size={14} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 hover:bg-neutral-50 rounded-lg">
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-lg capitalize">{currentView}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group lg:block hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-neutral-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar (atleta, time, jogo)..." 
                className="pl-10 pr-4 py-2 bg-neutral-100 rounded-full text-sm border-transparent focus:bg-white focus:ring-1 focus:ring-neutral-200 focus:outline-none w-64 transition-all"
              />
            </div>
            <button className="bg-neutral-900 text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors">
              <Plus size={20} />
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && (
                <div className="space-y-12">
                  <GeminiInsights standings={standings} supabase={supabase} />
                  <DashboardView 
                    clubs={clubs} 
                    players={players} 
                    championship={championship} 
                    standings={standings} 
                    matches={matches} 
                    onSwitchView={(v) => {
                      if (v === 'clubs') {
                        setCurrentView('clubs');
                      } else if (v === 'players') {
                        setCurrentView('players');
                      } else {
                        setCurrentView(v);
                      }
                    }}
                  />
                </div>
              )}
              {currentView === 'championships' && (
                <ChampionshipsView
                  allBundles={allBundles}
                  activeChampId={activeChampId}
                  onSelectChampionship={(id) => setActiveChampId(id)}
                  onCreateChampionship={(bundle) => {
                    setAllBundles(prev => [...prev, bundle]);
                    setActiveChampId(bundle.championship.id);
                  }}
                  setChampionship={setChampionship}
                  standings={standings}
                  matches={matches}
                  setMatches={setMatches}
                  supabase={supabase}
                  useRemote={useRemote}
                  publicSlug={publicSlug}
                  onScheduleReload={loadRemote}
                />
              )}
              {currentView === 'clubs' && (
                <ClubsView 
                  clubs={clubs} 
                  setClubs={setClubs} 
                  players={players} 
                  defaultPresidentId={userForUi.id}
                  onSelectClub={(id) => {
                    setSelectedClubId(id);
                    setCurrentView('club-detail');
                  }} 
                />
              )}
              {currentView === 'club-detail' && selectedClubId && (
                <ClubDetailView
                  club={clubs.find(c => c.id === selectedClubId)!}
                  players={players}
                  matches={matches}
                  clubs={clubs}
                  standings={standings}
                  championship={championship}
                  onBack={() => setCurrentView('clubs')}
                  onSelectPlayer={(id) => {
                    setSelectedPlayerId(id);
                    setCurrentView('player-detail');
                  }}
                />
              )}
              {currentView === 'matches' && (
                <MatchesView
                  clubs={clubs}
                  matches={matches}
                  venues={venues}
                  onSwitchToMatchCenter={(id) => {
                    setSelectedMatchId(id);
                    setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'LIVE' } : m));
                    setCurrentView('match-center');
                  }}
                  onApproveReport={handleApproveReport}
                  onContestReport={handleContestReport}
                />
              )}
              {currentView === 'lineup' && selectedMatchId && (
                <LineupSelectionView 
                  match={matches.find(m => m.id === selectedMatchId)!} 
                  clubs={clubs} 
                  players={players} 
                  championship={championship}
                  onSave={handleSaveLineup} 
                  onCancel={() => setCurrentView('matches')} 
                />
              )}
              {currentView === 'match-center' && selectedMatchId && (
                <MatchCenterView 
                  match={matches.find(m => m.id === selectedMatchId)!}
                  clubs={clubs}
                  players={players}
                  onUpdateMatch={handleUpdateMatch}
                  onFinishMatch={handleFinishMatch}
                  onExit={() => setCurrentView('matches')}
                />
              )}
              {currentView === 'players' && (
                <PlayersView 
                  clubs={clubs} 
                  players={players} 
                  setPlayers={setPlayers} 
                  onSelectPlayer={(id) => {
                    setSelectedPlayerId(id);
                    setCurrentView('player-detail');
                  }}
                />
              )}
              {currentView === 'player-detail' && selectedPlayerId && (
                <PlayerDetailView 
                  player={players.find(p => p.id === selectedPlayerId)!}
                  club={clubs.find(c => c.id === players.find(p => p.id === selectedPlayerId)?.clubId)!}
                  onBack={() => setCurrentView('players')}
                />
              )}
              {currentView === 'referees' && <RefereesView referees={referees} setReferees={setReferees} matches={matches} ratings={ratings} clubs={clubs} />}
              {currentView === 'analytics' && (
                <AdvancedAnalyticsView 
                  clubs={clubs}
                  matches={matches}
                  matchEvents={matchEvents}
                  standings={standings}
                  players={players}
                />
              )}
              {currentView === 'media' && (
                <MediaGalleryView 
                  assets={mediaAssets}
                  setAssets={setMediaAssets}
                  clubs={clubs}
                  matches={matches}
                />
              )}
              {currentView === 'venues' && (
                <VenuesView 
                  venues={venues}
                  setVenues={setVenues}
                  matches={matches}
                  clubs={clubs}
                />
              )}
              {currentView === 'public-portal' && (
                <PublicPortalView 
                  clubs={clubs}
                  matches={matches}
                  players={players}
                  standings={standings}
                  championship={championship}
                />
              )}
              {currentView === 'financial' && (
                <FinancialDashboardView
                  supabase={supabase}
                  session={session}
                  clubs={clubs}
                  championshipId={championship.id}
                />
              )}
              {currentView === 'validation' && (
                <ValidationCenterView
                  matches={matches}
                  clubs={clubs}
                  referees={referees}
                  ratings={ratings}
                  onSubmitValidation={handleClubSubmitValidation}
                  onOrganizerResolve={handleOrganizerResolve}
                />
              )}
              {currentView === 'reports' && (
                <MatchReportView
                  clubs={clubs}
                  players={players}
                  matches={matches}
                  onSave={(m, evs) => {
                    setMatches(prev => prev.map(match => match.id === m.id ? { ...match, ...m, status: 'FINISHED' } : match));
                    setMatchEvents(prev => [...prev, ...evs]);
                    setCurrentView('dashboard');
                  }} 
                  onCancel={() => setCurrentView('dashboard')} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;

function NavBtn({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
        active 
          ? 'bg-white/15 text-white' 
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="activeNav" className="ml-auto w-1 h-1 bg-accent rounded-full" />}
    </button>
  );
}

function DashboardView({ clubs, players, championship, standings, matches, onSwitchView }: { 
  clubs: Club[], 
  players: Player[], 
  championship: Championship, 
  standings: Standing[], 
  matches: Match[],
  onSwitchView: (view: View) => void
}) {
  const suspendedCount = players.filter(p => p.status === 'SUSPENDED').length;
  
  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Campeonato Ativo" value={championship.name} subValue={`${championship.season}`} icon={<Trophy size={18} className="text-primary" />} />
        <StatCard label="Partidas Realizadas" value="118 / 240" subValue="Temporada Regular" icon={<Calendar size={18} className="text-primary" />} />
        <StatCard 
          label="Atletas Suspensos" 
          value={suspendedCount.toString()} 
          subValue="Alertas automáticos" 
          icon={<ShieldAlert size={18} className="text-red-500" />} 
          onClick={() => onSwitchView('players')}
        />
        <StatCard label="Pendências Financeiras" value="R$ 1.250" subValue="Taxas de inscrição" icon={<ChevronRight size={18} className="text-text-muted" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Standings Mini */}
        <div className="lg:col-span-2 card-utility p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[14px]">Classificação Geral</h3>
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold uppercase">Temporada Regular</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-neutral-50/50 text-[11px] uppercase font-bold text-text-muted border-b border-surface-border">
                <tr>
                  <th className="px-6 py-3 text-left">Pos</th>
                  <th className="px-6 py-3 text-left">Equipe</th>
                  <th className="px-6 py-3 text-center">P</th>
                  <th className="px-6 py-3 text-center">J</th>
                  <th className="px-6 py-3 text-center">V</th>
                  <th className="px-6 py-3 text-center">SG</th>
                  <th className="px-6 py-3 text-center">Forma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-surface-border">
                {standings.map((s, idx) => {
                  const club = clubs.find(c => c.id === s.teamId);
                  const zone = zoneForPosition(championship.rules, idx + 1);
                  return (
                    <tr key={s.teamId} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-muted">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-1.5 h-4 rounded-sm shrink-0"
                            style={{ backgroundColor: zone ? zone.color : 'transparent' }}
                            title={zone?.label}
                          />
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={club?.logoUrl} className="w-6 h-6 rounded-md shadow-sm border border-surface-border" alt="" />
                          <span className="font-bold text-text-main">{club?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{s.points}</td>
                      <td className="px-6 py-4 text-center text-text-muted">{s.played}</td>
                      <td className="px-6 py-4 text-center text-text-muted">{s.wins}</td>
                      <td className="px-6 py-4 text-center text-text-muted">{s.goalsFor - s.goalsAgainst}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          {Array.from({ length: 3 }).map((_, i) => {
                            const res = s.form[i];
                            if (!res) return (
                              <div key={i} className="w-4 h-4 flex items-center justify-center rounded text-[8px] font-black bg-neutral-100 text-neutral-400">
                                —
                              </div>
                            );
                            return (
                              <div key={i} className={`w-4 h-4 flex items-center justify-center rounded text-[8px] font-black text-white ${
                                res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-yellow-400' : 'bg-red-500'
                              }`}>
                                {res === 'W' ? 'V' : res === 'D' ? 'E' : 'D'}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {championship.rules.qualification?.enabled && (championship.rules.qualification.zones?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-6 py-3 border-t border-surface-border bg-neutral-50/40">
              {championship.rules.qualification.zones.map(z => (
                <span key={z.id} className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: z.color }} />
                  {z.label} ({z.from}º{z.to > z.from ? `–${z.to}º` : ''})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        <div className="space-y-6">
          <div className="card-utility p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center">
              <h3 className="font-bold text-[13px]">Jogos de Hoje</h3>
            </div>
            <div className="divide-y divide-dotted divide-surface-border">
              {matches.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE').slice(0, 3).map(m => (
                <div key={m.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        {m.status === 'LIVE' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">AO VIVO</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{m.time} - {m.location}</span>
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-text-main">{clubs.find(c => c.id === m.homeTeamId)?.shortName} v {clubs.find(c => c.id === m.awayTeamId)?.shortName}</span>
                    </div>
                    <div className="font-mono text-[13px] font-black bg-neutral-100 px-2 py-1 rounded">
                      {m.status === 'LIVE' ? `${m.score?.home ?? 0} - ${m.score?.away ?? 0}` : '0 - 0'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-utility p-0 bg-primary border-none shadow-xl overflow-hidden group">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="font-bold text-[13px] text-white">Alertas de Suspensão</h3>
            </div>
            <div className="p-4 space-y-4">
               {players.filter(p => p.status === 'SUSPENDED').map(p => (
                 <div key={p.id} className="flex flex-col gap-0.5">
                   <span className="text-[13px] font-bold text-red-100">{p.name}</span>
                   <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Suspensão Automática - {clubs.find(c => c.id === p.clubId)?.shortName}</span>
                 </div>
               ))}
            </div>
            <button className="w-full p-4 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest transition-colors">
              Ver Relatório Disciplinar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSnippet({ clubs, id, side }: { clubs: Club[], id: string, side: 'left' | 'right' }) {
  const club = clubs.find(c => c.id === id);
  return (
    <div className={`flex flex-col items-center gap-1 ${side === 'right' ? 'items-end' : 'items-start'}`}>
      <img src={club?.logoUrl} className="w-8 h-8 rounded-lg shadow-sm" alt="" />
      <span className="text-[10px] font-bold truncate max-w-[80px]">{club?.shortName}</span>
    </div>
  );
}

function ActionBtn({ label, icon }: { label: string, icon: React.ReactNode }) {
  return (
    <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors gap-1">
      {icon}
      <span className="text-[10px] font-semibold uppercase">{label}</span>
    </button>
  );
}

function StatCard({ label, value, subValue, icon, onClick }: { label: string, value: string, subValue: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`card-utility flex items-start gap-4 ${onClick ? 'cursor-pointer hover:border-accent/40 active:scale-[0.98] transition-all' : ''}`}
    >
      <div className="p-3 bg-surface-bg rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase font-bold text-text-muted tracking-widest mb-1 leading-none">{label}</p>
        <p className="font-bold text-[20px] tracking-tight text-primary leading-tight">{value}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{subValue}</p>
      </div>
    </div>
  );
}

function MatchesView({
  clubs,
  matches,
  venues,
  onSwitchToMatchCenter,
  onApproveReport,
  onContestReport
}: {
  clubs: Club[],
  matches: Match[],
  venues: Venue[],
  onSwitchToMatchCenter: (id: string) => void,
  onApproveReport: (id: string) => void,
  onContestReport: (id: string, reason: string) => void
}) {
  const [isContestModalOpen, setIsContestModalOpen] = useState(false);
  const [selectedMatchForContest, setSelectedMatchForContest] = useState<string | null>(null);
  const [contestReason, setContestReason] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredMatches = matches.filter(m => {
    const matchesTeam = teamFilter === '' || m.homeTeamId === teamFilter || m.awayTeamId === teamFilter;
    const matchesStatus = statusFilter === '' || m.status === statusFilter;
    return matchesTeam && matchesStatus;
  });

  const handleContestSubmit = () => {
    if (selectedMatchForContest && contestReason.trim()) {
      onContestReport(selectedMatchForContest, contestReason);
      setContestReason('');
      setSelectedMatchForContest(null);
      setIsContestModalOpen(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'PENDING': return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-200 uppercase tracking-tighter">Pendente</span>;
      case 'APPROVED': return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200 uppercase tracking-tighter">Aprovada</span>;
      case 'CONTESTED': return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-red-50 text-red-600 border-red-200 uppercase tracking-tighter">Contestada</span>;
      case 'AWAITING_VALIDATION': return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-tighter">Aguardando Validação</span>;
      case 'IN_REVIEW': return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-orange-50 text-orange-700 border-orange-200 uppercase tracking-tighter">Em Revisão</span>;
      case 'VALIDATED': return <span className="text-[9px] font-black px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200 uppercase tracking-tighter">Validada</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Calendário Varzeano 2026</h2>
          <p className="text-[10px] font-black uppercase text-text-muted">Gestão de Rodadas e Resultados</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <select 
            className="px-3 py-2 bg-neutral-50 border border-surface-border rounded-xl text-xs focus:outline-none focus:border-accent"
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
          >
            <option value="">Equipe (Qualquer)</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.shortName}</option>)}
          </select>
          <select 
            className="px-3 py-2 bg-neutral-50 border border-surface-border rounded-xl text-xs focus:outline-none focus:border-accent"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Status (Todos)</option>
            <option value="SCHEDULED">Agendados</option>
            <option value="LIVE">Ao Vivo</option>
            <option value="FINISHED">Encerrados</option>
          </select>
          <button className="btn-primary flex items-center gap-2 px-6"><Plus size={14} /> Novo Jogo</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {filteredMatches.map(m => (
          <div key={m.id} className="card-utility flex items-center justify-between group hover:border-accent/40 transition-all">
            <div className="flex items-center gap-8 flex-1">
              <div className="w-14 flex flex-col items-center justify-center py-2 bg-surface-bg rounded-lg border border-surface-border group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
                <span className="text-[10px] font-bold uppercase opacity-60 leading-none mb-1">{m.date.split('-')[2]}</span>
                <span className="text-lg font-black leading-none">{m.date.split('-')[1]}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-[15px]">{clubs.find(c => c.id === m.homeTeamId)?.name} v {clubs.find(c => c.id === m.awayTeamId)?.name}</h4>
                  {getStatusBadge(m.reportStatus)}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted font-medium">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {m.time}</span>
                  <div className="w-1 h-1 bg-surface-border rounded-full" />
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {venues.find(v => v.id === m.venueId)?.name || m.location}</span>
                  {m.contestReason && (
                    <>
                      <div className="w-1 h-1 bg-surface-border rounded-full" />
                      <span className="text-red-500 font-bold italic truncate max-w-[200px]">Motivo: {m.contestReason}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {m.status === 'FINISHED' && m.reportStatus === 'PENDING' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => onApproveReport(m.id)}
                    className="px-4 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5"
                  >
                    <Check size={12} /> Aprovar
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedMatchForContest(m.id);
                      setIsContestModalOpen(true);
                    }}
                    className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:brightness-110 flex items-center gap-1.5"
                  >
                    <ShieldAlert size={12} /> Contestar
                  </button>
                </div>
              )}

              {m.status === 'FINISHED' && m.reportStatus === 'CONTESTED' && (
                <button 
                  onClick={() => onSwitchToMatchCenter(m.id)}
                  className="px-4 py-1.5 bg-neutral-900 text-white text-[10px] font-black uppercase rounded-lg hover:bg-neutral-800 flex items-center gap-1.5"
                >
                  <Edit3 size={12} className="text-accent" /> Revisar Súmula
                </button>
              )}

              {m.status === 'SCHEDULED' && (
                <button
                  onClick={() => onSwitchToMatchCenter(m.id)}
                  className="px-3 py-1.5 bg-accent text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Radio size={12} className="animate-pulse" /> Iniciar
                </button>
              )}

              {m.status === 'LIVE' && (
                <button 
                  onClick={() => onSwitchToMatchCenter(m.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg animate-pulse flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> No Ar
                </button>
              )}
              
              {m.status === 'FINISHED' && m.reportStatus === 'PENDING' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedMatchForContest(m.id);
                      setIsContestModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-lg transition-colors border border-red-100"
                  >
                    Contestar
                  </button>
                  <button 
                    onClick={() => onApproveReport(m.id)}
                    className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg transition-colors border border-green-100"
                  >
                    Aprovar
                  </button>
                </div>
              )}

              {m.status === 'FINISHED' && m.reportStatus === 'CONTESTED' && (
                <button 
                  onClick={() => onApproveReport(m.id)}
                  className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-lg transition-colors"
                >
                  Resolver (Aprovar)
                </button>
              )}

              {m.status === 'FINISHED' ? (
                <div className="text-center px-4 py-2 bg-neutral-100 rounded-md font-mono font-black text-lg text-primary min-w-[80px]">
                  {m.score?.home} - {m.score?.away}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded border ${m.status === 'LIVE' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {m.status === 'LIVE' ? 'AO VIVO' : 'Agendado'}
                  </span>
                </div>
              )}
              <ChevronRight size={18} className="text-surface-border group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {isContestModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-border">
            <div className="p-6 border-b border-surface-border bg-neutral-50 flex items-center justify-between">
              <h3 className="font-black text-primary uppercase text-sm tracking-tight">Contestar Súmula</h3>
              <button onClick={() => setIsContestModalOpen(false)} className="text-text-muted hover:text-red-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Motivo da Contestação</label>
                <textarea 
                  rows={4}
                  value={contestReason}
                  onChange={e => setContestReason(e.target.value)}
                  placeholder="Descreva o erro ou divergência na súmula..."
                  className="w-full bg-neutral-50 border border-surface-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-accent resize-none placeholder:opacity-50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsContestModalOpen(false)} className="flex-1 btn-outline">Cancelar</button>
                <button onClick={handleContestSubmit} className="flex-1 btn-primary">Enviar Contestação</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function LineupSelectionView({ match, clubs, players, championship, onSave, onCancel }: { match: Match, clubs: Club[], players: Player[], championship: Championship, onSave: (matchId: string, lineups: Match['lineups']) => void, onCancel: () => void }) {
  const homeClub = clubs.find(c => c.id === match.homeTeamId);
  const awayClub = clubs.find(c => c.id === match.awayTeamId);
  
  const [currentLineups, setCurrentLineups] = useState<NonNullable<Match['lineups']>>(match.lineups || {
    home: { starters: [], substitutes: [] },
    away: { starters: [], substitutes: [] }
  });

  const togglePlayer = (team: 'home' | 'away', type: 'starters' | 'substitutes', playerId: string) => {
    setCurrentLineups(prev => {
      const teamLineup = prev[team];
      
      let newStarters = [...teamLineup.starters];
      let newSubstitutes = [...teamLineup.substitutes];

      if (teamLineup[type].includes(playerId)) {
        if (type === 'starters') newStarters = newStarters.filter(id => id !== playerId);
        else newSubstitutes = newSubstitutes.filter(id => id !== playerId);
      } else {
        if (type === 'starters') {
          newStarters.push(playerId);
          newSubstitutes = newSubstitutes.filter(id => id !== playerId);
        } else {
          newSubstitutes.push(playerId);
          newStarters = newStarters.filter(id => id !== playerId);
        }
      }

      return {
        ...prev,
        [team]: { starters: newStarters, substitutes: newSubstitutes }
      };
    });
  };

  const renderTeamSelection = (team: 'home' | 'away', club?: Club) => {
    const teamPlayers = players.filter(p => p.clubId === (team === 'home' ? match.homeTeamId : match.awayTeamId));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <img src={club?.logoUrl} className="w-8 h-8 rounded border border-surface-border bg-white p-1" />
          <h3 className="font-black text-primary uppercase text-sm tracking-tight">{club?.name}</h3>
        </div>
        
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {teamPlayers.map(p => {
            const isStarter = currentLineups[team].starters.includes(p.id);
            const isSub = currentLineups[team].substitutes.includes(p.id);
            const { eligible, reasons } = isPlayerEligible(p, championship.rules);

            return (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                !eligible ? 'bg-red-50/50 border-red-100' : 'bg-white hover:border-accent/30'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 flex items-center justify-center bg-neutral-100 rounded text-[10px] font-black text-text-muted">#{p.shirtNumber}</span>
                  <div className="truncate">
                    <p className={`text-[13px] font-bold truncate ${!eligible ? 'text-red-900 opacity-60' : 'text-text-main'}`}>{p.name}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase">{p.position}</p>
                  </div>
                  {!eligible && (
                     <div className="group relative">
                        <span className="flex items-center gap-1 bg-red-100 text-red-600 text-[9px] font-black uppercase px-2 py-0.5 rounded italic cursor-help">
                           <ShieldAlert size={10} /> IRREGULAR
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-neutral-900 text-white text-[9px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                           <p className="font-black uppercase mb-1 text-accent">Motivos de Irregularidade:</p>
                           <ul className="space-y-1 list-disc pl-3">
                              {reasons.map((r, i) => <li key={i}>{r}</li>)}
                           </ul>
                        </div>
                     </div>
                  )}
                </div>
                
                {eligible && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => togglePlayer(team, 'starters', p.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                        isStarter ? 'bg-primary text-white' : 'bg-neutral-100 text-text-muted hover:bg-neutral-200'
                      }`}
                    >
                      Titular
                    </button>
                    <button 
                      onClick={() => togglePlayer(team, 'substitutes', p.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                        isSub ? 'bg-accent text-white' : 'bg-neutral-100 text-text-muted hover:bg-neutral-200'
                      }`}
                    >
                      Reserva
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-neutral-900 text-white rounded-2xl flex justify-between items-center mt-4 text-center">
          <div className="flex-1">
            <p className="text-[10px] uppercase font-black text-white/40 mb-1">Titulares</p>
            <p className="text-lg font-black">{currentLineups[team].starters.length}</p>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex-1">
            <p className="text-[10px] uppercase font-black text-white/40 mb-1">Reservas</p>
            <p className="text-lg font-black">{currentLineups[team].substitutes.length}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase leading-none">Escalação Oficial</h2>
            <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">{match.date} • {match.location}</p>
          </div>
        </div>
        <button 
          onClick={() => onSave(match.id, currentLineups)}
          className="btn-primary flex items-center gap-2"
        >
          <CheckCircle size={14} /> Salvar Escalações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {renderTeamSelection('home', homeClub)}
        {renderTeamSelection('away', awayClub)}
      </div>
    </div>
  );
}

function PlayersView({ clubs, players, setPlayers, onSelectPlayer }: { clubs: Club[], players: Player[], setPlayers: React.Dispatch<React.SetStateAction<Player[]>>, onSelectPlayer?: (id: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    rg: '',
    cpf: '',
    fatherName: '',
    motherName: '',
    guardianName: '',
    guardianPhone: '',
    shirtNumber: 1,
    position: 'ATA',
    photoUrl: '',
    clubId: '',
    status: 'ACTIVE' as Player['status']
  });

  const maxGoals = Math.max(...players.map(p => p.stats?.goals || 0));

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === '' || p.clubId === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const handleOpenModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        rg: player.rg || '',
        cpf: player.cpf || '',
        fatherName: player.fatherName || '',
        motherName: player.motherName || '',
        guardianName: player.guardianName || '',
        guardianPhone: player.guardianPhone || '',
        shirtNumber: player.shirtNumber,
        position: player.position,
        photoUrl: player.photoUrl,
        clubId: player.clubId,
        status: player.status
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: '',
        rg: '',
        cpf: '',
        fatherName: '',
        motherName: '',
        guardianName: '',
        guardianPhone: '',
        shirtNumber: 1,
        position: 'ATA',
        photoUrl: '',
        clubId: clubs[0]?.id || '',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlayer) {
      setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, ...formData } : p));
    } else {
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        ...formData
      };
      setPlayers([...players, newPlayer]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este atleta do sistema?')) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-surface-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Gestão de Elenco</h2>
          <p className="text-[10px] font-black uppercase text-text-muted">Filtre por equipe ou artilharia</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Buscar atleta..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-neutral-50 border border-surface-border rounded-xl text-xs w-48 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
            />
          </div>
          <select 
            className="px-3 py-2 bg-neutral-50 border border-surface-border rounded-xl text-xs focus:outline-none focus:border-accent"
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
          >
            <option value="">Todas as Equipes</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.shortName}</option>)}
          </select>
          <button onClick={() => handleOpenModal()} className="btn-primary px-6">Novo Atleta</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlayers.map(p => {
          const isTopScorer = p.stats?.goals === maxGoals && maxGoals > 0;
          return (
            <div key={p.id} onClick={() => onSelectPlayer?.(p.id)} className="card-utility group hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
              {isTopScorer && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ring-1 ring-amber-200">
                  Artilheiro 🥇
                </div>
              )}
              <div className="flex gap-4">
                <div className="relative">
                  <img src={p.photoUrl || `https://ui-avatars.com/api/?name=${p.name}`} className="w-16 h-16 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all border border-surface-border shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                    {p.shirtNumber}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-black text-accent tracking-widest mb-0.5">{p.position}</span>
                  <h4 className="font-bold text-[15px] mb-1">{p.name}</h4>
                  <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    <img src={clubs.find(c => c.id === p.clubId)?.logoUrl} className="w-3.5 h-3.5 rounded-sm" />
                    <span className="text-[11px] font-bold text-text-muted">{clubs.find(c => c.id === p.clubId)?.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex items-center justify-between border-t border-surface-border pt-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  p.status === 'ACTIVE' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {p.status === 'ACTIVE' ? 'Pronto p/ Jogo' : 'Suspenso'}
                </span>
                <div className="flex gap-2">
                   <div className="flex items-center gap-3 mr-4">
                      <div className="text-right">
                         <p className="text-[13px] font-black text-primary leading-none">{p.stats?.goals || 0}</p>
                         <p className="text-[8px] font-black text-text-muted uppercase">Gols</p>
                      </div>
                   </div>
                  <button onClick={(e) => { e.stopPropagation(); handleOpenModal(p); }} className="p-1.5 text-text-muted hover:text-primary transition-colors">
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Jogador */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header fixo */}
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-surface-border flex-shrink-0">
                <h3 className="text-lg font-bold text-primary">{editingPlayer ? 'Editar Atleta' : 'Novo Atleta'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-primary"><X size={20} /></button>
              </div>

              {/* Corpo com scroll */}
              <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-8 py-6 space-y-5">

                {/* Foto */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-surface-border bg-neutral-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {formData.photoUrl
                      ? <img src={formData.photoUrl} className="w-full h-full object-cover" />
                      : <span className="text-[10px] font-bold text-text-muted uppercase text-center leading-tight px-1">Sem foto</span>
                    }
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Foto do Atleta</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-neutral-100 file:text-text-muted hover:file:bg-neutral-200 cursor-pointer"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => setFormData({ ...formData, photoUrl: ev.target?.result as string });
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p className="text-[10px] text-text-muted pl-1">JPG, PNG ou WEBP</p>
                  </div>
                </div>

                {/* Identificação */}
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3 border-b border-surface-border pb-1">Identificação</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Nome Completo</label>
                      <input required className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">RG</label>
                        <input className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" placeholder="00.000.000-0" value={formData.rg} onChange={e => setFormData({ ...formData, rg: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">CPF</label>
                        <input className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filiação */}
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3 border-b border-surface-border pb-1">Filiação</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Nome do Pai</label>
                      <input className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Nome da Mãe</label>
                      <input className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Responsável */}
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3 border-b border-surface-border pb-1">Responsável</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Nome do Responsável</label>
                      <input className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={formData.guardianName} onChange={e => setFormData({ ...formData, guardianName: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Número do Responsável</label>
                      <input type="tel" className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" placeholder="(00) 00000-0000" value={formData.guardianPhone} onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Dados Esportivos */}
                <div>
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3 border-b border-surface-border pb-1">Dados Esportivos</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Nº Camisa</label>
                        <input type="number" required className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={formData.shirtNumber} onChange={e => setFormData({ ...formData, shirtNumber: parseInt(e.target.value) })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Posição</label>
                        <select className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}>
                          <option value="GL">Goleiro (GL)</option>
                          <option value="LAT">Lateral (LAT)</option>
                          <option value="ZAG">Zagueiro (ZAG)</option>
                          <option value="VOL">Volante (VOL)</option>
                          <option value="MEI">Meia (MEI)</option>
                          <option value="ATA">Atacante (ATA)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-text-muted tracking-widest pl-1">Clube / Equipe</label>
                      <select required className="w-full px-4 py-2 bg-neutral-50 border border-surface-border rounded-xl focus:outline-none focus:border-accent text-sm" value={formData.clubId} onChange={e => setFormData({ ...formData, clubId: e.target.value })}>
                        <option value="">Selecione um clube</option>
                        {clubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 pb-2">
                  <button type="submit" className="w-full btn-primary h-12">Salvar Atleta</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
