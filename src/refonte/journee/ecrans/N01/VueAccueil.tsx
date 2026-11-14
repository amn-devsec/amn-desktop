import React from 'react';
import { ArrowRight, Clock, Flag, Plus, Shield, SlidersHorizontal, Sun } from 'lucide-react';
import { AnneauProgression, LiveDot, PageHead, SuggestionAjmani } from '../../../../socle/ui';
import { formaterEuro } from '../../../../socle/formats';
import { useMots, type CleN01 } from './textes';
import '../../journee.css';

export interface RdvDeFrise { id: string; debut: number; fin: number; titre: string; detail: string; ton: 'jour' | 'contacts' | 'argent' | 'pause'; passe: boolean; suivant: boolean }
export interface FaiteDeFrise { id: string; minute: number; titre: string }
export interface CarteAVenir { id: string; minute: number; titre: string; heure: string; delai: string; urgent: boolean; initiale: string }

export interface VueAccueilProps {
  prenom: string;
  /** « Vendredi 30 octobre · 10:42 ». */
  dateEtHeure: string;
  soir: boolean;
  /** Minutes depuis minuit, à Paris : place le curseur de la frise. */
  minute: number;
  anneau: { faites: number; total: number };
  /** Hier : l'heure de la dernière case cochée, ou `null`. */
  hier: string | null;
  serie: { jours: number; palier: number | null };
  /** Messages à traiter ; `null` : la source n'existe pas. */
  messages: number | null;
  nbRdv: number;
  urgent: { titre: string; recu: string | null; initiale: string; vers?: string } | null;
  frise: { rdv: RdvDeFrise[]; rondes: number[]; faites: FaiteDeFrise[]; avenir: CarteAVenir[]; restantes: number } | null;
  argent: { cents: number; quand: 'matin' | 'jour'; courbe: number[]; aEncaisser: number; enRetard: number } | null;
  garde: { enOrdre: boolean } | null;
  suggestion: { n: number; noms: string } | null;
  onNouvelle: () => void;
  onPersonnaliser?: () => void;
  onOuvrirUrgent?: () => void;
  onCalendrier?: () => void;
  onRegrouper?: () => void;
  onPlusTard?: () => void;
}

const DEBUT = 8 * 60;
const FIN = 19 * 60;
const pct = (m: number) => `${(Math.min(FIN, Math.max(DEBUT, m)) - DEBUT) / (FIN - DEBUT) * 100}%`;
const hhmm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const un = (tm: (c: CleN01, p?: Record<string, string | number>) => string, base: 'tache' | 'rdv', n: number) => tm(`${base}.${n >= 2 ? 'n' : '1'}` as CleN01, { n });

function Trait({ valeurs, ton }: { valeurs: number[]; ton: 'succes' | 'info' | 'attention' }) {
  if (valeurs.length < 2) return null;
  const max = Math.max(...valeurs, 1);
  const min = Math.min(...valeurs);
  const pts = valeurs.map((v, i) => `${(i / (valeurs.length - 1)) * 292},${34 - ((v - min) / Math.max(1, max - min)) * 28}`).join(' ');
  return <svg className="jr-trait" viewBox="0 0 292 36" preserveAspectRatio="none" aria-hidden data-ton={ton}><polyline points={pts} fill="none" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}

