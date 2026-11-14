import React from 'react';
import { Truck, X } from 'lucide-react';
import { PageHead, Raccourci, Segmente } from '../../../../socle/ui';
import { FilterChips, InlineSuggestion } from '../../../../socle/ui/vivant';
import { formaterEuro, formaterNombre, type Jour } from '../../commun';
import { compte } from '../../i18n';
import { useMots } from './textes';
import type { Couloir, Jauge, LigneMouvement, ModeleStock } from './modele';
import '../../creer.css';

export interface VueStockProps {
  modele: ModeleStock;
  aujourdhui: Jour;
  emplacement: string | null;
  onEmplacement: (e: string | null) => void;
  filtre: 'tout' | 'sous';
  onFiltre: (f: 'tout' | 'sous') => void;
  /** Texte de la suggestion de commande groupée (calculé : fournisseur, économie) ; absent : pas de bandeau. */
  suggestion?: string;
  onNouvelArticle?: () => void;
  onInventaire?: () => void;
  onPreparer?: () => void;
  onNon?: () => void;
  onCommander?: () => void;
  auteurs?: Readonly<Record<string, string>>;
}

const MOIS_VIDE = '—';

function Tube({ j, selectionne }: { j: Jauge; selectionne: boolean }) {
  const { tm } = useMots();
  return (
    <div className="cr-colonne" data-selectionne={selectionne} data-ton={j.ton}>
      <b className="cr-mono cr-colonne__q">{formaterNombre(j.quantite, { decimales: 0 })}</b>
      <small className="cr-colonne__seuil">{tm('seuil', { n: formaterNombre(j.seuil, { decimales: 0 }) })}</small>
      <div className="cr-tube" role="img" aria-label={`${j.nom} : ${j.quantite}, ${tm('seuil', { n: j.seuil })}`}>
        <i className="cr-tube__niveau" style={{ height: `${Math.round(j.remplissage * 100)}%` }} />
        {j.enRoute && <i className="cr-tube__route" style={{ bottom: `${Math.round(j.remplissage * 100)}%`, height: `${Math.round(j.enRoute.part * 100)}%` }} />}
        <i className="cr-tube__seuil" style={{ bottom: `${Math.round(j.repereSeuil * 100)}%` }} />
        {selectionne && <i className="cr-tube__vivant" />}
      </div>
      {j.enRoute && (
        <span className="cr-colonne__route"><b className="cr-mono">{tm('enRoute', { n: j.enRoute.quantite })}</b><small>{j.enRoute.jour}</small></span>
      )}
      <span className="cr-colonne__nom" title={j.nom}>{j.nom}</span>
      <small className="cr-mono cr-colonne__ref">{j.reference}</small>
    </div>
  );
}

function LigneCouloir({ c }: { c: Couloir }) {
  const { tm } = useMots();
  const pas = 100 / 14;
  const fin = c.rupture * pas;
  return (
    <div className="cr-couloir-stock" data-statut={c.statut}>
      <div className="cr-couloir-stock__nom">
        <b>{c.nom}</b>
        <small>{c.statut === 'evitee' ? tm('ruptures.evitee', { n: c.quantiteLivree, jour: c.jourLivraison ?? MOIS_VIDE }) : tm('ruptures.rupture', { jour: c.jourRupture })}</small>
      </div>
      <div className="cr-couloir-stock__piste">
        {c.statut === 'evitee' && c.livraison !== null ? (
          <>
            <i className="cr-bande cr-bande--avant" style={{ left: 0, width: `${c.livraison * pas}%` }} />
            <i className="cr-bande cr-bande--apres" style={{ left: `${c.livraison * pas}%`, right: 0 }} />
            <span className="cr-marque" style={{ left: `${c.livraison * pas}%` }}><Truck size={12} aria-hidden /></span>
            <span className="cr-marque cr-marque--evitee" style={{ left: `${Math.min(100, fin)}%` }} aria-hidden />
          </>
        ) : (
          <>
            <i className="cr-bande cr-bande--rupture" style={{ left: 0, width: `${fin}%` }} />
            <span className="cr-marque cr-marque--rupture" style={{ left: `${fin}%` }}><X size={12} aria-hidden /></span>
          </>
        )}
      </div>
    </div>
  );
}

function Mouvement({ m, aujourdhui, auteurs }: { m: LigneMouvement; aujourdhui: Jour; auteurs?: Readonly<Record<string, string>> }) {
  const { tm } = useMots();
  const signe = m.quantite >= 0 ? '+' : '−';
  const quand = m.le === aujourdhui ? null : tm('mouvements.hier');
  const auteur = auteurs?.[m.id];
  return (
    <li className="cr-mouvement">
      <span className="cr-mono cr-t3">{quand ?? tm('ruptures.auj')}</span>
      <b className="cr-mono" data-entree={m.quantite >= 0}>{signe}{formaterNombre(Math.abs(m.quantite), { decimales: 0 })}</b>
      <span className="cr-mouvement__texte"><span>{m.nom}</span> <small>{m.motif.toLowerCase()}</small></span>
      {auteur && <span className="cr-avatar cr-avatar--m">{auteur}</span>}
    </li>
  );
}

