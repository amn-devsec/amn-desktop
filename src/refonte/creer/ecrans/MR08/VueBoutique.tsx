import React from 'react';
import { Eye, Monitor, Package, Phone, Tag } from 'lucide-react';
import { PageHead, SuggestionAjmani, Segmente } from '../../../../socle/ui';
import { formaterEuro, formaterNombre } from '../../commun';
import { hauteurDeBande, type EtatBoutique, type SemaineBoutique } from '../../boutique';
import { useMots, type CleMR08 } from './textes';
import '../../creer.css';

export interface LigneDirect { appareil: 'telephone' | 'ordinateur' | 'tablette'; page: string; etape: 'regarde' | 'produit' | 'panier' | 'paiement'; dureeSec: number }
export interface Entonnoir5 { visites: number; fiches: number | null; paniers: number; paiements: number; commandes: number }

export interface VueBoutiqueProps {
  etat: EtatBoutique;
  direct: { nombre: number; lignes: LigneDirect[]; dernier?: { il: string; texte: string; montant: string } } | null;
  semaine: SemaineBoutique | null;
  vendus: { id: string; nom: string; quantite: number; barre: number }[];
  entonnoir: Entonnoir5;
  periode: 7 | 30;
  onPeriode: (p: 7 | 30) => void;
  paniers: { abandonnes: number; contactables: number };
  objectif: { caCents: number; objectifCents: number; pct: number; resteCents: number; semaines: number | null } | null;
  suggestion?: string;
  /** Le titre de la suggestion (« Relancer les paniers »). */
  suggestionTitre?: string;
  onAjouter?: () => void;
  onVoir?: () => void;
  onPreparer?: () => void;
  onNon?: () => void;
}

const TON_ETAPE = { regarde: 'gris', produit: 'info', panier: 'attention', paiement: 'succes' } as const;
const depuis = (s: number, tm: (c: CleMR08, p?: Record<string, string | number>) => string) => (s < 60 ? tm('direct.depuis.s', { n: s }) : tm('direct.depuis.min', { n: Math.round(s / 60) }));

