import React, { useState } from 'react';
import { AlertCircle, Check, ChevronDown, Clock, Flag, MessageSquare, Plus, Users, Zap } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { Avatar } from '../../../socle/ui/Pastilles';
import { Interrupteur, Segmente } from '../../../socle/ui/controles';
import { COLONNES_DE_TICKET, type ColonneDeTicket } from '../cockpit';
import { dureeCourte, type CarteMission, type ColonneMission, type ModeleMissions, type TicketMission } from './modele';
import { useMotsMissions } from './i18n';
import '../../contacts/cibles.css';
import './missions.css';

/**
 * « MISSIONS ET TICKETS » (H03) — le kanban. Mise en page et états, sans accès aux données. Disposition (fiche H03, zone principale de
 * 1108 px) : en-tête de page, bandeau de filtres de 32 px (quatre pastilles à compteur, présence, « Alerte immédiate »), tableau de quatre
 * colonnes de 268 px (écart 12, hauteur 619) ; carte de 246 px en déplacement, inclinée de −2,2°.
 * Glisser-déposer : natif (`draggable`) ; la colonne survolée montre sa zone de dépôt (verte pour Terminé, orange et le message de limite si
 * elle est pleine) ; la carte d'origine laisse un gabarit hachuré. Sans glisser (lecture seule, ou tickets qui se déplacent ailleurs) : les
 * cartes sont fixes.
 */
export interface ActionsMissions {
  vue: (v: 'kanban' | 'liste' | 'chrono') => void;
  nouveau: () => void;
  ouvrir: (id: string) => void;
  filtre: (f: 'urgents' | 'enCours' | 'termines' | 'partages' | null) => void;
  deposer: (id: string, vers: ColonneDeTicket) => void;
  plus: (cle: ColonneDeTicket) => void;
  ajouter: (cle: ColonneDeTicket) => void;
  alerte: (actif: boolean) => void;
  reessayer: () => void;
  ouvrirSav?: () => void;
}

export interface EtatGlisse { id: string; vers: ColonneDeTicket | null; flottant?: { x: number; y: number } }

export interface VueMissionsProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleMissions;
  vue: 'kanban' | 'liste' | 'chrono';
  filtre: 'urgents' | 'enCours' | 'termines' | 'partages' | null;
  alerte: boolean;
  actions: ActionsMissions;
  lecture?: boolean;
  /** Tous les tickets (la liste) ; la zone de dépôt lit la limite des colonnes dans le modèle. */
  tickets: readonly TicketMission[];
  /** Un état de glisser dessiné d'avance (aperçu et tests) : sinon, l'état vient du glisser natif. */
  glisse?: EtatGlisse | null;
  /** « « En cours » est limité à 3 tickets… » après un dépôt refusé. */
  refus?: { cle: ColonneDeTicket; limite: number; id: string } | null;
  annulation?: { texte: string } | null;
  onAnnuler?: () => void;
  depasser?: (id: string, vers: ColonneDeTicket) => void;
}

