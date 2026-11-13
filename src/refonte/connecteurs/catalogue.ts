import type { Categorie, CategorieId, Droit, OptionConnecteur } from './types';

/**
 * LE CATALOGUE — les 14 catégories du §4 de PLAN-10NOV, local d'abord, puis
 * « Événements reçus » (Webhooks), ajoutée par le CO (STATUT §1.22).
 *
 * Chaque catégorie a TOUJOURS une version locale (gratuite, sur le poste ou
 * sur notre serveur). Ses options sont des prises de H21 :
 *   · `chez-nous` : une brique à nous à brancher (boîte de l'équipe, passerelle
 *     SMS…), gratuite, qui reste du mode local ;
 *   · `service`   : un service externe facultatif, au tarif relevé.
 *
 * TARIFS : tous `a-relever`. Le plan demande de les relever « au moment de
 * construire », sur la page publique de chaque service, avec la source et la
 * date. Tant qu'un tarif n'est pas relevé, le coût ne peut pas s'afficher et
 * le connecteur ne peut pas s'activer (`cycle.ts`). C'est voulu : un chiffre
 * inventé serait pire qu'un bouton grisé. Le relevé se fait dans `tarifs.ts`,
 * seul endroit où un montant entre dans le modèle.
 *
 * `existant` cite les fichiers du dépôt qui portent déjà la version locale
 * (relevé du 12 nov., à la main) ; `attendDAmnApi` renvoie à `amnApi.ts`.
 */

const A_RELEVER = { etat: 'a-relever' } as const;

function option(id: string, nom: string, droits: readonly Droit[]): OptionConnecteur {
  return { id, nature: 'service', nom, tarif: A_RELEVER, droits };
}

function chezNous(id: string, nom: string, droits: readonly Droit[]): OptionConnecteur {
  return { id, nature: 'chez-nous', nom, tarif: { etat: 'chez-nous' }, droits };
}

