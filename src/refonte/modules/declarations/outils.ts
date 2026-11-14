import { declarerFamille, vue } from '../declarer';

/**
 * OUTILS — petits outils, automatisation, conformité, réglages.
 *
 * Le terrain et le stock ont rejoint « Créer et produire » le 14 nov. (STATUT §1.27 n° 1) :
 * Chantiers, Qualité et contrôles, Tournées, Matériel et flotte, Stock et prévision.
 * Reste « Stock et achats » pour la composition et le coût de revient (Fabrication, qui n'existe pas encore,
 * s'y rattachera ou rejoindra Créer, à décider). Regroupés ici : Calculs (Calculateurs, Calculatrice,
 * Convertisseurs).
 */

export default declarerFamille({
  id: 'outils',
  ordre: 7,
  teinte: 'outils',
  nom: { fr: 'Outils et réglages', en: 'Tools and settings' },
  actions: {
    pratique: { fr: 'Petits outils', en: 'Handy tools' },
    automatiser: { fr: 'Automatiser et importer', en: 'Automate and import' },
    stock: { fr: 'Stock et achats', en: 'Stock and purchasing' },
    conformite: { fr: 'Conformité', en: 'Compliance' },
    reglages: { fr: 'Réglages et compte', en: 'Settings and account' },
  },
  modules: [
    {
      action: 'pratique',
      niveau: 'courant',
      vues: [
        vue('qr', '/outils/qr', ['créer un QR code'], ['qr', 'qr code', 'code'], {
          en: { verbes: ['create a QR code'], motsCles: ['qr', 'qr code', 'code'] },
        }),
      ],
    },
    {
      nom: { fr: 'Calculs', en: 'Calculations' },
      action: 'pratique',
      niveau: 'courant',
      vues: [
        vue('calculators', '/calculateurs', ['calculer un prix', 'calculer une marge', 'répartir un montant'], ['calculateur', 'prix', 'marge', 'tarif'], {
          en: { verbes: ['work out a price', 'work out a margin', 'split an amount'], motsCles: ['calculator', 'price', 'margin', 'rate', 'pricing'] },
        }),
        vue('calcPro', '/outils/calculatrice', ['faire un calcul', 'relire un calcul'], ['calculatrice', 'calcul', 'ruban'], {
          en: { verbes: ['do a calculation', 'reread a calculation'], motsCles: ['calculator', 'calculation', 'tape'] },
        }),
        vue('converters', '/outils/convertisseurs', ['convertir une unité', 'calculer la TVA', 'convertir une devise'], ['convertisseur', 'unité', 'tva', 'devise'], {
          en: { verbes: ['convert a unit', 'work out VAT', 'convert a currency'], motsCles: ['converter', 'unit', 'vat', 'currency'] },
        }),
      ],
    },
    {
      action: 'automatiser',
      niveau: 'courant',
      vues: [
        vue('automations', '/outils/automatisations', ['automatiser une tâche', 'créer une règle automatique'], ['automatisation', 'règle', 'si alors', 'workflow'], {
          en: { verbes: ['automate a task', 'create an automatic rule'], motsCles: ['automation', 'rule', 'if then', 'workflow'] },
        }),
      ],
    },
    {
      action: 'automatiser',
      niveau: 'avance',
      vues: [
        vue('dataPort', '/outils/donnees', ['importer des données', 'exporter mes données', 'sauvegarder mes données'], ['import', 'export', 'csv', 'excel', 'données', 'sauvegarde', 'backup'], {
          en: { verbes: ['import data', 'export my data', 'back up my data'], motsCles: ['import', 'export', 'csv', 'excel', 'data', 'backup'] },
        }),
      ],
    },
    {
      action: 'stock',
      niveau: 'avance',
      vues: [
        vue('bom', '/nomenclatures', ['calculer un coût de revient', 'décrire la composition d’un produit'], ['nomenclature', 'composition', 'coût de revient', 'recette', 'bom', 'prix de revient'], {
          en: { verbes: ['work out a cost price', 'describe a product’s composition'], motsCles: ['bill of materials', 'composition', 'cost price', 'recipe'] },
        }),
      ],
    },
    {
      action: 'conformite',
      niveau: 'avance',
      vues: [
        vue('gdpr', '/rgpd', ['répondre à une demande RGPD', 'tenir le registre des données'], ['rgpd', 'données personnelles', 'cnil', 'effacement'], {
          en: { verbes: ['answer a GDPR request', 'keep the data register'], motsCles: ['gdpr', 'personal data', 'privacy', 'erasure'] },
        }),
      ],
    },
    {
      action: 'conformite',
      niveau: 'avance',
      vues: [
        vue('csr', '/impact-rse', ['calculer mon empreinte carbone'], ['rse', 'carbone', 'empreinte', 'environnement', 'bilan carbone', 'co2'], {
          en: { verbes: ['work out my carbon footprint'], motsCles: ['csr', 'carbon', 'footprint', 'environment', 'co2'] },
        }),
      ],
    },
    {
      action: 'conformite',
      niveau: 'avance',
      vues: [
        vue('kyc', '/verification-identite', ['vérifier une identité', 'contrôler un dossier'], ['kyc', 'identité', 'vérification', 'pièce d’identité'], {
          en: { verbes: ['verify an identity', 'check a file'], motsCles: ['kyc', 'identity', 'verification', 'id document'] },
        }),
      ],
    },
    {
      action: 'reglages',
      niveau: 'essentiel',
      vues: [
        vue('settings', '/settings', ['changer mes réglages', 'modifier mon profil', 'changer la langue', 'changer le thème', 'réduire les animations', 'régler les notifications'], ['paramètres', 'réglages', 'profil', 'notifications', 'langue', 'thème', 'animations', 'mouvement'], {
          en: { verbes: ['change my settings', 'edit my profile', 'change the language', 'change the theme', 'reduce motion'], motsCles: ['settings', 'preferences', 'profile', 'notifications', 'language', 'theme', 'motion'] },
        }),
      ],
    },
    {
      action: 'reglages',
      niveau: 'courant',
      vues: [
        vue('members', '/membres', ['inviter un membre', 'ajouter une personne', 'retirer un membre', 'changer un rôle'], ['membre', 'invitation', 'place', 'utilisateur', 'rôle'], {
          en: { verbes: ['invite a member', 'add a person', 'remove a member', 'change a role'], motsCles: ['member', 'invitation', 'seat', 'user', 'role'] },
        }),
      ],
    },
    {
      action: 'reglages',
      niveau: 'courant',
      vues: [
        vue('assistance', '/assistance', ['demander de l’aide', 'contacter le support', 'signaler un problème'], ['assistance', 'aide', 'support', 'prestataire', 'bug', 'contact', 'problème'], {
          en: { verbes: ['ask for help', 'contact support', 'report a problem'], motsCles: ['support', 'help', 'bug', 'contact', 'issue'] },
        }),
      ],
    },
    {
      action: 'reglages',
      niveau: 'courant',
      vues: [
        vue('library', '/bibliotheque', ['alléger un module', 'voir les modules par section'], ['bibliothèque', 'modules', 'catalogue'], {
          en: { verbes: ['hide a module', 'see modules by section'], motsCles: ['library', 'modules', 'catalogue', 'catalog'] },
        }),
      ],
    },
    {
      action: 'reglages',
      niveau: 'courant',
      vues: [
        vue('vault', '/vault', ['ranger un mot de passe', 'retrouver un accès'], ['coffre', 'mot de passe', 'clé', 'accès'], {
          en: { verbes: ['store a password', 'find an access'], motsCles: ['vault', 'password', 'key', 'credentials', 'access'] },
        }),
      ],
    },
    {
      action: 'reglages',
      niveau: 'avance',
      vues: [
        vue('extensions', '/extensions', ['installer une extension', 'voir ce qu’une extension demande'], ['extension', 'plugin', 'permission'], {
          en: { verbes: ['install an extension', 'see what an extension asks for'], motsCles: ['extension', 'plugin', 'add-on', 'permission'] },
        }),
      ],
    },
  ],
});
