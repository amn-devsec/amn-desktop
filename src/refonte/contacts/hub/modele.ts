import { totauxDeFacture, totauxDeLignes } from '../../donnees/argent';
import type { Evenement } from '../../donnees/types';
import { ajouterJours, ecartJours, instantParis, jourDe, jourDeInstant, jourSemaine, MS_JOUR, MS_MINUTE, minutesParis, type Jour } from '../commun';
import { couleurSante } from '../clients';
import type { AttenteClient, SourcesContacts } from '../sources/types';

/**
 * LOT-02 · F10 « MES CONTACTS ET CLIENTS » — le modèle de la vue d'ensemble (logique pure, fiche F10 rubrique 6).
 *
 * « Toutes les valeurs viennent des modules (mêmes requêtes) ; aucune n'est écrite en dur » : ce fichier ne lit que
 * `SourcesContacts` et rend ce que la vue dessine. Les noms, montants et dates des maquettes n'y sont pas.
 *
 * Quatre blocs : la chaleur des relations, ceux qui attendent une réponse, les prochains rendez-vous, et l'accès
 * aux modules de la famille. Une donnée absente (`null` dans les sources) devient un état « non disponible », jamais
 * un zéro.
 */

/* ------------------------------ Chaleur des relations ------------------------------ */

export type BandeChaleur = 'chaleureuse' | 'aEntretenir' | 'refroidie';

/** Jours depuis le dernier échange : Chaleureuse < 7 j, À entretenir 7 à 29 j, Refroidie ≥ 30 j (fiche F10, proposition). */
export const bandeDeChaleur = (jours: number): BandeChaleur => (jours < 7 ? 'chaleureuse' : jours < 30 ? 'aEntretenir' : 'refroidie');

export const SATISFACTION_MIN = 3;
export const SATISFACTION_MAX = 5;
/** Les clients nommés sur le nuage : les huit aux plus forts enjeux. */
export const MAX_POINTS_NOMMES = 8;

export interface PointChaleur {
  clientId: number;
  nom: string;
  /** Jours depuis le dernier échange utile. */
  jours: number;
  /** Dernière note du client (sur 5), bornée à 3–5 pour le tracé. */
  satisfaction: number;
  /** Vrai quand la note vient de la moyenne de l'espace (point en contour seul). */
  satisfactionMoyenne: boolean;
  /** Facturé sur 12 mois (la taille du point), en centimes. */
  valeurCents: number;
  nomme: boolean;
  bande: BandeChaleur;
  statut: 'Actif' | 'À relancer' | 'Impayé' | 'Nouveau';
}

export interface ChaleurDesRelations {
  points: PointChaleur[];
  parBande: Record<BandeChaleur, number>;
  total: number;
  /** Clients passés à une bande plus chaude depuis lundi 00:00. */
  rechauffees: number;
}

const nomDuClient = (c: { company: string; name: string }): string => c.company || c.name;
const rangBande: Record<BandeChaleur, number> = { refroidie: 0, aEntretenir: 1, chaleureuse: 2 };

/** Le début de la semaine (lundi 00:00, heure de Paris) de `maintenant`. */
export function lundiMinuit(maintenant: number): number {
  const j = jourDe(maintenant);
  return instantParis(ajouterJours(j, -(jourSemaine(j) - 1)), '00:00');
}

/** Le jour d'un échange d'après le dernier échange avant `limite` (ms), ou `null`. */
function dernierEchangeAvant(echanges: readonly { at: string }[], limite: number): number | null {
  const avant = echanges.map((e) => Date.parse(e.at)).filter((t) => t < limite);
  return avant.length ? Math.max(...avant) : null;
}

