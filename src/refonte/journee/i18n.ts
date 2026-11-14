import { definirMots, type ParamsMots } from '../../socle/mots';
import type { Langue } from './commun';

/**
 * LES MOTS CALCULÉS DE MA JOURNÉE (LOT-01), fr et en.
 *
 * Ne figurent ici que les phrases que la LOGIQUE produit (séries, paliers, jalons, états de projet et de rappel,
 * défis, activité). Les textes statiques de chaque écran (titres, boutons, vides) seront recopiés mot pour mot de
 * leur fiche, passés au tutoiement avec `_data/tutoiement.json`, à la construction visuelle.
 *
 * Même schéma que `src/socle/i18n.ts` : l'anglais est la base, le français est typé contre lui. L'interface tutoie
 * (dossier v4, `06` §4) ; le guide de voix du socle s'applique : phrases courtes, aucun reproche, aucune urgence
 * inventée, aucun point d'exclamation. Un défi non tenu est « terminé », jamais « raté » ; un rappel passé est « à
 * reprendre », jamais « en retard ».
 *
 * Les comptes se disent par clé : `<base>.1` (0 et 1), `<base>.n` (2 et plus), usage français.
 */
const EN = {
  // La série
  'serie.aucune': 'Your streak starts with your first completed day.',
  'serie.jours.1': '{n} day in a row',
  'serie.jours.n': '{n} days in a row',
  'serie.reprise': 'Your streak starts again today.',
  'serie.record': 'Record: {n}',
  'serie.palier.1': 'Next milestone: {palier} days, in {n} day',
  'serie.palier.n': 'Next milestone: {palier} days, in {n} days',
  'serie.restantes.1': '{n} priority left to complete your day.',
  'serie.restantes.n': '{n} priorities left to complete your day.',
  'serie.bouclee': 'Day completed.',
  'serie.badge.palier': '{n} days',
  // Les jalons
  'jalon.factures.atteint': '{n} invoices sent',
  'jalon.factures.reste.1': '{n} more invoice to reach 10.',
  'jalon.factures.reste.n': '{n} more invoices to reach 10.',
  // Le bilan de la semaine
  'bilan.semaineChargee': 'Next week looks busy: {prevues} tasks planned, against {moyenne} on average. Shall we prepare it?',
  'bilan.meilleurJour': 'Busiest day: {jour}',
  'bilan.rienFait': 'Nothing done yet this week.',
  // Les projets
  'projet.statut.aDemarrer': 'To start',
  'projet.statut.enCours': 'In progress',
  'projet.statut.presqueFini': 'Almost done',
  'projet.statut.enRetard': 'Behind',
  'projet.statut.termine': 'Done',
  'projet.suite.enRetard': 'Move the deadline, or split what is left?',
  // Les rappels
  'rappel.etat.aVenir': 'Upcoming',
  'rappel.etat.bientot': 'Soon',
  'rappel.etat.aReprendre': 'To pick up',
  'rappel.etat.fait': 'Done',
  'rappel.suite.aReprendre': 'Want to move it?',
  // Le planning
  'planning.chevauche': '{qui} already has a slot at that time.',
  // Les défis d'équipe
  'defi.etat.enCours': 'In progress',
  'defi.etat.tenu': 'Held',
  'defi.etat.termine': 'Finished',
  'defi.reste.jours.1': '{n} day to go',
  'defi.reste.jours.n': '{n} days to go',
  'defi.reste.points.1': '{n} point to go',
  'defi.reste.points.n': '{n} points to go',
  'defi.reste.note': '{n} to go',
  'defi.atteint': 'Target reached.',
  'defi.celebration': 'Challenge held: {titre}. Well done, team.',
  'defi.engagement.aucun': 'No written commitment yet.',
  'defi.proposer.titreVide': 'Give your challenge a title.',
  'defi.proposer.titreLong': 'A shorter title, 80 characters at most.',
  'defi.proposer.cibleInvalide': 'Pick a valid target.',
  'defi.proposer.moduleInconnu': 'Pick what the challenge follows.',
  // L'activité récente (H25)
  'activite.factureEncaissee': 'Invoice {numero} paid',
  'activite.devisEnvoye': 'New quote sent',
  'activite.ticketResolu': 'Ticket solved',
} as const;

