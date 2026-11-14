import React from 'react';
import { Archive, ChevronDown, ChevronRight, FileText, MessageSquare, RotateCcw, Search, Settings2, Receipt, PenLine } from 'lucide-react';
import { AnneauProgression, Bouton, Interrupteur, PageHead, SuggestionAjmani } from '../../../../socle/ui';
import '../commun/ecran.css';
import './archives.css';

/**
 * ME04 — Archives : la VUE. « Par le temps » (années et mois), la recherche et ses résultats rangés par mois, l'espace
 * utilisé, les règles automatiques, les restaurations récentes et la suggestion de libérer de la place. Elle reçoit des
 * textes et des nombres déjà composés (`composerArchives`) ; ce que le poste ne sait pas n'est pas montré.
 */

export interface MoisVue {
  cle: string;
  libelle: string;
  valeur: number;
  /** 0 à 1 : la barre grise (éléments du mois / mois le plus chargé de l'année). */
  densite: number;
  /** 0 à 1 : la barre violette (résultats de la recherche archivés ce mois-là). */
  correspondances: number;
  actif: boolean;
}
export interface AnneeVue {
  annee: number;
  ouverte: boolean;
  total: string;
  trouves: string | null;
  mois: MoisVue[];
  courbe: number[];
}
export interface LigneArchive {
  id: string;
  titre: string;
  type: string;
  ton: 'succes' | 'info' | 'attention' | 'neutre';
  extrait: string;
  taille: string;
  quand: string;
  genre: 'Document' | 'Facture' | 'Message' | 'Devis' | 'Photo' | 'Vidéo' | 'Autre';
  onRestaurer?: () => void;
}

export interface VueArchivesProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onRegles?: () => void;
  onArchiver?: () => void;
  temps: { total: string; annees: AnneeVue[]; legende: [string, string, string]; onAnnee: (annee: number) => void } | null;
  recherche: {
    valeur: string;
    onChange: (t: string) => void;
    contenu: boolean;
    onContenu: (v: boolean) => void;
    types: { cle: string; libelle: string; actif: boolean }[];
    onType: (cle: string) => void;
    resume: string;
    groupes: { mois: string; compteur: string; lignes: LigneArchive[] }[];
    suite: { libelle: string; onClick: () => void } | null;
  };
  quota: { pourcent: number; libelle: string; detail: string; ton: 'neutre' | 'attention' } | null;
  regles: { titre: string; items: { libelle: string; valeur: string }[] } | null;
  restaures: { titre: string; sous: string; items: { id: string; nom: string; detail: string; quand: string }[] } | null;
  suggestion: { titre: string; texte: string; oui: string; non: string; onOui: () => void; onNon: () => void } | null;
}

const ICONES: Record<LigneArchive['genre'], React.ReactNode> = {
  Document: <FileText size={14} aria-hidden />,
  Facture: <Receipt size={14} aria-hidden />,
  Message: <MessageSquare size={14} aria-hidden />,
  Devis: <FileText size={14} aria-hidden />,
  Photo: <Archive size={14} aria-hidden />,
  Vidéo: <Archive size={14} aria-hidden />,
  Autre: <PenLine size={14} aria-hidden />,
};

