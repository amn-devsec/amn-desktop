import { totauxDeFacture } from '../../donnees/argent';
import type { Interlocuteur } from '../../donnees/types';
import { ecartJours, jourDeInstant, type Jour } from '../commun';
import { choisirJalons, moisEntre, nombreDeMois } from '../fiche/modele';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · MC03 « FICHES CONTACTS » — le carnet de personnes : la liste groupée par récence et le grand profil
 * (logique pure, fiche MC03 rubrique 6).
 *
 * Tout vient de `SourcesContacts.interlocuteurs`. Sa valeur `null` (l'application n'a pas de collection d'interlocuteurs,
 * décision de Harun en attente, STATUT §1.28) donne un écran « non disponible » : la page ne construit pas de modèle.
 * Les chiffres d'un profil sont ceux de l'ORGANISATION de la personne quand elle est cliente (l'application ne relie pas
 * les échanges à une personne précise) ; pour un fournisseur, un partenaire ou un prospect, ils restent vides.
 */
export type Groupe = 'recent' | 'semaine' | 'ancien';
export type Recence = { genre: 'aujourdhui' | 'hier' | 'jour' | 'semaines' | 'mois'; n: number; jour: Jour };

export interface LigneContact {
  id: string;
  nom: string;
  initiale: string;
  organisation: string;
  fonction: string;
  favori: boolean;
  nonLu: boolean;
  jours: number;
  groupe: Groupe;
  recence: Recence;
}

export interface MoisBarre { cle: string; echanges: number }
export interface EvenementFrise { indice: number; titre: string; jour: Jour; premier: boolean; dernier: boolean }

export interface ProfilContact {
  id: string;
  nom: string;
  initiale: string;
  fonction: string;
  organisation: string;
  /** Le client que la personne représente (une organisation de type client), ou `null`. */
  clientId: number | null;
  ville: string;
  palier: 'Bronze' | 'Argent' | 'Or' | null;
  clientDepuis: string | null;
  favori: boolean;
  email: string;
  telephone: string;
  preference: Interlocuteur['preference'];
  notes: string;
  faits: {
    encaisseCents: number | null;
    enRetard: { numero: string; jours: number } | null;
    echangesTrimestre: number | null;
    dernierEchange: { at: string; jours: number } | null;
    prochainRdv: { at: number; heure: string; dansMin: number | null; jourRelatif: 'aujourdhui' | 'autre'; jour: Jour; titre: string } | null;
  };
  relation: { mois: MoisBarre[]; evenements: EvenementFrise[]; debut: string | null; recordCeMois: boolean; rythme: number };
  derniers: { at: string; jours: number }[];
  /** Un rendez-vous dans les 24 h : le bandeau « Préparer ». */
  preparation: { heure: string; titre: string } | null;
}

export interface ModeleContacts {
  total: number;
  groupes: { groupe: Groupe; lignes: LigneContact[] }[];
  profil: ProfilContact | null;
  chips: { tous: number; favoris: number; recents: number };
}

export type FiltreContacts = 'tous' | 'favoris' | 'recents';

const accent = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function groupeDe(jours: number): Groupe {
  return jours <= 1 ? 'recent' : jours <= 6 ? 'semaine' : 'ancien';
}

export function recenceDe(jours: number, jour: Jour): Recence {
  if (jours <= 0) return { genre: 'aujourdhui', n: 0, jour };
  if (jours === 1) return { genre: 'hier', n: 1, jour };
  if (jours <= 6) return { genre: 'jour', n: jours, jour };
  if (jours < 28) return { genre: 'semaines', n: Math.floor(jours / 7), jour };
  return { genre: 'mois', n: Math.max(1, Math.floor(jours / 30)), jour };
}

const heureParis = (ms: number): string => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', hourCycle: 'h23' }).format(new Date(ms));

