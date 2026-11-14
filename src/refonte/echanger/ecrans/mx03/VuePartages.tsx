import React from 'react';
import { Check, Download, FileText, FolderOpen, Link2, Lock, Send, ShieldCheck, Upload } from 'lucide-react';
import { AnneauProgression, Avatar, Bouton, EtatVide, IconeEtincelle, PageHead, PileAvatars, Squelette } from '../../../../socle/ui';
import '../commun/ecran.css';
import './partages.css';

/**
 * MX03 — Partage de fichiers : la VUE. La zone de dépôt et les réglages du prochain lien, les cartes de lien (destinataire,
 * ouvertures, jauge d'expiration), les transferts, la protection de tous les liens avec l'espace utilisé, et la relance proposée
 * par Ajmani. Elle reçoit des textes et des nombres déjà composés (`composerPartages`). Aucune adresse de lien, aucun jeton,
 * aucun mot de passe n'est affiché ni mis dans le DOM ; un lien ne part jamais sans protection ; rien n'est envoyé sans clic.
 */

export interface CarteLienVue {
  id: string;
  type: string;
  nom: string;
  detail: string;
  destinataire: { nom: string; equipe: string[]; quand: string };
  ouvertures: { n: number; libelle: string; dernier: string | null; pasEncore: boolean };
  expiration: { texte: string; orange: boolean; jauge: { texte: string; rapport: number } | null; sans: string | null };
  peutProlonger: boolean;
}
export interface TransfertVue {
  id: string;
  genre: 'envoi' | 'recu' | 'verification';
  nom: string;
  pourcent: number;
  detail: string;
}
export interface VuePartagesProps {
  libelles: Record<string, string>;
  sousTitre: string;
  etat: 'normal' | 'chargement' | 'erreur' | 'indisponible';
  reglages: string[];
  onglets: { id: 'partages' | 'recus' | 'expires'; libelle: string; actif: boolean }[];
  cartes: CarteLienVue[];
  transferts: { sous: string; lignes: TransfertVue[] };
  protection: { pourcent: number; titre: string; texte: string; espace: { texte: string; rapport: number } | null } | null;
  suggestion: { titre: string; texte: string; oui: string; non: string } | null;
  astuce: string | null;
  actions: {
    onEnvoyer?: () => void;
    onDossiers?: () => void;
    onChoisir?: () => void;
    onDocuments?: () => void;
    onOnglet?: (id: 'partages' | 'recus' | 'expires') => void;
    onCopier?: (id: string) => void;
    onProlonger?: (id: string) => void;
    onSuggestion?: (oui: boolean) => void;
    onRecharger?: () => void;
  };
}

function BadgeDeFichier({ type }: { type: string }) {
  return (
    <span className="ex-mx03__badge" aria-hidden>
      <i />
      <b className="ex-mono">{type}</b>
    </span>
  );
}

