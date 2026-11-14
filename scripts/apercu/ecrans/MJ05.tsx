/**
 * APERÇU « MJ05 » — Rappels (LOT-01), tel que sur l'image : vendredi 30 oct. 2026, 10:42.
 *
 *   npm run apercu -- MJ05
 *
 * Rendue par les VRAIS composants de l'écran (`VueRappels`) sur le modèle `modeleRappels`. Les rappels, les récurrents, les réglages de prévenance
 * et le rappel proposé par Ajmani sont FABRIQUÉS ICI d'après le tableau de la fiche MJ05 (données fictives : Menna Conseil, Medina Services,
 * adresse et montants inventés) ; rien de tout cela n'existe dans l'application, qui n'a pas de rappels.
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueRappels, type ActionsRappels } from '../../../src/refonte/journee/rappels/VueRappels';
import { modeleRappels, type RappelEntree } from '../../../src/refonte/journee/rappels/modele';
import { instantParis } from '../../../src/refonte/donnees/outils';

const MAINTENANT = instantParis('2026-10-30', '10:42');
const q = (j: string, h: string): string => new Date(instantParis(j, h)).toISOString();
const R = (o: Partial<RappelEntree> & Pick<RappelEntree, 'id' | 'titre' | 'quandAt'>): RappelEntree => ({ contexte: '', personne: 'a', initiale: 'A', fait: false, faitAt: null, avanceeMin: 15, ...o });
const rappels: RappelEntree[] = [
  R({ id: 'r1', titre: 'Sauvegarde hebdomadaire', quandAt: q('2026-10-30', '08:00'), fait: true, faitAt: q('2026-10-30', '08:00'), automatique: 'automatique, Riyad', personne: 'r', initiale: 'R' }),
  R({ id: 'r2', titre: 'Préparer le stand-up', quandAt: q('2026-10-30', '09:15'), fait: true, faitAt: q('2026-10-30', '09:15') }),
  R({ id: 'r3', titre: 'Relancer la facture F-2041', contexte: 'Menna Conseil · 1 240 € · échue depuis le 26 oct.', quandAt: q('2026-10-30', '10:00'), lien: 'Ouvrir la facture' }),
  R({ id: 'r4', titre: 'Partir pour le rendez-vous Menna', contexte: '18 rue des Lilas · 12 min à pied, le dossier est prêt', quandAt: q('2026-10-30', '10:45') }),
  R({ id: 'r5', titre: 'Appeler le comptable', contexte: 'Question sur la TVA du trimestre', quandAt: q('2026-10-30', '14:00') }),
  R({ id: 'r6', titre: 'Envoyer le contrat 2027', contexte: 'Medina Services · à signer avant le 6 nov.', quandAt: q('2026-10-30', '17:00'), personne: 'm', initiale: 'M' }),
  R({ id: 'r7', titre: 'Changer les piles de l’alarme du local', contexte: 'Le voyant clignote depuis mercredi', quandAt: q('2026-10-31', '10:00') }),
  R({ id: 'r8', titre: 'Relancer la facture F-2044', contexte: 'Medina Services · 4 200 €, échéance mardi 3 nov.', quandAt: q('2026-11-02', '09:00'), propose: true }),
  R({ id: 'r9', titre: 'Renouveler le certificat du site', contexte: 'Expire dans 12 jours, renouvellement en 5 minutes', quandAt: q('2026-11-03', '08:30'), personne: 'r', initiale: 'R' }),
  // L'historique du mois, pour « Tenus à temps » : 22 tenus sur 24 échus ce mois (dont les rappels du jour) et 22 sur 25 (88 %) le mois précédent.
  ...Array.from({ length: 20 }, (_, i) => R({ id: `h${i}`, titre: `Rappel du mois ${i}`, quandAt: q('2026-10-05', '09:00'), fait: true, faitAt: q('2026-10-05', '09:10') })),
  R({ id: 'hl', titre: 'Rappel du mois, tenu tard', quandAt: q('2026-10-12', '09:00'), fait: true, faitAt: q('2026-10-12', '15:00') }),
  ...Array.from({ length: 25 }, (_, i) => R({ id: `p${i}`, titre: `Rappel de septembre ${i}`, quandAt: q('2026-09-15', '09:00'), fait: true, faitAt: q('2026-09-15', i < 22 ? '09:10' : '14:00') })),
];
const modele = modeleRappels({ rappels, maintenant: MAINTENANT, moi: 'a', calmes: { actif: true, debut: '20:00', fin: '08:00' } });
const rien = () => undefined;
const ACTIONS: ActionsRappels = { nouveau: rien, recurrents: rien, filtre: rien, ouvrir: rien, fait: rien, reporter: rien, programmer: rien, non: rien, ouvrirLien: rien, ouvrirRecurrent: rien, calmes: rien, reportAuto: rien, reessayer: rien, relances: rien, taches: rien };
const RECURRENTS = [
  { id: 'c1', nom: 'Sauvegarde', rythme: 'ven. 8:00', initiale: 'R' }, { id: 'c2', nom: 'Relances factures', rythme: 'lun. 9:00', initiale: 'M' },
  { id: 'c3', nom: 'Mises à jour des postes', rythme: 'mar. 8:00', initiale: 'R' }, { id: 'c4', nom: 'Loyer du local', rythme: 'le 5 du mois', initiale: 'M' },
  { id: 'c5', nom: 'Point TVA', rythme: 'le 10 du mois', initiale: 'M' }, { id: 'c6', nom: 'Ronde du soir', rythme: 'chaque jour 18:00', initiale: 'R' },
  { id: 'c7', nom: 'Revue des accès', rythme: 'le 1er du mois', initiale: 'A' }, { id: 'c8', nom: 'Bilan de la semaine', rythme: 'ven. 16:00', initiale: 'A' },
];

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="rappels" fil={['Ma journée', 'Rappels']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueRappels statut="pret" modele={modele} heure="10:42" demain="samedi 31" filtre="tous" recurrents={RECURRENTS} prevenu={{ defaut: '15 min avant', canal: 'Application et mobile', calmes: { actif: true, plage: '20:00 à 08:00' }, reportAuto: false }} actions={ACTIONS} />
    </ApercuBureau>
  );
}
