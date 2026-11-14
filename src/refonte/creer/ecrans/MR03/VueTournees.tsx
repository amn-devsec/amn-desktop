import React, { useState } from 'react';
import { Check, Home, Minus, Plus, Sparkles, Truck } from 'lucide-react';
import { PageHead, Segmente } from '../../../../socle/ui';
import { formaterDuree } from '../../commun';
import { useMots, type CleMR03 } from './textes';
import { etatDeLaTournee, positionDuVehicule, segmentsDuTrajet, type EtapeCalculee, type Point, type Resume } from '../../tournees';
import '../../creer.css';

export interface EtapeVue extends EtapeCalculee { adresse: string; note?: string }

export interface VueTourneesProps {
  sousTitre: string;
  dateLibelle: string;
  vehicule: string;
  resume: Resume;
  gain: { km: number; min: number } | null;
  etapes: EtapeVue[];
  /** Position de chaque point (0–100) : `points[0]` est le départ, puis une entrée par étape. Plan SCHÉMATIQUE : aucun géocodage. */
  points: Point[];
  conducteur: string;
  enRouteDans: number | null;
  retourVers: string | null;
  villes?: { nom: string; x: number; y: number }[];
  avantDepart: { id: string; libelle: string; fait: boolean }[];
  suggestion?: string;
  periode: 'aujourdhui' | 'demain' | 'semaine';
  onPeriode: (p: 'aujourdhui' | 'demain' | 'semaine') => void;
  onAjouter?: () => void;
  onOptimiser?: () => void;
  onPartir?: (id: string) => void;
  onArrive?: (id: string) => void;
  onPrevenir?: (id: string) => void;
  onCocher?: (id: string) => void;
  onProgrammer?: () => void;
  onNon?: () => void;
}

const W = 760;
const H = 650;
const px = (p: Point) => ({ x: (p.x / 100) * W, y: (p.y / 100) * H });

