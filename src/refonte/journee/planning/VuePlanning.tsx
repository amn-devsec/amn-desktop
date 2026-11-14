import React from 'react';
import { AlertCircle, Copy, Plus } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { Avatar } from '../../../socle/ui/Pastilles';
import { Segmente } from '../../../socle/ui/controles';
import { CATEGORIES, DEBUT_AXE, FIN_AXE, heures, type BarreCreneau, type BlocPersonne, type LigneJour, type ModeleSemainePlanning } from './modele';
import { useMotsPlanning } from './i18n';
import '../../contacts/cibles.css';
import './planning.css';

/**
 * « PLANNING DE L'ÉQUIPE » (MJ03) — un bloc par personne sur la semaine. Mise en page et états, sans accès aux données. Disposition (fiche MJ03,
 * zone principale de 1108 px) : une seule carte de 1108 × 664 (titre 52 avec « semaine remplie », règle horaire 28, trois blocs de ≈ 151 : personne
 * 190 · jour 52 · axe 784 de 9:00 à 18:00 (87,1 px par heure) · total 44 ; bandeau d'équilibre ; pied 40). Jamais un tri par charge.
 */
export interface ActionsPlanning {
  dupliquer: () => void;
  ajouter: () => void;
  semaine: (s: 'cette' | 'prochaine') => void;
  ouvrir: (id: string) => void;
  proposer: () => void;
  non: () => void;
  reessayer: () => void;
  ouvrirPlanning?: () => void;
}

export interface VuePlanningProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleSemainePlanning;
  semaine: 'cette' | 'prochaine';
  actions: ActionsPlanning;
  lecture?: boolean;
  /** Ce que la lecture dit de la source (les postes de l'application sont des demi-journées). */
  noteLecture?: boolean;
}

type Tm = ReturnType<typeof useMotsPlanning>['tm'];
const HEURES_REGLE = Array.from({ length: 10 }, (_, i) => 9 + i);

