import { ecartJours, jourDe, jourSemaineIso, partiesParis, type Instant, type Langue } from '../../commun';
import { HORAIRES_PAR_DEFAUT, type Horaires } from '../../boite';
import { GARDE_FOU_HEURES, compteurs, manqueDansLaRegle, peutActiver, prochaineOuverture, type RegleAuto } from '../../reponsesAuto';
import { traduire } from './i18n';
import type { BlocVue, MorceauDePhrase, RegleVue, SegmentDeMessage, VueReponsesProps } from './VueReponses';

/**
 * MX06 — COMPOSER LA VUE des réponses automatiques : la liste des règles (compteur du mois, interrupteur, règle proposée née
 * désactivée), l'éditeur en phrases (QUAND, ET SI, ALORS, ET AUSSI, SAUF SI), l'aperçu de ce que reçoit la personne et la
 * suggestion « Une règle manque ». Logique pure : les règles viennent de `../../reponsesAuto.ts`. Une variable sans valeur ne
 * bloque jamais l'envoi : la phrase est réécrite sans elle ; une règle incomplète ne s'active pas.
 */

export interface RegleAffichable extends RegleAuto {
  /** Le déclencheur en mots, quand il faut autre chose que le texte standard. */
  declencheurTexte?: string;
  /** « un client ou un prospect ». */
  cible?: string;
  /** Le titre du modèle de réponse (« Bien reçu, à très vite »). */
  modeleTitre?: string;
  signature?: string;
  tache?: { personne: string; quand: string } | null;
  /** « hier », « ce matin » : quand la règle a été testée. */
  testeeQuand?: string | null;
  etiquette?: { texte: string; ton: 'critique' | 'attention' } | null;
  enregistreAt?: Instant | null;
  /** L'objet du message reçu par le client. */
  objet?: string;
}
export interface EntreesReponses {
  langue: Langue;
  maintenant: Instant;
  regles: readonly RegleAffichable[];
  proposee: { nom: string } | null;
  choisieId: string | null;
  enLigne: boolean;
  horaires?: Horaires;
  apercu: { de: string; prenom: string | null; destinataireNom: string; delaiSecondes: number; cible: 'client' | 'prospect' };
  manque: { question: string; n: number } | null;
  avis?: readonly number[];
}

const JOURS_LONGS: Record<Langue, readonly string[]> = { fr: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] };
const hhmm = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};
const heureCourte = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Un modèle découpé en texte et en variables ({prénom}, {réouverture}) ; une variable sans valeur est réécrite sans elle. */
export function segmentsDuModele(modele: string, valeurs: { prenom?: string | null; reouverture?: string | null }): SegmentDeMessage[] {
  const out: SegmentDeMessage[] = [];
  for (const part of modele.split(/(\{prénom\}|\{réouverture\})/)) {
    if (part === '{prénom}') {
      if (valeurs.prenom) out.push({ v: true, texte: valeurs.prenom });
      else if (out.length) out[out.length - 1] = { ...out[out.length - 1], texte: out[out.length - 1].texte.replace(/\s+$/, '') };
    } else if (part === '{réouverture}') {
      if (valeurs.reouverture) out.push({ v: true, texte: valeurs.reouverture });
    } else if (part) out.push({ v: false, texte: part });
  }
  return out;
}

