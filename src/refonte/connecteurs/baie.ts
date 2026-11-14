import type { CleConnecteurs } from './i18n';
import type { CategorieId, ConnecteurInstance, Droit } from './types';

/**
 * LES RÈGLES DE LA BAIE (H21) — ce que l'écran de LOT-07 lit, sans le dessiner.
 *
 * Fiche H21 §6 : voyant + texte (jamais la couleur seule), santé = prises en
 * forme / prises branchées (les libres ne comptent pas), badge = à reconnecter
 * + en erreur, une seule synchro animée à la fois, numérotation fixe.
 */

export type EtatDePrise =
  | 'libre'
  | 'branche'
  | 'synchro'
  | 'synchro-en-retard'
  | 'autorisation-en-attente'
  | 'a-reconnecter'
  | 'en-erreur'
  | 'arrete';

/** Plus de 24 h sans synchro sur une prise branchée : « synchro en retard » (proposition de la fiche). */
export const RETARD_SYNCHRO_MS = 24 * 3_600_000;

export function etatDePrise(i: ConnecteurInstance, maintenant: number): EtatDePrise {
  if (i.etat === 'arrete') return 'arrete';
  if (i.etat === 'a-connecter') {
    if (i.motif === 'a-reconnecter') return 'a-reconnecter';
    if (i.motif === 'erreur') return 'en-erreur';
    if (i.motif === 'autorisation-en-attente') return 'autorisation-en-attente';
    return 'libre';
  }
  if (i.synchroEnCours) return 'synchro';
  if (i.derniereSynchroAt === null || maintenant - i.derniereSynchroAt > RETARD_SYNCHRO_MS) return 'synchro-en-retard';
  return 'branche';
}

/**
 * Le dessin de la prise sur la baie (H21) :
 *   · `branchee`   : fiche pleine, câble relié au bus ;
 *   · `debranchee` : fiche vide, câble qui pend du bus (à reconnecter, en erreur) ;
 *   · `libre`      : pointillé, sans câble. Une prise ARRÊTÉE se dessine ainsi, avec
 *                    « arrêtée le … » à la place de « libre, à brancher » (STATUT §1.22).
 */
export type DessinDePrise = 'branchee' | 'debranchee' | 'libre';

export function dessinDePrise(e: EtatDePrise): DessinDePrise {
  if (e === 'branche' || e === 'synchro' || e === 'synchro-en-retard') return 'branchee';
  if (e === 'a-reconnecter' || e === 'en-erreur') return 'debranchee';
  return 'libre';
}

/** La clé du texte d'état sous le nom de la prise ; `date` (jour) pour une prise arrêtée. */
export function texteDEtat(i: ConnecteurInstance, maintenant: number): { cle: CleConnecteurs; date?: string } {
  const e = etatDePrise(i, maintenant);
  if (e === 'arrete') {
    const jour = i.changeAt === null ? undefined : new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(i.changeAt);
    return { cle: 'prise.arretee-le', date: jour };
  }
  return { cle: `prise.${e}` as CleConnecteurs };
}

/** Une prise est « branchée » quand un service y est relié, en forme ou non. */
export function estBranchee(e: EtatDePrise): boolean {
  return e === 'branche' || e === 'synchro' || e === 'synchro-en-retard' || e === 'a-reconnecter' || e === 'en-erreur';
}

export interface Sante {
  enForme: number;
  branchees: number;
  synchronisees: number;
  aReconnecter: number;
  enErreur: number;
  libres: number;
  synchroEnCours: number;
}

export function santeDeLaBaie(instances: readonly ConnecteurInstance[], maintenant: number): Sante {
  const etats = instances.map((i) => etatDePrise(i, maintenant));
  const n = (f: (e: EtatDePrise) => boolean) => etats.filter(f).length;
  return {
    enForme: n((e) => e === 'branche' || e === 'synchro'),
    branchees: n(estBranchee),
    synchronisees: n((e) => e === 'branche' || e === 'synchro'),
    aReconnecter: n((e) => e === 'a-reconnecter'),
    enErreur: n((e) => e === 'en-erreur'),
    libres: n((e) => e === 'libre' || e === 'arrete' || e === 'autorisation-en-attente'),
    synchroEnCours: n((e) => e === 'synchro'),
  };
}

