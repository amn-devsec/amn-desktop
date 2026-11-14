import React, { useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Image as ImageIcon, Link2, Lock, MapPin, Plus } from 'lucide-react';
import { AnneauProgression, PageHead, Segmente, SuggestionAjmani } from '../../../../socle/ui';
import { FilterChips } from '../../../../socle/ui/vivant';
import { capitale, ecartJours, JOURS_COURTS, jourEtMois, type Jour } from '../../commun';
import {
  apparier, comptesParPhase, completude, detailDeLigne, dossierACompleter, joursDeTravaux, memeCadrage, planchePhotosParJour,
  type DossierEntree, type Phase, type PhotoEntree, type TonCompletude,
} from '../../photos';
import { useMots, type CleMR10 } from './textes';

export interface PhotoVue extends PhotoEntree {
  /** L'image (lue en `data:` dans le dépôt) ; sans elle, la vignette est un repère dessiné. */
  src?: string;
  auteur?: string;
}
export interface DossierVue extends DossierEntree {
  nom: string;
  photos: readonly PhotoVue[];
  /** Le prénom de la personne à rappeler. */
  responsable?: string;
}

export interface VuePhotosProps {
  dossiers: DossierVue[];
  ouvertId: string | null;
  onOuvrir: (id: string) => void;
  aujourdhui: Jour;
  onAjouter?: () => void;
  onPartager?: () => void;
  onSignature?: () => void;
  onRappeler?: (dossierId: string) => void;
  onNon?: () => void;
  suggestionMasquee?: boolean;
}

type Mode = 'glisser' | 'cote' | 'superposer';
const TON_ANNEAU: Record<Exclude<TonCompletude, 'pointille'>, 'succes' | 'info' | 'attention'> = { vert: 'succes', bleu: 'info', orange: 'attention' };
const nombre = (tm: (c: CleMR10, p?: Record<string, string | number>) => string, base: 'photo' | 'jour' | 'liste', n: number) => tm(`${base}.${Math.abs(n) >= 2 ? 'n' : '1'}` as CleMR10, { n });

/** Un repère dessiné quand la photo n'a pas d'image : le gris de décor, jamais un état. */
function Repere({ phase, grand = false }: { phase: Phase; grand?: boolean }) {
  return (
    <svg className="cr-ph-scene" viewBox="0 0 806 288" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false" data-phase={phase} data-grand={grand}>
      <rect width="806" height="288" className="cr-ph-scene__fond" />
      {phase === 'Après' ? (
        <>
          <rect x="520" y="20" width="250" height="230" rx="6" className="cr-ph-scene__verre" />
          <rect x="300" y="110" width="200" height="60" rx="6" className="cr-ph-scene__meuble" />
          <circle cx="680" cy="52" r="14" className="cr-ph-scene__lampe" />
        </>
      ) : (
        <>
          <path d="M360 20l30 60-20 40 30 50" className="cr-ph-scene__trait" />
          <rect x="140" y="40" width="30" height="30" className="cr-ph-scene__trou" />
          <rect x="230" y="30" width="50" height="22" className="cr-ph-scene__trou" />
          <ellipse cx="380" cy="190" rx="60" ry="12" className="cr-ph-scene__meuble" />
          <rect x="372" y="190" width="16" height="60" className="cr-ph-scene__meuble" />
        </>
      )}
    </svg>
  );
}

function Image({ photo, grand = false }: { photo: PhotoVue; grand?: boolean }) {
  return photo.src ? <img className="cr-ph-img" src={photo.src} alt="" /> : <Repere phase={photo.phase} grand={grand} />;
}

