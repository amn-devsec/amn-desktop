import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Clock, Flag, LayoutGrid, MoreHorizontal, Plus, Trophy, Users, Zap } from 'lucide-react';
import { PageHead, Segmente, SuggestionAjmani } from '../../../../socle/ui';
import { FilterChips } from '../../../../socle/ui/vivant';
import { CASE_DE_TOUCHE, SEGMENTS_MAX, TACHES_VISIBLES_PAR_CASE, analyserLaSaisie, enRetard, matrice, phraseDeLaJourneeDeTaches, type CaseDeMatrice, type TacheDeMatrice } from '../../matrice';
import { ecartJours, type Jour } from '../../commun';
import { useMots, type CleH02 } from './textes';
import '../../journee.css';

export interface TacheCarte extends TacheDeMatrice {
  personne: { initiale: string; nom: string };
  etiquettes: string[];
  sousTaches?: number;
  /** La tâche est confiée : carte en pointillé, flèche vers la personne. */
  confieeA?: { initiale: string; nom: string } | null;
  /** L'heure de la dernière coche, pour « Fait aujourd'hui ». */
  faiteA?: string | null;
}

export type Perimetre = 'moi' | 'equipe' | 'faites';

export interface VueTachesProps {
  aujourdhui: Jour;
  /** Les tâches du périmètre (ouvertes ou faites, la matrice ne montre que les ouvertes). */
  taches: TacheCarte[];
  /** Les tâches faites aujourd'hui, la plus récente en haut. */
  faitesAujourdhui: TacheCarte[];
  compteurs: { moi: number; equipe: number };
  perimetre: Perimetre;
  vue: 'matrice' | 'liste';
  /** Les tâches dues aujourd'hui (n faites sur N), comme N01. */
  duJour: { faites: number; total: number };
  serie: { jours: number; prochainPalier: number | null; resteAvantPalier: number | null };
  /** L'heure de fin de journée et si elle est passée. */
  finDeJournee: string;
  apresLaFin: boolean;
  /** « 2 h 30 » libres le lundi matin, pour le pied de « Planifier » ; absent : pas de pied. */
  tempsLibre?: { duree: string; quand: string } | null;
  suggestion?: { n: number; nom: string; initiale: string; message: string } | null;
  retouche: string | null;
  /** Le texte de départ du champ d'ajout rapide (aperçu). */
  saisieInitiale?: string;
  onPerimetre: (p: Perimetre) => void;
  onVue: (v: 'matrice' | 'liste') => void;
  onCocher: (id: string) => void;
  onDeplacer: (id: string, vers: CaseDeMatrice) => void;
  onCreer: (saisie: ReturnType<typeof analyserLaSaisie>) => void;
  onDefaire?: () => void;
  onConfier?: () => void;
  onPlusTard?: () => void;
}

const PUCE_DE_CASE: Record<CaseDeMatrice, string> = { maintenant: 'critique', planifier: 'info', deleguer: 'attention', alleger: 'neutre' };

const JOURS_COURTS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const jourCourt = (j: Jour) => `${JOURS_COURTS[new Date(`${j}T12:00:00Z`).getUTCDay()]} ${Number(j.slice(8))}`;

