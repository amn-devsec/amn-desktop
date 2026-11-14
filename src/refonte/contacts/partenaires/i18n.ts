import { definirMots } from '../../../socle/mots';

/**
 * LES MOTS DE « PARTENAIRES » (MC05), fr et en. L'anglais est le schéma, le français est typé contre lui. Tutoiement
 * (dossier v4, `_data/tutoiement.json`). Les comptes : `<base>.1` (0 et 1), `<base>.n` (2 et plus).
 */
const EN = {
  'titre': 'Partners',
  'sousTitre': 'Those you move forward with · {n} partners',
  'action.inviter': 'Invite a partner',
  'action.ajouter': 'Add',

  'reseau.titre': 'Your network',
  'reseau.puces': 'Filter the partners',
  'reseau.tous': 'All',
  'reseau.recommandations': 'Referrals',
  'reseau.renouveler': 'To renew',
  'reseau.compte.n': '{n} partners · {k} active',
  'reseau.compte.1': '{n} partner · {k} active',
  'reseau.graphique': 'Network of {n} partners on three orbits by how often you talk',
  'reseau.centre.haut': 'AMN',
  'reseau.centre.bas': 'DevSec',
  'orbite.semaine': 'every week',
  'orbite.mois': 'every month',
  'orbite.rare': 'more rarely',
  'noeud.pause': '{categorie} · paused',
  'noeud.fin': 'Contract ends on {jour}',
  'noeud.fin.echu': 'Contract ended on {jour}',
  'noeud.info': '{nom} · strength {force} % · {echanges} exchanges in 90 days',
  'legende.epaisseur': 'thickness = strength of the relationship',
  'legende.frequence': 'distance = how often you talk',
  'legende.recos': 'Referrals: not recorded yet',

  'carte.vide': 'Pick a partner on the map',
  'carte.etat.actif': 'Active',
  'carte.etat.pause': 'Paused',
  'carte.etat.renouveler': 'To renew',
  'carte.force': 'Strength of the relationship',
  'carte.dernier': 'Last exchange',
  'carte.acces': 'Access given',
  'carte.rythme': 'Usual pace',
  'carte.rythme.valeur': '{n} a month expected',
  'carte.indisponible': 'not recorded yet',
  'carte.ecrire': 'Write',
  'carte.acces.voir': 'See the access',

  'recos.titre': 'Referrals',
  'recos.indisponible': 'The clients a partner sent you, and those you sent them, are not recorded yet.',

  'suggestion.titre': 'Renew {nom}',
  'suggestion.texte.1': 'Your contract ends in {n} day. I compare 2 equivalent offers for less, without cancelling anything.',
  'suggestion.texte.n': 'Your contract ends in {n} days. I compare 2 equivalent offers for less, without cancelling anything.',
  'suggestion.comparer': 'Compare',
  'suggestion.plusTard': 'Later',
  'suggestion.astuce.titre': 'Tip',
  'suggestion.astuce.texte': 'Note who recommended a client: the link grows stronger on the map.',

  'etat.indisponible.titre': 'Partners are not available yet',
  'etat.indisponible.texte': 'The application does not keep your partners yet: no contract date, no pace, no referral. Your suppliers are in their own list.',
  'etat.indisponible.action': 'Open the suppliers',
  'etat.vide.titre': 'Add your first partner',
  'etat.vide.texte': 'Accountant, agency, supplier…',
  'etat.erreur': 'The partners could not be loaded.',
  'etat.reessayer': 'Try again',
  'etat.chargement': 'Loading the partners…',
  'etat.horsLigne': 'You are offline: this is the last saved network.',
} as const;

const FR: Record<keyof typeof EN, string> = {
  'titre': 'Partenaires',
  'sousTitre': 'Ceux avec qui tu avances · {n} partenaires',
  'action.inviter': 'Inviter un partenaire',
  'action.ajouter': 'Ajouter',

  'reseau.titre': 'Ton réseau',
  'reseau.puces': 'Filtrer les partenaires',
  'reseau.tous': 'Tous',
  'reseau.recommandations': 'Recommandations',
  'reseau.renouveler': 'À renouveler',
  'reseau.compte.n': '{n} partenaires · {k} actifs',
  'reseau.compte.1': '{n} partenaire · {k} actif',
  'reseau.graphique': 'Réseau de {n} partenaires sur trois orbites selon la fréquence des échanges',
  'reseau.centre.haut': 'AMN',
  'reseau.centre.bas': 'DevSec',
  'orbite.semaine': 'chaque semaine',
  'orbite.mois': 'chaque mois',
  'orbite.rare': 'plus rarement',
  'noeud.pause': '{categorie} · en pause',
  'noeud.fin': 'Fin du contrat le {jour}',
  'noeud.fin.echu': 'Contrat échu le {jour}',
  'noeud.info': '{nom} · force {force} % · {echanges} échanges en 90 jours',
  'legende.epaisseur': 'épaisseur = force de la relation',
  'legende.frequence': 'distance = fréquence des échanges',
  'legende.recos': 'Recommandations : pas encore enregistrées',

  'carte.vide': 'Choisis un partenaire sur la carte',
  'carte.etat.actif': 'Actif',
  'carte.etat.pause': 'En pause',
  'carte.etat.renouveler': 'À renouveler',
  'carte.force': 'Force de la relation',
  'carte.dernier': 'Dernier échange',
  'carte.acces': 'Accès donné',
  'carte.rythme': 'Rythme habituel',
  'carte.rythme.valeur': '{n} par mois attendus',
  'carte.indisponible': 'pas encore enregistré',
  'carte.ecrire': 'Écrire',
  'carte.acces.voir': 'Voir les accès',

  'recos.titre': 'Recommandations',
  'recos.indisponible': 'Les clients qu’un partenaire t’a envoyés, et ceux que tu lui as envoyés, ne sont pas encore enregistrés.',

  'suggestion.titre': 'Renouveler {nom}',
  'suggestion.texte.1': 'Ton contrat se termine dans {n} jour. Je compare 2 offres équivalentes moins chères, sans rien résilier.',
  'suggestion.texte.n': 'Ton contrat se termine dans {n} jours. Je compare 2 offres équivalentes moins chères, sans rien résilier.',
  'suggestion.comparer': 'Comparer',
  'suggestion.plusTard': 'Plus tard',
  'suggestion.astuce.titre': 'Astuce',
  'suggestion.astuce.texte': 'Note qui t’a recommandé un client : le lien se renforce sur la carte.',

  'etat.indisponible.titre': 'Les partenaires ne sont pas encore disponibles',
  'etat.indisponible.texte': 'L’application ne garde pas encore tes partenaires : ni date de contrat, ni rythme, ni recommandation. Tes fournisseurs ont leur propre liste.',
  'etat.indisponible.action': 'Ouvrir les fournisseurs',
  'etat.vide.titre': 'Ajoute ton premier partenaire',
  'etat.vide.texte': 'Expert-comptable, agence, fournisseur…',
  'etat.erreur': 'Les partenaires n’ont pas pu être chargés.',
  'etat.reessayer': 'Réessayer',
  'etat.chargement': 'Chargement des partenaires…',
  'etat.horsLigne': 'Tu es hors ligne : voici le dernier réseau enregistré.',
};

const mots = definirMots(EN, FR);
export const useMotsPartenaires = mots.useMots;
export const traduirePartenaires = mots.traduire;
export const DICTIONNAIRES_PARTENAIRES = mots.dictionnaires;
