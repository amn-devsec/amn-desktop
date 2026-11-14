import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { usePersonalStore } from '../../../../state/usePersonalStore';
import { usePageCoquille } from '../../../coquille/page';
import type { PageDeJournal } from '../../journal';
import { composerJournal } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueJournal } from './VueJournal';

/**
 * ME01 — Journal, branché sur le poste. Route `/personnel/journal` (substitution). Le journal est PERSONNEL : il vit sur
 * ce poste (`usePersonalStore('journal')`), il ne rejoint jamais une collection partagée. Une entrée : un jour, un texte,
 * une humeur de 1 à 5. Ce que le poste ne sait pas n'est pas montré (fiche ME01, rubrique 8 ; STATUT §1.27 n° 10 : pas de
 * nouveau rangement) : pas d'énergie, pas de trois mercis, pas d'étiquettes, pas d'heure de début, pas de résumé du
 * vendredi (aucun bilan au calendrier lu ici). La série et le record suivent la règle unique du lot (STATUT §1.29 n° 1).
 */
interface Entree {
  day: string;
  text: string;
  mood: number;
  updatedAt: string;
}
const INITIALES: Record<'fr' | 'en', string[]> = { fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] };

export default function PageJournal() {
  const { tm, langue } = useMots();
  const { user } = useAuth();
  const email = user?.email ?? '';
  const [entrees, setEntrees] = usePersonalStore<Entree[]>('journal', []);
  const maintenant = useMemo(() => new Date().toISOString(), []);
  const aujourdhui = maintenant.slice(0, 10);
  const [jour, setJour] = useState(aujourdhui);
  const [dernier, setDernier] = useState<string | null>(null);

  usePageCoquille({ famille: 'ecrire', sousPage: 'diary', miettes: [{ libelle: tm('titre') }] });
  useEffect(() => setDernier(null), [jour]);

  const pages = useMemo<PageDeJournal[]>(() => entrees.map((x) => ({ jour: x.day, auteurEmail: email, humeur: x.mood >= 1 && x.mood <= 5 ? (x.mood as 1 | 2 | 3 | 4 | 5) : null, texte: x.text })), [entrees, email]);

  const ecrire = (patch: Partial<Pick<Entree, 'text' | 'mood'>>) => {
    const now = new Date().toISOString();
    setEntrees((liste) => {
      const existante = liste.find((x) => x.day === jour);
      if (existante) return liste.map((x) => (x.day === jour ? { ...x, ...patch, updatedAt: now } : x));
      return [...liste, { day: jour, text: '', mood: 0, ...patch, updatedAt: now }];
    });
    setDernier(now);
  };

  const v = composerJournal(
    { langue, maintenant, moi: email, pages, jour, bilanAuCalendrier: false, heureDuBilan: null, initiales: INITIALES[langue], enregistreA: dernier, commenceeA: null },
    { onChoisirHumeur: (m) => ecrire({ mood: m }), onChangerTexte: (t) => ecrire({ text: t }), onOuvrirJour: setJour, onResumer: () => undefined, onNonResumer: () => undefined },
  );
  return <VueJournal {...v} libelles={libellesDe(tm as never)} onEcrire={() => setJour(aujourdhui)} />;
}
