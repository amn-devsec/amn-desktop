import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modeleRappels, type FiltreRappels } from './modele';
import { VueRappels, type ActionsRappels } from './VueRappels';

/**
 * « RAPPELS » (MJ05) — la page branchée : écran neuf `/rappels` (registre, `nouveau`) ; aucun écran d'origine (`/relances` est celui des relances de
 * PAIEMENT, une autre chose).
 *
 * L'application n'a PAS de rappels : ni titre, ni heure, ni personne, ni récurrence, ni canal, ni heures calmes. Plutôt que d'en inventer, l'écran
 * est en LECTURE avec un fil vide qui le dit et renvoie vers ce qui existe (les relances de paiement, les tâches). « Tenus à temps » et
 * « Récurrents » n'ont rien à compter et se taisent ; « Comment tu es prévenu » n'a aucun réglage à montrer et disparaît ; les puces « Les miens /
 * Équipe » et les boutons de création ne servent à rien et sont masqués. Le jour où une source existe, `VueRappels` la reçoit telle quelle.
 */
const heureCourte = (d: Date): string => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Paris' });
const demainDe = (d: Date): string => new Date(d.getTime() + 86_400_000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', timeZone: 'Europe/Paris' });

function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageRappels(): React.ReactElement {
  const navigate = useNavigate();
  const maintenant = useMaintenant();
  const [filtre, setFiltre] = useState<FiltreRappels>('tous');
  const modele = useMemo(() => modeleRappels({ rappels: [], maintenant, filtre }), [maintenant, filtre]);
  const rien = () => undefined;
  const actions: ActionsRappels = useMemo(() => ({
    nouveau: rien, recurrents: rien, filtre: setFiltre, ouvrir: rien, fait: rien, reporter: rien, programmer: rien, non: rien, ouvrirLien: rien, ouvrirRecurrent: rien, calmes: rien, reportAuto: rien,
    reessayer: () => window.location.reload(), relances: () => navigate('/relances'), taches: () => navigate('/tasks'),
  }), [navigate]);
  const date = new Date(maintenant);
  return <VueRappels statut="pret" modele={modele} heure={heureCourte(date)} demain={demainDe(date)} filtre={filtre} recurrents={null} prevenu={null} actions={actions} lecture filtres={false} />;
}
