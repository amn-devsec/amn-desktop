import { attenteLisible, MS_MINUTE, type Instant, type Langue } from '../../commun';
import { aRepondre, boiteAZero, serieDeSoirs, type Fil, type MessageDeFil, type SoirDeBoite } from '../../boite';
import { ECHELLE_REGLE_MS, canauxActifs, casesDuJour, messagesDepuis, proposerResume, regleDAttente, tuilesDuHub, type CanalMin, type MesuresDEchanger, type MessageDeCanal, type ModuleDEchanger } from '../../hub';
import { PROMESSE_MINUTES } from '../../boite';
import { traduire } from './i18n';
import type { ClientDuPouls, LigneCanalVue, TuileDEchangeVue, VueHubProps } from './VueHub';

/**
 * F40 — COMPOSER LA VUE d'Échanger : le pouls (règle de 3 h en racine carrée, promesse à 2 h ouvrées en pointillé), les
 * canaux actifs, la Boîte à zéro et sa série de soirs, les dix tuiles. Logique pure : les règles viennent de
 * `../../hub.ts` et `../../boite.ts`. La présence (« Mohamed lit ») est masquée au premier jet (STATUT §1.32 n° 4).
 */

export interface InfoDeFil {
  initiales: string;
  nom: string;
  canal: string;
}
export interface EntreesHub {
  langue: Langue;
  maintenant: Instant;
  messages: readonly MessageDeFil[];
  fils: readonly Fil[];
  infos: Readonly<Record<string, InfoDeFil>>;
  soirs: readonly SoirDeBoite[];
  canaux: readonly CanalMin[];
  messagesDeCanaux: readonly MessageDeCanal[];
  /** Ce que dit chaque canal à droite de sa ligne : « 3 non lus », « 1 ouverte »… ; absent : « calme » ou « n attendent ». */
  statutsDeCanaux?: Readonly<Record<string, { nonLus?: number; ouvertes?: number }>>;
  attendentParCanal: Readonly<Record<string, number>>;
  repondusIds: readonly string[];
  lusNonArchives: number;
  archivesAujourdhui: number;
  mesures: MesuresDEchanger;
  modulesOuverts: ReadonlySet<ModuleDEchanger> | null;
  routes: Readonly<Record<string, string>>;
  nomsCourts: Readonly<Record<string, string>>;
  prenomDeFil: (filId: string) => string;
  initialesJours: readonly string[];
  icones: Readonly<Record<string, React.ReactNode>>;
}

const racine = (t: number) => Math.sqrt(t / (ECHELLE_REGLE_MS / MS_MINUTE));

