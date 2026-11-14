/**
 * APERÇU « MA03 » — Paiements en ligne dans la coquille, au vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MA03
 *
 * Les VRAIS composants de l'écran (`VuePaiements`) sur les paiements FICTIFS de SIM (`src/refonte/donnees/`). Les
 * versements ne sont dans aucun jeu : la carte le dit (« pas encore disponibles »). La connexion est celle du connecteur
 * fictif « Paiement en ligne » de SIM.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VuePaiements, type PaiementVu } from '../../../src/refonte/argent/ecrans/paiements/VuePaiements';
import { MAINTENANT, MONDE, numeroDeFacture } from '../argent/monde';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PAIEMENTS: PaiementVu[] = MONDE.paiements.map((p: any) => ({
  id: p.id,
  date: p.date,
  clientNom: p.clientNom,
  moyen: p.moyen,
  montantCents: p.montantCents,
  fraisCents: p.fraisCents,
  etat: p.etat,
  facture: numeroDeFacture(p.factureId),
}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CONNECTEUR = MONDE.connecteurs.find((c: any) => /paiement/i.test(c.nom));
const rien = () => undefined;

export default function Apercu() {
  return (
    <ApercuBureau famille="argent" sousPage="paiements" fil={['L’argent', 'Paiements en ligne']}>
      <VuePaiements
        statut="pret"
        connexion={{ etat: CONNECTEUR?.etat === 'Connecté' ? 'connecte' : 'a-verifier', dernierTest: CONNECTEUR?.derniereSynchroAt ?? null }}
        paiements={PAIEMENTS}
        versements={null}
        maintenant={MAINTENANT}
        majLe={new Date(MAINTENANT.getTime() - 12_000).toISOString()}
        enLigne
        peutEcrire
        actions={{ creerLien: rien, reglages: rien, envoyerLien: rien, ouvrir: rien, reessayer: rien }}
      />
    </ApercuBureau>
  );
}
