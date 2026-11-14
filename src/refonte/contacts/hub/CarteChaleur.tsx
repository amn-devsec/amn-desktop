import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { IconeEtincelle } from '../../../socle/ui/controles';
import { formaterEuro } from '../../../socle/formats';
import type { ChaleurDesRelations, PointChaleur, SuggestionAppel } from './modele';
import { ecarterPoints, zonesDeClic } from '../commun';
import { nomsAffiches, PARTS_BANDES, positionX, positionY, rayonDuPoint } from './nuage';
import { useMotsHub } from './i18n';

/**
 * « CHALEUR DES RELATIONS » (`RelationWarmthMap`, fiche F10 § 5) — le nuage : jours depuis le dernier échange en
 * abscisse (trois bandes), satisfaction en ordonnée, valeur sur 12 mois en rayon.
 *
 * Les points sont des BOUTONS, posés sur le tracé : atteignables au clavier (↑ ↓ ← → d'un point à l'autre du même
 * groupe, Tab pour entrer et sortir), lisibles au lecteur d'écran (« Menna Conseil, 4 j sans échange »). Le tracé lui-même
 * est une image décrite (`role="img"`). La couleur ne porte jamais seule : le nom de la bande est écrit en haut de chacune.
 */
export interface CarteChaleurProps {
  chaleur: ChaleurDesRelations;
  suggestion: SuggestionAppel | null;
  onOuvrirClient?: (clientId: number) => void;
  onPreparerAppel?: (s: SuggestionAppel) => void;
  onPlusTard?: (s: SuggestionAppel) => void;
}

const AXE_X: { cle: 'chaleur.axe.0' | 'chaleur.axe.3' | 'chaleur.axe.7' | 'chaleur.axe.14' | 'chaleur.axe.30' | 'chaleur.axe.60'; jours: number }[] = [
  { cle: 'chaleur.axe.0', jours: 0 },
  { cle: 'chaleur.axe.3', jours: 3 },
  { cle: 'chaleur.axe.7', jours: 7 },
  { cle: 'chaleur.axe.14', jours: 14 },
  { cle: 'chaleur.axe.30', jours: 30 },
  { cle: 'chaleur.axe.60', jours: 60 },
];

