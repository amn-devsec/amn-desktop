import React from 'react';
import { Download, Eye, FolderOpen, Plus, Search, Send, Share2, Upload } from 'lucide-react';
import { Bouton, PageHead, Raccourci } from '../../../../socle/ui';
import '../commun/ecran.css';
import './documents.css';

/**
 * H11 — Documents : la VUE. Le classeur d'équipe : des intercalaires (un par type de document), la liste du type choisi
 * rangée par année, et à droite le document ouvert (aperçu des pages, ce qu'il faut savoir, versions). Elle reçoit des
 * textes et des nombres déjà composés (`composerDocuments`) ; l'aperçu de la page est donné en enfant.
 */

export interface OngletDoc {
  cle: string;
  libelle: string;
  compteur: number;
}
export interface LigneDoc {
  id: string;
  nom: string;
  sous: string;
  extension: string;
  etat: { libelle: string; ton: 'succes' | 'attention' | 'neutre' } | null;
  actif: boolean;
}
export interface GroupeDoc {
  annee: number;
  compteur: number;
  lignes: LigneDoc[];
}
export interface FaitVue {
  repere: number;
  libelle: string;
  valeur: string;
  mention: string | null;
  note: string | null;
}
export interface VersionVue {
  numero: number;
  quand: string;
  auteur: string;
  note: string;
  actuelle: boolean;
}

export interface VueDocumentsProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onTeleverser: () => void;
  onDossier?: () => void;
  onglets: OngletDoc[];
  ongletActif: string;
  onOnglet: (cle: string) => void;
  recherche: { valeur: string; onChange: (t: string) => void };
  liste: {
    titre: string;
    sous: string;
    tri: string;
    groupes: GroupeDoc[];
    autres: string | null;
    onChoisir: (id: string) => void;
    espace: { libelle: string; pourcent: number; ton: 'neutre' | 'ambre' | 'rouge' } | null;
  };
  detail: {
    nom: string;
    meta: string;
    actions: { cle: string; libelle: string; onClick?: () => void }[];
    pages: { numero: number; actif: boolean }[];
    papier: React.ReactNode;
    faits: { entete: string; sous: string; items: FaitVue[]; partage: string | null } | null;
    versions: { entete: string; sous: string; items: VersionVue[]; signee: { libelle: string; qui: string } | null } | null;
  } | null;
}

const ICONES: Record<string, React.ReactNode> = { ouvrir: <Eye size={14} aria-hidden />, partager: <Share2 size={14} aria-hidden />, signer: <Send size={14} aria-hidden />, telecharger: <Download size={14} aria-hidden /> };

