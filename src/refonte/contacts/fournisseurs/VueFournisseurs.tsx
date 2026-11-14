import React, { useState } from 'react';
import { AlertCircle, Check, List, Package, Plus, ShoppingCart, Truck } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { AnneauProgression } from '../../../socle/ui/Indicateurs';
import { Segmente, SuggestionAjmani } from '../../../socle/ui/controles';
import { BlocEtat } from '../../../socle/ui/situations';
import { euros } from '../commun';
import type { Besoin, ColonneFournisseur, Critere, ModeleFournisseurs, Urgence } from './modele';
import { useMotsFournisseurs } from './i18n';
import './fournisseurs.css';
import '../cibles.css';

/**
 * « FOURNISSEURS » (H45) — la matrice « Comparer pour un besoin » : mise en page et états, sans accès aux données.
 *
 * Disposition (fiche H45, zone principale de 1108 px) : en-tête (titre, la recommandation en une phrase, « Tous les
 * fournisseurs », primaire « Nouveau besoin »), matrice de 1108 × 482 (colonne des critères de 236 px, colonnes de 209 px),
 * puis « Commandes en cours » (752 × 168) à côté de la suggestion d'Ajmani (340 × 168), écart 16.
 */
export interface ActionsFournisseurs {
  tous: () => void;
  choisirBesoin: (b: Besoin | null) => void;
  urgence: (u: Urgence) => void;
  commander: (fournisseurId: string) => void;
  demanderDevis: (fournisseurId: string) => void;
  preparerDemande: () => void;
  plusTard: () => void;
  reessayer: () => void;
}

export interface VueFournisseursProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleFournisseurs;
  actions: ActionsFournisseurs;
  lecture?: boolean;
  /** Ouvre le panneau « Nouveau besoin » au départ (l'aperçu et les tests). */
  panneauOuvert?: boolean;
}

const TON = (score: number | null) => (score == null ? 'neutre' : score >= 85 ? 'succes' : score >= 70 ? 'neutre' : 'attention') as 'succes' | 'neutre' | 'attention';

