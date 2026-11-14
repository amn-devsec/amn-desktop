import { ajouterJours, ecartType, estJourOuvre, instantParis, ms, partiesParis, MS_HEURE, MS_JOUR, type Instant } from './commun';

/**
 * SIGNATURES (H12) — circuit, étapes, délai moyen, relances. Logique pure.
 *
 * Le module existant (`SignatureScreen`, `SignatureDistanceScreen`, `src/lib/cinquante/juridique.ts`) garde sa
 * logique de circuit ; les règles ci-dessous ajoutent celles que la fiche v3 demande (relances automatiques,
 * couleurs de signataire, sous-titre). Aucune mention de valeur légale (« qualifiée », « certifiée ») : seulement
 * « Preuve conservée ».
 */

export type RoleDeSignataire = 'signataire' | 'copie';

export interface SignataireMin {
  id: string;
  /** Position dans le circuit (1 = premier). */
  ordre: number;
  role: RoleDeSignataire;
  statut: 'En attente' | 'Ouvert' | 'Signé' | 'Refusé';
  envoyeAt?: Instant | null;
  ouvertAt?: Instant | null;
  signeAt?: Instant | null;
}

export type EtatDeDemande = 'À envoyer' | 'Envoyée' | 'Vue' | 'Signée' | 'Refusée' | 'Expirée' | 'Annulée';

export interface DemandeMin {
  id: string;
  signataires: readonly SignataireMin[];
  envoyeAt: Instant | null;
  echeanceLe?: string | null;
  annulee?: boolean;
  /** Date de signature du devis lié, si la demande en porte un. */
  devis?: boolean;
}

const tri = (s: readonly SignataireMin[]) => [...s].sort((a, b) => a.ordre - b.ordre);
const signataires = (s: readonly SignataireMin[]) => tri(s).filter((x) => x.role === 'signataire');

/** La couleur d'un signataire, dans l'ordre : 1er bleu INFO, 2ᵉ violet de la famille, 3ᵉ gris clair. Ce n'est pas un état. */
export const COULEURS_DE_SIGNATAIRE = ['info', 'famille', 'gris'] as const;
export type CouleurDeSignataire = (typeof COULEURS_DE_SIGNATAIRE)[number];
export const couleurDeSignataire = (rang: number): CouleurDeSignataire => COULEURS_DE_SIGNATAIRE[Math.min(Math.max(rang, 1), COULEURS_DE_SIGNATAIRE.length) - 1];

/** Étapes d'un signataire : Envoyé (le lien part), Ouvert (première ouverture), Signé (tous ses champs obligatoires remplis). */
export type EtapeDeSignataire = 'envoye' | 'ouvert' | 'signe' | 'refuse' | 'en-attente';

export function etapeDeSignataire(s: SignataireMin): EtapeDeSignataire {
  if (s.statut === 'Refusé') return 'refuse';
  if (s.statut === 'Signé') return 'signe';
  if (s.statut === 'Ouvert') return 'ouvert';
  return s.envoyeAt ? 'envoye' : 'en-attente';
}

/** Les 3 segments de la barre d'un ticket : étapes du signataire en cours (vert partout si signée). */
export function segmentsDeTicket(d: DemandeMin): ['fait' | 'en-cours' | 'a-venir', 'fait' | 'en-cours' | 'a-venir', 'fait' | 'en-cours' | 'a-venir'] {
  const e = etatDeDemande(d);
  if (e === 'Signée') return ['fait', 'fait', 'fait'];
  const courant = signataireEnCours(d);
  if (!courant || e === 'À envoyer') return ['a-venir', 'a-venir', 'a-venir'];
  const etape = etapeDeSignataire(courant);
  if (etape === 'ouvert') return ['fait', 'fait', 'en-cours'];
  if (etape === 'envoye') return ['fait', 'en-cours', 'a-venir'];
  return ['en-cours', 'a-venir', 'a-venir'];
}

/** Un signataire suivant ne reçoit le document qu'après la signature du précédent : celui qui « tient le témoin ». */
export function signataireEnCours(d: DemandeMin): SignataireMin | null {
  return signataires(d.signataires).find((s) => s.statut !== 'Signé') ?? null;
}

/** Le suivant peut-il recevoir le document ? Seulement quand tous les précédents ont signé. */
export const peutRecevoir = (d: DemandeMin, signataireId: string): boolean => {
  const liste = signataires(d.signataires);
  const i = liste.findIndex((s) => s.id === signataireId);
  return i >= 0 && liste.slice(0, i).every((s) => s.statut === 'Signé');
};

/** « En copie » reçoit le document signé à la fin, quand tous les signataires ont signé. */
export const copiePeutRecevoir = (d: DemandeMin): boolean => signataires(d.signataires).length > 0 && signataires(d.signataires).every((s) => s.statut === 'Signé');