export function VueDocuments(p: VueDocumentsProps) {
  const l = p.libelles;
  return (
    <div className="ec-page ec-h11" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.dossier, onClick: p.onDossier, icone: <FolderOpen size={14} aria-hidden />, disabled: !p.onDossier }]}
        primaire={{ libelle: l.televerser, onClick: p.onTeleverser, icone: <Upload size={14} aria-hidden />, raccourci: 'U' }}
      />
      <div className="ec-h11__barre">
        <div className="ec-h11__onglets" role="tablist" aria-label={l.intercalaires}>
          {p.onglets.map((o) => (
            <button key={o.cle} type="button" role="tab" aria-selected={o.cle === p.ongletActif} className="ec-h11__onglet" data-actif={o.cle === p.ongletActif ? 'oui' : undefined} onClick={() => p.onOnglet(o.cle)}>
              {o.libelle}
              <span className="ec-h11__onglet-compteur">{o.compteur}</span>
            </button>
          ))}
          <span className="ec-h11__onglet ec-h11__onglet--ajout" aria-hidden>
            <Plus size={12} />
            {l.intercalaire}
          </span>
        </div>
        <label className="ec-h11__recherche">
          <Search size={14} aria-hidden />
          <input value={p.recherche.valeur} onChange={(e) => p.recherche.onChange(e.target.value)} placeholder={l.chercher} aria-label={l.chercher} />
        </label>
      </div>
      <div className="ec-page__corps ec-h11__corps ec-carte">
        <section className="ec-h11__liste" aria-labelledby="h11-liste">
          <header className="ec-h11__liste-tete">
            <div>
              <h2 id="h11-liste">{p.liste.titre}</h2>
              <p>{p.liste.sous}</p>
            </div>
            <span className="ec-discret">{p.liste.tri}</span>
          </header>
          <div className="ec-h11__groupes">
            {p.liste.groupes.map((g) => (
              <div key={g.annee}>
                <div className="ec-h11__annee">
                  <span>{g.annee}</span>
                  <span>{g.compteur}</span>
                </div>
                <ul>
                  {g.lignes.map((r) => (
                    <li key={r.id}>
                      <button type="button" className="ec-h11__ligne" data-actif={r.actif ? 'oui' : undefined} aria-current={r.actif ? 'true' : undefined} onClick={() => p.liste.onChoisir(r.id)}>
                        <span className="ec-h11__ext">{r.extension}</span>
                        <span className="ec-h11__ligne-textes">
                          <span className="ec-h11__ligne-nom">{r.nom}</span>
                          <span className="ec-h11__ligne-sous">{r.sous}</span>
                        </span>
                        {r.etat && (
                          <span className="ec-h11__ligne-etat" data-ton={r.etat.ton}>
                            <i className="ec-point" aria-hidden />
                            {r.etat.libelle}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {p.liste.autres && <p className="ec-h11__autres">{p.liste.autres}</p>}
          </div>
          {p.liste.espace && (
            <footer className="ec-h11__espace">
              <span>{l.espace}</span>
              <span className="ec-h11__espace-valeur">{p.liste.espace.libelle}</span>
              <span className="ec-h11__piste" data-ton={p.liste.espace.ton} role="img" aria-label={p.liste.espace.libelle}>
                <i style={{ width: `${p.liste.espace.pourcent}%` }} />
              </span>
            </footer>
          )}
        </section>

        <section className="ec-h11__detail" aria-label={l.document}>
          {p.detail ? (
            <>
              <header className="ec-h11__detail-tete">
                <div>
                  <h2>{p.detail.nom}</h2>
                  <p>{p.detail.meta}</p>
                </div>
                <div className="ec-h11__actions">
                  {p.detail.actions.map((a) => (
                    <Bouton key={a.cle} variante="secondaire" taille="petit" onClick={a.onClick} disabled={!a.onClick}>
                      {ICONES[a.cle]}
                      {a.libelle}
                    </Bouton>
                  ))}
                </div>
              </header>
              <div className="ec-h11__lecture">
                <ol className="ec-h11__miniatures" aria-hidden>
                  {p.detail.pages.map((m) => (
                    <li key={m.numero} data-actif={m.actif ? 'oui' : undefined}>
                      <span />
                      <span />
                      <span />
                      <em>{m.numero}</em>
                    </li>
                  ))}
                </ol>
                <div className="ec-h11__papier">{p.detail.papier}</div>
                {p.detail.faits && (
                  <aside className="ec-h11__faits" aria-label={p.detail.faits.entete}>
                    <h3>{p.detail.faits.entete}</h3>
                    <p className="ec-h11__faits-sous">{p.detail.faits.sous}</p>
                    <ol>
                      {p.detail.faits.items.map((f) => (
                        <li key={f.repere}>
                          <span className="ec-h11__repere">{f.repere}</span>
                          <span>
                            <span className="ec-h11__fait-libelle">{f.libelle}</span>
                            <span className="ec-h11__fait-valeur">{f.valeur}</span>
                            {f.mention && <span className="ec-h11__fait-mention">{f.mention}</span>}
                            {f.note && <span className="ec-h11__fait-note">{f.note}</span>}
                          </span>
                        </li>
                      ))}
                    </ol>
                    {p.detail.faits.partage && <p className="ec-h11__partage">{p.detail.faits.partage}</p>}
                  </aside>
                )}
              </div>
              {p.detail.versions && (
                <footer className="ec-h11__versions">
                  <div className="ec-h11__versions-tete">
                    <strong>{p.detail.versions.entete}</strong>
                    <span className="ec-discret">{p.detail.versions.sous}</span>
                  </div>
                  <ol className="ec-h11__frise">
                    {p.detail.versions.items.map((v) => (
                      <li key={v.numero} data-actuelle={v.actuelle ? 'oui' : undefined}>
                        <span className="ec-h11__version-tete">
                          <b>v{v.numero}</b> <span>{v.quand}</span>
                          {v.actuelle && <em>{p.libelles.actuelle}</em>}
                        </span>
                        <i className="ec-h11__noeud" aria-hidden />
                        <span className="ec-h11__version-note">{v.note}</span>
                      </li>
                    ))}
                    {p.detail.versions.signee && (
                      <li className="ec-h11__signee">
                        <span className="ec-h11__version-tete">
                          <b>{p.detail.versions.signee.libelle}</b>
                        </span>
                        <i className="ec-h11__noeud ec-h11__noeud--signe" aria-hidden />
                        <span className="ec-h11__version-note">{p.detail.versions.signee.qui}</span>
                      </li>
                    )}
                  </ol>
                </footer>
              )}
            </>
          ) : (
            <div className="ec-vide">
              <h2>{l.videTitre}</h2>
              <p>{l.videTexte}</p>
              <Bouton variante="primaire" onClick={p.onTeleverser}>
                {l.televerser}
              </Bouton>
            </div>
          )}
        </section>
      </div>
      <span hidden>
        <Raccourci>U</Raccourci>
      </span>
    </div>
  );
}
