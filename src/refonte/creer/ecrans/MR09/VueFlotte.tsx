import React, { useMemo, useState } from 'react';
import { MapPin, Plus, Truck, User, Wrench } from 'lucide-react';
import { Gauge, LiveDot, PageHead, Segmente, SuggestionAjmani } from '../../../../socle/ui';
import { ajouterMois, debutDeMois, ecartJours, formaterNombre, INSECABLE, jourEtMois, MOIS_LONGS, type Jour } from '../../commun';
import {
  autonomieKm, calculerEcheance, chiffresDuCompteur, controlesAvantTrajet, echeanceProche, friseDEntretien, kmParJour, suggestionEcheance, tonDeLaJauge,
  type EcheanceCalculee, type EcheanceEntree, type Energie, type EtatVehicule, type PointDeFrise, type TonJauge,
} from '../../flotte';
import { useMots, type CleMR09 } from './textes';
import '../../creer.css';

export interface VehiculeVue {
  id: string;
  nom: string;
  plaque?: string;
  energie: Energie;
  etat: EtatVehicule;
  /** Ce que la bande « garage » dit : le conducteur (« Riyad », « Aaron, cet après-midi »)… */
  conducteur?: string;
  /** … ou, au garage, le lieu. */
  lieu?: string;
  /** Niveau de carburant ou de charge, 0–100 ; `null` : aucun plein enregistré. */
  niveauPct: number | null;
  /** Autonomie pleine du modèle (thermique) ou valeur du chargeur (électrique), en km ; `null` : inconnue. */
  autonomiePleineKm: number | null;
  enCharge?: boolean;
  km: number;
  kmSemaine: number | null;
  /** Sous le compteur, à la place des kilomètres de la semaine (« en charge à l'atelier », « immobilisé depuis mardi »). */
  noteCompteur?: string;
  kmSur30Jours: number;
  echeances: readonly EcheanceEntree[];
}

export interface VueFlotteProps {
  vehicules: VehiculeVue[];
  aujourdhui: Jour;
  /** Sous-titre : kilomètres du mois (`null` : non disponible) et variation du carburant. */
  bilan: { kmDuMois: number | null; variationCarburantPct: number | null };
  /** Échéances qui concernent toute la flotte (assurance de la flotte) : la dernière ligne de la frise. */
  echeancesFlotte?: readonly EcheanceEntree[];
  coches: ReadonlySet<string>;
  onCocher: (id: string) => void;
  onAjouter?: () => void;
  onCarnets?: () => void;
  onOuvrir?: (id: string) => void;
  onChercher?: () => void;
  onNon?: () => void;
  suggestionMasquee?: boolean;
  /** Le véhicule du prochain trajet réservé (MR06) ; sinon le premier en tournée, puis le premier disponible. */
  prochainId?: string;
}

const TON_JAUGE: Record<TonJauge, 'ok' | 'attention' | 'critique' | 'info'> = { vert: 'ok', orange: 'attention', rouge: 'critique', bleu: 'info' };
const TON_ETAT: Record<EtatVehicule, 'info' | 'ok' | 'attention' | 'critique'> = { 'En tournée': 'info', Disponible: 'ok', 'Au garage': 'attention', 'Hors service': 'critique' };
const RAPPEL_JOURS = 15;
const pl = (n: number, base: 'sous' | 'frise.flotteSous') => `${base}.${Math.abs(n) >= 2 ? 'n' : '1'}` as CleMR09;

/** La silhouette d'une fourgonnette (illustration : gris de décor, jamais un état). */
function Silhouette() {
  return (
    <svg className="cr-van" viewBox="0 0 190 80" aria-hidden focusable="false">
      <path d="M8 24a6 6 0 0 1 6-6h104a6 6 0 0 1 6 6v36H8z" />
      <path d="M124 28h26a8 8 0 0 1 6 3l22 22a8 8 0 0 1 2 5v7h-56z" />
      <rect className="cr-van__vitre" x="22" y="26" width="42" height="18" rx="3" />
      <rect className="cr-van__vitre" x="72" y="26" width="42" height="18" rx="3" />
      <path className="cr-van__vitre" d="M132 34h16l14 14h-30z" />
      <circle className="cr-van__roue" cx="48" cy="62" r="12" />
      <circle className="cr-van__roue" cx="148" cy="62" r="12" />
    </svg>
  );
}

