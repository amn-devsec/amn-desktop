import React, { useEffect, useState } from 'react';
import { AlertCircle, Download, GitBranch, Plus, Star } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { Avatar } from '../../../socle/ui/Pastilles';
import { SuggestionAjmani } from '../../../socle/ui/controles';
import { BlocEtat } from '../../../socle/ui/situations';
import { FilterChips } from '../../../socle/ui/vivant';
import { euros } from '../commun';
import { moisCourt } from '../clients/formats';
import type { Colonne } from '../pipeline';
import { Entonnoir } from './Entonnoir';
import type { ModeleEntonnoir, Periode } from './modele';
import { useMotsPipeline } from './i18n';
import './pipeline.css';

/**
 * « PIPELINE COMMERCIAL » (MC01) — l'entonnoir des opportunités : mise en page et états, sans accès aux données.
 *
 * Disposition (fiche MC01, zone principale de 1108 px) : en-tête (titre, sous-titre, « Importer », primaire « Nouvelle
 * opportunité »), surface « Entonnoir des opportunités » de 1108 × 434 (étapes de 245 px, sortie « Signé ce mois » de
 * 290 × 280), puis la bande basse de 216 px : « Prévision pondérée » 440, suggestion d'Ajmani 330, « Signatures par mois » 310.
 */
export interface ActionsPipeline {
  nouvelle: () => void;
  /** Absent : pas d'import dans l'application, le bouton n'est pas montré. */
  importer?: () => void;
  periode: (p: Periode) => void;
  deplacer: (id: string, vers: Colonne) => void;
  definirObjectif: (cents: number) => void;
  voirMessage: (id: string) => void;
  plusTard: () => void;
  reessayer: () => void;
}

export interface VuePipelineProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleEntonnoir;
  actions: ActionsPipeline;
  lecture?: boolean;
  aujourdhui: string;
  /** « X déplacée vers Y · Annuler » pendant 6 s. */
  annonce?: { texte: string; annuler: () => void } | null;
  selectionInitiale?: string | null;
}

export function VuePipeline({ statut, horsLigne = false, modele, actions, lecture = false, aujourdhui, annonce = null, selectionInitiale = null }: VuePipelineProps) {
  const { tm, langue } = useMotsPipeline();
  const [selection, setSelection] = useState<string | null>(selectionInitiale);
  const m = modele;
  const e = (c: Colonne) => m.etapes.find((x) => x.colonne === c);

  return (
    <Page>
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sousTitre', { montant: euros(m.enJeuCents, langue) })}
        secondaires={actions.importer && !lecture ? [{ libelle: tm('action.importer'), onClick: actions.importer, icone: <Download size={14} strokeWidth={2} /> }] : []}
        primaire={lecture ? undefined : { libelle: tm('action.nouvelle'), onClick: actions.nouvelle, icone: <Plus size={14} strokeWidth={2.2} /> }}
        className="sc-mc__entete"
      />
      {horsLigne && <p className="sc-mc__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-mc" aria-busy={statut === 'chargement' || undefined}>
          <section className="sc-mc-carte sc-mc-surface" aria-label={tm('surface.titre')}>
            <div className="sc-mc-surface__tete">
              <h2 className="sc-mc-carte__titre">{tm('surface.titre')}</h2>
              <FilterChips
                libelle={tm('surface.puces')}
                puces={[{ cle: 'mois', libelle: tm('surface.mois') }, { cle: 'trimestre', libelle: tm('surface.trimestre') }, { cle: 'tout', libelle: tm('surface.tout') }]}
                valeur={m.periode}
                onChange={(c) => actions.periode(c as Periode)}
              />
              <span className="sc-mc-surface__legende">
                <span className="sc-mc-surface__cercle sc-mc-surface__cercle--p" aria-hidden /><span className="sc-mc-surface__cercle sc-mc-surface__cercle--g" aria-hidden />{tm('surface.legende')}
                {m.passagePourcent != null && <span className="sc-mc-surface__passage sc-nombre">{tm('surface.passage', { n: m.passagePourcent })}</span>}
              </span>
            </div>
            <div className="sc-mc-etapes">
              {m.etapes.map((x) => (
                <div key={x.colonne} className="sc-mc-etape">
                  <span className="sc-mc-etape__titre"><span className="sc-mc-etape__numero sc-nombre">{x.numero}</span>{tm(`etape.${x.colonne}` as const)}</span>
                  <span className="sc-mc-etape__ligne sc-nombre">{tm('etape.ligne', { nb: x.nb, montant: euros(x.totalCents, langue) })}<span className="sc-mc-etape__chance"> {tm('etape.chance', { n: x.chance })}</span></span>
                </div>
              ))}
              <div className="sc-mc-etape sc-mc-etape--sortie"><span className="sc-mc-etape__titre"><span className="sc-mc-etape__numero sc-nombre">04</span>{tm('etape.Signé')}</span><span className="sc-mc-etape__ligne">{tm('etape.sortie')}</span></div>
            </div>
            <div className="sc-mc-zone">
              {statut === 'pret' && m.total === 0 && m.sortie.nb === 0 ? (
                <div className="sc-mc-zone__vide"><BlocEtat icone={<GitBranch size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.vide.titre')} texte={tm('etat.vide.texte')} actions={lecture ? <span /> : <Bouton variante="primaire" onClick={actions.nouvelle}>{tm('action.nouvelle')}</Bouton>} /></div>
              ) : null}
              <Entonnoir modele={m} aujourdhui={aujourdhui} selectionId={selection} onSelection={setSelection} onDeplacer={actions.deplacer} lecture={lecture} />
              <Sortie m={m} onDefinir={actions.definirObjectif} aujourdhui={aujourdhui} lecture={lecture} />
            </div>
            <div className="sc-mc-pied">
              {m.etapes.map((x) => <span key={x.colonne} className="sc-mc-pied__age">{x.ageMoyenJours == null ? '' : tm(m.ageDepuisCreation ? 'etape.age.creation' : 'etape.age', { n: x.ageMoyenJours })}</span>)}
              <span className="sc-mc-pied__taux">{m.tauxIndisponibles ? tm('taux.indisponible') : tm('taux.pied')}</span>
            </div>
            {annonce && <p className="sc-mc-annonce" role="status">{annonce.texte}<button type="button" onClick={annonce.annuler}>{tm('deplacer.annuler')}</button></p>}
          </section>
          <div className="sc-mc-bas">
            <Prevision m={m} />
            <Suggestion m={m} actions={actions} />
            <Signatures m={m} />
          </div>
        </div>
      )}
    </Page>
  );
}

