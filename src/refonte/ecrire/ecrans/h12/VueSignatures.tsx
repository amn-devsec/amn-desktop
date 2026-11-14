import React from 'react';
import { Check, FileText, Send } from 'lucide-react';
import { AnneauProgression, Avatar, Bouton, Interrupteur, PageHead } from '../../../../socle/ui';
import type { Segment } from '../../relecture';
import '../commun/ecran.css';
import './signatures.css';

/**
 * H12 — Signatures : la VUE. Les demandes en ticket (trois segments), le document à signer au centre quand il est
 * connu, et à droite le circuit, la relance préparée et la preuve conservée. Elle reçoit des textes et des nombres déjà
 * composés (`composerSignatures`).
 */

export interface TicketVue {
  id: string;
  titre: string;
  client: string;
  etat: { libelle: string; ton: 'succes' | 'attention' | 'neutre' };
  segments: [Segment, Segment, Segment];
  actif: boolean;
}
export interface EtapeSignataire {
  libelle: string;
  quand: string;
  fait: boolean;
}
export interface SignataireVue {
  id: string;
  nom: string;
  role: string;
  badge: { libelle: string; ton: 'succes' | 'attention' | 'neutre' };
  etapes: EtapeSignataire[];
}
export interface TraceVue {
  quand: string;
  genre: string;
  qui: string;
}

export interface VueSignaturesProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onEnvoyer: () => void;
  onModeles?: () => void;
  tickets: TicketVue[];
  onChoisir: (id: string) => void;
  editeur: {
    titre: string;
    sous: string;
    onglets: { cle: string; libelle: string; actif: boolean }[];
    zoom: string;
    champs: { cle: string; libelle: string }[];
    pour: { nom: string; coche: boolean }[];
    papier: React.ReactNode;
  } | null;
  circuit: {
    titre: string;
    sous: string;
    progression: string;
    pourcent: number;
    signataires: SignataireVue[];
    copie: { nom: string; role: string; note: string } | null;
  } | null;
  relance: {
    quand: string;
    active: boolean;
    texte: string;
    relancer: string;
    modifier: string;
    prepare: string;
    onRelancer?: () => void;
    onBasculer?: (actif: boolean) => void;
  } | null;
  preuve: { entete: string; sous: string; lien: string; traces: TraceVue[] } | null;
}

