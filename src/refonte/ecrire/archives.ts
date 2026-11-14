import { ajouterMois, ecartJours, aplatir, MS_JOUR, ms, partiesParis, pourcent, type Instant, type Jour } from './commun';

/**
 * ARCHIVES (ME04) — index du temps, recherche, règles, espace. Logique pure.
 *
 * La date d'un résultat est la date d'ARCHIVAGE, pas celle du document. Aucune suppression définitive depuis cet
 * écran : jamais. Les factures sont conservées 10 ans (obligation légale, réglage).
 */

export type TypeArchive = 'Document' | 'Facture' | 'Message' | 'Devis' | 'Photo' | 'Vidéo' | 'Autre';

export interface ElementArchive {
  id: string;
  titre: string;
  type: TypeArchive;
  tailleOctets: number;
  archiveLe: Jour;
  /** Texte indexé (PDF, messages) : cherché seulement avec l'option. */
  contenu?: string;
  conserverJusquau?: Jour | null;
  mode?: 'règle' | 'à la main';
}

/** Un quota de 20 Go et 85 % pour « quota proche » (ME04 §5, §8). */
export const QUOTA_ARCHIVES_OCTETS = 20_000_000_000;
export const SEUIL_QUOTA_PROCHE = 85;

export const peutSupprimerDepuisLesArchives = (): false => false;

/* ------------------------------ Index du temps ------------------------------ */

export interface MoisIndexe {
  /** `AAAA-MM`. */
  mois: string;
  /** Éléments archivés ce mois-là. */
  elements: number;
  /** Barre grise : éléments du mois / éléments du mois le plus chargé de l'année affichée (0 à 1). */
  densite: number;
  /** Barre violette : résultats de la recherche archivés ce mois-là. Elle mesure les correspondances, pas la densité. */
  correspondances: number;
}

export function indexDuTemps(elements: readonly ElementArchive[], annee: number, correspondances: readonly ElementArchive[] = []): { mois: MoisIndexe[]; correspondancesDeLAnnee: number } {
  const compte = (liste: readonly ElementArchive[], m: string) => liste.filter((e) => e.archiveLe.startsWith(m)).length;
  const mois = Array.from({ length: 12 }, (_, i) => {
    const m = `${annee}-${String(i + 1).padStart(2, '0')}`;
    return { mois: m, elements: compte(elements, m), correspondances: compte(correspondances, m), densite: 0 };
  });
  const max = Math.max(1, ...mois.map((x) => x.elements));
  for (const m of mois) m.densite = m.elements / max;
  return { mois, correspondancesDeLAnnee: mois.reduce((s, m) => s + m.correspondances, 0) };
}

/* ------------------------------ Recherche ------------------------------ */

export const RESULTATS_AFFICHES = 5;
export const LONGUEUR_EXTRAIT = 90;

/** L'extrait : la phrase qui contient le mot, coupée à une ligne avec « … ». */
export function extrait(contenu: string, mot: string, max = LONGUEUR_EXTRAIT): string | null {
  const q = aplatir(mot);
  if (!q) return null;
  const phrase = contenu.split(/(?<=[.!?])\s+|\n+/).find((p) => aplatir(p).includes(q));
  if (!phrase) return null;
  const p = phrase.trim();
  if (p.length <= max) return p;
  const i = aplatir(p).indexOf(q);
  const debut = Math.max(0, Math.min(i - Math.floor(max / 3), p.length - max));
  return `${debut > 0 ? '…' : ''}${p.slice(debut, debut + max).trim()}${debut + max < p.length ? '…' : ''}`;
}

export interface Resultat {
  element: ElementArchive;
  /** Trouvé dans le titre, ou dans le contenu (avec l'option). */
  dans: 'titre' | 'contenu';
  extrait: string | null;
}

export interface OptionsRecherche {
  /** « Chercher aussi dans le contenu » (PDF, messages). Hors ligne : titres seulement. */
  dansLeContenu?: boolean;
  type?: TypeArchive | 'Tout';
}

/** Résultats du plus récent au plus ancien (date d'archivage). Chaque mot saisi doit se trouver. */
export function rechercher(elements: readonly ElementArchive[], saisie: string, options: OptionsRecherche = {}): Resultat[] {
  const mots = aplatir(saisie).split(/\s+/).filter(Boolean);
  if (!mots.length) return [];
  const out: Resultat[] = [];
  for (const e of elements) {
    if (options.type && options.type !== 'Tout' && e.type !== options.type) continue;
    const titre = aplatir(e.titre);
    if (mots.every((m) => titre.includes(m))) {
      out.push({ element: e, dans: 'titre', extrait: null });
    } else if (options.dansLeContenu && e.contenu && mots.every((m) => aplatir(e.contenu as string).includes(m))) {
      out.push({ element: e, dans: 'contenu', extrait: extrait(e.contenu, mots[0]) });
    }
  }
  return out.sort((a, b) => b.element.archiveLe.localeCompare(a.element.archiveLe) || a.element.id.localeCompare(b.element.id));
}

/** Compteurs des puces de type : résultats par type ; « Tout » = le total. */
export function compteursParType(resultats: readonly Resultat[]): Record<string, number> {
  const out: Record<string, number> = { Tout: resultats.length };
  for (const r of resultats) out[r.element.type] = (out[r.element.type] ?? 0) + 1;
  return out;
}

