import { ecartJours, jourDe, ms, pourcent, type Instant, type Jour } from './commun';

/**
 * PARTAGE DE FICHIERS (MX03) — liens, jauge d'expiration, ouvertures, protection, transferts. Logique pure.
 *
 * STRICT : l'écran n'affiche JAMAIS l'adresse complète d'un lien, ni un jeton, ni un code, ni un mot de passe. Liens et
 * jetons sont générés et gardés côté serveur, chiffrés ; « Copier le lien » met l'adresse dans le presse-papiers sans
 * l'afficher. C'est pourquoi aucun type d'ici ne porte d'adresse : il n'y a rien à afficher par erreur. Les fichiers
 * reçus sont analysés côté serveur ; l'application ne lance aucune analyse locale.
 */

export interface LienPartage {
  id: string;
  fichier: string;
  tailleOctets: number;
  /** Le destinataire par son nom, jamais par une adresse de lien. `null` : lien interne à l'équipe. */
  destinataire: string | null;
  creeAt: Instant;
  /** `null` : sans expiration (fichier interne). */
  expireLe: Jour | null;
  /** Durée du lien en jours (30 par défaut). */
  dureeJours: number;
  protection: 'mot de passe' | 'code par courriel' | 'compte' | 'aucune';
  ouvertures: number;
  derniereOuvertureAt: Instant | null;
  revoque?: boolean;
}

export const DUREE_PAR_DEFAUT_JOURS = 30;
export const SEUIL_ORANGE_JOURS = 2;

export interface JaugeDExpiration {
  restants: number | null;
  sur: number;
  /** 0 à 1 ; `null` sans expiration. */
  rapport: number | null;
  orange: boolean;
  expireDemain: boolean;
  /** « Prolonger » n'existe pas pour un lien sans expiration. */
  peutProlonger: boolean;
}

export function jaugeDExpiration(l: LienPartage, aujourdhui: Jour): JaugeDExpiration {
  if (l.expireLe === null) return { restants: null, sur: l.dureeJours, rapport: null, orange: false, expireDemain: false, peutProlonger: false };
  const restants = Math.max(0, ecartJours(aujourdhui, l.expireLe));
  return { restants, sur: l.dureeJours, rapport: Math.min(1, restants / Math.max(1, l.dureeJours)), orange: restants <= SEUIL_ORANGE_JOURS, expireDemain: restants === 1, peutProlonger: !l.revoque };
}

/** « pas encore ouvert » (orange) si 0 ouverture après plus de 2 jours. */
export const pasEncoreOuvert = (l: LienPartage, maintenant: Instant): boolean => l.ouvertures === 0 && ms(maintenant) - ms(l.creeAt) > 2 * 86_400_000;

/** Un lien protégé a au moins une protection ; un lien interne à l'équipe (accès par compte) compte comme protégé. */
export const estProtege = (l: LienPartage): boolean => l.protection !== 'aucune';

export function liensProteges(liens: readonly LienPartage[]): { proteges: number; actifs: number; pourcent: number; tousProteges: boolean } {
  const actifs = liens.filter((l) => !l.revoque);
  const proteges = actifs.filter(estProtege).length;
  return { proteges, actifs: actifs.length, pourcent: pourcent(proteges, actifs.length), tousProteges: actifs.length > 0 && proteges === actifs.length };
}

/** Tri : expiration la plus proche d'abord ; les liens sans expiration en dernier. Les liens révoqués ne se montrent pas. */
export function trierLesLiens(liens: readonly LienPartage[]): LienPartage[] {
  return liens
    .filter((l) => !l.revoque)
    .sort((a, b) => (a.expireLe === null ? 1 : 0) - (b.expireLe === null ? 1 : 0) || (a.expireLe ?? '').localeCompare(b.expireLe ?? '') || a.id.localeCompare(b.id));
}

/* ------------------------------ Dépôt, espace, transferts ------------------------------ */

export const TAILLE_MAX_OCTETS = 2_000_000_000;

export type RefusDeDepot = 'trop-lourd' | 'espace-plein' | null;
export function peutDeposer(tailleOctets: number, utiliseOctets: number, quotaOctets: number): RefusDeDepot {
  if (tailleOctets > TAILLE_MAX_OCTETS) return 'trop-lourd';
  if (quotaOctets > 0 && utiliseOctets + tailleOctets > quotaOctets) return 'espace-plein';
  return null;
}

export const espaceUtilise = (liens: readonly LienPartage[], quotaOctets: number): { octets: number; pourcent: number } => {
  const octets = liens.filter((l) => !l.revoque).reduce((s, l) => s + l.tailleOctets, 0);
  return { octets, pourcent: pourcent(octets, quotaOctets) };
};

export type VerificationDeFichier = 'en-cours' | 'verifie' | 'bloque';
/** Les fichiers reçus passent par une analyse (côté serveur) avant ouverture ; un fichier dangereux n'est jamais ouvrable. */
export const peutOuvrirLeFichier = (v: VerificationDeFichier): boolean => v === 'verifie';

export interface Transfert {
  id: string;
  sens: 'envoi' | 'reception';
  at: Instant;
  verification?: VerificationDeFichier;
}

/** Transferts des dernières 24 heures, le plus récent d'abord. */
export function transferts(liste: readonly Transfert[], maintenant: Instant): Transfert[] {
  return liste.filter((t) => ms(maintenant) - ms(t.at) <= 86_400_000 && ms(t.at) <= ms(maintenant)).sort((a, b) => ms(b.at) - ms(a.at) || a.id.localeCompare(b.id));
}

/**
 * « Relancer … » : lien non ouvert après 3 jours et qui expire dans moins de 3 jours (Proposition). Rien n'est envoyé
 * sans accord. Sans cas : une astuce, jamais une carte vide.
 */
export function relanceAProposer(liens: readonly LienPartage[], maintenant: Instant): LienPartage | null {
  const auj = jourDe(maintenant);
  return (
    trierLesLiens(liens).find((l) => l.ouvertures === 0 && ms(maintenant) - ms(l.creeAt) > 3 * 86_400_000 && l.expireLe !== null && ecartJours(auj, l.expireLe) >= 0 && ecartJours(auj, l.expireLe) < 3) ?? null
  );
}

/** Le texte copié n'est jamais mis dans un attribut `title` ni `data-*` : l'adresse ne doit pas être dans le DOM. */
export const adresseVisible = (): false => false;
