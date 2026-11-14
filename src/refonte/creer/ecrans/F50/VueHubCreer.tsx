import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Check, Flag, Hammer, ListChecks, Package, Pencil, Truck, Video } from 'lucide-react';
import { CountBadge, ModuleGroupGrid, ModuleTile, PageHead } from '../../../../socle/ui';
import { FilterChips, InlineSuggestion } from '../../../../socle/ui/vivant';
import { compte as compteTexte, traduire as traduireLigne, type CleCreer } from '../../i18n';
import type { Langue } from '../../commun';
import { filtrerCouloir } from '../../ligneDeProduction';
import { SEUIL_SUGGESTION_COMMANDE } from '../../stock';
import { POSTES, type Cellule, type CouloirId, type Element, type GroupeModules, type LigneDeProduction, type Poste } from '../../ligneDeProduction';
import { useMots, type CleF50 } from './textes';
import '../../creer.css';

/** Les routes des modules du lot (STATUT §1.27 c : `/reservations` et `/photos-chantier` sont nouvelles). */
export const ROUTES_MODULES: Record<string, string> = {
  chantiers: '/montage',
  qualite: '/controles',
  'bons-intervention': '/interventions',
  commandes: '/commandes',
  tournees: '/tournees',
  flotte: '/flotte',
  reservations: '/reservations',
  stock: '/stock',
  materiel: '/materiel',
  catalogue: '/catalogue',
  boutique: '/boutique',
  video: '/montage-video',
  visuels: '/identite-visuelle',
  'page-publique': '/mini-page',
  'photos-chantier': '/photos-chantier',
  'modeles-sites': '/developpement/modeles-sites',
};
const ROUTE_LIEN_ELEMENT: Record<Element['lien']['module'], string> = { chantiers: '/montage', commandes: '/commandes', video: '/montage-video', qualite: '/controles' };

export interface TuileHub {
  id: string;
  groupe: GroupeModules;
  /** La mesure (une ligne sous le nom), calculée par le module ; absente : « non disponible ». */
  mesure?: string;
  ton?: 'vert' | 'info' | 'attention';
  compte?: number;
  actif: boolean;
}

export interface VueHubProps {
  ligne: LigneDeProduction;
  elements: readonly Element[];
  sousTitre: string;
  tuiles: readonly TuileHub[];
  /** « 58 commandes · palier 60 dans 2 » : le palier de la colonne Livré des commandes. */
  palier: { palier: number; restant: number; atteint: boolean } | null;
  aLHeure: number;
  /** Articles sous le seuil sans commande : la suggestion s'affiche à partir de 3. */
  articlesSansCommande: number;
  onNouveauChantier?: () => void;
  onPersonnaliser?: () => void;
  onPreparer?: () => void;
  onPlusTard?: () => void;
}

const ICONES_POSTE: Record<Poste, React.ReactNode> = {
  preparer: <Package size={15} aria-hidden />,
  realiser: <Pencil size={15} aria-hidden />,
  controler: <Check size={15} aria-hidden />,
  livrer: <Truck size={15} aria-hidden />,
  livre: <Flag size={15} aria-hidden />,
};
const ICONES_COULOIR: Record<CouloirId, React.ReactNode> = {
  chantiers: <Hammer size={14} aria-hidden />,
  commandes: <ListChecks size={14} aria-hidden />,
  contenus: <Video size={14} aria-hidden />,
};
const ICONES_TUILE: Record<string, React.ReactNode> = {
  chantiers: <Hammer size={16} aria-hidden />,
  qualite: <Check size={16} aria-hidden />,
  commandes: <ListChecks size={16} aria-hidden />,
  video: <Video size={16} aria-hidden />,
};

const initiale = (nom: string): string => (nom.trim()[0] ?? '·').toUpperCase();

