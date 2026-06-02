/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'CLUB_ADMIN' | 'REFEREE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  clubId?: string;
  email: string;
}

export interface Championship {
  id: string;
  name: string;
  season: string;
  bannerUrl?: string;
  type: 'POINTS_CORRIDOS' | 'GROUPS' | 'KNOCKOUT';
  status: 'PLANNING' | 'ACTIVE' | 'FINISHED';
  rules: {
    yellowCardLimit: number; // e.g., 3 for suspension
    pointsPerWin: number;
    pointsPerDraw: number;
    minAge?: number;
    maxAge?: number;
    /** Regras de classificação personalizadas (zonas por posição na tabela). */
    qualification?: QualificationRules;
  };
}

/** Tipo de cada faixa de classificação por posição final na tabela. */
export type QualificationZoneType = 'QUALIFIED' | 'PLAYOFF' | 'ELIMINATED';

export interface QualificationZone {
  id: string;
  label: string;       // ex.: "Classificação direta"
  from: number;        // posição inicial (1-based, inclusiva)
  to: number;          // posição final (inclusiva)
  type: QualificationZoneType;
  color: string;       // cor hex para destacar na tabela
}

export interface QualificationRules {
  enabled: boolean;
  zones: QualificationZone[];
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  presidentId: string;
  address?: string;
  phone?: string;
  email?: string;
  customRules?: string;
  homeField?: string;
  hasPendingFinance?: boolean;
  foundedYear?: number;
  titles?: string[];
  stats?: {
    totalGoals: number;
    cleanSheets: number;
    possessionAvg: number;
    disciplinePoints?: number;
  };
}

export interface Referee {
  id: string;
  name: string;
  level: 'PRATA' | 'OURO' | 'ELITE';
  photoUrl: string;
  matchesOfficiated: number;
  averageRating: number;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  phone?: string;
  email?: string;
}

export interface RefereeRatingDetail {
  punctuality: number;     // Pontualidade
  control: number;         // Controle da partida
  rules: number;           // Regras
  impartiality: number;    // Imparcialidade
  communication: number;   // Comunicação
  reportFilling: number;   // Preenchimento da súmula
}

export interface RefereeRating {
  id: string;
  matchId: string;
  refereeId: string;
  clubId: string;
  score: number; // 1-5 (média dos 6 critérios quando detail estiver presente)
  comment?: string;
  createdAt: string;
  detail?: RefereeRatingDetail;
}

export type RefereeClassification = 'BRONZE' | 'PRATA' | 'OURO';

export type ContestType = 'GOL' | 'CARTAO' | 'SUBSTITUICAO' | 'PLACAR' | 'OUTRO';

export interface ContestRecord {
  type: ContestType;
  description: string;
  suggestion: string;
}

export interface ClubValidationState {
  status: 'PENDING' | 'ACCEPTED' | 'CONTESTED';
  ratingId?: string;
  contest?: ContestRecord;
  decidedAt?: string;
}

export interface MatchValidations {
  home: ClubValidationState;
  away: ClubValidationState;
}

export interface Player {
  id: string;
  clubId: string;
  name: string;
  rg?: string;
  cpf?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  shirtNumber: number;
  position: string;
  status: 'ACTIVE' | 'SUSPENDED';
  documentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  birthDate: string;
  contractUrl?: string;
  photoUrl: string;
  stats?: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    rating: number; // 0.0 - 10.0
    goalsConceded?: number;
    mvpCount?: number;
  };
}

export interface Lineup {
  starters: string[]; // Player IDs
  substitutes: string[]; // Player IDs
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  contactPhone?: string;
  capacity?: number;
  facilities?: string[];
  active: boolean;
  clubId?: string;
}

export interface Match {
  id: string;
  championshipId: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  location: string;
  venueId?: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  refereeId?: string;
  lineups?: {
    home: Lineup;
    away: Lineup;
  };
  reportStatus?: 'PENDING' | 'APPROVED' | 'CONTESTED' | 'AWAITING_VALIDATION' | 'IN_REVIEW' | 'VALIDATED';
  contestReason?: string;
  reportPublishedAt?: string; // ISO — marca início do prazo de 48h
  validations?: MatchValidations;
  errorConfirmed?: boolean;   // organizador confirmou erro do árbitro durante a revisão
  score?: {
    home: number;
    away: number;
  };
  currentMinute?: number;
  events?: MatchEvent[];
  gallery?: string[];
  mvpPlayerId?: string;
  minutesPlayed?: { [playerId: string]: number };
}

export interface MediaAsset {
  id: string;
  url: string;
  type: 'IMAGE' | 'BANNER' | 'LOGO';
  category: 'CHAMPIONSHIP' | 'CLUB' | 'MATCH' | 'GENERAL';
  relatedId?: string; // clubId, matchId, etc.
  createdAt: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'ASSIST' | 'SUBSTITUTION';
  minute: number;
  playerInId?: string;
  playerOutId?: string;
}

export interface Standing {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export type NotificationType =
  | 'MATCH_TOMORROW'
  | 'MATCH_7_DAYS'
  | 'PLAYER_SUSPENDED'
  | 'NEW_ROUND'
  | 'MISSING_LINEUP'
  | 'REPORT_VALIDATION_PENDING';

export type NotificationChannel = 'email' | 'sms' | 'push';

export interface Notification {
  id: string;
  type: NotificationType;
  clubId: string;
  recipientEmail: string;
  channel?: NotificationChannel;
  sentAt?: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  subject: string;
  content: string;
  matchId?: string;
  playerId?: string;
}

export interface Invoice {
  id: string;
  clubId: string;
  championshipId?: string;
  amountCents: number;
  description: string;
  dueDate: string;
  status: 'OPEN' | 'PAID' | 'CANCELLED' | 'OVERDUE';
}

export interface Payment {
  id: string;
  invoiceId: string;
  externalId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  method: string;
}

export interface FeeDefinition {
  id: string;
  championshipId: string;
  name: string;
  amountCents: number;
  category: string;
}

export interface ChampionshipBundle {
  championship: Championship;
  clubs: Club[];
  players: Player[];
  matches: Match[];
  venues: Venue[];
  referees: Referee[];
  ratings: RefereeRating[];
  matchEvents: MatchEvent[];
  notifications: Notification[];
  mediaAssets: MediaAsset[];
}
