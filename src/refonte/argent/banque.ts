import { ecartJours, joursOuvresAvant, type Jour } from './commun';

/**
 * BANQUE (MA10), en LECTURE SEULE — décision confirmée par Harun (STATUT §1.5 n° 1).
 *
 * L'application ne fait JAMAIS de virement. Pour payer un fournisseur, rembourser
 * une note de frais, régler la TVA ou les salaires (MA05, MA08, MA10, MA11), elle
 * PRÉPARE un ordre — bénéficiaire, montant, référence, date — que la personne
 * exécute elle-même dans sa banque. Aucun IBAN complet ne circule ici : seulement
 * ses 4 derniers caractères, pour reconnaître le compte.
 */

export const soldeTotal = (comptes: readonly { soldeCents: number }[]): number => comptes.reduce((s, c) => s + c.soldeCents, 0);

/**
 * La nature d'un compte, lue dans son nom tant que les jeux n'ont pas de champ dédié
 * (demandé à SIM) : épargne (« épargne », « livret ») ou courant (le reste, carte comprise).
 */
export const natureDuCompte = (nom: string): 'courant' | 'epargne' => (/[ée]pargne|livret/i.test(nom) ? 'epargne' : 'courant');

/**
 * LE SOLDE DE DÉPART DE LA TRÉSORERIE (STATUT §1.29 n° 7) : les comptes courants par
 * défaut. L'épargne s'ajoute par un interrupteur, et reste toujours montrée à part.
 */
export function soldeDeDepart(comptes: readonly { nom: string; soldeCents: number }[], options: { avecEpargne?: boolean } = {}): { courantCents: number; epargneCents: number; totalCents: number } {
  const courant = soldeTotal(comptes.filter((c) => natureDuCompte(c.nom) === 'courant'));
  const epargne = soldeTotal(comptes.filter((c) => natureDuCompte(c.nom) === 'epargne'));
  return { courantCents: courant, epargneCents: epargne, totalCents: courant + (options.avecEpargne ? epargne : 0) };
}

export interface OrdreAExecuter {
  beneficiaire: string;
  ibanFin: string;
  montantCents: number;
  reference: string;
  echeance: Jour;
  /** Toujours faux : rien ne part d'ici. */
  emis: false;
  aExecuterDansTaBanque: true;
}

export type RefusOrdre = 'beneficiaire' | 'iban' | 'montant' | 'reference';

export function preparerOrdre(e: { beneficiaire: string; ibanFin: string; montantCents: number; reference: string; echeance: Jour }): { ok: true; ordre: OrdreAExecuter } | { ok: false; raison: RefusOrdre } {
  if (!e.beneficiaire.trim()) return { ok: false, raison: 'beneficiaire' };
  if (!/^[0-9A-Z]{4}$/i.test(e.ibanFin)) return { ok: false, raison: 'iban' };
  if (!Number.isInteger(e.montantCents) || e.montantCents <= 0) return { ok: false, raison: 'montant' };
  if (!e.reference.trim()) return { ok: false, raison: 'reference' };
  return { ok: true, ordre: { beneficiaire: e.beneficiaire.trim(), ibanFin: e.ibanFin, montantCents: e.montantCents, reference: e.reference.trim(), echeance: e.echeance, emis: false, aExecuterDansTaBanque: true } };
}

/** MA10 : « Rapprochés » = mouvements rapprochés ÷ mouvements du mois, arrondi à l'entier INFÉRIEUR (92 ÷ 96 → 95 %). */
export function partRapprochee(mouvements: readonly { rapprochement: string }[]): { rapproches: number; total: number; aVerifier: number; pourcentage: number } {
  const total = mouvements.length;
  const r = mouvements.filter((m) => m.rapprochement === 'rapproché').length;
  return { rapproches: r, total, aVerifier: total - r, pourcentage: total === 0 ? 100 : Math.floor((r / total) * 100) };
}

export type Confiance = 'exact' | 'probable' | 'a-verifier';

/**
 * MA10 : la pièce PROPOSÉE pour un mouvement d'entrée « à vérifier » — jamais appliquée
 * seule. Une facture ouverte dont le solde dû égale le montant AU CENTIME, émise avant
 * le mouvement, et :
 *   · la référence (numéro) dans le libellé → « exact » ;
 *   · sinon le nom du client dans le libellé → « probable » ;
 *   · sinon une relance récente de ce client → « à vérifier » ;
 *   · sinon rien.
 */
export function proposerAssociation(
  m: { montantCents: number; date: Jour; libelle: string },
  facturesOuvertes: readonly { id: string; number: string; issuedAt: string; resteCents: number; clientNom: string }[],
  clientsRelancesRecemment: ReadonlySet<string> = new Set(),
): { factureId: string; confiance: Confiance } | null {
  if (m.montantCents <= 0) return null;
  const lib = m.libelle.toLowerCase();
  const candidates = facturesOuvertes.filter((f) => f.resteCents === m.montantCents && f.issuedAt && f.issuedAt <= m.date);
  const niveau = (f: (typeof candidates)[number]): Confiance | null =>
    f.number && lib.includes(f.number.toLowerCase()) ? 'exact' : f.clientNom && lib.includes(f.clientNom.toLowerCase()) ? 'probable' : clientsRelancesRecemment.has(f.clientNom) ? 'a-verifier' : null;
  const ordre: Confiance[] = ['exact', 'probable', 'a-verifier'];
  const notees = candidates.map((f) => ({ f, c: niveau(f) })).filter((x): x is { f: (typeof candidates)[number]; c: Confiance } => x.c !== null);
  notees.sort((a, b) => ordre.indexOf(a.c) - ordre.indexOf(b.c));
  return notees[0] ? { factureId: notees[0].f.id, confiance: notees[0].c } : null;
}

/** G03 « Avant de relancer » : tolérances du mouvement non rapproché qui ressemble au paiement d'une facture. */
export const TOLERANCE_PAIEMENT_CENTS = 50;
export const FENETRE_PAIEMENT_JOURS = 30;

/**
 * G03 : un mouvement d'entrée non rapproché du montant de la facture à ± 0,50 €, dans
 * les 30 derniers jours. S'il existe, aucune relance ne part tant que ce n'est pas vérifié.
 */
export function mouvementQuiRessemble<M extends { montantCents: number; date: Jour; rapprochement: string }>(resteCents: number, mouvements: readonly M[], aujourdhui: Jour): M | null {
  return (
    mouvements.find(
      (m) => m.rapprochement !== 'rapproché' && m.montantCents > 0 && Math.abs(m.montantCents - resteCents) <= TOLERANCE_PAIEMENT_CENTS && ecartJours(m.date, aujourdhui) >= 0 && ecartJours(m.date, aujourdhui) <= FENETRE_PAIEMENT_JOURS,
    ) ?? null
  );
}

/** Le jour où passer un ordre préparé pour qu'il arrive à temps : 2 jours OUVRÉS avant l'échéance (MA08). */
export const dateLimiteDeLOrdre = (echeance: Jour): Jour => joursOuvresAvant(echeance, 2);