export function VueMissions(p: VueMissionsProps) {
  const { tm, langue } = useMotsMissions();
  const m = p.modele;
  const [glisseLocal, setGlisseLocal] = useState<EtatGlisse | null>(null);
  const glisse = p.glisse ?? glisseLocal;
  const peutGlisser = !p.lecture && p.vue === 'kanban';
  const sousTitre = m.delaiMoyenMin != null ? tm('sousTitre.delai', { duree: dureeCourte(m.delaiMoyenMin) }) : tm('sousTitre.sans');

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        className="sc-ms__entete"
        extra={<Segmente libelle={tm('vue.libelle')} options={[{ cle: 'kanban', libelle: tm('vue.kanban') }, { cle: 'liste', libelle: tm('vue.liste') }, { cle: 'chrono', libelle: tm('vue.chrono') }]} valeur={p.vue} onChange={(k) => p.actions.vue(k as 'kanban' | 'liste' | 'chrono')} />}
        primaire={p.lecture ? undefined : { libelle: tm('action.nouveau'), onClick: p.actions.nouveau, icone: <Plus size={14} strokeWidth={2.2} />, raccourci: 'N' }}
      />
      {p.horsLigne && <p className="sc-ms__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {p.statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={p.actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-ms" aria-busy={p.statut === 'chargement' || undefined}>
          <div className="sc-ms-bandeau">
            <div className="sc-ms-pastilles" role="group" aria-label={tm('titre')}>
              <Pastille actif={p.filtre === 'urgents'} icone={<Flag size={13} strokeWidth={1.9} />} libelle={tm('pastille.urgents')} valeur={String(m.pastilles.urgents)} onClick={() => p.actions.filtre(p.filtre === 'urgents' ? null : 'urgents')} />
              <Pastille actif={p.filtre === 'enCours'} icone={<Zap size={13} strokeWidth={1.9} />} libelle={tm('pastille.enCours')} valeur={m.pastilles.enCours.limite != null ? tm('pastille.enCoursSur', { n: m.pastilles.enCours.n, limite: m.pastilles.enCours.limite }) : String(m.pastilles.enCours.n)} onClick={() => p.actions.filtre(p.filtre === 'enCours' ? null : 'enCours')} />
              <Pastille actif={p.filtre === 'termines'} icone={<Check size={13} strokeWidth={2} />} libelle={tm('pastille.termines')} valeur={String(m.pastilles.termines)} onClick={() => p.actions.filtre(p.filtre === 'termines' ? null : 'termines')} />
              <Pastille actif={p.filtre === 'partages'} icone={<Users size={13} strokeWidth={1.9} />} libelle={tm('pastille.partages')} valeur={String(m.pastilles.partages)} onClick={() => p.actions.filtre(p.filtre === 'partages' ? null : 'partages')} />
            </div>
            <div className="sc-ms-droite">
              {m.presence && <span className="sc-ms-presence"><i aria-hidden />{tm('presence.sur', { nom: m.presence.nom, ticket: m.presence.ticket })}</span>}
              <span className="sc-ms-filet" aria-hidden />
              <span className="sc-ms-alerte">{tm('alerte.libelle')}<Interrupteur actif={p.alerte} libelle={tm('alerte.libelle')} onChange={p.actions.alerte} disabled={p.lecture} /></span>
            </div>
          </div>
          {p.lecture && p.actions.ouvrirSav && (
            <p className="sc-ms-lecture">
              {tm('lecture.sav')}{' '}
              <button type="button" onClick={p.actions.ouvrirSav}>{tm('lecture.ouvrir')}</button>
            </p>
          )}
          {p.vue === 'kanban' && (
            <div className="sc-ms-tableau" role="group" aria-label={tm('vue.kanban')}>
              {m.colonnes.map((c) => (
                <Colonne key={c.cle} c={c} prevenu={p.tickets.find((x) => x.id === glisse?.id)?.assigne?.nom ?? null} {...{ tm, langue }} glisse={glisse} peutGlisser={peutGlisser} lecture={!!p.lecture} actions={p.actions} refus={p.refus ?? null} depasser={p.depasser}
                  onGlisse={(g) => setGlisseLocal(g)} vide={m.vide && c.cle === 'a-faire'} />
              ))}
              {glisse?.flottant && (() => {
                const k = m.colonnes.flatMap((x) => x.cartes).find((x) => x.id === glisse.id);
                return k ? <div className="sc-ms-flottante" style={{ left: glisse.flottant.x, top: glisse.flottant.y }} aria-hidden><Carte c={k} {...{ tm, langue }} /></div> : null;
              })()}
            </div>
          )}
          {p.vue === 'liste' && <Liste tickets={p.tickets} tm={tm} onOuvrir={p.actions.ouvrir} />}
          {p.vue === 'chrono' && <div className="sc-ms-etat">
            <BlocEtat icone={<Clock size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('chrono.indisponible.titre')} texte={tm('chrono.indisponible.texte')} actions={<Bouton variante="secondaire" onClick={() => p.actions.vue('kanban')}>{tm('vue.kanban')}</Bouton>} /></div>}
          {p.annulation && <div className="sc-ms-annuler" role="status"><span>{p.annulation.texte}</span><button type="button" onClick={p.onAnnuler}>{tm('deplace.annuler')}</button></div>}
        </div>
      )}
    </Page>
  );
}

type Tm = ReturnType<typeof useMotsMissions>['tm'];

function Pastille({ actif, icone, libelle, valeur, onClick }: { actif: boolean; icone: React.ReactNode; libelle: string; valeur: string; onClick: () => void }) {
  return <button type="button" className="sc-ms-pastille" aria-pressed={actif} onClick={onClick}>{icone}<span>{libelle}</span><b className="sc-nombre">{valeur}</b></button>;
}

