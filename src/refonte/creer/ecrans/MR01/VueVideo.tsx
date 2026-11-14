import React, { useState } from 'react';
import { AudioWaveform, FileText, Mic, Monitor, Play, Plus, Video } from 'lucide-react';
import { PageHead, Segmente, SuggestionAjmani } from '../../../../socle/ui';
import { compte } from '../../i18n';
import { codeTemporel, compteRelecture, fenetreVisible, marqueursDeRegle, positionPx, type CaseSemaine, type Commentaire, type Plan, type PisteAudio, type SousTitreLigne, type ZoomFrise } from '../../video';
import { useMots, type CleMR01 } from './textes';
import '../../creer.css';

export interface LigneVideo { id: string; titre: string; etat: string; ton: 'info' | 'attention' | 'succes' | 'gris'; pct: number }
export interface VideoOuverte {
  id: string;
  titre: string;
  version?: number;
  dureeSec: number;
  plans: (Plan & { nom: string })[];
  sousTitres: (SousTitreLigne & { retour?: boolean })[];
  voix: { debut: number; fin: number }[];
  musique: PisteAudio | null;
  retours: Commentaire[];
  tete: number;
  planSelectionneId: string | null;
  publiee: boolean;
}

export interface VueVideoProps {
  sousTitre: string;
  videos: LigneVideo[];
  actifId: string | null;
  onChoisir: (id: string) => void;
  serie: { cases: CaseSemaine[]; faites: number };
  ouverte: VideoOuverte | null;
  enregistre: string;
  onNouvelle?: () => void;
  onRushes?: () => void;
  onPublication?: () => void;
  onPreparer?: () => void;
  onNon?: () => void;
  suggestion?: boolean;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function VueVideo(p: VueVideoProps) {
  const { tm, langue } = useMots();
  const nb = (base: 'piste.plans' | 'piste.phrases' | 'piste.prises', n: number) => tm(`${base}.${n >= 2 ? 'n' : '1'}` as CleMR01, { n });
  const [format, setFormat] = useState('16:9');
  const [zoom, setZoom] = useState<ZoomFrise>('tout');
  const o = p.ouverte;
  const fen = o ? fenetreVisible(zoom, o.tete, o.dureeSec) : { debut: 0, fin: 1 };
  const L = 934;
  const x = (s: number) => Math.max(0, Math.min(L, positionPx(s, fen, L)));
  const rel = o ? compteRelecture(o.retours) : { traites: 0, total: 0 };
  const planSel = o?.plans.find((pl) => pl.id === o.planSelectionneId);
  const graduations = o ? Array.from({ length: Math.floor((fen.fin - fen.debut) / 10) + 1 }, (_, i) => Math.ceil(fen.debut / 10) * 10 + i * 10).filter((s) => s <= fen.fin) : [];
  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR01">
      <PageHead
        titre={tm('titre')}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: tm('rushes'), onClick: p.onRushes ?? (() => undefined) }, { libelle: tm('nouvelle'), onClick: p.onNouvelle ?? (() => undefined) }]}
        primaire={{ libelle: o?.publiee ? tm('voir') : tm('preparer'), onClick: p.onPublication ?? (() => undefined) }}
      />
      <div className="cr-video-haut">
        <section className="cr-carte cr-videos" data-mvt="entree" aria-label={tm('liste.titre')}>
          <header><b>{tm('liste.titre')}</b><small>{tm('liste.enCours', { n: p.videos.filter((v) => v.pct > 0 && v.pct < 100).length })}</small>
            <button type="button" className="cr-plus" onClick={p.onNouvelle} aria-label={tm('liste.ajouter')}><Plus size={14} aria-hidden /></button></header>
          {p.videos.length === 0 ? <p className="cr-t3" style={{ padding: 18 }}>{tm('vide.titre')}</p> : (
            <ul>
              {p.videos.map((v) => (
                <li key={v.id}>
                  <button type="button" className="cr-videos__ligne sc-focus" data-actif={v.id === p.actifId} onClick={() => p.onChoisir(v.id)}>
                    <span className="cr-videos__vignette"><Play size={11} aria-hidden /></span>
                    <span className="cr-videos__texte"><b title={v.titre}>{v.titre}</b><small data-ton={v.ton}><i />{v.etat}</small></span>
                    <span className="cr-mono cr-videos__pct">{v.pct} %</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <footer className="cr-serie">
            <div><b>{tm('serie.titre')}</b><small>{tm('serie.n', { n: p.serie.faites })}</small></div>
            <div className="cr-serie__cases">{p.serie.cases.map((c, i) => <span key={c.debut}><i data-cochee={c.cochee}>{c.cochee ? '✓' : ''}</i><small>S{i + 1}</small></span>)}</div>
          </footer>
        </section>
        <section className="cr-carte cr-apercu" data-mvt="entree" aria-label={o?.titre ?? tm('titre')}>
          {o ? (
            <>
              <header><b>{o.titre}</b><small>{tm('apercu.version', { v: o.version ?? 1, duree: fmt(o.dureeSec) })}</small>
                <Segmente taille="compact" libelle={tm('apercu.format')} valeur={format} onChange={setFormat} options={['16:9', '9:16', '1:1'].map((f) => ({ cle: f, libelle: f }))} /></header>
              <div className="cr-apercu__cadre" data-format={format}>
                <span className="cr-mono cr-apercu__code">{codeTemporel(o.tete)}</span>
                <span className="cr-apercu__scene" aria-hidden />
                <span className="cr-apercu__reperes" aria-hidden><i /><i /><i /><i /></span>
              </div>
              <div className="cr-lecteur">
                <button type="button" className="cr-lecteur__lire" aria-label="Lecture"><Play size={14} aria-hidden /></button>
                <span className="cr-mono">{fmt(o.tete)}</span>
                <span className="cr-lecteur__barre"><i style={{ width: `${(o.tete / Math.max(1, o.dureeSec)) * 100}%` }} /></span>
                <span className="cr-mono cr-t3">{fmt(o.dureeSec)}</span>
                <Monitor size={14} aria-hidden />
              </div>
            </>
          ) : <p className="cr-t3" style={{ padding: 24 }}>{tm('vide.texte')}</p>}
        </section>
        <aside className="cr-video-droite">
          <section className="cr-carte cr-relecture" data-mvt="entree" aria-label={tm('relecture.titre')}>
            <header><b>{tm('relecture.titre')}</b><small>{o ? compte(langue, 'video.relecture', rel.traites, { t: rel.traites, total: rel.total }) : ''}</small></header>
            <span className="cr-relecture__barre"><i style={{ width: `${rel.total ? (rel.traites / rel.total) * 100 : 0}%` }} /></span>
            {!o || o.retours.length === 0 ? <p className="cr-t3" style={{ padding: 14 }}>{tm('relecture.rien')}</p> : o.retours.map((c) => (
              <div key={c.id} className="cr-retour" data-etat={c.etat}>
                <span className="cr-avatar cr-avatar--m">{c.auteur[0]}</span>
                <div><span className="cr-mono cr-retour__t">{fmt(c.t)}</span><p>{c.texte}</p></div>
                <small>{c.etat === 'À traiter' ? tm('relecture.aTraiter') : <em>{tm('relecture.traite')}</em>}</small>
              </div>
            ))}
          </section>
          {p.suggestion && (
            <SuggestionAjmani
              titre={tm('suggestion.titre')}
              texte={tm('suggestion.texte')}
              primaire={{ libelle: tm('suggestion.preparer'), onClick: p.onPreparer ?? (() => undefined) }}
              secondaire={{ libelle: tm('suggestion.non'), onClick: p.onNon ?? (() => undefined) }}
            />
          )}
        </aside>
      </div>
      <section className="cr-carte cr-frise" data-mvt="entree" aria-label={tm('frise.titre')}>
        <header>
          <b>{tm('frise.titre')}</b>
          <small>{o ? (planSel ? tm('frise.sous', { duree: fmt(o.dureeSec), plan: planSel.nom }) : tm('frise.sansPlan', { duree: fmt(o.dureeSec) })) : ''}</small>
          <span className="cr-direct cr-frise__etat">{p.enregistre}</span>
          <Segmente taille="compact" libelle={tm('frise.titre')} valeur={zoom} onChange={(z) => setZoom(z as ZoomFrise)} options={(['tout', '30s', '10s'] as const).map((z) => ({ cle: z, libelle: tm(`frise.zoom.${z}` as CleMR01) }))} />
        </header>
        {o && (
          <div className="cr-frise__corps">
            <div className="cr-pistes-noms">
              <div><Video size={14} aria-hidden /><span><b>{tm('piste.video')}</b><small>{nb('piste.plans', o.plans.length)}</small></span></div>
              <div><FileText size={14} aria-hidden /><span><b>{tm('piste.soustitres')}</b><small>{nb('piste.phrases', o.sousTitres.length)}</small></span></div>
              <div><Mic size={14} aria-hidden /><span><b>{tm('piste.voix')}</b><small>{nb('piste.prises', o.voix.length)}</small></span></div>
              <div><AudioWaveform size={14} aria-hidden /><span><b>{tm('piste.musique')}</b><small>{o.musique ? `ambiance, ${o.musique.niveauDb} dB` : ''}</small></span></div>
            </div>
            <div className="cr-pistes" style={{ width: L }}>
              <div className="cr-regle cr-mono">{graduations.map((s) => <span key={s} style={{ left: x(s) }}>{fmt(s)}</span>)}</div>
              {marqueursDeRegle(o.retours).map((m) => <i key={m.id} className="cr-repere" data-ton={m.ton} style={{ left: x(m.t) }} />)}
              <div className="cr-piste">
                {o.plans.length === 0 ? <span className="cr-piste__vide">{tm('piste.vide.video')}</span> : o.plans.map((pl) => (
                  <span key={pl.id} className="cr-clip" data-sel={pl.id === o.planSelectionneId} style={{ left: x(pl.debut), width: Math.max(0, x(pl.fin) - x(pl.debut) - 2) }} title={pl.nom}>{pl.nom}</span>
                ))}
              </div>
              <div className="cr-piste">
                {o.sousTitres.length === 0 ? <span className="cr-piste__vide">{tm('piste.vide.soustitres')}</span> : o.sousTitres.map((s, i) => (
                  <span key={i} className="cr-clip cr-clip--texte" data-retour={s.retour} style={{ left: x(s.debut), width: Math.max(0, x(s.fin) - x(s.debut) - 2) }} title={s.texte}>{s.texte}</span>
                ))}
              </div>
              <div className="cr-piste">
                {o.voix.length === 0 ? <span className="cr-piste__vide">{tm('piste.vide.voix')}</span> : o.voix.map((v, i) => <span key={i} className="cr-clip cr-clip--voix" style={{ left: x(v.debut), width: Math.max(0, x(v.fin) - x(v.debut) - 2) }} />)}
              </div>
              <div className="cr-piste cr-piste--musique">{o.musique ? <span className="cr-onde" /> : <span className="cr-piste__vide">{tm('piste.vide.musique')}</span>}</div>
              <span className="cr-tete" style={{ left: x(o.tete) }}><b className="cr-mono">{fmt(o.tete)}</b></span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