function Sortie({ m, onDefinir, aujourdhui, lecture }: { m: ModeleEntonnoir; onDefinir: (cents: number) => void; aujourdhui: string; lecture: boolean }) {
  const { tm, langue } = useMotsPipeline();
  const [edition, setEdition] = useState(false);
  const [valeur, setValeur] = useState('');
  useEffect(() => { if (!edition) setValeur(m.objectif ? String(Math.round(m.objectif.objectifCents / 100)) : ''); }, [edition, m.objectif]);
  const mois = moisCourt(aujourdhui.slice(0, 7), langue, false);
  const o = m.objectif;
  return (
    <div className="sc-mc-sortie">
      <div className="sc-mc-sortie__tete"><span className="sc-mc-sortie__titre"><span className="sc-mc-sortie__point" aria-hidden />{tm(`sortie.titre.${m.periode}` as const)}</span><span className="sc-mc-sortie__compte sc-nombre">{tm('sortie.compte', { nb: m.sortie.nb, montant: euros(m.sortie.totalCents, langue) })}</span></div>
      {m.sortie.lignes.length === 0 ? <p className="sc-mc-vide">{tm('sortie.vide')}</p> : (
        <ul className="sc-mc-sortie__liste">
          {m.sortie.lignes.slice(0, 4).map((l) => (
            <li key={l.id}><span className="sc-mc-sortie__coche" aria-hidden /><span className="sc-mc-sortie__nom">{l.nom}</span><Avatar nom={l.nom} taille={18} /><span className="sc-mc-sortie__montant sc-nombre">{l.cents == null ? '—' : euros(l.cents, langue)}</span></li>
          ))}
        </ul>
      )}
      <div className="sc-mc-objectif">
        {o ? (
          <>
            <div className="sc-mc-objectif__ligne"><span>{tm('objectif.titre', { mois })}</span><span className="sc-nombre">{tm('objectif.avancement', { signe: euros(o.signeCents, langue), objectif: euros(o.objectifCents, langue) })}</span></div>
            <div className="sc-mc-objectif__barre" data-atteint={o.atteint ? '' : undefined} role="img" aria-label={tm('objectif.avancement', { signe: euros(o.signeCents, langue), objectif: euros(o.objectifCents, langue) })}><span style={{ width: `${Math.round(o.part * 100)}%` }} />{[25, 50, 75].map((p) => <i key={p} style={{ left: `${p}%` }} />)}</div>
            <p className="sc-mc-objectif__reste" data-atteint={o.atteint ? '' : undefined}>{o.atteint ? tm('objectif.atteint', { mois }) : tm('objectif.reste', { montant: euros(o.reste, langue) })}</p>
          </>
        ) : edition ? (
          <form className="sc-mc-objectif__form" onSubmit={(ev) => { ev.preventDefault(); const n = Math.round(Number(valeur.replace(',', '.')) * 100); if (n > 0) { onDefinir(n); setEdition(false); } }}>
            <label>{tm('objectif.champ')}<input type="number" min={1} step={100} value={valeur} onChange={(ev) => setValeur(ev.target.value)} autoFocus /></label>
            <Bouton variante="primaire" taille="petit" type="submit">{tm('objectif.enregistrer')}</Bouton>
          </form>
        ) : (
          <div className="sc-mc-objectif__sans"><span>{tm('objectif.definir.texte')}</span>{!lecture && <Bouton variante="secondaire" taille="petit" onClick={() => setEdition(true)}>{tm('objectif.definir')}</Bouton>}</div>
        )}
      </div>
    </div>
  );
}

