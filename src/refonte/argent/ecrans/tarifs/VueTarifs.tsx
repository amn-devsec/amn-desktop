import React, { useEffect, useId, useMemo, useState } from 'react';
import { Box, Clock, Plus, Timer } from 'lucide-react';
import { PageHead } from '../../../../socle/ui/archetypes';
import { AnneauProgression, BarreProgression, EtatVide, IconTile } from '../../../../socle/ui';
import { Gauge, InlineSuggestion } from '../../../../socle/ui/vivant';
import { formaterEuro } from '../../../../socle/formats';
import {
  appliquerRemise,
  couleurMarge,
  effetSurUnMois,
  margeMoyennePonderee,
  margePct,
  margeParVente,
  OBJECTIF_MARGE_PCT,
  prixSuggere,
  REMISE_SANS_ACCORD_PCT,
} from '../../tarifs';
import { useMots } from './mots';
import '../argent.css';
import './tarifs.css';

/**
 * MA12 · TARIFS ET REMISES — la vue de présentation : le simulateur de prix (curseurs, jauge de marge, décomposition
 * d'une unité, effet sur un mois), la marge moyenne et les règles de remise, la suggestion, la grille des prestations.
 * Calculs : `src/refonte/argent/tarifs.ts` (marge entière, 0,5 vers le haut ; objectif 55 % ; remise sans accord 5 %).
 * Rien n'est appliqué sans accord : « Préparer la grille » prépare, la personne valide.
 */

export interface PrestationTarif {
  id: string;
  nom: string;
  precision?: string;
  /** « forfait », « mois », « heure », « demi-journée »… */
  unite: string;
  prixCents: number;
  coutCents: number | null;
  ventesMois: number;
  etat: string;
}

export interface ActionsTarifs {
  historique: () => void;
  ajouter: () => void;
  preparerGrille: (prestation: PrestationTarif, prixCents: number) => void;
  refuserSuggestion: () => void;
}

export interface VueTarifsProps {
  statut: 'pret' | 'indisponible';
  prestations: readonly PrestationTarif[];
  /** Les remises accordées ce mois (écarts grille / facturé), `null` si inconnues. */
  remisesAccordeesCents: number | null;
  /** Coûts et marges : réservés aux administrateurs (fiche, rubrique 6). */
  voitLesCouts: boolean;
  /** Le module « Taux horaire de revient » de l'Atelier (F1), s'il est intégré (STATUT §1.33 n° 4). */
  tauxHoraire?: { ouvrir: () => void } | null;
  actions: ActionsTarifs;
}

const euros = (cents: number, d?: number) => formaterEuro(cents / 100, d === undefined ? {} : { decimales: d });
const horaire = (unite: string) => /heure/i.test(unite);
const TON: Record<'verte' | 'orange' | 'rouge', 'succes' | 'attention' | 'critique'> = { verte: 'succes', orange: 'attention', rouge: 'critique' };

/** La prestation de la suggestion : sous l'objectif, la plus vendue (fiche, rubrique 6). */
function cibleDeSuggestion(prestations: readonly PrestationTarif[]): PrestationTarif | null {
  return (
    [...prestations]
      .filter((p) => p.etat === 'active' && p.ventesMois > 0 && p.coutCents !== null && (margePct(p.prixCents, p.coutCents) ?? 100) < OBJECTIF_MARGE_PCT)
      .sort((a, b) => b.ventesMois - a.ventesMois)[0] ?? null
  );
}

