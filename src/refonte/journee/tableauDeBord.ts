import { ajouterJours, debutDeMois, ecartPourcent, jourDeParis, somme, type Jour } from './commun';
import { CARTES_VISIBLES, type TicketDuCockpit } from './cockpit';

/**
 * H25 · LE TABLEAU DE BORD D'UN CLIENT — widgets calculés (fiche H25, rubrique 6).
 *
 * Écran calculé (SIM : `attendusTableauDeBord`). Chaque widget est une fonction de ses sources ; la DISPOSITION des
 * widgets (quels widgets, dans quel ordre, de quelle taille) est un réglage de la personne : le format de la grille
 * est « à confirmer dans le code » (fiche H25) et vit dans `manque`.
 *
 * Trois lignes visibles par liste, puis « + n autres » (jamais une liste qui défile sans fin dans un widget).
 */

export interface EntreeTableauDeBord {
  aujourdhui: Jour;
  /** Instant « maintenant » (ISO), pour le prochain rendez-vous. */
  maintenant: string;
  email: string;
  paiements: readonly { etat: string; date: string; montantCents: number }[];
  tickets: readonly (TicketDuCockpit & { termineLe?: Jour | null })[];
  factures: readonly { status: string; soldeCents: number; clientNom: string; number: string; paidAt: Jour | '' | null }[];
  devis: readonly { status: string; sentAt: string | null }[];
  taches: readonly { assigneeEmail: string; status: string; echeance: Jour | null; faiteAt: string | null }[];
  evenements: readonly { id: string; startAt: string; systeme: boolean }[];
  /** La série, calculée ailleurs par la règle unique. */
  serie: number;
}

export type TypeDActivite = 'facture-encaissee' | 'devis-envoye' | 'ticket-resolu';

export interface ActiviteRecente {
  type: TypeDActivite;
  /** Le numéro de la facture, quand il y en a un. */
  reference: string | null;
  jour: Jour;
}

export interface TableauDeBord {
  chiffreAffaires: { cents: number; ecartPourcent: number | null };
  tickets: { visibles: string[]; autres: number };
  /** Clients avec facture impayée, du plus gros montant au plus petit (*Proposition*). */
  facturesImpayees: { visibles: { clientNom: string; soldeCents: number }[]; autres: number; totalCents: number };
  /** « Mes tâches » : n faites sur N tâches du jour, et la série en jours. */
  mesTaches: { faites: number; total: number; serie: number };
  prochainRendezVous: { id: string; debut: string } | null;
  activiteRecente: ActiviteRecente[];
  manque: string[];
}

/** À instant égal : les factures encaissées, puis les devis, puis les tickets. */
const RANG_D_ACTIVITE: Record<TypeDActivite, number> = { 'facture-encaissee': 0, 'devis-envoye': 1, 'ticket-resolu': 2 };

/** Cinq lignes d'activité au plus. */
export const LIGNES_D_ACTIVITE = 5;

export function tableauDeBord(e: EntreeTableauDeBord): TableauDeBord {
  const mois = e.aujourdhui.slice(0, 7);
  const quantieme = Number(e.aujourdhui.slice(8));
  const moisPrecedent = ajouterJours(debutDeMois(e.aujourdhui), -1).slice(0, 7);
  // Le chiffre d'affaires du mois À DATE, comparé au mois précédent au MÊME quantième (pas au mois entier).
  const encaisseA = (prefixe: string): number =>
    somme(e.paiements.filter((p) => p.etat === 'réussi' && jourDeParis(p.date).startsWith(prefixe) && Number(jourDeParis(p.date).slice(8)) <= quantieme).map((p) => p.montantCents));

  const ouverts = e.tickets
    .filter((t) => t.colonne !== 'termine')
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.ordre - b.ordre || a.id.localeCompare(b.id));

  const parClient = new Map<string, number>();
  for (const f of e.factures) if (f.status === 'issued' && f.soldeCents > 0) parClient.set(f.clientNom, (parClient.get(f.clientNom) ?? 0) + f.soldeCents);
  const impayes = [...parClient.entries()]
    .map(([clientNom, soldeCents]) => ({ clientNom, soldeCents }))
    .sort((a, b) => b.soldeCents - a.soldeCents || a.clientNom.localeCompare(b.clientNom));

  const duJour = e.taches.filter((t) => t.assigneeEmail === e.email && (t.echeance === e.aujourdhui || (t.status === 'done' && t.faiteAt !== null && jourDeParis(t.faiteAt) === e.aujourdhui)));
  const maintenantMs = Date.parse(e.maintenant);
  const suivant = [...e.evenements]
    .filter((x) => Date.parse(x.startAt) > maintenantMs && !x.systeme)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt) || a.id.localeCompare(b.id))[0];

  const evenements: (ActiviteRecente & { at: number })[] = [
    ...e.factures.filter((f) => f.status === 'paid' && f.paidAt).map((f) => ({ type: 'facture-encaissee' as const, reference: f.number, jour: f.paidAt as Jour, at: Date.parse(`${f.paidAt}T12:00:00Z`) })),
    ...e.devis.filter((d) => d.status === 'sent' && d.sentAt).map((d) => ({ type: 'devis-envoye' as const, reference: null, jour: jourDeParis(d.sentAt as string), at: Date.parse(d.sentAt as string) })),
    ...e.tickets.filter((t) => t.termineLe).map((t) => ({ type: 'ticket-resolu' as const, reference: null, jour: t.termineLe as Jour, at: Date.parse(`${t.termineLe}T12:00:00Z`) })),
  ];

  return {
    chiffreAffaires: { cents: encaisseA(mois), ecartPourcent: ecartPourcent(encaisseA(mois), encaisseA(moisPrecedent)) },
    tickets: { visibles: ouverts.slice(0, CARTES_VISIBLES).map((t) => t.id), autres: Math.max(0, ouverts.length - CARTES_VISIBLES) },
    facturesImpayees: { visibles: impayes.slice(0, CARTES_VISIBLES), autres: Math.max(0, impayes.length - CARTES_VISIBLES), totalCents: somme(impayes.map((x) => x.soldeCents)) },
    mesTaches: { faites: duJour.filter((t) => t.status === 'done').length, total: duJour.length, serie: e.serie },
    prochainRendezVous: suivant ? { id: suivant.id, debut: suivant.startAt } : null,
    activiteRecente: evenements
      .filter((x) => x.jour <= e.aujourdhui)
      .sort((a, b) => b.at - a.at || RANG_D_ACTIVITE[a.type] - RANG_D_ACTIVITE[b.type] || (a.reference ?? '').localeCompare(b.reference ?? ''))
      .slice(0, LIGNES_D_ACTIVITE)
      .map(({ type, reference, jour }) => ({ type, reference, jour })),
    manque: [
      'Utilisateurs actifs (H25) : série fournie par une API du client, absente des jeux',
      'Disposition des widgets (H25) : format de la grille à confirmer dans le code',
    ],
  };
}
