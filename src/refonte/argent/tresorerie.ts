import { ajouterJours, arrondi, arrondirCentaine, lundiDe, type Jour } from './commun';
import { prelevementsAVenir, type AbonnementLu } from './abonnements';
import { resteDu, type ContexteFacture, type FactureLue } from './facturation';

/**
 * TRÉSORERIE (MA07) ET PRÉVISIONS (H09) — fiches v4, rubrique 6.
 *
 * Écran informatif : aucun conseil financier ; impôts et TVA à valider par un comptable.
 *
 *   · solde de départ = comptes courants (`banque.soldeDeDepart`, STATUT §1.29 n° 7) ;
 *   · prévision = solde du jour + mouvements prévus connus (factures à leur date
 *     attendue, abonnements, salaires, loyer, impôts, commandes), jour par jour ; un flux
 *     daté d'aujourd'hui ou avant est déjà dans le solde ;
 *   · horizon : 90 jours par défaut (segmenté 30 j, 90 j, 12 mois) ;
 *   · SCÉNARIOS (H09) : central = la prévision ; prudent et ambitieux = central + les
 *     HYPOTHÈSES déplacées (retards, volumes, achats…), chacune avec sa valeur par
 *     scénario, appliquées aux mouvements datés (l'effet se répartit dans le temps) ;
 *   · « Ce qui pèse le plus » = l'écart de solde à l'horizon quand on passe UNE
 *     hypothèse au prudent (ou à l'ambitieux), les autres au central ;
 *   · seuil de confort = seuil d'alerte de MA07 (réglage).
 *
 * Valeurs de départ (STATUT §1.29 n° 3, modifiables) : facture échue attendue 14 jours
 * après aujourd'hui (« incertain ») ; bande d'incertitude ± 170 € × √jours (proposition
 * de MA07, à calibrer). Les attendus de SIM pour H09 ne sont pas encore livrés.
 */

export type Certitude = 'attendu' | 'incertain';
export type Scenario = 'central' | 'prudent' | 'ambitieux';
export const SCENARIOS: readonly Scenario[] = ['central', 'prudent', 'ambitieux'];

export interface Flux {
  date: Jour;
  /** Signé : positif = entrée, négatif = sortie. */
  montantCents: number;
  libelle: string;
  certitude: Certitude;
  /** Un mouvement qui revient (loyer, salaires, abonnements). */
  recurrent?: boolean;
  /** Impôts, TVA, cotisations. */
  fiscal?: boolean;
}

export interface Hypothese {
  id: string;
  libelle: string;
  valeurs: Record<Scenario, number>;
  /** Applique la valeur de l'hypothèse aux mouvements (sans les modifier : renvoie une nouvelle liste). */
  appliquer: (flux: readonly Flux[], valeur: number) => Flux[];
}

/** Hypothèse « retard des encaissements » : décale de N jours chaque entrée (filtrée par libellé, sinon toutes). */
export function retardDesEncaissements(id: string, libelle: string, valeurs: Record<Scenario, number>, filtre: (f: Flux) => boolean = () => true): Hypothese {
  return { id, libelle, valeurs, appliquer: (flux, jours) => flux.map((f) => (f.montantCents > 0 && filtre(f) ? { ...f, date: ajouterJours(f.date, jours) } : f)) };
}

/** Hypothèse « volume des ventes » : change chaque entrée de N % (arrondi au centime). */
export function variationDesEncaissements(id: string, libelle: string, valeurs: Record<Scenario, number>, filtre: (f: Flux) => boolean = () => true): Hypothese {
  return { id, libelle, valeurs, appliquer: (flux, pct) => flux.map((f) => (f.montantCents > 0 && filtre(f) ? { ...f, montantCents: arrondi((f.montantCents * (100 + pct)) / 100) } : f)) };
}

/** Les mouvements d'un scénario : les hypothèses, chacune à sa valeur pour ce scénario. */
export const fluxDuScenario = (flux: readonly Flux[], hypotheses: readonly Hypothese[], scenario: Scenario): Flux[] =>
  hypotheses.reduce<Flux[]>((f, h) => h.appliquer(f, h.valeurs[scenario]), [...flux]);