export function CarteChaleur({ chaleur, suggestion, onOuvrirClient, onPreparerAppel, onPlusTard }: CarteChaleurProps) {
  const { tm } = useMotsHub();
  const [choisi, setChoisi] = useState<number | null>(suggestion?.clientId ?? null);
  const [masquee, setMasquee] = useState(false);
  const plafond = useMemo(() => Math.max(0, ...chaleur.points.map((p) => p.valeurCents)), [chaleur.points]);
  const selection = chaleur.points.find((p) => p.clientId === choisi) ?? null;
  const noms = useMemo(() => nomsAffiches(chaleur.points, choisi), [chaleur.points, choisi]);
  const rechauffees = chaleur.rechauffees;
  // La taille du tracé en pixels : elle sert à borner la zone de clic de chaque point pour qu'elle ne couvre jamais le centre d'un voisin.
  const traceRef = useRef<HTMLDivElement>(null);
  const [trace, setTrace] = useState<{ l: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = traceRef.current;
    if (!el) return undefined;
    const lire = () => setTrace({ l: el.clientWidth, h: el.clientHeight });
    lire();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const obs = new ResizeObserver(lire);
    obs.observe(el);
    return () => obs.disconnect();
  }, [chaleur.total]);
  // Les points au même endroit sont poussés de quelques pixels l'un de l'autre, puis chaque zone de clic est bornée par ses voisins.
  const placement = useMemo(() => {
    if (!trace) return null;
    const brut = chaleur.points.map((p) => ({ x: positionX(p.jours) * trace.l, y: positionY(p.satisfaction) * trace.h, r: rayonDuPoint(p, plafond) }));
    const ecartes = ecarterPoints(brut, { l: trace.l, h: trace.h });
    return { decale: ecartes.map((e, i) => ({ dx: e.x - brut[i].x, dy: e.y - brut[i].y })), zones: zonesDeClic(ecartes) };
  }, [chaleur.points, trace, plafond]);

  const bulle = (p: PointChaleur): string => {
    const morceaux = [tm('chaleur.bulle.jours', { n: p.jours })];
    if (suggestion && suggestion.clientId === p.clientId) morceaux.push(tm('chaleur.bulle.devis'));
    else if (p.statut === 'Impayé') morceaux.push(tm('chaleur.bulle.impaye'));
    else if (p.statut === 'À relancer') morceaux.push(tm('chaleur.bulle.relancer'));
    return morceaux.join(' · ');
  };

  return (
    <section className="sc-ct-carte sc-ct-chaleur" aria-labelledby="ct-chaleur-titre" data-famille="contacts">
      <header className="sc-ct-carte__entete">
        <h2 id="ct-chaleur-titre" className="sc-ct-carte__titre">
          {tm('chaleur.titre')}
        </h2>
        <span className="sc-ct-carte__sous">{tm('chaleur.sousTitre', { n: chaleur.total })}</span>
        <span className="sc-ct-chaleur__tendance" data-vide={rechauffees === 0 || undefined}>
          {rechauffees > 0 ? (
            <>
              <ArrowRight aria-hidden size={12} strokeWidth={2} />
              {tm(rechauffees === 1 ? 'chaleur.rechauffees.1' : 'chaleur.rechauffees.n', { n: rechauffees })}
            </>
          ) : (
            tm('chaleur.rechauffees.aucune')
          )}
        </span>
      </header>

      {chaleur.total === 0 ? (
        <p className="sc-ct-chaleur__vide">{tm('chaleur.vide')}</p>
      ) : (
        <div className="sc-ct-nuage">
          <div className="sc-ct-nuage__axe-y" aria-hidden>
            {[5, 4, 3].map((v) => (
              <span key={v} className="sc-mono" style={{ top: `${positionY(v) * 100}%` }}>
                {v},0
              </span>
            ))}
          </div>
          <div
            ref={traceRef}
            className="sc-ct-nuage__trace"
            role="img"
            aria-label={tm('chaleur.graphique', { chaleureuse: chaleur.parBande.chaleureuse, aEntretenir: chaleur.parBande.aEntretenir, refroidie: chaleur.parBande.refroidie })}
          >
            {(['chaleureuse', 'aEntretenir', 'refroidie'] as const).map((b) => (
              <div key={b} className="sc-ct-bande" data-bande={b} style={{ width: `${PARTS_BANDES[b] * 100}%` }}>
                <span className="sc-ct-bande__etiquette">
                  <span aria-hidden className="sc-ct-bande__point" />
                  {tm(`chaleur.bande.${b}` as const)} <b className="sc-nombre">{chaleur.parBande[b]}</b>
                </span>
              </div>
            ))}
            {chaleur.points.map((p, i) => {
              const r = rayonDuPoint(p, plafond);
              return (
                <button
                  key={p.clientId}
                  type="button"
                  className="sc-ct-point sc-focus"
                  data-bande={p.bande}
                  data-nomme={p.nomme || undefined}
                  data-choisi={p.clientId === choisi || undefined}
                  data-contour={p.satisfactionMoyenne || undefined}
                  style={{
                    left: placement ? `calc(${positionX(p.jours) * 100}% + ${placement.decale[i].dx.toFixed(1)}px)` : `${positionX(p.jours) * 100}%`,
                    top: placement ? `calc(${positionY(p.satisfaction) * 100}% + ${placement.decale[i].dy.toFixed(1)}px)` : `${positionY(p.satisfaction) * 100}%`,
                    width: r * 2,
                    height: r * 2,
                    ...(placement ? ({ '--sc-zone': `${placement.zones[i]}px` } as React.CSSProperties) : null),
                  }}
                  aria-label={`${p.nom}, ${tm('chaleur.bulle.jours', { n: p.jours })}${p.valeurCents > 0 ? `, ${formaterEuro(p.valeurCents / 100)}` : ''}`}
                  aria-pressed={p.clientId === choisi}
                  onClick={() => (p.clientId === choisi ? onOuvrirClient?.(p.clientId) : setChoisi(p.clientId))}
                  onMouseEnter={() => setChoisi(p.clientId)}
                  onFocus={() => setChoisi(p.clientId)}
                />
              );
            })}
            {chaleur.points
              .filter((p) => p.nomme && p.clientId !== choisi && noms.has(p.clientId))
              .map((p) => (
                <span key={`e${p.clientId}`} aria-hidden className="sc-ct-nom" data-bande={p.bande} style={{ left: `${positionX(p.jours) * 100}%`, top: `${positionY(p.satisfaction) * 100}%` }}>
                  {p.nom}
                </span>
              ))}
            {selection && (
              <span
                role="status"
                className="sc-ct-bulle"
                data-bande={selection.bande}
                data-gauche={positionX(selection.jours) > 0.62 || undefined}
                style={{ left: `${positionX(selection.jours) * 100}%`, top: `${positionY(selection.satisfaction) * 100}%` }}
              >
                <strong>{selection.nom}</strong>
                <span>{bulle(selection)}</span>
              </span>
            )}
          </div>
          <div className="sc-ct-nuage__axe-x" aria-hidden>
            {AXE_X.map((a, i) => (
              <span key={a.cle} className="sc-mono" style={{ left: `${positionX(a.jours) * 100}%` }} data-fin={i === AXE_X.length - 1 || undefined}>
                {tm(a.cle)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="sc-ct-chaleur__pied" role="group" aria-label={tm('suggestion.preparer')}>
        <IconeEtincelle taille={14} />
        {suggestion && !masquee ? (
          <>
            <p className="sc-ct-chaleur__phrase">{tm('suggestion.appel', { nom: suggestion.nom, jours: suggestion.jours })}</p>
            <Bouton variante="primaire" taille="petit" onClick={() => onPreparerAppel?.(suggestion)}>
              {tm('suggestion.preparer')}
            </Bouton>
            <Bouton
              variante="secondaire"
              taille="petit"
              onClick={() => {
                setMasquee(true);
                onPlusTard?.(suggestion);
              }}
            >
              {tm('suggestion.plusTard')}
            </Bouton>
          </>
        ) : (
          <p className="sc-ct-chaleur__phrase">{tm('suggestion.rien')}</p>
        )}
      </div>
    </section>
  );
}
