import { Championship, Club, Player, Match, User, Referee, RefereeRating, Venue } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Tomás Baute',
  role: 'SUPER_ADMIN',
  email: 'baute@liga.fm'
};

export const MOCK_CLUBS: Club[] = [
  { 
    id: 'c1', 
    name: 'Esporte Clube Vila Nova', 
    shortName: 'EVN', 
    logoUrl: 'https://picsum.photos/seed/evn/100/100', 
    presidentId: 'u2', 
    address: 'Rua das Flores, 123', 
    phone: '(11) 98888-7777', 
    email: 'contato@vilanova.com', 
    customRules: 'Proibido chuteiras de trava de alumínio. Uniforme reserva deve ser predominantemente branco.', 
    homeField: 'Campo do XV', 
    hasPendingFinance: false,
    foundedYear: 1974,
    titles: ['Copa Várzea 2022', 'Série B 2018', 'Troféu Amizade 2020'],
    stats: { totalGoals: 124, cleanSheets: 32, possessionAvg: 54 }
  },
  { 
    id: 'c2', 
    name: 'União da Várzea', 
    shortName: 'UDV', 
    logoUrl: 'https://picsum.photos/seed/udv/100/100', 
    presidentId: 'u3', 
    address: 'Av. Principal, 500', 
    phone: '(11) 97777-6666', 
    email: 'uniao@varzea.org', 
    customRules: 'Pagamento da taxa de arbitragem até 30min antes do jogo.', 
    homeField: 'Arena da Várzea', 
    hasPendingFinance: true,
    foundedYear: 1992,
    titles: ['Taça Independência 2024'],
    stats: { totalGoals: 88, cleanSheets: 15, possessionAvg: 48 }
  },
  { 
    id: 'c3', 
    name: 'Real Madrid da Quebrada', 
    shortName: 'RMQ', 
    logoUrl: 'https://picsum.photos/seed/rmq/100/100', 
    presidentId: 'u4', 
    address: 'Beco do Gol, 10', 
    phone: '(11) 96666-5555', 
    email: 'real@quebrada.net', 
    customRules: 'Obrigatório apresentação de RG original.', 
    homeField: 'Campo da Paz', 
    hasPendingFinance: false,
    foundedYear: 2010,
    titles: ['Supercopa Local 2023'],
    stats: { totalGoals: 210, cleanSheets: 45, possessionAvg: 61 }
  },
  { 
    id: 'c4', 
    name: 'Santos do Morro', 
    shortName: 'SDM', 
    logoUrl: 'https://picsum.photos/seed/sdm/100/100', 
    presidentId: 'u5', 
    address: 'Ladeira da Vila, s/n', 
    phone: '(11) 95555-4444', 
    email: 'santos@morro.com', 
    customRules: 'Torneio interno aos domingos tem prioridade sobre amistosos.', 
    homeField: 'Estádio Municipal', 
    hasPendingFinance: true,
    foundedYear: 1985,
    titles: [],
    stats: { totalGoals: 45, cleanSheets: 8, possessionAvg: 42 }
  },
];

export const MOCK_CHAMPIONSHIP: Championship = {
  id: 'ch1',
  name: 'Copa Regional 2026',
  season: '2026',
  type: 'POINTS_CORRIDOS',
  status: 'ACTIVE',
  rules: {
    yellowCardLimit: 3,
    pointsPerWin: 3,
    pointsPerDraw: 1
  }
};

export const MOCK_PLAYERS: Player[] = [
  { 
    id: 'p1', 
    clubId: 'c1', 
    name: 'Gabriel Barbosa', 
    shirtNumber: 9, 
    position: 'ATA', 
    status: 'ACTIVE', 
    documentStatus: 'APPROVED',
    birthDate: '1996-08-30',
    photoUrl: 'https://picsum.photos/seed/p1/150/150',
    stats: { matches: 24, goals: 18, assists: 7, yellowCards: 2, redCards: 1, rating: 8.5 }
  },
  { 
    id: 'p2', 
    clubId: 'c1', 
    name: 'Diego Ribas', 
    shirtNumber: 10, 
    position: 'MEI', 
    status: 'ACTIVE', 
    documentStatus: 'APPROVED',
    birthDate: '1985-02-28',
    photoUrl: 'https://picsum.photos/seed/p2/150/150',
    stats: { matches: 22, goals: 5, assists: 14, yellowCards: 4, redCards: 0, rating: 7.9 }
  },
  { 
    id: 'p3', 
    clubId: 'c2', 
    name: 'Felipe Melo', 
    shirtNumber: 5, 
    position: 'VOL', 
    status: 'SUSPENDED', 
    documentStatus: 'APPROVED',
    birthDate: '1983-06-26',
    photoUrl: 'https://picsum.photos/seed/p3/150/150',
    stats: { matches: 15, goals: 1, assists: 2, yellowCards: 8, redCards: 3, rating: 6.8 }
  },
  { 
    id: 'p4', 
    clubId: 'c2', 
    name: 'Hulk', 
    shirtNumber: 7, 
    position: 'ATA', 
    status: 'ACTIVE', 
    documentStatus: 'APPROVED',
    birthDate: '1986-07-25',
    photoUrl: 'https://picsum.photos/seed/p4/150/150',
    stats: { matches: 28, goals: 25, assists: 9, yellowCards: 1, redCards: 0, rating: 9.2 }
  },
  { 
    id: 'p5', 
    clubId: 'c1', 
    name: 'Weverton', 
    shirtNumber: 1, 
    position: 'GOL', 
    status: 'ACTIVE', 
    documentStatus: 'APPROVED',
    birthDate: '1987-12-13',
    photoUrl: 'https://picsum.photos/seed/p5/150/150',
    stats: { matches: 30, goals: 0, assists: 0, yellowCards: 1, redCards: 0, rating: 8.8 }
  },
  { 
    id: 'p6', 
    clubId: 'c2', 
    name: 'Everson', 
    shirtNumber: 1, 
    position: 'GOL', 
    status: 'ACTIVE', 
    documentStatus: 'PENDING',
    birthDate: '1990-07-22',
    photoUrl: 'https://picsum.photos/seed/p6/150/150',
    stats: { matches: 25, goals: 0, assists: 0, yellowCards: 2, redCards: 0, rating: 8.2 }
  },
];

