import { definirMots, type ParamsMots } from '../../socle/mots';
import type { Langue } from './commun';

/**
 * LES MOTS CALCULÉS DE LOT-02 (Mes contacts et clients), fr et en.
 *
 * Ne figurent ici que les phrases que la LOGIQUE produit (verdicts de relance,
 * progression de fidélité, états de rendez-vous, messages envoyés à un client). Le reste
 * des textes de chaque écran viendra de sa fiche à la construction visuelle.
 *
 * DEUX VOIX, comme le veut `REGLES.md` (dossier v4) :
 *   · l'INTERFACE tutoie (« Tu as déjà relancé… ») ;
 *   · tout ce qui PART chez un client vouvoie : les clés `client.*`.
 * `check:contacts` vérifie les deux sens.
 *
 * Les comptes se disent par clé : `<base>.1` (0 et 1), `<base>.n` (2 et plus).
 */
const EN = {
  // Pipeline
  'pipeline.colonne.Nouveau': 'New',
  'pipeline.colonne.Rendez-vous': 'Meeting',
  'pipeline.colonne.Devis envoyé': 'Quote sent',
  'pipeline.colonne.Signé': 'Signed',
  'pipeline.enRetard.1': '{n} next step is late',
  'pipeline.enRetard.n': '{n} next steps are late',
  'pipeline.conversion': '{pct}% of your closed leads signed',
  'pipeline.conversion.aucune': 'No closed lead yet',
  'pipeline.sansMontant.1': '{n} lead without an amount, not counted',
  'pipeline.sansMontant.n': '{n} leads without an amount, not counted',
  'pipeline.vide': 'No lead yet. Add the first one whenever you like.',
  'pipeline.signe': 'One more client. Well done!',
  'pipeline.rouvrir.confirmer': 'Reopen this lead? It goes back to New, and the history keeps a note of it.',
  'pipeline.rouvrir.trace': 'Reopened on {jour} (lost on {perdu})',
  // Relances — l'interface
  'relance.attente.terminee': 'This one is closed. Nothing more to send.',
  'relance.attente.plafond': '{n} reminders sent: from here, follow up by hand.',
  'relance.attente.espacement': 'Not before {quand}: {jours} days between two reminders on the same item.',
  'relance.attente.client': 'Not before {quand}: one reminder a week at most.',
  'relance.attente.echangeRecent': 'Not before {quand}: you just talked with this client.',
  'relance.attente.pauseAvis': 'Paused until {quand}: their review is waiting for an answer.',
  'relance.attente.horsPlage': 'Goes out on {quand} at {debut} (reminders go out between {debut} and {fin} on working days).',
  'relance.part.maintenant': 'goes out now',
  'relance.part.plusTard': 'goes out {quand} at {heure}',
  'relance.derniere': 'Last reminder by message, then follow up by hand.',
  'relance.suggestion.appel': 'A call rather than a message',
  'relance.rang': 'Reminder {rang} of {max} for this {objet}',
  'relance.boiteAZero.reste.1': '{n} more and the inbox is at zero.',
  'relance.boiteAZero.reste.n': '{n} more and the inbox is at zero.',
  'relance.boiteAZero.vide': 'Inbox at zero. Nobody is waiting for news today.',
  'relance.serie.1': '{n} day in a row',
  'relance.serie.n': '{n} days in a row',
  'relance.reponse.payee': 'paid',
  'relance.redige': 'Written by Ajmani with your words · nothing goes out without your click',
  'relance.envoyee': 'Reminder sent. You have nothing more to do for this one.',
  'relance.vide': 'No reminder to send. Everyone is up to date.',
  'relance.pretes.1': '{n} reminder ready',
  'relance.pretes.n': '{n} reminders ready',
  // Fidélité
  'fidelite.niveau.Bronze': 'Bronze',
  'fidelite.niveau.Argent': 'Silver',
  'fidelite.niveau.Or': 'Gold',
  'fidelite.manque': '{n} more points to reach {niveau}',
  'fidelite.max': 'Highest level reached',
  'fidelite.points.1': '{n} point',
  'fidelite.points.n': '{n} points',
  'fidelite.inactifs.1': '{n} client has been quiet for a while',
  'fidelite.inactifs.n': '{n} clients have been quiet for a while',
  'fidelite.formule.points': 'Points and levels',
  'fidelite.formule.tampons': 'Stamp card',
  'fidelite.tampons.manque.1': '{n} more stamp for the reward',
  'fidelite.tampons.manque.n': '{n} more stamps for the reward',
  'fidelite.tampons.pleine': 'Card full: the reward is due',
  // Rendez-vous
  'rdv.etat.a-venir': 'Confirmed',
  'rdv.etat.a-confirmer': 'To confirm',
  'rdv.etat.en-cours': 'Happening now',
  'rdv.etat.passe': 'Done',
  'rdv.etat.manque': 'Missed',
  'rdv.aConfirmer.1': '{n} meeting to confirm',
  'rdv.aConfirmer.n': '{n} meetings to confirm',
  'rdv.manque.propose': 'This meeting was missed. Want to suggest a new time?',
  'rdv.libre.aucun': 'No free slot that day.',
  // Contacts par client
  'contacts.indisponible': 'Contact sheets are not available yet: the list of contacts waits for a decision.',
  'contacts.principal': 'Write to {nom} first',
  'contacts.aucun': 'No contact yet for this client. Add the first one.',
  'contacts.nonLus.1': '{n} unread message',
  'contacts.nonLus.n': '{n} unread messages',
  'contacts.sansEchange': 'No news for {n} days',
  // Ce qui part chez un client (vouvoiement)
  'client.bonjour': 'Hello,',
  'client.bonjour.prenom': 'Hello {prenom},',
  'client.suite': 'I am following up on my previous message.',
  'client.facture': 'invoice {objet} for {montant}, due on {jour}, does not appear as paid yet. Could you confirm the payment date?',
  'client.devis': 'I am following up on quote {objet}, sent on {jour}. Have you had a chance to look at it? I can adjust the schedule if the lead time is a concern.',
  'client.rendez-vous': 'we could not meet as planned. Would you like us to find a new time?',
  'client.prospect': 'following our first conversation, would you like us to detail our proposal for “{objet}”?',
  'client.inactif': 'we have not spoken for a while. Is there a project we could help you with?',
  'client.cordialement': 'Kind regards.',
  'client.chaleureux.intro': 'I hope you are well.',
  'client.chaleureux.fin': 'Warmest regards.',
  'client.bref.fin': 'Thank you in advance.',
  'client.sujet.facture': 'Your invoice {objet}',
  'client.sujet.devis': 'Your quote {objet}',
  'client.sujet.rendez-vous': 'Our meeting',
  'client.sujet.prospect': 'Following our conversation',
  'client.sujet.inactif': 'Catching up',
} as const;