export const HORIZON_JOURS_PAR_DEFAUT = 90;
export const DECALAGE_RETARD_JOURS = 14;
/** Bande d'incertitude de MA07 : ± 170 € par racine du nombre de jours (proposition, à calibrer). */
export const BANDE_PAR_RACINE_JOUR_CENTS = 17_000;

export interface JourProjete {
  date: Jour;
  entreesCents: number;
  sortiesCents: number;
  soldeCents: number;
}

export interface Projection {
  jours: JourProjete[];
  pointBas: { date: Jour; soldeCents: number };
  /** Le premier jour sous zéro, ou `null`. */
  sousZeroLe: Jour | null;
  /** Ce qu'il manquerait au point bas pour rester à zéro. */
  besoinCents: number;
  soldeFinCents: number;
}

export function projeter(e: { soldeDepartCents: number; aujourdhui: Jour; flux: readonly Flux[]; horizonJours?: number }): Projection {
  const n = e.horizonJours ?? HORIZON_JOURS_PAR_DEFAUT;
  const parJour = new Map<Jour, { e: number; s: number }>();
  for (const f of e.flux) {
    if (f.date <= e.aujourdhui) continue;
    const j = parJour.get(f.date) ?? { e: 0, s: 0 };
    if (f.montantCents >= 0) j.e += f.montantCents;
    else j.s += f.montantCents;
    parJour.set(f.date, j);
  }
  const jours: JourProjete[] = [];
  let solde = e.soldeDepartCents;
  let pointBas = { date: e.aujourdhui, soldeCents: solde };
  let sousZeroLe: Jour | null = null;
  for (let k = 1; k <= n; k += 1) {
    const date = ajouterJours(e.aujourdhui, k);
    const j = parJour.get(date) ?? { e: 0, s: 0 };
    solde += j.e + j.s;
    jours.push({ date, entreesCents: j.e, sortiesCents: j.s, soldeCents: solde });
    if (solde < pointBas.soldeCents) pointBas = { date, soldeCents: solde };
    if (solde < 0 && sousZeroLe === null) sousZeroLe = date;
  }
  return { jours, pointBas, sousZeroLe, besoinCents: Math.max(0, -pointBas.soldeCents), soldeFinCents: solde };
}

/**
 * Les mouvements encore à venir. Les hypothèses ne s'appliquent qu'à eux : un mouvement
 * d'aujourd'hui ou passé est déjà dans le solde, un retard ne doit pas le faire revenir.
 */
const fluxAVenir = (flux: readonly Flux[], aujourdhui: Jour): Flux[] => flux.filter((f) => f.date > aujourdhui);

/** Les trois scénarios de H09 sur les mêmes mouvements. */
export function projeterScenarios(e: { soldeDepartCents: number; aujourdhui: Jour; flux: readonly Flux[]; hypotheses: readonly Hypothese[]; horizonJours?: number }): Record<Scenario, Projection> {
  const futurs = fluxAVenir(e.flux, e.aujourdhui);
  const p = (s: Scenario) => projeter({ ...e, flux: fluxDuScenario(futurs, e.hypotheses, s) });
  return { central: p('central'), prudent: p('prudent'), ambitieux: p('ambitieux') };
}

/**
 * « Ce qui pèse le plus » (H09) : pour chaque hypothèse, l'écart de solde à l'horizon
 * quand elle seule passe au prudent (`versPrudent`) puis à l'ambitieux (`versAmbitieux`),
 * les autres restant au central. Trié par écart absolu maximal.
 */
