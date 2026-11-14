import { partiesParis, type Instant, type Langue } from './commun';
import type { BoiteAZero } from './boite';
import { dire, direCompte } from './i18n';

/**
 * Les phrases composées par la logique : un seul endroit pour que l'écran n'assemble jamais de texte à la main.
 * Tutoiement dans l'interface ; ce qui part chez un client n'est pas produit ici.
 */

/**
 * Sous le centre de la Boîte à zéro : « encore 5 réponses et c'est fini » ; à zéro : « Boîte à zéro, belle journée » ;
 * aucun message aujourd'hui : « Journée calme pour l'instant ». Jamais de célébration animée, jamais de reproche.
 */
export function phraseDeLaBoite(b: BoiteAZero, langue: Langue): string {
  if (b.calme) return dire(langue, 'boite.calme');
  if (b.atteinte) return dire(langue, 'boite.zero');
  return direCompte(langue, 'boite.encore', b.aRepondre);
}

/** « Personne n'attend de réponse. Belle matinée. » (le moment de la journée décide du mot) ; sinon « 5 clients attendent ». */
export function phraseDeLaRegle(nombre: number, maintenant: Instant, langue: Langue): string {
  if (nombre > 0) return direCompte(langue, 'regle.attendent', nombre);
  const matin = partiesParis(maintenant).minutes < 12 * 60;
  return `${dire(langue, 'regle.personne')} ${dire(langue, matin ? 'regle.belleMatinee' : 'regle.belleJournee')}`;
}

/** « à zéro 4 soirs de suite » ; pas de série : rien (jamais « 0 soir »). */
export const phraseDeSerieDeSoirs = (serie: number, langue: Langue): string | null => (serie > 0 ? direCompte(langue, 'boite.serie', serie) : null);