export function VueFlotte(p: VueFlotteProps) {
  const { tm, langue } = useMots();
  const [mois, setMois] = useState<'6' | '12'>('6');
  const jour = (j: Jour) => jourEtMois(j, langue);
  const moisLong = (j: Jour) => MOIS_LONGS[langue][Number(j.slice(5, 7)) - 1];

  const frise = useMemo(() => friseDEntretien(p.vehicules.map((v) => ({ id: v.id, nom: v.nom, kmActuel: v.km, kmSur30Jours: v.kmSur30Jours, echeances: v.echeances })), p.aujourdhui, Number(mois)), [p.vehicules, p.aujourdhui, mois]);
  const horizon = ajouterMois(p.aujourdhui, Number(mois));
  const debut = debutDeMois(p.aujourdhui);
  const total = Math.max(1, ecartJours(debut, horizon));
  const pos = (j: Jour) => Math.min(100, Math.max(0, (ecartJours(debut, j) / total) * 100));
  const moisAxe = useMemo(() => {
    const m: Jour[] = [];
    for (let i = 0; ajouterMois(debut, i) <= horizon; i += 1) m.push(ajouterMois(debut, i));
    return m;
  }, [debut, horizon]);
  const pointsFlotte = useMemo(
    () => (p.echeancesFlotte ?? []).map((e) => calculerEcheance(e, 0, 0, p.aujourdhui)).filter((x): x is EcheanceCalculee => x !== null && x.le <= horizon).map((x): PointDeFrise => ({ vehiculeId: '', nom: x.nom, le: x.le < p.aujourdhui ? p.aujourdhui : x.le, estimee: false, ton: 'vert' })),
    [p.echeancesFlotte, p.aujourdhui, horizon],
  );

  const suggestion = useMemo(
    () => suggestionEcheance(p.vehicules.map((v) => ({ id: v.id, nom: v.nom, nomCourt: v.nom.split(' ').slice(-1)[0], kmActuel: v.km, kmSur30Jours: v.kmSur30Jours, echeances: v.echeances })), p.aujourdhui),
    [p.vehicules, p.aujourdhui],
  );

  /** Le véhicule du prochain trajet : le premier « En tournée », sinon le premier disponible. */
  const prochain = p.vehicules.find((v) => v.id === p.prochainId) ?? p.vehicules.find((v) => v.etat === 'En tournée') ?? p.vehicules.find((v) => v.etat === 'Disponible') ?? null;
  const controles = prochain ? controlesAvantTrajet(prochain.energie) : [];
  const libelleControle = (motif: string) => tm(`avant.${motif}` as CleMR09, { nom: prochain?.nom.split(' ').slice(-1)[0] ?? '' });
  const faits = controles.filter((c) => p.coches.has(c.id)).length;

  const sousTitre = [
    tm(pl(p.vehicules.length, 'sous'), { n: p.vehicules.length }),
    p.bilan.kmDuMois === null ? null : `${tm('sous.km', { km: formaterNombre(p.bilan.kmDuMois) })}${p.bilan.variationCarburantPct === null || p.bilan.variationCarburantPct === 0 ? '' : `, ${tm(p.bilan.variationCarburantPct < 0 ? 'sous.baisse' : 'sous.hausse', { p: Math.abs(p.bilan.variationCarburantPct) })}`}`,
  ].filter(Boolean).join(' · ');

  const libelleEcheance = (e: EcheanceCalculee): string => {
    if (e.kmRestants !== null && e.kmRestants > 0) return tm('echeance.km', { nom: e.nom, km: formaterNombre(e.kmRestants) });
    if (e.joursRestants < 0 || (e.kmRestants !== null && e.kmRestants <= 0)) return tm('echeance.retard', { nom: e.nom, n: Math.max(1, Math.abs(Math.min(e.joursRestants, 0))) });
    if (e.joursRestants < 45) return tm('echeance.avant', { nom: e.nom, date: jour(e.le) });
    return tm('echeance.en', { nom: e.nom, mois: moisLong(e.le) });
  };

  const vide = p.vehicules.length === 0;
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR09">
      <PageHead
        titre={tm('titre')}
        sousTitre={vide ? undefined : sousTitre}
        secondaires={[{ libelle: tm('carnets'), onClick: p.onCarnets ?? (() => undefined) }]}
        primaire={{ libelle: tm('ajouter'), onClick: p.onAjouter ?? (() => undefined) }}
      />
      {vide ? (
        <section className="cr-carte cr-fl-vide">
          <Truck size={28} aria-hidden />
          <h2>{tm('vide.titre')}</h2>
          <p className="cr-t3">{tm('vide.texte')}</p>
          <button type="button" className="cr-bouton-plein" onClick={p.onAjouter}><Plus size={13} aria-hidden /> {tm('ajouter')}</button>
        </section>
      ) : (
        <>
          <div className="cr-fl-cartes" data-mvt="cascade">
            {p.vehicules.map((v) => {
              const ech = echeanceProche(v.echeances, v.km, kmParJour(v.kmSur30Jours), p.aujourdhui);
              const tonJauge = v.niveauPct === null ? null : tonDeLaJauge(v.niveauPct, v.enCharge === true);
              const autonomie = v.niveauPct !== null && v.autonomiePleineKm !== null ? autonomieKm(v.niveauPct, v.autonomiePleineKm) : null;
              const chiffres = chiffresDuCompteur(v.km);
              return (
                <article key={v.id} className="cr-fl-carte cr-carte" data-etat={v.etat} data-mvt="entree" tabIndex={0} aria-label={tm('ouvrir', { nom: v.nom })}>
                  <header>
                    <b>{v.nom}</b>
                    {v.plaque && <span className="cr-plaque cr-mono">{v.plaque}</span>}
                    <span className="cr-fl-etat" data-ton={TON_ETAT[v.etat]}>
                      {v.etat === 'En tournée' ? <LiveDot ton="info" libelle={tm(`etat.${v.etat}` as CleMR09)} /> : <i aria-hidden />}
                      {tm(`etat.${v.etat}` as CleMR09)}
                    </span>
                  </header>
                  <div className="cr-fl-baie">
                    <Silhouette />
                    {v.conducteur ? <span className="cr-fl-qui"><span className="cr-avatar cr-avatar--m">{v.conducteur[0]}</span>{v.conducteur}</span>
                      : v.lieu ? <span className="cr-fl-qui"><span className="cr-avatar cr-avatar--m"><MapPin size={11} aria-hidden /></span>{v.lieu}</span>
                      : <span className="cr-fl-qui cr-t3"><span className="cr-avatar cr-avatar--m"><User size={11} aria-hidden /></span>{tm('nonDisponible')}</span>}
                  </div>
                  <div className="cr-fl-mesures">
                    <div className="cr-fl-niveau">
                      {v.niveauPct === null || tonJauge === null ? (
                        <Gauge valeur={0} libelle={tm('jauge.libelle', { nom: v.nom })} texte={tm('jauge.inconnue')} largeur={110}>--</Gauge>
                      ) : (
                        <Gauge valeur={v.niveauPct} libelle={tm('jauge.libelle', { nom: v.nom })} ton={TON_JAUGE[tonJauge]} largeur={110}>{v.niveauPct}{INSECABLE}%</Gauge>
                      )}
                      <small>{v.niveauPct === null ? tm('jauge.inconnue') : v.energie === 'electrique' ? (autonomie === null ? tm('jauge.chargeSeule') : tm('jauge.charge', { km: autonomie })) : autonomie === null ? tm('jauge.carburantSeul') : tm('jauge.carburant', { km: formaterNombre(autonomie) })}</small>
                      {v.enCharge && <i className="cr-fl-charge" aria-hidden />}
                    </div>
                    <div className="cr-fl-compteur">
                      <small>{tm('compteur')}</small>
                      <span className="cr-odo cr-mono" role="img" aria-label={tm('compteur.libelle', { nom: v.nom }) + ` ${formaterNombre(v.km)} km`}>
                        {chiffres.map((c, i) => <i key={i} data-zero={i === 0 && c === 0}>{c}</i>)}
                        <em>km</em>
                      </span>
                      <small>{v.noteCompteur ?? (v.kmSemaine === null ? tm('nonDisponible') : tm('compteur.semaine', { km: formaterNombre(v.kmSemaine) }))}</small>
                    </div>
                  </div>
                  <footer>
                    {ech ? (
                      <>
                        <span className="cr-fl-echeance" data-ton={ech.ton}><Wrench size={13} aria-hidden />{libelleEcheance(ech)}</span>
                        <i className="cr-fl-barre" data-ton={ech.ton}><b style={{ width: `${ech.partEcoulee}%` }} /></i>
                      </>
                    ) : <span className="cr-fl-echeance cr-t3"><Wrench size={13} aria-hidden />{tm('echeance.aucune')}</span>}
                  </footer>
                </article>
              );
            })}
            {p.vehicules.length < 3 && (
              <button type="button" className="cr-fl-ajout sc-focus" onClick={p.onAjouter}><Plus size={16} aria-hidden />{tm('ajouter')}</button>
            )}
          </div>
          <div className="cr-fl-bas">
            <section className="cr-carte cr-fl-frise" data-mvt="entree" aria-label={tm('frise.titre')}>
              <header>
                <b>{tm('frise.titre')}</b>
                <small>{tm('frise.rappel', { n: RAPPEL_JOURS })}</small>
                <span className="cr-fl-periode"><small>{tm('frise.jusqua', { mois: moisLong(horizon) })}</small>
                  <Segmente libelle={tm('frise.periode')} taille="compact" valeur={mois} onChange={(c) => setMois(c as '6' | '12')} options={[{ cle: '6', libelle: tm('frise.6') }, { cle: '12', libelle: tm('frise.12') }]} />
                </span>
              </header>
              <div className="cr-fl-axe">
                <div className="cr-fl-mois" aria-hidden>
                  {moisAxe.map((m) => <span key={m} style={{ left: `${pos(m)}%` }}>{capitaleCourte(m, langue)}</span>)}
                </div>
                <div className="cr-fl-lignes">
                  {p.vehicules.map((v) => (
                    <LigneFrise key={v.id} nom={v.nom.split(' ').slice(-1)[0]} sous={v.plaque ?? ''} points={frise.parVehicule.get(v.id) ?? []} pos={pos} jour={jour} />
                  ))}
                  {pointsFlotte.length > 0 && <LigneFrise nom={tm('frise.flotte')} sous={tm(pl(p.vehicules.length, 'frise.flotteSous'), { n: p.vehicules.length })} points={pointsFlotte} pos={pos} jour={jour} ton="info" />}
                  <span className="cr-fl-aujourdhui" style={{ left: `calc(130px + (100% - 130px) * ${pos(p.aujourdhui) / 100})` }}><b className="cr-mono">{jour(p.aujourdhui)}</b></span>
                </div>
              </div>
              {frise.flotte.length === 0 && pointsFlotte.length === 0 && <p className="cr-t3 cr-fl-rien">{tm('frise.rien')}</p>}
            </section>
            <aside className="cr-fl-droite">
              {prochain && (
                <section className="cr-carte cr-avant" data-mvt="entree" aria-label={tm('avant.titre')}>
                  <header><b>{tm('avant.titre')}</b><small>{faits === controles.length ? tm('avant.pret') : tm('avant.fait', { f: faits, t: controles.length })}</small></header>
                  <span className="cr-relecture__barre"><i style={{ width: `${(faits / controles.length) * 100}%` }} /></span>
                  {controles.map((c) => { const fait = p.coches.has(c.id); return <button key={c.id} type="button" className="cr-controle sc-focus" data-fait={fait} onClick={() => p.onCocher(c.id)} aria-pressed={fait}><i>{fait ? '✓' : ''}</i>{libelleControle(c.motif)}</button>; })}
                </section>
              )}
              {suggestion && !p.suggestionMasquee && (
                <SuggestionAjmani
                  titre={tm(suggestion.feminin ? 'suggestion.titre.f' : 'suggestion.titre.m', { echeance: suggestion.echeance.toLowerCase() })}
                  texte={tm('suggestion.texte', { nom: suggestion.nom, date: `${Number(suggestion.le.slice(8, 10))}${INSECABLE}${moisLong(suggestion.le)}` })}
                  primaire={{ libelle: tm('suggestion.chercher'), onClick: p.onChercher ?? (() => undefined) }}
                  secondaire={{ libelle: tm('suggestion.non'), onClick: p.onNon ?? (() => undefined) }}
                />
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function capitaleCourte(j: Jour, langue: 'fr' | 'en'): string {
  const m = jourEtMois(j, langue).replace(/^\d+\s?/u, '').replace(/^\s/u, '');
  return m.charAt(0).toUpperCase() + m.slice(1);
}

function LigneFrise({ nom, sous, points, pos, jour, ton }: { nom: string; sous: string; points: readonly PointDeFrise[]; pos: (j: Jour) => number; jour: (j: Jour) => string; ton?: 'info' }) {
  const { tm } = useMots();
  return (
    <div className="cr-fl-ligne">
      <span className="cr-fl-nom"><b>{nom}</b>{sous && <small className="cr-mono">{sous}</small>}</span>
      <div className="cr-fl-piste">
        {points.map((pt, i) => {
          const x = pos(pt.le);
          const aGauche = x > 80;
          const date = pt.estimee ? `≈${INSECABLE}${jour(pt.le)}` : jour(pt.le);
          return (
            <span key={`${pt.nom}-${i}`} className="cr-fl-point" data-ton={ton ?? pt.ton} data-gauche={aGauche} style={{ left: `${x}%` }} title={pt.estimee ? tm('frise.estimee', { nom: pt.nom, date: jour(pt.le) }) : tm('frise.le', { nom: pt.nom, date: jour(pt.le) })}>
              <i aria-hidden />
              <span><b>{pt.nom}</b><small>{date}</small></span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

