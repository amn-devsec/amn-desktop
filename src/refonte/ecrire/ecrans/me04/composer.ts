import { dateFr, jourDe, type Instant, type Jour, type Langue } from '../../commun';
import { compteursParType, espaceDesArchives, grouperParMois, indexDuTemps, JOURS_DES_ORIGINAUX, moisEnCours as moisCourant, QUOTA_ARCHIVES_OCTETS, rechercher, resumeParAnnee, restauresRecemment, suggestionDeCompression, type ElementArchive, type RegleDArchivage, type TypeArchive } from '../../archives';
import { traduire } from './i18n';
import type { AnneeVue, LigneArchive, MoisVue, VueArchivesProps } from './VueArchives';

/**
 * ME04 — COMPOSER LA VUE des Archives : « Par le temps » (années repliées et mois du plus chargé au moins chargé), la
 * recherche et ses résultats rangés par mois, l'espace, les règles, les restaurations, la suggestion de compression.
 * Logique pure : les règles viennent de `../../archives.ts`. Rien n'est supprimé d'ici : la suppression définitive est « Jamais ».
 */

export interface EntreesArchives {
  langue: Langue;
  maintenant: Instant;
  elements: readonly ElementArchive[];
  saisie: string;
  dansLeContenu: boolean;
  type: TypeArchive | 'Tout';
  /** L'année ouverte dans « Par le temps ». */
  annee: number;
  visibles: number;
  regles: readonly RegleDArchivage[] | null;
  restaurations: readonly { id: string; at: Instant; nom: string; detail: string }[];
  quotaOctets: number | null;
  octetsLisibles: (n: number) => string;
  /** Une donnée de poste : restaurer l'élément (absent : pas de bouton). */
  onRestaurer?: (id: string) => void;
}

const MOIS_NOMS: Record<Langue, string[]> = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const TONS: Record<TypeArchive, LigneArchive['ton']> = { Document: 'neutre', Facture: 'succes', Message: 'info', Devis: 'attention', Photo: 'neutre', Vidéo: 'neutre', Autre: 'neutre' };

