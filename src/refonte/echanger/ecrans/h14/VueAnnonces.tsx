import React from 'react';
import { Bell, Check, ChevronRight, Layers, MapPin, MessageSquare, Plus, Send, Settings2, Star } from 'lucide-react';
import { AnneauProgression, Avatar, Bouton, EtatVide, IconeEtincelle, Interrupteur, PageHead, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './annonces.css';

/**
 * H14 — Annonces, le tableau de l'équipe : la VUE. « À la une » (accusés de lecture nominatifs, « Lu par x sur y », réactions),
 * la mosaïque de notes en trois colonnes, le brouillon en place, « Presque à jour », les catégories, la suggestion d'Ajmani
 * et la nouveauté du produit. Elle reçoit des textes et des nombres déjà composés (`composerAnnonces`) : ce que le poste ne
 * sait pas (catégories, réactions, épingles) n'est pas montré. Ouvrir n'est pas confirmer ; l'ambre dit « à lire », jamais
 * « urgent » ; aucun classement des lecteurs.
 */

export type TonDeCategorie = 'outils' | 'contacts' | 'creer' | 'jour' | 'ecrire' | 'argent';
export interface CategorieVue {
  nom: string;
  ton: TonDeCategorie;
}
export interface AccuseVue {
  email: string;
  nom: string;
  /** Le nom seul, pour l'avatar (« Aaron », pas « Aaron (toi) »). */
  avatar: string;
  sous: string;
  lu: boolean;
  moi: boolean;
}
export interface ReactionVue {
  type: 'bien-note' | 'merci' | 'question';
  libelle: string;
  n: number;
  active: boolean;
}
export interface BarreVue {
  pleins: number;
  vert: boolean;
  texte: string;
}
export interface UneVue {
  id: string;
  epinglee: boolean;
  categorie: CategorieVue | null;
  quand: string;
  auteur: string;
  titre: string;
  texte: string;
  accuses: AccuseVue[];
  lu: BarreVue;
  reactions: ReactionVue[] | null;
  peutConfirmer: boolean;
}
export interface NoteVue {
  id: string;
  categorie: CategorieVue | null;
  epinglee: boolean;
  titre: string;
  texte: string;
  auteur: string;
  date: string;
  reaction: { type: ReactionVue['type']; n: number } | null;
  lu: BarreVue;
}
export type CarteDeColonne = { genre: 'note'; note: NoteVue } | { genre: 'brouillon' };

export interface VueAnnoncesProps {
  libelles: Record<string, string>;
  etat: 'normal' | 'chargement' | 'erreur';
  aLaUne: UneVue | null;
  colonnes: CarteDeColonne[][];
  /** `epingler: null` : le poste ne sait pas épingler, l'interrupteur n'est pas montré. */
  brouillon: { auteur: string; titre: string; texte: string; epingler: boolean | null } | null;
  presque: { ratio: number; texte: string; titre: string; message: string; ton: 'succes' | 'attention'; epingle: { id: string; titre: string } | null } | null;
  categories: { toutes: number; lignes: { nom: string; n: number; barre: number; ton: TonDeCategorie; actif: boolean }[]; actif: string | null } | null;
  suggestion: { texte: string; programmer: string; non: string } | null;
  nouveaute: { texte: string } | null;
  actions: {
    onPublier?: () => void;
    onReglages?: () => void;
    onJaiLu?: (id: string) => void;
    onRepondre?: (id: string) => void;
    onReaction?: (id: string, type: ReactionVue['type']) => void;
    onOuvrir?: (id: string) => void;
    onCategorie?: (nom: string | null) => void;
    onBrouillon?: (v: { titre?: string; texte?: string; epingler?: boolean }) => void;
    onEnvoyerBrouillon?: () => void;
    onProgrammer?: () => void;
    onNonMerci?: () => void;
    onRecharger?: () => void;
  };
}

const ICONE_REACTION: Record<ReactionVue['type'], React.ReactNode> = {
  'bien-note': <Check size={13} aria-hidden />,
  merci: <Star size={13} aria-hidden />,
  question: <MessageSquare size={13} aria-hidden />,
};

function Point({ c }: { c: CategorieVue }) {
  return <i className="ex-h14__point" data-ton={c.ton} aria-hidden />;
}

/** Les trois segments de la barre de lecture (12 × 4) : verts quand toute l'équipe a lu. */
function BarreDeLecture({ b }: { b: BarreVue }) {
  return (
    <span className="ex-h14__barre" data-vert={b.vert ? 'oui' : undefined} role="img" aria-label={b.texte}>
      {[0, 1, 2].map((i) => (
        <i key={i} data-plein={i < b.pleins ? 'oui' : undefined} />
      ))}
    </span>
  );
}

export function VueAnnonces(p: VueAnnoncesProps) {
  const l = p.libelles;
  const a = p.actions;
  const une = p.aLaUne;
  return (
    <div className="ex-page ex-h14" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={l.sousTitre}
        secondaires={[{ libelle: l.reglages, onClick: a.onReglages, icone: <Settings2 size={14} aria-hidden />, disabled: !a.onReglages }]}
        primaire={{ libelle: l.publier, onClick: a.onPublier, icone: <Plus size={14} aria-hidden />, raccourci: 'N', disabled: !a.onPublier }}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-h14__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : (
        <div className="ex-page__corps ex-h14__corps">
          <div className="ex-h14__gauche">
            {p.etat === 'chargement' ? (
              <div className="ex-h14__squelettes" aria-busy aria-label={l.chargement}>
                <Squelette largeur="100%" hauteur={262} rayon={16} />
                <Squelette largeur="100%" hauteur={180} rayon={16} />
              </div>
            ) : une ? (
              <section className="ex-carte ex-h14__une" data-epinglee={une.epinglee ? 'oui' : undefined} aria-labelledby="h14-une">
                <header className="ex-h14__meta">
                  {une.epinglee && (
                    <span className="ex-h14__epingle">
                      <MapPin size={12} aria-hidden /> {l.aLaUne}
                    </span>
                  )}
                  {une.categorie && (
                    <span className="ex-h14__cat">
                      <Point c={une.categorie} /> {une.categorie.nom}
                    </span>
                  )}
                  <span className="ex-h14__quand">{une.quand}</span>
                  <span className="ex-h14__auteur">
                    <Avatar nom={une.auteur} taille={22} /> {une.auteur}
                  </span>
                </header>
                <h2 id="h14-une" className="ex-h14__titre-une">{une.titre}</h2>
                <p className="ex-h14__texte-une">{une.texte}</p>
                <ul className="ex-h14__accuses">
                  {une.accuses.map((x) => (
                    <li key={x.email} data-lu={x.lu ? 'oui' : undefined} data-moi={x.moi ? 'oui' : undefined}>
                      <Avatar nom={x.avatar} taille={28} />
                      <span>
                        <b>{x.nom}</b>
                        <small>{x.sous}</small>
                      </span>
                      <i aria-hidden>{x.lu && <Check size={11} strokeWidth={3} />}</i>
                    </li>
                  ))}
                  <li className="ex-h14__lu-par">
                    <BarreDeLecture b={une.lu} />
                    <span>{une.lu.texte}</span>
                  </li>
                </ul>
                <footer className="ex-h14__pied-une">
                  {une.reactions && (
                    <div className="ex-h14__reactions">
                      {une.reactions.map((r) => (
                        <button key={r.type} type="button" className="ex-h14__reaction ex-cible" aria-pressed={r.active} onClick={() => a.onReaction?.(une.id, r.type)}>
                          {ICONE_REACTION[r.type]}
                          {r.libelle} <b>{r.n}</b>
                        </button>
                      ))}
                      <button type="button" className="ex-h14__reaction ex-h14__reaction--plus ex-cible" aria-label={l.reactionAjouter}>
                        <Plus size={13} aria-hidden />
                      </button>
                    </div>
                  )}
                  <span className="ex-h14__boutons">
                    {a.onRepondre && (
                      <Bouton variante="secondaire" taille="petit" icone={<MessageSquare size={13} aria-hidden />} onClick={() => a.onRepondre?.(une.id)}>
                        {l.repondre}
                      </Bouton>
                    )}
                    {une.peutConfirmer && (
                      <Bouton variante="primaire" taille="petit" icone={<Check size={13} aria-hidden />} onClick={() => a.onJaiLu?.(une.id)} disabled={!a.onJaiLu}>
                        {l.jaiLu}
                      </Bouton>
                    )}
                  </span>
                </footer>
              </section>
            ) : (
              <section className="ex-carte ex-h14__une ex-h14__une--vide">
                <EtatVide titre={l.videTitre} texte={l.videTexte} action={a.onPublier ? <Bouton variante="primaire" onClick={a.onPublier}>{l.publier}</Bouton> : null} />
              </section>
            )}

            {p.etat !== 'chargement' && (
              <div className="ex-h14__mosaique">
                {p.colonnes.map((col, i) => (
                  <div key={i} className="ex-h14__colonne">
                    {col.map((c, j) =>
                      c.genre === 'brouillon' && p.brouillon ? (
                        <section key="brouillon" className="ex-h14__note ex-h14__brouillon" aria-label={l.brouillonTitre}>
                          <p className="ex-h14__brouillon-tete">
                            <Avatar nom={p.brouillon.auteur} taille={26} /> {l.brouillonTitre}
                          </p>
                          <input className="ex-h14__champ" aria-label={l.brouillonChamp} placeholder={l.brouillonChamp} value={p.brouillon.titre} readOnly={!a.onBrouillon} onChange={(e) => a.onBrouillon?.({ titre: e.target.value })} />
                          {p.brouillon.titre && <textarea className="ex-h14__champ" aria-label={l.brouillonTexte} placeholder={l.brouillonTexte} rows={3} value={p.brouillon.texte} onChange={(e) => a.onBrouillon?.({ texte: e.target.value })} />}
                          <div className="ex-h14__brouillon-pied">
                            {p.brouillon.epingler !== null && (
                              <>
                                <Interrupteur actif={p.brouillon.epingler} libelle={l.brouillonEpingler} onChange={(v) => a.onBrouillon?.({ epingler: v })} disabled={!a.onBrouillon} />
                                <span>{l.brouillonEpingler}</span>
                              </>
                            )}
                            <Bouton variante="primaire" taille="petit" icone={<Send size={13} aria-hidden />} onClick={a.onEnvoyerBrouillon} disabled={!a.onEnvoyerBrouillon}>
                              {l.brouillonPublier}
                            </Bouton>
                          </div>
                        </section>
                      ) : c.genre === 'note' ? (
                        <button key={c.note.id} type="button" className="ex-h14__note ex-cible" data-ton={c.note.categorie?.ton} onClick={() => a.onOuvrir?.(c.note.id)} style={{ animationDelay: `${(i + j * 3) * 50}ms` }}>
                          <span className="ex-h14__litere" aria-hidden />
                          <span className="ex-h14__note-cat">
                            {c.note.epinglee && <MapPin size={11} aria-hidden />}
                            {c.note.categorie && (
                              <>
                                <Point c={c.note.categorie} /> {c.note.categorie.nom}
                              </>
                            )}
                          </span>
                          <b className="ex-h14__note-titre">{c.note.titre}</b>
                          <span className="ex-h14__note-texte">{c.note.texte}</span>
                          <span className="ex-h14__note-pied">
                            <Avatar nom={c.note.auteur} taille={20} />
                            <span className="ex-h14__note-qui">
                              {c.note.auteur} · {c.note.date}
                            </span>
                            {c.note.reaction && (
                              <span className="ex-h14__note-reaction">
                                {ICONE_REACTION[c.note.reaction.type]} {c.note.reaction.n}
                              </span>
                            )}
                            <BarreDeLecture b={c.note.lu} />
                          </span>
                        </button>
                      ) : null,
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="ex-h14__droite">
            {p.presque && (
              <section className="ex-carte ex-h14__presque" aria-label={p.presque.titre}>
                <div>
                  <AnneauProgression valeur={p.presque.ratio} taille={62} epaisseur={6} ton={p.presque.ton} piste="anneau" libelle={p.presque.titre} texte={p.presque.texte}>
                    <b>{p.presque.texte}</b>
                  </AnneauProgression>
                  <p>
                    <b>{p.presque.titre}</b>
                    <span>{p.presque.message}</span>
                  </p>
                </div>
                {p.presque.epingle && (
                  <button type="button" className="ex-h14__epingle-ligne ex-cible" aria-label={l.presqueOuvrir} onClick={() => a.onOuvrir?.(p.presque!.epingle!.id)}>
                    <MapPin size={13} aria-hidden />
                    <span>{p.presque.epingle.titre}</span>
                    <ChevronRight size={13} aria-hidden />
                  </button>
                )}
              </section>
            )}

            {p.categories && (
              <section className="ex-carte ex-h14__categories" aria-labelledby="h14-categories">
                <header className="ex-tete">
                  <h2 id="h14-categories">{l.categories}</h2>
                  <span className="ex-discret">{l.categoriesFiltrer}</span>
                </header>
                <ul>
                  <li>
                    <button type="button" className="ex-h14__ligne-cat ex-cible" data-actif={p.categories.actif === null ? 'oui' : undefined} onClick={() => a.onCategorie?.(null)}>
                      <Layers size={13} aria-hidden />
                      <span>{l.categoriesToutes}</span>
                      <span className="ex-mono">{p.categories.toutes}</span>
                    </button>
                  </li>
                  {p.categories.lignes.map((c) => (
                    <li key={c.nom}>
                      <button type="button" className="ex-h14__ligne-cat ex-cible" data-actif={c.actif ? 'oui' : undefined} data-ton={c.ton} onClick={() => a.onCategorie?.(c.nom)}>
                        <i className="ex-h14__point" data-ton={c.ton} aria-hidden />
                        <span>{c.nom}</span>
                        <span className="ex-h14__piste" aria-hidden>
                          <i style={{ width: `${Math.round(c.barre * 100)}%` }} />
                        </span>
                        <span className="ex-mono">{c.n}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.suggestion && (
              <section className="ex-h14__suggestion" aria-label={l.suggestionTitre}>
                <p className="ex-h14__suggestion-titre">
                  <IconeEtincelle taille={13} /> {l.suggestionTitre}
                </p>
                <p>{p.suggestion.texte}</p>
                <div>
                  <Bouton variante="primaire" taille="petit" onClick={a.onProgrammer} disabled={!a.onProgrammer}>
                    {p.suggestion.programmer}
                  </Bouton>
                  <Bouton variante="secondaire" taille="petit" onClick={a.onNonMerci} disabled={!a.onNonMerci}>
                    {p.suggestion.non}
                  </Bouton>
                </div>
              </section>
            )}

            {p.nouveaute && (
              <section className="ex-carte ex-h14__nouveaute" aria-labelledby="h14-nouveaute">
                <h2 id="h14-nouveaute">
                  <Bell size={13} aria-hidden /> {l.nouveaute}
                </h2>
                <p>{p.nouveaute.texte}</p>
                <span className="ex-h14__toutes">
                  {l.nouveauteToutes} <ChevronRight size={12} aria-hidden />
                </span>
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
