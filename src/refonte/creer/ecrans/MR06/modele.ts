/** MR06 · RÉSERVATIONS — le modèle de la frise et de la bande de la semaine, calculé par `reservations.ts`. Pur, sans React. */
import { ajouterJours, formaterDuree, grouper, jourParis, lundiDe, minutesParis, type Jour } from '../../commun';
import {
  conflitsEnAttente, creneauxLibres, filtrerRessources, joursSansDoublon, occupationDeLaSemaine, occupationDuJour, plageDuJour, resumeDesCreneaux,
  type FiltreRessource, type RessourceEntree, type ReservationEntree,
} from '../../reservations';

export interface BlocVue {
  type: 'reserve' | 'libre' | 'conflit' | 'indisponible';
  debut: number;
  fin: number;
  libelle: string;
  /** « Libre 2 h · le plus long » : mis en valeur. */
  plusLong?: boolean;
  /** Moitié du haut ou du bas (conflit dessiné sous le bloc concurrent). */
  rang?: 'haut' | 'bas';
  qui?: string;
}
export interface LigneVue { ressource: RessourceEntree & { detail?: string }; blocs: BlocVue[]; indisponibleLibelle?: string }
export interface GroupeVue { type: RessourceEntree['type']; lignes: LigneVue[] }

export interface ModeleReservations {
  jours: { jour: Jour; pct: number | null; aujourdhui: boolean }[];
  semainePct: number | null;
  /** Demi-journées libres, pour la phrase « Vendredi après-midi et lundi matin sont libres. » */
  creuses: { jour: Jour; moment: 'matin' | 'apres-midi'; pct: number }[];
  sansDoublonJours: number | null;
  groupes: GroupeVue[];
  nbRessources: number;
  nbLibres: number;
  conflits: number;
}

export interface ReservationVue extends ReservationEntree { libelle: string; qui?: string }

export function modeleDesReservations(e: {
  ressources: readonly (RessourceEntree & { detail?: string; motifIndisponible?: string })[];
  reservations: readonly ReservationVue[];
  conflitsLe: readonly Jour[];
  aujourdhui: Jour;
  filtre: FiltreRessource;
}): ModeleReservations {
  const lundi = lundiDe(e.aujourdhui);
  const ressources = filtrerRessources(e.ressources, e.filtre);
  const sem = occupationDeLaSemaine(e.ressources, e.reservations, lundi);
  const resume = resumeDesCreneaux(e.ressources, e.reservations, e.aujourdhui);
  const conflits = conflitsEnAttente(e.reservations);
  const plusLong = resume.plusLong;
  const lignes: LigneVue[] = ressources.map((r) => {
    const plage = plageDuJour(r, e.aujourdhui);
    if (!plage) return { ressource: r, blocs: [{ type: 'indisponible', debut: 480, fin: 1080, libelle: r.motifIndisponible ?? '' }], indisponibleLibelle: r.motifIndisponible };
    const blocs: BlocVue[] = [];
    for (const x of e.reservations.filter((y) => y.ressourceId === r.id && y.statut !== 'annulée' && jourParis(y.debutAt) === e.aujourdhui)) {
      const enConflit = conflits.some((c) => c.demande.id === x.id);
      blocs.push({ type: enConflit ? 'conflit' : 'reserve', debut: Math.max(plage.debut, minutesParis(x.debutAt)), fin: Math.min(plage.fin, minutesParis(x.finAt)), libelle: x.libelle, qui: x.qui, rang: enConflit ? 'bas' : undefined });
    }
    // Un conflit occupe visuellement le créneau : les libres ne le recouvrent pas ; les blocs qu'il chevauche passent en moitié haute.
    const enDemande = conflits.filter((c) => c.demande.ressourceId === r.id).map((c) => ({ ...c.demande, statut: 'confirmée' as const }));
    for (const b of blocs) if (b.type === 'reserve' && blocs.some((c) => c.type === 'conflit' && c.debut < b.fin && b.debut < c.fin)) b.rang = 'haut';
    for (const c of creneauxLibres(r, [...e.reservations, ...enDemande], e.aujourdhui)) {
      blocs.push({ type: 'libre', debut: c.debut, fin: c.fin, libelle: `Libre ${formaterDuree(c.dureeMin)}`, plusLong: plusLong?.ressourceId === r.id && plusLong.debut === c.debut });
    }
    return { ressource: r, blocs: blocs.sort((a, b) => a.debut - b.debut) };
  });
  const groupes = [...grouper(lignes, (l) => l.ressource.type).entries()].map(([type, ls]) => ({ type, lignes: ls }));
  return {
    jours: Array.from({ length: 5 }, (_, i) => { const jour = ajouterJours(lundi, i); return { jour, pct: occupationDuJour(e.ressources, e.reservations, jour), aujourdhui: jour === e.aujourdhui }; }),
    semainePct: sem.semaine,
    creuses: [],
    sansDoublonJours: joursSansDoublon(e.conflitsLe, e.aujourdhui),
    groupes,
    nbRessources: e.ressources.length,
    nbLibres: resume.nombre,
    conflits: conflits.length,
  };
}
