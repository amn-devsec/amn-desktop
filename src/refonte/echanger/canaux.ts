import { ms, MS_SECONDE, type Instant } from './commun';

/**
 * CANAUX (MX04) — la messagerie d'ÉQUIPE : non lus, réactions, fils, saisie en cours, message vers tâche. Logique pure.
 *
 * Les échanges internes passent ici, pas dans G07 (qui est la boîte des clients). Rien de secret n'est affiché ni
 * stocké dans un canal par l'application : « la connexion a expiré » reste une phrase, jamais une valeur. Pas
 * d'emoji : les réactions sont trois icônes du jeu d'icônes. Aucun compteur de messages par personne.
 */

export interface MessageDeCanal {
  id: string;
  canalId: string;
  auteurEmail: string;
  at: Instant;
  texte: string;
  /** Si le message répond à un autre (fil). */
  repondA?: string | null;
  mentions?: readonly string[];
}

export interface CanalDEquipe {
  id: string;
  nom: string;
  visibilite: 'public' | 'privé';
  membres: readonly string[];
  archive?: boolean;
}

/** Non lus = messages d'un autre, postérieurs à la dernière lecture de la personne. */
export function nonLus(messages: readonly MessageDeCanal[], dernierLecture: Instant | null, moi: string): number {
  return messages.filter((m) => m.auteurEmail !== moi && (dernierLecture === null || ms(m.at) > ms(dernierLecture))).length;
}

/** « 3 nouveaux messages » en bas du flux, pendant la lecture : ceux qui arrivent après la position de lecture. */
export const nouveauxPendantLaLecture = (messages: readonly MessageDeCanal[], luJusqua: Instant, moi: string): number => nonLus(messages, luJusqua, moi);

/** Un invité ne voit que les canaux dont il fait partie, et n'a pas de « Nouveau canal ». Les canaux archivés se masquent. */
export function canauxVisibles(canaux: readonly CanalDEquipe[], email: string, role: string): { canaux: CanalDEquipe[]; peutCreer: boolean } {
  const invite = role === 'Invité' || role === 'Partenaire';
  const visibles = canaux.filter((c) => !c.archive && (c.membres.includes(email) || (!invite && c.visibilite === 'public')));
  return { canaux: visibles, peutCreer: !invite };
}

/* ------------------------------ Événements de ticket ------------------------------ */

export interface EvenementDeTicket {
  /** La carte d'événement n'est pas un message : ni réaction, ni fil. */
  genre: 'evenement';
  ticketId: string;
  etat: 'urgent' | 'resolu';
  resoluAt?: Instant | null;
}

export const estUnMessage = (x: { genre?: string }): boolean => x.genre !== 'evenement';

/**
 * Quand un ticket est marqué urgent (H03) pour un client relié au canal, une carte d'événement est publiée ;
 * son état suit le ticket (« Résolu à 09:15 »).
 */
export function evenementDeTicket(ticket: { id: string; urgent: boolean; resoluAt?: Instant | null }, canalAlerte: boolean): EvenementDeTicket | null {
  if (!canalAlerte || (!ticket.urgent && !ticket.resoluAt)) return null;
  return { genre: 'evenement', ticketId: ticket.id, etat: ticket.resoluAt ? 'resolu' : 'urgent', resoluAt: ticket.resoluAt ?? null };
}

/* ------------------------------ Réactions ------------------------------ */

/** Trois icônes, pas d'emoji : coche « c'est fait », œil « je regarde », étoile « merci ». */
export const REACTIONS = ['coche', 'oeil', 'etoile'] as const;
export type Reaction = (typeof REACTIONS)[number];
export interface ReactionPosee {
  email: string;
  type: Reaction;
}

