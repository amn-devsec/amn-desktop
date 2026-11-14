import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { useNotes } from '../../../../state/useNotes';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { usePageCoquille } from '../../../coquille/page';
import { jourDeParis } from '../../commun';
import {
  PAUSE_MIN, abandonner, choisirLaDuree, dureeDeLaPhaseMs, enMarche, lancer, mettreEnPause, nouveauFocus, phaseSuivante, phaseTerminee, restantMs,
  seancesDuJour, type Focus, type SeanceFaite,
} from '../../focus';
import { useMots } from './textes';
import { VueFocus, type BlocDeMatinee, type LigneDeFile } from './VueFocus';

interface Memoire { focus: Focus; seances: SeanceFaite[]; objectif: number }
interface TacheReelle { title: string; assigneeEmail: string; status: 'todo' | 'doing' | 'done'; createdAt: string; priority?: 'low' | 'normal' | 'high' }

const MS_MIN = 60_000;
const FORMAT_HEURE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const minutesDe = (ms: number): number => { const [h, m] = FORMAT_HEURE.format(new Date(ms)).split(':').map(Number); return h * 60 + m; };
const hhmm = (ms: number) => FORMAT_HEURE.format(new Date(ms)).replace(':', ':');

/**
 * L02 · MODE FOCUS — la machine à états du Pomodoro (`focus.ts` : séances de 15 à 90 min, pause 5 min, pause longue 15 min à la 4e séance, minuteur
 * ancré sur un instant : exact après veille ou changement d'écran). L'état (la séance, les séances faites, l'objectif) vit dans le stockage local
 * du poste (réglage personnel, §1.27) ; rien ne part sur le réseau. « Terminer la tâche » coche la tâche (`tasks`) ou la priorité du jour
 * (`dailyPriorities`), « Une idée ? » écrit une note personnelle (`useNotes`, le carnet de MJ04). Absents du dépôt : le compte de ce qui est arrivé
 * depuis l'entrée (notifications, messages, courriels : `null`, la pastille n'est pas montrée), la durée estimée d'une tâche, les urgences
 * qui passent, l'ambiance sonore (jamais lancée), les heures calmes de MJ05.
 */
