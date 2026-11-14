/**
 * APERÇU « H04 » — Ma journée · Bilan de la semaine (v4), sur une semaine FICTIVE posée ici (semaine 44 : du lundi 26 au vendredi 30 octobre 2026).
 *
 *   npm run apercu -- H04
 */
import React, { useState } from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { VueBilan } from '../../../src/refonte/journee/ecrans/H04/VueBilan';
import { ApercuBureau } from '../coquille';

export default function Apercu() {
  const [cloture, setCloture] = useState({ relu: true, decide: false, mot: false });
  return (
    <ApercuBureau famille="jour" sousPage="weekly" fil={['Ma journée', 'Bilan de la semaine']}>
      <VueBilan
        prenom="Aaron" semaine={44} du="26" au="30 octobre" heureDuCalcul="10:40" ton="solide"
        taches={{ n: 12, ecart: 2, semainePrecedente: 10 }} encaisse={{ cents: 482_000, ecartPct: 12 }} clients={{ n: 3, ecart: 1 }}
        boiteAZero={{ jours: 4, enCours: true }} meilleurJour={{ type: 'aujourdhui' }}
        ruban={[
          { jour: 'LUN 26', faites: 2, meilleur: false, moment: { titre: 'Atelier chez Menna', detail: '1 rendez-vous client' } },
          { jour: 'MAR 27', faites: 3, meilleur: false, moment: { titre: 'Sauvegarde testée', detail: 'par Mohamed' } },
          { jour: 'MER 28', faites: 1, meilleur: false, moment: { titre: 'Chantier Dupont', detail: '3 postes posés' } },
          { jour: 'JEU 29', faites: 1, meilleur: false, moment: { titre: 'Démo Cabinet Roux', detail: '3 rendez-vous' } },
          { jour: 'VEN 30', faites: 5, meilleur: true, moment: { titre: 'Menna a payé', detail: '' } },
        ]}
        reussites={[
          { titre: 'Facture Menna encaissée', detail: '2 400 €, trois jours avant l’échéance', icone: 'euro' },
          { titre: 'Sauvegarde nocturne en place', detail: 'Mohamed, restauration testée', icone: 'base' },
          { titre: 'Devis Boulangerie Léo prêt', detail: 'à envoyer, réponse attendue lundi', icone: 'document' },
          { titre: 'Boîte de réception à zéro', detail: 'quatre jours de suite, ton record', icone: 'courrier' },
        ]}
        glisse={[
          { id: 'g1', titre: 'Relancer la facture F-2041', prevue: 'mer. 28', propose: 'Lun. 2' },
          { id: 'g2', titre: 'Envoyer le devis à la Boulangerie Léo', prevue: 'jeu. 29', propose: 'Lun. 2' },
          { id: 'g3', titre: 'Mettre à jour les tarifs 2027', prevue: 'jeu. 29', propose: 'Lun. 2' },
        ]}
        glisseQuand="lundi"
        palier={{ titre: 'Série de 5 jours, mercredi', detail: '10 factures, en octobre', vers: 10, resteJours: 4, progression: 0.6 }}
        cloture={cloture}
        precedentes={{ cloturees: true, moyenne: { taches: 10, cents: 390_000 }, semaines: [
          { s: 43, plage: '19 au 23 oct.', taches: 10, cents: 364_000 }, { s: 42, plage: '12 au 16 oct.', taches: 11, cents: 512_000 }, { s: 41, plage: '5 au 9 oct.', taches: 9, cents: 298_000 },
        ] }}
        suggestion={{ prevues: 14, plus: 2, deplacer: 2 }} vide={false}
        onCocher={(c) => setCloture((s) => ({ ...s, [c]: !s[c] }))} onCloturer={() => undefined}
      />
    </ApercuBureau>
  );
}
