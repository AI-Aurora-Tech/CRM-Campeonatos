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
  // ── Esporte Clube Vila Nova (c1) ─────────────────────────────────────────
  // Goleiros
  { id: 'p1',  clubId: 'c1', name: 'Weverton Pereira',    shirtNumber: 1,  position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-12-13', photoUrl: 'https://picsum.photos/seed/p1/150/150',  stats: { matches: 30, goals: 0, assists: 0, yellowCards: 1, redCards: 0, rating: 8.8 } },
  { id: 'p2',  clubId: 'c1', name: 'Rafael Cabral',       shirtNumber: 12, position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1990-05-20', photoUrl: 'https://picsum.photos/seed/p2/150/150',  stats: { matches: 5,  goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 7.5 } },
  { id: 'p3',  clubId: 'c1', name: 'Lucas Perri',         shirtNumber: 22, position: 'GOL', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1998-03-11', photoUrl: 'https://picsum.photos/seed/p3/150/150',  stats: { matches: 2,  goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 7.0 } },
  // Laterais direitos
  { id: 'p4',  clubId: 'c1', name: 'Daniel Alves',        shirtNumber: 2,  position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1983-05-06', photoUrl: 'https://picsum.photos/seed/p4/150/150',  stats: { matches: 28, goals: 2, assists: 8, yellowCards: 3, redCards: 0, rating: 8.1 } },
  { id: 'p5',  clubId: 'c1', name: 'Marcos Rocha',        shirtNumber: 13, position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1990-02-14', photoUrl: 'https://picsum.photos/seed/p5/150/150',  stats: { matches: 20, goals: 0, assists: 3, yellowCards: 2, redCards: 0, rating: 7.2 } },
  // Laterais esquerdos
  { id: 'p6',  clubId: 'c1', name: 'Alex Telles',         shirtNumber: 6,  position: 'LE',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1992-12-15', photoUrl: 'https://picsum.photos/seed/p6/150/150',  stats: { matches: 25, goals: 3, assists: 6, yellowCards: 2, redCards: 0, rating: 7.8 } },
  { id: 'p7',  clubId: 'c1', name: 'Renan Lodi',          shirtNumber: 16, position: 'LE',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1998-04-08', photoUrl: 'https://picsum.photos/seed/p7/150/150',  stats: { matches: 18, goals: 1, assists: 4, yellowCards: 1, redCards: 0, rating: 7.4 } },
  // Zagueiros
  { id: 'p8',  clubId: 'c1', name: 'Miranda',             shirtNumber: 3,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1984-09-07', photoUrl: 'https://picsum.photos/seed/p8/150/150',  stats: { matches: 27, goals: 2, assists: 1, yellowCards: 4, redCards: 0, rating: 7.9 } },
  { id: 'p9',  clubId: 'c1', name: 'Léo Ortiz',           shirtNumber: 4,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1996-01-23', photoUrl: 'https://picsum.photos/seed/p9/150/150',  stats: { matches: 29, goals: 1, assists: 0, yellowCards: 3, redCards: 0, rating: 7.6 } },
  { id: 'p10', clubId: 'c1', name: 'Rodrigo Caio',        shirtNumber: 14, position: 'ZAG', status: 'SUSPENDED', documentStatus: 'APPROVED', birthDate: '1995-03-12', photoUrl: 'https://picsum.photos/seed/p10/150/150', stats: { matches: 15, goals: 0, assists: 0, yellowCards: 5, redCards: 1, rating: 6.9 } },
  { id: 'p11', clubId: 'c1', name: 'Gustavo Gómez',       shirtNumber: 17, position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1993-06-06', photoUrl: 'https://picsum.photos/seed/p11/150/150', stats: { matches: 26, goals: 3, assists: 0, yellowCards: 2, redCards: 0, rating: 8.0 } },
  { id: 'p12', clubId: 'c1', name: 'Bremer',              shirtNumber: 5,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-03-18', photoUrl: 'https://picsum.photos/seed/p12/150/150', stats: { matches: 30, goals: 4, assists: 1, yellowCards: 3, redCards: 0, rating: 8.4 } },
  // Volantes
  { id: 'p13', clubId: 'c1', name: 'Thiago Maia',         shirtNumber: 8,  position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-09-25', photoUrl: 'https://picsum.photos/seed/p13/150/150', stats: { matches: 24, goals: 1, assists: 3, yellowCards: 3, redCards: 0, rating: 7.7 } },
  { id: 'p14', clubId: 'c1', name: 'Willian Arão',        shirtNumber: 15, position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1992-05-06', photoUrl: 'https://picsum.photos/seed/p14/150/150', stats: { matches: 22, goals: 0, assists: 2, yellowCards: 2, redCards: 0, rating: 7.3 } },
  { id: 'p15', clubId: 'c1', name: 'Gerson Santos',       shirtNumber: 18, position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-05-20', photoUrl: 'https://picsum.photos/seed/p15/150/150', stats: { matches: 28, goals: 3, assists: 5, yellowCards: 1, redCards: 0, rating: 8.2 } },
  // Meias
  { id: 'p16', clubId: 'c1', name: 'Diego Ribas',         shirtNumber: 10, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1985-02-28', photoUrl: 'https://picsum.photos/seed/p16/150/150', stats: { matches: 22, goals: 5, assists: 14, yellowCards: 4, redCards: 0, rating: 7.9 } },
  { id: 'p17', clubId: 'c1', name: 'Renato Augusto',      shirtNumber: 11, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1988-02-08', photoUrl: 'https://picsum.photos/seed/p17/150/150', stats: { matches: 20, goals: 4, assists: 9, yellowCards: 1, redCards: 0, rating: 8.0 } },
  { id: 'p18', clubId: 'c1', name: 'Éverton Ribeiro',     shirtNumber: 7,  position: 'MEI', status: 'SUSPENDED', documentStatus: 'APPROVED', birthDate: '1989-09-02', photoUrl: 'https://picsum.photos/seed/p18/150/150', stats: { matches: 18, goals: 3, assists: 7, yellowCards: 6, redCards: 1, rating: 7.6 } },
  { id: 'p19', clubId: 'c1', name: 'Giuliano',            shirtNumber: 20, position: 'MEI', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1990-05-31', photoUrl: 'https://picsum.photos/seed/p19/150/150', stats: { matches: 14, goals: 2, assists: 4, yellowCards: 1, redCards: 0, rating: 7.1 } },
  // Atacantes
  { id: 'p20', clubId: 'c1', name: 'Gabriel Barbosa',     shirtNumber: 9,  position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1996-08-30', photoUrl: 'https://picsum.photos/seed/p20/150/150', stats: { matches: 24, goals: 18, assists: 7, yellowCards: 2, redCards: 1, rating: 8.5 } },
  { id: 'p21', clubId: 'c1', name: 'Bruno Henrique',      shirtNumber: 27, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1990-08-20', photoUrl: 'https://picsum.photos/seed/p21/150/150', stats: { matches: 21, goals: 10, assists: 6, yellowCards: 2, redCards: 0, rating: 8.0 } },
  { id: 'p22', clubId: 'c1', name: 'Marinho Feliciano',   shirtNumber: 23, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1990-11-12', photoUrl: 'https://picsum.photos/seed/p22/150/150', stats: { matches: 19, goals: 7, assists: 5, yellowCards: 3, redCards: 0, rating: 7.7 } },
  { id: 'p23', clubId: 'c1', name: 'Vitinho',             shirtNumber: 19, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1993-01-10', photoUrl: 'https://picsum.photos/seed/p23/150/150', stats: { matches: 16, goals: 5, assists: 3, yellowCards: 1, redCards: 0, rating: 7.3 } },
  { id: 'p24', clubId: 'c1', name: 'Pepê Aquino',         shirtNumber: 21, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-07-28', photoUrl: 'https://picsum.photos/seed/p24/150/150', stats: { matches: 12, goals: 3, assists: 2, yellowCards: 0, redCards: 0, rating: 7.0 } },
  { id: 'p25', clubId: 'c1', name: 'Luiz Henrique',       shirtNumber: 99, position: 'ATA', status: 'ACTIVE',    documentStatus: 'REJECTED', birthDate: '2001-02-13', photoUrl: 'https://picsum.photos/seed/p25/150/150', stats: { matches: 8,  goals: 2, assists: 1, yellowCards: 0, redCards: 0, rating: 6.8 } },

  // ── União da Várzea (c2) ─────────────────────────────────────────────────
  // Goleiros
  { id: 'p26', clubId: 'c2', name: 'Everson Ribeiro',     shirtNumber: 1,  position: 'GOL', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1990-07-22', photoUrl: 'https://picsum.photos/seed/p26/150/150', stats: { matches: 25, goals: 0, assists: 0, yellowCards: 2, redCards: 0, rating: 8.2 } },
  { id: 'p27', clubId: 'c2', name: 'Tiago Volpi',         shirtNumber: 12, position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1988-03-01', photoUrl: 'https://picsum.photos/seed/p27/150/150', stats: { matches: 10, goals: 0, assists: 0, yellowCards: 1, redCards: 0, rating: 7.6 } },
  { id: 'p28', clubId: 'c2', name: 'Gatito Fernández',    shirtNumber: 22, position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1988-02-01', photoUrl: 'https://picsum.photos/seed/p28/150/150', stats: { matches: 4,  goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 7.2 } },
  // Laterais direitos
  { id: 'p29', clubId: 'c2', name: 'Maicon Rodrigues',    shirtNumber: 2,  position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1981-07-14', photoUrl: 'https://picsum.photos/seed/p29/150/150', stats: { matches: 22, goals: 1, assists: 4, yellowCards: 2, redCards: 0, rating: 7.4 } },
  { id: 'p30', clubId: 'c2', name: 'Pará Neto',           shirtNumber: 13, position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1986-04-10', photoUrl: 'https://picsum.photos/seed/p30/150/150', stats: { matches: 15, goals: 0, assists: 2, yellowCards: 1, redCards: 0, rating: 6.9 } },
  // Laterais esquerdos
  { id: 'p31', clubId: 'c2', name: 'Ayrton Lucas',        shirtNumber: 6,  position: 'LE',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-07-04', photoUrl: 'https://picsum.photos/seed/p31/150/150', stats: { matches: 24, goals: 2, assists: 5, yellowCards: 2, redCards: 0, rating: 7.7 } },
  { id: 'p32', clubId: 'c2', name: 'Guilherme Arana',     shirtNumber: 16, position: 'LE',  status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1997-04-14', photoUrl: 'https://picsum.photos/seed/p32/150/150', stats: { matches: 12, goals: 0, assists: 3, yellowCards: 1, redCards: 0, rating: 7.1 } },
  // Zagueiros
  { id: 'p33', clubId: 'c2', name: 'Dedé Vasconcelos',    shirtNumber: 3,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-12-23', photoUrl: 'https://picsum.photos/seed/p33/150/150', stats: { matches: 20, goals: 1, assists: 0, yellowCards: 3, redCards: 0, rating: 7.5 } },
  { id: 'p34', clubId: 'c2', name: 'Pablo Marí',          shirtNumber: 4,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1993-08-31', photoUrl: 'https://picsum.photos/seed/p34/150/150', stats: { matches: 23, goals: 2, assists: 0, yellowCards: 2, redCards: 0, rating: 7.3 } },
  { id: 'p35', clubId: 'c2', name: 'Réver Humberto',      shirtNumber: 14, position: 'ZAG', status: 'SUSPENDED', documentStatus: 'APPROVED', birthDate: '1984-07-08', photoUrl: 'https://picsum.photos/seed/p35/150/150', stats: { matches: 11, goals: 0, assists: 0, yellowCards: 5, redCards: 1, rating: 6.5 } },
  { id: 'p36', clubId: 'c2', name: 'Léo Pereira',         shirtNumber: 17, position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1996-05-24', photoUrl: 'https://picsum.photos/seed/p36/150/150', stats: { matches: 26, goals: 3, assists: 1, yellowCards: 4, redCards: 0, rating: 7.8 } },
  { id: 'p37', clubId: 'c2', name: 'Cuesta García',       shirtNumber: 15, position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1995-11-17', photoUrl: 'https://picsum.photos/seed/p37/150/150', stats: { matches: 18, goals: 1, assists: 0, yellowCards: 2, redCards: 0, rating: 7.2 } },
  // Volantes
  { id: 'p38', clubId: 'c2', name: 'Felipe Melo',         shirtNumber: 5,  position: 'VOL', status: 'SUSPENDED', documentStatus: 'APPROVED', birthDate: '1983-06-26', photoUrl: 'https://picsum.photos/seed/p38/150/150', stats: { matches: 15, goals: 1, assists: 2, yellowCards: 8, redCards: 3, rating: 6.8 } },
  { id: 'p39', clubId: 'c2', name: 'Ederson Moraes',      shirtNumber: 8,  position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1993-08-17', photoUrl: 'https://picsum.photos/seed/p39/150/150', stats: { matches: 20, goals: 0, assists: 3, yellowCards: 2, redCards: 0, rating: 7.0 } },
  { id: 'p40', clubId: 'c2', name: 'Tchê Tchê',           shirtNumber: 18, position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1992-07-29', photoUrl: 'https://picsum.photos/seed/p40/150/150', stats: { matches: 22, goals: 2, assists: 4, yellowCards: 3, redCards: 0, rating: 7.4 } },
  // Meias
  { id: 'p41', clubId: 'c2', name: 'Rodrigo Lindoso',     shirtNumber: 10, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-12-16', photoUrl: 'https://picsum.photos/seed/p41/150/150', stats: { matches: 19, goals: 3, assists: 6, yellowCards: 2, redCards: 0, rating: 7.3 } },
  { id: 'p42', clubId: 'c2', name: 'Diego Tardelli',      shirtNumber: 9,  position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1985-06-10', photoUrl: 'https://picsum.photos/seed/p42/150/150', stats: { matches: 17, goals: 4, assists: 3, yellowCards: 1, redCards: 0, rating: 7.1 } },
  { id: 'p43', clubId: 'c2', name: 'Elias Figueiredo',    shirtNumber: 11, position: 'MEI', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1986-03-25', photoUrl: 'https://picsum.photos/seed/p43/150/150', stats: { matches: 14, goals: 1, assists: 5, yellowCards: 2, redCards: 0, rating: 6.9 } },
  { id: 'p44', clubId: 'c2', name: 'Lucca de Abreu',      shirtNumber: 20, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1994-10-12', photoUrl: 'https://picsum.photos/seed/p44/150/150', stats: { matches: 11, goals: 2, assists: 2, yellowCards: 0, redCards: 0, rating: 6.7 } },
  // Atacantes
  { id: 'p45', clubId: 'c2', name: 'Hulk Paraíba',        shirtNumber: 7,  position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1986-07-25', photoUrl: 'https://picsum.photos/seed/p45/150/150', stats: { matches: 28, goals: 25, assists: 9, yellowCards: 1, redCards: 0, rating: 9.2 } },
  { id: 'p46', clubId: 'c2', name: 'Gilberto Silva',      shirtNumber: 99, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1988-04-05', photoUrl: 'https://picsum.photos/seed/p46/150/150', stats: { matches: 24, goals: 12, assists: 4, yellowCards: 2, redCards: 0, rating: 7.8 } },
  { id: 'p47', clubId: 'c2', name: 'Salomão Pereira',     shirtNumber: 19, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1992-11-30', photoUrl: 'https://picsum.photos/seed/p47/150/150', stats: { matches: 18, goals: 7, assists: 3, yellowCards: 3, redCards: 0, rating: 7.2 } },
  { id: 'p48', clubId: 'c2', name: 'Henrique Dourado',    shirtNumber: 23, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1991-07-28', photoUrl: 'https://picsum.photos/seed/p48/150/150', stats: { matches: 15, goals: 5, assists: 2, yellowCards: 1, redCards: 0, rating: 7.0 } },
  { id: 'p49', clubId: 'c2', name: 'Brenner Souza',       shirtNumber: 27, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '2000-07-13', photoUrl: 'https://picsum.photos/seed/p49/150/150', stats: { matches: 10, goals: 3, assists: 1, yellowCards: 0, redCards: 0, rating: 6.8 } },
  { id: 'p50', clubId: 'c2', name: 'Warleson Gomes',      shirtNumber: 21, position: 'ATA', status: 'ACTIVE',    documentStatus: 'REJECTED', birthDate: '2001-09-25', photoUrl: 'https://picsum.photos/seed/p50/150/150', stats: { matches: 6,  goals: 1, assists: 0, yellowCards: 0, redCards: 0, rating: 6.4 } },

  // ── Real Madrid da Quebrada (c3) ─────────────────────────────────────────
  // Goleiros
  { id: 'p51', clubId: 'c3', name: 'Cássio Ramos',        shirtNumber: 1,  position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-06-06', photoUrl: 'https://picsum.photos/seed/p51/150/150', stats: { matches: 32, goals: 0, assists: 0, yellowCards: 1, redCards: 0, rating: 9.0 } },
  { id: 'p52', clubId: 'c3', name: 'Jandrei Cardoso',     shirtNumber: 12, position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1992-11-14', photoUrl: 'https://picsum.photos/seed/p52/150/150', stats: { matches: 8,  goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 7.8 } },
  { id: 'p53', clubId: 'c3', name: 'Ivan Feijão',         shirtNumber: 22, position: 'GOL', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1993-09-11', photoUrl: 'https://picsum.photos/seed/p53/150/150', stats: { matches: 2,  goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 7.0 } },
  // Laterais direitos
  { id: 'p54', clubId: 'c3', name: 'Fagner Conserva',     shirtNumber: 2,  position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1989-06-11', photoUrl: 'https://picsum.photos/seed/p54/150/150', stats: { matches: 30, goals: 2, assists: 7, yellowCards: 3, redCards: 0, rating: 8.4 } },
  { id: 'p55', clubId: 'c3', name: 'Rafinha Alcântara',   shirtNumber: 13, position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1989-09-07', photoUrl: 'https://picsum.photos/seed/p55/150/150', stats: { matches: 22, goals: 1, assists: 5, yellowCards: 2, redCards: 0, rating: 7.9 } },
  // Laterais esquerdos
  { id: 'p56', clubId: 'c3', name: 'Jorge Luís',          shirtNumber: 6,  position: 'LE',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1996-11-23', photoUrl: 'https://picsum.photos/seed/p56/150/150', stats: { matches: 25, goals: 1, assists: 6, yellowCards: 2, redCards: 0, rating: 7.8 } },
  { id: 'p57', clubId: 'c3', name: 'Filipe Luís',         shirtNumber: 16, position: 'LE',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1985-08-09', photoUrl: 'https://picsum.photos/seed/p57/150/150', stats: { matches: 20, goals: 0, assists: 4, yellowCards: 1, redCards: 0, rating: 8.0 } },
  // Zagueiros
  { id: 'p58', clubId: 'c3', name: 'Gil Fernando',        shirtNumber: 3,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-06-10', photoUrl: 'https://picsum.photos/seed/p58/150/150', stats: { matches: 31, goals: 2, assists: 0, yellowCards: 3, redCards: 0, rating: 8.2 } },
  { id: 'p59', clubId: 'c3', name: 'Rafael Tolói',        shirtNumber: 4,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1990-10-05', photoUrl: 'https://picsum.photos/seed/p59/150/150', stats: { matches: 28, goals: 1, assists: 0, yellowCards: 2, redCards: 0, rating: 8.0 } },
  { id: 'p60', clubId: 'c3', name: 'Rodrigo Becão',       shirtNumber: 5,  position: 'ZAG', status: 'SUSPENDED', documentStatus: 'APPROVED', birthDate: '1996-12-26', photoUrl: 'https://picsum.photos/seed/p60/150/150', stats: { matches: 18, goals: 1, assists: 0, yellowCards: 6, redCards: 1, rating: 7.5 } },
  { id: 'p61', clubId: 'c3', name: 'Éder Militão',        shirtNumber: 14, position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1998-01-18', photoUrl: 'https://picsum.photos/seed/p61/150/150', stats: { matches: 29, goals: 3, assists: 1, yellowCards: 2, redCards: 0, rating: 8.6 } },
  { id: 'p62', clubId: 'c3', name: 'Lucas Veríssimo',     shirtNumber: 17, position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1995-08-23', photoUrl: 'https://picsum.photos/seed/p62/150/150', stats: { matches: 24, goals: 2, assists: 0, yellowCards: 4, redCards: 0, rating: 7.7 } },
  // Volantes
  { id: 'p63', clubId: 'c3', name: 'Caio Alexandre',      shirtNumber: 8,  position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1998-06-25', photoUrl: 'https://picsum.photos/seed/p63/150/150', stats: { matches: 27, goals: 2, assists: 4, yellowCards: 2, redCards: 0, rating: 7.9 } },
  { id: 'p64', clubId: 'c3', name: 'Rodrigo Dourado',     shirtNumber: 15, position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-02-24', photoUrl: 'https://picsum.photos/seed/p64/150/150', stats: { matches: 23, goals: 1, assists: 3, yellowCards: 3, redCards: 0, rating: 7.5 } },
  { id: 'p65', clubId: 'c3', name: 'Matheus Henrique',    shirtNumber: 18, position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1999-05-25', photoUrl: 'https://picsum.photos/seed/p65/150/150', stats: { matches: 20, goals: 0, assists: 2, yellowCards: 1, redCards: 0, rating: 7.3 } },
  { id: 'p66', clubId: 'c3', name: 'Wellington Santos',   shirtNumber: 28, position: 'VOL', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1993-08-10', photoUrl: 'https://picsum.photos/seed/p66/150/150', stats: { matches: 15, goals: 1, assists: 1, yellowCards: 2, redCards: 0, rating: 7.0 } },
  // Meias
  { id: 'p67', clubId: 'c3', name: 'Oscar dos Santos',    shirtNumber: 10, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1991-09-09', photoUrl: 'https://picsum.photos/seed/p67/150/150', stats: { matches: 30, goals: 8, assists: 16, yellowCards: 2, redCards: 0, rating: 9.1 } },
  { id: 'p68', clubId: 'c3', name: 'Claudinho Leite',     shirtNumber: 7,  position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-04-12', photoUrl: 'https://picsum.photos/seed/p68/150/150', stats: { matches: 28, goals: 6, assists: 10, yellowCards: 1, redCards: 0, rating: 8.8 } },
  { id: 'p69', clubId: 'c3', name: 'Pedrinho Oliveira',   shirtNumber: 11, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '2000-03-08', photoUrl: 'https://picsum.photos/seed/p69/150/150', stats: { matches: 22, goals: 5, assists: 8, yellowCards: 2, redCards: 0, rating: 8.3 } },
  { id: 'p70', clubId: 'c3', name: 'Bruno Tabata',        shirtNumber: 20, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1999-01-16', photoUrl: 'https://picsum.photos/seed/p70/150/150', stats: { matches: 19, goals: 4, assists: 7, yellowCards: 1, redCards: 0, rating: 7.9 } },
  { id: 'p71', clubId: 'c3', name: 'De Arrascaeta',       shirtNumber: 21, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1994-06-01', photoUrl: 'https://picsum.photos/seed/p71/150/150', stats: { matches: 26, goals: 9, assists: 12, yellowCards: 2, redCards: 0, rating: 9.0 } },
  // Atacantes
  { id: 'p72', clubId: 'c3', name: 'Michael Arcanjo',     shirtNumber: 9,  position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-08-09', photoUrl: 'https://picsum.photos/seed/p72/150/150', stats: { matches: 27, goals: 20, assists: 8, yellowCards: 3, redCards: 0, rating: 9.2 } },
  { id: 'p73', clubId: 'c3', name: 'Rony Aparecido',      shirtNumber: 19, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1995-09-16', photoUrl: 'https://picsum.photos/seed/p73/150/150', stats: { matches: 25, goals: 15, assists: 6, yellowCards: 2, redCards: 0, rating: 8.7 } },
  { id: 'p74', clubId: 'c3', name: 'Deyverson Brum',      shirtNumber: 27, position: 'ATA', status: 'SUSPENDED', documentStatus: 'APPROVED', birthDate: '1991-05-08', photoUrl: 'https://picsum.photos/seed/p74/150/150', stats: { matches: 16, goals: 8, assists: 2, yellowCards: 5, redCards: 2, rating: 7.6 } },
  { id: 'p75', clubId: 'c3', name: 'Keno Éverton',        shirtNumber: 99, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1990-12-22', photoUrl: 'https://picsum.photos/seed/p75/150/150', stats: { matches: 20, goals: 11, assists: 4, yellowCards: 1, redCards: 0, rating: 8.1 } },

  // ── Santos do Morro (c4) ─────────────────────────────────────────────────
  // Goleiros
  { id: 'p76', clubId: 'c4', name: 'Hugo Souza',          shirtNumber: 1,  position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '2000-02-02', photoUrl: 'https://picsum.photos/seed/p76/150/150', stats: { matches: 20, goals: 0, assists: 0, yellowCards: 2, redCards: 0, rating: 6.8 } },
  { id: 'p77', clubId: 'c4', name: 'Santos Pereira',      shirtNumber: 12, position: 'GOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1994-08-15', photoUrl: 'https://picsum.photos/seed/p77/150/150', stats: { matches: 8,  goals: 0, assists: 0, yellowCards: 1, redCards: 0, rating: 6.4 } },
  { id: 'p78', clubId: 'c4', name: 'Murilo Cerqueira',    shirtNumber: 22, position: 'GOL', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '2003-06-20', photoUrl: 'https://picsum.photos/seed/p78/150/150', stats: { matches: 1,  goals: 0, assists: 0, yellowCards: 0, redCards: 0, rating: 6.0 } },
  // Laterais direitos
  { id: 'p79', clubId: 'c4', name: 'Nino Rafael',         shirtNumber: 2,  position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1997-07-24', photoUrl: 'https://picsum.photos/seed/p79/150/150', stats: { matches: 18, goals: 0, assists: 1, yellowCards: 3, redCards: 0, rating: 6.2 } },
  { id: 'p80', clubId: 'c4', name: 'Rafaelson Costa',     shirtNumber: 13, position: 'LD',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '2001-03-12', photoUrl: 'https://picsum.photos/seed/p80/150/150', stats: { matches: 12, goals: 0, assists: 0, yellowCards: 2, redCards: 0, rating: 6.0 } },
  // Laterais esquerdos
  { id: 'p81', clubId: 'c4', name: 'Lucas Esteves',       shirtNumber: 6,  position: 'LE',  status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '2000-10-14', photoUrl: 'https://picsum.photos/seed/p81/150/150', stats: { matches: 17, goals: 0, assists: 2, yellowCards: 1, redCards: 0, rating: 6.3 } },
  { id: 'p82', clubId: 'c4', name: 'Marlon Santos',       shirtNumber: 16, position: 'LE',  status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1995-09-14', photoUrl: 'https://picsum.photos/seed/p82/150/150', stats: { matches: 10, goals: 0, assists: 1, yellowCards: 2, redCards: 0, rating: 5.9 } },
  // Zagueiros
  { id: 'p83', clubId: 'c4', name: 'Rodrigo Ponce',       shirtNumber: 3,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1992-01-18', photoUrl: 'https://picsum.photos/seed/p83/150/150', stats: { matches: 19, goals: 1, assists: 0, yellowCards: 4, redCards: 0, rating: 6.5 } },
  { id: 'p84', clubId: 'c4', name: 'Eduardo Oliveira',    shirtNumber: 4,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1989-03-25', photoUrl: 'https://picsum.photos/seed/p84/150/150', stats: { matches: 20, goals: 0, assists: 0, yellowCards: 3, redCards: 1, rating: 6.1 } },
  { id: 'p85', clubId: 'c4', name: 'Luan Santana',        shirtNumber: 5,  position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1991-10-22', photoUrl: 'https://picsum.photos/seed/p85/150/150', stats: { matches: 15, goals: 0, assists: 0, yellowCards: 3, redCards: 0, rating: 6.0 } },
  { id: 'p86', clubId: 'c4', name: 'Murillo Gonçalves',   shirtNumber: 14, position: 'ZAG', status: 'SUSPENDED', documentStatus: 'APPROVED', birthDate: '2002-05-20', photoUrl: 'https://picsum.photos/seed/p86/150/150', stats: { matches: 10, goals: 0, assists: 0, yellowCards: 5, redCards: 1, rating: 5.8 } },
  { id: 'p87', clubId: 'c4', name: 'Léo Santos',          shirtNumber: 17, position: 'ZAG', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1994-12-30', photoUrl: 'https://picsum.photos/seed/p87/150/150', stats: { matches: 14, goals: 1, assists: 0, yellowCards: 2, redCards: 0, rating: 6.2 } },
  // Volantes
  { id: 'p88', clubId: 'c4', name: 'Raniel Lima',         shirtNumber: 8,  position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1996-05-19', photoUrl: 'https://picsum.photos/seed/p88/150/150', stats: { matches: 18, goals: 1, assists: 1, yellowCards: 4, redCards: 0, rating: 6.4 } },
  { id: 'p89', clubId: 'c4', name: 'Bruno Viana',         shirtNumber: 15, position: 'VOL', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1994-03-14', photoUrl: 'https://picsum.photos/seed/p89/150/150', stats: { matches: 16, goals: 0, assists: 2, yellowCards: 3, redCards: 0, rating: 6.1 } },
  { id: 'p90', clubId: 'c4', name: 'João Pedro Lima',     shirtNumber: 18, position: 'VOL', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '2001-11-08', photoUrl: 'https://picsum.photos/seed/p90/150/150', stats: { matches: 10, goals: 0, assists: 1, yellowCards: 1, redCards: 0, rating: 5.9 } },
  // Meias
  { id: 'p91', clubId: 'c4', name: 'Carlos Eduardo',      shirtNumber: 10, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-03-09', photoUrl: 'https://picsum.photos/seed/p91/150/150', stats: { matches: 19, goals: 2, assists: 4, yellowCards: 2, redCards: 0, rating: 6.6 } },
  { id: 'p92', clubId: 'c4', name: 'Marquinhos Gabriel',  shirtNumber: 11, position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1990-07-10', photoUrl: 'https://picsum.photos/seed/p92/150/150', stats: { matches: 17, goals: 3, assists: 3, yellowCards: 2, redCards: 0, rating: 6.7 } },
  { id: 'p93', clubId: 'c4', name: 'Rodrigo Pimpão',      shirtNumber: 7,  position: 'MEI', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1987-05-11', photoUrl: 'https://picsum.photos/seed/p93/150/150', stats: { matches: 15, goals: 1, assists: 2, yellowCards: 1, redCards: 0, rating: 6.3 } },
  { id: 'p94', clubId: 'c4', name: 'Sassá Ferreira',      shirtNumber: 20, position: 'MEI', status: 'ACTIVE',    documentStatus: 'PENDING',  birthDate: '1988-12-08', photoUrl: 'https://picsum.photos/seed/p94/150/150', stats: { matches: 12, goals: 1, assists: 1, yellowCards: 1, redCards: 0, rating: 6.0 } },
  // Atacantes
  { id: 'p95', clubId: 'c4', name: 'Rafael Sobis',        shirtNumber: 9,  position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1985-03-03', photoUrl: 'https://picsum.photos/seed/p95/150/150', stats: { matches: 20, goals: 6, assists: 3, yellowCards: 2, redCards: 0, rating: 7.0 } },
  { id: 'p96', clubId: 'c4', name: 'Lima Barreto',        shirtNumber: 19, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1993-06-27', photoUrl: 'https://picsum.photos/seed/p96/150/150', stats: { matches: 16, goals: 4, assists: 2, yellowCards: 3, redCards: 0, rating: 6.5 } },
  { id: 'p97', clubId: 'c4', name: 'Rafael Moura',        shirtNumber: 23, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1984-01-29', photoUrl: 'https://picsum.photos/seed/p97/150/150', stats: { matches: 14, goals: 3, assists: 1, yellowCards: 2, redCards: 0, rating: 6.4 } },
  { id: 'p98', clubId: 'c4', name: 'Pablo Thomaz',        shirtNumber: 27, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1991-02-17', photoUrl: 'https://picsum.photos/seed/p98/150/150', stats: { matches: 10, goals: 2, assists: 0, yellowCards: 1, redCards: 0, rating: 6.1 } },
  { id: 'p99', clubId: 'c4', name: 'Kleber Gladiador',    shirtNumber: 99, position: 'ATA', status: 'ACTIVE',    documentStatus: 'APPROVED', birthDate: '1982-05-20', photoUrl: 'https://picsum.photos/seed/p99/150/150', stats: { matches: 8,  goals: 1, assists: 0, yellowCards: 0, redCards: 0, rating: 5.8 } },
  { id: 'p100',clubId: 'c4', name: 'Caio Henrique',       shirtNumber: 21, position: 'MEI', status: 'ACTIVE',    documentStatus: 'REJECTED', birthDate: '1999-04-22', photoUrl: 'https://picsum.photos/seed/p100/150/150',stats: { matches: 5,  goals: 0, assists: 1, yellowCards: 0, redCards: 0, rating: 5.7 } },
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
  {
    id: 'm5',
    championshipId: 'ch1',
    homeTeamId: 'c1',
    awayTeamId: 'c4',
    date: '2026-05-01',
    time: '16:00',
    location: 'Campo do XV',
    venueId: 'v1',
    status: 'FINISHED',
    refereeId: 'r2',
    score: { home: 3, away: 2 },
    reportStatus: 'AWAITING_VALIDATION',
    reportPublishedAt: '2026-05-01T18:00:00Z',
    validations: {
      home: { status: 'PENDING' },
      away: { status: 'PENDING' }
    }
  },
];
