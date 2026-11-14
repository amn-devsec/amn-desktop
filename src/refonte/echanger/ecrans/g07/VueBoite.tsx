import React, { useState } from 'react';
import { Calendar, Check, ChevronDown, ChevronRight, Euro, Filter, FileText, Flag, Image as ImageIcon, Lock, Mail, MessageCircle, MessageSquareText, MoreHorizontal, Phone, Plus, Send, Wrench } from 'lucide-react';
import { AnneauProgression, Avatar, Bouton, BoutonIcone, EtatVide, IconeEtincelle, PageHead, PastilleFiltre, Squelette, Tag } from '../../../../socle/ui';
import '../commun/ecran.css';
import './boite.css';

/**
 * G07 — Messagerie, la boîte des CLIENTS : la VUE. Le bandeau « Boîte à zéro », les trois couloirs de tri, le fil du client
 * choisi (tous canaux mêlés, avec sa bande de contexte) et la zone de réponse. Elle reçoit des textes et des nombres déjà
 * composés (`composerBoite`) ; les gestes (choisir, « En attente », « Fait », envoyer) remontent par `actions`. Le brouillon
 * d'Ajmani n'est jamais envoyé seul ; la note interne ne quitte jamais l'équipe.
 */

export interface CanalVue {
  id: 'courriel' | 'whatsapp' | 'sms';
  nom: string;
  grise: boolean;
}
export type CarreVue = 'fait' | 'en-attente' | 'a-repondre';
export interface FiltreVue {
  id: 'tous' | CanalVue['id'];
  libelle: string;
  n: number;
  actif: boolean;
}
export interface LigneARepondreVue {
  id: string;
  initiales: string;
  nom: string;
  canal: CanalVue;
  apercu: string;
  attente: string;
  orange: boolean;
  nonLu: boolean;
  choisi: boolean;
  inconnu: boolean;
}
export interface LigneEnAttenteVue {
  id: string;
  initiales: string;
  nom: string;
  attend: string;
  canal: CanalVue;
  quand: string;
  choisi: boolean;
}
export interface CelluleVue {
  cle: 'contrat' | 'passage' | 'factures' | 'creneaux';
  etiquette: string;
  valeur: string;
  precision: string;
  ton: 'neutre' | 'vert' | 'orange';
}
export type MessageVue =
  | { genre: 'client' | 'nous'; id: string; initiales: string; auteur: string; heure: string; canal: CanalVue; texte: string; piece?: { nom: string; detail: string } }
  | { genre: 'note'; id: string; initiales: string; auteur: string; heure: string; texte: string };
export interface PliVue {
  id: string;
  libelle: string;
  extrait: string;
  bouton: string;
  ouvert: boolean;
  messages: MessageVue[];
}

export interface VueBoiteProps {
  sousTitre: string;
  libelles: Record<string, string>;
  /** `normal` ; `chargement` ; `erreur` ; `indisponible` : aucun canal branché, le poste n'a rien à montrer. */
  etat: 'normal' | 'chargement' | 'erreur' | 'indisponible';
  badge: number;
  bandeau: {
    valeur: string;
    phrase: string;
    ratio: number;
    carres: CarreVue[];
    legende: { faits: string; enAttente: string; aRepondre: string };
    serie: { sous: string; jours: { libelle: string; etat: 'zero' | 'manque' | 'aujourdhui' | 'a-venir' }[] } | null;
  };
  filtres: FiltreVue[];
  couloirs: {
    aRepondre: { nombre: number; lignes: LigneARepondreVue[]; vide: string | null };
    enAttente: { nombre: number; lignes: LigneEnAttenteVue[] };
    fait: { nombre: number; initiales: string[]; resume: string };
  };
  /** Les trois canaux et leur état, pour l'état « aucun canal branché ». */
  etatsDesCanaux?: { canal: CanalVue; etat: string }[];
  fil: {
    id: string;
    initiales: string;
    nom: string;
    interlocuteur: string;
    contrat: { texte: string; ton: 'succes' | 'neutre' } | null;
    memeFil: { texte: string; canaux: CanalVue[] };
    inconnu: boolean;
    contexte: CelluleVue[];
    plies: PliVue[];
    messages: MessageVue[];
    reponse: { info: string; creneau: string | null; brouillon: string; canaux: (CanalVue & { actif: boolean })[] };
  } | null;
  actions: {
    onReglesDeTri?: () => void;
    onNouveauMessage?: () => void;
    onFiltre: (id: FiltreVue['id']) => void;
    onChoisir: (id: string) => void;
    onDeplier: (pliId: string) => void;
    onEnAttente?: () => void;
    onFait?: () => void;
    onEnvoyer?: () => void;
    onCanal?: (c: CanalVue['id']) => void;
    onBrouillon?: (texte: string) => void;
    onCreerTicket?: () => void;
    onAppeler?: () => void;
    onRecharger?: () => void;
  };
}

