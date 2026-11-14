/**
 * APERÇU « MR05 » — Créer · Catalogue produits (v4), sur les produits FICTIFS de SIM. La TVA, les photos, les prix d'achat et
 * les ventes de la semaine sont posés ici (le jeu n'en a pas).
 *
 *   npm run apercu -- MR05
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueCatalogue, type ProduitVue } from '../../../src/refonte/creer/ecrans/MR05/VueCatalogue';
import '../../../src/refonte/creer/creer.css';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const produits: ProduitVue[] = monde.produits.slice(0, 9).map((p, i) => ({
  id: p.id, nom: p.nom, prixHtCents: p.prixCents, type: p.type, quantite: p.quantite, niveauConseille: p.niveauCible, seuilAlerte: p.seuilAlerte, etat: p.etat,
  photos: i === 0 ? 0 : 1, description: p.description, prixAchatHtCents: Math.round(p.prixCents * 0.66), reference: `REF-${String(i + 1).padStart(3, '0')}`, fournisseur: 'Rexel, livré en 3 jours', ventes: [1, 0, 3, 1, 1, 1],
}));

export default function Apercu() {
  const [choisi, setChoisi] = useState<string | null>(produits[2]?.id ?? null);
  return (
    <ApercuBureau famille="creer" sousPage="catalogue" fil={['Créer et produire', 'Catalogue produits']}>
      <VueCatalogue
        produits={produits} vedette={{ produitId: produits[0].id, vendus: 3 }} choisiId={choisi} onChoisir={setChoisi} droitPrixAchat
        suggestion={{ titre: 'Réapprovisionner', texte: 'Il reste peu de ce produit. Je commande chez le fournisseur habituel au meilleur prix, tu valides avant l’envoi.' }}
      />
    </ApercuBureau>
  );
}
