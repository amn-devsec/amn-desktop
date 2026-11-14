import React from 'react';
import { ArrowRight, Plus, Settings2, Sparkles } from 'lucide-react';
import { Avatar, Bouton, CountBadge, Donut, LiveDot, ModuleTile, PageHead } from '../../../../socle/ui';
import '../commun/ecran.css';
import './hub.css';

/**
 * F40 — Échanger, vue d'ensemble : la VUE. Le pouls des échanges (qui attend, et depuis quand, sur une règle en racine
 * carrée), les canaux actifs, la Boîte à zéro et les dix modules. Elle reçoit des textes et des nombres déjà composés
 * (`composerHub`) ; ce que le poste ne sait pas n'est pas montré.
 */

export interface ClientDuPouls {
  id: string;
  initiales: string;
  nom: string;
  detail: string;
  /** 0 à 1 sur l'axe : racine carrée de l'attente. */
  position: number;
  haut: boolean;
  orange: boolean;
  presence: { nom: string; mode: string } | null;
}
export interface LigneCanalVue {
  id: string;
  nom: string;
  barres: number[];
  statut: string;
  ton: 'orange' | 'neutre';
  presence: string | null;
}
export interface TuileDEchangeVue {
  cle: string;
  nom: string;
  icone: React.ReactNode;
  sous: string;
  vers: string | null;
  onClick?: () => void;
  pastille: number | null;
  avatar: string | null;
}

export interface VueHubProps {
  titre: string;
  sousTitre: string;
  libelles: Record<string, string>;
  onNouveauMessage: () => void;
  onPersonnaliser?: () => void;
  pouls: {
    sous: string;
    graduations: { libelle: string; position: number }[];
    seuil: { position: number; libelle: string } | null;
    clients: ClientDuPouls[];
    vide: string | null;
    onRepondre?: () => void;
  };
  canaux: { entete: string; sous: string; lignes: LigneCanalVue[] };
  boite: {
    valeur: number;
    libelle: string;
    detail: string;
    legende: { faits: string; chezEux: string; aRepondre: string };
    segments: { faits: number; chezEux: number; aRepondre: number };
    serie: { phrase: string; jours: { libelle: string; etat: 'zero' | 'manque' | 'aujourdhui' | 'a-venir' }[] } | null;
    cases: { libelle: string; fait: boolean }[];
    suggestion: { texte: string; oui: string; onOui: () => void } | null;
  } | null;
  modules: { titre: string; tous: string; tuiles: TuileDEchangeVue[] };
}

