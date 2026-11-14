import React from 'react';
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, MapPin, Moon, Plus, Video } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { PileAvatars } from '../../../socle/ui/Pastilles';
import { Segmente, SuggestionAjmani } from '../../../socle/ui/controles';
import { FAMILLES_BLOC, HAUTEUR_GRILLE, HEURE_DEBUT, HEURE_FIN, PX_PAR_HEURE, dureeCourte, type BlocGrille, type JourGrille, type ModeleSemaine } from './modele';
import { useMotsCalendrier } from './i18n';
import '../../contacts/cibles.css';
import './calendrier.css';

/**
 * « CALENDRIER » (H01) — la semaine heure par heure. Mise en page et états, sans accès aux données : tout vient du modèle
 * (`modele.ts`) et des actions. Disposition (fiche H01, zone principale de 1108 px) : en-tête de page, rail gauche de 240
 * (mini-mois 265, « Ensuite » 165, suggestion 206, écart 14), carte de la semaine de 854 × 664 sans rembourrage (en-tête des jours 62,
 * ligne « journée » 30, grille de 8:00 à 19:00 à 47 px par heure, pied 36). Jours ouvrés égaux, week-end resserré à 58 px.
 */
export interface ActionsCalendrier {
  vue: (v: 'jour' | 'semaine' | 'mois') => void;
  precedent: () => void;
  suivant: () => void;
  aujourdhui: () => void;
  nouveau: () => void;
  ouvrir: (id: string) => void;
  jour: (jour: string) => void;
  moisPrecedent: () => void;
  moisSuivant: () => void;
  rejoindre: (id: string) => void;
  preparer: (id: string) => void;
  bloquer: () => void;
  refuser: () => void;
  reessayer: () => void;
}

export interface VueCalendrierProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleSemaine;
  actions: ActionsCalendrier;
  lecture?: boolean;
}

const HEURES = Array.from({ length: HEURE_FIN - HEURE_DEBUT }, (_, i) => HEURE_DEBUT + i);
const fmt = (langue: string, jour: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { ...o, timeZone: 'UTC' }).format(new Date(`${jour}T12:00:00Z`));

