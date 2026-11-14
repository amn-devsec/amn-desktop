import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection } from '../../../../state/SyncContext';
import { isOverdue, netDueCents, invoiceTotals, useInvoices } from '../../../../state/useInvoices';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { ajouterJours, jourDeParis } from '../../commun';
import { PALIERS_DE_SERIE } from '../../serie';
import { VueAccueil, type CarteAVenir, type FaiteDeFrise, type RdvDeFrise } from './VueAccueil';

interface TacheReelle { title: string; assigneeEmail: string; status: 'todo' | 'doing' | 'done'; createdAt: string; updatedAt?: string; priority?: 'low' | 'normal' | 'high'; clientId?: number | null }

const FORMAT_DATE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' });
const FORMAT_HEURE = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const minutesDe = (ms: number): number => { const [h, m] = FORMAT_HEURE.format(new Date(ms)).split(':').map(Number); return h * 60 + m; };
const prenomDe = (e: string) => (e ? e.split('@')[0].replace(/^./, (c) => c.toUpperCase()) : '—');

/**
 * N01 · ACCUEIL — par la couture `@edition/accueils` (le code `42k`), il LIT `useAujourdhui` (le « x sur y faites » et la série sont ceux de la
 * barre latérale, calculés une fois, §1.10 n° 3) et ne recalcule rien d'autre que ce qui lui est propre. Sources : tâches (`tasks` : l'urgente
 * est la plus récente de priorité haute), rendez-vous du jour, factures (encaissé du jour, à encaisser, en retard ; courbe des 8 derniers jours).
 * Absents du dépôt : messages à traiter, heure d'échéance d'une tâche (les tâches à venir n'ont pas de losange sur la frise), rondes de La Garde,
 * « lu par » d'un ticket, point d'équipe : champs « non disponible » ou cachés (§1.10 règle A1 : pas de faux chiffre).
 */
