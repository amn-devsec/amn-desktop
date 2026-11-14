import { instantParis } from '../../donnees/outils';
import { ajouterJours, ecartJours, jourDeParis, jourSemaineIso, type Jour } from '../commun';
import { etatDuRappel } from '../rappels';

/**
 * LOT-01 · MJ05 « RAPPELS » — le fil des rappels (logique pure, fiche MJ05 rubriques 3, 4, 6 et 8).
 *
 * Ce qui se CALCULE ici : les sections (Déjà fait aujourd'hui, Maintenant, Plus tard aujourd'hui, Demain, Cette semaine / Semaine prochaine),
 * « à reprendre depuis n » et « dans n min », les puces de report (qui évitent les heures calmes et tombent sur le prochain jour ouvré),
 * « Tenus à temps » et l'écart en points, le sous-titre et les compteurs.
 *
 * VOIX : un rappel passé et pas fait est « à reprendre », jamais « en retard » (guide de voix du socle) ; l'état vient de `etatDuRappel` (S2).
 * Un rappel PROPOSÉ par Ajmani n'existe pas tant qu'il n'est pas programmé : il se montre sur le fil en pointillé, sans compter parmi les rappels.
 */
export type FiltreRappels = 'tous' | 'miens' | 'equipe';
export type EtatDuNoeud = 'fait' | 'a-reprendre' | 'bientot' | 'a-venir' | 'propose';
export type SectionDeRappels = 'faits' | 'maintenant' | 'plus-tard' | 'demain' | 'semaine';

export interface RappelEntree {
  id: string;
  titre: string;
  contexte: string;
  /** Identifiant de la personne concernée (un e-mail dans l'application) ; son initiale est celle du nom. */
  personne: string | null;
  initiale: string;
  /** Instant du rappel (ISO). */
  quandAt: string;
  fait: boolean;
  faitAt: string | null;
  avanceeMin: number;
  /** « automatique, Riyad » : posé par l'application. */
  automatique?: string | null;
  /** Proposé par Ajmani, pas encore programmé. */
  propose?: boolean;
  /** Le libellé du bouton qui ouvre l'élément lié (« Ouvrir la facture »), ou rien. */
  lien?: string | null;
}

export interface CalmesEntree { actif: boolean; debut: string; fin: string }

export interface RappelAffiche extends RappelEntree {
  noeud: EtatDuNoeud;
  /** « 10:00 », « Lun. 9:00 ». */
  heure: string;
  /** « à reprendre depuis 42 min », « dans 3 min », ou rien. */
  delai: { genre: 'reprendre' | 'dans'; minutes: number } | null;
  silencieux: boolean;
  moi: boolean;
}

export interface SectionAffichee { cle: SectionDeRappels; titre: SectionDeRappels; rappels: RappelAffiche[]; nbPrevus: number; nbProposes: number }

export interface Puce { cle: 'plus1h' | 'apresMidi' | 'soir' | 'ouvre'; heure: string; jourDemain: boolean; /** 1 = lundi … 7 = dimanche, pour « Lundi 9:00 ». */ jourSemaine: number | null; quandAt: string }

const MS_MIN = 60_000;
const JOURS_COURTS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
export const IMMINENT_MIN = 15;

const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false });
const minutesDuJour = (ms: number): number => { const [h, m] = fmt.format(new Date(ms)).split(':').map(Number); return (h % 24) * 60 + m; };
const hhmm = (min: number): string => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const versMinutes = (t: string): number => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

/** Une heure tombe-t-elle dans les heures calmes (qui passent minuit) ? */
export function estCalme(min: number, c: CalmesEntree | null | undefined): boolean {
  if (!c || !c.actif) return false;
  const d = versMinutes(c.debut);
  const f = versMinutes(c.fin);
  return d <= f ? min >= d && min < f : min >= d || min < f;
}

