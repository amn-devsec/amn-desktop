import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection } from '../../../../state/SyncContext';
import { useInvoices } from '../../../../state/useInvoices';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { usePageCoquille } from '../../../coquille/page';
import { jourDeParis } from '../../commun';
import { joursSansImpaye } from '../../defis';
import { BADGE_SERIE, MARQUES_TACHES, railDeCompteur } from '../../escalier';
import { journeeBouclee, prioritesDeLaCollection, serieDeLaJournee } from '../../serie';
import { useMots } from './textes';
import { VueSeries, type MedailleVue } from './VueSeries';

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const court = (j: string) => `${Number(j.slice(8)) === 1 ? '1er' : Number(j.slice(8))} ${MOIS[Number(j.slice(5, 7)) - 1]}`;

/**
 * L01 · SÉRIES ET JALONS — la règle UNIQUE de la série (`serieDeLaJournee` : clôture des priorités du jour, repos le week-end, une série
 * interrompue « reprend », le record reste, §1.5 et §1.10), lue sur les priorités du dépôt (`dailyPriorities`). Aucun chiffre ne classe
 * personne, aucune série n'est perdue, une médaille non obtenue est « à gagner ». Absents du dépôt : la boîte à zéro, les rituels du matin
 * (L03 n'a pas encore d'historique), les dates des paliers atteints, la médaille « Client 5 étoiles » et « Objectif du mois », le badge
 * « Équipe au complet » : « non disponible » ou « à gagner ». « Partager un succès » et « Régler mes objectifs » n'ont pas de service (inactifs).
 */
export function SeriesRefonte() {
  const { tm } = useMots();
  const { user } = useAuth();
  const navigate = useNavigate();
  const aujourdhui = useAujourdhui();
  const { invoices } = useInvoices();
  const taches = useCollection<{ title: string; assigneeEmail: string; status: string; createdAt: string; updatedAt?: string }>('tasks');
  const [demain, setDemain] = useState(false);
  const email = (user?.email ?? '').toLowerCase();
  const jour = aujourdhui.jour;
  usePageCoquille({ famille: 'jour', sousPage: 'series', miettes: [{ libelle: tm('titre') }] });

  const m = useMemo(() => {
    const miennes = aujourdhui.acces.priorites.filter((p) => (p.email ?? '').toLowerCase() === email);
    const journees = miennes.map((p) => prioritesDeLaCollection(p, jourDeParis));
    const s = serieDeLaJournee(journees, jour);
    const premiere = journees.filter((j) => journeeBouclee(j)).map((j) => j.jour).sort()[0] ?? null;
    const duJour = miennes.find((p) => p.day === jour);
    const gestes = (duJour?.items ?? []).map((i) => ({ id: i.id, titre: i.label, detail: i.doneAt ? tm('gestes.fait') : '', fait: Boolean(i.doneAt) }));
    const faites = taches.filter((t) => (t.assigneeEmail ?? '').toLowerCase() === email && t.status === 'done').length;
    const premiereFacture = invoices.filter((f) => f.issuedAt).map((f) => f.issuedAt.slice(0, 10)).sort()[0] ?? null;
    const medailles: MedailleVue[] = [
      { id: 'facture', nom: tm('badge.premiereFacture'), quand: premiereFacture ? court(premiereFacture) : null, icone: 'trophee' },
      { id: 'boite', nom: tm('badge.boite'), quand: null, icone: 'enveloppe' },
      { id: 'client5', nom: tm('badge.client5'), quand: null, icone: 'etoile' },
      { id: 'objectif', nom: tm('badge.objectif'), quand: null, icone: 'cible' },
      { id: 'serie7', nom: tm('badge.serie7'), quand: s.record >= BADGE_SERIE ? '✓' : null, icone: 'eclair' },
    ];
    const reste = gestes.filter((g) => !g.fait);
    return {
      s, gestes, medailles, faites, depart: premiere ? court(premiere) : null,
      facile: reste.length > 0 ? { titre: reste[reste.length - 1].titre } : null,
      sansImpaye: invoices.length === 0 ? null : joursSansImpaye(invoices.map((f) => ({ status: f.status, dueAt: f.dueAt || jour, paidAt: f.paidAt || '' })), jour),
    };
  }, [aujourdhui.acces.priorites, taches, invoices, jour, email, tm]);

  return (
    <VueSeries
      serie={{ jours: m.s.serie, record: m.s.record, prochainPalier: m.s.prochainPalier, joursAvantPalier: m.s.joursAvantPalier, boucleeAujourdhui: m.s.boucleeAujourdhui, etat: m.s.etat, depart: m.depart, atteints: {} }}
      gestes={m.gestes}
      rails={[
        { id: 'taches', sous: tm('rail.taches.cumul'), rail: railDeCompteur(m.faites, MARQUES_TACHES) },
        { id: 'boite', sous: tm('rail.boite.sous'), rail: null },
        { id: 'rituels', sous: tm('rail.rituels.sous'), rail: null },
      ]}
      facile={demain ? null : m.facile}
      medailles={m.medailles}
      equipe={{ complet: null, zeroImpaye: m.sansImpaye === null ? null : { jours: Math.min(30, m.sansImpaye) }, incident: false }}
      onFaire={() => navigate('/priorites')}
      onDemain={() => setDemain(true)}
    />
  );
}

export default SeriesRefonte;