export function VuePartages(p: VuePartagesProps) {
  const l = p.libelles;
  const a = p.actions;
  return (
    <div className="ex-page ex-mx03" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={a.onDossiers ? [{ libelle: l.dossiers, onClick: a.onDossiers, icone: <FolderOpen size={14} aria-hidden /> }] : []}
        primaire={{ libelle: l.envoyer, onClick: a.onEnvoyer, icone: <Send size={14} aria-hidden />, disabled: !a.onEnvoyer }}
      />
      {p.etat === 'erreur' ? (
        <section className="ex-carte ex-mx03__plein" role="alert">
          <EtatVide texte={l.erreur} action={a.onRecharger ? <Bouton variante="secondaire" onClick={a.onRecharger}>{l.reessayer}</Bouton> : null} />
        </section>
      ) : p.etat === 'indisponible' ? (
        <section className="ex-carte ex-mx03__plein">
          <EtatVide titre={l.indisponibleTitre} texte={l.indisponibleTexte} icone={<Link2 size={20} />} action={<span className="ex-puce">{l.indisponibleEtat}</span>} />
        </section>
      ) : (
        <div className="ex-page__corps ex-mx03__corps">
          <div className="ex-mx03__gauche">
            <section className="ex-carte ex-mx03__depot" aria-label={l.depotTitre}>
              <div className="ex-mx03__cible">
                <span className="ex-mx03__icone-depot" aria-hidden>
                  <Upload size={22} />
                </span>
                <div>
                  <b>{l.depotTitre}</b>
                  <p>{l.depotTexte}</p>
                  <span>
                    <Bouton variante="secondaire" taille="petit" icone={<FolderOpen size={13} aria-hidden />} onClick={a.onChoisir} disabled={!a.onChoisir}>
                      {l.depotChoisir}
                    </Bouton>
                    <Bouton variante="secondaire" taille="petit" icone={<FileText size={13} aria-hidden />} onClick={a.onDocuments} disabled={!a.onDocuments}>
                      {l.depotDocuments}
                    </Bouton>
                  </span>
                </div>
              </div>
              <div className="ex-mx03__reglages">
                <p>{l.reglagesTitre}</p>
                <ul>
                  {p.reglages.map((r) => (
                    <li key={r} className="ex-puce">
                      {r}
                    </li>
                  ))}
                </ul>
                <small>{l.reglagesNote}</small>
              </div>
            </section>
            <div className="ex-mx03__filtres">
              {p.onglets.map((o) => (
                <button key={o.id} type="button" className="ex-puce ex-cible" aria-pressed={o.actif} data-actif={o.actif ? 'oui' : undefined} onClick={() => a.onOnglet?.(o.id)}>
                  {o.libelle}
                </button>
              ))}
              <span>{l.tri}</span>
            </div>
            {p.etat === 'chargement' ? (
              <div className="ex-mx03__grille" aria-busy aria-label={l.chargement}>
                {[0, 1, 2].map((i) => (
                  <Squelette key={i} largeur="100%" hauteur={238} rayon={16} />
                ))}
              </div>
            ) : p.cartes.length === 0 ? (
              <section className="ex-carte ex-mx03__vide">
                <EtatVide titre={l.videTitre} texte={l.videTexte} action={null} />
              </section>
            ) : (
              <div className="ex-mx03__grille">
                {p.cartes.map((c, i) => (
                  <article key={c.id} className="ex-carte ex-mx03__lien" style={{ animationDelay: `${i * 60}ms` }}>
                    <header>
                      <BadgeDeFichier type={c.type} />
                      <div>
                        <b>{c.nom}</b>
                        <small>{c.detail}</small>
                      </div>
                    </header>
                    <p className="ex-mx03__dest">
                      {c.destinataire.equipe.length > 0 ? <PileAvatars noms={c.destinataire.equipe} taille={22} libelle="" /> : <Avatar nom={c.destinataire.nom.split(' ')[0]} taille={22} />}
                      <span>{c.destinataire.nom}</span>
                      <small>· {c.destinataire.quand}</small>
                      <Lock size={12} aria-label={l.protege} role="img" />
                    </p>
                    <p className="ex-mx03__ouvertures" data-pas={c.ouvertures.pasEncore ? 'oui' : undefined}>
                      <b>{c.ouvertures.n}</b>
                      <span>{c.ouvertures.libelle}</span>
                      {c.ouvertures.dernier && <small>· {c.ouvertures.dernier}</small>}
                    </p>
                    <div className="ex-mx03__expiration" data-orange={c.expiration.orange ? 'oui' : undefined}>
                      <p>
                        <span>{c.expiration.texte}</span>
                        {c.expiration.jauge && <small className="ex-mono">{c.expiration.jauge.texte}</small>}
                        {c.expiration.sans && <small>{c.expiration.sans}</small>}
                      </p>
                      <i data-sans={c.expiration.jauge ? undefined : 'oui'} aria-hidden>
                        {c.expiration.jauge && <u style={{ width: `${Math.round(c.expiration.jauge.rapport * 100)}%` }} />}
                      </i>
                    </div>
                    <footer>
                      <Bouton variante="secondaire" taille="petit" icone={<Link2 size={13} aria-hidden />} onClick={a.onCopier ? () => a.onCopier?.(c.id) : undefined} disabled={!a.onCopier}>
                        {l.copier}
                      </Bouton>
                      {c.peutProlonger && (
                        <button type="button" className="ex-mx03__prolonger ex-cible" onClick={() => a.onProlonger?.(c.id)} disabled={!a.onProlonger}>
                          {l.prolonger}
                        </button>
                      )}
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="ex-mx03__droite">
            <section className="ex-carte ex-mx03__transferts" aria-labelledby="mx03-transferts">
              <header className="ex-tete">
                <h2 id="mx03-transferts">{l.transferts}</h2>
                <span className="ex-discret">{p.transferts.sous}</span>
              </header>
              {p.transferts.lignes.length === 0 ? (
                <p className="ex-mx03__rien">{l.transfertsAucun}</p>
              ) : (
                <ul>
                  {p.transferts.lignes.map((t) => (
                    <li key={t.id} data-genre={t.genre}>
                      <p>
                        {t.genre === 'envoi' ? <Send size={13} aria-hidden /> : t.genre === 'recu' ? <Check size={13} aria-hidden /> : <ShieldCheck size={13} aria-hidden />}
                        <b>{t.nom}</b>
                        <span className="ex-mono">{t.pourcent} %</span>
                      </p>
                      <small>{t.detail}</small>
                      <i aria-hidden>
                        <u style={{ width: `${t.pourcent}%` }} />
                      </i>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {p.protection && (
              <section className="ex-carte ex-mx03__protection" aria-label={p.protection.titre}>
                <div>
                  <AnneauProgression valeur={p.protection.pourcent / 100} taille={64} epaisseur={6} ton="succes" piste="anneau" libelle={p.protection.titre} texte={`${p.protection.pourcent} %`}>
                    <b>{p.protection.pourcent} %</b>
                  </AnneauProgression>
                  <p>
                    <b>{p.protection.titre}</b>
                    <span>{p.protection.texte}</span>
                  </p>
                </div>
                {p.protection.espace && (
                  <p className="ex-mx03__espace">
                    <span>{l.espace}</span>
                    <b>{p.protection.espace.texte}</b>
                    <i aria-hidden>
                      <u style={{ width: `${Math.round(p.protection.espace.rapport * 100)}%` }} />
                    </i>
                  </p>
                )}
              </section>
            )}
            {p.suggestion ? (
              <section className="ex-mx03__suggestion" aria-label={l.suggestionTitre}>
                <p className="ex-mx03__suggestion-tete">
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
            ) : (
              p.astuce && (
                <section className="ex-carte ex-mx03__astuce">
                  <p>
                    <Download size={13} aria-hidden /> <b>{l.astuceTitre}</b>
                  </p>
                  <p>{p.astuce}</p>
                </section>
              )
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
