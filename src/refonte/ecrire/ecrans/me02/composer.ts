import { compterMots, type Langue } from '../../commun';
import { anneauDeMots, luEnSecondes, type Longueur } from '../../redaction';
import { traduire } from './i18n';
import type { BrouillonOnglet, NoteVue, SegmentDeTexte, VueRedactionProps } from './VueRedaction';

/**
 * ME02 — COMPOSER LA VUE de Rédaction et traduction : les onglets, la lettre (les corrections se lisent barrées et
 * soulignées, jamais réécrites en silence), l'anneau de mots, les notes de marge. Logique pure : les règles viennent de
 * `../../redaction.ts`. Un engagement ajouté (geste, date, prix) passe en attention et attend la décision de la personne.
 */

export interface MorceauDuTexte {
  type: 'texte' | 'correction';
  texte?: string;
  retire?: string;
  ajoute?: string;
  raison?: 'plus court' | 'plus poli' | 'plus clair';
  explication?: string;
  valeur?: string;
  decision?: 'acceptee' | 'refusee';
  /** Cette correction ajoute un engagement (la liste fermée de la rédaction) : seule la page la reconnaît. */
  engagement?: boolean;
}
export interface BrouillonDuTexte {
  id: string;
  titre: string;
  source?: { surtitre: string; texte: string } | null;
  morceaux: readonly MorceauDuTexte[];
  publie: boolean;
}

export interface EntreesRedaction {
  langue: Langue;
  brouillons: readonly BrouillonDuTexte[];
  choisi: string | null;
  longueur: Longueur;
  enregistreA: string | null;
}

const RAISONS = { 'plus court': 'note.plusCourt', 'plus poli': 'note.plusPoli', 'plus clair': 'note.plusClair' } as const;

/** Le texte tel qu'il sera : le texte de la personne, les corrections gardées appliquées (barré = retiré). */
export function texteFinal(morceaux: readonly MorceauDuTexte[]): string {
  return morceaux.map((m) => (m.type === 'texte' ? (m.texte ?? '') : m.decision === 'refusee' ? (m.retire ?? '') : (m.ajoute ?? ''))).join('');
}

export function paragraphesDe(morceaux: readonly MorceauDuTexte[]): SegmentDeTexte[][] {
  const paragraphes: SegmentDeTexte[][] = [[]];
  const pousser = (texte: string, genre: SegmentDeTexte['genre']) => {
    texte.split('\n\n').forEach((bout, i) => {
      if (i > 0) paragraphes.push([]);
      if (bout) paragraphes[paragraphes.length - 1].push({ texte: bout, genre });
    });
  };
  for (const m of morceaux) {
    if (m.type === 'texte') pousser(m.texte ?? '', 'plain');
    else if (m.decision === 'refusee') pousser(m.retire ?? '', 'plain');
    else {
      if (m.retire) pousser(m.retire, 'retire');
      if (m.ajoute) pousser(m.ajoute, 'ajoute');
    }
  }
  return paragraphes.filter((p) => p.length > 0);
}

export function composerRedaction(
  e: EntreesRedaction,
  actions: { onChoisir: (id: string) => void; onDecider: (indice: number, decision: 'acceptee' | 'refusee') => void },
): Pick<VueRedactionProps, 'onglets' | 'lettre' | 'marge' | 'enregistre'> & { courant: BrouillonDuTexte | null } {
  const l = e.langue;
  const courant = e.brouillons.find((b) => b.id === e.choisi) ?? e.brouillons[0] ?? null;
  const onglets: BrouillonOnglet[] = e.brouillons.map((b) => ({ id: b.id, titre: b.titre, actif: b.id === courant?.id, nonEnvoye: !b.publie }));
  if (!courant) return { onglets, lettre: null, marge: { anneau: null, notes: [], traduction: null }, enregistre: null, courant };

  const mots = compterMots(texteFinal(courant.morceaux));
  const a = anneauDeMots(mots, e.longueur);
  const notes: NoteVue[] = [];
  courant.morceaux.forEach((m, i) => {
    if (m.type !== 'correction') return;
    const decide = m.decision !== undefined;
    notes.push({
      id: `${courant.id}-${i}`,
      titre: m.engagement ? traduire(l, 'note.engagement') : traduire(l, RAISONS[m.raison ?? 'plus clair']),
      detail: m.explication ?? '',
      mention: m.valeur ?? (decide ? traduire(l, m.decision === 'acceptee' ? 'note.gardee' : 'note.refusee') : null),
      attention: !!m.engagement && !decide,
      actions: decide
        ? []
        : [
            { libelle: traduire(l, 'note.appliquer'), onClick: () => actions.onDecider(i, 'acceptee'), principale: true },
            { libelle: traduire(l, 'note.ignorer'), onClick: () => actions.onDecider(i, 'refusee') },
          ],
    });
  });
  return {
    courant,
    onglets,
    enregistre: e.enregistreA ? `${traduire(l, 'enregistre')} · ${e.enregistreA}` : null,
    lettre: {
      entetes: [
        ...(courant.source ? [{ libelle: traduire(l, 'reponse'), valeur: courant.source.surtitre }] : []),
        { libelle: traduire(l, 'objet'), valeur: courant.titre },
      ],
      paragraphes: paragraphesDe(courant.morceaux),
      pied: traduire(l, 'pied'),
    },
    marge: {
      anneau: mots > 0 ? { mots, titre: traduire(l, 'mots.titre', { mots, objectif: a.objectif }), detail: traduire(l, a.depasse ? 'mots.depasse' : 'mots.detail', { s: luEnSecondes(mots) }), pourcent: a.pourcent, depasse: a.depasse } : null,
      notes,
      traduction: null,
    },
  };
}
