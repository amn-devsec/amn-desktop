import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings2, Plus } from 'lucide-react';
import { Avatar, Bouton, CountBadge, FilterChips, InlineSuggestion, ModuleTile, PageHead, PileAvatars, Raccourci, LiveDot } from '../../../../socle/ui';
import type { Segment } from '../../relecture';
import './hub.css';

/**
 * F20 — Écrire et retenir, vue d'ensemble : la VUE, sans rien lire du poste. Elle reçoit des textes et des nombres déjà
 * composés par la logique du lot (`../../hub.ts`, `../../pages.ts`, `../../relecture.ts`, `../../serie.ts`) ; la page
 * (`PageHub.tsx`) les calcule sur les données du poste, l'aperçu sur celles du bac à sable.
 *
 * Les couleurs viennent des jetons de la famille (`--fam-a`, `--fam-b`) ; aucun lot n'écrit une couleur à la main.
 */

export interface TuileVue {
  cle: string;
  nom: string;
  icone: React.ReactNode;
  sous: string;
  vers: string;
  /** Les deux seules couleurs d'état de l'index : le vert (Journal) et l'orange (Signatures). */
  ton: 'neutre' | 'vert' | 'orange';
  pastille: number | null;
  nouveau: boolean;
  /** Quelqu'un écrit avec toi : l'avatar en ligne à droite de la tuile. */
  coAuteur: string | null;
}

export interface FeuilleDessous {
  id: string;
  titre: string;
  auteurQuand: string;
}

export interface BlocApercu {
  type: 'titre' | 'texte' | 'tache';
  texte: string;
  fait?: boolean;
  /** Le curseur de co-écriture, à la fin de ce bloc : le prénom de la personne qui écrit. */
  curseur?: string;
}

export interface FeuilleDessus {
  id: string;
  chemin: string[];
  coAuteurs: string[];
  titre: string;
  meta: string;
  blocs: BlocApercu[];
  enregistre: string;
}

export interface LigneRelectureVue {
  id: string;
  titre: string;
  action: { libelle: string; vers: string } | null;
  pourMoi: boolean;
  detail: string;
  segments: [Segment, Segment, Segment];
  etape: 'brouillon' | 'relecture' | 'signature';
  etapeLibelle: string;
}

export interface CaseSerie {
  jour: number;
  etat: 'ecrit' | 'vide' | 'aujourdhui' | 'avenir';
  /** 1 à 5 : la teinte du violet selon les mots écrits. */
  palier: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface BadgeVue {
  libelle: string;
  obtenu: boolean;
}

export interface VueHubProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  modules: TuileVue[];
  raccourcis: { libelle: string; touches: string; icone?: React.ReactNode }[];
  pages: {
    filtre: string;
    puces: { cle: string; libelle: string }[];
    onFiltre: (cle: string) => void;
    dessous: FeuilleDessous[];
    dessus: FeuilleDessus | null;
    onOuvrirDessus: () => void;
  };
  relecture: { total: string; lignes: LigneRelectureVue[]; delai: string | null; vide: string };
  serie: {
    mois: string;
    valeur: number;
    ecrits: string;
    phrase: string;
    conseil: string | null;
    initiales: string[];
    decalage: number;
    cases: CaseSerie[];
    souvenir: { texte: string; ancien: string } | null;
    badges: BadgeVue[];
  };
  suggestion: { texte: string; onOui: () => void; onNon: () => void } | null;
  onNouvellePage: () => void;
  onPersonnaliser: () => void;
}

const ROTATIONS = [-1.4, 1.1, -0.7, 0.5];

function Pastille({ n }: { n: number | null }) {
  if (n === null) return null;
  return <CountBadge n={n} variante="standard" />;
}

