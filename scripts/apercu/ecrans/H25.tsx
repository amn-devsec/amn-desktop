/**
 * APERÇU « H25 » — Ma journée · Tableau de bord, mode édition (v4), sur des données FICTIVES posées ici (le jeu de SIM
 * ne fournit ni la courbe, ni les utilisateurs actifs par jour).
 *
 *   npm run apercu -- H25
 */
import React, { useState } from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { DISPOSITION_PAR_DEFAUT } from '../../../src/refonte/journee/ecrans/H25/TableauDeBordRefonte';
import { VueTableauDeBord, type DonneesTableau } from '../../../src/refonte/journee/ecrans/H25/VueTableauDeBord';
import type { Widget } from '../../../src/refonte/journee/grille';
import { ApercuBureau } from '../coquille';

const courbe = Array.from({ length: 30 }, (_, i) => ({ etiquette: `${i + 1}`, valeur: Math.round((5000 + i * 280 + Math.sin(i / 3) * 500) * 100) }));
const DONNEES: DonneesTableau = {
  ca: { cents: 1_340_000, ecartPct: 9, courbe },
  objectif: { cents: 1_340_000, objectifCents: 1_600_000, avanceJours: 2 },
  taches: { faites: 5, total: 8, serie: 6 },
  agenda: { heure: '11:00', delai: '18 min', titre: 'Rendez-vous Menna' },
  tickets: {
    visibles: [
      { id: 't1', titre: 'Données utilisateurs absentes', ref: 'H-118', client: 'Menna', delai: '6 h 18', urgent: true },
      { id: 't2', titre: 'Paiements Stripe refusés', ref: 'H-121', client: 'Medina', delai: '12 min', urgent: true },
      { id: 't3', titre: 'Export CSV des factures', ref: 'H-119', client: 'Menna', delai: '3 nov.' },
      { id: 't4', titre: 'Texte de la page d’accueil', ref: 'H-116', client: 'Menna', delai: '4 nov.' },
    ],
    urgents: 2, ouverts: 4,
  },
  utilisateurs: { total: 214, ecartPct: 8, parJour: [['V', 120], ['S', 128], ['D', 118], ['L', 140], ['M', 150], ['M', 158], ['J', 214]].map(([lettre, n]) => ({ lettre: lettre as string, n: n as number })) },
  factures: [
    { ref: 'F-2044', client: 'Medina Services', cents: 420_000, echeance: { type: 'dans', jours: 4 } },
    { ref: 'F-2041', client: 'Menna Conseil', cents: 124_000, echeance: { type: 'retard' } },
    { ref: 'F-2045', client: 'Cabinet Roux', cents: 143_000, echeance: { type: 'dans', jours: 6 } },
  ],
  activite: [
    { texte: 'Facture F-2038 encaissée', quand: 'auj.', ton: 'succes' },
    { texte: 'Ticket urgent résolu par Mohamed', quand: 'mar.', ton: 'info' },
    { texte: 'Nouveau devis envoyé', quand: 'lun.', ton: 'info' },
  ],
  note: 'Valider le planning de décembre avant vendredi, et prévenir Riyad',
  gardeEnOrdre: true,
};

export default function Apercu() {
  const [widgets, setWidgets] = useState<Widget[]>(DISPOSITION_PAR_DEFAUT);
  const [selection, setSelection] = useState<string | null>('utilisateurs-1');
  const [donnees, setDonnees] = useState(DONNEES);
  return (
    <ApercuBureau famille="jour" sousPage="dashboard" fil={['Ma journée', 'Tableau de bord', 'Édition']}>
      <VueTableauDeBord
        widgets={widgets} donnees={donnees} modeEdition apercu={false} etat="enregistre" selectionId={selection} retire={null} differe={false}
        onChange={setWidgets} onSelection={setSelection} onModifier={() => undefined} onTerminer={() => undefined} onAnnuler={() => undefined}
        onApercu={() => undefined} onDefaire={() => undefined} onNote={(note) => setDonnees((d) => ({ ...d, note }))}
      />
    </ApercuBureau>
  );
}
