import React from 'react';

/**
 * La demi-jauge de recommandation (H44, `Gauge`) : un arc de 150 px, trait de 12, rempli à `valeur` (0 à 1) ; au centre,
 * le score et « sur 100 ». Le tracé part de la gauche, comme sur l'image. Décorative pour l'œil, lisible pour un lecteur
 * d'écran par son `aria-label`.
 */
export function DemiJauge({ valeur, libelle, score, sur, taille = 150, epaisseur = 12 }: { valeur: number; libelle: string; score: string; sur: string; taille?: number; epaisseur?: number }) {
  const r = (taille - epaisseur) / 2;
  const cx = taille / 2;
  const cy = taille / 2;
  const arc = Math.PI * r;
  const v = Math.max(0, Math.min(1, valeur));
  // Trois quarts de cercle ouvert vers le bas : de 135° à 405° (270° de course) ; le trait plein suit la valeur.
  const debut = (135 * Math.PI) / 180;
  const fin = (405 * Math.PI) / 180;
  const point = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  const chemin = `M ${point(debut)} A ${r} ${r} 0 1 1 ${point(fin)}`;
  const longueur = (270 / 360) * 2 * Math.PI * r;
  void arc;
  return (
    <div className="sc-rt-jauge" style={{ width: taille, height: taille * 0.8 }} role="img" aria-label={libelle}>
      <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} aria-hidden>
        <path d={chemin} className="sc-rt-jauge__piste" strokeWidth={epaisseur} fill="none" strokeLinecap="round" />
        <path d={chemin} className="sc-rt-jauge__trait" strokeWidth={epaisseur} fill="none" strokeLinecap="round" strokeDasharray={longueur} strokeDashoffset={longueur * (1 - v)} />
      </svg>
      <span className="sc-rt-jauge__centre"><span className="sc-rt-jauge__score sc-nombre">{score}</span><span className="sc-rt-jauge__sur">{sur}</span></span>
    </div>
  );
}
