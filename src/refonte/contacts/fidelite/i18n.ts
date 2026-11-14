import { definirMots } from '../../../socle/mots';

/**
 * LES MOTS DE « FIDÉLITÉ » (MC02), fr et en. L'anglais est le schéma, le français est typé contre lui. Tutoiement
 * (dossier v4, `_data/tutoiement.json`). Les comptes : `<base>.1` (0 et 1), `<base>.n` (2 et plus).
 */
const EN = {
  'titre': 'Loyalty',
  'sousTitre': 'Reward those who come back · 3 tiers, no effort',
  'action.regles': 'Program rules',
  'action.offrir': 'Give a perk',

  'echelle.titre': 'Tier ladder',
  'echelle.puces': 'Filter the clients',
  'echelle.tous': 'All',
  'echelle.bientot': 'Soon at the next tier',
  'echelle.inactifs': 'Inactive',
  'echelle.fideles': 'loyal clients out of {total}',
  'echelle.graphique': 'Ladder of three tiers: {or} Gold, {argent} Silver, {bronze} Bronze clients',

  'palier.Or': 'Gold',
  'palier.Argent': 'Silver',
  'palier.Bronze': 'Bronze',
  'palier.effectif.1': '{n} client',
  'palier.effectif.n': '{n} clients',
  'palier.plage.dernier': '{depuis} points and more',
  'palier.plage': '{depuis} to {fin} points',
  'palier.avantage': 'Perk to define',
  'palier.revenus.1': '{n} came back this month',
  'palier.revenus.n': '{n} came back this month',
  'palier.carres': '{revenus} of {total} clients came back this month',
  'palier.seuil': '{n}',
  'palier.vide': 'Nobody here for now',
  'palier.autres.n': '{n} other {niveau} clients',
  'palier.autres.1': '{n} other {niveau} client',

  'client.points': '{n} pts',
  'client.info': '{nom} · {points} points · last activity {jour}',
  'client.montee.n': 'only {n} points to go',
  'client.montee.1': 'only {n} point to go',

  'pied.titre': 'Earn points',
  'pied.euro.1': '1 € billed = {n} point',
  'pied.euro.n': '1 € billed = {n} points',
  'pied.avis': 'Review left = {n} points',
  'pied.reco': 'Client referred = {n} points',

  'offrir.titre': 'To offer this week',
  'offrir.progression': '{fait} of {total} done',
  'offrir.cocher': 'Mark the gesture for {nom} as done',
  'offrir.anniversaire': '{n}th anniversary on {jour}',
  'offrir.seuil': '{points} points passed',
  'offrir.palier': 'Moves up to {niveau}',
  'offrir.recompense.anniversaire': 'A word to mark the anniversary',
  'offrir.recompense.seuil': 'A small perk on the next visit',
  'offrir.recompense.palier': 'A welcome word',
  'offrir.vide': 'No gesture to plan this week.',

  'programme.titre': 'The program this month',
  'programme.points': 'Points given',
  'programme.points.sous': 'this month',
  'programme.avantages': 'Perks used',
  'programme.avantages.sous': '{montant} offered',
  'programme.avantages.aucun': 'none yet',
  'programme.revenus': 'Clients back',
  'programme.revenus.sous': 'out of {n} loyal',

  'suggestion.titre': 'A gesture for {nom}',
  'suggestion.texte': 'They have not come back for {jours} days, usually it is every {rythme} days. A 10 % perk can please them.',
  'suggestion.preparer': 'Prepare',
  'suggestion.nonMerci': 'No thanks',
  'suggestion.astuce.titre': 'Tip',
  'suggestion.astuce.texte': 'A word for a relationship anniversary often brings a client back.',

  'etat.vide.titre': 'Start your loyalty program',
  'etat.vide.texte': 'Clients earn points as they pay, leave a review or refer someone.',
  'etat.erreur': 'Loyalty could not be loaded.',
  'etat.reessayer': 'Try again',
  'etat.chargement': 'Loading loyalty…',
  'etat.horsLigne': 'You are offline: this is the last saved ladder.',
} as const;