export function VueBoutique(p: VueBoutiqueProps) {
  const { tm } = useMots();
  const e = p.entonnoir;
  const etapes = [
    { cle: 'visites', libelle: tm('etape.visites'), v: e.visites }, { cle: 'fiches', libelle: tm('etape.fiches'), v: e.fiches },
    { cle: 'paniers', libelle: tm('etape.paniers'), v: e.paniers }, { cle: 'paiements', libelle: tm('etape.paiements'), v: e.paiements }, { cle: 'commandes', libelle: tm('etape.commandes'), v: e.commandes },
  ];
  // Taux entre étapes MESURÉES : une étape absente (« non disponible ») est sautée, pas supposée.
  const mesurees = etapes.filter((x) => x.v !== null);
  const taux = mesurees.slice(1).map((x, i) => ({ cle: x.cle, pct: (mesurees[i].v as number) > 0 ? Math.round(((x.v as number) / (mesurees[i].v as number)) * 100) : null }));
  const pire = [...taux].filter((t) => t.pct !== null).sort((a, b) => (a.pct as number) - (b.pct as number))[0];
  const max = Math.max(1, e.visites);
  const sous = [tm(`sous.${p.etat === 'ouverte' ? 'ouverte' : p.etat === 'en-pause' ? 'pause' : 'fermee'}` as CleMR08), p.direct ? tm(p.direct.nombre >= 2 ? 'sous.visiteurs.n' : 'sous.visiteurs.1', { n: p.direct.nombre }) : null, p.semaine ? tm('sous.semaine', { n: p.semaine.commandes }) : null].filter(Boolean).join(' · ');
  const tel = p.direct?.lignes.filter((l) => l.appareil === 'telephone').length ?? 0;
  const ord = p.direct ? p.direct.nombre - tel : 0;
  const signe = (n: number) => `${n >= 0 ? '+' : ''}${n}`;
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR08">
      <PageHead titre={tm('titre')} sousTitre={sous} secondaires={[{ libelle: tm('voir'), onClick: p.onVoir ?? (() => undefined) }]} primaire={{ libelle: tm('ajouter'), onClick: p.onAjouter ?? (() => undefined) }} />
      <div className="cr-boutique">
        <section className="cr-carte cr-direct-boutique" data-mvt="entree" aria-label={tm('direct.titre')}>
          <header><h2>{tm('direct.titre')}</h2>{p.direct && <span className="cr-direct">{tm('direct.sous')}</span>}</header>
          {p.direct === null ? <p className="cr-t3" style={{ padding: '20px 18px' }}>{tm('direct.nonMesure')}</p> : (
            <div className="cr-direct-boutique__corps">
              <div className="cr-compteur">
                <span className="cr-compteur__rond"><b className="cr-mono">{p.direct.nombre}</b></span>
                <b>{tm('direct.visiteurs')}</b>
                <small>{tm('direct.detail', { panier: p.direct.lignes.filter((l) => l.etape === 'panier').length, paiement: p.direct.lignes.filter((l) => l.etape === 'paiement').length })}</small>
                <small><Phone size={12} aria-hidden /> {tm('direct.telephone', { n: tel })}</small>
                <small><Monitor size={12} aria-hidden /> {tm('direct.ordinateur', { n: ord })}</small>
              </div>
              <ul className="cr-visites-direct">
                {p.direct.lignes.map((l, i) => (
                  <li key={i}>{l.appareil === 'telephone' ? <Phone size={13} aria-hidden /> : <Monitor size={13} aria-hidden />}<span>{l.page}</span><em data-ton={TON_ETAPE[l.etape]}>● {tm(`etape.${l.etape}` as CleMR08)}</em><small>{depuis(l.dureeSec, tm)}</small></li>
                ))}
                {p.direct.dernier && <li className="cr-dernier"><span className="cr-mono cr-t3">{p.direct.dernier.il}</span><span>{p.direct.dernier.texte}</span><b className="cr-mono">{p.direct.dernier.montant}</b></li>}
              </ul>
            </div>
          )}
        </section>
        <section className="cr-carte cr-vend" data-mvt="entree" aria-label={tm('vend.titre')}>
          <header><h2>{tm('vend.titre')}</h2></header>
          {p.semaine ? (
            <div className="cr-vend__chiffres">
              <span><small>{tm('vend.semaine')}</small><b className="cr-mono">{formaterEuro(p.semaine.chiffreAffairesCents / 100)} {p.semaine.variationCaPct !== null && <em>{signe(p.semaine.variationCaPct)} %</em>}</b></span>
              <span><small>{tm('vend.commandes')}</small><b className="cr-mono">{p.semaine.commandes} <em>{signe(p.semaine.variationCommandes)}</em></b></span>
              <span><small>{tm('vend.panier')}</small><b className="cr-mono">{formaterEuro(p.semaine.panierMoyenCents / 100)}</b></span>
            </div>
          ) : <p className="cr-t3" style={{ padding: '0 18px' }}>{tm('nonDisponible')}</p>}
          <ul className="cr-vendus">
            {p.vendus.length === 0 ? <li className="cr-t3">{tm('vend.rien')}</li> : p.vendus.map((v) => (
              <li key={v.id}><span className="cr-vendus__vignette"><Package size={14} aria-hidden /></span><span><b>{v.nom}</b><i><u style={{ width: `${v.barre * 100}%` }} /></i></span><small>{tm(v.quantite >= 2 ? 'vend.vendus.n' : 'vend.vendus.1', { n: v.quantite })}</small></li>
            ))}
          </ul>
        </section>
        <section className="cr-carte cr-entonnoir" data-mvt="entree" aria-label={tm('entonnoir.titre')}>
          <header><h2>{tm('entonnoir.titre')}</h2><small>{tm(`entonnoir.sous.${p.periode}` as CleMR08)}</small><Segmente taille="compact" libelle={tm('entonnoir.titre')} valeur={String(p.periode)} onChange={(v) => p.onPeriode(Number(v) as 7 | 30)} options={[{ cle: '7', libelle: tm('periode.7') }, { cle: '30', libelle: tm('periode.30') }]} /></header>
          <div className="cr-entonnoir__corps">
            {etapes.map((x) => <span key={x.cle}><small>{x.libelle}</small><b className="cr-mono">{x.v === null ? '—' : formaterNombre(x.v, { decimales: 0 })}</b></span>)}
          </div>
          <svg className="cr-entonnoir__svg" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden>
            {mesurees.slice(0, -1).map((x, i) => {
              const a = hauteurDeBande(x.v as number, max, 100);
              const b = hauteurDeBande(mesurees[i + 1].v as number, max, 100);
              const w = 1000 / (mesurees.length - 1);
              return <polygon key={x.cle} points={`${i * w},${55 - a / 2} ${(i + 1) * w},${55 - b / 2} ${(i + 1) * w},${55 + b / 2} ${i * w},${55 + a / 2}`} className={i === mesurees.length - 2 ? 'cr-bande-fin' : 'cr-bande-ent'} />;
            })}
          </svg>
          <div className="cr-taux">
            {taux.map((t) => <span key={t.cle} className="cr-mono" data-pire={t.cle === pire?.cle}>{t.pct === null ? '—' : `${t.pct} %`}</span>)}
          </div>
          <div className="cr-constats">
            {pire && pire.pct !== null && <p data-ton="attention"><Eye size={15} aria-hidden /> {tm('constat.ecart', { pct: pire.pct })}</p>}
            <p><Tag size={15} aria-hidden /> {tm('constat.paniers', { n: p.paniers.abandonnes, c: p.paniers.contactables })}</p>
          </div>
        </section>
        <aside className="cr-boutique__droite">
          <section className="cr-carte cr-objectif" data-mvt="entree" aria-label={tm('objectif.titre')}>
            <header><h2>{tm('objectif.titre')}</h2>{p.objectif && <small>{tm('objectif.valeur', { ca: formaterEuro(p.objectif.caCents / 100), objectif: formaterEuro(p.objectif.objectifCents / 100) })}</small>}</header>
            {p.objectif ? (
              <>
                <span className="cr-objectif__barre"><i style={{ width: `${p.objectif.pct}%` }} />{[25, 50, 75].map((m) => <b key={m} style={{ left: `${m}%` }} />)}</span>
                <p>{p.objectif.semaines !== null ? tm('objectif.reste', { reste: formaterEuro(p.objectif.resteCents / 100), n: p.objectif.semaines }) : ''}</p>
              </>
            ) : <p className="cr-t3">{tm('objectif.nonDefini')}</p>}
          </section>
          {p.suggestion && <SuggestionAjmani titre={p.suggestionTitre ?? tm('suggestion.titre')} texte={p.suggestion} primaire={{ libelle: tm('suggestion.preparer'), onClick: p.onPreparer ?? (() => undefined) }} secondaire={{ libelle: tm('suggestion.non'), onClick: p.onNon ?? (() => undefined) }} />}
        </aside>
      </div>
    </div>
  );
}
