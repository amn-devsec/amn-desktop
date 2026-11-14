import { VALEURS_DE_DEPART } from '../connecteurs/reglages';
import { ajouterJours, estJourOuvre, instantParis, jourDe, ms, partiesParis, pourcent, MS_MINUTE, type Instant, type Jour } from './commun';

/**
 * LA BOÎTE DES CLIENTS (G07) — un fil par client, trois couloirs, la Boîte à zéro. Logique pure.
 *
 * G07 est la boîte des CLIENTS (courriel, WhatsApp, SMS) ; les échanges internes passent par Canaux (MX04).
 * Les messages internes de l'équipe n'entrent jamais ici. Le module existant garde sa logique d'envoi et de
 * lecture ; ces règles ajoutent le tri, l'attente et la série (Propositions de la fiche, nommées dans le code).
 */

export type CanalDeMessage = 'courriel' | 'whatsapp' | 'sms';

export interface MessageDeFil {
  id: string;
  /** Le client du fil, ou `null` pour un expéditeur inconnu (voir `rattacher`). */
  clientId: string | number | null;
  /** Pour un expéditeur inconnu : son adresse ou son numéro, qui sert de clé de fil. */
  expediteur?: string;
  canal: CanalDeMessage;
  sens: 'entrant' | 'sortant';
  at: Instant;
  lu: boolean;
  /** Note interne : visible de l'équipe seulement, jamais envoyée ni exportée chez un client. */
  noteInterne?: boolean;
}

/** L'état de tri posé par un geste : « En attente » (A) ou « Fait » (E). */
export interface GesteDeTri {
  filId: string;
  etat: 'en-attente' | 'fait';
  at: Instant;
  /** Ce qu'on attend (texte saisi ou proposé par Ajmani), ou la date de relance prévue. */
  attend?: string;
  relanceLe?: Jour;
  /** Depuis quand on attend le client (image v4 : « depuis 2 j ») : le devis est parti il y a deux jours, le fil est mis « En attente » ce matin. Absent : depuis le geste. */
  depuisLe?: Instant;
}

export type Couloir = 'a-repondre' | 'en-attente' | 'fait';

export interface Horaires {
  /** Jours ISO (1 = lundi … 7 = dimanche). */
  jours: readonly number[];
  /** Minutes depuis minuit. */
  debut: number;
  fin: number;
}
const enMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
/**
 * Les heures ouvrées (MX06 §6) : UNE seule source, la plage « clients » de `connecteurs/reglages.ts`
 * (lundi à vendredi, 09:00–18:00, décision du CO, STATUT §1.32 n° 3). Rien n'est recopié ici.
 */
export function horairesDepuis(plage: { jours: readonly number[]; debut: string; fin: string }): Horaires {
  return { jours: plage.jours, debut: enMinutes(plage.debut), fin: enMinutes(plage.fin) };
}
export const HORAIRES_PAR_DEFAUT: Horaires = horairesDepuis(VALEURS_DE_DEPART.plageClients);
/** La promesse : 2 heures ouvrées (G07 §6, F40 §6), réglable dans « Règles de tri ». */
export const PROMESSE_MINUTES = 120;
/** La fin de la journée de travail : 19 h (G07 §6, Proposition), réglable. */
export const FIN_DE_JOURNEE_MIN = 19 * 60;

export const cleDeFil = (m: Pick<MessageDeFil, 'clientId' | 'expediteur'>): string => (m.clientId !== null ? `client:${m.clientId}` : `inconnu:${m.expediteur ?? '?'}`);

/* ------------------------------ Rattachement ------------------------------ */

export interface FicheDeContact {
  clientId: string | number;
  emails: readonly string[];
  telephones: readonly string[];
}

const chiffres = (t: string): string => t.replace(/\D/g, '');
/** Compare deux numéros sur leurs 9 derniers chiffres : « 06 39 98 00 01 » et « +33 6 39 98 00 01 » sont le même. */
export const memeTelephone = (a: string, b: string): boolean => {
  const x = chiffres(a);
  const y = chiffres(b);
  return x.length >= 9 && y.length >= 9 && x.slice(-9) === y.slice(-9);
};

/**
 * Le client d'un expéditeur : par adresse ou numéro connus dans les fiches (Proposition). Un inconnu arrive dans
 * « À répondre » avec une tuile « ? » et l'action « Rattacher à un client » : `null` ici.
 */
