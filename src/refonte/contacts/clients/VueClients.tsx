import React from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Download, LayoutGrid, List, UserPlus, UserSearch, WifiOff } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead, Tableau, type ColonneTableau } from '../../../socle/ui/archetypes';
import { BoiteRecherche } from '../../../socle/ui/controles';
import { Avatar } from '../../../socle/ui/Pastilles';
import { BlocEtat } from '../../../socle/ui/situations';
import { FilterChips } from '../../../socle/ui/vivant';
import { formaterEuro } from '../../../socle/ui/graphiques';
import { AnneauProgression } from '../../../socle/ui/Indicateurs';
import { partsDeLaBarre, TAILLE_PAGE, type ModeleClients, type SegmentClient, type TriClient, type TuileClient } from './modele';
import { useMotsClients } from './i18n';
import { PastilleStatut, PhraseEchange, TuileClientVue, usePhraseProchaine } from './TuileClientVue';
import './clients.css';

/**
 * « CLIENTS » (H05) — la mosaïque des clients : mise en page et états, sans accès aux données.
 *
 * Disposition (fiche H05, zone principale de 1108 px) : en-tête (titre, sous-titre, « Importer » et « Nouveau client »
 * N), barre d'outils (segments avec compteurs, recherche, responsables, tri, mosaïque / liste), grille de 4 × 3 tuiles
 * de 267 × 173, bandeau « Santé du portefeuille » de 54 px avec la pagination.
 */
export interface FiltresClients {
  segment: SegmentClient;
  recherche: string;
  /** Emails des responsables retenus (vide : tout le monde). */
  responsables: ReadonlySet<string>;
  tri: TriClient;
  affichage: 'mosaique' | 'liste';
  page: number;
}

export interface ActionsClients {
  ouvrir: (id: number) => void;
  nouveau: () => void;
  /** Absent : l'application n'a pas (encore) d'import de clients, le bouton n'est pas montré. */
  importer?: () => void;
  changer: (f: Partial<FiltresClients>) => void;
  effacerFiltres: () => void;
  reessayer: () => void;
}

export interface VueClientsProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleClients;
  /** Les tuiles déjà filtrées et triées (tout le jeu : la page découpe). */
  visibles: TuileClient[];
  filtres: FiltresClients;
  actions: ActionsClients;
  prenom: string;
  salutation: 'bonjour' | 'apresMidi' | 'bonsoir';
}

const TRIS: TriClient[] = ['aTraiter', 'sante', 'nom', 'facture', 'echange'];

