import React from 'react';
import { AlertCircle, CalendarClock, Check, ChevronLeft, ChevronRight, Link2, Plus, Route, Video } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { PX_PAR_HEURE, HEURE_DEBUT, HEURE_FIN, LARGEUR_RUBAN, type CarteRdv, type ModeleJournee } from './modele';
import { useMotsRdv } from './i18n';
import './rdv.css';
import '../cibles.css';

/**
 * « RENDEZ-VOUS CLIENTS » (MC06) — le ruban de la journée : les rendez-vous sur un axe horaire de 08:00 à 19:00, la bande de
 * route dessous quand un service d'itinéraire donne les durées. Mise en page et états, sans accès aux données.
 *
 * Disposition (fiche MC06, zone principale de 1108 px) : en-tête (titre, sous-titre, « Lien de réservation », primaire
 * « Nouveau rendez-vous »), surface « journée » de 1108 × 383 (ruban de 1036 px), bande basse de 267 à y = 491 :
 * « Le trajet du jour » (654) et « Ton lien de réservation » (440).
 */
export interface ActionsRdv {
  nouveau: () => void;
  lien: () => void;
  jour: (jour: string) => void;
  ouvrir: (c: CarteRdv) => void;
  ouvrirAgenda: () => void;
  reessayer: () => void;
}

export interface VueRdvProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleJournee;
  actions: ActionsRdv;
  lecture?: boolean;
}

const HEURES = Array.from({ length: HEURE_FIN - HEURE_DEBUT - 1 }, (_, i) => HEURE_DEBUT + 1 + i);

