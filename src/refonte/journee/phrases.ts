import { dire, direCompte, type CleJournee } from './i18n';
import type { Langue } from './commun';
import type { Serie } from './serie';
import type { JalonDeFactures } from './jalons';
import type { StatutDeProjet } from './projets';
import type { EtatDeRappel } from './rappels';
import type { EtatDeDefi, ErreurDeProposition, JaugeDeDefi, TypeDeDefi } from './defis';
import type { ActiviteRecente } from './tableauDeBord';
import type { EtatDEvenement } from './calendrier';
import type { Focus, PhaseDeFocus } from './focus';
import { SEANCES_PAR_CYCLE } from './focus';
import type { CleDEtape, MomentDeLaJournee, Rituel } from './rituel';

/**
 * Ce que la logique SAIT DIRE — les phrases qui découlent d'un état calculé. Chaque fonction est pure et ne produit
 * qu'une phrase courte, au tutoiement dans l'interface, sans reproche.
 */

/** La phrase de la série : la plus utile des deux ou trois qu'on pourrait dire, jamais plus d'une. */
export function phraseDeSerie(langue: Langue, s: Serie): string {
  if (s.etat === 'aucune') return dire(langue, 'serie.aucune');
  if (s.etat === 'reprise') return dire(langue, 'serie.reprise');
  return direCompte(langue, 'serie.jours', s.serie);
}

/** « Prochain palier : 10 jours, dans 3 jours », ou `null` au-delà du dernier palier. */
export function phraseDePalier(langue: Langue, s: Pick<Serie, 'prochainPalier' | 'joursAvantPalier'>): string | null {
  if (s.prochainPalier === null || s.joursAvantPalier === null) return null;
  return direCompte(langue, 'serie.palier', s.joursAvantPalier, { palier: s.prochainPalier });
}

/** Où en est la journée d'aujourd'hui : bouclée, ou combien de priorités il reste (rien si aucune n'est choisie). */
export function phraseDeLaJournee(langue: Langue, s: Pick<Serie, 'boucleeAujourdhui' | 'restantesAujourdhui'>): string | null {
  if (s.boucleeAujourdhui) return dire(langue, 'serie.bouclee');
  return s.restantesAujourdhui > 0 ? direCompte(langue, 'serie.restantes', s.restantesAujourdhui) : null;
}

export function phraseDeJalonFactures(langue: Langue, j: JalonDeFactures): string {
  return j.atteint ? dire(langue, 'jalon.factures.atteint', { n: j.nombre }) : direCompte(langue, 'jalon.factures.reste', j.reste);
}

const CLE_STATUT: Record<StatutDeProjet, CleJournee> = {
  'À démarrer': 'projet.statut.aDemarrer',
  'En cours': 'projet.statut.enCours',
  'Presque fini': 'projet.statut.presqueFini',
  'En retard': 'projet.statut.enRetard',
  Terminé: 'projet.statut.termine',
};
export const libelleDeStatut = (langue: Langue, s: StatutDeProjet): string => dire(langue, CLE_STATUT[s]);

const CLE_RAPPEL: Record<EtatDeRappel, CleJournee> = {
  'a-venir': 'rappel.etat.aVenir',
  bientot: 'rappel.etat.bientot',
  'a-reprendre': 'rappel.etat.aReprendre',
  fait: 'rappel.etat.fait',
};
export const libelleDeRappel = (langue: Langue, e: EtatDeRappel): string => dire(langue, CLE_RAPPEL[e]);

const CLE_DEFI: Record<EtatDeDefi, CleJournee> = { 'En cours': 'defi.etat.enCours', Tenu: 'defi.etat.tenu', Terminé: 'defi.etat.termine' };
export const libelleDEtatDeDefi = (langue: Langue, e: EtatDeDefi): string => dire(langue, CLE_DEFI[e]);

/** « Encore 6 jours », « Encore 12 points », « Encore 0,3 » : ce qu'il reste, dans l'unité du défi ; « Cible atteinte. » une fois là. */
export function phraseDeJauge(langue: Langue, type: TypeDeDefi, j: JaugeDeDefi): string {
  if (j.atteinte) return dire(langue, 'defi.atteint');
  const nombre = j.reste.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 2 });
  if (type === 'Seuil') return dire(langue, 'defi.reste.note', { n: nombre });
  return direCompte(langue, type === 'Compteur de jours' ? 'defi.reste.jours' : 'defi.reste.points', j.reste, { n: nombre });
}

