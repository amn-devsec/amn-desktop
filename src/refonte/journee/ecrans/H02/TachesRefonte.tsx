import React, { useMemo, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { usePageCoquille } from '../../../coquille/page';

import { AXES_DE_CASE, type CaseDeMatrice, type analyserLaSaisie } from '../../matrice';
import { PALIERS_DE_SERIE } from '../../serie';
import { useMots } from './textes';
import { VueTaches, type Perimetre, type TacheCarte } from './VueTaches';

interface TacheReelle {
  title: string; detail?: string; assigneeEmail: string; status: 'todo' | 'doing' | 'done'; clientId?: number | null; siteId?: string | null;
  createdAt: string; updatedAt?: string; priority?: 'low' | 'normal' | 'high';
}
type Choix = Record<string, { urgent: boolean; important: boolean }>;

const FIN_DE_JOURNEE = '18 h';
const prenomDe = (e: string) => (e ? e.split('@')[0].replace(/^./, (c) => c.toUpperCase()) : '—');
const initiale = (e: string) => prenomDe(e)[0] ?? '·';

/**
 * H02 · TÂCHES — branché sur les tâches du dépôt (`tasks`). Le dépôt n'a ni échéance, ni urgence, ni importance : « urgente » =
 * priorité haute ; « importante » = liée à un client ou à un site ; sans échéance (« sans date »). La case choisie à la main
 * (glisser, touches 1 à 4) vit dans le stockage local du poste (réglage de la personne), pas dans la tâche : aucune collection ni
 * champ nouveau (§1.27). « Fait aujourd'hui » : tâches cochées aujourd'hui (`updatedAt`). La série vient de `useAujourdhui` (règle
 * unique, §1.36). Absents : échéances et étiquettes (« non disponible »), temps libre de la semaine (H01 en agenda), proposition de
 * confier (pas de charge de l'équipe) : pas de pied « Planifier », pas de suggestion.
 */
export function TachesRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const { user } = useAuth();
  const { upsert } = useSync();
  const aujourdhui = useAujourdhui();
  const brutes = useCollection<TacheReelle & { id: string }>('tasks');
  const email = (user?.email ?? '').toLowerCase();
  const cleChoix = `amn.taches.cases.${email || 'anonyme'}`;
  const [perimetre, setPerimetre] = useState<Perimetre>('moi');
  const [vue, setVue] = useState<'matrice' | 'liste'>(() => {
    try { return window.localStorage.getItem(`amn.taches.vue.${email}`) === 'liste' ? 'liste' : 'matrice'; } catch { return 'matrice'; }
  });
  const [choix, setChoix] = useState<Choix>(() => {
    try { return JSON.parse(window.localStorage.getItem(cleChoix) ?? '{}') as Choix; } catch { return {}; }
  });
  const [retouche, setRetouche] = useState<{ id: string; avant: Choix[string] | null } | null>(null);
  const jour = aujourdhui.jour;
  usePageCoquille({ famille: 'jour', sousPage: 'tasks', miettes: [{ libelle: tm('titre') }] });

  const memoriser = (c: Choix) => { setChoix(c); try { window.localStorage.setItem(cleChoix, JSON.stringify(c)); } catch { /* local seulement */ } };
  const carte = (t: TacheReelle & { id: string }): TacheCarte => ({
    id: t.id, titre: t.title, echeance: null, urgente: t.priority === 'high', importante: Boolean(t.clientId || t.siteId), choix: choix[t.id] ?? null,
    creeLe: t.createdAt, faite: t.status === 'done',
    personne: { initiale: initiale(t.assigneeEmail), nom: prenomDe(t.assigneeEmail) }, etiquettes: [],
    faiteA: t.status === 'done' && t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }) : null,
  });
  const modele = useMemo(() => {
    const moi = brutes.filter((t) => (t.assigneeEmail || '').toLowerCase() === email);
    const portee = perimetre === 'equipe' ? brutes : moi;
    const ouvertes = portee.filter((t) => t.status !== 'done').map(carte);
    const faites = brutes.filter((t) => t.status === 'done' && (t.updatedAt ?? '').slice(0, 10) === jour && ((t.assigneeEmail || '').toLowerCase() === email || perimetre === 'equipe')).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')).map(carte);
    return { ouvertes, faites, compteurs: { moi: moi.filter((t) => t.status !== 'done').length, equipe: brutes.filter((t) => t.status !== 'done').length } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brutes, perimetre, email, jour, choix]);

  const deplacer = (id: string, vers: CaseDeMatrice) => {
    const actuel = modele.ouvertes.find((t) => t.id === id);
    setRetouche({ id, avant: choix[id] ?? null });
    memoriser({ ...choix, [id]: AXES_DE_CASE[vers] });
    void actuel;
    window.setTimeout(() => setRetouche((r) => (r?.id === id ? null : r)), 5000);
  };
  const cocher = (id: string) => {
    const t = brutes.find((x) => x.id === id);
    if (!t) return;
    const { id: _id, ...donnees } = t as typeof t & { id: string };
    void _id;
    void upsert('tasks', id, { ...donnees, status: t.status === 'done' ? 'todo' : 'done', updatedAt: new Date(maintenant).toISOString() });
  };
  const creer = (s: ReturnType<typeof analyserLaSaisie>) => {
    const id = `tache-${maintenant}`;
    void upsert('tasks', id, {
      title: s.titre, detail: '', assigneeEmail: user?.email ?? '', status: 'todo', siteId: null, clientId: null, createdAt: new Date(maintenant).toISOString(),
      ...(s.urgent ? { priority: 'high' } : {}),
    });
    if (s.important || s.urgent) memoriser({ ...choix, [id]: { urgent: s.urgent, important: s.important } });
  };

  const prochain = PALIERS_DE_SERIE.find((x) => x > aujourdhui.serie) ?? null;
  return (
    <VueTaches
      aujourdhui={jour}
      taches={perimetre === 'faites' ? [] : modele.ouvertes}
      faitesAujourdhui={modele.faites}
      compteurs={modele.compteurs}
      perimetre={perimetre}
      vue={vue}
      duJour={{ faites: aujourdhui.faites, total: aujourdhui.total }}
      serie={{ jours: aujourdhui.serie, prochainPalier: prochain, resteAvantPalier: prochain === null ? null : prochain - aujourdhui.serie }}
      finDeJournee={FIN_DE_JOURNEE}
      apresLaFin={new Date(maintenant).getHours() >= 18}
      retouche={retouche ? tm('tache.deplacee') : null}
      onPerimetre={setPerimetre}
      onVue={(v) => { setVue(v); try { window.localStorage.setItem(`amn.taches.vue.${email}`, v); } catch { /* local */ } }}
      onCocher={cocher}
      onDeplacer={deplacer}
      onCreer={creer}
      onDefaire={() => { if (!retouche) return; const c = { ...choix }; if (retouche.avant) c[retouche.id] = retouche.avant; else delete c[retouche.id]; memoriser(c); setRetouche(null); }}
    />
  );
}

export default TachesRefonte;
