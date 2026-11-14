import React, { useState } from 'react';
import { Check, Flag, Mail, Package, Tag, Truck } from 'lucide-react';
import { PageHead } from '../../../../socle/ui';
import { FilterChips, InlineSuggestion } from '../../../../socle/ui/vivant';
import { formaterEuro, type Jour } from '../../commun';
import { aExpedierAujourdhui, echeanceAffichee, estUrgente, etapeDeLaBande, jetonsDeLEtape, palierDeLivraisons, retourPossible, suiviDeLaCommande, trierEnCours, type CommandeEntree, type Compteurs, type EtapeBande } from '../../commandes';
import { compte } from '../../i18n';
import { useMots, type CleMR07 } from './textes';
import '../../creer.css';

export interface CommandeVue extends CommandeEntree { client: string; contenu: string; montantCents: number; adresse?: string; lignes?: { nom: string; detail: string; montantHtCents: number }[]; details?: Partial<Record<string, string>> }

export interface VueCommandesProps {
  commandes: CommandeVue[];
  compteurs: Compteurs;
  recordMensuel: number;
  aujourdhui: Jour;
  choisieId: string | null;
  onChoisir: (id: string) => void;
  suggestion?: string;
  onNouvelle?: () => void;
  onEtiquettes?: () => void;
  onSuivante?: (id: string) => void;
  onRetour?: (id: string) => void;
  onImprimer?: (id: string) => void;
  onRegrouper?: () => void;
  onNon?: () => void;
}

const ICONES: Record<EtapeBande, React.ReactNode> = { recues: <Mail size={20} aria-hidden />, preparation: <Package size={20} aria-hidden />, expediees: <Truck size={20} aria-hidden />, livrees: <Check size={20} aria-hidden /> };
const ETAPES: EtapeBande[] = ['recues', 'preparation', 'expediees', 'livrees'];

