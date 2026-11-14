import { CATALOGUE } from './catalogue';
import type { Categorie, CategorieId, Jour, Tarif } from './types';

/**
 * LES TARIFS RELEVÉS — le seul endroit où un montant entre dans le modèle.
 *
 * Un relevé se fait à la main, sur la page publique du service, le jour où
 * l'on construit l'écran (PLAN-10NOV §4). Il porte :
 *   · la source (une adresse https de la page lue) ;
 *   · la date du relevé ;
 *   · la formule et les montants, en centimes, hors taxes ou non (dit).
 *
 * Vide au 12 nov. (mode préparation). Premier relevé le 14 nov. (S6, LOT-07),
 * pour H21 : seuls les tarifs publiés EN EUROS et lus mot pour mot sur la page
 * officielle sont entrés. Un tarif publié en dollars attend : le modèle n'a pas
 * de devise, et convertir serait inventer. Un tarif illisible (page chargée par
 * script, redirection, page introuvable) attend aussi. Le détail de ce qui
 * reste « à relever » est dans le rapport de S6. `check:connecteurs` vérifie
 * chaque entrée ajoutée ici (source, date passée, montants positifs, option connue).
 *
 * `horsTaxes: false` veut dire « la page ne dit pas hors taxes » : le montant
 * est pris tel qu'affiché.
 */

export type TarifReleve = Extract<Tarif, { etat: 'releve' }>;

export interface Releve {
  categorie: CategorieId;
  optionId: string;
  tarif: TarifReleve;
}

const LE_14_NOV = '2026-11-14';

export const RELEVES: readonly Releve[] = [
  // Offre Starter, 8 000 courriels par mois. La page dit : « tous les prix […] n'incluent pas la TVA ».
  {
    categorie: 'messagerie',
    optionId: 'mailjet',
    tarif: { etat: 'releve', formule: 'abonnement', fixeMensuelCents: 800, inclusParMois: 8000, unite: 'envoi', source: 'https://www.mailjet.com/fr/tarifs/', releveLe: LE_14_NOV, horsTaxes: true },
  },
  // « All standard use of the Gmail API is available at no additional cost. »
  {
    categorie: 'messagerie',
    optionId: 'gmail',
    tarif: { etat: 'releve', formule: 'gratuit', source: 'https://developers.google.com/gmail/api/reference/quota', releveLe: LE_14_NOV, horsTaxes: false },
  },
  // « All standard use of the Google Calendar API is available at no additional cost. »
  {
    categorie: 'agenda',
    optionId: 'google-agenda',
    tarif: { etat: 'releve', formule: 'gratuit', source: 'https://developers.google.com/workspace/calendar/api/guides/quota', releveLe: LE_14_NOV, horsTaxes: false },
  },
  // « 1,5 % + 0,25 € » pour les cartes standard de l'Espace économique européen ; sans frais mensuels.
  {
    categorie: 'paiement',
    optionId: 'stripe',
    tarif: { etat: 'releve', formule: 'commission', commissionDixMillieme: 150, commissionFixeCents: 25, unite: 'transaction', source: 'https://stripe.com/fr/pricing', releveLe: LE_14_NOV, horsTaxes: false },
  },
  // « 1,80 % + 0,25 € » pour les cartes de consommateur de l'Espace économique européen.
  {
    categorie: 'paiement',
    optionId: 'mollie',
    tarif: { etat: 'releve', formule: 'commission', commissionDixMillieme: 180, commissionFixeCents: 25, unite: 'transaction', source: 'https://www.mollie.com/fr/pricing', releveLe: LE_14_NOV, horsTaxes: false },
  },
  // Offre Standard, prélèvement en zone euro : « 1 % + 0,20 € », « Plafonnés à 2 € » (le modèle n'a pas de plafond par
  // transaction : le coût affiché est donc un maximum) ; « Les prix sont hors TVA ».
  {
    categorie: 'paiement',
    optionId: 'gocardless',
    tarif: { etat: 'releve', formule: 'commission', commissionDixMillieme: 100, commissionFixeCents: 20, unite: 'transaction', source: 'https://gocardless.com/fr-fr/tarifs/', releveLe: LE_14_NOV, horsTaxes: true },
  },
  // Premier pack affiché : « 100 SMS », « 0,06 € HT/SMS ». La page ne précise pas la destination : à revérifier.
  {
    categorie: 'sms',
    optionId: 'ovh-sms',
    tarif: { etat: 'releve', formule: 'a-l-usage', parUniteCents: 6, unite: 'sms', source: 'https://www.ovhcloud.com/fr/sms/', releveLe: LE_14_NOV, horsTaxes: true },
  },
];