export function composerReponses(e: EntreesReponses): Pick<VueReponsesProps, 'sousTitre' | 'regles' | 'editeur' | 'apercu' | 'suggestion'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const horaires = e.horaires ?? HORAIRES_PAR_DEFAUT;
  const c = compteurs(e.regles, e.avis ?? []);
  const total = c.total + (e.proposee ? 1 : 0);
  const declencheur = (r: RegleAffichable): string => {
    if (r.declencheurTexte) return r.declencheurTexte;
    const d = r.declencheur;
    if (!d) return t('phrase.aChoisir');
    return d.type === 'horaires' ? t('declencheur.horaires') : d.type === 'mots' ? t('declencheur.mots', { mots: d.mots.join(', ') }) : d.type === 'rendez-vous-manque' ? t('declencheur.rendezVous') : t('declencheur.drapeau', { drapeau: d.drapeau });
  };
  const envoyees = (n: number) => t(n === 0 ? 'envoyees.0' : n === 1 ? 'envoyees.1' : 'envoyees.n', { n });
  const lignes: RegleVue[] = e.regles.map((r) => ({
    id: r.id,
    nom: r.nom,
    declencheur: declencheur(r),
    compteur: envoyees(r.envoisDuMois ?? 0),
    actif: r.actif,
    selectionnee: r.id === (e.choisieId ?? e.regles[0]?.id),
    etiquette: r.etiquette ?? null,
    peutActiver: peutActiver(r, e.enLigne),
  }));

  const choisie = e.regles.find((r) => r.id === e.choisieId) ?? e.regles[0] ?? null;
  const texte = (s: string): MorceauDePhrase => ({ genre: 'texte', texte: s });
  const jeton = (s: string, cle = false): MorceauDePhrase => ({ genre: cle ? 'cle' : 'jeton', texte: s });
  let editeur: VueReponsesProps['editeur'] = null;
  let apercu: VueReponsesProps['apercu'] = null;
  if (choisie) {
    const manque = manqueDansLaRegle(choisie);
    const canaux = choisie.canaux.length ? choisie.canaux.map((k) => t(`canal.${k}`)).join(t('canal.et')) : t('phrase.aChoisir');
    const blocs: BlocVue[] = [
      { cle: 'quand', libelle: t('bloc.quand'), phrases: [[jeton(canaux), texte(t('phrase.arrive'))], [jeton(declencheur(choisie), true)]], detail: choisie.declencheur?.type === 'horaires' ? t('horaires.detail', { fin: heureCourte(horaires.fin) }) : null },
      ...(choisie.cible ? [{ cle: 'etsi' as const, libelle: t('bloc.etsi'), phrases: [[texte(t('phrase.expediteur')), jeton(choisie.cible)]], detail: null }] : []),
      { cle: 'alors', libelle: t('bloc.alors'), phrases: [[texte(t('phrase.repondre')), jeton(choisie.modeleTitre ?? (manque.includes('modele') ? t('phrase.aChoisir') : '…'), true), texte(t('phrase.signe'))], ...(choisie.signature ? [[jeton(choisie.signature)]] : [])], detail: null },
      ...(choisie.tache ? [{ cle: 'etaussi' as const, libelle: t('bloc.etaussi'), phrases: [[texte(t('phrase.tache')), jeton(choisie.tache.personne), texte(t('phrase.a')), jeton(choisie.tache.quand)]], detail: null }] : []),
      ...(choisie.sauf24h ? [{ cle: 'saufsi' as const, libelle: t('bloc.saufsi'), phrases: [[texte(t('phrase.dejaRecu'))], [jeton(t('phrase.dans', { n: GARDE_FOU_HEURES }))]], detail: null }] : []),
    ];
    editeur = {
      nom: choisie.nom,
      detail: [t('editeur.envois', { n: choisie.envoisDuMois ?? 0 }), choisie.testeeQuand ? t('editeur.testee', { quand: choisie.testeeQuand }) : '', choisie.actif ? t('editeur.plainte') : ''].filter(Boolean).join(' · '),
      actif: choisie.actif,
      libelleEtat: t(choisie.actif ? 'editeur.active' : 'editeur.inactive'),
      blocs,
      enregistre: choisie.enregistreAt ? t('enregistre', { heure: hhmm(choisie.enregistreAt) }) : null,
      aTester: choisie.aTester ? t('aTester') : null,
    };
    if (choisie.modele) {
      const ouverture = prochaineOuverture(e.maintenant, horaires);
      const jour = jourDe(ouverture);
      const d = ecartJours(jourDe(e.maintenant), jour);
      const reouverture = `${d === 1 ? (l === 'fr' ? 'demain' : 'tomorrow') : d === 0 ? (l === 'fr' ? 'aujourd’hui' : 'today') : JOURS_LONGS[l][jourSemaineIso(jour) - 1]} ${Number(hhmm(ouverture).slice(0, 2))}:${hhmm(ouverture).slice(3)}`;
      apercu = {
        de: e.apercu.de,
        a: t('apercu.delai', { nom: e.apercu.destinataireNom, n: e.apercu.delaiSecondes }),
        objet: choisie.modeleTitre ?? choisie.objet ?? '',
        paragraphes: choisie.modele.split(/\n+/).map((p) => segmentsDuModele(p, { prenom: e.apercu.prenom, reouverture })),
        destinataires: [
          { id: 'client', libelle: t('apercu.client'), actif: e.apercu.cible === 'client' },
          { id: 'prospect', libelle: t('apercu.prospect'), actif: e.apercu.cible === 'prospect' },
        ],
      };
    }
  }

  return {
    sousTitre: t('sousTitre'),
    regles: {
      sous: t('regles.actives', { x: c.actives, y: total }),
      lignes,
      proposee: e.proposee ? { nom: e.proposee.nom, sous: t('propose.sous') } : null,
      pied: { envois: String(c.envois), gagne: `${Math.round(c.gagneMinutes / 60)} h`, avis: c.avisMoyen !== null ? `${String(c.avisMoyen).replace('.', l === 'fr' ? ',' : '.')} / 5` : '—' },
    },
    editeur,
    apercu,
    suggestion: e.manque ? { titre: t('suggestion.manque'), texte: t('suggestion.texte', { n: e.manque.n, question: e.manque.question }), oui: t('suggestion.oui'), non: t('suggestion.non') } : null,
  };
}
