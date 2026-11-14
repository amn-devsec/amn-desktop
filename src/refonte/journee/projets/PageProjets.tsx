import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useCollection } from '../../../state/SyncContext';
import type { ProjectData } from '../../../state/projectEngine';
import { jourDeParis } from '../commun';
import { modeleFeuille, type FenetreFrise, type ProjetEntree } from './modele';
import { VueProjets, type ActionsProjets } from './VueProjets';

/**
 * « PROJETS » (MJ01) — la page branchée sur les projets de l'application : substitue `/projets`.
 *
 * Un projet de l'application a un titre, une échéance, un statut, un client et des tâches rattachées ; il n'a NI date de début, NI jalons, NI
 * liste de membres, NI icône. Rien n'est inventé : le début est le jour de création, les jalons sont absents (pas de losanges, pas de « prochains
 * jalons »), le couloir n'a qu'un responsable (celui de l'adresse du projet), l'icône est un dossier. Un projet sans échéance dit « Dates à
 * définir ». L'avancement est la part des tâches terminées. La création, l'ouverture d'un projet et le modèle passent la main à l'écran
 * d'origine (`useOutlet`). « Pour finir la semaine » liste les premières tâches non faites rattachées à un projet ; sans durée estimée, la
 * ligne d'aide dit combien il en reste.
 */
interface TacheBrute { id: string; title?: string; status?: string; projectId?: string }
interface ProjetBrut extends Partial<ProjectData> { id: string; createdAt?: string }

function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

const nomDe = (email: string): string => { const p = email.split('@')[0] ?? ''; return p ? p.charAt(0).toUpperCase() + p.slice(1) : ''; };

export function projetsDeLApp(projets: readonly ProjetBrut[], taches: readonly TacheBrute[], moi: string): ProjetEntree[] {
  return projets.map((p) => {
    const liees = taches.filter((t) => t.projectId === p.id);
    const faites = liees.filter((t) => t.status === 'done').length;
    const avancement = liees.length > 0 ? Math.round((faites / liees.length) * 100) : 0;
    const fin = /^\d{4}-\d{2}-\d{2}$/.test(p.deadline ?? '') ? (p.deadline as string) : null;
    const debut = p.createdAt ? jourDeParis(p.createdAt) : null;
    return {
      id: p.id, nom: p.title ?? '—', icone: 'folder', membres: p.ownerEmail ? [nomDe(p.ownerEmail)] : [], avancement, debut: fin && debut && debut > fin ? fin : debut, fin: fin ? (fin) : null, jalons: [],
      termineLe: avancement >= 100 ? (fin ?? debut) : null, mien: !!p.ownerEmail && p.ownerEmail === moi,
    };
  });
}

export default function PageProjets(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const origine = useOutlet();
  const etat = location.state as { origine?: boolean } | null;
  const [passee, setPassee] = useState(etat?.origine === true);
  useEffect(() => { if (etat?.origine === true) setPassee(true); }, [etat]);

  const maintenant = useMaintenant();
  const brutes = useCollection<Omit<ProjetBrut, 'id'>>('projects');
  const taches = useCollection<Omit<TacheBrute, 'id'>>('tasks');
  const [fenetre, setFenetre] = useState<FenetreFrise>('trimestre');
  const [filtre, setFiltre] = useState<'tous' | 'enRetard' | 'miens'>('tous');

  const projets = useMemo(() => projetsDeLApp(brutes as ProjetBrut[], taches as TacheBrute[], ''), [brutes, taches]);
  const modele = useMemo(() => modeleFeuille({ projets, aujourdhui: jourDeParis(maintenant), maintenant, fenetre, filtre }), [projets, maintenant, fenetre, filtre]);
  const aFaire = useMemo(() => (taches as TacheBrute[]).filter((t) => t.projectId && t.status !== 'done').slice(0, 3).map((t) => ({ id: t.id, libelle: t.title ?? '—', fait: false })), [taches]);

  const versOrigine = () => { setPassee(true); navigate('/projets', { replace: true, state: { origine: true } }); };
  const actions: ActionsProjets = useMemo(() => ({
    nouveau: versOrigine, modele: versOrigine, ouvrir: versOrigine, filtre: setFiltre, fenetre: setFenetre, lier: () => undefined, plusTard: () => undefined,
    cocher: () => undefined, ajouterDates: versOrigine, reessayer: () => window.location.reload(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  if (passee && origine) return <>{origine}</>;
  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  const jourCourt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', timeZone: 'Europe/Paris' }).format(maintenant);
  return <VueProjets statut="pret" horsLigne={horsLigne} modele={modele} filtre={filtre} fenetre={fenetre} jourCourt={jourCourt} taches={aFaire} suggestion={null} actions={actions} lecture />;
}
