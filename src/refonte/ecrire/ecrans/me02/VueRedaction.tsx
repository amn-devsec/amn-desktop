import React from 'react';
import { Globe, History, Lock, Paperclip, Plus, Send, Sparkles } from 'lucide-react';
import { AnneauProgression, Avatar, Bouton, PageHead, Segmente } from '../../../../socle/ui';
import '../commun/ecran.css';
import './redaction.css';

/**
 * ME02 — Rédaction et traduction : la VUE. Les brouillons en onglets, les réglages du texte (ton, longueur, langue,
 * pièce jointe), la lettre au milieu, et dans la marge l'anneau de mots et les notes d'Ajmani. « Rien ne part sans ton
 * accord » : le bouton d'envoi est un geste de la personne. Elle reçoit des textes déjà composés (`composerRedaction`) ;
 * les réglages que le poste ne sait pas tenir ne sont pas montrés.
 */

export interface SegmentDeTexte {
  texte: string;
  /** `retire` : barré ; `ajoute` : souligné et teinté ; `plain` : le texte de la personne. */
  genre: 'plain' | 'retire' | 'ajoute';
}
export interface NoteVue {
  id: string;
  titre: string;
  detail: string;
  /** La valeur ou le chiffre qui accompagne la note, quand elle en a un. */
  mention: string | null;
  attention: boolean;
  actions: { libelle: string; onClick: () => void; principale?: boolean }[];
}
export interface BrouillonOnglet {
  id: string;
  titre: string;
  actif: boolean;
  nonEnvoye: boolean;
}

export interface VueRedactionProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onNouveau: () => void;
  onHistorique?: () => void;
  onglets: BrouillonOnglet[];
  onOnglet: (id: string) => void;
  enregistre: string | null;
  mode: { valeur: string; options: { cle: string; libelle: string }[]; onChange: (v: string) => void };
  reglages: {
    pour: { nom: string; adresse: string } | null;
    ton: { titre: string; options: { cle: string; libelle: string; actif: boolean }[] } | null;
    longueur: { titre: string; options: { cle: string; libelle: string; actif: boolean }[] } | null;
    langue: { titre: string; valeur: string; versions: string | null } | null;
    pieceJointe: { titre: string; nom: string } | null;
  } | null;
  lettre: {
    entetes: { libelle: string; valeur: string }[];
    paragraphes: SegmentDeTexte[][];
    pied: string;
    onEnvoyer?: () => void;
    onTraduire?: () => void;
  } | null;
  marge: {
    anneau: { mots: number; titre: string; detail: string; pourcent: number; depasse: boolean } | null;
    notes: NoteVue[];
    traduction: { titre: string; detail: string; voir: string } | null;
  };
}

