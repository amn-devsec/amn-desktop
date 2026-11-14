import React, { useState } from 'react';
import { ArrowRight, Calendar, Check, Clock, Euro, ListChecks, Moon, MoreHorizontal, Plus } from 'lucide-react';
import { Modale, PageHead } from '../../../../socle/ui';
import { estCliquable, segments, type BlocDeJournee, type EcheanceEnTexte, type EtapeDuMatin, type Parcours, type PhraseDEquilibre } from '../../matin';
import { useMots } from './textes';

export interface ResumeDEtape { resume: string; details: string[]; indisponible?: boolean }
export interface ChoixVue { id: string; rang: number; urgent: boolean; categorie: string | null; titre: string; dureeMin: number | null; echeance: EcheanceEnTexte & { jourCourt?: string; dateCourte?: string }; confier: string | null }
export interface AutreVue { id: string; titre: string; contexte: string | null; categorie: string | null; echeance: EcheanceEnTexte & { jourCourt?: string; dateCourte?: string }; confier: string | null }

export interface VueRituelProps {
  prenom: string;
  /** « Vendredi 30 octobre ». */
  dateTexte: string;
  /** « vendredi » pour « voici ton vendredi ». */
  jourNom: string;
  soir: boolean;
  parcours: Parcours;
  etapes: EtapeDuMatin[];
  resumes: Partial<Record<EtapeDuMatin, ResumeDEtape>>;
  minutesEstimees: number | null;
  reprise: number | null;
  choisis: ChoixVue[];
  autres: AutreVue[];
  /** La 4e demande a été refusée (aide remplacée quelques secondes). */
  refus: boolean;
  /** Le nombre de candidates au-delà des trois + trois (lien « Voir toutes mes tâches »). */
  resteCandidates: number;
  aucuneTache: boolean;
  erreur: boolean;
  jour: { debut: number; fin: number; maintenant: number; blocs: BlocDeJournee[]; libreMin: number; totalMin: number; ratio: number; phrase: PhraseDEquilibre | 'sans'; finPrevue: string | null };
  reglages: { ouverts: boolean; heure: string; jours: readonly number[] };
  /** « Confier » en attente de confirmation. */
  confirmation: { titre: string; prenom: string } | null;
  /** Les priorités enregistrées quand le rituel est terminé. */
  termine: { titres: string[] } | null;
  onContinuer: () => void;
  onRetour: () => void;
  onPasser: () => void;
  onRevoir: (i: number) => void;
  onChoisir: (id: string) => void;
  onRetirer: (id: string) => void;
  onDeplacer: (de: number, vers: number) => void;
  onConfier: (id: string) => void;
  onConfirmerConfier: () => void;
  onAnnulerConfier: () => void;
  onCommencer: () => void;
  onRecommencer: () => void;
  onFocus: () => void;
  onJournee: () => void;
  onModifier: () => void;
  onNouvelleTache: () => void;
  onToutes: () => void;
  onReessayer: () => void;
  onReglages: (ouvert: boolean) => void;
  onHeure: (h: string) => void;
  onJours: (j: number[]) => void;
}