export function ceQuiPeseLePlus(e: { soldeDepartCents: number; aujourdhui: Jour; flux: readonly Flux[]; hypotheses: readonly Hypothese[]; horizonJours?: number }): { id: string; libelle: string; versPrudentCents: number; versAmbitieuxCents: number }[] {
  const fin = (valeurDe: (h: Hypothese) => number) =>
    projeter({ ...e, flux: e.hypotheses.reduce<Flux[]>((f, h) => h.appliquer(f, valeurDe(h)), fluxAVenir(e.flux, e.aujourdhui)) }).soldeFinCents;
  const central = fin((h) => h.valeurs.central);
  return e.hypotheses
    .map((cible) => ({
      id: cible.id,
      libelle: cible.libelle,
      versPrudentCents: fin((h) => (h === cible ? h.valeurs.prudent : h.valeurs.central)) - central,
      versAmbitieuxCents: fin((h) => (h === cible ? h.valeurs.ambitieux : h.valeurs.central)) - central,
    }))
    .sort((a, b) => Math.max(Math.abs(b.versPrudentCents), Math.abs(b.versAmbitieuxCents)) - Math.max(Math.abs(a.versPrudentCents), Math.abs(a.versAmbitieuxCents)));
}

/**
 * Le sous-titre de H09 pour un scénario et un seuil :
 *   · `creux-court` — il passe sous le seuil puis termine au-dessus : début et nombre de jours sous le seuil ;
 *   · `reste-sous` — il termine sous le seuil : depuis quand (orange, sans alarme) ;
 *   · `au-dessus` — il ne passe jamais dessous.
 */
export function passageSousLeSeuil(p: Projection, seuilCents: number): { type: 'au-dessus' } | { type: 'creux-court'; debut: Jour; jours: number } | { type: 'reste-sous'; depuis: Jour } {
  const sous = p.jours.filter((j) => j.soldeCents < seuilCents);
  if (sous.length === 0) return { type: 'au-dessus' };
  if (p.soldeFinCents >= seuilCents) return { type: 'creux-court', debut: sous[0].date, jours: sous.length };
  let depuis = p.jours[p.jours.length - 1].date;
  for (let k = p.jours.length - 1; k >= 0 && p.jours[k].soldeCents < seuilCents; k -= 1) depuis = p.jours[k].date;
  return { type: 'reste-sous', depuis };
}

/** « Dans 30 jours » (MA07) : la prévision à J+30, arrondie à la centaine. */
export function dans30Jours(p: Projection): number | null {
  const j = p.jours[29];
  return j ? arrondirCentaine(j.soldeCents) : null;
}

/** La bande d'incertitude autour de la prévision, à J+n : ± 170 € × √n. */
export const bandeIncertitude = (jours: number): number => arrondi(BANDE_PAR_RACINE_JOUR_CENTS * Math.sqrt(Math.max(0, jours)));

/** La couleur du point bas (MA07) : rouge sous le seuil d'alerte, orange sous le solde actuel, sinon aucune. */
export function couleurPointBas(pointBasCents: number, soldeActuelCents: number, seuilCents: number | null): 'rouge' | 'orange' | null {
  if (seuilCents !== null && pointBasCents < seuilCents) return 'rouge';
  return pointBasCents < soldeActuelCents ? 'orange' : null;
}

/** « +1 280 € cette semaine » : solde actuel − solde du lundi 00:00. */
export const variationDeLaSemaine = (soldeActuelCents: number, soldeLundiCents: number): number => soldeActuelCents - soldeLundiCents;

/**
 * Autonomie (MA07) = solde ÷ charges mensuelles moyennes des 3 derniers mois, en mois à
 * une décimale ; « confortable » si ≥ 3. Santé = min(100, arrondi(autonomie ÷ 6 × 100)) :
 * bonne (≥ 70), correcte (45 à 69), fragile (< 45). Réserve de 3 mois = solde ÷
 * (3 × charges), plafonnée à 100 %.
 */
export function autonomie(soldeCents: number, chargesMensuellesCents: readonly number[]): { mois: number; confortable: boolean; sante: number; libelle: 'bonne' | 'correcte' | 'fragile'; reserve: number; reserveAtteinte: boolean } | null {
  const l = chargesMensuellesCents.slice(-3);
  if (l.length === 0) return null;
  const moyenne = l.reduce((s, c) => s + c, 0) / l.length;
  if (moyenne <= 0) return null;
  const mois = Math.round((soldeCents / moyenne) * 10) / 10;
  const sante = Math.min(100, arrondi((mois / 6) * 100));
  const reserve = Math.min(100, arrondi((soldeCents / (3 * moyenne)) * 100));
  return { mois, confortable: mois >= 3, sante, libelle: sante >= 70 ? 'bonne' : sante >= 45 ? 'correcte' : 'fragile', reserve, reserveAtteinte: reserve >= 100 };
}

