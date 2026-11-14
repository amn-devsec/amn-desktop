import type { MotifRelance, Relance } from '../donnees/types';
import { ajouterJours, ecartJours, euros, instantParis, jourDe, jourFrancais, jourSemaine, type Jour, type Langue } from './commun';
import { DELAI_ENTRE_RELANCES_JOURS } from '../connecteurs/moteurs/relances';
import { PLAGE_CLIENTS } from '../connecteurs/moteurs/planificateur';
import { dire } from './i18n';

/**
 * LOT-02 · LES RELANCES (MC07) — logique pure.
 *
 * LA RÈGLE QUI COMPTE : on ne harcèle jamais un client. Quatre garde-fous, tous
 * vérifiés par `check:contacts`, aucun contournable par un écran :
 *
 *   1. ESPACEMENT : au moins `espacementJours` entre deux relances du même objet.
 *      7 jours par défaut (valeur de départ du CO, `STATUT.md` §1.22, modifiable
 *      dans les réglages).
 *   2. PLAFOND : au plus `maxParObjet` relances par objet (facture, devis…), puis
 *      on s'arrête et on propose à la personne un autre geste (téléphoner).
 *      Valeur de départ : 3. *À confirmer* avec la fiche MC07.
 *   3. UN SEUL MESSAGE PAR CLIENT ET PAR JOUR, tous objets confondus.
 *   4. PLAGE D'ENVOI : seulement dans la plage « clients » (lun.–ven. 08:00–19:00,
 *      heure de Paris, §1.22). En dehors, la relance attend l'ouverture suivante.
 *
 * Le verdict dit toujours POURQUOI et QUAND : l'écran n'a jamais à inventer une phrase.
 */

export interface ReglesRelance {
  espacementJours: number;
  maxParObjet: number;
  unParClientEtParJour: boolean;
  fenetre: { debut: string; fin: string; jours: readonly number[] };
}

/**
 * Les deux premières valeurs sont CELLES de l'autonomie (`connecteurs/reglages.ts`,
 * `VALEURS_DE_DEPART`) : une seule source, pour que les réglages de S9 et cet écran
 * ne divergent jamais. Les deux autres sont propres à cette fiche.
 */
export const REGLES_PAR_DEFAUT: ReglesRelance = {
  espacementJours: DELAI_ENTRE_RELANCES_JOURS,
  maxParObjet: 3,
  unParClientEtParJour: true,
  fenetre: { debut: PLAGE_CLIENTS.debut, fin: PLAGE_CLIENTS.fin, jours: PLAGE_CLIENTS.jours },
};

export type RaisonAttente = 'terminee' | 'plafond' | 'espacement' | 'memeClient' | 'horsPlage';

export type Verdict =
  | { possible: true }
  /** `prochaineLe` : le premier instant (ms) où l'envoi sera permis ; `null` quand il ne le sera plus (terminée, plafond). */
  | { possible: false; raison: RaisonAttente; prochaineLe: number | null };

/** Un client se reconnaît à son identifiant, à défaut à son nom (un prospect n'a pas de fiche). */
export const cleClient = (r: Pick<Relance, 'clientId' | 'clientNom'>): string => (r.clientId != null ? `c:${r.clientId}` : `n:${r.clientNom}`);

/** Le premier instant ≥ `depuis` (ms) qui tombe dans la plage d'envoi. */
export function prochaineOuverture(depuis: number, fenetre: ReglesRelance['fenetre']): number {
  let jour: Jour = jourDe(depuis);
  for (let i = 0; i < 14; i += 1) {
    if (fenetre.jours.includes(jourSemaine(jour))) {
      const debut = instantParis(jour, fenetre.debut);
      const fin = instantParis(jour, fenetre.fin);
      if (depuis < debut) return debut;
      if (depuis < fin) return depuis;
    }
    jour = ajouterJours(jour, 1);
    depuis = instantParis(jour, '00:00');
  }
  return depuis; // plage vide (aucun jour permis) : on ne bloque pas indéfiniment, l'écran l'a déjà refusée
}

/**
 * Peut-on envoyer cette relance maintenant ? `autres` : les relances déjà connues du
 * même poste (pour la règle « un message par client et par jour »).
 */
export function verdictRelance(
  r: Relance,
  autres: readonly Relance[],
  maintenant: number,
  regles: ReglesRelance = REGLES_PAR_DEFAUT,
): Verdict {
  if (r.etat === 'répondue' || r.etat === 'arrêtée') return { possible: false, raison: 'terminee', prochaineLe: null };
  if (r.nbEnvoyees >= regles.maxParObjet) return { possible: false, raison: 'plafond', prochaineLe: null };

  const aujourdhui = jourDe(maintenant);
  let plusTot = maintenant;
  let raison: RaisonAttente | null = null;

  if (r.derniereEnvoiLe && ecartJours(r.derniereEnvoiLe, aujourdhui) < regles.espacementJours) {
    plusTot = Math.max(plusTot, instantParis(ajouterJours(r.derniereEnvoiLe, regles.espacementJours), regles.fenetre.debut));
    raison = 'espacement';
  }
  if (regles.unParClientEtParJour && autres.some((o) => o.id !== r.id && cleClient(o) === cleClient(r) && o.derniereEnvoiLe === aujourdhui)) {
    plusTot = Math.max(plusTot, instantParis(ajouterJours(aujourdhui, 1), regles.fenetre.debut));
    raison ??= 'memeClient';
  }
  const ouverture = prochaineOuverture(plusTot, regles.fenetre);
  if (raison === null && ouverture !== maintenant) raison = 'horsPlage';
  if (raison === null) return { possible: true };
  return { possible: false, raison, prochaineLe: ouverture };
}