function Colonne({ c, prevenu, tm, langue, glisse, peutGlisser, lecture, actions, refus, depasser, onGlisse, vide }: { c: ColonneMission; prevenu: string | null; tm: Tm; langue: string; glisse: EtatGlisse | null; peutGlisser: boolean; lecture: boolean; actions: ActionsMissions; refus: VueMissionsProps['refus']; depasser?: VueMissionsProps['depasser']; onGlisse: (g: EtatGlisse | null) => void; vide: boolean }) {
  const cible = glisse?.vers === c.cle && glisse.id !== '';
  const libelle = tm(`colonne.${c.cle}` as const);
  const origine = glisse && c.cartes.some((x) => x.id === glisse.id);
  // La zone de dépôt prend la place d'une carte : la dernière passe sous « Voir n autres ».
  const zone = cible && glisse && !origine;
  const cartes = zone && c.cartes.length >= 3 ? c.cartes.slice(0, c.cartes.length - 1) : c.cartes;
  const reste = c.reste + (c.cartes.length - cartes.length);
  return (
    <section className="sc-ms-colonne" data-colonne={c.cle} data-pleine={c.pleine ? '' : undefined} data-cible={cible ? '' : undefined} aria-label={libelle}
      onDragOver={(e) => { if (peutGlisser) { e.preventDefault(); const id = e.dataTransfer.getData('text/plain') || glisse?.id || ''; if (glisse?.vers !== c.cle) onGlisse({ id, vers: c.cle }); } }}
      onDrop={(e) => { if (!peutGlisser) return; e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); onGlisse(null); if (id) actions.deposer(id, c.cle); }}>
      <header className="sc-ms-colonne__tete">
        <i aria-hidden />
        <h2>{libelle}</h2>
        {c.segments ? (
          <>
            <span className="sc-ms-jauge" aria-hidden>{Array.from({ length: c.segments.total }, (_, i) => <i key={i} data-pris={i < (c.segments?.pris ?? 0) ? '' : undefined} />)}</span>
            <span className="sc-ms-limite sc-nombre">{tm('colonne.limite', { n: c.total, limite: c.limite ?? 0 })}</span>
          </>
        ) : <span className="sc-ms-compte sc-nombre">{c.total}</span>}
        {!lecture && <button type="button" className="sc-ms-plus" aria-label={tm('colonne.plus', { colonne: libelle })} onClick={() => actions.plus(c.cle)}><Plus size={14} strokeWidth={2} /></button>}
      </header>
      <div className="sc-ms-colonne__corps">
        {vide && <div className="sc-ms-colonne__vide">
          <BlocEtat taille="compact" icone={null} ton="neutre" titre={tm('vide.titre')} texte={tm('vide.texte')} actions={lecture ? <span /> : <Bouton variante="secondaire" taille="petit" onClick={() => actions.ajouter(c.cle)}>{tm('vide.creer')}</Bouton>} /></div>}
        {cible && glisse && !origine && (
          <div className="sc-ms-depot" data-ton={c.cle === 'termine' ? 'succes' : c.pleine ? 'attention' : 'neutre'}>
            {c.cle === 'termine' ? <><b>{tm('depot.terminer')}</b>{prevenu && <span>{tm('depot.prevenu', { nom: prevenu })}</span>}</> : <b>{tm('depot.ici')}</b>}
          </div>
        )}
        {cartes.map((k) => (
          origine && glisse?.id === k.id ? <div key={k.id} className="sc-ms-gabarit" aria-hidden /> : (
            <Carte key={k.id} c={k} {...{ tm, langue }} draggable={peutGlisser} onOuvrir={() => actions.ouvrir(k.id)}
              onDragStart={(e) => { e.dataTransfer.setData('text/plain', k.id); e.dataTransfer.effectAllowed = 'move'; onGlisse({ id: k.id, vers: null }); }} onDragEnd={() => onGlisse(null)} />
          )
        ))}
        {refus && refus.cle === c.cle && (
          <p className="sc-ms-refus" role="alert">{tm('colonne.limiteMessage', { colonne: libelle, limite: refus.limite })}{depasser && <button type="button" onClick={() => depasser(refus.id, c.cle)}>{tm('colonne.depasser')}</button>}</p>
        )}
        {reste > 0 && <button type="button" className="sc-ms-voir" onClick={() => actions.plus(c.cle)}><ChevronDown size={13} strokeWidth={2} aria-hidden />{tm(reste === 1 ? 'colonne.voirPlus.1' : 'colonne.voirPlus.n', { n: reste })}</button>}
      </div>
      <footer className="sc-ms-colonne__pied">
        {c.pleine && c.cle === 'en-cours' ? <p className="sc-ms-pleine"><Clock size={13} strokeWidth={1.9} aria-hidden />{tm('colonne.pleine')}</p>
          : !lecture && (c.cle === 'a-faire' || c.cle === 'en-revue') ? <button type="button" className="sc-ms-ajouter" onClick={() => actions.ajouter(c.cle)}><Plus size={13} strokeWidth={2} aria-hidden />{tm('colonne.ajouter')}</button> : null}
      </footer>
    </section>
  );
}

function texteMinuteur(k: CarteMission, tm: Tm): string {
  const mi = k.minuteur;
  if (!mi) return '';
  const duree = dureeCourte(mi.minutes);
  if (mi.genre === 'prise') return tm(mi.depasse ? 'minuteur.priseDepassee' : 'minuteur.prise', { duree: mi.depasse ? duree : `${mi.minutes} min` });
  if (mi.genre === 'revue') return mi.minutes >= 24 * 60 ? tm('minuteur.revue.n', { n: Math.floor(mi.minutes / (24 * 60)) }) : tm('minuteur.revueHeures', { duree });
  if (mi.depasse) return tm('minuteur.resolutionDepassee', { duree });
  return mi.heureLimite ? tm('minuteur.resolution', { heure: mi.heureLimite, duree: `${Math.floor(mi.minutes / 60)} h ${String(mi.minutes % 60).padStart(2, '0')}` }) : tm('minuteur.resolutionJours', { duree });
}

