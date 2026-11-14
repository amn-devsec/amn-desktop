import React, { useMemo } from 'react';
import type { ModeleProspects, PointProspect } from './modele';
import { graduationsMontant, INTERIEUR, placerEtiquettes, positionX, positionY, rayonDuPoint, rectangleQuadrant, TRACE, zonesDesLegendes } from './nuage';
import { useMotsProspects } from './i18n';
import { ecarterPoints, euros, zonesDeClic } from '../commun';

/**
 * LE NUAGE (H06, `ProspectScatter`) — un SVG de 736 × 548 : grille, quadrant prioritaire, repères d'intérêt, puis un point
 * par prospect (x = intérêt, y = montant, rayon = 5 + chance × 8 / 100) et son étiquette. Les étiquettes sont placées par
 * `placerEtiquettes` : aucune ne touche un point ni une autre étiquette ; celle qui ne trouve pas de place se tait
 * (le nom reste dans la bulle du point). Les points se parcourent au clavier : prioritaires d'abord, intérêt décroissant.
 */
export interface NuageProps {
  modele: ModeleProspects;
  points: readonly PointProspect[];
  actifId: string | null;
  figeId: string | null;
  onSurvol: (id: string | null) => void;
  onChoisir: (id: string) => void;
}

export function NuageProspects({ modele, points, actifId, figeId, onSurvol, onChoisir }: NuageProps) {
  const { tm, langue } = useMotsProspects();
  const { plafondCents, reglages } = modele;
  const montant = (c: number) => euros(c, langue);
  const geom = useMemo(
    () => ecarterPoints(points.map((p) => ({ id: p.id, x: positionX(p.interet), y: positionY(p.montantCents, plafondCents), r: rayonDuPoint(p.chance), nom: p.nom, montant: montant(p.montantCents), prioritaire: p.prioritaire, poids: p.montantCents }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, plafondCents, langue],
  );
  const quadrant = rectangleQuadrant(reglages.interetMin, reglages.montantMinCents, plafondCents);
  const etiquettes = useMemo(() => placerEtiquettes(geom, new Set(actifId ? [actifId] : []), zonesDesLegendes(quadrant)), [geom, actifId, quadrant.x, quadrant.y, quadrant.largeur, quadrant.hauteur]); // eslint-disable-line react-hooks/exhaustive-deps
  const parId = new Map(geom.map((g) => [g.id, g]));
  const zones = zonesDeClic(geom.map((g) => ({ x: g.x, y: g.y, r: g.r })));
  const zoneDe = new Map(geom.map((g, i) => [g.id, zones[i]]));
  const ordreClavier = [...points].sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire) || b.interet - a.interet);
  const xMax = INTERIEUR.x + INTERIEUR.largeur;
  const yBas = INTERIEUR.y + INTERIEUR.hauteur;
  const yMontantMin = positionY(reglages.montantMinCents, plafondCents);
  const xInteretMin = positionX(reglages.interetMin);
  const traineeAffichee = actifId ? points.find((p) => p.id === actifId && p.trainee != null)?.id : points.find((p) => p.trainee != null && p.prioritaire)?.id;

  return (
    <svg className="sc-pr-nuage" viewBox={`0 0 ${TRACE.largeur} ${TRACE.hauteur}`} role="group" aria-label={tm('nuage.graphique', { n: points.length })}>
      {graduationsMontant(plafondCents).map((c) => {
        const y = positionY(c, plafondCents);
        return (
          <g key={c}>
            <line x1={INTERIEUR.x} x2={xMax} y1={y} y2={y} className="sc-pr-nuage__grille" />
            <text x={INTERIEUR.x - 12} y={y + 4} textAnchor="end" className="sc-pr-nuage__axe">{c === 0 ? '0' : montant(c).replace(/\u00a0?€$/, '\u00a0€')}</text>
          </g>
        );
      })}
      {[0, 25, 50, 75, 100].map((i) => <line key={i} x1={positionX(i)} x2={positionX(i)} y1={INTERIEUR.y} y2={yBas} className="sc-pr-nuage__grille" />)}
      <text x={positionX(0)} y={yBas + 16} textAnchor="start" className="sc-pr-nuage__axe">{tm('nuage.axe.froid')}</text>
      <text x={positionX(50)} y={yBas + 16} textAnchor="middle" className="sc-pr-nuage__axe">{tm('nuage.axe.tiede')}</text>
      <text x={xMax} y={yBas + 16} textAnchor="end" className="sc-pr-nuage__axe">{tm('nuage.axe.chaud')}</text>
      <text x={positionX(50)} y={yBas + 34} textAnchor="middle" className="sc-pr-nuage__axe-titre">{tm('nuage.axe.interet')}</text>

      <line x1={xInteretMin} x2={xInteretMin} y1={INTERIEUR.y} y2={yBas} className="sc-pr-nuage__seuil" />
      <line x1={INTERIEUR.x} x2={xMax} y1={yMontantMin} y2={yMontantMin} className="sc-pr-nuage__seuil" />
      <rect x={quadrant.x} y={quadrant.y} width={quadrant.largeur} height={quadrant.hauteur} rx={10} className="sc-pr-nuage__quadrant" />

      <text x={INTERIEUR.x + 12} y={INTERIEUR.y + 24} className="sc-pr-nuage__q-titre">{tm('nuage.quadrant.rechauffer')}</text>
      <text x={INTERIEUR.x + 12} y={INTERIEUR.y + 40} className="sc-pr-nuage__q-aide">{tm('nuage.quadrant.rechauffer.aide')}</text>
      <text x={quadrant.x + 12} y={quadrant.y + 22} className="sc-pr-nuage__q-titre sc-pr-nuage__q-titre--fam">
        {tm('nuage.quadrant.appeler')}
        {modele.prioritaires.n > 0 && <tspan className="sc-pr-nuage__q-aide" dx={5}>{tm('nuage.quadrant.appeler.compte', { n: modele.prioritaires.n, montant: montant(modele.prioritaires.totalCents) })}</tspan>}
      </text>
      {modele.prioritaires.n === 0 && <text x={quadrant.x + 12} y={quadrant.y + 38} className="sc-pr-nuage__q-aide">{tm('nuage.quadrant.appeler.vide')}</text>}
      <text x={INTERIEUR.x + 12} y={yBas - 22} className="sc-pr-nuage__q-titre">{tm('nuage.quadrant.murir')}</text>
      <text x={INTERIEUR.x + 12} y={yBas - 8} className="sc-pr-nuage__q-aide">{tm('nuage.quadrant.murir.aide')}</text>
      <text x={xMax - 12} y={yBas - 22} textAnchor="end" className="sc-pr-nuage__q-titre">{tm('nuage.quadrant.conclure')}</text>
      <text x={xMax - 12} y={yBas - 8} textAnchor="end" className="sc-pr-nuage__q-aide">{tm('nuage.quadrant.conclure.aide')}</text>

      {points.filter((p) => p.trainee != null).map((p) => {
        const g = parId.get(p.id);
        if (!g || p.trainee == null) return null;
        const x0 = positionX(p.trainee);
        return (
          <g key={`t-${p.id}`} className="sc-pr-nuage__trainee">
            <line x1={x0} x2={g.x} y1={g.y} y2={g.y} />
            <circle cx={x0} cy={g.y} r={2.5} />
            {traineeAffichee === p.id && <text x={x0 - 6} y={g.y - 6} textAnchor="end" className="sc-pr-nuage__q-aide">{tm('nuage.trainee', { n: 14 })}</text>}
          </g>
        );
      })}

      {[...etiquettes.values()].map((e) => {
        const p = points.find((x) => x.id === e.id) as PointProspect;
        const g = parId.get(e.id);
        const ancre = e.cote === 'gauche' ? 'end' : e.cote === 'droite' ? 'start' : 'middle';
        const x = e.cote === 'gauche' ? e.x + e.largeur : e.cote === 'droite' ? e.x : e.x + e.largeur / 2;
        return (
          <g key={`e-${e.id}`} className="sc-pr-nuage__etiquette" data-prioritaire={p.prioritaire ? '' : undefined} data-cote={e.cote} style={{ pointerEvents: 'none' }}>
            <text x={x} y={e.y + 11} textAnchor={ancre} className="sc-pr-nuage__nom">{p.nom}</text>
            <text x={x} y={e.y + 24} textAnchor={ancre} className="sc-pr-nuage__montant">{g?.montant}</text>
          </g>
        );
      })}

      {ordreClavier.map((p) => {
        const g = parId.get(p.id) as { x: number; y: number; r: number };
        const actif = p.id === actifId;
        return (
          <g key={p.id} onMouseEnter={() => onSurvol(p.id)} onMouseLeave={() => onSurvol(null)} onClick={() => onChoisir(p.id)}>
            {/* Zone de clic invisible de 34 px au moins (STATUT §1.39) : les événements remontent à ce groupe. */}
            <circle cx={g.x} cy={g.y} r={(zoneDe.get(p.id) ?? 36) / 2} className="sc-ct-zone" />
            {actif && <circle cx={g.x} cy={g.y} r={g.r + 6} className="sc-pr-nuage__halo" />}
            <circle
              cx={g.x}
              cy={g.y}
              r={actif ? g.r + 1 : g.r}
              className="sc-pr-nuage__point"
              data-prioritaire={p.prioritaire ? '' : undefined}
              data-actif={actif ? '' : undefined}
              data-fige={p.id === figeId ? '' : undefined}
              tabIndex={0}
              role="button"
              aria-label={tm('nuage.point', { nom: p.nom, montant: montant(p.montantCents), interet: p.interet, chance: p.chance })}
              aria-pressed={p.id === figeId}
              onFocus={() => onSurvol(p.id)}
              onBlur={() => onSurvol(null)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChoisir(p.id); } }}
            >
              <title>{p.nom}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
