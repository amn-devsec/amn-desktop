import { DELAIS_PAR_DEFAUT } from '../derivees';
import { ajouterJours, ecartJours, euros, jourDe, jourDeInstant, jourSemaine, minutesParis, type Jour, type Langue } from '../commun';
import type { Interlocuteur, MotifRelance, Relance } from '../../donnees/types';
import {
  cadence, cleClient, messageClientTon, ordonnerFile, phraseAttente, prochainJourOuvre, referenceDe, REGLES_PAR_DEFAUT, serieBoiteAZero, suiteApres, verdictRelance,
  type ContexteRelance, type ReglesRelance, type TonMessage, type Verdict,
} from '../relances';
import { dire } from '../i18n';
import type { SourcesContacts } from '../sources/types';

/**
 * LOT-02 · MC07 « RELANCES » — la pile focalisée (logique pure, fiche MC07 rubriques 3, 4, 6 et 8).
 *
 * Une relance à la fois au centre, la file du jour à gauche, la cadence de l'objet à droite. La RÈGLE d'espacement est
 * celle de `relances.ts` (les huit points) : ce fichier ne l'applique jamais lui-même, il la demande (`ordonnerFile`,
 * `verdictRelance`) AVANT d'afficher une relance dans la file et AVANT chaque envoi.
 *
 * Ce que l'application garde : une TRACE par geste (envoyée, reportée) sur ce poste (`Trace`), l'historique des jours
 * « boîte à zéro » et la liste du matin (pour que « n sur N traitée » ne bouge pas quand la file se vide). Sans réponses
 * connues (`reponses: null`), les blocs « Réponses du jour » et « Réponses reçues » disent « non disponible » : aucun
 * taux n'est inventé.
 */
export type GesteTrace = 'envoyee' | 'reportee';
export interface Trace { cle: string; geste: GesteTrace; le: number }

export interface HistoriquePile {
  traces: Trace[];
  /** Les jours ouvrés où la file a été vidée (série « Boîte à zéro »). */
  joursVides: Jour[];
  /** La liste du matin, figée le jour même. */
  matin: { jour: Jour; cles: string[] } | null;
}

export interface ReponseDuJour { clientNom: string; texte: string; heure?: string; genre: 'paiement' | 'message' }

export interface EntreesPile {
  historique: HistoriquePile;
  /** Les relances passées avec « Passer », dans l'ordre : elles repartent en fin de pile. */
  passees: string[];
  selection: string | null;
  ton: TonMessage;
  /** Le texte modifié à la main dans la carte, par relance. */
  brouillons: Readonly<Record<string, string>>;
  /** `null` : l'application ne sait pas qui a répondu (« non disponible »). */
  reponses: ReponseDuJour[] | null;
  suggestionMasquee?: ReadonlySet<string>;
  langue?: Langue;
  regles?: ReglesRelance;
}

export const cleRelance = (r: Pick<Relance, 'motif' | 'objetId'>): string => `${r.motif}:${r.objetId}`;

export const MOTIFS: readonly MotifRelance[] = ['devis', 'facture', 'rendez-vous', 'prospect', 'inactif'];

export interface LigneFile {
  cle: string;
  clientNom: string;
  /** « Devis · 12 400 € », « Premier contact »… : le libellé court de l'objet. */
  motif: MotifRelance;
  reference: string;
  montant: string | null;
  etat: 'faite' | 'encours' | 'avenir';
  /** Droite de la ligne : l'heure du geste, « en cours », « 2e relance » ou l'ancienneté. */
  droite: { genre: 'heure'; heure: string } | { genre: 'encours' } | { genre: 'rang'; rang: number } | { genre: 'jours'; n: number } | { genre: 'reportee' };
}

export interface EtapeFrise {
  genre: 'depart' | 'relance' | 'appel' | 'manuel';
  rang?: number;
  etat: 'fait' | 'maintenant' | 'avenir' | 'fin';
  le?: Jour;
  jourN?: number;
  /** « Aujourd'hui » pour l'étape en cours quand elle peut partir. */
  aujourdhui?: boolean;
}

export interface CarteRelance {
  cle: string;
  clientNom: string;
  initiale: string;
  motif: MotifRelance;
  reference: string;
  montant: string | null;
  rang: number;
  max: number;
  derniere: boolean;
  /** Jours depuis le départ de l'objet (devis envoyé, facture échue…). */
  depuisJours: number;
  aucuneReponse: boolean;
  verdict: Verdict;
  /** Vrai quand l'envoi est permis maintenant. */
  peutPartir: boolean;
  /** « part maintenant » ou la phrase d'attente (« Pas avant le 5 nov. : … »). */
  statutEnvoi: string;
  suite: 'message' | 'appel' | 'manuel';
  a: string;
  destinataire: { prenom: string | null; nomComplet: string | null };
  sujet: string;
  corps: string;
  /** Vrai quand le texte a été modifié à la main. */
  modifie: boolean;
}