export function VueTarifs({ statut, prestations, remisesAccordeesCents, voitLesCouts, tauxHoraire = null, actions }: VueTarifsProps) {
  const { tm } = useMots();
  const id = useId();
  const actives = useMemo(() => prestations.filter((p) => p.etat === 'active'), [prestations]);
  const cible = useMemo(() => cibleDeSuggestion(actives), [actives]);
  const [choisie, setChoisie] = useState<string | null>(() => (cible ?? actives[0])?.id ?? null);
  const p = actives.find((x) => x.id === choisie) ?? actives[0] ?? null;
  const moyenne = useMemo(() => margeMoyennePonderee(actives), [actives]);
  const [suggestionVue, setSuggestionVue] = useState(true);

  const secondaires = [
    ...(tauxHoraire ? [{ libelle: tm('page.tauxHoraire'), icone: <Timer aria-hidden size={14} />, onClick: tauxHoraire.ouvrir }] : []),
    { libelle: tm('page.historique'), icone: <Clock aria-hidden size={14} />, onClick: actions.historique },
  ];
  const entete = (
    <PageHead
      className="ar-entete"
      titre={tm('page.titre')}
      sousTitre={voitLesCouts && moyenne !== null ? tm('page.sousTitre', { n: actives.length, marge: moyenne }) : tm('page.sousTitreSansMarge', { n: actives.length })}
      secondaires={secondaires}
      primaire={{ libelle: tm('page.ajouter'), icone: <Plus aria-hidden size={14} />, onClick: actions.ajouter }}
    />
  );

  if (statut === 'indisponible' || actives.length === 0) {
    return (
      <div className="ar-ecran ar-tarifs" data-famille="argent">
        {entete}
        <section className="ar-carte ar-tarifs__vide">
          <EtatVide titre={tm('vide.titre')} texte={statut === 'indisponible' ? tm('indisponible') : tm('vide.texte')} action={null} />
        </section>
      </div>
    );
  }

  const suggere = cible ? prixSuggere(cible.prixCents) : null;
  const effetSuggestion = cible && suggere ? Math.round(effetSurUnMois(cible.prixCents, suggere, cible.ventesMois) / 1000) * 1000 : 0;

  return (
    <div className="ar-ecran ar-tarifs" data-famille="argent">
      {entete}
      <div className="ar-tarifs__haut" data-mvt="cascade">
        {p && voitLesCouts && <Simulateur key={p.id} id={`${id}-simu`} prestation={p} />}
        {voitLesCouts && (
          <section className="ar-carte ar-tarifs__moyenne" aria-labelledby={`${id}-moy`}>
            <div className="ar-tarifs__moyenne-tete">
              <AnneauProgression valeur={(moyenne ?? 0) / 100} libelle={tm('moyenne.anneau')} texte={moyenne === null ? '--' : `${moyenne} %`} taille={64} epaisseur={6} ton="succes">
                <span className="ar-tarifs__anneau-valeur">{moyenne === null ? '--' : `${moyenne} %`}</span>
              </AnneauProgression>
              <span>
                <h2 id={`${id}-moy`} className="ar-carte__titre">
                  {tm('moyenne.titre', { marge: moyenne ?? '--' })}
                </h2>
                <span className={moyenne !== null && moyenne >= OBJECTIF_MARGE_PCT ? 'ar-succes ar-tarifs__objectif' : 'ar-attention ar-tarifs__objectif'}>
                  {moyenne !== null && moyenne >= OBJECTIF_MARGE_PCT ? tm('moyenne.atteint', { pct: OBJECTIF_MARGE_PCT }) : tm('moyenne.manque', { pct: OBJECTIF_MARGE_PCT, points: OBJECTIF_MARGE_PCT - (moyenne ?? 0) })}
                </span>
              </span>
            </div>
            <div className="ar-tarifs__regles">
              <p className="ar-tarifs__regles-titre">
                <span>{tm('regles.titre')}</span>
                {remisesAccordeesCents !== null && <span className="ar-discret">{tm('regles.accordees', { montant: euros(remisesAccordeesCents) })}</span>}
              </p>
              <dl>
                <div>
                  <dt>{tm('regles.sansValidation')}</dt>
                  <dd className="ar-montant">{REMISE_SANS_ACCORD_PCT}&nbsp;%</dd>
                </div>
              </dl>
              <p className="ar-tarifs__regles-note">{tm('regles.autres')}</p>
            </div>
          </section>
        )}
      </div>

      {voitLesCouts && cible && suggere && suggestionVue && (
        <InlineSuggestion
          className="ar-tarifs__suggestion"
          texte={tm('suggestion', { nom: cible.nom.toLowerCase(), avant: euros(cible.prixCents), apres: euros(suggere), effet: euros(effetSuggestion) })}
          libelleOui={tm('suggestion.oui')}
          libelleNon={tm('suggestion.non')}
          onOui={() => actions.preparerGrille(cible, suggere)}
          onNon={() => {
            setSuggestionVue(false);
            actions.refuserSuggestion();
          }}
        />
      )}

      <ul className="ar-tarifs__grille">
        {actives.map((x) => {
          const marge = voitLesCouts ? margePct(x.prixCents, x.coutCents) : null;
          const couleur = couleurMarge(marge);
          const parVente = margeParVente(x.prixCents, x.coutCents);
          return (
            <li key={x.id}>
              <button type="button" className="ar-tarifs__tuile" data-choisie={p?.id === x.id ? 'oui' : undefined} aria-label={tm('tuile.charger', { nom: x.nom })} onClick={() => setChoisie(x.id)}>
                <span className="ar-tarifs__tuile-tete">
                  <IconTile icone={<Box aria-hidden size={14} />} taille={28} />
                  <span className="ar-tarifs__tuile-nom">
                    <span>{x.nom}</span>
                    <span className="ar-discret">{x.precision || x.unite}</span>
                  </span>
                  {p?.id === x.id ? <span className="ar-tarifs__dans">{tm('tuile.simulateur')}</span> : <span className="ar-discret ar-tarifs__vendue">{x.ventesMois > 0 ? tm('tuile.vendue', { n: x.ventesMois }) : tm('tuile.nonVendue')}</span>}
                </span>
                <span className="ar-tarifs__prix">
                  <span className="ar-montant">{euros(x.prixCents)}</span>
                  {voitLesCouts && x.coutCents !== null && <span className="ar-discret">{tm('tuile.cout', { montant: euros(x.coutCents) })}</span>}
                </span>
                {voitLesCouts && parVente !== null && <span className="ar-tarifs__marge">{tm(horaire(x.unite) ? 'tuile.margeHeure' : 'tuile.marge', { montant: euros(parVente) })}</span>}
                {voitLesCouts && marge !== null && couleur && (
                  <span className="ar-tarifs__barre">
                    <BarreProgression valeur={Math.max(0, marge) / 100} ton={TON[couleur]} hauteur={5} libelle={tm('tuile.marge', { montant: euros(parVente ?? 0) })} texte={`${marge} %`} />
                    <span className={`ar-montant ar-${TON[couleur]}`}>{marge}&nbsp;%</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="ar-mention ar-tarifs__mention">{tm('aValider')}</p>
    </div>
  );
}

/* ── Le simulateur ── */

function Simulateur({ id, prestation }: { id: string; prestation: PrestationTarif }) {
  const { tm } = useMots();
  const actuel = prestation.prixCents;
  const [prix, setPrix] = useState(() => prixSuggere(actuel));
  const [cout, setCout] = useState(prestation.coutCents ?? 0);
  const [remise, setRemise] = useState(0);
  useEffect(() => {
    setPrix(prixSuggere(actuel));
    setCout(prestation.coutCents ?? 0);
    setRemise(0);
  }, [actuel, prestation.coutCents]);
  const h = horaire(prestation.unite);
  const r = appliquerRemise(prix, { type: 'pct', valeur: remise }, cout);
  const marge = margePct(r.prixCents, cout);
  const margeActuelle = margePct(actuel, prestation.coutCents);
  const couleur = couleurMarge(marge);
  const effet = effetSurUnMois(actuel, r.prixCents, prestation.ventesMois);
  const pas = h ? 100 : actuel >= 100_000 ? 1_000 : 100;
  const maxPrix = Math.max(pas * 10, Math.ceil((actuel * 1.6) / pas) * pas);
  const coutMarge = r.prixCents > 0 ? Math.min(100, Math.max(0, (cout / r.prixCents) * 100)) : 100;
  if (prestation.coutCents === null) {
    return (
      <section className="ar-carte ar-tarifs__simu" aria-labelledby={id}>
        <header className="ar-carte__entete">
          <h2 id={id} className="ar-carte__titre">
            {tm('simu.titre')}
          </h2>
        </header>
        <p className="ar-tarifs__sans-cout">{tm('simu.sansCout')}</p>
      </section>
    );
  }
  return (
    <section className="ar-carte ar-tarifs__simu" aria-labelledby={id}>
      <header className="ar-carte__entete">
        <h2 id={id} className="ar-carte__titre ar-tarifs__simu-titre">
          {tm('simu.titre')}
          <span className="ar-discret">
            {prestation.nom} · {prestation.unite}
          </span>
        </h2>
        <span className="ar-carte__aside">{tm('simu.accord')}</span>
      </header>
      <div className="ar-tarifs__simu-corps">
        <div className="ar-tarifs__curseurs">
          <Curseur
            libelle={h ? tm('simu.prixHeure') : tm('simu.prix')}
            valeur={prix}
            min={0}
            max={maxPrix}
            pas={pas}
            affiche={euros(prix)}
            onChange={setPrix}
            actif
            reperes={[{ valeur: actuel, texte: tm('simu.actuel', { prix: euros(actuel) }), pointille: true }]}
          />
          <Curseur libelle={h ? tm('simu.coutHeure') : tm('simu.cout')} valeur={cout} min={0} max={maxPrix} pas={pas} affiche={euros(cout)} onChange={setCout} />
          <Curseur
            libelle={tm('simu.remise')}
            valeur={remise}
            min={0}
            max={20}
            pas={1}
            affiche={`${remise} %`}
            onChange={setRemise}
            reperes={[
              { valeur: REMISE_SANS_ACCORD_PCT, texte: tm('simu.sansAccord', { pct: REMISE_SANS_ACCORD_PCT }) },
              { valeur: 15, texte: tm('simu.max', { pct: 15 }) },
            ]}
          />
          {r.accordRequis && <p className="ar-attention ar-tarifs__accord">{tm('simu.accordRequis')}</p>}
        </div>
        <div className="ar-tarifs__jauge">
          <span className="ar-tarifs__objectif-jauge">{tm('simu.objectif', { pct: OBJECTIF_MARGE_PCT })}</span>
          <Gauge
            valeur={Math.max(0, marge ?? 0)}
            libelle={tm('simu.deMarge')}
            texte={marge === null ? '--' : `${marge} %`}
            ton={couleur === 'verte' ? 'ok' : couleur === 'rouge' ? 'critique' : 'attention'}
            largeur={210}
            epaisseur={16}
          >
            <span className="ar-tarifs__jauge-valeur">{marge === null ? '--' : `${marge} %`}</span>
            <span className="ar-tarifs__jauge-legende">{tm('simu.deMarge')}</span>
          </Gauge>
          {margeActuelle !== null && (
            <p className="ar-tarifs__jauge-texte">
              {tm('simu.aujourdhui', { marge: margeActuelle, prix: euros(actuel) })} {margeActuelle >= OBJECTIF_MARGE_PCT ? tm('simu.atteint') : tm('simu.encore', { points: OBJECTIF_MARGE_PCT - margeActuelle })}
            </p>
          )}
        </div>
        <div className="ar-tarifs__decomposition">
          <p className="ar-tarifs__pour-une">{h ? tm('simu.pourUne', { unite: tm('unite.heure') }) : tm('simu.pourUneVente')}</p>
          <span aria-hidden className="ar-tarifs__unite-barre">
            <span style={{ width: `${coutMarge}%` }} />
          </span>
          <p className="ar-tarifs__unite-legende">
            <span className="ar-discret">{tm('simu.coutDe', { montant: euros(cout) })}</span>
            <span className={r.sousLeCout ? 'ar-critique' : 'ar-succes'}>{r.sousLeCout ? tm('simu.sousLeCout') : tm('simu.margeDe', { montant: euros(r.prixCents - cout) })}</span>
          </p>
          <dl className="ar-tarifs__kv">
            <div>
              <dt>{tm('simu.prixPaye')}</dt>
              <dd className="ar-montant">{euros(r.prixCents, 2)}</dd>
            </div>
            <div>
              <dt>{h ? tm('simu.margeUnite', { unite: tm('unite.heure') }) : tm('simu.margeVente')}</dt>
              <dd className={`ar-montant ${r.sousLeCout ? 'ar-critique' : 'ar-succes'}`}>{euros(r.prixCents - cout, 2)}</dd>
            </div>
          </dl>
          <div className="ar-tarifs__effet">
            <span className="ar-tarifs__effet-titre">{tm('simu.effet')}</span>
            <span>
              <span className="ar-montant ar-tarifs__effet-valeur">
                {effet >= 0 ? '+' : '−'}
                {euros(Math.abs(effet))}
              </span>{' '}
              <span className="ar-discret">{tm('simu.effetSur', { n: prestation.ventesMois })}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Curseur({
  libelle,
  valeur,
  min,
  max,
  pas,
  affiche,
  onChange,
  actif = false,
  reperes = [],
}: {
  libelle: string;
  valeur: number;
  min: number;
  max: number;
  pas: number;
  affiche: string;
  onChange: (v: number) => void;
  actif?: boolean;
  reperes?: { valeur: number; texte: string; pointille?: boolean }[];
}) {
  const id = useId();
  const pct = (v: number) => `${((Math.min(max, Math.max(min, v)) - min) / Math.max(1, max - min)) * 100}%`;
  return (
    <div className="ar-tarifs__curseur" data-actif={actif ? 'oui' : undefined}>
      <label htmlFor={id} className="ar-tarifs__curseur-ligne">
        <span>{libelle}</span>
        <span className="ar-montant ar-tarifs__curseur-valeur">{affiche}</span>
      </label>
      <span className="ar-tarifs__piste" style={{ ['--ar-rempli' as string]: pct(valeur) }}>
        {reperes.map((r) => (
          <span key={r.texte} aria-hidden className="ar-tarifs__repere" data-pointille={r.pointille ? 'oui' : undefined} style={{ left: pct(r.valeur) }} />
        ))}
        <input id={id} type="range" min={min} max={max} step={pas} value={valeur} onChange={(e) => onChange(Number(e.currentTarget.value))} />
      </span>
      {reperes.length > 0 && (
        <span className="ar-tarifs__reperes" aria-hidden>
          {reperes.map((r) => (
            <span key={r.texte} style={{ left: pct(r.valeur) }}>
              {r.texte}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
