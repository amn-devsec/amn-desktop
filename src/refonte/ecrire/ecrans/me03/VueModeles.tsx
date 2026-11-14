import React from 'react';
import { Download, Pencil, Plus, Sparkles } from 'lucide-react';
import { Bouton, FilterChips, PageHead } from '../../../../socle/ui';
import '../commun/ecran.css';
import './modeles.css';

/**
 * ME03 — Modèles : la VUE. La galerie des modèles (chacun avec son usage du mois), la proposition d'Ajmani de créer le
 * modèle d'un message qu'on réécrit souvent, et à droite le modèle ouvert avec ses variables. Elle reçoit des textes
 * déjà composés (`composerModeles`) ; les parties sans source ne sont pas montrées.
 */

export interface CarteModele {
  id: string;
  nom: string;
  usage: string;
  /** 0 à 100 : la barre d'usage, relative au modèle le plus utilisé. */
  taux: number;
  actif: boolean;
  /** Largeurs (en %) des lignes de l'aperçu miniature : le dessin du contenu, jamais son texte. */
  lignes: number[];
}
export interface VariableVue {
  nom: string;
  source: string;
  etat: 'auto' | 'saisir';
}
export interface VueModelesProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onImporter?: () => void;
  onCreer: () => void;
  filtres: { cle: string; libelle: string; compteur?: number }[];
  filtre: string;
  onFiltre: (cle: string) => void;
  bibliotheque: { libelle: string; pourcent: number } | null;
  cartes: CarteModele[];
  onChoisir: (id: string) => void;
  proposition: { titre: string; texte: string; creer: string; non: string; onCreer: () => void; onNon: () => void } | null;
  detail: {
    nom: string;
    sous: string;
    onModifier?: () => void;
    papier: React.ReactNode;
    variables: { entete: string; sous: string; items: VariableVue[] };
    utiliser: { libelle: string; onClick: () => void; desactive?: boolean };
    dupliquer: { libelle: string; onClick: () => void };
  } | null;
}

export function VueModeles(p: VueModelesProps) {
  const l = p.libelles;
  return (
    <div className="ec-page ec-me03" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.importer, onClick: p.onImporter, icone: <Download size={14} aria-hidden />, disabled: !p.onImporter }]}
        primaire={{ libelle: l.creer, onClick: p.onCreer, icone: <Plus size={14} aria-hidden /> }}
      />
      <div className="ec-page__corps ec-me03__corps">
        <div className="ec-me03__galerie">
          <div className="ec-me03__filtres">
            <FilterChips libelle={l.filtrer} puces={p.filtres} valeur={p.filtre} onChange={p.onFiltre} />
            {p.bibliotheque && (
              <span className="ec-me03__biblio">
                {p.bibliotheque.libelle}
                <span className="ec-me03__piste" role="img" aria-label={p.bibliotheque.libelle}>
                  <i style={{ width: `${p.bibliotheque.pourcent}%` }} />
                </span>
              </span>
            )}
          </div>
          <ul className="ec-me03__cartes">
            {p.cartes.map((c) => (
              <li key={c.id}>
                <button type="button" className="ec-me03__carte" data-actif={c.actif ? 'oui' : undefined} aria-current={c.actif ? 'true' : undefined} onClick={() => p.onChoisir(c.id)}>
                  <span className="ec-me03__miniature" aria-hidden>
                    {c.lignes.map((w, i) => (
                      <i key={i} style={{ width: `${w}%` }} />
                    ))}
                  </span>
                  <strong>{c.nom}</strong>
                  <span className="ec-me03__usage">
                    {c.usage}
                    <span className="ec-me03__piste ec-me03__piste--petite" aria-hidden>
                      <i style={{ width: `${c.taux}%` }} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {p.proposition && (
              <li>
                <section className="ec-me03__proposition">
                  <h3>
                    <Sparkles size={12} aria-hidden /> {p.proposition.titre}
                  </h3>
                  <p>{p.proposition.texte}</p>
                  <div className="ec-me03__proposition-actions">
                    <Bouton variante="primaire" taille="petit" onClick={p.proposition.onCreer}>
                      {p.proposition.creer}
                    </Bouton>
                    <Bouton variante="secondaire" taille="petit" onClick={p.proposition.onNon}>
                      {p.proposition.non}
                    </Bouton>
                  </div>
                </section>
              </li>
            )}
          </ul>
        </div>
        <aside className="ec-carte ec-me03__detail" aria-label={l.detail}>
          {p.detail ? (
            <>
              <header className="ec-me03__detail-tete">
                <div>
                  <h2>{p.detail.nom}</h2>
                  <p>{p.detail.sous}</p>
                </div>
                <Bouton variante="secondaire" taille="petit" onClick={p.detail.onModifier} disabled={!p.detail.onModifier}>
                  <Pencil size={13} aria-hidden />
                  {l.modifier}
                </Bouton>
              </header>
              <div className="ec-me03__papier">{p.detail.papier}</div>
              <section className="ec-me03__variables">
                <h3>
                  <strong>{p.detail.variables.entete}</strong> <span>{p.detail.variables.sous}</span>
                </h3>
                <ul>
                  {p.detail.variables.items.map((v) => (
                    <li key={v.nom} data-etat={v.etat}>
                      <i className="ec-point" aria-hidden />
                      <b>{v.nom}</b> <span>{v.source}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <footer className="ec-me03__actions">
                <Bouton variante="primaire" onClick={p.detail.utiliser.onClick} disabled={p.detail.utiliser.desactive}>
                  {p.detail.utiliser.libelle}
                </Bouton>
                <Bouton variante="secondaire" onClick={p.detail.dupliquer.onClick}>
                  {p.detail.dupliquer.libelle}
                </Bouton>
              </footer>
            </>
          ) : (
            <div className="ec-vide">
              <h2>{l.videTitre}</h2>
              <p>{l.videTexte}</p>
              <Bouton variante="primaire" onClick={p.onCreer}>
                {l.creer}
              </Bouton>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/** Le texte d'un modèle, avec ses variables `{nom}` en puces : une variable sans valeur se voit toujours. */
export function texteAvecPuces(texte: string): React.ReactNode {
  return texte.split(/(\{[^{}\s][^{}]*?\})/g).map((bout, i) =>
    /^\{[^{}]+\}$/.test(bout) ? (
      <span key={i} className="ec-me03__variable-puce">
        {bout.slice(1, -1)}
      </span>
    ) : (
      <React.Fragment key={i}>{bout}</React.Fragment>
    ),
  );
}
