import { cleMessagePalier, paliereDe, toneAMonte, type PalierRelance } from '../../../lib/relances';
import { joursEntre } from '../tarifs';
import type { Jour } from '../types';

/**
 * LES RELANCES DU JOUR — sur le moteur existant (`src/lib/relances.ts`).
 *
 * `relances.ts` dit quel palier un retard atteint et si le ton a monté. Ce
 * moteur décide, chaque jour, QUELLES factures relancer, sans harceler. Les
 * règles viennent de la fiche MC07 (STATUT §1.31), qui l'emporte :
 *
 *   · jamais une facture payée, en litige, ou pas encore échue ;
 *   · au moins 5 jours entre deux relances d'une même facture (réglable de 3 à 14) ;
 *   · 3 relances au plus par facture ; ensuite, suivi à la main (`relancesAuPlafond`) ;
 *   · une relance au plus par client sur 7 jours glissants : ses factures dues
 *     le même jour partent ensemble, dans une seule relance (`regroupees`) ;
 *   · « rappel » et « relance ferme » peuvent être préparés et envoyés seuls ;
 *     « mise en demeure » et « dernier avis » attendent TOUJOURS une personne.
 *
 * Le texte vient des clés existantes `relances.message*` (vouvoiement, déjà
 * traduites) : ce moteur rend la clé, l'écran la traduit.
 */

export interface FactureARelancer {
  id: string;
  /** Le client ; absent = la facture compte comme son propre client. */
  clientId?: string | number;
  echeance: Jour;
  payee: boolean;
  enLitige?: boolean;
  /** Courriel du client ; absent = rien à préparer, une tâche « trouver le contact » à la place. */
  courriel?: string;
  derniereRelance: { palier: PalierRelance; le: Jour } | null;
  /** Relances déjà envoyées pour cette facture. */
  relancesEnvoyees?: number;
}

/** Fiche MC07 : 5 jours entre deux relances d'une même facture, réglable de 3 à 14. */
export const DELAI_ENTRE_RELANCES_JOURS = 5;
export const DELAI_ENTRE_RELANCES_BORNES = { min: 3, max: 14 } as const;
/** Fiche MC07 : 3 relances au plus par facture. Plus bas est permis, jamais plus haut. */
export const MAX_RELANCES_PAR_FACTURE = 3;
/** Fiche MC07 : une relance au plus par client sur 7 jours glissants. Plus long est permis, jamais plus court. */
export const FENETRE_PAR_CLIENT_JOURS = 7;

/** Les paliers qu'aucune automatisation n'envoie seule. */
export const PALIERS_VALIDATION_HUMAINE: readonly PalierRelance[] = ['mise-en-demeure', 'dernier-avis'];

export interface RelanceProposee {
  id: string;
  factureId: string;
  /** Les autres factures du même client, dues le même jour, envoyées dans la même relance. */
  regroupees: string[];
  palier: PalierRelance;
  joursRetard: number;
  toneAMonte: boolean;
  cleMessage: ReturnType<typeof cleMessagePalier>;
  /** Vrai : préparée, mais envoyée seulement après un clic. */
  validationHumaine: boolean;
  /** Pas de courriel connu : la relance devient une tâche. */
  sansContact: boolean;
}

export interface ReglesDeRelance {
  delaiEntreRelancesJours: number;
  maxRelancesParFacture: number;
  fenetreParClientJours: number;
}

export const REGLES_DE_RELANCE: Readonly<ReglesDeRelance> = {
  delaiEntreRelancesJours: DELAI_ENTRE_RELANCES_JOURS,
  maxRelancesParFacture: MAX_RELANCES_PAR_FACTURE,
  fenetreParClientJours: FENETRE_PAR_CLIENT_JOURS,
};

const clientDe = (f: FactureARelancer) => (f.clientId === undefined ? `facture:${f.id}` : `client:${String(f.clientId)}`);

/** Les factures qui ont reçu leurs relances : la suite se fait à la main. */
export function relancesAuPlafond(factures: readonly FactureARelancer[], max = MAX_RELANCES_PAR_FACTURE): string[] {
  return factures.filter((f) => !f.payee && !f.enLitige && (f.relancesEnvoyees ?? 0) >= max).map((f) => f.id);
}

export function relancesDuJour(factures: readonly FactureARelancer[], aujourdhui: Jour, regles: Partial<ReglesDeRelance> = {}): RelanceProposee[] {
  const R = { ...REGLES_DE_RELANCE, ...regles };
  // Les clients relancés dans la fenêtre glissante, toutes factures confondues.
  const clientsRecents = new Set(
    factures.filter((f) => f.derniereRelance && joursEntre(f.derniereRelance.le, aujourdhui) < R.fenetreParClientJours).map(clientDe),
  );
  const parClient = new Map<string, { f: FactureARelancer; retard: number }[]>();
  for (const f of factures) {
    if (f.payee || f.enLitige) continue;
    if ((f.relancesEnvoyees ?? 0) >= R.maxRelancesParFacture) continue;
    const retard = joursEntre(f.echeance, aujourdhui);
    if (retard <= 0) continue;
    if (f.derniereRelance && joursEntre(f.derniereRelance.le, aujourdhui) < R.delaiEntreRelancesJours) continue;
    if (clientsRecents.has(clientDe(f))) continue;
    const liste = parClient.get(clientDe(f)) ?? [];
    liste.push({ f, retard });
    parClient.set(clientDe(f), liste);
  }
  const r: RelanceProposee[] = [];
  for (const liste of parClient.values()) {
    liste.sort((a, b) => b.retard - a.retard || a.f.id.localeCompare(b.f.id));
    const [{ f, retard }, ...autres] = liste;
    const palier = paliereDe(retard);
    r.push({
      id: `relance-${f.id}-${aujourdhui}`,
      factureId: f.id,
      regroupees: autres.map((x) => x.f.id),
      palier,
      joursRetard: retard,
      toneAMonte: toneAMonte(f.derniereRelance?.palier ?? null, palier),
      cleMessage: cleMessagePalier(palier),
      validationHumaine: liste.some((x) => PALIERS_VALIDATION_HUMAINE.includes(paliereDe(x.retard))),
      sansContact: !f.courriel,
    });
  }
  return r.sort((a, b) => b.joursRetard - a.joursRetard || a.factureId.localeCompare(b.factureId));
}
