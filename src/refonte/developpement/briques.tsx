import React from 'react';
import { Page, PageHead, Etiquette, BlocEtat, Bouton, IconeEtincelle, type ActionPage } from '../../socle/ui';
import type { DonneesDeveloppement } from './donnees';
import { dire } from './i18n';
import './developpement.css';

/**
 * LOT-11 · LES BRIQUES COMMUNES DES ÉCRANS DE DÉVELOPPEMENT — l'en-tête, la carte, la liste « à regarder », l'état
 * « à brancher ». Elles ne font que de la mise en page : les données et leurs règles viennent de la logique du lot.
 */

/** La page : son en-tête (un seul primaire) puis son contenu, en colonne, écart de 14. */
export function PageDev({
  titre,
  sousTitre,
  primaire,
  secondaires,
  source,
  children,
  className = '',
}: {
  titre: string;
  sousTitre?: React.ReactNode;
  primaire?: ActionPage;
  secondaires?: ActionPage[];
  source: DonneesDeveloppement['source'];
  children: React.ReactNode;
  className?: string;
}) {
  const sous = (
    <>
      {sousTitre}
      {source === 'exemple' && (
        <span className="dv-exemple">
          <Etiquette compacte title={dire('fr', 'exemple.infobulle')}>
            {dire('fr', 'exemple.etiquette')}
          </Etiquette>
        </span>
      )}
    </>
  );
  return (
    <Page className={`dv-page ${className}`.trim()}>
      <PageHead className="dv-entete" titre={titre} sousTitre={sous} primaire={primaire} secondaires={secondaires} />
      {children}
    </Page>
  );
}

/** Une carte néon de l'espace : titre, compteur à droite, contenu. Les cotes viennent de la classe de l'écran. */
export function CarteDev({
  titre,
  droite,
  className = '',
  children,
  rang,
  libelle,
}: {
  titre?: React.ReactNode;
  droite?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  rang?: number;
  libelle?: string;
}) {
  return (
    <section className={`dv-carte ${className}`.trim()} aria-label={libelle} data-coin={rang !== undefined && rang % 2 === 1 ? 'gauche' : 'droite'}>
      {(titre || droite) && (
        <header className="dv-carte__tete">
          {titre && <h2 className="dv-carte__titre">{titre}</h2>}
          {droite && <span className="dv-carte__droite">{droite}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export type TonPoint = 'succes' | 'attention' | 'critique' | 'info' | 'neutre';

/** Un point d'état (8 px) avec sa lueur : jamais seul, toujours suivi d'un libellé. */
export function Point({ ton, className = '' }: { ton: TonPoint; className?: string }) {
  return <span aria-hidden className={`dv-point ${className}`.trim()} data-ton={ton} />;
}

/** Une ligne « À regarder aujourd'hui » : point, nom en monospace, texte, « Ouvrir ». */
export interface PointARegarder {
  cle: string;
  ton: TonPoint;
  nom: string;
  texte: string;
  ouvrir: () => void;
}

export function ListeARegarder({ points, libelleOuvrir, vide }: { points: readonly PointARegarder[]; libelleOuvrir: string; vide: string }) {
  if (points.length === 0) return <p className="dv-vide-ligne">{vide}</p>;
  return (
    <ul className="dv-a-regarder">
      {points.map((p) => (
        <li key={p.cle} className="dv-a-regarder__ligne">
          <Point ton={p.ton} />
          <span className="dv-a-regarder__texte">
            <b className="dv-mono">{p.nom}</b> · {p.texte}
          </span>
          <Bouton variante="secondaire" taille="petit" onClick={p.ouvrir} aria-label={`${libelleOuvrir} : ${p.nom}`}>
            {libelleOuvrir}
          </Bouton>
        </li>
      ))}
    </ul>
  );
}

/** L'état « à brancher » : la source n'existe pas encore (connecteur de LOT-12, serveur de LOT-13). */
export function ABrancher({ icone, titre, texte, action }: { icone: React.ReactNode; titre: string; texte: string; action?: React.ReactNode }) {
  return <BlocEtat icone={icone} ton="neutre" titre={titre} texte={texte} actions={action} niveauTitre={2} className="dv-a-brancher" />;
}

/** Un grand chiffre en dégradé (06 §3 règle 4) avec son libellé dessous. */
export function GrandChiffre({ valeur, libelle, second = false }: { valeur: React.ReactNode; libelle: string; second?: boolean }) {
  return (
    <div className="dv-grand">
      <span className="dv-grand__valeur" data-second={second || undefined}>
        {valeur}
      </span>
      <span className="dv-grand__libelle">{libelle}</span>
    </div>
  );
}

/** Une suggestion d'Ajmani de colonne (bord en dégradé a → b, bouton pleine largeur). */
export function SuggestionDev({ texte, action, onAction, className = '' }: { texte: string; action: string; onAction: () => void; className?: string }) {
  return (
    <aside className={`dv-suggestion ${className}`.trim()} aria-label={dire('fr', 'ajmani.suggestion')}>
      <p className="dv-suggestion__texte">
        <span aria-hidden className="dv-suggestion__etincelle">
          <IconeEtincelle taille={16} />
        </span>
        {texte}
      </p>
      <button type="button" className="dv-suggestion__bouton" onClick={onAction}>
        {action}
      </button>
    </aside>
  );
}
