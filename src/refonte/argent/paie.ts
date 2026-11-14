import { arrondi, formaterMontant, type Langue, type Mois } from './commun';

/**
 * PAIE (MA11) — fiche v4, rubrique 6.
 *
 * AUCUN CALCUL DE PAIE : brut, cotisations et impôt viennent du cabinet ou du logiciel
 * de paie ; l'application affiche et compare. La seule exception est la paie FICTIVE des
 * jeux de SIM, dont les cotisations valent 46 % du net (règle validée, STATUT §1.11 n° 3) :
 * `cotisations` ne sert qu'à recouper ces jeux, jamais à un vrai bulletin.
 *
 * MASQUAGE (proposition de la fiche) : tous les montants sont masqués à l'ouverture ;
 * ouvrir un bulletin rend SES montants visibles 2 minutes ; masquage immédiat si la
 * fenêtre perd le focus plus de 60 s. Aucune donnée de paie hors de cette page.
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

export const VISIBLE_PENDANT_MS = 2 * 60_000;
export const FOCUS_PERDU_MAX_MS = 60_000;

/** Les montants d'un bulletin ouvert à `ouvertA` sont-ils encore visibles à `maintenant` ? */
export function montantsVisibles(e: { ouvertA: number | null; maintenant: number; focusPerduDepuis: number | null; masqueALaMain?: boolean }): boolean {
  if (e.ouvertA === null || e.masqueALaMain) return false;
  if (e.maintenant - e.ouvertA >= VISIBLE_PENDANT_MS) return false;
  return !(e.focusPerduDepuis !== null && e.maintenant - e.focusPerduDepuis > FOCUS_PERDU_MAX_MS);
}

/** Les secondes restantes du compte à rebours (pastille), 0 une fois masqué. */
export const secondesRestantes = (ouvertA: number, maintenant: number): number => Math.max(0, Math.ceil((VISIBLE_PENDANT_MS - (maintenant - ouvertA)) / 1000));

/** « 2 sur 3 prêts » : bulletins au moins « Prêt » (Prêt, Validé, Payé). */
export const bulletinsPrets = (bulletins: readonly { etat: string }[]): { prets: number; total: number } => ({
  prets: bulletins.filter((b) => ['Prêt', 'Validé', 'Payé'].includes(b.etat)).length,
  total: bulletins.length,
});
