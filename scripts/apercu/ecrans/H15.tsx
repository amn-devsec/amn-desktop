/**
 * APERÇU « H15 » — Créer · Stock (v4), sur les jeux FICTIFS de SIM. Les commandes fournisseur « en route » de l'aperçu sont
 * posées ici (le jeu n'en a pas) sur les deux articles les plus bas, pour montrer le bloc pointillé et le couloir « évitée ».
 *
 *   npm run apercu -- H15
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueStock } from '../../../src/refonte/creer/ecrans/H15/VueStock';
import { modeleDuStock } from '../../../src/refonte/creer/ecrans/H15/modele';
import { ajouterJours } from '../../../src/refonte/creer/commun';
import { ordreDesJauges } from '../../../src/refonte/creer/stock';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const articles = monde.articles.map((a) => ({ ...a, reference: a.sku }));
const bas = ordreDesJauges(articles).slice(0, 2);
const livraisons = bas.map((a, i) => ({ articleId: a.id, quantite: 24 - i * 4, le: ajouterJours(jour, 4 + i * 2) }));

export default function Apercu() {
  const [filtre, setFiltre] = useState<'tout' | 'sous'>('tout');
  const [emplacement, setEmplacement] = useState<string | null>(articles.find((a) => a.emplacement === 'Entrepôt')?.emplacement ?? articles[0]?.emplacement ?? null);
  const modele = modeleDuStock({ articles, livraisons, aujourdhui: jour, emplacement, filtre, langue: 'fr' });
  return (
    <ApercuBureau famille="creer" sousPage="stock" fil={['Créer et produire', 'Stock']}>
      <VueStock modele={modele} aujourdhui={jour} emplacement={emplacement} onEmplacement={setEmplacement} filtre={filtre} onFiltre={setFiltre}
        suggestion="Les articles les plus bas viennent du même fournisseur. Une seule commande t’évite des frais de port." />
    </ApercuBureau>
  );
}