export function rattacher(expediteur: string, fiches: readonly FicheDeContact[]): string | number | null {
  const e = expediteur.trim().toLowerCase();
  const f = fiches.find((x) => x.emails.some((m) => m.toLowerCase() === e) || x.telephones.some((t) => memeTelephone(t, e)));
  return f ? f.clientId : null;
}

/* ------------------------------ Heures ouvrées ------------------------------ */

/** Minutes ouvrées entre deux instants (dans les horaires, heure de Paris). Zéro si `fin` ≤ `debut`. */
export function minutesOuvrees(debut: Instant, fin: Instant, horaires: Horaires = HORAIRES_PAR_DEFAUT): number {
  const a = ms(debut);
  const b = ms(fin);
  if (b <= a) return 0;
  let total = 0;
  for (let j = partiesParis(a).jour; j <= partiesParis(b).jour; j = ajouterJours(j, 1)) {
    if (!horaires.jours.includes(partiesParis(instantParis(j, 12 * 60)).jourSemaine)) continue;
    const d = Math.max(a, instantParis(j, horaires.debut));
    const f = Math.min(b, instantParis(j, horaires.fin));
    if (f > d) total += (f - d) / MS_MINUTE;
  }
  return Math.round(total);
}

/* ------------------------------ Les fils et leurs couloirs ------------------------------ */

export interface Fil {
  filId: string;
  clientId: string | number | null;
  couloir: Couloir | null;
  canalDuDernier: CanalDeMessage;
  /** Le plus ancien message du client sans réponse, pour le temps d'attente. `null` hors « À répondre ». */
  enAttenteDepuis: number | null;
  dernierAt: number;
  nonLus: number;
  attend?: string;
  relanceLe?: Jour;
  /** « En attente » : depuis quand la balle est chez le client (le geste, ou `depuisLe`, ou le dernier message envoyé). `null` hors « En attente ». */
  attendDepuis: number | null;
  /** Un expéditeur inconnu : tuile « ? » et « Rattacher à un client ». */
  inconnu: boolean;
}

/**
 * Trie les messages en fils et en couloirs.
 *
 *   · À RÉPONDRE : le dernier message (hors note interne) vient du client, et aucun geste « Fait » ou « En attente »
 *     ne l'a pris en compte depuis. Le plus ancien d'abord.
 *   · EN ATTENTE : l'équipe a répondu ou posé une question, ou posé « En attente » (A), et le client n'a rien dit depuis.
 *     Un nouveau message du client fait revenir le fil dans « À répondre ».
 *   · FAIT : traité aujourd'hui (geste « Fait » ou réponse envoyée). Remis à zéro chaque nuit : un fil traité hier
 *     n'est dans aucun couloir (`couloir: null`) ; l'historique reste dans le fil.
 */
export function composerFils(messages: readonly MessageDeFil[], gestes: readonly GesteDeTri[], maintenant: Instant): Fil[] {
  const auj = jourDe(maintenant);
  const parFil = new Map<string, MessageDeFil[]>();
  for (const m of messages) parFil.set(cleDeFil(m), [...(parFil.get(cleDeFil(m)) ?? []), m]);
  const fils: Fil[] = [];
  for (const [filId, liste] of parFil) {
    const vrais = liste.filter((m) => !m.noteInterne).sort((a, b) => ms(a.at) - ms(b.at) || a.id.localeCompare(b.id));
    if (!vrais.length) continue;
    const dernier = vrais[vrais.length - 1];
    const geste = gestes.filter((g) => g.filId === filId).sort((a, b) => ms(b.at) - ms(a.at))[0];
    const apres = (g: GesteDeTri | undefined) => !!g && ms(g.at) >= ms(dernier.at);
    // Les messages du client sans réponse : tous ceux d'après la dernière réponse de l'équipe.
    const dernierSortant = [...vrais].reverse().find((m) => m.sens === 'sortant');
    const sansReponse = vrais.filter((m) => m.sens === 'entrant' && (!dernierSortant || ms(m.at) > ms(dernierSortant.at)));
    let couloir: Couloir | null;
    if (dernier.sens === 'entrant' && !apres(geste)) couloir = 'a-repondre';
    else if (geste && apres(geste) && geste.etat === 'en-attente') couloir = 'en-attente';
    else if (geste && apres(geste) && geste.etat === 'fait') couloir = jourDe(geste.at) === auj ? 'fait' : null;
    else if (dernier.sens === 'sortant') couloir = jourDe(dernier.at) === auj ? 'fait' : 'en-attente';
    else couloir = null;
    fils.push({
      filId,
      clientId: dernier.clientId,
      couloir,
      canalDuDernier: dernier.canal,
      enAttenteDepuis: couloir === 'a-repondre' ? ms(sansReponse.length ? sansReponse[0].at : dernier.at) : null,
      dernierAt: ms(dernier.at),
      attendDepuis: couloir === 'en-attente' ? ms(geste && apres(geste) ? (geste.depuisLe ?? geste.at) : dernier.at) : null,
      nonLus: vrais.filter((m) => m.sens === 'entrant' && !m.lu).length,
      ...(geste?.attend ? { attend: geste.attend } : {}),
      ...(geste?.relanceLe ? { relanceLe: geste.relanceLe } : {}),
      inconnu: dernier.clientId === null,
    });
  }
  return fils;
}

