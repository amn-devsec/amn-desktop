import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Image as ImageIcon, PenLine, Star, Wrench, X } from 'lucide-react';
import { AnneauProgression, PageHead, SuggestionAjmani } from '../../../../socle/ui';
import { hhmmDe, INSECABLE, jourEtMois, jourParis, minutesParis, ecartJours, type Jour } from '../../commun';
import {
  compterLesPoints, conformiteDuControle, conformiteDuMois, controlesDuMois, ouIlsArrivent, pareto, peutSigner,
  type EcartEntree, type ControleEntree, type Verdict,
} from '../../qualite';
import { useMots, type CleMR11 } from './textes';
import '../../creer.css';

export interface NoteDEcart { texte: string; ton: 'orange' | 'rouge'; responsable?: string; echeance?: string }
export interface PointVue { id: string; numero: string; sectionId: string; libelle: string; photo?: boolean; verdict: Verdict; note?: NoteDEcart }
export interface ControleVue {
  id: string;
  titre: string;
  auteur: string;
  /** L'instant du contrôle (ISO). */
  instant: string;
  /** Chantier ou client. */
  lieu?: string;
  sections: { id: string; titre: string }[];
  points: PointVue[];
  signeLe?: Jour | null;
}

export interface VueQualiteProps {
  controles: ControleVue[];
  ecarts: EcartEntree[];
  /** Les écarts sont-ils enregistrés ? Sinon le Pareto dit pourquoi il est vide. */
  ecartsDisponibles?: boolean;
  aujourdhui: Jour;
  /** Écarts relevés par contrôle (pour « validés du premier coup »). */
  ecartsParControle?: Readonly<Record<string, number>>;
  objectifPct?: number;
  /** Les verdicts qu'on peut poser ; les autres sont grisés avec la raison. */
  verdictsPossibles?: readonly Verdict[];
  onVerdict?: (controleId: string, pointId: string, verdict: Verdict) => void;
  onSigner?: (controleId: string) => void;
  onNouveau?: () => void;
  onModeles?: () => void;
  onAction?: (controleId: string) => void;
  suggestion?: { titre: string; texte: string };
  onPlanifier?: () => void;
  onNon?: () => void;
  suggestionMasquee?: boolean;
  /** Le contrôle affiché au départ (0 : le plus récent). */
  indexInitial?: number;
}

const CHOIX: readonly Exclude<Verdict, 'a-verifier'>[] = ['conforme', 'non-conforme', 'sans-objet'];
const POINTS_VISIBLES_PAR_SECTION = 4;
const OBJECTIF_PAR_DEFAUT = 95;

/** Le repère de résultat d'un point : coche pleine, croix cerclée ou cercle pointillé. Le sens passe aussi par le mot du verdict. */
function Repere({ verdict }: { verdict: Verdict }) {
  return (
    <span className="cr-q-repere" data-verdict={verdict} aria-hidden>
      {verdict === 'conforme' ? <Check size={11} strokeWidth={3} /> : verdict === 'non-conforme' ? <X size={11} strokeWidth={3} /> : null}
    </span>
  );
}