export function VueRedaction(p: VueRedactionProps) {
  const l = p.libelles;
  return (
    <div className="ec-page ec-me02" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.historique, onClick: p.onHistorique, icone: <History size={14} aria-hidden />, disabled: !p.onHistorique }]}
        primaire={{ libelle: l.nouveauTexte, onClick: p.onNouveau, icone: <Plus size={14} aria-hidden /> }}
      />
      <div className="ec-carte ec-me02__atelier">
        <div className="ec-me02__barre">
          <div className="ec-me02__onglets" role="tablist" aria-label={l.brouillons}>
            {p.onglets.map((o) => (
              <button key={o.id} type="button" role="tab" aria-selected={o.actif} data-actif={o.actif ? 'oui' : undefined} className="ec-me02__onglet" onClick={() => p.onOnglet(o.id)}>
                <span className="ec-me02__onglet-titre">{o.titre}</span>
                {o.nonEnvoye && <i className="ec-point" aria-hidden />}
              </button>
            ))}
          </div>
          {p.enregistre && <span className="ec-discret ec-me02__enregistre">{p.enregistre}</span>}
          <Segmente libelle={l.mode} options={p.mode.options.map((o) => ({ cle: o.cle, libelle: o.libelle }))} valeur={p.mode.valeur} onChange={p.mode.onChange} />
        </div>
        {p.lettre ? (
          <div className="ec-me02__zone">
            {p.reglages && (
              <aside className="ec-me02__reglages" aria-label={l.reglages}>
                {p.reglages.pour && (
                  <section>
                    <h3>{l.pour}</h3>
                    <div className="ec-me02__destinataire">
                      <Avatar nom={p.reglages.pour.nom} taille={28} />
                      <span>
                        <strong>{p.reglages.pour.nom}</strong>
                        <small>{p.reglages.pour.adresse}</small>
                      </span>
                    </div>
                  </section>
                )}
                {p.reglages.ton && (
                  <section>
                    <h3>{p.reglages.ton.titre}</h3>
                    <ul className="ec-me02__radios">
                      {p.reglages.ton.options.map((o) => (
                        <li key={o.cle} data-actif={o.actif ? 'oui' : undefined}>
                          <span aria-hidden />
                          {o.libelle}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {p.reglages.longueur && (
                  <section>
                    <h3>{p.reglages.longueur.titre}</h3>
                    <div className="ec-me02__longueurs">
                      {p.reglages.longueur.options.map((o) => (
                        <span key={o.cle} data-actif={o.actif ? 'oui' : undefined}>
                          {o.libelle}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {p.reglages.langue && (
                  <section>
                    <h3>{p.reglages.langue.titre}</h3>
                    <p className="ec-me02__langue">{p.reglages.langue.valeur}</p>
                    {p.reglages.langue.versions && <small>{p.reglages.langue.versions}</small>}
                  </section>
                )}
                {p.reglages.pieceJointe && (
                  <section>
                    <h3>{p.reglages.pieceJointe.titre}</h3>
                    <span className="ec-me02__piece">
                      <Paperclip size={13} aria-hidden />
                      {p.reglages.pieceJointe.nom}
                    </span>
                  </section>
                )}
              </aside>
            )}
            <article className="ec-me02__lettre">
              <dl className="ec-me02__entetes">
                {p.lettre.entetes.map((e) => (
                  <div key={e.libelle}>
                    <dt>{e.libelle}</dt>
                    <dd>{e.valeur}</dd>
                  </div>
                ))}
              </dl>
              <div className="ec-me02__corps">
                {p.lettre.paragraphes.map((par, i) => (
                  <p key={i}>
                    {par.map((s, k) => (
                      <span key={k} className="ec-me02__segment" data-genre={s.genre}>
                        {s.texte}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
              <footer className="ec-me02__pied">
                <span>
                  <Lock size={12} aria-hidden /> {p.lettre.pied}
                </span>
                <span className="ec-me02__envoi">
                  <Bouton variante="secondaire" taille="petit" onClick={p.lettre.onTraduire} disabled={!p.lettre.onTraduire}>
                    <Globe size={13} aria-hidden />
                    {l.traduire}
                  </Bouton>
                  <Bouton variante="primaire" taille="petit" onClick={p.lettre.onEnvoyer} disabled={!p.lettre.onEnvoyer}>
                    <Send size={13} aria-hidden />
                    {l.envoyer}
                  </Bouton>
                </span>
              </footer>
            </article>
            <aside className="ec-me02__marge" aria-label={l.marge}>
              {p.marge.anneau && (
                <section className="ec-me02__mots">
                  <AnneauProgression valeur={p.marge.anneau.pourcent / 100} taille={56} epaisseur={5} piste="anneau" ton={p.marge.anneau.depasse ? 'attention' : 'neutre'} libelle={p.marge.anneau.titre}>
                    {p.marge.anneau.mots}
                  </AnneauProgression>
                  <span>
                    <strong>{p.marge.anneau.titre}</strong>
                    <small>{p.marge.anneau.detail}</small>
                  </span>
                </section>
              )}
              {p.marge.notes.map((n) => (
                <section key={n.id} className="ec-me02__note" data-attention={n.attention ? 'oui' : undefined}>
                  <h3>
                    <Sparkles size={12} aria-hidden /> {n.titre}
                  </h3>
                  <p>{n.detail}</p>
                  {n.mention && <p className="ec-me02__mention">{n.mention}</p>}
                  {n.actions.length > 0 && (
                    <div className="ec-me02__note-actions">
                      {n.actions.map((a) => (
                        <Bouton key={a.libelle} variante={a.principale ? 'primaire' : 'secondaire'} taille="petit" onClick={a.onClick}>
                          {a.libelle}
                        </Bouton>
                      ))}
                    </div>
                  )}
                </section>
              ))}
              {p.marge.traduction && (
                <section className="ec-me02__note ec-me02__traduction">
                  <span>
                    <Globe size={14} aria-hidden />
                  </span>
                  <span>
                    <strong>{p.marge.traduction.titre}</strong>
                    <small>{p.marge.traduction.detail}</small>
                  </span>
                  <span className="ec-puce">{p.marge.traduction.voir}</span>
                </section>
              )}
            </aside>
          </div>
        ) : (
          <div className="ec-vide">
            <h2>{l.videTitre}</h2>
            <p>{l.videTexte}</p>
            <Bouton variante="primaire" onClick={p.onNouveau}>
              {l.nouveauTexte}
            </Bouton>
          </div>
        )}
      </div>
    </div>
  );
}