const FR: Record<keyof typeof EN, string> = {
  'pipeline.colonne.Nouveau': 'Nouveau',
  'pipeline.colonne.Rendez-vous': 'Rendez-vous',
  'pipeline.colonne.Devis envoyé': 'Devis envoyé',
  'pipeline.colonne.Signé': 'Signé',
  'pipeline.enRetard.1': '{n} prochaine étape en retard',
  'pipeline.enRetard.n': '{n} prochaines étapes en retard',
  'pipeline.conversion': '{pct} % de tes prospects conclus ont signé',
  'pipeline.conversion.aucune': 'Aucun prospect conclu pour l’instant',
  'pipeline.sansMontant.1': '{n} prospect sans montant, non compté',
  'pipeline.sansMontant.n': '{n} prospects sans montant, non comptés',
  'pipeline.vide': 'Aucun prospect pour l’instant. Ajoute le premier quand tu veux.',
  'pipeline.signe': 'Un client de plus. Bravo !',
  'pipeline.rouvrir.confirmer': 'Tu veux rouvrir ce prospect ? Il repart en « Nouveau », et l’historique en garde une trace.',
  'pipeline.rouvrir.trace': 'Rouvert le {jour} (perdu le {perdu})',
  'relance.attente.terminee': 'Celle-ci est terminée. Il n’y a plus rien à envoyer.',
  'relance.attente.plafond': '{n} relances envoyées : ensuite, suivi à la main.',
  'relance.attente.espacement': 'Pas avant le {quand} : {jours} jours entre deux relances d’un même objet.',
  'relance.attente.client': 'Pas avant le {quand} : une relance par semaine au plus.',
  'relance.attente.echangeRecent': 'Pas avant le {quand} : tu viens d’échanger avec ce client.',
  'relance.attente.pauseAvis': 'En pause jusqu’au {quand} : son avis attend une réponse.',
  'relance.attente.horsPlage': 'Part le {quand} à {debut} (les relances partent entre {debut} et {fin}, les jours ouvrés).',
  'relance.part.maintenant': 'part maintenant',
  'relance.part.plusTard': 'part {quand} à {heure}',
  'relance.derniere': 'Dernière relance par message, ensuite suivi à la main.',
  'relance.suggestion.appel': 'Un appel plutôt qu’un message',
  'relance.rang': 'Relance {rang} sur {max} pour ce {objet}',
  'relance.boiteAZero.reste.1': 'Encore {n} et la boîte est à zéro.',
  'relance.boiteAZero.reste.n': 'Encore {n} et la boîte est à zéro.',
  'relance.boiteAZero.vide': 'Boîte à zéro. Personne n’attend de nouvelles aujourd’hui.',
  'relance.serie.1': '{n} jour de suite',
  'relance.serie.n': '{n} jours de suite',
  'relance.reponse.payee': 'payée',
  'relance.redige': 'Rédigé par Ajmani avec tes mots · rien ne part sans ton clic',
  'relance.envoyee': 'Relance envoyée. Tu n’as plus rien à faire pour celle-ci.',
  'relance.vide': 'Aucune relance à envoyer. Tout le monde est à jour.',
  'relance.pretes.1': '{n} relance prête',
  'relance.pretes.n': '{n} relances prêtes',
  'fidelite.niveau.Bronze': 'Bronze',
  'fidelite.niveau.Argent': 'Argent',
  'fidelite.niveau.Or': 'Or',
  'fidelite.manque': 'Encore {n} points pour passer {niveau}',
  'fidelite.max': 'Niveau le plus haut atteint',
  'fidelite.points.1': '{n} point',
  'fidelite.points.n': '{n} points',
  'fidelite.inactifs.1': '{n} client est silencieux depuis un moment',
  'fidelite.inactifs.n': '{n} clients sont silencieux depuis un moment',
  'fidelite.formule.points': 'Points et niveaux',
  'fidelite.formule.tampons': 'Carte à tampons',
  'fidelite.tampons.manque.1': 'Encore {n} tampon pour la récompense',
  'fidelite.tampons.manque.n': 'Encore {n} tampons pour la récompense',
  'fidelite.tampons.pleine': 'Carte pleine : la récompense est due',
  'rdv.etat.a-venir': 'Confirmé',
  'rdv.etat.a-confirmer': 'À confirmer',
  'rdv.etat.en-cours': 'En ce moment',
  'rdv.etat.passe': 'Passé',
  'rdv.etat.manque': 'Manqué',
  'rdv.aConfirmer.1': '{n} rendez-vous à confirmer',
  'rdv.aConfirmer.n': '{n} rendez-vous à confirmer',
  'rdv.manque.propose': 'Ce rendez-vous a été manqué. Tu veux proposer un autre créneau ?',
  'rdv.libre.aucun': 'Aucun créneau libre ce jour-là.',
  'contacts.indisponible': 'Les fiches contacts ne sont pas encore disponibles : la liste des contacts attend une décision.',
  'contacts.principal': 'Écris d’abord à {nom}',
  'contacts.aucun': 'Aucun contact pour ce client. Ajoute le premier.',
  'contacts.nonLus.1': '{n} message non lu',
  'contacts.nonLus.n': '{n} messages non lus',
  'contacts.sansEchange': 'Sans nouvelles depuis {n} jours',
  'client.bonjour': 'Bonjour,',
  'client.bonjour.prenom': 'Bonjour {prenom},',
  'client.suite': 'Je me permets de revenir vers vous au sujet de mon précédent message.',
  'client.facture': 'sauf erreur de notre part, la facture {objet} de {montant}, échue le {jour}, n’apparaît pas encore comme réglée. Pourriez-vous nous confirmer la date de règlement ?',
  'client.devis': 'je reviens vers vous au sujet du devis {objet} envoyé le {jour}. Avez-vous pu le parcourir ? Je reste disponible pour ajuster le calendrier si le délai vous pose question.',
  'client.rendez-vous': 'nous n’avons pas pu nous rencontrer comme prévu. Souhaitez-vous que nous convenions d’un nouveau créneau ?',
  'client.prospect': 'suite à notre premier échange, souhaitez-vous que nous précisions notre proposition pour « {objet} » ?',
  'client.inactif': 'nous n’avons pas échangé depuis un moment. Y a-t-il un projet sur lequel nous pourrions vous aider ?',
  'client.cordialement': 'Bien cordialement.',
  'client.chaleureux.intro': 'J’espère que vous allez bien.',
  'client.chaleureux.fin': 'Bien chaleureusement.',
  'client.bref.fin': 'Merci d’avance.',
  'client.sujet.facture': 'Votre facture {objet}',
  'client.sujet.devis': 'Votre devis {objet}',
  'client.sujet.rendez-vous': 'Notre rendez-vous',
  'client.sujet.prospect': 'Suite à notre échange',
  'client.sujet.inactif': 'Prendre de vos nouvelles',
};

const mots = definirMots(EN, FR);
export const useMotsContacts = mots.useMots;
export const DICTIONNAIRES_CONTACTS = mots.dictionnaires;
export type CleContacts = keyof typeof EN;

export function dire(langue: Langue, cle: CleContacts, params?: ParamsMots): string {
  return mots.traduire(langue, cle, params);
}

/** `<base>.1` pour 0 et 1, `<base>.n` au-delà (usage français). */
export function direCompte(langue: Langue, base: string, n: number, params: ParamsMots = {}): string {
  return dire(langue, `${base}.${n <= 1 ? '1' : 'n'}` as CleContacts, { n, ...params });
}