export function VueHub(p: VueHubProps) {
  const l = p.libelles;
  return (
    <div className="ec-f20" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={p.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.personnaliser, onClick: p.onPersonnaliser, icone: <Settings2 size={14} aria-hidden /> }]}
        primaire={{ libelle: l.nouvellePage, onClick: p.onNouvellePage, icone: <Plus size={14} aria-hidden /> }}
        className="ec-f20__entete"
      />
      <div className="ec-f20__grille">
        <section className="ec-f20__carte ec-f20__index" aria-labelledby="f20-modules">
          <header className="ec-f20__carte-tete">
            <h2 id="f20-modules">{l.modulesTitre}</h2>
            <Link to="/modules" className="ec-f20__lien">
              {l.modulesTous}
              <ArrowRight size={12} aria-hidden />
            </Link>
          </header>
          <ul className="ec-f20__tuiles">
            {p.modules.map((m) => (
              <li key={m.cle}>
                <ModuleTile
                  nom={m.nom}
                  icone={m.icone}
                  famille="ecrire"
                  sousTexte={m.sous}
                  vers={m.vers}
                  className="ec-f20__tuile"
                  accessoire={
                    m.coAuteur ? <Avatar nom={m.coAuteur} taille={20} enLigne /> : m.nouveau ? <span className="ec-f20__nouveau">{l.nouveau}</span> : <Pastille n={m.pastille} />
                  }
                  title={m.nom}
                />
              </li>
            ))}
          </ul>
          <ul className="ec-f20__raccourcis">
            {p.raccourcis.map((r) => (
              <li key={r.libelle}>
                {r.icone && <span className="ec-f20__raccourci-icone" aria-hidden>{r.icone}</span>}
                <span className="ec-f20__raccourci-libelle">{r.libelle}</span>
                <span className="ec-f20__touches">
                  {r.touches.split(' ').map((t, i) => (
                    <Raccourci key={`${t}${i}`}>{t}</Raccourci>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ec-f20__carte ec-f20__pile" aria-labelledby="f20-pages">
          <header className="ec-f20__pile-tete">
            <h2 id="f20-pages">{l.pagesTitre}</h2>
            <FilterChips libelle={l.pagesGroupe} puces={p.pages.puces} valeur={p.pages.filtre} onChange={p.pages.onFiltre} />
          </header>
          <div className="ec-f20__bureau">
            {p.pages.dessous.slice(-4).map((f, i, tout) => {
              const rang = i + (4 - tout.length);
              return (
                <div
                  key={f.id}
                  className="ec-f20__feuille"
                  style={{ ['--rang' as string]: rang, ['--tourne' as string]: `${ROTATIONS[rang]}deg` }}
                >
                  <span className="ec-f20__feuille-titre">{f.titre}</span>
                  <span className="ec-f20__feuille-meta">{f.auteurQuand}</span>
                </div>
              );
            })}
            {p.pages.dessus ? (
              <article className="ec-f20__dessus" aria-label={p.pages.dessus.titre}>
                <div className="ec-f20__chemin">
                  {p.pages.dessus.chemin.map((c, i) => (
                    <React.Fragment key={c}>
                      {i > 0 && <span className="ec-f20__barre">/</span>}
                      {c}
                    </React.Fragment>
                  ))}
                  {p.pages.dessus.coAuteurs.length > 0 && (
                    <span className="ec-f20__ensemble">
                      <PileAvatars noms={p.pages.dessus.coAuteurs} taille={20} libelle={p.pages.dessus.coAuteurs.join(', ')} />
                      <span>{l.pagesEnsemble}</span>
                    </span>
                  )}
                </div>
                <h3 className="ec-f20__dessus-titre">{p.pages.dessus.titre}</h3>
                <p className="ec-f20__dessus-meta">{p.pages.dessus.meta}</p>
                <hr className="ec-f20__filet" />
                <div className="ec-f20__blocs">
                  {p.pages.dessus.blocs.map((b, i) =>
                    b.type === 'titre' ? (
                      <h4 key={i} className="ec-f20__bloc-titre">
                        {b.texte}
                      </h4>
                    ) : b.type === 'tache' ? (
                      <div key={i} className="ec-f20__tache" data-fait={b.fait ? 'oui' : undefined}>
                        <span className="ec-f20__case" aria-hidden />
                        {b.texte}
                      </div>
                    ) : (
                      <p key={i} className="ec-f20__bloc-texte">
                        {b.texte}
                        {b.curseur && (
                          <span className="ec-f20__curseur" data-mvt="curseur">
                            <i />
                            <b>{b.curseur}</b>
                          </span>
                        )}
                      </p>
                    ),
                  )}
                </div>
                <footer className="ec-f20__dessus-pied">
                  <LiveDot ton="ok" libelle={p.pages.dessus.enregistre} afficherLibelle onde={false} />
                  <Bouton variante="secondaire" taille="petit" onClick={p.pages.onOuvrirDessus}>
                    {l.pagesOuvrir}
                    <ArrowRight size={12} aria-hidden />
                  </Bouton>
                </footer>
              </article>
            ) : (
              <article className="ec-f20__dessus ec-f20__dessus--vide">
                <h3 className="ec-f20__dessus-titre">{l.pagesVideTitre}</h3>
                <p className="ec-f20__dessus-meta">{l.pagesVideTexte}</p>
                <Bouton variante="primaire" onClick={p.onNouvellePage}>
                  {l.nouvellePage}
                </Bouton>
              </article>
            )}
          </div>
          {p.suggestion && (
            <div className="ec-f20__suggestion">
              <InlineSuggestion texte={p.suggestion.texte} onOui={p.suggestion.onOui} onNon={p.suggestion.onNon} libelleOui={l.suggestionOui} libelleNon={l.suggestionNon} />
            </div>
          )}
        </section>

        <div className="ec-f20__droite">
          <section className="ec-f20__carte ec-f20__relecture" aria-labelledby="f20-relecture">
            <header className="ec-f20__carte-tete">
              <h2 id="f20-relecture">{l.relectureTitre}</h2>
              <span className="ec-f20__total">{p.relecture.total}</span>
            </header>
            <p className="ec-f20__sous">{l.relectureSous}</p>
            {p.relecture.lignes.length === 0 ? (
              <p className="ec-f20__vide">{p.relecture.vide}</p>
            ) : (
              <ul className="ec-f20__lignes">
                {p.relecture.lignes.map((r) => (
                  <li key={r.id} className="ec-f20__ligne" data-pour-moi={r.pourMoi ? 'oui' : undefined}>
                    <span className="ec-f20__ligne-haut">
                      <span className="ec-f20__ligne-titre">{r.titre}</span>
                      {r.action && (
                        <Link to={r.action.vers} className="ec-f20__ligne-action">
                          {r.action.libelle}
                        </Link>
                      )}
                    </span>
                    <span className="ec-f20__ligne-bas">
                      <span className="ec-f20__ligne-detail" data-orange={r.pourMoi ? 'oui' : undefined}>
                        {r.detail}
                      </span>
                      <span className="ec-f20__etapes" data-etape={r.etape}>
                        {r.segments.map((s, i) => (
                          <span key={i} className="ec-f20__segment" data-etat={s} />
                        ))}
                        <span className="ec-f20__etape-libelle">{r.etapeLibelle}</span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {p.relecture.delai && <p className="ec-f20__delai">{p.relecture.delai}</p>}
          </section>

          <section className="ec-f20__carte ec-f20__serie" aria-labelledby="f20-serie">
            <header className="ec-f20__carte-tete">
              <h2 id="f20-serie">{l.serieTitre}</h2>
              <span className="ec-f20__total">{p.serie.mois}</span>
            </header>
            <div className="ec-f20__serie-haut">
              <span className="ec-f20__grand">{p.serie.valeur}</span>
              <span className="ec-f20__serie-jours">{l.serieJours}</span>
              <span className="ec-f20__serie-ecrits">{p.serie.ecrits}</span>
            </div>
            <p className="ec-f20__serie-phrase">{p.serie.conseil ?? p.serie.phrase}</p>
            <div className="ec-f20__mois" role="img" aria-label={`${p.serie.mois} · ${p.serie.ecrits}`}>
              {p.serie.initiales.map((i, k) => (
                <span key={`i${k}`} className="ec-f20__jour-nom" aria-hidden>
                  {i}
                </span>
              ))}
              {Array.from({ length: p.serie.decalage }, (_, k) => (
                <span key={`d${k}`} aria-hidden />
              ))}
              {p.serie.cases.map((c) => (
                <span key={c.jour} className="ec-f20__case-jour" data-etat={c.etat} data-palier={c.palier} aria-hidden />
              ))}
            </div>
            {p.serie.souvenir && (
              <blockquote className="ec-f20__souvenir">
                <p>« {p.serie.souvenir.texte} »</p>
                <cite>{p.serie.souvenir.ancien}</cite>
              </blockquote>
            )}
            <ul className="ec-f20__badges">
              {p.serie.badges.map((b) => (
                <li key={b.libelle} data-obtenu={b.obtenu ? 'oui' : undefined}>
                  {b.libelle}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