export function FocusRefonte({ maintenant: maintenantInitial = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const { createNote } = useNotes();
  const aujourdhui = useAujourdhui();
  const taches = useCollection<TacheReelle & { id: string }>('tasks');
  const email = (user?.email ?? '').toLowerCase();
  const cle = `amn.focus.${email || 'anonyme'}`;
  const [maintenant, setMaintenant] = useState(maintenantInitial);
  const [memoire, setMemoire] = useState<Memoire>(() => {
    try { const lu = JSON.parse(window.localStorage.getItem(cle) ?? 'null') as Memoire | null; if (lu?.focus) return lu; } catch { /* départ à zéro */ }
    return { focus: nouveauFocus(), seances: [], objectif: 4 };
  });
  const [saute, setSaute] = useState(0);
  const [idee, setIdee] = useState('');
  const [ideeFaite, setIdeeFaite] = useState(false);
  const [reglages, setReglages] = useState(false);
  usePageCoquille({ famille: 'jour', sousPage: 'focus', miettes: [{ libelle: tm('titre') }] });

  const garder = useCallback((m: Memoire) => { setMemoire(m); try { window.localStorage.setItem(cle, JSON.stringify(m)); } catch { /* local seulement */ } }, [cle]);
  useEffect(() => { const t = window.setInterval(() => setMaintenant(Date.now()), 1000); return () => window.clearInterval(t); }, []);

  // La phase se termine : on passe à la suivante, et la séance faite s'enregistre au temps passé.
  useEffect(() => {
    if (!enMarche(memoire.focus) || !phaseTerminee(memoire.focus, maintenant)) return;
    const { focus, seanceTerminee } = phaseSuivante(memoire.focus);
    const minutes = memoire.focus.dureeSeanceMin;
    garder({ ...memoire, focus, seances: seanceTerminee ? [...memoire.seances, { startedAt: new Date(maintenant - minutes * MS_MIN).toISOString(), minutes }] : memoire.seances });
  }, [maintenant, memoire, garder]);

  const jour = aujourdhui.jour;
  const duJour = seancesDuJour(memoire.seances, jour);
  const f = memoire.focus;

  const file = useMemo(() => {
    const priorites = aujourdhui.acces.priorites.filter((p) => (p.email ?? '').toLowerCase() === email && p.day === jour).flatMap((p) => p.items.filter((i) => !i.doneAt).map((i, rang) => ({ id: `prio:${p.id}:${i.id}`, titre: i.label, contexte: tm('contexte.priorite', { n: rang + 1 }), source: 'priorite' as const, cible: { jourId: p.id, itemId: i.id } })));
    const ouvertes = taches.filter((t) => (t.assigneeEmail ?? '').toLowerCase() === email && t.status !== 'done').sort((a, b) => Number(b.priority === 'high') - Number(a.priority === 'high') || a.createdAt.localeCompare(b.createdAt)).map((t) => ({ id: `tache:${t.id}`, titre: t.title, contexte: t.priority === 'high' ? tm('contexte.urgente') : '', source: 'tache' as const, cible: { tacheId: t.id } }));
    return [...priorites, ...ouvertes];
  }, [aujourdhui.acces.priorites, taches, email, jour, tm]);
  const courante = file.length ? file[Math.min(saute, file.length - 1)] : null;
  const suivantes = file.filter((_, i) => i !== Math.min(saute, file.length - 1));

  const fin = maintenant + restantMs(f, maintenant);
  const matin = minutesDe(maintenant) < 13 * 60 + 30;
  const debutFen = matin ? 9 * 60 : 13 * 60 + 30;
  const finFen = matin ? 12 * 60 + 30 : 19 * 60;
  const blocs = useMemo<BlocDeMatinee[]>(() => {
    const b: BlocDeMatinee[] = [];
    for (const s of memoire.seances.filter((x) => jourDeParis(x.startedAt) === jour)) {
      const d = minutesDe(Date.parse(s.startedAt));
      b.push({ id: `s${s.startedAt}`, type: 'faite', debut: d, fin: d + s.minutes, label: String(b.filter((x) => x.type === 'faite').length + 1) });
      b.push({ id: `p${s.startedAt}`, type: 'pause', debut: d + s.minutes, fin: d + s.minutes + PAUSE_MIN, label: '' });
    }
    for (const a of aujourdhui.acces.appointments.filter((x) => x.status !== 'cancelled' && jourDeParis(x.startAt) === jour)) {
      const d = minutesDe(Date.parse(a.startAt));
      b.push({ id: `a${a.id}`, type: 'agenda', debut: d, fin: d + Math.max(15, a.durationMin ?? 30), label: a.title.split(' ')[0] });
    }
    const fM = minutesDe(fin);
    if (f.phase === 'travail') {
      b.push({ id: 'courante', type: 'courante', debut: fM - f.dureeSeanceMin, fin: fM, label: '' });
      let cur = fM + PAUSE_MIN;
      for (let r = duJour.nombre + 1; r < memoire.objectif && cur + f.dureeSeanceMin <= finFen; r += 1) { b.push({ id: `v${r}`, type: 'prevue', debut: cur, fin: cur + f.dureeSeanceMin, label: String(r + 1) }); cur += f.dureeSeanceMin + PAUSE_MIN; }
    }
    return b.filter((x) => x.fin > debutFen && x.debut < finFen);
  }, [memoire.seances, memoire.objectif, aujourdhui.acces.appointments, jour, fin, f.phase, f.dureeSeanceMin, duJour.nombre, debutFen, finFen, tm]);

  const prochainRdv = aujourdhui.acces.appointments.filter((a) => a.status !== 'cancelled' && Date.parse(a.startAt) > fin).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0];
  const phrase = f.phase === 'travail' ? (prochainRdv ? tm('matinee.phrase', { fin: hhmm(fin), pause: PAUSE_MIN, suivant: prochainRdv.title.split(' ')[0] }) : tm('matinee.phrase.sans', { fin: hhmm(fin), pause: PAUSE_MIN })) : null;
  const lignes: LigneDeFile[] = suivantes.slice(0, 2).map((s) => ({ id: s.id, titre: s.titre }));

  const terminer = () => {
    if (!courante) return;
    if (courante.source === 'tache' && 'tacheId' in courante.cible) {
      const t = taches.find((x) => x.id === (courante.cible as { tacheId: string }).tacheId);
      if (t) { const { id, ...d } = t as typeof t & { id: string }; void upsert('tasks', id, { ...d, status: 'done', updatedAt: new Date(maintenant).toISOString() }); }
    } else if ('jourId' in courante.cible) {
      const { jourId, itemId } = courante.cible;
      const j = aujourdhui.acces.priorites.find((x) => x.id === jourId);
      if (j) { const { id, ...d } = j as typeof j & { id: string }; void upsert('dailyPriorities', id, { ...d, items: j.items.map((i) => (i.id === itemId ? { ...i, doneAt: new Date(maintenant).toISOString() } : i)), updatedAt: new Date(maintenant).toISOString() }); }
    }
    setSaute(0);
  };

  return (
    <VueFocus
      focus={f}
      maintenant={maintenant}
      finPrevue={hhmm(fin)}
      rangDuJour={duJour.nombre}
      numeroSession={Math.min(memoire.objectif, duJour.nombre + 1)}
      objectif={memoire.objectif}
      minutes={duJour.minutes}
      bruit={null}
      tache={courante ? { titre: courante.titre, contexte: courante.contexte } : null}
      file={lignes}
      resteFile={Math.max(0, suivantes.length - 2)}
      totalFile={null}
      matinee={{ titre: matin ? 'matinee' : 'apresMidi', debut: debutFen, fin: finFen, maintenant: minutesDe(maintenant), blocs, phrase }}
      idee={idee}
      ideeEnregistree={ideeFaite}
      reglages={{ ouverts: reglages, dureeMin: f.dureeSeanceMin, objectif: memoire.objectif }}
      onIdee={(t) => { setIdee(t); setIdeeFaite(false); }}
      onValiderIdee={() => { if (idee.trim()) { createNote('personal', idee.trim()); setIdee(''); setIdeeFaite(true); } }}
      onLancer={() => garder({ ...memoire, focus: lancer(f, maintenant) })}
      onPause={() => garder({ ...memoire, focus: mettreEnPause(f, maintenant) })}
      onTerminer={terminer}
      onPasser={() => (f.phase === 'travail' ? setSaute((s) => (file.length ? (s + 1) % file.length : 0)) : garder({ ...memoire, focus: { ...phaseSuivante({ ...f, ecouleMs: dureeDeLaPhaseMs(f) }).focus } }))}
      onQuitter={() => { garder({ ...memoire, focus: abandonner(f) }); navigate('/'); }}
      onReglages={setReglages}
      onDuree={(d) => garder({ ...memoire, focus: choisirLaDuree(f, d) })}
      onObjectif={(n) => garder({ ...memoire, objectif: n })}
    />
  );
}

export default FocusRefonte;
