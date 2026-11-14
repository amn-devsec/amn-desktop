import { definirMots } from '../../socle/mots';

/**
 * LES MOTS CALCULÉS DE L'ARGENT (LOT-04), fr et en.
 *
 * Seules les phrases que la LOGIQUE produit sont ici (statuts, tranches, états,
 * phrases de la trésorerie) ; le reste du texte de chaque écran sera repris de sa
 * fiche à la construction visuelle. L'anglais est la base, le français est typé
 * contre lui.
 *
 * Deux voix :
 *   · l'interface TUTOIE (dossier v4, 06 §4) ;
 *   · ce qui part chez un client — relances, devis, factures — VOUVOIE. Ces textes
 *     ont tous une clé qui commence par `client.` ; `check:argent` vérifie les deux
 *     règles.
 */
const EN = {
  // Factures (G03, MA04)
  'facture.brouillon': 'Draft',
  'facture.envoyee': 'Sent',
  'facture.en-retard': 'Overdue',
  'facture.partiellement-payee': 'Partly paid',
  'facture.payee': 'Paid',
  'facture.annulee': 'Cancelled',
  'facture.retard': '{n} days late',
  'facture.trouNumerotation': 'Gap in the numbering: {numero} is missing',
  'facture.delaiNonConforme': 'Due date more than 60 days after the invoice date',
  'mentions.complet': 'All the required details are there. Have your accountant confirm it.',
  'mentions.manquantes': '{n} required details missing',
  // Devis (H07)
  'devis.brouillon': 'Draft',
  'devis.envoye': 'Sent',
  'devis.vu': 'Seen',
  'devis.accepte': 'Accepted',
  'devis.refuse': 'Declined',
  'devis.expire': 'Expired',
  'devis.prerempli': 'Quote prepared from {prestation}: check it, then send it.',
  'devis.transformation': '{n} % of decided quotes accepted',
  // Impayés (MA04)
  'tranche.0-30': 'Up to 30 days',
  'tranche.31-60': '31 to 60 days',
  'tranche.61-90': '61 to 90 days',
  'tranche.90+': 'Over 90 days',
  'impayes.aucun': 'No unpaid invoices. Nice work.',
  'impayes.delaiMoyen': 'Paid in {n} days on average',
  'impayes.relancePreparee': 'Reminder ready: read it, then send it from your mailbox.',
  'palier.rappel': 'Friendly reminder',
  'palier.ferme': 'Firm reminder',
  'palier.mise-en-demeure': 'Formal notice',
  'palier.dernier-avis': 'Final notice',
  'penalites.minimumLegal': 'Legal minimum: three times the legal interest rate',
  'tresorerie.avecEpargne': 'Include savings',
  'tresorerie.epargneAPart': 'Savings, shown separately: {montant}',
  // TVA et impôts (MA08)
  'tva.aPayer': 'VAT to pay',
  'tva.credit': 'VAT credit',
  'tva.aValider': 'To check with your accountant',
  'tva.regime.debits': 'On invoices issued',
  'tva.regime.encaissements': 'On payments received',
  'fiscal.en-retard': 'Late',
  'fiscal.a-payer': 'To pay',
  'fiscal.montantInconnu': 'Amount to come',
  // Budget (MA06)
  'budget.ok': 'On track',
  'budget.attention': 'Watch it',
  'budget.depasse': 'Over budget',
  'budget.projection': 'At this pace: {montant} by the end of the month',
  // Trésorerie (H09, MA07)
  'tresorerie.pointBas': 'Lowest point on {date}',
  'tresorerie.sousZero': 'You go below zero on {date}',
  'tresorerie.tient': 'Your cash holds for the next {n} weeks',
  'tresorerie.besoin': 'You would be short of {montant}',
  'tresorerie.attendu': 'Expected',
  'tresorerie.prudent': 'Cautious',
  'tresorerie.incertain': 'Late invoice: date uncertain',
  // Banque (MA10), paie (MA11), connecteurs
  'banque.lectureSeule': 'Read-only: the app never makes a transfer.',
  'banque.ordrePrepare': 'Order ready: approve it in your bank.',
  'banque.aBrancher': 'Connect your bank in Connectors (H21) to see your balances here.',
  'paiements.aBrancher': 'Connect a payment provider in Connectors (H21) to take payments online.',
  'paie.masques': 'Amounts hidden',
  'paie.afficher': 'Show amounts',
  // Ce qui part chez un client : vouvoiement
  'client.relance.rappel': 'Hello, unless we are mistaken, invoice {numero} of {montant}, due on {echeance}, has not been paid yet. Could you please arrange payment? Thank you.',
  'client.relance.ferme': 'Hello, invoice {numero} of {montant}, due on {echeance}, is now {jours} days overdue. Please settle it as soon as possible.',
  'client.relance.mise-en-demeure': 'Hello, despite our reminders, invoice {numero} of {montant}, due on {echeance}, remains unpaid after {jours} days. We ask you to pay it within eight days.',
  'client.relance.dernier-avis': 'Hello, invoice {numero} of {montant}, due on {echeance}, has been unpaid for {jours} days. Without your payment, we will have to take further steps.',
  'client.devis.intro': 'Please find our quote {numero} below. It is valid until {validite}.',
} as const;

