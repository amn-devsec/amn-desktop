import { PREFIXE_ENSEMBLE } from '../systeme/ensemble';

/**
 * LES SEPT HUBS « VUE D'ENSEMBLE » (F10 à F70) — une route EXACTE par lot (décision du CO).
 *
 * La route d'origine est la page générique `/ensemble/:famille` (`PageEnsembleFamille`, le repli : la liste des
 * modules de la famille). Elle ne se déclare JAMAIS telle quelle : un seul lot pourrait la tenir, pour les sept. Chaque
 * lot déclare la route exacte de SON hub, dans son fichier `declarations/<lot>.tsx`, et seulement celle-là ; les autres
 * familles gardent le repli tant que leur lot n'a pas livré.
 *
 *   export default declarerSubstitutions('contacts', [
 *     { route: '/ensemble/contacts', composant: lazy(() => import('../../contacts/HubContacts')) },
 *   ]);
 *
 * `lot` est le dossier `src/refonte/<lot>/` du lot (STATUT § 7). Ma journée n'a pas de hub (son Accueil, `/`).
 */
export const ROUTE_GENERIQUE_HUBS = `${PREFIXE_ENSEMBLE}/:famille`;

export interface Hub {
  fiche: 'F10' | 'F20' | 'F30' | 'F40' | 'F50' | 'F60' | 'F70';
  /** L'identifiant de la famille (registre des modules) : `/ensemble/<famille>`. */
  famille: string;
  /** Le lot qui le construit et le déclare (le dossier `src/refonte/<lot>/`). */
  lot: string;
  route: string;
}

const hub = (fiche: Hub['fiche'], famille: string, lot: string): Hub => ({ fiche, famille, lot, route: `${PREFIXE_ENSEMBLE}/${famille}` });

export const HUBS: readonly Hub[] = [
  hub('F10', 'contacts', 'contacts'), // LOT-02
  hub('F20', 'ecrire', 'ecrire'), // LOT-03
  hub('F30', 'argent', 'argent'), // LOT-04
  hub('F40', 'echanger', 'echanger'), // LOT-05
  hub('F50', 'creer', 'creer'), // LOT-06
  hub('F60', 'outils', 'outils'), // LOT-07
  hub('F70', 'garde', 'garde'), // LOT-08 (STATUT § 1.8 : `/garde`, la Salle, ne change pas)
];

/** La faute d'une substitution sur une route de hub, ou `null`. Pur. */
export function fauteDeHub(route: string, lot: string, ou: string): string | null {
  if (route === ROUTE_GENERIQUE_HUBS) {
    return `${ou} › ${route} : la route générique des hubs ne se déclare pas — déclarez la route exacte de votre hub (${HUBS.find((h) => h.lot === lot)?.route ?? `${PREFIXE_ENSEMBLE}/<famille>`})`;
  }
  if (!route.startsWith(`${PREFIXE_ENSEMBLE}/`)) return null;
  const h = HUBS.find((x) => x.route === route);
  if (!h) return `${ou} › ${route} : n'est pas l'un des sept hubs (${HUBS.map((x) => x.route).join(', ')})`;
  if (h.lot !== lot) return `${ou} › ${route} : le hub ${h.fiche} appartient au lot « ${h.lot} », pas à « ${lot} »`;
  return null;
}
