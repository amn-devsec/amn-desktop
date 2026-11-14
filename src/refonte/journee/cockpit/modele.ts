import { objectifDuMois, type ObjectifDuMois } from '../cockpit';
import type { Jour } from '../commun';

/**
 * LOT-01 · G08 « COCKPIT D'UN CLIENT » — la console de pilotage (logique pure, fiche G08 rubriques 3, 4 et 6).
 *
 * CINQ INSTRUMENTS dans une seule carte : revenu récurrent, connectés en direct, paiements du jour, tickets ouverts avec leurs délais, santé
 * de l'intégration. Chacun peut être `null` : « non disponible » avec sa raison, jamais un zéro qui mentirait.
 *
 * SÉCURITÉ : les clés et jetons Stripe et Vercel restent côté serveur. Ce fichier ne manipule que des AGRÉGATS (totaux, comptes, séries) et des
 * valeurs MASQUÉES (les quatre derniers chiffres d'une carte, `carte4`) ; aucun champ ne porte une clé, un jeton ou un numéro complet.
 */
export interface EntreesCockpitClient {
  client: string;
  aujourdhui: Jour;
  maintenant: number;
  revenu: {
    cents: number;
    ecartPourcent: number | null;
    objectifCents: number | null;
    /** Le revenu de chaque jour du mois jusqu'à aujourd'hui (centimes). */
    serie: readonly number[];
    encaisseDuMoisCents: number;
    clientsActifs: number;
    nouveaux: number;
    impayes: number;
  } | null;
  connectes: { courant: number; picDuJour: number; picHeure: string; aujourdhui: number; picDes30Jours: number; minutes: readonly number[] } | null;
  paiements: {
    totalCents: number;
    nombre: number;
    reussis: number;
    refuse: { n: number; raison: string } | null;
    /** Les derniers paiements, du plus récent au plus ancien ; `carte4` : QUATRE chiffres, jamais plus. */
    derniers: readonly { heure: string; offre: string; carte4: string; cents: number; echec: boolean }[];
    note?: string;
  } | null;
  tickets: readonly TicketCouloirEntree[] | null;
  delaisTenusPourcent: number | null;
  sante: {
    noeuds: readonly { cle: 'stripe' | 'vercel' | 'serveur' | 'cockpit' | 'espace'; libelle: string; detail: string; ton: 'ok' | 'ralenti' | 'coupe' | 'neutre' }[];
    /** Les 48 dernières demi-heures. */
    segments: readonly ('ok' | 'ralenti' | 'coupe')[];
    disponibilitePourcent: number;
    legende: string | null;
    debutBande: string;
  } | null;
}

export interface TicketCouloirEntree { id: string; titre: string; urgent: boolean; initiale: string; creeAt: number; echeanceAt: number; creeLabel: string; echeanceLabel: string }

export interface Couloir {
  id: string;
  titre: string;
  urgent: boolean;
  initiale: string;
  creeLabel: string;
  echeanceLabel: string;
  /** 0 à 1 : la part du délai écoulée ; 1 quand il est dépassé. */
  ecoule: number;
  depasse: boolean;
  /** « reste 6 h 18 », « reste 3 j », « dépassé de 1 h 42 » : le temps en minutes. */
  minutes: number;
}

const minutesEntre = (a: number, b: number): number => Math.round((b - a) / 60_000);

export function tempsDuCouloir(min: number, depasse: boolean): { genre: 'reste' | 'depasse'; jours: number; heures: number; minutes: number } {
  const m = Math.abs(min);
  const jours = Math.floor(m / (24 * 60));
  return { genre: depasse ? 'depasse' : 'reste', jours, heures: Math.floor((m % (24 * 60)) / 60), minutes: m % 60 };
}

/** Les couloirs : urgents d'abord, puis dépassés, puis par temps restant (fiche G08 rubrique 6 et image). */
export function couloirsDesTickets(tickets: readonly TicketCouloirEntree[], maintenant: number): Couloir[] {
  return tickets
    .map((t): Couloir => {
      const total = Math.max(1, t.echeanceAt - t.creeAt);
      const ecoule = Math.min(1, Math.max(0, (maintenant - t.creeAt) / total));
      const reste = minutesEntre(maintenant, t.echeanceAt);
      return { id: t.id, titre: t.titre, urgent: t.urgent, initiale: t.initiale, creeLabel: t.creeLabel, echeanceLabel: t.echeanceLabel, ecoule: reste < 0 ? 1 : ecoule, depasse: reste < 0, minutes: reste };
    })
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || Number(b.depasse) - Number(a.depasse) || a.minutes - b.minutes || a.id.localeCompare(b.id));
}

/** Les graduations rondes de la courbe : « 3 k », « 4 k », « 5 k » autour de la série. */
export function graduationsRevenu(serie: readonly number[], objectifCents: number | null): { min: number; max: number; ticks: number[] } {
  const vals = [...serie, ...(objectifCents ? [objectifCents] : [])].map((c) => c / 100);
  const bas = Math.floor(Math.min(...vals, Infinity) / 1000) * 1000;
  const haut = Math.ceil(Math.max(...vals, -Infinity) / 1000) * 1000;
  const min = Math.max(0, bas - 1000);
  const max = Math.max(min + 2000, haut);
  const ticks: number[] = [];
  for (let v = min + 1000; v < max; v += 1000) ticks.push(v);
  return { min, max, ticks };
}

