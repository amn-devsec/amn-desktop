import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { useMembers } from '../../../../state/useMembers';
import { useInvoices } from '../../../../state/useInvoices';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { usePageCoquille } from '../../../coquille/page';
import { ajouterJours } from '../../commun';
import { joursSansImpaye } from '../../defis';
import { progressionDuCompteur, proposerLaFete, vendrediDeFete } from '../../relais';
import { useMots } from './textes';
import { VueDefis, type EnCoursVue } from './VueDefis';

const FORMAT_LONG = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' });
const FORMAT_HEURE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' });
const slug = (e: string) => e.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const lire = <T,>(cle: string, defaut: T): T => { try { const v = JSON.parse(window.localStorage.getItem(cle) ?? 'null') as T | null; return v ?? defaut; } catch { return defaut; } };
const ecrire = (cle: string, v: unknown) => { try { window.localStorage.setItem(cle, JSON.stringify(v)); } catch { /* local seulement */ } };

/** L'instant (ISO) où il est `heure` h à Paris le `jour` : on part de l'heure UTC et on corrige du décalage de Paris (heure d'été ou d'hiver). */
function instantParis(jour: string, heure: number): string {
  const base = Date.parse(`${jour}T${String(heure).padStart(2, '0')}:00:00Z`);
  const lu = Number(FORMAT_HEURE.format(new Date(base)));
  return new Date(base - ((lu - heure + 24) % 24) * 3_600_000).toISOString();
}

const CIBLE_ZERO_IMPAYE = 30;

/**
 * L07 · DÉFIS D'ÉQUIPE — sur les données du dépôt. Rien n'y est classé ni chiffré par personne (§1.10). L'application ne stocke pas encore de défi (ni
 * d'engagement, ni de relais de messages : §1.27, pas de collection nouvelle sans l'accord de Harun) : le défi de la semaine, la frise et les célébrations
 * sont donc VIDES (états de la fiche), sans faux chiffre. Ce qui existe vraiment : « Zéro impayé » (les factures : `joursSansImpaye`, même compteur que
 * le badge d'équipe de L01), la suggestion « Fêtez ensemble » qui en découle (« Réserver » crée le rendez-vous provisoire, sous réserve, et la tâche
 * « Choisir et réserver le restaurant » ; aucune réservation externe), et « Proposer un défi » (gardée sur ce poste en attendant l'accord de deux membres).
 */
export function DefisRefonte() {
  const { tm } = useMots();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const aujourdhui = useAujourdhui();
  const { invoices } = useInvoices();
  const { membres } = useMembers();
  const email = (user?.email ?? '').toLowerCase();
  const cle = `amn.defis.${slug(email) || 'anonyme'}`;
  const jour = aujourdhui.jour;
  usePageCoquille({ famille: 'jour', sousPage: 'defis', miettes: [{ libelle: tm('titre') }] });
  const [ouverte, setOuverte] = useState(false);
  const [propositions, setPropositions] = useState<string[]>(() => lire<string[]>(`${cle}.propositions`, []));
  const [masques, setMasques] = useState<string[]>(() => lire<string[]>(`${cle}.fete`, []));
  useEffect(() => { ecrire(`${cle}.propositions`, propositions); }, [cle, propositions]);
  useEffect(() => { ecrire(`${cle}.fete`, masques); }, [cle, masques]);
  useCollection('appointments');

  const modele = useMemo(() => {
    if (invoices.length === 0) return null;
    const jours = joursSansImpaye(invoices.filter((f) => f.kind !== 'creditNote').map((f) => ({ status: f.status, dueAt: (f.dueAt ?? '').slice(0, 10), paidAt: (f.paidAt ?? '').slice(0, 10) })), jour);
    const p = progressionDuCompteur(Math.min(jours, CIBLE_ZERO_IMPAYE), CIBLE_ZERO_IMPAYE);
    return { jours: Math.min(jours, CIBLE_ZERO_IMPAYE), ...p, finLe: ajouterJours(jour, p.encore) };
  }, [invoices, jour]);

  const enCours: EnCoursVue[] = modele ? [{ id: 'zero-impaye', titre: tm('aussi.zero'), sous: modele.encore > 0 ? tm(modele.encore === 1 ? 'aussi.jour' : 'aussi.jours', { n: modele.encore }) : tm('aussi.tenu'), valeur: tm('aussi.valeur.j', { a: modele.jours, c: CIBLE_ZERO_IMPAYE }), pct: modele.pct, ton: 'vert', icone: 'euro' }] : [];
  const fete = modele && proposerLaFete({ principal: null, longs: [{ pct: modele.pct, finConnue: true }] }) ? vendrediDeFete(modele.finLe) : null;
  const feteVisible = fete !== null && !masques.includes(fete);

  const reserver = () => {
    if (!fete) return;
    const maintenant = new Date().toISOString();
    void upsert('appointments', `defi-fete-${fete}`, { title: tm('fete.evenement'), startAt: instantParis(fete, 12), durationMin: 90, clientId: null, clientName: '', location: '', notes: tm('fete.sous.reserve'), reminderMin: 0, status: 'scheduled', createdAt: maintenant, updatedAt: maintenant });
    void upsert('tasks', `defi-fete-resa-${fete}`, { title: tm('fete.tache'), detail: '', assigneeEmail: email, status: 'todo', siteId: null, clientId: null, createdAt: maintenant });
    setMasques([...masques, fete]);
  };
  const dateFete = fete ? FORMAT_LONG.format(new Date(`${fete}T12:00:00Z`)) : '';

  return (
    <VueDefis
      hero={null}
      enCours={enCours}
      participants={membres.map((m) => (m.email.split('@')[0] ?? '').replace(/^./, (c) => c.toUpperCase()))}
      passes={[]}
      resumePasses={null}
      celebrations={[]}
      fete={feteVisible ? dateFete : null}
      seul={membres.length <= 1}
      erreur={false}
      propositions={propositions}
      proposition={{ ouverte }}
      onProposer={() => setOuverte(true)}
      onFermerProposition={() => setOuverte(false)}
      onEnvoyerProposition={(p) => { setPropositions([...propositions, p.titre]); setOuverte(false); }}
      onHistorique={() => undefined}
      onVoirAttente={() => navigate('/team')}
      onReserver={reserver}
      onNon={() => fete && setMasques([...masques, fete])}
      onInviter={() => navigate('/membres')}
      onReessayer={() => undefined}
      onIdees={() => setOuverte(true)}
      onPartager={() => navigate('/series')}
    />
  );
}

export default DefisRefonte;