export function chaleurDesRelations(src: SourcesContacts): ChaleurDesRelations {
  const an = ajouterJours(src.aujourdhui, -365);
  const parClient = new Map<number, number>();
  for (const f of src.factures) {
    if (f.status === 'paid' && f.paidAt >= an) parClient.set(f.clientId, (parClient.get(f.clientId) ?? 0) + totauxDeFacture(f).ttcCents);
  }
  const notes = new Map<number, { note: number; date: Jour }>();
  for (const a of src.avis) {
    const vu = notes.get(a.clientId);
    if (!vu || a.date > vu.date) notes.set(a.clientId, { note: a.noteSur5, date: a.date });
  }
  const moyenne = src.avis.length ? src.avis.reduce((s, a) => s + a.noteSur5, 0) / src.avis.length : 4;
  const relancesOuvertes = new Map<number, number>();
  for (const r of src.relances) if (r.clientId != null && r.etat !== 'répondue' && r.etat !== 'arrêtée') relancesOuvertes.set(r.clientId, (relancesOuvertes.get(r.clientId) ?? 0) + 1);

  const points: PointChaleur[] = src.clients.map((c) => {
    const jours = Math.max(0, ecartJours(jourDeInstant(c.dernierEchangeAt), src.aujourdhui));
    const note = notes.get(c.id)?.note;
    return {
      clientId: c.id,
      nom: nomDuClient(c),
      jours,
      satisfaction: Math.min(SATISFACTION_MAX, Math.max(SATISFACTION_MIN, note ?? moyenne)),
      satisfactionMoyenne: note == null,
      valeurCents: parClient.get(c.id) ?? 0,
      nomme: false,
      bande: bandeDeChaleur(jours),
      statut: c.statutAffiche,
    };
  });
  // Les nommés : valeur sur 12 mois, puis relances ouvertes.
  const ordre = [...points].sort((a, b) => b.valeurCents - a.valeurCents || (relancesOuvertes.get(b.clientId) ?? 0) - (relancesOuvertes.get(a.clientId) ?? 0) || a.nom.localeCompare(b.nom, 'fr'));
  for (const p of ordre.slice(0, MAX_POINTS_NOMMES)) p.nomme = true;

  const parBande: Record<BandeChaleur, number> = { chaleureuse: 0, aEntretenir: 0, refroidie: 0 };
  for (const p of points) parBande[p.bande] += 1;

  // « Réchauffées cette semaine » : plus chaudes aujourd'hui que lundi 00:00.
  const lundi = lundiMinuit(src.maintenant);
  let rechauffees = 0;
  for (const c of src.clients) {
    const eux = src.echanges.filter((e) => e.clientId === c.id);
    const avant = dernierEchangeAvant(eux, lundi);
    const bandeLundi: BandeChaleur = avant == null ? 'refroidie' : bandeDeChaleur(Math.floor((lundi - avant) / MS_JOUR));
    const maintenantBande = bandeDeChaleur(Math.max(0, ecartJours(jourDeInstant(c.dernierEchangeAt), src.aujourdhui)));
    if (rangBande[maintenantBande] > rangBande[bandeLundi]) rechauffees += 1;
  }
  return { points, parBande, total: points.length, rechauffees };
}

export interface SuggestionAppel {
  clientId: number;
  nom: string;
  jours: number;
  /** Le devis vu mais pas signé qui justifie l'appel. */
  devis: { numero: string; cents: number };
}

/**
 * Le client à appeler : À entretenir ou Refroidi, avec un devis ENVOYÉ, VU et NON signé ; le plus gros devis d'abord.
 * `null` quand personne ne répond à la règle (la vue dit alors « Rien à signaler »).
 */
export function suggestionAppel(src: SourcesContacts, c: ChaleurDesRelations): SuggestionAppel | null {
  const parId = new Map(c.points.map((p) => [p.clientId, p]));
  const candidats: SuggestionAppel[] = [];
  for (const d of src.devis) {
    if (d.status !== 'sent' || d.vuAt == null || d.acceptéLe != null || d.refuséLe != null) continue;
    const p = parId.get(d.clientId);
    if (!p || p.bande === 'chaleureuse') continue;
    candidats.push({ clientId: p.clientId, nom: p.nom, jours: p.jours, devis: { numero: d.numero, cents: totauxDeLignes(d.lignes).ttcCents } });
  }
  return candidats.sort((a, b) => b.devis.cents - a.devis.cents || a.nom.localeCompare(b.nom, 'fr'))[0] ?? null;
}

/* ------------------------------ Ils attendent une réponse ------------------------------ */

/** La barre d'attente : attente ÷ 4 h, plafonnée ; orange au-delà de 2 h. */
export const BARRE_ATTENTE_MAX_MIN = 4 * 60;
export const SEUIL_ATTENTE_ORANGE_MIN = 2 * 60;

