import React from 'react';
import { AlertCircle, Check, Clock, ExternalLink, Plus, Repeat, Sparkles, Undo2 } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { Anneau, Avatar, Interrupteur } from '../../../socle/ui';
import type { FiltreRappels, ModeleRappels, Puce, RappelAffiche, SectionAffichee } from './modele';
import { useMotsRappels } from './i18n';
import '../../contacts/cibles.css';
import './rappels.css';

/**
 * « RAPPELS » (MJ05) — le fil des rappels. Mise en page et états, sans accès aux données. Disposition (fiche MJ05, zone principale de 1108 px) :
 * colonne de 300 (Tenus à temps 104, Récurrents, Comment tu es prévenu 190), écart 20, carte « Fil des rappels » de 788 × 664 : une colonne
 * d'heures (62), le rail (30) et les rappels. Un rappel passé est « à reprendre », jamais « en retard » ; le proposé est en pointillé.
 */
export interface Recurrent { id: string; nom: string; rythme: string; initiale: string }
export interface Prevenu { defaut: string; canal: string; calmes: { actif: boolean; plage: string }; reportAuto: boolean }

export interface ActionsRappels {
  nouveau: () => void;
  recurrents: () => void;
  filtre: (f: FiltreRappels) => void;
  ouvrir: (id: string) => void;
  fait: (id: string) => void;
  reporter: (id: string, puce: Puce) => void;
  programmer: (id: string) => void;
  non: (id: string) => void;
  ouvrirLien: (id: string) => void;
  ouvrirRecurrent: (id: string) => void;
  calmes: (actif: boolean) => void;
  reportAuto: (actif: boolean) => void;
  reessayer: () => void;
  relances: () => void;
  taches: () => void;
}

export interface VueRappelsProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleRappels;
  /** « 10:42 » : l'heure du titre « Maintenant ». */
  heure: string;
  /** « samedi 31 ». */
  demain: string;
  filtre: FiltreRappels;
  recurrents: readonly Recurrent[] | null;
  prevenu: Prevenu | null;
  actions: ActionsRappels;
  /** Ce que la source n'a pas est masqué : report, proposé, filtre par personne, lecture seule. */
  lecture?: boolean;
  filtres?: boolean;
}