export function composerHub(e: EntreesHub, actions: { onResumer: () => void; onClic?: Record<string, () => void> }): Omit<VueHubProps, 'libelles' | 'onNouveauMessage' | 'onPersonnaliser'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const regle = regleDAttente(e.fils, e.maintenant);
  const file = aRepondre(e.fils);
  const boite = boiteAZero(e.messages, e.fils, e.maintenant);
  const soirs = serieDeSoirs(e.soirs, e.maintenant);

  const clients: ClientDuPouls[] = regle.clients.map((c, i) => {
    const info = e.infos[c.filId];
    return { id: c.filId, initiales: info?.initiales ?? '?', nom: info?.nom ?? '', detail: `${attenteLisible(c.attenteMs, l)} · ${info?.canal ?? ''}`, position: c.position, haut: i % 2 === 0, orange: c.orange, presence: null };
  });
  const plusAncien = regle.clients.length ? Math.max(...regle.clients.map((c) => c.attenteMs)) : 0;
  const sousTitre = regle.nombre
    ? `${t(regle.nombre <= 1 ? 'sous.attendent.1' : 'sous.attendent.n', { n: regle.nombre, duree: attenteLisible(plusAncien, l) })}${boite.total ? ` · ${t('sous.boite', { a: boite.valeur, b: boite.total })}` : ''}`
    : t('sous.aucun');

  const actifs = canauxActifs(e.canaux, e.messagesDeCanaux, e.maintenant, e.attendentParCanal);
  const lignes: LigneCanalVue[] = actifs.map((c) => {
    const st = e.statutsDeCanaux?.[c.id];
    const [statut, ton] = c.attendent > 0 ? [t(c.attendent <= 1 ? 'canal.attendent.1' : 'canal.attendent.n', { n: c.attendent }), 'orange' as const] : st?.nonLus ? [t(st.nonLus <= 1 ? 'canal.nonLus.1' : 'canal.nonLus.n', { n: st.nonLus }), 'neutre' as const] : st?.ouvertes ? [t(st.ouvertes <= 1 ? 'canal.ouverte.1' : 'canal.ouverte.n', { n: st.ouvertes }), 'orange' as const] : [t('canal.calme'), 'neutre' as const];
    return { id: c.id, nom: c.nom, barres: c.barres, statut, ton, presence: null };
  });
  const depuis8h = messagesDepuis(e.messagesDeCanaux, e.maintenant);
  const cases = casesDuJour(e.fils, e.repondusIds, e.lusNonArchives, e.archivesAujourdhui).map((c) => ({
    libelle: c.genre === 'repondre' ? t('case.repondre', { nom: e.prenomDeFil(c.filId ?? '') || (e.infos[c.filId ?? '']?.nom ?? '') }) : t((c.n ?? 0) <= 1 ? 'case.archiver.1' : 'case.archiver.n', { n: c.n ?? 0 }),
    fait: c.fait,
  }));

  const jours = soirs.semaine.map((j, i) => ({ libelle: j.etat === 'aujourdhui' ? t('serie.ceSoir') : (e.initialesJours[i] ?? ''), etat: j.etat }));
  const tuiles = tuilesDuHub(e.mesures, e.modulesOuverts).map<TuileDEchangeVue>((u) => {
    const n = u.nombres[0] ?? 0;
    const sous =
      u.cle === 'messagerie' ? t('tuile.messagerie', { n })
      : u.cle === 'courriel' ? t('tuile.courriel', { n })
      : u.cle === 'canaux' ? t('tuile.canaux', { n, t: u.detail?.canauxTotal ?? 0 })
      : u.cle === 'appels' ? (n > 0 ? t('tuile.appels', { n }) : t('tuile.appelsAucun'))
      : u.cle === 'reunions' ? (u.detail?.semaine !== undefined ? t('tuile.reunionsSemaine', { n: u.detail.semaine, h: Math.round((u.detail.minutes ?? 0) / 60) }) : t('tuile.reunions', { n }))
      : u.cle === 'annonces' ? (n > 0 ? t('tuile.annonces', { n }) : t('tuile.annoncesAucune'))
      : u.cle === 'partages' ? t(u.detail?.tousProteges ? 'tuile.partagesProteges' : 'tuile.partages', { n })
      : u.cle === 'sondages' ? t('tuile.sondages', { n })
      : u.cle === 'reponsesAuto' ? (u.detail?.envoisDuMois !== undefined ? t('tuile.reponsesAutoEnvois', { n: u.detail.envoisDuMois }) : t('tuile.reponsesAuto', { n }))
      : t('tuile.programmes', { n });
    return { cle: u.cle, nom: e.nomsCourts[u.cle] ?? t(`nom.${u.cle}`), icone: e.icones[u.cle], sous, vers: e.routes[u.cle] ?? null, onClick: actions.onClic?.[u.cle], pastille: u.pastille, avatar: null };
  });

  return {
    titre: t('titre'),
    sousTitre,
    pouls: {
      sous: t('pouls.sous'),
      graduations: [
        { libelle: t('graduation.maintenant'), position: 0 },
        ...[15, 30, 60, 120, 180].map((m) => ({ libelle: m < 60 ? `${m} min` : `${m / 60} h`, position: racine(m) })),
      ],
      seuil: { position: racine(PROMESSE_MINUTES), libelle: '2 h' },
      clients,
      vide: regle.personneNAttend ? t('pouls.calme') : null,
      onRepondre: file.length ? actions.onClic?.repondre : undefined,
    },
    canaux: { entete: t('canaux.entete'), sous: t('canaux.sous', { n: depuis8h, h: 8 }), lignes },
    boite: boite.calme
      ? null
      : {
          valeur: boite.valeur,
          libelle: t('boite.reponses'),
          detail: t('boite.detail', { a: boite.valeur, b: boite.total }),
          legende: { faits: t('boite.faits', { n: boite.faits }), chezEux: t('boite.chezEux', { n: boite.chezEux }), aRepondre: t('boite.aRepondre', { n: boite.aRepondre }) },
          segments: { faits: boite.faits, chezEux: boite.chezEux, aRepondre: boite.aRepondre },
          serie: soirs.serie > 0 ? { phrase: t(soirs.serie <= 1 ? 'serie.phrase.1' : 'serie.phrase.n', { n: soirs.serie }), jours } : { phrase: '', jours },
          cases,
          suggestion: proposerResume(depuis8h, actifs.filter((c) => c.actif).length) ? { texte: t('suggestion.resume'), oui: t('suggestion.oui'), onOui: actions.onResumer } : null,
        },
    modules: { titre: t('modules.titre', { n: tuiles.length }), tous: t('modules.tous'), tuiles },
  };
}
