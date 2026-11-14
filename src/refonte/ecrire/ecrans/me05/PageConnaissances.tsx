import React, { useEffect, useMemo, useState } from 'react';
import { Saisie } from '../../../../socle/ui';
import { stripMeta, uid, useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import type { ArticleMin, EtapeDArticle } from '../../connaissances';
import { jourDe } from '../../commun';
import { composerConnaissances } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueConnaissances } from './VueConnaissances';

/**
 * ME05 — Base de connaissances, branché sur le poste. Route `/knowledge` (substitution). Le poste garde des documents
 * de connaissance (`knowledge` : un titre, un texte) : chacun devient un article, ses paragraphes deviennent les étapes ;
 * la réponse d'Ajmani cherche dans ces articles et cite sa source (rien n'est inventé). Ce que le poste ne sait pas n'est
 * pas montré (fiche ME05, rubrique 8 ; STATUT §1.27 n° 4) : pas de rubriques (une seule, « Articles »), pas d'auteur, pas
 * de compte de lectures, pas d'article « à relire » (aucun module cité), pas de parcours des nouveaux membres ni
 * d'astuces. Modifier un article reste possible : le titre et le texte s'enregistrent au fil de la frappe.
 */
interface KnowledgeData {
  title: string;
  body: string;
  createdAt: string;
}

/** Les paragraphes du texte deviennent des étapes : le titre est la première phrase (60 signes au plus), le texte le reste. */
function etapesDe(corps: string): EtapeDArticle[] {
  return corps
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const phrase = p.split(/(?<=[.!?])\s+/)[0];
      const titre = phrase.length <= 60 ? phrase : `${phrase.slice(0, 57)}…`;
      return { titre, texte: p };
    });
}

export default function PageConnaissances() {
  const { tm, langue } = useMots();
  const { upsert } = useSync();
  const docs = useCollection<KnowledgeData>('knowledge');
  const [choisi, setChoisi] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [filtre, setFiltre] = useState('');
  const [ouvertes, setOuvertes] = useState<Set<string> | null>(null);
  const [edition, setEdition] = useState(false);
  const [titre, setTitre] = useState('');
  const [corps, setCorps] = useState('');
  const [modifie, setModifie] = useState(false);
  const maintenant = useMemo(() => new Date().toISOString(), []);

  usePageCoquille({ famille: 'ecrire', sousPage: 'knowledge', miettes: [{ libelle: tm('titre') }] });

  const rubrique = tm('rubrique.sans');
  const articles = useMemo<ArticleMin[]>(() => docs.map((d) => ({ id: d.id, titre: d.title || '—', rubrique, etapes: etapesDe(d.body ?? ''), majLe: jourDe(d.updatedAt), statut: 'publié' as const })), [docs, rubrique]);
  const courant = docs.find((d) => d.id === choisi) ?? docs[0] ?? null;

  useEffect(() => {
    setTitre(courant?.title ?? '');
    setCorps(courant?.body ?? '');
    setModifie(false);
  }, [courant?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!modifie || !courant) return undefined;
    const t = window.setTimeout(() => {
      void upsert('knowledge', courant.id, { ...stripMeta(courant), title: titre, body: corps });
      setModifie(false);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [modifie, courant, titre, corps, upsert]);

  const v = composerConnaissances(
    { langue, maintenant, articles, choisi: courant?.id ?? null, question, filtre, rubriquesOuvertes: ouvertes, lecturesDuMois: null, lecturesDeLArticle: null, auteur: null, etapeCourante: 1, modulesChanges: {} },
    {
      onOuvrir: (id) => {
        setChoisi(id);
        setEdition(false);
      },
      onRubrique: (cle) => setOuvertes((o) => { const n = new Set(o ?? articles.map((a) => a.rubrique)); if (n.has(cle)) n.delete(cle); else n.add(cle); return n; }),
      onUtile: () => undefined,
    },
  );
  const creer = () => {
    const id = uid('kb');
    void upsert('knowledge', id, { title: tm('nouvelArticle'), body: '', createdAt: new Date().toISOString() });
    setChoisi(id);
    setEdition(true);
  };

  return (
    <VueConnaissances
      {...v}
      titre={tm('titre')}
      libelles={libellesDe(tm as never)}
      onNouveau={creer}
      question={{ ...v.question, onChange: setQuestion }}
      filtre={{ valeur: filtre, onChange: setFiltre }}
      article={
        v.article && courant
          ? {
              ...v.article,
              modifier: {
                libelle: edition ? tm('terminer') : tm('modifier'),
                actif: edition,
                onBasculer: () => setEdition((x) => !x),
                editeur: (
                  <>
                    <Saisie etiquette={tm('article')} value={titre} onChange={(e) => { setTitre(e.target.value); setModifie(true); }} />
                    <textarea value={corps} aria-label={tm('article')} onChange={(e) => { setCorps(e.target.value); setModifie(true); }} />
                  </>
                ),
              },
            }
          : null
      }
    />
  );
}
