import React, { useState } from 'react';
import { ArrowRight, Check, Clock, Euro, FileText, Flag, Mail, Plus, Send, Shield, Sparkles, Star, Target, Trophy, Zap } from 'lucide-react';
import { Avatar, Modale, PageHead, PastilleEtat, PileAvatars, SuggestionAjmani } from '../../../../socle/ui';
import { MODULES_SUIVIS, verifierProposition, type ErreurDeProposition, type TypeDeDefi } from '../../defis';
import type { BarreDeRelais, EtiquetteDeJour } from '../../relais';
import { useMots } from './textes';

/** Rien ici ne porte un nombre rattaché à une personne : des totaux d'équipe, des engagements ÉCRITS (§1.10). */
export interface ApportVue { email: string; nom: string; role: string; moi: boolean; engagement: string | null }
export interface HeroVue {
  etat: 'normal' | 'tenu' | 'debut' | 'pause';
  semaine: number;
  /** « se termine ce soir à 19:00 ». */
  fin: string;
  titre: string;
  regle: string;
  /** `null` : rien d'échu, pas de pourcentage. */
  pct: number | null;
  cible: number;
  aTemps: number;
  echus: number;
  barres: BarreDeRelais[];
  action: { n: number; age: string; garde: boolean } | null;
  apports: ApportVue[];
}
export interface EnCoursVue { id: string; titre: string; sous: string; valeur: string; pct: number; ton: 'vert' | 'bleu'; icone: 'euro' | 'bouclier' }
export interface PasseVue { id: string; semaine: string; titre: string; issue: 'Tenu' | 'Terminé'; score: string; medaille: 'cible' | 'etoile' | 'envoi' | 'document' }
export interface CelebrationVue { id: string; etiquette: EtiquetteDeJour & { texte?: string }; icone: 'trophee' | 'coche' | 'euro' | 'etoile' | 'eclair'; titre: string; detail: string }

export interface VueDefisProps {
  /** `null` : aucun défi (état vide). */
  hero: HeroVue | null;
  enCours: EnCoursVue[];
  participants: string[];
  passes: PasseVue[];
  resumePasses: string | null;
  celebrations: CelebrationVue[];
  /** « Fêtez ensemble » : la date proposée en toutes lettres ; `null` : l'astuce à la place. */
  fete: string | null;
  seul: boolean;
  erreur: boolean;
  propositions: string[];
  proposition: { ouverte: boolean };
  onProposer: () => void;
  onFermerProposition: () => void;
  onEnvoyerProposition: (p: { titre: string; type: TypeDeDefi; cible: number; module: string }) => void;
  onHistorique: () => void;
  onVoirAttente: () => void;
  onReserver: () => void;
  onNon: () => void;
  onInviter: () => void;
  onReessayer: () => void;
  onIdees: () => void;
  onPartager: () => void;
}

const MEDAILLES = { cible: Target, etoile: Star, envoi: Send, document: FileText } as const;
const CELEBRATIONS = { trophee: Trophy, coche: Check, euro: Euro, etoile: Star, eclair: Zap } as const;
const R = 96;
const DEMI = Math.PI * R;

