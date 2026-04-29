/**
 * Token de check-in (demo): o mesmo segredo deve estar em CHECKIN_HMAC_SECRET na Edge `checkin-validate`.
 * Em produção, emita o token apenas no backend (nova Edge Function com JWT de árbitro).
 */
export async function buildCheckinToken(
  matchId: string,
  playerId: string,
  secret: string
): Promise<string> {
  const msg = `${matchId}:${playerId}:${secret}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getCheckinDevSecret(): string {
  return (import.meta.env.VITE_CHECKIN_DEV_SECRET as string | undefined) ?? 'dev-checkin-secret';
}
