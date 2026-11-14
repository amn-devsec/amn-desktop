/**
 * APERÇU « N01 » — Ma journée · Accueil (v4), vendredi 30 octobre 2026, 10:42, sur des données FICTIVES posées ici.
 *
 *   npm run apercu -- N01
 */
import React from 'react';
import '../../../src/refonte/creer/creer.css';
import '../../../src/refonte/journee/journee.css';
import { VueAccueil } from '../../../src/refonte/journee/ecrans/N01/VueAccueil';
import { ApercuBureau } from '../coquille';

const m = (h: number, min = 0) => h * 60 + min;

export default function Apercu() {
  return (
    <ApercuBureau famille="jour" sousPage="accueil" fil={['Ma journée', 'Accueil']}>
      <VueAccueil
        prenom="Aaron" dateEtHeure="Vendredi 30 octobre · 10:42" soir={false} minute={m(10, 42)}
        anneau={{ faites: 5, total: 8 }} hier="17:40" serie={{ jours: 6, palier: 10 }} messages={2} nbRdv={3}
        urgent={{ titre: 'Menna : données utilisateurs absentes du tableau de bord', recu: '10:12', initiale: 'M' }}
        frise={{
          rdv: [
            { id: 'r1', debut: m(9, 30), fin: m(9, 45), titre: 'Stand-up', detail: '9:30 · fait', ton: 'jour', passe: true, suivant: false },
            { id: 'r2', debut: m(11), fin: m(12), titre: 'Rendez-vous Menna', detail: '11:00 · dans 18 min', ton: 'contacts', passe: false, suivant: true },
            { id: 'r3', debut: m(12, 30), fin: m(13, 30), titre: 'Déjeuner', detail: '12:30 · pause', ton: 'pause', passe: false, suivant: false },
            { id: 'r4', debut: m(14), fin: m(15), titre: 'Point facturation', detail: '14:00 · avec Mohamed', ton: 'argent', passe: false, suivant: false },
            { id: 'r5', debut: m(16), fin: m(16, 45), titre: 'Bilan de la semaine', detail: '16:00 · préparé par Ajmani', ton: 'jour', passe: false, suivant: false },
          ],
          rondes: [m(16, 30)],
          faites: [['Trier la boîte de réception', m(8, 20)], ['Relire le devis Dupont', m(8, 50)], ['Envoyer le contrat 2027', m(9, 10)], ['Appeler le comptable', m(9, 55)], ['Valider les maquettes Menna', m(10, 20)]].map(([titre, minute], i) => ({ id: `f${i}`, titre: titre as string, minute: minute as number })),
          avenir: [
            { id: 'a1', minute: m(14), titre: 'Préparer la facturation du mois', heure: '14:00', delai: 'dans 3 h 18', urgent: false, initiale: 'M' },
            { id: 'a2', minute: m(17), titre: 'Valider le tableau de bord de Menna', heure: 'avant 17:00', delai: '', urgent: true, initiale: 'A' },
            { id: 'a3', minute: m(18, 30), titre: 'Répondre à Medina sur les accès', heure: '18:30', delai: 'ce soir', urgent: false, initiale: 'R' },
          ],
          restantes: 3,
        }}
        argent={{ cents: 240_000, quand: 'matin', courbe: [4, 5, 5, 7, 6, 8, 9, 10], aEncaisser: 855_000, enRetard: 284_000 }}
        garde={{ enOrdre: true }}
        suggestion={{ n: 3, noms: 'Menna, Garage Benali et Studio Nova' }}
        onNouvelle={() => undefined}
      />
    </ApercuBureau>
  );
}
