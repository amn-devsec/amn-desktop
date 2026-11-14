import React, { useState } from 'react';
import { AlertCircle, ChevronDown, Settings, Sparkles, Star, UserPlus, Users, Euro } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BarreProgression } from '../../../socle/ui/Indicateurs';
import { SuggestionAjmani } from '../../../socle/ui/controles';
import { BlocEtat } from '../../../socle/ui/situations';
import { CaseACocher } from '../../../socle/ui/Taches';
import { FilterChips } from '../../../socle/ui/vivant';
import { euros } from '../commun';
import { gardeLeFiltre, type ClientPose, type FiltreEchelle, type Geste, type ModeleFidelite } from './modele';
import { useMotsFidelite } from './i18n';
import './fidelite.css';
import '../cibles.css';

/**
 * « FIDÉLITÉ » (MC02) — l'échelle des paliers : mise en page et états, sans accès aux données.
 *
 * Disposition (fiche MC02, zone principale de 1108 px) : en-tête (titre, sous-titre, « Règles du programme », primaire
 * « Offrir un avantage »), surface « Échelle des paliers » de 768 × 664 (zone de l'échelle de 732 × 556, barreaux à
 * y = 124 / 316 / 508), pied « Gagner des points » ; à droite (320) « À offrir cette semaine » 296, « Le programme ce
 * mois » 157, la suggestion d'Ajmani 183, écart 14.
 */
export interface ActionsFidelite {
  regles: () => void;
  offrir: () => void;
  ouvrirClient: (id: number) => void;
  cocher: (cle: string, fait: boolean) => void;
  preparer: (clientId: number) => void;
  nonMerci: () => void;
  reessayer: () => void;
}

export interface VueFideliteProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleFidelite;
  /** Les clés des gestes de la semaine déjà faits. */
  faits: ReadonlySet<string>;
  actions: ActionsFidelite;
  lecture?: boolean;
  aujourdhui: string;
}

const Y_BARREAU = { Or: 124, Argent: 316, Bronze: 508 } as const;
const X_MONTANT = { gauche: 214, droite: 690 } as const;
const HAUTEUR_ECHELLE = 556;

