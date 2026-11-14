import React, { useMemo, useState } from 'react';
import { CallLinkPanel } from '../../../../components/call/CallLinkPanel';
import { useAuth } from '../../../../auth/AuthContext';
import { useProfiles } from '../../../../state/ProfilesContext';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { useCall } from '../../../../state/CallContext';
import { useMembers } from '../../../../state/useMembers';
import { usePageCoquille } from '../../../coquille/page';
import { dureeDAppel } from '../../commun';
import { composerAppels } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueAppels, type CombineVue } from './VueAppels';

/**
 * H13 — Appels et salles, branché sur le poste. Route `/appels` (substitution de l'écran d'origine). Ce que le poste sait :
 * l'appel en cours dans l'application (le correspondant, la durée, le micro, raccrocher), qui est en ligne et peut être appelé,
 * et le journal des appels (sens, durée, manqué). Ce qu'il ne sait pas n'est pas montré (STATUT §1.27 n° 4) : pas de
 * ligne pro, donc pas de pavé, d'attente ni de transfert, pas de Standard ; pas de plan des salles en direct (aucune présence
 * de salle) ; pas de résumé, de décision ni de tâche (aucune prise de notes d'Ajmani). « Appel instantané » ouvre l'invitation
 * d'un visiteur par lien, comme l'écran d'origine ; « Programmer » reste éteint (lien avec le Calendrier à venir).
 */
interface AppelData {
  withEmail: string;
  sens: 'entrant' | 'sortant';
  at: string;
  seconds: number;
  manque: boolean;
}

export default function PageAppels() {
  const { tm, langue } = useMots();
  const { user } = useAuth();
  const { onlineEmails } = useSync();
  const { call, callsAvailable, phase, peerEmail, durationSec, muted, toggleMute, hangup } = useCall();
  const { profileFor } = useProfiles();
  const { membres } = useMembers();
  const journal = useCollection<AppelData>('calls');
  const [filtre, setFiltre] = useState<'tout' | 'manques' | 'resume'>('tout');
  const [lien, setLien] = useState(false);
  const maintenant = useMemo(() => new Date().toISOString(), []);
  const moi = user?.email ?? '';
  usePageCoquille({ famille: 'echanger', sousPage: 'appels', miettes: [{ libelle: tm('titre') }] });

  const nom = (email: string) => profileFor(email).name || email;
  const enAppel = phase === 'outgoing' || phase === 'connecting' || phase === 'active';

  const appels = useMemo(
    () =>
      [...journal].map((c) => {
        const fin = new Date(Date.parse(c.at) + c.seconds * 1000).toISOString();
        const sens: 'entrant' | 'sortant' | 'manque' = c.manque ? 'manque' : c.sens;
        // Un appel manqué est « rappelé » quand la personne a appelé le correspondant depuis.
        const rappele = c.manque && journal.some((x) => x.withEmail === c.withEmail && x.sens === 'sortant' && x.at > c.at);
        return { id: c.id, titre: nom(c.withEmail), sens, finAt: fin, dureeSec: c.seconds, resume: null, decisions: [], taches: [], rappele, moment: { at: c.at }, email: c.withEmail };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [journal, profileFor],
  );

  const v = composerAppels({
    langue,
    maintenant,
    salles: null,
    incidentDeclare: false,
    roleDeSupervision: false,
    appelEnCours: null,
    file: [],
    auTelephone: [],
    appels,
    filtre,
    enLigneAvec: enAppel ? nom(peerEmail) : null,
    actions: { onRappeler: callsAvailable ? (id) => { const a = appels.find((x) => x.id === id); if (a) void call(a.email); } : undefined },
  });

  const joignables = membres.filter((m) => m.email && m.email !== moi && onlineEmails.has(m.email)).map((m) => ({ email: m.email, nom: nom(m.email), onAppeler: callsAvailable && phase === 'idle' ? () => void call(m.email) : undefined }));
  const combine: CombineVue = enAppel
    ? {
        genre: 'ligne',
        ligne: null,
        correspondant: { initiales: nom(peerEmail).slice(0, 1).toUpperCase(), nom: nom(peerEmail), sous: tm(phase === 'outgoing' ? 'appelSortant' : 'appelEntrant'), etiquettes: [] },
        duree: dureeDAppel(durationSec),
        onde: [],
        notes: null,
        commandes: [
          { cle: 'micro', libelle: tm(muted ? 'microRetabli' : 'micro'), actif: muted, onClick: toggleMute },
          { cle: 'raccrocher', libelle: tm('raccrocher'), actif: false, danger: true, onClick: hangup },
        ],
        transfert: null,
        pave: null,
        boutons: null,
        joignables: [],
      }
    : { genre: 'repos', ligne: null, correspondant: null, duree: '', onde: [], notes: null, commandes: [], transfert: null, pave: null, boutons: null, joignables };

  return (
    <>
      <VueAppels {...v} etat="normal" libelles={libellesDe(tm as never)} combine={combine} actions={{ onInstantane: () => setLien(true), onFiltre: setFiltre }} />
      {lien && <CallLinkPanel onClose={() => setLien(false)} />}
    </>
  );
}