const ICONE_CANAL: Record<CanalVue['id'], React.ReactNode> = {
  courriel: <Mail size={11} aria-hidden />,
  whatsapp: <MessageCircle size={11} aria-hidden />,
  sms: <MessageSquareText size={11} aria-hidden />,
};

/** La pastille de canal : toujours l'icône ET le nom (le canal ne se dit pas par l'icône seule). */
export function PastilleDeCanal({ canal, taille = 'petite' }: { canal: CanalVue; taille?: 'petite' | 'moyenne' }) {
  return (
    <span className="ex-g07__canal" data-taille={taille} data-grise={canal.grise ? 'oui' : undefined}>
      {ICONE_CANAL[canal.id]}
      {canal.nom}
    </span>
  );
}

/** La tuile d'un client : un carré arrondi à initiales (CR, BL…), jamais un visage. */
function Tuile({ initiales, taille, choisi }: { initiales: string; taille: number; choisi?: boolean }) {
  return (
    <span aria-hidden className="ex-g07__tuile" data-choisi={choisi ? 'oui' : undefined} style={{ width: taille, height: taille, fontSize: Math.round(taille * 0.37) }}>
      {initiales}
    </span>
  );
}

function Bulle({ m, libelles }: { m: MessageVue; libelles: Record<string, string> }) {
  if (m.genre === 'note') {
    return (
      <li className="ex-g07__msg" data-genre="note">
        <Avatar nom={m.auteur.split(' ')[0]} taille={26} />
        <div>
          <p className="ex-g07__entete">
            <span>{m.auteur} · <span className="ex-mono">{m.heure}</span></span>
            <span className="ex-g07__note-tag">
              <Lock size={11} aria-hidden /> {libelles.noteInterne}
            </span>
          </p>
          <p className="ex-g07__bulle ex-g07__bulle--note">{m.texte}</p>
        </div>
      </li>
    );
  }
  return (
    <li className="ex-g07__msg" data-genre={m.genre}>
      <Avatar nom={m.auteur.split(' ')[0]} taille={26} />
      <div>
        <p className="ex-g07__entete">
          <span>{m.auteur} · <span className="ex-mono">{m.heure}</span></span>
          <PastilleDeCanal canal={m.canal} />
        </p>
        <p className="ex-g07__bulle">{m.texte}</p>
        {m.piece && (
          <button type="button" className="ex-g07__piece ex-cible" aria-label={m.piece.nom}>
            <span aria-hidden className="ex-g07__piece-icone">
              <ImageIcon size={15} />
            </span>
            <span>
              <b>{m.piece.nom}</b>
              <small>{m.piece.detail}</small>
            </span>
          </button>
        )}
      </div>
    </li>
  );
}

const ICONE_CELLULE: Record<CelluleVue['cle'], React.ReactNode> = {
  contrat: <FileText size={13} aria-hidden />,
  passage: <Wrench size={13} aria-hidden />,
  factures: <Euro size={13} aria-hidden />,
  creneaux: <Calendar size={13} aria-hidden />,
};