export function VueFidelite({ statut, horsLigne = false, modele, faits, actions, lecture = false, aujourdhui }: VueFideliteProps) {
  const { tm } = useMotsFidelite();
  const [filtre, setFiltre] = useState<FiltreEchelle>('tous');
  const m = modele;
  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sousTitre')}
        secondaires={[{ libelle: tm('action.regles'), onClick: actions.regles, icone: <Settings size={14} strokeWidth={2} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.offrir'), onClick: actions.offrir, icone: <Sparkles size={14} strokeWidth={2} /> }}
        className="sc-fi__entete"
      />
      {horsLigne && <p className="sc-fi__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-fi" aria-busy={statut === 'chargement' || undefined}>
          <section className="sc-fi-carte sc-fi-surface" aria-label={tm('echelle.titre')}>
            <div className="sc-fi-surface__tete">
              <h2 className="sc-fi-carte__titre">{tm('echelle.titre')}</h2>
              <FilterChips
                libelle={tm('echelle.puces')}
                puces={[{ cle: 'tous', libelle: tm('echelle.tous') }, { cle: 'bientot', libelle: tm('echelle.bientot') }, { cle: 'inactifs', libelle: tm('echelle.inactifs') }]}
                valeur={filtre}
                onChange={(c) => setFiltre(c as FiltreEchelle)}
              />
              <span className="sc-fi-surface__fideles"><strong className="sc-nombre">{m.fideles}</strong> {tm('echelle.fideles', { total: m.actifs })}</span>
            </div>
            <div className="sc-fi-echelle">
              {statut === 'pret' && m.fideles === 0 && <div className="sc-fi-echelle__vide">
                <BlocEtat icone={<Users size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.vide.titre')} texte={tm('etat.vide.texte')} actions={<Bouton variante="primaire" onClick={actions.regles}>{tm('action.regles')}</Bouton>} /></div>}
              <Echelle m={m} filtre={filtre} aujourdhui={aujourdhui} onOuvrir={actions.ouvrirClient} />
              {m.barreaux.map((b) => <BlocPalier key={b.niveau} b={b} />)}
            </div>
            <div className="sc-fi-pied">
              <span className="sc-fi-pied__titre">{tm('pied.titre')}</span>
              <span className="sc-fi-puce"><Euro size={13} strokeWidth={1.9} aria-hidden />{tm(m.regles.pointsParEuro === 1 ? 'pied.euro.1' : 'pied.euro.n', { n: m.regles.pointsParEuro })}</span>
              <span className="sc-fi-puce"><Star size={13} strokeWidth={1.9} aria-hidden />{tm('pied.avis', { n: m.regles.pointsParAvis })}</span>
              <span className="sc-fi-puce"><UserPlus size={13} strokeWidth={1.9} aria-hidden />{tm('pied.reco', { n: m.regles.pointsParRecommandation })}</span>
            </div>
          </section>
          <div className="sc-fi-droite">
            <Offrir m={m} faits={faits} onCocher={actions.cocher} lecture={lecture} aujourdhui={aujourdhui} />
            <Programme m={m} />
            <Suggestion m={m} actions={actions} />
          </div>
        </div>
      )}
    </Page>
  );
}

function BlocPalier({ b }: { b: ModeleFidelite['barreaux'][number] }) {
  const { tm, langue } = useMotsFidelite();
  const nb = (n: number) => n.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB');
  return (
    <div className="sc-fi-palier" data-niveau={b.niveau} style={{ top: Y_BARREAU[b.niveau] - 108 }}>
      <span className="sc-fi-palier__nom"><span className="sc-fi-palier__point" aria-hidden />{tm(`palier.${b.niveau}` as const)}<span className="sc-fi-palier__effectif">{tm(b.effectif === 1 ? 'palier.effectif.1' : 'palier.effectif.n', { n: b.effectif })}</span></span>
      <span className="sc-fi-palier__plage sc-nombre">{b.jusqua == null ? tm('palier.plage.dernier', { depuis: nb(b.depuis) }) : tm('palier.plage', { depuis: nb(b.depuis), fin: nb(b.jusqua - 1) })}</span>
      <span className="sc-fi-palier__avantage">{tm('palier.avantage')}</span>
      <span className="sc-fi-palier__carres" role="img" aria-label={tm('palier.carres', { revenus: b.revenus, total: b.carres.length })}>
        {b.carres.slice(0, 48).map((plein, i) => <i key={i} data-plein={plein ? '' : undefined} />)}
      </span>
      <span className="sc-fi-palier__revenus">{tm(b.revenus === 1 ? 'palier.revenus.1' : 'palier.revenus.n', { n: b.revenus })}</span>
    </div>
  );
}

function Echelle({ m, filtre, aujourdhui, onOuvrir }: { m: ModeleFidelite; filtre: FiltreEchelle; aujourdhui: string; onOuvrir: (id: number) => void }) {
  const { tm, langue } = useMotsFidelite();
  const jour = (j: string) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const nb = (n: number) => n.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB');
  void aujourdhui;
  const parNiveau = (n: string) => m.barreaux.find((b) => b.niveau === n);
  return (
    <svg className="sc-fi-svg" viewBox={`0 0 732 ${HAUTEUR_ECHELLE}`} role="group" aria-label={tm('echelle.graphique', { or: parNiveau('Or')?.effectif ?? 0, argent: parNiveau('Argent')?.effectif ?? 0, bronze: parNiveau('Bronze')?.effectif ?? 0 })}>
      {[X_MONTANT.gauche, X_MONTANT.droite].map((x) => <line key={x} x1={x} x2={x} y1={14} y2={542} className="sc-fi-montant" />)}
      {m.barreaux.map((b) => {
        const y = Y_BARREAU[b.niveau];
        return (
          <g key={b.niveau}>
            <line x1={X_MONTANT.gauche} x2={X_MONTANT.droite} y1={y} y2={y} className="sc-fi-barreau" data-niveau={b.niveau} />
            {b.jusqua != null && <text x={X_MONTANT.droite + 12} y={y + 4} className="sc-fi-seuil sc-nombre">{nb(b.jusqua)}</text>}
            {b.effectif === 0 && <text x={(X_MONTANT.gauche + X_MONTANT.droite) / 2} y={y - 10} textAnchor="middle" className="sc-fi-vide">{tm('palier.vide')}</text>}
            {b.autres > 0 && (
              <g className="sc-fi-autres" transform={`translate(${X_MONTANT.gauche + 14} ${y + 12})`}>
                <rect width={166} height={22} rx={11} />
                <text x={12} y={15}>{tm(b.autres === 1 ? 'palier.autres.1' : 'palier.autres.n', { n: b.autres, niveau: tm(`palier.${b.niveau}` as const) })}</text>
              </g>
            )}
            {b.poses.map((c) => <Pose key={c.clientId} c={c} y={y} jour={jour} nb={nb} gardee={gardeLeFiltre(c, filtre)} onOuvrir={onOuvrir} niveauSuivantY={b.niveau === 'Bronze' ? Y_BARREAU.Argent : b.niveau === 'Argent' ? Y_BARREAU.Or : null} />)}
          </g>
        );
      })}
    </svg>
  );
}

function Pose({ c, y, jour, nb, gardee, onOuvrir, niveauSuivantY }: { c: ClientPose; y: number; jour: (j: string) => string; nb: (n: number) => string; gardee: boolean; onOuvrir: (id: number) => void; niveauSuivantY: number | null }) {
  const { tm } = useMotsFidelite();
  const x = c.x;
  const tige = c.rangee === 0 ? 12 : 54;
  const haut = y - tige - 26;
  const gauche = c.libelleAGauche;
  return (
    <g className="sc-fi-client" data-bientot={c.bientot ? '' : undefined} data-pale={gardee ? undefined : ''} data-gauche={gauche ? '' : undefined}>
      {c.bientot && niveauSuivantY != null && (
        <g className="sc-fi-montee">
          <line x1={x} x2={x} y1={haut} y2={niveauSuivantY + 4} />
          <text x={x - 12} y={(haut + niveauSuivantY) / 2} textAnchor="end">{tm(c.bientot.manque === 1 ? 'client.montee.1' : 'client.montee.n', { n: c.bientot.manque })}</text>
        </g>
      )}
      <line x1={x} x2={x} y1={y} y2={haut + 26} className="sc-fi-tige" />
      <circle cx={x} cy={y} r={3} className="sc-fi-contact" />
      <g
        tabIndex={0}
        role="button"
        aria-label={tm('client.info', { nom: c.nom, points: nb(c.points), jour: jour(c.derniereActiviteLe) })}
        onClick={() => onOuvrir(c.clientId)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOuvrir(c.clientId); } }}
        className="sc-fi-carre"
      >
        <rect x={x - 18} y={haut - 5} width={36} height={36} className="sc-ct-zone" />
        <rect x={x - 13} y={haut} width={26} height={26} rx={7} />
        <text x={x} y={haut + 17} textAnchor="middle" className="sc-fi-carre__lettre">{c.initiale}</text>
        <title>{tm('client.info', { nom: c.nom, points: nb(c.points), jour: jour(c.derniereActiviteLe) })}</title>
      </g>
      <text x={gauche ? x - 20 : x + 20} y={haut + 11} textAnchor={gauche ? 'end' : 'start'} className="sc-fi-client__nom">{c.nom.length > 16 ? `${c.nom.slice(0, 15).trimEnd()}…` : c.nom}</text>
      <text x={gauche ? x - 20 : x + 20} y={haut + 25} textAnchor={gauche ? 'end' : 'start'} className="sc-fi-client__points sc-nombre">{tm('client.points', { n: nb(c.points) })}</text>
    </g>
  );
}

function Offrir({ m, faits, onCocher, lecture, aujourdhui }: { m: ModeleFidelite; faits: ReadonlySet<string>; onCocher: (cle: string, fait: boolean) => void; lecture: boolean; aujourdhui: string }) {
  const { tm, langue } = useMotsFidelite();
  void aujourdhui;
  const fait = m.gestes.filter((g) => faits.has(g.cle)).length;
  const motif = (g: Geste): string => g.genre === 'anniversaire'
    ? tm('offrir.anniversaire', { n: Number(g.params.n), jour: new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${g.params.jour}T12:00:00Z`)) })
    : g.genre === 'seuil' ? tm('offrir.seuil', { points: Number(g.params.points).toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB') })
    : tm('offrir.palier', { niveau: tm(`palier.${String(g.params.niveau) as 'Or'}` as const) });
  return (
    <section className="sc-fi-carte sc-fi-offrir" aria-label={tm('offrir.titre')}>
      <div className="sc-fi-offrir__tete"><h2 className="sc-fi-carte__titre">{tm('offrir.titre')}</h2>{m.gestes.length > 0 && <span className="sc-fi-offrir__progression sc-nombre">{tm('offrir.progression', { fait, total: m.gestes.length })}</span>}</div>
      {m.gestes.length > 0 && <BarreProgression valeur={fait / m.gestes.length} ton="info" hauteur={4} libelle={tm('offrir.progression', { fait, total: m.gestes.length })} />}
      {m.gestes.length === 0 ? <p className="sc-fi-vide">{tm('offrir.vide')}</p> : (
        <ul className="sc-fi-offrir__liste">
          {m.gestes.map((g) => {
            const f = faits.has(g.cle);
            return (
              <li key={g.cle} className="sc-fi-geste" data-fait={f ? '' : undefined}>
                <CaseACocher coche={f} lecture={lecture} libelle={tm('offrir.cocher', { nom: g.clientNom })} onChange={(v) => onCocher(g.cle, v)} />
                <span className="sc-fi-geste__texte"><span className="sc-fi-geste__nom">{g.clientNom}</span><span className="sc-fi-geste__motif">{motif(g)}</span><span className="sc-fi-geste__recompense">{tm(`offrir.recompense.${g.genre}` as const)}</span></span>
                <span className="sc-fi-geste__palier" data-niveau={g.niveau} aria-hidden />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Programme({ m }: { m: ModeleFidelite }) {
  const { tm, langue } = useMotsFidelite();
  const p = m.programme;
  const nb = (n: number) => n.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB');
  return (
    <section className="sc-fi-carte sc-fi-programme" aria-label={tm('programme.titre')}>
      <h2 className="sc-fi-carte__titre">{tm('programme.titre')}</h2>
      <dl className="sc-fi-programme__lignes">
        <div><dt>{tm('programme.points')}</dt><dd className="sc-nombre">{nb(p.pointsDistribues)}</dd><dd className="sc-fi-programme__sous">{tm('programme.points.sous')}</dd></div>
        <div><dt>{tm('programme.avantages')}</dt><dd className="sc-nombre">{p.avantagesUtilises}</dd><dd className="sc-fi-programme__sous">{p.avantagesUtilises > 0 ? tm('programme.avantages.sous', { montant: euros(p.avantagesCents, langue) }) : tm('programme.avantages.aucun')}</dd></div>
        <div><dt>{tm('programme.revenus')}</dt><dd className="sc-nombre">{p.revenus}</dd><dd className="sc-fi-programme__sous">{tm('programme.revenus.sous', { n: m.fideles })}</dd></div>
      </dl>
    </section>
  );
}

function Suggestion({ m, actions }: { m: ModeleFidelite; actions: ActionsFidelite }) {
  const { tm } = useMotsFidelite();
  const s = m.suggestion;
  return (
    <section className="sc-fi-suggestion" aria-label={tm('suggestion.astuce.titre')}>
      {s ? (
        <SuggestionAjmani
          titre={tm('suggestion.titre', { nom: s.clientNom })}
          texte={tm('suggestion.texte', { jours: s.jours, rythme: s.rythme })}
          primaire={{ libelle: tm('suggestion.preparer'), onClick: () => actions.preparer(s.clientId) }}
          secondaire={{ libelle: tm('suggestion.nonMerci'), onClick: actions.nonMerci }}
        />
      ) : (
        <div className="sc-fi-astuce"><span className="sc-fi-astuce__titre">{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
      )}
    </section>
  );
}

void ChevronDown;