/** Une réaction par personne et par icône : la même la retire. Refuse un type inconnu. */
export function basculerReaction(reactions: readonly ReactionPosee[], email: string, type: Reaction): ReactionPosee[] {
  if (!(REACTIONS as readonly string[]).includes(type)) throw new Error(`réaction inconnue : ${String(type)}`);
  const existe = reactions.some((r) => r.email === email && r.type === type);
  return existe ? reactions.filter((r) => !(r.email === email && r.type === type)) : [...reactions, { email, type }];
}

/** Le nombre affiché = personnes, par icône. */
export const comptesDeReactions = (reactions: readonly ReactionPosee[]): Record<Reaction, number> => ({
  coche: reactions.filter((r) => r.type === 'coche').length,
  oeil: reactions.filter((r) => r.type === 'oeil').length,
  etoile: reactions.filter((r) => r.type === 'etoile').length,
});

/* ------------------------------ Fils de réponses ------------------------------ */

export interface ResumeDeFil {
  reponses: number;
  /** Heure de la dernière réponse. */
  derniereAt: number | null;
  /** Abonnés : l'auteur du message, ceux qui ont répondu, ceux qui sont mentionnés. */
  abonnes: string[];
}

export function resumeDeFil(message: MessageDeCanal, tous: readonly MessageDeCanal[]): ResumeDeFil {
  const reponses = tous.filter((m) => m.repondA === message.id).sort((a, b) => ms(a.at) - ms(b.at));
  const abonnes = new Set<string>([message.auteurEmail]);
  for (const r of reponses) {
    abonnes.add(r.auteurEmail);
    for (const x of r.mentions ?? []) abonnes.add(x);
  }
  for (const x of message.mentions ?? []) abonnes.add(x);
  return { reponses: reponses.length, derniereAt: reponses.length ? ms(reponses[reponses.length - 1].at) : null, abonnes: [...abonnes] };
}

/** Le résumé d'Ajmani d'un fil : trois phrases au plus, recalculé à chaque réponse (le nombre de réponses change = à refaire). */
export const RESUME_MAX_PHRASES = 3;
export const resumeAJour = (reponsesResumees: number, reponsesActuelles: number): boolean => reponsesResumees === reponsesActuelles;

/* ------------------------------ Saisie en cours, statut ------------------------------ */

/** « Quelqu'un est en train d'écrire » disparaît après 6 secondes sans frappe ; jamais le contenu, jamais gardé. */
export const SAISIE_EXPIRE_MS = 6 * MS_SECONDE;
export const quiEcrit = (frappes: readonly { email: string; tapeA: Instant }[], moi: string, maintenant: Instant): string[] => {
  const vus = new Set<string>();
  for (const f of frappes) {
    const age = ms(maintenant) - ms(f.tapeA);
    if (f.email !== moi && age >= 0 && age <= SAISIE_EXPIRE_MS) vus.add(f.email);
  }
  return [...vus];
};

export type StatutDeMessageDirect = { genre: 'concentre' } | { genre: 'ecrit' } | { genre: 'heure'; at: number | null };

/** « concentré » (statut choisi), « écrit… » (en train d'écrire), sinon l'heure du dernier message. */
export function statutDeMessageDirect(p: { concentre: boolean; tapeA?: Instant | null; dernierMessageAt?: Instant | null }, maintenant: Instant): StatutDeMessageDirect {
  if (p.concentre) return { genre: 'concentre' };
  if (p.tapeA != null && ms(maintenant) - ms(p.tapeA) <= SAISIE_EXPIRE_MS && ms(maintenant) >= ms(p.tapeA)) return { genre: 'ecrit' };
  return { genre: 'heure', at: p.dernierMessageAt != null ? ms(p.dernierMessageAt) : null };
}

/** La coche transforme le message en tâche : le texte, l'auteur, et le message d'origine par son identifiant (jamais une adresse). */
export function tacheDepuisMessage(m: MessageDeCanal): { titre: string; auteurEmail: string; messageId: string; canalId: string } {
  return { titre: m.texte.trim().split(/\n/)[0].slice(0, 140), auteurEmail: m.auteurEmail, messageId: m.id, canalId: m.canalId };
}
