import {
  DECLENCHEUR_FLUX,
  defautsDeLAutomation,
  depuisAutomation,
  evenementDepuisSource,
  planDExecution,
  type AutomationEtendue,
  type EtapeAExecuter,
} from '../connecteurs/automatisations';
import type { BlocAction, TypeAction, TypeQuand } from '../connecteurs/flux';
import type { ConnecteurInstance } from '../connecteurs/types';
import type { Declencheur, Source } from '../../state/useAutomations';

/**
 * LE MOTEUR ÉTENDU DE H20 — les règles que seul lui sait exécuter.
 *
 * Le moteur actuel (`src/state/useAutomations.ts`, partagé par les deux
 * éditions) ne change pas : il exécute toujours les règles à l'ancienne, et
 * ne trouve aucune source aux règles dont le `trigger` vaut `'flux'`. Ce
 * moteur-ci, monté seulement dans l'édition interne par la couture
 * `@edition/automatisations`, prend ces règles-là, et elles seules : aucune
 * règle n'est donc exécutée deux fois.
 *
 * Il n'exécute un flux que s'il peut l'exécuter EN ENTIER sur le poste,
 * aujourd'hui. Sinon la règle reste inerte, avec sa raison, plutôt que de faire
 * la moitié d'un flux :
 *
 *   · le QUAND doit être un déclencheur que le poste observe déjà (formulaire,
 *     facture en retard, SAV, prospect gagné, stock bas) ;
 *   · chaque action, des deux branches, doit avoir son exécutant local
 *     (`ACTIONS_EXECUTABLES`) ;
 *   · le SI doit porter sur une donnée que la source fournit : « mots repérés »
 *     lit le titre et le détail ; « montant » et « expéditeur connu » attendent
 *     des champs que `Source` n'a pas encore. Décider d'une branche sur une
 *     donnée absente, c'est prendre SINON à tort : le moteur s'abstient.
 *
 * Les identifiants viennent de `planDExecution` : le premier ALORS garde
 * l'identifiant historique `auto-<règle>-<source>`, les suivants un suffixe.
 * Deux postes ouverts écrivent le même enregistrement, jamais deux.
 *
 * Pur : ni React, ni réseau, ni horloge (l'instant est passé en paramètre).
 */

/** Les actions que le poste sait exécuter seul, aujourd'hui. Les autres attendent leur exécutant. */
export const ACTIONS_EXECUTABLES: ReadonlySet<TypeAction> = new Set<TypeAction>(['creer-tache', 'ecrire-journal']);

/**
 * Un bloc exécutable tel qu'il est réglé. Une tâche « à échéance » attend : les
 * tâches n'ont pas encore de champ d'échéance, et le moteur n'en invente pas.
 */
export function blocExecutable(b: BlocAction): boolean {
  if (!ACTIONS_EXECUTABLES.has(b.type)) return false;
  return !(b.type === 'creer-tache' && b.parametres.echeanceJours !== undefined);
}

/** Le déclencheur du moteur actuel qui fournit les sources d'un QUAND, quand il existe. */
export const DECLENCHEUR_DU_QUAND: Readonly<Partial<Record<TypeQuand, Declencheur>>> = {
  'formulaire-repondu': 'formAnswer',
  'facture-en-retard': 'invoiceOverdue',
  'ticket-ouvert': 'ticketOpened',
  'prospect-gagne': 'prospectWon',
  'stock-bas': 'stockLow',
};

export type RaisonInerte =
  /** La règle ne se relit pas en flux valide (`defautsDeLAutomation`). */
  | 'regle-abimee'
  /** Le QUAND n'est pas encore observé par le poste (courriel reçu, rendez-vous, paiement, horaire). */
  | 'declencheur-a-brancher'
  /** Une action n'a pas encore d'exécutant local. */
  | 'action-a-brancher'
  /** Le SI porte sur une donnée que la source ne fournit pas encore. */
  | 'condition-sans-donnee';

export interface RegleInerte {
  regleId: string;
  raison: RaisonInerte;
}