/** Résultats groupés par mois d'archivage, du plus récent au plus ancien. Cinq affichés puis « Afficher la suite ». */
export function grouperParMois(resultats: readonly Resultat[], visibles = RESULTATS_AFFICHES): { groupes: { mois: string; resultats: Resultat[] }[]; affiches: number; reste: number } {
  const garde = resultats.slice(0, visibles);
  const parMois = new Map<string, Resultat[]>();
  for (const r of garde) parMois.set(r.element.archiveLe.slice(0, 7), [...(parMois.get(r.element.archiveLe.slice(0, 7)) ?? []), r]);
  return { groupes: [...parMois].map(([mois, rs]) => ({ mois, resultats: rs })), affiches: garde.length, reste: Math.max(0, resultats.length - garde.length) };
}

/* ------------------------------ Règles automatiques ------------------------------ */

export interface RegleDArchivage {
  type: 'facture-payee' | 'conversation-silencieuse' | 'devis-refuse';
  /** Mois à attendre : 12, 6, 3 par défaut. */
  apresMois: number;
}
export const REGLES_PAR_DEFAUT: readonly RegleDArchivage[] = [
  { type: 'facture-payee', apresMois: 12 },
  { type: 'conversation-silencieuse', apresMois: 6 },
  { type: 'devis-refuse', apresMois: 3 },
];

export interface ElementActif {
  id: string;
  genre: RegleDArchivage['type'];
  /** Date de l'événement qui déclenche la règle : paiement, dernier message, refus. */
  depuis: Jour;
}

/** Un élément est archivé quand il remplit une règle : l'événement date d'au moins `apresMois` mois. */
export function aArchiver(elements: readonly ElementActif[], regles: readonly RegleDArchivage[], aujourdhui: Jour): ElementActif[] {
  return elements.filter((e) => {
    const r = regles.find((x) => x.type === e.genre);
    return !!r && ajouterMois(e.depuis, r.apresMois) <= aujourdhui;
  });
}

/** Les factures sont conservées 10 ans (réglage) ; les autres types suivent le réglage de l'entreprise. */
export const ANNEES_FACTURES = 10;
export function finDeConservation(type: TypeArchive, archiveLe: Jour, anneesAutres: number | null = null): Jour | null {
  if (type === 'Facture') return ajouterMois(archiveLe, ANNEES_FACTURES * 12);
  return anneesAutres === null ? null : ajouterMois(archiveLe, anneesAutres * 12);
}

/* ------------------------------ Espace, restaurations, suggestion ------------------------------ */

export function espaceDesArchives(elements: readonly ElementArchive[], quota = QUOTA_ARCHIVES_OCTETS): { utilise: number; reste: number; pourcent: number; proche: boolean } {
  const utilise = elements.reduce((s, e) => s + e.tailleOctets, 0);
  const p = quota > 0 ? (utilise / quota) * 100 : 0;
  return { utilise, reste: Math.max(0, quota - utilise), pourcent: pourcent(utilise, quota), proche: p > SEUIL_QUOTA_PROCHE };
}

export const JOURS_DE_RESTAURATION = 90;
export const RESTAURES_AFFICHES = 2;

/** « Restaurés récemment » : les restaurations des 90 derniers jours ; les 2 plus récentes affichées. */
export function restauresRecemment(restaurations: readonly { id: string; at: Instant }[], maintenant: Instant): { total: number; affiches: { id: string; at: Instant }[] } {
  const recentes = restaurations.filter((r) => ms(maintenant) - ms(r.at) <= JOURS_DE_RESTAURATION * MS_JOUR && ms(r.at) <= ms(maintenant)).sort((a, b) => ms(b.at) - ms(a.at));
  return { total: recentes.length, affiches: recentes.slice(0, RESTAURES_AFFICHES) };
}

/** Restaurer demande le droit d'écriture sur le module d'origine ; hors ligne, c'est désactivé. */
export const peutRestaurer = (droitDEcriture: boolean, enLigne: boolean): boolean => droitDEcriture && enLigne;

export const SEUIL_COMPRESSION_OCTETS = 1_000_000_000;
export const JOURS_DES_ORIGINAUX = 30;

/**
 * « Libérer de la place » : une catégorie (photos, vidéos) dépasse 1 Go et peut être compressée sans perte visible.
 * Les originaux sont gardés 30 jours. Sans catégorie éligible : rien (pas de carte vide).
 */
export function suggestionDeCompression(elements: readonly ElementArchive[]): { type: TypeArchive; octets: number } | null {
  const parType = new Map<TypeArchive, number>();
  for (const e of elements) if (e.type === 'Photo' || e.type === 'Vidéo') parType.set(e.type, (parType.get(e.type) ?? 0) + e.tailleOctets);
  const meilleur = [...parType].filter(([, o]) => o > SEUIL_COMPRESSION_OCTETS).sort((a, b) => b[1] - a[1])[0];
  return meilleur ? { type: meilleur[0], octets: meilleur[1] } : null;
}

/** Le mois affiché sans recherche : le mois en cours par défaut (« 64 éléments en octobre 2026 »). */
export function elementsDuMois(elements: readonly ElementArchive[], mois: string): ElementArchive[] {
  return elements.filter((e) => e.archiveLe.startsWith(mois)).sort((a, b) => b.archiveLe.localeCompare(a.archiveLe) || a.id.localeCompare(b.id));
}

/** Mois en cours, à Paris. */
export const moisEnCours = (maintenant: Instant): string => partiesParis(maintenant).jour.slice(0, 7);
export const joursDepuisArchivage = (e: Pick<ElementArchive, 'archiveLe'>, aujourdhui: Jour): number => ecartJours(e.archiveLe, aujourdhui);
