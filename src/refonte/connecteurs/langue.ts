import { useLangue } from '../../i18n';
import { traduireConnecteurs, type CleConnecteurs } from './i18n';

/** Comme `useSocleLangue`, pour les mots des connecteurs (H21, DEV-couts, DEV-editeur). */
export function useConnecteursLangue() {
  const { langue } = useLangue();
  return {
    langue,
    tk: (cle: CleConnecteurs, vars?: Record<string, string | number>) => traduireConnecteurs(langue, cle, vars),
  };
}