function Carte({ c, tm, draggable = false, onOuvrir, onDragStart, onDragEnd }: { c: CarteMission; tm: Tm; langue: string; draggable?: boolean; onOuvrir?: () => void; onDragStart?: (e: React.DragEvent) => void; onDragEnd?: () => void }) {
  const termine = c.colonne === 'termine';
  const date = c.dateTexte ? (c.dateTexte.genre === 'aujourdhui' ? tm('carte.aujourdhui') : c.dateTexte.genre === 'demain' ? tm('carte.demain') : c.dateTexte.texte) : '';
  return (
    <article className="sc-ms-carte" data-urgent={c.urgent && !termine ? '' : undefined} data-termine={termine ? '' : undefined} draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <button type="button" className="sc-ms-carte__ouvrir" aria-label={tm('carte.ouvrir', { id: c.id, titre: c.titre })} onClick={onOuvrir} />
      <div className="sc-ms-carte__haut">
        <span className="sc-ms-carte__id sc-nombre">{c.id}</span>
        {c.urgent && !termine && <span className="sc-ms-urgent"><Flag size={11} strokeWidth={2.2} aria-hidden />{tm('carte.urgent')}</span>}
        {c.client && <span className="sc-ms-tag"><i aria-hidden />{tm('carte.client', { nom: c.client })}</span>}
        {c.assigne?.enLigne && <span className="sc-ms-enligne" title={tm('carte.enLigne', { nom: c.assigne.nom })}><Avatar nom={c.assigne.nom} taille={20} enLigne /></span>}
      </div>
      <h3 className="sc-ms-carte__titre">{c.titre}</h3>
      {c.etiquette && <span className="sc-ms-etiquette"><i aria-hidden />{c.etiquette}</span>}
      {c.sousTaches && c.sousTaches.total > 0 && (
        <span className="sc-ms-sous" aria-label={tm('carte.sousTaches', { faites: c.sousTaches.faites, total: c.sousTaches.total })}><span className="sc-ms-sous__barre" aria-hidden><i style={{ width: `${(c.sousTaches.faites / c.sousTaches.total) * 100}%` }} /></span><b className="sc-nombre">{c.sousTaches.faites}/{c.sousTaches.total}</b></span>
      )}
      {c.minuteur && <span className="sc-ms-minuteur sc-nombre" data-ton={c.minuteur.ton}><i aria-hidden style={{ '--part': `${Math.round((c.minuteur.part || 0.15) * 100)}%` } as React.CSSProperties} />{texteMinuteur(c, tm)}</span>}
      <div className="sc-ms-carte__pied">
        {c.assigne && <Avatar nom={c.assigne.nom} taille={22} />}
        {date && <span className="sc-ms-date">{date}</span>}
        {c.relecteur && <span className="sc-ms-date">· {tm('carte.relu', { nom: c.relecteur })}</span>}
        {c.commentaires > 0 && <span className="sc-ms-comm sc-nombre"><MessageSquare size={12} strokeWidth={1.9} aria-hidden />{c.commentaires}</span>}
      </div>
    </article>
  );
}

function Liste({ tickets, tm, onOuvrir }: { tickets: readonly TicketMission[]; tm: Tm; onOuvrir: (id: string) => void }) {
  return (
    <div className="sc-ms-liste" role="table" aria-label={tm('liste.titre')}>
      <div className="sc-ms-liste__tete" role="row"><span role="columnheader">{tm('liste.colId')}</span><span role="columnheader">{tm('liste.colTitre')}</span><span role="columnheader">{tm('liste.colColonne')}</span><span role="columnheader">{tm('liste.colAssigne')}</span><span role="columnheader">{tm('liste.colEcheance')}</span></div>
      {COLONNES_DE_TICKET.flatMap((cle) => tickets.filter((t) => t.colonne === cle).map((t) => (
        <button key={t.id} type="button" className="sc-ms-liste__ligne" role="row" onClick={() => onOuvrir(t.id)}>
          <span className="sc-nombre" role="cell">{t.id}</span><span role="cell">{t.titre}</span><span role="cell">{tm(`colonne.${t.colonne}` as const)}</span><span role="cell">{t.assigne?.nom ?? '—'}</span><span role="cell" className="sc-nombre">{t.echeance ?? '—'}</span>
        </button>
      )))}
    </div>
  );
}
