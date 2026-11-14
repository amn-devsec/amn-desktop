import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../../../state/useNotes';
import { jourDeParis } from '../commun';
import { modeleMur, type FiltreMur, type NoteEntree, type TriMur } from './modele';
import { VueNotes, type ActionsNotes } from './VueNotes';

/**
 * « NOTES RAPIDES » (MJ04) — la page branchée : écran neuf `/notes-rapides` (registre, `nouveau`). `/notes` appartient déjà à « Notes et pages »
 * (H10) ; ce mur la complète pour noter vite. Les deux lisent la MÊME collection : une note écrite ici est dans H10 et inversement.
 *
 * Une note de l'application a un titre, un corps, un auteur, « épinglée » et deux dates. Elle n'a NI type, NI étiquette, NI liste à cocher, NI
 * voix, NI valeur d'accès, NI proposition de rangement : sans ces champs, le mur montre des notes en TEXTE SIMPLE, masque « À trier », la
 * dictée, les étiquettes en un clic et la carte d'Ajmani, au lieu de les inventer. Ouvrir une note, ou en créer une longue, passe par H10.
 */
const isoJour = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface NoteApp { id: string; title: string; body: string; pinned: boolean; updatedAt: string; projectId?: string }

/** Une note de l'application, en entrée du mur : texte simple, sans rien d'inventé. */
export function noteDeLApp(n: NoteApp): NoteEntree {
  const corps = (n.body ?? '').trim();
  const titre = (n.title ?? '').trim() || corps.split('\n')[0]?.slice(0, 80) || 'Sans titre';
  const suite = (n.title ?? '').trim() ? corps : corps.split('\n').slice(1).join('\n').trim();
  return { id: n.id, titre, corps: suite, type: 'texte', etiquette: null, epinglee: Boolean(n.pinned), updatedAt: n.updatedAt, projectId: n.projectId ?? null };
}

function useJour(): string {
  const [jour, setJour] = useState(() => isoJour(new Date()));
  useEffect(() => {
    const minuteur = window.setInterval(() => setJour(isoJour(new Date())), 60_000);
    return () => window.clearInterval(minuteur);
  }, []);
  return jour;
}

export default function PageNotes(): React.ReactElement {
  const navigate = useNavigate();
  const { notes, createNote, updateNote } = useNotes();
  const [filtre, setFiltre] = useState<FiltreMur>('toutes');
  const [tri, setTri] = useState<TriMur>('recentes');
  const [recherche, setRecherche] = useState('');
  const aujourdhui = useJour();
  void jourDeParis;

  // Une note créée avec plusieurs lignes : la première est le titre, le reste est le corps, écrit dès que la note existe dans la liste.
  const enAttente = useRef<{ id: string; corps: string } | null>(null);
  useEffect(() => {
    const a = enAttente.current;
    if (a && notes.some((n) => n.id === a.id)) { enAttente.current = null; updateNote(a.id, { body: a.corps }); }
  }, [notes, updateNote]);

  const entrees = useMemo(() => notes.map(noteDeLApp), [notes]);
  const modele = useMemo(() => modeleMur({ notes: entrees, aujourdhui, filtre, tri, recherche, aTrierActif: false }), [entrees, aujourdhui, filtre, tri, recherche]);

  const actions: ActionsNotes = useMemo(() => ({
    noter: (texte) => {
      const [premiere, ...reste] = texte.split('\n');
      const id = createNote('team', premiere.trim());
      const corps = reste.join('\n').trim();
      if (corps) enAttente.current = { id, corps };
    },
    nouvelle: () => { createNote('team'); navigate('/notes'); },
    ouvrir: () => navigate('/notes'),
    filtre: setFiltre, tri: setTri, recherche: setRecherche,
    dicter: () => undefined, cocher: () => undefined, faireTache: () => undefined, lire: () => undefined, afficher: () => undefined,
    toutRanger: () => undefined, uneParUne: () => undefined, reessayer: () => window.location.reload(),
  }), [createNote, navigate]);

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  return <VueNotes statut="pret" horsLigne={horsLigne} modele={modele} filtre={filtre} tri={tri} recherche={recherche} actions={actions} etiquettes={false} dictee={false} rangement={false} />;
}