export function VueAccueil(p: VueAccueilProps) {
  const { tm } = useMots();
  const restantes = Math.max(0, p.anneau.total - p.anneau.faites);
  const euros = (c: number) => formaterEuro(c / 100);
  const nbUrgences = p.urgent ? 1 : 0;
  const sous = tm('sous', { t: un(tm, 'tache', restantes), r: un(tm, 'rdv', p.nbRdv), u: nbUrgences === 0 ? tm('urgence.0') : tm(nbUrgences === 1 ? 'urgence.1' : 'urgence.n', { n: nbUrgences }) });
  const phrase = p.anneau.total === 0 ? tm('phrase.rien') : restantes === 0 ? tm('phrase.bouclee') : tm('phrase.plus', { n: un(tm, 'tache', restantes) });
  const avenir = p.frise?.avenir ?? [];

  return (
    <div className="cr-page jr-accueil" data-famille="jour" data-ecran="N01">
      <PageHead
        titre={tm('titre')}
        sousTitre={sous}
        secondaires={[{ libelle: tm('personnaliser'), onClick: p.onPersonnaliser, disabled: !p.onPersonnaliser, icone: <SlidersHorizontal size={14} aria-hidden /> }]}
        primaire={{ libelle: tm('nouvelle'), onClick: p.onNouvelle, icone: <Plus size={14} aria-hidden /> }}
      />
      <div className="jr-accueil__haut">
        <section className="cr-carte jr-salut" data-mvt="entree" aria-label={tm(p.soir ? 'salut.soir' : 'salut.jour', { prenom: p.prenom })}>
          <AnneauProgression valeur={p.anneau.total ? p.anneau.faites / p.anneau.total : 0} libelle={`${p.anneau.faites}/${p.anneau.total}`} taille={128} epaisseur={10} ton="succes">
            <span className="jr-anneau-centre"><b className="cr-mono">{p.anneau.faites}</b><em>/{p.anneau.total}</em><small>{tm('anneau.faites')}</small></span>
          </AnneauProgression>
          <div className="jr-salut__texte">
            <p className="jr-salut__date"><Sun size={13} aria-hidden />{p.dateEtHeure}</p>
            <h2>{tm(p.soir ? 'salut.soir' : 'salut.jour', { prenom: p.prenom })}</h2>
            <p>{phrase}{p.hier ? <><br />{tm('phrase.hier', { heure: p.hier })}</> : null}</p>
          </div>
          <div className="jr-salut__stats">
            <div className="jr-stat"><p><b className="cr-mono">{p.serie.jours}</b><span>{tm('serie.jours')}</span></p><small>{p.serie.palier !== null ? tm('serie.palier', { n: p.serie.palier }) : tm('serie.jours')}</small>{p.serie.palier !== null && <i aria-hidden><b style={{ width: `${Math.min(100, Math.round((p.serie.jours / p.serie.palier) * 100))}%` }} /></i>}</div>
            <div className="jr-stat"><p><b className="cr-mono">{p.messages === null ? '—' : p.messages}</b><span>{tm('messages')}</span></p><small>{p.messages === null ? tm('nonDisponible') : p.messages === 0 ? tm('messages.zero') : p.messages <= 3 ? tm('messages.presque') : tm('messages.aTraiter')}</small></div>
          </div>
        </section>
        {p.urgent && (
          <section className="cr-carte jr-urgent" data-mvt="entree" aria-label={tm('urgent.libelle')}>
            <p className="jr-urgent__tete"><span className="jr-flag"><Flag size={11} aria-hidden />{tm('urgent.libelle')}</span>{p.urgent.recu && <small>{tm('urgent.recu', { heure: p.urgent.recu })}</small>}<span className="cr-avatar cr-avatar--m">{p.urgent.initiale}</span></p>
            <h3>{p.urgent.titre}</h3>
            <p className="jr-urgent__actions">
              <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onOuvrirUrgent}>{tm('urgent.ouvrir')}</button>
            </p>
          </section>
        )}
      </div>
      {p.frise && (
        <section className="cr-carte jr-frise" data-mvt="entree" aria-label={tm('frise.titre')}>
          <header>
            <b>{tm('frise.titre')}</b><small>{tm('frise.sous', { f: p.frise.faites.length, a: avenir.length })}</small>
            <ul className="jr-legende" aria-hidden>
              <li><i data-t="rdv" />{tm('frise.rdv')}</li><li><i data-t="tache" />{tm('frise.tache')}</li><li><i data-t="faite" />{tm('frise.faite')}</li>{p.frise.rondes.length > 0 && <li><Shield size={11} />{tm('frise.ronde')}</li>}
            </ul>
            <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onCalendrier}><ArrowRight size={13} aria-hidden /> {tm('frise.calendrier')}</button>
          </header>
          <div className="jr-frise__corps">
            <div className="jr-frise__etiquettes"><div><b>{tm('frise.agenda')}</b><small>{tm('frise.agenda.avenir', { n: p.frise.rdv.filter((r) => !r.passe).length })}</small></div><div><b>{tm('frise.taches')}</b><small>{tm('frise.taches.restantes', { n: p.frise.restantes })}</small></div></div>
            <div className="jr-frise__echelle">
              <div className="jr-heures" aria-hidden>{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ left: `${(i / 11) * 100}%` }}>{8 + i} h</span>)}</div>
              <div className="jr-agenda-ligne">
                {p.frise.rdv.map((r) => (
                  <div key={r.id} className="jr-rdv" data-ton={r.ton} data-passe={r.passe} data-suivant={r.suivant} style={{ left: pct(r.debut), width: `calc(${pct(r.fin)} - ${pct(r.debut)})` }}>
                    <i aria-hidden /><b>{r.titre}</b><small>{r.detail}</small>
                  </div>
                ))}
                {p.frise.rondes.map((m) => <span key={m} className="jr-ronde" style={{ left: pct(m) }} title={`${tm('frise.ronde')}, ${hhmm(m)}`}><Shield size={11} aria-hidden /></span>)}
              </div>
              <div className="jr-taches-ligne">
                {p.frise.faites.map((f) => <i key={f.id} className="jr-disque" style={{ left: pct(f.minute) }} title={`${f.titre} · ${hhmm(f.minute)}`} />)}
                <ul className="jr-barres-faites" aria-label={tm('frise.faite')}>{p.frise.faites.map((f) => <li key={f.id}>{f.titre}</li>)}</ul>
                {avenir.filter((a) => a.minute >= 0).map((a) => <i key={a.id} className="jr-losange" data-urgent={a.urgent} style={{ left: pct(a.minute) }} aria-hidden />)}
                <ul className="jr-cartes-venir">
                  {avenir.map((a) => (
                    <li key={a.id} className="jr-venir" data-urgent={a.urgent}>
                      <i className="jr-case-vide" aria-hidden /><span><b>{a.titre}</b><small>{a.urgent ? <span className="jr-flag"><Flag size={10} aria-hidden />{tm('urgent.libelle')}</span> : null}{a.heure ? <em>{a.heure}</em> : null} {a.delai}</small></span><span className="cr-avatar cr-avatar--m">{a.initiale}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="jr-curseur" style={{ left: pct(p.minute) }}><b className="cr-mono">{hhmm(p.minute)}</b></span>
            </div>
          </div>
        </section>
      )}
      <div className="jr-accueil__bas">
        {p.argent && (
          <section className="cr-carte jr-carte-argent" data-mvt="entree" aria-label={tm('argent.titre')}>
            <header><b>{tm('argent.titre')}</b><small>{tm('argent.jours')}</small></header>
            <p className="jr-grand"><b className="cr-mono">{euros(p.argent.cents)}</b><span>{p.argent.cents > 0 ? tm(p.argent.quand === 'matin' ? 'argent.encaisse.matin' : 'argent.encaisse.jour') : tm('argent.rien')}</span></p>
            <Trait valeurs={p.argent.courbe} ton="succes" />
            <dl><div><dt>{tm('argent.aEncaisser')}</dt><dd className="cr-mono">{euros(p.argent.aEncaisser)}</dd></div><div><dt>{tm('argent.enRetard')}</dt><dd className="cr-mono" data-ton="critique">{euros(p.argent.enRetard)}</dd></div></dl>
          </section>
        )}
        {p.garde && (
          <section className="cr-carte jr-carte-garde" data-mvt="entree" aria-label={tm('garde.titre')}>
            <header><b>{tm('garde.titre')}</b><small><LiveDot ton={p.garde.enOrdre ? 'ok' : 'attention'} libelle={tm('garde.veille')} afficherLibelle /></small></header>
            <p className="jr-grand"><b>{tm(p.garde.enOrdre ? 'garde.ordre' : 'garde.attention')}</b></p>
            <dl><div><dt>{tm('garde.titre')}</dt><dd className="cr-t3">{tm('garde.nonDisponible')}</dd></div></dl>
          </section>
        )}
        {p.suggestion && (
          <SuggestionAjmani
            titre={tm('suggestion.regrouper', { n: p.suggestion.n })}
            texte={<>{tm('suggestion.texte', { noms: p.suggestion.noms })}<span className="jr-quand"><Clock size={12} aria-hidden />{tm('suggestion.quand')}</span></>}
            primaire={{ libelle: tm('suggestion.bouton'), onClick: p.onRegrouper ?? (() => undefined) }}
            secondaire={{ libelle: tm('suggestion.plusTard'), onClick: p.onPlusTard ?? (() => undefined) }}
          />
        )}
      </div>
    </div>
  );
}
