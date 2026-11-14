import React, { useState } from 'react';
import { Activity, AlertCircle, Download, MoreHorizontal, Phone, Mail, Pin, Star, UserPlus, Users, Clock, CalendarClock, Smile } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BoiteRecherche } from '../../../socle/ui/controles';
import { Avatar } from '../../../socle/ui/Pastilles';
import { BlocEtat } from '../../../socle/ui/situations';
import { FilterChips } from '../../../socle/ui/vivant';
import { euros } from '../commun';
import { moisCourt } from '../clients/formats';
import { rangerLibelles, type FiltreContacts, type LigneContact, type ModeleContacts, type ProfilContact, type Recence } from './modele';
import { useMotsContacts } from './i18n';
import './personnes.css';

/**
 * « FICHES CONTACTS » (MC03) — le carnet de personnes : la liste compacte et le grand profil. Mise en page et états, sans
 * accès aux données.
 *
 * Disposition (fiche MC03, zone principale de 1108 px) : en-tête (titre, sous-titre, « Importer un fichier », primaire
 * « Nouveau contact »), liste de 272 × 664 à gauche (lignes de 50 px, groupes par récence), grand profil de 816 × 664 à
 * droite : en-tête, bande de quatre faits, « La relation » (frise de 768 × 128), « Derniers échanges » et « Préférences »,
 * bandeau de suggestion.
 */
export interface ActionsContacts {
  nouveau: () => void;
  importer?: () => void;
  choisir: (id: string) => void;
  filtre: (f: FiltreContacts) => void;
  recherche: (q: string) => void;
  ecrire: (p: ProfilContact) => void;
  appeler: (p: ProfilContact) => void;
  ouvrirClient: (clientId: number) => void;
  preparer: (p: ProfilContact) => void;
  non: () => void;
  reessayer: () => void;
}

export interface VueContactsProps {
  /** `indisponible` : l'application n'a pas de collection d'interlocuteurs (décision en attente). */
  statut: 'pret' | 'chargement' | 'erreur' | 'indisponible';
  horsLigne?: boolean;
  modele: ModeleContacts;
  selectionId: string | null;
  filtre: FiltreContacts;
  recherche: string;
  actions: ActionsContacts;
  lecture?: boolean;
  /** « mars 2024 » etc. : le jour de référence. */
  aujourdhui: string;
}

