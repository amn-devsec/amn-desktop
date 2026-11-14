import React, { useId } from 'react';
import type { CouleurSante } from '../clients';

/**
 * La courbe de « Facturé sur 12 mois » : un trait de 1,5 px, une aire sous le trait qui s'estompe, et le point final.
 * Décorative (le montant est écrit à côté) : `aria-hidden`. La couleur est celle de la santé du client, par la classe.
 */
export function SparkArea({ valeurs, couleur, largeur = 110, hauteur = 30 }: { valeurs: readonly number[]; couleur: CouleurSante; largeur?: number; hauteur?: number }) {
  const id = useId();
  const marge = 3;
  const n = valeurs.length;
  const max = Math.max(...valeurs, 1);
  const min = Math.min(...valeurs, 0);
  const x = (i: number) => marge + (n <= 1 ? 0 : (i / (n - 1)) * (largeur - 2 * marge));
  const y = (v: number) => hauteur - marge - ((v - min) / (max - min || 1)) * (hauteur - 2 * marge);
  const points = valeurs.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const trait = points.length ? `M${points.join(' L')}` : '';
  const aire = points.length ? `${trait} L${x(n - 1).toFixed(1)},${hauteur} L${x(0).toFixed(1)},${hauteur} Z` : '';
  return (
    <svg className="sc-cl-spark" data-sante={couleur} width={largeur} height={hauteur} viewBox={`0 0 ${largeur} ${hauteur}`} aria-hidden focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="sc-cl-spark__haut" />
          <stop offset="1" className="sc-cl-spark__bas" />
        </linearGradient>
      </defs>
      {aire && <path d={aire} fill={`url(#${id})`} />}
      {trait && <path d={trait} className="sc-cl-spark__trait" fill="none" strokeLinejoin="round" strokeLinecap="round" />}
      {n > 0 && <circle cx={x(n - 1)} cy={y(valeurs[n - 1])} r={2.5} className="sc-cl-spark__point" />}
    </svg>
  );
}