export function AccueilJournee({ maintenant = Date.now() }: { maintenant?: number }) {

  const { user } = useAuth();
  const navigate = useNavigate();
  const aujourdhui = useAujourdhui();
  const { invoices } = useInvoices();
  const taches = useCollection<TacheReelle & { id: string }>('tasks');
  const [masquee, setMasquee] = useState(false);
  const jour = aujourdhui.jour;
  const nowMin = minutesDe(maintenant);
  const email = (user?.email ?? '').toLowerCase();

  const modele = useMemo(() => {
    const rdv = aujourdhui.acces.appointments.filter((a) => a.status !== 'cancelled' && jourDeParis(a.startAt) === jour).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
    const prochain = rdv.find((a) => Date.parse(a.startAt) > maintenant);
    const frise: RdvDeFrise[] = rdv.map((a) => {
      const debut = minutesDe(Date.parse(a.startAt));
      const fin = debut + Math.max(15, a.durationMin ?? 30);
      const restant = Math.max(0, Math.round((Date.parse(a.startAt) - maintenant) / 60000));
      return { id: a.id, debut, fin, titre: a.title, detail: `${String(Math.floor(debut / 60))}:${String(debut % 60).padStart(2, '0')}${a === prochain ? ` · dans ${restant} min` : fin <= nowMin ? ' · fait' : ''}`, ton: a.clientId ? 'contacts' : 'jour', passe: fin <= nowMin, suivant: a === prochain };
    });
    const mesTaches = taches.filter((t) => (t.assigneeEmail || '').toLowerCase() === email);
    const faites: FaiteDeFrise[] = mesTaches.filter((t) => t.status === 'done' && (t.updatedAt ?? '').slice(0, 10) === jour).sort((a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '')).map((t) => ({ id: t.id, titre: t.title, minute: minutesDe(Date.parse(t.updatedAt ?? '')) }));
    const ouvertes = mesTaches.filter((t) => t.status !== 'done').sort((a, b) => Number(b.priority === 'high') - Number(a.priority === 'high') || a.createdAt.localeCompare(b.createdAt));
    const avenir: CarteAVenir[] = ouvertes.slice(0, 3).map((t) => ({ id: t.id, minute: -1, titre: t.title, heure: '', delai: '', urgent: t.priority === 'high', initiale: prenomDe(t.assigneeEmail)[0] ?? '·' }));
    const urgente = taches.filter((t) => t.status !== 'done' && t.priority === 'high').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
    const hier = ajouterJours(jour, -1);
    const dernierHier = mesTaches.filter((t) => t.status === 'done' && (t.updatedAt ?? '').slice(0, 10) === hier).map((t) => t.updatedAt ?? '').sort().pop();
    const payeesAuj = invoices.filter((f) => f.status === 'paid' && f.paidAt.slice(0, 10) === jour && f.kind !== 'creditNote');
    let cumul = 0;
    const courbe = Array.from({ length: 8 }, (_, i) => {
      const j = ajouterJours(jour, i - 7);
      cumul += invoices.filter((f) => f.status === 'paid' && f.paidAt.slice(0, 10) === j && f.kind !== 'creditNote').reduce((s, f) => s + invoiceTotals(f).grossCents, 0);
      return cumul;
    });
    const dues = invoices.filter((f) => f.status === 'issued' && f.kind !== 'creditNote' && netDueCents(f, invoices) > 0);
    const enRetard = dues.filter((f) => isOverdue(f, jour, invoices));
    const clientsRetard = [...new Set(enRetard.map((f) => f.billTo.name))];
    return {
      rdv, frise, faites, avenir, urgente, hier: dernierHier ? new Date(dernierHier).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }) : null,
      argent: invoices.length === 0 ? null : { cents: payeesAuj.reduce((s, f) => s + invoiceTotals(f).grossCents, 0), courbe, aEncaisser: dues.reduce((s, f) => s + netDueCents(f, invoices), 0), enRetard: enRetard.reduce((s, f) => s + netDueCents(f, invoices), 0) },
      clientsRetard,
      nbRdvAVenir: rdv.filter((a) => Date.parse(a.startAt) > maintenant).length,
    };
  }, [aujourdhui.acces.appointments, taches, invoices, jour, maintenant, nowMin, email]);

  const palier = PALIERS_DE_SERIE.find((x) => x > aujourdhui.serie) ?? null;
  const date = FORMAT_DATE.format(new Date(maintenant));
  const heure = FORMAT_HEURE.format(new Date(maintenant));
  const suggestion = !masquee && modele.clientsRetard.length >= 3 ? { n: modele.clientsRetard.length, noms: `${modele.clientsRetard.slice(0, 2).join(', ')} et ${modele.clientsRetard[2]}` } : null;

  return (
    <VueAccueil
      prenom={prenomDe(user?.email ?? '')}
      dateEtHeure={`${date.charAt(0).toUpperCase()}${date.slice(1)} · ${heure}`}
      soir={nowMin >= 18 * 60}
      minute={nowMin}
      anneau={{ faites: aujourdhui.faites, total: aujourdhui.total }}
      hier={modele.hier}
      serie={{ jours: aujourdhui.serie, palier }}
      messages={null}
      nbRdv={modele.nbRdvAVenir}
      urgent={modele.urgente ? { titre: modele.urgente.title, recu: modele.urgente.createdAt.slice(0, 10) === jour ? new Date(modele.urgente.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }) : null, initiale: prenomDe(modele.urgente.assigneeEmail)[0] ?? '·' } : null}
      frise={{ rdv: modele.frise, rondes: [], faites: modele.faites, avenir: modele.avenir, restantes: Math.max(0, aujourdhui.total - aujourdhui.faites) }}
      argent={modele.argent ? { ...modele.argent, quand: nowMin < 12 * 60 ? 'matin' : 'jour' } : null}
      garde={{ enOrdre: true }}
      suggestion={suggestion}
      onNouvelle={() => navigate('/tasks')}
      onOuvrirUrgent={() => navigate('/tasks')}
      onCalendrier={() => navigate('/agenda')}
      onRegrouper={() => navigate('/relances')}
      onPlusTard={() => setMasquee(true)}
    />
  );
}

export default AccueilJournee;
