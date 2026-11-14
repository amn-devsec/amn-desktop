import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { PageHead, SuggestionAjmani } from '../../../../socle/ui';
import { FilterChips } from '../../../../socle/ui/vivant';
import { compte, traduire as traduireLogique } from '../../i18n';
import type { Jour } from '../../commun';
import { echeanceEntretien, entretiensDuMois, etatNormalise, filtrerParPuce, jaugeDEtat, libelleEntretien, mouvementsDuJour, ordreDesFiches, resumerLeParc, statutDeLEquipement, talonDe, type EquipementEntree, type Puce } from '../../materiel';
import { useMots, type CleMR04 } from './textes';
import '../../creer.css';

export interface EquipementVue extends EquipementEntree { numero: string; categorie: string }
export interface MouvementVue { id: string; heure: string; qui: string; texte: string; icone: 'pret' | 'retour' | 'controle' | 'entretien' | 'rappel' }

export interface VueMaterielProps {
  equipements: EquipementVue[];
  aujourdhui: Jour;
  utilisateur: string;
  mouvements: MouvementVue[];
  faitsDuMois: ReadonlySet<string>;
  onCocher: (id: string) => void;
  suggestion?: { titre: string; texte: string };
  onScanner?: () => void;
  onAjouter?: () => void;
  onPlanifier?: () => void;
  onNon?: () => void;
}

const TON_STATUT: Record<string, string> = { 'En prêt': 'info', Disponible: 'succes', 'Hors service': 'critique' };

