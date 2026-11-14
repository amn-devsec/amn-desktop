import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, Check, ChevronRight, Clock, FileText, Inbox, MessageSquareText, Pencil, Phone, Receipt, Send, TriangleAlert, UserRound } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat, DialogueConfirmation } from '../../../socle/ui/situations';
import { Raccourci } from '../../../socle/ui/Pastilles';
import { Segmente, SuggestionAjmani } from '../../../socle/ui/controles';
import { dire, direCompte } from '../i18n';
import type { TonMessage } from '../relances';
import type { CarteRelance, EtapeFrise, LigneFile, ModelePile } from './modele';
import { useMotsPile } from './i18n';
import './pile.css';
import '../cibles.css';

/**
 * « RELANCES » (MC07) — la pile focalisée : la file du jour à gauche (260 × 664), la relance au premier plan au centre
 * (522 × 626) avec deux bandes derrière, la cadence de l'objet, les réglages d'envoi et la suggestion à droite (290).
 * Mise en page et états, sans accès aux données : tout vient du modèle (`modele.ts`) et des actions.
 *
 * RIEN NE PART SANS UN CLIC : « Envoyer et suivante » est la seule action qui envoie, et elle est désactivée quand la règle
 * d'espacement l'interdit (la phrase dit pourquoi et quand). Clavier : ⏎ (ou ⌘⏎ dans le texte) envoie, R reporte, → passe.
 */
export interface ActionsPile {
  envoyer: () => void;
  reporter: () => void;
  passer: () => void;
  appeler: () => void;
  ouvrirLigne: (cle: string) => void;
  ton: (ton: TonMessage) => void;
  brouillon: (cle: string, texte: string) => void;
  modeles: () => void;
  /** Absent : le bouton « Tout envoyer » n'existe pas (l'application n'envoie pas elle-même). */
  toutEnvoyer?: () => void;
  modifierReglages: () => void;
  planifierAppel: () => void;
  masquerSuggestion: () => void;
  voirReponses: () => void;
  annuler: () => void;
  reessayer: () => void;
}

export interface VuePileProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModelePile;
  ton: TonMessage;
  /** `courriel` : la relance part par courriel ; `copie` : elle est copiée pour être collée (l'application n'envoie pas). */
  envoi: 'courriel' | 'copie';
  /** Le dernier geste, annulable quelques secondes. */
  annulation: { texte: string } | null;
  actions: ActionsPile;
  lecture?: boolean;
  /** Le nombre de messages que « Tout envoyer » enverrait (confirmation). */
  nbToutEnvoyer?: number;
}

const ICONES_MOTIF = { devis: FileText, facture: Receipt, 'rendez-vous': CalendarClock, prospect: UserRound, inactif: MessageSquareText } as const;