export function VueCommandes(p: VueCommandesProps) {
  const { tm, langue } = useMots();
  const [puce, setPuce] = useState<'toutes' | 'urgentes' | 'expedier'>('toutes');
  const k = p.compteurs;
  const enCours = trierEnCours(p.commandes, p.aujourdhui);
  const liste = enCours.filter((c) => (puce === 'urgentes' ? estUrgente(c, p.aujourdhui) : puce === 'expedier' ? aExpedierAujourdhui(c, p.aujourdhui) : true));
  const choisie = p.commandes.find((c) => c.id === p.choisieId) ?? enCours[0] ?? null;
  const pal = palierDeLivraisons(k.livreesCeMois, p.recordMensuel);
  const urgentesDe = (e: EtapeBande) => p.commandes.filter((c) => etapeDeLaBande(c) === e && estUrgente(c, p.aujourdhui)).length;
  const compteDe = (e: EtapeBande) => (e === 'recues' ? k.recues : e === 'preparation' ? k.enPreparation : e === 'expediees' ? k.expediees : k.livreesCeMois);
  const suivi = choisie ? suiviDeLaCommande(choisie) : [];
  const retour = choisie ? retourPossible(choisie) : null;
  const nomEtape = (c: CommandeEntree) => { const e = etapeDeLaBande(c); return e ? ETAPES.indexOf(e) + 1 : 0; };
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR07">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous', { enCours: k.enCours, aExpedier: k.aExpedier })}
        secondaires={[{ libelle: tm('etiquettes'), onClick: p.onEtiquettes ?? (() => undefined) }]}
        primaire={{ libelle: tm('nouvelle'), onClick: p.onNouvelle ?? (() => undefined) }}
      />
      <section className="cr-carte cr-parcours" data-mvt="entree">
        {ETAPES.map((e, i) => {
          const j = e === 'livrees' ? null : jetonsDeLEtape(p.commandes, e, p.aujourdhui, 3);
          return (
            <div key={e} className="cr-parcours__etape" data-etape={e}>
              <span className="cr-parcours__anneau">{ICONES[e]}</span>
              {i < 3 && <i className="cr-parcours__flux" aria-hidden />}
              <b className="cr-mono cr-parcours__n">{compteDe(e)} {e === 'recues' && k.recentes.nombre > 0 && <small>{tm('recent', { n: k.recentes.nombre, delai: `${k.recentes.ilYaMin ?? 0} min` })}</small>}</b>
              <span className="cr-parcours__nom"><b>{tm(`etape.${e}` as CleMR07)}</b>{e === 'livrees' ? <small>{tm('detail.ceMois', { evolution: `${k.evolutionLivrees >= 0 ? '+' : ''}${k.evolutionLivrees}` })}</small> : e === 'expediees' ? <small>{tm('detail.enRoute')}</small> : urgentesDe(e) > 0 ? <small data-ton="attention">{tm('detail.urgente', { n: urgentesDe(e) })}</small> : null}</span>
              {j && (
                <span className="cr-jetons">
                  {j.visibles.map((c) => <button key={c.id} type="button" className="cr-jeton-commande sc-focus" data-urgente={estUrgente(c, p.aujourdhui)} onClick={() => p.onChoisir(c.id)}><span className="cr-mono">{c.numero}</span> {c.client.split(' ')[0]}</button>)}
                  {j.autres > 0 && <small className="cr-t3">{compte(langue, 'cmd.autres', j.autres)}</small>}
                </span>
              )}
              {e === 'livrees' && (
                <span className="cr-palier"><small>{tm('palier', { n: pal.palier })}</small><span className="cr-mono">{k.livreesCeMois} / {pal.palier}</span><i><b style={{ width: `${Math.min(100, (k.livreesCeMois / pal.palier) * 100)}%` }} /></i>{!pal.atteint && <em>{tm('palier.reste', { n: pal.restant })}</em>}</span>
              )}
            </div>
          );
        })}
      </section>
      <div className="cr-commandes">
        <section className="cr-carte cr-liste-cmd" data-mvt="entree" aria-label={tm('liste.titre')}>
          <header><h2>{tm('liste.titre')}</h2>
            <FilterChips libelle={tm('liste.titre')} valeur={puce} onChange={(c) => setPuce(c as typeof puce)} puces={[
              { cle: 'toutes', libelle: tm('puce.toutes'), compteur: enCours.length },
              { cle: 'urgentes', libelle: tm('puce.urgentes'), compteur: enCours.filter((c) => estUrgente(c, p.aujourdhui)).length },
              { cle: 'expedier', libelle: tm('puce.expedier'), compteur: k.aExpedier },
            ]} />
          </header>
          {liste.length === 0 ? <p className="cr-t3" style={{ padding: 24 }}>{tm('vide.titre')}</p> : (
            <table>
              <thead><tr><th>{tm('col.numero')}</th><th>{tm('col.client')}</th><th>{tm('col.contenu')}</th><th>{tm('col.montant')}</th><th>{tm('col.etape')}</th><th>{tm('col.echeance')}</th></tr></thead>
              <tbody>
                {liste.map((c) => {
                  const ech = echeanceAffichee(c, p.aujourdhui, langue);
                  const e = etapeDeLaBande(c);
                  const lib = e === 'expediees' ? tm('echeance.enRoute') : ech.echeance.type === 'aujourdhui' ? (ech.echeance.heure ? tm('echeance.auj', { heure: ech.echeance.heure }) : tm('echeance.aujSans')) : ech.echeance.type === 'demain' ? tm('echeance.demain') : ech.echeance.type === 'aucune' ? '—' : ech.echeance.libelle;
                  return (
                    <tr key={c.id} data-actif={c.id === choisie?.id}>
                      <td className="cr-mono">
                        <button type="button" className="cr-cellule-btn sc-focus" onClick={() => p.onChoisir(c.id)}>{c.numero}</button>
                      </td>
                      <td>{c.client}{estUrgente(c, p.aujourdhui) && <Flag size={11} className="cr-drapeau" aria-label={tm('detail.urgenteLibelle')} />}</td>
                      <td className="cr-t2">{c.contenu}</td>
                      <td className="cr-mono">{formaterEuro(c.montantCents / 100)}</td>
                      <td><span className="cr-segments" aria-label={tm('etape.libelle', { n: nomEtape(c) })}>{[1, 2, 3, 4].map((n) => <i key={n} data-on={n <= nomEtape(c)} />)}</span></td>
                      <td className="cr-mono" data-orange={ech.orange}>{lib}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {p.suggestion && <InlineSuggestion texte={p.suggestion} libelleOui={tm('suggestion.regrouper')} libelleNon={tm('suggestion.non')} onOui={p.onRegrouper ?? (() => undefined)} onNon={p.onNon ?? (() => undefined)} />}
        </section>
        {choisie && (
          <aside className="cr-carte cr-detail-cmd" data-mvt="entree" aria-label={choisie.numero}>
            <header>
              <span><small className="cr-mono">{choisie.numero}</small>{estUrgente(choisie, p.aujourdhui) && <small className="cr-urgente"><Flag size={11} aria-hidden /> {tm('detail.urgenteLibelle')}</small>}</span>
              <span className="cr-pastille" data-ton="info">● {tm(`etape.${etapeDeLaBande(choisie) ?? 'recues'}` as CleMR07)}</span>
            </header>
            <h2>{choisie.client}</h2>
            {choisie.adresse && <p className="cr-t3">{choisie.adresse}</p>}
            <ol className="cr-suivi">
              {suivi.map((s, i) => {
                const courant = suivi.findIndex((x) => !x.fait) === i;
                return <li key={s.etape} data-fait={s.fait} data-courant={courant}><i>{s.fait ? <Check size={11} aria-hidden /> : null}</i><b>{tm(`suivi.${s.etape}` as CleMR07)}</b><small>{choisie.details?.[s.etape] ?? ''}</small></li>;
              })}
            </ol>
            {(choisie.lignes ?? []).map((l) => <div key={l.nom} className="cr-encart-ligne"><Package size={16} aria-hidden /><span><b>{l.nom}</b><small>{l.detail}</small></span><b className="cr-mono">{formaterEuro(l.montantHtCents / 100)} HT</b></div>)}
            <footer>
              <button type="button" className="cr-bouton-verre" onClick={() => p.onImprimer?.(choisie.id)}><Tag size={13} aria-hidden /> {tm('detail.imprimer')}</button>
              <button type="button" className="cr-bouton-verre" onClick={() => p.onSuivante?.(choisie.id)}><Check size={13} aria-hidden /> {tm('detail.prete')}</button>
              {retour?.possible && p.onRetour && <button type="button" className="cr-bouton-verre" onClick={() => p.onRetour?.(choisie.id)}>{tm('detail.retour')}</button>}
            </footer>
          </aside>
        )}
      </div>
    </div>
  );
}
