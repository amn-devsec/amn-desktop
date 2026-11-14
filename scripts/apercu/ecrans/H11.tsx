/**
 * APERÇU « H11 » — Documents, dans l'état de l'image H11 : l'intercalaire Contrats (24), le « Contrat de maintenance
 * Menna » ouvert, ses trois versions. Rendu par la VRAIE vue (`VueDocuments`), composée par la VRAIE logique
 * (`composerDocuments`) sur des données FICTIVES de bac à sable : noms, dates et nombres sont ceux de la maquette.
 *
 *   npm run apercu -- H11
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueDocuments } from '../../../src/refonte/ecrire/ecrans/h11/VueDocuments';
import { composerDocuments, type FichierRange } from '../../../src/refonte/ecrire/ecrans/h11/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/h11/i18n';

const MAINT = '2026-10-30T09:42:00Z';
const f = (id: string, nom: string, sous: string, at: string, extra: Partial<FichierRange> = {}): FichierRange => ({ id, nom, sous, typeMetier: 'Contrats', tailleOctets: 300_000, modifieAt: at, archive: false, extension: 'PDF', ...extra });
const fichiers: FichierRange[] = [
  f('c1', 'Contrat de maintenance Menna', 'Menna Conseil · 28 oct.', '2026-10-28T10:00:00Z', { demande: { etat: 'Signée' } }),
  f('c2', 'Mandat de gestion', 'Cabinet Roux · 30 oct.', '2026-10-28T09:00:00Z', { demande: { etat: 'Ouverte' } }),
  f('c3', 'Accord de confidentialité', 'Studio Nova · 27 oct.', '2026-10-27T10:00:00Z', { demande: { etat: 'Signée' } }),
  f('c4', 'Avenant de prestation', 'Medina Services · 24 oct.', '2026-10-24T10:00:00Z', { demande: { etat: 'Envoyée' } }),
  f('c5', 'Contrat d’audit', 'Roux Santé · 14 oct.', '2026-10-14T10:00:00Z', { demande: { etat: 'Signée' } }),
  f('c6', 'Contrat de maintenance', 'Boulangerie Léo · échéance 1er déc.', '2025-12-01T10:00:00Z', { echeance: '2026-12-01' }),
  f('c7', 'Contrat d’infogérance', 'Parc Sud · 3 mars 2025', '2025-03-03T10:00:00Z', { extension: 'DOC', demande: { etat: 'Signée' } }),
  f('c8', 'Contrat de maintenance', 'Dupont · 12 févr. 2025', '2025-02-12T10:00:00Z', { demande: { etat: 'Signée' } }),
  ...Array.from({ length: 16 }, (_, i) => f(`x${i}`, `Contrat ${i}`, '—', `2025-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`)),
];
const types = ['Contrats', 'Factures', 'Clients', 'Modèles'];

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerDocuments({ langue: 'fr', maintenant: MAINT, fichiers, types, type: 'Contrats', selection: 'c1', recherche: '', utiliseOctets: 42e9, quotaOctets: 200e9, octetsLisibles: (n) => `${Math.round(n / 1e9)} Go` });
  // Les onglets de l'image : les compteurs sont ceux de la maquette (le jeu fictif n'a que des contrats).
  const onglets = [{ cle: 'Contrats', libelle: 'Contrats', compteur: 24 }, { cle: 'Factures', libelle: 'Factures', compteur: 112 }, { cle: 'Clients', libelle: 'Clients', compteur: 38 }, { cle: 'Modèles', libelle: 'Modèles', compteur: 9 }];
  return (
    <ApercuBureau famille="ecrire" sousPage="binder" fil={['Écrire et retenir', 'Documents']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueDocuments
        titre="Documents"
        sousTitre="Ton classeur d’équipe · 183 documents rangés par intercalaire, chaque version gardée"
        libelles={libellesDe(tm as never)}
        onTeleverser={() => undefined}
        onDossier={() => undefined}
        onglets={onglets}
        ongletActif="Contrats"
        onOnglet={() => undefined}
        recherche={{ valeur: '', onChange: () => undefined }}
        liste={{ ...v.liste, sous: '24 documents · 1 à renouveler bientôt', tri: 'Récents', autres: '16 autres contrats' }}
        detail={{
          nom: 'Contrat de maintenance Menna.pdf',
          meta: 'PDF · 4 pages · 214 Ko · propriétaire Mohamed',
          actions: [{ cle: 'ouvrir', libelle: 'Ouvrir', onClick: () => undefined }, { cle: 'partager', libelle: 'Partager', onClick: () => undefined }, { cle: 'signer', libelle: 'Envoyer à signer', onClick: () => undefined }, { cle: 'telecharger', libelle: '', onClick: () => undefined }],
          pages: [{ numero: 1, actif: true }, { numero: 2, actif: false }, { numero: 3, actif: false }, { numero: 4, actif: false }],
          papier: (
            <div className="ec-h11__feuille">
              <span>AMN DevSec · N° 2026-031</span>
              <h3>Contrat de maintenance</h3>
              <span>Entre AMN DevSec et Menna Conseil</span>
              {[['Article 2 · Prix', '320 € HT par mois'], ['Article 3 · Durée', '12 mois, dès le 1er nov. 2026'], ['Article 4 · Renouvellement', 'tacite, préavis de 2 mois'], ['Article 7 · Données', 'clause RGPD, sous-traitance']].map(([a, b]) => (
                <div key={a} className="ec-h11__article">
                  <span>{a}</span>
                  <strong>{b}</strong>
                </div>
              ))}
            </div>
          ),
          faits: {
            entete: 'Ce qu’il faut savoir',
            sous: 'Relevé par Ajmani, vérifié par Mohamed le 28 oct.',
            items: [
              { repere: 1, libelle: 'Parties', valeur: 'AMN DevSec et Menna Conseil', mention: null, note: null },
              { repere: 2, libelle: 'Prix', valeur: '320 € HT par mois · 3 840 € par an', mention: null, note: null },
              { repere: 3, libelle: 'Durée', valeur: '12 mois, jusqu’au 31 oct. 2027', mention: null, note: null },
              { repere: 4, libelle: 'Renouvellement', valeur: 'Tacite, préavis avant le 31 août 2027', mention: 'rappel créé', note: null },
              { repere: 5, libelle: 'Données', valeur: 'Clause RGPD ajoutée en version 3', mention: null, note: null },
            ],
            partage: 'Partagé avec Menna, lecture seule · lien valable 30 jours',
          },
          versions: {
            entete: 'Versions',
            sous: 'conservées 90 jours, rien n’est écrasé',
            items: [
              { numero: 1, quand: '24 oct.', auteur: 'Mohamed', note: 'Créé depuis le modèle', actuelle: false },
              { numero: 2, quand: '27 oct.', auteur: 'Aaron', note: 'Prix revu : 290 € → 320 €', actuelle: false },
              { numero: 3, quand: '28 oct.', auteur: 'Mohamed', note: 'Article 7 ajouté', actuelle: true },
            ],
            signee: { libelle: 'Signé · 28 oct. 16:20', qui: 'par les 2 parties' },
          },
        }}
      />
    </ApercuBureau>
  );
}
