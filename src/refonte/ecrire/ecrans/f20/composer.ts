import { jourDe, partiesParis, MS_JOUR, ms, type Instant, type Langue } from '../../commun';
import { MODULES_D_ECRIRE, suggestionDeRangement, tuilesDuHub, type MesuresDuHub, type NoteRapideMin } from '../../hub';
import { coAuteursPresents, pagesRecentes, type FiltreDePages, type PageMin, type Presence } from '../../pages';
import { fileDeRelecture, type DocumentAttendu } from '../../relecture';
import { badgesDeSerie, moisEnCases, serieDEcriture, type MotsParJour } from '../../serie';
import { delaiMoyenDeSignature, type DemandeMin } from '../../signatures';
import { ilYAUnMois } from '../../journal';
import type { PageDeJournal } from '../../journal';
import { dire, direCompte } from '../../i18n';
import { moisEnToutesLettres, phraseDeSerie, conseilDuJour } from '../../phrases';
import { dureeDeLecture } from '../../connaissances';
import type { BadgeVue, BlocApercu, CaseSerie, FeuilleDessous, FeuilleDessus, LigneRelectureVue, TuileVue, VueHubProps } from './VueHub';

/**
 * F20 — COMPOSER LA VUE : de ce que le poste (ou le bac à sable) sait, aux textes et aux nombres que `VueHub` affiche.
 * Logique pure, sans React : toutes les règles viennent des fichiers du lot (`../../*.ts`) ; ici on ne fait que les
 * assembler. Une valeur absente n'est pas inventée : la ligne disparaît (fiche F20, rubrique 8).
 */

export interface EntreesHub {
  langue: Langue;
  maintenant: Instant;
  moi: { email: string; prenom: string };
  /** Le prénom d'une personne, d'après son adresse. */
  prenomDe: (email: string) => string;
  pages: readonly PageMin[];
  presences: readonly Presence[];
  filtre: FiltreDePages;
  mesures: MesuresDuHub;
  /** Les modules ouverts à l'organisation (clé du lot). `null` : tous. */
  modulesOuverts: ReadonlySet<string> | null;
  documents: readonly DocumentAttendu[];
  signaturesActives: boolean;
  demandes: readonly DemandeMin[];
  mots: MotsParJour;
  journal: readonly PageDeJournal[];
  notesRapides: readonly NoteRapideMin[];
  /** Le titre de la page du dessus, son aperçu, et ce que le poste en sait. */
  apercuDe: (page: PageMin) => { blocs: BlocApercu[]; liee: string | null; cheminDe: string[] };
  /** Le chemin (`/notes`, etc.) de chaque module : défini par la page, pas par la logique. */
  routes: Record<string, string>;
  jourSemaineInitiales: string[];
}

const jourCourt = (at: Instant, maintenant: Instant, langue: Langue): string => {
  const a = partiesParis(at);
  const m = partiesParis(maintenant);
  if (a.jour === m.jour) return `${String(Math.floor(a.minutes / 60)).padStart(2, '0')}:${String(a.minutes % 60).padStart(2, '0')}`;
  const veille = jourDe(new Date(ms(maintenant) - MS_JOUR).toISOString());
  if (a.jour === veille) return langue === 'fr' ? 'hier' : 'yesterday';
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short', timeZone: 'Europe/Paris' }).format(new Date(ms(at)));
};

const heure = (at: Instant): string => {
  const a = partiesParis(at);
  return `${String(Math.floor(a.minutes / 60)).padStart(2, '0')}:${String(a.minutes % 60).padStart(2, '0')}`;
};

function sousTexteDeTuile(cle: string, nombres: number[], l: Langue, coAuteur: string | null): string {
  switch (cle) {
    case 'notes':
      return coAuteur ? dire(l, 'tuile.notes.coAuteur', { n: nombres[0], qui: coAuteur }) : direCompte(l, 'tuile.notes', nombres[0]);
    case 'documents':
    case 'journal':
    case 'redaction':
    case 'modeles':
    case 'signatures':
    case 'archives':
      return direCompte(l, `tuile.${cle}`, nombres[0]);
    case 'connaissances':
      return dire(l, 'tuile.connaissances', { articles: nombres[0], lectures: nombres[1] });
    default:
      return dire(l, 'tuile.dictee');
  }
}