export interface Ecriture {
  collection: 'tasks' | 'logbook';
  id: string;
  valeur: Record<string, unknown>;
}

export interface PlanDuMoteur {
  ecritures: Ecriture[];
  inertes: RegleInerte[];
}

export interface EntreeDuMoteur {
  regles: readonly (AutomationEtendue & { id: string })[];
  /** Les sources d'un déclencheur existant : `sourcesPour` du moteur actuel, avec ses libellés. */
  sourcesDe: (declencheur: Declencheur) => readonly Source[];
  /** Les identifiants déjà écrits dans `tasks` et `logbook`. */
  existants: ReadonlySet<string>;
  /** Les connecteurs de H21. Vide tant que H21 n'est pas construit : tout tourne en local. */
  instances: readonly ConnecteurInstance[];
  maintenant: Date;
}

/** Ce qu'une étape écrit : la même forme que le moteur actuel, pour que H20 et les listes la lisent pareil. */
export function ecritureDeLEtape(etape: EtapeAExecuter, source: Source, assigneeParDefaut: string, maintenant: Date): Ecriture | null {
  const titre = etape.parametres.titre?.trim() || source.titre;
  const at = maintenant.toISOString();
  if (etape.type === 'ecrire-journal') {
    return { collection: 'logbook', id: etape.id, valeur: { text: titre, kind: 'note', byEmail: 'automatisation', at } };
  }
  if (etape.type === 'creer-tache' && etape.parametres.echeanceJours === undefined) {
    return {
      collection: 'tasks',
      id: etape.id,
      valeur: {
        title: titre,
        detail: source.detail,
        assigneeEmail: etape.parametres.assigneeEmail ?? assigneeParDefaut,
        status: 'todo',
        siteId: null,
        clientId: null,
        createdAt: at,
      },
    };
  }
  return null;
}

/** Ce que le moteur étendu doit écrire maintenant, et les règles qu'il laisse inertes (avec la raison). */
export function planifierMoteurEtendu(entree: EntreeDuMoteur): PlanDuMoteur {
  const ecritures: Ecriture[] = [];
  const inertes: RegleInerte[] = [];
  const dejaPrevu = new Set<string>();

  for (const regle of entree.regles) {
    // Une règle à l'ancienne est au moteur actuel : la toucher ici la ferait tourner deux fois.
    if (regle.trigger !== DECLENCHEUR_FLUX) continue;

    if (!regle.flux || defautsDeLAutomation(regle.id, regle).length > 0) {
      inertes.push({ regleId: regle.id, raison: 'regle-abimee' });
      continue;
    }
    const flux = depuisAutomation(regle.id, regle.flux.nom, regle);
    if (flux.etat !== 'actif') continue;

    const declencheur = DECLENCHEUR_DU_QUAND[flux.quand.type];
    if (!declencheur) {
      inertes.push({ regleId: regle.id, raison: 'declencheur-a-brancher' });
      continue;
    }
    if (![...flux.alors, ...flux.sinon].every(blocExecutable)) {
      inertes.push({ regleId: regle.id, raison: 'action-a-brancher' });
      continue;
    }
    if (flux.si && flux.si.type !== 'contient-mots') {
      inertes.push({ regleId: regle.id, raison: 'condition-sans-donnee' });
      continue;
    }

    for (const source of entree.sourcesDe(declencheur)) {
      const evenement = evenementDepuisSource(declencheur, source, entree.maintenant.getTime());
      for (const etape of planDExecution(regle.id, flux, source.id, evenement, { instances: entree.instances })) {
        if (etape.mode === 'suspendu' || entree.existants.has(etape.id) || dejaPrevu.has(etape.id)) continue;
        const ecriture = ecritureDeLEtape(etape, source, regle.assigneeEmail, entree.maintenant);
        if (!ecriture) continue;
        dejaPrevu.add(etape.id);
        ecritures.push(ecriture);
      }
    }
  }
  return { ecritures, inertes };
}
