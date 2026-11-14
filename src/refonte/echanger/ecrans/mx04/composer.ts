import { ms, partiesParis, type Instant, type Langue } from '../../commun';
import { canauxVisibles, comptesDeReactions, nonLus, quiEcrit, REACTIONS, resumeDeFil, statutDeMessageDirect, type CanalDEquipe, type MessageDeCanal, type ReactionPosee } from '../../canaux';
import { traduire } from './i18n';
import type { DirectDuRailVue, ElementDuFlux, ReactionVue, TiroirVue, VueCanauxProps } from './VueCanaux';

/**
 * MX04 — COMPOSER LA VUE des canaux : le rail (non lus, messages directs et leur statut), le flux du canal (carte d'événement,
 * messages, réactions par icônes, lien « n réponses »), « en train d'écrire » et le tiroir du fil. Logique pure : les règles
 * viennent de `../../canaux.ts`. Un invité ne voit que ses canaux ; un canal dont la dernière lecture est inconnue n'a pas de
 * pastille de non lus ; « en train d'écrire » n'est jamais le contenu.
 */

export interface CanalAffichable extends CanalDEquipe {
  description?: string;
  /** « Alerte tickets urgents » branchée sur ce canal. */
  alerte?: boolean;
  /** Le canal s'ouvre dans un autre écran (la messagerie d'équipe) : il n'est jamais le canal choisi d'office. */
  ouvreAilleurs?: boolean;
  /** La dernière lecture de la personne ; `undefined` : inconnue, aucune pastille de non lus. */
  lectureAt?: Instant | null;
}
export interface MessageAffichable extends MessageDeCanal {
  reactions?: readonly ReactionPosee[];
}
export interface EvenementAffiche {
  id: string;
  canalId: string;
  titre: string;
  sous: string;
  at: Instant;
  resoluAt?: Instant | null;
}
export interface DirectAffiche {
  id: string;
  nom: string;
  concentre: boolean;
  tapeA?: Instant | null;
  dernierAt?: Instant | null;
  enLigne: boolean;
}
export interface EntreesCanaux {
  langue: Langue;
  maintenant: Instant;
  moi: string;
  role: string;
  nom: (email: string) => string;
  canaux: readonly CanalAffichable[];
  messages: readonly MessageAffichable[];
  evenements: readonly EvenementAffiche[];
  directs: readonly DirectAffiche[];
  frappes: readonly { canalId: string; email: string; tapeA: Instant }[];
  canalId: string | null;
  filOuvertId: string | null;
  brouillon: string;
  /** Le résumé d'Ajmani d'un fil, par identifiant du message d'origine ; absent : pas de résumé. */
  resumes?: Readonly<Record<string, string>>;
  /** Les réactions sont-elles connues du poste ? Faux : aucune rangée de réactions. */
  avecReactions: boolean;
  /** La coche « message en tâche » existe-t-elle ? */
  peutTache: boolean;
}

const hhmm = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};