export function lignesDe(src: SourcesContacts, recherche = '', filtre: FiltreContacts = 'tous'): LigneContact[] {
  const q = accent(recherche.trim());
  return (src.interlocuteurs ?? [])
    .map((i) => {
      const jours = Math.max(0, ecartJours(jourDeInstant(i.dernierEchangeAt), src.aujourdhui));
      return { i, jours };
    })
    .filter(({ i, jours }) => (filtre === 'favoris' ? i.favori : filtre === 'recents' ? jours <= 30 : true) && (q === '' || accent(`${i.nomComplet} ${i.organisationNom} ${i.fonction} ${i.email}`).includes(q)))
    .sort((a, b) => a.jours - b.jours || a.i.nomComplet.localeCompare(b.i.nomComplet, 'fr'))
    .map(({ i, jours }) => ({
      id: i.id, nom: i.nomComplet, initiale: i.nomComplet.trim().charAt(0).toUpperCase(), organisation: i.organisationNom, fonction: i.fonction, favori: i.favori, nonLu: i.nonLu,
      jours, groupe: groupeDe(jours), recence: recenceDe(jours, jourDeInstant(i.dernierEchangeAt)),
    }));
}

export function profilDe(src: SourcesContacts, id: string): ProfilContact | null {
  const i = (src.interlocuteurs ?? []).find((x) => x.id === id);
  if (!i) return null;
  const clientId = i.organisationType === 'client' ? Number(i.organisationId) : null;
  const client = clientId != null ? src.clients.find((c) => c.id === clientId) : undefined;
  const echanges = clientId != null ? src.echanges.filter((e) => e.clientId === clientId).map((e) => e.at).sort() : [];
  const an = src.aujourdhui.slice(0, 4);
  const encaisse = client
    ? src.factures.filter((f) => f.clientId === client.id && f.status === 'paid' && f.paidAt.startsWith(an)).reduce((s, f) => s + totauxDeFacture(f).ttcCents, 0)
    : null;
  const retard = client ? src.factures.filter((f) => f.clientId === client.id && f.status === 'issued' && f.dueAt < src.aujourdhui).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0] : undefined;
  const mois = Number(src.aujourdhui.slice(5, 7));
  const debutTrimestre = `${an}-${String(Math.floor((mois - 1) / 3) * 3 + 1).padStart(2, '0')}-01`;
  const rdv = client
    ? src.evenements
        .filter((e) => !e.systeme && e.clientId === client.id && e.type === 'rendez-vous client' && e.confirmation !== 'manqué' && Date.parse(e.startAt) + e.durationMin * 60_000 > src.maintenant)
        .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0]
    : undefined;
  const premierJour = echanges[0] ? jourDeInstant(echanges[0]) : null;
  const cles = premierJour ? moisEntre(premierJour.slice(0, 7), src.aujourdhui.slice(0, 7)) : [];
  const barres: MoisBarre[] = cles.map((cle) => ({ cle, echanges: echanges.filter((a) => jourDeInstant(a).startsWith(cle)).length }));
  const courant = barres[barres.length - 1]?.echanges ?? 0;
  const max = Math.max(0, ...barres.map((b) => b.echanges));
  const devisSignes = client ? src.devis.filter((d) => d.clientId === client.id && (d.status === 'accepted' || d.acceptéLe != null)) : [];
  const indiceDe = (jour: Jour): number => Math.max(0, cles.indexOf(jour.slice(0, 7)));
  const evenements: EvenementFrise[] = [];
  if (premierJour) evenements.push({ indice: 0, titre: '', jour: premierJour, premier: true, dernier: false });
  for (const d of devisSignes) { const jour = (d.acceptéLe ?? d.updatedAt.slice(0, 10)) as Jour; if (cles.includes(jour.slice(0, 7))) evenements.push({ indice: indiceDe(jour), titre: d.title, jour, premier: false, dernier: false }); }
  const dernierEch = echanges[echanges.length - 1];
  if (dernierEch && cles.length > 1) evenements.push({ indice: cles.length - 1, titre: '', jour: jourDeInstant(dernierEch), premier: false, dernier: true });
  const dans24h = rdv && Date.parse(rdv.startAt) - src.maintenant <= 24 * 3_600_000;
  const depuisMs = rdv ? Date.parse(rdv.startAt) - src.maintenant : null;
  const total = barres.reduce((s, b) => s + b.echanges, 0);

  return {
    id: i.id, nom: i.nomComplet, initiale: i.nomComplet.trim().charAt(0).toUpperCase(), fonction: i.fonction, organisation: i.organisationNom, clientId,
    ville: client?.ville ?? '', palier: client ? src.fidelite.find((c) => c.clientId === client.id)?.niveau ?? null : null, clientDepuis: client ? client.debutLe.slice(0, 7) : null,
    favori: i.favori, email: i.email, telephone: i.telephone, preference: i.preference, notes: i.notes,
    faits: {
      encaisseCents: encaisse, enRetard: retard ? { numero: retard.number, jours: ecartJours(retard.dueAt, src.aujourdhui) } : null,
      echangesTrimestre: client ? echanges.filter((a) => jourDeInstant(a) >= debutTrimestre).length : null,
      dernierEchange: dernierEch ? { at: dernierEch, jours: Math.max(0, ecartJours(jourDeInstant(dernierEch), src.aujourdhui)) } : { at: i.dernierEchangeAt, jours: Math.max(0, ecartJours(jourDeInstant(i.dernierEchangeAt), src.aujourdhui)) },
      prochainRdv: rdv ? { at: Date.parse(rdv.startAt), heure: heureParis(Date.parse(rdv.startAt)), dansMin: depuisMs != null && depuisMs >= 0 && depuisMs < 3_600_000 * 6 ? Math.round(depuisMs / 60_000) : null, jourRelatif: jourDeInstant(rdv.startAt) === src.aujourdhui ? 'aujourdhui' : 'autre', jour: jourDeInstant(rdv.startAt), titre: rdv.title } : null,
    },
    relation: { mois: barres, evenements, debut: premierJour ? premierJour.slice(0, 7) : null, recordCeMois: courant > 0 && courant >= max && barres.length > 1, rythme: barres.length ? Math.round(total / Math.max(1, nombreDeMois(cles[0], cles[cles.length - 1]))) : 0 },
    derniers: [...echanges].reverse().slice(0, 3).map((at) => ({ at, jours: Math.max(0, ecartJours(jourDeInstant(at), src.aujourdhui)) })),
    preparation: rdv && dans24h ? { heure: heureParis(Date.parse(rdv.startAt)), titre: rdv.title } : null,
  };
}

