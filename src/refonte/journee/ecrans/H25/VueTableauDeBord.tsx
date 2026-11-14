import React, { useMemo, useRef, useState } from 'react';
import { BarChart3, CalendarDays, Check, Copy, Eye, GripVertical, Link2, ListChecks, LineChart, PenLine, Plus, Search, ShieldCheck, Gauge as JaugeIcone, CircleDashed, Hash, Trash2, X } from 'lucide-react';
import { AnneauProgression, Courbe, Gauge, LiveDot, Modale, PageHead, SuggestionAjmani } from '../../../../socle/ui';
import { formaterEuro, formaterNombre } from '../../../../socle/formats';
import {
  COLONNES, HAUTEUR_RANGEE_PX, TYPES_DE_WIDGET, ajouter, deplacer, dupliquer, redimensionner, premierEmplacement, rangeesUtilisees, reperDeTaille, retirer,
  type TypeDeWidget, type Widget,
} from '../../grille';
import { useMots, type CleH25 } from './textes';
import '../../journee.css';

export interface LigneTicket { id: string; titre: string; ref?: string; client?: string; delai?: string; urgent?: boolean }
export interface LigneFacture { ref: string; client: string; cents: number; echeance: { type: 'retard' } | { type: 'dans'; jours: number } }
export interface LigneActivite { texte: string; quand: string; ton: 'succes' | 'info' }
export interface DonneesTableau {
  /** Le chiffre d'affaires du mois, l'écart au même jour du mois précédent et ses 30 derniers jours (`null` : source absente). */
  ca: { cents: number; ecartPct: number | null; courbe: { etiquette: string; valeur: number }[] } | null;
  objectif: { cents: number; objectifCents: number; avanceJours: number } | null;
  taches: { faites: number; total: number; serie: number } | null;
  agenda: { heure: string; delai: string; titre: string } | null;
  tickets: { visibles: LigneTicket[]; urgents: number; ouverts: number };
  utilisateurs: { total: number; ecartPct: number | null; parJour: { lettre: string; n: number }[] } | null;
  factures: LigneFacture[];
  activite: LigneActivite[];
  note: string;
  gardeEnOrdre: boolean;
}

export type EtatBrouillon = 'enregistre' | 'enregistrement' | 'hors-ligne';

export interface VueTableauProps {
  widgets: Widget[];
  donnees: DonneesTableau;
  modeEdition: boolean;
  apercu: boolean;
  etat: EtatBrouillon;
  selectionId: string | null;
  /** Un widget vient d'être retiré : le nom, pour « Widget retiré · Annuler ». */
  retire: string | null;
  onChange: (widgets: Widget[]) => void;
  onSelection: (id: string | null) => void;
  onModifier: () => void;
  onTerminer: () => void;
  onAnnuler: () => void;
  onApercu: (b: boolean) => void;
  onDefaire: () => void;
  onNote: (texte: string) => void;
  onConnecter?: () => void;
  /** Y a-t-il un brouillon différent du tableau publié ? (« Annuler » demande alors confirmation.) */
  differe: boolean;
}

const PAR_TYPE: Record<TypeDeWidget, { icone: React.ReactNode; contenu: string; largeur: number; hauteur: number }> = {
  chiffre: { icone: <Hash size={16} aria-hidden />, contenu: 'ca', largeur: 2, hauteur: 1 },
  courbe: { icone: <LineChart size={16} aria-hidden />, contenu: 'ca', largeur: 3, hauteur: 2 },
  barres: { icone: <BarChart3 size={16} aria-hidden />, contenu: 'utilisateurs', largeur: 2, hauteur: 1 },
  anneau: { icone: <CircleDashed size={16} aria-hidden />, contenu: 'taches', largeur: 1, hauteur: 1 },
  jauge: { icone: <JaugeIcone size={16} aria-hidden />, contenu: 'objectif', largeur: 2, hauteur: 2 },
  liste: { icone: <ListChecks size={16} aria-hidden />, contenu: 'tickets', largeur: 2, hauteur: 2 },
  agenda: { icone: <CalendarDays size={16} aria-hidden />, contenu: 'agenda', largeur: 1, hauteur: 1 },
  note: { icone: <PenLine size={16} aria-hidden />, contenu: 'note', largeur: 2, hauteur: 1 },
  garde: { icone: <ShieldCheck size={16} aria-hidden />, contenu: 'garde', largeur: 2, hauteur: 1 },
};