function Jeton({ element }: { element: Element }) {
  const sous = element.controle ? element.detail || element.controle : element.detail;
  return (
    <Link to={ROUTE_LIEN_ELEMENT[element.lien.module]} className="cr-jeton" data-alerte={element.alerte} data-mvt-survol="ligne" title={`${element.titre} · ${sous}`}>
      <div className="cr-jeton__titre">{element.controle ?? element.titre}</div>
      <div className="cr-jeton__sous">{sous}</div>
      {element.personnes.length > 0 && (
        <span className="cr-avatars" aria-hidden>
          {element.personnes.slice(0, 2).map((p) => <span key={p} className="cr-avatar">{initiale(p)}</span>)}
        </span>
      )}
      <span className="cr-jeton__barre" aria-hidden><i style={{ width: `${Math.round(element.avancement)}%` }} /></span>
    </Link>
  );
}

function CelluleVue({ cellule, poste, vide, langue }: { cellule: Cellule; poste: Poste; vide: string | null; langue: Langue }) {
  if (cellule.length === 0) return vide ? <div className="cr-vide">{vide}</div> : <div />;
  return (
    <div className="cr-cellule">
      {cellule.map((j) =>
        j.type === 'element' ? (
          <Jeton key={j.element.id} element={j.element} />
        ) : (
          <Link key={j.plusUrgent.id} to={ROUTE_LIEN_ELEMENT[j.plusUrgent.lien.module]} className="cr-jeton" data-alerte={j.plusUrgent.alerte}>
            <div className="cr-jeton__titre">{traduireLigne(langue, `ligne.groupe.${poste}` as CleCreer, { n: j.nombre })}</div>
            <div className="cr-jeton__sous">{[j.plusUrgent.titre, j.plusUrgent.detail].filter(Boolean).join(' · ')}</div>
            <span className="cr-jeton__barre" aria-hidden><i style={{ width: `${Math.round(j.plusUrgent.avancement)}%` }} /></span>
          </Link>
        ),
      )}
    </div>
  );
}

