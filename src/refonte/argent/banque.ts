import { ajouterJours, ecartJours, jourDe, type Jour } from './commun';
import { totauxDocument, type FactureLue } from './facturation';

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

/** Écart de dates toléré pour proposer un rapprochement : 5 jours (valeur de départ, §1.29 n° 3). */
export const FENETRE_RAPPROCHEMENT_JOURS = 5;

/**
 * Les rapprochements à PROPOSER (jamais faits seuls) : un encaissement « à vérifier »
 * et une facture payée du même montant TTC, à 5 jours près.
 */
export function suggestionsDeRapprochement(
  mouvements: readonly { id: string; montantCents: number; date: Jour; rapprochement: string }[],
  factures: readonly FactureLue[],
): { mouvementId: string; factureId: string }[] {
  const sortie: { mouvementId: string; factureId: string }[] = [];
  const prises = new Set<string>();
  for (const m of mouvements) {
    if (m.rapprochement !== 'à vérifier' || m.montantCents <= 0) continue;
    const f = factures.find(
      (x) => !prises.has(x.id) && x.status === 'paid' && x.paidAt && totauxDocument(x.lines).ttcCents === m.montantCents && Math.abs(ecartJours(jourDe(x.paidAt), m.date)) <= FENETRE_RAPPROCHEMENT_JOURS,
    );
    if (f) {
      prises.add(f.id);
      sortie.push({ mouvementId: m.id, factureId: f.id });
    }
  }
  return sortie;
}

/** Le jour où un ordre préparé devrait être exécuté pour arriver à temps : 2 jours avant l'échéance (valeur de départ, §1.29 n° 3). */
export const dateLimiteDeLOrdre = (echeance: Jour): Jour => ajouterJours(echeance, -2);
