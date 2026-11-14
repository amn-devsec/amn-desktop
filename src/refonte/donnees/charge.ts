/**
 * LOT-14, LA CHARGE — des organisations fictives, reproductibles à la graine.
 *
 * `STATUT.md` §1.20 fixe les essais : 100 organisations clientes dont 20 connectées en même temps
 * plus 3 personnes de l'équipe interne (la cible), une montée jusqu'à 1 000 organisations par paliers
 * (la résistance), et 72 h à la cible avec coupures et redémarrages (les essais longs). Ce fichier
 * décrit QUI est dans l'essai ; les scénarios, eux, sont écrits dans `docs/simulation/charge.md` et
 * joués par `simulation/charge/executer.mjs`.
 *
 * Propriétés qui comptent :
 *   · reproductible : même graine, mêmes organisations ;
 *   · emboîté : les 100 premières organisations d'un essai à 1 000 sont celles de l'essai à 100,
 *     donc un palier ne change pas qui était déjà là ;
 *   · rien de réel : noms inventés, courriels en `.exemple.test`, aucun secret, aucune adresse réseau ;
 *   · de 10 à 600 personnes par organisation, les deux bornes présentes dès deux organisations.
 *
 * Les effectifs pilotent le volume de données et la part de personnes connectées ; ils ne forcent pas
 * à créer 300 000 comptes pour vérifier qu'un scénario tourne (`emailDuMembre` les fabrique à la
 * demande, un par un).
 */

import { nomEntreprise } from './contacts';
import { GRAINE_REFERENCE, graineDe, hasard, slug, type Volume } from './outils';

export const EFFECTIF_MIN = 10;
export const EFFECTIF_MAX = 600;
/** Au-delà, ce n'est plus un essai mais une erreur de frappe. */
export const ORGANISATIONS_MAX = 5_000;

export type TailleDeCharge = 'petite' | 'moyenne' | 'grande';
export type ProfilDActivite = 'calme' | 'courant' | 'intense';

export interface OrganisationDeCharge {
  /** `org-0001`… : stable d'un essai à l'autre. */
  id: string;
  nom: string;
  secteur: string;
  /** De 10 à 600 personnes. */
  effectif: number;
  taille: TailleDeCharge;
  /** Le volume de données (jeux fictifs) qu'une organisation de cette taille porte. */
  volume: Volume;
  profil: ProfilDActivite;
  /** Courriel de la personne qui possède l'espace. */
  proprietaire: string;
  /** Domaine de courriel de l'organisation (toujours `….exemple.test`). */
  domaine: string;
}

const tailleDe = (effectif: number): TailleDeCharge => (effectif <= 40 ? 'petite' : effectif <= 200 ? 'moyenne' : 'grande');
const VOLUME_DE: Record<TailleDeCharge, Volume> = { petite: 'peu', moyenne: 'normal', grande: 'beaucoup' };

/** Toutes les organisations de 1 à `nombre`, dans le même ordre quel que soit `nombre`. */
export function genererOrganisationsDeCharge(options: { graine?: number; nombre?: number } = {}): OrganisationDeCharge[] {
  const graine = options.graine ?? GRAINE_REFERENCE;
  const nombre = options.nombre ?? 100;
  if (!Number.isInteger(nombre) || nombre < 0 || nombre > ORGANISATIONS_MAX) throw new Error(`Nombre d'organisations invalide : ${String(nombre)} (0 à ${ORGANISATIONS_MAX})`);
  const noms = new Set<string>();
  const liste: OrganisationDeCharge[] = [];
  for (let i = 1; i <= nombre; i += 1) {
    const h = hasard(graineDe(graine, `charge-org-${i}`));
    const { nom, secteur } = nomEntreprise(hasard(graineDe(graine, `charge-nom-${i}`)), noms);
    // Log-uniforme : beaucoup de petites structures, quelques grandes. Les deux bornes sont posées en tête.
    const effectif = i === 1 ? EFFECTIF_MIN : i === 2 ? EFFECTIF_MAX : Math.min(EFFECTIF_MAX, Math.max(EFFECTIF_MIN, Math.round(EFFECTIF_MIN * (EFFECTIF_MAX / EFFECTIF_MIN) ** h.reel())));
    const taille = tailleDe(effectif);
    const domaine = `${slug(nom)}-${String(i).padStart(4, '0')}.exemple.test`;
    liste.push({
      id: `org-${String(i).padStart(4, '0')}`,
      nom,
      secteur,
      effectif,
      taille,
      volume: VOLUME_DE[taille],
      profil: h.pondere([['calme', 3], ['courant', 5], ['intense', 2]] as const),
      proprietaire: `direction@${domaine}`,
      domaine,
    });
  }
  return liste;
}