export function etatDeDemande(d: DemandeMin): EtatDeDemande {
  if (d.annulee) return 'Annulée';
  const liste = signataires(d.signataires);
  if (liste.some((s) => s.statut === 'Refusé')) return 'Refusée';
  if (liste.length > 0 && liste.every((s) => s.statut === 'Signé')) return 'Signée';
  if (!d.envoyeAt) return 'À envoyer';
  if (liste.some((s) => s.statut === 'Ouvert' || s.statut === 'Signé')) return 'Vue';
  return 'Envoyée';
}

/** Expirée : l'échéance est passée alors que la demande attend encore (état dérivé, affiché en ambre). */
export function estExpiree(d: DemandeMin, aujourdhui: string): boolean {
  const e = etatDeDemande(d);
  return !!d.echeanceLe && d.echeanceLe < aujourdhui && (e === 'Envoyée' || e === 'Vue');
}

/** « 1 sur 2 signé » : signataires ayant signé / signataires (hors copie). L'anneau a le même rapport. */
export function avancementDuCircuit(d: DemandeMin): { signes: number; total: number; rapport: number } {
  const liste = signataires(d.signataires);
  const signes = liste.filter((s) => s.statut === 'Signé').length;
  return { signes, total: liste.length, rapport: liste.length ? signes / liste.length : 0 };
}

export interface ChampPose {
  type: 'signature' | 'paraphe' | 'date' | 'nom' | 'case' | 'texte';
  page: number;
  signataireId: string;
  obligatoire: boolean;
  rempli: boolean;
}

/** « 5 champs posés, 3 à remplir par … » : champs de la page / champs non remplis du signataire en cours. */
export function champsDeLaPage(champs: readonly ChampPose[], page: number, signataireId: string | null): { poses: number; aRemplir: number } {
  const dePage = champs.filter((c) => c.page === page);
  return { poses: dePage.length, aRemplir: dePage.filter((c) => c.signataireId === signataireId && !c.rempli).length };
}

/** Un signataire a terminé quand tous ses champs obligatoires sont remplis. */
export const aTermine = (champs: readonly ChampPose[], signataireId: string): boolean =>
  champs.filter((c) => c.signataireId === signataireId && c.obligatoire).every((c) => c.rempli);

/* ------------------------------ Compteurs et délai moyen ------------------------------ */

/**
 * « 3 demandes attendent une signature » : envoyées, non signées, non refusées, non expirées, non annulées.
 * C'est le même nombre que la barre latérale et F20.
 */
export function enAttenteDeSignature(demandes: readonly DemandeMin[], aujourdhui: string): number {
  return demandes.filter((d) => {
    const e = etatDeDemande(d);
    return (e === 'Envoyée' || e === 'Vue') && !estExpiree(d, aujourdhui);
  }).length;
}

/** Délai d'une demande signée, en jours : de l'envoi à la dernière signature. */
export function delaiDeSignatureJours(d: DemandeMin): number | null {
  if (!d.envoyeAt || etatDeDemande(d) !== 'Signée') return null;
  const dernieres = signataires(d.signataires).map((s) => (s.signeAt ? ms(s.signeAt) : null));
  if (dernieres.some((x) => x === null)) return null;
  return (Math.max(...(dernieres as number[])) - ms(d.envoyeAt)) / MS_JOUR;
}

export interface DelaiMoyen {
  /** Moyenne en jours, arrondie à une décimale (« 1,8 jour »). `null` sans devis signé. */
  jours: number | null;
  nombre: number;
  /** « belle régularité » si l'écart-type est sous 1 jour (Proposition) ; sinon la phrase s'arrête au chiffre. */
  regulier: boolean;
}

/** Fenêtres de la fiche : « ce mois-ci » pour H12, 90 jours pour le pied de F20. */
export const FENETRE_HEBDO_F20_JOURS = 90;

/** Délai moyen d'envoi → dernière signature des devis signés dans la fenêtre. */
export function delaiMoyenDeSignature(demandes: readonly DemandeMin[], debut: Instant, fin: Instant): DelaiMoyen {
  const delais: number[] = [];
  for (const d of demandes) {
    if (!d.devis) continue;
    const delai = delaiDeSignatureJours(d);
    if (delai === null) continue;
    const signeLe = Math.max(...signataires(d.signataires).map((s) => ms(s.signeAt as Instant)));
    if (signeLe >= ms(debut) && signeLe <= ms(fin)) delais.push(delai);
  }
  if (!delais.length) return { jours: null, nombre: 0, regulier: false };
  const moy = delais.reduce((s, x) => s + x, 0) / delais.length;
  return { jours: Math.round(moy * 10) / 10, nombre: delais.length, regulier: delais.length >= 2 && ecartType(delais) < 1 };
}

/* ------------------------------ Relances ------------------------------ */

/**
 * Relances automatiques (H12 §6, Proposition) : la première 48 h après l'envoi au signataire en cours s'il n'a pas
 * signé, puis tous les 3 jours, 3 au maximum, entre 9 h et 18 h en jours ouvrés. Arrêt à la signature, au refus,
 * à l'annulation ou à l'expiration. Relance manuelle : une par signataire toutes les 24 h.
 * Tout se joue en heure de Paris.
 */
