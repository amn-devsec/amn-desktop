/**
 * APERÇU « ME02 » — Rédaction et traduction, dans l'état de l'image ME02 : la « Relance devis Medina » avec ses
 * corrections. Rendu par la VRAIE vue (`VueRedaction`), composée par la VRAIE logique (`composerRedaction`) sur des
 * données FICTIVES de bac à sable : noms, dates et textes sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- ME02
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueRedaction } from '../../../src/refonte/ecrire/ecrans/me02/VueRedaction';
import { composerRedaction, type BrouillonDuTexte } from '../../../src/refonte/ecrire/ecrans/me02/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/me02/i18n';

const brouillons: BrouillonDuTexte[] = [
  {
    id: 'b1',
    titre: 'Votre devis pour le parc informatique',
    source: null,
    publie: false,
    morceaux: [
      { type: 'texte', texte: 'Bonjour Karim,\n\nJ’espère que votre semaine se passe bien. ' },
      { type: 'correction', retire: 'Je me permets de revenir vers vous', ajoute: 'Je reviens vers vous', raison: 'plus court', explication: 'Plus direct' },
      { type: 'texte', texte: ' au sujet du devis D-2026-117, envoyé le 24 octobre, pour le renouvellement de vos postes.\n\nSi certains points méritent d’être précisés, je serais ravi d’en parler avec vous ' },
      { type: 'correction', ajoute: 'lors d’un court appel', raison: 'plus clair', explication: 'Ajoute un créneau précis : jeudi 5 novembre à 10 h. Aaron est libre.' },
      { type: 'texte', texte: '.\n\n' },
      { type: 'correction', ajoute: 'Nous pouvons démarrer dès le 16 novembre', raison: 'plus clair', explication: 'Le 16 novembre est libre dans le planning de l’équipe.', engagement: false },
      { type: 'texte', texte: ' si le devis vous convient.\n\nBien cordialement,\n\nAaron, AMN DevSec' },
    ],
  },
  { id: 'b2', titre: 'Présentation · anglais', source: null, publie: false, morceaux: [{ type: 'texte', texte: 'Hello' }] },
  { id: 'b3', titre: 'Annonce de l’atelier', source: null, publie: true, morceaux: [{ type: 'texte', texte: 'Atelier' }] },
];

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerRedaction({ langue: 'fr', brouillons, choisi: 'b1', longueur: 'court', enregistreA: '10:38' }, { onChoisir: () => undefined, onDecider: () => undefined });
  const { courant, ...base } = v;
  void courant;
  return (
    <ApercuBureau famille="ecrire" sousPage="writing" fil={['Écrire et retenir', 'Rédaction et traduction']} ajmani="Dis ce que tu veux écrire, Ajmani rédige">
      <VueRedaction
        {...base}
        titre="Rédaction et traduction"
        sousTitre="Écrire mieux, plus vite, dans toutes les langues · Ajmani propose, tu décides"
        libelles={libellesDe(tm as never)}
        onNouveau={() => undefined}
        onHistorique={() => undefined}
        onOnglet={() => undefined}
        mode={{ valeur: 'rediger', options: [{ cle: 'rediger', libelle: 'Rédiger' }, { cle: 'traduire', libelle: 'Traduire' }], onChange: () => undefined }}
        reglages={{
          pour: { nom: 'Karim Medina', adresse: 'Medina Services' },
          ton: { titre: 'Ton', options: [{ cle: 'c', libelle: 'Chaleureux', actif: false }, { cle: 'o', libelle: 'Courtois', actif: true }, { cle: 'd', libelle: 'Direct', actif: false }] },
          longueur: { titre: 'Longueur', options: [{ cle: 'c', libelle: 'Court', actif: true }, { cle: 'm', libelle: 'Moyen', actif: false }, { cle: 'l', libelle: 'Long', actif: false }] },
          langue: { titre: 'Langue', valeur: 'Français', versions: 'Versions prêtes : anglais, arabe' },
          pieceJointe: { titre: 'Pièce jointe', nom: 'Devis D-2026-117.pdf' },
        }}
        lettre={{ ...base.lettre!, entetes: [{ libelle: 'À', valeur: 'Karim Medina  k.medina@medina-services.fr' }, { libelle: 'Objet', valeur: 'Votre devis pour le parc informatique' }], onEnvoyer: () => undefined, onTraduire: () => undefined }}
        marge={{ ...base.marge, traduction: { titre: 'Version anglaise prête', detail: 'Même ton, relue par Ajmani', voir: 'Voir' } }}
      />
    </ApercuBureau>
  );
}
