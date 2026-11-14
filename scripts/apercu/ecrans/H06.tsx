/**
 * APERÇU « H06 » — Prospects (LOT-02), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- H06
 *
 * Rendue par les VRAIS composants de l'écran (`VueProspects`) sur le modèle `modeleProspects` calculé depuis les prospects
 * FICTIFS de SIM. L'application n'a pas de signaux d'intérêt (lectures du devis, réponses) : l'aperçu en fabrique, de façon
 * déterministe, pour montrer le nuage tel que le dessine la fiche ; ils n'existent QUE ici. Les noms et les montants sont
 * ceux du jeu ; c'est la disposition qui se compare.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { construireMonde } from '../../../src/refonte/donnees';
import { instantParis } from '../../../src/refonte/donnees/outils';
import { depuisMonde } from '../../../src/refonte/contacts/sources/depuisMonde';
import { VueProspects, type ActionsProspects } from '../../../src/refonte/contacts/prospects/VueProspects';
import { modeleProspects, type SignauxProspect } from '../../../src/refonte/contacts/prospects/modele';
import { estOuvert } from '../../../src/refonte/contacts/pipeline';

const monde = construireMonde({ maintenant: instantParis('2026-10-30', '10:42') });
const src = depuisMonde(monde);

/** Signaux d'aperçu : un déroulé fixe, dans l'ordre des prospects, pour étaler les points sur toute la largeur. */
const PROFILS = [
  { lectures14j: 4, delai: 2, rdv: 2, contact: 0 },
  { lectures14j: 3, delai: 6, rdv: 2, contact: 1 },
  { lectures14j: 3, delai: 10, rdv: 1, contact: 2 },
  { lectures14j: 2, delai: 8, rdv: 2, contact: 3 },
  { lectures14j: 1, delai: 30, rdv: 0, contact: 9 },
  { lectures14j: 0, delai: 60, rdv: 1, contact: 14 },
  { lectures14j: 2, delai: 24, rdv: 1, contact: 12 },
  { lectures14j: 1, delai: 48, rdv: 0, contact: 18 },
  { lectures14j: 0, delai: 70, rdv: 0, contact: 22 },
  { lectures14j: 4, delai: 4, rdv: 2, contact: 1 },
  { lectures14j: 0, delai: 72, rdv: 0, contact: 28 },
] as const;
const signaux: Record<string, SignauxProspect> = {};
src.prospects.filter(estOuvert).forEach((p, i) => {
  const f = PROFILS[i % PROFILS.length];
  signaux[p.id] = {
    signaux: { lectures14j: f.lectures14j, delaiReponseHeures: f.delai, rendezVous: f.rdv, joursDepuisContact: f.contact },
    interetIlYa14j: i % 4 === 0 ? 40 : null,
    evenements: [{ genre: 'devisOuvert', n: 1, ilYaMin: 4 }, { genre: 'lectures', n: 3, ilYaMin: 600 }, { genre: 'reponse', n: 2, ilYaMin: 1500 }],
  };
});
const modele = modeleProspects(src, signaux);
const premier = modele.appels[0]?.id ?? [...modele.points].sort((a, b) => b.interet - a.interet)[0]?.id ?? null;

const rien = () => undefined;
const ACTIONS: ActionsProspects = { nouveau: rien, changerVue: rien, appeler: rien, ecrire: rien, ouvrir: rien, cocher: rien, reessayer: rien };

export default function Apercu() {
  return (
    <ApercuBureau famille="contacts" sousPage="prospects" fil={['Mes contacts et clients', 'Prospects']} ajmani="Demande « qui dois-je appeler aujourd’hui ? » ou ajoute un prospect">
      <VueProspects statut="pret" modele={modele} vue="nuage" faits={new Set(modele.appels.slice(2, 3).map((p) => p.id))} actions={ACTIONS} survolInitial={premier} />
    </ApercuBureau>
  );
}
