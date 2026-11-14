import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, CalendarClock, FolderLock, Headset, Mail, Megaphone, MessageSquare, MessagesSquare, Reply, Vote } from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';
import { isModuleEnabled } from '../../../../data/spaces';
import { useCollection } from '../../../../state/SyncContext';
import { useMessages } from '../../../../state/useMessages';
import { useMessagesPrivesNonLus } from '../../../../state/messagesPrives';
import { usePageCoquille } from '../../../coquille/page';
import type { ModuleDEchanger } from '../../hub';
import { composerHub } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueHub } from './VueHub';

/**
 * F40 — Échanger, vue d'ensemble, branché sur le poste. Route `/ensemble/echanger` (substitution du hub). Ce que le poste
 * sait : les annonces à confirmer, les sondages en cours, les réunions de la semaine, les messages privés non lus, les
 * messages de l'équipe pour « Canaux actifs ». Ce qu'il ne sait pas n'est pas montré (fiche F40, rubrique 8 ; STATUT
 * §1.27 n° 4) : pas de boîte des clients (G07), de courriel (MX01), de partage (MX03), de réponses automatiques (MX06) : leurs
 * quatre écrans existent, donc leurs tuiles se montrent, mais elles disent « à brancher » (jamais « 0 »), vers leur écran ;
 * pas de messages programmés (aucun écran) ; donc pas de règle d'attente (« Personne n'attend ») ni de Boîte à zéro ; pas
 * de présence (STATUT §1.32 n° 4).
 */
interface AnnonceData {
  authorEmail: string;
  readBy?: string[];
}
interface SondageData {
  closedAt: string | null;
}
interface ReunionData {
  at: string;
  duree?: number;
}

const ROUTES: Record<string, string> = { messagerie: '/messagerie', courriel: '/courriel', canaux: '/groupes', appels: '/appels', reunions: '/reunions', annonces: '/annonces', partages: '/partages', sondages: '/sondages', reponsesAuto: '/reponses-automatiques' };
const VUES: Record<string, string> = { messagerie: 'clientInbox', courriel: 'sharedMail', canaux: 'groups', appels: 'calls', reunions: 'meetings', annonces: 'announcements', partages: 'sharedFiles', sondages: 'polls', reponsesAuto: 'autoReplies' };
/** Les quatre écrans nés du lot dont la source n'est pas au poste : leur tuile dit « à brancher ». */
const A_BRANCHER = new Set<ModuleDEchanger>(['messagerie', 'courriel', 'partages', 'reponsesAuto']);
const ICONES: Record<string, React.ReactNode> = {
  messagerie: <MessageSquare size={14} />,
  courriel: <Mail size={14} />,
  canaux: <MessagesSquare size={14} />,
  appels: <Headset size={14} />,
  reunions: <CalendarClock size={14} />,
  annonces: <Megaphone size={14} />,
  partages: <FolderLock size={14} />,
  sondages: <Vote size={14} />,
  reponsesAuto: <Reply size={14} />,
  programmes: <BellRing size={14} />,
};

export default function PageHub() {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email ?? '';
  const annonces = useCollection<AnnonceData>('announcements');
  const sondages = useCollection<SondageData>('polls');
  const reunions = useCollection<ReunionData>('meetings');
  const { messages } = useMessages();
  const dm = useMessagesPrivesNonLus();
  const maintenant = useMemo(() => new Date().toISOString(), []);

  usePageCoquille({ famille: 'echanger', sousPage: 'ensemble', miettes: [{ libelle: tm('titre') }] });

  const ouverts = useMemo(() => new Set(Object.keys(VUES).filter((c) => isModuleEnabled(VUES[c])) as ModuleDEchanger[]), []);
  const jour = maintenant.slice(0, 10);
  const semaine = reunions.filter((r) => Math.abs(Date.parse(r.at) - Date.parse(maintenant)) < 7 * 86_400_000);

  const v = composerHub(
    {
      langue,
      maintenant,
      messages: [],
      fils: [],
      infos: {},
      soirs: [],
      canaux: [{ id: 'equipe', nom: tm('nom.canaux') }],
      messagesDeCanaux: messages.map((m) => ({ canalId: 'equipe', at: m.createdAt })),
      attendentParCanal: {},
      repondusIds: [],
      lusNonArchives: 0,
      archivesAujourdhui: 0,
      mesures: {
        aRepondre: 0,
        courrielsNonLus: 0,
        canauxNonLus: dm.total,
        canauxAvecNonLus: dm.parCorrespondant.size,
        appelsEnCours: 0,
        reunionsAujourdhui: reunions.filter((r) => r.at.slice(0, 10) === jour).length,
        reunionsSemaine: semaine.length,
        reunionsSemaineMinutes: semaine.reduce((s, r) => s + (r.duree ?? 60), 0),
        annoncesAConfirmer: annonces.filter((a) => a.authorEmail !== email && !(a.readBy ?? []).includes(email)).length,
        partagesActifs: 0,
        sondagesEnCours: sondages.filter((s) => !s.closedAt).length,
        reglesActives: 0,
        reglesTotal: 0,
        envoisProgrammes: 0,
      },
      modulesOuverts: ouverts,
      aBrancher: A_BRANCHER,
      routes: ROUTES,
      nomsCourts: {},
      prenomDeFil: () => '',
      initialesJours: langue === 'fr' ? ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      icones: ICONES,
    },
    { onResumer: () => undefined },
  );
  return <VueHub {...v} libelles={libellesDe(tm as never)} onNouveauMessage={() => navigate('/messages-prives')} />;
}
