import React, { useState } from 'react';
import { ArrowRight, Bell, Check, Clock, Mail, MessageSquare, Moon, Pause, Play, X } from 'lucide-react';
import { Modale, PageHead } from '../../../../socle/ui';
import { DUREES_DE_SEANCE, enMarche, progression, restantEnTexte, type Focus } from '../../focus';
import { useMots } from './textes';

export interface BlocDeMatinee { id: string; type: 'faite' | 'pause' | 'courante' | 'agenda' | 'prevue'; debut: number; fin: number; label: string }
export interface TacheDeFocus { titre: string; contexte: string }
export interface LigneDeFile { id: string; titre: string; minutes?: number }

export interface VueFocusProps {
  focus: Focus;
  maintenant: number;
  /** « fin à 10:57 » : l'heure de fin prévue (HH:MM, à la minute inférieure). */
  finPrevue: string;
  /** Sessions déjà faites aujourd'hui. */
  rangDuJour: number;
  /** Le rang de la session en cours (1 à `objectif`, au plus). */
  numeroSession: number;
  objectif: number;
  minutes: number;
  /** Ce qui est arrivé depuis l'entrée dans le Mode Focus ; `null` : la source n'existe pas. */
  bruit: { notifications: number | null; messages: number | null; courriels: number | null } | null;
  tache: TacheDeFocus | null;
  file: LigneDeFile[];
  resteFile: number;
  totalFile: number | null;
  matinee: { titre: 'matinee' | 'apresMidi'; debut: number; fin: number; maintenant: number; blocs: BlocDeMatinee[]; phrase: string | null };
  idee: string;
  ideeEnregistree: boolean;
  reglages: { ouverts: boolean; dureeMin: number; objectif: number };
  onIdee: (t: string) => void;
  onValiderIdee: () => void;
  onLancer: () => void;
  onPause: () => void;
  onTerminer: () => void;
  onPasser: () => void;
  onQuitter: () => void;
  onReglages: (ouvert: boolean) => void;
  onDuree: (min: number) => void;
  onObjectif: (n: number) => void;
}