export function VueTaches(p: VueTachesProps) {
  const { tm } = useMots();
  const [saisie, setSaisie] = useState(p.saisieInitiale ?? '');
  const [choisie, setChoisie] = useState<string | null>(null);
  const champ = useRef<HTMLInputElement>(null);
  const analyse = useMemo(() => (saisie.trim() ? analyserLaSaisie(saisie, p.aujourdhui) : null), [saisie, p.aujourdhui]);
  const vue = matrice(p.taches, p.aujourdhui);
  const nom = (c: CaseDeMatrice) => tm(`case.${c}` as CleH02);

  const creer = () => {
    if (!analyse || !analyse.titre) return;
    p.onCreer(analyse);
    setSaisie('');
  };
  const clavier = (e: React.KeyboardEvent, id: string) => {
    const cible = CASE_DE_TOUCHE[e.key];
    if (cible) { e.preventDefault(); p.onDeplacer(id, cible); }
  };
  const etiquetteDe = (t: TacheCarte) => {
    const retard = enRetard(t, p.aujourdhui);
    return (
      <span className="jr-carte__bas">
        {t.echeance === null ? <em>{tm('tache.sansDate')}</em> : <em data-retard={retard}>{t.echeance === p.aujourdhui ? (t.heure ?? '') : `${jourCourt(t.echeance)}${t.heure && ecartJours(p.aujourdhui, t.echeance) === 0 ? ` ${t.heure}` : ''}`}</em>}
        {t.urgente && <span className="jr-flag"><Flag size={11} aria-hidden />{tm('tache.urgent')}</span>}
        {t.etiquettes.map((e) => <span key={e} className="jr-etiquette"><i aria-hidden />{e}</span>)}
        {t.sousTaches ? <span className="jr-etiquette">{tm('tache.sousTaches', { n: t.sousTaches })}</span> : null}
      </span>
    );
  };
  const carte = (t: TacheCarte) => (
    <li
      key={t.id}
      className="jr-carte"
      data-choisie={choisie === t.id}
      data-confiee={Boolean(t.confieeA)}
      data-mvt="entree"
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); setChoisie(t.id); }}
    >
      <button type="button" className="jr-case sc-focus" aria-label={tm(t.faite ? 'tache.decocher' : 'tache.cocher', { titre: t.titre })} aria-pressed={Boolean(t.faite)} onClick={() => p.onCocher(t.id)} />
      <span className="jr-carte__texte" tabIndex={0} onFocus={() => setChoisie(t.id)} onKeyDown={(e) => clavier(e, t.id)}><b>{t.titre}</b>{etiquetteDe(t)}</span>
      {t.confieeA ? <span className="jr-confiee" title={tm('tache.confiee', { nom: t.confieeA.nom })}><ArrowRight size={12} aria-hidden /><span className="cr-avatar cr-avatar--m">{t.confieeA.initiale}</span></span> : <span className="cr-avatar cr-avatar--m" title={t.personne.nom}>{t.personne.initiale}</span>}
    </li>
  );

  const sousTitre = tm('sous', { o: vue.ouvertes, r: vue.enRetard, f: p.faitesAujourdhui.length });
  const phrase = phraseDeLaJourneeDeTaches(p.duJour.faites, p.duJour.total, p.serie.jours, p.apresLaFin);
  const segments = Math.min(p.duJour.total, SEGMENTS_MAX);

  return (
    <div className="cr-page jr-taches-page" data-famille="jour" data-ecran="H02">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        extra={
          <>
            <FilterChips libelle={tm('titre')} valeur={p.perimetre} onChange={(c) => p.onPerimetre(c as Perimetre)} puces={[
              { cle: 'moi', libelle: tm('puce.moi'), compteur: p.compteurs.moi },
              { cle: 'equipe', libelle: tm('puce.equipe'), compteur: p.compteurs.equipe },
              { cle: 'faites', libelle: tm('puce.faites') },
            ]} />
            <Segmente taille="compact" libelle={tm('vue.libelle')} valeur={p.vue} onChange={(v) => p.onVue(v as 'matrice' | 'liste')} options={[{ cle: 'matrice', libelle: tm('vue.matrice') }, { cle: 'liste', libelle: tm('vue.liste') }]} />
            <button type="button" className="jr-plus jr-plus--carre sc-focus" aria-label={tm('plus')}><MoreHorizontal size={16} aria-hidden /></button>
          </>
        }
        primaire={{ libelle: tm('nouvelle'), onClick: () => champ.current?.focus(), raccourci: 'N', icone: <Plus size={14} aria-hidden /> }}
      />
      <div className="jr-taches">
        <section className="cr-carte jr-matrice" data-mvt="entree" aria-label={tm('titre')}>
          <div className="jr-ajout">
            <Plus size={16} aria-hidden />
            <input ref={champ} value={saisie} onChange={(e) => setSaisie(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') creer(); if (e.key === 'Escape') setSaisie(''); }} placeholder={tm('saisie.placeholder')} aria-label={tm('saisie.libelle')} />
            {analyse && (
              <span className="jr-puces">
                {analyse.echeance && <span className="jr-puce" data-ton="info"><CalendarDays size={12} aria-hidden />{jourCourt(analyse.echeance)}{analyse.heure ? `, ${analyse.heure}` : ''}</span>}
                {analyse.personne && <span className="jr-puce" data-ton="turquoise"><Users size={12} aria-hidden />{analyse.personne}</span>}
                <span className="jr-puce" data-ton="info"><LayoutGrid size={12} aria-hidden />{tm('saisie.va', { case: nom(analyse.case) })}</span>
                <kbd className="jr-kbd">{tm('saisie.entree')}</kbd>
              </span>
            )}
          </div>
          {p.vue === 'matrice' ? (
            <div className="jr-grille">
              <span className="jr-axe jr-axe--h1"><Zap size={12} aria-hidden />{tm('axe.urgent')}</span>
              <span className="jr-axe jr-axe--h2"><Clock size={12} aria-hidden />{tm('axe.pasUrgent')}</span>
              <span className="jr-axe jr-axe--v1">{tm('axe.important')}</span>
              <span className="jr-axe jr-axe--v2">{tm('axe.moins')}</span>
              {(['maintenant', 'planifier', 'deleguer', 'alleger'] as const).map((c, i) => {
                const donnees = vue.cases[c];
                const visibles = donnees.taches.slice(0, TACHES_VISIBLES_PAR_CASE);
                const reste = donnees.taches.length - visibles.length;
                const pied = c === 'planifier' && p.tempsLibre ? tm('pied.planifier', p.tempsLibre) : c === 'deleguer' && p.suggestion ? tm('pied.deleguer', { nom: p.suggestion.nom }) : c === 'alleger' ? tm('pied.alleger') : null;
                return (
                  <section
                    key={c}
                    className="jr-case-matrice"
                    data-case={c}
                    aria-label={nom(c)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) p.onDeplacer(id, c); }}
                  >
                    <header>
                      <b className="jr-compte">{donnees.ouvertes}</b>
                      <i className="jr-point" data-ton={PUCE_DE_CASE[c]} aria-hidden />
                      <b>{nom(c)}</b>
                      <small>{donnees.enRetard > 0 && c === 'maintenant' ? tm('case.dont', { n: donnees.enRetard }) : tm(`case.${c}.aide` as CleH02)}</small>
                      <kbd className="jr-kbd">{i + 1}</kbd>
                    </header>
                    <ul>{visibles.map((t) => carte(t as TacheCarte))}{visibles.length === 0 && <li className="jr-rien">{tm('tache.vide')}</li>}</ul>
                    {reste > 0 ? <small className="jr-pied">{tm('case.autres', { n: reste })}</small> : pied && c !== 'maintenant' ? <small className="jr-pied">{pied}</small> : null}
                  </section>
                );
              })}
            </div>
          ) : (
            <ul className="jr-liste">
              {(p.perimetre === 'faites' ? p.faitesAujourdhui : vue.cases.maintenant.taches.concat(vue.cases.planifier.taches, vue.cases.deleguer.taches, vue.cases.alleger.taches)).map((t) => carte(t as TacheCarte))}
              {(p.perimetre === 'faites' ? p.faitesAujourdhui : p.taches).length === 0 && <li className="jr-rien">{tm(p.perimetre === 'faites' ? 'liste.faitesVide' : 'liste.vide')}</li>}
            </ul>
          )}
        </section>
        <aside className="jr-taches__droite">
          <section className="cr-carte jr-jour" data-mvt="entree" aria-label={tm('jour.titre', { total: p.duJour.total })}>
            <p className="jr-jour__tete"><b className="cr-mono">{p.duJour.faites}</b><span>{tm('jour.titre', { total: p.duJour.total })}</span><small>{tm('jour.aujourdhui')}</small></p>
            {segments > 0 && <span className="jr-segments" aria-hidden>{Array.from({ length: segments }, (_, i) => <i key={i} data-plein={i < p.duJour.faites} />)}</span>}
            <p className="jr-jour__phrase">
              {phrase.type === 'plus-que' ? tm('jour.plus', { n: phrase.restantes, heure: p.finDeJournee, serie: phrase.serieSiBouclee }) : phrase.type === 'finie' ? tm('jour.finie') : phrase.type === 'bouclee' ? tm('jour.bouclee') : tm('jour.rien')}
            </p>
            <h3>{tm('jour.faitTitre')}</h3>
            <ul>
              {p.faitesAujourdhui.slice(0, 5).map((t) => <li key={t.id}><span className="jr-coche" aria-hidden><Check size={10} strokeWidth={3} /></span><span>{t.titre}</span><em className="cr-mono">{t.faiteA}</em></li>)}
              {p.faitesAujourdhui.length === 0 && <li className="cr-t3">{tm('jour.faitRien')}</li>}
            </ul>
            {p.faitesAujourdhui.length > 5 && <small className="cr-t3 jr-jour__plus">{tm('jour.faitPlus', { n: p.faitesAujourdhui.length - 5 })}</small>}
          </section>
          <section className="cr-carte jr-serie" data-mvt="entree" aria-label={tm('serie.titre', { n: p.serie.jours })}>
            <span className="jr-trophee" aria-hidden><Trophy size={18} /></span>
            <div>
              <b>{p.serie.jours > 0 ? tm('serie.titre', { n: p.serie.jours }) : tm('serie.aucune')}</b>
              {p.serie.prochainPalier !== null && p.serie.resteAvantPalier !== null && <small>{tm('serie.palier', { palier: p.serie.prochainPalier, reste: p.serie.resteAvantPalier })}</small>}
            </div>
            {p.serie.prochainPalier !== null && <span className="jr-serie__barre" aria-hidden><i style={{ width: `${Math.min(100, Math.round((p.serie.jours / p.serie.prochainPalier) * 100))}%` }} /></span>}
          </section>
          {p.suggestion && (
            <SuggestionAjmani
              titre={tm('suggestion.confier', { n: p.suggestion.n, nom: p.suggestion.nom })}
              texte={<>{tm('suggestion.texte', { nom: p.suggestion.nom })}<span className="jr-message"><small><span className="cr-avatar">{p.suggestion.initiale}</span>{tm('suggestion.message', { nom: p.suggestion.nom })}</small>{p.suggestion.message}</span></>}
              primaire={{ libelle: tm('suggestion.bouton', { nom: p.suggestion.nom }), onClick: p.onConfier ?? (() => undefined) }}
              secondaire={{ libelle: tm('suggestion.plusTard'), onClick: p.onPlusTard ?? (() => undefined) }}
            />
          )}
        </aside>
      </div>
      {p.retouche && <div className="jr-toast" role="status">{p.retouche}<button type="button" className="sc-focus" onClick={p.onDefaire}>{tm('tache.annuler')}</button></div>}
    </div>
  );
}

