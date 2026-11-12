import { CATALOGUE } from './catalogue';
import { arreter, briqueChezNousBranchee, modeEffectif, type Changement } from './cycle';
import { estGratuit, type TarifReleve } from './tarifs';
import type { Categorie, CategorieId, ConnecteurInstance, ConsommationMois } from './types';

/**
 * LES COÛTS (DEV-couts, LOT-11) — la part faite en local, le payé, le plafond.
 *
 * Tous les montants sont en centimes entiers. Aucun montant n'est estimé sans
 * tarif relevé : quand il en manque un, la fonction rend `null` et l'écran
 * n'affiche pas la ligne (« jamais deviné »).
 */

/** Part des opérations du mois faites en local, en % arrondi ; `null` s'il n'y en a eu aucune. */
export function partLocale(conso: readonly ConsommationMois[]): number | null {
  const loc = conso.reduce((s, c) => s + c.operationsLocales, 0);
  const tot = loc + conso.reduce((s, c) => s + c.operationsExternes, 0);
  if (tot === 0) return null;
  return Math.round((loc * 100) / tot);
}

export function payeCeMois(conso: readonly ConsommationMois[]): number {
  return conso.reduce((s, c) => s + c.payeCents, 0);
}

export type EtatPlafond = 'sous' | 'prevenir' | 'atteint';

export function etatPlafond(payeCents: number, plafondCents: number, seuilPrevenirPct = 80): EtatPlafond {
  if (plafondCents <= 0) return payeCents > 0 ? 'atteint' : 'sous';
  if (payeCents >= plafondCents) return 'atteint';
  // Comparaison en entiers : pas d'arrondi qui préviendrait à 79,6 %.
  if (payeCents * 100 >= plafondCents * seuilPrevenirPct) return 'prevenir';
  return 'sous';
}

/** Le coût d'un tarif relevé pour un volume donné, arrondi au centime supérieur. */
export function coutPour(tarif: TarifReleve, unites: number, encaisseCents = 0): number {
  let c = tarif.fixeMensuelCents ?? 0;
  if (tarif.parUniteCents !== undefined) c += Math.max(0, unites - (tarif.inclusParMois ?? 0)) * tarif.parUniteCents;
  if (tarif.formule === 'commission') {
    c += (encaisseCents * (tarif.commissionDixMillieme ?? 0)) / 10_000;
    c += unites * (tarif.commissionFixeCents ?? 0);
  }
  return Math.ceil(c - 1e-9);
}

/** Une prise est payante si elle est activée sur un tarif qui n'est pas gratuit. */
export function estPayant(i: ConnecteurInstance): boolean {
  return i.etat !== 'arrete' && !!i.coutAccepte && !estGratuit(i.coutAccepte.tarif);
}

/**
 * LE PLAFOND — « au plafond, tout s'arrête ».
 *
 * Deux plafonds, et le premier atteint gagne :
 *   · celui de chaque connecteur (accepté à l'activation) ;
 *   · le plafond mensuel global (DEV-couts, « 14 € sur 40 € »), qui arrête TOUS les payants.
 * Rend les arrêts à appliquer ; le mode local reprend aussitôt (`modeEffectif`).
 * Côté serveur, la coupure doit aussi exister (voir `amnApi.ts`, « releve-consommation ») :
 * un poste fermé ne doit pas laisser filer la dépense.
 */
export function arretsDusAuPlafond(
  instances: readonly ConnecteurInstance[],
  conso: readonly ConsommationMois[],
  plafondGlobalCents: number,
  maintenant: number,
): Changement[] {
  const payeDe = (c: CategorieId) => conso.filter((x) => x.categorie === c).reduce((s, x) => s + x.payeCents, 0);
  const globalAtteint = etatPlafond(payeCeMois(conso), plafondGlobalCents) === 'atteint';
  const ctx = { maintenant, peutGerer: true, enLigne: true, parEmail: '' };
  const r: Changement[] = [];
  for (const i of instances) {
    if (!estPayant(i) || !i.coutAccepte) continue;
    const propreAtteint = payeDe(i.categorie) >= i.coutAccepte.plafondMensuelCents;
    if (!globalAtteint && !propreAtteint) continue;
    const res = arreter(i, 'plafond', ctx);
    if (res.ok) r.push(res.valeur);
  }
  return r;
}