export const CATALOGUE: readonly Categorie[] = [
  {
    id: 'messagerie',
    nom: 'categorie.messagerie',
    local: {
      nom: 'local.messagerie.nom',
      description: 'local.messagerie.description',
      disponibilite: 'partielle',
      existant: ['src/lib/relances.ts', 'src/screens/RemindersScreen.tsx', 'src/state/useMessageTemplates.ts', 'src/lib/fileEnvoi.ts'],
      attendDAmnApi: ['smtp-serveur', 'imap-serveur'],
    },
    options: [
      chezNous('boite-equipe', 'Boîte de l’équipe (IMAP et SMTP)', ['lecture', 'envoi']),
      option('brevo', 'Brevo', ['envoi']),
      option('mailjet', 'Mailjet', ['envoi']),
      option('postmark', 'Postmark', ['envoi']),
      option('resend', 'Resend', ['envoi']),
      option('gmail', 'Gmail', ['lecture']),
    ],
    droitsInterdits: [],
  },
  {
    id: 'agenda',
    nom: 'categorie.agenda',
    local: {
      nom: 'local.agenda.nom',
      description: 'local.agenda.description',
      disponibilite: 'partielle',
      existant: ['src/state/useAppointments.ts', 'src/lib/calendar.ts', 'docs/google-agenda.md'],
      attendDAmnApi: ['caldav-serveur'],
    },
    options: [
      chezNous('caldav', 'CalDAV sur notre serveur', ['lecture', 'ajout']),
      option('google-agenda', 'Google Agenda', ['lecture', 'ajout']),
      option('microsoft-365', 'Microsoft 365', ['lecture', 'ajout']),
    ],
    droitsInterdits: [],
  },
  {
    id: 'paiement',
    nom: 'categorie.paiement',
    local: {
      nom: 'local.paiement.nom',
      description: 'local.paiement.description',
      disponibilite: 'partielle',
      existant: ['src/state/useInvoices.ts', 'src/lib/qr.ts'],
      attendDAmnApi: [],
    },
    options: [
      option('stripe', 'Stripe', ['lecture']),
      option('mollie', 'Mollie', ['lecture']),
      option('sumup', 'SumUp', ['lecture']),
      option('gocardless', 'GoCardless', ['lecture']),
    ],
    droitsInterdits: [],
  },
  {
    id: 'banque',
    nom: 'categorie.banque',
    local: {
      nom: 'local.banque.nom',
      description: 'local.banque.description',
      disponibilite: 'a-construire',
      existant: [],
      attendDAmnApi: [],
    },
    // Lecture seule, toujours : jamais de virement (décision confirmée, PLAN §4).
    options: [option('agregateur-dsp2', 'Agrégateur bancaire (DSP2, lecture seule)', ['lecture'])],
    droitsInterdits: ['ajout', 'ecriture', 'envoi'],
  },
  {
    id: 'stockage',
    nom: 'categorie.stockage',
    local: {
      nom: 'local.stockage.nom',
      description: 'local.stockage.description',
      disponibilite: 'partielle',
      existant: ['src/lib/backup.ts', 'src/lib/backupInspect.ts'],
      attendDAmnApi: ['sauvegarde-serveur'],
    },
    options: [
      chezNous('stockage-serveur', 'Stockage sur notre serveur', ['ecriture']),
      option('s3-ue', 'Stockage objet S3 (UE)', ['ecriture']),
      option('google-drive', 'Google Drive', ['ecriture']),
      option('dropbox', 'Dropbox', ['ecriture']),
    ],
    droitsInterdits: [],
  },
  {
    id: 'hebergement',
    nom: 'categorie.hebergement',
    local: {
      nom: 'local.hebergement.nom',
      description: 'local.hebergement.description',
      disponibilite: 'a-construire',
      existant: ['src/lib/siteStatus.ts'],
      attendDAmnApi: ['etat-serveur'],
    },
    options: [
      chezNous('serveur-maison', 'Notre serveur', ['lecture']),
      option('vercel', 'Vercel', ['lecture']),
      option('render', 'Render', ['lecture']),
      option('netlify', 'Netlify', ['lecture']),
    ],
    droitsInterdits: [],
  },
  {
    id: 'code',
    nom: 'categorie.code',
    local: {
      nom: 'local.code.nom',
      description: 'local.code.description',
      disponibilite: 'a-construire',
      existant: [],
      attendDAmnApi: [],
    },
    options: [chezNous('forge', 'Forge sur notre serveur (Forgejo, Gitea)', ['lecture']), option('github', 'GitHub', ['lecture']), option('gitlab', 'GitLab', ['lecture'])],
    droitsInterdits: [],
  },
  {
    id: 'notifications',
    nom: 'categorie.notifications',
    local: {
      nom: 'local.notifications.nom',
      description: 'local.notifications.description',
      disponibilite: 'prete',
      existant: ['src/lib/webPush.ts'],
      attendDAmnApi: [],
    },
    options: [chezNous('ntfy', 'ntfy sur notre serveur', ['envoi']), option('notification-mobile', 'Service de notification mobile', ['envoi']), option('slack', 'Slack', ['envoi'])],
    droitsInterdits: [],
  },
  {
    id: 'sms',
    nom: 'categorie.sms',
    local: {
      nom: 'local.sms.nom',
      description: 'local.sms.description',
      disponibilite: 'a-construire',
      existant: [],
      attendDAmnApi: ['passerelle-sms'],
    },
    options: [
      chezNous('passerelle-sms', 'Passerelle SMS (téléphone de l’équipe)', ['envoi']),
      option('ovh-sms', 'OVHcloud SMS', ['envoi']),
      option('brevo-sms', 'Brevo SMS', ['envoi']),
      option('twilio', 'Twilio', ['envoi']),
    ],
    droitsInterdits: [],
  },
  {
    id: 'whatsapp',
    nom: 'categorie.whatsapp',
    local: {
      nom: 'local.whatsapp.nom',
      description: 'local.whatsapp.description',
      disponibilite: 'a-construire',
      existant: [],
      attendDAmnApi: [],
    },
    options: [option('whatsapp-business', 'WhatsApp Business Platform (via un fournisseur)', ['lecture', 'envoi'])],
    droitsInterdits: [],
  },
  {
    id: 'telephonie',
    nom: 'categorie.telephonie',
    local: {
      nom: 'local.telephonie.nom',
      description: 'local.telephonie.description',
      disponibilite: 'prete',
      existant: ['src/state/CallContext.tsx', 'src/lib/serveursIce.ts'],
      attendDAmnApi: [],
    },
    options: [option('ligne-sip', 'Ligne SIP', ['envoi', 'reception'])],
    droitsInterdits: [],
  },
  {
    id: 'signature',
    nom: 'categorie.signature',
    local: {
      nom: 'local.signature.nom',
      description: 'local.signature.description',
      disponibilite: 'prete',
      existant: ['src/screens/SignatureScreen.tsx', 'src/screens/SignatureDistanceScreen.tsx'],
      attendDAmnApi: [],
    },
    options: [option('yousign', 'Yousign', ['ajout']), option('docusign', 'Docusign', ['ajout'])],
    droitsInterdits: [],
  },
  {
    id: 'assistant',
    nom: 'categorie.assistant',
    local: {
      nom: 'local.assistant.nom',
      description: 'local.assistant.description',
      disponibilite: 'prete',
      existant: ['src/components/settings/OllamaSection.tsx', 'src/preload.exclusive.internal.ts'],
      attendDAmnApi: [],
    },
    options: [option('modele-en-ligne', 'API d’un modèle en ligne', ['envoi'])],
    droitsInterdits: [],
  },
  {
    id: 'comptabilite',
    nom: 'categorie.comptabilite',
    local: {
      nom: 'local.comptabilite.nom',
      description: 'local.comptabilite.description',
      disponibilite: 'prete',
      existant: ['src/lib/fec.ts'],
      attendDAmnApi: [],
    },
    options: [option('logiciel-comptable', 'Logiciel comptable en ligne', ['ecriture'])],
    droitsInterdits: [],
  },
  // Hors §4 : décision du CO (STATUT §1.22). Les webhooks sont la brique « événements reçus »
  // d'amn-api, affichée comme une prise « chez nous ». Aucun service externe : rien à payer.
  {
    id: 'evenements',
    nom: 'categorie.evenements',
    local: {
      nom: 'local.evenements.nom',
      description: 'local.evenements.description',
      disponibilite: 'a-construire',
      existant: [],
      attendDAmnApi: ['webhooks-entrants'],
    },
    options: [chezNous('webhooks', 'Webhooks', ['reception'])],
    droitsInterdits: ['ajout', 'ecriture', 'envoi'],
  },
];

/** Les catégories du §4 du plan (les 14 premières) ; les suivantes viennent d'une décision du CO. */
export const NOMBRE_DE_CATEGORIES_DU_PLAN = 14;

/** L'ordre du catalogue, pour les listes par catégorie (DEV-couts). */
export const ORDRE_DES_CATEGORIES: readonly CategorieId[] = CATALOGUE.map((c) => c.id);

export function categorie(id: CategorieId): Categorie {
  const trouvee = CATALOGUE.find((c) => c.id === id);
  if (!trouvee) throw new Error(`catégorie inconnue : ${id}`);
  return trouvee;
}

export function optionDe(categorieId: CategorieId, optionId: string, catalogue: readonly Categorie[] = CATALOGUE): OptionConnecteur | null {
  return catalogue.find((c) => c.id === categorieId)?.options.find((o) => o.id === optionId) ?? null;
}

/** Le numéro de prise affiché (« P01 »). */
export function numeroDePrise(prise: number): string {
  return `P${String(prise).padStart(2, '0')}`;
}