export function VueFournisseurs({ statut, horsLigne = false, modele, actions, lecture = false, panneauOuvert = false }: VueFournisseursProps) {
  const { tm, langue } = useMotsFournisseurs();
  const [panneau, setPanneau] = useState(panneauOuvert);
  const m = modele;
  const rec = m.recommande;
  const sous = !m.disponible ? tm('sousTitre.indisponible')
    : !m.besoin || !rec ? tm('sousTitre.aucun')
    : rec.egalite ? tm('sousTitre.egalite', { article: m.besoin.article, a: m.colonnes.filter((c) => c.recommande)[0]?.nom ?? '', b: m.colonnes.filter((c) => c.recommande)[1]?.nom ?? '' })
    : `${tm('sousTitre.emporte', { article: m.besoin.article, nom: rec.nom, livraison: jourLong(rec.livraison, langue), qualite: rec.qualite ?? 0 })}${rec.meilleurs.prix ? tm('sousTitre.emporte.prix') : ''}`;

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sous}
        secondaires={[{ libelle: tm('action.tous'), onClick: actions.tous, icone: <List size={14} strokeWidth={2} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.besoin'), onClick: () => setPanneau(true), icone: <Plus size={14} strokeWidth={2.2} /> }}
        className="sc-fo__entete"
      />
      {horsLigne && <p className="sc-fo__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-fo" aria-busy={statut === 'chargement' || undefined}>
          {panneau && <PanneauBesoin modele={m} onFermer={() => setPanneau(false)} onComparer={(b) => { actions.choisirBesoin(b); setPanneau(false); }} />}
          <section className="sc-fo-carte sc-fo-matrice" aria-label={tm('matrice.titre')}>
            <div className="sc-fo-matrice__tete">
              <h2 className="sc-fo-carte__titre">{tm('matrice.titre')}</h2>
              {m.besoin && (
                <>
                  <span className="sc-fo-besoin"><Package size={14} strokeWidth={1.9} aria-hidden /><strong>{m.besoin.quantite} × {m.besoin.article}</strong></span>
                  {m.besoins.filter((b) => b.article !== m.besoin?.article).slice(0, 2).map((b) => (
                    <button key={b.article} type="button" className="sc-fo-puce" onClick={() => actions.choisirBesoin(b)}>{b.article}</button>
                  ))}
                  <span className="sc-fo-matrice__urgence"><Segmente
                    libelle={tm('actions.urgence.libelle')}
                    taille="compact"
                    valeur={m.besoin.urgence}
                    onChange={(v) => actions.urgence(v as Urgence)}
                    options={[{ cle: 'depannage', libelle: tm('actions.depannage') }, { cle: 'planifie', libelle: tm('actions.planifie') }]}
                  /></span>
                  <span className="sc-fo-matrice__compte sc-nombre">{tm(m.colonnes.length === 1 ? 'matrice.compte.1' : 'matrice.compte.n', { n: m.colonnes.length, total: m.total })}</span>
                </>
              )}
            </div>
            {!m.disponible ? (
              <div className="sc-fo-matrice__etat"><BlocEtat icone={<Truck size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.indisponible.titre')} texte={tm('etat.indisponible.texte')} actions={<Bouton variante="secondaire" onClick={actions.tous}>{tm('action.tous')}</Bouton>} /></div>
            ) : !m.besoin || m.colonnes.length === 0 ? (
              <div className="sc-fo-matrice__etat"><BlocEtat icone={<ShoppingCart size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.aucun.titre')} texte={tm('etat.aucun.texte')} actions={lecture ? <span /> : <Bouton variante="primaire" onClick={() => setPanneau(true)}>{tm('action.besoin')}</Bouton>} /></div>
            ) : (
              <Matrice m={m} actions={actions} lecture={lecture} />
            )}
          </section>
          <div className="sc-fo-bas">
            <Commandes m={m} />
            <Suggestion m={m} actions={actions} />
          </div>
        </div>
      )}
    </Page>
  );
}

function jourLong(jour: string, langue: 'fr' | 'en'): string {
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${jour}T12:00:00Z`));
}
function jourCourt(jour: string, langue: 'fr' | 'en'): string {
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${jour}T12:00:00Z`));
}
function jourMois(jour: string, langue: 'fr' | 'en'): string {
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${jour}T12:00:00Z`));
}

const LIGNES: { cle: 'prix' | 'total' | 'delai' | 'qualite' | 'garantie' | 'depense'; poids: Critere | null }[] = [
  { cle: 'prix', poids: 'prix' }, { cle: 'total', poids: null }, { cle: 'delai', poids: 'delai' }, { cle: 'qualite', poids: 'qualite' }, { cle: 'garantie', poids: 'garantie' }, { cle: 'depense', poids: null },
];

function Matrice({ m, actions, lecture }: { m: ModeleFournisseurs; actions: ActionsFournisseurs; lecture: boolean }) {
  const { tm, langue } = useMotsFournisseurs();
  const cols = m.colonnes;
  const plusBas = Math.min(...cols.filter((c) => c.prixCents != null).map((c) => c.prixCents as number));
  const urgence = m.besoin?.urgence ?? 'depannage';
  return (
    <div className="sc-fo-grille" style={{ gridTemplateColumns: `236px repeat(${cols.length}, minmax(0, 1fr))` }} role="table" aria-label={tm('matrice.titre')}>
      <div className="sc-fo-cellule sc-fo-cellule--tete sc-fo-critere-titre" role="columnheader">{tm('matrice.critere')}</div>
      {cols.map((c) => (
        <div key={c.id} className="sc-fo-cellule sc-fo-cellule--tete" role="columnheader" data-recommande={c.recommande ? '' : undefined}>
          {c.recommande && <span className="sc-fo-recommande"><span aria-hidden />{tm(c.egalite ? 'matrice.egalite' : 'matrice.recommande')}</span>}
          <span className="sc-fo-fournisseur"><span className="sc-fo-fournisseur__nom">{c.nom}</span><span className="sc-fo-fournisseur__cat">{c.categorie}</span></span>
          <AnneauProgression valeur={(c.score ?? 0) / 100} libelle={tm('matrice.score', { n: c.score ?? 0 })} ton={TON(c.score)} taille={42} epaisseur={4} piste="anneau">
            <span className="sc-nombre sc-fo-score">{c.score ?? '—'}</span>
          </AnneauProgression>
        </div>
      ))}
      {LIGNES.map((l) => (
        <React.Fragment key={l.cle}>
          <div className="sc-fo-cellule sc-fo-critere" role="rowheader">
            <span className="sc-fo-critere__nom">{l.cle === 'total' ? tm('critere.total', { n: m.besoin?.quantite ?? 0 }) : tm(`critere.${l.cle}` as 'critere.prix')}</span>
            {l.poids && m.poids[l.poids] > 0 ? <PoidsBarre poids={m.poids[l.poids]} /> : l.poids ? <span className="sc-fo-critere__aide">{tm('critere.ignore')}</span> : <span className="sc-fo-critere__aide">{tm('critere.information')}</span>}
          </div>
          {cols.map((c) => <Cellule key={`${l.cle}-${c.id}`} ligne={l.cle} c={c} plusBas={plusBas} langue={langue} />)}
        </React.Fragment>
      ))}
      <div className="sc-fo-cellule sc-fo-actions-texte" role="cell">
        <span>{tm(`actions.urgence.${urgence}` as 'actions.urgence.depannage')}</span>
      </div>
      {cols.map((c) => (
        <div key={`a-${c.id}`} className="sc-fo-cellule sc-fo-cellule--action" role="cell" data-recommande={c.recommande ? '' : undefined}>
          {c.recommande ? (
            <Bouton variante="primaire" taille="petit" icone={<Check size={13} strokeWidth={2.4} />} onClick={() => actions.commander(c.id)} disabled={lecture}>{tm('actions.commander')}</Bouton>
          ) : (
            <Bouton variante="secondaire" taille="petit" onClick={() => actions.demanderDevis(c.id)}>{tm('actions.devis')}</Bouton>
          )}
        </div>
      ))}
    </div>
  );
}

function PoidsBarre({ poids }: { poids: number }) {
  const { tm } = useMotsFournisseurs();
  return <span className="sc-fo-poids"><span className="sc-fo-poids__barre" aria-hidden><span style={{ width: `${Math.min(100, (poids / 35) * 100)}%` }} /></span><span className="sc-nombre">{tm('critere.poids', { n: poids })}</span></span>;
}

function Cellule({ ligne, c, plusBas, langue }: { ligne: (typeof LIGNES)[number]['cle']; c: ColonneFournisseur; plusBas: number; langue: 'fr' | 'en' }) {
  const { tm } = useMotsFournisseurs();
  const attr = c.recommande ? '' : undefined;
  const coche = <Check size={13} strokeWidth={2.6} className="sc-fo-coche" aria-label={tm('cellule.meilleure')} />;
  if (ligne === 'prix' || ligne === 'total') {
    const v = ligne === 'prix' ? c.prixCents : c.totalCents;
    const meilleur = ligne === 'prix' ? c.meilleurs.prix : c.meilleurs.total;
    return (
      <div className="sc-fo-cellule" role="cell" data-recommande={attr} data-meilleur={meilleur ? '' : undefined}>
        {v == null ? <span className="sc-fo-cellule__vide">{tm('critere.sansDonnee')}</span> : <span className="sc-fo-cellule__valeur sc-nombre">{euros(v, langue)}{meilleur && coche}</span>}
        {ligne === 'prix' && c.prixCents != null && <Jauge part={plusBas / c.prixCents} fort={meilleur} />}
      </div>
    );
  }
  if (ligne === 'delai') {
    return (
      <div className="sc-fo-cellule" role="cell" data-recommande={attr} data-meilleur={c.meilleurs.delai ? '' : undefined}>
        <span className="sc-fo-cellule__valeur sc-nombre">{tm(c.delaiJours === 1 ? 'cellule.jour.1' : 'cellule.jour.n', { n: c.delaiJours })}{c.meilleurs.delai && coche}<span className="sc-fo-cellule__sous">{jourCourt(c.livraison, langue)}</span></span>
        <Jauge part={(c.notes.delai ?? 0) / 100} fort={c.meilleurs.delai} />
      </div>
    );
  }
  if (ligne === 'qualite') {
    return (
      <div className="sc-fo-cellule" role="cell" data-recommande={attr} data-meilleur={c.meilleurs.qualite ? '' : undefined}>
        {c.qualite == null ? <span className="sc-fo-cellule__vide">{tm('critere.sansDonnee')}</span> : <span className="sc-fo-cellule__valeur sc-nombre">{c.qualite}{c.meilleurs.qualite && coche}<span className="sc-fo-cellule__sous">{tm('cellule.sur100')}</span></span>}
        {c.qualite != null && <Jauge part={c.qualite / 100} fort={c.meilleurs.qualite} />}
      </div>
    );
  }
  if (ligne === 'garantie') return <div className="sc-fo-cellule" role="cell" data-recommande={attr}><span className="sc-fo-cellule__vide">{tm('critere.sansDonnee')}</span></div>;
  return (
    <div className="sc-fo-cellule" role="cell" data-recommande={attr}>
      <span className="sc-fo-cellule__valeur sc-nombre">{euros(c.depense12mCents, langue)}<span className="sc-fo-cellule__sous">{tm('cellule.mois12')}</span></span>
    </div>
  );
}

const Jauge = ({ part, fort }: { part: number; fort: boolean }) => <span className="sc-fo-jauge" data-fort={fort ? '' : undefined} aria-hidden><span style={{ width: `${Math.round(Math.max(0, Math.min(1, part)) * 100)}%` }} /></span>;

function Commandes({ m }: { m: ModeleFournisseurs }) {
  const { tm, langue } = useMotsFournisseurs();
  const c = m.commandes;
  return (
    <section className="sc-fo-carte sc-fo-commandes" aria-label={tm('commandes.titre')}>
      <div className="sc-fo-commandes__tete">
        <h2 className="sc-fo-carte__titre">{tm('commandes.titre')}</h2>
        <span className="sc-fo-commandes__legende">{tm('commandes.etapes')}</span>
        {c.liste.length > 0 && <span className="sc-fo-commandes__delais sc-nombre" data-retard={c.dansLesDelais < c.liste.length ? '' : undefined}>{tm('commandes.delais', { n: c.dansLesDelais, m: c.liste.length })}</span>}
      </div>
      {c.liste.length === 0 ? (
        <p className="sc-fo-vide">{m.disponible ? tm('commandes.vide') : tm('etat.indisponible.titre')}</p>
      ) : (
        <ul className="sc-fo-commandes__liste">
          {c.liste.map((o) => (
            <li key={o.id} className="sc-fo-commande">
              <span className="sc-fo-commande__sq" aria-hidden>{o.fournisseur.charAt(0)}</span>
              <span className="sc-fo-commande__texte"><span className="sc-fo-commande__nom">{o.fournisseur}</span><span className="sc-fo-commande__objet">{o.objet}</span></span>
              <span className="sc-fo-piste" role="img" aria-label={tm('commandes.piste', { objet: o.objet, fournisseur: o.fournisseur, etat: o.retardJours > 0 ? tm(o.retardJours === 1 ? 'commandes.retard.1' : 'commandes.retard.n', { n: o.retardJours }) : tm('commandes.attendue', { jour: jourMois(o.attendueLe, langue) }) })}>
                {[0, 1, 2, 3].map((i) => <span key={i} className="sc-fo-piste__etape" data-actuelle={i === 0 ? '' : undefined} data-retard={i === 0 && o.retardJours > 0 ? '' : undefined} />)}
              </span>
              <span className="sc-fo-commande__etat" data-retard={o.retardJours > 0 ? '' : undefined}>{o.retardJours > 0 ? tm(o.retardJours === 1 ? 'commandes.retard.1' : 'commandes.retard.n', { n: o.retardJours }) : tm('commandes.attendue', { jour: jourMois(o.attendueLe, langue) })}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Suggestion({ m, actions }: { m: ModeleFournisseurs; actions: ActionsFournisseurs }) {
  const { tm, langue } = useMotsFournisseurs();
  const r = m.renegocier;
  if (!r) {
    return (
      <section className="sc-fo-suggestion" aria-label={tm('suggestion.astuce.titre')}>
        <div className="sc-fo-astuce"><span className="sc-fo-astuce__titre">{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
      </section>
    );
  }
  const texte = r.derniereNegociation
    ? tm('suggestion.texte.date', { montant: euros(r.depenseCents, langue), jour: new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${r.derniereNegociation}T12:00:00Z`)) })
    : tm('suggestion.texte.jamais', { montant: euros(r.depenseCents, langue) });
  return (
    <section className="sc-fo-suggestion" aria-label={tm('suggestion.titre')}>
      <SuggestionAjmani
        titre={tm('suggestion.renegocier', { nom: r.fournisseur })}
        texte={texte}
        primaire={{ libelle: tm('suggestion.preparer'), onClick: actions.preparerDemande }}
        secondaire={{ libelle: tm('suggestion.plusTard'), onClick: actions.plusTard }}
      />
    </section>
  );
}

