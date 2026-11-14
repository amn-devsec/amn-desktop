import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Plus, Users } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead, Tableau, type ColonneTableau } from '../../../socle/ui/archetypes';
import { Segmente } from '../../../socle/ui/controles';
import { PastilleEtat } from '../../../socle/ui/Pastilles';
import { BlocEtat } from '../../../socle/ui/situations';
import { FilterChips } from '../../../socle/ui/vivant';
import { euros } from '../commun';
import { AppelsSemaine } from './AppelsSemaine';
import { NuageProspects } from './NuageProspects';
import { PeekProspect } from './PeekProspect';
import { filtrerPoints, listeParInteret, type FiltreProspects, type ModeleProspects, type PointProspect } from './modele';
import { useMotsProspects } from './i18n';
import './prospects.css';
import '../cibles.css';

/**
 * « PROSPECTS » (H06) — le nuage intérêt × montant : mise en page et états, sans accès aux données.
 *
 * Disposition (fiche H06, zone principale de 1108 px) : en-tête (titre, sous-titre, « Nuage / Colonnes / Liste », primaire
 * « Nouveau prospect »), surface « Nuage des prospects » de 772 × 664 à gauche, et à droite « Prospect survolé »
 * (320 × 397) au-dessus de « Appels de la semaine » (320 × 253), écart 14.
 */
export type VueProspect = 'nuage' | 'colonnes' | 'liste';

export interface ActionsProspects {
  nouveau: () => void;
  changerVue: (v: VueProspect) => void;
  appeler: (id: string) => void;
  ecrire: (id: string) => void;
  ouvrir: (id: string) => void;
  cocher: (id: string, fait: boolean) => void;
  reessayer: () => void;
}

export interface VueProspectsProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleProspects;
  vue: Exclude<VueProspect, 'colonnes'>;
  /** Les prospects dont l'appel de la semaine est fait. */
  faits: ReadonlySet<string>;
  actions: ActionsProspects;
  lecture?: boolean;
  /** Le prospect survolé au départ (l'aperçu et les tests). */
  survolInitial?: string | null;
}

export const SegmentVue = ({ vue, onChange }: { vue: VueProspect; onChange: (v: VueProspect) => void }) => {
  const { tm } = useMotsProspects();
  return (
    <Segmente
      libelle={tm('vue.libelle')}
      valeur={vue}
      onChange={(c) => onChange(c as VueProspect)}
      options={[{ cle: 'nuage', libelle: tm('vue.nuage') }, { cle: 'colonnes', libelle: tm('vue.colonnes') }, { cle: 'liste', libelle: tm('vue.liste') }]}
    />
  );
};

