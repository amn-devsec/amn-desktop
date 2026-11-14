import React, { useMemo } from 'react';
import { useCollection } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import type { MarqueEntree } from '../../marque';
import { useMots } from './textes';
import { VueMarque } from './VueMarque';

/** Le kit du dépôt (`LogoKit`, `src/lib/cinquante/marketing.ts`) : un monogramme, des couleurs et des polices en listes de chaînes. */
interface KitReel { kind: 'logo' | 'usage'; monogramme?: string; mention?: string; couleurs?: string[]; polices?: string[]; declinaisons?: string[] }

/**
 * H17 · VISUELS ET MARQUE — le livre de marque, branché sur le kit du dépôt (`brandKit`). Logos importés, rôle et part des
 * couleurs, graisses, modèles et règles « à éviter » n'existent pas encore : ils s'affichent « non disponible » (STATUT
 * §1.27 n° 4 et 10 : aucun nouveau stockage de fichiers). Les codes viennent du kit de l'organisation, jamais des jetons CSS.
 */
export function MarqueRefonte({ nom = '' }: { nom?: string }) {
  const { tm } = useMots();
  const tout = useCollection<KitReel>('brandKit');
  const kit = tout.find((e) => e.kind === 'logo');
  usePageCoquille({ famille: 'creer', sousPage: 'brand', miettes: [{ libelle: tm('titre') }] });
  const marque = useMemo<MarqueEntree & { monogramme: string }>(() => ({
    monogramme: kit?.monogramme ?? '',
    logos: kit?.monogramme ? [{ variante: 'complet', format: 'SVG' }] : [],
    palette: (kit?.couleurs ?? []).map((hex, i) => ({ nom: `${i + 1}`, hex })),
    typographie: kit?.polices?.[0] ? { famille: kit.polices[0], graisses: [400, 600] } : null,
    modelesVisuels: [],
  }), [kit]);
  return <VueMarque nom={nom || kit?.mention || ''} marque={marque} onCopier={(h) => void navigator.clipboard?.writeText(h)} />;
}

export default MarqueRefonte;
