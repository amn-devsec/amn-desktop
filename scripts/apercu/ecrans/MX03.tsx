/**
 * APERÇU « MX03 » — Partage de fichiers, dans l'état de l'image MX03 : six liens protégés (dont un interne à l'équipe), trois
 * transferts, la protection de tous les liens et la relance proposée à propos du devis non ouvert. Rendu par la VRAIE vue
 * (`VuePartages`), composée par la VRAIE logique (`composerPartages`) sur des données FICTIVES de bac à sable.
 *
 *   npm run apercu -- MX03
 */
import React, { useState } from 'react';
import { ApercuBureau } from '../coquille';
import { VuePartages } from '../../../src/refonte/echanger/ecrans/mx03/VuePartages';
import { composerPartages, type LienAffichable, type TransfertAffiche } from '../../../src/refonte/echanger/ecrans/mx03/composer';
import { libellesDe, traduire } from '../../../src/refonte/echanger/ecrans/mx03/i18n';
import { REGLAGES_DU_LIEN_PAR_DEFAUT } from '../../../src/refonte/echanger/partages';

const MAINT = '2026-10-30T09:42:00Z'; // 10:42 à Paris
const lien = (id: string, fichier: string, octets: number, dest: string | null, cree: string, expire: string | null, ouvertures: number, derniere: string | null, extra: Partial<LienAffichable> = {}): LienAffichable => ({ id, fichier, tailleOctets: octets, destinataire: dest, creeAt: `${cree}T09:00:00Z`, expireLe: expire, dureeJours: 30, protection: 'code par courriel', ouvertures, derniereOuvertureAt: derniere, ...extra });
const liens: LienAffichable[] = [
  lien('l1', 'Maquettes Menna.pdf', 4_200_000, 'Amina Menna', '2026-10-26', '2026-11-05', 3, '2026-10-29T10:00:00Z', { note: 'Version 3' }),
  lien('l2', 'Devis D-2026-117.pdf', 380_000, 'Karim Medina', '2026-10-24', '2026-11-01', 0, null, { note: 'Signé' }),
  lien('l3', 'Rapport audit Roux.pdf', 2_400_000, 'Claire Roux', '2026-10-27', '2026-11-11', 1, '2026-10-27T10:00:00Z', { note: 'Confidentiel' }),
  lien('l4', 'Photos chantier.zip', 48_000_000, 'Léo Martin', '2026-10-28', '2026-10-31', 2, '2026-10-30T07:00:00Z', { note: '36 images' }),
  lien('l5', 'Contrat 2027.pdf', 290_000, 'Amina Menna', '2026-10-29', '2026-11-19', 2, '2026-10-30T07:40:00Z', { note: 'Pour signature' }),
  lien('l6', 'Tarifs 2027.xlsx', 90_000, null, '2026-10-26', null, 5, '2026-10-30T09:00:00Z', { note: 'Interne', protection: 'compte', equipe: ['Aaron', 'Mohamed', 'Riyad'] }),
];
const transferts: TransfertAffiche[] = [
  { id: 't1', sens: 'envoi', at: '2026-10-30T09:40:00Z', nom: 'Photos vitrine.zip', pourcent: 72, avec: 'Léo Martin', tailleOctets: 61_000_000, secondesRestantes: 12 },
  { id: 't2', sens: 'reception', at: '2026-10-30T09:00:00Z', verification: 'verifie', nom: 'Bilan TVA septembre.pdf', pourcent: 100, avec: 'Cabinet Lemoine', tailleOctets: 500_000 },
  { id: 't3', sens: 'reception', at: '2026-10-30T08:30:00Z', verification: 'en-cours', nom: 'Visuels novembre.zip', pourcent: 34, avec: 'Agence Horizon', tailleOctets: 140_000_000 },
];

export default function Apercu() {
  const [onglet, setOnglet] = useState<'partages' | 'recus' | 'expires'>('partages');
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerPartages({ langue: 'fr', maintenant: MAINT, liens, recus: 9, onglet, transferts, quotaOctets: 20_000_000_000, reglages: REGLAGES_DU_LIEN_PAR_DEFAUT });
  return (
    <ApercuBureau famille="echanger" sousPage="partages" fil={['Échanger', 'Partage de fichiers']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VuePartages {...v} etat="normal" libelles={libellesDe(tm as never)} actions={{ onEnvoyer: () => undefined, onDossiers: () => undefined, onChoisir: () => undefined, onDocuments: () => undefined, onOnglet: setOnglet, onCopier: () => undefined, onProlonger: () => undefined, onSuggestion: () => undefined }} />
    </ApercuBureau>
  );
}