export function VuePhotos(p: VuePhotosProps) {
  const { tm, langue } = useMots();
  const [mode, setMode] = useState<Mode>('glisser');
  const [curseur, setCurseur] = useState(54);
  const [fondu, setFondu] = useState(50);
  const [puce, setPuce] = useState<'tout' | Phase>('tout');
  const cadre = useRef<HTMLDivElement>(null);
  const jour = (j: Jour) => jourEtMois(j, langue);
  /** « mardi » dans la semaine qui vient, sinon « 4 nov. » (début prévu d'un chantier à venir). */
  const quand = (j: Jour) => {
    const ecart = ecartJours(p.aujourdhui, j);
    return ecart > 0 && ecart < 7 ? new Intl.DateTimeFormat(langue, { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${j}T00:00:00Z`)) : jour(j);
  };
  const jourLong = (j: Jour) => `${capitale(JOURS_COURTS[langue][(new Date(`${j}T00:00:00Z`).getUTCDay() + 6) % 7])} ${jour(j)}`;

  const ouvert = p.dossiers.find((d) => d.id === p.ouvertId) ?? p.dossiers[0] ?? null;
  const comptes = comptesParPhase(ouvert?.photos ?? []);
  const compl = ouvert ? completude(ouvert) : null;
  const planche = useMemo(() => planchePhotosParJour((ouvert?.photos ?? []).filter((x) => puce === 'tout' || x.phase === puce)), [ouvert, puce]);

  /** La paire comparée : la première photo avant (la plus ancienne) et son appariement, sinon la dernière photo après. */
  const paire = useMemo(() => {
    const photos = ouvert?.photos ?? [];
    const avants = photos.filter((x) => x.phase === 'Avant').sort((a, b) => a.le.localeCompare(b.le));
    const apres = photos.filter((x) => x.phase === 'Après').sort((a, b) => b.le.localeCompare(a.le));
    const avant = avants[0] ?? null;
    const apresChoisie = (avant ? apparier(avant, photos) : null) ?? apres[0] ?? null;
    return { avant, apres: apresChoisie };
  }, [ouvert]);

  const suggestion = useMemo(() => dossierACompleter(p.dossiers, p.aujourdhui), [p.dossiers, p.aujourdhui]);
  const travaux = ouvert ? joursDeTravaux(ouvert.photos) : null;
  const lieu = paire.avant?.lieu ?? null;

  const placer = (clientX: number) => {
    const r = cadre.current?.getBoundingClientRect();
    if (r && r.width > 0) setCurseur(Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100))));
  };

  const sous = ouvert && compl && compl.fournis === 3 ? `${tm('sous')} · ${tm('sous.complet', { nom: ouvert.nom })}` : tm('sous');

  return (
    <div className="cr-page" data-famille="creer" data-ecran="MR10">
      <PageHead
        titre={tm('titre')}
        sousTitre={sous}
        secondaires={[{ libelle: tm('partager'), onClick: p.onPartager, icone: <Link2 size={14} aria-hidden />, disabled: !p.onPartager, infobulle: p.onPartager ? undefined : tm('partager.indispo') }]}
        primaire={{ libelle: tm('ajouter'), onClick: p.onAjouter ?? (() => undefined), icone: <Plus size={14} aria-hidden /> }}
      />
      {p.dossiers.length === 0 || !ouvert || !compl ? (
        <section className="cr-carte cr-fl-vide"><ImageIcon size={28} aria-hidden /><h2>{tm('vide.titre')}</h2><p className="cr-t3">{tm('vide.texte')}</p></section>
      ) : (
        <div className="cr-ph">
          <div className="cr-ph__gauche">
            <section className="cr-carte cr-ph-liste" data-mvt="entree" aria-label={tm('liste.titre')}>
              <header><b>{tm('liste.titre')}</b><small>{nombre(tm, 'liste', p.dossiers.length)}</small></header>
              <ul>
                {p.dossiers.map((d) => {
                  const c = completude(d);
                  const det = detailDeLigne(d);
                  const avenir = c.ton === 'pointille';
                  const actif = d.id === ouvert.id;
                  return (
                    <li key={d.id}>
                      <button type="button" className="cr-ph-ligne sc-focus" data-actif={actif} data-avenir={avenir} aria-pressed={actif} onClick={() => p.onOuvrir(d.id)}>
                        <span className="cr-ph-vignette" aria-hidden>{avenir ? <ImageIcon size={14} /> : <i />}</span>
                        <span className="cr-ph-ligne__texte">
                          <b>{d.nom}</b>
                          <small>{det.type === 'photos' ? `${nombre(tm, 'photo', det.photos)} · ${nombre(tm, 'jour', det.jours)}` : det.type === 'avant-seulement' ? tm('detail.avant', { photos: nombre(tm, 'photo', d.photos.length) }) : det.le ? tm('detail.debut', { quand: quand(det.le) }) : tm('detail.debutInconnu')}</small>
                        </span>
                        {avenir ? (
                          <span className="cr-ph-avenir"><i aria-hidden /><small className="cr-mono">{tm('avenir')}</small></span>
                        ) : (
                          <span className="cr-ph-anneau">
                            <AnneauProgression valeur={c.pct / 100} libelle={tm('complet.libelle', { pct: c.pct })} taille={26} epaisseur={3} ton={TON_ANNEAU[c.ton as 'vert' | 'bleu' | 'orange']}><span className="sr-only">{c.pct}</span></AnneauProgression>
                            <small className="cr-mono" data-ton={c.ton}>{c.pct}&#8239;%</small>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <footer>
                <span><MapPin size={13} aria-hidden />{tm('pied.lieu')}</span>
                <span><Lock size={13} aria-hidden />{tm('pied.lien')}</span>
              </footer>
            </section>
            {suggestion && !p.suggestionMasquee && (
              <SuggestionAjmani
                titre={tm('suggestion.titre', { nom: suggestion.nom })}
                texte={tm('suggestion.texte', { nom: suggestion.nom, qui: suggestion.responsable ?? '—' })}
                primaire={{ libelle: tm('suggestion.rappeler'), onClick: () => p.onRappeler?.(suggestion.id) }}
                secondaire={{ libelle: tm('suggestion.non'), onClick: p.onNon ?? (() => undefined) }}
              />
            )}
          </div>
          <div className="cr-ph__droite">
            <section className="cr-carte cr-ph-comp" data-mvt="entree" aria-label={tm('comp.titreSans')}>
              <header>
                <b>{lieu ? tm('comp.titre', { lieu }) : tm('comp.titreSans')}</b>
                <small>{travaux !== null ? tm('comp.sous', { nom: ouvert.nom, jours: nombre(tm, 'jour', travaux) }) : tm('comp.sousNom', { nom: ouvert.nom })}</small>
                <Segmente libelle={tm('mode.libelle')} taille="compact" valeur={mode} onChange={(c) => setMode(c as Mode)} options={[{ cle: 'glisser', libelle: tm('mode.glisser') }, { cle: 'cote', libelle: tm('mode.cote') }, { cle: 'superposer', libelle: tm('mode.superposer') }]} />
              </header>
              {!paire.avant && !paire.apres ? (
                <div className="cr-ph-cadre cr-ph-cadre--vide"><span>{tm('comp.vide')}</span></div>
              ) : !paire.avant || !paire.apres ? (
                <div className="cr-ph-cadre">
                  <div className="cr-ph-couche"><Image photo={(paire.avant ?? paire.apres) as PhotoVue} grand /></div>
                  <span className="cr-ph-badge" data-cote="g"><b>{tm(`badge.${((paire.avant ?? paire.apres) as PhotoVue).phase}` as CleMR10)}</b> {jour(((paire.avant ?? paire.apres) as PhotoVue).le)}</span>
                  <span className="cr-ph-pointille">{tm(paire.avant ? 'comp.sansApres' : 'comp.sansAvant')}</span>
                </div>
              ) : (
                <div ref={cadre} className="cr-ph-cadre" data-mode={mode} onPointerDown={mode === 'glisser' ? (e) => { e.currentTarget.setPointerCapture(e.pointerId); placer(e.clientX); } : undefined} onPointerMove={mode === 'glisser' ? (e) => { if (e.buttons === 1) placer(e.clientX); } : undefined}>
                  <div className="cr-ph-couche"><Image photo={paire.avant} grand /></div>
                  <div className="cr-ph-couche cr-ph-couche--apres" style={mode === 'glisser' ? { clipPath: `inset(0 0 0 ${curseur}%)` } : mode === 'superposer' ? { opacity: fondu / 100 } : undefined}><Image photo={paire.apres} grand /></div>
                  <span className="cr-ph-badge" data-cote="g"><b>{tm('badge.Avant')}</b> {jour(paire.avant.le)}{paire.avant.auteur ? ` · ${paire.avant.auteur}` : ''}</span>
                  <span className="cr-ph-badge" data-cote="d"><b>{tm('badge.Après')}</b> {jour(paire.apres.le)}{paire.apres.auteur ? ` · ${paire.apres.auteur}` : ''}</span>
                  {memeCadrage(paire.avant, paire.apres) && <span className="cr-ph-meme"><Check size={12} aria-hidden />{tm('meme')}</span>}
                  {mode === 'glisser' && (
                    <div
                      className="cr-ph-poignee sc-focus"
                      role="slider"
                      tabIndex={0}
                      aria-label={tm('curseur')}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={curseur}
                      style={{ left: `${curseur}%` }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') { e.preventDefault(); setCurseur((v) => Math.max(0, v - 5)); }
                        if (e.key === 'ArrowRight') { e.preventDefault(); setCurseur((v) => Math.min(100, v + 5)); }
                      }}
                    >
                      <i aria-hidden /><b aria-hidden><ChevronLeft size={12} /><ChevronRight size={12} /></b>
                    </div>
                  )}
                  {mode === 'superposer' && <label className="cr-ph-fondu"><span>{tm('fondu')}</span><input type="range" min={0} max={100} value={fondu} onChange={(e) => setFondu(Number(e.target.value))} /></label>}
                </div>
              )}
            </section>
            <section className="cr-carte cr-ph-planche" data-mvt="entree" aria-label={tm('planche.titre')}>
              <header>
                <b>{tm('planche.titre')}</b>
                <FilterChips libelle={tm('planche.phase')} valeur={puce} onChange={(c) => setPuce(c as 'tout' | Phase)} puces={[
                  { cle: 'tout', libelle: tm('puce.tout'), compteur: comptes.total },
                  { cle: 'Avant', libelle: tm('puce.Avant'), compteur: comptes.Avant },
                  { cle: 'Pendant', libelle: tm('puce.Pendant'), compteur: comptes.Pendant },
                  { cle: 'Après', libelle: tm('puce.Après'), compteur: comptes['Après'] },
                ]} />
              </header>
              {planche.length === 0 ? (
                <p className="cr-t3 cr-ph-rien">{compl.ton === 'pointille' && detailDeLigne(ouvert).type === 'debut-prevu' && (detailDeLigne(ouvert) as { le: Jour | null }).le ? tm('planche.avenir', { quand: quand((detailDeLigne(ouvert) as { le: Jour }).le) }) : tm('planche.rien')}</p>
              ) : (
                <div className="cr-ph-jours">
                  {planche.map((j) => (
                    <div key={j.jour} className="cr-ph-jour">
                      <span className="cr-ph-jour__nom"><b>{jourLong(j.jour)}</b><small data-phase={j.phaseDominante}><i aria-hidden />{tm('planche.jourPhase', { phase: tm(`badge.${j.phaseDominante}` as CleMR10), photos: nombre(tm, 'photo', j.total) })}</small></span>
                      <div className="cr-ph-vignettes">
                        {j.vignettes.map((v, i) => {
                          const comparee = v.id === paire.avant?.id || v.id === paire.apres?.id;
                          const dernier = j.plus > 0 && i === j.vignettes.length - 1;
                          return dernier
                            ? <span key={v.id} className="cr-ph-plus">{tm('plus', { n: j.plus })}</span>
                            : <span key={v.id} className="cr-ph-mini" data-phase={v.phase} data-comparee={comparee} role="img" aria-label={tm('photo.aria', { phase: tm(`badge.${v.phase}` as CleMR10), date: jour(v.le) })}>{(v as PhotoVue).src ? <img src={(v as PhotoVue).src} alt="" /> : <i aria-hidden />}</span>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <footer>
                <b>{tm('dossier.titre')}</b>
                <span className="cr-ph-case" data-fait={!compl.manque.includes('avant')}><i>{!compl.manque.includes('avant') ? '✓' : ''}</i>{tm('dossier.avant')}</span>
                <span className="cr-ph-case" data-fait={!compl.manque.includes('apres')}><i>{!compl.manque.includes('apres') ? '✓' : ''}</i>{tm('dossier.apres')}</span>
                <button type="button" className="cr-ph-case sc-focus" data-fait={!compl.manque.includes('signature')} onClick={p.onSignature}><i>{!compl.manque.includes('signature') ? '✓' : ''}</i>{tm('dossier.signature')}</button>
                <small>{tm('dossier.fait', { f: compl.fournis })}</small>
              </footer>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

