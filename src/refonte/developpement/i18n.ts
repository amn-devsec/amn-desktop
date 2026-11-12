import { definirMots, type ParamsMots } from '../../socle/mots';
import type { Langue } from './commun';

/**
 * LES MOTS CALCULÉS DE L'ESPACE DÉVELOPPEMENT (LOT-11), fr et en.
 *
 * Ne figurent ici que les phrases que la LOGIQUE produit (étapes, cibles, pastilles,
 * libellés de planification, résumés) : le reste du texte de chaque écran sera recopié
 * mot pour mot de sa fiche (`docs/refonte/fiches/LOT-11/`) à la construction visuelle.
 * Même schéma que `src/socle/i18n.ts` : l'anglais est la base, le français est typé
 * contre lui. L'interface tutoie (dossier v4, 06 §4).
 *
 * Les comptes se disent par clé : `<base>.1` (0 et 1), `<base>.n` (2 et plus), usage français.
 */
const EN = {
  // Déploiements — les cinq étapes, dans l'ordre (DEV-deploiements)
  'etape.code': 'Code received',
  'etape.construction': 'Build',
  'etape.tests': 'Tests',
  'etape.miseEnLigne': 'Go live',
  'etape.verification': 'Check',
  // Cibles
  'cible.apercu': 'Preview',
  'cible.preproduction': 'Pre-production',
  'cible.production': 'Production',
  'cible.interne': 'Internal',
  'cible.serveur': 'AMN server',
  // Pastilles d'état
  'deploiement.reussi': 'Succeeded in {duree}',
  'deploiement.echec': 'Failed at {etape}',
  'deploiement.enCours': 'In progress · {etape}',
  'deploiement.annule': 'Cancelled',
  'deploiement.attente': 'Waiting',
  'deploiement.vers': '{depot} to {cible}',
  'deploiement.lancePar': '{branche} · started by {qui} {quand}',
  'deploiement.retourA': 'back to {version}',
  'deploiement.interneFerme': 'Internal distribution is not open yet: the version is prepared and waits.',
  'deploiement.aucunRetour': 'No previous version on this target',
  // Sous-titre et comptes
  'semaine.deploiements.1': '{n} this week',
  'semaine.deploiements.n': '{n} this week',
  'semaine.echecs.1': '{n} failure',
  'semaine.echecs.n': '{n} failures',
  'planifies.aVenir.1': '{n} upcoming',
  'planifies.aVenir.n': '{n} upcoming',
  // Planification (tâches planifiées locales)
  'planif.tousLesJours': 'Every day at {heure}',
  'planif.chaqueNuit': 'Every night at {heure}',
  'planif.semaine': 'Monday to Friday at {heure}',
  'planif.chaque': 'Every {jour} at {heure}',
  'planif.jours': '{jours} at {heure}',
  'planif.minutes': 'Every {n} min',
  'planif.heure': 'Every hour',
  'planif.heures': 'Every {n} h',
  'planif.uneFois': '{date} at {heure}',
  // Journal des exécutions et flux
  'flux.tournentSeuls': '{actifs} flows out of {total} run on their own',
  'flux.executionsMois.1': '{n} run this month',
  'flux.executionsMois.n': '{n} runs this month',
  'flux.derniere': 'Last run: {quand}',
  'flux.aucune': 'No run yet',
  'flux.test.reussi': 'Test on {n} {quoi}: passed',
  'flux.test.erreurs': 'Test on {n} {quoi}: {e} with errors',
  'flux.pauseAuto': 'Paused after {n} failures in a row',
  'temps.minutes': '{n} min saved',
  'temps.heures': '{h} h {mm} saved',
  'temps.environ': 'about {h} h a month',
} as const;

const FR: Readonly<Record<keyof typeof EN, string>> = {
  'etape.code': 'Code reçu',
  'etape.construction': 'Construction',
  'etape.tests': 'Tests',
  'etape.miseEnLigne': 'Mise en ligne',
  'etape.verification': 'Vérification',
  'cible.apercu': 'Aperçu',
  'cible.preproduction': 'Préproduction',
  'cible.production': 'Production',
  'cible.interne': 'Interne',
  'cible.serveur': 'Serveur AMN',
  'deploiement.reussi': 'Réussi en {duree}',
  'deploiement.echec': 'Échec à l’étape {etape}',
  'deploiement.enCours': 'En cours · {etape}',
  'deploiement.annule': 'Annulé',
  'deploiement.attente': 'En attente',
  'deploiement.vers': '{depot} vers {cible}',
  'deploiement.lancePar': '{branche} · lancé par {qui} {quand}',
  'deploiement.retourA': 'retour à {version}',
  'deploiement.interneFerme': 'La distribution interne n’est pas encore ouverte : la version est prête et attend.',
  'deploiement.aucunRetour': 'Aucune version précédente sur cette cible',
  'semaine.deploiements.1': '{n} cette semaine',
  'semaine.deploiements.n': '{n} cette semaine',
  'semaine.echecs.1': '{n} échec',
  'semaine.echecs.n': '{n} échecs',
  'planifies.aVenir.1': '{n} à venir',
  'planifies.aVenir.n': '{n} à venir',
  'planif.tousLesJours': 'Tous les jours à {heure}',
  'planif.chaqueNuit': 'Chaque nuit à {heure}',
  'planif.semaine': 'Du lundi au vendredi à {heure}',
  'planif.chaque': 'Chaque {jour} à {heure}',
  'planif.jours': '{jours} à {heure}',
  'planif.minutes': 'Toutes les {n} min',
  'planif.heure': 'Toutes les heures',
  'planif.heures': 'Toutes les {n} h',
  'planif.uneFois': 'Le {date} à {heure}',
  'flux.tournentSeuls': '{actifs} flux sur {total} tournent seuls',
  'flux.executionsMois.1': '{n} exécution ce mois',
  'flux.executionsMois.n': '{n} exécutions ce mois',
  'flux.derniere': 'Dernière exécution : {quand}',
  'flux.aucune': 'Aucune exécution pour l’instant',
  'flux.test.reussi': 'Test sur {n} {quoi} : réussi',
  'flux.test.erreurs': 'Test sur {n} {quoi} : {e} en erreur',
  'flux.pauseAuto': 'Mis en pause après {n} échecs de suite',
  'temps.minutes': '{n} min gagnées',
  'temps.heures': '{h} h {mm} gagnées',
  'temps.environ': 'environ {h} h par mois',
};

const mots = definirMots(EN, FR);
export const useMotsDeveloppement = mots.useMots;
export const DICTIONNAIRES_DEVELOPPEMENT = mots.dictionnaires;
export type CleDeveloppement = keyof typeof EN;

export function dire(langue: Langue, cle: CleDeveloppement, params?: ParamsMots): string {
  return mots.traduire(langue, cle, params);
}

/** `<base>.1` pour 0 et 1, `<base>.n` au-delà (usage français). */
export function direCompte(langue: Langue, base: string, n: number, params: ParamsMots = {}): string {
  const cle = `${base}.${n <= 1 ? '1' : 'n'}` as CleDeveloppement;
  return dire(langue, cle, { n, ...params });
}
