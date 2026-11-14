import React, { useMemo } from 'react';
import { usePageCoquille } from '../../../coquille/page';
import { etatsDesCanaux } from '../../connecteurs';
import { dire } from '../../i18n';
import { composerBoite } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueBoite } from './VueBoite';

/**
 * G07 — Messagerie (la boîte des clients), branchée sur le poste. Route `/messagerie` (écran neuf du registre).
 *
 * Le poste n'a PAS de messages de clients : le courriel, WhatsApp et les SMS sont des prises de la baie de connecteurs
 * (H21, LOT-07), et la collection des messages de clients, avec leur état de tri, est sur la liste présentée à Harun
 * (STATUT §1.27 n° 4 : aucune collection synchronisée nouvelle sans son accord). Tant que rien n'est branché, l'écran dit
 * « connecteur à brancher » pour chaque canal et ne montre ni couloir, ni Boîte à zéro, ni série qui n'agiraient sur
 * rien. La vue complète est celle de l'aperçu ; elle s'allume quand la source existera. « Nouveau message » reste éteint tant qu'aucun canal n'est branché. Les échanges internes de
 * l'équipe ne passent jamais ici : ils vivent dans Canaux (MX04).
 */
export default function PageBoite() {
  const { tm, langue } = useMots();
  const maintenant = useMemo(() => new Date().toISOString(), []);
  usePageCoquille({ famille: 'echanger', sousPage: 'messagerie', miettes: [{ libelle: tm('titre') }] });

  // Aucune prise de la baie n'est lue au poste : tous les canaux sont « à brancher ».
  const canaux = etatsDesCanaux([], Date.parse(maintenant));
  const v = composerBoite({
    langue,
    maintenant,
    prenom: '',
    messages: [],
    gestes: [],
    clients: {},
    canaux,
    soirs: [],
    filChoisi: null,
    filtre: 'tous',
    pliesOuverts: new Set(),
    brouillon: null,
    initialesJours: langue === 'fr' ? ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  });
  return (
    <VueBoite
      {...v}
      sousTitre=""
      etat="indisponible"
      libelles={libellesDe(tm as never)}
      etatsDesCanaux={canaux.map((c) => ({ canal: { id: c.canal, nom: dire(langue, `canal.${c.canal}` as never), grise: true }, etat: dire(langue, 'canal.aBrancher') }))}
      actions={{ onFiltre: () => undefined, onChoisir: () => undefined, onDeplier: () => undefined }}
    />
  );
}