export interface LigneAttente {
  clientId: number | null;
  nom: string;
  initiales: string;
  extrait: string;
  attenteMin: number;
  /** 0 à 1. */
  barre: number;
  ton: 'attention' | 'neutre';
  canal: AttenteClient['canal'];
}

export const initialesDe = (nom: string): string => {
  const mots = nom.split(/[\s-]+/).filter(Boolean);
  return ((mots[0]?.[0] ?? '') + (mots[1]?.[0] ?? mots[0]?.[1] ?? '')).toUpperCase();
};

/** La file « Ils attendent une réponse » : la même que « À répondre » de G07, la plus ancienne d'abord. `null` : messagerie non branchée. */
export function filesAttente(attentes: readonly AttenteClient[] | null, maintenant: number): { lignes: LigneAttente[]; total: number } | null {
  if (attentes == null) return null;
  const lignes = attentes
    .map((a) => {
      const attenteMin = Math.max(0, Math.floor((maintenant - a.depuisMs) / MS_MINUTE));
      return {
        clientId: a.clientId,
        nom: a.clientNom,
        initiales: initialesDe(a.clientNom),
        extrait: a.extrait,
        attenteMin,
        barre: Math.min(1, attenteMin / BARRE_ATTENTE_MAX_MIN),
        ton: attenteMin > SEUIL_ATTENTE_ORANGE_MIN ? ('attention' as const) : ('neutre' as const),
        canal: a.canal,
      };
    })
    .sort((a, b) => b.attenteMin - a.attenteMin || a.nom.localeCompare(b.nom, 'fr'));
  return { lignes, total: lignes.length };
}