export function VueClients({ statut, horsLigne = false, modele, visibles, filtres, actions, prenom, salutation }: VueClientsProps) {
  const { tm } = useMotsClients();
  const phrase = usePhraseProchaine();

  const morceaux = [`${tm('sousTitre', { salut: tm(`salut.${salutation}` as const), prenom, n: modele.total })}`];
  const complements: string[] = [];
  if (modele.impayes > 0) complements.push(tm(modele.impayes === 1 ? 'sousTitre.impayes.1' : 'sousTitre.impayes.n', { n: modele.impayes }));
  if (modele.prochainRdv) complements.push(tm('sousTitre.rdv', { nom: modele.prochainRdv.client, heure: modele.prochainRdv.heure }));
  const sousTitre = morceaux[0] + (complements.length ? `, ${complements.join(', ')}` : '');

  const total = modele.total;
  const filtre = filtres.segment !== 'tous' || filtres.recherche.trim() !== '' || filtres.responsables.size > 0;
  const nbPages = Math.max(1, Math.ceil(visibles.length / TAILLE_PAGE));
  const page = Math.min(filtres.page, nbPages - 1);
  const debut = visibles.length === 0 ? 0 : page * TAILLE_PAGE + 1;
  const fin = Math.min(visibles.length, (page + 1) * TAILLE_PAGE);
  const pageCourante = visibles.slice(page * TAILLE_PAGE, (page + 1) * TAILLE_PAGE);

  const colonnes: ColonneTableau<TuileClient>[] = [
    { cle: 'nom', titre: tm('liste.client'), largeur: 'minmax(0, 2fr)', valeur: (t) => t.nom, cellule: (t) => <span className="sc-cl-liste__nom"><span className="sc-cl-liste__nom-t">{t.nom}</span><span className="sc-cl-liste__sous">{t.sousTitre}</span></span> },
    { cle: 'sante', titre: tm('liste.sante'), largeur: '90px', valeur: (t) => t.sante, cellule: (t) => <span className="sc-cl-liste__sante" data-sante={t.couleur}><AnneauProgression valeur={t.sante / 100} libelle={tm('carte.sante', { n: t.sante })} ton={t.couleur === 'vert' ? 'succes' : t.couleur === 'orange' ? 'attention' : 'critique'} taille={28} epaisseur={3} piste="anneau" anime={false} /> <span className="sc-nombre">{t.sante}</span></span> },
    { cle: 'facture', titre: tm('liste.facture'), largeur: '120px', alignement: 'fin', valeur: (t) => t.factureCents, cellule: (t) => <span className="sc-nombre">{formaterEuro(t.factureCents / 100)}</span> },
    { cle: 'echange', titre: tm('liste.echange'), largeur: 'minmax(0, 1.2fr)', valeur: (t) => t.dernierEchangeAt, cellule: (t) => <span className="sc-cl-liste__echange">{t.responsable && <Avatar nom={t.responsable.nom} taille={20} />}<PhraseEchange t={t} /></span> },
    { cle: 'statut', titre: tm('liste.statut'), largeur: '130px', valeur: (t) => t.statut, cellule: (t) => <PastilleStatut t={t} /> },
    { cle: 'prochaine', titre: tm('liste.prochaine'), largeur: 'minmax(0, 1.6fr)', cellule: (t) => phrase(t) },
  ];

  return (
    <Page>
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        secondaires={actions.importer ? [{ libelle: tm('action.importer'), onClick: actions.importer, icone: <Download size={14} strokeWidth={2} /> }] : []}
        primaire={{ libelle: tm('action.nouveau'), onClick: actions.nouveau, icone: <UserPlus size={14} strokeWidth={2} />, raccourci: 'N' }}
        className="sc-cl__entete"
      />
      {horsLigne && (
        <p className="sc-cl__hors-ligne" role="status"><WifiOff size={14} strokeWidth={2} aria-hidden /> {tm('etat.horsLigne')}</p>
      )}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : statut === 'chargement' ? (
        <div className="sc-cl__grille" aria-busy="true" aria-label={tm('etat.chargement')}>
          {Array.from({ length: TAILLE_PAGE }, (_, i) => <div key={i} className="sc-cl-tuile sc-cl-tuile--squelette" aria-hidden />)}
        </div>
      ) : total === 0 ? (
        <BlocEtat
          icone={<UserPlus size={20} strokeWidth={1.7} />}
          ton="neutre"
          titre={tm('etat.vide.titre')}
          texte={tm('etat.vide.texte')}
          actions={<><Bouton variante="primaire" onClick={actions.nouveau}>{tm('action.nouveau')}</Bouton>{actions.importer && <Bouton variante="secondaire" onClick={actions.importer}>{tm('action.importer')}</Bouton>}</>}
        />
      ) : (
        <>
          <div className="sc-cl__outils">
            <FilterChips
              libelle={tm('segment.libelle')}
              puces={[
                { cle: 'tous', libelle: tm('segment.tous'), compteur: modele.segments.tous },
                { cle: 'actifs', libelle: tm('segment.actifs'), compteur: modele.segments.actifs },
                { cle: 'aRelancer', libelle: tm('segment.aRelancer'), compteur: modele.segments.aRelancer },
                { cle: 'impayes', libelle: tm('segment.impayes'), compteur: modele.segments.impayes },
              ]}
              valeur={filtres.segment}
              onChange={(c) => actions.changer({ segment: c as SegmentClient, page: 0 })}
              className="sc-cl__segments"
            />
            <BoiteRecherche
              valeur={filtres.recherche}
              onChange={(v) => actions.changer({ recherche: v, page: 0 })}
              libelle={tm('recherche.libelle')}
              placeholder={tm('recherche.placeholder')}
              className="sc-cl__recherche"
            />
            {modele.responsables.length > 0 && (
              <div className="sc-cl__responsables" role="group" aria-label={tm('responsable.libelle')}>
                <span className="sc-cl__responsables-t">{tm('responsable.libelle')}</span>
                {modele.responsables.map((r) => {
                  const actif = filtres.responsables.has(r.email);
                  return (
                    <button
                      key={r.email}
                      type="button"
                      className="sc-cl__resp"
                      aria-pressed={actif}
                      aria-label={r.nom}
                      title={r.nom}
                      onClick={() => {
                        const suite = new Set(filtres.responsables);
                        if (actif) suite.delete(r.email); else suite.add(r.email);
                        actions.changer({ responsables: suite, page: 0 });
                      }}
                    >
                      <Avatar nom={r.nom} taille={26} />
                    </button>
                  );
                })}
              </div>
            )}
            <select className="sc-cl__tri" aria-label={tm('tri.libelle')} value={filtres.tri} onChange={(e) => actions.changer({ tri: e.target.value as TriClient, page: 0 })}>
              {TRIS.map((t) => <option key={t} value={t}>{tm(`tri.${t}` as const)}</option>)}
            </select>
            <div role="radiogroup" aria-label={tm('affichage.libelle')} className="sc-cl__affichage">
              {([['mosaique', LayoutGrid], ['liste', List]] as const).map(([cle, Icone]) => (
                <button
                  key={cle}
                  type="button"
                  role="radio"
                  aria-checked={filtres.affichage === cle}
                  aria-label={tm(`affichage.${cle}` as const)}
                  title={tm(`affichage.${cle}` as const)}
                  onClick={() => actions.changer({ affichage: cle })}
                >
                  <Icone size={15} strokeWidth={2} aria-hidden />
                </button>
              ))}
            </div>
          </div>

          {visibles.length === 0 ? (
            <BlocEtat
              icone={<UserSearch size={20} strokeWidth={1.7} />}
              ton="neutre"
              titre={tm('etat.aucun.titre')}
              texte={tm('etat.aucun.texte')}
              actions={filtre ? <Bouton variante="secondaire" onClick={actions.effacerFiltres}>{tm('etat.aucun.effacer')}</Bouton> : undefined}
            />
          ) : filtres.affichage === 'liste' ? (
            <Tableau
              libelle={tm('titre')}
              colonnes={colonnes}
              lignes={pageCourante}
              cleLigne={(t) => String(t.id)}
              onOuvrir={(t) => actions.ouvrir(t.id)}
              vide={{ texte: tm('etat.aucun.texte'), action: null }}
              className="sc-cl__tableau"
            />
          ) : (
            <div className="sc-cl__grille" role="list">
              {pageCourante.map((t) => (
                <div role="listitem" key={t.id} className="sc-cl__cellule"><TuileClientVue t={t} onOuvrir={actions.ouvrir} /></div>
              ))}
            </div>
          )}

          <Portefeuille modele={modele} debut={debut} fin={fin} total={visibles.length} page={page} nbPages={nbPages} onPage={(p) => actions.changer({ page: p })} />
        </>
      )}
    </Page>
  );
}

