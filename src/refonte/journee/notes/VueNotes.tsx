import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Check, ChevronDown, Lightbulb, Link2, Lock, Mic, Pencil, Pin, Play, Plus, Search, Users } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { Raccourci } from '../../../socle/ui/Pastilles';
import { COLONNES, type FiltreMur, type ModeleMur, type NoteMur, type TriMur } from './modele';
import { useMotsNotes } from './i18n';
import '../../contacts/cibles.css';
import './notes.css';

/**
 * « NOTES RAPIDES » (MJ04) — le mur de notes. Mise en page et états, sans accès aux données. Disposition (fiche MJ04, zone principale de 1108 px) :
 * saisie rapide de 62, ligne d'outils de 30, mur de 4 colonnes de 268 (écart 12) dont la dernière note s'étire pour que les colonnes finissent
 * ensemble. Une note a sa forme : texte, liste à cases, vocale (onde de 30 barres), citation, lien, choix, ACCÈS MASQUÉ (jamais la valeur).
 */
export interface ActionsNotes {
  noter: (texte: string, etiquette: 'idee' | 'afaire' | 'client' | null) => void;
  dicter: () => void;
  nouvelle: () => void;
  filtre: (f: FiltreMur) => void;
  tri: (t: TriMur) => void;
  recherche: (q: string) => void;
  ouvrir: (id: string) => void;
  cocher: (id: string, index: number, fait: boolean) => void;
  faireTache: (id: string) => void;
  lire: (id: string) => void;
  afficher: (id: string) => void;
  toutRanger: () => void;
  uneParUne: () => void;
  reessayer: () => void;
}

export interface VueNotesProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleMur;
  filtre: FiltreMur;
  tri: TriMur;
  recherche: string;
  actions: ActionsNotes;
  lecture?: boolean;
  /** Les fonctions que la source n'a pas sont masquées : étiquettes en un clic, dictée. */
  etiquettes?: boolean;
  dictee?: boolean;
  /** « Ajmani la range pour toi » dans l'aide de la saisie : seulement si Ajmani range. */
  rangement?: boolean;
}

type Tm = ReturnType<typeof useMotsNotes>['tm'];
const FILTRES: FiltreMur[] = ['toutes', 'epinglees', 'aTrier', 'vocales'];
const TRIS: TriMur[] = ['recentes', 'anciennes', 'titre'];