const FR: Record<keyof typeof EN, string> = {
  'facture.brouillon': 'Brouillon',
  'facture.envoyee': 'Envoyée',
  'facture.en-retard': 'En retard',
  'facture.partiellement-payee': 'Payée en partie',
  'facture.payee': 'Payée',
  'facture.annulee': 'Annulée',
  'facture.retard': '{n} jours de retard',
  'facture.trouNumerotation': 'Trou dans la numérotation : il manque {numero}',
  'facture.delaiNonConforme': 'Échéance à plus de 60 jours de la facture',
  'mentions.complet': 'Toutes les mentions sont là. Fais-le confirmer par ton comptable.',
  'mentions.manquantes': '{n} mentions obligatoires manquent',
  'devis.brouillon': 'Brouillon',
  'devis.envoye': 'Envoyé',
  'devis.vu': 'Vu',
  'devis.accepte': 'Accepté',
  'devis.refuse': 'Refusé',
  'devis.expire': 'Expiré',
  'devis.prerempli': 'Devis préparé à partir de {prestation} : relis-le, puis envoie-le.',
  'devis.transformation': '{n} % des devis tranchés acceptés',
  'tranche.0-30': 'Jusqu’à 30 jours',
  'tranche.31-60': 'De 31 à 60 jours',
  'tranche.61-90': 'De 61 à 90 jours',
  'tranche.90+': 'Plus de 90 jours',
  'impayes.aucun': 'Aucun impayé. Beau travail.',
  'impayes.delaiMoyen': 'Payé en {n} jours en moyenne',
  'impayes.relancePreparee': 'Relance prête : relis-la, puis envoie-la depuis ta messagerie.',
  'palier.rappel': 'Rappel aimable',
  'palier.ferme': 'Relance ferme',
  'palier.mise-en-demeure': 'Mise en demeure',
  'palier.dernier-avis': 'Dernier avis',
  'penalites.minimumLegal': 'Minimum légal : trois fois le taux d’intérêt légal',
  'tresorerie.avecEpargne': 'Compter l’épargne',
  'tresorerie.epargneAPart': 'Épargne, montrée à part : {montant}',
  'tva.aPayer': 'TVA à payer',
  'tva.credit': 'Crédit de TVA',
  'tva.aValider': 'À valider avec ton comptable',
  'tva.regime.debits': 'Sur les factures émises',
  'tva.regime.encaissements': 'Sur les paiements reçus',
  'fiscal.en-retard': 'En retard',
  'fiscal.a-payer': 'À payer',
  'fiscal.montantInconnu': 'Montant à venir',
  'budget.ok': 'Dans les clous',
  'budget.attention': 'À surveiller',
  'budget.depasse': 'Dépassé',
  'budget.projection': 'À ce rythme : {montant} à la fin du mois',
  'tresorerie.pointBas': 'Point bas le {date}',
  'tresorerie.sousZero': 'Tu passes sous zéro le {date}',
  'tresorerie.tient': 'Ta trésorerie tient sur les {n} prochaines semaines',
  'tresorerie.besoin': 'Il te manquerait {montant}',
  'tresorerie.attendu': 'Attendu',
  'tresorerie.prudent': 'Prudent',
  'tresorerie.incertain': 'Facture en retard : date incertaine',
  'banque.lectureSeule': 'Lecture seule : l’application ne fait jamais de virement.',
  'banque.ordrePrepare': 'Ordre prêt : valide-le dans ta banque.',
  'banque.aBrancher': 'Branche ta banque dans Connecteurs (H21) pour voir tes soldes ici.',
  'paiements.aBrancher': 'Branche un service de paiement dans Connecteurs (H21) pour te faire payer en ligne.',
  'paie.masques': 'Montants masqués',
  'paie.afficher': 'Afficher les montants',
  'client.relance.rappel': 'Bonjour, sauf erreur de notre part, la facture {numero} de {montant}, échue le {echeance}, n’a pas encore été réglée. Pourriez-vous procéder à son règlement ? Merci.',
  'client.relance.ferme': 'Bonjour, la facture {numero} de {montant}, échue le {echeance}, a maintenant {jours} jours de retard. Nous vous remercions de la régler au plus vite.',
  'client.relance.mise-en-demeure': 'Bonjour, malgré nos relances, la facture {numero} de {montant}, échue le {echeance}, reste impayée après {jours} jours. Nous vous demandons de la régler sous huit jours.',
  'client.relance.dernier-avis': 'Bonjour, la facture {numero} de {montant}, échue le {echeance}, est impayée depuis {jours} jours. Sans votre règlement, nous devrons engager d’autres démarches.',
  'client.devis.intro': 'Vous trouverez ci-dessous notre devis {numero}, valable jusqu’au {validite}.',
};

export type CleArgent = keyof typeof EN;
export const { useMots, traduire, dictionnaires } = definirMots(EN, FR);
