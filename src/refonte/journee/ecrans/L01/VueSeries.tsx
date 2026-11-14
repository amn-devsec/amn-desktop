import React from 'react';
import { Award, Check, Euro, Flag, Mail, Send, ShieldCheck, Star, Sun, Target, Trophy, Users, Zap } from 'lucide-react';
import { PageHead, SuggestionCompact } from '../../../../socle/ui';
import { noeudsDeLEscalier, palierDuRecord, type NoeudDeLEscalier, type Rail } from '../../escalier';
import { useMots, type CleL01 } from './textes';

export type IconeDeMedaille = 'trophee' | 'enveloppe' | 'etoile' | 'cible' | 'eclair' | 'equipe' | 'euro' | 'bouclier';
export interface MedailleVue { id: string; nom: string; quand: string | null; icone: IconeDeMedaille }
export interface GesteDuJour { id: string; titre: string; detail: string; fait: boolean }
export interface RailVue { id: 'taches' | 'boite' | 'rituels'; sous: string; rail: Rail | null; ceSoir?: boolean }

export interface VueSeriesProps {
  serie: { jours: number; record: number; prochainPalier: number | null; joursAvantPalier: number | null; boucleeAujourdhui: boolean; etat: 'aucune' | 'en-cours' | 'reprise'; depart: string | null; atteints: Record<number, string> };
  gestes: GesteDuJour[];
  rails: RailVue[];
  facile: { titre: string } | null;
  medailles: MedailleVue[];
  equipe: { complet: { quand: string; initiales: string[] } | null; zeroImpaye: { jours: number } | null; incident: boolean };
  onPartager?: () => void;
  onRegler?: () => void;
  onFaire?: () => void;
  onDemain?: () => void;
}

const ICONES: Record<IconeDeMedaille, React.ReactNode> = {
  trophee: <Trophy size={18} aria-hidden />, enveloppe: <Mail size={18} aria-hidden />, etoile: <Star size={18} aria-hidden />, cible: <Target size={18} aria-hidden />,
  eclair: <Zap size={18} aria-hidden />, equipe: <Users size={16} aria-hidden />, euro: <Euro size={16} aria-hidden />, bouclier: <ShieldCheck size={16} aria-hidden />,
};
const ICONE_RAIL = { taches: <Check size={16} aria-hidden />, boite: <Mail size={16} aria-hidden />, rituels: <Sun size={16} aria-hidden /> };

const L = 764;
const H = 262;

