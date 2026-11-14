import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../state/SyncContext';
import { jourDeParis } from '../commun';
import type { ColonneDeTicket } from '../cockpit';
import { modeleMissions, type TicketMission } from './modele';
import { VueMissions, type ActionsMissions } from './VueMissions';

/**
 * « MISSIONS ET TICKETS » (H03) — la page branchée : écran neuf `/missions` (registre, `nouveau`) ; aucun écran d'origine.
 *
 * Les tickets de l'application sont ceux de l'APRÈS-VENTE (`/sav`) : sujet, client, qui l'a pris, ouvert ou résolu. Ils n'ont ni urgence, ni
 * sous-tâches, ni échéance, ni colonne « En revue », ni partage avec le client : ces champs restent vides au lieu d'être inventés. Le tableau
 * est donc en LECTURE : un ticket se déplace dans l'après-vente (la bande le dit, avec un lien). Les minuteurs se calculent sur la date
 * d'ouverture (prise en charge tant que personne n'a pris le ticket) ; sans heure de première prise, le délai moyen n'est pas affiché.
 */
interface TicketSav { id: string; client: string; subject: string; status: 'ouvert' | 'enCours' | 'resolu'; openedAt: string; takenBy: string; resolvedAt: string | null; reason?: string }

function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

const nomDe = (email: string): string => { const p = email.split('@')[0] ?? ''; return p ? p.charAt(0).toUpperCase() + p.slice(1) : ''; };

export function ticketDeLApp(t: TicketSav): TicketMission {
  const colonne: ColonneDeTicket = t.resolvedAt || t.status === 'resolu' ? 'termine' : t.status === 'enCours' || t.takenBy ? 'en-cours' : 'a-faire';
  return {
    id: `S-${t.id.slice(-3).toUpperCase()}`,
    titre: t.subject,
    colonne,
    urgent: false,
    client: t.client || null,
    etiquette: t.reason ?? '',
    sousTaches: null,
    assigne: t.takenBy ? { nom: nomDe(t.takenBy) } : null,
    echeance: null,
    termineLe: t.resolvedAt ? jourDeParis(t.resolvedAt) : colonne === 'termine' ? jourDeParis(t.openedAt) : null,
    commentaires: 0,
    partageClient: false,
    ordre: 0,
    creeAt: t.openedAt,
    priseEnChargeAt: null,
    entreeColonneAt: null,
  };
}

export default function PageMissions(): React.ReactElement {
  const navigate = useNavigate();
  const maintenant = useMaintenant();
  const brutes = useCollection<Omit<TicketSav, 'id'>>('tickets');
  const [vue, setVue] = useState<'kanban' | 'liste' | 'chrono'>('kanban');
  const [filtre, setFiltre] = useState<'urgents' | 'enCours' | 'termines' | 'partages' | null>(null);
  const [alerte, setAlerte] = useState(true);
  const [depliees, setDepliees] = useState<ReadonlySet<ColonneDeTicket>>(new Set());

  const tickets = useMemo(() => brutes.map((b) => ticketDeLApp(b as TicketSav)), [brutes]);
  const modele = useMemo(() => modeleMissions({ tickets, maintenant, filtre, depliees }), [tickets, maintenant, filtre, depliees]);
  const versSav = () => navigate('/sav');
  const actions: ActionsMissions = useMemo(() => ({
    vue: setVue,
    nouveau: versSav,
    ouvrir: versSav,
    filtre: setFiltre,
    deposer: () => undefined,
    plus: (cle) => setDepliees((d) => new Set([...d, cle])),
    ajouter: versSav,
    alerte: setAlerte,
    reessayer: () => window.location.reload(),
    ouvrirSav: versSav,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueMissions statut="pret" horsLigne={horsLigne} modele={modele} vue={vue} filtre={filtre} alerte={alerte} tickets={tickets} actions={actions} lecture />;
}
