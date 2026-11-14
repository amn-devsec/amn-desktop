import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { useMots } from './textes';
import { VueCatalogue, type ProduitVue } from './VueCatalogue';

interface ArticleReel { name: string; unit: string; quantity: number; minQuantity: number | null }

/**
 * MR05 · CATALOGUE PRODUITS — construit sur les articles de stock du dépôt (`stockItems`), sans nouvelle collection
 * (STATUT §1.27 n° 2). Prix, photos, TVA, prix d'achat, fournisseur et ventes n'existent pas : ils s'affichent « non
 * disponible » ; la collection `products` est une demande à amn-api (Harun). Le catalogue n'est lisible qu'avec son stock.
 */
export function CatalogueRefonte() {
  const { tm } = useMots();
  const navigate = useNavigate();
  const articles = useCollection<ArticleReel>('stockItems');
  const [choisi, setChoisi] = useState<string | null>(null);
  usePageCoquille({ famille: 'creer', sousPage: 'catalogue', miettes: [{ libelle: tm('titre') }] });
  const produits = useMemo<ProduitVue[]>(() => articles.map((a) => ({
    id: a.id, nom: a.name, prixHtCents: 0, type: 'produit en stock', quantite: a.quantity, seuilAlerte: a.minQuantity, etat: 'actif', photos: 0,
  })), [articles]);
  return <VueCatalogue produits={produits} vedette={null} choisiId={choisi} onChoisir={setChoisi} droitPrixAchat={false} onNouveau={() => navigate('/stock?nouveau=1')} />;
}

export default CatalogueRefonte;
