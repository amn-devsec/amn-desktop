/**
 * APERÇU « MR08 » — Créer · Boutique en ligne (v4). Les visiteurs en direct, les ventes de la semaine, l'entonnoir et l'objectif
 * du trimestre sont posés ici (le jeu de SIM n'a ni sessions ni paniers) ; les calculs sont ceux de `boutique.ts`.
 *
 *   npm run apercu -- MR08
 */
import React, { useState } from 'react';
import { VueBoutique } from '../../../src/refonte/creer/ecrans/MR08/VueBoutique';
import { avancementObjectif, bilanDeLaSemaine, ceQuiSeVend, type CommandeBoutique } from '../../../src/refonte/creer/boutique';
import { ApercuBureau } from '../coquille';

const jour = '2026-10-30';
const lignes = (nom: string, q: number) => [{ produitId: nom, nom, quantite: q }];
const cmds: CommandeBoutique[] = [
  ...Array.from({ length: 5 }, () => ({ payeeLe: '2026-10-28', totalCents: 11000, lignes: lignes('Forfait dépannage', 1) })),
  ...Array.from({ length: 3 }, () => ({ payeeLe: '2026-10-29', totalCents: 62000, lignes: lignes('Caisse enregistreuse tactile', 1) })),
  ...Array.from({ length: 2 }, () => ({ payeeLe: '2026-10-29', totalCents: 18000, lignes: lignes('Borne Wi-Fi pro', 1) })),
  { payeeLe: '2026-10-30', totalCents: 89000, lignes: lignes('Pack caméras', 1) }, { payeeLe: '2026-10-30', totalCents: 15000, lignes: lignes('Onduleur 1 000 VA', 1) },
  ...Array.from({ length: 2 }, () => ({ payeeLe: '2026-10-27', totalCents: 20000, lignes: lignes('Divers', 1) })),
];
const sem = bilanDeLaSemaine([...cmds, { payeeLe: '2026-10-20', totalCents: 90000, lignes: [] }], jour);
const vendus = ceQuiSeVend(cmds, jour);
const objectif = avancementObjectif({ montantCents: 2_400_000, debut: '2026-10-01', fin: '2026-12-31' }, [{ payeeLe: '2026-10-15', totalCents: 1_842_000, lignes: [] }], jour);

export default function Apercu() {
  const [periode, setPeriode] = useState<7 | 30>(7);
  return (
    <ApercuBureau famille="creer" sousPage="shop" fil={['Créer et produire', 'Boutique en ligne']}>
      <VueBoutique
        etat="ouverte" semaine={{ ...sem, chiffreAffairesCents: 384000, commandes: 14, panierMoyenCents: 27400, variationCaPct: 18, variationCommandes: 4 }}
        vendus={vendus.map((v) => ({ id: v.produitId, nom: v.nom, quantite: v.quantite, barre: v.barre }))}
        direct={{ nombre: 7, lignes: [
          { appareil: 'ordinateur', page: 'Fiche « Caisse enregistreuse tactile »', etape: 'produit', dureeSec: 120 }, { appareil: 'telephone', page: 'Panier · 1 article, 180 €', etape: 'panier', dureeSec: 40 },
          { appareil: 'ordinateur', page: 'Accueil de la boutique', etape: 'regarde', dureeSec: 12 }, { appareil: 'telephone', page: 'Recherche « caméra extérieure »', etape: 'regarde', dureeSec: 60 }, { appareil: 'ordinateur', page: 'Paiement en cours', etape: 'paiement', dureeSec: 25 },
        ], dernier: { il: 'il y a 20 s', texte: '« Borne Wi-Fi pro » ajoutée au panier', montant: '+180 €' } }}
        entonnoir={{ visites: 1240, fiches: 380, paniers: 19, paiements: 16, commandes: 14 }} periode={periode} onPeriode={setPeriode} paniers={{ abandonnes: 5, contactables: 3 }}
        objectif={{ caCents: 1_842_000, objectifCents: 2_400_000, pct: 77, resteCents: objectif.resteCents, semaines: 2 }}
        suggestionTitre="Relancer les paniers"
        suggestion="3 paniers abandonnés ont une adresse e-mail. Je prépare un message avec 5 % de remise, tu le relis avant l’envoi."
      />
    </ApercuBureau>
  );
}
