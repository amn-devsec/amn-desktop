import { ms, type Instant } from './commun';

/**
 * COURRIEL (MX01) — la boîte partagée : fils, dossiers, présence, résumé d'Ajmani, pièces jointes. Logique pure.
 *
 * La connexion à la boîte (serveur, identifiants, jetons) se règle dans les connecteurs (H21). Aucune clé, aucun mot
 * de passe, aucun jeton, aucune adresse de serveur n'est affiché ni stocké ici, même dans un message d'erreur.
 * Aucun compteur de messages traités par personne, aucun minuteur de réponse.
 */

export interface MessageDeCourriel {
  id: string;
  filId: string;
  de: string;
  a: readonly string[];
  at: Instant;
  lu: boolean;
  /** Pièce jointe : analysée côté serveur ; jamais ouverte sans analyse. */
  piecesJointes?: readonly { nom: string; analyse: 'en-cours' | 'sans-risque' | 'dangereuse' }[];
  organisation?: string | null;
  programmeAt?: Instant | null;
  assigneA?: string | null;
  /** Étiquettes posées sur le message (MX01, image v4 : Urgent, À facturer, En attente client). */
  etiquettes?: readonly string[];
}

export interface FilDeCourriel {
  filId: string;
  /** Nombre de messages du fil. */
  messages: number;
  nonLu: boolean;
  dernierAt: number;
  aMoi: boolean;
  avecPieceJointe: boolean;
  /** Messages déployés dans la conversation : le dernier, et tout message non lu plus ancien. */
  deplies: string[];
  replies: string[];
}

export function composerFils(messages: readonly MessageDeCourriel[], moi: string, mesAdresses: readonly string[] = [moi]): FilDeCourriel[] {
  const parFil = new Map<string, MessageDeCourriel[]>();
  for (const m of messages) if (!m.programmeAt) parFil.set(m.filId, [...(parFil.get(m.filId) ?? []), m]);
  const out: FilDeCourriel[] = [];
  for (const [filId, liste] of parFil) {
    const tri = [...liste].sort((a, b) => ms(a.at) - ms(b.at) || a.id.localeCompare(b.id));
    const dernier = tri[tri.length - 1];
    const deplies = new Set<string>([dernier.id, ...tri.filter((m) => !m.lu).map((m) => m.id)]);
    out.push({
      filId,
      messages: tri.length,
      nonLu: tri.some((m) => !m.lu),
      dernierAt: ms(dernier.at),
      aMoi: tri.some((m) => m.assigneA === moi || m.a.some((x) => mesAdresses.includes(x))),
      avecPieceJointe: tri.some((m) => (m.piecesJointes?.length ?? 0) > 0),
      deplies: tri.filter((m) => deplies.has(m.id)).map((m) => m.id),
      replies: tri.filter((m) => !deplies.has(m.id)).map((m) => m.id),
    });
  }
  return out.sort((a, b) => b.dernierAt - a.dernierAt || a.filId.localeCompare(b.filId));
}

/** Les dossiers : « Clients » et « Partenaires » sont des filtres automatiques (Proposition), sans déplacer les fils. */
export type DossierAutomatique = 'clients' | 'partenaires';
export function dossiersAutomatiques(messages: readonly MessageDeCourriel[], typeDOrganisation: Readonly<Record<string, 'client' | 'partenaire'>>): Record<DossierAutomatique | 'programmes', number> {
  const fils = (type: 'client' | 'partenaire') => new Set(messages.filter((m) => m.organisation && typeDOrganisation[m.organisation] === type).map((m) => m.filId)).size;
  return { clients: fils('client'), partenaires: fils('partenaire'), programmes: messages.filter((m) => !!m.programmeAt).length };
}

/* ------------------------------ Présence et résumé ------------------------------ */

/** « Dans la boîte » : qui lit ou écrit quoi, en ce moment, pour éviter les doubles réponses. Rien n'est gardé. */
export function dansLaBoite(presences: readonly { email: string; filId: string; mode: 'lit' | 'ecrit' }[], moi: string): { email: string; filId: string; mode: 'lit' | 'ecrit' }[] {
  return presences.filter((p) => p.email !== moi);
}

/** Le résumé d'Ajmani est généré quand le fil a au moins 3 messages ou sur demande explicite. */
export const MESSAGES_POUR_RESUMER = 3;
export const resumeAGenerer = (messagesDuFil: number, demande = false): boolean => demande || messagesDuFil >= MESSAGES_POUR_RESUMER;

/** Les demandes d'un message : phrases interrogatives, ou impératives adressées à l'équipe. */
export function demandesDuMessage(texte: string): string[] {
  return texte
    .split(/(?<=[.!?])\s+|\n+/)
    .map((p) => p.trim())
    .filter((p) => p && (/\?$/.test(p) || /^(?:merci de|pouvez-vous|peux-tu|pourriez-vous|veuillez|il faudrait|j['’]aimerais|nous aimerions|pouvons-nous)\b/i.test(p)));
}

/** Le brouillon est préparé quand le résumé contient des demandes ; il n'est jamais envoyé seul. */
export const brouillonAPreparer = (demandes: number): boolean => demandes > 0;
export const brouillonPartSeul = (): false => false;

/* ------------------------------ Pièces jointes, connexion ------------------------------ */

export type EtatDePieceJointe = 'en-cours' | 'sans-risque' | 'dangereuse';
/** Jamais ouverte sans analyse : seule « sans risque » s'ouvre ; une dangereuse est bloquée. */
export const peutOuvrir = (analyse: EtatDePieceJointe): boolean => analyse === 'sans-risque';

export type EtatDeLaBoite = 'reliee' | 'perdue' | 'a-brancher';
/** Connexion perdue : « La boîte n'est plus reliée. » + « Vérifier la connexion » (H21) ; les messages déjà chargés restent lisibles. */
export const peutLire = (etat: EtatDeLaBoite, dejaCharges: number): boolean => etat === 'reliee' || (etat === 'perdue' && dejaCharges > 0);

/** Les envois programmés : en attente d'une heure choisie, du plus proche au plus lointain. */
export const programmes = (messages: readonly MessageDeCourriel[]): MessageDeCourriel[] =>
  messages.filter((m) => !!m.programmeAt).sort((a, b) => ms(a.programmeAt as Instant) - ms(b.programmeAt as Instant));


/** Les étiquettes de départ de la boîte partagée (image v4). Modifiables ; ce sont des clés, le texte est dans i18n. */
export const ETIQUETTES_PAR_DEFAUT = ['urgent', 'a-facturer', 'en-attente-client'] as const;

/** Fils portant chaque étiquette (un fil compte une fois, même si plusieurs messages la portent). Les programmés n'y sont pas. */
export function compterEtiquettes(messages: readonly MessageDeCourriel[], etiquettes: readonly string[] = ETIQUETTES_PAR_DEFAUT): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of etiquettes) out[e] = new Set(messages.filter((m) => !m.programmeAt && (m.etiquettes ?? []).includes(e)).map((m) => m.filId)).size;
  return out;
}
