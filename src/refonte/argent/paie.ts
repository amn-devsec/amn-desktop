import { arrondi, formaterMontant, type Langue, type Mois } from './commun';

/**
 * PAIE (MA11) — sur les jeux fictifs seulement.
 *
 * Les cotisations de la paie FICTIVE valent 46 % du net (règle validée, STATUT
 * §1.11 n° 3) : ce n'est pas un calcul de paie réel. Les montants sont MASQUÉS par
 * défaut à l'écran ; la personne les affiche d'un geste.
 */
export const COTISATIONS_FICTIVES_PCT = 46;
export const MONTANTS_MASQUES_PAR_DEFAUT = true;

export const cotisations = (netCents: number): number => arrondi((netCents * COTISATIONS_FICTIVES_PCT) / 100);
export const coutTotal = (netCents: number): number => netCents + cotisations(netCents);

/** La masse d'un mois : net total, cotisations (calculées sur le total), coût. */
export function masseSalariale(bulletins: readonly { mois: string; netCents: number }[], mois: Mois): { netCents: number; cotisationsCents: number; coutCents: number; bulletins: number } {
  const du = bulletins.filter((b) => b.mois === mois);
  const net = du.reduce((s, b) => s + b.netCents, 0);
  return { netCents: net, cotisationsCents: cotisations(net), coutCents: coutTotal(net), bulletins: du.length };
}

/** Un montant de paie à l'écran : « •••• € » tant qu'il est masqué. */
export const montantAffiche = (cents: number, visible: boolean, langue: Langue = 'fr'): string => (visible ? formaterMontant(cents, langue) : '•••• €');
