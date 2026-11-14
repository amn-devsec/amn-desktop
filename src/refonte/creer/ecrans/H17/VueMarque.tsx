import React, { useState } from 'react';
import { BookOpen, Download, Plus, Sparkles, X } from 'lucide-react';
import { PageHead } from '../../../../socle/ui';
import { compte } from '../../i18n';
import { CHAPITRES, etatDesChapitres, hexNormalise, partsDeCouleurs, progressionDuLivre, type ChapitreId, type CouleurMarque, type MarqueEntree } from '../../marque';
import { useMots, type CleH17 } from './textes';
import '../../creer.css';

export interface VueMarqueProps {
  /** Le nom de l'organisation (« AMN DevSec »). */
  nom: string;
  marque: MarqueEntree & { monogramme: string; modeleChoisi?: string };
  onImporter?: () => void;
  onExporter?: () => void;
  onCreerVisuel?: () => void;
  /** Copie un code de couleur (le presse-papiers est celui de l'appelant). */
  onCopier?: (hex: string) => void;
}

const TUILES_EVITER: { cle: 'etire' | 'penche' | 'charge' | 'effets' }[] = [{ cle: 'etire' }, { cle: 'penche' }, { cle: 'charge' }, { cle: 'effets' }];

function Logo({ nom, monogramme, taille = 40 }: { nom: string; monogramme: string; taille?: number }) {
  return (
    <span className="cr-logo" style={{ ['--t' as string]: `${taille}px` }}>
      <span className="cr-logo__symbole">{monogramme}</span>
      {taille >= 30 && <span className="cr-logo__nom">{nom}</span>}
    </span>
  );
}