export function VueTournees(p: VueTourneesProps) {
  const { tm } = useMots();
  const [zoom, setZoom] = useState(1);
  const etats = p.etapes.map((e) => e.etatNorm);
  const etat = etatDeLaTournee(p.etapes);
  const segs = segmentsDuTrajet(p.points, etats, true);
  const iRoute = etats.indexOf('En route');
  const faites = etats.filter((e) => e === 'Terminé').length;
  const prochaine = etats.findIndex((e) => e !== 'Terminé');
  const veh = iRoute >= 0 ? positionDuVehicule(p.points[iRoute], p.points[iRoute + 1], 0, 40, 40 - (p.enRouteDans ?? 18)) : null;
  const trait = (t: string) => (t === 'fait' ? 'var(--socle-etat-succes)' : t === 'en-route' ? 'var(--socle-etat-info)' : t === 'retour' ? 'var(--socle-trait-tres-discret)' : 'var(--socle-trait-discret)');
  const fait = p.avantDepart.filter((a) => a.fait).length;
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR03">
      <PageHead
        titre={tm('titre')}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: tm('optimiser'), onClick: p.onOptimiser ?? (() => undefined) }]}
        primaire={{ libelle: tm('ajouter'), onClick: p.onAjouter ?? (() => undefined) }}
      />
      <div className="cr-tournees">
        <section className="cr-carte cr-plan" data-mvt="entree" aria-label={tm('titre')}>
          <svg className="cr-plan__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ transform: `scale(${zoom})` }} role="img" aria-label={tm('titre')}>
            <path d={`M0 ${H * 0.42} Q ${W * 0.35} ${H * 0.36} ${W} ${H * 0.55}`} className="cr-plan__route" />
            <path d={`M0 ${H * 0.78} Q ${W * 0.4} ${H * 0.6} ${W} ${H * 0.86} L ${W} ${H * 0.95} Q ${W * 0.4} ${H * 0.7} 0 ${H * 0.9} Z`} className="cr-plan__seine" />
            {segs.map((s, i) => {
              const a = px(s.de);
              const b = px(s.vers);
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={trait(s.trait)} strokeWidth={s.trait === 'retour' ? 1 : 3} strokeDasharray={s.trait === 'fait' ? undefined : s.trait === 'en-route' ? '5 6' : '6 6'} strokeLinecap="round" className={s.trait === 'en-route' ? 'cr-plan__flux' : undefined} />;
            })}
          </svg>
          {(p.villes ?? []).map((v) => <span key={v.nom} className="cr-plan__ville" style={{ left: `${v.x}%`, top: `${v.y}%` }}>{v.nom}</span>)}
          {p.points[0] && <span className="cr-plan__depart" style={{ left: `${p.points[0].x}%`, top: `${p.points[0].y}%` }}><Home size={12} aria-hidden /><small>{tm('depart')}</small></span>}
          {p.etapes.map((e, i) => {
            const pt = p.points[i + 1];
            if (!pt) return null;
            return (
              <span key={e.id} className="cr-arret" data-etat={i === prochaine ? 'prochaine' : e.etatNorm === 'Terminé' ? 'fait' : 'avenir'} style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
                <i>{i + 1}</i><b>{e.lieu} <small className="cr-mono">{e.arriveeEstimee}</small></b>
              </span>
            );
          })}
          {veh && <span className="cr-vehicule" style={{ left: `${veh.x}%`, top: `${veh.y}%` }}><i><Truck size={14} aria-hidden /></i><small>{p.conducteur} · {tm('etape.enRoute', { n: p.enRouteDans ?? 0 }).replace(/^.*· /, '')}</small></span>}
          <div className="cr-plan__resume">
            <b>{p.dateLibelle} <small>{p.vehicule}</small></b>
            <dl className="cr-mono">
              <div><dt>{p.resume.distanceKm} km</dt><dd>{tm('resume.distance')}</dd></div>
              <div><dt>{formaterDuree(p.resume.routeMin)}</dt><dd>{tm('resume.route')}</dd></div>
              <div><dt>{formaterDuree(p.resume.surPlaceMin)}</dt><dd>{tm('resume.surPlace')}</dd></div>
              <div data-ton={p.resume.ton}><dt>{p.resume.retardMin} min</dt><dd>{tm('resume.retard')}</dd></div>
            </dl>
            {p.gain && <p><Sparkles size={12} aria-hidden /> {tm('resume.gain', { km: p.gain.km, min: p.gain.min })}</p>}
          </div>
          <div className="cr-plan__periode"><Segmente taille="compact" libelle={tm('jour.libelle')} valeur={p.periode} onChange={(v) => p.onPeriode(v as typeof p.periode)} options={(['aujourdhui', 'demain', 'semaine'] as const).map((k) => ({ cle: k, libelle: tm(`jour.${k}` as CleMR03) }))} /></div>
          <div className="cr-plan__zoom">
            <button type="button" aria-label={tm('zoom.plus')} onClick={() => setZoom((z) => Math.min(1.6, z + 0.2))}><Plus size={14} aria-hidden /></button>
            <button type="button" aria-label={tm('zoom.moins')} onClick={() => setZoom((z) => Math.max(1, z - 0.2))}><Minus size={14} aria-hidden /></button>
          </div>
          <div className="cr-plan__legende"><span data-t="fait" />{tm('legende.fait')} <span data-t="route" />{tm('legende.enRoute')} <span data-t="avenir" />{tm('legende.aVenir')}</div>
          {p.suggestion && (
            <div className="cr-plan__ajmani">
              <Sparkles size={13} aria-hidden /><p>{p.suggestion}</p>
              <button type="button" className="cr-bouton-plein" onClick={p.onProgrammer}>{tm('suggestion.programmer')}</button>
              <button type="button" className="cr-bouton-verre" onClick={p.onNon}>{tm('suggestion.non')}</button>
            </div>
          )}
        </section>
        <aside className="cr-tournees__droite">
          <section className="cr-carte cr-etapes" data-mvt="entree" aria-label={tm('etapes.titre')}>
            <header><b>{tm('etapes.titre')}</b><small>{etat === 'bouclee' ? tm('bouclee') : tm('etapes.faites', { f: faites, t: p.etapes.length })}</small></header>
            <span className="cr-relecture__barre"><i style={{ width: `${p.etapes.length ? (faites / p.etapes.length) * 100 : 0}%`, background: 'var(--socle-etat-succes)' }} /></span>
            {p.etapes.length === 0 ? <p className="cr-t3" style={{ padding: 16 }}>{tm('vide.titre')}</p> : (
              <ol>
                {p.etapes.map((e, i) => (
                  <li key={e.id} className="cr-etape" data-etat={e.etatNorm} data-actuelle={i === prochaine}>
                    <span className="cr-mono cr-etape__heure">{e.heureFixee ?? e.arriveeEstimee}</span>
                    <i className="cr-etape__marque">{e.etatNorm === 'Terminé' ? <Check size={12} aria-hidden /> : i + 1}</i>
                    <div>
                      <b>{e.lieu}</b>
                      <small>{e.adresseAVerifier ? tm('etape.adresse') : e.adresse}</small>
                      <small>{[tm('etape.surPlace', { duree: formaterDuree(e.dureeMin) }), e.arriveeReelle ? tm('etape.arrive', { heure: e.arriveeReelle }) : e.heureFixee ? tm('etape.fixe') : null].filter(Boolean).join(' · ')}</small>
                      {e.etatNorm === 'En route' && (
                        <div className="cr-etape__route">
                          <span><Truck size={12} aria-hidden /> {tm('etape.enRoute', { n: p.enRouteDans ?? 0 })}</span>
                          <span>
                            <button type="button" className="cr-bouton-verre" onClick={() => p.onPrevenir?.(e.id)}>{tm('etape.prevenir')}</button>
                            <button type="button" className="cr-bouton-verre" onClick={() => p.onArrive?.(e.id)}>{tm('etape.arrive.bouton')}</button>
                          </span>
                        </div>
                      )}
                      {e.etatNorm === 'À venir' && i === prochaine && iRoute < 0 && (
                        <button type="button" className="cr-bouton-verre" style={{ marginTop: 6 }} onClick={() => p.onPartir?.(e.id)}>{tm('etape.partir')}</button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {p.retourVers && <footer><Home size={13} aria-hidden /> {tm('retour', { heure: p.retourVers })}</footer>}
          </section>
          <section className="cr-carte cr-avant" data-mvt="entree" aria-label={tm('avant.titre')}>
            <header><b>{tm('avant.titre')}</b><small>{tm('avant.fait', { f: fait, t: p.avantDepart.length })}</small></header>
            <span className="cr-relecture__barre"><i style={{ width: `${p.avantDepart.length ? (fait / p.avantDepart.length) * 100 : 0}%` }} /></span>
            {p.avantDepart.map((a) => (
              <button key={a.id} type="button" className="cr-controle sc-focus" data-fait={a.fait} onClick={() => p.onCocher?.(a.id)} aria-pressed={a.fait}><i>{a.fait ? '✓' : ''}</i>{a.libelle}</button>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
