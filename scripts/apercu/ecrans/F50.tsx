/**
 * APERÇU « F50 » — Créer et produire, Vue d'ensemble (v4), sur les jeux FICTIFS de `src/refonte/donnees/` (30 oct. 2026).
 * Les noms, les numéros et les pourcentages sont ceux des jeux, pas ceux de l'image (écart connu : fiche F50 rubrique 6).
 *
 *   npm run apercu -- F50
 */
import React from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueHubCreer, type TuileHub } from '../../../src/refonte/creer/ecrans/F50/VueHubCreer';
import { construireLigne, elementsDeProduction, livraisonsALHeure, palierDesCommandes, SEIZE_MODULES } from '../../../src/refonte/creer/ligneDeProduction';
import { compter, type CommandeEntree } from '../../../src/refonte/creer/commandes';
import { articlesASurveiller, sousSeuilSansCommande } from '../../../src/refonte/creer/stock';
import { compte } from '../../../src/refonte/creer/i18n';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const commandes: (CommandeEntree & { client: string })[] = monde.commandes.map((c) => ({
  id: c.id, numero: c.numero, client: c.clientNom, statut: c.preparation, remise: c.remise, creeLe: c.creeLe, echeanceLe: c.prevueLe, urgente: c.urgente, livreeLe: c.preparation === 'Remise' ? c.prevueLe : null,
}));
const elements = elementsDeProduction({ chantiers: monde.chantiers, controlesOuverts: [], commandes, videos: monde.videos, retoursParVideo: {}, aujourdhui: jour });
const ligne = construireLigne(elements);
const k = compter(commandes, jour, monde.contexte.maintenant);
const surveiller = articlesASurveiller(monde.articles).length;
const sansCommande = sousSeuilSansCommande(monde.articles, []).length;
const tuiles: TuileHub[] = SEIZE_MODULES.map((m) => ({
  id: m.id, groupe: m.groupe, actif: true,
  mesure: m.id === 'stock' ? compte('fr', 'stock.surveiller', surveiller) : m.id === 'commandes' ? `${k.enCours} en cours · ${k.aExpedier} à expédier` : undefined,
  compte: m.id === 'stock' ? surveiller : m.id === 'commandes' ? k.aExpedier : undefined,
}));

export default function Apercu() {
  return (
    <ApercuBureau famille="creer" sousPage="ensemble" fil={['Créer et produire', "Vue d'ensemble"]} ajmani="Demande à Ajmani : « Qu’est-ce qui bloque au contrôle ? »">
      <VueHubCreer
        ligne={ligne}
        elements={elements}
        sousTitre={`${ligne.toutEnCours} travaux sur la ligne ce matin · ${k.livreesCeMois} commandes livrées ce mois`}
        tuiles={tuiles}
        palier={palierDesCommandes(k.livreesCeMois, k.livreesCeMois > 0 ? k.livreesCeMois - 1 : 0)}
        aLHeure={livraisonsALHeure([], jour)}
        articlesSansCommande={sansCommande}
      />
    </ApercuBureau>
  );
}
