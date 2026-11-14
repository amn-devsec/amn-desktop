import { attenteLisible, ajouterJours, ecartJours, jourDe, jourSemaineIso, ms, nombre, partiesParis, type Instant, type Jour, type Langue } from '../../commun';
import {
  aRepondre,
  attente,
  boiteAZero,
  canalDeReponse,
  composerFils,
  compteursParCanal,
  contexteClient,
  apercuDuFait,
  plierLesAnciens,
  serieDeSoirs,
  type CanalDeMessage,
  type DonneesDeContexte,
  type EtatDeCanal,
  type Fil,
  type GesteDeTri,
  type MessageDeFil,
  type SoirDeBoite,
} from '../../boite';
import { dire } from '../../i18n';
import { phraseDeLaBoite, phraseDeSerieDeSoirs } from '../../phrases';
import { traduire } from './i18n';
import type { CanalVue, CarreVue, CelluleVue, FiltreVue, LigneARepondreVue, LigneEnAttenteVue, MessageVue, VueBoiteProps } from './VueBoite';

/**
 * G07 — COMPOSER LA VUE de la boîte des clients : le bandeau « Boîte à zéro », les filtres de canal, les trois couloirs, le
 * fil du client choisi (messages dépliés, plis des jours passés, note interne), sa bande de contexte et la zone de réponse.
 * Logique pure : les règles viennent de `../../boite.ts` ; ce fichier ne fait qu'assembler et mettre en mots. Un client a
 * un seul fil, tous canaux mêlés ; le temps d'attente compte le plus ancien message sans réponse ; la note interne ne
 * quitte jamais l'équipe. Les textes des messages sont ceux des clients (ils gardent leur voix).
 */

export interface MessageAffichable extends MessageDeFil {
  auteur: string;
  texte: string;
  piece?: { nom: string; detail: string };
}

export interface ClientDuFil {
  nom: string;
  initiales: string;
  /** La personne qui écrit côté client (« Claire Roux »). */
  interlocuteur?: string;
  sousContrat: boolean;
  /** Ce que le poste sait du client ; ce qu'il ne sait pas n'est pas montré (« Rien à signaler »). */
  contexte: DonneesDeContexte & {
    contratNom?: string;
    passageLibelle?: string;
    facturesRef?: string;
    creneauxJour?: Jour;
    creneauxSource?: Jour;
  };
}

export interface EntreesBoite {
  langue: Langue;
  maintenant: Instant;
  prenom: string;
  messages: readonly MessageAffichable[];
  gestes: readonly GesteDeTri[];
  /** Par clé de fil (`client:7`). */
  clients: Readonly<Record<string, ClientDuFil>>;
  canaux: readonly EtatDeCanal[];
  soirs: readonly SoirDeBoite[];
  filChoisi: string | null;
  filtre: CanalDeMessage | 'tous';
  pliesOuverts: ReadonlySet<string>;
  /** Le brouillon d'Ajmani pour le fil choisi : jamais envoyé seul. */
  brouillon: { texte: string; creneau?: string } | null;
  canalChoisi?: CanalDeMessage;
  /** Le résumé d'Ajmani d'un pli (clé `AAAA-MM-JJ:canal`) ; absent : le début du premier message du pli. */
  resumesDePlis?: Readonly<Record<string, string>>;
  initialesJours: readonly string[];
}

