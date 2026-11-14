/**
 * APERÇU « MC07 » — Relances (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MC07
 *
 * Rendue par les VRAIS composants de l'écran (`VuePile`) sur le modèle `modelePile` calculé depuis les relances FICTIVES de SIM.
 * Fabriqué ICI seulement (rien de tout cela n'existe dans l'application) : la sélection de cinq relances pour tenir la file de
 * l'image (une faite à 09:12, quatre à envoyer), une relance déjà envoyée deux fois (la suggestion « Un appel plutôt qu'un message »), deux relances déjà répondues (pour les compteurs du mois), les deux réponses du jour
 * avec leur heure, et les quatre jours « boîte à zéro » de la semaine. Les noms et les montants sont ceux du jeu de SIM.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VuePile, type ActionsPile } from '../../../src/refonte/contacts/pile/VuePile';
import { cleRelance, modelePile } from '../../../src/refonte/contacts/pile/modele';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const base = depuisMonde(monde);
const CHOIX = ['rl-0002', 'rl-0001', 'rl-0004', 'rl-0007', 'rl-0009', 'rl-0008', 'rl-0012'];
const relances = base.relances
  .filter((r) => CHOIX.includes(r.id))
  .map((r) => (r.id === 'rl-0009' ? { ...r, etat: 'envoyée' as const, nbEnvoyees: 2, derniereEnvoiLe: '2026-10-22' } : r.etat === 'répondue' ? r : { ...r, etat: 'prête' as const, nbEnvoyees: 0, derniereEnvoiLe: null }));
const src = { ...base, relances, echanges: [] };
const faite = relances.find((r) => r.id === 'rl-0002');
const modele = modelePile(src, {
  historique: {
    traces: faite ? [{ cle: cleRelance(faite), geste: 'envoyee', le: instantParis('2026-10-30', '09:12') }] : [],
    joursVides: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29'],
    matin: null,
  },
  passees: [],
  selection: null,
  ton: 'courtois',
  brouillons: {},
  reponses: [
    { clientNom: 'Menuiserie Verdier', texte: 'Facture 2026-0023 payée', heure: '09:48', genre: 'paiement' },
    { clientNom: 'Épicerie Bellevue', texte: '« Merci, réglé ce matin »', heure: '09:40', genre: 'message' },
  ],
});

const rien = () => undefined;
const ACTIONS: ActionsPile = {
  envoyer: rien, reporter: rien, passer: rien, appeler: rien, ouvrirLigne: rien, ton: rien, brouillon: rien, modeles: rien, toutEnvoyer: rien,
  modifierReglages: rien, planifierAppel: rien, masquerSuggestion: rien, voirReponses: rien, annuler: rien, reessayer: rien,
};

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="relances" fil={['Mes contacts et clients', 'Relances']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VuePile statut="pret" modele={modele} ton="courtois" envoi="courriel" annulation={null} actions={ACTIONS} />
    </ApercuBureau>
  );
}