export function VueCalendrier({ statut, horsLigne = false, modele, actions, lecture = false }: VueCalendrierProps) {
  const { tm, langue } = useMotsCalendrier();
  const m = modele;
  const premier = (j: string) => (j.slice(8) === '01' && langue === 'fr' ? '1er' : String(Number(j.slice(8))));
  const debut = `${premier(m.lundi)}${m.lundi.slice(5, 7) !== m.dimanche.slice(5, 7) ? ` ${fmt(langue, m.lundi, { month: 'long' })}` : ''}`;
  const fin = `${premier(m.dimanche)} ${fmt(langue, m.dimanche, { month: 'long' })}`;
  const debutTxt = m.lundi.slice(5, 7) === m.dimanche.slice(5, 7) ? premier(m.lundi) : debut;
  const sousTitre = [
    tm('sousTitre.semaine', { debut: debutTxt, fin }),
    tm(m.nbRendezVous <= 1 ? 'sousTitre.rdv.1' : 'sousTitre.rdv.n', { n: m.nbRendezVous }),
    ...(m.libres && m.libres.minutes > 0 ? [tm('sousTitre.libres', { duree: dureeCourte(m.libres.minutes), jour: m.libres.demain ? (langue === 'fr' ? 'demain' : 'tomorrow') : fmt(langue, m.libres.jour, { weekday: 'long' }) })] : []),
  ].join(' · ');
  const titreMois = fmt(langue, `${m.mois.titre}-01`, { month: 'long', year: 'numeric' }).replace(/^./, (c) => c.toUpperCase());
  const initialesJours = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 9, 26 + i, 12))).toUpperCase());

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        className="sc-cal__entete"
        extra={
          <>
            <Segmente libelle={tm('vue.libelle')} options={[{ cle: 'jour', libelle: tm('vue.jour') }, { cle: 'semaine', libelle: tm('vue.semaine') }, { cle: 'mois', libelle: tm('vue.mois') }]} valeur="semaine" onChange={(k) => actions.vue(k as 'jour' | 'semaine' | 'mois')} />
            <button type="button" className="sc-cal-fleche" aria-label={tm('nav.precedent')} onClick={actions.precedent}><ChevronLeft size={15} strokeWidth={2} /></button>
            <button type="button" className="sc-cal-fleche" aria-label={tm('nav.suivant')} onClick={actions.suivant}><ChevronRight size={15} strokeWidth={2} /></button>
          </>
        }
        secondaires={[{ libelle: tm('action.aujourdhui'), onClick: actions.aujourdhui }]}
        primaire={lecture ? undefined : { libelle: tm('action.nouveau'), onClick: actions.nouveau, icone: <Plus size={14} strokeWidth={2.2} />, raccourci: 'N' }}
      />
      {horsLigne && <p className="sc-cal__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-cal" aria-busy={statut === 'chargement' || undefined}>
          <div className="sc-cal-rail">
            <section className="sc-cal-carte sc-cal-mois" aria-label={titreMois}>
              <header><h2>{titreMois}</h2><span><button type="button" aria-label={tm('mois.precedent')} onClick={actions.moisPrecedent}><ChevronLeft size={14} strokeWidth={2} /></button><button type="button" aria-label={tm('mois.suivant')} onClick={actions.moisSuivant}><ChevronRight size={14} strokeWidth={2} /></button></span></header>
              <div className="sc-cal-mois__grille" role="grid">
                {initialesJours.map((l, i) => <span key={`l${i}`} className="sc-cal-mois__lettre" role="columnheader">{l}</span>)}
                {m.mois.semaines.map((sem) => (
                  <div key={sem[0].jour} className="sc-cal-mois__semaine" data-courante={sem[0].dansLaSemaine ? '' : undefined} role="row">
                    {sem.map((c) => (
                      <button key={c.jour} type="button" role="gridcell" className="sc-cal-mois__jour sc-nombre" data-hors={!c.dansLeMois ? '' : undefined} data-weekend={c.weekend ? '' : undefined} data-aujourdhui={c.aujourdhui ? '' : undefined} aria-label={fmt(langue, c.jour, { weekday: 'long', day: 'numeric', month: 'long' })} onClick={() => actions.jour(c.jour)}>
                        {c.numero}{c.points && <i aria-hidden />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <p className="sc-cal-mois__pied"><Moon size={13} strokeWidth={1.9} aria-hidden />{m.concentrationMin > 0 ? tm('mois.concentration', { duree: dureeCourte(m.concentrationMin) }) : ''}</p>
            </section>
            <Ensuite m={m} actions={actions} />
            <section className="sc-cal-suggestion" aria-label={tm('suggestion.astuce.titre')}>
              {m.propose && !lecture ? (
                <SuggestionAjmani
                  titre={tm('suggestion.libre', { heure: m.propose.heure })}
                  texte={tm('suggestion.texte', { tache: m.propose.titre, echeance: m.propose.echeanceHeure })}
                  primaire={{ libelle: tm('suggestion.bloquer'), onClick: actions.bloquer }}
                  secondaire={{ libelle: tm('suggestion.non'), onClick: actions.refuser }}
                />
              ) : (
                <div className="sc-cal-astuce"><span>{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
              )}
            </section>
          </div>

          <section className="sc-cal-carte sc-cal-semaine" aria-label={tm('grille.libelle')}>
            <div className="sc-cal-tete">
              <span className="sc-cal-gouttiere sc-nombre">S{m.semaine}</span>
              {m.jours.map((j) => <EnTeteJour key={j.jour} j={j} langue={langue} tm={tm} onJour={actions.jour} />)}
            </div>
            <div className="sc-cal-journee">
              <span className="sc-cal-gouttiere">{tm('journee.libelle')}</span>
              <div className="sc-cal-journee__cols">
                {m.puces.map((p) => (
                  <span key={p.id} className="sc-cal-puce" data-famille={p.famille} style={{ gridColumn: `${p.colDebut + 1} / ${p.colFin + 2}` }}><i aria-hidden />{p.titre}</span>
                ))}
              </div>
            </div>
            <div className="sc-cal-corps" style={{ height: HAUTEUR_GRILLE }}>
              <div className="sc-cal-heures" aria-hidden>
                {HEURES.map((h) => <span key={h} className="sc-nombre" style={{ top: (h - HEURE_DEBUT) * PX_PAR_HEURE }} data-masquee={m.heuresMasquees.includes(h) ? '' : undefined}>{`${h}:00`}</span>)}
              </div>
              <div className="sc-cal-jours">
                {m.jours.map((j, ci) => (
                  <div key={j.jour} className="sc-cal-jour" data-weekend={j.weekend ? '' : undefined} data-aujourdhui={j.aujourdhui ? '' : undefined}>
                    {j.blocs.map((b) => <Bloc key={b.id} b={b} j={j} tm={tm} onOuvrir={actions.ouvrir} />)}
                    {m.propose && m.propose.colonne === ci && (
                      <button type="button" className="sc-cal-propose" style={{ top: m.propose.y, height: m.propose.hauteur }} aria-label={tm('bloc.propose', { titre: m.propose.titre, heure: m.propose.heure, fin: m.propose.fin })} onClick={actions.bloquer}>
                        <span>{m.propose.titre}</span>
                        <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v5M12 16v5M3 12h5M16 12h5" /></svg>
                      </button>
                    )}
                    {m.maintenant && m.maintenant.colonne === ci && <span className="sc-cal-maintenant__fort" style={{ top: m.maintenant.y }} aria-hidden />}
                    {j.enPlus > 0 && <span className="sc-cal-enplus">{tm('bloc.enPlus', { n: j.enPlus })}</span>}
                  </div>
                ))}
                {m.maintenant && (
                  <div className="sc-cal-maintenant" style={{ top: m.maintenant.y }} aria-hidden>
                    <span className="sc-cal-maintenant__pastille sc-nombre">{m.maintenant.heure}</span>
                    <span className="sc-cal-maintenant__trait" />
                  </div>
                )}
              </div>
              {m.vide && statut === 'pret' && (
                <div className="sc-cal-vide"><BlocEtat icone={<CalendarDays size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('vide.titre')} texte={tm('vide.texte')} actions={lecture ? <span /> : <Bouton variante="secondaire" onClick={actions.nouveau}>{tm('action.nouveau')}</Bouton>} /></div>
              )}
            </div>
            <footer className="sc-cal-pied">
              {FAMILLES_BLOC.filter((f) => m.presents.familles.includes(f)).map((f) => <span key={f} className="sc-cal-legende" data-famille={f}><i aria-hidden />{tm(`pied.${f}` as const)}</span>)}
              {m.presents.concentration && <span className="sc-cal-legende" data-genre="concentration"><i aria-hidden />{tm('pied.concentration')}</span>}
              {m.presents.trajet && <span className="sc-cal-legende" data-genre="trajet"><i aria-hidden />{tm('pied.trajet')}</span>}
              {m.presents.propose && <span className="sc-cal-legende" data-genre="propose"><i aria-hidden />{tm('pied.propose')}</span>}
            </footer>
          </section>
        </div>
      )}
    </Page>
  );
}

function EnTeteJour({ j, langue, tm, onJour }: { j: JourGrille; langue: string; tm: ReturnType<typeof useMotsCalendrier>['tm']; onJour: (j: string) => void }) {
  const court = fmt(langue, j.jour, { weekday: 'short' }).replace(/\.$/, '').toUpperCase();
  return (
    <button type="button" className="sc-cal-entete" data-weekend={j.weekend ? '' : undefined} data-aujourdhui={j.aujourdhui ? '' : undefined} aria-label={fmt(langue, j.jour, { weekday: 'long', day: 'numeric', month: 'long' })} onClick={() => onJour(j.jour)}>
      <span className="sc-cal-entete__haut"><span className="sc-cal-entete__jour">{court}</span><b className="sc-cal-entete__numero sc-nombre">{j.numero}</b></span>
      {!j.weekend && (
        <span className="sc-cal-charge">
          <span className="sc-cal-charge__barre" aria-hidden><i style={{ width: `${Math.round((j.charge ?? 0) * 100)}%` }} /></span>
          <span className="sc-cal-charge__duree sc-nombre" title={tm('jour.charge', { duree: dureeCourte(j.chargeMin) })}>{j.chargeMin > 0 ? dureeCourte(j.chargeMin) : ''}</span>
        </span>
      )}
    </button>
  );
}

function Bloc({ b, j, tm, onOuvrir }: { b: BlocGrille; j: JourGrille; tm: ReturnType<typeof useMotsCalendrier>['tm']; onOuvrir: (id: string) => void }) {
  const style: React.CSSProperties = { top: b.y, height: b.hauteur, left: `${(b.colonne / b.colonnes) * 100}%`, width: `${100 / b.colonnes}%` };
  if (b.genre === 'trajet') {
    return (
      <span className="sc-cal-trajet" style={{ top: b.y, height: b.hauteur }} aria-label={tm('bloc.trajet', { n: b.dureeMin })}>
        <MapPin size={11} strokeWidth={1.9} aria-hidden />{tm('bloc.trajet', { n: b.dureeMin })}
      </span>
    );
  }
  const concentration = b.genre === 'concentration';
  return (
    <button type="button" className="sc-cal-bloc" data-genre={b.genre} data-famille={b.famille} data-etat={b.etat} data-prochain={b.prochain ? '' : undefined} data-ligne={b.uneLigne ? '' : undefined} style={style} aria-label={tm('bloc.ouvrir', { titre: b.titre, heure: b.heure })} title={`${b.titre} · ${b.heure}`} onClick={() => onOuvrir(b.id)}>
      {concentration ? (
        <>
          <span className="sc-cal-bloc__titre"><Moon size={11} strokeWidth={1.9} aria-hidden />{tm('bloc.concentration')}</span>
          {!b.uneLigne && <span className="sc-cal-bloc__detail">{b.detail || b.titre}</span>}
        </>
      ) : b.uneLigne ? (
        <span className="sc-cal-bloc__ligne"><b>{b.titre}</b><span className="sc-nombre">{b.heure}</span></span>
      ) : (
        <>
          <span className="sc-cal-bloc__titre">{b.titre}</span>
          <span className="sc-cal-bloc__heure sc-nombre">{b.heure}{b.detail ? <span> {b.detail}</span> : null}</span>
        </>
      )}
      {void j}
    </button>
  );
}

function Ensuite({ m, actions }: { m: ModeleSemaine; actions: ActionsCalendrier }) {
  const { tm } = useMotsCalendrier();
  const e = m.ensuite;
  return (
    <section className="sc-cal-carte sc-cal-ensuite" aria-label={tm('ensuite.titre')}>
      <header><span>{tm('ensuite.titre')}</span>{e && <b className="sc-nombre">{e.dans.genre === 'minutes' ? tm('ensuite.dans', { n: e.dans.n }) : tm('ensuite.a', { heure: e.dans.heure })}</b>}</header>
      {e ? (
        <>
          <h2>{e.titre}</h2>
          <p className="sc-cal-ensuite__quand"><span className="sc-nombre">{e.debut} → {e.fin}</span>{e.lieu ? ` · ${e.lieu}` : ''}</p>
          {e.participants.length > 0 && <p className="sc-cal-ensuite__qui"><PileAvatars noms={e.participants} libelle={e.participants.join(', ')} taille={24} /><span>{e.participants.join(', ')}</span></p>}
          <div className="sc-cal-ensuite__actions">
            {e.action === 'rejoindre' && <Bouton variante="primaire" taille="petit" icone={<Video size={14} strokeWidth={2} />} onClick={() => actions.rejoindre(e.id)}>{tm('ensuite.rejoindre')}</Bouton>}
            <Bouton variante="secondaire" taille="petit" onClick={() => actions.preparer(e.id)}>{tm('ensuite.preparer')}</Bouton>
          </div>
        </>
      ) : (
        <><h2>{tm('ensuite.vide')}</h2><p className="sc-cal-ensuite__quand">{tm('ensuite.videTexte')}</p></>
      )}
    </section>
  );
}