export const MOCK_REFEREES: Referee[] = [
  { 
    id: 'r1', 
    name: 'Pierluigi Collina', 
    level: 'ELITE', 
    photoUrl: 'https://ui-avatars.com/api/?name=Pierluigi+Collina', 
    matchesOfficiated: 154, 
    averageRating: 4.9, 
    status: 'AVAILABLE',
    phone: '(11) 99999-0000',
    email: 'collina@arbitros.com'
  },
  { 
    id: 'r2', 
    name: 'Sálvio Spinola', 
    level: 'OURO', 
    photoUrl: 'https://ui-avatars.com/api/?name=Salvio+Spinola', 
    matchesOfficiated: 82, 
    averageRating: 4.2, 
    status: 'AVAILABLE',
    phone: '(11) 98888-1111',
    email: 'salvio@arbitros.com'
  },
  { 
    id: 'r3', 
    name: 'Edina Alves', 
    level: 'ELITE', 
    photoUrl: 'https://ui-avatars.com/api/?name=Edina+Alves', 
    matchesOfficiated: 45, 
    averageRating: 4.7, 
    status: 'UNAVAILABLE',
    phone: '(11) 97777-2222',
    email: 'edina@arbitros.com'
  }
];

export const MOCK_RATINGS: RefereeRating[] = [
  { id: 'rt1', matchId: 'm3', refereeId: 'r1', clubId: 'c1', score: 5, comment: 'Excelente condução física e técnica.', createdAt: '2026-04-12T12:00:00Z' },
  { id: 'rt2', matchId: 'm3', refereeId: 'r1', clubId: 'c3', score: 4, comment: 'Apito muito rigoroso, mas justo.', createdAt: '2026-04-12T12:10:00Z' }
];

export const MOCK_VENUES: Venue[] = [
  { id: 'v1', name: 'Campo do XV', address: 'Rua Itaquera, 450, São Paulo', active: true, facilities: ['Estacionamento', 'Refletores', 'Vestiário'] },
  { id: 'v2', name: 'Arena da Várzea', address: 'Av. Brasil, 1900, São Paulo', active: true, facilities: ['Bar/Lanchonete', 'Vestiário', 'Espaço Família'] },
  { id: 'v3', name: 'Arena Sul', address: 'Ladeira do Sol, 88, São Paulo', active: true, facilities: ['Refletores'] },
  { id: 'v4', name: 'Campo da Paz', address: 'Rua da Harmonia, 10, São Paulo', active: false, facilities: ['Estacionamento'] }
];

export const MOCK_MATCHES: Match[] = [
  { id: 'm1', championshipId: 'ch1', homeTeamId: 'c1', awayTeamId: 'c2', date: '2026-04-19', time: '10:00', location: 'Campo do XV', venueId: 'v1', status: 'SCHEDULED', refereeId: 'r1' },
  { id: 'm2', championshipId: 'ch1', homeTeamId: 'c3', awayTeamId: 'c4', date: '2026-04-19', time: '12:30', location: 'Arena da Várzea', venueId: 'v2', status: 'SCHEDULED', refereeId: 'r2' },
  { id: 'm3', championshipId: 'ch1', homeTeamId: 'c1', awayTeamId: 'c3', date: '2026-04-12', time: '10:00', location: 'Campo do XV', venueId: 'v1', status: 'FINISHED', refereeId: 'r1', score: { home: 2, away: 1 }, reportStatus: 'APPROVED' },
  { id: 'm4', championshipId: 'ch1', homeTeamId: 'c2', awayTeamId: 'c4', date: '2026-04-11', time: '15:00', location: 'Arena Sul', venueId: 'v3', status: 'FINISHED', refereeId: 'r3', score: { home: 0, away: 0 }, reportStatus: 'PENDING' },
];