export function VueProspects({ statut, horsLigne = false, modele, vue, faits, actions, lecture = false, survolInitial = null }: VueProspectsProps) {
  const { tm, langue } = useMotsProspects();
  const [filtre, setFiltre] = useState<FiltreProspects>('tous');
  const [survol, setSurvol] = useState<string | null>(survolInitial);
  const [fige, setFige] = useState<string | null>(null);
  const minuteur = useRef<number | null>(null);
  useEffect(() => () => { if (minuteur.current) window.clearTimeout(minuteur.current); }, []);

  const points = filtrerPoints(modele.points, filtre);
  const actifId = fige ?? survol;
  const actif = actifId ? modele.points.find((p) => p.id === actifId) ?? null : null;
  const sousTitre = tm(modele.prioritaires.n > 0 ? 'sousTitre' : 'sousTitre.aucun', { n: modele.total, montant: euros(modele.enJeuCents, langue), k: modele.prioritaires.n });

  // Un délai de 100 ms entre deux survols évite le scintillement de la fiche (fiche H06, interactions).
  const surSurvol = (id: string | null) => {
    if (minuteur.current) window.clearTimeout(minuteur.current);
    minuteur.current = window.setTimeout(() => setSurvol(id), id === null ? 0 : 100);
  };

  const colonnes: ColonneTableau<PointProspect>[] = [
    { cle: 'nom', titre: tm('liste.prospect'), largeur: 'minmax(0, 2fr)', valeur: (p) => p.nom, cellule: (p) => <span className="sc-pr-liste__nom">{p.nom}</span> },
    { cle: 'montant', titre: tm('liste.montant'), largeur: '130px', alignement: 'fin', valeur: (p) => p.montantCents, cellule: (p) => <span className="sc-nombre">{euros(p.montantCents, langue)}</span> },
    { cle: 'interet', titre: tm('liste.interet'), largeur: '110px', alignement: 'fin', valeur: (p) => p.interet, cellule: (p) => <span className="sc-nombre">{p.interet} · {tm(`peek.libelle.${p.libelle}` as const)}</span> },
    { cle: 'etape', titre: tm('liste.etape'), largeur: '140px', valeur: (p) => p.etape, cellule: (p) => <PastilleEtat etat="info">{tm(`etape.${p.etape}` as const)}</PastilleEtat> },
    { cle: 'prochaine', titre: tm('liste.prochaine'), largeur: 'minmax(0, 2fr)', cellule: (p) => p.prochaineAction || '—' },
  ];

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        secondaires={[]}
        extra={<SegmentVue vue={vue} onChange={actions.changerVue} />}
        primaire={lecture ? undefined : { libelle: tm('action.nouveau'), onClick: actions.nouveau, icone: <Plus size={14} strokeWidth={2.2} />, raccourci: 'N' }}
        className="sc-pr__entete"
      />
      {horsLigne && <p className="sc-pr__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-pr" aria-busy={statut === 'chargement' || undefined}>
          <section className="sc-pr-carte sc-pr-surface" aria-label={tm('nuage.titre')}>
            <div className="sc-pr-surface__tete">
              <h2 className="sc-pr-carte__titre">{tm('nuage.titre')}</h2>
              <FilterChips
                libelle={tm('nuage.puces')}
                puces={[
                  { cle: 'tous', libelle: tm('nuage.puce.tous'), compteur: modele.chips.tous },
                  ...(modele.chips.miens > 0 ? [{ cle: 'miens', libelle: tm('nuage.puce.miens'), compteur: modele.chips.miens }] : []),
                  { cle: 'nouveaux', libelle: tm('nuage.puce.nouveaux'), compteur: modele.chips.nouveaux },
                ]}
                valeur={filtre}
                onChange={(c) => setFiltre(c as FiltreProspects)}
              />
              <span className="sc-pr-surface__legende"><span className="sc-pr-surface__cercle sc-pr-surface__cercle--p" aria-hidden /><span className="sc-pr-surface__cercle sc-pr-surface__cercle--g" aria-hidden />{tm('nuage.legende')}</span>
            </div>
            <div className="sc-pr-surface__corps">
              {vue === 'liste' ? (
                modele.total === 0 ? <Vide onNouveau={actions.nouveau} lecture={lecture} /> : (
                  <Tableau libelle={tm('titre')} colonnes={colonnes} lignes={listeParInteret(points)} cleLigne={(p) => p.id} onOuvrir={(p) => actions.ouvrir(p.id)} vide={{ texte: tm('nuage.vide.texte'), action: null }} className="sc-pr__tableau" />
                )
              ) : (
                <>
                  {statut === 'pret' && modele.total === 0 && <div className="sc-pr-surface__vide"><Vide onNouveau={actions.nouveau} lecture={lecture} /></div>}
                  <NuageProspects modele={modele} points={points} actifId={actifId} figeId={fige} onSurvol={surSurvol} onChoisir={(id) => { setFige((cur) => (cur === id ? null : id)); setSurvol(id); }} />
                </>
              )}
            </div>
            <p className="sc-pr-surface__pied"><span>{modele.estime ? tm('nuage.pied.estime') : tm('nuage.pied')}</span></p>
          </section>
          <div className="sc-pr-droite">
            <PeekProspect point={actif} fige={fige != null} onAppeler={actions.appeler} onEcrire={actions.ecrire} onOuvrir={actions.ouvrir} />
            <AppelsSemaine modele={modele} faits={faits} onCocher={actions.cocher} lecture={lecture} />
          </div>
        </div>
      )}
    </Page>
  );
}

function Vide({ onNouveau, lecture }: { onNouveau: () => void; lecture: boolean }) {
  const { tm } = useMotsProspects();
  return <BlocEtat icone={<Users size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('nuage.vide.titre')} texte={tm('nuage.vide.texte')} actions={lecture ? <span /> : <Bouton variante="primaire" onClick={onNouveau}>{tm('action.nouveau')}</Bouton>} />;
}
