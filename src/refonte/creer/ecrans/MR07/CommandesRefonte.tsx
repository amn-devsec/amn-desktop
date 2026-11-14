import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NEXT_STATUSES, useOrders } from '../../../../state/useOrders';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import { compter } from '../../commandes';
import { commandeDepuisReel } from '../../reel';
import { useMots } from './textes';
import { VueCommandes, type CommandeVue } from './VueCommandes';

/**
 * MR07 · COMMANDES — branchée sur les commandes du dépôt (`orders` : statuts `new`…`delivered`, client, lignes, total).
 * Les statuts se rangent dans les 4 étapes de la bande ; « Marquer prête » avance d'UN statut par les transitions fermées
 * du dépôt (`NEXT_STATUSES`) : on ne revient pas en arrière d'ici. Mode de remise, échéance, urgence, responsable et
 * preuve de remise n'existent pas dans le dépôt : pas d'échéance affichée, aucune urgence inventée (STATUT §1.27 n° 4).
 */
export function CommandesRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const navigate = useNavigate();
  const { orders, setStatus } = useOrders();
  const [choisie, setChoisie] = useState<string | null>(null);
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'orders', miettes: [{ libelle: tm('titre') }] });

  const commandes = useMemo<CommandeVue[]>(() => orders.map((o) => ({
    ...commandeDepuisReel(o),
    contenu: o.lines.length === 1 ? o.lines[0].label : `${o.lines.length} articles`,
    montantCents: o.totalCents,
    adresse: o.customer.address,
    lignes: o.lines.map((l) => ({ nom: l.label, detail: `${l.quantity} × ${l.unitPriceCents / 100} €`, montantHtCents: Math.round(l.unitPriceCents * l.quantity) })),
  })), [orders]);
  const k = useMemo(() => compter(commandes, aujourdhui, maintenant), [commandes, aujourdhui, maintenant]);
  const avancer = (id: string) => {
    const o = orders.find((x) => x.id === id);
    const suite = o ? NEXT_STATUSES[o.status].find((s) => s !== 'cancelled') : undefined;
    if (o && suite) setStatus(o, suite);
  };
  return <VueCommandes commandes={commandes} compteurs={k} recordMensuel={0} aujourdhui={aujourdhui} choisieId={choisie} onChoisir={setChoisie} onSuivante={avancer} onNouvelle={() => navigate('/commandes?nouvelle=1')} />;
}

export default CommandesRefonte;