const TITRE_DU_CONTENU: Record<string, CleH25> = {
  ca: 'widget.ca', objectif: 'widget.objectif', taches: 'widget.taches', agenda: 'widget.agenda', tickets: 'widget.tickets',
  utilisateurs: 'widget.utilisateurs', note: 'widget.note', factures: 'widget.factures', activite: 'widget.activite', garde: 'widget.garde',
};

const GAP_PX = 12;

export function VueTableauDeBord(p: VueTableauProps) {
  const { tm } = useMots();
  const [recherche, setRecherche] = useState('');
  const [confirmeAnnuler, setConfirmeAnnuler] = useState(false);
  const [annonce, setAnnonce] = useState('');
  const toile = useRef<HTMLDivElement>(null);
  const geste = useRef<{ id: string; mode: 'deplacer' | 'taille'; x: number; y: number; w: Widget } | null>(null);
  const edition = p.modeEdition && !p.apercu;
  const selection = p.widgets.find((w) => w.id === p.selectionId) ?? null;
  const euros = (cents: number) => formaterEuro(cents / 100);

  const catalogue = useMemo(
    () => TYPES_DE_WIDGET.filter((t) => `${tm(`type.${t}` as CleH25)} ${tm(`type.${t}.usage` as CleH25)}`.toLowerCase().includes(recherche.trim().toLowerCase())),
    [recherche, tm],
  );

  const pas = () => {
    const r = toile.current?.getBoundingClientRect();
    const colonne = r && r.width > 0 ? (r.width - GAP_PX * (COLONNES - 1)) / COLONNES + GAP_PX : 140;
    return { x: colonne, y: HAUTEUR_RANGEE_PX + GAP_PX };
  };
  const demarrer = (e: React.PointerEvent, w: Widget, mode: 'deplacer' | 'taille') => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    p.onSelection(w.id);
    geste.current = { id: w.id, mode, x: e.clientX, y: e.clientY, w };
  };
  const bouger = (e: React.PointerEvent) => {
    const g = geste.current;
    if (!g) return;
    const { x, y } = pas();
    const dx = Math.round((e.clientX - g.x) / x);
    const dy = Math.round((e.clientY - g.y) / y);
    p.onChange(g.mode === 'deplacer' ? deplacer(p.widgets, g.id, g.w.colonne + dx, g.w.rangee + dy) : redimensionner(p.widgets, g.id, g.w.largeur + dx, g.w.hauteur + dy));
  };
  const finir = () => { geste.current = null; };
  const clavier = (e: React.KeyboardEvent, w: Widget) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (e.key === 'Escape') { p.onSelection(null); return; }
    if (!d) return;
    e.preventDefault();
    if (e.shiftKey) { p.onChange(redimensionner(p.widgets, w.id, w.largeur + d[0], w.hauteur + d[1])); return; }
    const apres = deplacer(p.widgets, w.id, w.colonne + d[0], w.rangee + d[1]);
    p.onChange(apres);
    const b = apres.find((x) => x.id === w.id);
    if (b) setAnnonce(tm('deplace', { r: b.rangee, c: b.colonne }));
  };
  const ajouterType = (t: TypeDeWidget) => {
    const c = PAR_TYPE[t];
    p.onChange(ajouter(p.widgets, { contenu: c.contenu, type: t, largeur: c.largeur, hauteur: c.hauteur, source: c.contenu === 'note' ? tm('widget.source.libre') : 'AMN' }));
  };

  const bas = rangeesUtilisees(p.widgets);
  const place = premierEmplacement(p.widgets, 3, 1);
  const rangees = Math.max(edition ? Math.max(bas, place.rangee) : bas, 1);

  return (
    <div className="cr-page jr-td" data-famille="jour" data-ecran="H25" data-edition={edition}>
      <PageHead
        titre={tm('titre')}
        sousTitre={p.modeEdition ? tm('sous.edition') : tm('sous.lecture')}
        extra={p.modeEdition ? <span className="jr-brouillon" data-etat={p.etat}><i aria-hidden />{tm(p.etat === 'enregistre' ? 'brouillon.enregistre' : p.etat === 'enregistrement' ? 'brouillon.enregistrement' : 'brouillon.horsLigne')}</span> : undefined}
        secondaires={p.modeEdition ? [
          { libelle: p.apercu ? tm('apercu.quitter') : tm('apercu'), onClick: () => p.onApercu(!p.apercu), icone: <Eye size={14} aria-hidden /> },
          { libelle: tm('annuler'), onClick: () => (p.differe ? setConfirmeAnnuler(true) : p.onAnnuler()) },
        ] : []}
        primaire={p.modeEdition ? { libelle: tm('terminer'), onClick: p.onTerminer, icone: <Check size={14} aria-hidden /> } : { libelle: tm('modifier'), onClick: p.onModifier, icone: <PenLine size={14} aria-hidden /> }}
      />
      <div className="jr-td__corps" data-catalogue={edition}>
        {edition && (
          <aside className="cr-carte jr-catalogue" data-mvt="entree" aria-label={tm('catalogue.titre')}>
            <header><b>{tm('catalogue.titre')}</b><small>{tm('catalogue.types', { n: TYPES_DE_WIDGET.length })}</small></header>
            <label className="cr-recherche"><Search size={14} aria-hidden /><input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder={tm('catalogue.chercher')} aria-label={tm('catalogue.chercher')} /></label>
            <ul>
              {catalogue.map((t) => (
                <li key={t}>
                  <span className="jr-vignette" aria-hidden>{PAR_TYPE[t].icone}</span>
                  <span className="jr-catalogue__texte"><b>{tm(`type.${t}` as CleH25)}</b><small>{tm(`type.${t}.usage` as CleH25)}</small></span>
                  <button type="button" className="jr-plus sc-focus" aria-label={tm('catalogue.ajouter', { nom: tm(`type.${t}` as CleH25) })} onClick={() => ajouterType(t)}><Plus size={14} aria-hidden /></button>
                </li>
              ))}
              {catalogue.length === 0 && <li className="cr-t3">{tm('catalogue.rien')}</li>}
            </ul>
            <SuggestionAjmani titre="" texte={tm('suggestion.texte')} primaire={{ libelle: tm('suggestion.ajouter'), onClick: () => ajouterType('liste') }} secondaire={{ libelle: tm('suggestion.non'), onClick: () => undefined }} />
            <button type="button" className="cr-bouton-verre jr-connecter sc-focus" onClick={p.onConnecter}><Link2 size={13} aria-hidden /> {tm('source.connecter')}</button>
          </aside>
        )}
        <div className="jr-toile" data-edition={edition} ref={toile} style={{ gridTemplateRows: `repeat(${rangees}, ${HAUTEUR_RANGEE_PX}px)` }} onPointerMove={edition ? bouger : undefined} onPointerUp={edition ? finir : undefined} onPointerCancel={edition ? finir : undefined}>
          {p.widgets.map((w) => {
            const choisi = edition && w.id === p.selectionId;
            const titre = tm(TITRE_DU_CONTENU[w.contenu] ?? 'widget.note');
            const sansSource = w.hauteur === 1 && w.largeur === 1;
            return (
              <section
                key={w.id}
                className="jr-widget"
                data-choisi={choisi}
                data-contenu={w.contenu}
                data-mvt="entree"
                aria-label={titre}
                style={{ gridColumn: `${w.colonne} / span ${w.largeur}`, gridRow: `${w.rangee} / span ${w.hauteur}` }}
              >
                <header>
                  {edition && <button type="button" className="jr-poignee sc-focus" aria-label={tm('poignee', { nom: titre })} onPointerDown={(e) => demarrer(e, w, 'deplacer')} onKeyDown={(e) => clavier(e, w)} onFocus={() => p.onSelection(w.id)}><GripVertical size={13} aria-hidden /></button>}
                  <b>{titre}</b>
                  {w.source && !sansSource && !choisi && <small className="jr-source">{w.source}</small>}
                  {choisi && w.contenu === 'utilisateurs' && <LiveDot ton="ok" libelle={titre} onde />}
                  {choisi && (
                    <span className="jr-outils">
                      <button type="button" className="jr-outil sc-focus" aria-label={tm('dupliquer', { nom: titre })} onClick={() => p.onChange(dupliquer(p.widgets, w.id))}><Copy size={13} aria-hidden /></button>
                      <button type="button" className="jr-outil sc-focus" aria-label={tm('retirer', { nom: titre })} onClick={() => p.onChange(retirer(p.widgets, w.id))}><Trash2 size={13} aria-hidden /></button>
                    </span>
                  )}
                  {edition && !choisi && <button type="button" className="jr-fermer sc-focus" aria-label={tm('retirer', { nom: titre })} onClick={() => p.onChange(retirer(p.widgets, w.id))}><X size={13} aria-hidden /></button>}
                </header>
                <div className="jr-widget__corps" onPointerDown={edition ? () => p.onSelection(w.id) : undefined}>
                  <Contenu w={w} d={p.donnees} euros={euros} onNote={p.onNote} editable={edition} />
                </div>
                {edition && <button type="button" className="jr-equerre sc-focus" aria-label={tm('taille', { nom: titre })} onPointerDown={(e) => demarrer(e, w, 'taille')} onKeyDown={(e) => clavier(e, w)} />}
                {choisi && <span className="jr-taille cr-mono">{reperDeTaille(w)}</span>}
              </section>
            );
          })}
          {edition && (
            <div className="jr-fantome" style={{ gridColumn: `${place.colonne} / span 3`, gridRow: `${place.rangee} / span 1` }}>
              <button type="button" className="jr-plus jr-plus--grand sc-focus" aria-label={tm('fantome.titre')} onClick={() => ajouterType('note')}><Plus size={16} aria-hidden /></button>
              <span><b>{p.widgets.length === 0 ? tm('vide.titre') : tm('fantome.titre')}</b><small>{p.widgets.length === 0 ? tm('vide.texte') : tm('fantome.texte')}</small></span>
            </div>
          )}
          {!edition && p.widgets.length === 0 && <div className="jr-fantome" style={{ gridColumn: '1 / span 6' }}><span><b>{tm('vide.titre')}</b><small>{tm('vide.texte')}</small></span></div>}
        </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{annonce}</span>
      {p.retire && (
        <div className="jr-toast" role="status">{tm('retire')}<button type="button" className="sc-focus" onClick={p.onDefaire}>{tm('retire.annuler')}</button></div>
      )}
      <Modale
        ouverte={confirmeAnnuler}
        onFermer={() => setConfirmeAnnuler(false)}
        titre={tm('annuler.titre')}
        description={tm('annuler.texte')}
        famille="jour"
        actions={<><button type="button" className="cr-bouton-verre" onClick={() => setConfirmeAnnuler(false)}>{tm('annuler.garder')}</button><button type="button" className="cr-bouton-plein" onClick={() => { setConfirmeAnnuler(false); p.onAnnuler(); }}>{tm('annuler.confirmer')}</button></>}
      >
        <p>{tm('annuler.texte')}</p>
      </Modale>
      {selection && edition && <span hidden aria-hidden>{selection.id}</span>}
    </div>
  );
}