const NOMS_JOURS: Record<Langue, readonly string[]> = {
  fr: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const NOMS_JOURS_LONGS: Record<Langue, readonly string[]> = {
  fr: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

const heureCourte = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};
const MOIS_COURTS: Record<Langue, readonly string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
/** « 5 nov. », « 31 déc. » ; en anglais « Nov 5 ». */
const jourCourt = (j: Jour, langue: Langue) => {
  const m = MOIS_COURTS[langue][Number(j.slice(5, 7)) - 1];
  return langue === 'fr' ? `${Number(j.slice(8, 10))} ${m}` : `${m} ${Number(j.slice(8, 10))}`;
};
/** Le canal dans une phrase : « par courriel », « par WhatsApp » (les noms propres gardent leur casse). */
const canalEnPhrase = (c: CanalDeMessage, l: Langue) => (c === 'courriel' ? dire(l, 'canal.courriel').toLowerCase() : dire(l, `canal.${c}` as never));

/** Un texte sur une seule ligne : les retours et les espaces multiples deviennent une espace, la casse reste. */
const uneLigne = (t: string) => t.replace(/\s+/g, ' ').trim();

/**
 * « depuis 6 min », « depuis 1 h 05 », « depuis hier », « depuis 2 j » : l'attente du client dans « En attente ». Les
 * heures et les minutes tant que c'est le même jour ; « hier » dès la veille ; « N j » à partir de deux jours.
 */
export function depuisLisible(depuis: Instant, maintenant: Instant, langue: Langue): string {
  const jours = ecartJours(jourDe(depuis), jourDe(maintenant));
  if (jours >= 2) return `${jours} ${langue === 'fr' ? 'j' : 'd'}`;
  if (jours === 1) return langue === 'fr' ? 'hier' : 'yesterday';
  return attenteLisible(ms(maintenant) - ms(depuis), langue);
}

export function composerBoite(e: EntreesBoite): Omit<VueBoiteProps, 'libelles' | 'actions' | 'etat'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const d = (cle: string, p?: Record<string, string | number>) => dire(l, cle as never, p);
  const auj = jourDe(e.maintenant);
  const fils = composerFils(e.messages, e.gestes, e.maintenant);
  const boite = boiteAZero(e.messages, fils, e.maintenant);
  const soirs = serieDeSoirs(e.soirs, e.maintenant);
  const comptes = compteursParCanal(fils);
  const canalVue = (c: CanalDeMessage): CanalVue => ({ id: c, nom: d(`canal.${c}`), grise: e.canaux.find((x) => x.canal === c)?.etat !== 'actif' && e.canaux.length > 0 });
  const infoDe = (f: Fil): ClientDuFil | undefined => e.clients[f.filId];
  const nomDe = (f: Fil) => infoDe(f)?.nom ?? t('inconnu');
  const initialesDe = (f: Fil) => (f.inconnu ? '?' : (infoDe(f)?.initiales ?? '?'));
  const dernierTexte = (f: Fil) => [...e.messages].filter((m) => !m.noteInterne && m.sens === 'entrant' && (m.clientId !== null ? `client:${m.clientId}` : `inconnu:${m.expediteur ?? '?'}`) === f.filId).sort((a, b) => ms(b.at) - ms(a.at))[0]?.texte ?? '';
  const passe = (f: Fil) => e.filtre === 'tous' || f.canalDuDernier === e.filtre;

  const file = aRepondre(fils).filter(passe);
  const lignesARepondre: LigneARepondreVue[] = file.map((f) => {
    const a = attente(f, e.maintenant);
    return {
      id: f.filId,
      initiales: initialesDe(f),
      nom: nomDe(f),
      canal: canalVue(f.canalDuDernier),
      apercu: uneLigne(dernierTexte(f)),
      attente: attenteLisible(a?.ms ?? 0, l),
      orange: !!a?.depasse,
      nonLu: f.nonLus > 0,
      choisi: f.filId === e.filChoisi,
      inconnu: f.inconnu,
    };
  });
  const lignesEnAttente: LigneEnAttenteVue[] = fils
    .filter((f) => f.couloir === 'en-attente' && passe(f))
    .sort((a, b) => (a.attendDepuis ?? a.dernierAt) - (b.attendDepuis ?? b.dernierAt) || a.filId.localeCompare(b.filId))
    .map((f) => ({
      id: f.filId,
      initiales: initialesDe(f),
      nom: nomDe(f),
      attend: f.attend ?? '',
      canal: canalVue(f.canalDuDernier),
      quand: f.relanceLe ? t('relance', { jour: NOMS_JOURS[l][jourSemaineIso(f.relanceLe) - 1] }) : t('depuis', { duree: depuisLisible(f.attendDepuis ?? f.dernierAt, e.maintenant, l) }),
      choisi: f.filId === e.filChoisi,
    }));
  const faits = fils.filter((f) => f.couloir === 'fait' && passe(f));
  const apercuFait = apercuDuFait(faits.map((f) => ({ initiales: initialesDe(f), at: f.dernierAt })));

  const filtres: FiltreVue[] = [
    { id: 'tous', libelle: t('filtre.tous'), n: comptes.tous, actif: e.filtre === 'tous' },
    ...(['courriel', 'whatsapp', 'sms'] as const).map((c) => ({ id: c, libelle: d(`canal.${c}`), n: comptes[c], actif: e.filtre === c })),
  ];

  const plusAncien = file.length ? Math.max(...file.map((f) => ms(e.maintenant) - (f.enAttenteDepuis as number))) : 0;
  const nAttendent = aRepondre(fils).length;
  const reste = nAttendent
    ? t(nAttendent <= 1 ? 'sous.attendent.1' : 'sous.attendent.n', { n: nAttendent, duree: attenteLisible(plusAncien, l) })
    : t('sous.aucun');
  const sousTitre = e.prenom ? `${t('bonjour', { prenom: e.prenom })}${reste}` : reste.charAt(0).toUpperCase() + reste.slice(1);

  const carres: CarreVue[] = boite.carres.map((c) => c);
  const bandeau = boite.calme
    ? { valeur: dire(l, 'boite.sur', { valeur: 0, total: 0 }), phrase: phraseDeLaBoite(boite, l), ratio: 0, carres: [], legende: { faits: '', enAttente: '', aRepondre: '' }, serie: null }
    : {
        valeur: dire(l, 'boite.sur', { valeur: boite.valeur, total: boite.total }),
        phrase: phraseDeLaBoite(boite, l),
        ratio: boite.total ? boite.valeur / boite.total : 0,
        carres,
        legende: { faits: t('legende.faits', { n: boite.faits }), enAttente: t('legende.enAttente', { n: boite.chezEux }), aRepondre: t('legende.aRepondre', { n: boite.aRepondre }) },
        serie: {
          sous: phraseDeSerieDeSoirs(soirs.serie, l) ?? '',
          jours: soirs.semaine.map((j, i) => ({ libelle: e.initialesJours[i] ?? NOMS_JOURS[l][i], etat: j.etat })),
        },
      };

  // Le fil du client choisi.
  const choisi = fils.find((f) => f.filId === e.filChoisi) ?? null;
  let filVue: VueBoiteProps['fil'] = null;
  if (choisi) {
    const info = infoDe(choisi);
    const mess = e.messages.filter((m) => (m.clientId !== null ? `client:${m.clientId}` : `inconnu:${m.expediteur ?? '?'}`) === choisi.filId);
    const canauxDuFil = (['courriel', 'whatsapp', 'sms'] as const).filter((c) => mess.some((m) => m.canal === c && !m.noteInterne));
    const { plies, visibles } = plierLesAnciens(mess, auj);
    const parId = new Map(mess.map((m) => [m.id, m] as const));
    const messageVue = (m: MessageAffichable): MessageVue =>
      m.noteInterne
        ? { genre: 'note', id: m.id, initiales: m.auteur.slice(0, 1).toUpperCase(), auteur: m.auteur, heure: heureCourte(m.at), texte: m.texte }
        : { genre: m.sens === 'sortant' ? 'nous' : 'client', id: m.id, initiales: m.auteur.slice(0, 1).toUpperCase(), auteur: m.auteur, heure: heureCourte(m.at), canal: canalVue(m.canal), texte: m.texte, piece: m.piece };
    const cellules: CelluleVue[] = info
      ? contexteClient(info.contexte).map((c): CelluleVue => {
          if (c.cle === 'contrat') return { cle: 'contrat', etiquette: t('contexte.contrat'), valeur: c.valeur ? (info.contexte.contratNom ?? '') : d('contexte.rien'), precision: c.valeur?.echeance ? t('contexte.jusquau', { date: jourCourt(c.valeur.echeance, l) }) : '', ton: 'neutre' };
          if (c.cle === 'passage') return { cle: 'passage', etiquette: t('contexte.passage'), valeur: c.valeur ? (info.contexte.passageLibelle ?? jourCourt(c.valeur.le, l)) : d('contexte.rien'), precision: c.valeur?.par ?? '', ton: 'neutre' };
          if (c.cle === 'factures') {
            const v = c.valeur;
            if (!v) return { cle: 'factures', etiquette: t('contexte.factures'), valeur: d('contexte.rien'), precision: '', ton: 'neutre' };
            if (c.ton === 'orange') return { cle: 'factures', etiquette: t('contexte.factures'), valeur: dire(l, v.nombre <= 1 ? 'contexte.impayees.1' : 'contexte.impayees.n', { n: v.nombre }), precision: `${nombre(Math.round(v.montantCents / 100), l)} €`, ton: 'orange' };
            return { cle: 'factures', etiquette: t('contexte.factures'), valeur: d('contexte.rienEnRetard'), precision: v.prochaineEcheance ? [info.contexte.facturesRef, t('contexte.echeance', { date: jourCourt(v.prochaineEcheance, l) })].filter(Boolean).join(' · ') : '', ton: 'vert' };
          }
          const jour = info.contexte.creneauxJour ? NOMS_JOURS_LONGS[l][jourSemaineIso(info.contexte.creneauxJour) - 1] : '';
          return { cle: 'creneaux', etiquette: t('contexte.creneaux', { jour }).trim(), valeur: c.valeur ? c.valeur.join(l === 'fr' ? ' ou ' : ' or ') : d('contexte.rien'), precision: c.valeur && info.contexte.creneauxSource ? t('contexte.agenda', { date: jourCourt(info.contexte.creneauxSource, l) }) : '', ton: 'neutre' };
        })
      : [];
    const reponse = canalDeReponse(choisi.canalDuDernier, e.canaux.length ? e.canaux : []);
    const canalActif = e.canalChoisi ?? reponse.canal;
    filVue = {
      id: choisi.filId,
      initiales: initialesDe(choisi),
      nom: nomDe(choisi),
      interlocuteur: info?.interlocuteur ?? '',
      contrat: info ? { texte: info.sousContrat ? t('client.sousContrat') : t('client.sansContrat'), ton: info.sousContrat ? 'succes' : 'neutre' } : null,
      memeFil: { texte: t(canauxDuFil.length <= 1 ? 'fil.canaux.1' : 'fil.canaux.n', { n: canauxDuFil.length }), canaux: canauxDuFil.map(canalVue) },
      inconnu: choisi.inconnu,
      contexte: cellules,
      plies: plies.map((p) => {
        const ouvert = e.pliesOuverts.has(`${p.jour}:${p.canal}`);
        const premier = parId.get(p.premierId);
        return {
          id: `${p.jour}:${p.canal}`,
          libelle: p.jour === ajouterJours(auj, -1) ? t('pli.hier', { canal: d(`canal.${p.canal}`).toLowerCase() === 'sms' ? 'SMS' : d(`canal.${p.canal}`).toLowerCase() }) : t('pli.le', { date: jourCourt(p.jour, l), canal: d(`canal.${p.canal}`).toLowerCase() === 'sms' ? 'SMS' : d(`canal.${p.canal}`).toLowerCase() }),
          extrait: e.resumesDePlis?.[`${p.jour}:${p.canal}`] ?? (premier ? uneLigne(premier.texte) : ''),
          bouton: ouvert ? t('pli.masquer') : t(p.nombre <= 1 ? 'pli.afficher.1' : 'pli.afficher.n', { n: p.nombre }),
          ouvert,
          messages: ouvert ? p.ids.map((id) => parId.get(id)).filter((m): m is MessageAffichable => !!m).map(messageVue) : [],
        };
      }),
      messages: visibles.map((id) => parId.get(id)).filter((m): m is MessageAffichable => !!m).map(messageVue),
      reponse: {
        info: e.brouillon ? t('brouillon') : '',
        creneau: e.brouillon?.creneau ? t('brouillon.creneau', { h: e.brouillon.creneau }) : null,
        brouillon: e.brouillon?.texte ?? '',
        canaux: reponse.choix.map((c) => ({ ...canalVue(c.canal), actif: c.canal === canalActif, grise: c.grise })),
      },
    };
  }

  return {
    sousTitre,
    bandeau,
    filtres,
    couloirs: {
      aRepondre: { nombre: lignesARepondre.length, lignes: lignesARepondre, vide: boite.atteinte ? t('couloir.vide') : null },
      enAttente: { nombre: lignesEnAttente.length, lignes: lignesEnAttente },
      fait: {
        nombre: faits.length,
        initiales: apercuFait.initiales,
        resume: apercuFait.dernierAt === null ? '' : apercuFait.reste ? t('fait.reste', { n: apercuFait.reste, heure: heureCourte(apercuFait.dernierAt) }) : t('fait.dernier', { heure: heureCourte(apercuFait.dernierAt) }),
      },
    },
    fil: filVue,
    badge: nAttendent,
  };
}