export function heureDuFil(quandAt: string, aujourdhui: Jour): string {
  const ms = Date.parse(quandAt);
  const jour = jourDeParis(ms);
  const h = hhmm(minutesDuJour(ms));
  if (jour === aujourdhui || ecartJours(aujourdhui, jour) === 1) return h;
  const [hh, mm] = h.split(':');
  return `${JOURS_COURTS[jourSemaineIso(jour) % 7]} ${Number(hh)}:${mm}`;
}

/** Le prochain jour ouvré après `jour` (samedi et dimanche sautés). */
export function prochainJourOuvre(jour: Jour): Jour {
  let j = ajouterJours(jour, 1);
  while (jourSemaineIso(j) >= 6) j = ajouterJours(j, 1);
  return j;
}

/**
 * Les puces de report : « +1 h » ; la prochaine heure ronde de l'après-midi (14:00 avant 14:00, sinon l'heure ronde suivante, 17:00 au plus tard) ;
 * « Ce soir » = 18:00 (jusqu'à 17:00) ; le prochain jour ouvré 9:00. Les heures calmes sont évitées, les doublons retirés.
 */
export function pucesDeReport(maintenant: number, calmes?: CalmesEntree | null): Puce[] {
  const jour = jourDeParis(maintenant);
  const min = minutesDuJour(maintenant);
  const a = (j: Jour, m: number): string => new Date(instantParis(j, hhmm(m))).toISOString();
  const brut: Puce[] = [];
  const plus1h = new Date(maintenant + 60 * MS_MIN).toISOString();
  brut.push({ cle: 'plus1h', heure: hhmm(minutesDuJour(maintenant + 60 * MS_MIN)), jourDemain: jourDeParis(maintenant + 60 * MS_MIN) !== jour, jourSemaine: null, quandAt: plus1h });
  const ronde = Math.max(14 * 60, (Math.floor((min + 60) / 60) + 1) * 60);
  if (ronde <= 17 * 60) brut.push({ cle: 'apresMidi', heure: hhmm(ronde), jourDemain: false, jourSemaine: null, quandAt: a(jour, ronde) });
  if (min <= 17 * 60) brut.push({ cle: 'soir', heure: '18:00', jourDemain: false, jourSemaine: null, quandAt: a(jour, 18 * 60) });
  const ouvre = prochainJourOuvre(jour);
  brut.push({ cle: 'ouvre', heure: '09:00', jourDemain: ecartJours(jour, ouvre) === 1, jourSemaine: jourSemaineIso(ouvre), quandAt: a(ouvre, 9 * 60) });
  const vues = new Set<string>();
  return brut.filter((p) => p.cle === 'ouvre' || (!estCalme(versMinutes(p.heure), calmes) && !vues.has(p.heure) && vues.add(p.heure)));
}

export interface TenusATemps { pourcent: number | null; traites: number; total: number; ecartPoints: number | null }

