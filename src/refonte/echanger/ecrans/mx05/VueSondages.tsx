import React from 'react';
import { Calendar, Check, Eye, FileText, GripVertical, Link2, ListChecks, Lock, Pencil, Plus, Send, Star, Users, X } from 'lucide-react';
import { Avatar, Bouton, EtatVide, IconeEtincelle, Interrupteur, PageHead, PileAvatars, Segmente, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './sondages.css';

/**
 * MX05 — Sondages : la VUE. Le résultat en direct du sondage choisi (barres, participation), « Votes en direct », « Autres
 * sondages » et l'éditeur « Nouveau sondage » à droite. Elle reçoit des textes et des nombres déjà composés (`composerSondages`).
 * Un sondage anonyme n'affiche jamais qui a voté quoi (ni avatars, ni noms) ; la participation ne met personne en cause :
 * « 1 vote attendu », jamais un nom ; rien ne part aux clients sans le clic sur « Envoyer le sondage ».
 */

export interface PuceVue {
  id: string;
  libelle: string;
  actif: boolean;
}
export interface BarreVue {
  id: string;
  libelle: string;
  pourcent: number;
  voix: string;
  enTete: boolean;
  egalite: boolean;
  /** Les votants de l'option (initiales), vide si le sondage est anonyme. */
  avatars: string[];
  choisie: boolean;
  onVoter?: () => void;
}
export interface ResultatVue {
  id: string;
  question: string;
  etat: { genre: 'en-cours' | 'termine'; libelle: string; detail: string };
  barres: BarreVue[];
  participation: { cases: boolean[]; texte: string; attendus: string | null };
  /** Ce que la personne a voté (« Tu as voté pour… »), ou `null`. */
  tonVote: string | null;
  peutClore: boolean;
}
export interface VoteEnDirectVue {
  id: string;
  heure: string;
  nom: string | null;
  /** L'initiale de la personne, pour l'avatar. */
  avatar: string;
  texte: string;
  option: string | null;
  nouveau: boolean;
}
export interface AutreSondageVue {
  id: string;
  icone: 'note' | 'plusieurs' | 'equipe' | 'agenda';
  titre: string;
  sous: string;
  resultat: string;
}
export interface EditeurVue {
  /** Ce qu'Ajmani a repéré (« Préparé par Ajmani : … »), ou `null`. */
  ajmani: string | null;
  question: string;
  options: string[];
  anonyme: boolean;
  /** Ce que le poste sait de plus (type de réponse, clients, résultats visibles, clôture, destinataires) ; `null` : non montré. */
  extras: { type: 'un-choix' | 'plusieurs' | 'note'; ouvertClients: { actif: boolean; detail: string }; resultatsVisibles: boolean; cloture: string; destinataires: { noms: string[]; texte: string } } | null;
  complet: boolean;
  note: string;
}

export interface VueSondagesProps {
  libelles: Record<string, string>;
  sousTitre: string;
  etat: 'normal' | 'chargement' | 'erreur';
  puces: PuceVue[];
  resultat: ResultatVue | null;
  /** `null` : le poste n'a pas l'heure des votes, « Votes en direct » n'est pas montré. */
  direct: { lignes: VoteEnDirectVue[] } | null;
  autres: AutreSondageVue[];
  editeur: EditeurVue | null;
  actions: {
    onPuce?: (id: string) => void;
    onPartager?: () => void;
    onClore?: () => void;
    onAutre?: (id: string) => void;
    onModeles?: () => void;
    onTous?: () => void;
    onQuestion?: (v: string) => void;
    onOption?: (i: number, v: string) => void;
    onRetirerOption?: (i: number) => void;
    onAjouterOption?: () => void;
    onAnonyme?: (v: boolean) => void;
    onType?: (t: 'un-choix' | 'plusieurs' | 'note') => void;
    onEnvoyer?: () => void;
    onApercu?: () => void;
    onRecharger?: () => void;
  };
}

const ICONE_AUTRE: Record<AutreSondageVue['icone'], React.ReactNode> = {
  note: <Star size={14} aria-hidden />,
  plusieurs: <ListChecks size={14} aria-hidden />,
  agenda: <Calendar size={14} aria-hidden />,
  equipe: <Users size={14} aria-hidden />,
};

export function VueSondages(p: VueSondagesProps) {
  const l = p.libelles;
  const a = p.actions;
  const r = p.resultat;
  return (
    <div className="ex-page ex-mx05" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[
          ...(a.onModeles ? [{ libelle: l.modeles, onClick: a.onModeles, icone: <FileText size={14} aria-hidden /> }] : []),
          ...(a.onTous ? [{ libelle: l.tous, onClick: a.onTous, icone: <ListChecks size={14} aria-hidden /> }] : []),
        ]}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-mx05__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : (
        <div className="ex-page__corps ex-mx05__corps">
          <section className="ex-carte ex-mx05__resultat" aria-label={r?.question ?? l.titre}>
            {p.etat === 'chargement' ? (
              <div className="ex-mx05__squelettes" aria-busy aria-label={l.chargement}>
                <Squelette largeur="60%" hauteur={28} rayon={8} />
                {[0, 1, 2].map((i) => (
                  <Squelette key={i} largeur="100%" hauteur={48} rayon={10} />
                ))}
              </div>
            ) : r ? (
              <>
                <div className="ex-mx05__haut">
                  <div className="ex-mx05__puces" role="tablist">
                    {p.puces.map((c) => (
                      <button key={c.id} type="button" role="tab" aria-selected={c.actif} className="ex-puce ex-cible" data-actif={c.actif ? 'oui' : undefined} onClick={() => a.onPuce?.(c.id)}>
                        {c.libelle}
                      </button>
                    ))}
                  </div>
                  <header className="ex-mx05__question">
                    <div>
                      <h2>{r.question}</h2>
                      <p className="ex-mx05__etat" data-genre={r.etat.genre}>
                        <i aria-hidden /> <b>{r.etat.libelle}</b> <span>{r.etat.detail}</span>
                      </p>
                    </div>
                    <span className="ex-mx05__boutons">
                      {a.onPartager && (
                        <Bouton variante="secondaire" taille="petit" icone={<Link2 size={13} aria-hidden />} onClick={a.onPartager}>
                          {l.partager}
                        </Bouton>
                      )}
                      {r.peutClore && a.onClore && (
                        <Bouton variante="secondaire" taille="petit" icone={<Lock size={13} aria-hidden />} onClick={a.onClore}>
                          {l.clore}
                        </Bouton>
                      )}
                    </span>
                  </header>
                  <ul className="ex-mx05__barres">
                    {r.barres.map((b, i) => (
                      <li key={b.id} style={{ animationDelay: `${i * 140}ms` }}>
                        <button type="button" className="ex-mx05__barre" data-tete={b.enTete ? 'oui' : undefined} data-choisie={b.choisie ? 'oui' : undefined} onClick={b.onVoter} disabled={!b.onVoter} aria-label={b.onVoter ? `${l.voter} : ${b.libelle}` : undefined}>
                          <span className="ex-mx05__remplissage" style={{ width: `${b.pourcent}%`, animationDelay: `${i * 140}ms` }} aria-hidden />
                          <span className="ex-mx05__nom">
                            <b>{b.libelle}</b>
                            {b.choisie && r.tonVote && <Check size={13} aria-label={r.tonVote} role="img" className="ex-mx05__coche" />}
                            {b.enTete && (
                              <span className="ex-mx05__tete">
                                <i aria-hidden /> {b.egalite ? l.egalite : l.enTete}
                              </span>
                            )}
                          </span>
                          {b.avatars.length > 0 && (
                            <span className="ex-mx05__avatars" aria-hidden>
                              <PileAvatars noms={b.avatars} max={4} taille={24} libelle="" />
                            </span>
                          )}
                        </button>
                        <span className="ex-mx05__chiffre">
                          <b>{b.pourcent} %</b>
                          <small>{b.voix}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="ex-mx05__participation">
                    <span>{l.participation}</span>
                    <span className="ex-mx05__cases" aria-hidden>
                      {r.participation.cases.map((pleine, i) => (
                        <i key={i} data-pleine={pleine ? 'oui' : undefined} />
                      ))}
                    </span>
                    <b>{r.participation.texte}</b>
                    {r.participation.attendus && <small>{r.participation.attendus}</small>}
                  </div>
                </div>
                <div className="ex-mx05__bas" data-seul={p.direct ? undefined : 'oui'}>
                  {p.direct && (
                    <section aria-labelledby="mx05-direct">
                      <header>
                        <h3 id="mx05-direct">{l.direct}</h3>
                        <span className="ex-discret">
                          <i className="ex-point" aria-hidden /> {l.directArrivent}
                        </span>
                      </header>
                      {p.direct.lignes.length === 0 ? (
                        <p className="ex-mx05__rien">{l.directVide}</p>
                      ) : (
                        <ul className="ex-mx05__direct">
                          {p.direct.lignes.map((v, i) => (
                            <li key={v.id} style={{ animationDelay: `${i * 60}ms` }}>
                              <span className="ex-mono">{v.heure}</span>
                              {v.nom ? <Avatar nom={v.avatar} taille={22} /> : null}
                              <span className="ex-mx05__direct-texte">
                                {v.nom && <b>{v.nom}</b>} <em>{v.nom ? l.directChoisi : v.texte}</em> {v.option && <strong>{v.option}</strong>}
                              </span>
                              {v.nouveau && <small>{l.directNouveau}</small>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  )}
                  <section aria-labelledby="mx05-autres">
                    <header>
                      <h3 id="mx05-autres">{l.autres}</h3>
                      {a.onTous && (
                        <button type="button" className="ex-mx05__tout ex-cible" onClick={a.onTous}>
                          {l.autresToutVoir}
                        </button>
                      )}
                    </header>
                    <ul className="ex-mx05__autres">
                      {p.autres.map((s) => (
                        <li key={s.id}>
                          <button type="button" className="ex-mx05__autre ex-cible" onClick={() => a.onAutre?.(s.id)}>
                            <span aria-hidden>{ICONE_AUTRE[s.icone]}</span>
                            <span>
                              <b>{s.titre}</b>
                              <small>{s.sous}</small>
                            </span>
                            <em>{s.resultat}</em>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            ) : (
              <EtatVide titre={l.videTitre} texte={l.videTexte} action={null} />
            )}
          </section>

          {p.editeur && (
            <aside className="ex-carte ex-mx05__editeur" aria-labelledby="mx05-editeur">
              <header className="ex-mx05__editeur-tete">
                <Pencil size={14} aria-hidden />
                <h2 id="mx05-editeur">{l.editeurTitre}</h2>
                <span className="ex-discret">{l.editeurBrouillon}</span>
              </header>
              {p.editeur.ajmani && (
                <p className="ex-mx05__ajmani">
                  <IconeEtincelle taille={12} /> <span>{p.editeur.ajmani}</span>
                </p>
              )}
              <label className="ex-mx05__champ">
                <span>{l.editeurQuestion}</span>
                <input value={p.editeur.question} placeholder={l.editeurQuestionExemple} readOnly={!a.onQuestion} onChange={(e) => a.onQuestion?.(e.target.value)} />
              </label>
              <div className="ex-mx05__reponses">
                <span>{l.editeurReponses}</span>
                {p.editeur.extras && (
                  <Segmente
                    libelle={l.editeurReponses}
                    valeur={p.editeur.extras.type}
                    taille="compact"
                    onChange={(v) => a.onType?.(v as 'un-choix' | 'plusieurs' | 'note')}
                    options={[
                      { cle: 'un-choix', libelle: l.typeUnChoix },
                      { cle: 'plusieurs', libelle: l.typePlusieurs },
                      { cle: 'note', libelle: l.typeNote },
                    ]}
                  />
                )}
              </div>
              <ul className="ex-mx05__options">
                {p.editeur.options.map((o, i) => (
                  <li key={i}>
                    <GripVertical size={13} aria-hidden className="ex-mx05__poignee" />
                    <i aria-hidden />
                    <input value={o} aria-label={`${l.editeurReponses} ${i + 1}`} readOnly={!a.onOption} onChange={(e) => a.onOption?.(i, e.target.value)} />
                    <button type="button" className="ex-cible" aria-label={l.editeurRetirer} onClick={() => a.onRetirerOption?.(i)} disabled={!a.onRetirerOption}>
                      <X size={13} aria-hidden />
                    </button>
                  </li>
                ))}
                <li className="ex-mx05__ajouter">
                  <button type="button" className="ex-cible" onClick={a.onAjouterOption} disabled={!a.onAjouterOption}>
                    <Plus size={13} aria-hidden /> {l.editeurAjouter}
                  </button>
                </li>
              </ul>
              <div className="ex-mx05__reglages">
                <p>
                  <span>{l.editeurAnonymes}</span>
                  <Interrupteur actif={p.editeur.anonyme} libelle={l.editeurAnonymes} onChange={a.onAnonyme} disabled={!a.onAnonyme} />
                </p>
                {p.editeur.extras && (
                  <>
                    <p>
                      <span>{l.editeurClients}</span>
                      <small>{p.editeur.extras.ouvertClients.detail}</small>
                      <Interrupteur actif={p.editeur.extras.ouvertClients.actif} libelle={l.editeurClients} disabled />
                    </p>
                    <p>
                      <span>{l.editeurVisibles}</span>
                      <Interrupteur actif={p.editeur.extras.resultatsVisibles} libelle={l.editeurVisibles} disabled />
                    </p>
                    <p>
                      <span>{l.editeurCloture}</span>
                      <b>{p.editeur.extras.cloture}</b>
                    </p>
                    <p>
                      <span>{l.editeurDestinataires}</span>
                      <span className="ex-mx05__dest">
                        <PileAvatars noms={p.editeur.extras.destinataires.noms} taille={22} libelle="" />
                        {p.editeur.extras.destinataires.texte}
                      </span>
                    </p>
                  </>
                )}
              </div>
              <div className="ex-mx05__actions">
                {p.editeur.extras && (
                  <Bouton variante="secondaire" icone={<Eye size={14} aria-hidden />} onClick={a.onApercu} disabled={!a.onApercu}>
                    {l.editeurApercu}
                  </Bouton>
                )}
                <Bouton variante="primaire" icone={<Send size={14} aria-hidden />} onClick={a.onEnvoyer} disabled={!a.onEnvoyer || !p.editeur.complet}>
                  {l.editeurEnvoyer}
                </Bouton>
              </div>
              <p className="ex-mx05__note">{p.editeur.note}</p>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
