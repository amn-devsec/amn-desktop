import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { isAdminRole } from '../../../../auth/roles';
import { lienAtelier } from '../commun/atelier';
import { VueTarifs } from './VueTarifs';

/**
 * MA12 · TARIFS ET REMISES — la page branchée, écran neuf du registre (`/tarifs`, LOT-04).
 *
 * La grille de prix (prestations, coûts, ventes du mois) n'est pas encore servie à l'application : la vue le dit, sans
 * rien inventer. Coûts et marges sont réservés aux administrateurs (fiche, rubrique 6). Le lien « Taux horaire de
 * revient » (F1) n'apparaît que si le module est au registre.
 */
export default function PageTarifs() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const taux = lienAtelier('tauxHoraire');
  const rien = () => undefined;
  return (
    <VueTarifs
      statut="indisponible"
      prestations={[]}
      remisesAccordeesCents={null}
      voitLesCouts={isAdminRole(role)}
      tauxHoraire={taux ? { ouvrir: () => navigate(taux.vers) } : null}
      actions={{ historique: rien, ajouter: rien, preparerGrille: rien, refuserSuggestion: rien }}
    />
  );
}
