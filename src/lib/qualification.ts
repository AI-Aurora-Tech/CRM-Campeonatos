import type { Championship, QualificationZone, Standing } from '../types';

/** Cores padrão sugeridas por tipo de zona. */
export const ZONE_TYPE_PRESETS: Record<
  QualificationZone['type'],
  { label: string; color: string }
> = {
  QUALIFIED: { label: 'Classificação direta', color: '#16a34a' },
  PLAYOFF: { label: 'Playoff (Mata-mata)', color: '#f59e0b' },
  ELIMINATED: { label: 'Eliminados', color: '#dc2626' },
};

/**
 * Retorna a zona de classificação para uma posição (1-based) na tabela,
 * conforme as regras personalizadas do campeonato. Null se não houver regra.
 */
export function zoneForPosition(
  rules: Championship['rules'] | undefined,
  position: number
): QualificationZone | null {
  const q = rules?.qualification;
  if (!q || !q.enabled || !q.zones?.length) return null;
  return q.zones.find((z) => position >= z.from && position <= z.to) ?? null;
}

export interface PlayoffPair {
  homeTeamId: string;
  awayTeamId: string;
  seedLabel: string; // ex.: "6º x 10º"
}

/**
 * Monta os confrontos do mata-mata a partir da classificação:
 * pega os times nas posições das zonas do tipo PLAYOFF (na ordem da tabela)
 * e cruza por seeding (melhor x pior). Se sobrar um time (nº ímpar),
 * ele avança de bye (sem jogo). Retorna [] se não houver zona PLAYOFF.
 */
export function buildPlayoffPairs(
  rules: Championship['rules'] | undefined,
  standings: Standing[]
): PlayoffPair[] {
  const q = rules?.qualification;
  if (!q || !q.enabled || !q.zones?.length) return [];

  const seeds: { pos: number; teamId: string }[] = [];
  standings.forEach((s, idx) => {
    const zone = zoneForPosition(rules, idx + 1);
    if (zone?.type === 'PLAYOFF') seeds.push({ pos: idx + 1, teamId: s.teamId });
  });
  if (seeds.length < 2) return [];

  const pairs: PlayoffPair[] = [];
  let i = 0;
  let j = seeds.length - 1;
  while (i < j) {
    pairs.push({
      homeTeamId: seeds[i].teamId,
      awayTeamId: seeds[j].teamId,
      seedLabel: `${seeds[i].pos}º x ${seeds[j].pos}º`,
    });
    i++;
    j--;
  }
  return pairs;
}
