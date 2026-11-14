import { useEffect, useMemo, useRef } from 'react';
import { useCollection, useSync } from '../../state/SyncContext';
import { sourcesPour, type Declencheur } from '../../state/useAutomations';
import type { AutomationEtendue } from '../connecteurs/automatisations';
import { planifierMoteurEtendu } from './planDuMoteur';

export interface MoteurEtenduProps {
  /** Les libellés des sources, ceux que le moteur actuel reçoit déjà de `AutomationsRunner`. */
  libelles: Record<Declencheur, (a: string, b: string) => string>;
}

/**
 * Le moteur étendu de H20, monté à côté du moteur actuel par `AutomationsRunner`
 * (édition interne seulement, via `@edition/automatisations`). Il lit les mêmes
 * collections que lui et n'exécute que les règles `'flux'` (`planDuMoteur.ts`).
 * Ne rend rien.
 */
export function MoteurEtendu({ libelles }: MoteurEtenduProps) {
  const { upsert } = useSync();
  const regles = useCollection<AutomationEtendue>('automations');
  const formAnswers = useCollection<{ formId: string; answers: Record<string, string> }>('formAnswers');
  const forms = useCollection<{ title: string }>('forms');
  const invoices = useCollection<{ number: string; status: string; paidAt: string; dueAt: string; billTo?: { name?: string } }>('invoices');
  const tickets = useCollection<{ subject: string; client: string; status: string }>('tickets');
  const prospects = useCollection<{ name: string; company: string; stage: string }>('prospects');
  const stockItems = useCollection<{ name: string; quantity: number; minQuantity: number | null }>('stockItems');
  const tasks = useCollection<{ title: string }>('tasks');
  const logbook = useCollection<{ text: string }>('logbook');
  const enCours = useRef(new Set<string>());

  const plan = useMemo(
    () =>
      planifierMoteurEtendu({
        regles,
        sourcesDe: (d) => sourcesPour(d, { formAnswers, forms, invoices, tickets, prospects, stockItems }, libelles),
        existants: new Set([...tasks.map((x) => x.id), ...logbook.map((x) => x.id)]),
        // Les connecteurs viendront de H21 ; d'ici là, tout tourne en local.
        instances: [],
        maintenant: new Date(),
      }),
    [regles, formAnswers, forms, invoices, tickets, prospects, stockItems, tasks, logbook, libelles],
  );

  useEffect(() => {
    for (const { collection, id, valeur } of plan.ecritures) {
      if (enCours.current.has(id)) continue;
      enCours.current.add(id);
      void Promise.resolve(upsert(collection, id, valeur)).finally(() => enCours.current.delete(id));
    }
  }, [plan, upsert]);

  return null;
}
