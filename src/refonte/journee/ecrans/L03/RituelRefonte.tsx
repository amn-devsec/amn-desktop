import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { useMembers } from '../../../../state/useMembers';
import { isOverdue, netDueCents, useInvoices } from '../../../../state/useInvoices';
import { formaterEuro } from '../../../../socle/formats';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { usePageCoquille } from '../../../coquille/page';
import { jourDeParis } from '../../commun';
import {
  DUREE_PAR_DEFAUT_MIN, FENETRE_PAR_DEFAUT, PAUSE_PAR_DEFAUT, brouillonDuJour, choisir as choisirMt, choixValides, continuer, deplacer, echeanceEnTexte, equilibre, etapesVisibles, etiquetteDe,
  journeeQuiSeDessine, minutesEstimees, moinsCharge, parcoursInitial, passer as passerMt, preselection, reglagesValides, reprise as repriseMt, retirer as retirerMt, retour as retourMt, revoir as revoirMt,
  tempsLibre, trierLesCandidates, type Brouillon, type Candidate, type EtapeDuMatin, type EvenementDuJour, type ReglagesDuRituel,
} from '../../matin';
import { useMots } from './textes';
import { VueRituel, type AutreVue, type ChoixVue, type ResumeDEtape } from './VueRituel';

interface TacheReelle { title: string; assigneeEmail: string; status: 'todo' | 'doing' | 'done'; createdAt: string; priority?: 'low' | 'normal' | 'high'; clientId?: number | null }
type Memoire = Brouillon & { amorce: boolean };