export function VueStock(p: VueStockProps) {
  const { tm, langue } = useMots();
  const { modele: m } = p;
  const puces = [
    { cle: 'tout', libelle: tm('puce.tout'), compteur: m.total },
    { cle: 'sous', libelle: tm('puce.sous'), compteur: m.surveiller },
  ];
  const segments = m.emplacements.map((e) => ({ cle: e, libelle: e }));
  const sousTitre = tm('sous', {
    emplacements: m.emplacements.join(' · ').toLowerCase().replace(/^./, (c) => c.toUpperCase()),
    refs: compte(langue, 'stock.refs', m.total),
    valeur: formaterEuro(m.valeurCents / 100),
    surveiller: compte(langue, 'stock.surveiller', m.surveiller),
  });
  return (
    <div className="cr-page" data-famille="creer" data-ecran="H15">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        secondaires={[{ libelle: tm('inventaire'), onClick: p.onInventaire ?? (() => undefined) }]}
        primaire={{ libelle: tm('nouvelArticle'), onClick: p.onNouvelArticle ?? (() => undefined), raccourci: 'N' }}
      />
      <section className="cr-carte cr-niveaux" data-mvt="entree" aria-label={tm('niveaux.titre')}>
        <div className="cr-niveaux__tete">
          <div className="cr-ligne-titre"><h2>{tm('niveaux.titre')}</h2></div>
          <FilterChips libelle={tm('niveaux.titre')} puces={puces} valeur={p.filtre} onChange={(c) => p.onFiltre(c as 'tout' | 'sous')} />
          {segments.length > 1 && (
            <Segmente
              libelle={tm('emplacement.tous')}
              valeur={p.emplacement ?? segments[0].cle}
              options={segments}
              onChange={(v) => p.onEmplacement(v)}
            />
          )}
        </div>
        <p className="cr-legende"><span className="cr-legende__seuil">- - -</span> {tm('legende.seuil')} <span className="cr-legende__route" /> {tm('legende.enRoute')} <span>{tm('legende.cible')}</span></p>
        {m.jauges.length === 0 ? (
          <p className="cr-t3" style={{ padding: '32px 18px' }}>{tm('vide.titre')}</p>
        ) : (
          <div className="cr-tubes">
            {m.jauges.map((j, i) => <Tube key={j.id} j={j} selectionne={i === 0 && j.ton !== 'neutre'} />)}
          </div>
        )}
        {p.suggestion && (
          <InlineSuggestion texte={p.suggestion} libelleOui={tm('suggestion.preparer')} libelleNon={tm('suggestion.non')} onOui={p.onPreparer ?? (() => undefined)} onNon={p.onNon ?? (() => undefined)} />
        )}
      </section>
      <div className="cr-stock-bas">
        <section className="cr-carte cr-ruptures" data-mvt="entree" aria-label={tm('ruptures.titre')}>
          <div className="cr-ruptures__tete">
            <div className="cr-ligne-titre"><h2>{tm('ruptures.titre')}</h2><p>{tm('ruptures.sous')}</p></div>
            {m.aCommander > 0 && (
              <>
                <span className="cr-pastille" style={{ color: 'var(--socle-etat-critique)', background: 'color-mix(in srgb, var(--socle-etat-critique) 14%, transparent)', borderColor: 'color-mix(in srgb, var(--socle-etat-critique) 38%, transparent)' }}>● {tm('ruptures.aCommander', { n: m.aCommander })}</span>
                <button type="button" className="cr-bouton-verre" onClick={p.onCommander}>{tm('ruptures.commander', { n: m.aCommander })}</button>
              </>
            )}
          </div>
          {m.couloirs.length === 0 ? (
            <p className="cr-t3" style={{ padding: '18px' }}>{m.total === 0 ? tm('ruptures.rien') : tm('ruptures.aucune')}</p>
          ) : (
            <>
              <div className="cr-jours cr-mono">
                <span />
                <div>{m.repereJours.map((j, i) => <span key={j}>{i === 0 ? tm('ruptures.auj') : Number(j.slice(8))}</span>)}</div>
              </div>
              {m.couloirs.map((c) => <LigneCouloir key={c.id} c={c} />)}
            </>
          )}
        </section>
        <section className="cr-carte cr-mouvements" data-mvt="entree" aria-label={tm('mouvements.titre')}>
          <div className="cr-mouvements__tete">
            <b>{tm('mouvements.titre')}</b>
            <span className="cr-direct">{tm('mouvements.direct')}</span>
            <span className="cr-mouvements__saisir">{tm('mouvements.saisir')} <Raccourci>M</Raccourci></span>
          </div>
          {m.mouvements.length === 0 ? <p className="cr-t3" style={{ padding: 18 }}>{tm('mouvements.aucun')}</p> : (
            <ul>{m.mouvements.map((mv) => <Mouvement key={mv.id} m={mv} aujourdhui={p.aujourdhui} auteurs={p.auteurs} />)}</ul>
          )}
        </section>
      </div>
    </div>
  );
}