export function VueDefis(p: VueDefisProps) {
  const { tm } = useMots();
  const h = p.hero;
  const etiquette = (e: CelebrationVue['etiquette']) => (e.type === 'aujourdhui' ? tm('jour.auj') : e.type === 'hier' ? tm('jour.hier') : e.texte ?? '');
  const jourCourt = (b: BarreDeRelais) => tm(`jour.${b.rang}` as 'jour.1');
  const rempli = h && h.pct !== null ? Math.min(1, h.pct / 100) : 0;
  const repere = h ? Math.min(1, h.cible / 100) : 0;
  // Demi-jauge : de gauche (angle π) à droite (0), par le haut.
  const pt = (t: number, rayon = R) => `${108 - rayon * Math.cos(Math.PI * t)} ${108 - rayon * Math.sin(Math.PI * t)}`;

  return (
    <div className="cr-page jr-defis-page" data-famille="jour" data-ecran="L07">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous')}
        secondaires={[{ libelle: tm('historique'), onClick: p.onHistorique, icone: <Clock size={14} aria-hidden /> }]}
        primaire={{ libelle: tm('proposer'), onClick: p.onProposer, icone: <Plus size={14} aria-hidden /> }}
      />
      <div className="jr-defis">
        <div className="jr-defis__gauche">
          <section className="cr-carte jr-hero" data-mvt="entree" data-etat={h?.etat ?? 'vide'} aria-label={tm('titre')}>
            {p.erreur ? (
              <p className="jr-message">{tm('erreur')}{' '}
                <button type="button" className="jr-lien sc-focus" onClick={p.onReessayer}>{tm('reessayer')}</button>
                </p>
            ) : p.seul ? (
              <div className="jr-vide-defi"><Flag size={22} aria-hidden /><h2>{tm('vide.titre')}</h2><p className="cr-t3">{tm('seul.texte')}</p>
                <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onInviter}>{tm('seul.inviter')}</button>
                </div>
            ) : !h ? (
              <div className="jr-vide-defi"><Target size={22} aria-hidden /><h2>{tm('vide.titre')}</h2><p className="cr-t3">{tm('vide.texte')}</p>
                <p className="jr-vide-defi__actions">
                  <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onProposer}>{tm('proposer')}</button>
                  <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onIdees}>{tm('vide.idees')}</button>
                  </p>
                {p.propositions.length > 0 && <ul className="jr-attente" aria-label={tm('propositions')}>{p.propositions.map((t) => <li key={t}>{tm('proposition.attend', { titre: t })}</li>)}</ul>}</div>
            ) : (
              <>
                <header className="jr-hero__haut">
                  <small className="jr-capitales">{h.etat === 'tenu' ? <b className="jr-tenu">{tm('tenu')}</b> : tm('semaine', { n: h.semaine })}</small>
                  <span className="jr-hero__fin"><i className="jr-vivant" aria-hidden />{h.fin}</span>
                </header>
                <h2>{h.titre}</h2>
                <p className="jr-hero__regle cr-t3">{h.regle}</p>
                {h.etat === 'pause' ? (
                  <p className="jr-message">{tm('pause')}</p>
                ) : (
                  <div className="jr-hero__centre">
                    <figure className="jr-jauge" aria-label={h.pct === null ? tm('rien') : `${h.pct} %`}>
                      <svg viewBox="0 0 216 124" aria-hidden>
                        <path d={`M ${pt(0)} A ${R} ${R} 0 0 1 ${pt(1)}`} className="jr-jauge__piste" />
                        {h.pct !== null && <path d={`M ${pt(0)} A ${R} ${R} 0 0 1 ${pt(rempli)}`} className="jr-jauge__arc" />}
                        <line x1={108 - (R - 9) * Math.cos(Math.PI * repere)} y1={108 - (R - 9) * Math.sin(Math.PI * repere)} x2={108 - (R + 9) * Math.cos(Math.PI * repere)} y2={108 - (R + 9) * Math.sin(Math.PI * repere)} className="jr-jauge__repere" />
                      </svg>
                      <b className="cr-mono">{h.pct === null ? '—' : `${h.pct} %`}</b>
                      <figcaption>{h.pct === null ? tm('rien') : tm('jauge.sous', { a: h.aTemps, e: h.echus, c: h.cible })}</figcaption>
                    </figure>
                    <div className="jr-relais">
                      <p className="jr-relais__tete"><small className="jr-capitales">{tm('relais')}</small>
                        <span className="jr-rl-legende"><i data-t="atemps" aria-hidden />{tm('relais.atemps')}<i data-t="plustard" aria-hidden />{tm('relais.plustard')}<i data-t="attente" aria-hidden />{tm('relais.attente')}</span></p>
                      <ol className="jr-rl-barres">
                        {h.barres.map((b) => (
                          <li key={b.jour} data-courant={b.courant || undefined} style={{ flex: `${Math.max(1, b.echus + b.enAttente)} 1 0` }}>
                            <span className="jr-rl-barre" tabIndex={0} aria-label={tm('relais.jour', { jour: jourCourt(b), a: b.aTemps, e: b.echus })} title={tm('relais.jour', { jour: jourCourt(b), a: b.aTemps, e: b.echus })}  >
                              <i data-t="atemps" style={{ flexGrow: b.parts.aTemps }} /><i data-t="plustard" style={{ flexGrow: b.parts.plusTard }} /><i data-t="attente" style={{ flexGrow: b.parts.enAttente }} />
                            </span>
                            <small><b>{jourCourt(b)}</b> {b.echus + b.enAttente > 0 || b.courant ? tm('relais.sur', { a: b.aTemps, e: b.echus }) : ''}</small>
                          </li>
                        ))}
                      </ol>
                      {h.action && (
                        <p className="jr-action"><Mail size={14} aria-hidden /><span>{tm(h.action.garde ? (h.action.n === 1 ? 'action.garde.1' : 'action.garde') : (h.action.n === 1 ? 'action.rapproche.1' : 'action.rapproche'), { n: h.action.n, age: h.action.age })}</span>
                          <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onVoirAttente}><ArrowRight size={12} aria-hidden /> {tm('action.voir', { n: h.action.n })}</button></p>
                      )}
                      {h.etat === 'tenu' && <p className="jr-action jr-action--bravo"><Check size={14} aria-hidden /><span>{tm('tenu.phrase')}</span></p>}
                    </div>
                  </div>
                )}
                <footer className="jr-apports">
                  <p><small className="jr-capitales">{tm('chacun')}</small><span className="cr-t3">{tm('chacun.note')}</span></p>
                  <ul>
                    {h.apports.map((a) => (
                      <li key={a.email}>
                        <Avatar nom={a.nom} taille={30} enLigne />
                        <div>
                          <b>{a.nom}</b> <small className="cr-t3">· {a.moi ? tm('toi') : tm('participe')}</small>
                          <p className={a.engagement ? '' : 'cr-t3'}>{a.engagement ? `« ${a.engagement} »` : tm('engagement.manque')}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </footer>
              </>
            )}
          </section>

          <section className="cr-carte jr-passes" data-mvt="entree" aria-label={tm('passes')}>
            <header><h2>{tm('passes')}</h2>{p.resumePasses && <span className="cr-t3">{p.resumePasses}</span>}
              <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onHistorique}><Clock size={12} aria-hidden /> {tm('historique')}</button>
              </header>
            {p.passes.length === 0 ? <p className="cr-t3 jr-passes__vide">{tm('passes.vide')}</p> : (
              <ol className="jr-d-frise">
                {p.passes.map((d) => {
                  const Medaille = MEDAILLES[d.medaille];
                  return (
                    <li key={d.id} data-issue={d.issue} tabIndex={0}>
                      <p><span className="jr-d-medaille" aria-hidden><Medaille size={15} /></span><span className="cr-mono">{d.semaine}</span></p>
                      <h3>{d.titre}</h3>
                      <PastilleEtat etat={d.issue === 'Tenu' ? 'succes' : 'neutre'}>{tm(d.issue === 'Tenu' ? 'tenu.pastille' : 'termine.pastille')}</PastilleEtat>
                      <small className="cr-t3">{d.score}</small>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="jr-passes__pied"><Sparkles size={13} aria-hidden /><span>{tm('passes.pied')}</span> <span className="cr-t3">{tm('passes.pied2')}</span></p>
          </section>
        </div>

        <div className="jr-defis__droite">
          <section className="cr-carte jr-aussi" data-mvt="entree" aria-label={tm('aussi')}>
            <h2>{tm('aussi')}{p.participants.length > 0 && <PileAvatars noms={p.participants} taille={20} libelle={p.participants.join(', ')} />}</h2>
            <ul>
              {p.enCours.map((d) => (
                <li key={d.id} data-ton={d.ton} tabIndex={0}>
                  <span className="jr-tuile" aria-hidden>{d.icone === 'euro' ? <Euro size={13} /> : <Shield size={13} />}</span>
                  <div><b>{d.titre}</b><small className="cr-t3">{d.sous}</small></div>
                  <span className="cr-mono jr-aussi__valeur">{d.valeur}</span>
                  <i className="jr-aussi__barre" aria-hidden><u style={{ width: `${d.pct}%` }} /></i>
                </li>
              ))}
            </ul>
          </section>
          <section className="cr-carte jr-celebrations" data-mvt="entree" aria-label={tm('celebrations')}>
            <h2>{tm('celebrations')}<span className="cr-t3">{tm('celebrations.sous')}</span></h2>
            {p.celebrations.length === 0 ? (
              <div className="jr-vide-defi">
                <p className="cr-t3">{tm('celebrations.vide')}</p>
                <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onPartager}>
                  {tm('celebrations.partager')}
                </button>
              </div>
            ) : (
              <ul>
                {p.celebrations.map((c) => {
                  const Icone = CELEBRATIONS[c.icone];
                  return <li key={c.id} data-ton={c.icone}><span className="cr-t3 jr-celebrations__jour">{etiquette(c.etiquette)}</span><span className="jr-tuile" aria-hidden><Icone size={13} /></span><div><b>{c.titre}</b><small className="cr-t3">{c.detail}</small></div></li>;
                })}
              </ul>
            )}
          </section>
          {p.fete ? (
            <SuggestionAjmani titre={tm('fete.titre')} texte={tm('fete.texte', { date: p.fete })} primaire={{ libelle: tm('fete.reserver'), onClick: p.onReserver }} secondaire={{ libelle: tm('fete.non'), onClick: p.onNon }} />
          ) : (
            <p className="jr-astuce"><Sparkles size={13} aria-hidden /> {tm('astuce')}</p>
          )}
        </div>
      </div>
      <Proposer ouverte={p.proposition.ouverte} onFermer={p.onFermerProposition} onEnvoyer={p.onEnvoyerProposition} />
    </div>
  );
}

function Proposer({ ouverte, onFermer, onEnvoyer }: { ouverte: boolean; onFermer: () => void; onEnvoyer: (p: { titre: string; type: TypeDeDefi; cible: number; module: string }) => void }) {
  const { tm } = useMots();
  const [titre, setTitre] = useState('');
  const [cible, setCible] = useState('90');
  const [module, setModule] = useState(MODULES_SUIVIS[0]);
  const [erreurs, setErreurs] = useState<ErreurDeProposition[]>([]);
  const envoyer = () => {
    const proposition = { titre: titre.trim(), type: 'Taux de tenue' as TypeDeDefi, cible: Number(cible), module };
    const e = verifierProposition(proposition);
    setErreurs(e);
    if (e.length === 0) { onEnvoyer(proposition); setTitre(''); }
  };
  return (
    <Modale ouverte={ouverte} onFermer={onFermer} titre={tm('modale.titre')} famille="jour"
      actions={<><button type="button" className="cr-bouton-verre" onClick={onFermer}>{tm('modale.annuler')}</button><button type="button" className="cr-bouton-plein" onClick={envoyer}>{tm('modale.envoyer')}</button></>}>
      <div className="jr-proposer">
        <label>{tm('modale.nom')}<input value={titre} onChange={(e) => setTitre(e.target.value)} /></label>
        <label>{tm('modale.module')}<select value={module} onChange={(e) => setModule(e.target.value)}>{MODULES_SUIVIS.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>{tm('modale.cible')}<input value={cible} inputMode="decimal" onChange={(e) => setCible(e.target.value)} /></label>
        {erreurs.length > 0 && <ul role="alert">{erreurs.map((e) => <li key={e}>{tm(`erreur.${e}` as 'erreur.titre-vide')}</li>)}</ul>}
        <small className="cr-t3">{tm('modale.note')}</small>
      </div>
    </Modale>
  );
}