export function composerCanaux(e: EntreesCanaux): Pick<VueCanauxProps, 'sousTitre' | 'rail' | 'canal' | 'flux' | 'ecrit' | 'compositeur' | 'tiroir'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const visibles = canauxVisibles(e.canaux, e.moi, e.role);
  const peutCreer = visibles.peutCreer;
  const canaux = visibles.canaux.map((c) => e.canaux.find((x) => x.id === c.id) as CanalAffichable);
  const choisi = canaux.find((c) => c.id === e.canalId && !c.ouvreAilleurs) ?? canaux.find((c) => !c.ouvreAilleurs) ?? null;
  const duCanal = (id: string) => e.messages.filter((m) => m.canalId === id);
  const nonLusDe = (c: CanalAffichable) => (c.lectureAt === undefined ? 0 : nonLus(duCanal(c.id), c.lectureAt, e.moi));
  const totalNonLus = canaux.reduce((s, c) => s + nonLusDe(c), 0);

  const directs: DirectDuRailVue[] = e.directs.map((d) => {
    const s = statutDeMessageDirect({ concentre: d.concentre, tapeA: d.tapeA, dernierMessageAt: d.dernierAt }, e.maintenant);
    return { id: d.id, nom: d.nom, enLigne: d.enLigne, statut: s.genre === 'concentre' ? t('statut.concentre') : s.genre === 'ecrit' ? t('statut.ecrit') : s.at !== null ? hhmm(s.at) : '' };
  });

  let flux: ElementDuFlux[] = [];
  let tiroir: TiroirVue | null = null;
  let ecrit: string | null = null;
  if (choisi) {
    const messages = duCanal(choisi.id);
    const reactionsDe = (m: MessageAffichable): ReactionVue[] | null => {
      if (!e.avecReactions) return null;
      const c = comptesDeReactions(m.reactions ?? []);
      return REACTIONS.map((type) => ({ type, libelle: t(`reaction.${type}`), n: c[type], miennes: (m.reactions ?? []).some((r) => r.type === type && r.email === e.moi) }));
    };
    const evenements = e.evenements.filter((x) => x.canalId === choisi.id);
    const entrees: { at: number; el: ElementDuFlux }[] = [
      ...evenements.map((x) => ({
        at: ms(x.at),
        el: { genre: 'evenement' as const, id: x.id, titre: x.titre, sous: x.sous, heure: hhmm(x.at), urgent: t('evenement.urgent'), etat: x.resoluAt ? { libelle: t('evenement.resolu', { heure: hhmm(x.resoluAt) }), resolu: true } : null },
      })),
      ...messages
        .filter((m) => !m.repondA)
        .map((m) => {
          const fil = resumeDeFil(m, messages);
          return {
            at: ms(m.at),
            el: {
              genre: 'message' as const,
              id: m.id,
              auteur: e.nom(m.auteurEmail),
              heure: hhmm(m.at),
              texte: m.texte,
              reactions: reactionsDe(m),
              fil: fil.reponses ? { libelle: t(fil.reponses <= 1 ? 'fil.reponses.1' : 'fil.reponses.n', { n: fil.reponses }), derniere: t('fil.derniere', { heure: hhmm(fil.derniereAt as number) }), participants: fil.abonnes.map(e.nom) } : null,
            },
          };
        }),
    ];
    flux = entrees.sort((a, b) => a.at - b.at).map((x) => x.el);
    const qui = quiEcrit(e.frappes.filter((f) => f.canalId === choisi.id), e.moi, e.maintenant).map(e.nom);
    ecrit = qui.length ? t(qui.length <= 1 ? 'ecrit.1' : 'ecrit.n', { noms: qui.join(', ') }) : null;

    const origine = messages.find((m) => m.id === e.filOuvertId && !m.repondA);
    if (origine) {
      const fil = resumeDeFil(origine, messages);
      const reponses = messages.filter((m) => m.repondA === origine.id).sort((a, b) => ms(a.at) - ms(b.at));
      const resolu = evenements.find((x) => x.resoluAt && reponses.length && ms(x.resoluAt) >= ms(reponses[0].at) && ms(x.resoluAt) <= ms(reponses[reponses.length - 1].at));
      tiroir = {
        canal: choisi.nom,
        origine: { auteur: e.nom(origine.auteurEmail), heure: hhmm(origine.at), texte: origine.texte },
        reponses: t(fil.reponses <= 1 ? 'tiroir.reponses.1' : 'tiroir.reponses.n', { n: fil.reponses }),
        lignes: reponses.map((r) => ({ id: r.id, auteur: e.nom(r.auteurEmail), heure: hhmm(r.at), texte: r.texte })),
        systeme: resolu?.resoluAt ? { texte: t('tiroir.systeme.resolu'), heure: hhmm(resolu.resoluAt) } : null,
        suivent: { noms: fil.abonnes.map(e.nom), texte: t(fil.abonnes.length <= 1 ? 'tiroir.suivent.1' : 'tiroir.suivent.n', { n: fil.abonnes.length }) },
        resume: e.resumes?.[origine.id] ?? null,
      };
    }
  }

  return {
    sousTitre: `${t('sousTitre')}${totalNonLus ? t(totalNonLus <= 1 ? 'sousTitre.nonLus.1' : 'sousTitre.nonLus.n', { n: totalNonLus }) : ''}`,
    rail: { canaux: canaux.map((c) => ({ id: c.id, nom: c.nom, nonLus: nonLusDe(c), actif: c.id === choisi?.id })), peutCreer, directs, phrase: t('rail.phrase') },
    canal: choisi ? { nom: choisi.nom, alerte: choisi.alerte ? t('alerte') : null, description: [choisi.description, t(choisi.membres.length <= 1 ? 'membres.1' : 'membres.n', { n: choisi.membres.length })].filter(Boolean).join(' · '), membres: choisi.membres.map(e.nom) } : null,
    flux,
    ecrit,
    compositeur: { placeholder: choisi ? t('compositeur.ecrire', { canal: choisi.nom }) : '', valeur: e.brouillon, peutTache: e.peutTache },
    tiroir,
  };
}