const accueillir = (r: Recence, tm: ReturnType<typeof useMotsContacts>['tm'], langue: 'fr' | 'en'): string => {
  if (r.genre === 'aujourdhui') return tm('recence.aujourdhui');
  if (r.genre === 'hier') return tm('recence.hier');
  if (r.genre === 'jour') return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${r.jour}T12:00:00Z`));
  return r.genre === 'semaines' ? tm(r.n === 1 ? 'recence.semaines.1' : 'recence.semaines.n', { n: r.n }) : tm(r.n === 1 ? 'recence.mois.1' : 'recence.mois.n', { n: r.n });
};

export function VueContacts({ statut, horsLigne = false, modele, selectionId, filtre, recherche, actions, lecture = false, aujourdhui }: VueContactsProps) {
  const { tm } = useMotsContacts();
  const profil = modele.profil;
  return (
    <Page>
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sousTitre')}
        secondaires={actions.importer && !lecture && statut === 'pret' ? [{ libelle: tm('action.importer'), onClick: actions.importer, icone: <Download size={14} strokeWidth={2} /> }] : []}
        primaire={lecture || statut !== 'pret' ? undefined : { libelle: tm('action.nouveau'), onClick: actions.nouveau, icone: <UserPlus size={14} strokeWidth={2} /> }}
        className="sc-pe__entete"
      />
      {horsLigne && <p className="sc-pe__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'indisponible' ? (
        <BlocEtat icone={<Users size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.indisponible.titre')} texte={tm('etat.indisponible.texte')} actions={<Bouton variante="secondaire" onClick={() => actions.ouvrirClient(0)}>{tm('etat.indisponible.action')}</Bouton>} />
      ) : statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-pe" aria-busy={statut === 'chargement' || undefined}>
          <ListeContacts modele={modele} selectionId={profil?.id ?? selectionId} filtre={filtre} recherche={recherche} actions={actions} />
          <section className="sc-pe-carte sc-pe-profil" aria-label={profil?.nom ?? tm('titre')}>
            {profil ? <Profil p={profil} aujourdhui={aujourdhui} actions={actions} lecture={lecture} /> : (
              <div className="sc-pe-profil__vide"><BlocEtat icone={<Users size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.aucun.titre')} texte={tm('etat.aucun.texte')} actions={lecture ? <span /> : <Bouton variante="primaire" onClick={actions.nouveau}>{tm('action.nouveau')}</Bouton>} /></div>
            )}
          </section>
        </div>
      )}
    </Page>
  );
}

function ListeContacts({ modele, selectionId, filtre, recherche, actions }: { modele: ModeleContacts; selectionId: string | null; filtre: FiltreContacts; recherche: string; actions: ActionsContacts }) {
  const { tm, langue } = useMotsContacts();
  return (
    <section className="sc-pe-carte sc-pe-liste" aria-label={tm('liste.puces')}>
      <div className="sc-pe-liste__tete">
        <BoiteRecherche valeur={recherche} onChange={actions.recherche} libelle={tm('liste.recherche.libelle')} placeholder={tm('liste.recherche')} />
        <FilterChips libelle={tm('liste.puces')} puces={[{ cle: 'tous', libelle: tm('liste.tous') }, { cle: 'favoris', libelle: tm('liste.favoris') }, { cle: 'recents', libelle: tm('liste.recents') }]} valeur={filtre} onChange={(c) => actions.filtre(c as FiltreContacts)} />
      </div>
      <div className="sc-pe-liste__corps" role="list">
        {modele.groupes.length === 0 && <p className="sc-pe-vide">{tm('liste.aucun')}</p>}
        {modele.groupes.map((g) => (
          <div key={g.groupe} role="group" aria-label={tm(`liste.groupe.${g.groupe}` as const)}>
            <h3 className="sc-pe-groupe">{tm(`liste.groupe.${g.groupe}` as const)}</h3>
            {g.lignes.map((l) => <LigneListe key={l.id} l={l} active={l.id === selectionId} onChoisir={actions.choisir} tm={tm} langue={langue} />)}
          </div>
        ))}
      </div>
      <p className="sc-pe-liste__pied"><Users size={13} strokeWidth={1.9} aria-hidden />{tm(modele.total === 1 ? 'liste.pied.1' : 'liste.pied.n', { n: modele.total })}</p>
    </section>
  );
}

function LigneListe({ l, active, onChoisir, tm, langue }: { l: LigneContact; active: boolean; onChoisir: (id: string) => void; tm: ReturnType<typeof useMotsContacts>['tm']; langue: 'fr' | 'en' }) {
  return (
    <button type="button" role="listitem" className="sc-pe-ligne" aria-current={active ? 'true' : undefined} onClick={() => onChoisir(l.id)}>
      <Avatar nom={l.nom} taille={30} />
      <span className="sc-pe-ligne__texte">
        <span className="sc-pe-ligne__nom">{l.nom}{l.favori && <Star size={11} strokeWidth={2} className="sc-pe-etoile" aria-label={tm('liste.favori')} />}{l.nonLu && <span className="sc-pe-nonlu" role="img" aria-label={tm('liste.nonLu')} />}</span>
        <span className="sc-pe-ligne__sous">{[l.organisation, l.fonction].filter(Boolean).join(' · ')}</span>
      </span>
      <span className="sc-pe-ligne__date">{accueillir(l.recence, tm, langue)}</span>
    </button>
  );
}

function Profil({ p, aujourdhui, actions, lecture }: { p: ProfilContact; aujourdhui: string; actions: ActionsContacts; lecture: boolean }) {
  const { tm, langue } = useMotsContacts();
  const f = p.faits;
  const annee = aujourdhui.slice(0, 4);
  const jourCourt = (j: string) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const dernier = f.dernierEchange;
  const dernierTexte = !dernier ? tm('faits.aucune') : dernier.jours === 0 ? tm('recence.aujourdhui') : dernier.jours === 1 ? tm('recence.hier') : jourCourt(dernier.at.slice(0, 10));
  const heure = (iso: string) => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', hourCycle: 'h23' }).format(new Date(iso));
  return (
    <>
      <header className="sc-pe-tete">
        <span className="sc-pe-tete__avatar"><Avatar nom={p.nom} taille={64} /></span>
        <div className="sc-pe-tete__texte">
          <h2 className="sc-pe-tete__nom">{p.nom}</h2>
          <p className="sc-pe-tete__fonction">{[tm('profil.fonction', { fonction: p.fonction, organisation: p.organisation }), p.ville].filter(Boolean).join(' · ')}</p>
          <div className="sc-pe-tete__pastilles">
            {p.palier && <span className="sc-pe-pastille" data-palier={p.palier}><i aria-hidden />{tm('profil.palier', { palier: p.palier })}</span>}
            {p.clientDepuis && <span className="sc-pe-pastille" data-vert><i aria-hidden />{tm('profil.depuis', { mois: moisCourt(p.clientDepuis, langue, true) })}</span>}
            {p.favori && <span className="sc-pe-pastille sc-pe-pastille--nue"><Star size={12} strokeWidth={2} aria-hidden />{tm('profil.favori')}</span>}
          </div>
        </div>
        <div className="sc-pe-tete__actions">
          <Bouton variante="secondaire" taille="petit" icone={<Mail size={13} strokeWidth={2} />} onClick={() => actions.ecrire(p)}>{tm('profil.ecrire')}</Bouton>
          <Bouton variante="secondaire" taille="petit" icone={<Phone size={13} strokeWidth={2} />} onClick={() => actions.appeler(p)} disabled={!p.telephone}>{tm('profil.appeler')}</Bouton>
          <button type="button" className="sc-pe-plus" aria-label={tm('profil.plus')} title={tm('profil.plus')}><MoreHorizontal size={16} strokeWidth={2} /></button>
        </div>
      </header>

      <div className="sc-pe-faits" role="group" aria-label={tm('faits.organisation')}>
        <button type="button" className="sc-pe-fait" onClick={() => p.clientId != null && actions.ouvrirClient(p.clientId)}>
          <span className="sc-pe-fait__etiquette">{tm('faits.encaisse', { annee })}</span>
          <span className="sc-pe-fait__valeur sc-nombre">{f.encaisseCents == null ? tm('faits.aucune') : euros(f.encaisseCents, langue)}</span>
          <span className="sc-pe-fait__detail" data-ton={f.enRetard ? 'attention' : undefined}>{f.enRetard ? tm('faits.retard', { numero: f.enRetard.numero, jours: f.enRetard.jours }) : ''}</span>
        </button>
        <div className="sc-pe-fait"><span className="sc-pe-fait__etiquette">{tm('faits.echanges')}</span><span className="sc-pe-fait__valeur sc-nombre">{f.echangesTrimestre ?? tm('faits.aucune')}</span><span className="sc-pe-fait__detail" /></div>
        <div className="sc-pe-fait"><span className="sc-pe-fait__etiquette">{tm('faits.dernier')}</span><span className="sc-pe-fait__valeur sc-nombre">{dernierTexte}{dernier && dernier.jours <= 1 ? ` ${heure(dernier.at)}` : ''}</span><span className="sc-pe-fait__detail" /></div>
        <div className="sc-pe-fait">
          <span className="sc-pe-fait__etiquette">{tm('faits.rdv')}</span>
          <span className="sc-pe-fait__valeur sc-nombre">{f.prochainRdv ? <>{f.prochainRdv.jourRelatif === 'aujourdhui' && <i className="sc-pe-voyant" aria-hidden />}{f.prochainRdv.jourRelatif === 'aujourdhui' ? tm('faits.aujourdhui', { heure: f.prochainRdv.heure }) : tm('faits.jour', { jour: jourCourt(f.prochainRdv.jour), heure: f.prochainRdv.heure })}</> : tm('faits.aucune')}</span>
          <span className="sc-pe-fait__detail" data-ton={f.prochainRdv?.dansMin != null ? 'info' : undefined}>{f.prochainRdv?.dansMin != null ? tm('faits.dansMin', { n: f.prochainRdv.dansMin }) : ''}</span>
        </div>
      </div>

      <Relation p={p} />

      <div className="sc-pe-deux">
        <section className="sc-pe-derniers" aria-label={tm('derniers.titre')}>
          <div className="sc-pe-bloc__tete"><h3>{tm('derniers.titre')}</h3></div>
          {p.derniers.length === 0 ? <p className="sc-pe-vide">{tm('derniers.vide')}</p> : (
            <ul className="sc-pe-derniers__liste">
              {p.derniers.map((d) => (
                <li key={d.at}><span className="sc-pe-derniers__tuile" aria-hidden><Clock size={14} strokeWidth={1.8} /></span><span className="sc-pe-derniers__texte"><span className="sc-pe-derniers__titre">{tm('derniers.echange')}</span><span className="sc-pe-derniers__resume">{tm('derniers.indisponible')}</span></span><span className="sc-pe-derniers__date">{d.jours === 0 ? tm('recence.aujourdhui') : d.jours === 1 ? tm('recence.hier') : jourCourt(d.at.slice(0, 10))}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="sc-pe-prefs" aria-label={tm('prefs.titre')}>
          <div className="sc-pe-bloc__tete"><h3>{tm('prefs.titre')}</h3></div>
          <ul className="sc-pe-prefs__liste">
            <li><Smile size={14} strokeWidth={1.8} aria-hidden />{tm(`prefs.${p.preference}` as const)}</li>
            {p.notes && <li className="sc-pe-prefs__retenir"><Pin size={14} strokeWidth={1.8} aria-hidden />{p.notes}</li>}
          </ul>
        </section>
      </div>

      <div className="sc-pe-bandeau">
        <CalendarClock size={15} strokeWidth={1.9} aria-hidden />
        <p>{p.preparation ? tm('suggestion.texte', { nom: p.nom.split(' ')[0], heure: p.preparation.heure }) : tm('suggestion.astuce')}</p>
        {p.preparation && !lecture && <><Bouton variante="primaire" taille="petit" onClick={() => actions.preparer(p)}>{tm('suggestion.preparer')}</Bouton><Bouton variante="secondaire" taille="petit" onClick={actions.non}>{tm('suggestion.non')}</Bouton></>}
      </div>
    </>
  );
}

function Relation({ p }: { p: ProfilContact }) {
  const { tm, langue } = useMotsContacts();
  const r = p.relation;
  const n = r.mois.length;
  const largeur = 768;
  const pas = n <= 1 ? 0 : (largeur - 24) / (n - 1);
  const x = (i: number) => 12 + i * pas;
  const nomMois = (cle: string) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${cle}-01T12:00:00Z`));
  // Deux rangées de libellés sans chevauchement (`rangerLibelles`, contrôlé hors navigateur).
  const triees = [...r.evenements].sort((a, b) => a.indice - b.indice);
  const texte = (ev: (typeof r.evenements)[number]) => (ev.premier ? tm('relation.premier') : ev.dernier ? tm('relation.dernier') : ev.titre);
  const lignes = rangerLibelles(triees.map((ev) => ({ x: x(ev.indice), largeur: texte(ev).length * 6.6 + 16, ancreDroite: ev.indice === n - 1 && !ev.premier })));
  const rang = triees.flatMap((ev, k) => (lignes[k] == null ? [] : [{ ev, ligne: lignes[k] as 0 | 1 }]));
  return (
    <section className="sc-pe-relation" aria-label={tm('relation.titre')}>
      <div className="sc-pe-relation__tete">
        <h3>{tm('relation.titre')}</h3>
        {r.debut && <span className="sc-pe-relation__legende">{tm('relation.legende', { debut: nomMois(r.debut) })}</span>}
        {r.debut && <span className="sc-pe-relation__phrase"><Activity size={13} strokeWidth={1.9} aria-hidden />{r.recordCeMois ? tm('relation.record') : tm(r.rythme === 1 ? 'relation.rythme.1' : 'relation.rythme.n', { n: r.rythme })}</span>}
      </div>
      {n === 0 ? <p className="sc-pe-vide">{tm('relation.vide')}</p> : (
        <svg className="sc-pe-frise" viewBox={`0 0 ${largeur} 128`} role="img" aria-label={tm('relation.graphique', { debut: nomMois(r.debut ?? '') })}>
          <line x1={0} x2={largeur} y1={50} y2={50} className="sc-pe-frise__axe" />
          {r.mois.map((m, i) => {
            const h = Math.min(7, m.echanges) * 6;
            return <rect key={m.cle} x={x(i) - 3} y={50 - h - 4} width={6} height={Math.max(2, h)} rx={2} className="sc-pe-frise__barre" data-recent={i >= n - 3 ? '' : undefined}><title>{tm('relation.bulle', { mois: nomMois(m.cle), n: m.echanges })}</title></rect>;
          })}
          {r.mois.map((m, i) => (m.cle.endsWith('-01') && i > 0 ? <g key={`a-${m.cle}`}><line x1={x(i)} x2={x(i)} y1={14} y2={46} className="sc-pe-frise__annee" /><text x={x(i)} y={10} textAnchor="middle" className="sc-pe-frise__annee-texte">{m.cle.slice(0, 4)}</text></g> : null))}
          {rang.map(({ ev, ligne }) => {
            const cx = x(ev.indice);
            const droite = ev.indice === n - 1 && !ev.premier;
            const libelle = ev.premier ? tm('relation.premier') : ev.dernier ? tm('relation.dernier') : ev.titre;
            const yTexte = ligne === 0 ? 70 : 108;
            return (
              <g key={`${ev.indice}-${ev.titre}-${ev.premier}`} className="sc-pe-frise__ev" data-dernier={ev.dernier ? '' : undefined}>
                {ligne === 1 && <line x1={cx} x2={cx} y1={56} y2={yTexte - 12} className="sc-pe-frise__tige" />}
                <circle cx={cx} cy={50} r={5} className="sc-pe-frise__point" />
                <text x={droite ? cx + 6 : cx - 6} y={yTexte} textAnchor={droite ? 'end' : 'start'} className="sc-pe-frise__libelle">{libelle}</text>
              </g>
            );
          })}
        </svg>
      )}
    </section>
  );
}