/** Le badge « Connecteurs » de la barre latérale ; 0 = masqué. */
export function badge(instances: readonly ConnecteurInstance[], maintenant: number): number {
  const s = santeDeLaBaie(instances, maintenant);
  return s.aReconnecter + s.enErreur;
}

/** La seule prise dont le câble s'anime : la première en synchro, dans l'ordre des prises. */
export function priseAnimee(instances: readonly ConnecteurInstance[]): number | null {
  const enSynchro = instances.filter((i) => i.etat === 'connecte' && i.synchroEnCours).sort((a, b) => a.prise - b.prise);
  return enSynchro[0]?.prise ?? null;
}

export type Puce = 'toutes' | 'branchees' | 'a-reconnecter' | 'libres';

export function correspondALaPuce(e: EtatDePrise, puce: Puce): boolean {
  switch (puce) {
    case 'toutes':
      return true;
    case 'branchees':
      return estBranchee(e);
    case 'a-reconnecter':
      return e === 'a-reconnecter' || e === 'en-erreur';
    case 'libres':
      return !estBranchee(e);
  }
}

export function comptesDesPuces(instances: readonly ConnecteurInstance[], maintenant: number): Record<Puce, number> {
  const etats = instances.map((i) => etatDePrise(i, maintenant));
  const c = (p: Puce) => etats.filter((e) => correspondALaPuce(e, p)).length;
  return { toutes: c('toutes'), branchees: c('branchees'), 'a-reconnecter': c('a-reconnecter'), libres: c('libres') };
}

/** Les trois groupes de « Droits accordés ». */
export type GroupeDeDroits = 'lecture-seule' | 'lecture-ecriture' | 'envoi-reception';

export function groupeDeDroits(droits: readonly Droit[]): GroupeDeDroits | null {
  if (droits.length === 0) return null;
  const lit = droits.includes('lecture');
  const ecrit = droits.some((d) => d === 'ajout' || d === 'ecriture' || d === 'envoi');
  if (lit && !ecrit) return 'lecture-seule';
  if (lit) return 'lecture-ecriture';
  return 'envoi-reception';
}

export function droitsAccordes(instances: readonly ConnecteurInstance[], maintenant: number): Record<GroupeDeDroits, CategorieId[]> {
  const r: Record<GroupeDeDroits, CategorieId[]> = { 'lecture-seule': [], 'lecture-ecriture': [], 'envoi-reception': [] };
  for (const i of [...instances].sort((a, b) => a.prise - b.prise)) {
    if (!estBranchee(etatDePrise(i, maintenant))) continue;
    const g = groupeDeDroits(i.droits);
    if (g) r[g].push(i.categorie);
  }
  return r;
}

/** La dernière erreur non résolue (carte « Dernière erreur »), ou `null` (« Aucune erreur depuis N jours »). */
export function derniereErreur(instances: readonly ConnecteurInstance[]): ConnecteurInstance | null {
  const enPanne = instances.filter((i) => i.etat === 'a-connecter' && i.erreur && (i.motif === 'a-reconnecter' || i.motif === 'erreur'));
  enPanne.sort((a, b) => (b.erreur?.at ?? 0) - (a.erreur?.at ?? 0));
  return enPanne[0] ?? null;
}

/** « il y a N s / min / h », puis « hier », puis la date (H21 §6). */
export type Depuis =
  | { unite: 's' | 'min' | 'h'; valeur: number }
  | { unite: 'hier' }
  | { unite: 'date'; jour: string };

export function depuis(at: number, maintenant: number, fuseau = 'Europe/Paris'): Depuis {
  const ecart = Math.max(0, maintenant - at);
  if (ecart < 60_000) return { unite: 's', valeur: Math.floor(ecart / 1000) };
  if (ecart < 3_600_000) return { unite: 'min', valeur: Math.floor(ecart / 60_000) };
  const jourDe = (ms: number) => new Intl.DateTimeFormat('en-CA', { timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms);
  const auj = jourDe(maintenant);
  const ce = jourDe(at);
  if (ce === auj) return { unite: 'h', valeur: Math.floor(ecart / 3_600_000) };
  // La veille au calendrier, pas « maintenant − 24 h » (faux les jours de changement d'heure).
  const [a, m, j] = auj.split('-').map(Number);
  const hier = new Date(Date.UTC(a, m - 1, j - 1)).toISOString().slice(0, 10);
  if (ce === hier) return { unite: 'hier' };
  return { unite: 'date', jour: ce };
}