export function VueHub(p: VueHubProps) {
  const l = p.libelles;
  return (
    <div className="ex-page ex-f40" data-famille="echanger" data-refonte-police="inter">
      <PageHead
        titre={l.titre}
        sousTitre={p.sousTitre}
        secondaires={[{ libelle: l.personnaliser, onClick: p.onPersonnaliser, icone: <Settings2 size={14} aria-hidden />, disabled: !p.onPersonnaliser }]}
        primaire={{ libelle: l.nouveauMessage, onClick: p.onNouveauMessage, icone: <Plus size={14} aria-hidden /> }}
      />
      <div className="ex-f40__haut">
        <section className="ex-carte ex-f40__pouls" aria-labelledby="f40-pouls">
          <header className="ex-tete">
            <h2 id="f40-pouls">{l.pouls}</h2>
            <span className="ex-discret">{p.pouls.sous}</span>
            {p.pouls.onRepondre && (
              <Bouton variante="secondaire" taille="petit" onClick={p.pouls.onRepondre}>
                <ArrowRight size={12} aria-hidden />
                {l.repondreAuPlusAncien}
              </Bouton>
            )}
          </header>
          <div className="ex-f40__regle" role="img" aria-label={p.pouls.sous}>
            <span className="ex-f40__axe" aria-hidden />
            <i className="ex-f40__maintenant" aria-hidden />
            {p.pouls.seuil && <span className="ex-f40__seuil" style={{ left: `${p.pouls.seuil.position * 100}%` }} aria-hidden />}
            {p.pouls.clients.map((c) => (
              <span key={c.id} className="ex-f40__client" data-haut={c.haut ? 'oui' : undefined} data-orange={c.orange ? 'oui' : undefined} style={{ left: `${c.position * 100}%` }}>
                <span className="ex-f40__etiquette">
                  <strong>{c.nom}</strong>
                  <small>{c.detail}</small>
                  {c.presence && (
                    <small className="ex-f40__presence">
                      <Avatar nom={c.presence.nom} taille={14} /> {c.presence.nom} {c.presence.mode}
                    </small>
                  )}
                </span>
                <span className="ex-f40__noeud">{c.initiales}</span>
              </span>
            ))}
            {p.pouls.vide && <p className="ex-f40__calme">{p.pouls.vide}</p>}
            <ul className="ex-f40__graduations ex-mono" aria-hidden>
              {p.pouls.graduations.map((g) => (
                <li key={g.libelle} style={{ left: `${g.position * 100}%` }}>
                  {g.libelle}
                </li>
              ))}
            </ul>
          </div>
          <div className="ex-f40__canaux">
            <p className="ex-f40__canaux-tete">
              <b>{p.canaux.entete}</b> <span>{p.canaux.sous}</span>
            </p>
            <ul>
              {p.canaux.lignes.map((c) => (
                <li key={c.id}>
                  <span className="ex-f40__canal-nom">{c.nom}</span>
                  <span className="ex-f40__barres" aria-hidden>
                    {c.barres.map((b, i) => (
                      <i key={i} style={{ height: `${Math.max(2, b * 5)}px` }} data-vide={b === 0 ? 'oui' : undefined} />
                    ))}
                  </span>
                  <span className="ex-f40__statut" data-ton={c.ton}>
                    {c.statut}
                  </span>
                  {c.presence && <span className="ex-discret">{c.presence}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {p.boite ? (
          <section className="ex-carte ex-f40__boite" aria-labelledby="f40-boite">
            <header className="ex-tete">
              <h2 id="f40-boite">{l.boite}</h2>
              <span className="ex-discret">{l.aujourdhui}</span>
            </header>
            <div className="ex-f40__anneau">
              <Donut
                taille={172}
                epaisseur={14}
                libelle={p.boite.detail}
                segments={[
                  { valeur: p.boite.segments.faits, ton: 'succes', libelle: p.boite.legende.faits },
                  { valeur: p.boite.segments.chezEux, ton: 'info', libelle: p.boite.legende.chezEux },
                  { valeur: p.boite.segments.aRepondre, ton: 'neutre', libelle: p.boite.legende.aRepondre },
                ]}
                centre={
                  <span className="ex-f40__centre">
                    <span className="ex-f40__grand">{p.boite.valeur}</span>
                    <span className="ex-f40__anneau-libelle">{p.boite.libelle}</span>
                    <span className="ex-discret">{p.boite.detail}</span>
                  </span>
                }
              />
            </div>
            {p.boite.serie && (
              <div className="ex-f40__serie">
                <p>
                  <b>{l.belleSerie}</b> <span>{p.boite.serie.phrase}</span>
                </p>
                <ul>
                  {p.boite.serie.jours.map((j) => (
                    <li key={j.libelle} data-etat={j.etat}>
                      {j.libelle}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ul className="ex-f40__cases">
              {p.boite.cases.map((c) => (
                <li key={c.libelle} data-fait={c.fait ? 'oui' : undefined}>
                  <span aria-hidden />
                  {c.libelle}
                </li>
              ))}
            </ul>
            {p.boite.suggestion && (
              <div className="ex-f40__suggestion">
                <Sparkles size={14} aria-hidden />
                <span>{p.boite.suggestion.texte}</span>
                <Bouton variante="primaire" taille="petit" onClick={p.boite.suggestion.onOui}>
                  {p.boite.suggestion.oui}
                </Bouton>
              </div>
            )}
          </section>
        ) : null}
      </div>

      <section className="ex-carte ex-f40__modules" aria-labelledby="f40-modules">
        <header className="ex-tete">
          <h2 id="f40-modules">{p.modules.titre}</h2>
          <span className="ex-discret">{p.modules.tous}</span>
        </header>
        <ul className="ex-f40__tuiles">
          {p.modules.tuiles.map((m) => {
            const commun = {
              nom: m.nom,
              icone: m.icone,
              famille: 'echanger' as const,
              sousTexte: m.sous,
              className: 'ex-f40__tuile',
              accessoire: m.avatar ? <Avatar nom={m.avatar} taille={20} enLigne /> : m.pastille ? <CountBadge n={m.pastille} /> : undefined,
              title: m.nom,
            };
            return <li key={m.cle}>{m.vers ? <ModuleTile {...commun} vers={m.vers} /> : <ModuleTile {...commun} onClick={m.onClick ?? (() => undefined)} />}</li>;
          })}
        </ul>
      </section>
      <span hidden>
        <LiveDot ton="ok" libelle="" />
      </span>
    </div>
  );
}
