import { totauxDeFacture, totauxDeLignes } from '../donnees/argent';
import type { CompteFidelite, Devis, Evenement, Facture, FicheClient, Prospect, Relance } from '../donnees/types';
import { ajouterJours, ecartJours, jourDeInstant, type Jour } from './commun';
import { pointsProgramme, niveauPour, PALIERS, type Palier } from './fidelite';

/**
 * LOT-02 · CE QUI SE DÉDUIT DES SOURCES — relances à faire, comptes de fidélité (logique pure).
 *
 * L'application ne garde ni « les relances à faire » ni « les comptes de fidélité » : ce sont des CONSÉQUENCES de ce
 * qu'elle garde (factures échues, devis sans réponse, rendez-vous manqués, prospects en attente, factures payées, avis).
 * Une relance existe PARCE QU'une facture est échue ; un client est « Or » PARCE QUE ses points passent 1 800. Ces
 * fonctions les calculent ; `check:contacts` les compare aux jeux de SIM (qui suivent les mêmes règles, `derives.ts`).
 */

export interface DelaisRelance {
  devisJours: number;
  factureJours: number;
  rendezVousJours: number;
  prospectJours: number;
  /** Un client sans aucune activité depuis ce nombre de jours (MC07 : un mois). */
  inactifJours: number;
}

export const DELAIS_PAR_DEFAUT: DelaisRelance = { devisJours: 5, factureJours: 3, rendezVousJours: 1, prospectJours: 7, inactifJours: 30 };

export interface SourcesRelances {
  aujourdhui: Jour;
  clients: readonly FicheClient[];
  factures: readonly Facture[];
  devis: readonly Devis[];
  evenements: readonly Evenement[];
  prospects: readonly Prospect[];
}

const nomDe = (c: Pick<FicheClient, 'company' | 'name'>): string => c.company || c.name;

/**
 * Les relances à préparer : cinq motifs, triées comme MC07 (montant décroissant, puis départ le plus récent d'abord).
 * Le texte du message est rédigé plus tard (Ajmani, `messageClient`) : ici, `message` reste vide. L'état et le nombre
 * d'envois viennent de ce que l'application a déjà noté (`dejaEnvoyees`, par objet).
 */
