import React from 'react';
import type { FamilleCouleur } from '../familles';
import { useSocleLangue } from '../i18n';

/**
 * LA COQUILLE — la grille : barre latérale à gauche ; à droite l'en-tête, le
 * contenu, et la barre Ajmani en bas. Elle ne sait rien des données : on lui
 * passe les quatre pièces.
 *
 * Le contenu est un conteneur (`container-type: inline-size`) : les écrans
 * s'y adaptent à SA largeur. `largeur="lecture"` garde une colonne de lecture
 * pour les écrans qui n'ont pas encore migré ; `"pleine"` est pour les tableaux
 * (la Tour de contrôle).
 */
export interface CoquilleProps {
  lateral: React.ReactNode;
  entete: React.ReactNode;
  ajmani: React.ReactNode;
  children: React.ReactNode;
  largeur?: 'lecture' | 'pleine';
  /** Le tiroir est ouvert (sous 900 px) : le fond sert à le fermer. */
  tiroirOuvert: boolean;
  onFermerTiroir: () => void;
  /** La barre latérale est repliée (son bouton « panneau ») : le contenu prend toute la largeur. */
  lateralRepliee?: boolean;
  /** La famille active (v4) : sa paire de couleurs devient `--fam-a` / `--fam-b` pour toute la coquille. Défaut : Système. */
  famille?: FamilleCouleur;
}

export function Coquille({ lateral, entete, ajmani, children, largeur = 'lecture', tiroirOuvert, onFermerTiroir, lateralRepliee = false, famille = 'systeme' }: CoquilleProps) {
  const { ts } = useSocleLangue();
  // La famille active vaut aussi pour ce qui s'ouvre hors de la coquille, dans `document.body` (palettes ⌘K et ⌘J,
  // dialogues, toasts) : la racine du document la porte tant que la coquille est montée (v4, sources néon).
  React.useEffect(() => {
    const racine = document.documentElement;
    racine.dataset.familleActive = famille;
    return () => {
      if (racine.dataset.familleActive === famille) delete racine.dataset.familleActive;
    };
  }, [famille]);
  return (
    <div data-socle="coquille" data-espace-racine data-espace="poste" data-repliee={lateralRepliee || undefined} data-famille-active={famille} className="sc-coquille">
      {/* Un bouton, pas un lien « #sc-principal » : sous HashRouter, une ancre change la route (check:ancres). */}
      <button
        type="button"
        className="sc-evitement"
        onClick={() => {
          const principal = document.getElementById('sc-principal');
          principal?.focus();
          principal?.scrollIntoView({ block: 'start' });
        }}
      >
        {ts('coquille.evitement')}
      </button>
      {lateral}
      {tiroirOuvert && <button type="button" tabIndex={-1} aria-label={ts('coquille.menu.fermer')} className="sc-fond-tiroir" onClick={onFermerTiroir} />}
      <div className="sc-colonne">
        {entete}
        <main id="sc-principal" tabIndex={-1} data-largeur={largeur} className="sc-principal">
          {children}
          <div aria-hidden className="sc-principal-fin" />
        </main>
        <div className="sc-pied-page">{ajmani}</div>
      </div>
    </div>
  );
}
