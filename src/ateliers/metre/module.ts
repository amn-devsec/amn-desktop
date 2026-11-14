import { manifeste } from '../_commun/manifeste';

export const MODULE = manifeste({
  id: 'metre',
  route: '/metre',
  famille: 'creer',
  action: 'creer.fabriquer',
  verbes: ['calculer une surface', 'faire un métré', 'savoir combien de paquets commander', 'chiffrer les matériaux d’un chantier'],
  motsCles: ['métré', 'quantitatif', 'surface', 'm²', 'chute', 'carrelage', 'peinture', 'placo', 'matériaux'],
  niveau: 'courant',
  nom: 'Métré et quantitatif',
  pourQui: 'peintres, carreleurs, plaquistes, poseurs de sols',
});