const FORMAT_DATE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' });
const FORMAT_JOUR = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long' });
const FORMAT_HEURE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const minutesDe = (ms: number): number => { const [h, m] = FORMAT_HEURE.format(new Date(ms)).split(':').map(Number); return h * 60 + m; };
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const prenomDe = (e: string) => (e ? e.split('@')[0].replace(/^./, (c) => c.toUpperCase()) : '—');
const lire = <T,>(cle: string): T | null => { try { return JSON.parse(window.localStorage.getItem(cle) ?? 'null') as T | null; } catch { return null; } };
const ecrire = (cle: string, v: unknown) => { try { window.localStorage.setItem(cle, JSON.stringify(v)); } catch { /* local seulement */ } };
const slug = (e: string) => e.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * L03 · RITUEL DU MATIN — les quatre étapes (`matin.ts`, tout le calcul y est testé), sur les données du dépôt. Le brouillon (étape, choix) et l'heure du
 * rituel vivent dans le stockage local du poste (§1.27 : aucune collection nouvelle) ; « C'est parti » écrit les priorités du jour dans `dailyPriorities`
 * (une par personne et par jour, au plus trois), que lisent L01, L02 et l'accueil. « Confier » affecte la tâche (`tasks.assigneeEmail`). Absents du dépôt, dits
 * « indisponible » ou calculés par défaut : le relevé de nuit de La Garde, l'échéance, la catégorie et la durée d'une tâche (25 min par défaut ; la phrase
 * d'équilibre devient l'astuce), le droit « argent » (l'étape est toujours montrée), « Décaler à demain », le rappel par notification.
 */
export function RituelRefonte({ maintenant: maintenantInitial = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const aujourdhui = useAujourdhui();
  const { invoices } = useInvoices();
  const { membres } = useMembers();
  const taches = useCollection<TacheReelle & { id: string }>('tasks');
  const email = (user?.email ?? '').toLowerCase();
  const jour = aujourdhui.jour;
  const cle = `amn.matin.${slug(email) || 'anonyme'}`;
  const cleReglages = `${cle}.reglages`;
  const [maintenant] = useState(maintenantInitial);
  const nowMin = minutesDe(maintenant);
  const iso = new Date(maintenant).toISOString();
  usePageCoquille({ famille: 'jour', sousPage: 'rituel', miettes: [{ libelle: tm('titre') }] });

  const [memoire, setMemoire] = useState<Memoire>(() => ({ ...brouillonDuJour(lire<Memoire>(cle), jour, iso), amorce: lire<Memoire>(cle)?.jour === jour ? !!lire<Memoire>(cle)?.amorce : false }));
  const [reglages, setReglages] = useState<ReglagesDuRituel>(() => reglagesValides(lire<ReglagesDuRituel>(cleReglages)));
  const [reglagesOuverts, setReglagesOuverts] = useState(false);
  const [refus, setRefus] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [toast, setToast] = useState<{ prenom: string; tacheId: string; avant: string } | null>(null);
  const garder = useCallback((m: Memoire) => { setMemoire(m); ecrire(cle, m); }, [cle]);
  useEffect(() => { if (!refus) return undefined; const t = window.setTimeout(() => setRefus(false), 4000); return () => window.clearTimeout(t); }, [refus]);
  useEffect(() => { if (!toast) return undefined; const t = window.setTimeout(() => setToast(null), 30_000); return () => window.clearTimeout(t); }, [toast]);

  const etapes = useMemo(() => etapesVisibles({ argent: true }), []);
  const n = etapes.length;

  const candidates = useMemo<Candidate[]>(() => taches
    .filter((t) => (t.assigneeEmail ?? '').toLowerCase() === email && t.status !== 'done')
    .map((t) => ({ id: t.id, titre: t.title, urgente: t.priority === 'high', categorie: t.clientId ? tm('etiquette.client') : null, dureeMin: null, echeance: null, contexte: null, ordre: t.createdAt })), [taches, email, tm]);
  const parId = useMemo(() => new Map(candidates.map((c) => [c.id, c])), [candidates]);

  // La présélection d'Ajmani : une fois, quand les tâches sont là et que la personne n'a encore rien choisi ce jour-là.
  useEffect(() => {
    if (memoire.amorce || candidates.length === 0) return;
    garder({ ...memoire, amorce: true, choix: preselection(candidates, jour).choisies.map((c) => c.id), modifieA: iso });
  }, [memoire, candidates, jour, iso, garder]);

  const choix = choixValides(memoire.choix, candidates);
  const triees = useMemo(() => trierLesCandidates(candidates, jour).filter((c) => !choix.includes(c.id)), [candidates, jour, choix]);
  const autres = triees.slice(0, 3);
  const charges = useMemo(() => membres.map((m) => ({ email: m.email, prenom: prenomDe(m.email), charge: taches.filter((t) => (t.assigneeEmail ?? '').toLowerCase() === m.email.toLowerCase() && t.status !== 'done').length })), [membres, taches]);
  const aConfier = moinsCharge(charges, email);

  const rdvs = useMemo(() => aujourdhui.acces.appointments.filter((a) => a.status !== 'cancelled' && jourDeParis(a.startAt) === jour).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)), [aujourdhui.acces.appointments, jour]);
  const evenements: EvenementDuJour[] = rdvs.map((a) => { const d = minutesDe(Date.parse(a.startAt)); return { id: a.id, debut: d, fin: d + Math.max(15, a.durationMin ?? 30), label: a.title }; });

  const resumes = useMemo<Partial<Record<EtapeDuMatin, ResumeDEtape>>>(() => {
    const dues = invoices.filter((f) => f.status === 'issued' && f.kind !== 'creditNote' && netDueCents(f, invoices) > 0);
    const aEnc = dues.reduce((s, f) => s + netDueCents(f, invoices), 0);
    const retard = dues.filter((f) => isOverdue(f, jour, invoices)).reduce((s, f) => s + netDueCents(f, invoices), 0);
    const euros = (c: number) => formaterEuro(c / 100);
    const argent = aEnc === 0 && retard === 0 ? tm('argent.rien') : [tm('argent.encaisser', { m: euros(aEnc) }), retard > 0 ? tm('argent.retard', { m: euros(retard) }) : null].filter(Boolean).join(' · ');
    const aff = rdvs.slice(0, 3).map((a) => `${a.title} ${hhmm(minutesDe(Date.parse(a.startAt)))}`);
    return {
      nuit: { resume: tm('indisponible'), details: [tm('nuit.source')], indisponible: true },
      argent: { resume: argent, details: [] },
      agenda: rdvs.length === 0 ? { resume: tm('agenda.rien'), details: [] } : { resume: [tm(rdvs.length === 1 ? 'agenda.un' : 'agenda.n', { n: rdvs.length }), ...aff].join(' · '), details: aff },
    };
  }, [invoices, jour, rdvs, tm]);

  const parc = memoire.parcours;
  const iAgenda = etapes.indexOf('agenda');
  const iChoses = etapes.indexOf('choses');
  const agendaVu = parc.ouverte >= iAgenda || parc.faites.includes(iAgenda) || parc.termine;
  const prioVues = parc.ouverte === iChoses || parc.termine;
  const priorites = choix.map((id, i) => ({ id, rang: i + 1, label: parId.get(id)?.titre ?? '', dureeMin: parId.get(id)?.dureeMin ?? DUREE_PAR_DEFAUT_MIN, avant: null }));
  const plan = journeeQuiSeDessine(FENETRE_PAR_DEFAUT, agendaVu ? evenements : [], prioVues ? priorites : [], PAUSE_PAR_DEFAUT, nowMin);
  const eq = equilibre(choix.map((id) => ({ dureeMin: parId.get(id)?.dureeMin ?? null })), tempsLibre(FENETRE_PAR_DEFAUT, evenements, PAUSE_PAR_DEFAUT));

  const tEcheance = (c: Candidate) => ({ ...echeanceEnTexte(c.echeance, jour) });
  const choisis: ChoixVue[] = choix.map((id, i) => { const c = parId.get(id) as Candidate; const e = etiquetteDe(c); return { id, rang: i + 1, urgent: e?.type === 'urgent', categorie: e?.type === 'categorie' ? e.texte : null, titre: c.titre, dureeMin: c.dureeMin, echeance: tEcheance(c), confier: aConfier?.prenom ?? null }; });
  const autresVue: AutreVue[] = autres.map((c, i) => ({ id: c.id, titre: c.titre, contexte: c.contexte, categorie: c.categorie, echeance: tEcheance(c), confier: i === 0 ? aConfier?.prenom ?? null : null }));

  const maj = (p: Partial<Memoire>) => garder({ ...memoire, ...p, modifieA: iso });
  const sauverPriorites = () => {
    const existant = aujourdhui.acces.priorites.find((d) => d.day === jour && (d.email ?? '').toLowerCase() === email);
    const id = existant?.id ?? `prio-${slug(email)}-${jour}`;
    const items = choix.map((tid) => ({ id: tid, label: parId.get(tid)?.titre ?? '', doneAt: existant?.items.find((i) => i.id === tid)?.doneAt ?? null }));
    void upsert('dailyPriorities', id, { email, day: jour, items, updatedAt: iso });
  };
  const confierMaintenant = () => {
    if (!confirmation || !aConfier) return;
    const t = taches.find((x) => x.id === confirmation);
    if (t) { const { id, ...d } = t; void upsert('tasks', id, { ...d, assigneeEmail: aConfier.email, updatedAt: iso }); setToast({ prenom: aConfier.prenom, tacheId: id, avant: t.assigneeEmail }); }
    maj({ choix: retirerMt(choix, confirmation) });
    setConfirmation(null);
  };
  const annulerConfier = () => {
    if (!toast) return;
    const t = taches.find((x) => x.id === toast.tacheId);
    if (t) { const { id, ...d } = t; void upsert('tasks', id, { ...d, assigneeEmail: toast.avant, updatedAt: iso }); }
    setToast(null);
  };
  const date = FORMAT_DATE.format(new Date(maintenant));

  return (
    <>
      <VueRituel
        prenom={prenomDe(user?.email ?? '')}
        dateTexte={`${date.charAt(0).toUpperCase()}${date.slice(1)}`}
        jourNom={FORMAT_JOUR.format(new Date(maintenant))}
        soir={nowMin >= 18 * 60}
        parcours={parc}
        etapes={etapes}
        resumes={resumes}
        minutesEstimees={minutesEstimees(parc, n)}
        reprise={repriseMt(memoire, n)}
        choisis={choisis}
        autres={autresVue}
        refus={refus}
        resteCandidates={Math.max(0, triees.length - 3)}
        aucuneTache={candidates.length === 0}
        erreur={false}
        jour={{ debut: FENETRE_PAR_DEFAUT.debut, fin: FENETRE_PAR_DEFAUT.fin, maintenant: nowMin, blocs: plan.blocs, libreMin: eq.libreMin, totalMin: eq.totalMin, ratio: eq.ratio, phrase: choix.length === 0 ? 'sans' : eq.phrase, finPrevue: plan.finPrevue === null ? null : hhmm(plan.finPrevue) }}
        reglages={{ ouverts: reglagesOuverts, heure: reglages.heure, jours: reglages.jours }}
        confirmation={confirmation ? { titre: parId.get(confirmation)?.titre ?? '', prenom: aConfier?.prenom ?? '' } : null}
        termine={parc.termine ? { titres: choix.map((id) => parId.get(id)?.titre ?? '') } : null}
        onContinuer={() => maj({ parcours: continuer(parc, n) })}
        onRetour={() => maj({ parcours: retourMt(parc) })}
        onPasser={() => { if (parc.ouverte === n - 1) { maj({ parcours: { ...passerMt(parc, n), termine: true }, choix: [] }); } else maj({ parcours: passerMt(parc, n) }); }}
        onRevoir={(i) => maj({ parcours: revoirMt(parc, i) })}
        onChoisir={(id) => { const r = choisirMt(choix, id); if (r.refuse) setRefus(true); else maj({ choix: [...r.choix] }); }}
        onRetirer={(id) => maj({ choix: [...retirerMt(choix, id)] })}
        onDeplacer={(de, vers) => maj({ choix: [...deplacer(choix, de, vers)] })}
        onConfier={(id) => setConfirmation(id)}
        onConfirmerConfier={confierMaintenant}
        onAnnulerConfier={() => setConfirmation(null)}
        onCommencer={() => { sauverPriorites(); maj({ parcours: { ...continuer(parc, n), termine: true } }); }}
        onRecommencer={() => garder({ ...brouillonDuJour(null, jour, iso), parcours: parcoursInitial(), amorce: true, choix: [...preselection(candidates, jour).choisies.map((c) => c.id)] })}
        onFocus={() => navigate('/focus')}
        onJournee={() => navigate('/')}
        onModifier={() => maj({ parcours: { ouverte: n - 1, faites: Array.from({ length: n - 1 }, (_, i) => i), termine: false } })}
        onNouvelleTache={() => navigate('/tasks')}
        onToutes={() => navigate('/tasks')}
        onReessayer={() => undefined}
        onReglages={setReglagesOuverts}
        onHeure={(h) => { const r = reglagesValides({ ...reglages, heure: h }); setReglages(r); ecrire(cleReglages, r); }}
        onJours={(j) => { const r = reglagesValides({ ...reglages, jours: j }); setReglages(r); ecrire(cleReglages, r); }}
      />
      {toast && <div className="jr-toast" role="status">{tm('confie.fait', { prenom: toast.prenom })}<button type="button" onClick={annulerConfier}>{tm('confie.annuler')}</button></div>}
    </>
  );
}

export default RituelRefonte;