export function composerHub(e: EntreesHub, tm: (cle: string, p?: Record<string, string | number>) => string, etat: { onFiltre: (c: string) => void; onOuvrir: (page: PageMin) => void; onNouvellePage: () => void; onPersonnaliser: () => void; onRanger: () => void; onNonRanger: () => void; icones: Record<string, import('react').ReactNode>; noms: Record<string, string>; libelles: Record<string, string> }): VueHubProps {
  const aujourdhui = jourDe(e.maintenant);
  const coAut = coAuteursPresents(e.presences, e.moi.email, e.maintenant);
  const coAuteurPrenom = coAut.length ? e.prenomDe(coAut[0]) : null;
  const ouverts = e.modulesOuverts;
  const actifs = ouverts ? new Set(MODULES_D_ECRIRE.map((m) => m.cle).filter((c) => ouverts.has(c))) : null;

  // Série d'écriture (une seule règle : la série du journal, §1.29 n° 1)
  const serie = serieDEcriture(e.mots, aujourdhui);
  const mois = moisEnCases(e.mots, aujourdhui, aujourdhui);
  const badges: BadgeVue[] = badgesDeSerie(serie).map((b) => ({ libelle: b.genre === 'palier' ? dire(e.langue, 'serie.badge.palier', { n: b.valeur }) : dire(e.langue, 'serie.badge.record', { n: b.valeur }), obtenu: b.obtenu }));
  const souv = ilYAUnMois(e.journal, e.moi.email, aujourdhui);
  const mesures: MesuresDuHub = { ...e.mesures, serieJournal: serie.serie, coAuteur: coAuteurPrenom };

  const tuiles: TuileVue[] = tuilesDuHub(mesures, actifs as never).map((t) => ({
    cle: t.cle,
    nom: etat.noms[t.cle] ?? t.cle,
    icone: etat.icones[t.cle],
    sous: sousTexteDeTuile(t.cle, t.nombres, e.langue, t.cle === 'notes' ? coAuteurPrenom : null),
    vers: e.routes[t.cle] ?? '/',
    ton: t.cle === 'journal' ? 'vert' : t.ton,
    pastille: t.pastille,
    nouveau: t.nouveau,
    coAuteur: t.cle === 'notes' ? coAuteurPrenom : null,
  }));

  // Pages récentes : la dernière feuille est la page du dessus
  const recentes = pagesRecentes(e.pages, e.moi.email, e.filtre);
  const dessus = recentes[0] ?? null;
  const dessous: FeuilleDessous[] = recentes
    .slice(1, 5)
    .reverse()
    .map((p) => ({ id: p.id, titre: p.title, auteurQuand: `${e.prenomDe(p.modifieParEmail)} · ${jourCourt(p.modifieAt, e.maintenant, e.langue)}` }));
  let feuilleDessus: FeuilleDessus | null = null;
  if (dessus) {
    const ap = e.apercuDe(dessus);
    const mots = dessus.blocs.reduce((s, b) => s + b.texte.split(/\s+/).filter(Boolean).length, 0);
    const lecture = Math.max(1, Math.round(dureeDeLecture(mots) / 60));
    const il = Math.max(0, Math.round((ms(e.maintenant) - ms(dessus.modifieAt)) / 1000));
    const modif = e.langue === 'fr' ? (il < 60 ? `modifiée il y a ${il} s` : `modifiée il y a ${Math.round(il / 60)} min`) : il < 60 ? `edited ${il} s ago` : `edited ${Math.round(il / 60)} min ago`;
    feuilleDessus = {
      id: dessus.id,
      chemin: ap.cheminDe,
      coAuteurs: coAut.map(e.prenomDe),
      titre: dessus.title,
      meta: [modif, e.langue === 'fr' ? `${lecture} min de lecture` : `${lecture} min read`, ap.liee].filter(Boolean).join(' · '),
      blocs: coAut.length ? avecCurseur(ap.blocs, e.prenomDe(coAut[0])) : ap.blocs,
      enregistre: tm('pages.enregistre'),
    };
  }

  // Attend une relecture
  const lignes = fileDeRelecture(e.documents, e.moi.email, { signaturesActives: e.signaturesActives }).slice(0, 4);
  const lignesVue: LigneRelectureVue[] = lignes.map((l) => ({
    id: l.id,
    titre: l.titre,
    action: l.pourMoi ? { libelle: l.etape === 'signature' ? tm('relecture.signer') : tm('relecture.relire'), vers: e.routes[l.etape === 'signature' ? 'signatures' : 'documents'] ?? '/' } : null,
    pourMoi: l.pourMoi,
    detail: l.pourMoi
      ? e.langue === 'fr' ? `demandé par ${e.prenomDe(l.demandeurEmail)}, ${jourCourt(l.demandeAt, e.maintenant, e.langue)}` : `asked by ${e.prenomDe(l.demandeurEmail)}, ${jourCourt(l.demandeAt, e.maintenant, e.langue)}`
      : e.langue === 'fr' ? `${l.etape} de ${e.prenomDe(l.demandeurEmail)} · ${heure(l.demandeAt)}` : `${l.etape} by ${e.prenomDe(l.demandeurEmail)} · ${heure(l.demandeAt)}`,
    segments: l.segments,
    etape: l.etape,
    etapeLibelle: tm(`relecture.etape.${l.etape}`),
  }));
  const delai = delaiMoyenDeSignature(e.demandes, new Date(ms(e.maintenant) - 90 * MS_JOUR).toISOString(), e.maintenant);
  const delaiTexte = delai.jours === null ? null : e.langue === 'fr' ? `Tes devis sont signés en ${String(delai.jours).replace('.', ',')} jour en moyenne` : `Your quotes are signed in ${delai.jours} days on average`;

  // Suggestion de rangement
  const rangement = suggestionDeRangement(e.notesRapides, aujourdhui);

  return {
    titre: tm('titre'),
    sousTitre: sousTitre(e, serie.serie, coAuteurPrenom, lignes.some((l) => l.pourMoi)),
    libelles: etat.libelles,
    modules: tuiles,
    raccourcis: [
      { libelle: tm('raccourci.nouvellePage'), touches: 'N N', icone: etat.icones.nouvellePage },
      { libelle: tm('raccourci.dicter'), touches: '⌘ D', icone: etat.icones.dictee },
      { libelle: tm('raccourci.signer'), touches: 'S', icone: etat.icones.signatures },
    ],
    pages: {
      filtre: e.filtre,
      puces: [
        { cle: 'toutes', libelle: tm('pages.toutes') },
        { cle: 'miennes', libelle: tm('pages.miennes') },
        { cle: 'partagees', libelle: tm('pages.partagees') },
      ],
      onFiltre: etat.onFiltre,
      dessous,
      dessus: feuilleDessus,
      onOuvrirDessus: () => dessus && etat.onOuvrir(dessus),
    },
    relecture: { total: direCompte(e.langue, 'file.documents', lignes.length), lignes: lignesVue, delai: delaiTexte, vide: tm('relecture.vide') },
    serie: {
      mois: moisEnToutesLettres(aujourdhui, e.langue),
      valeur: serie.serie,
      ecrits: direCompte(e.langue, 'serie.ecrits', mois.joursEcrits),
      phrase: phraseDeSerie(serie, e.langue),
      conseil: conseilDuJour(serie, e.langue) && serie.serie === 0 ? tm('serie.vide') : null,
      initiales: e.jourSemaineInitiales,
      decalage: mois.decalage,
      cases: mois.cases.map<CaseSerie>((c) => ({ jour: Number(c.jour.slice(8)), etat: c.etat === 'ecrit' ? 'ecrit' : c.etat === 'aujourdhui' ? 'aujourdhui' : c.etat === 'futur' ? 'avenir' : 'vide', palier: c.palier })),
      souvenir: souv?.texte ? { texte: souv.texte.split(/(?<=[.!?])\s+/)[0], ancien: e.langue === 'fr' ? 'ton journal, il y a un mois' : 'your journal, a month ago' } : null,
      badges,
    },
    suggestion: rangement ? { texte: e.langue === 'fr' ? `${rangement.n} notes rapides n’ont pas de place. Je les range dans tes projets en cours ?` : `${rangement.n} quick notes have no place. Shall I sort them into your current projects?`, onOui: etat.onRanger, onNon: etat.onNonRanger } : null,
    onNouvellePage: etat.onNouvellePage,
    onPersonnaliser: etat.onPersonnaliser,
  };
}