export interface ModelePile {
  aujourdhui: Jour;
  total: number;
  traitees: number;
  reste: number;
  videe: boolean;
  lignes: LigneFile[];
  courante: CarteRelance | null;
  /** Les noms des relances qui suivent (trois au plus). */
  ensuite: string[];
  /** Les liste du matin à figer côté page. */
  matin: string[];
  frise: EtapeFrise[] | null;
  motifFrise: MotifRelance | null;
  reponses: ReponseDuJour[] | null;
  serie: number;
  /** Lun. à ven. de la semaine : coché, aujourd'hui (en pointillé tant que la file n'est pas vide), vide. */
  semaine: { jour: Jour; coche: boolean; aujourdhui: boolean }[];
  envoyeesMois: number;
  /** Pourcentage de réponses, `null` quand l'application ne les connaît pas. */
  tauxReponse: number | null;
  reglages: { debut: string; fin: string; espacementJours: number };
  suggestion: { cle: string; clientNom: string; envoyees: number } | null;
}

const DELAI_PREMIERE: Record<MotifRelance, number> = {
  devis: DELAIS_PAR_DEFAUT.devisJours,
  facture: DELAIS_PAR_DEFAUT.factureJours,
  'rendez-vous': DELAIS_PAR_DEFAUT.rendezVousJours,
  prospect: DELAIS_PAR_DEFAUT.prospectJours,
  inactif: DELAIS_PAR_DEFAUT.inactifJours,
};

const initialeDe = (nom: string): string => (nom.trim()[0] ?? '?').toLocaleUpperCase('fr-FR');

/** Les relances telles qu'elles sont après les gestes déjà faits sur ce poste. */
export function appliquerTraces(relances: readonly Relance[], traces: readonly Trace[]): Relance[] {
  const envois = new Map<string, Trace[]>();
  for (const t of traces) if (t.geste === 'envoyee') envois.set(t.cle, [...(envois.get(t.cle) ?? []), t]);
  return relances.map((r) => {
    const faits = envois.get(cleRelance(r));
    if (!faits || r.etat === 'répondue' || r.etat === 'arrêtée') return r;
    const dernier = jourDeInstant(Math.max(...faits.map((t) => t.le)));
    return { ...r, etat: 'envoyée', nbEnvoyees: r.nbEnvoyees + faits.length, derniereEnvoiLe: r.derniereEnvoiLe && r.derniereEnvoiLe > dernier ? r.derniereEnvoiLe : dernier };
  });
}

