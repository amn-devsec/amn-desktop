import React from 'react';
import type { Famille } from '../../socle/familles';
import { Page } from '../../socle/ui/archetypes';
import { useTextesCommuns } from './i18n';

/**
 * LA PAGE D'UN MODULE AU SOCLE v4 — la famille en néon (`--fam-a` / `--fam-b`), Inter, la page du socle.
 *
 * `data-famille` pose la paire de couleurs de la famille pour tout ce que la page contient : les briques
 * (bouton principal, tuiles, barres, pastilles) la lisent, aucune couleur n'est écrite ici. `data-refonte-police`
 * donne Inter à l'écran (`src/socle/noir.css`). Dans la coquille (`.sc-principal`, qui a déjà son rembourrage), la
 * page ne double pas les marges ; hors coquille (l'application actuelle, l'aperçu), elle pose les siennes.
 *
 * Sous 640 px, les tuiles KPI passent sur une colonne : à deux, leur titre est tronqué (`!` : la feuille du socle n'est
 * pas dans une couche Tailwind, elle l'emporterait sans cela).
 *
 * Les modules d'atelier travaillent encore sur des données d'exemple : la note du bas le dit.
 */
export function PageAtelier({ famille, children }: { famille: Famille; children: React.ReactNode }) {
  const { tx } = useTextesCommuns();
  return (
    <div
      data-famille={famille}
      data-atelier=""
      data-refonte-police="inter"
      className="mx-auto flex w-full min-w-0 max-w-[1240px] flex-col gap-4 px-6 py-6 sm:px-10 [.sc-principal_&]:max-w-none [.sc-principal_&]:p-0 max-sm:[&_.sc-rangee-kpi]:grid-cols-1!"
    >
      <Page>{children}</Page>
      <p className="border-t border-socle-bord pt-3 text-[12px] leading-relaxed text-socle-texte-doux">{tx('exemple')}</p>
    </div>
  );
}

/**
 * La zone principale et sa colonne de droite (340 px), à la façon de `DispositionPage` mais sans hauteur imposée :
 * `DispositionPage` suppose la hauteur bornée de la coquille (la page ne défile pas, ses cartes défilent) et
 * s'effondre à 320 px dans une page qui défile. Sous 1280 px, la colonne passe sous le contenu.
 */
export function Disposition({ droite, children }: { droite?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`grid min-w-0 items-start gap-3.5 ${droite ? 'xl:grid-cols-[minmax(0,1fr)_340px]' : ''}`}>
      <div className="flex min-w-0 flex-col gap-3.5">{children}</div>
      {droite && <aside className="flex min-w-0 flex-col gap-3.5">{droite}</aside>}
    </div>
  );
}
