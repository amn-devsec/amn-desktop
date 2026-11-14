import React, { useState } from 'react';
import { ArrowRight, Check, Database, Download, FileText, Mail, Send, Star, Trophy, Wallet } from 'lucide-react';
import { Modale, PageHead, SuggestionAjmani } from '../../../../socle/ui';
import { IconeEtincelle } from '../../../../socle/ui/controles';
import { formaterEuro, formaterNombre } from '../../../../socle/formats';
import { useMots, type CleH04 } from './textes';
import '../../journee.css';

export type IconeDeReussite = 'euro' | 'base' | 'document' | 'courrier';
export interface Reussite { titre: string; detail: string; icone: IconeDeReussite }
export interface Glisse { id: string; titre: string; prevue: string; propose: string }
export interface JourDuRuban { jour: string; faites: number; meilleur: boolean; moment: { titre: string; detail: string } | null }
export interface SemainePrecedente { s: number; plage: string; taches: number; cents: number }

export interface VueBilanProps {
  prenom: string;
  semaine: number;
  du: string;
  au: string;
  heureDuCalcul: string;
  ton: 'solide' | 'remplie' | 'calme';
  taches: { n: number; ecart: number; semainePrecedente: number };
  encaisse: { cents: number; ecartPct: number | null };
  clients: { n: number; ecart: number };
  boiteAZero: { jours: number; enCours: boolean } | null;
  /** « jeudi » : le jour de la semaine du meilleur jour, ou `aujourdhui`. */
  meilleurJour: { type: 'aujourdhui' } | { type: 'jour'; nom: string } | null;
  ruban: JourDuRuban[];
  reussites: Reussite[];
  glisse: Glisse[];
  /** « lundi » : le jour de la proposition quand toutes vont au même. */
  glisseQuand: string;
  palier: { titre: string; detail: string | null; vers: number; resteJours: number; progression: number } | null;
  cloture: { relu: boolean; decide: boolean; mot: boolean };
  precedentes: { semaines: SemainePrecedente[]; cloturees: boolean; moyenne: { taches: number; cents: number } | null };
  suggestion: { prevues: number; plus: number; deplacer: number } | null;
  vide: boolean;
  onPartager?: () => void;
  onExporter?: () => void;
  onCloturer: () => void;
  onToutReporter?: () => void;
  onCocher: (cle: 'relu' | 'decide' | 'mot') => void;
  onVoirProposition?: () => void;
  onGarder?: () => void;
}

const ICONES: Record<IconeDeReussite, React.ReactNode> = { euro: <Wallet size={14} aria-hidden />, base: <Database size={14} aria-hidden />, document: <FileText size={14} aria-hidden />, courrier: <Mail size={14} aria-hidden /> };
const un = (tm: (c: CleH04, p?: Record<string, string | number>) => string, base: 'tache' | 'client', n: number) => tm(`${base}.${Math.abs(n) >= 2 ? 'n' : '1'}` as CleH04, { n });

