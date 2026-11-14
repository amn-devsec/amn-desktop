import React, { useState } from 'react';
import { GripVertical, Lock, Plus, Send } from 'lucide-react';
import { Modale, PageHead, Segmente } from '../../../../socle/ui';
import { InlineSuggestion } from '../../../../socle/ui/vivant';
import { compte } from '../../i18n';
import { actionDePublication, changementsEnAttente, controlesAvantPublication, statutDeSection, type BilanVisites, type DroitsPage, type SectionEntree, type StatutSection } from '../../pagePublique';
import { useMots, type CleMR02 } from './textes';
import '../../creer.css';

export interface SectionVue extends SectionEntree { corps?: string[] }

export interface VuePageProps {
  nomSite: string;
  adresse: string;
  sections: SectionVue[];
  actifId: string | null;
  onChoisir: (id: string) => void;
  droits: DroitsPage;
  derniere: string | null;
  visites: (BilanVisites & { record: string | null }) | null;
  /** Les contrôles « avant de publier » déjà cochés (écrits dans Tâches). */
  coches: ReadonlySet<string>;
  onCocher: (id: string) => void;
  libelleControle: (motif: string, titre: string) => string;
  suggestion?: string;
  onPublier?: () => void;
  onVoir?: () => void;
  onAjouter?: () => void;
  onDemander?: () => void;
  onPlusTard?: () => void;
}

const TON: Record<StatutSection, string> = { 'En ligne': 'succes', Modifiée: 'attention', 'À vérifier': 'attention', Brouillon: 'gris' };
const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function Site({ p, mobile }: { p: VuePageProps; mobile?: boolean }) {
  const { tm } = useMots();
  return (
    <div className={`cr-site-web ${mobile ? 'cr-site-web--mobile' : ''}`}>
      <div className="cr-site-web__nav"><b>{p.nomSite}</b>{!mobile && <span>{p.sections.slice(0, 4).map((s) => <i key={s.id}>{s.titre}</i>)}</span>}</div>
      {p.sections.map((s) => (
        <div key={s.id} className="cr-site-web__section" data-actif={s.id === p.actifId}>
          {s.id === p.actifId && <em>{tm('modification', { section: s.titre })}</em>}
          <h4>{s.titre}</h4>
          {(s.corps ?? []).map((l, i) => <p key={i}>{l}</p>)}
        </div>
      ))}
    </div>
  );
}