export function VueNotes({ statut, horsLigne = false, modele: m, filtre, tri, recherche, actions, lecture = false, etiquettes = true, dictee = true, rangement = true }: VueNotesProps) {
  const { tm } = useMotsNotes();
  const [texte, setTexte] = useState('');
  const [etiquette, setEtiquette] = useState<'idee' | 'afaire' | 'client' | null>(null);
  const [cherche, setCherche] = useState(recherche !== '');
  const sousTitre = m.nbATrier > 0 ? tm(m.nbATrier === 1 ? 'sousTitre.aTrier.1' : 'sousTitre.aTrier.n', { n: m.nbATrier }) : tm('sousTitre.sans');
  const noter = () => { if (texte.trim() && !lecture) { actions.noter(texte.trim(), etiquette); setTexte(''); setEtiquette(null); } };
  const aide = rangement ? tm('saisie.aide') : tm('saisie.aideSans');
  const carte = m.propositions.length > 0 ? (
    <section className="sc-nt-ajmani" aria-label={tm('ajmani.titre')}>
      <header><svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v5M12 16v5M3 12h5M16 12h5" /></svg><span>{tm('ajmani.titre')}</span></header>
      <h3>{tm(m.nbATrier === 1 ? 'ajmani.rangerN.1' : 'ajmani.rangerN.n', { n: m.nbATrier })}</h3>
      <p>{tm('ajmani.rien')}</p>
      <ul>{m.propositions.map((p) => <li key={p.cle}><span>{p.note}</span><ArrowRight size={12} strokeWidth={2} aria-hidden /><b>{p.vers}</b></li>)}</ul>
      <div className="sc-nt-ajmani__actions">
        <Bouton variante="primaire" taille="petit" onClick={actions.toutRanger}>{tm('ajmani.toutRanger')}</Bouton>
        <Bouton variante="secondaire" taille="petit" onClick={actions.uneParUne}>{tm('ajmani.uneParUne')}</Bouton>
      </div>
    </section>
  ) : (
    <section className="sc-nt-astuce" aria-label={tm('astuce.titre')}><span>{tm('astuce.titre')}</span><p>{tm('astuce.texte')}</p></section>
  );

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        className="sc-nt__entete"
        secondaires={dictee ? [{ libelle: tm('action.dicter'), onClick: actions.dicter, icone: <Mic size={14} strokeWidth={1.9} /> }] : []}
        primaire={lecture ? undefined : { libelle: tm('action.nouvelle'), onClick: actions.nouvelle, icone: <Plus size={14} strokeWidth={2.2} /> }}
      />
      {horsLigne && <p className="sc-nt__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-nt" aria-busy={statut === 'chargement' || undefined}>
          <form className="sc-nt-saisie" aria-label={tm('saisie.libelle')} onSubmit={(e) => { e.preventDefault(); noter(); }}>
            <span className="sc-nt-tuile"><Pencil size={15} strokeWidth={1.9} /></span>
            <input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder={aide} aria-label={tm('saisie.libelle')} disabled={lecture} />
            {etiquettes && (
              <span className="sc-nt-puces">
                {([['idee', Lightbulb, 'saisie.idee'], ['afaire', Check, 'saisie.afaire'], ['client', Users, 'saisie.client']] as const).map(([cle, Icone, mot]) => (
                  <button key={cle} type="button" aria-pressed={etiquette === cle} onClick={() => setEtiquette(etiquette === cle ? null : cle)}><Icone size={12} strokeWidth={1.9} aria-hidden />{tm(mot)}</button>
                ))}
              </span>
            )}
            {(etiquettes || dictee) && <span className="sc-nt-filet" aria-hidden />}
            {dictee && <button type="button" className="sc-nt-dicter" onClick={actions.dicter}><Mic size={13} strokeWidth={1.9} aria-hidden />{tm('saisie.dicter')}<Raccourci>⌘D</Raccourci></button>}
            <span className="sc-nt-entree">{tm('saisie.entree')}</span>
          </form>
          <div className="sc-nt-outils">
            <div className="sc-nt-chips" role="group" aria-label={tm('filtre.libelle')}>
              {FILTRES.filter((f) => f !== 'aTrier' || m.compteurs.aTrier > 0 || filtre === 'aTrier').filter((f) => f !== 'vocales' || m.compteurs.vocales > 0 || filtre === 'vocales').map((f) => <button key={f} type="button" aria-pressed={filtre === f} onClick={() => actions.filtre(f)}>{tm(`filtre.${f}` as const, { n: m.compteurs[f] })}</button>)}
            </div>
            <div className="sc-nt-outils__droite">
              {cherche && <input className="sc-nt-recherche" type="search" value={recherche} onChange={(e) => actions.recherche(e.target.value)} placeholder={tm('recherche.placeholder')} aria-label={tm('recherche.libelle')} />}
              <button type="button" className="sc-nt-tri" aria-label={tm('tri.libelle')} onClick={() => actions.tri(TRIS[(TRIS.indexOf(tri) + 1) % TRIS.length])}>{tm(`tri.${tri}` as const)}<ChevronDown size={13} strokeWidth={2} aria-hidden /></button>
              <button type="button" className="sc-nt-loupe" aria-label={tm('recherche.libelle')} aria-pressed={cherche} onClick={() => setCherche(!cherche)}><Search size={14} strokeWidth={1.9} /></button>
            </div>
          </div>
          {m.vide && statut === 'pret' ? (
            <p className="sc-nt-vide">{tm('vide.texte')}</p>
          ) : m.filtreVide ? (
            <div className="sc-nt-filtrevide">
              <span>{tm('filtreVide.texte')}</span>
              <button type="button" onClick={() => actions.filtre('toutes')}>{tm('filtreVide.voir')}</button>
            </div>
          ) : (
            <div className="sc-nt-mur">
              {Array.from({ length: COLONNES }, (_, i) => (
                <div key={i} className="sc-nt-colonne">
                  {i === COLONNES - 1 && carte}
                  {m.colonnes[i].map((n, k) => <Note key={n.id} n={n} tm={tm} derniere={k === m.colonnes[i].length - 1} actions={actions} lecture={lecture} horsLigne={horsLigne} />)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}

function Note({ n, tm, derniere, actions, lecture, horsLigne }: { n: NoteMur; tm: Tm; derniere: boolean; actions: ActionsNotes; lecture: boolean; horsLigne: boolean }) {
  const fait = n.items?.filter((i) => i.fait).length ?? 0;
  const lu = n.vocale?.lu ?? 0;
  return (
    <article className="sc-nt-note" data-type={n.type} data-atrier={n.aTrier ? '' : undefined} data-derniere={derniere ? '' : undefined}>
      <button type="button" className="sc-nt-note__ouvrir" aria-label={tm('note.ouvrir', { titre: n.titre })} onClick={() => actions.ouvrir(n.id)} />
      <div className="sc-nt-note__haut">
        {n.aTrier ? <span className="sc-nt-etiquette" data-atrier=""><i aria-hidden />{tm('note.aTrier')}</span> : n.etiquette ? <span className="sc-nt-etiquette" data-ton={n.ton}><i aria-hidden />{n.etiquette}</span> : <span />}
        {n.epinglee && <Pin size={13} strokeWidth={1.9} className="sc-nt-pin" aria-label={tm('note.epinglee')} />}
      </div>
      <h3 className="sc-nt-note__titre">{n.titre}</h3>
      {n.type === 'liste' && n.items && (
        <ul className="sc-nt-liste">{n.items.map((it, i) => (
          <li key={i} data-fait={it.fait ? '' : undefined}>
            <button type="button" role="checkbox" aria-checked={it.fait} aria-label={tm('note.coche', { texte: it.texte, etat: it.fait ? tm('note.fait') : tm('note.aFaire') })} disabled={lecture} onClick={() => actions.cocher(n.id, i, !it.fait)}>{it.fait && <Check size={11} strokeWidth={3} aria-hidden />}</button>
            <span>{it.texte}</span>
          </li>
        ))}</ul>
      )}
      {n.type === 'vocale' && n.vocale && (
        <>
          <div className="sc-nt-vocale">
            <button type="button" className="sc-nt-lire" aria-label={tm('note.lecture', { duree: n.vocale.duree })} onClick={() => actions.lire(n.id)}><Play size={13} strokeWidth={2} fill="currentColor" aria-hidden /></button>
            <span className="sc-nt-onde" aria-hidden>{n.vocale.onde.map((h, i) => <i key={i} data-lu={i < lu ? '' : undefined} style={{ height: `${Math.max(12, h * 100)}%` }} />)}</span>
            <span className="sc-nombre sc-nt-duree">{n.vocale.duree}</span>
          </div>
          <p className="sc-nt-transcription">{n.vocale.transcription}</p>
        </>
      )}
      {n.type === 'acces' && (
        <div className="sc-nt-acces">
          <Lock size={13} strokeWidth={1.9} aria-hidden />
          <span className="sc-nombre" aria-label={tm('note.acces.titre')}>•••• ••</span>
          <button type="button" onClick={() => actions.afficher(n.id)}>{tm('note.afficher')}</button>
        </div>
      )}
      {n.type === 'choix' && n.choix && <div className="sc-nt-choix">{n.choix.map((c) => <span key={c}>{c}</span>)}</div>}
      {n.type === 'citation' && <blockquote className="sc-nt-citation">{n.corps}</blockquote>}
      {(n.type === 'texte' || n.type === 'lien') && n.corps && <p className="sc-nt-note__corps">{n.corps}</p>}
      {n.puce && <span className="sc-nt-puce sc-nombre" data-genre={n.puce.genre}>{n.puce.genre === 'client' ? <Users size={12} strokeWidth={1.9} aria-hidden /> : <Link2 size={12} strokeWidth={1.9} aria-hidden />}{n.puce.texte}</span>}
      <footer className="sc-nt-note__pied">
        <span className="sc-nombre">{n.pied.texte}</span>
        {n.precision && <span className="sc-nt-precision">· {n.precision}</span>}
        {horsLigne && <span className="sc-nt-precision">· {tm('enAttente')}</span>}
        {n.type === 'liste' && n.items && <span className="sc-nt-avance sc-nombre">{tm('note.listeAvance', { faites: fait, total: n.items.length })}</span>}
        {n.action === 'tache' && !lecture && <button type="button" className="sc-nt-tache" onClick={() => actions.faireTache(n.id)}><Check size={12} strokeWidth={2} aria-hidden />{tm('note.faire')}</button>}
      </footer>
    </article>
  );
}
