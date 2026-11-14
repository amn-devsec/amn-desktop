import React from 'react';
import { Archive, Box, Clock, CornerUpLeft, Euro, FileText, Filter, Handshake, Inbox, MoreHorizontal, Paperclip, Pencil, Plus, Search, Send, Users } from 'lucide-react';
import { Avatar, Bouton, EtatVide, IconeEtincelle, PageHead, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './courriel.css';

/**
 * MX01 — Courriel, la boîte partagée : la VUE, une surface en trois volets (dossiers, fils, conversation). Elle reçoit des textes
 * et des nombres déjà composés (`composerCourriel`). Aucune clé, aucun mot de passe, aucun jeton, aucune adresse de serveur n'est
 * affiché ; une pièce jointe n'est ouverte qu'analysée ; le brouillon d'Ajmani n'est jamais envoyé seul ; aucun compteur de
 * messages traités par personne, aucun minuteur de réponse.
 */

export type DossierId = 'reception' | 'clients' | 'devis' | 'partenaires' | 'envoyes' | 'brouillons' | 'programmes' | 'archives';
export interface DossierVue {
  id: DossierId;
  libelle: string;
  n: number | null;
  actif: boolean;
}
export interface FilVue {
  id: string;
  expediteur: string;
  nonLu: boolean;
  pieceJointe: boolean;
  compteur: number | null;
  objet: string;
  apercu: string;
  quand: string;
  actif: boolean;
}
export interface PliVue {
  id: string;
  auteur: string;
  texte: string;
  quand: string;
  moi: boolean;
}
export interface ConversationVue {
  objet: string;
  organisation: { type: string; nom: string; suivi: string | null } | null;
  resume: { meta: string; demandes: string[]; compte: string; attend: string | null } | null;
  plies: PliVue[];
  dernier: { auteur: string; quand: string; paragraphes: string[]; piece: { nom: string; detail: string } | null };
  compositeur: { placeholder: string; brouillon: string | null };
}
export interface VueCourrielProps {
  libelles: Record<string, string>;
  sousTitre: string;
  etat: 'normal' | 'chargement' | 'erreur' | 'indisponible' | 'perdue';
  dossiers: DossierVue[];
  etiquettes: { id: string; libelle: string; ton: 'critique' | 'attention' | 'info' }[];
  presences: { id: string; nom: string; texte: string }[];
  filtres: { id: 'tous' | 'non-lus' | 'a-moi'; libelle: string; actif: boolean }[];
  nonLus: string;
  fils: FilVue[];
  conversation: ConversationVue | null;
  videDuDossier: string | null;
  actions: {
    onDossier?: (id: DossierId) => void;
    onFiltre?: (id: 'tous' | 'non-lus' | 'a-moi') => void;
    onFil?: (id: string) => void;
    onRegles?: () => void;
    onNouveau?: () => void;
    onArchiver?: () => void;
    onUtiliser?: () => void;
    onTache?: () => void;
    onProgrammer?: () => void;
    onRecharger?: () => void;
    onVerifier?: () => void;
  };
}

const ICONE_DOSSIER: Record<DossierId, React.ReactNode> = {
  reception: <Inbox size={14} aria-hidden />,
  clients: <Users size={14} aria-hidden />,
  devis: <Euro size={14} aria-hidden />,
  partenaires: <Handshake size={14} aria-hidden />,
  envoyes: <Send size={14} aria-hidden />,
  brouillons: <Pencil size={14} aria-hidden />,
  programmes: <Clock size={14} aria-hidden />,
  archives: <Box size={14} aria-hidden />,
};

export function VueCourriel(p: VueCourrielProps) {
  const l = p.libelles;
  const a = p.actions;
  return (
    <div className="ex-page ex-mx01" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={a.onRegles ? [{ libelle: l.regles, onClick: a.onRegles, icone: <Filter size={14} aria-hidden /> }] : []}
        primaire={{ libelle: l.nouveau, onClick: a.onNouveau, icone: <Plus size={14} aria-hidden />, disabled: !a.onNouveau }}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-mx01__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : p.etat === 'indisponible' ? (
        <section className="ex-carte ex-mx01__plein">
          <EtatVide titre={l.indisponibleTitre} texte={l.indisponibleTexte} icone={<Inbox size={20} />} action={<span className="ex-puce">{l.indisponibleEtat}</span>} />
        </section>
      ) : (
        <section className="ex-carte ex-mx01__surface" aria-label={l.titre}>
          <nav className="ex-mx01__dossiers" aria-label={l.boite}>
            <p className="ex-mx01__titre-rail">{l.boite}</p>
            <ul>
              {p.dossiers.map((d) => (
                <li key={d.id}>
                  <button type="button" className="ex-mx01__dossier ex-cible" data-actif={d.actif ? 'oui' : undefined} aria-current={d.actif ? 'true' : undefined} onClick={() => a.onDossier?.(d.id)}>
                    {ICONE_DOSSIER[d.id]}
                    <span>{d.libelle}</span>
                    {d.n !== null && d.n > 0 && <b className="ex-mono">{d.n}</b>}
                  </button>
                </li>
              ))}
            </ul>
            {p.etiquettes.length > 0 && (
              <>
                <p className="ex-mx01__titre-rail">{l.etiquettes}</p>
                <ul className="ex-mx01__etiquettes">
                  {p.etiquettes.map((e) => (
                    <li key={e.id}>
                      <i data-ton={e.ton} aria-hidden /> {e.libelle}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {p.presences.length > 0 && (
              <div className="ex-mx01__presences">
                <p className="ex-mx01__titre-rail">{l.dansLaBoite}</p>
                <ul>
                  {p.presences.map((x) => (
                    <li key={x.id}>
                      <Avatar nom={x.nom} taille={20} enLigne />
                      <span>{x.texte}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          <div className="ex-mx01__fils">
            <label className="ex-mx01__chercher">
              <Search size={13} aria-hidden />
              <input placeholder={l.chercher} aria-label={l.chercher} readOnly />
            </label>
            <div className="ex-mx01__filtres" role="group">
              {p.filtres.map((f) => (
                <button key={f.id} type="button" className="ex-puce ex-cible" aria-pressed={f.actif} data-actif={f.actif ? 'oui' : undefined} onClick={() => a.onFiltre?.(f.id)}>
                  {f.libelle}
                </button>
              ))}
              <span>{p.nonLus}</span>
            </div>
            {p.etat === 'chargement' ? (
              <div className="ex-mx01__squelettes" aria-busy aria-label={l.chargement}>
                {[0, 1, 2, 3].map((i) => (
                  <Squelette key={i} largeur="100%" hauteur={64} rayon={8} />
                ))}
              </div>
            ) : p.fils.length === 0 ? (
              <p className="ex-mx01__vide">{p.videDuDossier}</p>
            ) : (
              <ul className="ex-mx01__liste">
                {p.fils.map((f, i) => (
                  <li key={f.id} style={{ animationDelay: `${i * 40}ms` }}>
                    <button type="button" className="ex-mx01__fil ex-cible" data-actif={f.actif ? 'oui' : undefined} data-nonlu={f.nonLu ? 'oui' : undefined} onClick={() => a.onFil?.(f.id)}>
                      <i aria-hidden />
                      <span className="ex-mx01__fil-haut">
                        <b>{f.expediteur}</b>
                        {f.pieceJointe && <Paperclip size={12} aria-label={l.pieceJointe} />}
                        {f.compteur !== null && <small className="ex-mono">{f.compteur}</small>}
                        <span className="ex-mono">{f.quand}</span>
                      </span>
                      <span className="ex-mx01__objet">{f.objet}</span>
                      <span className="ex-mx01__apercu">{f.apercu}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ex-mx01__conversation">
            {p.etat === 'perdue' && (
              <p className="ex-mx01__perdue" role="status">
                {l.perdue} {a.onVerifier && <button type="button" onClick={a.onVerifier}>{l.perdueVerifier}</button>}
              </p>
            )}
            {p.conversation ? (
              <>
                <header className="ex-mx01__entete">
                  <div>
                    <h2>{p.conversation.objet}</h2>
                    {p.conversation.organisation && (
                      <p>
                        <span className="ex-mx01__type">
                          <i aria-hidden /> {p.conversation.organisation.type}
                        </span>
                        <b>{p.conversation.organisation.nom}</b>
                        {p.conversation.organisation.suivi && (
                          <span>
                            {l.suivi} <Avatar nom={p.conversation.organisation.suivi} taille={18} />
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Bouton variante="secondaire" taille="petit" icone={<Archive size={13} aria-hidden />} onClick={a.onArchiver} disabled={!a.onArchiver}>
                    {l.archiver}
                  </Bouton>
                </header>
                <div className="ex-mx01__corps">
                  {p.conversation.resume && (
                    <section className="ex-mx01__resume" aria-label={l.resume}>
                      <p className="ex-mx01__resume-tete">
                        <IconeEtincelle taille={13} /> <b>{l.resume}</b> <span>{p.conversation.resume.meta}</span>
                        <em>
                          <i aria-hidden /> {p.conversation.resume.compte}
                        </em>
                      </p>
                      <ol>
                        {p.conversation.resume.demandes.map((d, i) => (
                          <li key={i}>
                            <span className="ex-mono">{i + 1}</span> {d}
                          </li>
                        ))}
                        {p.conversation.resume.attend && (
                          <li>
                            <span className="ex-mono">→</span> {p.conversation.resume.attend}
                          </li>
                        )}
                      </ol>
                    </section>
                  )}
                  <ul className="ex-mx01__plies">
                    {p.conversation.plies.map((m) => (
                      <li key={m.id}>
                        <Avatar nom={m.auteur.split(' ')[0]} taille={26} />
                        <b>{m.auteur}</b>
                        <span>{m.texte}</span>
                        <small>{m.quand}</small>
                      </li>
                    ))}
                  </ul>
                  <article className="ex-mx01__dernier">
                    <header>
                      <Avatar nom={p.conversation.dernier.auteur.split(' ')[0]} taille={32} />
                      <div>
                        <b>{p.conversation.dernier.auteur}</b>
                        <small>{p.conversation.dernier.quand}</small>
                      </div>
                      <button type="button" className="ex-mx01__icone ex-cible" aria-label={l.repondre}>
                        <CornerUpLeft size={14} aria-hidden />
                      </button>
                      <button type="button" className="ex-mx01__icone ex-cible" aria-label={l.plus}>
                        <MoreHorizontal size={14} aria-hidden />
                      </button>
                    </header>
                    {p.conversation.dernier.paragraphes.map((t, i) => (
                      <p key={i}>{t}</p>
                    ))}
                    {p.conversation.dernier.piece && (
                      <span className="ex-mx01__piece">
                        <FileText size={14} aria-hidden /> <b>{p.conversation.dernier.piece.nom}</b> <small>{p.conversation.dernier.piece.detail}</small>
                      </span>
                    )}
                  </article>
                </div>
                <div className="ex-mx01__compositeur">
                  <p>
                    <span>{p.conversation.compositeur.placeholder}</span>
                    {p.conversation.compositeur.brouillon && (
                      <small>
                        <IconeEtincelle taille={12} /> {p.conversation.compositeur.brouillon}
                      </small>
                    )}
                  </p>
                  <div>
                    <Bouton variante="primaire" taille="petit" icone={<IconeEtincelle taille={13} />} onClick={a.onUtiliser} disabled={!a.onUtiliser}>
                      {l.utiliser}
                    </Bouton>
                    <Bouton variante="secondaire" taille="petit" onClick={a.onTache} disabled={!a.onTache}>
                      {l.tache}
                    </Bouton>
                    <Bouton variante="secondaire" taille="petit" icone={<Clock size={13} aria-hidden />} onClick={a.onProgrammer} disabled={!a.onProgrammer}>
                      {l.programmer}
                    </Bouton>
                    <kbd className="sc-kbd">⌘⏎</kbd>
                  </div>
                </div>
              </>
            ) : (
              <EtatVide titre={l.videTitre} texte={l.videTexte} action={null} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
