import { ecartJours, jourDe, jourSemaineIso, ms, partiesParis, type Instant, type Langue } from '../../commun';
import { composerFils, dansLaBoite, demandesDuMessage, dossiersAutomatiques, ETIQUETTES_PAR_DEFAUT, resumeAGenerer, type MessageDeCourriel, type EtatDeLaBoite } from '../../courriel';
import { tailleLisible } from '../../commun';
import { traduire } from './i18n';
import type { ConversationVue, DossierId, DossierVue, FilVue, VueCourrielProps } from './VueCourriel';

/**
 * MX01 — COMPOSER LA VUE du courriel : dossiers et leurs comptes, étiquettes, « Dans la boîte » (présence, sans historique), fils
 * (non lu, pièce jointe, compteur de messages), résumé d'Ajmani (demandes numérotées, ce qui est attendu), messages repliés
 * et dernier message déplié. Logique pure : les règles viennent de `../../courriel.ts`. Aucune clé ni adresse de serveur ;
 * une pièce jointe n'est montrée qu'avec son état d'analyse ; le brouillon n'est jamais envoyé seul.
 */

export interface MessageAffichable extends MessageDeCourriel {
  expediteur: string;
  objet: string;
  texte: string;
  dossier?: DossierId;
  /** Le message vient de la personne ou de l'équipe (un message envoyé). */
  envoye?: boolean;
  taille?: number;
}
export interface EntreesCourriel {
  langue: Langue;
  maintenant: Instant;
  moi: string;
  messages: readonly MessageAffichable[];
  dossier: DossierId;
  filtre: 'tous' | 'non-lus' | 'a-moi';
  filChoisi: string | null;
  presences: readonly { email: string; nom: string; filId: string; filNom: string; mode: 'lit' | 'ecrit' }[];
  organisations: Readonly<Record<string, { type: 'client' | 'partenaire'; nom: string; suivi?: string }>>;
  etatBoite: EtatDeLaBoite;
  brouillonPret: string | null;
  attend: string | null;
}

const JOURS_COURTS: Record<Langue, readonly string[]> = { fr: ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };
const hhmm = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};