export function VueQualite(p: VueQualiteProps) {
  const { tm, langue } = useMots();
  const [index, setIndex] = useState(p.indexInitial ?? 0);
  const [ouvert, setOuvert] = useState(false);
  const entrees: ControleEntree[] = useMemo(() => p.controles.map((c) => ({
    id: c.id, le: jourParis(c.instant), signeLe: c.signeLe ?? null, pointsIds: c.points.map((x) => x.id),
    resultats: c.points.map((x) => ({ pointId: x.id, conforme: x.verdict === 'conforme' ? true : x.verdict === 'non-conforme' ? false : null, sansObjet: x.verdict === 'sans-objet' })),
  })), [p.controles]);
  /** Les contrôles du mois, du plus récent au plus ancien. */
  const mois = useMemo(() => controlesDuMois(entrees, p.aujourdhui).flatMap((e) => p.controles.filter((c) => c.id === e.id)), [entrees, p.controles, p.aujourdhui]);
  const courant = mois[Math.min(index, Math.max(0, mois.length - 1))] ?? null;
  const entree = courant ? entrees.find((e) => e.id === courant.id) ?? null : null;
  const k = entree ? compterLesPoints(entree) : null;
  const conf = entree ? conformiteDuControle(entree) : null;
  const signature = entree ? peutSigner(entree) : { ok: false, restants: 0 };
  const duMois = useMemo(() => conformiteDuMois(entrees, p.ecartsParControle ?? {}, p.aujourdhui), [entrees, p.ecartsParControle, p.aujourdhui]);
  const par = useMemo(() => pareto(p.ecarts, p.aujourdhui), [p.ecarts, p.aujourdhui]);
  const ou = useMemo(() => ouIlsArrivent(p.ecarts, p.aujourdhui), [p.ecarts, p.aujourdhui]);
  const possibles = p.verdictsPossibles ?? CHOIX;
  const objectif = p.objectifPct ?? OBJECTIF_PAR_DEFAUT;

  const quand = (iso: string): string => {
    const j = jourParis(iso);
    const hhmm = hhmmDe(minutesParis(iso));
    const ecart = ecartJours(j, p.aujourdhui);
    return `${ecart === 0 ? (langue === 'fr' ? 'aujourd’hui' : 'today') : ecart === 1 ? (langue === 'fr' ? 'hier' : 'yesterday') : jourEtMois(j, langue)} ${hhmm}`;
  };

  const sousTitre = duMois.pct === null ? tm('sous') : `${tm('sous')} · ${tm('sous.conformite', { pct: duMois.pct })}`;
  const visibles = (c: ControleVue) => c.sections.flatMap((s) => c.points.filter((x) => x.sectionId === s.id).slice(0, POINTS_VISIBLES_PAR_SECTION).map((x) => x.id));

  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR11">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        secondaires={[{ libelle: tm('modeles'), onClick: p.onModeles ?? (() => undefined) }]}
        primaire={{ libelle: tm('nouveau'), onClick: p.onNouveau ?? (() => undefined) }}
      />
      <div className="cr-q">
        <section className="cr-carte cr-q-doc" data-mvt="entree" aria-label={courant?.titre ?? tm('titre')}>
          {!courant || !k || !conf || !entree ? (
            <div className="cr-fl-vide">
              <Check size={28} aria-hidden /><h2>{tm('vide.titre')}</h2><p className="cr-t3">{tm('vide.texte')}</p>
              <button type="button" className="cr-bouton-plein" onClick={p.onNouveau}>{tm('nouveau')}</button>
            </div>
          ) : (
            <>
              <header>
                <div className="cr-q-doc__tete">
                  <small className="cr-q-nav">
                    {tm('controle.n', { i: Math.min(index, mois.length - 1) + 1, n: mois.length })}
                    <button type="button" className="cr-q-ib sc-focus" aria-label={tm('controle.precedent')} title={tm('controle.precedent')} disabled={index <= 0} onClick={() => { setIndex((i) => Math.max(0, i - 1)); setOuvert(false); }}><ChevronLeft size={14} aria-hidden /></button>
                    <button type="button" className="cr-q-ib sc-focus" aria-label={tm('controle.suivant')} title={tm('controle.suivant')} disabled={index >= mois.length - 1} onClick={() => { setIndex((i) => Math.min(mois.length - 1, i + 1)); setOuvert(false); }}><ChevronRight size={14} aria-hidden /></button>
                  </small>
                  <h2>{courant.titre}</h2>
                  <span className="cr-q-auteur"><span className="cr-avatar cr-avatar--m" aria-hidden>{courant.auteur[0]}</span>{[courant.auteur, quand(courant.instant), courant.lieu, tm('controle.liste', { n: k.total })].filter(Boolean).join(' · ')}</span>
                </div>
                <dl className="cr-q-compteurs">
                  <div data-ton="succes"><dt>{tm('compteur.conformes')}</dt><dd className="cr-mono">{k.conformes}</dd></div>
                  <div data-ton="critique"><dt>{tm('compteur.nonConformes')}</dt><dd className="cr-mono">{k.nonConformes}</dd></div>
                  <div data-ton="attention"><dt>{tm('compteur.aVerifier')}</dt><dd className="cr-mono">{k.aVerifier}</dd></div>
                </dl>
              </header>
              <div className="cr-q-barre" role="img" aria-label={tm('barre.libelle')}>
                {courant.points.map((x) => <i key={x.id} data-verdict={x.verdict} />)}
              </div>
              <div className="cr-q-corps">
                {courant.sections.map((s) => {
                  const tous = courant.points.filter((x) => x.sectionId === s.id);
                  const montres = ouvert ? tous : tous.filter((x) => visibles(courant).includes(x.id));
                  if (montres.length === 0) return null;
                  return (
                    <div key={s.id} className="cr-q-section">
                      {courant.sections.length > 1 || s.titre ? <h3>{s.titre}</h3> : null}
                      {montres.map((x) => (
                        <React.Fragment key={x.id}>
                          <div className="cr-q-ligne" data-verdict={x.verdict}>
                            <span className="cr-q-num cr-mono">{x.numero}</span>
                            <Repere verdict={x.verdict} />
                            <span className="cr-q-libelle">{x.libelle}</span>
                            {x.photo ? <span className="cr-q-photo" title={tm('preuve')}><ImageIcon size={14} aria-hidden /><span className="sr-only">{tm('preuve')}</span></span> : <span aria-hidden />}
                            {x.verdict === 'a-verifier' && !courant.signeLe ? (
                              <VerdictChoix c={courant} x={x} possibles={possibles} onVerdict={p.onVerdict} pointille />
                            ) : <VerdictChoix c={courant} x={x} possibles={possibles} onVerdict={p.onVerdict} />}
                          </div>
                          {x.note && (
                            <p className="cr-q-note" data-ton={x.note.ton}>
                              <span>{x.note.texte}</span>
                              {(x.note.responsable || x.note.echeance) && <small><PenLine size={12} aria-hidden />{[x.note.responsable, x.note.echeance].filter(Boolean).join(' · ')}</small>}
                            </p>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })}
                {courant.points.length > visibles(courant).length && (
                  <button type="button" className="cr-q-repli sc-focus" aria-expanded={ouvert} onClick={() => setOuvert((o) => !o)}>
                    <ChevronDown size={14} aria-hidden data-ouvert={ouvert} />
                    {(() => {
                      const cachees = courant.points.filter((x) => !visibles(courant).includes(x.id));
                      const c = cachees.filter((x) => x.verdict === 'conforme').length;
                      const nc = cachees.filter((x) => x.verdict === 'non-conforme').length;
                      const v = cachees.filter((x) => x.verdict === 'a-verifier').length;
                      return `${tm('repli.autres', { n: cachees.length })} · ${nc > 0 ? tm('repli.detail.nc', { c, nc, v }) : tm('repli.detail', { c, v })}`;
                    })()}
                  </button>
                )}
              </div>
              <footer>
                {courant.signeLe ? (
                  <span className="cr-q-signe"><b className="cr-mono" data-ton={conf.ton}>{conf.pct}{INSECABLE}%</b>{tm('signe', { qui: courant.auteur, date: jourEtMois(courant.signeLe, langue) })}</span>
                ) : (
                  <span className="cr-q-conf">{tm('pied.conformite')} <b className="cr-mono" data-ton={conf.ton} title={conf.provisoire ? tm('pied.provisoire') : undefined}>{conf.pct}{INSECABLE}%</b></span>
                )}
                <button type="button" className="cr-bouton-verre sc-focus" disabled={!p.onAction || k.nonConformes === 0} title={p.onAction ? undefined : tm('pied.action.indispo')} onClick={() => p.onAction?.(courant.id)}><Wrench size={13} aria-hidden /> {tm('pied.action')}</button>
                <button type="button" className="cr-bouton-verre sc-focus" disabled={!signature.ok || !p.onSigner} title={courant.signeLe ? tm('pied.signer.deja') : signature.restants > 0 ? tm('pied.signer.restants', { n: signature.restants }) : undefined} onClick={() => p.onSigner?.(courant.id)}><PenLine size={13} aria-hidden /> {tm('pied.signer')}</button>
              </footer>
            </>
          )}
        </section>
        <aside className="cr-q-droite">
          <section className="cr-carte cr-q-pareto" data-mvt="entree" aria-label={tm('ecarts.titre')}>
            <header><b>{tm('ecarts.titre')}</b>{par.total > 0 && <small>{tm('ecarts.sous', { n: par.total })}</small>}</header>
            {par.total === 0 ? (
              <p className="cr-t3 cr-q-vide">{p.ecartsDisponibles === false ? tm('ecarts.indispo') : tm('ecarts.aucun')}</p>
            ) : (
              <>
                <ul className="cr-q-legende"><li><i data-t="barre" aria-hidden />{tm('ecarts.nombre')}</li><li><i data-t="ligne" aria-hidden />{tm('ecarts.cumul')}</li></ul>
                <GraphiquePareto barres={par.barres} tm={tm} />
                <p className="cr-q-phrase">
                  {tm(par.causesDominantes > 1 ? 'ecarts.phrase' : 'ecarts.phrase.1', { n: par.causesDominantes, pct: par.partDominantesPct })}{' '}
                  {par.barres[0] && tm(par.barres[0].cumulPct >= 50 ? 'ecarts.conseil.plus' : par.barres[0].cumulPct >= 40 ? 'ecarts.conseil.moitie' : 'ecarts.conseil.part', { cause: par.barres[0].cause.toLowerCase(), pct: par.barres[0].cumulPct })}
                </p>
                {ou.length > 0 && (
                  <div className="cr-q-ou">
                    <small>{tm('ou.titre')}</small>
                    <ul>{ou.map((o) => <li key={o.lieu || 'autres'}>{o.lieu || tm('ou.autres')} <b className="cr-mono">{o.nombre}</b></li>)}</ul>
                  </div>
                )}
              </>
            )}
          </section>
          <section className="cr-carte cr-q-mois" data-mvt="entree" aria-label={tm('mois.titre')}>
            <AnneauProgression valeur={(duMois.pct ?? 0) / 100} libelle={tm('mois.libelle', { pct: duMois.pct ?? 0 })} taille={58} epaisseur={5} ton={duMois.pct === null ? 'neutre' : duMois.pct >= 90 ? 'succes' : duMois.pct >= 70 ? 'attention' : 'critique'}>
              <b className="cr-mono">{duMois.pct === null ? '--' : `${duMois.pct}${INSECABLE}%`}</b>
            </AnneauProgression>
            <div>
              <b>{tm('mois.titre')}</b>
              <small>{duMois.signes === 0 ? tm('mois.detail.aucun') : tm('mois.detail', { n: mois.length, objectif })}</small>
              {duMois.signes > 0 && p.ecartsDisponibles !== false && <span><Star size={13} aria-hidden />{tm('mois.premierCoup', { n: duMois.premierCoup, t: duMois.signes })}</span>}
            </div>
          </section>
          {p.suggestion && !p.suggestionMasquee && (
            <SuggestionAjmani titre={p.suggestion.titre} texte={p.suggestion.texte} primaire={{ libelle: tm('suggestion.planifier'), onClick: p.onPlanifier ?? (() => undefined) }} secondaire={{ libelle: tm('suggestion.non'), onClick: p.onNon ?? (() => undefined) }} />
          )}
        </aside>
      </div>
    </div>
  );
}

function VerdictChoix({ c, x, possibles, onVerdict, pointille = false }: { c: ControleVue; x: PointVue; possibles: readonly Verdict[]; onVerdict?: VueQualiteProps['onVerdict']; pointille?: boolean }) {
  const { tm } = useMots();
  const fige = Boolean(c.signeLe) || !onVerdict;
  if (pointille && fige) return <span className="cr-q-pastille"><Clock size={12} aria-hidden />{tm('verdict.a-verifier')}</span>;
  return (
    <span className="cr-q-verdict" role="radiogroup" aria-label={tm('verdict.libelle', { n: x.numero })}>
      {CHOIX.map((v) => {
        const actif = x.verdict === v;
        const dispo = possibles.includes(v);
        return (
          <button key={v} type="button" role="radio" aria-checked={actif} disabled={fige || (!dispo && !actif)} data-actif={actif} data-verdict={v} title={dispo ? undefined : tm('verdict.indispo')} className="sc-focus" onClick={() => onVerdict?.(c.id, x.id, actif ? 'a-verifier' : v)}>
            {tm(`verdict.${v}` as CleMR11)}
          </button>
        );
      })}
    </span>
  );
}

function GraphiquePareto({ barres, tm }: { barres: ReturnType<typeof pareto>['barres']; tm: (c: CleMR11, p?: Record<string, string | number>) => string }) {
  const vues = barres.slice(0, 6);
  const max = Math.max(1, ...vues.map((b) => b.nombre));
  const pas = max > 10 ? 5 : 2;
  const haut = Math.ceil((max + 0.5) / pas) * pas;
  const X0 = 34, X1 = 296, Y0 = 16, Y1 = 156;
  const larg = (X1 - X0) / vues.length;
  const yN = (n: number) => Y1 - ((Y1 - Y0) * n) / haut;
  const yP = (pct: number) => Y1 - ((Y1 - Y0) * pct) / 100;
  const cx = (i: number) => X0 + larg * (i + 0.5);
  const graduations = Array.from({ length: haut / pas + 1 }, (_, i) => i * pas);
  return (
    <svg className="cr-q-svg" viewBox="0 0 340 190" role="img" aria-label={tm('ecarts.titre')}>
      {graduations.map((g) => <text key={g} x={X0 - 10} y={yN(g) + 4} textAnchor="end" className="cr-q-axe">{g}</text>)}
      <line x1={X0} x2={X1} y1={yP(80)} y2={yP(80)} className="cr-q-seuil" />
      <text x={X1 + 8} y={yP(100) + 4} className="cr-q-axe">100</text>
      <text x={X1 + 8} y={yP(80) + 4} className="cr-q-axe">{tm('ecarts.seuil')}</text>
      {vues.map((b, i) => (
        <g key={b.cause}>
          <title>{tm('ecarts.survol', { cause: b.cause, n: b.nombre, pct: b.cumulPct })}</title>
          <rect x={cx(i) - larg * 0.34} y={yN(b.nombre)} width={larg * 0.68} height={Y1 - yN(b.nombre)} rx={3} className="cr-q-barre-p" data-ton={b.ton ?? 'neutre'} />
          <text x={cx(i)} y={yN(b.nombre) - 8} textAnchor="middle" className="cr-q-val">{b.nombre}</text>
          <text x={cx(i)} y={Y1 + 16} textAnchor="middle" className="cr-q-cause">{b.cause}</text>
        </g>
      ))}
      <polyline className="cr-q-courbe" fill="none" points={vues.map((b, i) => `${cx(i)},${yP(b.cumulPct)}`).join(' ')} />
      {vues.map((b, i) => <circle key={b.cause} cx={cx(i)} cy={yP(b.cumulPct)} r={3.5} className="cr-q-point" />)}
    </svg>
  );
}