function Escalier({ serie, record, atteints, depart }: { serie: number; record: number; atteints: Record<number, string>; depart: string | null }) {
  const { tm } = useMots();
  const noeuds = noeudsDeLEscalier(serie, record);
  const n = noeuds.length;
  const pas = (L - 90) / Math.max(1, n - 1);
  const montee = (H - 60) / Math.max(1, n - 1);
  const pos = noeuds.map((_, i) => ({ x: 36 + i * pas, y: H - 36 - i * montee }));
  const chemin = (de: number, a: number) => pos.slice(de, a + 1).map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `H ${p.x} V ${p.y}`)).join(' ');
  const ici = noeuds.findIndex((x) => x.etat === 'ici' || (x.etat === 'parcouru' && x.jours === serie && x.genre === 'palier'));
  const iciIndex = ici < 0 ? 0 : ici;
  const prochain = noeuds.findIndex((x) => x.etat === 'prochain');
  const fin = noeuds.length - 1;
  const palierRecord = palierDuRecord(record);
  const iRecord = palierRecord === null ? -1 : noeuds.findIndex((x) => x.jours === palierRecord && x.genre === 'palier');
  const legende = (x: NoeudDeLEscalier, p: { x: number; y: number }) => {
    if (x.genre === 'depart') return null;
    if (x.genre === 'badge') return <><text x={p.x} y={p.y - 24} textAnchor="middle" className="jr-esc__t2">{tm('noeud.badge', { n: x.jours })}</text><text x={p.x} y={p.y - 10} textAnchor="middle" className="jr-esc__or">{tm('noeud.ceSoir')}</text></>;
    if (x.genre === 'jour') return null;
    if (x.etat === 'parcouru') return <><text x={p.x} y={p.y - 32} textAnchor="middle" className="jr-esc__t1">{tm('noeud.jours', { n: x.jours })}</text>{atteints[x.jours] && <text x={p.x} y={p.y - 18} textAnchor="middle" className="jr-esc__t4">{tm('noeud.atteint', { date: atteints[x.jours] })}</text>}</>;
    if (x.etat === 'prochain') return <><text x={p.x} y={p.y - 32} textAnchor="middle" className="jr-esc__t1">{tm('noeud.jours', { n: x.jours })}</text><text x={p.x} y={p.y - 18} textAnchor="middle" className="jr-esc__t3">{tm('noeud.dans', { n: x.jours - serie })}</text></>;
    return <text x={p.x} y={p.y - 14} textAnchor="middle" className="jr-esc__t4">{tm('noeud.court', { n: x.jours })}</text>;
  };
  return (
    <svg className="jr-escalier" viewBox={`0 0 ${L} ${H}`} width="100%" height={H} role="img" aria-label={tm('chemin.titre')}>
      <path d={chemin(0, iciIndex)} className="jr-esc__trait" />
      {prochain > iciIndex && <path d={chemin(iciIndex, prochain)} className="jr-esc__tirets" />}
      {fin > prochain && prochain >= 0 && <path d={chemin(prochain, fin)} className="jr-esc__points" />}
      {noeuds.map((x, i) => {
        const p = pos[i];
        return (
          <g key={`${x.jours}-${x.genre}`}>
            {x.genre === 'depart' && <text x={p.x} y={p.y + 22} className="jr-esc__t4">{tm('noeud.depart', { date: depart ?? '' }).replace(/ · $/, '')}</text>}
            {x.genre === 'badge' ? <rect x={p.x - 6} y={p.y - 6} width="12" height="12" transform={`rotate(45 ${p.x} ${p.y})`} className="jr-esc__badge" />
              : x.etat === 'parcouru' && x.genre === 'palier' ? <><circle cx={p.x} cy={p.y} r="11" className="jr-esc__plein" /><path d={`M ${p.x - 4} ${p.y} l 3 3 l 5 -6`} className="jr-esc__coche" /></>
              : x.etat === 'ici' ? <><circle cx={p.x} cy={p.y} r="15" className="jr-esc__halo" /><circle cx={p.x} cy={p.y} r="9" className="jr-esc__plein" /></>
              : x.etat === 'prochain' ? <><circle cx={p.x} cy={p.y} r="11" className="jr-esc__prochain" /><text x={p.x} y={p.y + 4} textAnchor="middle" className="jr-esc__t1">{x.jours}</text></>
              : x.etat === 'pas' ? <circle cx={p.x} cy={p.y} r="3.5" className="jr-esc__pas" />
              : x.genre === 'depart' ? <circle cx={p.x} cy={p.y} r="3" className="jr-esc__plein" />
              : <circle cx={p.x} cy={p.y} r="7" className="jr-esc__avenir" />}
            {legende(x, p)}
            {x.etat === 'ici' && <g><rect x={p.x - 56} y={p.y + 14} width="112" height="20" rx="10" className="jr-esc__pastille" /><text x={p.x} y={p.y + 28} textAnchor="middle" className="jr-esc__t2">{tm('noeud.ici', { n: serie })}</text></g>}
          </g>
        );
      })}
      {iRecord >= 0 && iRecord < n - 1 && (
        <g transform={`translate(${(pos[iRecord].x + pos[iRecord + 1].x) / 2} ${pos[iRecord].y - (pos[iRecord].y - pos[iRecord + 1].y) / 2})`}>
          <path d="M 0 0 v 18 M 0 0 l 12 4 l -12 4" className="jr-esc__drapeau" /><text x="18" y="16" className="jr-esc__t3">{tm('noeud.record', { n: record })}</text>
        </g>
      )}
    </svg>
  );
}

