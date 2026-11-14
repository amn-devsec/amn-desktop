import { vueDuRegistre } from '../../../modules/registre';

/**
 * LES MODULES DE L'ATELIER (F1) DANS L'ARGENT — par des LIENS, F1 garde ses modules (STATUT §1.33 n° 4, provisoire) :
 * Taux horaire de revient dans MA12, Paiement en plusieurs fois dans H07, Comparateur de devis dans MA03.
 *
 * Un lien n'existe que si le module est au registre (F1 l'intègre, §1.21). Avant, rien ne s'affiche : aucun lien
 * mort, aucun module refait ici.
 */
export type ModuleAtelier = 'tauxHoraire' | 'echeancier' | 'comparateurDevis';

export interface LienAtelier {
  vers: string;
}

export function lienAtelier(id: ModuleAtelier): LienAtelier | null {
  const v = vueDuRegistre(id);
  return v ? { vers: v.route } : null;
}
