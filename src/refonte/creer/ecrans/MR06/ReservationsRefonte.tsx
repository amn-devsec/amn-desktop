import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis, minutesParis } from '../../commun';
import type { FiltreRessource } from '../../reservations';
import { modeleDesReservations, type ReservationVue } from './modele';
import { useMots } from './textes';
import { VueReservations } from './VueReservations';

interface SalleReelle { piece: string; debut: string; fin: string; motif: string; pour: string }
interface RessourceReelle { name: string; kind: string }
interface PretReel { resourceId: string; startAt: string; endAt: string; purpose: string; byEmail: string }

/**
 * MR06 · RÉSERVATIONS — route NOUVELLE `/reservations` (STATUT §1.27 c), construite sur ce que le dépôt sait déjà :
 * les réservations de salle (`roomBookings`, par pièce) et le matériel (`resources`, `resourceBookings`). Les véhicules
 * (MR09) et les règles d'ouverture n'y figurent pas : plage 08:00 à 18:00, du lundi au vendredi, par défaut. Statut « confirmée »
 * pour tout (le dépôt n'a ni demande ni conflit) : la frise n'affiche donc aucun conflit tant que le serveur n'en porte pas.
 */
export function ReservationsRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const navigate = useNavigate();
  const salles = useCollection<SalleReelle>('roomBookings');
  const ressources = useCollection<RessourceReelle>('resources');
  const prets = useCollection<PretReel>('resourceBookings');
  const [filtre, setFiltre] = useState<FiltreRessource>('tout');
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'reservations', miettes: [{ libelle: tm('titre') }] });

  const modele = useMemo(() => {
    const ouverture = { jours: [1, 2, 3, 4, 5], debut: '08:00', fin: '18:00' };
    const pieces = [...new Set(salles.map((s) => s.piece))];
    const res = [
      ...pieces.map((nom) => ({ id: `salle:${nom}`, nom, type: 'salle' as const, ouverture })),
      ...ressources.map((r) => ({ id: r.id, nom: r.name, type: 'matériel' as const, ouverture, detail: r.kind })),
    ];
    const rv: ReservationVue[] = [
      ...salles.map((s, i) => ({ id: `s${i}`, ressourceId: `salle:${s.piece}`, debutAt: s.debut, finAt: s.fin, statut: 'confirmée' as const, libelle: s.motif || s.pour, qui: s.pour })),
      ...prets.map((b, i) => ({ id: `p${i}`, ressourceId: b.resourceId, debutAt: b.startAt, finAt: b.endAt, statut: 'confirmée' as const, libelle: b.purpose, qui: b.byEmail })),
    ];
    return modeleDesReservations({ ressources: res, reservations: rv, conflitsLe: [], aujourdhui, filtre });
  }, [salles, ressources, prets, aujourdhui, filtre]);

  return (
    <VueReservations
      modele={modele}
      filtre={filtre}
      onFiltre={setFiltre}
      aujourdhui={aujourdhui}
      dateLibelle={new Date(`${aujourdhui}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).replace(/^./, (c) => c.toUpperCase())}
      maintenantMin={minutesParis(maintenant)}
      onReserver={() => navigate('/salles')}
    />
  );
}

export default ReservationsRefonte;