export function VueSeries(p: VueSeriesProps) {
  const { tm } = useMots();
  const s = p.serie;
  const faits = p.gestes.filter((g) => g.fait).length;
  const phrase = s.etat === 'aucune' ? tm('serie.phrase.aucune') : s.etat === 'reprise' ? tm('serie.phrase.reprise', { n: s.record }) : s.prochainPalier === null ? tm('serie.phrase.fin') : s.boucleeAujourdhui ? tm('serie.phrase.bouclee', { palier: s.prochainPalier, reste: s.joursAvantPalier ?? 0 }) : tm('serie.phrase.aujourdhui', { n: s.jours + 1, palier: s.prochainPalier, reste: s.joursAvantPalier ?? 0 });
  const obtenues = p.medailles.filter((m) => m.quand).length;
  return (
    <div className="cr-page jr-series" data-famille="jour" data-ecran="L01">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous')}
        secondaires={[{ libelle: tm('partager'), onClick: p.onPartager, disabled: !p.onPartager, icone: <Send size={14} aria-hidden /> }]}
        primaire={{ libelle: tm('regler'), onClick: p.onRegler ?? (() => undefined), disabled: !p.onRegler, icone: <Target size={14} aria-hidden /> }}
      />
      <section className="cr-carte jr-heros" data-mvt="entree" aria-label={tm('serie.libelle')}>
        <div className="jr-heros__serie">
          <small className="jr-capitales">{tm('serie.libelle')}</small>
          <p className="jr-heros__nombre"><b className="cr-mono">{s.jours}</b><span>{tm('serie.jours')}</span></p>
          {s.record > 0 && <p className="jr-heros__record"><Flag size={13} aria-hidden />{tm('serie.record', { n: s.record })}<em>· {tm('serie.record.suite')}</em></p>}
          <p className="jr-heros__phrase">{phrase}</p>
          <div className="jr-gestes">
            <header><b>{tm('gestes.titre')}</b><small>{tm('gestes.n', { f: faits, t: p.gestes.length })}</small></header>
            <span className="cr-relecture__barre"><i style={{ width: `${p.gestes.length ? (faits / p.gestes.length) * 100 : 0}%` }} /></span>
            <ul>
              {p.gestes.map((g) => <li key={g.id} data-fait={g.fait}><span className="jr-coche-geste" aria-hidden>{g.fait ? <Check size={10} strokeWidth={3} /> : null}</span><span>{g.titre}</span><small>{g.detail}</small></li>)}
              {p.gestes.length === 0 && <li className="cr-t3">{tm('gestes.rien')}</li>}
            </ul>
          </div>
        </div>
        <div className="jr-heros__chemin">
          <header>
            <b>{tm('chemin.titre')}</b><small>{tm('chemin.aide')}</small>
            <ul className="jr-legende" aria-hidden><li><i data-t="trait" />{tm('chemin.parcouru')}</li><li><i data-t="tirets" />{tm('chemin.encours')}</li><li><i data-t="points" />{tm('chemin.avenir')}</li><li><i data-t="badge" />{tm('chemin.badge')}</li></ul>
          </header>
          <div className="jr-chemin__zone">
            <div className="jr-regles"><small className="jr-capitales">{tm('regles.titre')}</small>{(['regles.1', 'regles.2', 'regles.3'] as const).map((c) => <p key={c}><Check size={12} aria-hidden />{tm(c)}</p>)}</div>
            <Escalier serie={s.jours} record={s.record} atteints={s.atteints} depart={s.depart} />
          </div>
        </div>
      </section>
      <div className="jr-series__bas">
        <section className="cr-carte jr-autres" data-mvt="entree" aria-label={tm('autres.titre')}>
          <header><b>{tm('autres.titre')}</b><small>{tm('autres.aide')}</small></header>
          {p.rails.map((r) => (
            <div key={r.id} className="jr-rail">
              <span className="jr-rail__icone" aria-hidden>{ICONE_RAIL[r.id]}</span>
              <span className="jr-rail__nom"><b>{tm(`rail.${r.id === 'taches' ? 'taches' : r.id === 'boite' ? 'boite' : 'rituels'}` as CleL01)}</b><small>{r.sous}</small></span>
              {r.rail ? (
                <>
                  <span className="jr-rail__piste" style={{ ['--n' as string]: r.rail.marques.length }}>
                    <i className="jr-rail__trait" aria-hidden><b style={{ width: `${((r.rail.marques.filter((m) => m.etat === 'atteinte').length + (r.rail.progression * (r.rail.prochaine === null ? 0 : 1))) / r.rail.marques.length) * 100 - 100 / (2 * r.rail.marques.length)}%` }} /></i>
                    {r.rail.marques.map((m) => <span key={m.valeur} data-etat={m.etat}><i aria-hidden>{m.etat === 'atteinte' ? <Check size={9} strokeWidth={3} /> : null}</i><small>{m.valeur}</small></span>)}
                  </span>
                  <span className="jr-rail__valeur"><b>{tm('rail.valeur', { v: r.rail.valeur, m: r.rail.prochaine ?? r.rail.marques[r.rail.marques.length - 1].valeur })}</b><small>{r.ceSoir ? tm('rail.ceSoir') : r.rail.reste !== null ? tm('rail.reste', { n: r.rail.reste }) : ''}</small></span>
                </>
              ) : <span className="jr-rail__nd cr-t3">{tm('rail.nonDisponible')}</span>}
            </div>
          ))}
          {p.facile && (
            <div className="jr-facile">
              <SuggestionCompact texte={tm('suggestion.facile', { titre: p.facile.titre })} libelleOui={tm('suggestion.faire')} libelleNon={tm('suggestion.demain')} onOui={p.onFaire ?? (() => undefined)} onNon={p.onDemain ?? (() => undefined)} />
            </div>
          )}
        </section>
        <section className="cr-carte jr-badges" data-mvt="entree" aria-label={tm('badges.titre')}>
          <header><b>{tm('badges.titre')}</b><small>{tm('badges.n', { n: obtenues, t: p.medailles.length })}</small></header>
          <ul className="jr-medailles">
            {p.medailles.map((m) => <li key={m.id} data-etat={m.quand ? 'obtenue' : 'a-gagner'}><span className="jr-medaille" aria-hidden>{ICONES[m.icone]}</span><b>{m.nom}</b><small>{m.quand ?? tm('badge.aGagner')}</small></li>)}
          </ul>
          <h3 className="jr-capitales">{tm('equipe.titre')}</h3>
          <ul className="jr-equipe">
            <li data-etat={p.equipe.complet ? 'obtenue' : 'a-gagner'}><span className="jr-medaille jr-medaille--petite" aria-hidden><Users size={14} /></span><b>{tm('equipe.complet')}</b><small>{p.equipe.complet?.quand ?? tm('badge.aGagner')}</small>{p.equipe.complet && <span className="jr-avatars">{p.equipe.complet.initiales.map((i) => <span key={i} className="cr-avatar">{i}</span>)}</span>}</li>
            <li data-etat="encours"><span className="jr-medaille jr-medaille--petite" aria-hidden><Euro size={14} /></span><b>{tm('equipe.zeroImpaye')}</b>{p.equipe.zeroImpaye ? <><span className="jr-mini-barre" aria-hidden><i style={{ width: `${Math.min(100, (p.equipe.zeroImpaye.jours / 30) * 100)}%` }} /></span><small>{tm('equipe.zeroImpaye.etat', { n: p.equipe.zeroImpaye.jours })}</small></> : <small>{tm('nonDisponible')}</small>}</li>
            <li data-etat="a-gagner"><span className="jr-medaille jr-medaille--petite" aria-hidden><Award size={14} /></span><b>{tm('equipe.incident')}</b><small>{tm('equipe.gagner')}</small></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

