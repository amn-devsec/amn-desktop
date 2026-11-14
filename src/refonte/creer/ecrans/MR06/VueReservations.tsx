import React from 'react';
import { Activity, Bell, Check, Home, Sparkles, Truck, Wrench } from 'lucide-react';
import { PageHead, Segmente } from '../../../../socle/ui';
import { hhmmDe, type Jour } from '../../commun';
import { positionMaintenant, type FiltreRessource } from '../../reservations';
import { compte } from '../../i18n';
import { useMots, type CleMR06 } from './textes';
import type { BlocVue, ModeleReservations } from './modele';
import '../../creer.css';

export interface VueReservationsProps {
  modele: ModeleReservations;
  filtre: FiltreRessource;
  onFiltre: (f: FiltreRessource) => void;
  aujourdhui: Jour;
  dateLibelle: string;
  maintenantMin: number;
  suggestion?: string;
  onReserver?: () => void;
  onRegles?: () => void;
  onProposer?: () => void;
  onNon?: () => void;
  phraseCreuse?: string;
}

const AXE_DEBUT = 480;
const AXE_FIN = 1080;
const pct = (m: number) => ((Math.max(AXE_DEBUT, Math.min(AXE_FIN, m)) - AXE_DEBUT) / (AXE_FIN - AXE_DEBUT)) * 100;
const ICONE_TYPE = { salle: Home, véhicule: Truck, matériel: Wrench } as const;

function Bloc({ b }: { b: BlocVue }) {
  const { tm } = useMots();
  const style: React.CSSProperties = { left: `${pct(b.debut)}%`, width: `calc(${pct(b.fin) - pct(b.debut)}% - 3px)` };
  return (
    <span className="cr-bloc" data-type={b.type} data-long={b.plusLong} data-rang={b.rang} style={style} title={b.libelle}>
      {b.type === 'reserve' && b.qui && <i className="cr-avatar cr-avatar--m">{b.qui[0]}</i>}
      {b.type === 'conflit' && <Bell size={11} aria-hidden />}
      {b.type === 'indisponible' && <Wrench size={11} aria-hidden />}
      <span>{b.libelle}{b.plusLong && <small> · {tm('libre.plusLong')}</small>}</span>
    </span>
  );
}

export function VueReservations(p: VueReservationsProps) {
  const { tm, langue } = useMots();
  const m = p.modele;
  const maint = positionMaintenant(p.maintenantMin);
  const heures = Array.from({ length: 10 }, (_, i) => hhmmDe(AXE_DEBUT + i * 60));
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR06">
      <PageHead
        titre={tm('titre')}
        sousTitre={m.conflits > 0 ? `${tm('sous')} · ${tm('sous.conflit')}` : tm('sous')}
        secondaires={[{ libelle: tm('regles'), onClick: p.onRegles ?? (() => undefined) }]}
        primaire={{ libelle: tm('reserver'), onClick: p.onReserver ?? (() => undefined) }}
      />
      <section className="cr-carte cr-semaine" data-mvt="entree">
        <div className="cr-semaine__jours">
          {m.jours.map((j) => (
            <div key={j.jour} className="cr-semaine__jour" data-aujourdhui={j.aujourdhui}>
              <span><small>{new Date(`${j.jour}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'Europe/Paris' }).replace(/^./, (c) => c.toUpperCase())}</small> <b className="cr-mono">{Number(j.jour.slice(8))}</b><small className="cr-mono">{j.pct === null ? '—' : `${j.pct} %`}</small></span>
              <i><b style={{ width: `${j.pct ?? 0}%` }} /></i>
            </div>
          ))}
        </div>
        <div className="cr-semaine__synthese">
          <span className="cr-anneau-grand" style={{ ['--pct' as string]: m.semainePct ?? 0 }}><b className="cr-mono">{m.semainePct ?? '—'} %</b></span>
          <div>
            <b>{m.semainePct === null ? tm('semaine.vide') : tm('semaine.occupee', { pct: m.semainePct })}</b>
            {p.phraseCreuse && <small>{p.phraseCreuse}</small>}
            <em><Check size={12} aria-hidden /> {m.sansDoublonJours === null ? tm('sansDoublon.0') : tm('sansDoublon', { n: m.sansDoublonJours })}</em>
          </div>
        </div>
      </section>
      <section className="cr-carte cr-frise-res" data-mvt="entree">
        <header>
          <h2>{p.dateLibelle}</h2>
          <small>{tm('ressources', { n: m.nbRessources, libres: compte(langue, 'resa.libres', m.nbLibres) })}</small>
          <span className="cr-legende-res"><i data-t="reserve" />{tm('legende.reserve')} <i data-t="libre" />{tm('legende.libre')} <i data-t="conflit" />{tm('legende.conflit')} <i data-t="indisponible" />{tm('legende.indisponible')}</span>
          <Segmente taille="compact" libelle={tm('filtre.libelle')} valeur={p.filtre} onChange={(f) => p.onFiltre(f as FiltreRessource)} options={(['tout', 'salles', 'vehicules', 'materiel'] as const).map((k) => ({ cle: k, libelle: tm(`filtre.${k}` as CleMR06) }))} />
        </header>
        {m.nbRessources === 0 ? <p className="cr-t3" style={{ padding: 24 }}>{tm('vide.titre')}</p> : (
          <div className="cr-frise-res__corps">
            <div className="cr-frise-res__axe cr-mono">{heures.map((h, i) => <span key={h} style={{ left: `${(i / 10) * 100}%` }}>{h}</span>)}</div>
            {maint !== null && <span className="cr-maintenant" style={{ left: `${maint * 100}%` }}><b className="cr-mono">{hhmmDe(p.maintenantMin)}</b></span>}
            {m.groupes.map((g) => (
              <div key={g.type}>
                <h3 className="cr-agenda__jour">{tm(`groupe.${g.type}` as CleMR06)}</h3>
                {g.lignes.map((l) => { const Ic = ICONE_TYPE[l.ressource.type] ?? Activity; return (
                  <div key={l.ressource.id} className="cr-res-ligne">
                    <div className="cr-res-ligne__nom"><i><Ic size={13} aria-hidden /></i><span><b>{l.ressource.nom}</b><small className="cr-mono">{l.ressource.detail ?? ''}</small></span></div>
                    <div className="cr-res-ligne__piste">{l.blocs.map((b, i) => <Bloc key={i} b={b} />)}</div>
                  </div>
                ); })}
              </div>
            ))}
          </div>
        )}
        {p.suggestion && (
          <div className="cr-plan__ajmani" style={{ position: 'static', margin: '10px 16px 16px' }}>
            <Sparkles size={13} aria-hidden /><p>{p.suggestion}</p>
            <button type="button" className="cr-bouton-plein" onClick={p.onProposer}>{tm('suggestion.proposer')}</button>
            <button type="button" className="cr-bouton-verre" onClick={p.onNon}>{tm('suggestion.non')}</button>
          </div>
        )}
      </section>
    </div>
  );
}