export function relancesDepuis(
  src: SourcesRelances,
  delais: DelaisRelance = DELAIS_PAR_DEFAUT,
  dejaEnvoyees: ReadonlyMap<string, { nb: number; le: Jour }> = new Map(),
): Relance[] {
  const parClient = new Map(src.clients.map((c) => [c.id, c]));
  const liste: Omit<Relance, 'id'>[] = [];
  const base = (r: Omit<Relance, 'id' | 'etat' | 'nbEnvoyees' | 'derniereEnvoiLe' | 'message'>): Omit<Relance, 'id'> => {
    const vu = dejaEnvoyees.get(`${r.motif}:${r.objetId}`);
    return { ...r, message: '', etat: vu ? 'envoyée' : 'prête', nbEnvoyees: vu?.nb ?? 0, derniereEnvoiLe: vu?.le ?? null };
  };

  for (const f of src.factures) {
    if (f.status !== 'issued' || f.dueAt >= src.aujourdhui || ecartJours(f.dueAt, src.aujourdhui) < delais.factureJours) continue;
    const c = parClient.get(f.clientId);
    liste.push(base({ clientId: f.clientId, clientNom: c ? nomDe(c) : f.clientNom, motif: 'facture', objetId: f.id, objetLibelle: `Facture ${f.number}`, montantCents: totauxDeFacture(f).ttcCents, departLe: f.dueAt }));
  }
  for (const d of src.devis) {
    if (d.status !== 'sent' || !d.sentAt) continue;
    const envoye = d.sentAt.slice(0, 10);
    if (ecartJours(envoye, src.aujourdhui) < delais.devisJours) continue;
    const c = parClient.get(d.clientId);
    liste.push(base({ clientId: d.clientId, clientNom: c ? nomDe(c) : d.clientNom, motif: 'devis', objetId: String(d.id), objetLibelle: `Devis ${d.numero}`, montantCents: totauxDeLignes(d.lignes).ttcCents, departLe: envoye }));
  }
  for (const ev of src.evenements) {
    if (ev.confirmation !== 'manqué' || ev.systeme) continue;
    const jour = jourDeInstant(ev.startAt);
    if (ecartJours(jour, src.aujourdhui) < delais.rendezVousJours) continue;
    const c = ev.clientId ? parClient.get(ev.clientId) : undefined;
    liste.push(base({ clientId: ev.clientId, clientNom: c ? nomDe(c) : ev.clientName || '', motif: 'rendez-vous', objetId: ev.id, objetLibelle: ev.title, montantCents: null, departLe: jour }));
  }
  for (const p of src.prospects) {
    if ((p.etape !== 'nouveau' && p.etape !== 'contacté') || p.creeLe > src.aujourdhui || ecartJours(p.creeLe, src.aujourdhui) < delais.prospectJours) continue;
    liste.push(base({ clientId: null, clientNom: p.nom, motif: 'prospect', objetId: p.id, objetLibelle: p.offre, montantCents: p.montantCents, departLe: p.creeLe }));
  }
  for (const c of src.clients) {
    const dernier = jourDeInstant(c.dernierEchangeAt);
    if (ecartJours(dernier, src.aujourdhui) < delais.inactifJours || c.status === 'paused') continue;
    if (src.factures.some((f) => f.clientId === c.id && f.issuedAt >= dernier)) continue;
    liste.push(base({ clientId: c.id, clientNom: nomDe(c), motif: 'inactif', objetId: String(c.id), objetLibelle: 'Client inactif', montantCents: null, departLe: dernier }));
  }
  // L'ordre de MC07 (montant décroissant, puis départ le plus récent d'abord), puis les identifiants dans cet ordre.
  return liste
    .sort((a, b) => (b.montantCents ?? -1) - (a.montantCents ?? -1) || b.departLe.localeCompare(a.departLe))
    .map((r, i) => ({ ...r, id: `rl-${String(i + 1).padStart(4, '0')}` }));
}

export interface SourcesFidelite {
  aujourdhui: Jour;
  clients: readonly FicheClient[];
  factures: readonly Facture[];
  avis: readonly { clientId: number; date: Jour }[];
  /** Les jours où un client en a recommandé un autre, par client ; absent de l'application aujourd'hui. */
  recommandations?: ReadonlyMap<number, readonly Jour[]>;
}

/** Les comptes du programme : un par client qui a au moins un point sur 12 mois, classés par points. */
export function fideliteDepuis(src: SourcesFidelite, paliers: readonly Palier[] = PALIERS): CompteFidelite[] {
  const an = `${Number(src.aujourdhui.slice(0, 4)) - 1}${src.aujourdhui.slice(4)}`;
  const comptes: CompteFidelite[] = [];
  for (const c of src.clients) {
    const avis = src.avis.filter((a) => a.clientId === c.id).map((a) => a.date);
    const recommandations = [...(src.recommandations?.get(c.id) ?? [])];
    const payees = src.factures.filter((f) => f.clientId === c.id && f.status === 'paid' && f.paidAt >= an && f.paidAt <= src.aujourdhui);
    const points = pointsProgramme({ clientId: c.id, factures: src.factures, avis, recommandations }, src.aujourdhui);
    const jours = [...payees.map((f) => f.paidAt), ...avis.filter((j) => j >= an && j <= src.aujourdhui), ...recommandations.filter((j) => j >= an && j <= src.aujourdhui)].sort();
    if (jours.length === 0) continue;
    comptes.push({ clientId: c.id, clientNom: nomDe(c), points, niveau: niveauPour(points, paliers), derniereActiviteLe: jours[jours.length - 1], recommandations, avantages: [] });
  }
  return comptes.sort((a, b) => b.points - a.points);
}

/** Un jour de repli : aujourd'hui moins `n`. Utile aux écrans qui datent un dernier échange manquant. */
export const ilYa = (aujourdhui: Jour, n: number): Jour => ajouterJours(aujourdhui, -n);