export function VueMateriel(p: VueMaterielProps) {
  const { tm, langue } = useMots();
  const [puce, setPuce] = useState<Puce>('tous');
  const [q, setQ] = useState('');
  const parc = resumerLeParc(p.equipements, p.aujourdhui);
  const filtres = filtrerParPuce(p.equipements, puce, p.aujourdhui).filter((e) => !q || `${e.nom} ${e.numero}`.toLowerCase().includes(q.toLowerCase()));
  const fiches = ordreDesFiches(filtres, p.aujourdhui);
  const mois = entretiensDuMois(p.equipements, p.aujourdhui);
  const jour = mouvementsDuJour(p.mouvements);
  const total = parc.total || 1;
  const faits = [...mois.visibles].filter((e) => p.faitsDuMois.has(e.id)).length;
  const lib = (e: EquipementVue) => {
    const l = libelleEntretien(echeanceEntretien(e), p.aujourdhui, langue);
    return l.type === 'retard' ? tm('entretien.retard', { n: l.jours }) : l.type === 'dans' ? tm('entretien.dans', { n: l.jours }) : l.type === 'mois' ? `${l.mois} ${l.annee}` : tm('entretien.aucun');
  };
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR04">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous', { pret: compte(langue, 'materiel.enPret', parc.enPret) })}
        secondaires={[{ libelle: tm('scanner'), onClick: p.onScanner ?? (() => undefined) }]}
        primaire={{ libelle: tm('ajouter'), onClick: p.onAjouter ?? (() => undefined) }}
      />
      <div className="cr-materiel-barre">
        <FilterChips libelle={tm('titre')} valeur={puce} onChange={(c) => setPuce(c as Puce)} puces={[
          { cle: 'tous', libelle: tm('puce.tous'), compteur: parc.total }, { cle: 'en-pret', libelle: tm('puce.pret'), compteur: parc.enPret },
          { cle: 'a-entretenir', libelle: tm('puce.entretenir'), compteur: parc.aEntretenir }, { cle: 'reformes', libelle: tm('puce.reformes'), compteur: parc.reformes },
        ]} />
        <label className="cr-recherche"><Search size={14} aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tm('chercher')} aria-label={tm('chercher')} /></label>
        <span className="cr-parc">
          <i className="cr-parc__barre" aria-hidden><b style={{ width: `${(parc.segments.bonEtat / total) * 100}%` }} /><b data-t="verifier" style={{ width: `${(parc.segments.aVerifier / total) * 100}%` }} /><b data-t="hs" style={{ width: `${(parc.segments.horsService / total) * 100}%` }} /></i>
          {tm('parc', { bon: parc.segments.bonEtat, verifier: parc.segments.aVerifier, hs: parc.segments.horsService })}
        </span>
      </div>
      <div className="cr-materiel">
        {parc.total === 0 ? <section className="cr-carte" style={{ padding: 32 }}><h2 style={{ margin: 0 }}>{tm('vide.titre')}</h2><p className="cr-t3">{tm('vide.texte')}</p></section> : (
          <div className="cr-fiches">
            {fiches.map((e) => {
              const st = statutDeLEquipement(e);
              const j = jaugeDEtat(e, p.aujourdhui);
              const talon = talonDe(e, p.utilisateur);
              const et = etatNormalise(e.etat);
              const retard = libelleEntretien(echeanceEntretien(e), p.aujourdhui).type === 'retard';
              return (
                <article key={e.id} className="cr-fiche" data-statut={st} data-mvt="entree">
                  <header><i aria-hidden /><small>{e.categorie.toUpperCase()}</small><span className="cr-pastille" data-ton={TON_STATUT[st]}>● {tm(`statut.${st}` as CleMR04)}</span></header>
                  <div className="cr-fiche__vignette" aria-hidden><MapPin size={22} /></div>
                  <b>{e.nom}</b>
                  <small className="cr-mono">N° {e.numero}</small>
                  <dl>
                    <div><dt>{tm('etat')}</dt>{e.etat === '—' ? <dd className="cr-t3">{tm('nonDisponible')}</dd> : <dd><span className="cr-jauge5" data-ton={j.ton}>{[1, 2, 3, 4, 5].map((n) => <i key={n} data-on={n <= j.segments} />)}</span>{tm(`etat.${et}` as CleMR04)}</dd>}</div>
                    <div><dt>{tm('entretien')}</dt><dd data-retard={retard}>{lib(e)}</dd></div>
                  </dl>
                  <footer>
                    <span className="cr-avatar cr-avatar--m">{talon.type === 'personne' ? talon.nom[0] : <MapPin size={11} aria-hidden />}</span>
                    <span><b>{talon.type === 'personne' && talon.vous ? traduireLogique(langue, 'materiel.talon.toi', { nom: talon.nom }) : talon.nom}</b><small>{talon.type === 'personne' && talon.depuis ? tm('talon.depuis', { quand: talon.depuis }) : ''}</small></span>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
        <aside className="cr-materiel__droite">
          <section className="cr-carte cr-mouv" data-mvt="entree" aria-label={tm('mouvements.titre')}>
            <header><b>{tm('mouvements.titre')}</b><span className="cr-direct">{tm('mouvements.direct')}</span></header>
            {jour.visibles.length === 0 ? <p className="cr-t3" style={{ padding: 16 }}>{tm('mouvements.rien')}</p> : (
              <ul>{jour.visibles.map((m) => <li key={m.id}><span className="cr-mono cr-t3">{m.heure}</span><span className="cr-avatar cr-avatar--m">{m.qui[0]}</span><span>{m.texte}</span></li>)}</ul>
            )}
          </section>
          <section className="cr-carte cr-avant" data-mvt="entree" aria-label={tm('mois.titre')}>
            <header><b>{tm('mois.titre')}</b><small>{tm('mois.fait', { f: faits, t: mois.visibles.length })}</small></header>
            <span className="cr-relecture__barre"><i style={{ width: `${mois.visibles.length ? (faits / mois.visibles.length) * 100 : 0}%` }} /></span>
            {mois.visibles.map((e) => { const fait = p.faitsDuMois.has(e.id); return <button key={e.id} type="button" className="cr-controle sc-focus" data-fait={fait} onClick={() => p.onCocher(e.id)} aria-pressed={fait}><i>{fait ? '✓' : ''}</i>{e.nom}</button>; })}
            {mois.autres > 0 && <small className="cr-t3" style={{ padding: '0 16px' }}>{tm('mois.autres', { n: mois.autres })}</small>}
          </section>
          {p.suggestion && <SuggestionAjmani titre={p.suggestion.titre} texte={p.suggestion.texte} primaire={{ libelle: tm('suggestion.planifier'), onClick: p.onPlanifier ?? (() => undefined) }} secondaire={{ libelle: tm('suggestion.non'), onClick: p.onNon ?? (() => undefined) }} />}
        </aside>
      </div>
    </div>
  );
}