export function VuePage(p: VuePageProps) {
  const { tm, langue } = useMots();
  const [vue, setVue] = useState<'bureau' | 'telephone' | 'les-deux'>('les-deux');
  const [confirme, setConfirme] = useState(false);
  const attente = changementsEnAttente(p.sections);
  const controles = controlesAvantPublication(p.sections);
  const action = actionDePublication(p.droits, p.sections);
  const faits = controles.filter((c) => p.coches.has(c.id)).length;
  const aucune = p.sections.length === 0;
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR02">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous')}
        secondaires={[{ libelle: tm('voir'), onClick: p.onVoir ?? (() => undefined) }]}
        primaire={{ libelle: action.action === 'demander' ? tm('demander') : tm('publier'), onClick: () => setConfirme(true), disabled: !action.actif }}
      />
      <div className="cr-page-publique">
        <div className="cr-page-publique__gauche">
          <section className="cr-carte cr-sections" data-mvt="entree" aria-label={tm('sections.titre')}>
            <header><b>{tm('sections.titre')}</b><small>{p.sections.length}</small></header>
            {aucune ? <p className="cr-t3" style={{ padding: 16 }}>{tm('vide.titre')}</p> : (
              <ul>
                {p.sections.map((s) => {
                  const st = statutDeSection(s);
                  return (
                    <li key={s.id}>
                      <button type="button" className="cr-section sc-focus" data-actif={s.id === p.actifId} onClick={() => p.onChoisir(s.id)}>
                        <GripVertical size={12} aria-hidden className="cr-t3" />
                        <span className="cr-section__nom">{s.titre}</span>
                        <span className="cr-section__statut" data-ton={TON[st]}><i />{tm(`statut.${st}` as CleMR02)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button type="button" className="cr-ajouter" onClick={p.onAjouter}><Plus size={13} aria-hidden /> {tm('ajouter')}</button>
          </section>
          <section className="cr-carte cr-avant" data-mvt="entree" aria-label={tm('avant.titre')}>
            <header><b>{tm('avant.titre')}</b><small>{controles.length ? tm('avant.fait', { f: faits, t: controles.length }) : ''}</small></header>
            {controles.length === 0 ? <p className="cr-t3" style={{ padding: '0 16px 14px' }}>{tm('avant.rien')}</p> : (
              <>
                <span className="cr-relecture__barre"><i style={{ width: `${(faits / controles.length) * 100}%` }} /></span>
                {controles.map((c) => {
                  const s = p.sections.find((x) => x.id === c.sectionId);
                  const fait = p.coches.has(c.id);
                  return (
                    <button key={c.id} type="button" className="cr-controle sc-focus" data-fait={fait} onClick={() => p.onCocher(c.id)} aria-pressed={fait}>
                      <i>{fait ? '✓' : ''}</i>{p.libelleControle(c.motif, s?.titre ?? '')}
                    </button>
                  );
                })}
              </>
            )}
          </section>
          <section className="cr-carte cr-visites" data-mvt="entree" aria-label={tm('visites.titre')}>
            {p.visites ? (
              <>
                <div><small>{tm('visites.titre')}</small><b className="cr-mono">{p.visites.total7j.toLocaleString('fr-FR')} {p.visites.variationPct !== null && <em>{p.visites.variationPct >= 0 ? '+' : ''}{p.visites.variationPct} %</em>}</b>{p.visites.record && <small>{tm('visites.record', { mois: p.visites.record })}</small>}</div>
                <div className="cr-visites__barres" aria-hidden>
                  {p.visites.jours.map((j, i) => <span key={j.jour}><i data-haut={i === p.visites?.jourLePlusHaut} style={{ height: `${Math.max(6, (j.visites / Math.max(1, ...(p.visites?.jours ?? []).map((x) => x.visites))) * 44)}px` }} /><small>{JOURS[i]}</small></span>)}
                </div>
              </>
            ) : <div><small>{tm('visites.titre')}</small><small className="cr-t3">{tm('visites.nonDisponible')}</small></div>}
          </section>
        </div>
        <section className="cr-carte cr-apercu-direct" data-mvt="entree" aria-label={tm('apercu.titre')}>
          <header>
            <b>{tm('apercu.titre')}</b>
            <span className="cr-direct">{tm('apercu.sync')} · {p.derniere ? tm('apercu.derniere', { quand: p.derniere }) : tm('apercu.jamais')}</span>
            <Segmente taille="compact" libelle={tm('vue.libelle')} valeur={vue} onChange={(v) => setVue(v as typeof vue)} options={(['bureau', 'telephone', 'les-deux'] as const).map((k) => ({ cle: k, libelle: tm(`vue.${k}` as CleMR02) }))} />
          </header>
          <div className="cr-scene" data-vue={vue}>
            {vue !== 'telephone' && (
              <figure className="cr-navigateur"><div className="cr-navigateur__barre"><i /><i /><i /><span><Lock size={10} aria-hidden /> {p.adresse || tm('sansAdresse')}</span></div><Site p={p} /><figcaption>{tm('legende.bureau')}</figcaption></figure>
            )}
            {vue !== 'bureau' && (
              <figure className="cr-telephone"><div className="cr-telephone__ecran"><Site p={p} mobile /></div><figcaption>{tm('legende.telephone')}</figcaption></figure>
            )}
          </div>
          {p.suggestion && <InlineSuggestion texte={p.suggestion} libelleOui={tm('suggestion.demander')} libelleNon={tm('suggestion.plusTard')} onOui={p.onDemander ?? (() => undefined)} onNon={p.onPlusTard ?? (() => undefined)} />}
          <footer className="cr-attente">
            <span>{compte(langue, 'page.enAttente', attente.length)}</span>
            {attente.map((s) => <span key={s.id} className="cr-section__statut" data-ton={TON[statutDeSection(s)]}><i />{s.titre}</span>)}
            <span className="cr-attente__prive"><Lock size={12} aria-hidden /> {tm('prive')}</span>
          </footer>
        </section>
      </div>
      <Modale
        ouverte={confirme}
        onFermer={() => setConfirme(false)}
        titre={tm('confirm.titre')}
        description={tm('confirm.prive')}
        famille="creer"
        actions={<><button type="button" className="cr-bouton-verre" onClick={() => setConfirme(false)}>{tm('confirm.annuler')}</button><button type="button" className="cr-bouton-plein" onClick={() => { setConfirme(false); p.onPublier?.(); }}><Send size={13} aria-hidden /> {tm('confirm.publier')}</button></>}
      >
        <p>{tm('confirm.texte')}</p>
        <ul>{attente.map((s) => <li key={s.id}>{s.titre}</li>)}</ul>
        {controles.some((c) => !p.coches.has(c.id)) && (<><p>{tm('confirm.controles')}</p><ul>{controles.filter((c) => !p.coches.has(c.id)).map((c) => <li key={c.id}>{p.libelleControle(c.motif, p.sections.find((x) => x.id === c.sectionId)?.titre ?? '')}</li>)}</ul></>)}
      </Modale>
    </div>
  );
}
