import React from 'react';
import { Link } from 'react-router-dom';
import { Check, FileText, Folder, History, Plus, Search, Share2 } from 'lucide-react';
import { Avatar, Bouton, LiveDot, PageHead, PileAvatars, Raccourci, SuggestionAjmani } from '../../../../socle/ui';
import '../commun/ecran.css';
import './notes.css';

/**
 * H10 — Notes et pages : la VUE. Trois colonnes (l'arbre 204, la page 604, la colonne de droite 272) ; elle reçoit des
 * textes et des nombres déjà composés (`composerNotes`), et le corps de la page en enfant : l'aperçu y met les blocs de
 * l'image, la page branchée y met un vrai champ de saisie. Les couleurs viennent des jetons de la famille.
 */

export interface ElementArbre {
  id: string;
  titre: string;
  niveau: 0 | 1;
  compte?: number;
  actif?: boolean;
  dossier?: boolean;
  vers?: string;
  onClick?: () => void;
}
export interface SectionArbre {
  titre: string;
  elements: ElementArbre[];
}
export interface DisqueVue {
  lettre: string;
  etat: 'coche' | 'en-cours' | 'a-venir' | 'vide';
}
export interface ProprietePage {
  cle: string;
  libelle: string;
  /** `etat` : la puce d'état (point vert) ; `date` : l'icône d'agenda ; `client` : l'avatar carré. */
  genre: 'client' | 'etat' | 'date' | 'texte';
  nom?: string;
}
export interface PlanItem {
  texte: string;
  niveau: 0 | 1;
  actif?: boolean;
}
export interface LienRetourVue {
  id: string;
  titre: string;
  avant: string;
  mot: string;
  apres: string;
  vers?: string;
}

export interface VueNotesProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onNouvellePage: () => void;
  onPartager?: () => void;
  onHistorique?: () => void;
  arbre: {
    recherche: string;
    onRecherche: (t: string) => void;
    sections: SectionArbre[];
    serie: { valeur: string; disques: DisqueVue[]; phrase: string } | null;
  };
  page: {
    chemin: string[];
    enregistre: string | null;
    titre: React.ReactNode;
    proprietes: ProprietePage[];
    personnes: string[];
    corps: React.ReactNode;
  } | null;
  droite: {
    plan: { total: string; items: PlanItem[]; ecrit: string | null };
    commentaire: { auteur: string; heure: string; texte: string; pied: string } | null;
    suggestion: { titre: string; texte: string; oui: string; non: string; onOui: () => void; onNon: () => void } | null;
    liens: { total: string; items: LienRetourVue[] };
  };
}

