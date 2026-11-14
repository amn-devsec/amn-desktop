/**
 * APERÇU « ME04 » — Archives, dans l'état de l'image ME04 : 1 482 éléments, la recherche « Menna » (15 résultats), la
 * suggestion de compression. Rendu par la VRAIE vue (`VueArchives`), composée par la VRAIE logique (`composerArchives`)
 * sur des données FICTIVES de bac à sable : noms, nombres et dates sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- ME04
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueArchives } from '../../../src/refonte/ecrire/ecrans/me04/VueArchives';
import { composerArchives } from '../../../src/refonte/ecrire/ecrans/me04/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/me04/i18n';
import { REGLES_PAR_DEFAUT, type ElementArchive } from '../../../src/refonte/ecrire/archives';

const parMois: Record<string, number> = { '2026-10': 64, '2026-09': 88, '2026-08': 71, '2026-07': 55, '2026-06': 49, '2026-05': 62, '2026-04': 58, '2026-03': 60, '2026-02': 47, '2026-01': 58 };
const elements: ElementArchive[] = [];
for (const [mois, n] of Object.entries(parMois)) for (let i = 0; i < n; i += 1) elements.push({ id: `${mois}-${i}`, titre: `Élément ${mois} ${i}`, type: 'Document', tailleOctets: 1_000_000, archiveLe: `${mois}-${String(1 + (i % 27)).padStart(2, '0')}` });
for (let i = 0; i < 718; i += 1) elements.push({ id: `a25-${i}`, titre: `Ancien ${i}`, type: 'Document', tailleOctets: 1_000_000, archiveLe: `2025-${String(1 + (i % 12)).padStart(2, '0')}-10` });
for (let i = 0; i < 152; i += 1) elements.push({ id: `a24-${i}`, titre: `Plus ancien ${i}`, type: 'Document', tailleOctets: 1_000_000, archiveLe: `2024-${String(1 + (i % 12)).padStart(2, '0')}-10` });
const menna: ElementArchive[] = [
  { id: 'r1', titre: 'Facture F-1932', type: 'Facture', tailleOctets: 88_000, archiveLe: '2026-10-15', contenu: 'Menna Conseil · 1 240 € · payée le 14 oct. 2025' },
  { id: 'r2', titre: 'Conversation « Réseau invités »', type: 'Message', tailleOctets: 1_100_000, archiveLe: '2026-10-06', contenu: '18 messages, le dernier en avril · Pouvez-vous séparer le Wi… Menna' },
  { id: 'r3', titre: 'Contrat Menna 2025', type: 'Document', tailleOctets: 412_000, archiveLe: '2026-09-12', contenu: '…entre AMN DevSec et Menna Conseil, p…' },
  { id: 'r4', titre: 'Avenant n° 1 au contrat', type: 'Document', tailleOctets: 96_000, archiveLe: '2026-09-12', contenu: '…ajout de la supervision du réseau invités chez Menna…' },
  { id: 'r5', titre: 'Devis D-2026-071', type: 'Devis', tailleOctets: 64_000, archiveLe: '2026-09-03', contenu: 'Menna Conseil · accepté le 2 sept., facturé ensuite' },
  ...Array.from({ length: 10 }, (_, i) => ({ id: `rr${i}`, titre: `Pièce Menna ${i}`, type: 'Document' as const, tailleOctets: 50_000, archiveLe: `2025-0${1 + (i % 8)}-10`, contenu: 'Menna' })),
];
const tous = [...menna, ...elements];

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerArchives(
    { langue: 'fr', maintenant: '2026-10-30T09:42:00Z', elements: tous, saisie: 'Menna', dansLeContenu: true, type: 'Tout', annee: 2026, visibles: 5, regles: REGLES_PAR_DEFAUT, restaurations: [{ id: 'x1', at: '2026-10-14T10:00:00Z', nom: 'Devis D-2025-088', detail: 'rouvert par Mohamed' }, { id: 'x2', at: '2026-10-02T10:00:00Z', nom: 'Photos chantier Dupont', detail: 'demandées par le client' }, { id: 'x3', at: '2026-09-02T10:00:00Z', nom: 'x', detail: 'x' }], quotaOctets: 20_000_000_000, octetsLisibles: (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(1).replace('.', ',')} Go` : n >= 1e6 ? `${(n / 1e6).toFixed(1).replace('.', ',')} Mo` : `${Math.round(n / 1e3)} Ko`) },
    { onType: () => undefined, onSuite: () => undefined, onAnnee: () => undefined },
  );
  return (
    <ApercuBureau famille="ecrire" sousPage="archives" fil={['Écrire et retenir', 'Archives']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueArchives
        {...v}
        titre="Archives"
        sousTitre="Tout est gardé, rien n’encombre · 1 482 éléments, retrouvés par date ou par mot"
        libelles={libellesDe(tm as never)}
        onRegles={() => undefined}
        onArchiver={() => undefined}
        quota={{ pourcent: 11, libelle: '2,1 Go sur 20 Go', detail: 'Il te reste 17,9 Go. Aucune action nécessaire.', ton: 'neutre' }}
        suggestion={{ titre: 'Libérer de la place', texte: 'Les photos de chantier de 2025 pèsent 1,2 Go. Je peux les compresser et garder les originaux 30 jours.', oui: 'Compresser', non: 'Non', onOui: () => undefined, onNon: () => undefined }}
      />
    </ApercuBureau>
  );
}
