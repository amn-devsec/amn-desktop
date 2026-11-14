import type React from 'react';
import { Code2, Coins, LayoutTemplate, Rocket, Server, Workflow } from 'lucide-react';
import { declarerFamille, vue } from '../declarer';

/**
 * DÉVELOPPEMENT (LOT-11) — l'espace de travail du code : projets, mises en ligne, serveur, flux, coûts, modèles.
 *
 * Teinte `outils` dans le registre (STATUT §1.19 n° 2, comme La Garde) : le néon de la famille vient de la
 * coquille (`--socle-fam-developpement-a|b`). Les six écrans sont NEUFS (`nouveau`) et déclarés dans l'ordre de
 * l'image, que la sous-liste de la barre latérale suit (`coquille/sousListeDeveloppement.ts`). Les modules repris
 * (Automatisations, Coffre-fort, Base de connaissances…) gardent leur famille : ils n'ont qu'une seconde ligne
 * dans la barre, jamais une seconde déclaration (§1.19 n° 1). Fiches : `docs/refonte/fiches/LOT-11/`.
 */

const ecran = (charger: () => Promise<{ default: React.ComponentType }>) => charger;

export default declarerFamille({
  id: 'developpement',
  ordre: 9,
  teinte: 'outils',
  nom: { fr: 'Développement', en: 'Development' },
  actions: {
    construire: { fr: 'Construire', en: 'Build' },
    mettreEnLigne: { fr: 'Mettre en ligne', en: 'Ship' },
    automatiser: { fr: 'Automatiser', en: 'Automate' },
    payer: { fr: 'Payer et protéger', en: 'Pay and protect' },
  },
  modules: [
    {
      nom: { fr: 'Projets de code', en: 'Code projects' },
      action: 'construire',
      niveau: 'courant',
      vues: [
        vue('devProjets', '/developpement/projets', ['voir les projets de code', 'importer un dépôt'], ['dépôt', 'code', 'commit', 'tests', 'branche', 'git'], {
          en: { verbes: ['see code projects', 'import a repository'], motsCles: ['repository', 'code', 'commit', 'tests', 'branch', 'git'] },
          nouveau: { icone: Code2, ecran: ecran(() => import('../../developpement/ProjetsDeCode')), indice: { fr: 'Dépôts, tests et activité', en: 'Repositories, tests and activity' } },
        }),
      ],
    },
    {
      nom: { fr: 'Déploiements', en: 'Deployments' },
      action: 'mettreEnLigne',
      niveau: 'courant',
      vues: [
        vue('devDeploiements', '/developpement/deploiements', ['voir les déploiements', 'déployer', 'revenir à une version'], ['déploiement', 'mise en ligne', 'production', 'aperçu', 'retour arrière'], {
          en: { verbes: ['see deployments', 'deploy', 'roll back'], motsCles: ['deployment', 'release', 'production', 'preview', 'rollback'] },
          nouveau: { icone: Rocket, ecran: ecran(() => import('../../developpement/PageDeploiements')), indice: { fr: 'Mises en ligne et retours arrière', en: 'Releases and rollbacks' } },
        }),
      ],
    },
    {
      nom: { fr: 'Serveur et santé', en: 'Server and health' },
      action: 'mettreEnLigne',
      niveau: 'avance',
      vues: [
        vue('devServeur', '/developpement/serveur', ['voir la santé du serveur', 'relancer un service'], ['serveur', 'processeur', 'mémoire', 'disque', 'services', 'disponibilité'], {
          en: { verbes: ['see server health', 'restart a service'], motsCles: ['server', 'cpu', 'memory', 'disk', 'services', 'uptime'] },
          nouveau: { icone: Server, ecran: ecran(() => import('../../developpement/ServeurSante')), indice: { fr: 'Charge, services et sauvegardes', en: 'Load, services and backups' } },
        }),
      ],
    },
    {
      nom: { fr: 'Éditeur de flux', en: 'Flow editor' },
      action: 'automatiser',
      niveau: 'courant',
      vues: [
        vue('devEditeur', '/developpement/editeur', ['dessiner un flux', 'tester une automatisation'], ['flux', 'quand', 'si', 'alors', 'blocs', 'automatisation'], {
          en: { verbes: ['draw a flow', 'test an automation'], motsCles: ['flow', 'when', 'if', 'then', 'blocks', 'automation'] },
          nouveau: { icone: Workflow, ecran: ecran(() => import('../../developpement/EditeurDeFlux')), indice: { fr: 'Blocs Quand, Si, Alors', en: 'When, If, Then blocks' } },
        }),
      ],
    },
    {
      nom: { fr: 'Coûts et API', en: 'Costs and APIs' },
      action: 'payer',
      niveau: 'courant',
      vues: [
        vue('devCouts', '/developpement/couts', ['voir les coûts des outils', 'fixer un plafond'], ['coûts', 'api', 'plafond', 'payant', 'gratuit', 'local'], {
          en: { verbes: ['see tool costs', 'set a cap'], motsCles: ['costs', 'api', 'cap', 'paid', 'free', 'local'] },
          nouveau: { icone: Coins, ecran: ecran(() => import('../../developpement/CoutsEtApi')), indice: { fr: 'Ce qui est gratuit, ce qui coûte', en: 'What is free, what costs' } },
        }),
      ],
    },
    {
      nom: { fr: 'Modèles de sites', en: 'Site templates' },
      action: 'construire',
      niveau: 'courant',
      vues: [
        vue('devModelesSites', '/developpement/modeles-sites', ['choisir un modèle de site', 'copier le code d’un site'], ['modèle', 'site', 'gabarit', 'html', 'vitrine'], {
          en: { verbes: ['pick a site template', 'copy a site’s code'], motsCles: ['template', 'site', 'html', 'landing page'] },
          nouveau: { icone: LayoutTemplate, ecran: ecran(() => import('../../developpement/ModelesDeSites')), indice: { fr: 'Sites prêts à copier', en: 'Ready-to-copy sites' } },
        }),
      ],
    },
  ],
});