/** Le couloir « À répondre » : le plus ancien d'abord (celui qui attend depuis le plus longtemps). */
export const aRepondre = (fils: readonly Fil[]): Fil[] =>
  fils.filter((f) => f.couloir === 'a-repondre').sort((a, b) => (a.enAttenteDepuis as number) - (b.enAttenteDepuis as number) || a.filId.localeCompare(b.filId));

/** Le badge de la barre latérale = nombre de fils à répondre. */
export const badgeDeLaMessagerie = (fils: readonly Fil[]): number => fils.filter((f) => f.couloir === 'a-repondre').length;

export interface Attente {
  /** Le temps réel écoulé, pour l'affichage (« 6 min », « 1 h 05 »). */
  ms: number;
  /** Au-delà de la promesse, en minutes ouvrées : orange, jamais rouge. */
  depasse: boolean;
}

/** Le temps d'attente compte le PLUS ANCIEN message sans réponse, pas le dernier. */
export function attente(f: Pick<Fil, 'enAttenteDepuis'>, maintenant: Instant, options: { promesseMinutes?: number; horaires?: Horaires } = {}): Attente | null {
  if (f.enAttenteDepuis === null) return null;
  const promesse = options.promesseMinutes ?? PROMESSE_MINUTES;
  return { ms: Math.max(0, ms(maintenant) - f.enAttenteDepuis), depasse: minutesOuvrees(f.enAttenteDepuis, maintenant, options.horaires) > promesse };
}

/** Les filtres de canal : les fils du jour comptés par canal du dernier message. Ils filtrent les trois couloirs. */
export function compteursParCanal(fils: readonly Fil[]): Record<CanalDeMessage | 'tous', number> {
  const c = { tous: 0, courriel: 0, whatsapp: 0, sms: 0 };
  for (const f of fils) {
    if (f.couloir === null) continue;
    c.tous += 1;
    c[f.canalDuDernier] += 1;
  }
  return c;
}

/* ------------------------------ La Boîte à zéro ------------------------------ */

export interface BoiteAZero {
  /** Les fils du jour : ceux qui ont écrit aujourd'hui, plus ceux qui attendent encore une réponse (de n'importe quand). */
  total: number;
  faits: number;
  /** « Chez eux » : la balle est chez le client. */
  chezEux: number;
  aRepondre: number;
  /** faits + en attente. */
  valeur: number;
  /** valeur / total, en %. */
  pourcent: number;
  /** Un carré par fil du jour, dans l'ordre : fait, en attente, à répondre. */
  carres: ('fait' | 'en-attente' | 'a-repondre')[];
  /** Atteinte : rien à répondre. Sans message du jour : « 0 sur 0 », journée calme. */
  atteinte: boolean;
  calme: boolean;
}

export function boiteAZero(messages: readonly MessageDeFil[], fils: readonly Fil[], maintenant: Instant): BoiteAZero {
  const auj = jourDe(maintenant);
  const ecritsAujourdhui = new Set(messages.filter((m) => !m.noteInterne && m.sens === 'entrant' && jourDe(m.at) === auj).map(cleDeFil));
  const duJour = fils.filter((f) => f.couloir !== null && (ecritsAujourdhui.has(f.filId) || f.couloir === 'a-repondre'));
  const n = (c: Couloir) => duJour.filter((f) => f.couloir === c).length;
  const faits = n('fait');
  const chezEux = n('en-attente');
  const aRep = n('a-repondre');
  const total = duJour.length;
  return {
    total,
    faits,
    chezEux,
    aRepondre: aRep,
    valeur: faits + chezEux,
    pourcent: pourcent(faits + chezEux, total),
    carres: [...Array<'fait'>(faits).fill('fait'), ...Array<'en-attente'>(chezEux).fill('en-attente'), ...Array<'a-repondre'>(aRep).fill('a-repondre')],
    atteinte: aRep === 0 && total > 0,
    calme: total === 0,
  };
}

