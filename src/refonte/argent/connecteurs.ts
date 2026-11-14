import { modeDeCategorie } from '../connecteurs/cycle';
import type { ConnecteurInstance } from '../connecteurs/types';

/**
 * LES CONNECTEURS VUS DE L'ARGENT — en LECTURE seule, depuis le modèle de S9
 * (`src/refonte/connecteurs/`, STATUT §1.22). Ils se configurent dans H21 (LOT-07) :
 * aucun écran de ce lot ne saisit de clé ni ne branche quoi que ce soit.
 */

export interface EtatConnecteurArgent {
  mode: 'local' | 'externe';
  aBrancher: boolean;
  ouConfigurer: 'H21';
}

/** Paiements en ligne (MA03) : externe dès qu'un service de paiement est connecté avec le droit de lecture. */
export function etatPaiementsEnLigne(instances: readonly ConnecteurInstance[]): EtatConnecteurArgent {
  const mode = modeDeCategorie('paiement', instances, 'lecture');
  return { mode, aBrancher: mode === 'local', ouConfigurer: 'H21' };
}

/** Banque (MA10) : toujours en lecture seule, branchée ou non. */
export function etatBanque(instances: readonly ConnecteurInstance[]): EtatConnecteurArgent & { lectureSeule: true } {
  const mode = modeDeCategorie('banque', instances, 'lecture');
  return { mode, aBrancher: mode === 'local', ouConfigurer: 'H21', lectureSeule: true };
}
