import React from 'react';
import { ChevronLeft, ChevronRight, FileText, MoreHorizontal, PenLine, ArrowRight, Calendar, Clock, Lock } from 'lucide-react';
import { Bouton, InlineSuggestion, PageHead, Raccourci } from '../../../../socle/ui';
import '../commun/ecran.css';
import './journal.css';

/**
 * ME01 — Journal : la VUE. Le calendrier du mois avec la série, l'humeur du mois, le souvenir d'il y a un mois, et la page
 * du jour (humeur, énergie, trois mercis, ce qu'on retient). Elle reçoit des textes et des nombres déjà composés
 * (`composerJournal`) ; les sections que le poste ne sait pas remplir (énergie, mercis, étiquettes) ne sont pas montrées.
 */

export interface JourCalendrier {
  jour: number;
  etat: 'ecrit' | 'vide' | 'aujourdhui' | 'avenir';
  /** 0 à 1 : l'intensité du disque. */
  intensite: number;
  onClick?: () => void;
}
export interface BarreHumeurVue {
  jour: string;
  hauteur: number;
  derniere: boolean;
}

export interface VueJournalProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onModeles?: () => void;
  onEcrire: () => void;
  calendrier: {
    mois: string;
    initiales: string[];
    decalage: number;
    jours: JourCalendrier[];
    onPrecedent?: () => void;
    onSuivant?: () => void;
    serie: { valeur: number; libelle: string; ecrits: string; progression: number; palier: string | null };
  };
  humeur: { titre: string; plusSouvent: string | null; barres: BarreHumeurVue[]; bornes: [string, string, string] };
  souvenir: { quand: string; texte: string; relire: string; onRelire?: () => void } | null;
  page: {
    etiquette: string;
    titre: string;
    meta: { commencee: string | null; mots: string; visibilite: string };
    voirSemaine?: () => void;
    humeur: { titre: string; niveaux: { valeur: number; libelle: string; actif: boolean }[]; onChoisir: (v: number) => void };
    energie: { titre: string; segments: number; libelle: string } | null;
    mercis: { titre: string; valeurs: string[]; placeholder: string } | null;
    retiens: { titre: string; valeur: string; placeholder: string; onChange: (t: string) => void };
    etiquettes: string[] | null;
    suggestion: { texte: string; oui: string; non: string; onOui: () => void; onNon: () => void } | null;
    pied: { enregistre: string | null; raccourci: string };
  } | null;
}