/* ------------------------------ La belle série ------------------------------ */

export interface SoirDeBoite {
  jour: Jour;
  /** Fils « À répondre » restants à la fin de la journée de travail (19 h). */
  aRepondreALaFin: number;
}

export interface SerieDeSoirs {
  /** Soirs de suite à zéro, jours ouvrés seulement. */
  serie: number;
  /** Une case par jour ouvré de la semaine. */
  semaine: { jour: Jour; etat: 'zero' | 'manque' | 'aujourdhui' | 'a-venir' }[];
}

/**
 * Soirs consécutifs (jours ouvrés) terminés avec 0 « À répondre ». Aujourd'hui compte seulement une fois la fin de
 * journée passée. Une journée manquée remet la série à zéro, sans message négatif. Les jours non ouvrés sont sautés.
 */
export function serieDeSoirs(soirs: readonly SoirDeBoite[], maintenant: Instant, finDeJourneeMin = FIN_DE_JOURNEE_MIN): SerieDeSoirs {
  const p = partiesParis(maintenant);
  const parJour = new Map(soirs.map((s) => [s.jour, s.aRepondreALaFin]));
  const aujourdhuiFini = p.minutes >= finDeJourneeMin;
  let j = aujourdhuiFini ? p.jour : ajouterJours(p.jour, -1);
  let serie = 0;
  for (let garde = 0; garde < 400; garde += 1, j = ajouterJours(j, -1)) {
    if (!estJourOuvre(j)) continue;
    if ((parJour.get(j) ?? -1) === 0) serie += 1;
    else break;
  }
  const lundi = ajouterJours(p.jour, 1 - p.jourSemaine);
  const semaine = Array.from({ length: 5 }, (_, i) => {
    const jour = ajouterJours(lundi, i);
    const v = parJour.get(jour);
    const etat: SerieDeSoirs['semaine'][number]['etat'] = jour === p.jour && !aujourdhuiFini ? 'aujourdhui' : jour > p.jour ? 'a-venir' : v === 0 ? 'zero' : 'manque';
    return { jour, etat };
  });
  return { serie, semaine };
}

/* ------------------------------ Le contexte client ------------------------------ */

export interface DonneesDeContexte {
  contrat?: { actif: boolean; echeance?: Jour } | null;
  dernierPassage?: { le: Jour; par: string } | null;
  facturesEnRetard?: { nombre: number; montantCents: number } | null;
  prochaineEcheance?: Jour | null;
  creneauxLibres?: readonly string[] | null;
}

export type CelluleDeContexte =
  | { cle: 'contrat'; ton: 'neutre'; valeur: { echeance?: Jour } | null }
  | { cle: 'passage'; ton: 'neutre'; valeur: { le: Jour; par: string } | null }
  | { cle: 'factures'; ton: 'vert' | 'orange'; valeur: { nombre: number; montantCents: number; prochaineEcheance?: Jour } | null }
  | { cle: 'creneaux'; ton: 'neutre'; valeur: readonly string[] | null };

/**
 * Les quatre cellules de la bande de contexte. Une donnée qui manque donne `valeur: null` — l'écran écrit
 * « Rien à signaler » plutôt qu'un vide. Factures : « Rien en retard » en vert (avec la prochaine échéance) ou
 * « N impayée(s) » en orange avec le montant.
 */
export function contexteClient(d: DonneesDeContexte): CelluleDeContexte[] {
  const retard = d.facturesEnRetard && d.facturesEnRetard.nombre > 0 ? d.facturesEnRetard : null;
  return [
    { cle: 'contrat', ton: 'neutre', valeur: d.contrat?.actif ? { echeance: d.contrat.echeance } : null },
    { cle: 'passage', ton: 'neutre', valeur: d.dernierPassage ?? null },
    { cle: 'factures', ton: retard ? 'orange' : 'vert', valeur: retard ? { ...retard } : d.prochaineEcheance ? { nombre: 0, montantCents: 0, prochaineEcheance: d.prochaineEcheance } : d.facturesEnRetard ? { nombre: 0, montantCents: 0 } : null },
    { cle: 'creneaux', ton: 'neutre', valeur: d.creneauxLibres && d.creneauxLibres.length ? d.creneauxLibres : null },
  ];
}

