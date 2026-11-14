import React, { useMemo, useState } from 'react';
import { Bouton, Modale, Saisie } from '../../../../socle/ui';
import { uid, useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { composerModeles, enTeteDesVariables, type ModeleDuTexte } from './composer';
import { libellesDe, traduire, useMots } from './i18n';
import { VueModeles, texteAvecPuces } from './VueModeles';

/**
 * ME03 — Modèles, branché sur le poste. Route `/outils/modeles` (substitution). Le poste garde des modèles de texte
 * (`templates` : un titre, un corps avec des variables `{prénom}`) : l'écran les montre, en crée, en duplique, et copie le
 * texte rempli. Ce que le poste ne sait pas n'est pas montré (fiche ME03, rubrique 8 ; STATUT §1.27 n° 4) : pas de types
 * de modèle (Devis, E-mails…), pas de sources de variables (fiche client, catalogue : toutes sont « à saisir »), pas de
 * bibliothèque recommandée pour le métier, pas de modèle proposé par Ajmani, pas d'import.
 */
interface TemplateData {
  title: string;
  body: string;
  createdAt: string;
  uses?: number;
}

export default function PageModeles() {
  const { tm, langue } = useMots();
  const { upsert } = useSync();
  const brutes = useCollection<TemplateData>('templates');
  const [choisi, setChoisi] = useState<string | null>(null);
  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  const [copie, setCopie] = useState(false);
  const [creation, setCreation] = useState(false);
  const [titre, setTitre] = useState('');
  const [corps, setCorps] = useState('');

  usePageCoquille({ famille: 'ecrire', sousPage: 'templates', miettes: [{ libelle: tm('titre') }] });

  const modeles = useMemo<ModeleDuTexte[]>(() => brutes.map((b) => ({ id: b.id, nom: b.title, contenu: b.body, usages: b.uses ?? 0 })), [brutes]);
  const v = composerModeles({ langue, modeles, choisi, valeurs, recommandes: null });
  const { courant } = v;
  const tete = enTeteDesVariables(langue, v.variables);

  const creer = async () => {
    if (!titre.trim() || !corps.trim()) return;
    await upsert('templates', uid('tpl'), { title: titre.trim(), body: corps.trim(), createdAt: new Date().toISOString() });
    setCreation(false);
    setTitre('');
    setCorps('');
  };
  const dupliquer = async () => {
    if (!courant) return;
    await upsert('templates', uid('tpl'), { title: traduire(langue, 'copie.de', { nom: courant.nom }), body: courant.contenu, createdAt: new Date().toISOString() });
  };
  const utiliser = () => {
    if (!courant) return;
    void navigator.clipboard?.writeText(v.resultat).then(() => setCopie(true));
    const brut = brutes.find((b) => b.id === courant.id);
    if (brut) void upsert('templates', brut.id, { title: brut.title, body: brut.body, createdAt: brut.createdAt, uses: (brut.uses ?? 0) + 1 });
  };

  return (
    <>
      <VueModeles
        titre={tm('titre')}
        sousTitre={v.sousTitre}
        libelles={libellesDe(tm as never)}
        onCreer={() => setCreation(true)}
        filtres={[{ cle: 'tous', libelle: tm('tous'), compteur: modeles.length }]}
        filtre="tous"
        onFiltre={() => undefined}
        bibliotheque={v.bibliotheque}
        cartes={v.cartes}
        onChoisir={(id) => {
          setChoisi(id);
          setValeurs({});
          setCopie(false);
        }}
        proposition={null}
        detail={
          courant
            ? {
                nom: courant.nom,
                sous: traduire(langue, courant.usages <= 1 ? 'detail.sous.1' : 'detail.sous.n', { n: courant.usages }),
                papier: (
                  <>
                    <div>{texteAvecPuces(v.resultat)}</div>
                    {v.variables.length > 0 && (
                      <div className="ec-me03__saisies">
                        {v.variables.map((x) => (
                          <Saisie key={x.nom} etiquette={x.nom} value={valeurs[x.nom] ?? ''} onChange={(e) => setValeurs({ ...valeurs, [x.nom]: e.target.value })} />
                        ))}
                      </div>
                    )}
                  </>
                ),
                variables: { ...tete, items: v.variables.map((x) => ({ nom: x.nom, source: tm('source.aSaisir'), etat: (valeurs[x.nom] ?? '').trim() ? ('auto' as const) : ('saisir' as const) })) },
                utiliser: { libelle: copie ? tm('copie') : tm('utiliser'), onClick: utiliser, desactive: v.restantes > 0 },
                dupliquer: { libelle: tm('dupliquer'), onClick: () => void dupliquer() },
              }
            : null
        }
      />
      <Modale
        ouverte={creation}
        onFermer={() => setCreation(false)}
        titre={tm('creer')}
        actions={
          <Bouton variante="primaire" onClick={() => void creer()} disabled={!titre.trim() || !corps.trim()}>
            {tm('creer')}
          </Bouton>
        }
      >
        <Saisie etiquette={tm('titre')} value={titre} onChange={(e) => setTitre(e.target.value)} autoFocus />
        <Saisie etiquette={tm('detail')} value={corps} onChange={(e) => setCorps(e.target.value)} aide="{prénom}" />
      </Modale>
    </>
  );
}