/** « Achat décalable » (MA07) : la plus grosse sortie non récurrente et non fiscale jusqu'au point bas. */
export function achatDecalable(flux: readonly Flux[], aujourdhui: Jour, pointBas: Jour): Flux | null {
  return [...flux].filter((f) => f.montantCents < 0 && !f.recurrent && !f.fiscal && f.date > aujourdhui && f.date <= pointBas).sort((a, b) => a.montantCents - b.montantCents)[0] ?? null;
}

/** Les semaines (du lundi au dimanche) de la projection : solde de clôture, entrées, sorties. */
export function parSemaine(p: Projection): { lundi: Jour; soldeFinCents: number; entreesCents: number; sortiesCents: number }[] {
  const semaines = new Map<Jour, { soldeFinCents: number; entreesCents: number; sortiesCents: number }>();
  for (const j of p.jours) {
    const l = lundiDe(j.date);
    const s = semaines.get(l) ?? { soldeFinCents: 0, entreesCents: 0, sortiesCents: 0 };
    s.soldeFinCents = j.soldeCents;
    s.entreesCents += j.entreesCents;
    s.sortiesCents += j.sortiesCents;
    semaines.set(l, s);
  }
  return [...semaines.entries()].map(([lundi, s]) => ({ lundi, ...s }));
}

/* ── Les mouvements prévus, depuis les autres modules ───────────────────── */

/** Les encaissements attendus des factures émises et pas soldées (échue : à J+14, incertaine). */
export function fluxDesFactures(factures: readonly FactureLue[], aujourdhui: Jour, ctx: Pick<ContexteFacture, 'paiements'>): Flux[] {
  const c: ContexteFacture = { factures, paiements: ctx.paiements };
  return factures
    .filter((f) => f.status === 'issued' && f.kind !== 'creditNote' && f.dueAt)
    .map((f) => ({ f, reste: resteDu(f, c) }))
    .filter(({ reste }) => reste > 0)
    .map(({ f, reste }): Flux => {
      const enRetard = f.dueAt <= aujourdhui;
      return { date: enRetard ? ajouterJours(aujourdhui, DECALAGE_RETARD_JOURS) : f.dueAt, montantCents: reste, libelle: f.number, certitude: enRetard ? 'incertain' : 'attendu' };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function fluxDesAbonnements(abonnements: readonly AbonnementLu[], aujourdhui: Jour, jusquau: Jour): Flux[] {
  return prelevementsAVenir(abonnements, aujourdhui, jusquau).map((p) => ({ date: p.date, montantCents: p.montantCents, libelle: p.abonnement.clientNom, certitude: 'attendu', recurrent: true }));
}

/** Les échéances fiscales à payer, en sorties (montant connu seulement). */
export function fluxFiscaux(echeances: readonly { intitule: string; echeanceLe: Jour; montantCents: number | null; paiement: string }[]): Flux[] {
  return echeances
    .filter((e) => e.paiement === 'À payer' && e.montantCents !== null && e.montantCents > 0)
    .map((e) => ({ date: e.echeanceLe, montantCents: -(e.montantCents as number), libelle: e.intitule, certitude: 'attendu', fiscal: true }));
}

/** Les mouvements PRÉVUS du jeu `mouvements` (MA07), tels quels. */
export function fluxDesMouvementsPrevus(mouvements: readonly { date: Jour; montantCents: number; libelle: string; reel: boolean; recurrent?: boolean }[]): Flux[] {
  return mouvements.filter((m) => !m.reel).map((m): Flux => ({ date: m.date, montantCents: m.montantCents, libelle: m.libelle, certitude: 'attendu', recurrent: m.recurrent }));
}