export function VueHubCreer(p: VueHubProps) {
  const { langue, tm } = useMots();
  const [filtre, setFiltre] = useState<CouloirId | 'tout'>('tout');
  const couloirs = filtrerCouloir(p.ligne, filtre);
  const nomPoste = (id: Poste) => traduireLigne(langue, `ligne.poste.${id}` as CleCreer);
  const puces = useMemo(
    () => [
      { cle: 'tout', libelle: tm('filtre.tout'), compteur: p.ligne.toutEnCours },
      ...p.ligne.couloirs.map((c) => ({ cle: c.id, libelle: tm(`filtre.${c.id}` as CleF50), compteur: c.enCours })),
    ],
    [p.ligne, tm],
  );
  const groupes: GroupeModules[] = ['fabriquer', 'livrer', 'stocker', 'montrer'];
  return (
    <div className="cr-page" data-famille="creer" data-ecran="F50">
      <PageHead
        titre={tm('titre')}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: tm('personnaliser'), onClick: p.onPersonnaliser ?? (() => undefined) }]}
        primaire={{ libelle: tm('nouveauChantier'), onClick: p.onNouveauChantier ?? (() => undefined) }}
      />
      <section className="cr-carte cr-ligne" aria-label={tm('ligne.titre')} data-mvt="entree">
        <div className="cr-ligne__tete">
          <div className="cr-ligne-titre"><h2>{tm('ligne.titre')}</h2><p>{tm('ligne.sous')}</p></div>
          <FilterChips libelle={tm('ligne.titre')} puces={puces} valeur={filtre} onChange={(c) => setFiltre(c as CouloirId | 'tout')} />
        </div>
        <div className="cr-ligne__grille cr-postes" style={{ position: 'relative' }}>
          <span className="cr-tapis" aria-hidden style={{ left: 'calc(13px + 128px + (100% - 26px - 176px) / 10)', right: 'calc(13px + (100% - 26px - 176px) / 10)' }} />
          <span />
          {p.ligne.postes.map((po) => (
            <div key={po.id} className="cr-poste" data-etat={po.enDifficulte ? 'difficulte' : po.id === 'livre' ? 'livre' : 'normal'}>
              <span className="cr-poste__noeud">{ICONES_POSTE[po.id]}</span>
              <span className="cr-poste__nom">
                {nomPoste(po.id)}
                {po.id !== 'livre' && <span className="cr-mono"> {po.compte}</span>}
                {po.enDifficulte && <span> · {traduireLigne(langue, 'ligne.reprendre', { n: po.aReprendre })}</span>}
              </span>
            </div>
          ))}
        </div>
        <div className="cr-couloirs">
          {p.ligne.arret && couloirs.every((c) => c.livres === 0) ? (
            <p className="cr-t3" style={{ padding: '24px 18px' }}>{tm('etat.arret')}</p>
          ) : (
            couloirs.map((c) => (
              <div key={c.id} className="cr-ligne__grille cr-couloir">
                <div className="cr-couloir__nom">
                  <span className="cr-couloir__icone">{ICONES_COULOIR[c.id]}</span>
                  <div><b>{tm(`filtre.${c.id}` as CleF50)}</b><small>{tm('couloir.enCours', { n: c.enCours })}</small></div>
                </div>
                {POSTES.map((po) =>
                  po === 'livre' ? (
                    <LivreVue key={po} couloir={c.id} nombre={c.livres} palier={c.id === 'commandes' ? p.palier : null} />
                  ) : (
                    <CelluleVue key={po} cellule={c.cellules[po]} poste={po} langue={langue} vide={po === 'controler' && c.id === 'commandes' ? tm('vide.attente') : po === 'livrer' && c.id === 'contenus' ? tm('vide.publier') : null} />
                  ),
                )}
              </div>
            ))
          )}
        </div>
        <div className="cr-ligne__pied">
          <span>{compteTexte(langue, 'ligne.aLHeure', p.aLHeure)}</span>
          {p.articlesSansCommande >= SEUIL_SUGGESTION_COMMANDE && (
            <InlineSuggestion texte={tm('suggestion', { n: p.articlesSansCommande })} libelleOui={tm('pied.preparer')} libelleNon={tm('pied.plusTard')} onOui={p.onPreparer ?? (() => undefined)} onNon={p.onPlusTard ?? (() => undefined)} />
          )}
        </div>
      </section>
      <section className="cr-carte cr-modules" aria-label={tm('modules.titre')} data-mvt="entree">
        <div className="cr-ligne-titre"><h2>{tm('modules.titre')}</h2><p>{tm('modules.sous')}</p><Link to="/tous-les-modules" className="cr-modules__lien">{tm('modules.tous')} →</Link></div>
        <div className="cr-modules__grille">
          {groupes.map((g) => (
            <ModuleGroupGrid key={g} titre={tm(`groupe.${g}` as CleF50)} effectif={undefined} colonnes={1}>
              {p.tuiles.filter((t) => t.groupe === g).map((t) => (
                <ModuleTile
                  key={t.id}
                  nom={tm(`tuile.${t.id}` as CleF50)}
                  icone={ICONES_TUILE[t.id] ?? <Boxes size={16} aria-hidden />}
                  famille="creer"
                  sousTexte={t.actif ? t.mesure ?? tm('mesure.nonDisponible') : traduireLigne(langue, 'ligne.nonActive')}
                  accessoire={t.compte ? <CountBadge n={t.compte} /> : undefined}
                  vers={ROUTES_MODULES[t.id]}
                  className={t.ton ? `cr-tuile--${t.ton}` : undefined}
                />
              ))}
            </ModuleGroupGrid>
          ))}
        </div>
      </section>
    </div>
  );
}

function LivreVue({ couloir, nombre, palier }: { couloir: CouloirId; nombre: number; palier: VueHubProps['palier'] }) {
  const { tm, langue } = useMots();
  const cle = `livre.${couloir}` as 'livre.chantiers' | 'livre.commandes' | 'livre.contenus';
  const titre = nombre >= 2 || langue === 'en' ? tm(`${cle}.n` as CleF50, { n: nombre }) : tm(`${cle}.1` as CleF50, { n: nombre });
  const sous = couloir === 'commandes' && palier ? (palier.atteint ? tm('livre.commandes.sousAtteint', { palier: palier.palier }) : tm('livre.commandes.sous', { palier: palier.palier, restant: palier.restant })) : tm(`${cle}.sous` as CleF50);
  return (
    <div className="cr-livre" data-palier={couloir === 'commandes' && !!palier}><b>{titre}</b><small>{sous}</small></div>
  );
}