export function VueJournal(p: VueJournalProps) {
  const l = p.libelles;
  const c = p.calendrier;
  return (
    <div className="ec-page ec-me01" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.modeles, onClick: p.onModeles, icone: <FileText size={14} aria-hidden />, disabled: !p.onModeles }]}
        primaire={{ libelle: l.ecrire, onClick: p.onEcrire, icone: <PenLine size={14} aria-hidden /> }}
      />
      <div className="ec-page__corps ec-me01__corps">
        <div className="ec-me01__gauche">
          <section className="ec-carte ec-me01__mois" aria-labelledby="me01-mois">
            <header className="ec-tete">
              <h2 id="me01-mois">{c.mois}</h2>
              <span className="ec-me01__fleches">
                <button type="button" aria-label={l.moisPrecedent} onClick={c.onPrecedent} disabled={!c.onPrecedent}>
                  <ChevronLeft size={14} aria-hidden />
                </button>
                <button type="button" aria-label={l.moisSuivant} onClick={c.onSuivant} disabled={!c.onSuivant}>
                  <ChevronRight size={14} aria-hidden />
                </button>
              </span>
            </header>
            <div className="ec-me01__grille" role="grid" aria-label={c.mois}>
              {c.initiales.map((i, k) => (
                <span key={`i${k}`} className="ec-me01__initiale" aria-hidden>
                  {i}
                </span>
              ))}
              {Array.from({ length: c.decalage }, (_, k) => (
                <span key={`d${k}`} aria-hidden />
              ))}
              {c.jours.map((j) => (
                <button key={j.jour} type="button" className="ec-me01__jour" data-etat={j.etat} style={{ ['--intensite' as string]: j.intensite }} onClick={j.onClick} disabled={!j.onClick} aria-label={`${j.jour}`}>
                  {j.jour}
                </button>
              ))}
            </div>
            <div className="ec-me01__serie">
              <div className="ec-me01__serie-haut">
                <span className="ec-me01__grand">{c.serie.valeur}</span>
                <span className="ec-me01__serie-libelle">{c.serie.libelle}</span>
                <span className="ec-discret ec-me01__serie-ecrits">{c.serie.ecrits}</span>
              </div>
              <span className="ec-me01__piste" role="img" aria-label={c.serie.libelle}>
                <i style={{ width: `${Math.round(c.serie.progression * 100)}%` }} />
              </span>
              {c.serie.palier && <p className="ec-me01__palier">{c.serie.palier}</p>}
            </div>
          </section>
          <section className="ec-carte ec-me01__humeur" aria-labelledby="me01-humeur">
            <header className="ec-tete">
              <h2 id="me01-humeur">{p.humeur.titre}</h2>
              {p.humeur.plusSouvent && <span className="ec-discret">{p.humeur.plusSouvent}</span>}
            </header>
            <div className="ec-me01__barres" role="img" aria-label={p.humeur.titre}>
              {p.humeur.barres.map((b) => (
                <i key={b.jour} data-derniere={b.derniere ? 'oui' : undefined} style={{ height: `${b.hauteur}%` }} />
              ))}
            </div>
            <div className="ec-me01__bornes ec-mono">
              <span>{p.humeur.bornes[0]}</span>
              <span>{p.humeur.bornes[1]}</span>
              <span>{p.humeur.bornes[2]}</span>
            </div>
          </section>
          {p.souvenir && (
            <section className="ec-carte ec-me01__souvenir" aria-label={p.souvenir.quand}>
              <p className="ec-me01__souvenir-quand">
                <FileText size={12} aria-hidden /> {p.souvenir.quand}
              </p>
              <blockquote>« {p.souvenir.texte} »</blockquote>
              <button type="button" className="ec-me01__relire" onClick={p.souvenir.onRelire} disabled={!p.souvenir.onRelire}>
                {p.souvenir.relire}
                <ArrowRight size={12} aria-hidden />
              </button>
            </section>
          )}
        </div>

        {p.page ? (
          <section className="ec-carte ec-me01__page" aria-label={p.page.etiquette}>
            <header className="ec-me01__page-tete">
              <div>
                <p className="ec-me01__etiquette">{p.page.etiquette}</p>
                <h2>{p.page.titre}</h2>
                <p className="ec-me01__meta">
                  {p.page.meta.commencee && (
                    <span>
                      <Clock size={12} aria-hidden /> {p.page.meta.commencee}
                    </span>
                  )}
                  <span>
                    <PenLine size={12} aria-hidden /> {p.page.meta.mots}
                  </span>
                  <span>
                    <Lock size={12} aria-hidden /> {p.page.meta.visibilite}
                  </span>
                </p>
              </div>
              <span className="ec-me01__page-actions">
                <Bouton variante="secondaire" taille="petit" onClick={p.page.voirSemaine} disabled={!p.page.voirSemaine}>
                  <Calendar size={13} aria-hidden />
                  {l.voirSemaine}
                </Bouton>
                <button type="button" className="ec-me01__plus" aria-label={l.plus} disabled>
                  <MoreHorizontal size={14} aria-hidden />
                </button>
              </span>
            </header>
            <div className="ec-me01__humeur-ligne">
              <div>
                <h3 className="ec-me01__champ-titre">{p.page.humeur.titre}</h3>
                <div className="ec-me01__niveaux" role="radiogroup" aria-label={p.page.humeur.titre}>
                  {p.page.humeur.niveaux.map((n) => (
                    <button key={n.valeur} type="button" role="radio" aria-checked={n.actif} data-actif={n.actif ? 'oui' : undefined} onClick={() => p.page?.humeur.onChoisir(n.valeur)}>
                      {n.libelle}
                    </button>
                  ))}
                </div>
              </div>
              {p.page.energie && (
                <div>
                  <h3 className="ec-me01__champ-titre">{p.page.energie.titre}</h3>
                  <div className="ec-me01__energie" role="img" aria-label={p.page.energie.libelle}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i key={i} data-plein={i <= (p.page?.energie?.segments ?? 0) ? 'oui' : undefined} />
                    ))}
                    <span>{p.page.energie.libelle}</span>
                  </div>
                </div>
              )}
            </div>
            {p.page.mercis && (
              <div>
                <h3 className="ec-me01__champ-titre">{p.page.mercis.titre}</h3>
                <ol className="ec-me01__mercis">
                  {p.page.mercis.valeurs.map((m, i) => (
                    <li key={i}>
                      <span>{i + 1}</span>
                      {m || <em>{p.page?.mercis?.placeholder}</em>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="ec-me01__retiens">
              <h3 className="ec-me01__champ-titre">{p.page.retiens.titre}</h3>
              <textarea value={p.page.retiens.valeur} placeholder={p.page.retiens.placeholder} aria-label={p.page.retiens.titre} onChange={(e) => p.page?.retiens.onChange(e.target.value)} />
            </div>
            {p.page.etiquettes && (
              <ul className="ec-me01__etiquettes">
                {p.page.etiquettes.map((e) => (
                  <li key={e} className="ec-puce">
                    {e}
                  </li>
                ))}
              </ul>
            )}
            {p.page.suggestion && <InlineSuggestion texte={p.page.suggestion.texte} onOui={p.page.suggestion.onOui} onNon={p.page.suggestion.onNon} libelleOui={p.page.suggestion.oui} libelleNon={p.page.suggestion.non} />}
            <footer className="ec-me01__pied">
              {p.page.pied.enregistre && <span>{p.page.pied.enregistre}</span>}
              <span className="ec-me01__pied-droite">
                <Raccourci>⌘</Raccourci>
                <Raccourci>↵</Raccourci> {p.page.pied.raccourci}
              </span>
            </footer>
          </section>
        ) : (
          <section className="ec-carte ec-me01__page">
            <div className="ec-vide">
              <h2>{l.videTitre}</h2>
              <p>{l.videTexte}</p>
              <Bouton variante="primaire" onClick={p.onEcrire}>
                {l.ecrire}
              </Bouton>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