export function composerCourriel(e: EntreesCourriel): Pick<VueCourrielProps, 'sousTitre' | 'dossiers' | 'etiquettes' | 'presences' | 'filtres' | 'nonLus' | 'fils' | 'conversation' | 'videDuDossier'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const auj = jourDe(e.maintenant);
  const quand = (at: Instant) => {
    const j = jourDe(at);
    return j === auj ? hhmm(at) : ecartJours(j, auj) === 1 ? (l === 'fr' ? 'Hier' : 'Yesterday') : `${JOURS_COURTS[l][jourSemaineIso(j) - 1]}`;
  };
  const dossierDe = (m: MessageAffichable): DossierId => (m.programmeAt ? 'programmes' : (m.dossier ?? 'reception'));
  const typesDOrg = Object.fromEntries(Object.entries(e.organisations).map(([k, v]) => [k, v.type]));
  const auto = dossiersAutomatiques(e.messages, typesDOrg);
  const dansLeDossier = (d: DossierId): MessageAffichable[] =>
    e.messages.filter((m) => (d === 'clients' ? !!m.organisation && e.organisations[m.organisation]?.type === 'client' : d === 'partenaires' ? !!m.organisation && e.organisations[m.organisation]?.type === 'partenaire' : dossierDe(m) === d));
  const filsDe = (d: DossierId) => composerFils(dansLeDossier(d), e.moi);
  const nonLusReception = filsDe('reception').filter((f) => f.nonLu).length;
  const compte = (d: DossierId): number | null => (d === 'reception' ? nonLusReception : d === 'clients' ? auto.clients : d === 'partenaires' ? auto.partenaires : d === 'programmes' ? auto.programmes : d === 'brouillons' ? dansLeDossier('brouillons').length : null);
  const ordre: DossierId[] = ['reception', 'clients', 'devis', 'partenaires', 'envoyes', 'brouillons', 'programmes', 'archives'];
  const dossiers: DossierVue[] = ordre.map((id) => ({ id, libelle: t(`dossier.${id}`), n: compte(id), actif: id === e.dossier }));

  const etiquettes = ETIQUETTES_PAR_DEFAUT.map((id) => ({ id, libelle: t(`etiquette.${id}`), ton: (id === 'urgent' ? 'critique' : id === 'a-facturer' ? 'attention' : 'info') as 'critique' | 'attention' | 'info' }));
  const presences = dansLaBoite(e.presences, e.moi).map((q) => e.presences.find((x) => x.email === q.email && x.filId === q.filId) as (typeof e.presences)[number]).map((p) => ({ id: `${p.email}:${p.filId}`, nom: p.nom, texte: t(p.mode === 'lit' ? 'presence.lit' : 'presence.ecrit', { nom: p.nom, fil: p.filNom }) }));

  const tous = filsDe(e.dossier);
  const visibles = tous.filter((f) => (e.filtre === 'non-lus' ? f.nonLu : e.filtre === 'a-moi' ? f.aMoi : true));
  const parId = new Map(e.messages.map((m) => [m.id, m] as const));
  const dernierDe = (filId: string) => e.messages.filter((m) => m.filId === filId && !m.programmeAt).sort((a, b) => ms(a.at) - ms(b.at))[e.messages.filter((m) => m.filId === filId && !m.programmeAt).length - 1];
  const choisi = visibles.find((f) => f.filId === e.filChoisi) ?? visibles[0] ?? null;
  const fils: FilVue[] = visibles.map((f) => {
    const d = dernierDe(f.filId);
    return { id: f.filId, expediteur: d.expediteur, nonLu: f.nonLu, pieceJointe: f.avecPieceJointe, compteur: f.messages > 1 ? f.messages : null, objet: d.objet, apercu: d.texte.replace(/\s+/g, ' ').trim(), quand: quand(d.at), actif: f.filId === choisi?.filId };
  });

  let conversation: ConversationVue | null = null;
  if (choisi) {
    const d = dernierDe(choisi.filId);
    const messagesDuFil = e.messages.filter((m) => m.filId === choisi.filId && !m.programmeAt).sort((a, b) => ms(a.at) - ms(b.at));
    const demandes = demandesDuMessage(d.texte);
    const org = d.organisation ? e.organisations[d.organisation] : undefined;
    const jours = Math.max(1, ecartJours(jourDe(messagesDuFil[0].at), auj));
    conversation = {
      objet: d.objet,
      organisation: org ? { type: t('client'), nom: org.nom, suivi: org.suivi ?? null } : null,
      resume: resumeAGenerer(messagesDuFil.length)
        ? { meta: t('resume.messages', { n: messagesDuFil.length, jours }), demandes, compte: t(demandes.length <= 1 ? 'resume.demandes.1' : 'resume.demandes.n', { n: demandes.length }), attend: e.attend ? t('resume.attend', { texte: e.attend }) : null }
        : null,
      plies: choisi.replies.map((id) => parId.get(id)).filter((m): m is MessageAffichable => !!m).map((m) => ({ id: m.id, auteur: m.envoye ? t('replie.moi') : m.expediteur, texte: m.texte.replace(/\s+/g, ' ').trim(), quand: `${JOURS_COURTS[l][jourSemaineIso(jourDe(m.at)) - 1]} ${Number(jourDe(m.at).slice(8, 10))}`, moi: !!m.envoye })),
      dernier: {
        auteur: d.expediteur,
        quand: `${t('a')} · ${jourDe(d.at) === auj ? (l === 'fr' ? 'aujourd’hui à' : 'today at') : ''} ${hhmm(d.at)}`.replace(/\s+/g, ' ').trim(),
        paragraphes: d.texte.split(/\n{1,}/).map((x) => x.trim()).filter(Boolean),
        piece: d.piecesJointes?.[0] ? { nom: d.piecesJointes[0].nom, detail: [d.taille ? tailleLisible(d.taille, l) : '', t(d.piecesJointes[0].analyse === 'sans-risque' ? 'analyse.sansRisque' : d.piecesJointes[0].analyse === 'en-cours' ? 'analyse.enCours' : 'analyse.dangereuse')].filter(Boolean).join(' · ') } : null,
      },
      compositeur: { placeholder: t('compositeur.repondre', { nom: d.expediteur.split(' ')[0] }), brouillon: e.brouillonPret ? t('compositeur.brouillon', { texte: e.brouillonPret }) : null },
    };
  }

  const nonLus = tous.filter((f) => f.nonLu).length;
  return {
    sousTitre: `${t('sousTitre')}${nonLusReception ? t(nonLusReception <= 1 ? 'sousTitre.nonLus.1' : 'sousTitre.nonLus.n', { n: nonLusReception }) : t('sousTitre.aucun')}`,
    dossiers,
    etiquettes,
    presences,
    filtres: [
      { id: 'tous', libelle: t('filtre.tous'), actif: e.filtre === 'tous' },
      { id: 'non-lus', libelle: t('filtre.nonLus'), actif: e.filtre === 'non-lus' },
      { id: 'a-moi', libelle: t('filtre.aMoi'), actif: e.filtre === 'a-moi' },
    ],
    nonLus: nonLus ? t('fils.nonLus', { n: nonLus }) : '',
    fils,
    conversation,
    videDuDossier: fils.length ? null : t('vide.texte'),
  };
}