/**
 * « Tout en API payantes, ce mois coûterait environ N € » et « N € économisés ».
 * `references` : pour chaque catégorie, le tarif relevé de l'option de comparaison.
 * Une seule catégorie active sans référence relevée → `null` (la ligne ne s'affiche pas).
 */
export function siToutEnApi(conso: readonly ConsommationMois[], references: Partial<Record<CategorieId, TarifReleve>>): number | null {
  let total = 0;
  for (const c of conso) {
    const unites = c.operationsLocales + c.operationsExternes;
    if (unites === 0) continue;
    const t = references[c.categorie];
    if (!t) return null;
    total += coutPour(t, unites, c.encaisseCents ?? 0);
  }
  return total;
}

export function economise(conso: readonly ConsommationMois[], references: Partial<Record<CategorieId, TarifReleve>>): number | null {
  const tout = siToutEnApi(conso, references);
  if (tout === null) return null;
  return Math.max(0, tout - payeCeMois(conso));
}

/** Projection linéaire à la fin du mois (jourDuMois commence à 1). */
export function projectionFinDeMois(valeurALaDate: number, jourDuMois: number, joursDansLeMois: number): number {
  if (jourDuMois < 1) return valeurALaDate;
  return Math.round((valeurALaDate * joursDansLeMois) / Math.min(jourDuMois, joursDansLeMois));
}

/** Part d'un forfait consommée, en % arrondi ; `null` sans forfait. */
export function partDuForfait(unites: number, inclus: number | undefined): number | null {
  if (!inclus || inclus <= 0) return null;
  return Math.round((unites * 100) / inclus);
}

/** Ajmani propose de prévenir quand un forfait dépasse ce seuil (DEV-couts : « 72 % de ton forfait »). Valeur de départ, modifiable. */
export const SEUIL_SUGGESTION_FORFAIT = 70;

/** Les six derniers mois, du plus ancien au courant, les mois sans paiement à 0. `mois` = `AAAA-MM`. */
export function sixDerniersMois(paiements: readonly { mois: string; payeCents: number }[], moisCourant: string): { mois: string; payeCents: number }[] {
  const [a, m] = moisCourant.split('-').map(Number);
  const r: { mois: string; payeCents: number }[] = [];
  for (let k = 5; k >= 0; k -= 1) {
    const d = new Date(Date.UTC(a, m - 1 - k, 1));
    const cle = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    r.push({ mois: cle, payeCents: paiements.filter((p) => p.mois === cle).reduce((s, p) => s + p.payeCents, 0) });
  }
  return r;
}

/** La pastille de la colonne « Mode » de DEV-couts. */
export type Pastille = 'local' | 'payant' | 'externe-gratuit' | 'a-brancher';

/** La pastille d'une ligne de DEV-couts, par catégorie. Un service payant connecté l'emporte. */
export function pastille(categorieId: CategorieId, instances: readonly ConnecteurInstance[], catalogue: readonly Categorie[] = CATALOGUE): Pastille {
  const services = instances.filter((i) => i.categorie === categorieId && modeEffectif(i, catalogue) === 'externe');
  if (services.some(estPayant)) return 'payant';
  if (services.length) return 'externe-gratuit';
  const cat = catalogue.find((c) => c.id === categorieId);
  if (cat && cat.local.disponibilite !== 'a-construire') return 'local';
  return briqueChezNousBranchee(categorieId, instances, catalogue) ? 'local' : 'a-brancher';
}
