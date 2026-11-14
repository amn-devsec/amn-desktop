import { briqueChezNousBranchee, modeDeCategorie } from '../cycle';
import { dansLaPlage, prochainCreneau, PLAGE_CLIENTS, type Plage } from './planificateur';
import type { ConnecteurInstance } from '../types';

/**
 * LES COURRIELS AUTOMATIQUES — par la boîte de l'équipe, d'abord.
 *
 * L'application prépare chaque courriel (destinataire, objet, corps tiré d'un
 * modèle au vouvoiement) et décide s'il peut partir maintenant. Le canal
 * dépend de ce qui existe :
 *
 *   · `smtp-serveur`        : amn-api envoie depuis la boîte de l'équipe, sans clic,
 *                             une fois la prise « Boîte de l'équipe » branchée
 *                             (demandé à amn-api, voir `amnApi.ts`) ;
 *   · `boite-equipe-manuel` : en attendant, le courriel est prêt et part en un clic
 *                             depuis la messagerie du poste (lien `mailto:`) ;
 *   · `api-externe`         : seulement si un connecteur d'envoi est connecté.
 *
 * Gratuit dans les deux premiers cas. Rien n'est envoyé deux fois : l'identifiant
 * est déterministe (origine + modèle), comme pour les automatisations.
 */

export type Canal = 'smtp-serveur' | 'boite-equipe-manuel' | 'api-externe';

export interface Courriel {
  id: string;
  a: string;
  objet: string;
  corps: string;
  modeleId: string;
  origine: { type: string; id: string };
}

export function idCourriel(origineType: string, origineId: string, modeleId: string): string {
  return `courriel-${origineType}-${origineId}-${modeleId}`;
}

/** Une adresse plausible : une seule « @ », un domaine avec un point, aucun espace ni retour à la ligne. */
export function adresseValide(a: string): boolean {
  return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/.test(a.trim());
}

/**
 * Remplit un modèle (`Bonjour {nom},`). Une variable manquante n'est JAMAIS
 * laissée telle quelle dans un courriel client : on rend la liste des manques
 * et l'appelant n'envoie pas.
 */
export function remplir(modele: string, vars: Record<string, string | number>): { texte: string; manquantes: string[] } {
  const manquantes: string[] = [];
  const texte = modele.replace(/\{(\w+)\}/g, (tout, nom: string) => {
    if (nom in vars && String(vars[nom]).trim() !== '') return String(vars[nom]);
    manquantes.push(nom);
    return tout;
  });
  return { texte, manquantes: [...new Set(manquantes)] };
}

/** Le lien qui ouvre le courriel prêt dans la messagerie du poste (envoi en un clic). */
export function lienMailto(c: Pick<Courriel, 'a' | 'objet' | 'corps'>): string {
  const corps = c.corps.replace(/\r?\n/g, '\r\n');
  return `mailto:${encodeURIComponent(c.a.trim())}?subject=${encodeURIComponent(c.objet)}&body=${encodeURIComponent(corps)}`;
}

export function canalDEnvoi(instances: readonly ConnecteurInstance[], smtpServeurDisponible: boolean): Canal {
  if (modeDeCategorie('messagerie', instances, 'envoi') === 'externe') return 'api-externe';
  if (smtpServeurDisponible && briqueChezNousBranchee('messagerie', instances)) return 'smtp-serveur';
  return 'boite-equipe-manuel';
}

export type Decision =
  | { statut: 'envoyer' }
  | { statut: 'differer'; a: number }
  | { statut: 'refuser'; raison: 'adresse-invalide' | 'desinscrit' | 'deja-envoye' | 'doublon-recent' | 'variables-manquantes' };

/** Un même modèle au même destinataire, pas plus d'une fois sur cette durée. */
export const DELAI_DOUBLON_JOURS = 7;

export interface ContexteEnvoi {
  maintenant: number;
  /** Adresses qui ont demandé à ne plus recevoir de courriels automatiques (minuscules). */
  desinscrits: ReadonlySet<string>;
  /** Ce qui est déjà parti. */
  envoyes: readonly { id: string; a: string; modeleId: string; at: number }[];
  plage?: Plage;
}

export function decider(c: Courriel, ctx: ContexteEnvoi): Decision {
  const a = c.a.trim().toLowerCase();
  if (!adresseValide(a)) return { statut: 'refuser', raison: 'adresse-invalide' };
  if (/\{\w+\}/.test(c.objet) || /\{\w+\}/.test(c.corps)) return { statut: 'refuser', raison: 'variables-manquantes' };
  if (ctx.desinscrits.has(a)) return { statut: 'refuser', raison: 'desinscrit' };
  if (ctx.envoyes.some((e) => e.id === c.id)) return { statut: 'refuser', raison: 'deja-envoye' };
  const limite = ctx.maintenant - DELAI_DOUBLON_JOURS * 86_400_000;
  if (ctx.envoyes.some((e) => e.a.trim().toLowerCase() === a && e.modeleId === c.modeleId && e.at > limite)) {
    return { statut: 'refuser', raison: 'doublon-recent' };
  }
  const plage = ctx.plage ?? PLAGE_CLIENTS;
  if (!dansLaPlage(ctx.maintenant, plage)) return { statut: 'differer', a: prochainCreneau(ctx.maintenant, plage) };
  return { statut: 'envoyer' };
}

/**
 * Pas plus de N courriels automatiques par heure depuis la boîte de l'équipe
 * (valeur de départ : 30, modifiable), pour ne pas la faire passer pour un envoi de masse.
 * Rend ceux qui partent maintenant, dans l'ordre de la file.
 */
export const MAX_PAR_HEURE = 30;

export function lotDeLHeure<T extends { id: string }>(file: readonly T[], partisDerniereHeure: number, max = MAX_PAR_HEURE): T[] {
  return file.slice(0, Math.max(0, max - partisDerniereHeure));
}