/** Le courriel du `rang`-ième membre (0 = la personne propriétaire). Aucune liste de 600 adresses à garder en mémoire. */
export function emailDuMembre(org: Pick<OrganisationDeCharge, 'domaine' | 'effectif'>, rang: number): string {
  if (!Number.isInteger(rang) || rang < 0 || rang >= org.effectif) throw new Error(`Rang hors effectif : ${rang}`);
  return rang === 0 ? `direction@${org.domaine}` : `membre-${String(rang).padStart(3, '0')}@${org.domaine}`;
}

/**
 * Les organisations connectées en même temps : toujours les mêmes pour une même graine, et emboîtées
 * (les 20 connectées d'un essai à 40 sont dans les 40).
 */
export function choisirConnectees(organisations: readonly OrganisationDeCharge[], n: number, graine = GRAINE_REFERENCE): OrganisationDeCharge[] {
  return [...organisations]
    .sort((a, b) => graineDe(graine, `connectee-${a.id}`) - graineDe(graine, `connectee-${b.id}`) || a.id.localeCompare(b.id))
    .slice(0, Math.max(0, n));
}

/** Les trois personnes de l'équipe interne au travail pendant l'essai (courriels fictifs). */
export const EQUIPE_INTERNE_DE_CHARGE = ['interne-1@charge.exemple.test', 'interne-2@charge.exemple.test', 'interne-3@charge.exemple.test'] as const;

/* ------------------------------ Les seuils ------------------------------ */

/** Les seuils validés par Harun le 12 nov. (`STATUT.md` §1.20). Une seule source, relue par les tests. */
export const SEUILS_DE_CHARGE = {
  /** 95 % des actions courantes en moins d'1 s. */
  partRapide: 0.95,
  actionRapideMs: 1_000,
  /** Une écriture visible sur les autres postes en moins de 5 s. */
  visibiliteMs: 5_000,
} as const;

/** La cible : 100 organisations, dont 20 connectées en même temps, plus 3 personnes internes. */
export const CIBLE_DE_CHARGE = { organisations: 100, connectees: 20, internes: 3 } as const;
/** La résistance : jusqu'à 1 000 organisations, par paliers de connectées simultanées. */
export const PALIERS_DE_CHARGE = [20, 50, 100, 200, 400, 700, 1_000] as const;
/** Les essais longs : 72 heures à la cible. */
export const ESSAI_LONG_HEURES = 72;

/** Le mélange d'actions d'une personne connectée : lire plus qu'écrire. */
export const MELANGE_D_ACTIONS = [
  { nom: 'lire une liste', poids: 40, ecriture: false },
  { nom: 'ouvrir tout l’espace', poids: 10, ecriture: false },
  { nom: 'créer ou modifier un enregistrement', poids: 35, ecriture: true },
  { nom: 'retirer un enregistrement', poids: 10, ecriture: true },
  { nom: 'écrire un enregistrement vu par les collègues', poids: 5, ecriture: true },
] as const;

/** Attente entre deux actions d'une personne (ms) : une personne ne clique pas à la milliseconde. */
export const PAUSE_ENTRE_ACTIONS_MS = { min: 400, max: 2_500 } as const;