export interface EntreeFile {
  relance: Relance;
  verdict: Verdict;
}

export interface FileDeRelances {
  /** Prêtes à partir maintenant (au plus une par client). */
  maintenant: EntreeFile[];
  /** Pas encore : espacement, plage d'envoi, ou un autre message part déjà au même client aujourd'hui. */
  plusTard: EntreeFile[];
  /** Plafond atteint : la personne décide d'un autre geste. */
  plafond: EntreeFile[];
  /** Répondues ou arrêtées. */
  terminees: EntreeFile[];
}

/** L'ordre de MC07 : montant décroissant (sans montant en dernier), puis départ le plus récent d'abord. */
export function comparerRelances(a: Relance, b: Relance): number {
  return (b.montantCents ?? -1) - (a.montantCents ?? -1) || b.departLe.localeCompare(a.departLe) || a.id.localeCompare(b.id);
}

/** Range les relances : ce qui part, ce qui attend, ce qui s'arrête. Un seul départ par client. */
export function ordonnerFile(relances: readonly Relance[], maintenant: number, regles: ReglesRelance = REGLES_PAR_DEFAUT): FileDeRelances {
  const file: FileDeRelances = { maintenant: [], plusTard: [], plafond: [], terminees: [] };
  const partent = new Set<string>();
  for (const relance of [...relances].sort(comparerRelances)) {
    // Un client qui part déjà dans cette file compte comme « déjà écrit aujourd'hui ».
    const retenues = relances.map((o) => (partent.has(cleClient(o)) && o.id !== relance.id ? { ...o, derniereEnvoiLe: jourDe(maintenant) } : o));
    const verdict = verdictRelance(relance, retenues, maintenant, regles);
    const entree = { relance, verdict };
    if (verdict.possible) {
      partent.add(cleClient(relance));
      file.maintenant.push(entree);
    } else if (verdict.raison === 'terminee') file.terminees.push(entree);
    else if (verdict.raison === 'plafond') file.plafond.push(entree);
    else file.plusTard.push(entree);
  }
  return file;
}

/** Après un envoi. L'appelant a déjà obtenu un verdict `possible` : sinon l'erreur le dit. */
export function marquerEnvoyee(r: Relance, autres: readonly Relance[], maintenant: number, regles: ReglesRelance = REGLES_PAR_DEFAUT): Relance {
  const v = verdictRelance(r, autres, maintenant, regles);
  if (!v.possible) throw new Error(`relance ${r.id} refusée : ${v.raison}`);
  return { ...r, etat: 'envoyée', nbEnvoyees: r.nbEnvoyees + 1, derniereEnvoiLe: jourDe(maintenant) };
}

export const arreter = (r: Relance): Relance => ({ ...r, etat: 'arrêtée' });
export const marquerRepondue = (r: Relance): Relance => ({ ...r, etat: 'répondue' });

/** La phrase d'attente affichée à la personne (interface : tutoiement). */
export function phraseAttente(v: Extract<Verdict, { possible: false }>, langue: Langue, regles: ReglesRelance = REGLES_PAR_DEFAUT): string {
  const quand = v.prochaineLe == null ? '' : jourFrancaisOuAnglais(jourDe(v.prochaineLe), langue);
  switch (v.raison) {
    case 'terminee': return dire(langue, 'relance.attente.terminee');
    case 'plafond': return dire(langue, 'relance.attente.plafond', { n: regles.maxParObjet });
    case 'espacement': return dire(langue, 'relance.attente.espacement', { jours: regles.espacementJours, quand });
    case 'memeClient': return dire(langue, 'relance.attente.memeClient', { quand });
    case 'horsPlage': return dire(langue, 'relance.attente.horsPlage', { debut: regles.fenetre.debut, fin: regles.fenetre.fin, quand });
  }
}

const jourFrancaisOuAnglais = (j: Jour, langue: Langue): string => (langue === 'fr' ? jourFrancais(j).slice(0, 5) : j.slice(5).split('-').reverse().join('/'));

/**
 * Le message qui PART chez le client — vouvoiement en français (`REGLES.md`, « Produit »).
 * Les chiffres, les dates et le libellé viennent de la relance : rien n'est écrit en dur.
 */
export function messageClient(r: Relance, langue: Langue, aujourdhui: Jour): string {
  const base = (motif: MotifRelance): string => {
    const params = { objet: r.objetLibelle, montant: r.montantCents != null ? euros(r.montantCents, langue) : '', depuis: Math.max(0, ecartJours(r.departLe, aujourdhui)), jour: jourFrancais(r.departLe) };
    return dire(langue, `client.${motif}` as const, params);
  };
  const suite = r.nbEnvoyees > 0 ? `${dire(langue, 'client.suite')} ` : '';
  return `${dire(langue, 'client.bonjour')} ${suite}${base(r.motif)} ${dire(langue, 'client.cordialement')}`;
}
