import { jourDe, jourSemaineIso, ms, partiesParis, type Instant, type Langue } from '../../commun';
import { autresSondages, avatarsSurLesBarres, compterLesVoix, editeurComplet, estCloture, noteMoyenne, participation, resultats, votesEnDirect, type SondageMin } from '../../sondages';
import { traduire } from './i18n';
import type { AutreSondageVue, BarreVue, EditeurVue, ResultatVue, VoteEnDirectVue, VueSondagesProps } from './VueSondages';

/**
 * MX05 — COMPOSER LA VUE des sondages : le résultat du sondage choisi (pourcentages, voix, en tête, avatars des votants si les
 * réponses sont visibles), la participation sans nom, « Votes en direct » (masqués si anonyme), « Autres sondages » et
 * l'éditeur. Logique pure : les règles viennent de `../../sondages.ts`. Un sondage anonyme n'affiche jamais qui a voté quoi.
 */

export interface SondageAffichable extends SondageMin {
  /** Ce que le sondage montre de plus : l'audience (« équipe et 5 clients »). */
  audience?: string;
  /** Le poste ne garde pas l'heure des votes : `false` masque « Votes en direct » (jamais d'heure inventée). */
  heuresConnues?: boolean;
}

export interface EntreesSondages {
  langue: Langue;
  maintenant: Instant;
  moi: string;
  /** Le nom lisible d'une personne par son adresse. */
  nom: (email: string) => string;
  sondages: readonly SondageAffichable[];
  choisiId: string | null;
  editeur: { question: string; options: readonly string[]; anonyme: boolean; ajmani: string | null; extras: EditeurVue['extras'] } | null;
  actions?: { onVoter?: (sondageId: string, optionId: string) => void };
}

const JOURS_LONGS: Record<Langue, readonly string[]> = {
  fr: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};
const hhmm = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};
/** « lundi à 18:00 » (en anglais « Monday at 18:00 ») ; le jour seul avec `sansHeure`. */
function quand(at: Instant, l: Langue, sansHeure = false): string {
  const jour = JOURS_LONGS[l][jourSemaineIso(jourDe(at)) - 1];
  return sansHeure ? jour : `${jour} ${l === 'fr' ? 'à' : 'at'} ${hhmm(at)}`;
}

