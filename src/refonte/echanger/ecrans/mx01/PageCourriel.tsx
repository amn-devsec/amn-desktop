import React, { useMemo } from 'react';
import { usePageCoquille } from '../../../coquille/page';
import { etatDeCategorie } from '../../connecteurs';
import { composerCourriel } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueCourriel } from './VueCourriel';

/**
 * MX01 — Courriel, branché sur le poste. Route `/courriel` (écran neuf du registre). Le poste n'a PAS de boîte partagée : la
 * messagerie est une prise de la baie de connecteurs (H21, LOT-07) et la collection des courriels, avec leurs étiquettes et
 * leur état, est sur la liste présentée à Harun (STATUT §1.27 n° 4 : aucune collection synchronisée nouvelle sans son
 * accord). Tant que rien n'est branché, l'écran dit « connecteur à brancher » et ne montre ni dossier, ni fil, ni résumé qui
 * n'agiraient sur rien ; « Nouveau message » reste éteint. La vue complète est celle de l'aperçu. Aucune clé, aucun mot de
 * passe, aucun jeton, aucune adresse de serveur n'est lu ni affiché.
 */
export default function PageCourriel() {
  const { tm, langue } = useMots();
  const maintenant = useMemo(() => new Date().toISOString(), []);
  usePageCoquille({ famille: 'echanger', sousPage: 'courriel', miettes: [{ libelle: tm('titre') }] });
  // Aucune prise de la baie n'est lue au poste : la boîte est « à brancher ».
  const boite = etatDeCategorie('messagerie', [], Date.parse(maintenant));
  const v = composerCourriel({ langue, maintenant, moi: '', messages: [], dossier: 'reception', filtre: 'tous', filChoisi: null, presences: [], organisations: {}, etatBoite: boite === 'actif' ? 'reliee' : 'a-brancher', brouillonPret: null, attend: null });
  return <VueCourriel {...v} sousTitre="" etat="indisponible" libelles={libellesDe(tm as never)} actions={{}} />;
}