/** « 48 min », « 2 h 11 », « 3 j » à partir de deux jours (espaces insécables). */
export function dureeAttente(minutes: number): string {
  if (minutes < 60) return `${minutes}\u00a0min`;
  if (minutes >= 48 * 60) return `${Math.floor(minutes / (24 * 60))}\u00a0j`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}\u00a0h\u00a0${String(m).padStart(2, '0')}`;
}

/* ------------------------------ Prochains rendez-vous ------------------------------ */

export type EtatRdvHub = 'fait' | 'prochain' | 'a-venir';

export interface LigneRdvHub {
  id: string;
  /** `HH:MM`, heure de Paris. */
  heure: string;
  client: string;
  sujet: string;
  lieu: string;
  etat: EtatRdvHub;
  /** « dans 18 min » pour le prochain, « 1 h 30 » (la durée) pour les autres à venir. */
  dansMin: number | null;
  dureeMin: number;
  responsable: { initiales: string; teinte: number } | null;
  /** Les étiquettes de la ligne en cours : dernier échange, devis en attente. */
  etiquettes: { genre: 'dernierEchange' | 'devisEnAttente'; jours?: number; numero?: string }[];
}

export interface FriseRdv {
  lignes: LigneRdvHub[];
  total: number;
  /** Le premier rendez-vous d'un jour ouvré suivant, pour le pied. */
  suivant: { jour: Jour; heure: string; client: string; sujet: string; responsable: { initiales: string; teinte: number } | null } | null;
}

const heureHM = (ms: number): string => {
  const m = minutesParis(ms);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

const estRdvClient = (e: Evenement): boolean => !e.systeme && e.type === 'rendez-vous client' && e.confirmation !== 'manqué';

export function friseDesRendezVous(src: SourcesContacts): FriseRdv {
  const parEmail = new Map(src.equipe.map((m) => [m.email, m]));
  const resp = (e: Evenement) => {
    const m = e.participants.map((p) => parEmail.get(p)).find(Boolean);
    return m ? { initiales: m.initiales, teinte: m.teinte } : null;
  };
  const rdvs = src.evenements.filter(estRdvClient).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  const duJour = rdvs.filter((e) => jourDeInstant(e.startAt) === src.aujourdhui);
  const premierAVenir = duJour.find((e) => Date.parse(e.startAt) > src.maintenant);
  const dernierEchange = new Map(src.clients.map((c) => [c.id, c.dernierEchangeAt]));
  const lignes: LigneRdvHub[] = duJour.map((e) => {
    const debut = Date.parse(e.startAt);
    const fin = debut + e.durationMin * MS_MINUTE;
    const etat: EtatRdvHub = fin <= src.maintenant ? 'fait' : e === premierAVenir ? 'prochain' : 'a-venir';
    const etiquettes: LigneRdvHub['etiquettes'] = [];
    if (etat === 'prochain' && e.clientId != null) {
      const dernier = dernierEchange.get(e.clientId);
      if (dernier) etiquettes.push({ genre: 'dernierEchange', jours: Math.max(0, ecartJours(jourDeInstant(dernier), src.aujourdhui)) });
      const devis = src.devis.find((d) => d.clientId === e.clientId && d.status === 'sent' && d.acceptéLe == null && d.refuséLe == null);
      if (devis) etiquettes.push({ genre: 'devisEnAttente', numero: devis.numero });
    }
    return {
      id: e.id,
      heure: heureHM(debut),
      client: e.clientName,
      sujet: e.title,
      lieu: e.location,
      etat,
      dansMin: etat === 'prochain' ? Math.max(0, Math.round((debut - src.maintenant) / MS_MINUTE)) : null,
      dureeMin: e.durationMin,
      responsable: resp(e),
      etiquettes,
    };
  });
  let suivant: FriseRdv['suivant'] = null;
  for (let i = 1; i <= 7 && !suivant; i += 1) {
    const jour = ajouterJours(src.aujourdhui, i);
    const e = rdvs.find((x) => jourDeInstant(x.startAt) === jour);
    if (e) suivant = { jour, heure: heureHM(Date.parse(e.startAt)), client: e.clientName, sujet: e.title, responsable: resp(e) };
  }
  return { lignes, total: lignes.length, suivant };
}

/** « 1 h 30 », « 45 min » pour la durée d'un rendez-vous. */
export function dureeRdv(minutes: number): string {
  if (minutes < 60) return `${minutes}\u00a0min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}\u00a0h` : `${h}\u00a0h\u00a0${String(m).padStart(2, '0')}`;
}

/* ------------------------------ Les modules de la famille ------------------------------ */

export type TonMesure = 'neutre' | 'ok' | 'attention' | 'discret';

export interface TuileHub {
  /** La clé du module (garde `ModuleRoute`, registre). */
  id: string;
  vers: string;
  /** Le nom court de la tuile. */
  nom: string;
  /** Ce que la tuile mesure ; `null` : rien à dire (la tuile reste, sans mesure). */
  mesure: { cle: string; params: Record<string, string | number>; ton: TonMesure } | null;
  /** Pastille de compte à droite. */
  compte: number | null;
  /** `false` : la donnée n'existe pas dans l'application (« non disponible »). */
  disponible: boolean;
}

export interface GroupeHub {
  cle: 'clients' | 'developper' | 'autour';
  tuiles: TuileHub[];
}

const sur5 = (n: number): string => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');

export function groupesDuHub(src: SourcesContacts, c: ChaleurDesRelations, frise: FriseRdv, routeFidelite: string): GroupeHub[] {
  const impayes = src.clients.filter((x) => x.statutAffiche === 'Impayé').length;
  const moyenne = src.avis.length ? src.avis.reduce((s, a) => s + a.noteSur5, 0) / src.avis.length : null;
  const aSuivre = src.avis.filter((a) => a.noteSur5 <= 3).length;
  const ouverts = src.prospects.filter((p) => p.etape !== 'gagné' && p.etape !== 'perdu');
  const enJeu = ouverts.reduce((s, p) => s + (p.montantCents ?? 0), 0);
  const pretes = src.relances.filter((r) => r.etat === 'prête').length;
  const enLigne = src.equipe.filter((m) => m.statut === 'en ligne').length;
  const prochainRdv = frise.lignes.find((l) => l.etat === 'prochain');
  const t = (id: string, vers: string, nom: string, mesure: TuileHub['mesure'], compte: number | null = null, disponible = true): TuileHub => ({ id, vers, nom, mesure, compte, disponible });
  return [
    {
      cle: 'clients',
      tuiles: [
        t('clients', '/clients', 'clients', { cle: 'tuile.clients', params: { n: src.clients.length, impayes }, ton: 'neutre' }),
        t('contactsFiches', '/contacts/fiches', 'fiches', src.interlocuteurs == null ? null : { cle: 'tuile.fiches', params: { n: src.interlocuteurs.length }, ton: 'neutre' }, null, src.interlocuteurs != null),
        t('loyalty', routeFidelite, 'fidelite', { cle: 'tuile.fidelite', params: { n: src.fidelite.length }, ton: 'neutre' }),
        t('reviews', '/avis', 'retours', moyenne == null ? null : { cle: 'tuile.retours', params: { note: sur5(moyenne), n: src.avis.length, aSuivre }, ton: 'neutre' }),
        t('aftersales', '/sav', 'sav', null),
      ],
    },
    {
      cle: 'developper',
      tuiles: [
        t('pipeline', '/pipeline', 'prospects', { cle: 'tuile.prospects', params: { n: ouverts.length }, ton: 'neutre' }),
        t('pipelineCommercial', '/pipeline-commercial', 'pipeline', { cle: 'tuile.pipeline', params: { montant: enJeu }, ton: 'neutre' }),
        t('reminders', '/relances', 'relances', pretes > 0 ? { cle: 'tuile.relances', params: { n: pretes }, ton: 'attention' } : { cle: 'tuile.relances.aucune', params: {}, ton: 'ok' }, pretes > 0 ? pretes : null),
        t('rdvClients', '/rendez-vous-clients', 'rdv', frise.total === 0 ? { cle: 'tuile.rdv.aucun', params: {}, ton: 'discret' } : { cle: prochainRdv ? 'tuile.rdv.prochain' : 'tuile.rdv', params: { n: frise.total, heure: prochainRdv?.heure ?? '', client: prochainRdv?.client ?? '' }, ton: 'neutre' }),
        t('referrals', '/parrainage', 'parrainage', null),
      ],
    },
    {
      cle: 'autour',
      tuiles: [
        t('suppliers', '/fournisseurs', 'fournisseurs', { cle: 'tuile.fournisseurs', params: { n: src.fournisseurs.length }, ton: 'neutre' }),
        t('partenaires', '/partenaires', 'partenaires', src.partenaires == null ? null : { cle: 'tuile.partenaires', params: { n: src.partenaires.length }, ton: 'neutre' }, null, src.partenaires != null),
        t('directory', '/trombinoscope', 'equipe', src.presence ? { cle: 'tuile.equipe', params: { n: enLigne }, ton: enLigne > 0 ? 'ok' : 'discret' } : { cle: 'tuile.equipe.membres', params: { n: src.equipe.length }, ton: 'neutre' }),
      ],
    },
  ];
}

/* ------------------------------ Le modèle entier ------------------------------ */

export interface ModeleHub {
  salutation: 'bonjour' | 'apresMidi' | 'bonsoir';
  prenom: string;
  chaleur: ChaleurDesRelations;
  suggestion: SuggestionAppel | null;
  attentes: { lignes: LigneAttente[]; total: number } | null;
  frise: FriseRdv;
  groupes: GroupeHub[];
  /** Les points de couleur de santé ne servent pas ici : la chaleur suffit. Gardé pour `couleurSante` du pied de carte. */
  couleurSanteMoyenne: ReturnType<typeof couleurSante> | null;
}

/** « Bonjour » le matin, « Bon après-midi » de 12 h à 18 h, « Bonsoir » ensuite (la salutation selon l'heure, REGLES « Chaleur »). */
export function salutationDe(maintenant: number): ModeleHub['salutation'] {
  const h = Math.floor(minutesParis(maintenant) / 60);
  return h < 12 ? 'bonjour' : h < 18 ? 'apresMidi' : 'bonsoir';
}

export function modeleHub(src: SourcesContacts, routeFidelite = '/fidelite'): ModeleHub {
  const chaleur = chaleurDesRelations(src);
  const frise = friseDesRendezVous(src);
  const sante = src.clients.length ? Math.round(src.clients.reduce((s, c) => s + c.sante, 0) / src.clients.length) : null;
  return {
    salutation: salutationDe(src.maintenant),
    prenom: src.moi.prenom,
    chaleur,
    suggestion: suggestionAppel(src, chaleur),
    attentes: filesAttente(src.attentes, src.maintenant),
    frise,
    groupes: groupesDuHub(src, chaleur, frise, routeFidelite),
    couleurSanteMoyenne: sante == null ? null : couleurSante(sante),
  };
}
