import React from 'react';
import { BarChart3, ChevronDown, ChevronRight, FileText, Lightbulb, Plus, Search } from 'lucide-react';
import { Bouton, InlineSuggestion, PageHead } from '../../../../socle/ui';
import '../commun/ecran.css';
import './connaissances.css';

/**
 * ME05 — Base de connaissances : la VUE. La question à Ajmani et sa réponse sourcée (jamais inventée), l'arbre des
 * rubriques, l'article en étapes et, à droite, le plan de la page et les articles liés. Elle reçoit des textes et des
 * nombres déjà composés (`composerConnaissances`) ; ce que le poste ne sait pas n'est pas montré.
 */

export interface ArticleDeLArbre {
  id: string;
  titre: string;
  actif: boolean;
  aRelire: boolean;
}
export interface RubriqueDeLArbre {
  cle: string;
  titre: string;
  total: number;
  ouverte: boolean;
  articles: ArticleDeLArbre[];
}
export interface EtapeVue {
  rang: number;
  titre: string;
  texte: string;
  astuce: string | null;
  citee: boolean;
}
export interface VueConnaissancesProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onStatistiques?: () => void;
  onNouveau: () => void;
  question: {
    valeur: string;
    onChange: (t: string) => void;
    reponse: { entete: string; texte: string; source: string; utile: string; onUtile: (oui: boolean) => void } | null;
    rien: string | null;
  };
  filtre: { valeur: string; onChange: (t: string) => void };
  arbre: { rubriques: RubriqueDeLArbre[]; onOuvrirArticle: (id: string) => void; onRubrique: (cle: string) => void; pied: { total: string; aRelire: string | null } };
  article: {
    chemin: string[];
    titre: string;
    meta: { auteur: string | null; maj: string | null; lectures: string | null };
    etapes: EtapeVue[];
    suggestion: { texte: string; oui: string; non: string; onOui: () => void; onNon: () => void } | null;
    /** Modifier l'article : le bouton, et le champ qui remplace la lecture quand il est actif. */
    modifier?: { libelle: string; actif: boolean; onBasculer: () => void; editeur: React.ReactNode };
  } | null;
  droite: {
    plan: { entete: string; items: { rang: number; titre: string; actif: boolean }[]; progression: number; pied: string };
    voirAussi: { entete: string; items: { id: string; titre: string; duree: string }[]; onOuvrir: (id: string) => void } | null;
    dernierLecteur: string | null;
  } | null;
}

