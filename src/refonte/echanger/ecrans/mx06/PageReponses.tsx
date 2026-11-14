import React, { useMemo } from 'react';
import { usePageCoquille } from '../../../coquille/page';
import { composerReponses } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueReponses } from './VueReponses';

/**
 * MX06 — Réponses automatiques, branché sur le poste. Route `/reponses-automatiques` (écran neuf du registre). Le poste n'a PAS de
 * règles : la collection des règles (déclencheur, modèle, garde-fou, état) est sur la liste présentée à Harun (STATUT §1.27 n° 4 :
 * aucune collection synchronisée nouvelle sans son accord), et l'envoi passe par la messagerie, prise de la baie de connecteurs
 * (H21). L'écran dit « à brancher », ne montre ni liste, ni éditeur, ni aperçu qui n'agiraient sur rien, et n'envoie jamais rien :
 * une règle neuve, importée ou proposée naît désactivée. La vue complète est celle de l'aperçu.
 */
export default function PageReponses() {
  const { tm, langue } = useMots();
  const maintenant = useMemo(() => new Date().toISOString(), []);
  usePageCoquille({ famille: 'echanger', sousPage: 'reponsesAuto', miettes: [{ libelle: tm('titre') }] });
  const v = composerReponses({ langue, maintenant, regles: [], proposee: null, choisieId: null, enLigne: false, apercu: { de: '', prenom: null, destinataireNom: '', delaiSecondes: 2, cible: 'client' }, manque: null });
  return <VueReponses {...v} sousTitre="" etat="indisponible" libelles={libellesDe(tm as never)} actions={{}} />;
}
