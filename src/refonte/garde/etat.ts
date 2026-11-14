/**
 * L'ÉTAT D'UNE ORGANISATION DE LA GARDE (LOT-08, N02 §6.1) — la règle, pure.
 *
 * L'état est le plus grave de trois critères, calculés dans l'interface :
 *
 *   · le score (`scoreDe`) : Sain à partir de 70, Attention de 45 à 69,
 *     Critique sous 45 ;
 *   · les alertes ouvertes : une alerte Critique rend l'organisation
 *     Critique, une alerte Moyenne la rend Attention, une Faible ne change rien ;
 *   · la dernière ronde : plus de deux intervalles prévus sans passage la rend
 *     Attention, plus de 24 h la rend Critique.
 *
 * Un critère qu'on ne peut pas évaluer (pas de score, pas de ronde connue) est
 * ignoré et dit « non disponible » dans `motifs` : il ne rend jamais une
 * organisation Sain par défaut sans le dire, ni Critique par défaut.
 *
 * Le libellé affiché est « Sain », « Attention », « Critique » (STATUT §1.8
 * n° 4). La clé `attention` ne change pas si le libellé change.
 */
export type EtatOrganisation = 'sain' | 'attention' | 'critique';
export type GraviteAlerteAffichee = 'critique' | 'moyenne' | 'faible';

export const SEUIL_SAIN = 70;
export const SEUIL_CRITIQUE = 45;
export const RONDE_ATTENTION_INTERVALLES = 2;
export const RONDE_CRITIQUE_MS = 24 * 3_600_000;

const RANG: Record<EtatOrganisation, number> = { sain: 0, attention: 1, critique: 2 };

export type CritereEtat = 'score' | 'alertes' | 'ronde';

export interface MotifEtat {
  critere: CritereEtat;
  /** L'état que ce critère donne seul, ou `null` s'il n'est pas disponible. */
  etat: EtatOrganisation | null;
  /** Une courte clé de lecture (pas une phrase) : les textes vivent dans i18n. */
  cause: string;
}

export interface EntreeEtat {
  /** Score de posture sur 100, `null` si l'organisation n'est pas relevée. */
  score: number | null;
  /** Gravités des alertes ouvertes de l'organisation, déjà ramenées à trois niveaux. */
  alertes: readonly GraviteAlerteAffichee[];
  /** `null` : aucune ronde connue pour cette organisation. */
  ronde: { dernierePasseeAt: string | null; intervalleMs: number } | null;
  /** `Date.now()` de l'appelant : la fonction ne lit pas l'horloge. */
  maintenant: number;
}

export interface SortieEtat {
  etat: EtatOrganisation;
  motifs: MotifEtat[];
  /** Les critères qui n'ont pas pu être évalués. */
  indisponibles: CritereEtat[];
}

export function etatDuScore(score: number): EtatOrganisation {
  if (score >= SEUIL_SAIN) return 'sain';
  if (score >= SEUIL_CRITIQUE) return 'attention';
  return 'critique';
}

export function etatDesAlertes(alertes: readonly GraviteAlerteAffichee[]): EtatOrganisation {
  if (alertes.includes('critique')) return 'critique';
  if (alertes.includes('moyenne')) return 'attention';
  return 'sain';
}

/** Le retard de la ronde, en millisecondes, ou `null` si elle tient l'heure ou n'est pas connue. */
export function retardDeLaRonde(ronde: EntreeEtat['ronde'], maintenant: number): number | null {
  if (!ronde?.dernierePasseeAt) return null;
  const depuis = maintenant - Date.parse(ronde.dernierePasseeAt);
  if (!Number.isFinite(depuis)) return null;
  return depuis > RONDE_ATTENTION_INTERVALLES * ronde.intervalleMs ? depuis : null;
}

export function etatDeLaRonde(ronde: EntreeEtat['ronde'], maintenant: number): EtatOrganisation | null {
  if (!ronde?.dernierePasseeAt || !Number.isFinite(Date.parse(ronde.dernierePasseeAt))) return null;
  const depuis = maintenant - Date.parse(ronde.dernierePasseeAt);
  if (depuis > RONDE_CRITIQUE_MS) return 'critique';
  return retardDeLaRonde(ronde, maintenant) !== null ? 'attention' : 'sain';
}

export function etatDOrganisation(e: EntreeEtat): SortieEtat {
  const motifs: MotifEtat[] = [
    { critere: 'score', etat: e.score === null || !Number.isFinite(e.score) ? null : etatDuScore(e.score), cause: e.score === null ? 'score-non-releve' : 'score' },
    { critere: 'alertes', etat: etatDesAlertes(e.alertes), cause: e.alertes.includes('critique') ? 'alerte-critique' : e.alertes.includes('moyenne') ? 'alerte-moyenne' : 'aucune-alerte-grave' },
    { critere: 'ronde', etat: etatDeLaRonde(e.ronde, e.maintenant), cause: e.ronde?.dernierePasseeAt ? 'ronde' : 'ronde-inconnue' },
  ];
  let etat: EtatOrganisation = 'sain';
  for (const m of motifs) if (m.etat && RANG[m.etat] > RANG[etat]) etat = m.etat;
  return { etat, motifs, indisponibles: motifs.filter((m) => m.etat === null).map((m) => m.critere) };
}