/** Tenus à temps : rappels faits dans l'heure qui suit leur heure ÷ rappels échus ce mois ; l'écart se compare au mois précédent. */
export function tenusATemps(rappels: readonly RappelEntree[], maintenant: number): TenusATemps {
  const jour = jourDeParis(maintenant);
  const mois = jour.slice(0, 7);
  const [a, m] = mois.split('-').map(Number);
  const precedent = m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`;
  const calc = (cle: string, jusque: number) => {
    const echus = rappels.filter((r) => !r.propose && jourDeParis(r.quandAt).slice(0, 7) === cle && Date.parse(r.quandAt) <= jusque);
    const tenus = echus.filter((r) => r.fait && r.faitAt && Date.parse(r.faitAt) - Date.parse(r.quandAt) <= 60 * MS_MIN);
    return { total: echus.length, traites: tenus.length };
  };
  const cur = calc(mois, maintenant);
  const prev = calc(precedent, Number.POSITIVE_INFINITY);
  const p = (x: { total: number; traites: number }): number | null => (x.total > 0 ? Math.round((x.traites / x.total) * 100) : null);
  const pc = p(cur);
  const pp = p(prev);
  return { pourcent: pc, traites: cur.traites, total: cur.total, ecartPoints: pc !== null && pp !== null ? pc - pp : null };
}

export interface EntreesFil {
  rappels: readonly RappelEntree[];
  maintenant: number;
  filtre?: FiltreRappels;
  /** L'identifiant de la personne connectée (pour « Les miens »). */
  moi?: string | null;
  calmes?: CalmesEntree | null;
}

export interface ModeleRappels {
  jour: Jour;
  sections: SectionAffichee[];
  /** Non faits restant aujourd'hui (à reprendre + bientôt + plus tard). */
  restantAujourdhui: number;
  aReprendre: number;
  etiquetteSemaine: 'Cette semaine' | 'Semaine prochaine';
  puces: Puce[];
  tenus: TenusATemps;
  vide: boolean;
}

export function modeleRappels(e: EntreesFil): ModeleRappels {
  const jour = jourDeParis(e.maintenant);
  const filtre = e.filtre ?? 'tous';
  const affiches: RappelAffiche[] = e.rappels.map((r) => {
    const quand = Date.parse(r.quandAt);
    const etat = etatDuRappel({ fait: r.fait, quandAt: r.quandAt, avanceeMin: IMMINENT_MIN }, e.maintenant);
    const noeud: EtatDuNoeud = r.propose ? 'propose' : etat;
    const minutes = Math.floor(Math.abs(e.maintenant - quand) / MS_MIN);
    return {
      ...r, noeud, heure: heureDuFil(r.quandAt, jour),
      delai: noeud === 'a-reprendre' ? { genre: 'reprendre' as const, minutes } : noeud === 'bientot' ? { genre: 'dans' as const, minutes: Math.max(1, Math.ceil((quand - e.maintenant) / MS_MIN)) } : null,
      silencieux: estCalme(minutesDuJour(quand), e.calmes), moi: e.moi != null && r.personne === e.moi,
    };
  }).filter((r) => filtre === 'tous' || (filtre === 'miens' ? r.moi : !r.moi));

  const sections: Record<SectionDeRappels, RappelAffiche[]> = { faits: [], maintenant: [], 'plus-tard': [], demain: [], semaine: [] };
  for (const r of affiches) {
    const j = jourDeParis(r.quandAt);
    const ecart = ecartJours(jour, j);
    if (r.noeud === 'fait') { if (r.faitAt ? jourDeParis(r.faitAt) === jour : j === jour) sections.faits.push(r); continue; }
    if (r.noeud === 'propose') { if (ecart >= 1 && ecart <= 8) (ecart === 1 ? sections.demain : sections.semaine).push(r); continue; }
    if (ecart < 0 || (ecart === 0 && (r.noeud === 'a-reprendre' || r.noeud === 'bientot'))) sections.maintenant.push(r);
    else if (ecart === 0) sections['plus-tard'].push(r);
    else if (ecart === 1) sections.demain.push(r);
    else if (ecart <= 8) sections.semaine.push(r);
  }
  const chrono = (a: RappelAffiche, b: RappelAffiche) => Date.parse(a.quandAt) - Date.parse(b.quandAt) || a.id.localeCompare(b.id);
  const ordre: SectionDeRappels[] = ['faits', 'maintenant', 'plus-tard', 'demain', 'semaine'];
  const liste: SectionAffichee[] = ordre.map((cle) => {
    const rappels = [...sections[cle]].sort(chrono);
    return { cle, titre: cle, rappels, nbPrevus: rappels.filter((r) => r.noeud !== 'propose').length, nbProposes: rappels.filter((r) => r.noeud === 'propose').length };
  }).filter((s) => s.rappels.length > 0);
  const maintenantSection = sections.maintenant;
  const aReprendre = maintenantSection.filter((r) => r.noeud === 'a-reprendre').length;
  return {
    jour, sections: liste,
    restantAujourdhui: maintenantSection.length + sections['plus-tard'].length,
    aReprendre,
    etiquetteSemaine: jourSemaineIso(jour) === 5 ? 'Semaine prochaine' : 'Cette semaine',
    puces: pucesDeReport(e.maintenant, e.calmes),
    tenus: tenusATemps(e.rappels, e.maintenant),
    vide: e.rappels.length === 0,
  };
}
