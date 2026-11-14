import type { Jour } from './commun';
import type { ColonneDeTicket } from './cockpit';

/**
 * H03 · MISSIONS ET TICKETS (kanban) — l'ordre d'une colonne et le déplacement d'une carte (fiche H03).
 *
 * Dans une colonne : les urgentes d'abord, puis l'ordre choisi à la main (`ordre`, 0 en haut), puis l'identifiant
 * (pour que l'ordre ne bouge jamais d'un rendu à l'autre). Une carte qui arrive dans « Terminé » prend le jour de sa
 * fin ; celle qui en sort le perd. Jamais l'inverse, jamais de date rétroactive.
 */

export interface TicketDuKanban {
  id: string;
  colonne: ColonneDeTicket;
  urgent: boolean;
  ordre: number;
  termineLe: Jour | null;
}

export function trierLaColonne<T extends Pick<TicketDuKanban, 'id' | 'urgent' | 'ordre'>>(tickets: readonly T[]): T[] {
  return [...tickets].sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.ordre - b.ordre || a.id.localeCompare(b.id));
}

/** La carte déplacée vers une colonne, en bas de celle-ci (`ordre` = nombre de cartes qu'elle contient déjà). */
export function deplacer<T extends TicketDuKanban>(ticket: T, vers: ColonneDeTicket, aujourdhui: Jour, cartesDeLaColonne: number): T {
  if (ticket.colonne === vers) return ticket;
  return { ...ticket, colonne: vers, ordre: cartesDeLaColonne, termineLe: vers === 'termine' ? aujourdhui : null };
}