export function modeleContacts(src: SourcesContacts, o: { selectionId?: string | null; recherche?: string; filtre?: FiltreContacts } = {}): ModeleContacts {
  const toutes = lignesDe(src);
  const lignes = lignesDe(src, o.recherche ?? '', o.filtre ?? 'tous');
  const ordre: Groupe[] = ['recent', 'semaine', 'ancien'];
  const groupes = ordre.map((groupe) => ({ groupe, lignes: lignes.filter((l) => l.groupe === groupe) })).filter((g) => g.lignes.length > 0);
  const choisi = (o.selectionId && toutes.some((l) => l.id === o.selectionId) ? o.selectionId : lignes[0]?.id) ?? null;
  return {
    total: toutes.length,
    groupes,
    profil: choisi ? profilDe(src, choisi) : null,
    chips: { tous: toutes.length, favoris: toutes.filter((l) => l.favori).length, recents: toutes.filter((l) => l.jours <= 30).length },
  };
}

/**
 * Les libellés de la frise sur deux rangées, sans chevauchement : un événement passe en rangée 1 si son libellé toucherait le
 * précédent de la rangée 0, et s'il touche aussi la rangée 1 il est omis (le survol garde l'information). Les événements du
 * bord droit sont ancrés à droite (le libellé s'écrit vers la gauche). `x` : la position en px du point de l'événement.
 */
export function rangerLibelles(evenements: readonly { x: number; largeur: number; ancreDroite: boolean }[]): (0 | 1 | null)[] {
  const fin = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  const sortie: (0 | 1 | null)[] = new Array(evenements.length).fill(null);
  evenements
    .map((e, i) => ({ e, i }))
    .sort((a, b) => a.e.x - b.e.x)
    .forEach(({ e, i }) => {
      const debut = e.ancreDroite ? e.x - e.largeur : e.x - 6;
      const ligne = debut >= fin[0] + 8 ? 0 : debut >= fin[1] + 8 ? 1 : null;
      if (ligne == null) return;
      fin[ligne] = debut + e.largeur;
      sortie[i] = ligne;
    });
  return sortie;
}

export { choisirJalons };
