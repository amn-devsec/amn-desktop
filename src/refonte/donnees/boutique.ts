/**
 * LA BOUTIQUE EN LIGNE (MR08) — l'entonnoir des trente derniers jours, les paniers et les sessions en direct.
 *
 * Rien n'est personnel : des compteurs par jour, des paniers sans adresse, des sessions anonymes. L'entonnoir se
 * recoupe avec le jeu `commandes` : les commandes et les paiements d'un jour sont CEUX des commandes de ce jour-là.
 */

import { cle, fabriquer, hasardDe, nomClient } from './commun';
import { ajouterJours, compter, estOuvre, iso, jourSemaine, type Jour } from './outils';
import type { Contexte, FicheClient } from './types';
import type { Commande, JourEntonnoir, PanierBoutique, SessionBoutique } from './types-suite';

const MIN = 60_000;

/** Un jour par entrée, du plus ancien au plus récent ; le dernier est aujourd'hui (comptes partiels, comme à 10 h 42). */
export function genererEntonnoir(ctx: Contexte, commandes: readonly Commande[]): JourEntonnoir[] {
  const h = hasardDe(ctx.graine, 'entonnoirBoutique');
  const n = compter(ctx.volumes.entonnoirBoutique, [0, 14, 30, 90]);
  return fabriquer(n, (k) => {
    const jour: Jour = ajouterJours(ctx.aujourdhui, -(n - k));
    const duJour = commandes.filter((c) => c.creeLe === jour);
    const payees = duJour.filter((c) => c.paiement === 'Payé').length;
    const semaine = estOuvre(jour) ? 1 : 0.6;
    // Aujourd'hui n'est pas fini : un tiers de la journée à 10 h 42.
    const part = jour === ctx.aujourdhui ? 0.35 : 1;
    const paniers = Math.max(duJour.length, Math.round((duJour.length * 2.4 + h.entier(2, 9)) * semaine * part));
    const vus = Math.max(paniers, Math.round(paniers * h.choix([3.2, 3.8, 4.5]) + h.entier(3, 20)));
    const visites = Math.max(vus, Math.round(vus * h.choix([1.6, 2, 2.4]) + h.entier(10, 60) * semaine * part));
    return { id: cle('en', k, 3), jour, visites, produitsVus: vus, paniersCrees: paniers, commandes: duJour.length, paiements: payees };
  });
}

/** Des paniers ouverts (activité récente), abandonnés (plus d'une heure sans activité) et convertis (une commande). */
export function genererPaniers(ctx: Contexte, clients: readonly FicheClient[], commandes: readonly Commande[]): PanierBoutique[] {
  const h = hasardDe(ctx.graine, 'paniers');
  const n = compter(ctx.volumes.paniers, [0, 3, 10, 60]);
  const etats: PanierBoutique['etat'][] = ['ouvert', 'abandonné', 'converti'];
  const converties = commandes.filter((c) => c.paiement === 'Payé');
  return fabriquer(n, (i) => {
    const etat = etats[(i - 1) % 3];
    const c = clients.length && h.chance(0.5) ? h.choix(clients) : null;
    const commande = etat === 'converti' ? converties[(i - 1) % Math.max(1, converties.length)] ?? null : null;
    const ageMin = etat === 'ouvert' ? h.entier(2, 50) : etat === 'abandonné' ? h.entier(70, 60 * 24 * 6) : h.entier(60, 60 * 24 * 20);
    const montant = commande ? commande.lignes.reduce((s, l) => s + l.prixCents * l.quantite, 0) : h.entier(18, 340) * 100;
    return {
      id: cle('pa', i),
      clientNom: commande ? commande.clientNom : c ? nomClient(c) : null,
      lignes: commande ? commande.lignes.length : h.entier(1, 5),
      montantCents: montant,
      derniereActiviteAt: iso(ctx.maintenant - ageMin * MIN),
      etat: commande || etat !== 'converti' ? etat : 'abandonné',
      commandeId: commande?.id ?? null,
    };
  }).sort((a, b) => b.derniereActiviteAt.localeCompare(a.derniereActiviteAt));
}

const PAGES_BOUTIQUE = ['Accueil', 'Catalogue', 'Fiche produit', 'Panier', 'Paiement', 'Contact'] as const;

/** Les sessions en direct : actives dans les cinq dernières minutes. Plus nombreuses en semaine, en journée. */
export function genererSessions(ctx: Contexte): SessionBoutique[] {
  const h = hasardDe(ctx.graine, 'sessionsBoutique');
  const base = compter(ctx.volumes.sessionsBoutique, [0, 2, 6, 25]);
  const n = base === 0 ? 0 : jourSemaine(ctx.aujourdhui) <= 5 ? base : Math.max(1, Math.ceil(base / 2));
  return fabriquer(n, (i) => {
    const derniere = h.entier(0, 4) * MIN + h.entier(5, 55) * 1000;
    return {
      id: cle('sb', i),
      debutAt: iso(ctx.maintenant - derniere - h.entier(1, 25) * MIN),
      derniereActiviteAt: iso(ctx.maintenant - derniere),
      page: PAGES_BOUTIQUE[(i + h.entier(0, 5)) % PAGES_BOUTIQUE.length],
      appareil: h.pondere([['mobile', 6], ['ordinateur', 3], ['tablette', 1]] as const),
    };
  }).sort((a, b) => b.derniereActiviteAt.localeCompare(a.derniereActiviteAt));
}
