import { dateFr, jourDe, nomDuJour, partiesParis, type Instant, type Jour, type Langue } from '../../commun';
import { dire, direCompte } from '../../i18n';
import { humeurDuMois, ilYAUnMois, motsDeLaPage, pagesDe, peutPasserADemain, proposerResume, type Humeur, type PageDeJournal } from '../../journal';
import { moisEnCases, motsParJour, serieDEcriture } from '../../serie';
import { moisEnToutesLettres, phraseDeSerie } from '../../phrases';
import { traduire } from './i18n';
import type { BarreHumeurVue, JourCalendrier, VueJournalProps } from './VueJournal';

/**
 * ME01 — COMPOSER LA VUE du Journal : le calendrier du mois et sa série, l'humeur du mois, le souvenir d'il y a un mois,
 * la page du jour. Logique pure : les règles viennent de `../../journal.ts` et `../../serie.ts`. Le journal est personnel :
 * la page ne montre que les pages de la personne (`pagesDe`).
 */

export interface EntreesJournal {
  langue: Langue;
  maintenant: Instant;
  moi: string;
  pages: readonly PageDeJournal[];
  /** Le jour ouvert. */
  jour: Jour;
  /** Une page « Bilan de la semaine » existe-t-elle au calendrier (déclencheur du résumé du vendredi) ? */
  bilanAuCalendrier: boolean;
  /** L'heure du bilan, si connue : « 16:00 ». */
  heureDuBilan: string | null;
  initiales: string[];
  /** Les nombres du jour ouvert : le texte tapé, la dernière frappe… fournis par la page. */
  enregistreA: Instant | null;
  commenceeA: Instant | null;
}