export function VueConnaissances(p: VueConnaissancesProps) {
  const l = p.libelles;
  return (
    <div className="ec-page ec-me05" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.statistiques, onClick: p.onStatistiques, icone: <BarChart3 size={14} aria-hidden />, disabled: !p.onStatistiques }]}
        primaire={{ libelle: l.nouvelArticle, onClick: p.onNouveau, icone: <Plus size={14} aria-hidden /> }}
      />
      <section className="ec-carte ec-me05__question" aria-label={l.question}>
        <label className="ec-me05__champ">
          <Search size={15} aria-hidden />
          <input value={p.question.valeur} onChange={(e) => p.question.onChange(e.target.value)} placeholder={l.questionPlaceholder} aria-label={l.question} />
        </label>
        {p.question.reponse ? (
          <div className="ec-me05__reponse">
            <p className="ec-me05__reponse-tete">
              <strong>{p.question.reponse.entete}</strong>
            </p>
            <p>{p.question.reponse.texte}</p>
            <p className="ec-me05__source">
              <span className="ec-puce">
                <FileText size={11} aria-hidden /> {p.question.reponse.source}
              </span>
              <span className="ec-discret">{p.question.reponse.utile}</span>
              <button type="button" className="ec-puce" onClick={() => p.question.reponse?.onUtile(true)}>
                {l.oui}
              </button>
              <button type="button" className="ec-puce" onClick={() => p.question.reponse?.onUtile(false)}>
                {l.non}
              </button>
            </p>
          </div>
        ) : (
          p.question.rien && <p className="ec-me05__rien">{p.question.rien}</p>
        )}
      </section>
      <div className="ec-page__corps ec-me05__corps">
        <aside className="ec-carte ec-me05__arbre" aria-label={l.articles}>
          <label className="ec-me05__filtre">
            <Search size={13} aria-hidden />
            <input value={p.filtre.valeur} onChange={(e) => p.filtre.onChange(e.target.value)} placeholder={l.filtrer} aria-label={l.filtrer} />
          </label>
          <div className="ec-me05__rubriques">
            {p.arbre.rubriques.map((r) => (
              <div key={r.cle}>
                <button type="button" className="ec-me05__rubrique" aria-expanded={r.ouverte} onClick={() => p.arbre.onRubrique(r.cle)}>
                  {r.ouverte ? <ChevronDown size={13} aria-hidden /> : <ChevronRight size={13} aria-hidden />}
                  <span>{r.titre}</span>
                  <b>{r.total}</b>
                </button>
                {r.ouverte && (
                  <ul>
                    {r.articles.map((a) => (
                      <li key={a.id}>
                        <button type="button" className="ec-me05__article" data-actif={a.actif ? 'oui' : undefined} aria-current={a.actif ? 'true' : undefined} onClick={() => p.arbre.onOuvrirArticle(a.id)}>
                          <FileText size={13} aria-hidden />
                          <span>{a.titre}</span>
                          {a.aRelire && <i className="ec-point" aria-label={l.aRelire} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <footer className="ec-me05__pied">
            <span>{p.arbre.pied.total}</span>
            {p.arbre.pied.aRelire && <span className="ec-me05__relire">{p.arbre.pied.aRelire}</span>}
          </footer>
        </aside>

        <section className="ec-carte ec-me05__lecture" aria-label={l.article}>
          {p.article ? (
            <>
              <p className="ec-me05__chemin">{p.article.chemin.join(' / ')}</p>
              <h2>{p.article.titre}</h2>
              <p className="ec-me05__meta">
                {p.article.meta.auteur && <span>{p.article.meta.auteur}</span>}
                {p.article.meta.maj && <span>{p.article.meta.maj}</span>}
                {p.article.meta.lectures && <span>{p.article.meta.lectures}</span>}
              </p>
              {p.article.modifier && (
                <p className="ec-me05__modifier">
                  <Bouton variante="secondaire" taille="petit" onClick={p.article.modifier.onBasculer}>
                    {p.article.modifier.libelle}
                  </Bouton>
                </p>
              )}
              {p.article.modifier?.actif ? (
                <div className="ec-me05__editeur">{p.article.modifier.editeur}</div>
              ) : (
              <ol className="ec-me05__etapes">
                {p.article.etapes.map((e) => (
                  <li key={e.rang} data-citee={e.citee ? 'oui' : undefined}>
                    <span className="ec-me05__rang">{e.rang}</span>
                    <span className="ec-me05__etape">
                      <strong>
                        {e.titre}
                        {e.citee && <span className="ec-me05__citee">{l.citee}</span>}
                      </strong>
                      <span>{e.texte}</span>
                      {e.astuce && (
                        <span className="ec-me05__astuce">
                          <Lightbulb size={13} aria-hidden /> {e.astuce}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              )}
              {p.article.suggestion && <InlineSuggestion texte={p.article.suggestion.texte} onOui={p.article.suggestion.onOui} onNon={p.article.suggestion.onNon} libelleOui={p.article.suggestion.oui} libelleNon={p.article.suggestion.non} />}
            </>
          ) : (
            <div className="ec-vide">
              <h2>{l.videTitre}</h2>
              <p>{l.videTexte}</p>
              <Bouton variante="primaire" onClick={p.onNouveau}>
                {l.nouvelArticle}
              </Bouton>
            </div>
          )}
        </section>

        {p.droite && (
          <aside className="ec-me05__droite" aria-label={l.surCettePage}>
            <section className="ec-carte ec-me05__bloc">
              <h3>{p.droite.plan.entete}</h3>
              <ol className="ec-me05__plan">
                {p.droite.plan.items.map((i) => (
                  <li key={i.rang} data-actif={i.actif ? 'oui' : undefined}>
                    {i.rang}. {i.titre}
                  </li>
                ))}
              </ol>
              <span className="ec-me05__progression" role="img" aria-label={p.droite.plan.pied}>
                <i style={{ width: `${Math.round(p.droite.plan.progression * 100)}%` }} />
              </span>
              <p className="ec-discret">{p.droite.plan.pied}</p>
            </section>
            {p.droite.voirAussi && (
              <section className="ec-carte ec-me05__bloc">
                <h3>{p.droite.voirAussi.entete}</h3>
                <ul className="ec-me05__aussi">
                  {p.droite.voirAussi.items.map((i) => (
                    <li key={i.id}>
                      <button type="button" onClick={() => p.droite?.voirAussi?.onOuvrir(i.id)}>
                        <FileText size={13} aria-hidden />
                        <span>{i.titre}</span>
                        <b>{i.duree}</b>
                      </button>
                    </li>
                  ))}
                </ul>
                {p.droite.dernierLecteur && <p className="ec-discret ec-me05__lu">{p.droite.dernierLecteur}</p>}
              </section>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
