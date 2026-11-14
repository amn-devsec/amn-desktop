/**
 * LE BUS DE MOMENTS, CÔTÉ INTERNE — ce que le code partagé (`src/state`) prend au socle pour émettre un moment.
 *
 * Un pont à part de `@edition/socle` : celui-ci porte l'interface du socle (racine, sections de réglages, donc les
 * briques et leurs icônes) ; un module d'état qui émet `facture.payee` ou `client.cree` n'a pas à la charger
 * (`check:avoirs` construit `useInvoices` hors navigateur). Le bus lui-même ne dépend d'aucune interface.
 */
export { emit as emettreMoment } from '../socle/moments';