const FR: Record<keyof typeof EN, string> = {
  'titre': 'Fidélité',
  'sousTitre': 'Récompense ceux qui reviennent · 3 paliers, aucun effort',
  'action.regles': 'Règles du programme',
  'action.offrir': 'Offrir un avantage',

  'echelle.titre': 'Échelle des paliers',
  'echelle.puces': 'Filtrer les clients',
  'echelle.tous': 'Tous',
  'echelle.bientot': 'Bientôt au palier suivant',
  'echelle.inactifs': 'Inactifs',
  'echelle.fideles': 'clients fidèles sur {total}',
  'echelle.graphique': 'Échelle de trois paliers : {or} clients Or, {argent} Argent, {bronze} Bronze',

  'palier.Or': 'Or',
  'palier.Argent': 'Argent',
  'palier.Bronze': 'Bronze',
  'palier.effectif.1': '{n} client',
  'palier.effectif.n': '{n} clients',
  'palier.plage.dernier': '{depuis} points et plus',
  'palier.plage': '{depuis} à {fin} points',
  'palier.avantage': 'Avantage à définir',
  'palier.revenus.1': '{n} revenu ce mois',
  'palier.revenus.n': '{n} revenus ce mois',
  'palier.carres': '{revenus} clients sur {total} revenus ce mois',
  'palier.seuil': '{n}',
  'palier.vide': 'Personne ici pour l’instant',
  'palier.autres.n': '{n} autres clients {niveau}',
  'palier.autres.1': '{n} autre client {niveau}',

  'client.points': '{n} pts',
  'client.info': '{nom} · {points} points · dernière activité {jour}',
  'client.montee.n': 'plus que {n} points',
  'client.montee.1': 'plus que {n} point',

  'pied.titre': 'Gagner des points',
  'pied.euro.1': '1 € facturé = {n} point',
  'pied.euro.n': '1 € facturé = {n} points',
  'pied.avis': 'Avis laissé = {n} points',
  'pied.reco': 'Client recommandé = {n} points',

  'offrir.titre': 'À offrir cette semaine',
  'offrir.progression': '{fait} sur {total} fait',
  'offrir.cocher': 'Marquer le geste pour {nom} comme fait',
  'offrir.anniversaire': '{n}e anniversaire le {jour}',
  'offrir.seuil': '{points} points dépassés',
  'offrir.palier': 'Passage en {niveau}',
  'offrir.recompense.anniversaire': 'Un mot pour fêter l’anniversaire',
  'offrir.recompense.seuil': 'Un petit avantage sur la prochaine visite',
  'offrir.recompense.palier': 'Un mot de bienvenue',
  'offrir.vide': 'Aucun geste à prévoir cette semaine.',

  'programme.titre': 'Le programme ce mois',
  'programme.points': 'Points distribués',
  'programme.points.sous': 'ce mois',
  'programme.avantages': 'Avantages utilisés',
  'programme.avantages.sous': '{montant} offerts',
  'programme.avantages.aucun': 'aucun pour l’instant',
  'programme.revenus': 'Clients revenus',
  'programme.revenus.sous': 'sur {n} fidèles',

  'suggestion.titre': 'Un geste pour {nom}',
  'suggestion.texte': 'Ils ne sont pas revenus depuis {jours} jours, d’habitude c’est tous les {rythme} jours. Un avantage de 10 % peut leur faire plaisir.',
  'suggestion.preparer': 'Préparer',
  'suggestion.nonMerci': 'Non merci',
  'suggestion.astuce.titre': 'Astuce',
  'suggestion.astuce.texte': 'Un mot pour un anniversaire de relation fait souvent revenir un client.',

  'etat.vide.titre': 'Lance ton programme de fidélité',
  'etat.vide.texte': 'Les clients gagnent des points en payant, en laissant un avis ou en recommandant quelqu’un.',
  'etat.erreur': 'La fidélité n’a pas pu être chargée.',
  'etat.reessayer': 'Réessayer',
  'etat.chargement': 'Chargement de la fidélité…',
  'etat.horsLigne': 'Tu es hors ligne : voici la dernière échelle enregistrée.',
};

const mots = definirMots(EN, FR);
export const useMotsFidelite = mots.useMots;
export const traduireFidelite = mots.traduire;
export const DICTIONNAIRES_FIDELITE = mots.dictionnaires;
