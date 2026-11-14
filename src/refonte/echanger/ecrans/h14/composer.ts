import { ecartJours, jourDe, ms, partiesParis, type Instant, type Jour, type Langue } from '../../commun';
import {
  accuses,
  aConfirmer,
  annoncesDeLEquipe,
  categories,
  composerLeTableau,
  luPar,
  maconnerie,
  peutConfirmer,
  presqueAJour,
  rappelAProposer,
  segmentsDeLecture,
  REACTIONS,
  type AnnonceMin,
  type TypeDeReaction,
} from '../../annonces';
import { traduire } from './i18n';
import type { AccuseVue, BarreVue, CarteDeColonne, CategorieVue, NoteVue, ReactionVue, TonDeCategorie, UneVue, VueAnnoncesProps } from './VueAnnonces';

/**
 * H14 — COMPOSER LA VUE du tableau d'annonces : « À la une » (l'épinglée la plus récente, ou la plus récente sans bordure
 * ambre), la mosaïque en trois colonnes (rangement « maçonnerie » de `../../annonces.ts`), « Presque à jour », les catégories
 * et la suggestion de rappel. Logique pure. Ce que le poste ne sait pas n'est pas montré : sans catégories, pas de carte
 * « Catégories » ; sans réactions, pas de rangée de réactions ; sans épingle, pas de bordure ambre.
 */

export interface AnnonceAffichable extends AnnonceMin {
  auteurNom: string;
}

export interface EntreesAnnonces {
  langue: Langue;
  maintenant: Instant;
  moi: string;
  /** Les membres actifs : destinataires par défaut, nommés dans les accusés. */
  equipe: readonly { email: string; nom: string }[];
  annonces: readonly AnnonceAffichable[];
  /** Les catégories existent dans les données (sinon pas de carte « Catégories » ni de point sur les notes). */
  avecCategories: boolean;
  /** Les réactions existent dans les données (sinon pas de rangée de réactions). */
  avecReactions: boolean;
  filtre: string | null;
  /** Le brouillon en place, ou `null` sans droit de publier. */
  brouillon: { titre: string; texte: string; epingler: boolean | null } | null;
  /** « Nouveauté d'AMN Business » : un texte du produit, jamais compté parmi les annonces. */
  nouveaute?: string;
  /** La suggestion de rappel déjà écartée (« Non merci ») : par identifiant d'annonce. */
  suggestionsMasquees?: readonly string[];
  /** Combien de temps avant l'heure annoncée la suggestion de rappel apparaît (Proposition de la fiche : 2 h ; l'image la montre tout le jour). */
  rappelAvantMs?: number;
}

/** Les quatre catégories que la fiche nomme ont la couleur de leur famille ; les autres tournent sur les familles restantes. */
const TON_DES_NOMS: Record<string, TonDeCategorie> = { technique: 'outils', technical: 'outils', clients: 'contacts', client: 'contacts', design: 'creer', 'équipe': 'jour', equipe: 'jour', team: 'jour' };
const TONS_LIBRES: readonly TonDeCategorie[] = ['ecrire', 'argent', 'outils', 'contacts', 'creer', 'jour'];
export function tonDeCategorie(nom: string): TonDeCategorie {
  const connu = TON_DES_NOMS[nom.trim().toLowerCase()];
  if (connu) return connu;
  let h = 0;
  for (const c of nom.trim().toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONS_LIBRES[h % TONS_LIBRES.length];
}

const MOIS_COURTS: Record<Langue, readonly string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const heure = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};
const jourCourt = (j: Jour, l: Langue) => (l === 'fr' ? `${Number(j.slice(8, 10))} ${MOIS_COURTS.fr[Number(j.slice(5, 7)) - 1]}` : `${MOIS_COURTS.en[Number(j.slice(5, 7)) - 1]} ${Number(j.slice(8, 10))}`);

