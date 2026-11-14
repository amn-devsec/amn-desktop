/**
 * LA SOUS-LISTE « DÉVELOPPEMENT » (STATUT §1.17 n° 1, §1.19 n° 1) — sous la section « ESPACES DE TRAVAIL ».
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Elle suit l'ordre des treize lignes de l'image (fiche `docs/refonte/fiches/LOT-11/00-COMMUN.md`) : « Vue
 * d'ensemble », puis les modules de LOT-11 (famille `developpement` du registre) et des vues d'autres familles
 * qu'elle montre aussi. Le registre reste sans doublon : ces vues gardent leur famille ; la sous-liste ne fait que
 * pointer vers elles. Le socle §0.1 s'applique ensuite (cinq lignes au plus, puis « + N autres »).
 *
 * `lot11: n` : le n-ième module que LOT-11 déclare au registre, dans son ordre (il les déclare dans l'ordre de
 * l'image). Une vue reprise sans identifiant (`vue: null`) n'est pas encore au registre : quand son lot la
 * déclare, son identifiant s'écrit ici. Une vue absente ou fermée à l'organisation ne prend pas de ligne.
 */
export type LigneDeveloppement = { lot11: number } | { fiche: string; vue: string | null };

export const ORDRE_DEVELOPPEMENT: readonly LigneDeveloppement[] = [
  { lot11: 0 }, // Projets de code (DEV-projets)
  { lot11: 1 }, // Déploiements (DEV-deploiements)
  { lot11: 2 }, // Serveur et santé (DEV-serveur)
  { lot11: 3 }, // Éditeur de flux (DEV-editeur)
  { fiche: 'H20', vue: 'automations' }, // Automatisations (Outils)
  { fiche: 'H21', vue: null }, // Connecteurs (Outils) : pas encore au registre
  { lot11: 4 }, // Coûts et API (DEV-couts)
  { fiche: 'H24', vue: 'vault' }, // Coffre-fort (Outils)
  { lot11: 5 }, // Modèles de sites (DEV-modeles-sites)
  { fiche: 'H03', vue: null }, // Missions et tickets (Ma journée) : pas encore au registre
  { fiche: 'MO03', vue: null }, // Sauvegardes (Outils) : pas encore au registre
  { fiche: 'ME05', vue: 'knowledge' }, // Base de connaissances (Écrire)
];

/**
 * Les lignes de la sous-liste, dans l'ordre de l'image : les modules propres à leur rang, les vues reprises que
 * `reprise` trouve, puis les modules propres au-delà des six, dans l'ordre du registre. Pur.
 */
export function lignesDeveloppement<T>(propres: readonly T[], reprise: (vue: string) => T | undefined): T[] {
  const sortie: T[] = [];
  const places = new Set<number>();
  for (const l of ORDRE_DEVELOPPEMENT) {
    if ('lot11' in l) {
      const m = propres[l.lot11];
      if (m !== undefined) {
        sortie.push(m);
        places.add(l.lot11);
      }
    } else if (l.vue) {
      const m = reprise(l.vue);
      if (m !== undefined && !sortie.includes(m)) sortie.push(m);
    }
  }
  propres.forEach((m, i) => {
    if (!places.has(i)) sortie.push(m);
  });
  return sortie;
}
