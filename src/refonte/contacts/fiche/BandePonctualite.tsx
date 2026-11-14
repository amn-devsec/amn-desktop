import React from 'react';
import type { PointPonctualite } from './modele';
import { useMotsFiche } from './i18n';

/**
 * La bande de ponctualité (G04, `PunctualityStrip`) : 262 × 56. Un point par facture payée, placé selon l'écart à
 * l'échéance (axe central pointillé), de 12 jours avant à 12 jours après, empilé sur trois hauteurs quand deux
 * factures tombent au même jour. Vert si payée à l'heure ou avant, orange après.
 */
export function BandePonctualite({ points, largeur = 262, hauteur = 56 }: { points: readonly PointPonctualite[]; largeur?: number; hauteur?: number }) {
  const { tm } = useMotsFiche();
  const marge = 8;
  const x = (j: number) => marge + ((j + 12) / 24) * (largeur - 2 * marge);
  const vus = new Map<number, number>();
  const hauteurs = [hauteur * 0.7, hauteur * 0.45, hauteur * 0.2];
  return (
    <svg className="sc-fc-ponct" width={largeur} height={hauteur} viewBox={`0 0 ${largeur} ${hauteur}`} role="img" aria-label={tm('argent.graphique', { n: points.length })}>
      <line x1={x(0)} x2={x(0)} y1={2} y2={hauteur - 2} className="sc-fc-ponct__axe" />
      {points.map((p, i) => {
        const pile = vus.get(p.jours) ?? 0;
        vus.set(p.jours, pile + 1);
        return <circle key={`${p.numero}-${i}`} cx={x(p.jours)} cy={hauteurs[Math.min(pile, 2)]} r={3.5} className="sc-fc-ponct__point" data-heure={p.aLHeure ? '' : undefined}><title>{p.numero}</title></circle>;
      })}
    </svg>
  );
}