export function VueRdv({ statut, horsLigne = false, modele, actions, lecture = false }: VueRdvProps) {
  const { tm, langue } = useMotsRdv();
  const m = modele;
  const formatJour = (j: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { ...opts, timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const titreJour = formatJour(m.jour, { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase());
  const duree = (min: number) => (min < 60 ? tm('rdv.duree.min', { n: min }) : min % 60 === 0 ? tm('rdv.duree.h', { h: min / 60 }) : tm('rdv.duree.hmin', { h: Math.floor(min / 60), m: min % 60 }));
  const hRoute = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`);
  const resume = [
    tm(m.total === 1 ? 'jour.resume.1' : 'jour.resume.n', { n: m.total }),
    ...(m.route && m.route.totalMin > 0 ? [tm('jour.resume.route', { h: hRoute(m.route.totalMin) })] : []),
    ...(m.route?.finDeJournee ? [tm('jour.resume.retour', { heure: m.route.finDeJournee })] : []),
  ].join(' · ');
  const jourDecale = (n: number) => { const d = new Date(`${m.jour}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={m.prochain ? tm('sousTitre', { heure: m.prochain.heure }) : tm('sousTitre.aucun')}
        secondaires={[{ libelle: tm('action.lien'), onClick: actions.lien, icone: <Link2 size={14} strokeWidth={2} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.nouveau'), onClick: actions.nouveau, icone: <Plus size={14} strokeWidth={2.2} /> }}
        className="sc-rd__entete"
      />
      {horsLigne && <p className="sc-rd__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-rd" aria-busy={statut === 'chargement' || undefined}>
          <section className="sc-rd-carte sc-rd-surface" aria-label={titreJour}>
            <div className="sc-rd-surface__tete">
              <button type="button" className="sc-rd-fleche" aria-label={tm('jour.precedent')} onClick={() => actions.jour(jourDecale(-1))}><ChevronLeft size={15} strokeWidth={2} /></button>
              <button type="button" className="sc-rd-fleche" aria-label={tm('jour.suivant')} onClick={() => actions.jour(jourDecale(1))}><ChevronRight size={15} strokeWidth={2} /></button>
              <div className="sc-rd-surface__titre"><h2>{titreJour}</h2><p>{resume}</p></div>
              <div className="sc-rd-puces" role="group">
                {m.puces.map((p) => (
                  <button key={p.jour} type="button" className="sc-rd-puce" aria-pressed={p.actif} aria-label={tm(p.nb === 1 ? 'jour.puce.1' : 'jour.puce.n', { jour: formatJour(p.jour, { weekday: 'long', day: 'numeric' }), n: p.nb })} onClick={() => actions.jour(p.jour)}>
                    <span>{formatJour(p.jour, { weekday: 'short' })} <b className="sc-nombre">{formatJour(p.jour, { day: 'numeric' })}</b></span>
                    <span className="sc-rd-puce__points" aria-hidden>{Array.from({ length: Math.min(4, p.nb) }, (_, i) => <i key={i} />)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sc-rd-ruban" role="group" aria-label={tm('rdv.ruban', { n: m.total })}>
              {m.cartes.length === 0 && statut === 'pret' && <div className="sc-rd-ruban__vide">
                <BlocEtat icone={<CalendarClock size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('jour.vide.titre')} actions={lecture ? <span /> : <Bouton variante="secondaire" onClick={actions.nouveau}>{tm('action.nouveau')}</Bouton>} /></div>}
              {m.cartes.map((c) => <Carte key={c.id} c={c} duree={duree} onOuvrir={actions.ouvrir} tm={tm} />)}
              <div className="sc-rd-axe">
                <span className="sc-rd-axe__ligne" />
                {HEURES.map((h) => <span key={h} className="sc-rd-axe__heure sc-nombre" style={{ left: (h - HEURE_DEBUT) * PX_PAR_HEURE }}>{`${String(h).padStart(2, '0')}:00`}</span>)}
                {m.cartes.map((c) => <span key={`b-${c.id}`} className="sc-rd-axe__barre" data-etat={c.etat} data-prochain={c.prochain ? '' : undefined} style={{ left: c.xCreneau, width: c.largeurBarre }} />)}
              </div>
              {m.route ? (
                <div className="sc-rd-route" aria-hidden>
                  <span className="sc-rd-route__ligne" />
                  {m.pause && <span className="sc-rd-route__pause" style={{ left: m.pause.x, width: m.pause.largeur }}>{tm('route.pause')}</span>}
                  {m.route.blocs.map((b) => <span key={b.verId} className="sc-rd-route__bloc" data-mode={b.mode} data-serre={b.tropJuste ? '' : undefined} data-vide={b.dureeMin == null ? '' : undefined} style={{ left: b.x, width: b.largeur }} />)}
                </div>
              ) : (
                <p className="sc-rd-route-indisponible">{tm('route.indisponible')}</p>
              )}
              {m.route && (
                <div className="sc-rd-trajets">
                  {m.route.blocs.map((b) => (
                    <span key={`t-${b.verId}`} className="sc-rd-legende-trajet" style={{ left: b.x + b.largeur / 2 }}>
                      <b>{b.dureeMin == null ? tm('route.apreciser') : tm(b.mode === 'pied' ? 'route.pied' : 'route.vehicule', { n: b.dureeMin })}</b>
                      {b.tropJuste && b.depart && <span data-serre>{tm('route.depart', { heure: b.depart })}</span>}
                    </span>
                  ))}
                </div>
              )}
              {m.maintenantX != null && (
                <span className="sc-rd-maintenant" style={{ left: m.maintenantX }}><span className="sc-rd-maintenant__pastille sc-nombre">{m.maintenantHeure}</span></span>
              )}
            </div>
            <div className="sc-rd-bandeau">
              <CalendarClock size={14} strokeWidth={1.9} aria-hidden /><p>{tm('suggestion.astuce')}</p><Bouton variante="secondaire" taille="petit" onClick={actions.ouvrirAgenda}>{tm('suggestion.ouvrirAgenda')}</Bouton></div>
          </section>
          <div className="sc-rd-bas">
            <section className="sc-rd-carte sc-rd-trajet" aria-label={tm('trajet.titre')}><div className="sc-rd-carte__tete"><h2 className="sc-rd-carte__titre">{tm('trajet.titre')}</h2><span className="sc-rd-carte__aide">{tm('trajet.aide')}</span></div><div className="sc-rd-vide"><Route size={16} strokeWidth={1.8} aria-hidden /><p>{m.total === 0 ? tm('trajet.aucun') : tm('trajet.indisponible')}</p></div></section>
            <section className="sc-rd-carte sc-rd-reservation" aria-label={tm('reservation.titre')}><h2 className="sc-rd-carte__titre">{tm('reservation.titre')}</h2><div className="sc-rd-vide"><Link2 size={16} strokeWidth={1.8} aria-hidden /><p>{tm('reservation.indisponible')}</p></div></section>
          </div>
        </div>
      )}
    </Page>
  );
}

function Carte({ c, duree, onOuvrir, tm }: { c: CarteRdv; duree: (min: number) => string; onOuvrir: (c: CarteRdv) => void; tm: ReturnType<typeof useMotsRdv>['tm'] }) {
  const etat = c.etat === 'passe' ? <span className="sc-rd-carte-rdv__etat" data-ton="succes"><Check size={13} strokeWidth={2.4} aria-hidden />{tm('rdv.fait')}</span>
    : c.dansMin != null ? <span className="sc-rd-carte-rdv__etat" data-ton="info"><i aria-hidden />{tm('rdv.dansMin', { n: c.dansMin })}</span>
    : c.etat === 'en-cours' ? <span className="sc-rd-carte-rdv__etat" data-ton="info"><i aria-hidden />{tm('rdv.enCours')}</span>
    : c.etat === 'a-confirmer' ? <span className="sc-rd-carte-rdv__etat">{tm('rdv.aConfirmer')}</span>
    : <span className="sc-rd-carte-rdv__etat">{tm('rdv.aVenir')}</span>;
  return (
    <button type="button" className="sc-rd-carte-rdv" data-etat={c.etat} data-prochain={c.prochain ? '' : undefined} style={{ left: c.x, width: c.largeur }} aria-label={tm('rdv.ouvrir', { client: c.client || c.sujet })} onClick={() => onOuvrir(c)}>
      <span className="sc-rd-carte-rdv__haut"><b className="sc-nombre">{c.heure}</b><span>· {duree(c.dureeMin)}</span>{etat}</span>
      <span className="sc-rd-carte-rdv__nom">{c.client || c.sujet}</span>
      <span className="sc-rd-carte-rdv__sujet">{c.mode === 'visio' && <Video size={12} strokeWidth={1.9} aria-label={tm('rdv.visio')} />}{[c.sujet, c.lieu].filter(Boolean).join(' · ')}</span>
      <span className="sc-rd-carte-rdv__tige" style={{ left: Math.max(6, Math.min(c.largeur - 6, c.xCreneau - c.x)) }} aria-hidden />
    </button>
  );
}

void LARGEUR_RUBAN;
