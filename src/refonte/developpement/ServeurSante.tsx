import React, { useMemo, useState } from 'react';
import { List, Play, Server } from 'lucide-react';
import { Bouton } from '../../socle/ui';
import { formaterEuro } from '../../socle/formats';
import { ABrancher, CarteDev, PageDev, Point, SuggestionDev } from './briques';
import { hhmm, jourEtMois, ms, partiesParis } from './commun';
import { useDonneesDeveloppement, type DonneesDeveloppement } from './donnees';
import { dire, direCompte } from './i18n';
import { moyenneDerniereHeure, semainesAvantPlein, texteDebit, texteDisponibilite, texteDuree, texteGo, tonDisponibilite } from './vues';

/**
 * DEV-serveur · SERVEUR ET SANTÉ — fiche `docs/refonte/fiches/LOT-11/DEV-serveur.md`, image `DEV-serveur.png`.
 *
 * Quatre jauges, la charge sur 24 heures, les services et leur disponibilité sur 30 jours, les sauvegardes, le coût
 * du mois et l'aide d'Ajmani sur le disque. Le serveur dépend de LOT-13 (pas encore choisi) : « Redémarrer » est
 * secondaire et inerte (STATUT §1.19 n° 7), « Relancer » aussi ; aucun nom d'hôte, adresse ni port n'est affiché.
 */

const L = 'fr' as const;

