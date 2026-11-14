import { Award, Contact, Filter } from 'lucide-react';
import { declarerFamille, vue } from '../declarer';

/**
 * MES CONTACTS — clients, prospects, ce qu’ils disent, et les gens avec qui on travaille.
 *
 * Regroupés : Prospects et scoring ; Retours clients (Avis, Sentiment, NPS) ;
 * Fidélité et parrainage.
 */

export default declarerFamille({
  id: 'contacts',
  ordre: 2,
  teinte: 'contacts',
  nom: { fr: 'Mes contacts et clients', en: 'People and clients' },
  actions: {
    clients: { fr: 'Mes clients', en: 'My customers' },
    prospecter: { fr: 'Trouver des clients', en: 'Find customers' },
    ecouter: { fr: 'Écouter les clients', en: 'Listen to customers' },
    fideliser: { fr: 'Fidéliser', en: 'Keep customers' },
    partenaires: { fr: 'Fournisseurs et collègues', en: 'Suppliers and colleagues' },
  },
  modules: [
    {
      action: 'clients',
      niveau: 'essentiel',
      vues: [
        vue('clients', '/clients', ['ajouter un client', 'retrouver un client', 'faire un devis', 'créer un devis', 'trouver un contact', 'voir l’historique d’un client'], ['client', 'cliente', 'fiche', 'devis', 'crm', 'contact', 'répertoire', 'carnet d’adresses'], {
          en: { verbes: ['add a customer', 'find a customer', 'make a quote', 'create a quote'], motsCles: ['customer', 'client', 'contact', 'quote', 'estimate', 'crm'] },
        }),
      ],
    },
    {
      nom: { fr: 'Fiches contacts', en: 'Contact sheets' },
      action: 'clients',
      niveau: 'courant',
      vues: [
        vue('contactsFiches', '/contacts/fiches', ['retrouver une personne', 'voir ce que je sais d’un contact', 'préparer un échange avec une personne'], ['personne', 'contact', 'interlocuteur', 'carnet', 'fonction', 'préférences'], {
          en: { verbes: ['find a person', 'see what I know about a contact', 'prepare a conversation with a person'], motsCles: ['person', 'contact', 'phonebook', 'role', 'preferences'] },
          nouveau: {
            icone: Contact,
            ecran: () => import('../../contacts/personnes/PageContacts'),
            indice: { fr: 'Les personnes derrière tes clients : fonction, coordonnées, relation', en: 'The people behind your clients: role, details, relationship' },
          },
        }),
      ],
    },
    {
      action: 'clients',
      niveau: 'courant',
      vues: [
        vue('aftersales', '/sav', ['traiter une demande de SAV', 'répondre à une réclamation'], ['sav', 'après-vente', 'réclamation', 'panne', 'retour'], {
          en: { verbes: ['handle an after-sales request', 'answer a complaint'], motsCles: ['after-sales', 'complaint', 'breakdown', 'return', 'warranty'] },
        }),
      ],
    },
    {
      nom: { fr: 'Prospects et scoring', en: 'Leads and scoring' },
      action: 'prospecter',
      niveau: 'essentiel',
      vues: [
        vue('pipeline', '/pipeline', ['ajouter un prospect', 'suivre un prospect', 'faire avancer une affaire'], ['prospect', 'lead', 'pipeline', 'opportunité', 'affaire', 'vente', 'commercial'], {
          en: { verbes: ['add a lead', 'follow a lead', 'move a deal forward'], motsCles: ['lead', 'prospect', 'pipeline', 'opportunity', 'deal', 'sales'] },
        }),
        vue('leadScoring', '/scoring-leads', ['savoir quel prospect appeler', 'classer mes prospects'], ['scoring', 'score', 'lead', 'priorité'], {
          en: { verbes: ['know which lead to call', 'rank my leads'], motsCles: ['scoring', 'score', 'lead', 'priority'] },
        }),
      ],
    },
    {
      nom: { fr: 'Pipeline commercial', en: 'Sales pipeline' },
      action: 'prospecter',
      niveau: 'courant',
      vues: [
        vue('pipelineCommercial', '/pipeline-commercial', ['suivre mes opportunités', 'voir ce qui va se signer', 'fixer mon objectif du mois', 'voir la prévision de ventes'], ['entonnoir', 'opportunité', 'prévision', 'objectif du mois', 'signature'], {
          en: { verbes: ['follow my opportunities', 'see what is about to sign', 'set my goal for the month', 'see the sales forecast'], motsCles: ['funnel', 'opportunity', 'forecast', 'monthly goal', 'signature'] },
          nouveau: {
            icone: Filter,
            ecran: () => import('../../contacts/pipeline/PagePipeline'),
            indice: { fr: 'L’entonnoir des opportunités, de la prise de contact à la signature', en: 'The opportunity funnel, from first contact to signature' },
          },
        }),
      ],
    },
    {
      nom: { fr: 'Retours clients', en: 'Customer feedback' },
      action: 'ecouter',
      niveau: 'courant',
      vues: [
        vue('reviews', '/avis', ['demander un avis', 'lire les avis', 'répondre à un avis'], ['avis', 'note', 'étoiles', 'témoignage', 'google', 'trustpilot', 'e-réputation'], {
          en: { verbes: ['ask for a review', 'read the reviews'], motsCles: ['review', 'rating', 'stars', 'testimonial', 'feedback'] },
        }),
        vue('sentiment', '/sentiment', ['savoir ce que les clients disent', 'analyser les commentaires'], ['sentiment', 'opinion', 'retours'], {
          en: { verbes: ['see what customers say', 'analyze the comments'], motsCles: ['sentiment', 'opinion', 'feedback', 'mood'] },
        }),
        vue('nps', '/nps', ['mesurer la satisfaction', 'envoyer un questionnaire de satisfaction'], ['nps', 'satisfaction', 'recommandation', 'note'], {
          en: { verbes: ['measure satisfaction', 'send a satisfaction survey'], motsCles: ['nps', 'satisfaction', 'recommend', 'score', 'survey'] },
        }),
      ],
    },
    {
      nom: { fr: 'Fidélité et parrainage', en: 'Loyalty and referrals' },
      action: 'fideliser',
      niveau: 'courant',
      vues: [
        vue('loyalty', '/fidelite', ['tamponner une carte de fidélité', 'offrir une récompense'], ['fidélité', 'tampon', 'carte', 'récompense'], {
          en: { verbes: ['stamp a loyalty card', 'give a reward'], motsCles: ['loyalty', 'stamp', 'card', 'reward', 'points'] },
        }),
        vue('referrals', '/parrainage', ['noter un parrainage', 'récompenser un parrain'], ['parrainage', 'parrain', 'recommandation'], {
          en: { verbes: ['note a referral', 'reward a referrer'], motsCles: ['referral', 'referrer', 'recommendation', 'sponsor'] },
        }),
      ],
    },
    {
      nom: { fr: 'Niveaux de fidélité', en: 'Loyalty tiers' },
      action: 'fideliser',
      niveau: 'courant',
      vues: [
        vue('fideliteNiveaux', '/fidelite/niveaux', ['voir mes clients fidèles', 'offrir un avantage à un client', 'voir qui approche du palier suivant', 'récompenser ceux qui reviennent'], ['palier', 'bronze', 'argent', 'or', 'points', 'niveau', 'client fidèle'], {
          en: { verbes: ['see my loyal clients', 'give a perk to a client', 'see who is close to the next tier', 'reward those who come back'], motsCles: ['tier', 'bronze', 'silver', 'gold', 'points', 'level', 'loyal client'] },
          nouveau: {
            icone: Award,
            ecran: () => import('../../contacts/fidelite/PageFidelite'),
            indice: { fr: 'L’échelle des paliers : qui est Bronze, Argent ou Or', en: 'The tier ladder: who is Bronze, Silver or Gold' },
          },
        }),
      ],
    },
    {
      action: 'partenaires',
      niveau: 'courant',
      vues: [
        vue('suppliers', '/fournisseurs', ['ajouter un fournisseur', 'retrouver un fournisseur', 'comparer des fournisseurs'], ['fournisseur', 'achat', 'grossiste', 'approvisionnement'], {
          en: { verbes: ['add a supplier', 'find a supplier'], motsCles: ['supplier', 'vendor', 'wholesaler', 'purchasing'] },
        }),
      ],
    },
    {
      action: 'partenaires',
      niveau: 'courant',
      vues: [
        vue('directory', '/trombinoscope', ['retrouver un collègue', 'voir qui fait quoi'], ['trombinoscope', 'annuaire', 'collègue', 'équipe'], {
          en: { verbes: ['find a colleague', 'see who does what'], motsCles: ['directory', 'colleague', 'team', 'people', 'staff'] },
        }),
      ],
    },
  ],
});
