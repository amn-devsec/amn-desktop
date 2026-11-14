import React, { useMemo, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { Modale } from '../../../../socle/ui';
import { uid, useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import type { Verdict } from '../../qualite';
import { useMots } from './textes';
import { VueQualite, type ControleVue } from './VueQualite';

interface ListeReelle { title: string; items: string[] }
interface PassageReel { checklistId: string; doneAt: string; byEmail: string; checked: boolean[]; note: string }
interface Brouillon { id: string; listeId: string; instant: string; verdicts: Record<string, Verdict> }

const prenom = (email: string) => (email ? email.split('@')[0].replace(/^./, (c) => c.toUpperCase()) : '—');

/**
 * MR11 · QUALITÉ ET CONTRÔLES — branché sur les listes (`checklists` : titre, points) et les passages (`checkRuns` : points cochés, auteur,
 * date). Un passage enregistré est un contrôle SIGNÉ ; un point coché est « Conforme », un point non coché « À vérifier » (le dépôt ne retient
 * pas « non conforme » ni « sans objet » : ces deux choix sont grisés avec la raison, STATUT §1.27 n° 4). Un nouveau contrôle est un
 * brouillon local qui s'écrit dans `checkRuns` à la signature, une fois tous les points conformes. Absents du dépôt : sections, criticité
 * et preuve par point, écarts (cause, responsable, échéance : le Pareto dit pourquoi il est vide), chantier ou client, signature
 * électronique (H12), action corrective.
 */
export function QualiteRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const { user } = useAuth();
  const { upsert } = useSync();
  const listes = useCollection<ListeReelle & { id: string }>('checklists');
  const passages = useCollection<PassageReel & { id: string }>('checkRuns');
  const [brouillons, setBrouillons] = useState<Brouillon[]>([]);
  const [choix, setChoix] = useState(false);
  const [masquee, setMasquee] = useState(false);
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'checklists', miettes: [{ libelle: tm('titre') }] });

  const controles = useMemo<ControleVue[]>(() => {
    const points = (liste: ListeReelle, etat: (i: number) => Verdict) => liste.items.map((libelle, i) => ({ id: `p${i}`, numero: String(i + 1).padStart(2, '0'), sectionId: 's', libelle, verdict: etat(i) }));
    const signes = passages.flatMap((r): ControleVue[] => {
      const liste = listes.find((l) => l.id === r.checklistId);
      return liste ? [{ id: r.id, titre: liste.title, auteur: prenom(r.byEmail), instant: r.doneAt, sections: [{ id: 's', titre: '' }], signeLe: jourParis(r.doneAt), points: points(liste, (i) => (r.checked[i] ? 'conforme' : 'a-verifier')) }] : [];
    });
    const encours = brouillons.flatMap((b): ControleVue[] => {
      const liste = listes.find((l) => l.id === b.listeId);
      return liste ? [{ id: b.id, titre: liste.title, auteur: prenom(user?.email ?? ''), instant: b.instant, sections: [{ id: 's', titre: '' }], signeLe: null, points: points(liste, (i) => b.verdicts[`p${i}`] ?? 'a-verifier') }] : [];
    });
    return [...encours, ...signes];
  }, [listes, passages, brouillons, user?.email]);

  const signer = (id: string) => {
    const b = brouillons.find((x) => x.id === id);
    const liste = b ? listes.find((l) => l.id === b.listeId) : undefined;
    if (!b || !liste) return;
    void upsert('checkRuns', uid('run'), { checklistId: b.listeId, doneAt: new Date().toISOString(), byEmail: user?.email ?? '', checked: liste.items.map((_, i) => b.verdicts[`p${i}`] === 'conforme'), note: '' });
    setBrouillons((l) => l.filter((x) => x.id !== id));
  };

  return (
    <>
      <VueQualite
        controles={controles}
        ecarts={[]}
        ecartsDisponibles={false}
        aujourdhui={aujourdhui}
        verdictsPossibles={['conforme']}
        onVerdict={(controleId, pointId, verdict) => setBrouillons((l) => l.map((b) => (b.id === controleId ? { ...b, verdicts: { ...b.verdicts, [pointId]: verdict } } : b)))}
        onSigner={signer}
        onNouveau={() => setChoix(true)}
        onNon={() => setMasquee(true)}
        suggestionMasquee={masquee}
      />
      <Modale
        ouverte={choix}
        onFermer={() => setChoix(false)}
        titre={tm('modale.titre')}
        description={tm('modale.texte')}
        famille="creer"
        actions={<button type="button" className="cr-bouton-verre" onClick={() => setChoix(false)}>{tm('modale.annuler')}</button>}
      >
        {listes.length === 0 ? <p>{tm('modale.aucun')}</p> : (
          <ul className="cr-q-modeles">
            {listes.map((l) => (
              <li key={l.id}>
                <button type="button" className="cr-bouton-verre sc-focus" onClick={() => { setBrouillons((b) => [{ id: uid('brouillon'), listeId: l.id, instant: new Date(maintenant).toISOString(), verdicts: {} }, ...b]); setChoix(false); }}>{l.title}</button>
              </li>
            ))}
          </ul>
        )}
      </Modale>
    </>
  );
}

export default QualiteRefonte;