function Contenu({ w, d, euros, onNote, editable }: { w: Widget; d: DonneesTableau; euros: (c: number) => string; onNote: (t: string) => void; editable: boolean }) {
  const { tm } = useMots();
  const large = w.largeur >= 2;
  const haut = w.hauteur >= 2;
  const nonConnecte = (
    <div className="jr-vide"><b>{tm('source.nonConnectee')}</b><small>{tm('source.nonConnectee.texte')}</small></div>
  );
  switch (w.contenu) {
    case 'ca': {
      if (!d.ca) return nonConnecte;
      const pct = d.ca.ecartPct;
      return (
        <>
          <p className="jr-grand"><b className="cr-mono">{euros(d.ca.cents)}</b>{pct !== null && <span data-ton={pct >= 0 ? 'succes' : 'attention'}>{tm('widget.ca.mois', { pct: `${pct > 0 ? '+' : ''}${formaterNombre(pct)} %` })}</span>}</p>
          {haut && large && d.ca.courbe.length > 1 && <Courbe donnees={d.ca.courbe} libelle={tm('widget.ca')} ton="succes" hauteur={130} depuisZero formater={(v) => euros(v)} />}
        </>
      );
    }
    case 'objectif': {
      if (!d.objectif) return <div className="jr-vide"><b>{tm('widget.objectif.sans')}</b></div>;
      const pct = Math.round((d.objectif.cents / d.objectif.objectifCents) * 100);
      return (
        <div className="jr-objectif">
          <Gauge valeur={Math.min(100, pct)} libelle={tm('widget.objectif')} ton="ok" largeur={haut ? 200 : 120} epaisseur={haut ? 12 : 9}>{pct} %</Gauge>
          <small>{pct >= 100 ? tm('widget.objectif.atteint') : tm('widget.objectif.du')}</small>
          <p className="cr-mono"><b>{euros(d.objectif.cents)}</b> {tm('widget.objectif.sur', { objectif: euros(d.objectif.objectifCents) })}</p>
          <span data-ton="succes">{d.objectif.avanceJours >= 0 ? tm('widget.objectif.avance', { n: d.objectif.avanceJours }) : tm('widget.objectif.retard', { n: Math.abs(d.objectif.avanceJours) })}</span>
        </div>
      );
    }
    case 'taches': {
      if (!d.taches) return nonConnecte;
      return (
        <div className="jr-wtaches">
          <AnneauProgression valeur={d.taches.total ? d.taches.faites / d.taches.total : 0} libelle={tm('widget.taches')} taille={50} epaisseur={5} ton="succes"><b className="cr-mono">{d.taches.faites}/{d.taches.total}</b></AnneauProgression>
          <span><small>{tm('widget.taches.serie')}</small><b>{tm('widget.taches.jours', { n: d.taches.serie })}</b></span>
        </div>
      );
    }
    case 'agenda':
      return d.agenda ? <p className="jr-agenda"><span><b className="cr-mono">{d.agenda.heure}</b><em>{d.agenda.delai}</em></span>{d.agenda.titre}</p> : <p className="cr-t3">{tm('widget.agenda.rien')}</p>;
    case 'tickets':
      return d.tickets.visibles.length === 0 ? <p className="cr-t3">{tm('widget.tickets.rien')}</p> : (
        <>
          <ul className="jr-lignes">
            {d.tickets.visibles.slice(0, haut ? 4 : 1).map((t) => (
              <li key={t.id} data-urgent={t.urgent}><i aria-hidden /><span><b>{t.titre}</b><small>{[t.ref, t.client].filter(Boolean).join(' · ')}</small></span>{t.delai && <em className="cr-mono">{t.delai}</em>}</li>
            ))}
          </ul>
          {haut && <small className="jr-pied">{tm('widget.tickets.pied', { u: d.tickets.urgents, o: d.tickets.ouverts })}</small>}
        </>
      );
    case 'utilisateurs': {
      if (!d.utilisateurs) return nonConnecte;
      const max = Math.max(1, ...d.utilisateurs.parJour.map((x) => x.n));
      return (
        <div className="jr-utilisateurs">
          <p><b className="cr-mono">{formaterNombre(d.utilisateurs.total)}</b>{d.utilisateurs.ecartPct !== null && <small data-ton="succes">{tm('widget.utilisateurs.7j', { pct: `${d.utilisateurs.ecartPct > 0 ? '+' : ''}${d.utilisateurs.ecartPct} %` })}</small>}</p>
          <div className="jr-barres" aria-hidden>
            {d.utilisateurs.parJour.map((x, i, t) => <span key={i}><i data-derniere={i === t.length - 1} style={{ height: `${Math.max(8, (x.n / max) * 100)}%` }} /><small>{x.lettre}</small></span>)}
          </div>
        </div>
      );
    }
    case 'note':
      return editable
        ? <textarea className="jr-note" value={d.note} onChange={(e) => onNote(e.target.value)} placeholder={tm('widget.note.placeholder')} aria-label={tm('widget.note')} />
        : <p className="jr-note jr-note--lecture">{d.note || tm('widget.note.placeholder')}</p>;
    case 'factures':
      return d.factures.length === 0 ? <p className="cr-t3">{tm('widget.factures.rien')}</p> : (
        <ul className="jr-factures">
          {d.factures.slice(0, w.hauteur >= 2 ? 6 : 3).map((f) => (
            <li key={f.ref}><b>{f.client}</b><span className="cr-mono cr-t3">{f.ref}</span><span className="cr-mono">{euros(f.cents)}</span><em data-retard={f.echeance.type === 'retard'}>{f.echeance.type === 'retard' ? tm('widget.factures.retard') : tm('widget.factures.dans', { n: f.echeance.jours })}</em></li>
          ))}
        </ul>
      );
    case 'activite':
      return d.activite.length === 0 ? <p className="cr-t3">{tm('widget.activite.rien')}</p> : (
        <ul className="jr-activite">{d.activite.slice(0, 3).map((a, i) => <li key={i} data-ton={a.ton}><i aria-hidden /><span>{a.texte}</span><em>{a.quand}</em></li>)}</ul>
      );
    case 'garde':
      return <p className="jr-garde"><LiveDot ton={d.gardeEnOrdre ? 'ok' : 'attention'} libelle={tm('widget.garde')} />{tm('widget.garde.ok')}</p>;
    default:
      return null;
  }
}
