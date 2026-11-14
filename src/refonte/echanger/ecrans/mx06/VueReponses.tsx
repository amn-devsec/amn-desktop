import React from 'react';
import { ChevronDown, Filter, ListChecks, Pencil, Play, Plus, Send, ShieldCheck, Zap, Check } from 'lucide-react';
import { Avatar, Bouton, EtatVide, IconeEtincelle, Interrupteur, PageHead, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './reponses.css';

/**
 * MX06 — Réponses automatiques : la VUE. La liste des règles (interrupteur, compteur, règle proposée née désactivée), l'éditeur en
 * phrases (QUAND, ET SI, ALORS, ET AUSSI, SAUF SI) avec ses jetons, l'aperçu de ce que reçoit la personne et la suggestion d'Ajmani.
 * Elle reçoit des textes et des nombres déjà composés (`composerReponses`). Une règle neuve, importée ou proposée naît désactivée ;
 * rien n'est envoyé sans règle active ; le message qui part chez un client garde le vouvoiement (il vient du modèle de la règle).
 */

export interface RegleVue {
  id: string;
  nom: string;
  declencheur: string;
  compteur: string;
  actif: boolean;
  selectionnee: boolean;
  etiquette: { texte: string; ton: 'critique' | 'attention' } | null;
  peutActiver: boolean;
}
export type MorceauDePhrase = { genre: 'texte' | 'jeton' | 'cle'; texte: string };
export interface BlocVue {
  cle: 'quand' | 'etsi' | 'alors' | 'etaussi' | 'saufsi';
  libelle: string;
  phrases: MorceauDePhrase[][];
  detail: string | null;
}
export type SegmentDeMessage = { v: boolean; texte: string };
export interface VueReponsesProps {
  libelles: Record<string, string>;
  sousTitre: string;
  etat: 'normal' | 'chargement' | 'erreur' | 'indisponible';
  regles: { sous: string; lignes: RegleVue[]; proposee: { nom: string; sous: string } | null; pied: { envois: string; gagne: string; avis: string } };
  editeur: { nom: string; detail: string; actif: boolean; libelleEtat: string; blocs: BlocVue[]; enregistre: string | null; aTester: string | null } | null;
  apercu: { de: string; a: string; objet: string; paragraphes: SegmentDeMessage[][]; destinataires: { id: string; libelle: string; actif: boolean }[] } | null;
  suggestion: { titre: string; texte: string; oui: string; non: string } | null;
  actions: {
    onRegle?: (id: string) => void;
    onBascule?: (id: string, actif: boolean) => void;
    onNouvelle?: () => void;
    onJournal?: () => void;
    onAjouter?: () => void;
    onTester?: () => void;
    onDestinataire?: (id: string) => void;
    onSuggestion?: (oui: boolean) => void;
    onRecharger?: () => void;
  };
}

const ICONE_BLOC: Record<BlocVue['cle'], React.ReactNode> = {
  quand: <Zap size={14} aria-hidden />,
  etsi: <Filter size={14} aria-hidden />,
  alors: <Send size={14} aria-hidden />,
  etaussi: <Plus size={14} aria-hidden />,
  saufsi: <ShieldCheck size={14} aria-hidden />,
};

export function VueReponses(p: VueReponsesProps) {
  const l = p.libelles;
  const a = p.actions;
  return (
    <div className="ex-page ex-mx06" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={a.onJournal ? [{ libelle: l.journal, onClick: a.onJournal, icone: <ListChecks size={14} aria-hidden /> }] : []}
        primaire={{ libelle: l.nouvelle, onClick: a.onNouvelle, icone: <Plus size={14} aria-hidden />, disabled: !a.onNouvelle }}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-mx06__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : p.etat === 'indisponible' ? (
        <section className="ex-carte ex-mx06__plein">
          <EtatVide titre={l.indisponibleTitre} texte={l.indisponibleTexte} icone={<Zap size={20} />} action={<span className="ex-puce">{l.indisponibleEtat}</span>} />
        </section>
      ) : (
        <div className="ex-page__corps ex-mx06__corps">
          <section className="ex-carte ex-mx06__regles" aria-labelledby="mx06-regles">
            <header className="ex-tete">
              <h2 id="mx06-regles">{l.regles}</h2>
              <span className="ex-discret">{p.regles.sous}</span>
            </header>
            {p.etat === 'chargement' ? (
              <div className="ex-mx06__squelettes" aria-busy aria-label={l.chargement}>
                {[0, 1, 2, 3].map((i) => (
                  <Squelette key={i} largeur="100%" hauteur={60} rayon={8} />
                ))}
              </div>
            ) : (
              <ul>
                {p.regles.lignes.map((r, i) => (
                  <li key={r.id} data-actif={r.actif ? 'oui' : undefined} style={{ animationDelay: `${i * 50}ms` }}>
                    <button type="button" className="ex-mx06__regle ex-cible" data-selectionnee={r.selectionnee ? 'oui' : undefined} aria-current={r.selectionnee ? 'true' : undefined} onClick={() => a.onRegle?.(r.id)}>
                      <b>
                        {r.nom}
                        {r.etiquette && (
                          <span className="ex-mx06__etiquette" data-ton={r.etiquette.ton}>
                            <i aria-hidden /> {r.etiquette.texte}
                          </span>
                        )}
                      </b>
                      <small>{r.declencheur}</small>
                      <small>{r.compteur}</small>
                    </button>
                    <Interrupteur actif={r.actif} libelle={r.nom} onChange={(v) => a.onBascule?.(r.id, v)} disabled={!a.onBascule || (!r.actif && !r.peutActiver)} />
                  </li>
                ))}
                {p.regles.proposee && (
                  <li className="ex-mx06__proposee">
                    <div>
                      <p>
                        <IconeEtincelle taille={13} /> <b>{p.regles.proposee.nom}</b>
                        <Interrupteur actif={false} libelle={p.regles.proposee.nom} disabled />
                      </p>
                      <small>{p.regles.proposee.sous}</small>
                    </div>
                  </li>
                )}
              </ul>
            )}
            <footer className="ex-mx06__pied">
              <p>
                <small>{l.pied_envois}</small>
                <b className="ex-mono">{p.regles.pied.envois}</b>
              </p>
              <p>
                <small>{l.pied_gagne}</small>
                <b className="ex-mono">{p.regles.pied.gagne}</b>
              </p>
              <p>
                <small>{l.pied_avis}</small>
                <b className="ex-mono">{p.regles.pied.avis}</b>
              </p>
            </footer>
          </section>

          {p.editeur && (
            <section className="ex-carte ex-mx06__editeur" aria-label={p.editeur.nom}>
              <header>
                <div>
                  <h2>
                    {p.editeur.nom} <Pencil size={13} aria-hidden />
                  </h2>
                  <p>{p.editeur.detail}</p>
                </div>
                <span className="ex-mx06__etat" data-actif={p.editeur.actif ? 'oui' : undefined}>
                  {p.editeur.libelleEtat}
                  <Interrupteur actif={p.editeur.actif} libelle={p.editeur.libelleEtat} disabled />
                </span>
              </header>
              <ol className="ex-mx06__blocs">
                {p.editeur.blocs.map((b) => (
                  <li key={b.cle} data-cle={b.cle}>
                    <span className="ex-mx06__tuile" aria-hidden>
                      {ICONE_BLOC[b.cle]}
                    </span>
                    <div>
                      <b className="ex-mono">{b.libelle}</b>
                      {b.phrases.map((ph, i) => (
                        <p key={i}>
                          {ph.map((m, j) =>
                            m.genre === 'texte' ? (
                              <span key={j}>{m.texte}</span>
                            ) : (
                              <span key={j} className="ex-mx06__jeton" data-cle={m.genre === 'cle' ? 'oui' : undefined}>
                                {m.texte} <ChevronDown size={12} aria-hidden />
                              </span>
                            ),
                          )}
                        </p>
                      ))}
                      {b.detail && <small>{b.detail}</small>}
                    </div>
                  </li>
                ))}
              </ol>
              <footer>
                <Bouton variante="secondaire" taille="petit" icone={<Plus size={13} aria-hidden />} onClick={a.onAjouter} disabled={!a.onAjouter}>
                  {l.ajouter}
                </Bouton>
                <Bouton variante="secondaire" taille="petit" icone={<Play size={13} aria-hidden />} onClick={a.onTester} disabled={!a.onTester}>
                  {l.tester}
                </Bouton>
                {p.editeur.aTester ? <span className="ex-mx06__atester">{p.editeur.aTester}</span> : p.editeur.enregistre && (
                  <span className="ex-mx06__enregistre">
                    <Check size={13} aria-hidden /> {p.editeur.enregistre}
                  </span>
                )}
              </footer>
            </section>
          )}

          <aside className="ex-mx06__droite">
            {p.apercu && (
              <section className="ex-carte ex-mx06__apercu" aria-labelledby="mx06-apercu">
                <h2 id="mx06-apercu">{l.apercuTitre}</h2>
                <p className="ex-mx06__pour">
                  <span>{l.apercuPour}</span>
                  {p.apercu.destinataires.map((d) => (
                    <button key={d.id} type="button" className="ex-puce ex-cible" aria-pressed={d.actif} data-actif={d.actif ? 'oui' : undefined} onClick={() => a.onDestinataire?.(d.id)}>
                      {d.libelle}
                    </button>
                  ))}
                </p>
                <article>
                  <header>
                    <Avatar nom={p.apercu.de.slice(0, 1)} taille={30} forme="carre" />
                    <div>
                      <b>{p.apercu.de}</b>
                      <small>{p.apercu.a}</small>
                    </div>
                  </header>
                  <b className="ex-mx06__objet">{p.apercu.objet}</b>
                  {p.apercu.paragraphes.map((ph, i) => (
                    <p key={i}>
                      {ph.map((s, j) => (s.v ? <mark key={j}>{s.texte}</mark> : <React.Fragment key={j}>{s.texte}</React.Fragment>))}
                    </p>
                  ))}
                </article>
                <p className="ex-mx06__essai">
                  <span>{l.apercuEssai}</span>
                  <Bouton variante="secondaire" taille="petit" icone={<Play size={12} aria-hidden />} onClick={a.onTester} disabled={!a.onTester}>
                    {l.tester}
                  </Bouton>
                </p>
              </section>
            )}
            {p.suggestion && (
              <section className="ex-mx06__suggestion" aria-label={l.suggestionTitre}>
                <p className="ex-mx06__suggestion-tete">
                  <IconeEtincelle taille={13} /> {l.suggestionTitre}
                </p>
                <b>{p.suggestion.titre}</b>
                <p>{p.suggestion.texte}</p>
                <div>
                  <Bouton variante="primaire" taille="petit" onClick={() => a.onSuggestion?.(true)} disabled={!a.onSuggestion}>
                    {p.suggestion.oui}
                  </Bouton>
                  <Bouton variante="secondaire" taille="petit" onClick={() => a.onSuggestion?.(false)} disabled={!a.onSuggestion}>
                    {p.suggestion.non}
                  </Bouton>
                </div>
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
