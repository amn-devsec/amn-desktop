/**
 * APERÇU « H12 » — Signatures, dans l'état de l'image H12 : le devis D-2026-114 ouvert, un signataire a signé, l'autre
 * attend. Rendu par la VRAIE vue (`VueSignatures`), composée par la VRAIE logique (`composerSignatures`) sur des données
 * FICTIVES de bac à sable : noms, dates et montants sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- H12
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueSignatures } from '../../../src/refonte/ecrire/ecrans/h12/VueSignatures';
import { composerSignatures, type DemandeAffichee, type SignataireAffiche } from '../../../src/refonte/ecrire/ecrans/h12/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/h12/i18n';

const MAINT = '2026-10-30T09:42:00Z';
const s = (id: string, ordre: number, nom: string, fonction: string, statut: SignataireAffiche['statut'], envoyeAt: string | null, ouvertAt: string | null, signeAt: string | null, role: 'signataire' | 'copie' = 'signataire'): SignataireAffiche => ({ id, ordre, role, statut, envoyeAt, ouvertAt, signeAt, nom, fonction });
const d = (id: string, titre: string, client: string, envoyeAt: string, signataires: SignataireAffiche[], extra: Partial<DemandeAffichee> = {}): DemandeAffichee => ({ id, titre, client, envoyeAt, devis: true, signataires, relancesEnvoyees: [], ...extra });

const demandes: DemandeAffichee[] = [
  d('d1', 'Contrat de maintenance…', 'Menna Conseil', '2026-10-27T09:00:00Z', [s('a', 1, 'Aaron Sy', 'gérant', 'Signé', '2026-10-27T09:00:00Z', '2026-10-27T09:01:00Z', '2026-10-28T09:02:00Z'), s('b', 2, 'Menna', 'dirigeante', 'Signé', '2026-10-27T09:02:00Z', '2026-10-27T10:00:00Z', '2026-10-28T09:03:00Z')]),
  d('d2', 'Devis D-2026-114', 'Menna Conseil', '2026-10-30T09:40:00Z', [s('a', 1, 'Aaron Sy', 'AMN DevSec, gérant', 'Signé', '2026-10-30T09:40:00Z', '2026-10-30T09:41:00Z', '2026-10-30T09:44:00Z'), s('b', 2, 'Menna', 'Menna Conseil, dirigeante', 'Ouvert', '2026-10-30T09:45:00Z', '2026-10-31T17:40:00Z', null), s('c', 3, 'Léa Martin', 'comptable', 'En attente', '2026-10-30T09:46:00Z', null, null, 'copie')], {
    texteDeRelance: 'Bonjour Menna, le devis D-2026-114 attend votre signature, il ne vous faut qu’une minute. Je reste disponible si une ligne vous pose question. Belle journée, Aaron',
  }),
  d('d3', 'Mandat de gestion', 'Cabinet Roux', '2026-10-28T09:00:00Z', [s('a', 1, 'Roux', 'dirigeant', 'Ouvert', '2026-10-28T09:00:00Z', '2026-10-28T10:00:00Z', null)]),
  d('d4', 'Avenant de prestation', 'Medina Services', '2026-10-27T09:00:00Z', [s('a', 1, 'Medina', 'directeur', 'En attente', '2026-10-27T09:00:00Z', null, null)]),
  d('d5', 'Accord de confidentialité', 'Studio Nova', '2026-10-26T09:00:00Z', [s('a', 1, 'Nova', 'gérant', 'Signé', '2026-10-26T09:00:00Z', '2026-10-26T10:00:00Z', '2026-10-27T11:00:00Z')]),
];

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerSignatures({ langue: 'fr', maintenant: MAINT, demandes, choisie: 'd2', relanceActive: true });
  return (
    <ApercuBureau famille="ecrire" sousPage="remoteSign" fil={['Écrire et retenir', 'Signatures']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueSignatures
        {...v}
        titre="Signatures"
        sousTitre="3 demandes attendent une signature · tes devis sont signés en 1,8 jour en moyenne, belle régularité"
        libelles={libellesDe(tm as never)}
        onEnvoyer={() => undefined}
        onModeles={() => undefined}
        onChoisir={() => undefined}
        editeur={{
          titre: 'Devis D-2026-114',
          sous: 'Page 2 sur 2 · 5 champs posés, 3 à remplir par Menna',
          onglets: [{ cle: 'placer', libelle: 'Placer', actif: true }, { cle: 'verifier', libelle: 'Vérifier', actif: false }, { cle: 'apercu', libelle: 'Aperçu signataire', actif: false }],
          zoom: '100 %',
          champs: [{ cle: 'signature', libelle: 'Signature' }, { cle: 'paraphe', libelle: 'Paraphe' }, { cle: 'date', libelle: 'Date' }, { cle: 'nom', libelle: 'Nom' }, { cle: 'case', libelle: 'Case' }, { cle: 'texte', libelle: 'Texte' }],
          pour: [{ nom: 'Aaron', coche: false }, { nom: 'Menna', coche: false }],
          papier: (
            <div>
              <strong>Conditions de paiement</strong>
              <p>Total HT 6 940,00 € · TVA 20 % 1 388,00 € · Total TTC 8 328,00 €</p>
              <strong>Bon pour accord</strong>
              <p>Signature précédée de la date, devis valable 30 jours.</p>
              <p>Pour AMN DevSec : Aaron Sy, gérant — Pour Menna Conseil : Menna, dirigeante</p>
            </div>
          ),
        }}
      />
    </ApercuBureau>
  );
}