export const RELANCE_PREMIERE_H = 48;
export const RELANCE_ESPACEMENT_JOURS = 3;
export const RELANCE_MAX = 3;
export const RELANCE_DEBUT_MIN = 9 * 60;
export const RELANCE_FIN_MIN = 18 * 60;
export const RELANCE_MANUELLE_H = 24;

/** Le premier créneau permis à partir de `t` : dans [9 h, 18 h[ d'un jour ouvré. Hors plage, 9 h du prochain jour ouvré. */
export function prochainCreneauDeRelance(t: Instant): number {
  const p = partiesParis(t);
  if (estJourOuvre(p.jour) && p.minutes >= RELANCE_DEBUT_MIN && p.minutes < RELANCE_FIN_MIN) return ms(t);
  let jour = p.jour;
  if (!(estJourOuvre(jour) && p.minutes < RELANCE_DEBUT_MIN)) jour = ajouterJours(jour, 1);
  while (!estJourOuvre(jour)) jour = ajouterJours(jour, 1);
  return instantParis(jour, RELANCE_DEBUT_MIN);
}

export interface PlanDeRelance {
  /** L'instant de la prochaine relance automatique ; `null` si le circuit est arrêté ou si les 3 sont parties. */
  prochaine: number | null;
  /** « 1 sur 3 » : rang de la prochaine (1 à 3). `null` quand il n'y en a plus. */
  rang: number | null;
  envoyees: number;
  raison?: 'signee' | 'refusee' | 'annulee' | 'expiree' | 'maximum' | 'non-envoyee';
}

/** `relancesEnvoyees` : instants des relances automatiques déjà parties pour le signataire en cours. */
export function planDeRelance(d: DemandeMin, relancesEnvoyees: readonly Instant[], aujourdhui: string): PlanDeRelance {
  const e = etatDeDemande(d);
  const arret = e === 'Signée' ? 'signee' : e === 'Refusée' ? 'refusee' : e === 'Annulée' ? 'annulee' : estExpiree(d, aujourdhui) ? 'expiree' : e === 'À envoyer' ? 'non-envoyee' : null;
  const envoyees = relancesEnvoyees.length;
  if (arret) return { prochaine: null, rang: null, envoyees, raison: arret };
  if (envoyees >= RELANCE_MAX) return { prochaine: null, rang: null, envoyees, raison: 'maximum' };
  const courant = signataireEnCours(d);
  const depart = envoyees === 0 ? (courant?.envoyeAt ?? d.envoyeAt) : [...relancesEnvoyees].map(ms).sort((a, b) => b - a)[0];
  if (depart === null || depart === undefined) return { prochaine: null, rang: null, envoyees, raison: 'non-envoyee' };
  const delai = envoyees === 0 ? RELANCE_PREMIERE_H * MS_HEURE : RELANCE_ESPACEMENT_JOURS * MS_JOUR;
  return { prochaine: prochainCreneauDeRelance(ms(depart) + delai), rang: envoyees + 1, envoyees };
}

/** Relance manuelle : une par signataire toutes les 24 h. */
export const relanceManuellePossible = (derniereRelanceManuelle: Instant | null, maintenant: Instant): boolean =>
  derniereRelanceManuelle === null || ms(maintenant) - ms(derniereRelanceManuelle) >= RELANCE_MANUELLE_H * MS_HEURE;

/* ------------------------------ La preuve conservée ------------------------------ */

/**
 * « Preuve conservée · empreinte enregistrée » (H12, image v4) : la piste d'une demande, dans l'ordre du temps :
 * envoi, ouverture, signature de chaque personne. Seulement des faits horodatés ; ni valeur légale ni empreinte
 * affichée (l'empreinte reste côté serveur). Les personnes « en copie » n'ont ni ouverture ni signature à prouver.
 */
export type GenreDeTrace = 'envoi' | 'ouverture' | 'signature';
export interface TraceDeLaPiste {
  at: Instant;
  genre: GenreDeTrace;
  signataireId: string;
}
export function pisteDePreuve(d: Pick<DemandeMin, 'signataires'>): TraceDeLaPiste[] {
  const out: TraceDeLaPiste[] = [];
  for (const s of d.signataires) {
    if (s.envoyeAt) out.push({ at: s.envoyeAt, genre: 'envoi', signataireId: s.id });
    if (s.role === 'signataire' && s.ouvertAt) out.push({ at: s.ouvertAt, genre: 'ouverture', signataireId: s.id });
    if (s.role === 'signataire' && s.signeAt) out.push({ at: s.signeAt, genre: 'signature', signataireId: s.id });
  }
  const rang: Record<GenreDeTrace, number> = { envoi: 0, ouverture: 1, signature: 2 };
  return out.sort((a, b) => ms(a.at) - ms(b.at) || rang[a.genre] - rang[b.genre] || a.signataireId.localeCompare(b.signataireId));
}