/* ------------------------------ Répondre ------------------------------ */

export interface EtatDeCanal {
  canal: CanalDeMessage;
  /** `a-brancher` : prise libre ; `a-reconnecter` : autorisation à refaire (grisé, « À reconnecter ») ; `erreur` ; `arrete`. */
  etat: 'actif' | 'a-brancher' | 'a-reconnecter' | 'erreur' | 'arrete';
}

/**
 * Le canal de réponse : par défaut celui du dernier message du client ; on peut en changer. Un canal dont la prise
 * est débranchée est grisé. Si le canal par défaut ne peut pas servir, on propose le premier canal actif.
 */
export function canalDeReponse(dernier: CanalDeMessage, etats: readonly EtatDeCanal[]): { canal: CanalDeMessage; grise: boolean; choix: (EtatDeCanal & { grise: boolean })[] } {
  const choix = etats.map((e) => ({ ...e, grise: e.etat !== 'actif' }));
  const defaut = choix.find((c) => c.canal === dernier);
  if (defaut && !defaut.grise) return { canal: dernier, grise: false, choix };
  const autre = choix.find((c) => !c.grise);
  return { canal: autre ? autre.canal : dernier, grise: !autre, choix };
}

/** La note interne n'est jamais envoyée au client ni incluse dans un export client. */
export const exportPourLeClient = (messages: readonly MessageDeFil[]): MessageDeFil[] => messages.filter((m) => !m.noteInterne);

/** Le brouillon d'Ajmani n'est jamais envoyé seul : un clic de la personne, toujours. */
export const brouillonPartSeul = (): false => false;

/** Un numéro n'est jamais montré en entier dans une liste : « … 00 01 » ; il reste dans la fiche client. */
export function numeroMasque(numero: string): string {
  const d = chiffres(numero);
  return d.length < 4 ? '' : `… ${d.slice(-4, -2)} ${d.slice(-2)}`;
}


/**
 * G07 (image v4) : dans le fil d'un client, les messages d'un jour passé se plient par jour et par canal
 * (« Hier, par courriel · Afficher 2 messages ») ; ceux d'aujourd'hui restent dépliés. Les notes internes se plient
 * comme les autres messages. Un pli n'est jamais vide.
 */
export interface PliDeMessages {
  jour: Jour;
  canal: CanalDeMessage;
  nombre: number;
  /** Le premier message du pli : l'écran en montre l'extrait. */
  premierId: string;
  ids: string[];
}
export function plierLesAnciens(messages: readonly Pick<MessageDeFil, 'id' | 'at' | 'canal'>[], aujourdhui: Jour): { plies: PliDeMessages[]; visibles: string[] } {
  const tri = [...messages].sort((a, b) => ms(a.at) - ms(b.at) || a.id.localeCompare(b.id));
  const plies: PliDeMessages[] = [];
  const visibles: string[] = [];
  for (const m of tri) {
    const jour = jourDe(m.at);
    if (jour >= aujourdhui) {
      visibles.push(m.id);
      continue;
    }
    const pli = plies.find((p) => p.jour === jour && p.canal === m.canal);
    if (pli) {
      pli.nombre += 1;
      pli.ids.push(m.id);
    } else plies.push({ jour, canal: m.canal, nombre: 1, premierId: m.id, ids: [m.id] });
  }
  return { plies, visibles };
}

/** Le couloir « Fait · 9 » : quatre initiales, « +5 », l'heure du dernier traité (image v4). */
export const INITIALES_DU_COULOIR_FAIT = 4;
export function apercuDuFait(faits: readonly { initiales: string; at: Instant }[]): { initiales: string[]; reste: number; dernierAt: Instant | null } {
  const tri = [...faits].sort((a, b) => ms(b.at) - ms(a.at) || a.initiales.localeCompare(b.initiales));
  return {
    initiales: tri.slice(0, INITIALES_DU_COULOIR_FAIT).map((f) => f.initiales),
    reste: Math.max(0, tri.length - INITIALES_DU_COULOIR_FAIT),
    dernierAt: tri.length ? tri[0].at : null,
  };
}