/** La date d'une note : « hier 17:40 », « 26 oct. » ; le jour même, l'heure seule. */
export function dateDeNote(at: Instant, maintenant: Instant, l: Langue): string {
  const j = jourDe(at);
  const auj = jourDe(maintenant);
  if (j === auj) return heure(at);
  if (ecartJours(j, auj) === 1) return traduire(l, 'quand.hier' as never, { heure: heure(at) });
  return jourCourt(j, l);
}
/** La date de « À la une » : « Aujourd'hui, 09:12 », « hier 17:40 », « 26 oct., 09:12 ». */
function dateDeLaUne(at: Instant, maintenant: Instant, l: Langue): string {
  const j = jourDe(at);
  const auj = jourDe(maintenant);
  if (j === auj) return traduire(l, 'quand.aujourdhui' as never, { heure: heure(at) });
  const base = ecartJours(j, auj) === 1 ? traduire(l, 'quand.hier' as never, { heure: heure(at) }) : `${jourCourt(j, l)}, ${heure(at)}`;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** La hauteur d'une note d'après son contenu : le rangement se fait avant le rendu, les hauteurs varient. */
export function hauteurEstimee(a: Pick<AnnonceMin, 'titre' | 'texte'>): number {
  const lignesTitre = Math.max(1, Math.ceil(a.titre.length / 24));
  const lignesTexte = Math.min(8, Math.max(1, Math.ceil(a.texte.length / 34)));
  return 100 + lignesTitre * 20 + lignesTexte * 19;
}
export const HAUTEUR_DU_BROUILLON = 177;
const ID_DU_BROUILLON = '__brouillon__';

export function composerAnnonces(e: EntreesAnnonces): Omit<VueAnnoncesProps, 'libelles' | 'actions' | 'etat'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const emails = e.equipe.map((m) => m.email);
  const nomDe = (email: string) => e.equipe.find((m) => m.email === email)?.nom ?? email;
  const vraies = annoncesDeLEquipe(e.annonces) as AnnonceAffichable[];
  const filtrees = e.filtre ? vraies.filter((a) => a.categorie === e.filtre) : vraies;
  const tableau = composerLeTableau(filtrees);
  const cat = (a: AnnonceMin): CategorieVue | null => (e.avecCategories && a.categorie ? { nom: a.categorie, ton: tonDeCategorie(a.categorie) } : null);
  const barre = (a: AnnonceMin): BarreVue => {
    const lu = luPar(a, emails);
    const seg = segmentsDeLecture(lu.lus, lu.sur);
    return { pleins: seg.pleins, vert: seg.vert, texte: t('luPar', { x: lu.lus, y: lu.sur }) };
  };
  const auteurDe = (a: AnnonceMin) => (a as AnnonceAffichable).auteurNom ?? nomDe(a.auteurEmail);

  let aLaUne: UneVue | null = null;
  if (tableau.aLaUne) {
    const a = tableau.aLaUne;
    const accus: AccuseVue[] = accuses(a, emails).map((x) => ({
      email: x.email,
      nom: x.email === e.moi ? t('toi', { nom: nomDe(x.email) }) : nomDe(x.email),
      avatar: nomDe(x.email),
      sous: x.email === a.auteurEmail ? t('auteur') : x.lu ? (x.at !== null ? t('luA', { heure: heure(x.at) }) : t('lu')) : t('pasConfirme'),
      lu: x.lu,
      moi: x.email === e.moi,
    }));
    const reactions: ReactionVue[] | null = e.avecReactions
      ? (REACTIONS as readonly TypeDeReaction[]).map((type) => ({ type, libelle: t(`reaction.${type}`), n: (a.reactions ?? []).filter((r) => r.type === type).length, active: (a.reactions ?? []).some((r) => r.type === type && r.email === e.moi) }))
      : null;
    aLaUne = {
      id: a.id,
      epinglee: !tableau.sansBordureAmbre,
      categorie: cat(a),
      quand: dateDeLaUne(a.publieeAt, e.maintenant, l),
      auteur: auteurDe(a),
      titre: a.titre,
      texte: a.texte,
      accuses: accus,
      lu: barre(a),
      reactions,
      peutConfirmer: peutConfirmer(a, e.moi, emails),
    };
  }

  const carteDeNote = (a: AnnonceMin): NoteVue => {
    const rs = a.reactions ?? [];
    const dominante = REACTIONS.map((type) => ({ type, n: rs.filter((r) => r.type === type).length })).sort((x, y) => y.n - x.n)[0];
    return { id: a.id, categorie: cat(a), epinglee: a.epinglee, titre: a.titre, texte: a.texte, auteur: auteurDe(a), date: dateDeNote(a.publieeAt, e.maintenant, l), reaction: e.avecReactions && dominante && dominante.n > 0 ? dominante : null, lu: barre(a) };
  };
  const parId = new Map(tableau.mosaique.map((a) => [a.id, a] as const));
  // Le brouillon est la dernière carte du rangement : il prend la place libre la plus haute (la colonne la moins haute).
  const cartes = [...tableau.mosaique.map((a) => ({ id: a.id, hauteur: hauteurEstimee(a) })), ...(e.brouillon ? [{ id: ID_DU_BROUILLON, hauteur: HAUTEUR_DU_BROUILLON }] : [])];
  const rangement = maconnerie(cartes, 3);
  const colonnes: CarteDeColonne[][] = [[], [], []];
  for (const p of [...rangement.placements].sort((x, y) => x.y - y.y || x.colonne - y.colonne)) {
    const a = parId.get(p.id);
    if (a) colonnes[p.colonne].push({ genre: 'note', note: carteDeNote(a) });
    else if (p.id === ID_DU_BROUILLON) colonnes[p.colonne].push({ genre: 'brouillon' });
  }

  const pj = presqueAJour(e.annonces, e.moi, emails);
  const reste = aConfirmer(e.annonces, e.moi, emails);
  const aFaire = [...vraies].sort((x, y) => ms(y.publieeAt) - ms(x.publieeAt)).find((a) => peutConfirmer(a, e.moi, emails));
  const presque: VueAnnoncesProps['presque'] =
    pj.sur === 0
      ? null
      : {
          ratio: pj.faites / pj.sur,
          texte: `${pj.faites}/${pj.sur}`,
          titre: pj.etat === 'a-jour' ? t('presque.titre.aJour') : pj.etat === 'presque' ? t('presque.titre.presque') : t('presque.titre.n', { n: reste }),
          message: pj.etat === 'a-jour' ? t('presque.texte.aJour') : reste <= 1 ? t('presque.texte.1') : t('presque.texte.n', { n: reste }),
          ton: pj.etat === 'a-jour' ? 'succes' : 'attention',
          epingle: aFaire ? { id: aFaire.id, titre: aFaire.titre } : null,
        };

  const cats = e.avecCategories ? categories(vraies) : [];
  const categoriesVue: VueAnnoncesProps['categories'] = cats.length
    ? { toutes: vraies.length, lignes: cats.map((c) => ({ nom: c.categorie, n: c.n, barre: c.barre, ton: tonDeCategorie(c.categorie), actif: e.filtre === c.categorie })), actif: e.filtre }
    : null;

  // La suggestion d'Ajmani : un rappel avant l'heure annoncée, jamais envoyé sans « Programmer ». Rappelé à l'heure moins un quart d'heure.
  let suggestion: VueAnnoncesProps['suggestion'] = null;
  const candidate = vraies.find((a) => !(e.suggestionsMasquees ?? []).includes(a.id) && rappelAProposer(a, emails, e.maintenant, e.rappelAvantMs));
  if (candidate) {
    const r = rappelAProposer(candidate, emails, e.maintenant, e.rappelAvantMs);
    const rappel = r ? r.heureMin - 15 : 0;
    suggestion = { texte: t('suggestion.texte', { titre: candidate.titre, rappel: `${String(Math.floor(rappel / 60)).padStart(2, '0')}:${String(rappel % 60).padStart(2, '0')}` }), programmer: t('suggestion.programmer'), non: t('suggestion.non') };
  }

  return {
    aLaUne,
    colonnes,
    brouillon: e.brouillon ? { auteur: nomDe(e.moi), ...e.brouillon } : null,
    presque,
    categories: categoriesVue,
    suggestion,
    nouveaute: e.nouveaute ? { texte: e.nouveaute } : null,
  };
}