export function VueBilan(p: VueBilanProps) {
  const { tm } = useMots();
  const [confirme, setConfirme] = useState(false);
  const euros = (c: number) => formaterEuro(c / 100);
  const fait = [p.cloture.relu, p.cloture.decide, p.cloture.mot].filter(Boolean).length;
  const ecartTaches = p.taches.ecart > 0 ? tm('ecart.tachesPlus', { n: p.taches.ecart, s: p.semaine - 1 }) : p.taches.ecart < 0 ? tm('ecart.tachesMoins', { n: p.taches.ecart, s: p.semaine - 1 }) : tm('ecart.egal', { s: p.semaine - 1 });
  const ecartClients = p.clients.ecart > 0 ? tm('ecart.clientsPlus', { n: p.clients.ecart }) : p.clients.ecart < 0 ? tm('ecart.clientsMoins', { n: Math.abs(p.clients.ecart) }) : tm('ecart.clientsEgal');
  const meilleur = p.meilleurJour ? (p.meilleurJour.type === 'aujourdhui' ? tm('resume.meilleur.aujourdhui') : tm('resume.meilleur.jour', { jour: p.meilleurJour.nom.replace(/^./, (c) => c.toUpperCase()) })) : '';

  return (
    <div className="cr-page jr-bilan" data-famille="jour" data-ecran="H04">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous')}
        secondaires={[
          { libelle: tm('partager'), onClick: p.onPartager, disabled: !p.onPartager, icone: <Send size={14} aria-hidden /> },
          { libelle: tm('exporter'), onClick: p.onExporter, disabled: !p.onExporter, icone: <Download size={14} aria-hidden /> },
        ]}
        primaire={{ libelle: tm('cloturer'), onClick: () => setConfirme(true), icone: <Check size={14} aria-hidden /> }}
      />
      <div className="jr-bilan__corps">
        <article className="cr-carte jr-recit" data-mvt="entree">
          <p className="jr-chapeau">
            <span>{tm('chapeau', { n: p.semaine })}</span><small>{tm('chapeau.plage', { du: p.du, au: p.au })}</small>
            <em><IconeEtincelle taille={13} />{tm('chapeau.prepare', { heure: p.heureDuCalcul })}</em>
          </p>
          {p.vide ? (
            <div className="jr-bilan__vide"><h2>{tm('vide.titre')}</h2><p className="cr-t3">{tm('vide.texte')}</p></div>
          ) : (
            <>
              <h2>{tm(`titre.${p.ton}` as CleH04, { prenom: p.prenom })}</h2>
              <p className="jr-resume">{tm('resume', { taches: un(tm, 'tache', p.taches.n), euros: euros(p.encaisse.cents), clients: un(tm, 'client', p.clients.n) })} {meilleur}</p>
              <dl className="jr-chiffres">
                <div><dt><b className="cr-mono">{p.taches.n}</b>{tm('chiffre.taches')}</dt><dd>{tm('chiffre.taches.sous')}</dd><dd data-ton={p.taches.ecart >= 0 ? 'succes' : 'neutre'}>{ecartTaches}</dd></div>
                <div><dt><b className="cr-mono">{formaterNombre(Math.round(p.encaisse.cents / 100))}</b>€</dt><dd>{tm('chiffre.euros')}</dd>{p.encaisse.ecartPct !== null && <dd data-ton={p.encaisse.ecartPct >= 0 ? 'succes' : 'neutre'}>{tm('ecart.pct', { pct: `${p.encaisse.ecartPct > 0 ? '+' : ''}${p.encaisse.ecartPct} %`, s: p.semaine - 1 })}</dd>}</div>
                <div><dt><b className="cr-mono">{p.clients.n}</b>{tm('chiffre.clients')}</dt><dd>{tm('chiffre.clients.sous')}</dd><dd data-ton={p.clients.ecart >= 0 ? 'succes' : 'neutre'}>{ecartClients}</dd></div>
                {p.boiteAZero ? <div><dt><b className="cr-mono">{p.boiteAZero.jours}</b>{tm('chiffre.jours')}</dt><dd>{tm('chiffre.jours.sous')}</dd><dd>{p.boiteAZero.enCours ? tm('chiffre.jours.serie') : tm('chiffre.jours.finie')}</dd></div> : <div><dt><b className="cr-mono">—</b>{tm('chiffre.jours')}</dt><dd>{tm('chiffre.jours.sous')}</dd><dd>{tm('nonDisponible')}</dd></div>}
              </dl>
              <h3 className="jr-titre-section">{tm('ruban.titre')} <small>{tm('ruban.aide')}</small></h3>
              <ol className="jr-ruban">
                {p.ruban.map((j) => (
                  <li key={j.jour} data-meilleur={j.meilleur}>
                    <header><b>{j.jour}</b><small>{tm(`ruban.faite.${j.faites >= 2 ? 'n' : '1'}` as CleH04, { n: j.faites })}</small></header>
                    <span className="jr-points" aria-hidden>{Array.from({ length: 5 }, (_, i) => <i key={i} data-plein={i < j.faites} />)}</span>
                    <b>{j.moment?.titre ?? tm('ruban.rien')}</b>
                    <small>{j.meilleur ? <span className="jr-meilleur"><Star size={11} aria-hidden />{tm('ruban.meilleur')}</span> : j.moment?.detail ?? ''}</small>
                  </li>
                ))}
              </ol>
              <div className="jr-deux">
                <section aria-label={tm('bien.titre')}>
                  <h3 className="jr-titre-section">{tm('bien.titre')} {p.reussites.length > 0 && <small data-ton="succes">{tm('bien.n', { n: p.reussites.length })}</small>}</h3>
                  <ul className="jr-liste-bilan">
                    {p.reussites.map((r, i) => <li key={i}><span className="jr-coche" aria-hidden><Check size={10} strokeWidth={3} /></span><span><b>{r.titre}</b><small>{r.detail}</small></span>{ICONES[r.icone]}</li>)}
                    {p.reussites.length === 0 && <li className="cr-t3">{tm('bien.rien')}</li>}
                  </ul>
                </section>
                <section aria-label={tm('glisse.titre')}>
                  <h3 className="jr-titre-section">{tm('glisse.titre')} {p.glisse.length > 0 && <small>{tm(p.glisse.length >= 2 ? 'glisse.n' : 'glisse.n.1', { n: p.glisse.length, quand: p.glisseQuand })}</small>}</h3>
                  <ul className="jr-liste-bilan">
                    {p.glisse.map((g) => <li key={g.id}><span className="jr-case-vide" aria-hidden /><span><b>{g.titre}</b><small>{tm('glisse.prevue', { jour: g.prevue })}</small></span><em><ArrowRight size={12} aria-hidden />{g.propose}</em></li>)}
                    {p.glisse.length === 0 && <li className="cr-t3">{tm('glisse.rien')}</li>}
                  </ul>
                  {p.glisse.length > 0 && <button type="button" className="cr-bouton-verre jr-tout sc-focus" onClick={p.onToutReporter}><ArrowRight size={13} aria-hidden /> {tm('glisse.tout')}</button>}
                </section>
              </div>
              {p.palier && (
                <section className="jr-palier" aria-label={tm('palier.titre')}>
                  <span className="jr-palier__trophee" aria-hidden><Trophy size={18} /></span>
                  <span><small>{tm('palier.titre')}</small><b>{p.palier.titre}</b></span>
                  {p.palier.detail && <span className="jr-palier__detail"><Check size={13} aria-hidden />{p.palier.detail}</span>}
                  <span className="jr-palier__vers"><span><small>{tm('palier.vers', { n: p.palier.vers })}</small><small>{tm('palier.reste', { n: p.palier.resteJours })}</small></span><i aria-hidden><b style={{ width: `${Math.round(p.palier.progression * 100)}%` }} /></i></span>
                </section>
              )}
            </>
          )}
        </article>
        <aside className="jr-bilan__droite">
          <section className="cr-carte cr-avant" data-mvt="entree" aria-label={tm('cloture.titre')}>
            <header><b>{tm('cloture.titre')}</b><small>{tm('cloture.fait', { f: fait })}</small></header>
            <span className="cr-relecture__barre"><i style={{ width: `${(fait / 3) * 100}%` }} /></span>
            {(['relu', 'decide', 'mot'] as const).map((c) => (
              <button key={c} type="button" className="cr-controle sc-focus" data-fait={p.cloture[c]} aria-pressed={p.cloture[c]} onClick={() => p.onCocher(c)}><i>{p.cloture[c] ? '✓' : ''}</i>{tm(`cloture.${c === 'relu' ? 'relire' : c === 'decide' ? 'decider' : 'mot'}` as CleH04)}</button>
            ))}
          </section>
          <section className="cr-carte jr-precedentes" data-mvt="entree" aria-label={tm('prec.titre')}>
            <header><b>{tm('prec.titre')}</b><small>{tm(p.precedentes.cloturees ? 'prec.cloturees' : 'prec.calculees')}</small></header>
            {p.precedentes.semaines.length === 0 ? <p className="cr-t3 jr-precedentes__vide">{tm('prec.rien')}</p> : (
              <ul>
                {p.precedentes.semaines.map((s) => {
                  const max = Math.max(1, ...p.precedentes.semaines.map((x) => x.taches));
                  return <li key={s.s}><span className="cr-mono cr-t3">S{s.s}</span><span><b>{s.plage}</b><small>{tm('prec.ligne', { t: s.taches, euros: euros(s.cents) })}</small></span><i aria-hidden><b style={{ width: `${(s.taches / max) * 100}%` }} /></i></li>;
                })}
              </ul>
            )}
            {p.precedentes.moyenne && <footer>{tm('prec.moyenne', { t: Math.round(p.precedentes.moyenne.taches), euros: euros(p.precedentes.moyenne.cents) })}</footer>}
          </section>
          {p.suggestion && (
            <SuggestionAjmani
              titre={tm('suggestion.prevues', { n: p.suggestion.prevues })}
              texte={tm('suggestion.texte', { plus: p.suggestion.plus, m: p.suggestion.deplacer })}
              primaire={{ libelle: tm('suggestion.voir'), onClick: p.onVoirProposition ?? (() => undefined) }}
              secondaire={{ libelle: tm('suggestion.garder'), onClick: p.onGarder ?? (() => undefined) }}
            />
          )}
        </aside>
      </div>
      <Modale
        ouverte={confirme}
        onFermer={() => setConfirme(false)}
        titre={tm('confirme.titre')}
        description={tm('confirme.texte')}
        famille="jour"
        actions={<><button type="button" className="cr-bouton-verre" onClick={() => setConfirme(false)}>{tm('confirme.annuler')}</button><button type="button" className="cr-bouton-plein" onClick={() => { setConfirme(false); p.onCloturer(); }}>{tm('confirme.ok')}</button></>}
      >
        <p>{tm('confirme.texte')}</p>
      </Modale>
    </div>
  );
}
