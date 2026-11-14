/**
 * MJ05 · RAPPELS — l'état d'un rappel à un instant donné (fiche MJ05).
 *
 * Un rappel n'est jamais « en retard » à l'écran : s'il est passé et pas fait, il est « à reprendre » — la phrase dit
 * la suite (« Tu veux le décaler ? »), jamais le reproche (guide de voix du socle). Il se déclenche `avanceeMin`
 * minutes AVANT son heure.
 */

export type EtatDeRappel = 'a-venir' | 'bientot' | 'a-reprendre' | 'fait';

export interface RappelDuLot {
  fait: boolean;
  /** Instant du rappel (ISO). */
  quandAt: string;
  /** Combien de temps avant l'heure le rappel se déclenche (minutes). */
  avanceeMin: number;
}

const MS_MINUTE = 60_000;

export function etatDuRappel(r: RappelDuLot, maintenant: number): EtatDeRappel {
  if (r.fait) return 'fait';
  const quand = Date.parse(r.quandAt);
  if (maintenant >= quand) return 'a-reprendre';
  return maintenant >= quand - r.avanceeMin * MS_MINUTE ? 'bientot' : 'a-venir';
}

/** Les rappels à montrer d'abord : à reprendre, puis bientôt, puis à venir ; les faits à la fin. À état égal, du plus proche au plus lointain. */
export function ordreDesRappels<R extends RappelDuLot & { id: string }>(rappels: readonly R[], maintenant: number): R[] {
  const rang: Record<EtatDeRappel, number> = { 'a-reprendre': 0, bientot: 1, 'a-venir': 2, fait: 3 };
  return [...rappels].sort(
    (a, b) => rang[etatDuRappel(a, maintenant)] - rang[etatDuRappel(b, maintenant)] || Date.parse(a.quandAt) - Date.parse(b.quandAt) || a.id.localeCompare(b.id),
  );
}
