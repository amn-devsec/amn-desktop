import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { ajouterJours, hhmmDe, jourParis, minutesDe, minutesParis, type Jour } from '../../commun';
import { calculerHeures, resumerTournee, type EtapeEntree } from '../../tournees';
import { traduire as traduireLogique } from '../../i18n';
import { pointsSchematiques } from './plan';
import { useMots } from './textes';
import { VueTournees, type EtapeVue } from './VueTournees';

interface ArretReel { id: string; label: string; address: string; doneAt: string | null; km?: number; dureeMin?: number }
interface TourneeReelle { title: string; day: string; stops: ArretReel[]; departAt?: string; createdAt: string; vehiculeId?: string }

const KMH_VILLE = 28;

/**
 * MR03 · TOURNÉES — branchée sur les tournées du dépôt (`deliveryRounds` : arrêts, kilomètres depuis l'arrêt précédent, durée
 * sur place, heure de départ). Plan SCHÉMATIQUE, sans service ni clé (STATUT §1.27 n° 5) : les repères sont posés par
 * `pointsSchematiques`, pas par un géocodage. Pas d'état « En route » ni d'heure fixée dans le dépôt : « Je suis arrivé »
 * pointe l'arrêt (même écriture que l'écran d'origine, `doneAt`). Le véhicule est celui de la tournée, jamais suivi.
 */
export function TourneesRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const tournees = useCollection<TourneeReelle>('deliveryRounds');
  const [periode, setPeriode] = useState<'aujourdhui' | 'demain' | 'semaine'>('aujourdhui');
  const [coches, setCoches] = useState<ReadonlySet<string>>(new Set());
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'rounds', miettes: [{ libelle: tm('titre') }] });

  const jour: Jour = periode === 'demain' ? ajouterJours(aujourdhui, 1) : aujourdhui;
  const tournee = tournees.find((t) => t.day === jour) ?? null;
  const modele = useMemo(() => {
    if (!tournee) return null;
    const depart = tournee.departAt || '08:00';
    const entrees: EtapeEntree[] = tournee.stops.map((s) => ({ id: s.id, lieu: s.label, trajetMin: Math.round(((s.km ?? 0) / KMH_VILLE) * 60), trajetKm: s.km ?? 0, dureeMin: s.dureeMin ?? 30, etat: s.doneAt ? 'Terminé' : 'À venir', arriveeReelle: s.doneAt ? hhmmDe(minutesParis(s.doneAt)) : null }));
    const calc = calculerHeures(depart, entrees);
    const resume = resumerTournee(calc, {});
    const etapes: EtapeVue[] = calc.map((c, i) => ({ ...c, adresse: tournee.stops[i].address }));
    const fin = calc.length ? minutesDe(calc[calc.length - 1].departEstime) + 0 : minutesDe(depart);
    return { etapes, resume, points: pointsSchematiques(tournee.stops.length), retour: hhmmDe(fin) };
  }, [tournee]);

  const arrive = (id: string) => {
    if (!tournee) return;
    const t = tournees.find((x) => x.day === jour);
    if (!t) return;
    const { id: tid, ...data } = t as typeof t & { id: string };
    void upsert('deliveryRounds', tid, { ...data, stops: t.stops.map((s) => (s.id === id ? { ...s, doneAt: new Date().toISOString() } : s)) });
  };

  const avant = [
    { id: 'materiel', libelle: traduireLogique(langue, 'tournee.avant.charger-materiel'), fait: coches.has('materiel') },
    { id: 'client', libelle: traduireLogique(langue, 'tournee.avant.prevenir-client'), fait: coches.has('client') },
    { id: 'itineraire', libelle: traduireLogique(langue, 'tournee.avant.verifier-itineraire'), fait: coches.has('itineraire') },
  ];
  const sousTitre = !tournee || !modele ? tm('vide.texte') : `${tournee.title} · ${modele.etapes.length} étapes, ${modele.resume.distanceKm} km`;
  return (
    <VueTournees
      sousTitre={sousTitre}
      dateLibelle={new Date(`${jour}T12:00:00Z`).toLocaleDateString(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).replace(/^./, (c) => c.toUpperCase())}
      vehicule=""
      resume={modele?.resume ?? { distanceKm: 0, routeMin: 0, surPlaceMin: 0, retardMin: 0, ton: 'vert' }}
      gain={null}
      etapes={modele?.etapes ?? []}
      points={modele?.points ?? []}
      conducteur=""
      enRouteDans={null}
      retourVers={modele?.retour ?? null}
      avantDepart={avant}
      periode={periode}
      onPeriode={setPeriode}
      onAjouter={() => navigate('/tournees?nouvelle=1')}
      onArrive={arrive}
      onCocher={(id) => setCoches((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
    />
  );
}

export default TourneesRefonte;