/** Le curseur d'un collègue se pose à la fin du dernier paragraphe de l'aperçu (fiche F20, § 8 : seulement s'il y a un coauteur). */
function avecCurseur(blocs: BlocApercu[], prenom: string): BlocApercu[] {
  let dernier = -1;
  blocs.forEach((b, i) => {
    if (b.type === 'texte') dernier = i;
  });
  return blocs.map((b, i) => (i === dernier ? { ...b, curseur: prenom } : b));
}

function sousTitre(e: EntreesHub, serie: number, coAuteur: string | null, relecturePourMoi: boolean): string {
  const l = e.langue;
  const morceaux: string[] = [];
  if (serie > 0) morceaux.push(l === 'fr' ? `${serie} jours d’écriture d’affilée` : `${serie} days of writing in a row`);
  if (coAuteur) morceaux.push(l === 'fr' ? `${coAuteur} écrit avec toi` : `${coAuteur} is writing with you`);
  if (relecturePourMoi) morceaux.push(l === 'fr' ? 'une relecture t’attend' : 'a review is waiting for you');
  const salut = l === 'fr' ? `Bonjour ${e.moi.prenom}` : `Hello ${e.moi.prenom}`;
  return morceaux.length ? `${salut}, ${morceaux.join(' · ')}` : salut;
}
