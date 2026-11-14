import type { Interlocuteur } from '../donnees/types';
import { ecartJours, jourDeInstant, type Jour } from './commun';

/**
 * LOT-02 · « CONTACTS PAR CLIENT » — la source que demande H41 (Accueil du client) et
 * que MC03 (Fiches contacts) et G04 (Fiche client) lisent aussi.
 *
 * Une organisation (client, prospect, fournisseur ou partenaire) a plusieurs
 * interlocuteurs. Ici : retrouver ceux d'une organisation, dire qui écrire en
 * premier, et ce qui attend (un message non lu). Aucune donnée n'est créée.
 */

export type TypeOrganisation = Interlocuteur['organisationType'];

/** Les favoris d'abord, puis le plus récemment joint, puis l'ordre alphabétique. */
export function comparerInterlocuteurs(a: Interlocuteur, b: Interlocuteur): number {
  if (a.favori !== b.favori) return a.favori ? -1 : 1;
  return b.dernierEchangeAt.localeCompare(a.dernierEchangeAt) || a.nomComplet.localeCompare(b.nomComplet, 'fr');
}

export function contactsParOrganisation(interlocuteurs: readonly Interlocuteur[], type: TypeOrganisation, organisationId: string): Interlocuteur[] {
  return interlocuteurs.filter((i) => i.organisationType === type && i.organisationId === organisationId).sort(comparerInterlocuteurs);
}

/** `clientId` est numérique dans les fiches clients ; les interlocuteurs le portent en chaîne. */
export const contactsParClient = (interlocuteurs: readonly Interlocuteur[], clientId: number | string): Interlocuteur[] =>
  contactsParOrganisation(interlocuteurs, 'client', String(clientId));

export interface ContactsDuClient {
  /** Qui écrire en premier : le premier de la liste triée. */
  principal: Interlocuteur | null;
  tous: Interlocuteur[];
  nonLus: number;
  /** Le dernier échange, tous interlocuteurs confondus (ISO) ; `null` sans contact. */
  dernierEchangeAt: string | null;
}

export function contactsDuClient(interlocuteurs: readonly Interlocuteur[], clientId: number | string): ContactsDuClient {
  const tous = contactsParClient(interlocuteurs, clientId);
  return {
    principal: tous[0] ?? null,
    tous,
    nonLus: tous.filter((i) => i.nonLu).length,
    dernierEchangeAt: tous.map((i) => i.dernierEchangeAt).sort().pop() ?? null,
  };
}

/** Combien de jours sans nouvelles du client, par ses contacts ; `null` sans contact. */
export function joursSansEchange(c: ContactsDuClient, aujourdhui: Jour): number | null {
  return c.dernierEchangeAt == null ? null : Math.max(0, ecartJours(jourDeInstant(c.dernierEchangeAt), aujourdhui));
}

/** La manière de joindre une personne, selon sa préférence, avec un repli si le champ manque. */
export function moyenDeJoindre(i: Pick<Interlocuteur, 'preference' | 'email' | 'telephone'>): { moyen: 'courriel' | 'téléphone' | 'messagerie'; valeur: string } | null {
  if (i.preference === 'téléphone' && i.telephone) return { moyen: 'téléphone', valeur: i.telephone };
  if (i.preference === 'messagerie') return { moyen: 'messagerie', valeur: i.email };
  if (i.email) return { moyen: 'courriel', valeur: i.email };
  return i.telephone ? { moyen: 'téléphone', valeur: i.telephone } : null;
}