export function VueMarque(p: VueMarqueProps) {
  const { tm, langue } = useMots();
  const [actif, setActif] = useState<ChapitreId>('logo');
  const [copie, setCopie] = useState<string | null>(null);
  const m = p.marque;
  const chapitres = etatDesChapitres(m);
  const complets = chapitres.filter((c) => c.complet).length;
  const parts = partsDeCouleurs(m.palette);
  const roles = new Map<string, string | undefined>(m.palette.map((c: CouleurMarque) => [c.nom, c.role]));
  const nums = ['01', '02', '03', '04', '05'];
  const graisses = m.typographie?.graisses ?? [];
  const copier = (hex: string) => {
    p.onCopier?.(hex);
    setCopie(hex);
  };
  const etat = m.modifieePar && m.modifieeLe
    ? tm('etat', { chapitres: compte(langue, 'marque.chapitres', complets, { total: CHAPITRES.length }), qui: m.modifieePar, jour: m.modifieeLe })
    : tm('etat.sansDate', { chapitres: compte(langue, 'marque.chapitres', complets, { total: CHAPITRES.length }) });
  const variantes = [
    { cle: 'noir', formats: 'SVG · PNG' },
    { cle: 'clair', formats: 'SVG · PNG' },
    { cle: 'symbole', formats: 'SVG · PNG' },
  ] as const;
  return (
    <div className="cr-page" data-famille="creer" data-ecran="H17">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sous', { nom: p.nom })}
        secondaires={[{ libelle: tm('importer'), onClick: p.onImporter ?? (() => undefined) }]}
        primaire={{ libelle: tm('exporter'), onClick: p.onExporter ?? (() => undefined), disabled: m.logos.length === 0 }}
      />
      <nav className="cr-sommaire" aria-label={tm('livre')}>
        <span className="cr-sommaire__livre"><BookOpen size={15} aria-hidden /> {tm('livre')}</span>
        {CHAPITRES.map((c, i) => (
          <button key={c} type="button" className="cr-sommaire__entree sc-focus" data-actif={actif === c} onClick={() => setActif(c)} aria-current={actif === c ? 'true' : undefined}>
            <span className="cr-mono">{nums[i]}</span> {tm(`chap.${c}` as CleH17)}
            {!chapitres[i].complet && <i className="cr-sommaire__manque" aria-hidden />}
          </button>
        ))}
        <span className="cr-sommaire__etat"><i className="cr-anneau-mini" style={{ ['--pct' as string]: progressionDuLivre(m) }} />{etat}</span>
      </nav>
      <section className="cr-carte cr-livre" data-mvt="entree">
        <div className="cr-livre__page cr-livre__page--gauche">
          <h2><span className="cr-mono cr-fam">01</span> {tm('chap.logo')} <small>{tm('logo.sous')}</small></h2>
          {m.logos.length === 0 ? (
            <div className="cr-vide-page"><b>{tm('vide.logo')}</b><button type="button" className="cr-bouton-verre" onClick={p.onImporter}>{tm('vide.importer')}</button></div>
          ) : (
            <div className="cr-logo-zone">
              <div className="cr-logo-tuile">
                <span className="cr-mono cr-logo-tuile__cote">x</span>
                <div className="cr-logo-tuile__cadre"><Logo nom={p.nom} monogramme={m.monogramme} /></div>
                <small>{tm('logo.zone')}</small>
              </div>
              <ul className="cr-variantes">
                {variantes.map((v) => (
                  <li key={v.cle} className="cr-variante" data-variante={v.cle}>
                    <span className="cr-variante__apercu"><Logo nom={p.nom} monogramme={m.monogramme} taille={v.cle === 'symbole' ? 18 : 14} /></span>
                    <span><b>{tm(`variante.${v.cle}` as CleH17)}</b><small className="cr-mono">{v.formats.replace(/ · /, ' · ')}</small></span>
                    <Download size={13} aria-hidden />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="cr-regles">
            <div className="cr-sous-carte"><small>{tm('regle.taille')}</small><b>{tm('regle.tailleVal', { px: 24, mm: 16 })}</b></div>
            <div className="cr-sous-carte"><small>{tm('regle.marge')}</small><b>{tm('regle.margeVal')}</b></div>
            <div className="cr-sous-carte"><small>{tm('regle.formats')}</small><b>SVG, PNG, PDF</b></div>
          </div>
          <small className="cr-mono cr-livre__num">{tm('page', { n: 2 })}</small>
        </div>
        <div className="cr-livre__page cr-livre__page--droite">
          <h2><span className="cr-mono cr-fam">02</span> {tm('chap.couleurs')} <small>{tm('couleurs.sous')}</small><em>{tm('couleurs.copier')}</em></h2>
          {m.palette.length === 0 ? <p className="cr-t3">{tm('vide.couleurs')}</p> : (
            <>
              <div className="cr-proportions" role="img" aria-label={tm('couleurs.sous')}>
                {parts.map((c) => <span key={c.nom} style={{ width: `${c.part}%`, background: c.hex }} title={`${c.nom} ${c.part} %`}>{c.etiquette && <small className="cr-mono">{c.part} %</small>}</span>)}
              </div>
              <div className="cr-pastilles">
                {m.palette.map((c) => {
                  const hex = hexNormalise(c.hex) ?? c.hex;
                  return (
                    <button key={c.nom} type="button" className="cr-pastille-couleur sc-focus" data-copie={copie === hex} onClick={() => copier(hex)}>
                      <i style={{ background: hex }} />
                      <span><b>{c.nom} <small className="cr-mono">{hex}</small></b><small>{roles.get(c.nom) ?? ''}</small></span>
                      {copie === hex && <em>{tm('couleurs.copie')}</em>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          <h2 className="cr-livre__typo"><span className="cr-mono cr-fam">03</span> {tm('chap.typographie')} {m.typographie && <small>{tm('typo.sous', { famille: m.typographie.famille, min: Math.min(...graisses), max: Math.max(...graisses) })}</small>}</h2>
          {m.typographie ? (
            <div className="cr-typo">
              <div className="cr-typo__aa"><b>Aa</b><small>{m.typographie.famille}</small></div>
              <dl>
                {([['titrePage', '28 / 600'], ['titreCarte', '15 / 600'], ['texte', '13,5 / 400'], ['etiquette', '11 / 500']] as const).map(([k, taille]) => (
                  <div key={k}><dt>{tm(`typo.${k}` as CleH17)}</dt><dd className="cr-mono">{taille}</dd><dd className={`cr-typo__ex cr-typo__ex--${k}`}>{tm(`typo.exemple.${k}` as CleH17)}</dd></div>
                ))}
              </dl>
            </div>
          ) : <p className="cr-t3">{tm('nonDisponible')}</p>}
          <small className="cr-mono cr-livre__num">{tm('page', { n: 5 })}</small>
        </div>
      </section>
      <div className="cr-marque-bas">
        <section className="cr-carte cr-modeles" data-mvt="entree">
          <header><h2><span className="cr-mono cr-fam">04</span> {tm('modeles.titre')} <small>{tm('modeles.sous')}</small></h2><button type="button" className="cr-bouton-verre" onClick={p.onCreerVisuel}><Plus size={14} aria-hidden /> {tm('modeles.creer')}</button></header>
          <div className="cr-modeles__liste">
            {m.modelesVisuels.length === 0 ? <p className="cr-t3">{tm('nonDisponible')}</p> : m.modelesVisuels.slice(0, 4).map((mo) => (
              <div key={mo.nom} className="cr-modele" data-choisi={m.modeleChoisi === mo.nom}>
                <span className="cr-modele__apercu"><Logo nom={p.nom} monogramme={m.monogramme} taille={14} /></span>
                <b>{mo.nom}</b>
                <small className="cr-mono">{mo.largeur && mo.hauteur ? `${mo.largeur} × ${mo.hauteur}` : mo.format}{m.modeleChoisi === mo.nom && <em> {tm('modeles.choisi')}</em>}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="cr-carte cr-eviter" data-mvt="entree">
          <header><h2><span className="cr-mono cr-fam">05</span> {tm('eviter.titre')}</h2><span className="cr-eviter__verifie"><Sparkles size={12} aria-hidden /> {tm('eviter.verifie')}</span></header>
          <div className="cr-eviter__liste">
            {TUILES_EVITER.map((t) => (
              <div key={t.cle} className="cr-mauvais" data-cas={t.cle}>
                <span className="cr-mauvais__apercu"><X size={11} aria-hidden className="cr-mauvais__croix" /><Logo nom={p.nom} monogramme={m.monogramme} taille={t.cle === 'etire' ? 28 : 14} /></span>
                <small>{tm(`eviter.${t.cle}` as CleH17)}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