export interface ModeleCockpit {
  client: string;
  revenu: null | {
    cents: number; ecartPourcent: number | null; objectif: ObjectifDuMois | null;
    /** Les points de la courbe en 0–1 (x : jour du mois / jours du mois ; y : 0 en bas). */
    courbe: { x: number; y: number }[]; objectifY: number | null; graduations: { v: number; y: number }[];
    encaisseDuMoisCents: number; clientsActifs: number; nouveaux: number; impayes: number; jourDuMois: number;
  };
  connectes: null | { courant: number; fraction: number; picFraction: number; echelle: number; barres: number[]; aujourdhui: number; picDuJour: number; picHeure: string; reperes: number[] };
  paiements: null | { totalCents: number; nombre: number; reussis: number; refuse: { n: number; raison: string } | null; partReussie: number; derniers: NonNullable<EntreesCockpitClient['paiements']>['derniers']; note: string | null };
  couloirs: Couloir[] | null;
  delaisTenusPourcent: number | null;
  sante: null | { global: 'ok' | 'ralenti' | 'coupe'; noeuds: NonNullable<EntreesCockpitClient['sante']>['noeuds']; segments: readonly ('ok' | 'ralenti' | 'coupe')[]; disponibilitePourcent: number; legende: string | null; debutBande: string };
  /** Les instruments sans donnée (« non disponible »), dans l'ordre de la console. */
  manque: ('revenu' | 'connectes' | 'paiements' | 'tickets' | 'sante')[];
}

/** L'échelle du cadran : le pic des 30 derniers jours arrondi au-dessus à 20 près (ici 60). */
export const echelleDuCadran = (pic: number): number => Math.max(20, Math.ceil(pic / 20) * 20);

export function modeleCockpit(e: EntreesCockpitClient): ModeleCockpit {
  const manque: ModeleCockpit['manque'] = [];
  const jourDuMois = Number(e.aujourdhui.slice(8));
  const joursDuMois = new Date(Date.UTC(Number(e.aujourdhui.slice(0, 4)), Number(e.aujourdhui.slice(5, 7)), 0)).getUTCDate();

  let revenu: ModeleCockpit['revenu'] = null;
  if (e.revenu) {
    const r = e.revenu;
    const g = graduationsRevenu(r.serie, r.objectifCents);
    const y = (c: number): number => (c / 100 - g.min) / (g.max - g.min);
    revenu = {
      cents: r.cents, ecartPourcent: r.ecartPourcent, objectif: objectifDuMois(e.aujourdhui, r.cents, r.objectifCents),
      courbe: r.serie.map((c, i) => ({ x: r.serie.length === 1 ? 0 : i / (joursDuMois - 1), y: y(c) })),
      objectifY: r.objectifCents ? y(r.objectifCents) : null, graduations: g.ticks.map((v) => ({ v, y: (v - g.min) / (g.max - g.min) })),
      encaisseDuMoisCents: r.encaisseDuMoisCents, clientsActifs: r.clientsActifs, nouveaux: r.nouveaux, impayes: r.impayes, jourDuMois,
    };
  } else manque.push('revenu');

  let connectes: ModeleCockpit['connectes'] = null;
  if (e.connectes) {
    const c = e.connectes;
    const echelle = echelleDuCadran(c.picDes30Jours);
    const max = Math.max(1, ...c.minutes);
    connectes = { courant: c.courant, fraction: Math.min(1, c.courant / echelle), picFraction: Math.min(1, c.picDuJour / echelle), echelle, barres: c.minutes.map((m) => m / max), aujourdhui: c.aujourdhui, picDuJour: c.picDuJour, picHeure: c.picHeure, reperes: [0, 20, 40, 60].filter((v) => v <= echelle) };
  } else manque.push('connectes');

  let paiements: ModeleCockpit['paiements'] = null;
  if (e.paiements) {
    const p = e.paiements;
    paiements = { totalCents: p.totalCents, nombre: p.nombre, reussis: p.reussis, refuse: p.refuse, partReussie: p.nombre > 0 ? p.reussis / p.nombre : 1, derniers: p.derniers.slice(0, 4).map((d) => ({ ...d, carte4: d.carte4.slice(-4) })), note: p.note ?? null };
  } else manque.push('paiements');

  const couloirs = e.tickets ? couloirsDesTickets(e.tickets, e.maintenant) : null;
  if (!e.tickets) manque.push('tickets');

  let sante: ModeleCockpit['sante'] = null;
  if (e.sante) {
    const tons = e.sante.noeuds.map((n) => n.ton);
    sante = { global: tons.includes('coupe') ? 'coupe' : tons.includes('ralenti') ? 'ralenti' : 'ok', noeuds: e.sante.noeuds, segments: e.sante.segments, disponibilitePourcent: e.sante.disponibilitePourcent, legende: e.sante.legende, debutBande: e.sante.debutBande };
  } else manque.push('sante');

  return { client: e.client, revenu, connectes, paiements, couloirs, delaisTenusPourcent: e.delaisTenusPourcent, sante, manque };
}