export function VueBoite(p: VueBoiteProps) {
  const l = p.libelles;
  const [replie, setReplie] = useState<{ aRepondre?: boolean; enAttente?: boolean }>({});
  const a = p.actions;
  const bandeau = p.bandeau;
  return (
    <div className="ex-page ex-g07" data-famille="echanger" data-refonte-police="inter">
      <PageHead_ {...p} />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-g07__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : p.etat === 'indisponible' ? (
        <section className="ex-carte ex-g07__plein" aria-labelledby="g07-indispo">
          <EtatVide
            titre={l.indisponibleTitre}
            texte={l.indisponibleTexte}
            icone={<Mail size={20} />}
            action={
              <ul className="ex-g07__prises" aria-label={l.indisponibleCanaux}>
                {(p.etatsDesCanaux ?? []).map((c) => (
                  <li key={c.canal.id}>
                    <PastilleDeCanal canal={{ ...c.canal, grise: true }} taille="moyenne" />
                    <span className="ex-discret">{c.etat}</span>
                  </li>
                ))}
              </ul>
            }
          />
          <span hidden id="g07-indispo">{l.indisponibleTitre}</span>
        </section>
      ) : (
        <>
          <section className="ex-carte ex-g07__bandeau" aria-label={l.boite}>
            {p.etat === 'chargement' ? (
              <Squelette largeur="100%" hauteur={46} rayon={12} />
            ) : (
              <>
                <div className="ex-g07__zero">
                  <AnneauProgression valeur={bandeau.ratio} taille={46} epaisseur={5} ton="succes" piste="anneau" libelle={l.boite} texte={bandeau.valeur} />
                  <div>
                    <p className="ex-g07__zero-etiquette">{l.boite}</p>
                    <p className="ex-g07__zero-ligne">
                      <b>{bandeau.valeur}</b> <span>{bandeau.phrase}</span>
                    </p>
                  </div>
                </div>
                <div className="ex-g07__carres">
                  <ul aria-hidden>
                    {bandeau.carres.map((c, i) => (
                      <li key={i} data-etat={c} style={{ animationDelay: `${i * 24}ms` }} />
                    ))}
                  </ul>
                  <p className="ex-g07__legende">
                    <span data-etat="fait">{bandeau.legende.faits}</span>
                    <span data-etat="en-attente">{bandeau.legende.enAttente}</span>
                    <span data-etat="a-repondre">{bandeau.legende.aRepondre}</span>
                  </p>
                </div>
                {bandeau.serie && (
                  <div className="ex-g07__serie">
                    <p>
                      <b>{l.belleSerie}</b>
                      <span>{bandeau.serie.sous}</span>
                    </p>
                    <ul>
                      {bandeau.serie.jours.map((j, i) => (
                        <li key={i} data-etat={j.etat}>
                          <span aria-hidden>{j.etat === 'zero' && <Check size={11} strokeWidth={3} />}</span>
                          {j.libelle}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>

          <div className="ex-page__corps ex-g07__corps">
            <section className="ex-carte ex-g07__couloirs" aria-label={l.titre}>
              <div className="ex-g07__filtres" role="group" aria-label={l.filtres}>
                {p.filtres.map((f) => (
                  <PastilleFiltre key={f.id} actif={f.actif} compteur={f.n} onClick={() => a.onFiltre(f.id)}>
                    {f.libelle}
                  </PastilleFiltre>
                ))}
              </div>

              <div className="ex-g07__couloir" data-couloir="a-repondre">
                <button type="button" className="ex-g07__couloir-tete ex-cible" aria-expanded={!replie.aRepondre} onClick={() => setReplie((r) => ({ ...r, aRepondre: !r.aRepondre }))}>
                  <i aria-hidden />
                  <b>{l.couloirARepondre}</b>
                  <span className="ex-g07__compteur ex-mono">{p.couloirs.aRepondre.nombre}</span>
                  <small>{l.consigneARepondre}</small>
                  <ChevronDown size={13} aria-hidden data-replie={replie.aRepondre ? 'oui' : undefined} />
                </button>
                {!replie.aRepondre &&
                  (p.etat === 'chargement' ? (
                    <div className="ex-g07__squelettes" aria-busy>
                      {[0, 1, 2, 3].map((i) => (
                        <Squelette key={i} largeur="100%" hauteur={42} rayon={8} />
                      ))}
                    </div>
                  ) : p.couloirs.aRepondre.vide ? (
                    <p className="ex-g07__couloir-vide">{p.couloirs.aRepondre.vide}</p>
                  ) : (
                    <ul className="ex-g07__lignes">
                      {p.couloirs.aRepondre.lignes.map((r, i) => (
                        <li key={r.id} style={{ animationDelay: `${i * 40}ms` }}>
                          <button type="button" className="ex-g07__ligne" data-choisi={r.choisi ? 'oui' : undefined} aria-current={r.choisi ? 'true' : undefined} onClick={() => a.onChoisir(r.id)}>
                            <i className="ex-g07__nonlu" data-lu={r.nonLu ? undefined : 'oui'} aria-hidden />
                            <Tuile initiales={r.initiales} taille={30} choisi={r.choisi} />
                            <span className="ex-g07__ligne-haut">
                              <b>{r.nom}</b>
                              <span className="ex-g07__attente ex-mono" data-orange={r.orange ? 'oui' : undefined}>{r.attente}</span>
                            </span>
                            <span className="ex-g07__ligne-bas">
                              <PastilleDeCanal canal={r.canal} />
                              <span>{r.apercu}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ))}
              </div>

              <div className="ex-g07__couloir" data-couloir="en-attente">
                <button type="button" className="ex-g07__couloir-tete ex-cible" aria-expanded={!replie.enAttente} onClick={() => setReplie((r) => ({ ...r, enAttente: !r.enAttente }))}>
                  <i aria-hidden />
                  <b>{l.couloirEnAttente}</b>
                  <span className="ex-g07__compteur ex-mono">{p.couloirs.enAttente.nombre}</span>
                  <small>{l.consigneEnAttente}</small>
                  <ChevronDown size={13} aria-hidden data-replie={replie.enAttente ? 'oui' : undefined} />
                </button>
                {!replie.enAttente && (
                  <ul className="ex-g07__lignes ex-g07__lignes--attente">
                    {p.couloirs.enAttente.lignes.map((r) => (
                      <li key={r.id}>
                        <button type="button" className="ex-g07__ligne ex-g07__ligne--attente" data-choisi={r.choisi ? 'oui' : undefined} onClick={() => a.onChoisir(r.id)}>
                          <Tuile initiales={r.initiales} taille={24} choisi={r.choisi} />
                          <span className="ex-g07__ligne-haut">
                            <b>{r.nom}</b>
                            <small>{r.attend}</small>
                          </span>
                          <span className="ex-g07__quand">
                            {ICONE_CANAL[r.canal.id]}
                            {r.quand}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="ex-g07__couloir ex-g07__couloir--fait" data-couloir="fait">
                <button type="button" className="ex-g07__couloir-tete ex-cible" aria-label={`${l.couloirFait} ${p.couloirs.fait.nombre}`}>
                  <i aria-hidden />
                  <b>{l.couloirFait}</b>
                  <span className="ex-g07__compteur ex-mono">{p.couloirs.fait.nombre}</span>
                  <span className="ex-g07__initiales">
                    {p.couloirs.fait.initiales.map((x, i) => (
                      <span key={`${x}${i}`} aria-hidden className="ex-g07__chip">
                        {x}
                      </span>
                    ))}
                  </span>
                  <small>{p.couloirs.fait.resume}</small>
                  <ChevronRight size={13} aria-hidden />
                </button>
              </div>
            </section>

            <section className="ex-carte ex-g07__fil" aria-label={p.fil?.nom ?? l.titre}>
              {p.etat === 'chargement' ? (
                <div className="ex-g07__squelettes" aria-busy>
                  <Squelette largeur="100%" hauteur={69} rayon={10} />
                  <Squelette largeur="70%" hauteur={60} rayon={12} />
                  <Squelette largeur="55%" hauteur={60} rayon={12} />
                </div>
              ) : p.fil ? (
                <>
                  <header className="ex-g07__fil-tete">
                    <Tuile initiales={p.fil.initiales} taille={36} />
                    <div>
                      <p className="ex-g07__fil-nom">
                        <b>{p.fil.nom}</b>
                        {p.fil.interlocuteur && <span>· {p.fil.interlocuteur}</span>}
                        {p.fil.contrat && <Tag etat={p.fil.contrat.ton === 'succes' ? 'succes' : 'neutre'}>{p.fil.contrat.texte}</Tag>}
                      </p>
                      <p className="ex-g07__fil-sous">
                        <span>{p.fil.memeFil.texte}</span>
                        {p.fil.memeFil.canaux.map((c) => (
                          <PastilleDeCanal key={c.id} canal={c} taille="moyenne" />
                        ))}
                      </p>
                    </div>
                    <div className="ex-g07__fil-actions">
                      <Bouton variante="secondaire" taille="petit" icone={<Flag size={13} aria-hidden />} onClick={a.onCreerTicket} disabled={!a.onCreerTicket}>
                        {l.creerTicket}
                      </Bouton>
                      <Bouton variante="secondaire" taille="petit" icone={<Phone size={13} aria-hidden />} onClick={a.onAppeler} disabled={!a.onAppeler}>
                        {l.appeler}
                      </Bouton>
                      <BoutonIcone libelle={l.plus} icone={<MoreHorizontal size={15} aria-hidden />} onClick={() => undefined} />
                    </div>
                  </header>

                  <dl className="ex-g07__contexte">
                    {p.fil.contexte.map((c) => (
                      <div key={c.cle} data-ton={c.ton}>
                        <dt>
                          {ICONE_CELLULE[c.cle]}
                          {c.etiquette}
                        </dt>
                        <dd>{c.valeur}</dd>
                        {c.precision && <dd className="ex-g07__precision">{c.precision}</dd>}
                      </div>
                    ))}
                  </dl>

                  <div className="ex-g07__messages">
                    <ul>
                      {p.fil.plies.map((pl) => (
                        <li key={pl.id} className="ex-g07__pli" data-ouvert={pl.ouvert ? 'oui' : undefined}>
                          <p>
                            <Mail size={13} aria-hidden />
                            <b>{pl.libelle}</b>
                            <span>{pl.extrait}</span>
                            <button type="button" className="ex-g07__deplier ex-cible" aria-expanded={pl.ouvert} onClick={() => a.onDeplier(pl.id)}>
                              {pl.bouton}
                              <ChevronDown size={13} aria-hidden />
                            </button>
                          </p>
                          {pl.ouvert && (
                            <ul>
                              {pl.messages.map((m) => (
                                <Bulle key={m.id} m={m} libelles={l} />
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                      {p.fil.messages.map((m) => (
                        <Bulle key={m.id} m={m} libelles={l} />
                      ))}
                    </ul>
                  </div>

                  <div className="ex-g07__reponse">
                    {p.fil.reponse.info && (
                      <p className="ex-g07__reponse-info">
                        <IconeEtincelle taille={12} />
                        <span>{p.fil.reponse.info}</span>
                        {p.fil.reponse.creneau && <small>{p.fil.reponse.creneau}</small>}
                      </p>
                    )}
                    <textarea
                      className="ex-g07__texte"
                      aria-label={l.brouillonChamp}
                      value={p.fil.reponse.brouillon}
                      rows={2}
                      readOnly={!a.onBrouillon}
                      onChange={(ev) => a.onBrouillon?.(ev.target.value)}
                    />
                    <div className="ex-g07__reponse-bas">
                      <span className="ex-g07__par">{l.repondrePar}</span>
                      <div role="radiogroup" aria-label={l.repondrePar} className="ex-g07__choix">
                        {p.fil.reponse.canaux.map((c) => (
                          <button key={c.id} type="button" role="radio" aria-checked={c.actif} disabled={c.grise} className="ex-g07__choix-canal ex-cible" onClick={() => a.onCanal?.(c.id)}>
                            {ICONE_CANAL[c.id]}
                            {c.nom}
                          </button>
                        ))}
                      </div>
                      <span className="ex-g07__gestes">
                        <button type="button" className="ex-g07__geste ex-cible" onClick={a.onEnAttente} disabled={!a.onEnAttente}>
                          {l.enAttente} <kbd>A</kbd>
                        </button>
                        <button type="button" className="ex-g07__geste ex-cible" onClick={a.onFait} disabled={!a.onFait}>
                          {l.fait} <kbd>E</kbd>
                        </button>
                        <Bouton variante="primaire" taille="petit" icone={<Send size={13} aria-hidden />} onClick={a.onEnvoyer} disabled={!a.onEnvoyer}>
                          {l.envoyer}
                        </Bouton>
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="ex-g07__couloir-vide">{p.couloirs.aRepondre.vide ?? ''}</p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

/** L'en-tête de page : « Règles de tri » (secondaire) puis « Nouveau message » (primaire, le seul de l'en-tête). */
function PageHead_(p: VueBoiteProps) {
  return (
    <PageHead
      titre={p.libelles.titre}
      sousTitre={p.sousTitre}
      secondaires={[{ libelle: p.libelles.reglesDeTri, onClick: p.actions.onReglesDeTri, icone: <Filter size={14} aria-hidden />, disabled: !p.actions.onReglesDeTri }]}
      primaire={{ libelle: p.libelles.nouveauMessage, onClick: p.actions.onNouveauMessage, icone: <Plus size={14} aria-hidden />, disabled: !p.actions.onNouveauMessage }}
    />
  );
}
