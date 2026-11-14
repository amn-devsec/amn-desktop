import { jourDe, nomDuJour, type Instant, type Langue } from '../../commun';
import { descendants, liensRetour, planDePage, type PageMin } from '../../pages';
import { jourDuPalier, semaineEnDisques, serieDEcriture, type MotsParJour } from '../../serie';
import { dire, direCompte } from '../../i18n';
import { phraseDeSerie } from '../../phrases';
import type { DisqueVue, ElementArbre, LienRetourVue, PlanItem, SectionArbre, VueNotesProps } from './VueNotes';

/**
 * H10 — COMPOSER LA VUE de Notes et pages : l'arbre (favoris, clients, équipe, modèles, personnel), le plan de la page,
 * les liens retour et la série. Logique pure : les règles viennent de `../../pages.ts` et `../../serie.ts`.
 */

export interface EntreesNotes {
  langue: Langue;
  maintenant: Instant;
  moi: { email: string; prenom: string };
  pages: readonly PageMin[];
  pageId: string | null;
  recherche: string;
  mots: MotsParJour;
  /** Le nom du client d'une page de l'espace Clients : jamais deviné. */
  clientDe: (p: PageMin) => string | null;
  vers: (p: PageMin) => string | undefined;
  onOuvrir: (p: PageMin) => void;
  /** Mots du texte que Mohamed écrit en ce moment : absents tant qu'aucune présence n'existe. */
  ecritDans: string | null;
}

const NOMS: Record<'fr' | 'en', Record<string, string>> = {
  fr: { Clients: 'Clients', 'Équipe': 'Équipe', 'Modèles': 'Modèles', Personnel: 'Personnel', favoris: 'Favoris' },
  en: { Clients: 'Clients', 'Équipe': 'Team', 'Modèles': 'Templates', Personnel: 'Personal', favoris: 'Favorites' },
};

export function composerArbre(e: EntreesNotes): { sections: SectionArbre[] } {
  const vivantes = e.pages.filter((p) => !p.supprimeeLe);
  const filtrees = e.recherche.trim() ? vivantes.filter((p) => p.title.toLowerCase().includes(e.recherche.trim().toLowerCase())) : vivantes;
  const actif = e.pageId;
  const element = (p: PageMin, niveau: 0 | 1): ElementArbre => {
    const enfants = descendants(vivantes, p.id);
    return { id: p.id, titre: p.title || '—', niveau, compte: enfants.length || undefined, actif: p.id === actif, dossier: enfants.length > 0, vers: e.vers(p), onClick: () => e.onOuvrir(p) };
  };
  const ancetre = (p: PageMin | undefined): PageMin | undefined => (p?.parentId ? vivantes.find((x) => x.id === p.parentId) : undefined);
  const racines = (esp: PageMin['espace']) => filtrees.filter((p) => p.espace === esp && p.parentId === null);
  const sections: SectionArbre[] = [];
  const favoris = filtrees.filter((p) => p.favorisDe.includes(e.moi.email));
  if (favoris.length) sections.push({ titre: NOMS[e.langue].favoris, elements: favoris.map((p) => element(p, 0)) });
  for (const esp of ['Clients', 'Équipe', 'Modèles', 'Personnel'] as const) {
    const liste = racines(esp);
    if (!liste.length) continue;
    const elements: ElementArbre[] = [];
    for (const p of liste) {
      elements.push(element(p, 0));
      const page = vivantes.find((x) => x.id === actif);
      const ouvert = actif && (p.id === actif || ancetre(page)?.id === p.id || ancetre(ancetre(page))?.id === p.id);
      if (ouvert) for (const f of filtrees.filter((x) => x.parentId === p.id)) elements.push(element(f, 1));
    }
    sections.push({ titre: NOMS[e.langue][esp], elements });
  }
  return { sections };
}

export function composerNotes(e: EntreesNotes, tm: (cle: string, p?: Record<string, string | number>) => string): Omit<VueNotesProps, 'libelles' | 'onNouvellePage' | 'page'> & { pageMeta: { chemin: string[]; titre: string } | null; planBlocs: number } {
  const aujourdhui = jourDe(e.maintenant);
  const serie = serieDEcriture(e.mots, aujourdhui);
  const disques: DisqueVue[] = semaineEnDisques(e.mots, aujourdhui).map((d, i) => ({ lettre: (e.langue === 'fr' ? 'LMMJVSD' : 'MTWTFSS')[i], etat: d.etat }));
  const page = e.pages.find((p) => p.id === e.pageId && !p.supprimeeLe) ?? null;
  const plan = page ? planDePage(page.blocs) : { titres: [], nombre: 0 };
  const liens = page ? liensRetour(page.id, e.pages) : { visibles: [], total: 0 };
  const lienVues: LienRetourVue[] = liens.visibles.map((l) => {
    const i = l.extrait.toLowerCase().indexOf((page?.title ?? '').toLowerCase());
    const mot = i >= 0 && page ? l.extrait.slice(i, i + page.title.length) : '';
    return { id: l.pageId, titre: l.titre, avant: i >= 0 ? l.extrait.slice(0, i) : l.extrait, mot, apres: i >= 0 && page ? l.extrait.slice(i + page.title.length) : '' };
  });
  const chemin = page ? [NOMS[e.langue][page.espace], ...(page.parentId ? [e.pages.find((x) => x.id === page.parentId)?.title ?? ''] : [])].filter(Boolean) : [];
  const total = (n: number) => direCompte(e.langue, 'plan.blocs', n);
  return {
    titre: tm('titre'),
    sousTitre: e.moi.prenom ? tm('sousTitre', { prenom: e.moi.prenom }) : tm('sousTitreSans'),
    arbre: { recherche: e.recherche, onRecherche: () => undefined, sections: composerArbre(e).sections, serie: serie.serie > 0 || e.mots.size > 0 ? { valeur: dire(e.langue, 'serie.jours.court', { n: serie.serie }), disques, phrase: phrasePageDuJour(serie, aujourdhui, e.langue) } : null },
    droite: {
      plan: { total: total(plan.nombre), items: plan.titres.map<PlanItem>((t, i) => ({ texte: t, niveau: 0, actif: i === 0 })), ecrit: e.ecritDans },
      commentaire: null,
      suggestion: null,
      liens: { total: direCompte(e.langue, 'liens.pages', liens.total), items: lienVues },
    },
    pageMeta: page ? { chemin, titre: page.title } : null,
    planBlocs: plan.nombre,
  };
}


/** « Page du jour écrite, palier de 14 jours dimanche. » ; sinon la phrase de la série (F20). */
function phrasePageDuJour(serie: ReturnType<typeof serieDEcriture>, aujourdhui: string, langue: Langue): string {
  const jour = jourDuPalier(serie, aujourdhui);
  if (!serie.ecritAujourdhui || jour === null || serie.prochainPalier === null) return phraseDeSerie(serie, langue);
  return dire(langue, 'serie.pageDuJour', { palier: serie.prochainPalier, jour: nomDuJour(jour, langue) });
}
