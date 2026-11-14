import React from 'react';
import { Check, ChevronRight, Eye, FileText, Flag, MapPin, Plus, Search, Star, X } from 'lucide-react';
import { Avatar, Bouton, EtatVide, IconeEtincelle, PageHead, PileAvatars, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './canaux.css';

/**
 * MX04 — Canaux : la VUE. Le rail (canaux avec non lus, « Nouveau canal », messages directs avec statut), la conversation du
 * canal (carte d'événement « Urgent », messages, réactions par icônes, lien « n réponses », « en train d'écrire »,
 * compositeur) et le tiroir du fil. Elle reçoit des textes et des nombres déjà composés (`composerCanaux`). Aucune clé,
 * aucun mot de passe, aucun jeton n'est affiché ; « en train d'écrire » n'est jamais le contenu ; aucun compteur par personne.
 */

export type TypeDeReaction = 'coche' | 'oeil' | 'etoile';
export interface CanalDuRailVue {
  id: string;
  nom: string;
  nonLus: number;
  actif: boolean;
}
export interface DirectDuRailVue {
  id: string;
  nom: string;
  statut: string;
  enLigne: boolean;
}
export interface ReactionVue {
  type: TypeDeReaction;
  libelle: string;
  n: number;
  miennes: boolean;
}
export type ElementDuFlux =
  | { genre: 'evenement'; id: string; titre: string; sous: string; heure: string; urgent: string; etat: { libelle: string; resolu: boolean } | null }
  | {
      genre: 'message';
      id: string;
      auteur: string;
      heure: string;
      texte: string;
      reactions: ReactionVue[] | null;
      fil: { libelle: string; derniere: string; participants: string[] } | null;
    };
export interface ReponseDeFilVue {
  id: string;
  auteur: string;
  heure: string;
  texte: string;
}
export interface TiroirVue {
  canal: string;
  origine: { auteur: string; heure: string; texte: string };
  reponses: string;
  lignes: ReponseDeFilVue[];
  systeme: { texte: string; heure: string } | null;
  suivent: { noms: string[]; texte: string };
  resume: string | null;
}

export interface VueCanauxProps {
  libelles: Record<string, string>;
  sousTitre: string;
  etat: 'normal' | 'chargement' | 'erreur';
  rail: { canaux: CanalDuRailVue[]; peutCreer: boolean; directs: DirectDuRailVue[]; phrase: string };
  canal: { nom: string; alerte: string | null; description: string; membres: string[] } | null;
  flux: ElementDuFlux[];
  ecrit: string | null;
  compositeur: { placeholder: string; valeur: string; peutTache: boolean };
  tiroir: TiroirVue | null;
  actions: {
    onCanal?: (id: string) => void;
    onDirect?: (id: string) => void;
    onNouveauCanal?: () => void;
    onParcourir?: () => void;
    onReaction?: (messageId: string, type: TypeDeReaction) => void;
    onOuvrirFil?: (messageId: string) => void;
    onFermerFil?: () => void;
    onValeur?: (v: string) => void;
    onEnvoyer?: (enTache: boolean) => void;
    onRecharger?: () => void;
  };
}

const ICONE_REACTION: Record<TypeDeReaction, React.ReactNode> = {
  coche: <Check size={12} aria-hidden />,
  oeil: <Eye size={12} aria-hidden />,
  etoile: <Star size={12} aria-hidden />,
};

export function VueCanaux(p: VueCanauxProps) {
  const l = p.libelles;
  const a = p.actions;
  return (
    <div className="ex-page ex-mx04" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={a.onParcourir ? [{ libelle: l.parcourir, onClick: a.onParcourir, icone: <Search size={14} aria-hidden /> }] : []}
        primaire={a.onNouveauCanal ? { libelle: l.nouveauCanal, onClick: a.onNouveauCanal, icone: <Plus size={14} aria-hidden /> } : undefined}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-mx04__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : (
        <section className="ex-carte ex-mx04__surface" aria-label={l.titre}>
          <nav className="ex-mx04__rail" aria-label={l.canaux}>
            <label className="ex-mx04__chercher">
              <Search size={13} aria-hidden />
              <input placeholder={l.chercher} aria-label={l.chercher} readOnly />
            </label>
            <p className="ex-mx04__titre-rail">{l.canaux}</p>
            <ul className="ex-mx04__canaux">
              {p.rail.canaux.map((c) => (
                <li key={c.id}>
                  <button type="button" className="ex-mx04__canal ex-cible" data-actif={c.actif ? 'oui' : undefined} aria-current={c.actif ? 'true' : undefined} onClick={() => a.onCanal?.(c.id)}>
                    <span className="ex-mono" aria-hidden>#</span>
                    <span>{c.nom}</span>
                    {c.nonLus > 0 && <b className="ex-mono">{c.nonLus}</b>}
                  </button>
                </li>
              ))}
              {p.rail.peutCreer && a.onNouveauCanal && (
                <li>
                  <button type="button" className="ex-mx04__canal ex-mx04__nouveau ex-cible" onClick={a.onNouveauCanal}>
                    <Plus size={12} aria-hidden />
                    <span>{l.nouveauCanal}</span>
                  </button>
                </li>
              )}
            </ul>
            {p.rail.directs.length > 0 && (
              <>
                <p className="ex-mx04__titre-rail">{l.directs}</p>
                <ul className="ex-mx04__directs">
                  {p.rail.directs.map((d) => (
                    <li key={d.id}>
                      <button type="button" className="ex-mx04__direct ex-cible" onClick={() => a.onDirect?.(d.id)}>
                        <Avatar nom={d.nom} taille={22} enLigne={d.enLigne} />
                        <span>{d.nom}</span>
                        <small>{d.statut}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="ex-mx04__phrase">{p.rail.phrase}</p>
          </nav>

          <div className="ex-mx04__conversation">
            {p.etat === 'chargement' ? (
              <div className="ex-mx04__squelettes" aria-busy aria-label={l.chargement}>
                <Squelette largeur="50%" hauteur={36} rayon={8} />
                {[0, 1, 2].map((i) => (
                  <Squelette key={i} largeur="80%" hauteur={48} rayon={10} />
                ))}
              </div>
            ) : p.canal ? (
              <>
                <header className="ex-mx04__entete">
                  <div>
                    <h2>
                      <span className="ex-mono" aria-hidden>#</span> {p.canal.nom}
                      {p.canal.alerte && (
                        <span className="ex-mx04__alerte">
                          <i aria-hidden /> {p.canal.alerte}
                        </span>
                      )}
                    </h2>
                    <p>{p.canal.description}</p>
                  </div>
                  <span className="ex-mx04__outils">
                    <PileAvatars noms={p.canal.membres} taille={26} libelle={p.canal.description} />
                    <button type="button" className="ex-mx04__icone ex-cible" aria-label={l.epingles}>
                      <MapPin size={14} aria-hidden />
                    </button>
                    <button type="button" className="ex-mx04__icone ex-cible" aria-label={l.rechercher}>
                      <Search size={14} aria-hidden />
                    </button>
                  </span>
                </header>
                <div className="ex-mx04__flux">
                  {p.flux.length === 0 ? (
                    <p className="ex-mx04__rien">{l.canalVide}</p>
                  ) : (
                    <ul>
                      {p.flux.map((m, i) =>
                        m.genre === 'evenement' ? (
                          <li key={m.id} className="ex-mx04__evenement" style={{ animationDelay: `${i * 70}ms` }}>
                            <span className="ex-mx04__urgent">
                              <Flag size={11} aria-hidden /> {m.urgent}
                            </span>
                            <div>
                              <b>{m.titre}</b>
                              <small>{m.sous}</small>
                            </div>
                            <span className="ex-mono ex-mx04__heure">{m.heure}</span>
                            {m.etat && (
                              <span className="ex-mx04__etat" data-resolu={m.etat.resolu ? 'oui' : undefined}>
                                <i aria-hidden /> {m.etat.libelle}
                              </span>
                            )}
                          </li>
                        ) : (
                          <li key={m.id} className="ex-mx04__message" style={{ animationDelay: `${i * 70}ms` }}>
                            <Avatar nom={m.auteur} taille={32} />
                            <div>
                              <p>
                                <b>{m.auteur}</b> <span className="ex-mono">{m.heure}</span>
                              </p>
                              <p className="ex-mx04__texte">{m.texte}</p>
                              {m.reactions && m.reactions.some((r) => r.n > 0) && (
                                <p className="ex-mx04__reactions">
                                  {m.reactions.filter((r) => r.n > 0).map((r) => (
                                    <button key={r.type} type="button" className="ex-mx04__reaction ex-cible" aria-pressed={r.miennes} aria-label={`${r.libelle} ${r.n}`} onClick={() => a.onReaction?.(m.id, r.type)}>
                                      {ICONE_REACTION[r.type]} {r.n}
                                    </button>
                                  ))}
                                  <button type="button" className="ex-mx04__reaction ex-mx04__reaction--plus ex-cible" aria-label={l.reactionAjouter}>
                                    <Plus size={12} aria-hidden />
                                  </button>
                                </p>
                              )}
                              {m.fil && (
                                <button type="button" className="ex-mx04__lien-fil ex-cible" onClick={() => a.onOuvrirFil?.(m.id)}>
                                  <PileAvatars noms={m.fil.participants} taille={20} libelle="" />
                                  <b>{m.fil.libelle}</b>
                                  <span>{m.fil.derniere}</span>
                                  <ChevronRight size={12} aria-hidden />
                                </button>
                              )}
                            </div>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                  {p.ecrit && (
                    <p className="ex-mx04__ecrit" aria-live="polite">
                      <span aria-hidden>
                        <i />
                        <i />
                        <i />
                      </span>
                      {p.ecrit}
                    </p>
                  )}
                </div>
                <div className="ex-mx04__compositeur">
                  <textarea
                    rows={1}
                    aria-label={p.compositeur.placeholder}
                    placeholder={p.compositeur.placeholder}
                    value={p.compositeur.valeur}
                    readOnly={!a.onValeur}
                    onChange={(e) => a.onValeur?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && a.onEnvoyer) {
                        e.preventDefault();
                        a.onEnvoyer(false);
                      }
                    }}
                  />
                  <div>
                    <button type="button" className="ex-mx04__icone ex-cible" aria-label={l.composeurPlus}>
                      <Plus size={14} aria-hidden />
                    </button>
                    <button type="button" className="ex-mx04__icone ex-cible" aria-label={l.composeurDocument}>
                      <FileText size={14} aria-hidden />
                    </button>
                    {p.compositeur.peutTache && (
                      <>
                        <button type="button" className="ex-mx04__icone ex-cible" aria-label={l.composeurTache} onClick={() => a.onEnvoyer?.(true)} disabled={!a.onEnvoyer}>
                          <Check size={14} aria-hidden />
                        </button>
                        <span>{l.composeurAide}</span>
                      </>
                    )}
                    <kbd className="sc-kbd">{l.composeurEntree}</kbd>
                  </div>
                </div>
              </>
            ) : (
              <EtatVide titre={l.videTitre} texte={l.videTexte} action={a.onNouveauCanal ? <Bouton variante="primaire" onClick={a.onNouveauCanal}>{l.nouveauCanal}</Bouton> : null} />
            )}
          </div>

          {p.tiroir && (
            <aside className="ex-mx04__tiroir" aria-label={l.tiroirTitre}>
              <header>
                <b>{l.tiroirTitre}</b>
                <span>#{p.tiroir.canal}</span>
                <button type="button" className="ex-mx04__icone ex-cible" aria-label={l.tiroirFermer} onClick={a.onFermerFil}>
                  <X size={14} aria-hidden />
                </button>
              </header>
              <div className="ex-mx04__origine">
                <p>
                  <Avatar nom={p.tiroir.origine.auteur} taille={20} /> <b>{p.tiroir.origine.auteur}</b> <span className="ex-mono">{p.tiroir.origine.heure}</span>
                </p>
                <p>{p.tiroir.origine.texte}</p>
              </div>
              <p className="ex-mx04__nb">{p.tiroir.reponses}</p>
              <ul className="ex-mx04__reponses">
                {p.tiroir.lignes.map((r) => (
                  <li key={r.id}>
                    <Avatar nom={r.auteur} taille={28} />
                    <div>
                      <p>
                        <b>{r.auteur}</b> <span className="ex-mono">{r.heure}</span>
                      </p>
                      <p>{r.texte}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {p.tiroir.systeme && (
                <p className="ex-mx04__systeme">
                  <Check size={12} aria-hidden /> {p.tiroir.systeme.texte} <span className="ex-mono">{p.tiroir.systeme.heure}</span>
                </p>
              )}
              <p className="ex-mx04__suivent">
                <PileAvatars noms={p.tiroir.suivent.noms} taille={20} libelle={p.tiroir.suivent.texte} /> {p.tiroir.suivent.texte}
              </p>
              {p.tiroir.resume && (
                <div className="ex-mx04__resume">
                  <p>
                    <IconeEtincelle taille={12} /> <b>{l.tiroirResume}</b>
                  </p>
                  <p>{p.tiroir.resume}</p>
                </div>
              )}
              <input className="ex-mx04__repondre" placeholder={l.tiroirRepondre} aria-label={l.tiroirRepondre} readOnly />
            </aside>
          )}
        </section>
      )}
    </div>
  );
}