function Prevision({ m }: { m: ModeleEntonnoir }) {
  const { tm, langue } = useMotsPipeline();
  const p = m.prevision;
  const lignes = [...p.contributions].reverse();
  const montants = (c: string) => m.etapes.find((x) => x.colonne === c);
  return (
    <section className="sc-mc-carte sc-mc-prevision" aria-label={tm('prevision.titre')}>
      <div className="sc-mc-carte__tete"><h2 className="sc-mc-carte__titre">{tm('prevision.titre')}</h2><span className="sc-mc-carte__aide">{tm('prevision.aide')}</span></div>
      <div className="sc-mc-prevision__total"><span className="sc-mc-prevision__montant sc-nombre">{euros(p.totalCents, langue)}</span><span className="sc-mc-prevision__sur">{tm('prevision.sur', { montant: euros(p.enJeuCents, langue) })}</span></div>
      <div className="sc-mc-prevision__barre" role="img" aria-label={tm('prevision.graphique', { total: euros(p.totalCents, langue), montant: euros(p.enJeuCents, langue) })}>
        {lignes.map((c, i) => <span key={c.colonne} data-rang={i} style={{ width: `${c.part * 100}%` }} />)}
      </div>
      <div className="sc-mc-prevision__legende"><span>{tm('prevision.pondere')}</span><span className="sc-nombre">{tm('prevision.sitout', { montant: euros(p.enJeuCents, langue) })}</span></div>
      <ul className="sc-mc-prevision__lignes">
        {lignes.map((c, i) => (
          <li key={c.colonne}><span className="sc-mc-prevision__rang" data-rang={i} aria-hidden /><span className="sc-mc-prevision__nom">{tm(`etape.${c.colonne}` as const)}</span><span className="sc-mc-prevision__calcul sc-nombre">{tm('prevision.ligne', { montant: euros(montants(c.colonne)?.totalCents ?? 0, langue), chance: montants(c.colonne)?.chance ?? 0 })}</span><span className="sc-mc-prevision__cents sc-nombre">{euros(c.cents, langue)}</span></li>
        ))}
      </ul>
    </section>
  );
}

function Suggestion({ m, actions }: { m: ModeleEntonnoir; actions: ActionsPipeline }) {
  const { tm, langue } = useMotsPipeline();
  const s = m.suggestion;
  return (
    <section className="sc-mc-suggestion" aria-label={tm('suggestion.astuce.titre')}>
      {s ? (
        <SuggestionAjmani
          titre={tm('suggestion.relancer', { nom: s.nom })}
          texte={tm(s.jours === 1 ? 'suggestion.texte.1' : 'suggestion.texte.n', { montant: s.cents == null ? '—' : euros(s.cents, langue), n: s.jours })}
          primaire={{ libelle: tm('suggestion.voir'), onClick: () => actions.voirMessage(s.id) }}
          secondaire={{ libelle: tm('suggestion.plusTard'), onClick: actions.plusTard }}
        />
      ) : (
        <div className="sc-mc-astuce"><span className="sc-mc-astuce__titre">{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
      )}
    </section>
  );
}

function Signatures({ m }: { m: ModeleEntonnoir }) {
  const { tm, langue } = useMotsPipeline();
  const serie = m.signatures.mois;
  const max = Math.max(1, ...serie.map((x) => x.nb));
  const f = m.signatures.fait;
  const courant = serie[serie.length - 1];
  const nom = (k: string) => moisCourt(k, langue, false);
  const phrase = !f ? null
    : f.genre === 'record' ? tm('signatures.record', { mois: capitaliser(nom(courant.mois)) })
    : f.genre === 'egale-meilleur' ? tm('signatures.egale', { mois: capitaliser(nom(courant.mois)) })
    : f.genre === 'meilleur-depuis' ? tm('signatures.depuis', { depuis: nom(f.depuis) })
    : tm('signatures.regularite', { n: f.mois, seuil: f.auDessusDe });
  return (
    <section className="sc-mc-carte sc-mc-signatures" aria-label={tm('signatures.titre')}>
      <div className="sc-mc-carte__tete"><h2 className="sc-mc-carte__titre">{tm('signatures.titre')}</h2><span className="sc-mc-carte__aide">{tm('signatures.periode')}</span></div>
      <div className="sc-mc-histo" role="img" aria-label={tm('signatures.graphique')}>
        {serie.map((x, i) => (
          <div key={x.mois} className="sc-mc-histo__col">
            {i === serie.length - 1 && x.nb > 0 && <span className="sc-mc-histo__valeur sc-nombre">{x.nb}</span>}
            <span className="sc-mc-histo__barre" data-courant={i === serie.length - 1 ? '' : undefined} style={{ height: `${Math.max(4, (x.nb / max) * 100)}%` }} />
            <span className="sc-mc-histo__mois">{nom(x.mois).replace(/^./, (c) => c.toUpperCase()).slice(0, 4)}{nom(x.mois).length > 4 ? '.' : ''}</span>
          </div>
        ))}
      </div>
      {phrase && <p className="sc-mc-signatures__pied"><Star size={13} strokeWidth={2} aria-hidden />{phrase}</p>}
    </section>
  );
}

const capitaliser = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);