export function VuePile({ statut, horsLigne = false, modele, ton, envoi, annulation, actions, lecture = false, nbToutEnvoyer = 0 }: VuePileProps) {
  const { tm, langue } = useMotsPile();
  const m = modele;
  const c = m.courante;
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    if (!c || lecture) return undefined;
    const onKey = (e: KeyboardEvent) => {
      const cible = e.target instanceof HTMLElement ? e.target : null;
      const champ = cible?.closest('textarea, input, select') != null;
      const bouton = cible?.closest('button, a, [role="radio"]') != null;
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (c.peutPartir) actions.envoyer(); return; }
      if (champ || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter' && !bouton) { e.preventDefault(); if (c.peutPartir) actions.envoyer(); }
      else if ((e.key === 'r' || e.key === 'R') && !bouton) actions.reporter();
      else if (e.key === 'ArrowRight' && !bouton) actions.passer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [c, lecture, actions]);

  const compte = (base: string, n: number, params: Record<string, string | number> = {}) => tm(`${base}.${n <= 1 ? '1' : 'n'}` as never, { n, ...params } as never);
  const sousTitre = m.total === 0 ? tm('sousTitre.zero') : compte('sousTitre', m.reste);
  const jourCourt = (j: string) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const dateCourte = (j: string) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));

  const droiteDe = (l: LigneFile): React.ReactNode => {
    const d = l.droite;
    switch (d.genre) {
      case 'heure': return <span className="sc-nombre">{d.heure}</span>;
      case 'encours': return <span className="sc-pl-ligne__encours">{tm('file.droite.encours')}</span>;
      case 'reportee': return <span>{tm('file.droite.reportee')}</span>;
      case 'rang': return <span className="sc-pl-ligne__rang">{tm(d.rang <= 1 ? 'file.droite.rang.1' : 'file.droite.rang.n', { rang: d.rang })}</span>;
      case 'jours': return <span>{compte('file.droite.jours', d.n)}</span>;
    }
  };

  const File = (
    <section className="sc-pl-carte sc-pl-file" aria-label={tm('file.aria')}>
      <header className="sc-pl-file__tete">
        <h2>{tm('file.titre')}</h2>
        <span className="sc-nombre">{m.total > 0 ? compte('file.traitees', m.traitees, { t: m.traitees, n: m.total }) : ''}</span>
      </header>
      <div className="sc-pl-segments" aria-hidden>
        {Array.from({ length: Math.max(1, Math.min(8, m.total)) }, (_, i) => {
          const fait = i < Math.round((m.traitees / Math.max(1, m.total)) * Math.min(8, m.total));
          const enCours = !fait && i === Math.round((m.traitees / Math.max(1, m.total)) * Math.min(8, m.total)) && !m.videe;
          return <i key={i} data-fait={fait ? '' : undefined} data-encours={enCours ? '' : undefined} />;
        })}
      </div>
      <p className="sc-pl-file__phrase">{m.total === 0 ? '' : m.videe ? dire(langue, 'relance.boiteAZero.vide') : dire(langue, m.reste <= 1 ? 'relance.boiteAZero.reste.1' : 'relance.boiteAZero.reste.n', { n: m.reste })}</p>
      <ul className="sc-pl-lignes">
        {m.lignes.map((l) => (
          <li key={l.cle}>
            <button type="button" className="sc-pl-ligne" data-etat={l.etat} aria-current={l.etat === 'encours' ? 'true' : undefined} aria-label={tm('file.ligne.ouvrir', { client: l.clientNom })} disabled={l.etat === 'faite'} onClick={() => actions.ouvrirLigne(l.cle)}>
              <span className="sc-pl-ligne__rond" data-etat={l.etat} aria-hidden>{l.etat === 'faite' && <Check size={11} strokeWidth={3} />}</span>
              <span className="sc-pl-ligne__corps">
                <b>{l.clientNom}</b>
                <span>{[tm(`motif.${l.motif}`), l.etat === 'faite' && l.motif === 'rendez-vous' ? '' : l.montant ?? (l.motif === 'prospect' ? '' : l.reference)].filter(Boolean).join(' · ') || tm(`motif.${l.motif}`)}</span>
              </span>
              <span className="sc-pl-ligne__droite">{droiteDe(l)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="sc-pl-reponses">
        <h3>{tm('reponses.titre')}</h3>
        {m.reponses === null ? <p className="sc-pl-vide">{tm('reponses.indisponible')}</p> : m.reponses.length === 0 ? <p className="sc-pl-vide">{tm('reponses.vide')}</p> : (
          <ul>
            {m.reponses.slice(0, 2).map((r) => (
              <li key={r.clientNom + r.texte}>
                <button type="button" className="sc-pl-reponse" onClick={actions.voirReponses}>
                  <span className="sc-pl-reponse__icone" data-genre={r.genre} aria-hidden>{r.genre === 'paiement' ? '€' : <MessageSquareText size={13} strokeWidth={1.9} />}</span>
                  <span className="sc-pl-ligne__corps"><b>{r.clientNom}</b><span>{r.texte}</span></span>
                  {r.heure && <span className="sc-pl-ligne__droite sc-nombre">{r.heure}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="sc-pl-serie">
        <div className="sc-pl-serie__tete"><b>{tm('serie.titre')}</b><span>{m.serie > 0 ? direCompte(langue, 'relance.serie', m.serie) : tm('serie.aucune')}</span></div>
        <div className="sc-pl-ronds">
          {m.semaine.map((s) => (
            <span key={s.jour} className="sc-pl-jour">
              <span className="sc-pl-rond" data-coche={s.coche ? '' : undefined} data-aujourdhui={s.aujourdhui && !s.coche ? '' : undefined} aria-label={`${jourCourt(s.jour)}${s.aujourdhui ? `, ${tm('serie.jour.aujourdhui')}` : ''}`}>{s.coche && <Check size={12} strokeWidth={3} />}</span>
              <small>{jourCourt(s.jour).replace(/\.$/, '').slice(0, 3)}.</small>
            </span>
          ))}
        </div>
      </div>
      <dl className="sc-pl-compteurs">
        <div><dt>{tm('mois.envoyees')}</dt><dd className="sc-nombre">{m.envoyeesMois}</dd></div>
        <div><dt>{tm('mois.reponses')}</dt><dd className="sc-nombre" data-ton={m.tauxReponse == null ? undefined : 'succes'}>{m.tauxReponse == null ? <span className="sc-pl-nd">{tm('mois.nonDisponible')}</span> : `${m.tauxReponse} %`}</dd></div>
      </dl>
    </section>
  );

  const Pile = (
    <section className="sc-pl-centre" aria-label={tm('pile.aria')}>
      {c && m.ensuite.length > 0 && (
        <>
          <div className="sc-pl-bande sc-pl-bande--2" aria-hidden />
          <div className="sc-pl-bande sc-pl-bande--1" aria-hidden><span>{tm('pile.ensuite', { noms: m.ensuite.join(', ') })}</span></div>
        </>
      )}
      {c ? <CarteFocalisee c={c} ton={ton} envoi={envoi} actions={actions} lecture={lecture} jours={m.reglages} /> : (
        <div className="sc-pl-zero">
          <BlocEtat
            icone={<Inbox size={20} strokeWidth={1.7} />}
            ton="neutre"
            titre={dire(langue, m.total === 0 ? 'relance.vide' : 'relance.boiteAZero.vide')}
            actions={m.total > 0 && m.reponses && m.reponses.length > 0 ? <Bouton variante="secondaire" onClick={actions.voirReponses}>{tm('zero.voir')}</Bouton> : <span />}
          />
        </div>
      )}
      {c && (
        <div className="sc-pl-raccourcis" aria-hidden>
          <span><Raccourci>⏎</Raccourci> {tm(envoi === 'courriel' ? 'kbd.envoyer' : 'kbd.copier')}</span>
          <span><Raccourci>R</Raccourci> {tm('kbd.reporter')}</span>
          <span><Raccourci>→</Raccourci> {tm('kbd.passer')}</span>
        </div>
      )}
      {annulation && (
        <div className="sc-pl-annuler" role="status">
          <span>{annulation.texte}</span>
          <button type="button" onClick={actions.annuler}>{tm('annuler.bouton')}</button>
        </div>
      )}
    </section>
  );

  const Droite = (
    <div className="sc-pl-droite">
      <section className="sc-pl-carte sc-pl-cadence" aria-label={c ? tm(`cadence.titre.${c.motif}`) : tm('cadence.titre.devis')}>
        <h2>{c ? tm(`cadence.titre.${c.motif}`) : tm('cadence.titre.devis')}</h2>
        {m.frise && m.motifFrise ? (
          <ol className="sc-pl-frise">
            {m.frise.map((x, i) => <Etape key={i} x={x} motif={m.motifFrise as keyof typeof ICONES_MOTIF} dateCourte={dateCourte} />)}
          </ol>
        ) : <p className="sc-pl-vide">—</p>}
        <ul className="sc-pl-regles">
          <li><CalendarClock size={13} strokeWidth={1.8} aria-hidden />{tm('cadence.regle.semaine')}</li>
          <li><Check size={13} strokeWidth={2} aria-hidden />{tm('cadence.regle.arret')}</li>
        </ul>
      </section>
      <section className="sc-pl-carte sc-pl-reglages" aria-label={tm('reglages.titre')}>
        <div className="sc-pl-reglages__tete"><h2>{tm('reglages.titre')}</h2><button type="button" onClick={actions.modifierReglages}><Pencil size={12} strokeWidth={1.9} aria-hidden />{tm('reglages.modifier')}</button></div>
        <dl>
          <div><dt>{tm('reglages.envoi')}</dt><dd>{tm('reglages.envoi.valeur', { debut: m.reglages.debut.replace(/^0/, ''), fin: m.reglages.fin.replace(/^0/, '') })}</dd></div>
          <div><dt>{tm('reglages.suivante')}</dt><dd>{tm('reglages.suivante.valeur', { n: m.reglages.espacementJours })}</dd></div>
        </dl>
      </section>
      <section className="sc-pl-suggestion" aria-label={tm('suggestion.astuce.titre')}>
        {m.suggestion ? (
          <SuggestionAjmani
            titre={dire(langue, 'relance.suggestion.appel')}
            texte={tm('suggestion.appel.texte', { client: m.suggestion.clientNom, n: m.suggestion.envoyees })}
            primaire={{ libelle: tm('suggestion.planifier'), onClick: actions.planifierAppel }}
            secondaire={{ libelle: tm('suggestion.non'), onClick: actions.masquerSuggestion }}
          />
        ) : (
          <div className="sc-pl-astuce"><span>{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
        )}
      </section>
    </div>
  );

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        secondaires={[
          { libelle: tm('action.modeles'), onClick: actions.modeles, icone: <FileText size={14} strokeWidth={1.9} /> },
          ...(actions.toutEnvoyer && !lecture ? [{ libelle: tm('action.toutEnvoyer'), onClick: () => setConfirmation(true), icone: <Send size={14} strokeWidth={1.9} /> }] : []),
        ]}
        className="sc-pl__entete"
      />
      {horsLigne && <p className="sc-pl__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-pl" aria-busy={statut === 'chargement' || undefined}>{File}{Pile}{Droite}</div>
      )}
      <DialogueConfirmation
        ouvert={confirmation}
        onAnnuler={() => setConfirmation(false)}
        onConfirmer={() => { setConfirmation(false); actions.toutEnvoyer?.(); }}
        titre={tm('tout.titre')}
        texte={compte('tout.texte', nbToutEnvoyer)}
        libelleAction={tm('tout.action')}
      />
    </Page>
  );
}

function Etape({ x, motif, dateCourte }: { x: EtapeFrise; motif: keyof typeof ICONES_MOTIF; dateCourte: (j: string) => string }) {
  const { tm } = useMotsPile();
  const libelle = x.genre === 'depart' ? tm(`cadence.depart.${motif}`) : x.genre === 'relance' ? tm(x.rang === 2 ? 'cadence.seconde' : 'cadence.premiere') : x.genre === 'appel' ? tm('cadence.appel') : tm('cadence.manuel');
  return (
    <li className="sc-pl-etape" data-etat={x.etat}>
      <span className="sc-pl-etape__point" aria-hidden />
      <span className="sc-pl-etape__texte">
        <b>{libelle}</b>
        {x.etat !== 'fin' && x.le && <small data-ton={x.aujourdhui ? 'succes' : undefined}>{x.aujourdhui ? tm('cadence.aujourdhui') : dateCourte(x.le)}</small>}
      </span>
      {x.jourN != null && x.genre !== 'depart' && <span className="sc-pl-etape__jour sc-nombre">{tm('cadence.jourN', { n: x.jourN })}</span>}
    </li>
  );
}

function CarteFocalisee({ c, ton, envoi, actions, lecture, jours }: { c: CarteRelance; ton: TonMessage; envoi: 'courriel' | 'copie'; actions: ActionsPile; lecture: boolean; jours: ModelePile['reglages'] }) {
  const { tm, langue } = useMotsPile();
  const Icone = ICONES_MOTIF[c.motif];
  const TONS: { cle: TonMessage; libelle: string }[] = [
    { cle: 'courtois', libelle: tm('ton.courtois') },
    { cle: 'chaleureux', libelle: tm('ton.chaleureux') },
    { cle: 'bref', libelle: tm('ton.bref') },
  ];
  const n = c.depuisJours;
  const fait = tm(`fait.${c.motif}.${n <= 1 ? '1' : 'n'}` as never, { n } as never);
  void jours;
  return (
    <article className="sc-pl-focale" data-derniere={c.derniere ? '' : undefined}>
      <header className="sc-pl-focale__tete">
        <span className="sc-pl-initiale" aria-hidden>{c.initiale}</span>
        <div className="sc-pl-focale__id">
          <h2>{c.clientNom}<span className="sc-pl-motif"><i aria-hidden />{tm(`motif.${c.motif}`)}</span></h2>
          <p>{tm(c.rang <= 1 ? 'carte.rang.1' : 'carte.rang.n', { rang: c.rang, max: c.max, objet: tm(`objet.${c.motif}`) })}</p>
        </div>
        {(c.montant || c.reference) && <div className="sc-pl-focale__montant"><b className="sc-nombre">{c.montant ?? ''}</b><span className="sc-nombre">{c.reference}</span></div>}
      </header>
      <ul className="sc-pl-faits">
        <li><Icone size={13} strokeWidth={1.9} aria-hidden />{fait}</li>
        {c.aucuneReponse && <li data-ton="attention"><MessageSquareText size={13} strokeWidth={1.9} aria-hidden />{tm('fait.sansReponse')}</li>}
      </ul>
      {c.derniere && <p className="sc-pl-bandeau" data-ton="attention"><TriangleAlert size={14} strokeWidth={1.9} aria-hidden />{dire(langue, 'relance.derniere')}</p>}
      {!c.derniere && c.suite === 'appel' && <p className="sc-pl-bandeau"><Phone size={14} strokeWidth={1.9} aria-hidden />{tm('suite.appel')}</p>}
      <div className="sc-pl-ton">
        <span>{tm('ton.titre')}</span>
        <Segmente libelle={tm('ton.titre')} options={TONS} valeur={ton} onChange={(k) => actions.ton(k as TonMessage)} taille="compact" />
        <em data-ton={c.peutPartir ? 'succes' : 'attention'}>{c.statutEnvoi}</em>
      </div>
      <div className="sc-pl-papier">
        <div className="sc-pl-papier__ligne"><span>{tm('message.a')}</span><b>{c.a}</b><i className="sc-pl-papier__etiquette sc-nombre">{tm(`motif.${c.motif}`)} {c.reference}</i></div>
        <div className="sc-pl-papier__ligne"><span>{tm('message.objet')}</span><b>{c.sujet}</b></div>
        <textarea className="sc-pl-corps" aria-label={tm('message.corps')} value={c.corps} readOnly={lecture} onChange={(e) => actions.brouillon(c.cle, e.target.value)} />
        <p className="sc-pl-papier__pied"><MessageSquareText size={12} strokeWidth={1.9} aria-hidden />{tm('message.prepare')}{c.modifie ? ` · ${tm('message.modifie')}` : ''}</p>
      </div>
      <footer className="sc-pl-actions">
        <Bouton variante="primaire" onClick={actions.envoyer} disabled={lecture || !c.peutPartir} icone={<Send size={14} strokeWidth={2} />} raccourci="⏎">{tm(envoi === 'courriel' ? 'action.envoyer' : 'action.copier')}</Bouton>
        <Bouton variante="secondaire" onClick={actions.reporter} disabled={lecture} icone={<Clock size={14} strokeWidth={1.9} />}>{tm('action.reporter')}</Bouton>
        <button type="button" className="sc-pl-icone" aria-label={tm('action.appeler')} title={tm('action.appeler')} onClick={actions.appeler} disabled={lecture}><Phone size={15} strokeWidth={1.9} /></button>
        <button type="button" className="sc-pl-passer" onClick={actions.passer} disabled={lecture}>{tm('action.passer')}<ChevronRight size={14} strokeWidth={2} aria-hidden /></button>
      </footer>
    </article>
  );
}