const heure = (at: Instant): string => {
  const m = partiesParis(at).minutes;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const NOM_COURT: Record<Langue, string[]> = { fr: ['basse', 'modeste', 'correcte', 'bonne', 'haute'], en: ['low', 'modest', 'fine', 'good', 'high'] };

export function composerJournal(e: EntreesJournal, actions: { onChoisirHumeur: (v: number) => void; onChangerTexte: (t: string) => void; onOuvrirJour: (j: Jour) => void; onResumer: () => void; onNonResumer: () => void }): Omit<VueJournalProps, 'libelles' | 'onEcrire' | 'onModeles'> {
  const l = e.langue;
  const aujourdhui = jourDe(e.maintenant);
  const miennes = pagesDe(e.pages, e.moi);
  const mots = motsParJour(miennes.map((p) => ({ jour: p.jour, mots: motsDeLaPage(p) })));
  const serie = serieDEcriture(mots, aujourdhui);
  const mois = moisEnCases(mots, e.jour, aujourdhui);
  const jours: JourCalendrier[] = mois.cases.map((c) => ({
    jour: Number(c.jour.slice(8)),
    etat: c.jour === aujourdhui ? 'aujourdhui' : c.etat === 'ecrit' ? 'ecrit' : c.etat === 'futur' ? 'avenir' : 'vide',
    intensite: c.intensite,
    onClick: c.jour <= aujourdhui ? () => actions.onOuvrirJour(c.jour) : undefined,
  }));
  const hm = humeurDuMois(miennes, mois.mois);
  const barres: BarreHumeurVue[] = hm.barres.map((b, i, tout) => ({ jour: b.jour, hauteur: b.hauteurPourcent, derniere: i === tout.length - 1 }));
  const souv = ilYAUnMois(miennes, e.moi, aujourdhui);
  const page = miennes.find((p) => p.jour === e.jour) ?? null;
  const resume = proposerResume(miennes, e.moi, aujourdhui, e.bilanAuCalendrier);
  const nom = (h: Humeur) => traduire(l, `humeur.${h}` as never);
  const humeurPage = page?.humeur ?? null;
  const palierTexte = serie.prochainPalier !== null && serie.joursAvantPalier !== null ? direCompte(l, 'serie.palier', serie.joursAvantPalier, { palier: serie.prochainPalier }) : null;
  return {
    titre: traduire(l, 'titre'),
    sousTitre: serie.serie > 0 ? traduire(l, 'sousTitre.serie', { serie: `${direCompte(l, 'serie.jours', serie.serie)}, ${phraseDeSerie(serie, l).split(' · ')[0].toLowerCase()}` }) : traduire(l, 'sousTitre'),
    calendrier: {
      mois: `${moisEnToutesLettres(`${mois.mois}-01`, l).replace(/^./, (c) => c.toUpperCase())} ${mois.mois.slice(0, 4)}`,
      initiales: e.initiales,
      decalage: mois.decalage,
      jours,
      serie: { valeur: serie.serie, libelle: dire(l, serie.serie <= 1 ? 'serie.jours.1' : 'serie.jours.n', { n: serie.serie }).replace(/^\d+\s/, ''), ecrits: `${direCompte(l, 'serie.ecrits', mois.joursEcrits)} · ${dire(l, 'serie.record', { n: serie.record })}`, progression: serie.progression, palier: palierTexte },
    },
    humeur: {
      titre: traduire(l, 'humeur.titre'),
      plusSouvent: hm.leplusSouvent ? traduire(l, 'humeur.plusSouvent', { humeur: nom(hm.leplusSouvent) }) : null,
      barres,
      bornes: [l === 'fr' ? '1 oct.' : 'Oct. 1', '15', l === 'fr' ? 'aujourd’hui' : 'today'],
    },
    souvenir: souv?.texte ? { quand: traduire(l, 'souvenir.quand', { jour: `${nomDuJour(souv.jour, l)} ${dateFr(souv.jour, l)}` }), texte: souv.texte.split(/(?<=[.!?])\s+/)[0], relire: traduire(l, 'souvenir.relire') } : null,
    page: {
      etiquette: traduire(l, 'page.etiquette'),
      titre: `${nomDuJour(e.jour, l).replace(/^./, (c) => c.toUpperCase())} ${dateFr(e.jour, l)}`,
      meta: { commencee: e.commenceeA ? traduire(l, 'page.commencee', { heure: heure(e.commenceeA) }) : null, mots: traduire(l, (page ? motsDeLaPage(page) : 0) <= 1 ? 'page.mots.1' : 'page.mots.n', { n: page ? motsDeLaPage(page) : 0 }), visibilite: traduire(l, 'page.visibilite') },
      humeur: { titre: traduire(l, 'page.comment'), niveaux: ([1, 2, 3, 4, 5] as Humeur[]).map((h) => ({ valeur: h, libelle: nom(h), actif: humeurPage === h })), onChoisir: actions.onChoisirHumeur },
      energie: page?.energie ? { titre: traduire(l, 'page.energie'), segments: page.energie, libelle: NOM_COURT[l][page.energie - 1].replace(/^./, (c) => c.toUpperCase()) } : null,
      mercis: page?.mercis?.length ? { titre: traduire(l, 'page.mercis'), valeurs: [...page.mercis, '', '', ''].slice(0, 3), placeholder: traduire(l, 'page.mercis.placeholder') } : null,
      retiens: { titre: traduire(l, 'page.retiens'), valeur: page?.texte ?? '', placeholder: traduire(l, 'page.retiens.placeholder'), onChange: actions.onChangerTexte },
      etiquettes: page?.etiquettes?.length ? [...page.etiquettes] : null,
      suggestion: resume ? { texte: traduire(l, 'suggestion.vendredi', { heure: e.heureDuBilan ?? '16:00' }), oui: traduire(l, 'suggestion.oui'), non: traduire(l, 'suggestion.non'), onOui: actions.onResumer, onNon: actions.onNonResumer } : null,
      pied: { enregistre: e.enregistreA ? traduire(l, 'page.enregistre', { heure: heure(e.enregistreA) }) : null, raccourci: peutPasserADemain(e.jour, aujourdhui) ? traduire(l, 'page.suivant') : '' },
    },
  };
}
