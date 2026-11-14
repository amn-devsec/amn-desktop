/**
 * H15 · STOCK — le MODÈLE de l'écran : ce que la vue affiche, calculé par la logique de `stock.ts`. Pur, sans React.
 */
import { ajouterJours, ecartJours, jourCourtEtNumero, type Jour, type Langue } from '../../commun';
import {
  articlesASurveiller, enRoute, etatDuStock, HORIZON_PROJECTION_JOURS, journalDesMouvements, niveauCible, ordreDesJauges, quantiteEnStock,
  remplissage, reperSeuil, rupturesAVenir, valorisationCents,
  type ArticleEntree, type LivraisonPrevue, type Projection, type TonStock,
} from '../../stock';

export interface Jauge {
  id: string;
  nom: string;
  reference: string;
  quantite: number;
  seuil: number;
  remplissage: number;
  repereSeuil: number;
  ton: TonStock;
  enRoute: { quantite: number; part: number; jour: string } | null;
}

export interface Couloir {
  id: string;
  nom: string;
  statut: 'rupture' | 'evitee';
  /** Jours d'ici la rupture (1 à 14). */
  rupture: number;
  /** Jour de la livraison qui évite la rupture (1 à 14). */
  livraison: number | null;
  quantiteLivree: number;
  jourRupture: string;
  jourLivraison: string | null;
}

export interface LigneMouvement { id: string; le: Jour; quantite: number; nom: string; motif: string }

export interface ModeleStock {
  total: number;
  valeurCents: number;
  surveiller: number;
  emplacements: string[];
  jauges: Jauge[];
  couloirs: Couloir[];
  /** Ruptures non évitées : « 2 à commander ». */
  aCommander: number;
  restants: number;
  repereJours: Jour[];
  mouvements: LigneMouvement[];
}

export interface EntreeModele {
  articles: readonly (ArticleEntree & { reference?: string })[];
  livraisons: readonly LivraisonPrevue[];
  aujourdhui: Jour;
  emplacement: string | null;
  filtre: 'tout' | 'sous';
  langue: Langue;
}

export function modeleDuStock(e: EntreeModele): ModeleStock {
  const emp = e.emplacement ?? undefined;
  const visibles = e.articles.filter((a) => (e.filtre === 'sous' ? etatDuStock(quantiteEnStock(a, emp), a.seuilAlerte).etat !== 'en-stock' : true));
  const jauges: Jauge[] = ordreDesJauges(visibles, emp).map((a) => {
    const q = quantiteEnStock(a, emp);
    const cible = niveauCible(a);
    const route = enRoute(a, e.livraisons, emp);
    return {
      id: a.id,
      nom: a.nom,
      reference: a.reference ?? a.id,
      quantite: q,
      seuil: a.seuilAlerte,
      remplissage: remplissage(q, cible),
      repereSeuil: reperSeuil(a),
      ton: etatDuStock(q, a.seuilAlerte).ton,
      enRoute: route.quantite > 0 && route.le ? { quantite: route.quantite, part: Math.min(1 - remplissage(q, cible), route.quantite / cible), jour: jourCourtEtNumero(route.le, e.langue) } : null,
    };
  });
  const rup = rupturesAVenir(e.articles, e.livraisons, e.aujourdhui);
  const nomDe = (id: string) => e.articles.find((a) => a.id === id)?.nom ?? id;
  const couloirs: Couloir[] = rup.visibles.map((p: Projection) => {
    const miennes = e.livraisons.filter((l) => l.articleId === p.articleId).sort((a, b) => a.le.localeCompare(b.le));
    const livraison = p.livraisonLe ?? miennes[0]?.le ?? null;
    return {
      id: p.articleId,
      nom: nomDe(p.articleId),
      statut: p.statut === 'evitee' ? 'evitee' : 'rupture',
      rupture: p.dansJours ?? HORIZON_PROJECTION_JOURS,
      livraison: livraison ? Math.max(1, Math.min(HORIZON_PROJECTION_JOURS, ecartJours(e.aujourdhui, livraison))) : null,
      quantiteLivree: miennes.reduce((s, l) => s + l.quantite, 0),
      jourRupture: p.jourRupture ? jourCourtEtNumero(p.jourRupture, e.langue) : '',
      jourLivraison: livraison ? jourCourtEtNumero(livraison, e.langue) : null,
    };
  });
  const tous = e.articles.flatMap((a) => a.mouvements.map((m, i) => ({ id: `${a.id}-${i}`, le: m.le, quantite: m.delta, nom: a.nom, motif: m.motif })));
  return {
    total: e.articles.length,
    valeurCents: valorisationCents(e.articles),
    surveiller: articlesASurveiller(e.articles, emp).length,
    emplacements: [...new Set(e.articles.map((a) => a.emplacement))],
    jauges,
    couloirs,
    aCommander: rup.aCommander.length,
    restants: rup.restants,
    repereJours: Array.from({ length: HORIZON_PROJECTION_JOURS + 1 }, (_, i) => ajouterJours(e.aujourdhui, i)),
    mouvements: journalDesMouvements(tous, 5),
  };
}
