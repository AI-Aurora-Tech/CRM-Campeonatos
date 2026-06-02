import type { Championship, QualificationZone } from '../types';

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
