import { arrondi, moisDe, pourcentage, jourDe, type Mois } from './commun';

/**
 * PAIEMENTS EN LIGNE (MA03) — fiche v4, rubrique 6. Les valeurs viennent du serveur, qui
 * reçoit les événements du service de paiement ; l'application ne lui parle jamais avec
 * une clé. Montants TTC payés par le client, avant frais.
 *
 *   · taux de réussite = (paiements − échoués) ÷ paiements du mois, arrondi ((41 − 1) ÷ 41 → 98 %) ;
 *   · encaissé = somme des réussis du mois ; frais ÷ encaissé à une décimale (182 ÷ 9 640 → 1,9 %) ;
 *   · hauteur d'une barre journalière = √(valeur ÷ maximum) × hauteur (échelle en racine).
 */
export interface PaiementLu {
  moyen: string;
  montantCents: number;
  fraisCents: number;
  etat: 'réussi' | 'en attente' | 'échoué' | 'remboursé' | string;
  date: string;
}

export function bilanDuMois(paiements: readonly PaiementLu[], mois: Mois): { total: number; reussis: number; enAttente: number; echoues: number; tauxReussite: number | null; encaisseCents: number; fraisCents: number; partFrais: number | null } {
  const du = paiements.filter((p) => moisDe(jourDe(p.date)) === mois && ['réussi', 'en attente', 'échoué'].includes(p.etat));
  const reussis = du.filter((p) => p.etat === 'réussi');
  const echoues = du.filter((p) => p.etat === 'échoué').length;
  const encaisse = reussis.reduce((s, p) => s + p.montantCents, 0);
  const frais = reussis.reduce((s, p) => s + p.fraisCents, 0);
  return {
    total: du.length,
    reussis: reussis.length,
    enAttente: du.filter((p) => p.etat === 'en attente').length,
    echoues,
    tauxReussite: pourcentage(du.length - echoues, du.length, 0),
    encaisseCents: encaisse,
    fraisCents: frais,
    partFrais: pourcentage(frais, encaisse, 1),
  };
}

/** « Par moyen » : nombre de paiements et taux de réussite du moyen (Carte : 23 sur 24 → 96 %). */
export function parMoyen(paiements: readonly PaiementLu[], mois: Mois): { moyen: string; total: number; reussis: number; taux: number | null }[] {
  const par = new Map<string, { total: number; reussis: number }>();
  for (const p of paiements) {
    if (moisDe(jourDe(p.date)) !== mois || !['réussi', 'en attente', 'échoué'].includes(p.etat)) continue;
    const m = par.get(p.moyen) ?? { total: 0, reussis: 0 };
    m.total += 1;
    if (p.etat === 'réussi') m.reussis += 1;
    par.set(p.moyen, m);
  }
  return [...par.entries()].map(([moyen, m]) => ({ moyen, ...m, taux: pourcentage(m.reussis, m.total, 0) }));
}

/** La hauteur d'une barre journalière, en pixels : √(valeur ÷ maximum) × hauteur. */
export const hauteurDeBarre = (valeurCents: number, maximumCents: number, hauteurPx = 76): number => (maximumCents <= 0 ? 0 : arrondi(Math.sqrt(Math.max(0, valeurCents) / maximumCents) * hauteurPx));
