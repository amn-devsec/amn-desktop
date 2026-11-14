/**
 * APERÇU « MA12 » — Tarifs et remises dans la coquille, au vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MA12
 *
 * Les VRAIS composants de l'écran (`VueTarifs`) sur la grille FICTIVE de SIM (`prestations`), vue par un
 * administrateur (coûts et marges visibles). Les remises accordées du mois se calculent sur les factures fictives
 * d'octobre (prix de grille par ligne).
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueTarifs } from '../../../src/refonte/argent/ecrans/tarifs/VueTarifs';
import { remisesAccordees } from '../../../src/refonte/argent/tarifs';
import { MONDE } from '../argent/monde';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LIGNES = MONDE.factures.filter((f: any) => f.issuedAt.startsWith('2026-10') && f.status !== 'cancelled' && f.status !== 'draft').flatMap((f: any) => f.lines);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REMISES = remisesAccordees(LIGNES.filter((l: any) => l.prixGrilleCents != null).map((l: any) => ({ prixGrilleCents: l.prixGrilleCents, prixFactureCents: l.unitPriceCents, quantite: l.quantity })));
const rien = () => undefined;

export default function Apercu() {
  return (
    <ApercuBureau famille="argent" sousPage="tarifs" fil={['L’argent', 'Tarifs et remises']}>
      <VueTarifs
        statut="pret"
        prestations={MONDE.prestations}
        remisesAccordeesCents={REMISES}
        voitLesCouts
        actions={{ historique: rien, ajouter: rien, preparerGrille: rien, refuserSuggestion: rien }}
      />
    </ApercuBureau>
  );
}
