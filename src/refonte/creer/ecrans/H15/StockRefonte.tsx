import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import { articleDepuisStock, type StockReel } from '../../reel';
import { modeleDuStock } from './modele';
import { useMots } from './textes';
import { VueStock } from './VueStock';

/**
 * H15 · STOCK — branché sur les articles du dépôt (`stockItems` : nom, quantité, seuil). Le dépôt ne garde ni emplacement,
 * ni historique de mouvements, ni commande fournisseur par article : les jauges sont exactes, la projection des ruptures
 * dit « pas assez d'historique » et le journal ne montre que le dernier mouvement de chaque article (STATUT §1.27 n° 4).
 */
export function StockRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const items = useCollection<Omit<StockReel, 'id'>>('stockItems');
  const [filtre, setFiltre] = useState<'tout' | 'sous'>('tout');
  const [emplacement, setEmplacement] = useState<string | null>(null);
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'stock', miettes: [{ libelle: tm('titre') }], ajmani: undefined });
  const modele = useMemo(
    () => modeleDuStock({ articles: items.map((i) => ({ ...articleDepuisStock(i as StockReel), reference: undefined })), livraisons: [], aujourdhui, emplacement, filtre, langue }),
    [items, aujourdhui, emplacement, filtre, langue],
  );
  return <VueStock modele={modele} aujourdhui={aujourdhui} emplacement={emplacement} onEmplacement={setEmplacement} filtre={filtre} onFiltre={setFiltre} onNouvelArticle={() => navigate('/stock?nouveau=1')} />;
}

export default StockRefonte;
