import React, { useState } from 'react';
import { AlertCircle, Download, MessageSquareQuote, Send, Star, X } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { Avatar } from '../../../socle/ui/Pastilles';
import { BlocEtat } from '../../../socle/ui/situations';
import { FilterChips } from '../../../socle/ui/vivant';
import { MiniCourbe } from '../../../socle/ui';
import { filtrerMur, repartirMur, type CarteAvis, type FiltreMur, type ModeleRetours } from './modele';
import { DemiJauge } from './DemiJauge';
import { useMotsRetours } from './i18n';
import { moisCourt } from '../clients/formats';
import './retours.css';
import '../cibles.css';

/**
 * « RETOURS CLIENTS » (H44) — la mesure à gauche, le mur des citations à droite : mise en page et états, sans accès aux données.
 *
 * Disposition (fiche H44, zone principale de 1108 px) : en-tête (titre, sous-titre, « Exporter », « Demander un avis »),
 * colonne gauche de 330 px (« Recommandation » 239, « Ce qui revient » 245, « Collecter des avis » 152, écart 14), puis le
 * mur à x = 388 : une ligne de titre, trois colonnes indépendantes de 245 px dont la dernière carte s'étire jusqu'au bas.
 */
export interface ActionsRetours {
  exporter: () => void;
  demander: () => void;
  repondre: (carteId: string) => void;
  ouvrir: (carteId: string) => void;
  reessayer: () => void;
}

export interface VueRetoursProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleRetours;
  actions: ActionsRetours;
  lecture?: boolean;
  /** Le jour de référence : « il y a N j » se calcule contre lui. */
  aujourdhui: string;
}

/** Sept cartes au départ (3 + la carte « À répondre » + 3 sur l'image) ; « Voir plus d'avis » en ajoute neuf. */
const LIMITE_DE_DEPART = 7;
const PAS_DE_LIMITE = 9;