export function VueNotes(p: VueNotesProps) {
  const l = p.libelles;
  return (
    <div className="ec-h10" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[
          { libelle: l.partager, onClick: p.onPartager, icone: <Share2 size={14} aria-hidden />, disabled: !p.onPartager },
          { libelle: l.historique, onClick: p.onHistorique, icone: <History size={14} aria-hidden />, disabled: !p.onHistorique },
        ]}
        primaire={{ libelle: l.nouvellePage, onClick: p.onNouvellePage, icone: <Plus size={14} aria-hidden />, raccourci: 'N' }}
        className="ec-h10__entete"
      />
      <div className="ec-h10__grille">
        <aside className="ec-h10__carte ec-h10__arbre" aria-label={l.arbre}>
          <label className="ec-h10__recherche">
            <Search size={14} aria-hidden />
            <input value={p.arbre.recherche} onChange={(e) => p.arbre.onRecherche(e.target.value)} placeholder={l.chercher} aria-label={l.chercher} />
            <Raccourci>⌘P</Raccourci>
          </label>
          <div className="ec-h10__sections">
            {p.arbre.sections.map((s) => (
              <div key={s.titre} className="ec-h10__section">
                <h2 className="ec-h10__section-titre">{s.titre}</h2>
                <ul>
                  {s.elements.map((e) => {
                    const contenu = (
                      <>
                        <span className="ec-h10__el-icone" aria-hidden>{e.dossier ? <Folder size={14} /> : <FileText size={14} />}</span>
                        <span className="ec-h10__el-nom">{e.titre}</span>
                        {e.compte !== undefined && <span className="ec-h10__el-compte">{e.compte}</span>}
                      </>
                    );
                    return (
                      <li key={e.id}>
                        {e.vers ? (
                          <Link to={e.vers} className="ec-h10__element" data-niveau={e.niveau} data-actif={e.actif ? 'oui' : undefined} aria-current={e.actif ? 'page' : undefined}>
                            {contenu}
                          </Link>
                        ) : (
                          <button type="button" className="ec-h10__element" data-niveau={e.niveau} data-actif={e.actif ? 'oui' : undefined} aria-current={e.actif ? 'page' : undefined} onClick={e.onClick}>
                            {contenu}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          {p.arbre.serie && (
            <div className="ec-h10__serie">
              <div className="ec-h10__serie-tete">
                <span>{l.serie}</span>
                <span className="ec-h10__serie-valeur">{p.arbre.serie.valeur}</span>
              </div>
              <div className="ec-h10__disques" role="img" aria-label={p.arbre.serie.phrase}>
                {p.arbre.serie.disques.map((d, i) => (
                  <span key={i} className="ec-h10__disque-colonne">
                    <span className="ec-h10__disque" data-etat={d.etat}>
                      {d.etat === 'coche' && <Check size={10} aria-hidden />}
                    </span>
                    <span className="ec-h10__disque-lettre">{d.lettre}</span>
                  </span>
                ))}
              </div>
              <p className="ec-h10__serie-phrase">{p.arbre.serie.phrase}</p>
            </div>
          )}
        </aside>

        <section className="ec-h10__carte ec-h10__page" aria-label={l.page}>
          {p.page ? (
            <>
              <div className="ec-h10__page-tete">
                <span className="ec-h10__chemin">
                  {p.page.chemin.map((c, i) => (
                    <React.Fragment key={`${c}${i}`}>
                      {i > 0 && <span className="ec-h10__barre">/</span>}
                      {c}
                    </React.Fragment>
                  ))}
                </span>
                {p.page.enregistre && <LiveDot ton="ok" libelle={p.page.enregistre} afficherLibelle onde={false} className="ec-h10__enregistre" />}
              </div>
              <h2 className="ec-h10__page-titre">{p.page.titre}</h2>
              <div className="ec-h10__proprietes">
                {p.page.proprietes.map((x) => (
                  <span key={x.cle} className="ec-h10__propriete" data-genre={x.genre}>
                    {x.genre === 'client' && x.nom && <Avatar nom={x.nom} taille={16} forme="carre" />}
                    {x.genre === 'etat' && <span className="ec-h10__point" aria-hidden />}
                    {x.libelle}
                  </span>
                ))}
                {p.page.personnes.length > 0 && (
                  <span className="ec-h10__propriete">
                    <PileAvatars noms={p.page.personnes} taille={18} libelle={p.page.personnes.join(', ')} />
                    {p.page.personnes.length}
                  </span>
                )}
              </div>
              <div className="ec-h10__corps">{p.page.corps}</div>
            </>
          ) : (
            <div className="ec-h10__vide">
              <h2>{l.videTitre}</h2>
              <p>{l.videTexte}</p>
              <Bouton variante="primaire" onClick={p.onNouvellePage}>
                {l.nouvellePage}
              </Bouton>
            </div>
          )}
        </section>

        <div className="ec-h10__droite">
          <section className="ec-h10__carte ec-h10__bloc" aria-labelledby="h10-plan">
            <header className="ec-h10__bloc-tete">
              <h2 id="h10-plan">{l.surCettePage}</h2>
              <span>{p.droite.plan.total}</span>
            </header>
            <ul className="ec-h10__plan">
              {p.droite.plan.items.map((i, k) => (
                <li key={`${i.texte}${k}`} data-niveau={i.niveau} data-actif={i.actif ? 'oui' : undefined}>
                  {i.texte}
                </li>
              ))}
            </ul>
            {p.droite.plan.ecrit && (
              <p className="ec-h10__ecrit">
                <Avatar nom={p.droite.plan.ecrit.split(' ')[0]} taille={18} enLigne />
                {p.droite.plan.ecrit}
              </p>
            )}
          </section>
          {p.droite.commentaire && (
            <section className="ec-h10__carte ec-h10__bloc ec-h10__commentaire" aria-label={l.commentaire}>
              <header className="ec-h10__commentaire-tete">
                <Avatar nom={p.droite.commentaire.auteur} taille={22} />
                <strong>{p.droite.commentaire.auteur}</strong>
                <span>{p.droite.commentaire.heure}</span>
              </header>
              <p>{p.droite.commentaire.texte}</p>
              <p className="ec-h10__commentaire-pied">{p.droite.commentaire.pied}</p>
            </section>
          )}
          {p.droite.suggestion && (
            <SuggestionAjmani
              titre={p.droite.suggestion.titre}
              texte={p.droite.suggestion.texte}
              primaire={{ libelle: p.droite.suggestion.oui, onClick: p.droite.suggestion.onOui }}
              secondaire={{ libelle: p.droite.suggestion.non, onClick: p.droite.suggestion.onNon }}
            />
          )}
          <section className="ec-h10__carte ec-h10__bloc ec-h10__liens" aria-labelledby="h10-liens">
            <header className="ec-h10__bloc-tete">
              <h2 id="h10-liens">{l.liensRetour}</h2>
              <span>{p.droite.liens.total}</span>
            </header>
            <ul>
              {p.droite.liens.items.map((i) => (
                <li key={i.id}>
                  <span className="ec-h10__lien-titre">{i.titre}</span>
                  <span className="ec-h10__lien-extrait">
                    {i.avant}
                    <mark>{i.mot}</mark>
                    {i.apres}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