type Tm = ReturnType<typeof useMotsRappels>['tm'];
const FILTRES: FiltreRappels[] = ['tous', 'miens', 'equipe'];
const JOURS = ['', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;

function duree(tm: Tm, min: number): string {
  if (min < 60) return tm('duree.min', { n: min });
  if (min >= 24 * 60) return tm('duree.j', { n: Math.floor(min / (24 * 60)) });
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? tm('duree.h', { n: h }) : tm('duree.hmin', { h, m });
}
const libellePuce = (tm: Tm, p: Puce): string => (p.cle === 'plus1h' ? tm('puce.plus1h') : p.cle === 'soir' ? tm('puce.soir') : p.cle === 'apresMidi' ? p.heure : tm('puce.ouvre', { jour: p.jourSemaine && !p.jourDemain ? tm(`jour.${JOURS[p.jourSemaine] as Exclude<(typeof JOURS)[number], ''>}` as const) : tm('puce.demain') }));

export function VueRappels({ statut, horsLigne = false, modele: m, heure, demain, filtre, recurrents, prevenu, actions, lecture = false, filtres = true }: VueRappelsProps) {
  const { tm } = useMotsRappels();
  const sousTitre = m.restantAujourdhui === 0 ? tm('sousTitre.rien') : `${tm(m.restantAujourdhui === 1 ? 'sousTitre.reste.1' : 'sousTitre.reste.n', { n: m.restantAujourdhui })}${m.aReprendre > 0 ? tm('sousTitre.reprendre', { r: m.aReprendre }) : ''}`;
  const t = m.tenus;
  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        className="sc-rp__entete"
        secondaires={lecture ? [] : [{ libelle: tm('action.recurrents'), onClick: actions.recurrents, icone: <Undo2 size={14} strokeWidth={1.9} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.nouveau'), onClick: actions.nouveau, icone: <Plus size={14} strokeWidth={2.2} /> }}
      />
      {horsLigne && <p className="sc-rp__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-rp" aria-busy={statut === 'chargement' || undefined}>
          <div className="sc-rp-gauche">
            <section className="sc-rp-carte sc-rp-tenus" aria-label={tm('tenus.titre')}>
              {t.pourcent !== null ? (
                <>
                  <Anneau valeur={t.pourcent / 100} taille={72} ton="succes" libelle={tm('tenus.libelle', { pourcent: t.pourcent })} />
                  <div>
                    <h2>{tm('tenus.titre')}</h2>
                    {t.ecartPoints !== null && <b className="sc-nombre">{tm(Math.abs(t.ecartPoints) <= 1 ? 'tenus.ecart.1' : 'tenus.ecart.n', { n: `${t.ecartPoints > 0 ? '+' : ''}${t.ecartPoints}` })}</b>}
                    <p>{tm(t.traites <= 1 ? 'tenus.phrase.1' : 'tenus.phrase.n', { t: t.traites, n: t.total })}</p>
                  </div>
                </>
              ) : (
                <div><h2>{tm('tenus.titre')}</h2><p>{tm('tenus.aucun')}</p></div>
              )}
            </section>
            {recurrents && (
              <section className="sc-rp-carte sc-rp-recurrents" aria-label={tm('recurrents.titre')}>
                <header><h2>{tm('recurrents.titre')}</h2><span>{tm(recurrents.length <= 1 ? 'recurrents.actifs.1' : 'recurrents.actifs.n', { n: recurrents.length })}</span></header>
                <ul>
                  {recurrents.map((r) => (
                    <li key={r.id}>
                      <button type="button" aria-label={tm('recurrents.ouvrir', { nom: r.nom })} onClick={() => actions.ouvrirRecurrent(r.id)}>
                        <Repeat size={13} strokeWidth={1.8} aria-hidden />
                        <span className="sc-rp-recurrents__nom">{r.nom}</span>
                        <span className="sc-rp-recurrents__rythme">{r.rythme}</span>
                        <Avatar nom={r.initiale} taille={20} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {prevenu && (
              <section className="sc-rp-carte sc-rp-prevenu" aria-label={tm('prevenu.titre')}>
                <h2>{tm('prevenu.titre')}</h2>
                <dl>
                  <div><dt>{tm('prevenu.defaut')}</dt><dd>{prevenu.defaut}</dd></div>
                  <div><dt>{tm('prevenu.canal')}</dt><dd>{prevenu.canal}</dd></div>
                  <div><dt>{tm('prevenu.calmes')}</dt><dd><span>{prevenu.calmes.plage}</span><Interrupteur actif={prevenu.calmes.actif} onChange={actions.calmes} libelle={tm('prevenu.calmes')} disabled={lecture} /></dd></div>
                  <div><dt>{tm('prevenu.report')}</dt><dd><Interrupteur actif={prevenu.reportAuto} onChange={actions.reportAuto} libelle={tm('prevenu.report')} disabled={lecture} /></dd></div>
                </dl>
              </section>
            )}
          </div>

          <section className="sc-rp-carte sc-rp-fil" aria-label={tm('fil.titre')}>
            <header className="sc-rp-fil__tete">
              <h2>{tm('fil.titre')}</h2>
              {filtres && (
                <div className="sc-rp-chips" role="group" aria-label={tm('filtre.libelle')}>
                  {FILTRES.map((f) => <button key={f} type="button" aria-pressed={filtre === f} onClick={() => actions.filtre(f)}>{tm(`filtre.${f}` as const)}</button>)}
                </div>
              )}
              <span className="sc-rp-fil__compteur sc-nombre">{m.aReprendre > 0 ? tm('fil.compteur.reprendre', { n: m.restantAujourdhui, r: m.aReprendre }) : tm('fil.compteur', { n: m.restantAujourdhui })}</span>
            </header>
            <div className="sc-rp-fil__corps">
              {m.vide && statut === 'pret' ? (
                <div className="sc-rp-vide">
                  <p>{tm('vide.texte')}</p>
                  {lecture ? (
                    <><p className="sc-rp-vide__lecture">{tm('lecture.texte')}</p>
                      <div className="sc-rp-vide__actions">
                        <Bouton variante="secondaire" taille="petit" onClick={actions.relances}>{tm('lecture.relances')}</Bouton>
                        <Bouton variante="secondaire" taille="petit" onClick={actions.taches}>{tm('lecture.taches')}</Bouton>
                      </div></>
                  ) : <Bouton variante="primaire" taille="petit" onClick={actions.nouveau}>{tm('vide.nouveau')}</Bouton>}
                </div>
              ) : (
                <>
                  {m.sections.length === 0 && <p className="sc-rp-vide">{tm('maintenant.rien')}</p>}
                  {m.sections.map((s) => <Section key={s.cle} s={s} m={m} tm={tm} heure={heure} demain={demain} actions={actions} lecture={lecture} horsLigne={horsLigne} />)}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </Page>
  );
}

function titreDeSection(tm: Tm, s: SectionAffichee, m: ModeleRappels, heure: string, demain: string): string {
  if (s.cle === 'maintenant') return tm('section.maintenant', { heure });
  if (s.cle === 'demain') return tm('section.demain', { jour: demain });
  if (s.cle === 'semaine') return tm(m.etiquetteSemaine === 'Semaine prochaine' ? 'section.semaine.prochaine' : 'section.semaine.cette');
  return tm(`section.${s.cle}` as const);
}

function compteDeSection(tm: Tm, s: SectionAffichee, m: ModeleRappels): string {
  if (s.cle === 'maintenant' && m.aReprendre > 0) return tm('compte.reprendre', { n: m.aReprendre });
  if (s.nbProposes > 0) return [s.nbPrevus > 0 ? tm(s.nbPrevus === 1 ? 'compte.prevus.1' : 'compte.prevus.n', { n: s.nbPrevus }) : '', tm(s.nbProposes === 1 ? 'compte.proposes.1' : 'compte.proposes.n', { n: s.nbProposes })].filter(Boolean).join(', ');
  return String(s.nbPrevus);
}

function Section({ s, m, tm, heure, demain, actions, lecture, horsLigne }: { s: SectionAffichee; m: ModeleRappels; tm: Tm; heure: string; demain: string; actions: ActionsRappels; lecture: boolean; horsLigne: boolean }) {
  return (
    <div className="sc-rp-section" data-section={s.cle}>
      <h3 className="sc-rp-section__titre"><span>{titreDeSection(tm, s, m, heure, demain)}</span><i aria-hidden /><b className="sc-nombre">{compteDeSection(tm, s, m)}</b></h3>
      {s.cle === 'faits' ? (
        <ul className="sc-rp-faits">{Array.from({ length: Math.ceil(s.rappels.length / 2) }, (_, i) => s.rappels.slice(i * 2, i * 2 + 2)).map((paire) => (
          <li key={paire[0].id}>
            <span className="sc-nombre sc-rp-heure">{paire[0].heure}</span>
            <Noeud etat="fait" tm={tm} />
            <span className="sc-rp-fait__titre">{paire[0].titre}</span>
            {paire[0].automatique && <span className="sc-rp-fait__auto">· {paire[0].automatique}</span>}
            {paire[1] && <span className="sc-rp-fait__suite"><span className="sc-nombre">{paire[1].heure}</span><span className="sc-rp-fait__titre">{paire[1].titre}</span></span>}
          </li>
        ))}</ul>
      ) : (
        <ul className="sc-rp-liste">{s.rappels.map((r) => <Rappel key={r.id} r={r} puces={m.puces} tm={tm} actions={actions} lecture={lecture} horsLigne={horsLigne} />)}</ul>
      )}
    </div>
  );
}

function Noeud({ etat, tm }: { etat: RappelAffiche['noeud']; tm: Tm }) {
  return <span className="sc-rp-noeud" data-etat={etat} role="img" aria-label={tm(`noeud.${etat}` as const)}>{etat === 'fait' && <Check size={10} strokeWidth={3} aria-hidden />}</span>;
}

function Rappel({ r, puces, tm, actions, lecture, horsLigne }: { r: RappelAffiche; puces: Puce[]; tm: Tm; actions: ActionsRappels; lecture: boolean; horsLigne: boolean }) {
  const repr = r.noeud === 'a-reprendre';
  const propose = r.noeud === 'propose';
  return (
    <li className="sc-rp-ligne" data-etat={r.noeud}>
      <span className="sc-nombre sc-rp-heure" data-etat={r.noeud}>{r.heure}</span>
      <Noeud etat={r.noeud} tm={tm} />
      <article className="sc-rp-rappel" data-etat={r.noeud}>
        <button type="button" className="sc-rp-rappel__ouvrir" aria-label={tm('rappel.ouvrir', { titre: r.titre })} onClick={() => actions.ouvrir(r.id)} />
        <div className="sc-rp-rappel__ligne">
          <div className="sc-rp-rappel__texte">
            <b>{propose && <Sparkles size={12} strokeWidth={2} aria-hidden />}{r.titre}</b>
            <span>{propose ? tm('propose.par', { contexte: r.contexte }) : r.contexte}</span>
          </div>
          <div className="sc-rp-rappel__droite">
            {!propose && <Avatar nom={r.initiale} taille={22} />}
            {r.delai && <span className="sc-rp-delai sc-nombre" data-genre={r.delai.genre}>{tm(r.delai.genre === 'reprendre' ? 'delai.reprendre' : 'delai.dans', { duree: duree(tm, r.delai.minutes) })}</span>}
            {r.silencieux && !propose && <span className="sc-rp-silence">{tm('rappel.silencieux')}</span>}
            {horsLigne && !propose && <span className="sc-rp-silence">{tm('rappel.enAttente')}</span>}
            {propose && !lecture && (
              <>
                <Bouton variante="primaire" taille="petit" onClick={() => actions.programmer(r.id)}>{tm('propose.programmer')}</Bouton>
                <Bouton variante="secondaire" taille="petit" onClick={() => actions.non(r.id)}>{tm('propose.non')}</Bouton>
              </>
            )}
            {!propose && !repr && !lecture && (
              <button type="button" className="sc-rp-reporter" onClick={() => actions.reporter(r.id, puces[0])}><Clock size={12} strokeWidth={1.9} aria-hidden />{tm('rappel.reporter')}</button>
            )}
          </div>
        </div>
        {repr && !lecture && (
          <div className="sc-rp-actions">
            <span>{tm('rappel.reporter')}</span>
            <span className="sc-rp-puces">
              {puces.map((p) => <button key={p.cle} type="button" aria-label={tm('puce.libelle', { titre: r.titre, quand: libellePuce(tm, p) })} onClick={() => actions.reporter(r.id, p)}>{libellePuce(tm, p)}</button>)}
            </span>
            <span className="sc-rp-actions__fin">
              {r.lien && (
                <button type="button" className="sc-rp-lien" onClick={() => actions.ouvrirLien(r.id)}><ExternalLink size={12} strokeWidth={1.9} aria-hidden />{r.lien}</button>
              )}
              <button type="button" className="sc-rp-fait" onClick={() => actions.fait(r.id)}><Check size={12} strokeWidth={2.4} aria-hidden />{tm('rappel.fait')}</button>
            </span>
          </div>
        )}
      </article>
    </li>
  );
}
