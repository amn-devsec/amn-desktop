import { definirMots } from '../../../socle/mots';

/**
 * LES MOTS DE « RENDEZ-VOUS CLIENTS » (MC06), fr et en. L'anglais est le schéma, le français est typé contre lui. Tutoiement
 * (dossier v4, `_data/tutoiement.json`). Les comptes : `<base>.1` (0 et 1), `<base>.n` (2 et plus).
 */
const EN = {
  'titre': 'Client meetings',
  'sousTitre': 'Your clients book on their own, you stay in charge · next at {heure}',
  'sousTitre.aucun': 'Your clients book on their own, you stay in charge',
  'action.lien': 'Booking link',
  'action.nouveau': 'New meeting',

  'jour.precedent': 'Previous day',
  'jour.suivant': 'Next day',
  'jour.titre': '{jour}',
  'jour.resume.1': '{n} meeting',
  'jour.resume.n': '{n} meetings',
  'jour.resume.route': '{h} of travel',
  'jour.resume.retour': 'back around {heure}',
  'jour.puce.n': '{jour}, {n} meetings',
  'jour.puce.1': '{jour}, {n} meeting',
  'jour.vide.titre': 'Nothing planned that day',

  'rdv.fait': 'Done',
  'rdv.enCours': 'In progress',
  'rdv.aVenir': 'upcoming',
  'rdv.dansMin': 'in {n} min',
  'rdv.manque': 'Missed',
  'rdv.aConfirmer': 'to confirm',
  'rdv.visio': 'Video',
  'rdv.duree.min': '{n} min',
  'rdv.duree.h': '{h} h',
  'rdv.duree.hmin': '{h} h {m}',
  'rdv.ouvrir': 'Open the meeting with {client}',
  'rdv.ruban': 'Day ribbon from 8:00 to 19:00, {n} meetings',
  'maintenant': 'Now {heure}',

  'route.pause': 'Lunch break',
  'route.pied': '{n} min on foot',
  'route.vehicule': '{n} min by vehicle',
  'route.apreciser': 'place to specify',
  'route.depart': 'leave at {heure}',
  'route.indisponible': 'Travel times are not computed: no route service is connected.',

  'trajet.titre': 'Today’s route',
  'trajet.aide': 'sketch, real distances computed when you open it',
  'trajet.indisponible': 'Routes are not available yet: the application has no route service, so no distance and no time between two meetings.',
  'trajet.aucun': 'No travel',
  'reservation.titre': 'Your booking link',
  'reservation.indisponible': 'The booking link is not available yet: no open slots, no taken slots to show.',

  'suggestion.astuce': 'Tip: open the calendar to move a meeting, the ribbon follows.',
  'suggestion.ouvrirAgenda': 'Open the calendar',

  'etat.erreur': 'The meetings could not be loaded.',
  'etat.reessayer': 'Try again',
  'etat.chargement': 'Loading the meetings…',
  'etat.horsLigne': 'You are offline: these are the last saved meetings.',
} as const;

const FR: Record<keyof typeof EN, string> = {
  'titre': 'Rendez-vous clients',
  'sousTitre': 'Tes clients réservent seuls, tu gardes la main · prochain à {heure}',
  'sousTitre.aucun': 'Tes clients réservent seuls, tu gardes la main',
  'action.lien': 'Lien de réservation',
  'action.nouveau': 'Nouveau rendez-vous',

  'jour.precedent': 'Jour précédent',
  'jour.suivant': 'Jour suivant',
  'jour.titre': '{jour}',
  'jour.resume.1': '{n} rendez-vous',
  'jour.resume.n': '{n} rendez-vous',
  'jour.resume.route': '{h} de route',
  'jour.resume.retour': 'retour vers {heure}',
  'jour.puce.n': '{jour}, {n} rendez-vous',
  'jour.puce.1': '{jour}, {n} rendez-vous',
  'jour.vide.titre': 'Rien de prévu ce jour-là',

  'rdv.fait': 'Fait',
  'rdv.enCours': 'En cours',
  'rdv.aVenir': 'à venir',
  'rdv.dansMin': 'dans {n} min',
  'rdv.manque': 'Manqué',
  'rdv.aConfirmer': 'à confirmer',
  'rdv.visio': 'Visio',
  'rdv.duree.min': '{n} min',
  'rdv.duree.h': '{h} h',
  'rdv.duree.hmin': '{h} h {m}',
  'rdv.ouvrir': 'Ouvrir le rendez-vous avec {client}',
  'rdv.ruban': 'Ruban de la journée de 8:00 à 19:00, {n} rendez-vous',
  'maintenant': 'Maintenant {heure}',

  'route.pause': 'Pause déjeuner',
  'route.pied': '{n} min à pied',
  'route.vehicule': '{n} min en véhicule',
  'route.apreciser': 'lieu à préciser',
  'route.depart': 'départ conseillé {heure}',
  'route.indisponible': 'Les temps de trajet ne sont pas calculés : aucun service d’itinéraire n’est branché.',

  'trajet.titre': 'Le trajet du jour',
  'trajet.aide': 'schéma, distances réelles calculées à l’ouverture',
  'trajet.indisponible': 'Les trajets ne sont pas encore disponibles : l’application n’a pas de service d’itinéraire, donc ni distance ni temps entre deux rendez-vous.',
  'trajet.aucun': 'Aucun déplacement',
  'reservation.titre': 'Ton lien de réservation',
  'reservation.indisponible': 'Le lien de réservation n’est pas encore disponible : aucun créneau ouvert ni pris à montrer.',

  'suggestion.astuce': 'Astuce : ouvre l’agenda pour déplacer un rendez-vous, le ruban suit.',
  'suggestion.ouvrirAgenda': 'Ouvrir l’agenda',

  'etat.erreur': 'Les rendez-vous n’ont pas pu être chargés.',
  'etat.reessayer': 'Réessayer',
  'etat.chargement': 'Chargement des rendez-vous…',
  'etat.horsLigne': 'Tu es hors ligne : voici les derniers rendez-vous enregistrés.',
};

const mots = definirMots(EN, FR);
export const useMotsRdv = mots.useMots;
export const traduireRdv = mots.traduire;
export const DICTIONNAIRES_RDV = mots.dictionnaires;
