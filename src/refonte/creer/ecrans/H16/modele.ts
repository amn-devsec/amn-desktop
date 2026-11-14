/** H16 · CHANTIERS — le modèle de l'écran, calculé par `chantiers.ts`. Pur, sans React. */
import { jourCourtEtNumero, jourEtMois, semaineIso, type Jour, type Langue } from '../../commun';
import {
  agendaDeLaSemaine, avancement, bilanDeLaSemaine, budgetConsomme, budgetEnAmbre, chantierParDefaut, etapeEnCours, libelleEtape,
  livraisonEnRetardSurIntervention, prochaineIntervention, resumeDesChantiers, rythme, statutDuChantier,
  type ChantierEntree, type InterventionEntree, type LivraisonChantier, type Rythme, type StatutSaisi,
} from '../../chantiers';

export type EtatEtape = 'faite' | 'encours' | 'afaire';

export interface EtapeVue {
  nom: string;
  court: { court: string; tronque: boolean };
  etat: EtatEtape;
  /** « Sem. 44 » ou une date de fin pour la dernière. */
  quand: string;
  partPct: number | null;
  equipe: readonly string[];
}

export interface ChantierVue {
  id: string;
  nom: string;
  objet: string;
  initiale: string;
  statut: StatutSaisi;
  etapes: EtapeVue[];
  indiceEnCours: number;
  avancement: number;
  budgetPct: number | null;
  budgetAmbre: boolean;
  depenseCents: number;
  budgetCents: number;
  rythme: Rythme;
  prochaine: { jour: string; heure: string; libelle: string; equipe: readonly string[]; livraison: string | null } | null;
  finPrevue: string | null;
}

export interface ModeleChantiers {
  resume: ReturnType<typeof resumeDesChantiers>;
  ouvert: ChantierVue | null;
  autres: ChantierVue[];
  agenda: { jour: Jour; titre: string; lignes: { heure: string | null; site: string; libelle: string; type: 'intervention' | 'livraison' }[] }[];
  nbAgenda: number;
  bilan: ReturnType<typeof bilanDeLaSemaine>;
}

export interface ChantierSource extends ChantierEntree {
  objet?: string;
  lieu?: string;
}

export function modeleDesChantiers(e: {
  chantiers: readonly ChantierSource[];
  interventions: readonly InterventionEntree[];
  livraisons: readonly LivraisonChantier[];
  aujourdhui: Jour;
  ouvertId: string | null;
  langue: Langue;
}): ModeleChantiers {
  const { aujourdhui: auj, langue } = e;
  const vue = (c: ChantierSource): ChantierVue => {
    const cours = etapeEnCours(c);
    const prochaine = prochaineIntervention(c.id, e.interventions, auj);
    const liv = prochaine ? livraisonEnRetardSurIntervention(prochaine, e.livraisons) : null;
    const dernier = c.etapes.length - 1;
    return {
      id: c.id,
      nom: c.nom,
      objet: c.objet ?? '',
      initiale: (c.nom.trim()[0] ?? '·').toUpperCase(),
      statut: statutDuChantier(c, auj),
      etapes: c.etapes.map((s, i) => ({
        nom: s.nom,
        court: libelleEtape(s.nom),
        etat: s.faite ? 'faite' : cours?.indice === i ? 'encours' : 'afaire',
        quand: i === dernier && c.finPrevueLe < '9999' ? jourEtMois(c.finPrevueLe, langue) : `Sem. ${s.semaine}`,
        partPct: cours?.indice === i && s.partRealisee !== undefined ? Math.round(s.partRealisee * 100) : null,
        equipe: s.equipe ?? [],
      })),
      indiceEnCours: cours?.indice ?? -1,
      avancement: avancement(c),
      budgetPct: budgetConsomme(c),
      budgetAmbre: budgetEnAmbre(c),
      depenseCents: c.depenseCents,
      budgetCents: c.budgetCents,
      rythme: rythme(c),
      prochaine: prochaine ? { jour: jourCourtEtNumero(prochaine.jour, langue), heure: prochaine.debut, libelle: prochaine.libelle, equipe: prochaine.equipe ?? [], livraison: liv ? jourCourtEtNumero(liv.jour, langue) : null } : null,
      finPrevue: c.finPrevueLe < '9999' ? jourEtMois(c.finPrevueLe, langue) : null,
    };
  };
  const ouvert = (e.ouvertId ? e.chantiers.find((c) => c.id === e.ouvertId) : null) ?? chantierParDefaut(e.chantiers, auj);
  const agenda = agendaDeLaSemaine(e.interventions, e.livraisons, auj);
  const nomDe = (id: string) => e.chantiers.find((c) => c.id === id)?.nom ?? '';
  return {
    resume: resumeDesChantiers(e.chantiers, auj),
    ouvert: ouvert ? vue(ouvert) : null,
    autres: e.chantiers.filter((c) => c.id !== ouvert?.id).map(vue),
    agenda: agenda.map((j) => ({
      jour: j.jour,
      titre: jourCourtEtNumero(j.jour, langue).toUpperCase().replace('.', '.') + ' ' + jourEtMois(j.jour, langue).split(/\s/).slice(1).join(' ').toUpperCase(),
      lignes: j.lignes.map((l) => ({ heure: l.heure, site: l.type === 'livraison' ? 'Entrepôt' : nomDe(l.chantierId), libelle: l.libelle, type: l.type })),
    })),
    nbAgenda: agenda.reduce((s, j) => s + j.lignes.length, 0),
    bilan: bilanDeLaSemaine(e.chantiers, auj),
  };
}

export const semaineCourante = (j: Jour): number => semaineIso(j).semaine;