function Portefeuille({ modele, debut, fin, total, page, nbPages, onPage }: { modele: ModeleClients; debut: number; fin: number; total: number; page: number; nbPages: number; onPage: (p: number) => void }) {
  const { tm } = useMotsClients();
  const p = modele.portefeuille;
  const parts = partsDeLaBarre(p);
  const avance = modele.payesEnAvance;
  return (
    <section className="sc-cl-portefeuille" aria-label={tm('portefeuille.titre')}>
      <div className="sc-cl-portefeuille__bloc">
        <span className="sc-cl-portefeuille__titre">{tm('portefeuille.titre')}</span>
        <div
          className="sc-cl-portefeuille__barre"
          role="img"
          aria-label={tm('portefeuille.graphique', { bonne: p.bonne, aSurveiller: p.aSurveiller, fragile: p.fragile })}
        >
          <span data-sante="vert" style={{ flexGrow: parts.bonne }} />
          <span data-sante="orange" style={{ flexGrow: parts.aSurveiller }} />
          <span data-sante="rouge" style={{ flexGrow: parts.fragile }} />
        </div>
        <ul className="sc-cl-portefeuille__legende">
          <li data-sante="vert"><span className="sc-nombre">{tm('portefeuille.bonne', { n: p.bonne })}</span></li>
          <li data-sante="orange"><span className="sc-nombre">{tm('portefeuille.aSurveiller', { n: p.aSurveiller })}</span></li>
          <li data-sante="rouge"><span className="sc-nombre">{tm('portefeuille.fragile', { n: p.fragile })}</span></li>
        </ul>
      </div>
      <span className="sc-cl-portefeuille__avance">{avance === 0 ? tm('portefeuille.avance.aucun') : tm(avance === 1 ? 'portefeuille.avance.1' : 'portefeuille.avance.n', { n: avance })}</span>
      <nav className="sc-cl-portefeuille__pages" aria-label={tm('pagination.position', { debut, fin, total })}>
        <span className="sc-nombre">{tm('pagination.position', { debut, fin, total })}</span>
        <button type="button" className="sc-cl-portefeuille__fleche" aria-label={tm('pagination.precedent')} disabled={page <= 0} onClick={() => onPage(page - 1)}><ChevronLeft size={16} strokeWidth={2} /></button>
        <button type="button" className="sc-cl-portefeuille__fleche" aria-label={tm('pagination.suivant')} disabled={page >= nbPages - 1} onClick={() => onPage(page + 1)}><ChevronRight size={16} strokeWidth={2} /></button>
      </nav>
    </section>
  );
}
