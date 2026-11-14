import type { InvoiceLine } from '../../shared/api';
import { ajouterJours, arrondi, pourcentage, type Jour } from './commun';
import { prochainNumero, totauxDocument, type TotauxDocument } from './facturation';

/**
 * DEVIS (H07) — état, taux de transformation, devis prérempli, passage en facture, acompte.
 *
 * LE DEVIS PRÉREMPLI est la source que H41 (recherche ⌘K : « devis maintenance pour
 * Atelier X ») et H42 (démarrage : « ton premier devis ») attendent de ce lot : à
 * partir d'une prestation du catalogue (MA12), d'un client et d'une quantité, un
 * brouillon complet, numéroté, valable 30 jours. Il n'est jamais envoyé seul.
 */

export type EtatDevis = 'brouillon' | 'envoye' | 'vu' | 'accepte' | 'refuse' | 'expire';

export interface DevisLu {
  status: 'draft' | 'sent' | 'accepted' | 'refused' | string;
  validiteJusquau: Jour;
  vuAt: string | null;
}

/** Un devis envoyé expire le lendemain de sa date de validité. */
export function etatDevis(d: DevisLu, aujourdhui: Jour): EtatDevis {
  if (d.status === 'draft') return 'brouillon';
  if (d.status === 'accepted') return 'accepte';
  if (d.status === 'refused') return 'refuse';
  if (d.validiteJusquau && d.validiteJusquau < aujourdhui) return 'expire';
  return d.vuAt ? 'vu' : 'envoye';
}

/** Acceptés ÷ (acceptés + refusés + expirés), en % entier ; `null` tant qu'aucun devis n'est tranché. */
export function tauxDeTransformation(devis: readonly DevisLu[], aujourdhui: Jour): number | null {
  const etats = devis.map((d) => etatDevis(d, aujourdhui));
  const acceptes = etats.filter((e) => e === 'accepte').length;
  const tranches = etats.filter((e) => e === 'accepte' || e === 'refuse' || e === 'expire').length;
  const p = pourcentage(acceptes, tranches, 0);
  return p;
}

/** Durée de validité d'un devis prérempli : 30 jours (valeur de départ, §1.29 n° 3). */
export const VALIDITE_JOURS = 30;
/** Taux de TVA d'une ligne préremplie quand la prestation n'en dit rien. */
export const TAUX_TVA_PAR_DEFAUT = 20;

export interface PrestationLue {
  id: string;
  nom: string;
  prixCents: number;
  etat: 'active' | 'archivée' | string;
  unite?: string;
  tauxTva?: number;
}

const aplatir = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'\-–,.:;()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** La prestation ACTIVE dont le nom contient chaque mot tapé (sans accent ni casse), la plus courte d'abord. */
export function chercherPrestation<P extends PrestationLue>(requete: string, prestations: readonly P[]): P | null {
  const mots = aplatir(requete).split(' ').filter((m) => m.length > 1);
  if (mots.length === 0) return null;
  const trouvees = prestations.filter((p) => p.etat === 'active' && mots.every((m) => aplatir(p.nom).includes(m)));
  return trouvees.sort((a, b) => a.nom.length - b.nom.length)[0] ?? null;
}

export interface DevisPrerempli {
  numero: string;
  status: 'draft';
  clientId: number;
  clientNom: string;
  title: string;
  prestation: string;
  lignes: InvoiceLine[];
  validiteJusquau: Jour;
  creeLe: Jour;
  totaux: TotauxDocument;
  /** Total HT en euros, comme `Quote.priceEuro`. */
  priceEuro: number;
}

export function devisPrerempli(e: {
  prestation: PrestationLue;
  client: { id: number; nom: string };
  quantite?: number;
  aujourdhui: Jour;
  /** Les numéros de devis déjà pris (`D-AAAA-NNNN`). */
  numeros: readonly string[];
}): DevisPrerempli {
  const quantite = e.quantite && e.quantite > 0 ? e.quantite : 1;
  const lignes: InvoiceLine[] = [{ id: 'l-1', label: e.prestation.nom, quantity: quantite, unitPriceCents: e.prestation.prixCents, vatRate: e.prestation.tauxTva ?? TAUX_TVA_PAR_DEFAUT }];
  const totaux = totauxDocument(lignes);
  return {
    numero: prochainNumero(e.numeros, Number(e.aujourdhui.slice(0, 4)), 'D'),
    status: 'draft',
    clientId: e.client.id,
    clientNom: e.client.nom,
    title: e.prestation.nom,
    prestation: e.prestation.nom,
    lignes,
    validiteJusquau: ajouterJours(e.aujourdhui, VALIDITE_JOURS),
    creeLe: e.aujourdhui,
    totaux,
    priceEuro: totaux.htCents / 100,
  };
}

/**
 * Un devis accepté devient une facture BROUILLON : mêmes lignes (copiées), lien au
 * devis, sans numéro (le numéro se donne à l'émission). Refusé ou brouillon : refusé.
 */
export function devisVersFacture(d: { id: number; clientId: number; clientNom: string; lignes: readonly InvoiceLine[]; status: string }) {
  if (d.status !== 'accepted') throw new Error('Seul un devis accepté devient une facture.');
  return {
    number: '',
    status: 'draft' as const,
    clientId: d.clientId,
    clientNom: d.clientNom,
    quoteId: d.id,
    issuedAt: '',
    dueAt: '',
    lines: d.lignes.map((l) => ({ ...l })),
    kind: 'invoice' as const,
  };
}

/** L'acompte demandé à la signature : TTC × pourcentage, arrondi au centime. */
export const acompte = (ttcCents: number, pct: number): number => arrondi((ttcCents * Math.min(100, Math.max(0, pct))) / 100);