export function VuePlanning({ statut, horsLigne = false, modele: m, semaine, actions, lecture = false, noteLecture = false }: VuePlanningProps) {
  const { tm, langue } = useMotsPlanning();
  const fmt = (j: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { ...o, timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const debutTxt = fmt(m.lundi, { day: 'numeric' });
  const finTxt = fmt(m.vendredi, { day: 'numeric', month: 'long' });
  const sousTitre = m.heuresLibresAujourdhuiMin != null && m.heuresLibresAujourdhuiMin > 0 ? tm('sousTitre.libres', { duree: heures(m.heuresLibresAujourdhuiMin) }) : tm('sousTitre.sans');
  const r = m.remplie;
  const part = (r.pourcent ?? 0) / 100;

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        className="sc-pl2__entete"
        secondaires={lecture ? [] : [{ libelle: tm('action.dupliquer'), onClick: actions.dupliquer, icone: <Copy size={14} strokeWidth={1.9} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.ajouter'), onClick: actions.ajouter, icone: <Plus size={14} strokeWidth={2.2} /> }}
      />
      {horsLigne && <p className="sc-pl2__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {noteLecture && actions.ouvrirPlanning && (
        <p className="sc-pl2__lecture">
          {tm('lecture.shifts')}{' '}
          <button type="button" onClick={actions.ouvrirPlanning}>{tm('lecture.ouvrir')}</button>
        </p>
      )}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <section className="sc-pl2-carte" aria-busy={statut === 'chargement' || undefined} aria-label={tm('carte.semaine', { debut: debutTxt, fin: finTxt })}>
          <header className="sc-pl2-tete">
            <h2>{tm('carte.semaine', { debut: debutTxt, fin: finTxt })}</h2>
            <span className="sc-pl2-sous">{tm(m.blocs.length <= 1 ? 'carte.personnes.1' : 'carte.personnes.n', { n: m.blocs.length, debut: '9:00', fin: '18:00' })}</span>
            <div className="sc-pl2-droite">
              <Segmente libelle={tm('semaine.libelle')} options={[{ cle: 'cette', libelle: tm('semaine.cette') }, { cle: 'prochaine', libelle: tm('semaine.prochaine') }]} valeur={semaine} onChange={(k) => actions.semaine(k as 'cette' | 'prochaine')} />
              {r.pourcent != null && (
                <span className="sc-pl2-remplie">
                  <svg viewBox="0 0 36 36" aria-hidden><circle cx="18" cy="18" r="15" className="sc-pl2-anneau__fond" /><circle cx="18" cy="18" r="15" className="sc-pl2-anneau__arc" strokeDasharray={`${Math.min(1, part) * 94.2} 94.2`} transform="rotate(-90 18 18)" /></svg>
                  <span><b className="sc-nombre">{tm('remplie.valeur', { n: r.pourcent })}</b><small>{tm('remplie.libelle')}</small></span>
                </span>
              )}
            </div>
          </header>
          <div className="sc-pl2-regle" aria-hidden>
            <span className="sc-pl2-regle__libelle">{tm('regle.personneJour')}</span>
            <span className="sc-pl2-regle__vide" />
            <div className="sc-pl2-regle__axe">
              {HEURES_REGLE.map((h) => <span key={h} className="sc-nombre" data-masquee={m.maintenant && Math.abs(h * 60 - m.maintenant.x * (FIN_AXE - DEBUT_AXE) - DEBUT_AXE) < 80 && h !== 9 ? '' : undefined} style={{ left: `${((h * 60 - DEBUT_AXE) / (FIN_AXE - DEBUT_AXE)) * 100}%` }}>{h}:00</span>)}
              {m.maintenant && <b className="sc-pl2-regle__maintenant sc-nombre" style={{ left: `${m.maintenant.x * 100}%` }}>{m.maintenant.heure}</b>}
            </div>
            <span className="sc-pl2-regle__total">{tm('regle.total')}</span>
          </div>
          <div className="sc-pl2-blocs">
            {m.blocs.map((b) => <Bloc key={b.id} b={b} m={m} tm={tm} fmt={fmt} lecture={lecture} actions={actions} vide={m.vide && statut === 'pret'} />)}
          </div>
          {m.equilibre && !lecture && (
            <div className="sc-pl2-bandeau">
              <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v5M12 16v5M3 12h5M16 12h5" /></svg>
              <p>{tm('equilibre.texte', { nom: m.equilibre.nom, ecart: m.equilibre.ecartH })}</p>
              <Bouton variante="primaire" taille="petit" onClick={actions.proposer}>{tm('equilibre.proposer')}</Bouton>
              <Bouton variante="secondaire" taille="petit" onClick={actions.non}>{tm('equilibre.non')}</Bouton>
            </div>
          )}
          <footer className="sc-pl2-pied">
            {CATEGORIES.map((c) => <span key={c} className="sc-pl2-legende" data-categorie={c}><i aria-hidden />{tm(`pied.categorie.${c}` as const)}</span>)}
            <span className="sc-pl2-legende" data-libre><i aria-hidden />{tm('pied.libre')}</span>
            <span className="sc-pl2-reserves sc-nombre">{tm('pied.reserves', { reserve: heures(r.reserveMin), dispo: heures(r.disponibleMin) })}</span>
          </footer>
        </section>
      )}
    </Page>
  );
}

function Bloc({ b, m, tm, fmt, lecture, actions, vide }: { b: BlocPersonne; m: ModeleSemainePlanning; tm: Tm; fmt: (j: string, o: Intl.DateTimeFormatOptions) => string; lecture: boolean; actions: ActionsPlanning; vide: boolean }) {
  const mo = b.moment;
  return (
    <div className="sc-pl2-bloc">
      <div className="sc-pl2-personne">
        <div className="sc-pl2-personne__haut">
          <Avatar nom={b.nom} taille={34} enLigne={b.enLigne} />
          <span className="sc-pl2-personne__id"><b>{b.nom}</b><span>{b.moi ? tm('personne.vous', { role: b.role }) : b.role}</span></span>
        </div>
        <div className="sc-pl2-reserve"><span>{tm('personne.reserve')}</span><span className="sc-nombre"><b>{heures(b.reserveMin)}</b> {tm('personne.sur', { dispo: heures(b.disponibiliteMin) })}</span></div>
        <span className="sc-pl2-charge" data-ton={b.ton} aria-hidden><i style={{ width: `${Math.min(100, b.charge * 100)}%` }} /></span>
        {mo && <span className="sc-pl2-moment" data-genre={mo.genre === 'libre' ? 'libre' : 'occupe'}><i aria-hidden />{mo.genre === 'rendezVous' ? tm('moment.rendezVous', { titre: mo.titre, heure: mo.heure }) : mo.genre === 'occupe' ? tm('moment.occupe', { heure: mo.jusqua }) : tm('moment.libre', { heure: mo.jusqua })}</span>}
      </div>
      <div className="sc-pl2-lignes">
        {b.lignes.map((l) => <Ligne key={l.jour} l={l} tm={tm} fmt={fmt} lecture={lecture} onOuvrir={actions.ouvrir} />)}
        {vide && (
          <div className="sc-pl2-vide">
            <span>{tm('vide.titre')}</span>
            {!lecture && <button type="button" onClick={actions.ajouter}>{tm('vide.ajouter')}</button>}
          </div>
        )}
        {m.maintenant && <i className="sc-pl2-trait" style={{ left: `calc(52px + (100% - 52px - 44px) * ${m.maintenant.x})` }} aria-hidden />}
      </div>
    </div>
  );
}

function Ligne({ l, tm, fmt, lecture, onOuvrir }: { l: LigneJour; tm: Tm; fmt: (j: string, o: Intl.DateTimeFormatOptions) => string; lecture: boolean; onOuvrir: (id: string) => void }) {
  const jour = fmt(l.jour, { weekday: 'short', day: 'numeric' }).replace(/^./, (c) => c.toUpperCase());
  return (
    <div className="sc-pl2-ligne" data-aujourdhui={l.aujourdhui ? '' : undefined} data-absent={l.absent ? '' : undefined}>
      <span className="sc-pl2-jour">{jour}</span>
      <div className="sc-pl2-axe">
        {l.absent && <span className="sc-pl2-absent">{tm('absent')}</span>}
        {l.libres.map((x) => <span key={x.debut} className="sc-pl2-libre" style={{ left: `${x.x * 100}%`, width: `${x.largeur * 100}%` }}>{tm('libre.duree', { duree: heures(x.dureeMin) })}</span>)}
        {l.barres.map((c) => <Creneau key={c.id} c={c} tm={tm} lecture={lecture} aujourdhui={l.aujourdhui} onOuvrir={onOuvrir} />)}
      </div>
      <span className="sc-pl2-total sc-nombre">{l.totalMin > 0 ? heures(l.totalMin) : ''}</span>
    </div>
  );
}

function Creneau({ c, tm, lecture, aujourdhui, onOuvrir }: { c: BarreCreneau; tm: Tm; lecture: boolean; aujourdhui: boolean; onOuvrir: (id: string) => void }) {
  const style: React.CSSProperties = { left: `${c.x * 100}%`, width: `${c.largeur * 100}%`, ...(c.rangees === 2 ? { top: c.rangee === 0 ? 0 : '50%', height: '50%' } : null) };
  return (
    <button type="button" className="sc-pl2-creneau" data-categorie={c.categorie} data-aujourdhui={aujourdhui ? '' : undefined} data-conflit={c.conflit ? '' : undefined} style={style} disabled={lecture} title={c.conflit ? tm('creneau.chevauchement') : c.titre}
      aria-label={tm('creneau.ouvrir', { titre: c.titre, debut: c.debut, fin: c.fin })} onClick={() => onOuvrir(c.id)}>
      {!c.sansTitre && c.titre}
    </button>
  );
}

