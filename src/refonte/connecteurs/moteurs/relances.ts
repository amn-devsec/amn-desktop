import { cleMessagePalier, paliereDe, toneAMonte, type PalierRelance } from '../../../lib/relances';
import { joursEntre } from '../tarifs';
import type { Jour } from '../types';

/**
 * LES RELANCES DU JOUR — sur le moteur existant (`src/lib/relances.ts`).
 *
 * `relances.ts` dit quel palier un retard atteint et si le ton a monté. Ce
 * moteur décide, chaque jour, QUELLES factures relancer, sans harceler :
 *
 *   · jamais une facture payée, en litige, ou pas encore échue ;
 *   · jamais deux relances à moins de 7 jours d'écart (proposition) ;
 *   · « rappel » et « relance ferme » peuvent être préparés et envoyés seuls ;
 *   · « mise en demeure » et « dernier avis » attendent TOUJOURS une personne :
 *     ce moteur ne les envoie jamais de lui-même (même règle que `RemindersScreen`).
 *
 * Le texte vient des clés existantes `relances.message*` (vouvoiement, déjà
 * traduites) : ce moteur rend la clé, l'écran la traduit.
 */

export interface FactureARelancer {
  id: string;
  echeance: Jour;
  payee: boolean;
  enLitige?: boolean;
  /** Courriel du client ; absent = rien à préparer, une tâche « trouver le contact » à la place. */
  courriel?: string;
  derniereRelance: { palier: PalierRelance; le: Jour } | null;
}

export const DELAI_ENTRE_RELANCES_JOURS = 7;

/** Les paliers qu'aucune automatisation n'envoie seule. */
export const PALIERS_VALIDATION_HUMAINE: readonly PalierRelance[] = ['mise-en-demeure', 'dernier-avis'];

export interface RelanceProposee {
  id: string;
  factureId: string;
  palier: PalierRelance;
  joursRetard: number;
  toneAMonte: boolean;
  cleMessage: ReturnType<typeof cleMessagePalier>;
  /** Vrai : préparée, mais envoyée seulement après un clic. */
  validationHumaine: boolean;
  /** Pas de courriel connu : la relance devient une tâche. */
  sansContact: boolean;
}

export function relancesDuJour(factures: readonly FactureARelancer[], aujourdhui: Jour, delai = DELAI_ENTRE_RELANCES_JOURS): RelanceProposee[] {
  const r: RelanceProposee[] = [];
  for (const f of factures) {
    if (f.payee || f.enLitige) continue;
    const retard = joursEntre(f.echeance, aujourdhui);
    if (retard <= 0) continue;
    if (f.derniereRelance && joursEntre(f.derniereRelance.le, aujourdhui) < delai) continue;
    const palier = paliereDe(retard);
    r.push({
      id: `relance-${f.id}-${aujourdhui}`,
      factureId: f.id,
      palier,
      joursRetard: retard,
      toneAMonte: toneAMonte(f.derniereRelance?.palier ?? null, palier),
      cleMessage: cleMessagePalier(palier),
      validationHumaine: PALIERS_VALIDATION_HUMAINE.includes(palier),
      sansContact: !f.courriel,
    });
  }
  return r.sort((a, b) => b.joursRetard - a.joursRetard || a.factureId.localeCompare(b.factureId));
}
