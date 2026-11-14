import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import { useOrders } from '../../../../state/useOrders';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import { bilanDeLaSemaine, ceQuiSeVend, paniersAbandonnes, type CommandeBoutique } from '../../boutique';
import { useMots } from './textes';
import { VueBoutique } from './VueBoutique';

interface PanierReel { kind: 'panier' | 'visites'; ouvertLe?: string; etape?: 'panier' | 'livraison' | 'paiement' | 'paye'; arreteLe?: string; relanceLe?: string; jour?: string; nombre?: number }

/**
 * MR08 · BOUTIQUE EN LIGNE — branchée sur les paniers et les visites du dépôt (`shopCarts` : paniers par étape, compteur de
 * visites par jour) et sur les commandes (`orders`). Pas de visites en direct (compteur quotidien seulement) ni d'étape
 * « produit vu » ni d'objectif : « non disponible » (STATUT §1.27 n° 4). L'entonnoir saute l'étape absente au lieu de la supposer.
 */
export function BoutiqueRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const navigate = useNavigate();
  const enregs = useCollection<PanierReel>('shopCarts');
  const { orders } = useOrders();
  const [periode, setPeriode] = useState<7 | 30>(7);
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'shop', miettes: [{ libelle: tm('titre') }] });

  const d = useMemo(() => {
    const depuis = maintenant - periode * 86_400_000;
    const paniers = enregs.filter((e) => e.kind === 'panier' && Date.parse(e.ouvertLe ?? '') >= depuis);
    const visites = enregs.filter((e) => e.kind === 'visites' && Date.parse(`${e.jour}T12:00:00`) >= depuis).reduce((s, v) => s + (v.nombre ?? 0), 0);
    const rang = { panier: 1, livraison: 2, paiement: 3, paye: 4 } as const;
    const atteint = (n: number) => paniers.filter((p) => p.etape && rang[p.etape] >= n).length;
    const cmds: CommandeBoutique[] = orders.filter((o) => o.status !== 'cancelled' && o.paidCents > 0).map((o) => ({ payeeLe: jourParis(o.placedAt), totalCents: o.totalCents, lignes: o.lines.map((l) => ({ produitId: l.sku || l.label, nom: l.label, quantite: l.quantity })) }));
    const semaine = bilanDeLaSemaine(cmds, aujourdhui);
    const ab = paniersAbandonnes(enregs.filter((e) => e.kind === 'panier').map((p, i) => ({ id: `${i}`, derniereActiviteMs: Date.parse(p.arreteLe ?? p.ouvertLe ?? ''), converti: p.etape === 'paye', contactAutorise: false, adresseConnue: false })), maintenant);
    return { entonnoir: { visites, fiches: null, paniers: atteint(1), paiements: atteint(3), commandes: atteint(4) }, semaine, vendus: ceQuiSeVend(cmds, aujourdhui), ab };
  }, [enregs, orders, periode, maintenant, aujourdhui]);

  return (
    <VueBoutique
      etat="ouverte" direct={null} semaine={d.semaine} vendus={d.vendus.map((v) => ({ id: v.produitId, nom: v.nom, quantite: v.quantite, barre: v.barre }))}
      entonnoir={d.entonnoir} periode={periode} onPeriode={setPeriode} paniers={d.ab} objectif={null}
      onAjouter={() => navigate('/stock?nouveau=1')}
    />
  );
}

export default BoutiqueRefonte;