export function composerArchives(e: EntreesArchives, actions: { onType: (t: string) => void; onSuite: () => void; onAnnee: (a: number) => void }): Pick<VueArchivesProps, 'sousTitre' | 'temps' | 'recherche' | 'quota' | 'regles' | 'restaures' | 'suggestion'> {
  const l = e.langue;
  const total = e.elements.length;
  const mots = e.saisie.trim();
  const trouves = rechercher(e.elements, e.saisie, { dansLeContenu: e.dansLeContenu });
  const filtres = mots ? rechercher(e.elements, e.saisie, { dansLeContenu: e.dansLeContenu, type: e.type }) : [];
  const parType = compteursParType(trouves);
  const g = grouperParMois(filtres, e.visibles);
  const courant = moisCourant(e.maintenant);

  const annees = resumeParAnnee(e.elements, trouves.map((r) => r.element));
  const temps: AnneeVue[] = annees.map((a) => {
    const ouverte = a.annee === e.annee;
    const idx = indexDuTemps(e.elements, a.annee, trouves.map((r) => r.element));
    const max = Math.max(1, ...idx.mois.map((m) => m.elements));
    const maxCorr = Math.max(1, ...idx.mois.map((m) => m.correspondances));
    const mois: MoisVue[] = idx.mois
      .filter((m) => m.elements > 0)
      .sort((x, y) => y.mois.localeCompare(x.mois))
      .map((m) => ({ cle: m.mois, libelle: MOIS_NOMS[l][Number(m.mois.slice(5)) - 1], valeur: m.elements, densite: m.elements / max, correspondances: m.correspondances / maxCorr, actif: m.mois === courant }));
    return { annee: a.annee, ouverte, total: String(a.elements), trouves: mots && a.trouves > 0 ? traduire(l, 'temps.trouves', { n: a.trouves }) : null, mois: ouverte ? mois : [], courbe: a.courbe };
  });

  const lignes = (r: (typeof filtres)[number]): LigneArchive => ({
    id: r.element.id,
    titre: r.element.titre,
    type: r.element.type,
    ton: TONS[r.element.type],
    genre: r.element.type,
    extrait: r.extrait ?? '',
    taille: e.octetsLisibles(r.element.tailleOctets),
    quand: dateFr(r.element.archiveLe, l),
    onRestaurer: e.onRestaurer ? () => e.onRestaurer?.(r.element.id) : undefined,
  });

  const espace = espaceDesArchives(e.elements, e.quotaOctets ?? QUOTA_ARCHIVES_OCTETS);
  const restes = restauresRecemment(e.restaurations, e.maintenant);
  const idRestaures = new Map(e.restaurations.map((r) => [r.id, r]));
  const compression = suggestionDeCompression(e.elements);
  const nomsRegles: Record<RegleDArchivage['type'], 'regle.factures' | 'regle.messages' | 'regle.devis'> = { 'facture-payee': 'regle.factures', 'conversation-silencieuse': 'regle.messages', 'devis-refuse': 'regle.devis' };

  return {
    sousTitre: total ? traduire(l, 'sousTitre', { n: total }) : traduire(l, 'sousTitreVide'),
    temps: total ? { total: traduire(l, total <= 1 ? 'temps.total.1' : 'temps.total.n', { n: total }), annees: temps, legende: [traduire(l, 'legende.mois'), traduire(l, 'legende.contient', { mot: mots || '—' }), traduire(l, 'legende.visibles')], onAnnee: actions.onAnnee } : null,
    recherche: {
      valeur: e.saisie,
      onChange: () => undefined,
      contenu: e.dansLeContenu,
      onContenu: () => undefined,
      types: [{ cle: 'Tout', libelle: `${traduire(l, 'tout')} · ${parType.Tout ?? 0}`, actif: e.type === 'Tout' }, ...(['Document', 'Facture', 'Message', 'Devis'] as const).filter((t) => (parType[t] ?? 0) > 0 || e.type === t).map((t) => ({ cle: t, libelle: `${t} · ${parType[t] ?? 0}`, actif: e.type === t }))],
      onType: actions.onType,
      resume: !mots ? traduire(l, 'resume.invite') : filtres.length ? traduire(l, 'resume', { n: filtres.length, mot: mots }) : traduire(l, 'resume.aucun', { mot: mots }),
      groupes: g.groupes.map((gr) => ({ mois: `${MOIS_NOMS[l][Number(gr.mois.slice(5)) - 1]} ${gr.mois.slice(0, 4)}`.toUpperCase(), compteur: `· ${gr.resultats.length}`, lignes: gr.resultats.map(lignes) })),
      suite: g.reste > 0 ? { libelle: `${g.reste} · ${traduire(l, 'suite')}`, onClick: actions.onSuite } : null,
    },
    quota: total && e.quotaOctets ? { pourcent: espace.pourcent, libelle: traduire(l, 'quota.libelle', { u: e.octetsLisibles(espace.utilise), q: e.octetsLisibles(e.quotaOctets) }), detail: traduire(l, espace.proche ? 'quota.proche' : 'quota.reste', { r: e.octetsLisibles(espace.reste) }), ton: espace.proche ? 'attention' : 'neutre' } : null,
    regles: e.regles ? { titre: traduire(l, 'regles.titre'), items: [...e.regles.map((r) => ({ libelle: traduire(l, nomsRegles[r.type]), valeur: traduire(l, 'regle.apres', { n: r.apresMois }) })), { libelle: traduire(l, 'regle.suppression'), valeur: traduire(l, 'regle.jamais') }] } : null,
    restaures: restes.total ? { titre: traduire(l, 'restaures.titre'), sous: traduire(l, 'restaures.sous', { n: restes.total }), items: restes.affiches.map((r) => ({ id: r.id, nom: idRestaures.get(r.id)?.nom ?? '', detail: idRestaures.get(r.id)?.detail ?? '', quand: dateFr(jourDe(r.at) as Jour, l) })) } : null,
    suggestion: compression ? { titre: traduire(l, 'suggestion.titre'), texte: traduire(l, 'suggestion.texte', { type: compression.type === 'Photo' ? (l === 'fr' ? 'photos' : 'photos') : l === 'fr' ? 'vidéos' : 'videos', taille: e.octetsLisibles(compression.octets), jours: JOURS_DES_ORIGINAUX }), oui: traduire(l, 'suggestion.oui'), non: traduire(l, 'suggestion.non'), onOui: () => undefined, onNon: () => undefined } : null,
  };
}
