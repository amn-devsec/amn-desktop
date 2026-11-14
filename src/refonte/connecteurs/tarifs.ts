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
 * La liste est VIDE au 12 nov. : rien n'a été relevé en mode préparation, et
 * aucun chiffre n'est écrit de mémoire. `check:connecteurs` vérifie chaque
 * entrée ajoutée ici (source, date passée, montants positifs, option connue).
 */

export type TarifReleve = Extract<Tarif, { etat: 'releve' }>;

export interface Releve {
  categorie: CategorieId;
  optionId: string;
  tarif: TarifReleve;
}

export const RELEVES: readonly Releve[] = [];

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
