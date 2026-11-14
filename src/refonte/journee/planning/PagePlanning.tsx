import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { useCollection } from '../../../state/SyncContext';
import { useMembers } from '../../../state/useMembers';
import { ajouterJours, jourDeParis } from '../commun';
import { modelePlanning, type CreneauPlanning, type PersonnePlanning } from './modele';
import { VuePlanning, type ActionsPlanning } from './VuePlanning';

/**
 * « PLANNING DE L'ÉQUIPE » (MJ03) — la page branchée sur les postes de l'application : substitue `/planning`.
 *
 * Un poste de l'application est une DEMI-JOURNÉE par personne et par jour (matin, après-midi, journée, repos) : il n'a ni heure, ni titre, ni
 * catégorie, ni lien client. Rien n'est inventé : le matin est dessiné sur la première moitié de la plage de 9:00 à 18:00, l'après-midi sur la
 * seconde, la journée sur toute la plage (et le créneau porte le nom du poste, pas un titre qu'on lui aurait trouvé) ; « repos » est une
 * absence (hachurée, hors de la charge). Tous sont de catégorie « interne ». Le planning est en LECTURE ici : créer, modifier, dupliquer passent
 * la main à l'écran d'origine (`useOutlet`). Disponibilité : 35 h par personne, valeur proposée par la fiche.
 */
interface PosteBrut { email: string; day: string; kind: 'matin' | 'apresmidi' | 'journee' | 'repos' }
const PLAGES = { matin: ['09:00', '13:30'], apresmidi: ['13:30', '18:00'], journee: ['09:00', '18:00'] } as const;
const NOMS = { matin: 'Matin', apresmidi: 'Après-midi', journee: 'Journée' } as const;
const nomDe = (email: string): string => { const p = (email.split('@')[0] ?? '').replace(/[._-]+/g, ' '); return p ? p.charAt(0).toUpperCase() + p.slice(1) : email; };

function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export function creneauxDesPostes(postes: readonly PosteBrut[]): { creneaux: CreneauPlanning[]; absences: Map<string, string[]> } {
  const creneaux: CreneauPlanning[] = [];
  const absences = new Map<string, string[]>();
  for (const p of postes) {
    if (p.kind === 'repos') { absences.set(p.email, [...(absences.get(p.email) ?? []), p.day]); continue; }
    const [debut, fin] = PLAGES[p.kind] ?? PLAGES.journee;
    creneaux.push({ id: `${p.email}|${p.day}`, jour: p.day, debut, fin, titre: NOMS[p.kind] ?? NOMS.journee, categorie: 'interne', personnes: [p.email] });
  }
  return { creneaux, absences };
}

export default function PagePlanning(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const origine = useOutlet();
  const etat = location.state as { origine?: boolean } | null;
  const [passee, setPassee] = useState(etat?.origine === true);
  useEffect(() => { if (etat?.origine === true) setPassee(true); }, [etat]);

  const { user } = useAuth();
  const { membres } = useMembers();
  const maintenant = useMaintenant();
  const postes = useCollection<Omit<PosteBrut, never>>('shifts');
  const [semaine, setSemaine] = useState<'cette' | 'prochaine'>('cette');

  const { creneaux, absences } = useMemo(() => creneauxDesPostes(postes as PosteBrut[]), [postes]);
  const personnes: PersonnePlanning[] = useMemo(
    () => membres.filter((m) => m.status === 'active').sort((a, b) => a.email.localeCompare(b.email)).map((m) => ({ id: m.email, nom: nomDe(m.email), role: '', enLigne: false, moi: m.email === user?.email, disponibiliteH: 35, absents: absences.get(m.email) })),
    [membres, user, absences],
  );
  const jour = semaine === 'cette' ? jourDeParis(maintenant) : ajouterJours(jourDeParis(maintenant), 7);
  const modele = useMemo(() => modelePlanning({ personnes, creneaux, maintenant, jour }), [personnes, creneaux, maintenant, jour]);

  const versOrigine = () => { setPassee(true); navigate('/planning', { replace: true, state: { origine: true } }); };
  const actions: ActionsPlanning = useMemo(() => ({
    dupliquer: versOrigine, ajouter: versOrigine, semaine: setSemaine, ouvrir: versOrigine, proposer: () => undefined, non: () => undefined, reessayer: () => window.location.reload(), ouvrirPlanning: versOrigine,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  if (passee && origine) return <>{origine}</>;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VuePlanning statut="pret" horsLigne={horsLigne} modele={modele} semaine={semaine} actions={actions} lecture noteLecture />;
}
