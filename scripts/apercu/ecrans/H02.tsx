/**
 * APERÇU « H02 » — Ma journée · Tâches, matrice (v4), sur des tâches FICTIVES posées ici (le dépôt n'a ni échéance, ni urgence).
 *
 *   npm run apercu -- H02
 */
import React, { useState } from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { VueTaches, type TacheCarte } from '../../../src/refonte/journee/ecrans/H02/VueTaches';
import { ApercuBureau } from '../coquille';

const P = { A: { initiale: 'A', nom: 'Aaron' }, M: { initiale: 'M', nom: 'Mohamed' }, R: { initiale: 'R', nom: 'Riyad' } };
const t = (id: string, titre: string, o: Partial<TacheCarte> & { qui?: keyof typeof P } = {}): TacheCarte => {
  const { qui = 'A', ...reste } = o;
  return { id, titre, echeance: null, creeLe: `2026-10-0${id.length % 9}`, personne: P[qui], etiquettes: [], ...reste };
};
const TACHES: TacheCarte[] = [
  t('a1', 'Valider le tableau de bord de Menna', { echeance: '2026-10-30', heure: '17:00', urgente: true, importante: true }),
  t('a2', 'Relancer la facture F-2041', { echeance: '2026-10-28', importante: true, etiquettes: ['Menna'] }),
  t('a3', 'Envoyer le devis à la Boulangerie Léo', { echeance: '2026-10-29', importante: true }),
  t('a4', 'Préparer la facturation d’octobre', { echeance: '2026-10-30', heure: '14:00', importante: true, etiquettes: ['Argent'], qui: 'M' }),
  t('b1', 'Planifier l’atelier de mardi', { echeance: '2026-11-03', importante: true, sousTaches: 3 }),
  t('b2', 'Mettre à jour les tarifs 2027', { echeance: '2026-11-02', importante: true, etiquettes: ['Argent'], qui: 'R' }),
  t('b3', 'Commander les pièces du chantier Dupont', { echeance: '2026-11-02', importante: true, qui: 'M' }),
  t('c1', 'Répondre à Medina sur les accès', { echeance: '2026-10-30', heure: 'ce soir', urgente: true, confieeA: P.R }),
  t('c2', 'Réserver la salle de l’atelier', { echeance: '2026-11-02', urgente: true, confieeA: P.R }),
  t('c3', 'Imprimer les supports de l’atelier', { echeance: '2026-11-03', urgente: true, qui: 'M' }),
  t('d1', 'Trier les photos du chantier Dupont'),
  t('d2', 'Lire la veille sécurité de la semaine'),
  t('d3', 'Ranger le dossier des factures 2025'),
];
const FAITES: TacheCarte[] = [['Envoyer le contrat 2027', '10:20'], ['Appeler le comptable', '9:55'], ['Valider les maquettes Menna', '9:10'], ['Relire le devis Dupont', '8:50'], ['Trier la boîte de réception', '8:20']]
  .map(([titre, h], i) => t(`f${i}`, titre, { faite: true, faiteA: h }));

export default function Apercu() {
  const [vue, setVue] = useState<'matrice' | 'liste'>('matrice');
  return (
    <ApercuBureau famille="jour" sousPage="tasks" fil={['Ma journée', 'Tâches']}>
      <VueTaches
        aujourdhui="2026-10-30" taches={TACHES} faitesAujourdhui={FAITES} compteurs={{ moi: 13, equipe: 21 }} perimetre="moi" vue={vue}
        duJour={{ faites: 5, total: 8 }} serie={{ jours: 6, prochainPalier: 10, resteAvantPalier: 4 }} finDeJournee="18 h" apresLaFin={false}
        tempsLibre={{ duree: '2 h 30', quand: 'lundi matin' }} retouche={null} saisieInitiale="Appeler Menna lundi 10 h, important"
        suggestion={{ n: 2, nom: 'Riyad', initiale: 'R', message: '« Peux-tu répondre à Medina et réserver la salle de l’atelier ? Tout est dans les fiches. »' }}
        onPerimetre={() => undefined} onVue={setVue} onCocher={() => undefined} onDeplacer={() => undefined} onCreer={() => undefined}
      />
    </ApercuBureau>
  );
}