const R = 132;
const TOUR = 2 * Math.PI * R;
const hhmm = (m: number) => `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, '0')}` : ''}`;

export function VueFocus(p: VueFocusProps) {
  const { tm } = useMots();
  const f = p.focus;
  const travail = f.phase === 'travail';
  const marche = enMarche(f);
  const arc = progression(f, p.maintenant);
  const total = p.matinee.fin - p.matinee.debut;
  const x = (m: number) => `${Math.min(100, Math.max(0, ((m - p.matinee.debut) / total) * 100))}%`;
  const nBruit = p.bruit ? (p.bruit.notifications ?? 0) + (p.bruit.messages ?? 0) + (p.bruit.courriels ?? 0) : 0;
  const graduations: number[] = [];
  for (let h = Math.ceil(p.matinee.debut / 60); h * 60 <= p.matinee.fin; h += 1) graduations.push(h * 60);

  return (
    <div className="cr-page jr-focus-page" data-famille="jour" data-ecran="L02">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous')}
        secondaires={[
          { libelle: tm('durees'), onClick: () => p.onReglages(true), icone: <Clock size={14} aria-hidden /> },
          { libelle: tm('quitter'), onClick: p.onQuitter, icone: <X size={14} aria-hidden /> },
        ]}
      />
      <section className="cr-carte jr-focus" data-mvt="entree" aria-label={tm('titre')}>
        <header className="jr-focus__haut">
          <div>
            <small className="jr-capitales">{tm('session', { n: p.numeroSession, t: p.objectif })}</small>
            <p className="jr-focus__segments"><span aria-hidden>{Array.from({ length: p.objectif }, (_, i) => <i key={i} data-etat={i < p.rangDuJour ? 'faite' : i === p.rangDuJour ? 'courante' : 'avenir'} />)}</span><em>{tm('concentration', { n: p.minutes })}</em></p>
          </div>
          {p.bruit && (
            <div className="jr-focus__bruit">
              <p><Moon size={13} aria-hidden /><b>{nBruit > 0 ? tm('bruit', { n: nBruit }) : tm('bruit.zero')}</b><small>{tm('bruit.urgences')}</small></p>
              <ul aria-label={tm('bruit.notifs')}>
                {p.bruit.notifications !== null && <li title={tm('bruit.notifs')}><Bell size={12} aria-hidden />{p.bruit.notifications}</li>}
                {p.bruit.messages !== null && <li title={tm('bruit.messages')}><MessageSquare size={12} aria-hidden />{p.bruit.messages}</li>}
                {p.bruit.courriels !== null && <li title={tm('bruit.courriels')}><Mail size={12} aria-hidden />{p.bruit.courriels}</li>}
              </ul>
            </div>
          )}
        </header>
        <div className="jr-focus__centre">
          <div className="jr-cadran" data-phase={f.phase}>
            <svg viewBox="0 0 300 300" aria-hidden>
              <circle cx="150" cy="150" r={R} className="jr-cadran__piste" />
              <circle cx="150" cy="150" r={R} className="jr-cadran__arc" strokeDasharray={`${TOUR * arc} ${TOUR}`} transform="rotate(-90 150 150)" />
              <circle cx="150" cy="150" r="112" className="jr-cadran__fin" />
              {Array.from({ length: 12 }, (_, i) => <line key={i} x1="150" y1="6" x2="150" y2={i % 3 === 0 ? 14 : 10} transform={`rotate(${i * 30} 150 150)`} className="jr-cadran__graduation" />)}
            </svg>
            <div className="jr-cadran__texte" role="timer" aria-live="off" aria-label={restantEnTexte(f, p.maintenant)}>
              <b className="cr-mono">{restantEnTexte(f, p.maintenant)}</b>
              <small>{tm('restantes', { h: p.finPrevue })}</small>
            </div>
          </div>
          <small className="jr-capitales jr-focus__etat">{travail ? tm('enCours') : tm(f.phase === 'pause' ? 'pause.libelle' : 'pauseLongue.libelle')}</small>
          {travail ? (
            p.tache ? (
              <><h2>{p.tache.titre}</h2><p className="jr-focus__contexte">{p.tache.contexte}</p></>
            ) : (
              <><h2>{tm('tache.aucune')}</h2><p className="jr-focus__contexte">{tm('tache.aucune.texte')}</p></>
            )
          ) : (
            <><h2>{tm('finie.titre')}</h2><p className="jr-focus__contexte">{tm('pause.texte')}</p></>
          )}
          <p className="jr-focus__actions">
            {marche
              ? <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onPause}><Pause size={13} aria-hidden /> {tm('pause.bouton')} <kbd>{tm('espace')}</kbd></button>
              : <button type="button" className="cr-bouton-plein sc-focus" onClick={p.onLancer}><Play size={13} aria-hidden /> {f.ecouleMs > 0 ? tm('reprendre') : tm('lancer')} <kbd>{tm('espace')}</kbd></button>}
            {travail && <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onTerminer} disabled={!p.tache}><Check size={13} aria-hidden /> {tm('terminer')}</button>}
            <button type="button" className="cr-bouton-verre sc-focus" onClick={p.onPasser}><ArrowRight size={13} aria-hidden /> {tm('passer')}</button>
          </p>
        </div>
        <footer className="jr-focus__bas">
          <section aria-label={tm('ensuite')}>
            <small className="jr-capitales">{tm('ensuite')}</small>
            <ul>{p.file.slice(0, 2).map((l) => <li key={l.id}><i aria-hidden /><span>{l.titre}</span>{l.minutes !== undefined && <em className="cr-mono">{l.minutes} min</em>}</li>)}{p.file.length === 0 && <li className="cr-t3">{tm('ensuite.rien')}</li>}</ul>
            {p.resteFile > 0 && <small className="cr-t3">{tm(p.resteFile >= 2 ? 'ensuite.autres.n' : 'ensuite.autres.1', { n: p.resteFile })}{p.totalFile !== null ? ` · ${tm('ensuite.total', { t: p.totalFile })}` : ''}</small>}
          </section>
          <section aria-label={tm(p.matinee.titre)}>
            <small className="jr-capitales">{tm(p.matinee.titre)}</small>
            <div className="jr-fil">
              <div className="jr-fil__blocs">
                {p.matinee.blocs.map((b) => <span key={b.id} className="jr-fil__bloc" data-type={b.type} style={{ left: x(b.debut), width: `calc(${x(b.fin)} - ${x(b.debut)})` }} title={b.label}>{b.label && b.type !== 'pause' && b.type !== 'courante' ? <em>{b.label}</em> : null}</span>)}
                <span className="jr-fil__maintenant" style={{ left: x(p.matinee.maintenant) }}><b className="cr-mono">{`${Math.floor(p.matinee.maintenant / 60)}:${String(p.matinee.maintenant % 60).padStart(2, '0')}`}</b></span>
              </div>
              <div className="jr-fil__heures cr-mono" aria-hidden>{graduations.map((m) => <span key={m} style={{ left: x(m) }}>{hhmm(m)}</span>)}</div>
            </div>
            {p.matinee.phrase && <p className="jr-focus__phrase">{p.matinee.phrase}</p>}
          </section>
          <section aria-label={tm('idee')}>
            <small className="jr-capitales">{tm('idee')}</small>
            <label className="jr-idee"><input value={p.idee} onChange={(e) => p.onIdee(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') p.onValiderIdee(); }} placeholder={tm('idee.placeholder')} aria-label={tm('idee')} /><kbd>N</kbd></label>
            <small className="cr-t3">{p.ideeEnregistree ? tm('idee.enregistree') : tm('idee.rangee')}</small>
          </section>
        </footer>
      </section>
      <Modale
        ouverte={p.reglages.ouverts}
        onFermer={() => p.onReglages(false)}
        titre={tm('reglages.titre')}
        famille="jour"
        actions={<button type="button" className="cr-bouton-plein" onClick={() => p.onReglages(false)}>{tm('reglages.fermer')}</button>}
      >
        <fieldset className="jr-reglages">
          <legend>{tm('reglages.session')}</legend>
          <div role="radiogroup" aria-label={tm('reglages.session')}>
            {DUREES_DE_SEANCE.map((d) => <button key={d} type="button" role="radio" aria-checked={p.reglages.dureeMin === d} className="cr-bouton-verre sc-focus" disabled={f.phase !== 'travail' || f.ecouleMs > 0 || enMarche(f)} onClick={() => p.onDuree(d)}>{tm('reglages.min', { n: d })}</button>)}
          </div>
          <legend>{tm('reglages.objectif')}</legend>
          <div role="radiogroup" aria-label={tm('reglages.objectif')}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <button key={n} type="button" role="radio" aria-checked={p.reglages.objectif === n} className="cr-bouton-verre sc-focus" onClick={() => p.onObjectif(n)}>{n}</button>)}
          </div>
        </fieldset>
      </Modale>
    </div>
  );
}