/** Au-delà, un relevé est « ancien » : on l'affiche avec sa date, en invitant à le revérifier. */
export const JOURS_AVANT_ANCIEN = 90;
/** Au-delà, un relevé est « périmé » : il ne suffit plus pour activer. */
export const JOURS_AVANT_PERIME = 365;

export type Fraicheur = 'a-relever' | 'chez-nous' | 'frais' | 'ancien' | 'perime';

const MS_JOUR = 86_400_000;

function jourEnMs(j: Jour): number {
  const [a, m, d] = j.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
}

/** Nombre de jours pleins entre deux dates du calendrier. */
export function joursEntre(debut: Jour, fin: Jour): number {
  return Math.round((jourEnMs(fin) - jourEnMs(debut)) / MS_JOUR);
}

export function fraicheur(tarif: Tarif, aujourdhui: Jour): Fraicheur {
  if (tarif.etat === 'a-relever') return 'a-relever';
  if (tarif.etat === 'chez-nous') return 'chez-nous';
  const age = joursEntre(tarif.releveLe, aujourdhui);
  if (age > JOURS_AVANT_PERIME) return 'perime';
  if (age > JOURS_AVANT_ANCIEN) return 'ancien';
  return 'frais';
}

/** Un tarif qu'on peut montrer : relevé, ou une brique à nous (0 €). */
export type TarifConnu = Exclude<Tarif, { etat: 'a-relever' }>;

/** Un tarif suffit-il pour afficher un coût AVANT l'activation ? */
export function tarifAffichable(tarif: Tarif, aujourdhui: Jour): tarif is TarifConnu {
  const f = fraicheur(tarif, aujourdhui);
  return f === 'chez-nous' || f === 'frais' || f === 'ancien';
}

/** Gratuit : une brique à nous, ou un service relevé gratuit. */
export function estGratuit(tarif: TarifConnu): boolean {
  return tarif.etat === 'chez-nous' || tarif.formule === 'gratuit';
}

/**
 * Ce qui ne va pas dans un relevé, ou une liste vide s'il est recevable.
 * Les messages sont pour la garde et pour la relecture, pas pour l'écran.
 */
export function defautsDuReleve(r: Releve, aujourdhui: Jour): string[] {
  const d: string[] = [];
  const t = r.tarif;
  const cat = CATALOGUE.find((c) => c.id === r.categorie);
  if (!cat) d.push(`catégorie inconnue : ${r.categorie}`);
  else {
    const opt = cat.options.find((o) => o.id === r.optionId);
    if (!opt) d.push(`option inconnue : ${r.categorie}/${r.optionId}`);
    else if (opt.nature === 'chez-nous') d.push(`brique chez nous, rien à relever : ${r.categorie}/${r.optionId}`);
  }
  if (!/^https:\/\/[^\s/]+\.[^\s]+$/.test(t.source)) d.push('source : une adresse https est attendue');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.releveLe)) d.push('date du relevé : AAAA-MM-JJ attendu');
  else if (joursEntre(t.releveLe, aujourdhui) < 0) d.push('date du relevé dans le futur');
  const montants = [t.fixeMensuelCents, t.parUniteCents, t.commissionDixMillieme, t.commissionFixeCents, t.inclusParMois];
  if (montants.some((m) => m !== undefined && (!Number.isFinite(m) || m < 0))) d.push('montant négatif ou non fini');
  if (t.formule === 'abonnement' && t.fixeMensuelCents === undefined) d.push('abonnement sans montant mensuel');
  if (t.formule === 'a-l-usage' && (t.parUniteCents === undefined || !t.unite)) d.push('tarif à l’usage sans prix unitaire ni unité');
  if (t.formule === 'commission' && t.commissionDixMillieme === undefined && t.commissionFixeCents === undefined) d.push('commission sans taux');
  if (t.formule === 'gratuit' && [t.fixeMensuelCents, t.parUniteCents, t.commissionDixMillieme, t.commissionFixeCents].some((m) => (m ?? 0) > 0)) {
    d.push('gratuit avec un montant');
  }
  return d;
}

/** Le catalogue, avec les tarifs relevés posés sur leurs options. */
export function catalogueTarife(releves: readonly Releve[] = RELEVES): readonly Categorie[] {
  return CATALOGUE.map((c) => ({
    ...c,
    options: c.options.map((o) => {
      const r = releves.find((x) => x.categorie === c.id && x.optionId === o.id);
      return r ? { ...o, tarif: r.tarif } : o;
    }),
  }));
}
