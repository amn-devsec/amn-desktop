import React, { useMemo, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { uid, useCollection, useSync } from '../../../../state/SyncContext';
import { Bouton, Modale, Saisie } from '../../../../socle/ui';
import { usePageCoquille } from '../../../coquille/page';
import { composerReunions, type ReunionAffichable } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueReunions, type ActionsVue, type NotesVue } from './VueReunions';

/**
 * MX02 — Réunions, branché sur le poste. Route `/reunions` (substitution de l'écran d'origine). Ce que le poste sait : le titre,
 * l'heure, la durée, les participants (une phrase libre), l'ordre du jour (un texte, une ligne par sujet, sans minutes), les
 * décisions et les actions (avec leur case). Ce qu'il ne sait pas n'est pas montré (STATUT §1.27 n° 4) : pas de réunion « en
 * cours » (aucun début réel), de vignettes ni de parole, de notes en direct, de suggestion de durée, de documents ni de cases
 * de préparation (donc pas de « préparation » en % dans « À venir »). La colonne de gauche montre les décisions et les actions
 * de la dernière réunion passée, où l'on peut en noter. « Planifier » garde les champs de l'écran d'origine.
 */
interface ReunionData {
  title: string;
  at: string;
  durationMin?: number;
  attendees: string;
  agenda: string;
  decisions: string[];
  actions: { id: string; label: string; doneAt: string | null }[];
  byEmail: string;
  createdAt: string;
}
const DUREE_PAR_DEFAUT = 60;

export default function PageReunions() {
  const { tm, langue } = useMots();
  const { user } = useAuth();
  const { upsert } = useSync();
  const brutes = useCollection<ReunionData>('meetings');
  const [creation, setCreation] = useState(false);
  const [titre, setTitre] = useState('');
  const [quand, setQuand] = useState('');
  const [duree, setDuree] = useState('');
  const [participants, setParticipants] = useState('');
  const [ordre, setOrdre] = useState('');
  const maintenant = useMemo(() => new Date().toISOString(), []);
  const moi = user?.email ?? '';
  usePageCoquille({ famille: 'echanger', sousPage: 'reunions', miettes: [{ libelle: tm('titre') }] });

  const reunions: ReunionAffichable[] = useMemo(
    () =>
      brutes.map((r) => ({
        id: r.id,
        titre: r.title,
        debutPrevuAt: r.at,
        dureePrevueMin: r.durationMin ?? DUREE_PAR_DEFAUT,
        participants: [moi],
        participantsTexte: r.attendees.trim() || undefined,
        ordreDuJour: (r.agenda ?? '').split('\n').map((x) => x.trim()).filter(Boolean).map((titreDuSujet) => ({ titre: titreDuSujet, minutes: 0 })),
      })),
    [brutes, moi],
  );
  const derniere = useMemo(() => [...brutes].filter((r) => Date.parse(r.at) <= Date.parse(maintenant)).sort((a, b) => b.at.localeCompare(a.at))[0] ?? null, [brutes, maintenant]);

  const notes: NotesVue | null = derniere
    ? { titre: tm('passee.decisions'), sous: derniere.title, lignes: (derniere.decisions ?? []).map((texte) => ({ heure: null, texte, decision: true })), curseur: false, saisie: true }
    : null;
  const actions: ActionsVue | null = derniere
    ? {
        titre: tm('passee.actions'),
        sous: derniere.title,
        saisie: true,
        lignes: (derniere.actions ?? []).map((a) => ({
          id: a.id,
          avatar: '',
          texte: a.label,
          sous: '',
          etat: { libelle: a.doneAt ? tm('etat.faite') : '', ton: a.doneAt ? ('succes' as const) : ('neutre' as const) },
          fait: !!a.doneAt,
          onBasculer: () => void upsert('meetings', derniere.id, { ...derniere, actions: derniere.actions.map((x) => (x.id === a.id ? { ...x, doneAt: x.doneAt ? null : new Date().toISOString() } : x)) }),
        })),
      }
    : null;

  const v = composerReunions({ langue, maintenant, moi, nom: (e) => e, reunions, enSalle: null, notes, actions });
  const planifier = async () => {
    if (!titre.trim()) return;
    await upsert('meetings', uid('mtg'), { title: titre.trim(), at: quand ? new Date(quand).toISOString() : new Date().toISOString(), attendees: participants.trim(), agenda: ordre.trim(), durationMin: Math.max(5, Number(duree) || DUREE_PAR_DEFAUT), decisions: [], actions: [], byEmail: moi, createdAt: new Date().toISOString() });
    setTitre('');
    setQuand('');
    setDuree('');
    setParticipants('');
    setOrdre('');
    setCreation(false);
  };

  return (
    <>
      <VueReunions
        {...v}
        etat="normal"
        libelles={libellesDe(tm as never)}
        evenements={{
          onPlanifier: () => setCreation(true),
          onNote: (texte) => {
            if (derniere) void upsert('meetings', derniere.id, { ...derniere, decisions: [...(derniere.decisions ?? []), texte] });
          },
          onAction: (texte) => {
            if (derniere) void upsert('meetings', derniere.id, { ...derniere, actions: [...(derniere.actions ?? []), { id: uid('act'), label: texte, doneAt: null }] });
          },
        }}
      />
      <Modale
        ouverte={creation}
        onFermer={() => setCreation(false)}
        titre={tm('creer.titre')}
        actions={
          <>
            <Bouton variante="secondaire" onClick={() => setCreation(false)}>{tm('creer.annuler')}</Bouton>
            <Bouton variante="primaire" onClick={() => void planifier()} disabled={!titre.trim()}>{tm('creer.creer')}</Bouton>
          </>
        }
      >
        <Saisie etiquette={tm('creer.nom')} value={titre} onChange={(e) => setTitre(e.target.value)} autoFocus />
        <Saisie etiquette={tm('creer.quand')} type="datetime-local" value={quand} onChange={(e) => setQuand(e.target.value)} />
        <Saisie etiquette={tm('creer.duree')} type="number" min={5} value={duree} onChange={(e) => setDuree(e.target.value)} />
        <Saisie etiquette={tm('creer.participants')} value={participants} onChange={(e) => setParticipants(e.target.value)} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, marginTop: 8 }}>
          {tm('creer.ordre')}
          <textarea rows={3} value={ordre} onChange={(e) => setOrdre(e.target.value)} style={{ borderRadius: 8, padding: 8, background: 'transparent', color: 'inherit', border: '1px solid currentColor' }} />
        </label>
      </Modale>
    </>
  );
}