export function VueRetours({ statut, horsLigne = false, modele, actions, lecture = false, aujourdhui }: VueRetoursProps) {
  const { tm } = useMotsRetours();
  const [filtre, setFiltre] = useState<FiltreMur>('tous');
  const [theme, setTheme] = useState<string | null>(null);
  const [limite, setLimite] = useState(LIMITE_DE_DEPART);

  const sous = modele.nbAvis === 0
    ? tm('sousTitre.aucun')
    : `${tm('sousTitre', { pos: modele.positifs, n: modele.nbAvis })}${modele.chips.aRepondre > 0 ? tm(modele.chips.aRepondre === 1 ? 'sousTitre.repondre.1' : 'sousTitre.repondre.n', { n: modele.chips.aRepondre }) : ''}`;
  const visibles = filtrerMur(modele.avis, filtre, theme);
  const miseEnAvant = modele.aRepondre && visibles.some((c) => c.id === modele.aRepondre?.carte.id) && filtre !== 'cinqEtoiles' ? modele.aRepondre.carte.id : null;
  const reste = visibles.filter((c) => c.id !== miseEnAvant);
  const vedette = miseEnAvant ? visibles.find((c) => c.id === miseEnAvant) : undefined;
  const montrees = [...(vedette ? [vedette] : []), ...reste.slice(0, limite - (vedette ? 1 : 0))];
  const plus = reste.length > limite - (vedette ? 1 : 0);
  const colonnes = repartirMur(montrees, miseEnAvant);

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sous}
        secondaires={[{ libelle: tm('action.exporter'), onClick: actions.exporter, icone: <Download size={14} strokeWidth={2} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.demander'), onClick: actions.demander, icone: <Send size={14} strokeWidth={2} /> }}
        className="sc-rt__entete"
      />
      {horsLigne && <p className="sc-rt__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-rt" aria-busy={statut === 'chargement' || undefined}>
          <div className="sc-rt-gauche">
            <Recommandation modele={modele} aujourdhui={aujourdhui} />
            <Themes modele={modele} theme={theme} onTheme={(t) => { setTheme(t); }} />
            <section className="sc-rt-carte sc-rt-collecte" aria-label={tm('collecte.titre')}>
              <h2 className="sc-rt-carte__titre">{tm('collecte.titre')}</h2>
              <p className="sc-rt-vide">{tm('collecte.indisponible')}</p>
            </section>
          </div>
          <div className="sc-rt-mur">
            <div className="sc-rt-mur__tete">
              <h2 className="sc-rt-mur__titre">{tm('mur.titre')}</h2>
              <FilterChips
                libelle={tm('mur.puces')}
                puces={[
                  { cle: 'tous', libelle: tm('mur.puce.tous'), compteur: modele.chips.tous },
                  { cle: 'aRepondre', libelle: tm('mur.puce.aRepondre'), compteur: modele.chips.aRepondre },
                  { cle: 'cinqEtoiles', libelle: tm('mur.puce.cinqEtoiles'), compteur: modele.chips.cinqEtoiles },
                ]}
                valeur={filtre}
                onChange={(c) => setFiltre(c as FiltreMur)}
              />
              {theme && (
                <button type="button" className="sc-rt-theme-puce" onClick={() => setTheme(null)} aria-label={tm('mur.theme.retirer')}>{tm('mur.theme', { theme })}<X size={12} strokeWidth={2.2} aria-hidden /></button>
              )}
              <span className="sc-rt-mur__tri">{tm('mur.tri')}</span>
            </div>
            {statut === 'pret' && modele.avis.length === 0 ? (
              <BlocEtat icone={<MessageSquareQuote size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.vide.titre')} texte={tm('etat.vide.texte')} actions={lecture ? <span /> : <Bouton variante="primaire" onClick={actions.demander}>{tm('action.demander')}</Bouton>} />
            ) : visibles.length === 0 && statut === 'pret' ? (
              <BlocEtat icone={<MessageSquareQuote size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('mur.aucun')} actions={<Bouton variante="secondaire" onClick={() => { setFiltre('tous'); setTheme(null); }}>{tm('mur.aucun.effacer')}</Bouton>} />
            ) : (
              <div className="sc-rt-mur__colonnes" data-etendu={limite > LIMITE_DE_DEPART ? '' : undefined}>
                {colonnes.map((col, i) => (
                  <div key={i} className="sc-rt-colonne" data-vide={col.length === 0 ? '' : undefined}>
                    {col.map((c, k) => (
                      <CarteCitation key={c.id} c={c} aujourdhui={aujourdhui} dernier={k === col.length - 1} enAvant={c.id === miseEnAvant} modele={modele} onOuvrir={actions.ouvrir} onRepondre={actions.repondre} lecture={lecture} onTheme={setTheme} />
                    ))}
                    {statut === 'chargement' && Array.from({ length: 2 }, (_, k) => <div key={k} className="sc-rt-citation sc-rt-citation--squelette" aria-hidden />)}
                  </div>
                ))}
              </div>
            )}
            {plus && <Bouton variante="secondaire" taille="petit" onClick={() => setLimite((n) => n + PAS_DE_LIMITE)}>{tm('mur.plus')}</Bouton>}
          </div>
        </div>
      )}
    </Page>
  );
}

function Recommandation({ modele, aujourdhui }: { modele: ModeleRetours; aujourdhui: string }) {
  const { tm, langue } = useMotsRetours();
  const m = modele;
  const libelle = m.libelle ? tm(`reco.libelle.${m.libelle}` as const) : '';
  const moisRef = (() => { const d = new Date(`${aujourdhui}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 90); return d.toISOString().slice(0, 7); })();
  const courbe = m.courbe.filter((v): v is number => v != null);
  return (
    <section className="sc-rt-carte sc-rt-reco" aria-label={tm('reco.titre')}>
      <div className="sc-rt-carte__tete"><h2 className="sc-rt-carte__titre">{tm('reco.titre')}</h2><span className="sc-rt-carte__aide sc-nombre">{tm('reco.avis', { n: m.nbAvis })}</span></div>
      {m.score == null ? (
        <p className="sc-rt-vide">{tm('reco.aucun')}</p>
      ) : (
        <>
          <div className="sc-rt-reco__haut">
            <DemiJauge valeur={m.remplissage} score={String(m.score)} sur={tm('reco.sur')} libelle={tm('reco.jauge', { score: m.score, libelle })} />
            <div className="sc-rt-reco__texte">
              <span className="sc-rt-reco__libelle">{libelle}</span>
              {m.delta != null && <span className="sc-rt-reco__delta" data-sens={m.delta > 0 ? 'hausse' : m.delta < 0 ? 'baisse' : 'nul'}>{tm(m.delta > 0 ? 'reco.delta.hausse' : m.delta < 0 ? 'reco.delta.baisse' : 'reco.delta.nul', { n: Math.abs(m.delta), mois: moisCourt(moisRef, langue, false) })}</span>}
              <span className="sc-rt-reco__note-titre">{tm('reco.note')}</span>
              <span className="sc-rt-reco__note sc-nombre">{m.noteMoyenne != null ? m.noteMoyenne.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: 1 }) : '—'}<span className="sc-rt-reco__sur5"> {tm('reco.sur5')}</span></span>
            </div>
          </div>
          <div className="sc-rt-reco__barre" role="img" aria-label={tm('reco.repartition', { a: m.parts.recommandent, b: m.parts.neutres, c: m.parts.decus })}>
            <span data-part="rec" style={{ flexGrow: m.parts.recommandent }} /><span data-part="neu" style={{ flexGrow: m.parts.neutres }} /><span data-part="dec" style={{ flexGrow: m.parts.decus }} />
          </div>
          <div className="sc-rt-reco__legende sc-nombre"><span>{tm('reco.recommandent', { n: m.parts.recommandent })}</span><span>{tm('reco.neutres', { n: m.parts.neutres })}</span><span>{tm('reco.decus', { n: m.parts.decus })}</span></div>
          {courbe.length >= 2 && (
            <div className="sc-rt-reco__courbe">
              <span>{moisCourt(m.moisCourbe[0], langue, false)}</span>
              <MiniCourbe valeurs={courbe} libelle={tm('reco.courbe', { debut: moisCourt(m.moisCourbe[0], langue, false), fin: moisCourt(m.moisCourbe[1], langue, false) })} ton="succes" largeur={214} hauteur={30} />
              <span>{moisCourt(m.moisCourbe[1], langue, false)}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Themes({ modele, theme, onTheme }: { modele: ModeleRetours; theme: string | null; onTheme: (t: string | null) => void }) {
  const { tm } = useMotsRetours();
  return (
    <section className="sc-rt-carte sc-rt-themes" aria-label={tm('themes.titre')}>
      <div className="sc-rt-carte__tete"><h2 className="sc-rt-carte__titre">{tm('themes.titre')}</h2><span className="sc-rt-carte__aide">{tm('themes.sous')}</span></div>
      {modele.themes === null ? (
        <p className="sc-rt-vide">{tm('themes.indisponible')}</p>
      ) : (
        <ul className="sc-rt-themes__liste">
          {modele.themes.map((t) => (
            <li key={t.theme}>
              <button type="button" className="sc-rt-theme" data-couleur={t.couleur} aria-pressed={theme === t.theme} aria-label={tm('themes.filtrer', { theme: t.theme })} onClick={() => onTheme(theme === t.theme ? null : t.theme)}>
                <span className="sc-rt-theme__nom">{t.theme}</span>
                <span className="sc-rt-theme__barre" aria-hidden><span style={{ width: `${t.partPositive}%` }} /></span>
                <span className="sc-rt-theme__part sc-nombre">{t.partPositive} %</span>
                <span className="sc-rt-theme__avis sc-nombre">{tm(t.avis === 1 ? 'themes.avis.1' : 'themes.avis.n', { n: t.avis })}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Etoiles({ note, positif }: { note: number; positif: boolean }) {
  const { tm } = useMotsRetours();
  return (
    <span className="sc-rt-etoiles" data-ton={positif ? 'positif' : 'attention'} role="img" aria-label={tm('carte.etoiles', { n: note })}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={11} strokeWidth={0} fill={i <= note ? 'currentColor' : 'none'} className={i <= note ? '' : 'sc-rt-etoiles__vide'} />)}
    </span>
  );
}

function quand(date: string, aujourdhui: string, tm: ReturnType<typeof useMotsRetours>['tm'], langue: 'fr' | 'en'): string {
  const n = Math.round((Date.parse(`${aujourdhui}T12:00:00Z`) - Date.parse(`${date}T12:00:00Z`)) / 86_400_000);
  if (n <= 0) return tm('carte.aujourdhui');
  if (n === 1) return tm('carte.hier');
  if (n <= 14) return tm('carte.jours', { n });
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

function CarteCitation({ c, aujourdhui, dernier, enAvant, modele, onOuvrir, onRepondre, lecture, onTheme }: { c: CarteAvis; aujourdhui: string; dernier: boolean; enAvant: boolean; modele: ModeleRetours; onOuvrir: (id: string) => void; onRepondre: (id: string) => void; lecture: boolean; onTheme: (t: string) => void }) {
  const { tm, langue } = useMotsRetours();
  const rep = enAvant ? modele.aRepondre : null;
  return (
    <article className="sc-rt-citation" data-avant={enAvant ? '' : undefined} data-dernier={dernier ? '' : undefined}>
      {rep && (
        <div className="sc-rt-citation__tete">
          <span className="sc-rt-pastille-repondre"><span aria-hidden />{tm('repondre.pastille')}</span>
          <span className="sc-rt-citation__depuis">{tm(rep.depuisJours === 1 ? 'repondre.depuis.1' : 'repondre.depuis.n', { n: rep.depuisJours })}</span>
        </div>
      )}
      <button type="button" className="sc-rt-citation__corps" onClick={() => onOuvrir(c.id)} aria-label={tm('carte.ouvrir', { client: c.client })}>
        <span className="sc-rt-citation__guillemet" aria-hidden>“</span>
        <span className="sc-rt-citation__texte">{c.texte}</span>
      </button>
      {c.themes.length > 0 && <div className="sc-rt-citation__themes">
        {c.themes.map((t) => <button key={t} type="button" className="sc-rt-tag" onClick={() => onTheme(t)}>{t}</button>)}</div>}
      {rep && (
        <div className="sc-rt-reponse">
          {rep.factureEnRetard && <p className="sc-rt-reponse__facture"><span aria-hidden>€</span>{tm(rep.factureEnRetard.jours === 1 ? 'repondre.facture.1' : 'repondre.facture.n', { numero: rep.factureEnRetard.numero, jours: rep.factureEnRetard.jours })}</p>}
          {!lecture && <Bouton variante="secondaire" taille="petit" onClick={() => onRepondre(c.id)}>{tm('repondre.ajmani')}</Bouton>}
          <p className="sc-rt-reponse__aide">{tm('repondre.aide')}</p>
        </div>
      )}
      <div className="sc-rt-citation__pied">
        <Avatar nom={c.client} taille={28} forme="carre" />
        <span className="sc-rt-citation__qui"><span className="sc-rt-citation__client">{c.client}</span></span>
        <span className="sc-rt-citation__meta"><Etoiles note={c.note} positif={c.positif} /><span className="sc-nombre">{quand(c.date, aujourdhui, tm, langue)}</span></span>
      </div>
    </article>
  );
}
