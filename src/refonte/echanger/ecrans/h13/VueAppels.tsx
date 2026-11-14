import React from 'react';
import { ArrowRight, Calendar, CalendarClock, Check, Clock, Grid3x3, Lock, Mic, MicOff, Pause, Phone, PhoneCall, PhoneMissed, Plus, Video } from 'lucide-react';
import { AnneauProgression, Avatar, Bouton, EtatVide, LiveDot, PageHead, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './appels.css';

/**
 * H13 — Appels et salles : la VUE. Le combiné (l'appel en cours, ses commandes rondes, le pavé et le transfert quand une ligne
 * professionnelle est branchée), le plan des salles en direct avec le Standard, et l'historique résumé. Elle reçoit des textes et des
 * nombres déjà composés (`composerAppels`). Sans téléphonie, le combiné est le panneau de l'appel en ligne dans l'application :
 * pas de pavé, pas d'attente, « Transférer » absent. Aucun lien d'invitation, jeton ni mot de passe de salle n'est affiché ;
 * aucun temps d'appel cumulé par personne.
 */

export interface CommandeVue {
  cle: 'micro' | 'attente' | 'transferer' | 'clavier' | 'raccrocher';
  libelle: string;
  actif: boolean;
  danger?: boolean;
  onClick?: () => void;
}
export interface CombineVue {
  /** `ligne` : un appel est en cours ; `repos` : aucun appel, la liste de ceux qu'on peut appeler. */
  genre: 'ligne' | 'repos';
  ligne: string | null;
  correspondant: { initiales: string; nom: string; sous: string; etiquettes: { texte: string; vert?: boolean }[] } | null;
  duree: string;
  onde: number[];
  notes: { titre: string; lignes: string[] } | null;
  commandes: CommandeVue[];
  transfert: { libelle: string; numero: string; vers: string; onEnLigne: boolean } | null;
  pave: { touche: string; lettres: string; clair?: boolean }[] | null;
  boutons: { transferer?: { libelle: string; onClick?: () => void }; appeler?: { libelle: string; onClick?: () => void } } | null;
  /** Sans appel : ceux qu'on peut appeler dans l'application. */
  joignables: { email: string; nom: string; onAppeler?: () => void }[];
}
export interface SalleVue {
  id: string;
  nom: string;
  genre: 'equipe' | 'clients' | 'creatif' | 'garde' | 'standard';
  ton: 'jour' | 'contacts' | 'creer' | 'neutre' | 'echanger';
  etat: string | null;
  sous: string;
  /** Une ligne secondaire (horloge, calendrier). */
  info: { icone: 'horloge' | 'calendrier'; texte: string } | null;
  action: { libelle: string; primaire?: boolean; onClick?: () => void } | null;
  personnes: { nom: string; libelle: string; parle: boolean }[];
  places: number;
  pied: string | null;
  fermee: boolean;
  /** Le Standard : l'appel en cours et ceux qui attendent, avec leur temps. */
  file: { nom: string; avatar: string; sous: string; duree: string; ambre: boolean; enLigne: boolean }[];
}
export interface LigneAppelVue {
  id: string;
  genre: 'salle' | 'sortant' | 'entrant' | 'manque';
  titre: string;
  moment: string;
  duree: string;
  resume: string | null;
  etiquettes: { texte: string; rouge?: boolean }[];
  action: { genre: 'bouton' | 'coche'; libelle: string; primaire?: boolean; onClick?: () => void } | null;
}

export interface VueAppelsProps {
  libelles: Record<string, string>;
  sousTitre: string;
  etat: 'normal' | 'chargement' | 'erreur';
  combine: CombineVue;
  salles: { sous: string; plan: SalleVue[] } | null;
  historique: {
    filtres: { id: 'tout' | 'manques' | 'resume'; libelle: string; n: number; actif: boolean }[];
    rappels: { texte: string; ratio: number; vert: boolean } | null;
    lignes: LigneAppelVue[];
  };
  actions: { onInstantane?: () => void; onProgrammer?: () => void; onOuvrirSalle?: () => void; onFiltre?: (id: 'tout' | 'manques' | 'resume') => void; onRecharger?: () => void };
}

const ICONE_COMMANDE: Record<CommandeVue['cle'], (muet: boolean) => React.ReactNode> = {
  micro: (muet) => (muet ? <MicOff size={17} aria-hidden /> : <Mic size={17} aria-hidden />),
  attente: () => <Pause size={17} aria-hidden />,
  transferer: () => <ArrowRight size={17} aria-hidden />,
  clavier: () => <Grid3x3 size={17} aria-hidden />,
  raccrocher: () => <Phone size={17} aria-hidden style={{ transform: 'rotate(135deg)' }} />,
};

function IconeDeSalle({ genre }: { genre: SalleVue['genre'] }) {
  return genre === 'garde' ? <Lock size={14} aria-hidden /> : genre === 'standard' ? <PhoneCall size={14} aria-hidden /> : <Video size={14} aria-hidden />;
}

function Salle({ s, libelles, onAction }: { s: SalleVue; libelles: Record<string, string>; onAction?: () => void }) {
  return (
    <section className="ex-h13__salle" data-genre={s.genre} data-ton={s.ton} data-fermee={s.fermee ? 'oui' : undefined} aria-label={s.nom}>
      <header>
        <IconeDeSalle genre={s.genre} />
        <b>{s.nom}</b>
        {s.etat && (
          <span className="ex-h13__salle-etat" data-genre={s.genre}>
            <i aria-hidden /> {s.etat}
          </span>
        )}
      </header>
      <p className="ex-h13__salle-sous">{s.sous}</p>
      {s.genre === 'equipe' && (
        <div className="ex-h13__table" aria-hidden>
          {s.personnes.slice(0, 1).map((p) => (
            <span key={p.nom} className="ex-h13__place" data-parle={p.parle ? 'oui' : undefined}>
              <Avatar nom={p.nom} taille={44} />
              <small>{p.libelle}</small>
            </span>
          ))}
          <span className="ex-h13__plateau">
            {Array.from({ length: Math.max(0, s.places - s.personnes.length) }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          {s.personnes.slice(1, 2).map((p) => (
            <span key={p.nom} className="ex-h13__place" data-parle={p.parle ? 'oui' : undefined}>
              <Avatar nom={p.nom} taille={44} />
              <small>{p.libelle}</small>
            </span>
          ))}
        </div>
      )}
      {s.info && (
        <p className="ex-h13__salle-info">
          {s.info.icone === 'horloge' ? <Clock size={12} aria-hidden /> : <Calendar size={12} aria-hidden />}
          {s.info.texte}
        </p>
      )}
      {s.file.length > 0 && (
        <ul className="ex-h13__file">
          {s.file.map((f) => (
            <li key={f.nom} data-ambre={f.ambre ? 'oui' : undefined}>
              <Avatar nom={f.avatar} taille={22} enLigne={f.enLigne} forme={f.enLigne ? 'rond' : 'carre'} />
              <span>
                <b>{f.nom}</b>
                {!f.ambre && <small className="ex-mono">{f.duree}</small>}
              </span>
              {f.ambre && <em className="ex-mono">{f.duree}</em>}
            </li>
          ))}
        </ul>
      )}
      {s.action && (
        <footer>
          <Bouton variante={s.action.primaire ? 'primaire' : 'secondaire'} taille="petit" icone={s.action.primaire ? <Video size={13} aria-hidden /> : undefined} onClick={s.action.onClick ?? onAction} disabled={!(s.action.onClick ?? onAction)}>
            {s.action.libelle}
          </Bouton>
          {s.pied && <span className="ex-discret">{s.pied}</span>}
        </footer>
      )}
    </section>
  );
}

export function VueAppels(p: VueAppelsProps) {
  const l = p.libelles;
  const c = p.combine;
  const a = p.actions;
  return (
    <div className="ex-page ex-h13" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.programmer, onClick: a.onProgrammer, icone: <CalendarClock size={14} aria-hidden />, disabled: !a.onProgrammer }]}
        primaire={{ libelle: l.instantane, onClick: a.onInstantane, icone: <Video size={14} aria-hidden />, raccourci: 'K', disabled: !a.onInstantane }}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-h13__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : (
        <div className="ex-page__corps ex-h13__corps">
          <section className="ex-carte ex-h13__combine" aria-label={l.enLigne} data-genre={c.genre}>
            {c.genre === 'ligne' && c.correspondant ? (
              <>
                <p className="ex-h13__ligne">
                  <span>
                    <LiveDot ton="ok" libelle="" /> <b>{l.enLigne}</b>
                  </span>
                  {c.ligne && <span className="ex-mono">{c.ligne}</span>}
                </p>
                <div className="ex-h13__corr">
                  <span className="ex-h13__carre" aria-hidden>
                    {c.correspondant.initiales}
                  </span>
                  <div>
                    <b>{c.correspondant.nom}</b>
                    <small>{c.correspondant.sous}</small>
                    <span className="ex-h13__etiquettes">
                      {c.correspondant.etiquettes.map((e) => (
                        <span key={e.texte} className="ex-puce" data-ton={e.vert ? 'succes' : undefined}>
                          {e.vert && <i className="ex-point" aria-hidden />}
                          {e.texte}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                <div className="ex-h13__duree">
                  <span className="ex-mono">{c.duree}</span>
                  <span className="ex-h13__onde" aria-hidden>
                    {c.onde.map((h, i) => (
                      <i key={i} style={{ height: `${h}px` }} />
                    ))}
                  </span>
                </div>
                {c.notes && (
                  <div className="ex-h13__notes">
                    <p>{c.notes.titre}</p>
                    {c.notes.lignes.map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </div>
                )}
                <div className="ex-h13__commandes">
                  {c.commandes.map((k) => (
                    <button key={k.cle} type="button" className="ex-h13__commande ex-cible" data-actif={k.actif ? 'oui' : undefined} data-danger={k.danger ? 'oui' : undefined} onClick={k.onClick} disabled={!k.onClick}>
                      <span aria-hidden>{ICONE_COMMANDE[k.cle](k.cle === 'micro' && k.actif)}</span>
                      {k.libelle}
                    </button>
                  ))}
                </div>
                {c.transfert && (
                  <div className="ex-h13__bas">
                    <p className="ex-h13__transfert">
                      <span>{c.transfert.libelle}</span>
                      <b className="ex-mono">{c.transfert.numero}</b>
                      <span className="ex-h13__vers">
                        <Avatar nom={c.transfert.vers} taille={20} enLigne={c.transfert.onEnLigne} /> {c.transfert.vers}
                      </span>
                    </p>
                    {c.pave && (
                      <ul className="ex-h13__pave">
                        {c.pave.map((t) => (
                          <li key={t.touche} data-clair={t.clair ? 'oui' : undefined}>
                            <b>{t.touche}</b>
                            {t.lettres && <small>{t.lettres}</small>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.boutons && (
                      <div className="ex-h13__boutons">
                        {c.boutons.transferer && (
                          <Bouton variante="primaire" taille="petit" icone={<ArrowRight size={13} aria-hidden />} onClick={c.boutons.transferer.onClick} disabled={!c.boutons.transferer.onClick}>
                            {c.boutons.transferer.libelle}
                          </Bouton>
                        )}
                        {c.boutons.appeler && (
                          <Bouton variante="secondaire" taille="petit" icone={<Phone size={13} aria-hidden />} onClick={c.boutons.appeler.onClick} disabled={!c.boutons.appeler.onClick}>
                            {c.boutons.appeler.libelle}
                          </Bouton>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="ex-h13__repos">
                <EtatVide
                  titre={l.reposTitre}
                  texte={c.joignables.length ? l.reposTexte : l.reposPersonne}
                  icone={<Phone size={20} />}
                  action={
                    c.joignables.length ? (
                      <ul className="ex-h13__joignables">
                        {c.joignables.map((m) => (
                          <li key={m.email}>
                            <Avatar nom={m.nom} taille={26} enLigne />
                            <span>{m.nom}</span>
                            <Bouton variante="secondaire" taille="petit" icone={<Phone size={13} aria-hidden />} onClick={m.onAppeler} disabled={!m.onAppeler}>
                              {l.appeler}
                            </Bouton>
                          </li>
                        ))}
                      </ul>
                    ) : null
                  }
                />
              </div>
            )}
          </section>

          <div className="ex-h13__droite">
            {p.salles && (
              <section className="ex-carte ex-h13__salles" aria-labelledby="h13-salles">
                <header className="ex-tete">
                  <h2 id="h13-salles">{l.salles}</h2>
                  <span className="ex-discret">{p.salles.sous}</span>
                  <Bouton variante="secondaire" taille="petit" icone={<Plus size={13} aria-hidden />} onClick={a.onOuvrirSalle} disabled={!a.onOuvrirSalle}>
                    {l.ouvrirSalle}
                  </Bouton>
                </header>
                <div className="ex-h13__plan">
                  {p.salles.plan.map((s) => (
                    <Salle key={s.id} s={s} libelles={l} />
                  ))}
                </div>
              </section>
            )}

            <section className="ex-carte ex-h13__historique" aria-labelledby="h13-historique">
              <header className="ex-h13__hist-tete">
                <h2 id="h13-historique">{l.historique}</h2>
                <span className="ex-h13__filtres" role="group">
                  {p.historique.filtres.map((f) => (
                    <button key={f.id} type="button" className="ex-puce ex-cible" aria-pressed={f.actif} data-actif={f.actif ? 'oui' : undefined} onClick={() => a.onFiltre?.(f.id)}>
                      {f.libelle}
                      {f.id !== 'tout' && ` ${f.n}`}
                    </button>
                  ))}
                </span>
                {p.historique.rappels && (
                  <span className="ex-h13__rappels" data-vert={p.historique.rappels.vert ? 'oui' : undefined}>
                    <AnneauProgression valeur={p.historique.rappels.ratio} taille={22} epaisseur={3} ton={p.historique.rappels.vert ? 'succes' : 'attention'} piste="anneau" libelle={p.historique.rappels.texte} />
                    {p.historique.rappels.texte}
                  </span>
                )}
              </header>
              {p.etat === 'chargement' ? (
                <div className="ex-h13__squelettes" aria-busy aria-label={l.chargement}>
                  {[0, 1, 2].map((i) => (
                    <Squelette key={i} largeur="100%" hauteur={70} rayon={10} />
                  ))}
                </div>
              ) : p.historique.lignes.length === 0 ? (
                <EtatVide titre={l.videTitre} texte={l.videTexte} action={null} />
              ) : (
                <ul className="ex-h13__lignes">
                  {p.historique.lignes.map((r, i) => (
                    <li key={r.id} className="ex-h13__appel" data-genre={r.genre} style={{ animationDelay: `${i * 50}ms` }}>
                      <span className="ex-h13__type" aria-hidden>
                        {r.genre === 'salle' ? <Video size={15} /> : r.genre === 'manque' ? <PhoneMissed size={15} /> : <Phone size={15} />}
                      </span>
                      <div>
                        <p>
                          <b>{r.titre}</b>
                          <span>{r.moment}</span>
                          <em className="ex-mono">{r.duree}</em>
                        </p>
                        {r.resume && <p className="ex-h13__resume">{r.resume}</p>}
                        <p className="ex-h13__pied">
                          {r.etiquettes.map((e) => (
                            <span key={e.texte} className="ex-puce" data-ton={e.rouge ? 'critique' : undefined}>
                              {e.rouge && <i className="ex-point" aria-hidden />}
                              {e.texte}
                            </span>
                          ))}
                          {r.action &&
                            (r.action.genre === 'coche' ? (
                              <span className="ex-h13__fait">
                                <Check size={13} aria-hidden /> {r.action.libelle}
                              </span>
                            ) : (
                              <Bouton variante={r.action.primaire ? 'primaire' : 'secondaire'} taille="petit" icone={r.action.primaire ? <Check size={13} aria-hidden /> : <Phone size={13} aria-hidden />} onClick={r.action.onClick} disabled={!r.action.onClick}>
                                {r.action.libelle}
                              </Bouton>
                            ))}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
