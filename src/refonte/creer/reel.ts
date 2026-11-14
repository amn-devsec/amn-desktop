/**
 * LOT-06 — ADAPTATEURS DES DONNÉES RÉELLES vers les entrées de la logique (`src/refonte/creer/*.ts`).
 *
 * Fonctions pures, sans React. Les formes d'entrée sont celles que le dépôt stocke aujourd'hui (collections
 * `assemblies`, `orders`, `videoProductions`, `stockItems`…) ; ce que ces modules ne portent pas (budget, poids d'étape,
 * emplacements, mouvements…) reste absent : l'écran le dit « non disponible » (STATUT §1.27 n° 2 et 4).
 */

import { jourParis, semaineIso, type Jour } from './commun';
import type { ChantierEntree } from './chantiers';
import type { CommandeEntree } from './commandes';
import type { VideoEntree } from './video';
import type { ArticleEntree } from './stock';

export interface MontageReel {
  id: string;
  title: string;
  client: string;
  steps: { id: string; label: string; doneAt: string | null }[];
  createdAt: string;
}

/** Un « montage » du dépôt devient un chantier : étapes sans poids, sans budget, sans date de fin (aucune étape n'est « en retard »). */
export function chantierDepuisMontage(m: MontageReel, aujourdhui: Jour): ChantierEntree & { client: string } {
  const semaine = semaineIso(aujourdhui).semaine;
  return {
    id: m.id,
    nom: m.client ? `${m.client} · ${m.title}` : m.title,
    client: m.client,
    debutLe: jourParis(m.createdAt),
    finPrevueLe: '9999-12-31',
    etapes: m.steps.map((s) => ({ nom: s.label, semaine, faite: s.doneAt !== null })),
    budgetCents: 0,
    depenseCents: 0,
  };
}

export interface CommandeReelle {
  id: string;
  reference: string;
  placedAt: string;
  status: string;
  customer: { name: string };
  totalCents: number;
  paidCents: number;
}

export function commandeDepuisReel(o: CommandeReelle): CommandeEntree & { client: string } {
  return {
    id: o.id,
    numero: o.reference,
    client: o.customer.name,
    statut: o.status,
    creeLe: jourParis(o.placedAt),
    creeAt: o.placedAt,
    montantHtCents: undefined,
    paye: o.paidCents >= o.totalCents && o.totalCents > 0,
    // Le dépôt ne garde ni l'échéance ni le mode de remise : rien n'est inventé.
    livreeLe: o.status === 'delivered' ? jourParis(o.placedAt) : null,
  };
}

export interface ProductionReelle {
  id: string;
  idee: string;
  statut: 'idee' | 'tournage' | 'montage' | 'publie';
  jourDeTournage: string;
  jourDeSortiePrevu: string;
  personnesPresentes?: { nom: string }[];
  updatedAt: string;
}

const ETAPE_VIDEO: Record<ProductionReelle['statut'], string> = { idee: 'Idée', tournage: 'Enregistrement', montage: 'Montage', publie: 'Publiée' };
const AVANCEMENT_VIDEO: Record<ProductionReelle['statut'], number> = { idee: 0, tournage: 25, montage: 60, publie: 100 };

export function videoDepuisProduction(p: ProductionReelle): VideoEntree & { responsables: string[] } {
  return {
    id: p.id,
    titre: p.idee || '—',
    etape: ETAPE_VIDEO[p.statut],
    avancement: AVANCEMENT_VIDEO[p.statut],
    prevueLe: p.jourDeTournage || p.jourDeSortiePrevu || null,
    publieeLe: p.statut === 'publie' ? jourParis(p.updatedAt) : null,
    responsables: (p.personnesPresentes ?? []).map((x) => x.nom),
  };
}

export interface StockReel {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number | null;
  createdAt: string;
  movedAt: string;
}

/** Un article du dépôt : une quantité et un seuil, pas d'historique ni d'emplacement (un seul mouvement d'ouverture, daté du dernier mouvement). */
export function articleDepuisStock(s: StockReel): ArticleEntree {
  return {
    id: s.id,
    nom: s.name,
    seuilAlerte: s.minQuantity ?? 0,
    prixAchatCents: 0,
    emplacement: '—',
    mouvements: [{ le: jourParis(s.movedAt || s.createdAt), delta: s.quantity, motif: 'Inventaire' }],
  };
}