const FR: Record<keyof typeof EN, string> = {
  'serie.aucune': 'Ta série commence avec ta première journée bouclée.',
  'serie.jours.1': '{n} jour de suite',
  'serie.jours.n': '{n} jours de suite',
  'serie.reprise': 'Ta série reprend aujourd’hui.',
  'serie.record': 'Record : {n}',
  'serie.palier.1': 'Prochain palier : {palier} jours, dans {n} jour',
  'serie.palier.n': 'Prochain palier : {palier} jours, dans {n} jours',
  'serie.restantes.1': 'Il te reste {n} priorité pour boucler ta journée.',
  'serie.restantes.n': 'Il te reste {n} priorités pour boucler ta journée.',
  'serie.bouclee': 'Journée bouclée.',
  'serie.badge.palier': '{n} jours',
  'jalon.factures.atteint': '{n} factures envoyées',
  'jalon.factures.reste.1': 'Encore {n} facture pour atteindre 10.',
  'jalon.factures.reste.n': 'Encore {n} factures pour atteindre 10.',
  'bilan.semaineChargee': 'La semaine prochaine est chargée : {prevues} tâches prévues, contre {moyenne} en moyenne. On la prépare ?',
  'bilan.meilleurJour': 'Jour le plus actif : {jour}',
  'bilan.rienFait': 'Rien de fait pour l’instant cette semaine.',
  'projet.statut.aDemarrer': 'À démarrer',
  'projet.statut.enCours': 'En cours',
  'projet.statut.presqueFini': 'Presque fini',
  'projet.statut.enRetard': 'En retard',
  'projet.statut.termine': 'Terminé',
  'projet.suite.enRetard': 'Tu veux décaler l’échéance, ou découper ce qui reste ?',
  'rappel.etat.aVenir': 'À venir',
  'rappel.etat.bientot': 'Bientôt',
  'rappel.etat.aReprendre': 'À reprendre',
  'rappel.etat.fait': 'Fait',
  'rappel.suite.aReprendre': 'Tu veux le décaler ?',
  'planning.chevauche': '{qui} a déjà un créneau à cette heure.',
  'defi.etat.enCours': 'En cours',
  'defi.etat.tenu': 'Tenu',
  'defi.etat.termine': 'Terminé',
  'defi.reste.jours.1': 'Encore {n} jour',
  'defi.reste.jours.n': 'Encore {n} jours',
  'defi.reste.points.1': 'Encore {n} point',
  'defi.reste.points.n': 'Encore {n} points',
  'defi.reste.note': 'Encore {n}',
  'defi.atteint': 'Cible atteinte.',
  'defi.celebration': 'Défi tenu : {titre}. Bravo à l’équipe.',
  'defi.engagement.aucun': 'Pas encore d’engagement écrit.',
  'defi.proposer.titreVide': 'Donne un titre à ton défi.',
  'defi.proposer.titreLong': 'Un titre plus court, 80 caractères au plus.',
  'defi.proposer.cibleInvalide': 'Choisis une cible valable.',
  'defi.proposer.moduleInconnu': 'Choisis ce que le défi suit.',
  'activite.factureEncaissee': 'Facture {numero} encaissée',
  'activite.devisEnvoye': 'Nouveau devis envoyé',
  'activite.ticketResolu': 'Ticket résolu',
};

const mots = definirMots(EN, FR);
export const useMotsJournee = mots.useMots;
export const DICTIONNAIRES_JOURNEE = mots.dictionnaires;
export type CleJournee = keyof typeof EN;

export function dire(langue: Langue, cle: CleJournee, params?: ParamsMots): string {
  return mots.traduire(langue, cle, params);
}

/** `<base>.1` pour 0 et 1, `<base>.n` au-delà (usage français ; en anglais, seul 1 est singulier — voir `direCompte`). */
export function direCompte(langue: Langue, base: string, n: number, params: ParamsMots = {}): string {
  const singulier = langue === 'fr' ? n < 2 : n === 1;
  return dire(langue, `${base}.${singulier ? '1' : 'n'}` as CleJournee, { n, ...params });
}
