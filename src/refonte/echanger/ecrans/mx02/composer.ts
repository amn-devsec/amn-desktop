import { jourDe, jourSemaineIso, ms, partiesParis, type Instant, type Langue } from '../../commun';
import { depuisMinutes, enCours as estEnCours, ordreDuJourMinute, preparation, prochaine, suggestionDeDuree, type ReunionMin } from '../../reunions';
import { traduire } from './i18n';
import type { ActionsVue, EnCoursVue, LigneAVenirVue, NotesVue, ProchaineVue, VueReunionsProps } from './VueReunions';

/**
 * MX02 — COMPOSER LA VUE des réunions : la tuile « EN COURS » (vignettes, ordre du jour minuté), la suggestion de durée, la
 * prochaine réunion (compte à rebours sous une heure, ordre du jour, cases « Avant 11:00 ») et « À venir » avec la
 * préparation. Logique pure : les règles viennent de `../../reunions.ts`. Pas de mesure du temps de parole, pas de
 * classement de préparation, pas de minuteur rouge.
 */

export interface ReunionAffichable extends ReunionMin {
  /** « salle clients et visio ». */
  lieu?: string;
  inscrits?: number;
  documentNom?: string | null;
  /** Les participants tels que le poste les garde : une phrase libre, pas des adresses. */
  participantsTexte?: string;
}
export interface EntreesReunions {
  langue: Langue;
  maintenant: Instant;
  moi: string;
  nom: (email: string) => string;
  reunions: readonly ReunionAffichable[];
  /** La salle de la réunion en cours : qui est connecté, micro, parole (aucun son n'est gardé). */
  enSalle: { vignettes: readonly { email: string; micro: boolean; parle: boolean }[] } | null;
  notes: NotesVue | null;
  actions: ActionsVue | null;
  /** Les durées réelles des dernières occurrences de la réunion en cours (minutes), pour la suggestion « Raccourcir ». */
  dureesReelles?: readonly number[];
  suggestionMasquee?: boolean;
  onBasculerCase?: (reunionId: string, index: number) => void;
}

const JOURS_COURTS: Record<Langue, readonly string[]> = {
  fr: ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const hhmm = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};

export function composerReunions(e: EntreesReunions): Pick<VueReunionsProps, 'sousTitre' | 'enCours' | 'notes' | 'actions' | 'suggestion' | 'prochaine' | 'avenir'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const duree = (min: number) => (min >= 60 && min % 60 === 0 ? t('duree.h', { h: min / 60 }) : min > 60 ? t('duree.hmin', { h: Math.floor(min / 60), min: min % 60 }) : t('duree.min', { n: min }));

  const courantes = e.reunions.filter((r) => estEnCours(r, e.maintenant));
  const courante = courantes[0] ?? null;
  let enCours: EnCoursVue | null = null;
  let suggestion: VueReunionsProps['suggestion'] = null;
  if (courante) {
    const ordre = ordreDuJourMinute(courante, e.maintenant);
    enCours = {
      titre: courante.titre,
      detail: t('depuis', { min: depuisMinutes(courante, e.maintenant) ?? 0, prevu: courante.dureePrevueMin }),
      vignettes: (e.enSalle?.vignettes ?? []).map((v) => ({ nom: e.nom(v.email), micro: v.micro, parle: v.parle })),
      vous: !(e.enSalle?.vignettes ?? []).some((v) => v.email === e.moi),
      ordre: ordre.map((s) => ({ libelle: s.titre, minutes: Math.max(1, s.minutes), etat: s.etat, remplissage: s.remplissage })),
    };
    const moyenne = suggestionDeDuree(courante.dureePrevueMin, e.dureesReelles ?? []);
    if (moyenne !== null && !e.suggestionMasquee) {
      suggestion = { texte: t('suggestion.texte', { min: moyenne, propose: Math.ceil(moyenne / 5) * 5 }), oui: t('suggestion.raccourcirLibelle'), non: t('suggestion.garder') };
    }
  }

  const proch = prochaine(e.reunions, e.moi, e.maintenant);
  let prochaineVue: ProchaineVue | null = null;
  if (proch) {
    const r = proch.reunion as ReunionAffichable;
    const cases = r.casesDePreparation ?? [];
    prochaineVue = {
      titre: r.titre,
      sous: [hhmm(r.debutPrevuAt), duree(r.dureePrevueMin), r.lieu].filter(Boolean).join(' · '),
      compte: proch.compteARebours ? { valeur: t('prochaine.dans', { n: proch.dansMin }), sous: t('prochaine.avant') } : null,
      participants: r.participantsTexte !== undefined ? { noms: r.participantsTexte.split(/[,;]| et /).map((x) => x.trim()).filter(Boolean), texte: r.participantsTexte } : { noms: r.participants.map(e.nom), texte: r.participants.map(e.nom).join(l === 'fr' ? ' et ' : ' and ') },
      document: r.documentNom ?? null,
      ordre: r.ordreDuJour.map((s) => ({ minutes: s.minutes > 0 ? t('ordre.min', { n: s.minutes }) : null, titre: s.titre, fait: !!s.prepare, largeur: Math.max(1, s.minutes) })),
      avant: cases.length
        ? { titre: t('avant', { heure: hhmm(r.debutPrevuAt) }), compte: t('avant.fait', { x: cases.filter((c) => c.fait).length, y: cases.length }), cases: cases.map((c, i) => ({ libelle: c.libelle, fait: c.fait, onBasculer: e.onBasculerCase ? () => e.onBasculerCase?.(r.id, i) : undefined })) }
        : null,
    };
  }

  const avenir: LigneAVenirVue[] = e.reunions
    .filter((r) => !r.debutReelAt && ms(r.debutPrevuAt) > ms(e.maintenant) && r.id !== proch?.reunion.id)
    .sort((a, b) => ms(a.debutPrevuAt) - ms(b.debutPrevuAt) || a.id.localeCompare(b.id))
    .slice(0, 4)
    .map((r) => {
      const j = jourDe(r.debutPrevuAt);
      const total = r.ordreDuJour.length + (r.documents?.attendus ?? 0) + (r.casesDePreparation?.length ?? 0);
      const ra = r as ReunionAffichable;
      return {
        id: r.id,
        jour: `${JOURS_COURTS[l][jourSemaineIso(j) - 1]} ${Number(j.slice(8, 10))}`,
        heure: hhmm(r.debutPrevuAt),
        titre: r.titre,
        sous: [duree(r.dureePrevueMin), ra.inscrits ? t('avenir.inscrits', { n: ra.inscrits }) : ra.lieu].filter(Boolean).join(' · '),
        preparation: total > 0 ? preparation(r) : null,
      };
    });

  const n = courantes.length;
  return {
    sousTitre: `${t('sousTitre')}${n ? t(n <= 1 ? 'sousTitre.enCours.1' : 'sousTitre.enCours.n', { n }) : ''}`,
    enCours,
    notes: e.notes,
    actions: e.actions,
    suggestion,
    prochaine: prochaineVue,
    avenir,
  };
}