const HEURE_PX = 41;
const ICONES = { nuit: Moon, argent: Euro, agenda: Calendar, choses: ListChecks } as const;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function VueRituel(p: VueRituelProps) {
  const { tm } = useMots();
  const n = p.etapes.length;
  const seg = segments(p.parcours, n);
  const dureeTexte = (min: number | null) => (min === null ? null : min >= 60 ? (min % 60 ? tm('heure.min', { h: Math.floor(min / 60), m: String(min % 60).padStart(2, '0') }) : tm('heure.pile', { h: min / 60 })) : tm('min', { n: min }));
  const echeanceTexte = (e: ChoixVue['echeance']) => (e.type === 'avant' ? tm('echeance.avant', { h: e.heure }) : e.type === 'ce-soir' ? tm('echeance.soir') : e.type === 'jour-court' ? e.jourCourt ?? '' : e.type === 'date' ? e.dateCourte ?? '' : '');
  const x = (m: number) => (m - p.jour.debut) * (HEURE_PX / 60);
  const hauteur = (p.jour.fin - p.jour.debut) * (HEURE_PX / 60);
  const heures: number[] = [];
  for (let h = Math.ceil(p.jour.debut / 60); h * 60 <= p.jour.fin; h += 1) heures.push(h);
  const phrase = p.jour.phrase === 'sans' ? tm('equilibre.sans') : p.jour.phrase === 'marge' ? tm('equilibre.marge', { h: p.jour.finPrevue ?? '' }) : tm(`equilibre.${p.jour.phrase}`);
  const pourcent = Math.min(100, Math.round(p.jour.ratio * 100));

  return (
    <div className="cr-page jr-rituel-page" data-famille="jour" data-ecran="L03">
      <PageHead titre={tm('titre')} sousTitre={tm('sous', { date: p.dateTexte })} secondaires={[{ libelle: tm('reglerHeure'), onClick: () => p.onReglages(true), icone: <Clock size={14} aria-hidden /> }]} />
      <div className="jr-rituel">
        <section className="cr-carte jr-matin" data-mvt="entree" aria-label={tm('titre')}>
          <header className="jr-matin__tete">
            <p><b>{tm(p.soir ? 'bonsoir' : 'bonjour', { prenom: p.prenom, jour: p.jourNom })}</b>{!p.termine && <small>{tm('etapes.n', { n: Math.min(n, p.parcours.faites.length), t: n })}{p.minutesEstimees !== null ? ` · ${p.minutesEstimees === 1 ? tm('encore.1') : tm('encore.n', { n: p.minutesEstimees })}` : ''}</small>}</p>
            <ol className="jr-ma-segments" aria-label={tm('progression')}>
              {p.etapes.map((e, i) => <li key={e} data-etat={seg[i]}><i aria-hidden /><span>{seg[i] === 'fait' && <Check size={11} aria-hidden />}{tm(`segment.${e}`)}</span></li>)}
            </ol>
          </header>

          {p.termine ? (
            <div className="jr-pret">
              <h2>{tm('pret.titre')}</h2>
              <p className="cr-t3">{p.termine.titres.length ? tm('pret.texte') : tm('pret.aucune')}</p>
              <ol>{p.termine.titres.map((t, i) => <li key={t}><b className="jr-rang">{i + 1}</b><span>{t}</span></li>)}</ol>
              <p className="jr-pret__actions">
                <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onFocus}><ArrowRight size={13} aria-hidden /> {tm('pret.focus')}</button>
                <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onJournee}>{tm('pret.journee')}</button>
                <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onModifier}>{tm('pret.modifier')}</button>
              </p>
            </div>
          ) : (
            <>
              {p.reprise !== null && <p className="jr-reprise cr-t3">{tm('reprise', { n: p.reprise, t: n })}{' '}
                <button type="button" className="jr-lien sc-focus" onClick={p.onRecommencer}>{tm('recommencer')}</button>
                </p>}
              <ol className="jr-etapes">
                {p.etapes.map((e, i) => {
                  const Icone = ICONES[e];
                  const ouverte = i === p.parcours.ouverte;
                  const faite = p.parcours.faites.includes(i) && !ouverte;
                  const r = p.resumes[e];
                  return (
                    <li key={e} className="jr-etape" data-etat={ouverte ? 'ouverte' : faite ? 'faite' : 'a-venir'}>
                      <span className="jr-ma-rail" aria-hidden>{faite ? <Check size={14} /> : ouverte ? i + 1 : ''}</span>
                      {!ouverte && (
                        <div className="jr-etape__ligne">
                          <Icone size={15} aria-hidden />
                          <b>{tm(`etape.${e}`)}</b>
                          <span>{faite && r ? r.resume : ''}</span>
                          {faite && <button type="button" className="jr-lien sc-focus" onClick={() => p.onRevoir(i)} disabled={!estCliquable(p.parcours, i)}>{tm('revoir')}</button>}
                        </div>
                      )}
                      {ouverte && e !== 'choses' && (
                        <div className="jr-etape__corps">
                          <h2>{tm(`etape.${e}`)}</h2>
                          <p className={r?.indisponible ? 'cr-t3' : ''}>{r?.resume ?? tm('indisponible')}</p>
                          {r && r.details.length > 0 && <ul>{r.details.map((d) => <li key={d}>{d}</li>)}</ul>}
                        </div>
                      )}
                      {ouverte && e === 'choses' && (
                        <div className="jr-etape__corps">
                          <h2>{tm('etape.choses.titre')}<small>{tm('choisies', { n: p.choisis.length })}</small></h2>
                          {p.erreur ? (
                            <p className="jr-message">{tm('erreur')}{' '}
                              <button type="button" className="jr-lien sc-focus" onClick={p.onReessayer}>{tm('reessayer')}</button>
                              </p>
                          ) : p.aucuneTache ? (
                            <div className="jr-ma-vide"><b>{tm('vide.titre')}</b><span className="cr-t3">{tm('vide.texte')}</span>
                              <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onNouvelleTache}>{tm('vide.nouvelle')}</button>
                              </div>
                          ) : (
                            <>
                              <p className="jr-aide cr-t3" role="status">{p.refus ? tm('aide.pleine') : tm('aide')}</p>
                              <ul className="jr-emplacements">
                                {[0, 1, 2].map((k) => {
                                  const c = p.choisis[k];
                                  return c ? <Emplacement key={c.id} c={c} k={k} total={p.choisis.length} dureeTexte={dureeTexte} echeanceTexte={echeanceTexte} p={p} /> : <li key={`l${k}`} className="jr-slot jr-slot--libre"><span>{tm('libre')}</span></li>;
                                })}
                              </ul>
                              {p.autres.length > 0 && (
                                <div className="jr-ma-autres">
                                  <small className="jr-capitales">{tm('autres')}</small>
                                  <ul>
                                    {p.autres.map((a) => (
                                      <li key={a.id}>
                                        <i aria-hidden />
                                        <b>{a.titre}</b>
                                        <span className="cr-t3">{[a.categorie, a.contexte, echeanceTexte(a.echeance)].filter(Boolean).join(' · ')}</span>
                                        <em />
                                        {a.confier && <button type="button" className="jr-confier sc-focus" onClick={() => p.onConfier(a.id)}><span aria-hidden className="jr-confier__av">{a.confier[0]}</span>{tm('confierA', { prenom: a.confier })}</button>}
                                        <button type="button" className="cr-bouton-verre sc-focus jr-choisir" onClick={() => p.onChoisir(a.id)}><Plus size={12} aria-hidden /> {tm('choisir')}</button>
                                      </li>
                                    ))}
                                  </ul>
                                  {p.resteCandidates > 0 && <button type="button" className="jr-lien sc-focus" onClick={p.onToutes}>{tm('toutes')}</button>}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              <footer className="jr-matin__pied">
                <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onRetour} disabled={p.parcours.ouverte === 0}>{tm('retour')}</button>
                <span className="cr-t3">{tm('pied')}</span>
                <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onPasser}>{tm('passer')}</button>
                {p.parcours.ouverte === n - 1
                  ? <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onCommencer}><ArrowRight size={13} aria-hidden /> {tm('cestParti')}</button>
                  : <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onContinuer}><ArrowRight size={13} aria-hidden /> {tm('continuer')}</button>}
              </footer>
            </>
          )}
        </section>

        <aside className="cr-carte jr-dessine" data-mvt="entree" aria-label={tm('colonne.titre')}>
          <h2>{tm('colonne.titre')}<i className="jr-vivant" aria-hidden /></h2>
          <div className="jr-colonne" style={{ height: hauteur }}>
            {heures.map((h) => <span key={h} className="jr-colonne__heure cr-mono" style={{ top: x(h * 60) }}>{h} h</span>)}
            {heures.map((h) => <i key={`f${h}`} className="jr-colonne__filet" style={{ top: x(h * 60) }} aria-hidden />)}
            <div className="jr-colonne__blocs">
              {p.jour.blocs.map((b) => (
                <span key={b.id} className="jr-bloc" data-type={b.type} style={{ top: x(b.debut), height: Math.max(8, x(b.fin) - x(b.debut)) }} title={`${hhmm(b.debut)}–${hhmm(b.fin)}`}>
                  {b.type === 'marge' ? <><b className="cr-mono">{hhmm(b.debut)}</b><span>{tm('colonne.marge')}</span></>
                    : b.type === 'pause' ? <><b className="cr-mono">{hhmm(b.debut)}</b><span>{tm('colonne.dejeuner')}</span></>
                    : <><b className="cr-mono">{hhmm(b.debut)}</b><span>{b.rang ? `${b.rang} · ` : ''}{b.label}</span></>}
                </span>
              ))}
              {p.jour.maintenant >= p.jour.debut && p.jour.maintenant <= p.jour.fin && <span className="jr-colonne__maintenant" style={{ top: x(p.jour.maintenant) }}><i aria-hidden /><b className="cr-mono">{tm('colonne.rituel', { h: hhmm(p.jour.maintenant) })}</b></span>}
            </div>
          </div>
          <footer className="jr-equilibre">
            <p><b>{dureeTexte(p.jour.totalMin) ?? '0'}</b> <span className="cr-t3">{dureeTexte(p.jour.libreMin) ?? '0'} {tm('equilibre.libre')}</span></p>
            <div className="jr-equilibre__barre" role="img" aria-label={`${pourcent} %`}><i style={{ width: `${pourcent}%` }} /><u aria-hidden style={{ left: '60%' }} /></div>
            <p className="jr-equilibre__phrase">{phrase}</p>
          </footer>
        </aside>
      </div>

      <Modale ouverte={p.confirmation !== null} onFermer={p.onAnnulerConfier} titre={p.confirmation ? tm('confier.titre', { titre: p.confirmation.titre, prenom: p.confirmation.prenom }) : ''} famille="jour"
        actions={<><button type="button" className="cr-bouton-verre" onClick={p.onAnnulerConfier}>{tm('confier.non')}</button><button type="button" className="cr-bouton-plein" onClick={p.onConfirmerConfier}>{tm('confier.ok')}</button></>}>
        <></>
      </Modale>
      <Modale ouverte={p.reglages.ouverts} onFermer={() => p.onReglages(false)} titre={tm('reglages.titre')} famille="jour" actions={<button type="button" className="cr-bouton-plein" onClick={() => p.onReglages(false)}>{tm('reglages.fermer')}</button>}>
        <fieldset className="jr-reglages">
          <legend>{tm('reglages.heure')}</legend>
          <input type="time" value={p.reglages.heure} onChange={(e) => p.onHeure(e.target.value)} aria-label={tm('reglages.heure')} className="jr-heure" />
          <legend>{tm('reglages.jours')}</legend>
          <div role="group" aria-label={tm('reglages.jours')}>
            {[1, 2, 3, 4, 5, 6, 7].map((j) => <button key={j} type="button" role="checkbox" aria-checked={p.reglages.jours.includes(j)} className="cr-bouton-verre sc-focus" onClick={() => p.onJours(p.reglages.jours.includes(j) ? p.reglages.jours.filter((x2) => x2 !== j) : [...p.reglages.jours, j])}>{tm(`jour.${j}` as 'jour.1')}</button>)}
          </div>
          <small className="cr-t3">{tm('reglages.note')}</small>
        </fieldset>
      </Modale>
    </div>
  );
}

function Emplacement({ c, k, total, dureeTexte, echeanceTexte, p }: { c: ChoixVue; k: number; total: number; dureeTexte: (m: number | null) => string | null; echeanceTexte: (e: ChoixVue['echeance']) => string; p: VueRituelProps }) {
  const { tm } = useMots();
  const [menu, setMenu] = useState(false);
  const duree = dureeTexte(c.dureeMin);
  return (
    <li
      className="jr-slot"
      draggable
      tabIndex={0}
      aria-label={`${c.rang} · ${c.titre}`}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(k))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const de = Number(e.dataTransfer.getData('text/plain')); if (Number.isInteger(de)) p.onDeplacer(de, k); }}
      onKeyDown={(e) => {
        if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); p.onDeplacer(k, k - 1); }
        if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); p.onDeplacer(k, Math.min(total - 1, k + 1)); }
      }}
    >
      <p><b className="jr-rang">{c.rang}</b>{c.urgent ? <span className="jr-ma-urgent">{tm('urgent')}</span> : c.categorie ? <small className="cr-t3">{c.categorie}</small> : null}
        <button type="button" className="jr-menu sc-focus" aria-label={tm('menu', { titre: c.titre })} aria-expanded={menu} onClick={() => setMenu(!menu)}><MoreHorizontal size={14} aria-hidden /></button></p>
      <h3>{c.titre}</h3>
      <p className="jr-slot__pied cr-t3"><Clock size={12} aria-hidden />{duree && <span>{duree}</span>}{echeanceTexte(c.echeance) && <span>· {echeanceTexte(c.echeance)}</span>}</p>
      {menu && (
        <span className="jr-menu__liste" role="menu">
          <button type="button" role="menuitem" className="sc-focus" onClick={() => { setMenu(false); p.onRetirer(c.id); }}>{tm('retirer')}</button>
          {c.confier && <button type="button" role="menuitem" className="sc-focus" onClick={() => { setMenu(false); p.onConfier(c.id); }}>{tm('confierA', { prenom: c.confier })}</button>}
        </span>
      )}
    </li>
  );
}
