import type { GardeJournalEntree } from '../../shared/garde';

/**
 * LA DERNIÈRE RONDE D'UNE ORGANISATION (LOT-08 ; STATUT §1.8 n° 3) — pure.
 *
 * L'API ne donne pas de ronde par organisation (`derniereRondeAt` est celui de
 * la garde, pour tout le parc). La règle décidée : la dernière entrée de ronde
 * de `garde.journal({ org })`, c'est-à-dire la plus récente ligne de journal de
 * l'organisation qui porte un `rondeId`.
 *
 * `null` = aucune ronde connue : l'écran écrit « non disponible », il ne
 * suppose ni un retard ni un passage.
 */
export interface DerniereRonde {
  at: string;
  rondeId: string;
  agent: string;
  equipe: string;
}

export function derniereRondeDOrganisation(journal: readonly GardeJournalEntree[], orgId: string): DerniereRonde | null {
  let meilleure: GardeJournalEntree | null = null;
  for (const j of journal) {
    if (j.orgId !== orgId || !j.rondeId) continue;
    if (!meilleure || j.createdAt > meilleure.createdAt) meilleure = j;
  }
  return meilleure ? { at: meilleure.createdAt, rondeId: meilleure.rondeId as string, agent: meilleure.agent, equipe: meilleure.equipe } : null;
}

/** Toutes les organisations d'un coup : un seul passage sur le journal. */
export function dernieresRondesParOrganisation(journal: readonly GardeJournalEntree[]): Map<string, DerniereRonde> {
  const out = new Map<string, DerniereRonde>();
  for (const j of journal) {
    if (!j.orgId || !j.rondeId) continue;
    const avant = out.get(j.orgId);
    if (!avant || j.createdAt > avant.at) out.set(j.orgId, { at: j.createdAt, rondeId: j.rondeId, agent: j.agent, equipe: j.equipe });
  }
  return out;
}