export const phraseDeCelebration = (langue: Langue, titre: string): string => dire(langue, 'defi.celebration', { titre });

const CLE_ERREUR: Record<ErreurDeProposition, CleJournee> = {
  'titre-vide': 'defi.proposer.titreVide',
  'titre-long': 'defi.proposer.titreLong',
  'cible-invalide': 'defi.proposer.cibleInvalide',
  'module-inconnu': 'defi.proposer.moduleInconnu',
};
export const phraseDErreurDeProposition = (langue: Langue, e: ErreurDeProposition): string => dire(langue, CLE_ERREUR[e]);

/** Le libellé d'une ligne d'activité récente (H25). */
export function libelleDActivite(langue: Langue, a: Pick<ActiviteRecente, 'type' | 'reference'>): string {
  if (a.type === 'facture-encaissee') return dire(langue, 'activite.factureEncaissee', { numero: a.reference ?? '' });
  return dire(langue, a.type === 'devis-envoye' ? 'activite.devisEnvoye' : 'activite.ticketResolu');
}

/** Pas de moyenne à virgule en anglais ni de point en français : le nombre est mis en forme pour la langue. */
export function phraseDeSemaineChargee(langue: Langue, prevues: number, moyenne: number): string {
  const m = moyenne.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 1 });
  return dire(langue, 'bilan.semaineChargee', { prevues, moyenne: m });
}

const CLE_EVENEMENT: Record<EtatDEvenement, CleJournee> = { annule: 'agenda.etat.annule', passe: 'agenda.etat.passe', 'en-cours': 'agenda.etat.enCours', 'a-venir': 'agenda.etat.aVenir' };
export const libelleDEtatDEvenement = (langue: Langue, e: EtatDEvenement): string => dire(langue, CLE_EVENEMENT[e]);

export const phraseDeRendezVous = (langue: Langue, n: number): string => direCompte(langue, 'agenda.rdv', n);

const CLE_PHASE: Record<PhaseDeFocus, CleJournee> = { travail: 'focus.phase.travail', pause: 'focus.phase.pause', pauseLongue: 'focus.phase.pauseLongue' };
export const libelleDePhase = (langue: Langue, p: PhaseDeFocus): string => dire(langue, CLE_PHASE[p]);

/** La phrase quand une phase se termine : après la séance on souffle, après la pause on reprend quand on veut. */
export const phraseDeFinDePhase = (langue: Langue, p: PhaseDeFocus): string => dire(langue, p === 'travail' ? 'focus.fin.travail' : 'focus.fin.pause');

/** « Séance 2 sur 4 » : la place dans le cycle (pendant une pause, la séance qui vient d'être faite). */
export function phraseDeCycle(langue: Langue, f: Pick<Focus, 'phase' | 'rang'>): string {
  const n = f.phase === 'travail' ? f.rang + 1 : f.phase === 'pauseLongue' ? SEANCES_PAR_CYCLE : f.rang;
  return dire(langue, 'focus.cycle', { n, total: SEANCES_PAR_CYCLE });
}

export const phraseDAbandon = (langue: Langue): string => dire(langue, 'focus.abandon');

const CLE_SALUT: Record<MomentDeLaJournee, CleJournee> = { matin: 'rituel.salut.matin', 'apres-midi': 'rituel.salut.apresMidi', soir: 'rituel.salut.soir' };
export const phraseDeSalutation = (langue: Langue, m: MomentDeLaJournee, prenom: string): string => dire(langue, CLE_SALUT[m], { prenom });

const CLE_ETAPE: Record<CleDEtape, CleJournee> = { priorites: 'rituel.etape.priorites', agenda: 'rituel.etape.agenda', 'a-reprendre': 'rituel.etape.aReprendre' };
export const libelleDEtape = (langue: Langue, c: CleDEtape): string => dire(langue, CLE_ETAPE[c]);

/** « On reprend là où tu t'étais arrêté : … », ou « Ta journée est prête. » quand tout est fait. */
export const phraseDeReprise = (langue: Langue, r: Pick<Rituel, 'reprise'>): string => (r.reprise === null ? dire(langue, 'rituel.pret') : dire(langue, 'rituel.reprise', { etape: libelleDEtape(langue, r.reprise) }));
