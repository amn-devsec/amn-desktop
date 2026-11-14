import React from 'react';
import { Check, FileText, Mic, MicOff, Plus, Video } from 'lucide-react';
import { Avatar, Bouton, EtatVide, IconeEtincelle, PageHead, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './reunions.css';

/**
 * MX02 — Réunions : la VUE, une salle de réunion. La réunion en cours en grand (vignettes, ordre du jour minuté), ses notes et
 * ses décisions, la prochaine réunion (compte à rebours, ordre du jour, cases « Avant 11:00 ») et la semaine à venir avec la
 * préparation. Elle reçoit des textes et des nombres déjà composés (`composerReunions`). L'enregistrement n'est jamais lancé
 * sans l'accord de chaque participant ; caméra et micro sont coupés à l'arrivée ; ni mesure du temps de parole, ni
 * classement de préparation, ni minuteur rouge.
 */

export interface VignetteVue {
  nom: string;
  micro: boolean;
  parle: boolean;
}
export interface SegmentVue {
  libelle: string;
  /** Largeur proportionnelle aux minutes. */
  minutes: number;
  etat: 'fait' | 'en-cours' | 'a-venir';
  remplissage: number;
}
export interface EnCoursVue {
  titre: string;
  detail: string;
  vignettes: VignetteVue[];
  vous: boolean;
  ordre: SegmentVue[];
}
export interface NotesVue {
  titre: string;
  sous: string;
  lignes: { heure: string | null; texte: string; decision: boolean }[];
  curseur: boolean;
  saisie: boolean;
}
export interface ActionsVue {
  titre: string;
  sous: string;
  lignes: { id: string; avatar: string; texte: string; sous: string; etat: { libelle: string; ton: 'succes' | 'neutre' }; fait?: boolean; onBasculer?: () => void }[];
  saisie: boolean;
}
export interface ProchaineVue {
  titre: string;
  sous: string;
  compte: { valeur: string; sous: string } | null;
  participants: { noms: string[]; texte: string };
  document: string | null;
  ordre: { minutes: string | null; titre: string; fait: boolean; largeur: number }[];
  avant: { titre: string; compte: string; cases: { libelle: string; fait: boolean; onBasculer?: () => void }[] } | null;
}
export interface LigneAVenirVue {
  id: string;
  jour: string;
  heure: string;
  titre: string;
  sous: string;
  preparation: { pourcent: number; ton: 'vert' | 'neutre' | 'orange' } | null;
}

export interface VueReunionsProps {
  libelles: Record<string, string>;
  sousTitre: string;
  etat: 'normal' | 'chargement' | 'erreur';
  enCours: EnCoursVue | null;
  notes: NotesVue | null;
  actions: ActionsVue | null;
  suggestion: { texte: string; oui: string; non: string } | null;
  prochaine: ProchaineVue | null;
  avenir: LigneAVenirVue[];
  evenements: {
    onPlanifier?: () => void;
    onModeles?: () => void;
    onRejoindre?: () => void;
    onOuvrir?: (id: string) => void;
    onNote?: (v: string) => void;
    onAction?: (v: string) => void;
    onSuggestion?: (oui: boolean) => void;
    onRecharger?: () => void;
  };
}

export function VueReunions(p: VueReunionsProps) {
  const l = p.libelles;
  const e = p.evenements;
  const gauche = !!(p.enCours || p.notes || p.actions);
  return (
    <div className="ex-page ex-mx02" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={e.onModeles ? [{ libelle: l.modeles, onClick: e.onModeles, icone: <FileText size={14} aria-hidden /> }] : []}
        primaire={e.onPlanifier ? { libelle: l.planifier, onClick: e.onPlanifier, icone: <Plus size={14} aria-hidden /> } : undefined}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-mx02__plein" role="alert">
          <EtatVide texte={l.erreur} action={e.onRecharger ? <Bouton variante="secondaire" onClick={e.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : p.etat === 'chargement' ? (
        <div className="ex-page__corps ex-mx02__corps" aria-busy aria-label={l.chargement}>
          <Squelette largeur="60%" hauteur={420} rayon={16} />
          <Squelette largeur="40%" hauteur={420} rayon={16} />
        </div>
      ) : !gauche && !p.prochaine && p.avenir.length === 0 ? (
        <section className="ex-carte ex-mx02__plein">
          <EtatVide titre={l.videTitre} texte={l.videTexte} action={e.onPlanifier ? <Bouton variante="primaire" onClick={e.onPlanifier}>{l.planifier}</Bouton> : null} />
        </section>
      ) : (
        <div className="ex-page__corps ex-mx02__corps" data-seul={gauche ? undefined : 'oui'}>
          {gauche && (
            <div className="ex-mx02__gauche">
              {p.enCours && (
                <section className="ex-carte ex-mx02__encours" aria-label={p.enCours.titre}>
                  <header>
                    <span className="ex-mx02__voyant" aria-hidden />
                    <b className="ex-mono">{l.enCours}</b>
                    <h2>{p.enCours.titre}</h2>
                    <span className="ex-discret">{p.enCours.detail}</span>
                    {e.onRejoindre && (
                      <Bouton variante="secondaire" taille="petit" icone={<Video size={13} aria-hidden />} onClick={e.onRejoindre}>
                        {l.rejoindre}
                      </Bouton>
                    )}
                  </header>
                  <div className="ex-mx02__vignettes">
                    {p.enCours.vignettes.map((v) => (
                      <div key={v.nom} className="ex-mx02__vignette" data-parle={v.parle ? 'oui' : undefined}>
                        <Avatar nom={v.nom} taille={64} />
                        <span className="ex-mx02__etiquette">
                          {v.micro ? <Mic size={11} aria-hidden /> : <MicOff size={11} aria-hidden />}
                          {v.nom}
                          {v.parle && (
                            <i aria-hidden>
                              <u />
                              <u />
                              <u />
                            </i>
                          )}
                        </span>
                      </div>
                    ))}
                    {p.enCours.vous && (
                      <div className="ex-mx02__vignette ex-mx02__vous">
                        <Avatar nom="Moi" taille={34} />
                        <b>{l.vousTitre}</b>
                        <small>{l.vousTexte}</small>
                      </div>
                    )}
                  </div>
                  <ol className="ex-mx02__ordre" aria-label={l.ordre}>
                    {p.enCours.ordre.map((s) => (
                      <li key={s.libelle} data-etat={s.etat} style={{ flex: `${s.minutes} 1 0` }}>
                        <span className="ex-mx02__segment" aria-hidden>
                          <i style={{ width: s.etat === 'fait' ? '100%' : s.etat === 'en-cours' ? `${Math.round(s.remplissage * 100)}%` : '0%' }} />
                        </span>
                        <small>{s.libelle}</small>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {(p.notes || p.actions) && (
                <section className="ex-carte ex-mx02__notes">
                  <div className="ex-mx02__colonnes">
                    {p.notes && (
                      <div className="ex-mx02__col">
                        <header>
                          <h3>{p.notes.titre}</h3>
                          <span className="ex-discret">{p.notes.sous}</span>
                        </header>
                        <ul>
                          {p.notes.lignes.map((n, i) => (
                            <li key={i} style={{ animationDelay: `${i * 70}ms` }}>
                              {n.heure && <span className="ex-mono">{n.heure}</span>}
                              {n.decision && (
                                <span className="ex-puce" data-ton="succes">
                                  <i className="ex-point" aria-hidden />
                                  {l.decision}
                                </span>
                              )}
                              <span>{n.texte}</span>
                            </li>
                          ))}
                          {p.notes.curseur && <li aria-hidden className="ex-mx02__curseur" />}
                        </ul>
                        {p.notes.saisie && <input className="ex-mx02__saisie" placeholder={l.notesSaisie} aria-label={l.notesSaisie} onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.currentTarget.value.trim()) { e.onNote?.(ev.currentTarget.value.trim()); ev.currentTarget.value = ''; } }} />}
                      </div>
                    )}
                    {p.actions && (
                      <div className="ex-mx02__col">
                        <header>
                          <h3>{p.actions.titre}</h3>
                          <span className="ex-discret">{p.actions.sous}</span>
                        </header>
                        <ul>
                          {p.actions.lignes.map((a) => (
                            <li key={a.id} className="ex-mx02__action" data-fait={a.fait ? 'oui' : undefined}>
                              {a.onBasculer ? (
                                <button type="button" className="ex-mx02__case ex-cible" role="checkbox" aria-checked={!!a.fait} aria-label={a.texte} onClick={a.onBasculer}>
                                  {a.fait && <Check size={11} strokeWidth={3} aria-hidden />}
                                </button>
                              ) : (
                                <Avatar nom={a.avatar} taille={24} />
                              )}
                              <span>
                                <b>{a.texte}</b>
                                {a.sous && <small>{a.sous}</small>}
                              </span>
                              <em data-ton={a.etat.ton}>{a.etat.libelle}</em>
                            </li>
                          ))}
                        </ul>
                        {p.actions.saisie && <input className="ex-mx02__saisie" placeholder={l.actionsSaisie} aria-label={l.actionsSaisie} onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.currentTarget.value.trim()) { e.onAction?.(ev.currentTarget.value.trim()); ev.currentTarget.value = ''; } }} />}
                      </div>
                    )}
                  </div>
                  {p.suggestion && (
                    <div className="ex-mx02__suggestion">
                      <IconeEtincelle taille={14} />
                      <span>{p.suggestion.texte}</span>
                      <Bouton variante="primaire" taille="petit" onClick={() => e.onSuggestion?.(true)}>{p.suggestion.oui}</Bouton>
                      <Bouton variante="secondaire" taille="petit" onClick={() => e.onSuggestion?.(false)}>{p.suggestion.non}</Bouton>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          <div className="ex-mx02__droite">
            {p.prochaine && (
              <section className="ex-carte ex-mx02__prochaine" aria-label={p.prochaine.titre}>
                <header>
                  <span className="ex-mx02__icone" aria-hidden>
                    <Video size={18} />
                  </span>
                  <div>
                    <small>{l.prochaine}</small>
                    <h2>{p.prochaine.titre}</h2>
                    <span>{p.prochaine.sous}</span>
                  </div>
                  {p.prochaine.compte && (
                    <span className="ex-mx02__compte">
                      <b>{p.prochaine.compte.valeur}</b>
                      <small>{p.prochaine.compte.sous}</small>
                    </span>
                  )}
                </header>
                <p className="ex-mx02__participants">
                  <span className="ex-mx02__pile" aria-hidden>
                    {p.prochaine.participants.noms.slice(0, 3).map((n) => (
                      <Avatar key={n} nom={n} taille={22} />
                    ))}
                  </span>
                  <span>{p.prochaine.participants.texte}</span>
                  {p.prochaine.document && <small>{p.prochaine.document}</small>}
                </p>
                {p.prochaine.ordre.length > 0 && (
                  <>
                    <p className="ex-mx02__titre-ordre">{l.ordre}</p>
                    <div className="ex-mx02__barre" aria-hidden>
                      {p.prochaine.ordre.map((s, i) => (
                        <i key={i} data-fait={s.fait ? 'oui' : undefined} style={{ flex: `${s.largeur} 1 0` }} />
                      ))}
                    </div>
                    <ul className="ex-mx02__sujets">
                      {p.prochaine.ordre.map((s, i) => (
                        <li key={i}>
                          {s.minutes && <span className="ex-mono">{s.minutes}</span>}
                          <span>{s.titre}</span>
                          {s.fait && <Check size={13} aria-hidden />}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {p.prochaine.avant && (
                  <div className="ex-mx02__avant">
                    <p>
                      <b>{p.prochaine.avant.titre}</b>
                      <span>{p.prochaine.avant.compte}</span>
                    </p>
                    <ul>
                      {p.prochaine.avant.cases.map((c) => (
                        <li key={c.libelle} data-fait={c.fait ? 'oui' : undefined}>
                          <button type="button" className="ex-mx02__case ex-cible" role="checkbox" aria-checked={c.fait} onClick={c.onBasculer} disabled={!c.onBasculer}>
                            {c.fait && <Check size={11} strokeWidth={3} aria-hidden />}
                          </button>
                          <span>{c.libelle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
            {p.avenir.length > 0 && (
              <section className="ex-carte ex-mx02__avenir" aria-labelledby="mx02-avenir">
                <header className="ex-tete">
                  <h2 id="mx02-avenir">{l.avenir}</h2>
                  <span className="ex-discret">{l.avenirPreparation}</span>
                </header>
                <ul>
                  {p.avenir.map((r) => (
                    <li key={r.id}>
                      <button type="button" className="ex-mx02__ligne ex-cible" onClick={() => e.onOuvrir?.(r.id)}>
                        <span className="ex-mono">
                          <b>{r.jour}</b>
                          {r.heure}
                        </span>
                        <span>
                          <b>{r.titre}</b>
                          <small>{r.sous}</small>
                        </span>
                        {r.preparation && (
                          <span className="ex-mx02__prep" data-ton={r.preparation.ton}>
                            <i aria-hidden>
                              <u style={{ width: `${r.preparation.pourcent}%` }} />
                            </i>
                            <em className="ex-mono">{r.preparation.pourcent} %</em>
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