export function composerSondages(e: EntreesSondages): Pick<VueSondagesProps, 'sousTitre' | 'puces' | 'resultat' | 'direct' | 'autres' | 'editeur'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const ouverts = e.sondages.filter((s) => s.etat === 'en-cours' && !estCloture(s, e.maintenant));
  const choisi = e.sondages.find((s) => s.id === e.choisiId) ?? ouverts[0] ?? e.sondages.find((s) => s.etat !== 'brouillon') ?? null;
  const voix = (n: number) => t(n === 0 ? 'voix.0' : n === 1 ? 'voix.1' : 'voix.n', { n });

  let resultat: ResultatVue | null = null;
  let direct: VueSondagesProps['direct'] = null;
  if (choisi) {
    const options = compterLesVoix(choisi.options, choisi.votes);
    const barres = resultats(options);
    const clos = estCloture(choisi, e.maintenant);
    const votantsDe = (optionId: string) => choisi.votes.filter((v) => v.optionId === optionId).map((v) => e.nom(v.email).slice(0, 1).toUpperCase());
    const monVote = choisi.votes.find((v) => v.email === e.moi);
    const peutVoter = !clos && !monVote && !!e.actions?.onVoter;
    const pj = participation(choisi);
    const barresVue: BarreVue[] = barres.map((b) => ({
      id: b.id,
      libelle: b.libelle,
      pourcent: b.pourcent,
      voix: voix(b.votes),
      enTete: b.enTete,
      egalite: b.aEgalite,
      avatars: avatarsSurLesBarres(choisi, votantsDe(b.id)),
      choisie: monVote?.optionId === b.id,
      onVoter: peutVoter ? () => e.actions?.onVoter?.(choisi.id, b.id) : undefined,
    }));
    const detail = [choisi.clotureAt && !clos ? t('detail.fin', { quand: quand(choisi.clotureAt, l) }) : '', t(choisi.anonyme ? 'detail.anonymes' : 'detail.visibles'), choisi.audience ?? ''].filter(Boolean).join(' · ');
    resultat = {
      id: choisi.id,
      question: choisi.question,
      etat: { genre: clos ? 'termine' : 'en-cours', libelle: t(clos ? 'etat.termine' : 'etat.enCours'), detail: detail ? `· ${detail}` : '' },
      barres: barresVue,
      participation: { cases: pj.cases, texte: t('participation.sur', { x: pj.votants, y: pj.destinataires }), attendus: pj.attendus > 0 && !clos ? t(pj.attendus <= 1 ? 'attendus.1' : 'attendus.n', { n: pj.attendus }) : null },
      tonVote: monVote ? t('dejaVote', { option: choisi.options.find((o) => o.id === monVote.optionId)?.libelle ?? '' }) : null,
      peutClore: !clos && choisi.etat === 'en-cours',
    };
    if (choisi.heuresConnues !== false) {
      const lib = new Map(choisi.options.map((o) => [o.id, o.libelle] as const));
      const lignes = votesEnDirect(choisi, e.maintenant);
      const plusRecent = lignes[0]?.at ?? 0;
      direct = {
        lignes: lignes.map((v, i): VoteEnDirectVue =>
          v.genre === 'anonyme'
            ? { id: `${choisi.id}:${i}`, heure: hhmm(v.at), nom: null, avatar: '', texte: t('direct.anonyme'), option: null, nouveau: i === 0 && ms(e.maintenant) - plusRecent <= 15 * 60_000 }
            : { id: `${choisi.id}:${v.email}`, heure: hhmm(v.at), nom: v.email === e.moi ? t('direct.toi', { nom: e.nom(v.email) }) : e.nom(v.email), avatar: e.nom(v.email).slice(0, 1).toUpperCase(), texte: '', option: lib.get(v.optionId) ?? null, nouveau: i === 0 && ms(e.maintenant) - v.at <= 15 * 60_000 },
        ),
      };
    }
  }

  const autres: AutreSondageVue[] = autresSondages(e.sondages, choisi?.id ?? '').map((s) => {
    const clos = estCloture(s, e.maintenant);
    const options = compterLesVoix(s.options, s.votes);
    const tete = resultats(options).find((b) => b.enTete);
    const note = s.type === 'note' ? noteMoyenne(options) : null;
    const pj = participation(s);
    return {
      id: s.id,
      icone: s.type === 'note' ? 'note' : s.type === 'plusieurs' ? 'plusieurs' : clos ? 'agenda' : 'equipe',
      titre: s.question,
      sous: clos ? t('autre.termine', { x: pj.votants, y: pj.destinataires }) : t('autre.reponses', { n: pj.votants, quand: s.clotureAt ? quand(s.clotureAt, l, true) : '…' }),
      resultat: note !== null ? t('autre.note', { note: String(note).replace('.', l === 'fr' ? ',' : '.') }) : (tete?.libelle ?? ''),
    };
  });

  const editeur: EditeurVue | null = e.editeur
    ? {
        ajmani: e.editeur.ajmani ? t('editeur.ajmani', { raison: e.editeur.ajmani }) : null,
        question: e.editeur.question,
        options: [...e.editeur.options],
        anonyme: e.editeur.anonyme,
        extras: e.editeur.extras,
        complet: editeurComplet(e.editeur.question, e.editeur.options).complet,
        note: t(e.editeur.extras?.ouvertClients.actif ? 'editeur.note' : 'editeur.noteEquipe'),
      }
    : null;

  return {
    sousTitre: ouverts.length ? t('sousTitre', { n: ouverts.length }) : t('sousTitre.aucun'),
    puces: ouverts.slice(0, 4).map((s) => ({ id: s.id, libelle: s.question, actif: s.id === choisi?.id })),
    resultat,
    direct,
    autres: autres.slice(0, 4),
    editeur,
  };
}
