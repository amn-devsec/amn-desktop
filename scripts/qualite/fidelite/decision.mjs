/**
 * LA RÈGLE DE LA GARDE `check:fidelite` — pure, sans fichier ni navigateur, donc testable partout (y compris sur la CI,
 * où les images de référence ne sont jamais présentes).
 *
 * Seuils provisoires, révisables par Harun (STATUT §1.30) :
 *   - un écran déjà mesuré échoue si son écart monte de plus de 2 points au-dessus de sa valeur acceptée ;
 *   - un écran nouveau échoue au-dessus de 15 %, sauf écart justifié et écrit (`justifies-LOT-xx.json`).
 *
 * Les écarts sont des pourcentages (0 à 100), arrondis au dixième pour la comparaison : la garde ne doit pas
 * échouer sur le bruit du quatrième chiffre.
 */
export const SEUIL_HAUSSE = 2; // points au-dessus de la valeur acceptée
export const SEUIL_NOUVEAU = 15; // % pour un écran sans valeur acceptée

const arrondi = (x) => Math.round(x * 10) / 10;

/**
 * @param {{ ecart: number, accepte?: number|null, justifie?: { raison?: string }|null }} e
 * @returns {{ statut: 'accepte'|'echec'|'nouveau-ok'|'nouveau-justifie'|'nouveau-echec', raison: string }}
 */
export function decider({ ecart, accepte = null, justifie = null }) {
  if (typeof ecart !== 'number' || !Number.isFinite(ecart) || ecart < 0) {
    return { statut: 'echec', raison: 'écart illisible' };
  }
  const mesure = arrondi(ecart);
  if (typeof accepte === 'number') {
    const plafond = arrondi(accepte + SEUIL_HAUSSE);
    return mesure > plafond
      ? { statut: 'echec', raison: `${mesure} % > ${plafond} % (accepté ${accepte} % + ${SEUIL_HAUSSE} points)` }
      : { statut: 'accepte', raison: `${mesure} % ≤ ${plafond} % (accepté ${accepte} % + ${SEUIL_HAUSSE} points)` };
  }
  if (mesure <= SEUIL_NOUVEAU) return { statut: 'nouveau-ok', raison: `écran nouveau, ${mesure} % ≤ ${SEUIL_NOUVEAU} %` };
  const raison = typeof justifie?.raison === 'string' ? justifie.raison.trim() : '';
  if (raison) return { statut: 'nouveau-justifie', raison: `écran nouveau à ${mesure} % > ${SEUIL_NOUVEAU} %, justifié : ${raison}` };
  return { statut: 'nouveau-echec', raison: `écran nouveau à ${mesure} % > ${SEUIL_NOUVEAU} % et aucun écart justifié dans justifies-LOT-xx.json` };
}

/** Un statut fait-il échouer la garde ? */
export const echoue = (statut) => statut === 'echec' || statut === 'nouveau-echec';
