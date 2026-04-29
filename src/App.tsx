/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  ClipboardList
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
import { FinancialDashboardView } from './features/FinancialDashboardView';
import { Match, Championship, Standing, MatchEvent, Club, Player, Referee, RefereeRating, Lineup, Notification, NotificationType, MediaAsset, Venue } from './types';

// Types for navigation
type View = 'dashboard' | 'championships' | 'clubs' | 'players' | 'matches' | 'reports' | 'financial' | 'club-detail' | 'referees' | 'lineup' | 'player-detail' | 'automation' | 'public-portal' | 'media' | 'analytics' | 'venues' | 'eligibility';

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

function ClubDetailView({ club, players, matches, clubs, onBack, onSelectPlayer }: { club: Club, players: Player[], matches: Match[], clubs: Club[], onBack: () => void, onSelectPlayer?: (id: string) => void }) {
  const clubPlayers = players.filter(p => p.clubId === club.id);
  const clubMatches = matches.filter(m => m.homeTeamId === club.id || m.awayTeamId === club.id);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <div className="relative">
             <img src={club.logoUrl} className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg bg-white p-1" />
             <div className="absolute -bottom-1 -right-1 bg-accent text-white p-1 rounded-lg shadow-lg">
                <Trophy size={14} />
             </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-primary uppercase tracking-tight leading-none">{club.name}</h2>
              <span className="text-[10px] font-black bg-neutral-100 text-text-muted px-2 py-1 rounded border border-surface-border uppercase tracking-widest">Fundado em {club.foundedYear || 'Desconhecido'}</span>
            </div>
            <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">Entidade Filiada • Liga Amadora de Futebol</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Estatísticas FIFA-Style */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm hover:border-accent/30 transition-all flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Target size={20} />
               </div>
               <p className="text-2xl font-black text-primary leading-none mb-1">{club.stats?.totalGoals || 0}</p>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Gols Pró</p>
            </div>
            <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm hover:border-amber/30 transition-all flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                  <Activity size={20} />
               </div>
               <p className="text-2xl font-black text-primary leading-none mb-1">{club.stats?.possessionAvg || 0}%</p>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Posse Média</p>
            </div>
            <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm hover:border-blue/30 transition-all flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp size={20} />
               </div>
               <p className="text-2xl font-black text-primary leading-none mb-1">{club.stats?.cleanSheets || 0}</p>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Jogos Sem Sofrer</p>
            </div>
          </div>

          <div className="card-utility">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                 <Users size={18} className="text-accent" />
                 <h3 className="text-sm font-black uppercase tracking-tight">Elenco Registrado</h3>
               </div>
               <span className="text-[11px] font-bold text-text-muted">{clubPlayers.length} Atletas</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clubPlayers.map(p => (
                <div key={p.id} onClick={() => onSelectPlayer?.(p.id)} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-surface-border/50 hover:border-accent/40 cursor-pointer transition-all group">
                  <img src={p.photoUrl} className="w-10 h-10 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-primary truncate">#{p.shirtNumber} {p.name}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{p.position}</p>
                  </div>
                  {p.stats && (
                    <div className="text-right">
                      <p className="text-[12px] font-black text-accent">{p.stats.rating.toFixed(1)}</p>
                      <p className="text-[8px] font-black text-text-muted uppercase tracking-tighter">Média</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card-utility">
            <div className="flex items-center gap-2 mb-6">
              <History size={18} className="text-accent" />
              <h3 className="text-sm font-black uppercase tracking-tight">Histórico de Conquistas</h3>
            </div>
            {club.titles && club.titles.length > 0 ? (
              <div className="space-y-4">
                {club.titles.map((title, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-yellow-50/30 border border-yellow-200/50 rounded-2xl">
                    <div className="w-10 h-10 bg-yellow-400 text-white rounded-xl flex items-center justify-center shadow-lg">
                       <Award size={20} />
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-primary leading-tight">{title}</p>
                      <p className="text-[11px] font-bold text-yellow-700/70 uppercase tracking-widest mt-0.5">Glória Eterna • Liga Amadora</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-surface-border rounded-3xl">
                 <Trophy size={32} className="mx-auto text-neutral-300 mb-4 opacity-50" />
                 <p className="text-sm font-bold text-text-muted">Ainda em busca da primeira taça oficial.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-utility p-6 space-y-6 bg-white">
            <h3 className="font-black text-[11px] border-b border-surface-border pb-3 uppercase tracking-widest text-text-muted">Ficha Técnica</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert size={16} className="text-accent shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Endereço Sede</p>
                  <p className="text-sm font-medium">{club.address || 'Não cadastrado'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-accent shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Mando de Campo</p>
                  <p className="text-sm font-bold text-primary italic underline decoration-accent/30">{club.homeField || 'Sem campo atrelado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText size={16} className="text-accent shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Contatos Oficiais</p>
                  <p className="text-sm font-medium">{club.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {club.hasPendingFinance && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                 <div className="flex items-center gap-2 text-red-600 mb-2">
                   <ShieldAlert size={14} />
                   <span className="text-[10px] font-black uppercase">Pendência Financeira</span>
                 </div>
                 <p className="text-[11px] text-red-700 font-medium leading-[1.4]">
                   Clube com débitos pendentes. Regularização necessária.
                 </p>
              </div>
            )}
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
        <AwardsView players={players} clubs={clubs} matches={matches} />
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
  championship,
  setChampionship,
  supabase,
  useRemote,
  publicSlug,
  onScheduleReload,
}: {
  championship: Championship;
  setChampionship: React.Dispatch<React.SetStateAction<Championship>>;
  supabase: SupabaseClient | null;
  useRemote: boolean;
  publicSlug: string | null;
  onScheduleReload: () => Promise<void>;
}) {
  const [schedMsg, setSchedMsg] = useState<string | null>(null);

  const runRpc = async (name: string, args: Record<string, unknown>) => {
    if (!supabase || !useRemote) {
      setSchedMsg('Faça login com Supabase para usar o agendador.');
      return;
    }
    setSchedMsg(null);
    const { data, error } = await supabase.rpc(name, args);
    if (error) {
      setSchedMsg(error.message);
      return;
    }
    setSchedMsg(typeof data === 'number' ? `${name}: ${data} linha(s) afetada(s).` : `${name}: ok.`);
    await onScheduleReload();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase leading-none">Gestão do Campeonato</h2>
          <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">Configurações Gerais e Identidade Visual</p>
        </div>
      </div>

      {publicSlug && (
        <div className="card-utility p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">Portal público</p>
            <p className="text-sm font-bold text-primary break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/p/${publicSlug}` : `/p/${publicSlug}`}
            </p>
          </div>
          <a
            href={`/p/${publicSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-black uppercase text-accent border border-accent/30 px-4 py-2 rounded-xl hover:bg-accent/5"
          >
            Abrir em nova aba
          </a>
        </div>
      )}

      <div className="card-utility p-6 space-y-4">
        <h3 className="text-sm font-black uppercase text-primary tracking-tight">Calendário & chaves (Postgres)</h3>
        <p className="text-xs text-text-muted">
          Geração de turno e mata-mata via funções SQL. Conflitos listados por clube/data/hora.
        </p>
        {schedMsg && <p className="text-xs text-accent font-bold">{schedMsg}</p>}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-outline text-xs font-bold uppercase"
            onClick={() =>
              void runRpc('generate_round_robin', { p_championship_id: championship.id, p_rounds: 1 })
            }
          >
            Rodada (todos contra todos)
          </button>
          <button
            type="button"
            className="btn-outline text-xs font-bold uppercase"
            onClick={async () => {
              if (!supabase || !useRemote) return;
              const { data, error } = await supabase.rpc('detect_schedule_conflicts', {
                p_championship_id: championship.id,
              });
              if (error) setSchedMsg(error.message);
              else setSchedMsg(`Conflitos: ${JSON.stringify(data ?? [])}`);
            }}
          >
            Detectar conflitos
          </button>
          <button
            type="button"
            className="btn-primary text-xs font-bold uppercase"
            onClick={() =>
              void runRpc('generate_knockout_from_standings', {
                p_championship_id: championship.id,
                p_pairs: 2,
              })
            }
          >
            Chave mata-mata (demo)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="card-utility bg-white overflow-hidden p-0">
              <div className="h-64 bg-neutral-100 flex items-center justify-center relative overflow-hidden group border-b border-surface-border">
                 {championship.bannerUrl ? (
                   <img src={championship.bannerUrl} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center">
                      <ImageIcon className="mx-auto text-neutral-300 mb-2 opacity-50" size={48} />
                      <p className="text-xs font-black uppercase text-text-muted tracking-widest">Banner Oficial da Temporada</p>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FileUpload 
                      onUpload={(url) => setChampionship({ ...championship, bannerUrl: url })} 
                      label="Alterar Banner" 
                      className="bg-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase text-primary shadow-xl" 
                    />
                 </div>
              </div>
              <div className="p-8">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-2xl font-black text-primary uppercase leading-none tracking-tighter">{championship.name}</h3>
                       <p className="text-[11px] font-bold text-text-muted mt-2 uppercase tracking-widest bg-neutral-100 w-fit px-3 py-1 rounded-lg">Temporada {championship.season}</p>
                    </div>
                    <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                       EM ANDAMENTO
                    </span>
                 </div>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-6 border-t border-surface-border">
                    <div>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Formato</p>
                       <p className="text-sm font-bold text-primary">{championship.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Yellow Card Cap</p>
                       <p className="text-sm font-bold text-primary">{championship.rules.yellowCardLimit} cartões</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Vitória</p>
                       <p className="text-sm font-bold text-primary">{championship.rules.pointsPerWin} pts</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="card-utility p-8 bg-neutral-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Trophy size={100} />
              </div>
              <div className="relative z-10">
                 <h4 className="text-[11px] font-black text-white/40 uppercase mb-6 tracking-[0.3em]">Health Check Identity</h4>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${championship.bannerUrl ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/20'}`}>
                             <ImageIcon size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tight">Banner da Temporada</span>
                       </div>
                       <CheckCircle size={14} className={championship.bannerUrl ? 'text-green-400' : 'text-white/20'} />
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                             <Shield size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-tight">Logo Federativa</span>
                       </div>
                       <CheckCircle size={14} className="text-green-400" />
                    </div>
                 </div>
                 <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/50 leading-relaxed font-medium italic">
                       A identidade visual fortalece a marca da sua liga e atrai patrocinadores de alto nível.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
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
  onFinishMatch: (m: Match, events: MatchEvent[]) => void,
  onExit: () => void 
}) {
  const [currentMinute, setCurrentMinute] = useState(match.currentMinute || 0);
  const [events, setEvents] = useState<MatchEvent[]>(match.events || []);
  const [homeScore, setHomeScore] = useState(match.score?.home || 0);
  const [awayScore, setAwayScore] = useState(match.score?.away || 0);
  const [isPaused, setIsPaused] = useState(false);

  const homeClub = clubs.find(c => c.id === match.homeTeamId);
  const awayClub = clubs.find(c => c.id === match.awayTeamId);

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
    setPendingEvent(null);
  };

  const renderPlayerPicker = () => {
    if (!pendingEvent) return null;
    const team = pendingEvent.teamId === match.homeTeamId ? 'home' : 'away';
    const lineup = match.lineups?.[team];
    const teamName = team === 'home' ? homeClub?.shortName : awayClub?.shortName;
    const teamPlayers = lineup 
      ? players.filter(p => [...lineup.starters, ...lineup.substitutes].includes(p.id))
      : [];

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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {renderPlayerPicker()}
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
              onClick={() => {
                if(confirm('Encerrar partida e gerar súmula final?')) {
                  onFinishMatch(match, events);
                }
              }}
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
                  <button onClick={() => setPendingEvent({ type: 'SUBSTITUTION', teamId: match.homeTeamId })} className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl border border-blue-100 flex flex-col items-center gap-2 transition-all">
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
                  <button onClick={() => setPendingEvent({ type: 'SUBSTITUTION', teamId: match.awayTeamId })} className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl border border-blue-100 flex flex-col items-center gap-2 transition-all">
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
                        <p className="font-bold text-sm text-primary">
                          {clubs.find(c => c.id === ev.teamId)?.shortName} • {ev.playerId ? players.find(p => p.id === ev.playerId)?.name : 'Lance em análise'}
                        </p>
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

function AwardsView({ players, clubs, matches }: { players: Player[], clubs: Club[], matches: Match[] }) {
  // 1. Artilheiro (Already have stats)
  const topScorer = [...players].sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))[0];

  // 2. Melhor Goleiro (goalsAgainst / matchesPlayed)
  // We need to calculate goalsAgainst for goalkeepers
  // Simplification for MVP: We take the club clean sheets or calculate from matches
  const goalkeepers = players.filter(p => p.position === 'GOL');
  const goalkeeperStats = goalkeepers.map(gk => {
    const club = clubs.find(c => c.id === gk.clubId);
    const clubMatches = matches.filter(m => m.status === 'FINISHED' && (m.homeTeamId === gk.clubId || m.awayTeamId === gk.clubId));
    const goalsAgainst = clubMatches.reduce((acc, m) => {
      const isHome = m.homeTeamId === gk.clubId;
      return acc + (isHome ? (m.score?.away || 0) : (m.score?.home || 0));
    }, 0);
    const index = clubMatches.length > 0 ? goalsAgainst / clubMatches.length : 999;
    return { gk, index, matches: clubMatches.length, goalsAgainst };
  }).filter(s => s.matches > 0).sort((a, b) => a.index - b.index);

  const bestGK = goalkeeperStats[0]?.gk;

  // 3. Fair Play (Yellow=1, Red=3)
  const teamFairPlay = clubs.map(club => {
    const clubPlayers = players.filter(p => p.clubId === club.id);
    const score = clubPlayers.reduce((acc, p) => acc + (p.stats?.yellowCards || 0) * 1 + (p.stats?.redCards || 0) * 3, 0);
    return { club, score };
  }).sort((a, b) => a.score - b.score);

  const fairPlayTeam = teamFairPlay[0]?.club;

  // 4. MVP (Rating)
  const mvp = [...players].sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0))[0];

  const AwardCard = ({ title, icon, player, club, subtitle, value }: { title: string, icon: React.ReactNode, player?: Player, club?: Club, subtitle?: string, value?: string }) => (
    <div className="card-utility p-6 bg-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-accent/10 transition-all duration-700" />
      <div className="flex items-start gap-4 z-10 relative">
        <div className="p-3 bg-accent/10 text-accent rounded-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">{title}</h4>
          {player ? (
            <div className="flex items-center gap-3 mt-3">
              <img src={player.photoUrl} className="w-12 h-12 rounded-xl object-cover border border-surface-border" />
              <div>
                <p className="font-bold text-primary leading-none uppercase">{player.name}</p>
                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight">{clubs.find(c => c.id === player.clubId)?.shortName}</p>
              </div>
            </div>
          ) : club ? (
            <div className="flex items-center gap-3 mt-3">
              <img src={club.logoUrl} className="w-12 h-12 rounded-xl object-contain border border-surface-border p-2" />
              <div>
                <p className="font-bold text-primary leading-none uppercase">{club.name}</p>
                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight">{club.shortName}</p>
              </div>
            </div>
          ) : (
             <p className="text-[11px] italic text-text-muted mt-4">Dados insuficientes</p>
          )}
          {(player || club) && (
            <div className="mt-4 pt-4 border-t border-surface-border flex justify-between items-center">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">{subtitle}</span>
              <span className="text-lg font-black text-accent tabular-nums">{value}</span>
            </div>
          )}
        </div>
      </div>
    </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AwardCard 
          title="Chuteira de Ouro" 
          icon={<Trophy size={20} />} 
          player={topScorer} 
          subtitle="Gols Marcados" 
          value={topScorer?.stats?.goals.toString()} 
        />
        <AwardCard 
          title="Luva de Ouro" 
          icon={<Shield size={20} />} 
          player={bestGK} 
          subtitle="Média de Gols Sofridos" 
          value={goalkeeperStats[0]?.index.toFixed(2)} 
        />
        <AwardCard 
          title="Prêmio Fair Play" 
          icon={<CheckCircle size={20} />} 
          club={fairPlayTeam} 
          subtitle="Pontos de Indisciplina" 
          value={teamFairPlay[0]?.score.toString()} 
        />
        <AwardCard 
          title="Craque do Campeonato" 
          icon={<Star size={20} />} 
          player={mvp} 
          subtitle="Rating Médio" 
          value={mvp?.stats?.rating.toFixed(1)} 
        />
      </div>
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
                        return (
                          <tr key={s.teamId} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-5">
                               <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black ${
                                 idx < 4 ? 'bg-green-500 text-white' : idx >= standings.length - 2 ? 'bg-red-500 text-white' : 'bg-neutral-100 text-text-muted'
                               }`}>
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
                                  {s.form.map((res, i) => (
                                    <div key={i} className={`w-5 h-5 flex items-center justify-center rounded-md text-[9px] text-white ${
                                      res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-neutral-400' : 'bg-red-500'
                                    }`}>
                                      {res}
                                    </div>
                                  ))}
                                  {s.form.length === 0 && <span className="text-[10px] text-text-muted italic opacity-50">Sem jogos</span>}
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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

function AutomationView({ clubs, matches, players, notifications, setNotifications, supabase, useRemote, organizationId }: { clubs: Club[], matches: Match[], players: Player[], notifications: Notification[], setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>, supabase: SupabaseClient | null, useRemote: boolean, organizationId: string }) {
  const [isScanning, setIsScanning] = useState(false);

  const scanForNotifications = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newNotifications: Notification[] = [];
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const in7Days = new Date(now);
      in7Days.setDate(in7Days.getDate() + 7);

      // 1. Matches Tomorrow & Missing Lineup
      matches.forEach(m => {
        const matchDate = new Date(m.date);
        const homeClub = clubs.find(c => c.id === m.homeTeamId);
        const awayClub = clubs.find(c => c.id === m.awayTeamId);

        if (matchDate.toDateString() === tomorrow.toDateString()) {
          if (homeClub?.email) {
            newNotifications.push({
              id: `notif-${Date.now()}-h1`,
              type: 'MATCH_TOMORROW',
              clubId: homeClub.id,
              recipientEmail: homeClub.email,
              channel: 'email',
              status: 'QUEUED',
              subject: 'Convite de Jogo: Você tem partida amanhã!',
              content: `Olá ${homeClub.name}, lembre-se que amanhã você enfrenta o ${awayClub?.name} na ${m.location} às ${m.time}.`,
              matchId: m.id
            });

            if (!m.lineups?.home) {
              newNotifications.push({
                id: `notif-${Date.now()}-h2`,
                type: 'MISSING_LINEUP',
                clubId: homeClub.id,
                recipientEmail: homeClub.email,
                channel: 'email',
                status: 'QUEUED',
                subject: 'PENDENTE: Escalação não definida',
                content: `Atenção! Sua escalação para o jogo de amanhã contra o ${awayClub?.name} ainda não foi enviada.`,
                matchId: m.id
              });
            }
          }
        }

        // 2. Match in 7 Days
        if (matchDate.toDateString() === in7Days.toDateString()) {
           if (homeClub?.email) {
             newNotifications.push({
               id: `notif-${Date.now()}-h7`,
               type: 'MATCH_7_DAYS',
               clubId: homeClub.id,
               recipientEmail: homeClub.email,
               channel: 'email',
               status: 'QUEUED',
               subject: 'Agenda Varzeana: Jogo em 7 dias',
               content: `Preparado? Daqui a uma semana você terá um confronto importante contra o ${awayClub?.name}.`,
               matchId: m.id
             });
           }
        }
      });

      // 3. Suspended Players
      players.filter(p => p.status === 'SUSPENDED').forEach(p => {
        const club = clubs.find(c => c.id === p.clubId);
        if (club?.email) {
          newNotifications.push({
            id: `notif-${Date.now()}-p${p.id}`,
            type: 'PLAYER_SUSPENDED',
            clubId: club.id,
            recipientEmail: club.email,
            channel: 'email',
            status: 'QUEUED',
            subject: 'ALERTA DE SUSPENSÃO',
            content: `O atleta ${p.name} (Camisa ${p.shirtNumber}) atingiu o limite de cartões e está SUSPENSO para a próxima rodada.`,
            playerId: p.id
          });
        }
      });

      setNotifications(prev => [...newNotifications, ...prev]);
      setIsScanning(false);
    }, 1500);
  };

  const sendAll = () => {
    void (async () => {
      if (supabase && useRemote) {
        const pending = notifications.filter((n) => n.status === 'QUEUED');
        for (const n of pending) {
          const { error } = await supabase.from('notification_queue').insert({
            organization_id: organizationId,
            type: n.type,
            channel: n.channel ?? 'email',
            payload: {
              to: n.recipientEmail,
              subject: n.subject,
              body: n.content,
              matchId: n.matchId,
              playerId: n.playerId,
            },
          });
          if (!error) {
            await supabase.functions.invoke('send-notification', {
              body: { subject: n.subject, to: n.recipientEmail },
            });
          }
        }
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.status === 'QUEUED'
            ? { ...n, status: 'SENT' as const, sentAt: new Date().toISOString() }
            : n
        )
      );
    })();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase leading-none">Central de Automação</h2>
          <p className="text-[11px] font-bold text-text-muted mt-1 uppercase tracking-widest">Motor de Notificações via Email</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={scanForNotifications}
            disabled={isScanning}
            className="btn-outline flex items-center gap-2"
          >
            <Zap size={14} className={isScanning ? 'animate-pulse' : ''} />
            {isScanning ? 'Sincronizando...' : 'Escanear Triggers'}
          </button>
          <button onClick={sendAll} className="btn-primary flex items-center gap-2">
            <Mail size={14} /> Disparar Pendentes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
           <div className="card-utility bg-white">
              <h3 className="text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest">Status da Fila</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">Aguardando Envio</span>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                      {notifications.filter(n => n.status === 'QUEUED').length}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">Enviados (Hoje)</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                      {notifications.filter(n => n.status === 'SENT').length}
                    </span>
                 </div>
              </div>
           </div>

           <div className="card-utility bg-primary text-white border-none shadow-xl">
              <h4 className="text-[10px] font-black text-white/40 uppercase mb-3 tracking-widest">IA Insight</h4>
              <p className="text-[12px] font-medium leading-relaxed italic opacity-90">
                "Detectamos que 40% das suspensões do Vila Nova ocorrem após jogos clássicos. Recomendo disparar o alerta de suspensão com 48h de antecedência."
              </p>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="card-utility">
              <div className="flex items-center gap-2 mb-6">
                 <Bell size={18} className="text-accent" />
                 <h3 className="text-sm font-black uppercase tracking-tight">Fila de Disparo Logístico</h3>
              </div>

              <div className="space-y-3">
                 {notifications.length === 0 ? (
                   <div className="p-12 text-center border-2 border-dashed border-surface-border rounded-3xl">
                      <Mail size={32} className="mx-auto text-neutral-300 mb-4 opacity-50" />
                      <p className="text-sm font-bold text-text-muted italic">Nenhuma notificação pendente. Clique em "Escanear" para processar a agenda.</p>
                   </div>
                 ) : (
                   notifications.map(n => (
                     <div key={n.id} className="p-4 bg-neutral-50 rounded-2xl border border-surface-border/50 group hover:border-accent/40 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`p-2 rounded-xl border ${
                             n.status === 'SENT' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>
                              {n.type === 'MATCH_TOMORROW' || n.type === 'MATCH_7_DAYS' ? <Calendar size={18} /> : 
                               n.type === 'PLAYER_SUSPENDED' ? <ShieldAlert size={18} /> : <FileText size={18} />}
                           </div>
                           <div className="min-w-0">
                              <h4 className="text-[13px] font-black text-primary leading-tight flex items-center gap-2">
                                {n.subject}
                                {n.status === 'SENT' && <CheckCircle size={12} className="text-green-500" />}
                              </h4>
                              <p className="text-[11px] font-bold text-text-muted mt-0.5 truncate max-w-md">Para: {clubs.find(c => c.id === n.clubId)?.name} ({n.recipientEmail})</p>
                           </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           <span className="text-[10px] font-black uppercase tracking-tight text-text-muted mb-1">
                             {n.sentAt ? new Date(n.sentAt).toLocaleTimeString() : 'Aguardando'}
                           </span>
                           <button className="text-[10px] font-black text-accent uppercase opacity-0 group-hover:opacity-100 transition-all">Ver Conteúdo</button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Histórico Recente */}
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

          {/* Avaliações */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted pl-1">Avaliações dos Clubes (Scout)</h3>
               <div className="flex items-center gap-1.5 bg-accent/5 px-3 py-1 rounded-full text-accent font-bold text-sm">
                 <Star size={14} fill="currentColor" /> {referee.averageRating} Avg
               </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
               {refRatings.map(r => (
                 <div key={r.id} className="p-6 bg-neutral-900 text-white rounded-2xl relative overflow-hidden">
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                         <img src={clubs.find(c => c.id === r.clubId)?.logoUrl} className="w-8 h-8 rounded-lg bg-white p-1" />
                         <div>
                            <p className="text-[11px] font-black uppercase text-white/50 leading-none mb-1">{clubs.find(c => c.id === r.clubId)?.name}</p>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={10} fill={s <= r.score ? "#4caf50" : "none"} stroke={s <= r.score ? "#4caf50" : "rgba(255,255,255,0.2)"} />
                              ))}
                            </div>
                         </div>
                       </div>
                       <span className="text-[10px] text-white/30 font-mono italic">{r.createdAt.split('T')[0]}</span>
                     </div>
                     <p className="text-[13px] font-medium leading-relaxed italic text-white/80">
                       "{r.comment || 'Nenhuma observação técnica enviada.'}"
                     </p>
                   </div>
                   <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12">
                     <CheckCircle size={120} />
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
  } = useAppData();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

    // Attach form to table records (last 5 games)
    Object.keys(table).forEach(teamId => {
      table[teamId].form = teamForm[teamId].slice(-5);
    });

    return Object.values(table).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  }, [matches, championship, clubs]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSaveLineup = (matchId: string, lineups: Match['lineups']) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, lineups } : m));
    setCurrentView('matches');
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  };

  const handleFinishMatch = (match: Match, events: MatchEvent[]) => {
    setMatches(prev => prev.map(m => m.id === match.id ? { 
      ...match, 
      status: 'FINISHED', 
      reportStatus: 'PENDING',
      events 
    } : m));
    setCurrentView('matches');
  };

  const handleApproveReport = (matchId: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, reportStatus: 'APPROVED', contestReason: undefined } : m));
  };

  const handleContestReport = (matchId: string, reason: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, reportStatus: 'CONTESTED', contestReason: reason } : m));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className="w-[220px] bg-primary text-white flex flex-col z-50 absolute lg:relative h-full shadow-lg"
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-6 h-6 bg-accent rounded-full shadow-lg shadow-accent/20" />
              <div>
                <h1 className="font-extrabold text-lg tracking-tight leading-none">GESTOR FC</h1>
                <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-1">CRM PRO v1.2</p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-1">
              <NavBtn active={currentView === 'dashboard'} icon={<LayoutDashboard size={18} />} label="Painel Geral" onClick={() => setCurrentView('dashboard')} />
              <NavBtn active={currentView === 'championships'} icon={<Trophy size={18} />} label="Campeonatos" onClick={() => setCurrentView('championships')} />
              <NavBtn active={currentView === 'clubs'} icon={<ShieldAlert size={18} />} label="Clubes & Atletas" onClick={() => setCurrentView('clubs')} />
              <NavBtn active={currentView === 'players'} icon={<Users size={18} />} label="Atletas" onClick={() => setCurrentView('players')} />
              <NavBtn active={currentView === 'referees'} icon={<Users size={18} />} label="Árbitros" onClick={() => setCurrentView('referees')} />
              <NavBtn active={currentView === 'matches'} icon={<Calendar size={18} />} label="Súmulas Digitais" onClick={() => setCurrentView('matches')} />
              <NavBtn active={currentView === 'venues'} icon={<MapPin size={18} />} label="Campos & Sedes" onClick={() => setCurrentView('venues')} />
              <NavBtn active={currentView === 'eligibility'} icon={<Shield size={18} />} label="Documentos & Elegibilidade" onClick={() => setCurrentView('eligibility')} />
              <NavBtn active={currentView === 'financial'} icon={<Wallet size={18} />} label="Financeiro" onClick={() => setCurrentView('financial')} />
              <NavBtn active={currentView === 'reports'} icon={<ClipboardList size={18} />} label="Súmula pós-jogo" onClick={() => setCurrentView('reports')} />
              <NavBtn active={currentView === 'analytics'} icon={<BarChart3 size={18} />} label="Relatórios & Analytics" onClick={() => setCurrentView('analytics')} />
              <NavBtn active={currentView === 'automation'} icon={<Zap size={18} />} label="Automações & Alertas" onClick={() => setCurrentView('automation')} />
              <NavBtn active={currentView === 'media'} icon={<ImageIcon size={18} />} label="Mídia & Galeria" onClick={() => setCurrentView('media')} />
              
              <div className="pt-4 mt-4 border-t border-white/10">
                <NavBtn active={currentView === 'public-portal'} icon={<ExternalLink size={18} />} label="Portal Público" onClick={() => setCurrentView('public-portal')} />
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
                  championship={championship}
                  setChampionship={setChampionship}
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
                  onSelectLineup={(id) => {
                    setSelectedMatchId(id);
                    setCurrentView('lineup');
                  }} 
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
              {currentView === 'automation' && (
                <AutomationView 
                  clubs={clubs}
                  matches={matches}
                  players={players}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  supabase={supabase}
                  useRemote={useRemote}
                  organizationId={organizationId}
                />
              )}
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
                  return (
                    <tr key={s.teamId} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-muted">{idx + 1}</td>
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
                          {s.form.map((res, i) => (
                            <div key={i} className={`w-4 h-4 flex items-center justify-center rounded text-[8px] font-black text-white ${
                              res === 'W' ? 'bg-green-500' : res === 'D' ? 'bg-neutral-400' : 'bg-red-500'
                            }`}>
                              {res === 'W' ? 'V' : res === 'D' ? 'E' : 'D'}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
  onSelectLineup,
  onSwitchToMatchCenter,
  onApproveReport,
  onContestReport
}: { 
  clubs: Club[], 
  matches: Match[], 
  venues: Venue[],
  onSelectLineup: (id: string) => void,
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => onSelectLineup(m.id)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-primary text-[10px] font-black uppercase rounded-lg transition-colors border border-surface-border"
                  >
                    Escalação
                  </button>
                  <button 
                    onClick={() => {
                      if (!m.lineups) {
                        alert('Defina a escalação antes de iniciar a transmissão.');
                        return;
                      }
                      onSwitchToMatchCenter(m.id);
                    }}
                    className="px-3 py-1.5 bg-accent text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <Radio size={12} className="animate-pulse" /> Transmitir
                  </button>
                </div>
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