function PanneauBesoin({ modele, onFermer, onComparer }: { modele: ModeleFournisseurs; onFermer: () => void; onComparer: (b: Besoin) => void }) {
  const { tm } = useMotsFournisseurs();
  const [article, setArticle] = useState(modele.besoin?.article ?? '');
  const [quantite, setQuantite] = useState(modele.besoin?.quantite ?? 1);
  return (
    <form className="sc-fo-panneau" onSubmit={(e) => { e.preventDefault(); if (article.trim()) onComparer({ article: article.trim(), quantite: Math.max(1, Math.round(quantite)), urgence: modele.besoin?.urgence ?? 'depannage' }); }}>
      <h2 className="sc-fo-carte__titre">{tm('besoin.titre')}</h2>
      <label>{tm('besoin.article')}<input list="sc-fo-articles" value={article} onChange={(e) => setArticle(e.target.value)} required /></label>
      <datalist id="sc-fo-articles">{modele.besoins.map((b) => <option key={b.article} value={b.article} />)}</datalist>
      <label>{tm('besoin.quantite')}<input type="number" min={1} value={quantite} onChange={(e) => setQuantite(Number(e.target.value))} /></label>
      <Bouton variante="primaire" taille="petit" type="submit">{tm('besoin.comparer')}</Bouton>
      <Bouton variante="discret" taille="petit" type="button" onClick={onFermer}>{tm('besoin.annuler')}</Bouton>
    </form>
  );
}