const heureDe = (ms: number): string => {
  const m = minutesParis(ms);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export function modelePile(src: SourcesContacts, e: EntreesPile): ModelePile {
  const langue = e.langue ?? 'fr';
  const regles = e.regles ?? REGLES_PAR_DEFAUT;
  const aujourdhui = src.aujourdhui;
  const maintenant = src.maintenant;
  const vivantes = appliquerTraces(src.relances, e.historique.traces);
  const parCle = new Map(vivantes.map((r) => [cleRelance(r), r]));

  // Ce que l'on sait de chaque client : son dernier échange (rien dans les 24 h qui suivent, point 6).
  const contextes = new Map<string, ContexteRelance>();
  for (const x of src.echanges) {
    const c = `c:${x.clientId}`;
    const at = Date.parse(x.at);
    if (Number.isFinite(at)) contextes.set(c, { dernierEchangeHumainAt: Math.max(contextes.get(c)?.dernierEchangeHumainAt ?? 0, at) });
  }

  const tracesDuJour = e.historique.traces.filter((t) => jourDeInstant(t.le) === aujourdhui);
  const reportees = new Set(tracesDuJour.filter((t) => t.geste === 'reportee').map((t) => t.cle));
  const envoyeesDuJour = new Map<string, number>();
  for (const r of vivantes) if (r.derniereEnvoiLe === aujourdhui && r.nbEnvoyees > 0 && r.etat !== 'répondue' && r.etat !== 'arrêtée') envoyeesDuJour.set(cleRelance(r), tracesDuJour.filter((t) => t.cle === cleRelance(r) && t.geste === 'envoyee').map((t) => t.le).sort().at(-1) ?? 0);

  const file = ordonnerFile(vivantes.filter((r) => !reportees.has(cleRelance(r))), maintenant, regles, contextes);
  const faiteCles = new Set(envoyeesDuJour.keys());
  // À traiter : ce qui peut partir maintenant et ce qui part à la prochaine ouverture de la plage (jamais ce qui attend à cause d'une règle).
  const aTraiterEntrees = [...file.maintenant, ...file.plusTard.filter((x) => !x.verdict.possible && x.verdict.raison === 'horsPlage')]
    .filter((x) => !faiteCles.has(cleRelance(x.relance)));
  const ordreAttendu = aTraiterEntrees.map((x) => cleRelance(x.relance));
  const passees = e.passees.filter((c) => ordreAttendu.includes(c));
  const ordre = [...ordreAttendu.filter((c) => !passees.includes(c)), ...passees];
  const courante = e.selection && ordre.includes(e.selection) ? e.selection : (ordre[0] ?? null);

  const dejaDuMatin = e.historique.matin?.jour === aujourdhui ? e.historique.matin.cles : [];
  const matin = [...new Set([...dejaDuMatin, ...faiteCles, ...reportees, ...ordre])];
  const traitees = matin.filter((c) => faiteCles.has(c) || reportees.has(c)).length;
  const videe = matin.length > 0 && ordre.length === 0;

  const lignesDe = (cle: string, etat: LigneFile['etat'], droite: LigneFile['droite']): LigneFile | null => {
    const r = parCle.get(cle);
    if (!r) return null;
    return { cle, clientNom: r.clientNom, motif: r.motif, reference: referenceDe(r), montant: r.montantCents != null ? euros(r.montantCents, langue) : null, etat, droite };
  };
  const faites = [...faiteCles].sort((a, b) => (envoyeesDuJour.get(a) ?? 0) - (envoyeesDuJour.get(b) ?? 0));
  const lignes: LigneFile[] = [
    ...faites.map((c) => lignesDe(c, 'faite', (envoyeesDuJour.get(c) ?? 0) > 0 ? { genre: 'heure', heure: heureDe(envoyeesDuJour.get(c) ?? 0) } : { genre: 'rang', rang: parCle.get(c)?.nbEnvoyees ?? 1 })),
    ...[...reportees].map((c) => lignesDe(c, 'faite', { genre: 'reportee' })),
    ...ordre.map((c) => {
      const r = parCle.get(c) as Relance;
      return lignesDe(c, c === courante ? 'encours' : 'avenir', c === courante ? { genre: 'encours' } : r.nbEnvoyees > 0 ? { genre: 'rang', rang: r.nbEnvoyees + 1 } : { genre: 'jours', n: Math.max(0, ecartJours(r.departLe, aujourdhui)) });
    }),
  ].filter((x): x is LigneFile => x != null);

  // La carte focalisée.
  let carte: CarteRelance | null = null;
  let frise: EtapeFrise[] | null = null;
  let motifFrise: MotifRelance | null = null;
  if (courante) {
    const r = parCle.get(courante) as Relance;
    const verdict = verdictRelance(r, vivantes, maintenant, regles, contextes.get(cleClient(r)));
    const lien: Interlocuteur | undefined = src.interlocuteurs?.find((i) => i.organisationType === (r.clientId != null ? 'client' : 'prospect') && (r.clientId != null ? i.organisationId === String(r.clientId) : i.organisationNom === r.clientNom));
    const prenom = lien?.prenom ?? null;
    const defaut = messageClientTon(r, langue, aujourdhui, prenom ?? undefined, e.ton);
    const brouillon = e.brouillons[courante];
    carte = {
      cle: courante,
      clientNom: r.clientNom,
      initiale: initialeDe(r.clientNom),
      motif: r.motif,
      reference: referenceDe(r),
      montant: r.montantCents != null ? euros(r.montantCents, langue) : null,
      rang: r.nbEnvoyees + 1,
      max: regles.maxParObjet,
      derniere: r.nbEnvoyees + 1 >= regles.maxParObjet,
      depuisJours: Math.max(0, ecartJours(r.departLe, aujourdhui)),
      aucuneReponse: r.etat !== 'répondue',
      verdict,
      peutPartir: verdict.possible,
      statutEnvoi: verdict.possible ? dire(langue, 'relance.part.maintenant') : phraseAttente(verdict, langue, regles),
      suite: suiteApres(r.nbEnvoyees, regles.maxParObjet),
      a: lien?.nomComplet ?? r.clientNom,
      destinataire: { prenom, nomComplet: lien?.nomComplet ?? null },
      sujet: dire(langue, `client.sujet.${r.motif}` as const, { objet: referenceDe(r) }),
      corps: brouillon ?? defaut,
      modifie: brouillon != null && brouillon !== defaut,
    };
    // La frise de l'objet : le départ, deux relances, l'appel proposé, le suivi à la main. Les dates suivent l'étape en cours.
    const base = cadence(r.motif === 'inactif' ? aujourdhui : r.departLe, regles, DELAI_PREMIERE[r.motif]);
    const courant = Math.min(r.nbEnvoyees, 3);
    let precedent: Jour | undefined;
    frise = base.map((x, i) => {
      const indexCourant = i - 1; // 0 : 1re relance, 1 : 2e, 2 : appel, 3 : suivi à la main
      let le = x.le;
      if (x.genre !== 'depart' && x.genre !== 'manuel') {
        if (indexCourant === courant) le = verdict.possible ? aujourdhui : jourDe(verdict.prochaineLe ?? maintenant);
        else if (indexCourant > courant && precedent) le = prochainJourOuvre(ajouterJours(precedent, regles.espacementJours), regles);
      }
      precedent = le ?? precedent;
      const etat: EtapeFrise['etat'] = x.genre === 'depart' ? 'fait' : x.genre === 'manuel' ? 'fin' : indexCourant < courant ? 'fait' : indexCourant === courant ? 'maintenant' : 'avenir';
      return { genre: x.genre, rang: x.rang, etat, le, jourN: le && x.genre !== 'manuel' ? ecartJours(base[0].le as Jour, le) : undefined, aujourdhui: etat === 'maintenant' && le === aujourdhui && verdict.possible ? true : undefined };
    });
    motifFrise = r.motif;
  }

  const ensuite = ordre.filter((c) => c !== courante).slice(0, 3).map((c) => (parCle.get(c) as Relance).clientNom);

  // Boîte à zéro : la série, et la semaine en cours (lun. à ven.).
  const vides = new Set(e.historique.joursVides);
  if (videe) vides.add(aujourdhui);
  const serie = serieBoiteAZero([...vides], aujourdhui, regles);
  const lundi = ajouterJours(aujourdhui, -(jourSemaine(aujourdhui) - 1));
  const semaine = Array.from({ length: 5 }, (_, i) => {
    const jour = ajouterJours(lundi, i);
    return { jour, coche: vides.has(jour), aujourdhui: jour === aujourdhui };
  });

  const mois = aujourdhui.slice(0, 7);
  const envoyeesMois = vivantes.filter((r) => r.nbEnvoyees > 0 && (r.derniereEnvoiLe ?? '').startsWith(mois)).length;
  const repondues = vivantes.filter((r) => r.etat === 'répondue' && (r.derniereEnvoiLe ?? '').startsWith(mois)).length;
  const tauxReponse = e.reponses === null || envoyeesMois === 0 ? null : Math.round((repondues / envoyeesMois) * 100);

  const candidate = vivantes.find((r) => (r.etat === 'envoyée' || r.etat === 'prête') && r.nbEnvoyees >= 2 && suiteApres(r.nbEnvoyees, regles.maxParObjet) === 'appel' && !e.suggestionMasquee?.has(cleRelance(r)));
  const suggestion = candidate ? { cle: cleRelance(candidate), clientNom: candidate.clientNom, envoyees: candidate.nbEnvoyees } : null;

  return {
    aujourdhui, total: matin.length, traitees, reste: ordre.length, videe, lignes, courante: carte, ensuite, matin, frise, motifFrise,
    reponses: e.reponses, serie, semaine, envoyeesMois, tauxReponse,
    reglages: { debut: regles.fenetre.debut, fin: regles.fenetre.fin, espacementJours: regles.espacementJours },
    suggestion,
  };
}

/** Pour l'aperçu et les contrôles : les réponses déduites des relances déjà « répondue » aujourd'hui (sans heure : les données n'en portent pas). */
export function reponsesDepuisRelances(relances: readonly Relance[], aujourdhui: Jour, langue: Langue = 'fr'): ReponseDuJour[] {
  return relances
    .filter((r) => r.etat === 'répondue' && r.derniereEnvoiLe === aujourdhui)
    .map((r) => ({ clientNom: r.clientNom, texte: r.motif === 'facture' ? `${r.objetLibelle} ${dire(langue, 'relance.reponse.payee')}` : r.objetLibelle, genre: r.motif === 'facture' ? 'paiement' : 'message' }));
}