/** Un anneau de jauge : arc en dégradé de deux jetons, pourcentage au centre. La couleur ne dit pas la gravité. */
function AnneauJauge({ pct, id, libelle }: { pct: number; id: string; libelle: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct));
  return (
    <span className="dv-sv-anneau" data-jauge={id} role="img" aria-label={`${libelle} : ${Math.round(v)} %`}>
      <svg viewBox="0 0 88 88" width="88" height="88" aria-hidden>
        <defs>
          <linearGradient id={`dv-jauge-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="dv-sv-stop-a" />
            <stop offset="100%" className="dv-sv-stop-b" />
          </linearGradient>
        </defs>
        <circle cx="44" cy="44" r={r} className="dv-sv-piste" />
        <circle cx="44" cy="44" r={r} className="dv-sv-arc" stroke={`url(#dv-jauge-${id})`} strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 44 44)" />
      </svg>
      <span className="dv-sv-anneau__pct">{Math.round(v)} %</span>
    </span>
  );
}

/** Une courbe lissée (et son aire), de 0 au haut de l'échelle (`max`, en %) sur la hauteur. */
function chemin(valeurs: readonly number[], l: number, h: number, max: number): { ligne: string; aire: string } {
  if (valeurs.length < 2) return { ligne: '', aire: '' };
  const pts = valeurs.map((v, i) => [(i / (valeurs.length - 1)) * l, h - (Math.max(0, Math.min(max, v)) / max) * h] as const);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return { ligne: d, aire: `${d} L${l},${h} L0,${h} Z` };
}

export default function ServeurSante() {
  return <ServeurDev d={useDonneesDeveloppement()} />;
}

/** La vue seule, sur des données passées (l'enveloppe ci-dessus, un aperçu, un essai). */
export function ServeurDev({ d }: { d: DonneesDeveloppement }) {
  const m = d.maintenant;
  const srv = d.serveur;
  const [annonce, setAnnonce] = useState('');

  const vue = useMemo(() => {
    const mesures = [...d.mesures].filter((x) => ms(x.at) <= m).sort((a, b) => ms(a.at) - ms(b.at));
    const derniere = mesures.at(-1) ?? null;
    const proc = moyenneDerniereHeure(mesures.map((x) => x.processeurPct));
    const pic = mesures.length ? Math.max(...mesures.map((x) => x.reseauMoParS)) : null;
    const enMarche = d.services.filter((s) => s.etat === 'en marche').length;
    const plein = srv ? semainesAvantPlein(srv.disqueTotalGo, srv.disqueUtiliseGo, srv.croissanceDisqueGoParSemaine) : null;
    const croissance = srv && srv.croissanceDisqueGoParSemaine.length ? srv.croissanceDisqueGoParSemaine.reduce((s, x) => s + x, 0) / srv.croissanceDisqueGoParSemaine.length : null;
    return { mesures, derniere, proc, pic, enMarche, plein, croissance };
  }, [d, m, srv]);

  const attente = dire(L, 'srv.attenteServeur');
  const actions = {
    secondaires: [
      { libelle: dire(L, 'srv.journal'), icone: <List size={15} />, disabled: true, infobulle: attente },
      { libelle: dire(L, 'srv.redemarrer'), icone: <Play size={15} />, disabled: true, infobulle: attente },
    ],
  };

  if (!srv) {
    return (
      <PageDev titre={dire(L, 'srv.titre')} sousTitre={dire(L, 'srv.brancher.titre')} source={d.source} {...actions}>
        <CarteDev>
          <ABrancher icone={<Server size={20} />} titre={dire(L, 'srv.brancher.titre')} texte={dire(L, 'srv.brancher.texte')} />
        </CarteDev>
      </PageDev>
    );
  }

  const memPct = vue.derniere?.memoirePct ?? 0;
  const disquePct = Math.round((srv.disqueUtiliseGo / srv.disqueTotalGo) * 100);
  const reseau = vue.derniere?.reseauMoParS ?? 0;
  const reseauPct = srv.capaciteReseauMoParS > 0 ? (reseau / srv.capaciteReseauMoParS) * 100 : 0;
  const tousEnMarche = vue.enMarche === d.services.length;
  const sous = [tousEnMarche ? dire(L, 'srv.forme') : dire(L, 'srv.coupDOeil'), dire(L, 'srv.services', { a: vue.enMarche, t: d.services.length }), direCompte(L, 'srv.depuis', srv.enLigneDepuisJours)].join(' · ');
  const cout = srv.couts.reduce((s, x) => s + x.cents, 0);
  const sv = srv.sauvegardes;

  const jauges = [
    { id: 'processeur', libelle: dire(L, 'srv.processeur'), pct: vue.proc ?? 0, valeur: `${Math.round(vue.proc ?? 0)} %`, sur: null, ligne: dire(L, 'srv.moyenne') },
    { id: 'memoire', libelle: dire(L, 'srv.memoire'), pct: memPct, valeur: texteGo((memPct / 100) * srv.memoireTotaleGo), sur: dire(L, 'srv.sur', { t: Math.round(srv.memoireTotaleGo) }), ligne: dire(L, 'srv.utilisee', { p: Math.round(memPct) }) },
    { id: 'disque', libelle: dire(L, 'srv.disque'), pct: disquePct, valeur: texteGo(srv.disqueUtiliseGo), sur: dire(L, 'srv.sur', { t: Math.round(srv.disqueTotalGo) }), ligne: dire(L, 'srv.utilise', { p: disquePct }) },
    { id: 'reseau', libelle: dire(L, 'srv.reseau'), pct: reseauPct, valeur: texteDebit(reseau), sur: null, ligne: vue.pic !== null ? dire(L, 'srv.pic', { d: texteDebit(vue.pic) }) : '' },
  ];

  const LARG = 700;
  const HAUT = 110;
  // L'échelle se cale sur la plus haute mesure des 24 heures (marge de 15 %, au plus 100 %), comme l'image.
  const haut = Math.min(100, Math.max(10, ...vue.mesures.flatMap((x) => [x.processeurPct, x.memoirePct])) * 1.15);
  const proc = chemin(vue.mesures.map((x) => x.processeurPct), LARG, HAUT, haut);
  const mem = chemin(vue.mesures.map((x) => x.memoirePct), LARG, HAUT, haut);
  const debut = vue.mesures[0];
  const reperes = debut
    ? [0, 0.25, 0.5, 0.75].map((f, i) => {
        const t = ms(debut.at) + f * (m - ms(debut.at));
        const h = hhmm(Math.floor(partiesParis(t).minutes / 60) * 60);
        return i === 0 && partiesParis(t).jour !== partiesParis(m).jour ? dire(L, 'srv.hier', { h }) : h;
      })
    : [];

  return (
    <PageDev titre={dire(L, 'srv.titre')} sousTitre={sous} source={d.source} {...actions}>
      <p className="dv-annonce" role="status" aria-live="polite">
        {annonce}
      </p>
      <div className="dv-sv-jauges">
        {jauges.map((j, i) => (
          <CarteDev key={j.id} className="dv-sv-jauge" rang={i}>
            <AnneauJauge pct={j.pct} id={j.id} libelle={j.libelle} />
            <span className="dv-sv-jauge__textes">
              <span className="dv-sv-jauge__libelle">{j.libelle}</span>
              <span className="dv-sv-jauge__valeur">
                {j.valeur} {j.sur && <span className="dv-sv-jauge__sur">{j.sur}</span>}
              </span>
              <span className="dv-t3 dv-sv-jauge__ligne">{j.ligne}</span>
            </span>
          </CarteDev>
        ))}
      </div>

      <div className="dv-sv-corps">
        <div className="dv-sv-gauche">
          <CarteDev
            className="dv-sv-charge"
            titre={dire(L, 'srv.charge')}
            droite={
              <span className="dv-sv-legende">
                <Point ton="info" /> {dire(L, 'srv.processeur')} <Point ton="succes" /> {dire(L, 'srv.memoire')}
              </span>
            }
            rang={4}
          >
            <svg className="dv-sv-courbes" viewBox={`0 0 ${LARG} ${HAUT}`} preserveAspectRatio="none" role="img" aria-label={dire(L, 'srv.chargeLibelle')}>
              <defs>
                <linearGradient id="dv-aire-mem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" className="dv-sv-aire-mem-haut" />
                  <stop offset="100%" className="dv-sv-aire-bas" />
                </linearGradient>
                <linearGradient id="dv-aire-proc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" className="dv-sv-aire-proc-haut" />
                  <stop offset="100%" className="dv-sv-aire-bas" />
                </linearGradient>
              </defs>
              <path d={mem.aire} fill="url(#dv-aire-mem)" />
              <path d={proc.aire} fill="url(#dv-aire-proc)" />
              <path d={proc.ligne} className="dv-sv-ligne" data-serie="processeur" />
              <path d={mem.ligne} className="dv-sv-ligne" data-serie="memoire" />
            </svg>
            <span className="dv-sv-reperes dv-t4">
              {reperes.map((r, i) => (
                <span key={i}>{r}</span>
              ))}
              <span>{dire(L, 'srv.maintenant')}</span>
            </span>
          </CarteDev>

          <CarteDev className="dv-sv-services" titre={dire(L, 'srv.servicesTitre')} droite={dire(L, 'srv.servicesSous', { a: vue.enMarche, t: d.services.length })} rang={5}>
            <ul className="dv-sv-tuiles">
              {d.services.map((s) => {
                const ton = s.etat === 'en marche' ? tonDisponibilite(s.disponibilite30jPct) : s.etat === 'arrêté' ? 'critique' : 'attention';
                return (
                  <li key={s.id} className="dv-sv-tuile" data-ton={ton}>
                    <span className="dv-sv-tuile__nom">
                      <Point ton={ton} /> {s.nom}
                    </span>
                    <span className="dv-t3 dv-sv-tuile__detail">{s.detail}</span>
                    <span className="dv-sv-tuile__bas">
                      <span className="dv-sv-tuile__dispo">{texteDisponibilite(s.disponibilite30jPct)}</span>
                      <span title={attente}>
                        <Bouton variante="secondaire" taille="petit" disabled>
                          {dire(L, 'srv.relancer')}
                        </Bouton>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </CarteDev>
        </div>

        <div className="dv-sv-droite">
          <CarteDev className="dv-sv-sauvegardes" titre={dire(L, 'srv.sauvegardes')} rang={6}>
            <dl className="dv-sv-lignes">
              <div>
                <dt>{dire(L, 'srv.derniereCopie')}</dt>
                <dd data-ton={sv.derniereCopieAt ? (sv.derniereCopieReussie ? 'succes' : 'critique') : undefined}>
                  {sv.derniereCopieAt
                    ? dire(L, sv.derniereCopieReussie ? 'srv.reussie' : 'srv.echouee', { h: hhmm(partiesParis(sv.derniereCopieAt).minutes) })
                    : dire(L, 'srv.jamais')}
                </dd>
              </div>
              <div>
                <dt>{dire(L, 'srv.restauration')}</dt>
                <dd>{sv.restaurationTesteeLe ? jourEtMois(sv.restaurationTesteeLe, L) : dire(L, 'srv.jamais')}</dd>
              </div>
              <div>
                <dt>{dire(L, 'srv.horsServeur')}</dt>
                <dd data-ton={sv.copieHorsServeurChiffree ? 'succes' : 'attention'}>{dire(L, sv.copieHorsServeurChiffree ? 'srv.ouiChiffree' : 'srv.non')}</dd>
              </div>
            </dl>
          </CarteDev>
          <CarteDev className="dv-sv-cout" rang={7}>
            <span className="dv-sv-cout__libelle">{dire(L, 'srv.cout')}</span>
            <span className="dv-sv-cout__ligne">
              {cout > 0 ? <span className="dv-sv-cout__montant">{formaterEuro(cout / 100)}</span> : <span className="dv-t3">{dire(L, 'srv.coutARenseigner')}</span>}
              {cout > 0 && <span className="dv-t3">{dire(L, 'srv.toutCompris')}</span>}
            </span>
            <span className="dv-t3 dv-sv-cout__texte">{dire(L, 'srv.coutTexte')}</span>
          </CarteDev>
          {vue.plein !== null && vue.croissance !== null && (
            <SuggestionDev
              className="dv-sv-suggestion"
              texte={dire(L, 'srv.suggestion', { go: texteGo(vue.croissance), duree: texteDuree(vue.plein, L) })}
              action={dire(L, 'srv.surveiller')}
              onAction={() => setAnnonce(dire(L, 'srv.surveillerAttente'))}
            />
          )}
        </div>
      </div>
    </PageDev>
  );
}

