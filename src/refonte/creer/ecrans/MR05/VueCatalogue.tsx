import React, { useState } from 'react';
import { Eye, Package, Pencil, Plus, Search, Star, X } from 'lucide-react';
import { PageHead, SuggestionAjmani } from '../../../../socle/ui';
import { FilterChips } from '../../../../socle/ui/vivant';
import { formaterEuro } from '../../commun';
import { fichesCompletes, jaugeDuStock, margeDuProduit, ordreDeLaMosaique, prixTtcCents, tonDuStock, type ProduitEntree } from '../../catalogue';
import { useMots } from './textes';

export interface ProduitVue extends ProduitEntree { reference?: string; fournisseur?: string; contenu?: string[]; ventes?: number[] }
export interface VueCatalogueProps {
  produits: ProduitVue[];
  vedette: { produitId: string; vendus: number } | null;
  choisiId: string | null;
  onChoisir: (id: string | null) => void;
  droitPrixAchat: boolean;
  suggestion?: { titre: string; texte: string };
  onNouveau?: () => void;
  onImporter?: () => void;
  onCommander?: () => void;
  onPlusTard?: () => void;
}

const TON_COULEUR = { rouge: 'var(--socle-etat-critique)', orange: 'var(--socle-etat-attention)', vert: 'var(--socle-etat-succes)', bleu: 'var(--socle-etat-info)' } as const;
const FILTRES = ['tout', 'equipement', 'services', 'abonnements'] as const;
type Filtre = (typeof FILTRES)[number];

function Stock({ p }: { p: ProduitVue }) {
  const { tm } = useMots();
  const ton = tonDuStock(p);
  return <small className="cr-stock-ligne" style={{ ['--ton' as string]: TON_COULEUR[ton] }}><i />{p.type === 'produit en stock' ? tm('stock', { n: p.quantite ?? 0 }) : tm('service')}</small>;
}

