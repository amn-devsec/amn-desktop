import React, { useMemo } from 'react';
import { usePageCoquille } from '../../../coquille/page';
import { REGLAGES_DU_LIEN_PAR_DEFAUT } from '../../partages';
import { composerPartages } from './composer';
import { libellesDe, useMots } from './i18n';
import { VuePartages } from './VuePartages';

/**
 * MX03 — Partage de fichiers, branché sur le poste. Route `/partages` (écran neuf du registre). Le poste n'a PAS de liens de
 * partage : la collection des liens (fichier, destinataire, ouvertures, expiration, protection) est sur la liste présentée à
 * Harun (STATUT §1.27 n° 4 : aucune collection synchronisée nouvelle sans son accord) et le stockage des fichiers n'est pas
 * branché. L'écran dit « à brancher », ne montre ni zone de dépôt, ni carte, ni transfert qui n'agiraient sur rien, et
 * n'envoie rien : un lien ne part jamais sans protection ni sans clic. La vue complète est celle de l'aperçu. Aucune adresse
 * de lien, aucun jeton, aucun mot de passe n'est lu ni affiché.
 */
export default function PagePartages() {
  const { tm, langue } = useMots();
  const maintenant = useMemo(() => new Date().toISOString(), []);
  usePageCoquille({ famille: 'echanger', sousPage: 'partages', miettes: [{ libelle: tm('titre') }] });
  const v = composerPartages({ langue, maintenant, liens: [], recus: 0, onglet: 'partages', transferts: [], quotaOctets: 1, reglages: REGLAGES_DU_LIEN_PAR_DEFAUT });
  return <VuePartages {...v} sousTitre="" etat="indisponible" libelles={libellesDe(tm as never)} actions={{}} />;
}