export function VueSignatures(p: VueSignaturesProps) {
  const l = p.libelles;
  return (
    <div className="ec-page ec-h12" data-famille="ecrire" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.modeles, onClick: p.onModeles, icone: <FileText size={14} aria-hidden />, disabled: !p.onModeles }]}
        primaire={{ libelle: l.envoyer, onClick: p.onEnvoyer, icone: <Send size={14} aria-hidden />, raccourci: 'S' }}
      />
      {p.tickets.length > 0 && (
        <ul className="ec-h12__tickets" aria-label={l.demandes}>
          {p.tickets.map((t) => (
            <li key={t.id}>
              <button type="button" className="ec-carte ec-h12__ticket" data-actif={t.actif ? 'oui' : undefined} aria-current={t.actif ? 'true' : undefined} onClick={() => p.onChoisir(t.id)}>
                <span className="ec-h12__ticket-titre">
                  <FileText size={13} aria-hidden />
                  {t.titre}
                </span>
                <span className="ec-h12__ticket-sous">
                  <span>{t.client}</span>
                  <span className="ec-h12__etat" data-ton={t.etat.ton}>
                    <i className="ec-point" aria-hidden />
                    {t.etat.libelle}
                  </span>
                </span>
                <span className="ec-h12__segments" aria-hidden>
                  {t.segments.map((s, i) => (
                    <span key={i} data-etat={s} />
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="ec-page__corps ec-h12__corps">
        {p.editeur ? (
          <section className="ec-carte ec-h12__editeur" aria-label={l.document}>
            <header className="ec-h12__editeur-tete">
              <div>
                <h2>{p.editeur.titre}</h2>
                <p>{p.editeur.sous}</p>
              </div>
              <div className="ec-h12__modes" role="tablist">
                {p.editeur.onglets.map((o) => (
                  <span key={o.cle} role="tab" aria-selected={o.actif} data-actif={o.actif ? 'oui' : undefined}>
                    {o.libelle}
                  </span>
                ))}
                <span className="ec-h12__zoom">{p.editeur.zoom}</span>
              </div>
            </header>
            <div className="ec-h12__plan">
              <aside className="ec-h12__champs" aria-label={l.champs}>
                <h3>{l.champs}</h3>
                <ul>
                  {p.editeur.champs.map((c) => (
                    <li key={c.cle}>
                      <span aria-hidden className="ec-h12__champ-icone" />
                      {c.libelle}
                    </li>
                  ))}
                </ul>
                <h3>{l.pour}</h3>
                <ul className="ec-h12__pour">
                  {p.editeur.pour.map((x) => (
                    <li key={x.nom}>
                      <span className="ec-h12__case" data-coche={x.coche ? 'oui' : undefined} aria-hidden />
                      {x.nom}
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="ec-h12__papier">{p.editeur.papier}</div>
            </div>
          </section>
        ) : (
          <section className="ec-carte ec-h12__editeur ec-h12__editeur--vide" aria-label={l.document}>
            <div className="ec-vide">
              <h2>{l.videTitre}</h2>
              <p>{l.videTexte}</p>
              <Bouton variante="primaire" onClick={p.onEnvoyer}>
                {l.envoyer}
              </Bouton>
            </div>
          </section>
        )}
        <div className="ec-h12__droite">
          {p.circuit && (
            <section className="ec-carte ec-h12__bloc" aria-labelledby="h12-circuit">
              <header className="ec-tete">
                <h2 id="h12-circuit">{p.circuit.titre}</h2>
                <span className="ec-discret">{p.circuit.sous}</span>
                <span className="ec-discret ec-h12__progression">{p.circuit.progression}</span>
                <AnneauProgression valeur={p.circuit.pourcent} taille={22} epaisseur={3} libelle={p.circuit.progression} />
              </header>
              <ol className="ec-h12__signataires">
                {p.circuit.signataires.map((s) => (
                  <li key={s.id}>
                    <div className="ec-h12__signataire-tete">
                      <Avatar nom={s.nom} taille={24} />
                      <span className="ec-h12__signataire-textes">
                        <strong>{s.nom}</strong>
                        <span>{s.role}</span>
                      </span>
                      <span className="ec-puce" data-ton={s.badge.ton}>
                        {s.badge.libelle}
                      </span>
                    </div>
                    <ul className="ec-h12__etapes">
                      {s.etapes.map((e) => (
                        <li key={e.libelle} data-fait={e.fait ? 'oui' : undefined}>
                          <span className="ec-h12__etape-rond" aria-hidden>
                            {e.fait && <Check size={9} />}
                          </span>
                          <span className="ec-h12__etape-libelle">{e.libelle}</span>
                          <span className="ec-h12__etape-quand">{e.quand}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
                {p.circuit.copie && (
                  <li className="ec-h12__copie">
                    <Avatar nom={p.circuit.copie.nom} taille={24} />
                    <span>
                      <strong>{p.circuit.copie.nom}</strong> · {p.circuit.copie.role}
                      <small>{p.circuit.copie.note}</small>
                    </span>
                  </li>
                )}
              </ol>
            </section>
          )}
          {p.relance && (
            <section className="ec-carte ec-h12__bloc" aria-labelledby="h12-relance">
              <header className="ec-tete">
                <h2 id="h12-relance">{l.relance}</h2>
                <span className="ec-discret">{p.relance.quand}</span>
                <Interrupteur actif={p.relance.active} onChange={p.relance.onBasculer ?? (() => undefined)} libelle={l.relance} />
              </header>
              <p className="ec-h12__message">{p.relance.texte}</p>
              <div className="ec-h12__relance-actions">
                <Bouton variante="primaire" taille="petit" onClick={p.relance.onRelancer}>
                  {p.relance.relancer}
                </Bouton>
                <Bouton variante="secondaire" taille="petit" disabled>
                  {p.relance.modifier}
                </Bouton>
                <span className="ec-discret">{p.relance.prepare}</span>
              </div>
            </section>
          )}
          {p.preuve && (
            <section className="ec-carte ec-h12__bloc" aria-labelledby="h12-preuve">
              <header className="ec-tete">
                <h2 id="h12-preuve">{p.preuve.entete}</h2>
                <span className="ec-discret">{p.preuve.sous}</span>
                <span className="ec-discret">{p.preuve.lien}</span>
              </header>
              <ul className="ec-h12__traces ec-mono">
                {p.preuve.traces.map((t, i) => (
                  <li key={i}>
                    <span>{t.quand}</span> <b>{t.genre}</b> {t.qui}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