function Courbe({ valeurs }: { valeurs: number[] }) {
  const max = Math.max(1, ...valeurs);
  const pts = valeurs.map((v, i) => `${(i / Math.max(1, valeurs.length - 1)) * 90},${22 - (v / max) * 20}`).join(' ');
  return (
    <svg className="ec-me04__courbe" viewBox="0 0 90 24" width="90" height="24" aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function VueArchives(p: VueArchivesProps) {
  const l = p.libelles;
  return (
    <div className="ec-page ec-me04" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.regles, onClick: p.onRegles, icone: <Settings2 size={14} aria-hidden />, disabled: !p.onRegles }]}
        primaire={{ libelle: l.archiver, onClick: p.onArchiver, icone: <Archive size={14} aria-hidden />, disabled: !p.onArchiver }}
      />
      {p.temps ? (
        <div className="ec-page__corps ec-me04__corps">
          <section className="ec-carte ec-me04__temps" aria-labelledby="me04-temps">
            <header className="ec-tete">
              <h2 id="me04-temps">{l.parLeTemps}</h2>
              <span className="ec-discret">{p.temps.total}</span>
            </header>
            <div className="ec-me04__annees">
              {p.temps.annees.map((a) => (
                <div key={a.annee}>
                  <button type="button" className="ec-me04__annee" aria-expanded={a.ouverte} onClick={() => p.temps?.onAnnee(a.annee)}>
                    {a.ouverte ? <ChevronDown size={13} aria-hidden /> : <ChevronRight size={13} aria-hidden />}
                    <strong>{a.annee}</strong>
                    {!a.ouverte && <Courbe valeurs={a.courbe} />}
                    {a.trouves && <span className="ec-me04__trouves">{a.trouves}</span>}
                    <span className="ec-me04__annee-total">{a.total}</span>
                  </button>
                  {a.ouverte && (
                    <ul className="ec-me04__mois">
                      {a.mois.map((m) => (
                        <li key={m.cle} data-actif={m.actif ? 'oui' : undefined}>
                          <span>{m.libelle}</span>
                          <span className="ec-me04__barre" aria-hidden>
                            <i style={{ width: `${Math.round(m.densite * 100)}%` }} />
                            {m.correspondances > 0 && <b style={{ width: `${Math.round(m.correspondances * 100)}%` }} />}
                          </span>
                          <span className="ec-me04__mois-valeur">{m.valeur}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <ul className="ec-me04__legende">
              {p.temps.legende.map((t, i) => (
                <li key={t} data-rang={i}>
                  <i aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section className="ec-carte ec-me04__recherche" aria-label={l.recherche}>
            <div className="ec-me04__champ">
              <label className="ec-me04__saisie">
                <Search size={15} aria-hidden />
                <input value={p.recherche.valeur} onChange={(e) => p.recherche.onChange(e.target.value)} placeholder={l.chercher} aria-label={l.chercher} />
              </label>
              <label className="ec-me04__contenu">
                {l.dansLeContenu}
                <Interrupteur actif={p.recherche.contenu} onChange={p.recherche.onContenu} libelle={l.dansLeContenu} />
              </label>
            </div>
            <div className="ec-me04__types" role="group" aria-label={l.types}>
              {p.recherche.types.map((t) => (
                <button key={t.cle} type="button" className="ec-puce" data-actif={t.actif ? 'oui' : undefined} aria-pressed={t.actif} onClick={() => p.recherche.onType(t.cle)}>
                  {t.libelle}
                </button>
              ))}
            </div>
            <div className="ec-me04__resultats">
              <p className="ec-me04__resume">
                <strong>{p.recherche.resume}</strong>
              </p>
              {p.recherche.groupes.map((g) => (
                <div key={g.mois}>
                  <h3 className="ec-me04__groupe">
                    {g.mois} <span>{g.compteur}</span>
                  </h3>
                  <ul>
                    {g.lignes.map((r) => (
                      <li key={r.id} className="ec-me04__ligne">
                        <span className="ec-me04__icone">{ICONES[r.genre]}</span>
                        <span className="ec-me04__textes">
                          <span className="ec-me04__titre">
                            {r.titre} <span className="ec-puce" data-ton={r.ton}>{r.type}</span>
                          </span>
                          <span className="ec-me04__extrait">{r.extrait}</span>
                        </span>
                        <span className="ec-me04__meta">
                          <span>{r.quand}</span>
                          <span className="ec-mono">{r.taille}</span>
                        </span>
                        {r.onRestaurer && (
                          <Bouton variante="secondaire" taille="petit" onClick={r.onRestaurer}>
                            <RotateCcw size={12} aria-hidden />
                            {l.restaurer}
                          </Bouton>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {p.recherche.suite && (
                <p className="ec-me04__suite">
                  <button type="button" onClick={p.recherche.suite.onClick}>
                    {p.recherche.suite.libelle}
                  </button>
                </p>
              )}
            </div>
          </section>

          <div className="ec-me04__droite">
            {p.quota && (
              <section className="ec-carte ec-me04__bloc ec-me04__quota">
                <AnneauProgression valeur={p.quota.pourcent / 100} taille={56} epaisseur={5} piste="anneau" ton={p.quota.ton} libelle={p.quota.libelle}>
                  {p.quota.pourcent} %
                </AnneauProgression>
                <span>
                  <strong>{p.quota.libelle}</strong>
                  <small>{p.quota.detail}</small>
                </span>
              </section>
            )}
            {p.regles && (
              <section className="ec-carte ec-me04__bloc">
                <header className="ec-tete">
                  <h2>{p.regles.titre}</h2>
                </header>
                <ul className="ec-me04__regles">
                  {p.regles.items.map((r) => (
                    <li key={r.libelle}>
                      <span>{r.libelle}</span>
                      <b>{r.valeur}</b>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {p.restaures && (
              <section className="ec-carte ec-me04__bloc">
                <header className="ec-tete">
                  <h2>{p.restaures.titre}</h2>
                  <span className="ec-discret">{p.restaures.sous}</span>
                </header>
                <ul className="ec-me04__restaures">
                  {p.restaures.items.map((r) => (
                    <li key={r.id}>
                      <span>
                        <strong>{r.nom}</strong>
                        <small>{r.detail}</small>
                      </span>
                      <span className="ec-discret">{r.quand}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {p.suggestion && <SuggestionAjmani titre={p.suggestion.titre} texte={p.suggestion.texte} primaire={{ libelle: p.suggestion.oui, onClick: p.suggestion.onOui }} secondaire={{ libelle: p.suggestion.non, onClick: p.suggestion.onNon }} />}
          </div>
        </div>
      ) : (
        <div className="ec-page__corps">
          <section className="ec-carte ec-me04__vide">
            <div className="ec-vide">
              <h2>{l.videTitre}</h2>
              <p>{l.videTexte}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
