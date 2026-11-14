/**
 * APERÇU « H07 » — un devis dans la coquille, au vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- H07
 *
 * Les VRAIS composants de l'écran (`VueDevis`) sur les jeux FICTIFS de SIM : le devis envoyé le plus récent qui a le
 * plus de lignes, le catalogue des prestations (MA12). Aucun jeu ne porte de versions multiples ni de mesure de
 * lecture : l'écran le dit (« pas encore disponible ») au lieu de l'inventer.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueDevis, type DevisVu } from '../../../src/refonte/argent/ecrans/devis/VueDevis';
import { MAINTENANT, MONDE } from '../argent/monde';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const D: any = [...MONDE.devis].filter((d: any) => d.status === 'sent').sort((a: any, b: any) => b.lignes.length - a.lignes.length || b.createdAt.localeCompare(a.createdAt))[0];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CLIENT: any = MONDE.clients.find((c: any) => c.id === D.clientId);
const DEVIS: DevisVu = {
  numero: D.numero,
  version: 1,
  clientNom: D.clientNom,
  contact: CLIENT?.name ?? null,
  adresse: CLIENT?.adresse ?? null,
  objet: D.title,
  emisLe: D.sentAt ? `${D.sentAt}T12:00:00` : null,
  validiteJusquau: D.validiteJusquau,
  lignes: D.lignes,
  ttcPrecedentCents: null,
  vuLe: D.vuAt,
};
const rien = () => undefined;

export default function Apercu() {
  return (
    <ApercuBureau famille="argent" sousPage="devis" fil={['L’argent', 'Devis', D.numero]} ajmani="Ajoute une ligne, change un prix ou demande « que regarde le client ? »">
      <VueDevis
        statut="pret"
        devis={DEVIS}
        emetteur={{ nom: MONDE.entreprise.nom, activite: MONDE.entreprise.secteur }}
        catalogue={MONDE.prestations}
        versions={[{ n: 1, etat: 'envoyee', le: `${D.sentAt}T09:00:00`, lectures: null, ouverte: Boolean(D.vuAt) }]}
        suivi={null}
        enregistreLe={MAINTENANT.toISOString()}
        paiementEnLigneBranche
        editable
        actions={{ envoyer: rien, apercu: rien, changerLignes: rien, reessayer: rien }}
      />
    </ApercuBureau>
  );
}