export function VueCatalogue(p: VueCatalogueProps) {
  const { tm } = useMots();
  const [filtre, setFiltre] = useState<Filtre>('tout');
  const [q, setQ] = useState('');
  const actifs = p.produits.filter((x) => x.etat === 'actif');
  const compte = (f: Filtre) => actifs.filter((x) => (f === 'tout' ? true : f === 'equipement' ? x.type === 'produit en stock' : f === 'services' ? x.type === 'service' : x.type === 'abonnement')).length;
  const liste = ordreDeLaMosaique(actifs, p.vedette?.produitId ?? null).filter((x) => (filtre === 'tout' ? true : filtre === 'equipement' ? x.type === 'produit en stock' : filtre === 'services' ? x.type === 'service' : x.type === 'abonnement')).filter((x) => !q || x.nom.toLowerCase().includes(q.toLowerCase()));
  const fc = fichesCompletes(p.produits);
  const choisi = p.produits.find((x) => x.id === p.choisiId) ?? null;
  const prix = (x: ProduitEntree) => (x.prixHtCents > 0 ? `${formaterEuro(x.prixHtCents / 100)} ${x.type === 'abonnement' ? '/ an' : 'HT'}` : tm('nonDisponible'));
  const nomVedette = p.vedette ? p.produits.find((x) => x.id === p.vedette?.produitId)?.nom : null;
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR05">
      <PageHead
        titre={tm('titre')}
        sousTitre={nomVedette ? `${tm('sous')} · ${tm('sous.vedette', { nom: nomVedette })}` : tm('sous')}
        secondaires={[{ libelle: tm('importer'), onClick: p.onImporter ?? (() => undefined) }]}
        primaire={{ libelle: tm('nouveau'), onClick: p.onNouveau ?? (() => undefined) }}
      />
      <div className="cr-materiel-barre">
        <FilterChips libelle={tm('titre')} valeur={filtre} onChange={(c) => setFiltre(c as Filtre)} puces={FILTRES.map((f) => ({ cle: f, libelle: tm(`puce.${f}` as 'puce.tout'), compteur: compte(f) }))} />
        <label className="cr-recherche"><Search size={14} aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tm('chercher')} aria-label={tm('chercher')} /></label>
        <span className="cr-parc"><i className="cr-anneau-mini" style={{ ['--pct' as string]: fc.total ? (fc.completes / fc.total) * 100 : 0 }} />{tm('complet', { a: fc.completes, b: fc.total })}</span>
      </div>
      <div className="cr-catalogue" data-ouvert={!!choisi}>
        {actifs.length === 0 ? <section className="cr-carte" style={{ padding: 32 }}><h2 style={{ margin: 0 }}>{tm('vide.titre')}</h2><p className="cr-t3">{tm('vide.texte')}</p></section> : (
          <div className="cr-mosaique">
            {liste.map((x) => {
              const grande = x.id === p.vedette?.produitId;
              return (
                <button key={x.id} type="button" className="cr-tuile-produit sc-focus" data-grande={grande} data-choisi={x.id === p.choisiId} onClick={() => p.onChoisir(x.id === p.choisiId ? null : x.id)} data-mvt="entree">
                  {grande && p.vedette && <span className="cr-vedette"><Star size={11} aria-hidden /> {tm('vedette', { n: p.vedette.vendus })}</span>}
                  <span className="cr-tuile-produit__photo" aria-hidden><Package size={grande ? 56 : 34} strokeWidth={1.2} /></span>
                  <span className="cr-tuile-produit__pied">
                    <b title={x.nom}>{x.nomCourt ?? x.nom}</b>
                    <span className="cr-mono">{prix(x)}</span>
                    <Stock p={x} />
                  </span>
                </button>
              );
            })}
            <button type="button" className="cr-tuile-produit cr-tuile-produit--ajout sc-focus" onClick={p.onNouveau}><Plus size={16} aria-hidden /><small>{tm('nouveauTuile')}</small></button>
          </div>
        )}
        {choisi && (
          <aside className="cr-carte cr-fiche-produit" aria-label={choisi.nom} data-mvt="entree">
            <header><small>{tm('fiche.titre')}</small>
              <span>
                <button type="button" aria-label={tm('fiche.modifier')}><Pencil size={13} aria-hidden /></button>
                <button type="button" aria-label={tm('fiche.voir')}><Eye size={13} aria-hidden /></button>
                <button type="button" aria-label={tm('fiche.fermer')} onClick={() => p.onChoisir(null)}><X size={13} aria-hidden /></button>
              </span>
            </header>
            <div className="cr-fiche-produit__photo" aria-hidden><Package size={64} strokeWidth={1.1} /></div>
            <h2>{choisi.nom}</h2>
            <p className="cr-t3">{[choisi.type === 'produit en stock' ? 'Équipement' : choisi.type === 'service' ? 'Service' : 'Abonnement', choisi.reference ? `réf. ${choisi.reference}` : null, choisi.fournisseur].filter(Boolean).join(' · ')}</p>
            <p className="cr-fiche-produit__prix"><b className="cr-mono">{prix(choisi)}</b>{choisi.prixHtCents > 0 && <small className="cr-mono">{tm('fiche.ttc', { prix: formaterEuro(prixTtcCents(choisi.prixHtCents, choisi.tvaPct) / 100) })}</small>}{tonDuStock(choisi) === 'rouge' && choisi.type === 'produit en stock' && <span className="cr-pastille" data-ton="critique">● {tm('fiche.stockBas')}</span>}</p>
            {choisi.type === 'produit en stock' && (
              <div className="cr-fiche-produit__stock">
                <span><small>{tm('fiche.stock')}</small>{choisi.niveauConseille ? <small style={{ color: TON_COULEUR[tonDuStock(choisi)] }}>{tm('fiche.conseilles', { q: choisi.quantite ?? 0, c: choisi.niveauConseille })}</small> : <small className="cr-t3">{tm('stock', { n: choisi.quantite ?? 0 })}</small>}</span>
                <span className="cr-jauge-stock"><i style={{ width: `${jaugeDuStock(choisi).remplissage * 100}%`, background: TON_COULEUR[tonDuStock(choisi)] }} />{jaugeDuStock(choisi).repere !== null && <b style={{ left: `${(jaugeDuStock(choisi).repere ?? 0) * 100}%` }} />}</span>
              </div>
            )}
            <div className="cr-fiche-produit__ligne"><span>{tm('fiche.marge')}</span><b className="cr-mono">{p.droitPrixAchat && margeDuProduit(choisi) ? `${formaterEuro((margeDuProduit(choisi)?.cents ?? 0) / 100)} · ${margeDuProduit(choisi)?.pourcent} %` : tm('nonDisponible')}</b></div>
            <div className="cr-fiche-produit__ventes"><span>{tm('fiche.ventes')}</span>{choisi.ventes ? <span className="cr-mono">{choisi.ventes.reduce((s, v) => s + v, 0)}</span> : <small className="cr-t3">{tm('nonDisponible')}</small>}</div>
            {p.suggestion && <SuggestionAjmani titre={p.suggestion.titre} texte={p.suggestion.texte} primaire={{ libelle: tm('suggestion.commander'), onClick: p.onCommander ?? (() => undefined) }} secondaire={{ libelle: tm('suggestion.plusTard'), onClick: p.onPlusTard ?? (() => undefined) }} />}
          </aside>
        )}
      </div>
    </div>
  );
}
