import React from 'react';
import { AlertCircle, Moon, MessageSquare, Network, Plus, Users, Clock, KeyRound } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { SuggestionAjmani } from '../../../socle/ui/controles';
import { Avatar } from '../../../socle/ui/Pastilles';
import { BlocEtat } from '../../../socle/ui/situations';
import type { CartePersonne, ChargeSemaine, ModeleEquipe } from './modele';
import { useMotsEquipe } from './i18n';
import './equipe.css';

/**
 * « ÉQUIPE » (MC04) — qui fait quoi, qui est chargé : trois grandes cartes de personne et une bande basse. Mise en page et
 * états, sans accès aux données.
 *
 * Disposition (fiche MC04, zone principale de 1108 px) : en-tête (titre, sous-titre, « Organigramme », primaire « Inviter
 * quelqu'un »), cartes de 360 × 472 à y = 94 (écart 14, défilement horizontal au-delà de trois), bande basse de 178 à y = 580 :
 * « Défi d'équipe », « Accès externes », suggestion d'Ajmani, alignés sur les colonnes du dessus. Aucun classement : l'ordre
 * des cartes est celui de l'équipe, jamais celui de la charge.
 */
export interface ActionsEquipe {
  inviter: () => void;
  organigramme: () => void;
  message: (c: CartePersonne) => void;
  confier: (c: CartePersonne) => void;
  membresEtAcces: () => void;
  proposer: (deId: string, versId: string) => void;
  non: () => void;
  relier: () => void;
  reessayer: () => void;
}

export interface VueEquipeProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleEquipe;
  actions: ActionsEquipe;
  lecture?: boolean;
}

const JOURS = ['lun', 'mar', 'mer', 'jeu', 'ven'] as const;

export function VueEquipe({ statut, horsLigne = false, modele, actions, lecture = false }: VueEquipeProps) {
  const { tm } = useMotsEquipe();
  const m = modele;
  const personnes = tm(m.total === 1 ? 'sousTitre.personnes.1' : 'sousTitre.personnes.n', { n: m.total });
  return (
    <Page>
      <PageHead
        titre={tm('titre')}
        sousTitre={m.chargeMoyenne == null ? personnes : tm('sousTitre.charge', { personnes, n: m.chargeMoyenne })}
        secondaires={[{ libelle: tm('action.organigramme'), onClick: actions.organigramme, icone: <Network size={14} strokeWidth={2} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.inviter'), onClick: actions.inviter, icone: <Plus size={14} strokeWidth={2.2} /> }}
        className="sc-eq__entete"
      />
      {horsLigne && <p className="sc-eq__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-eq" aria-busy={statut === 'chargement' || undefined}>
          <div className="sc-eq-cartes" role="list">
            {m.cartes.map((c) => <Personne key={c.id} c={c} actions={actions} lecture={lecture} />)}
            {m.cartes.length === 1 && (
              <div className="sc-eq-cartes__seul"><BlocEtat icone={<Users size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.seul.titre')} texte={tm('etat.seul.texte')} actions={lecture ? <span /> : <Bouton variante="primaire" onClick={actions.inviter}>{tm('action.inviter')}</Bouton>} /></div>
            )}
          </div>
          <div className="sc-eq-bas">
            <section className="sc-eq-carte sc-eq-defi" aria-label={tm('defi.titre')}><h2 className="sc-eq-carte__titre">{tm('defi.titre')}</h2><p className="sc-eq-vide">{tm('defi.indisponible')}</p></section>
            <Acces m={m} actions={actions} />
            <Suggestion m={m} actions={actions} />
          </div>
        </div>
      )}
    </Page>
  );
}

function Personne({ c, actions, lecture }: { c: CartePersonne; actions: ActionsEquipe; lecture: boolean }) {
  const { tm } = useMotsEquipe();
  return (
    <article className="sc-eq-personne" role="listitem" data-absent={c.absent ? '' : undefined}>
      <header className="sc-eq-personne__tete">
        <span className="sc-eq-personne__avatar"><Avatar nom={c.nom} taille={52} enLigne={c.presence === 'en ligne'} /></span>
        <div className="sc-eq-personne__texte">
          <h2 className="sc-eq-personne__nom">{c.prenom || c.nom}{c.moi && <span className="sc-eq-personne__toi"> {tm('toi')}</span>}</h2>
          <p className="sc-eq-personne__role">{c.role}</p>
        </div>
        <button type="button" className="sc-eq-icone" aria-label={tm('carte.message', { nom: c.prenom || c.nom })} title={tm('carte.message', { nom: c.prenom || c.nom })} onClick={() => actions.message(c)}><MessageSquare size={14} strokeWidth={1.9} /></button>
      </header>
      <div className="sc-eq-maintenant" data-genre={c.maintenant.genre}>
        {c.maintenant.genre === 'evenement' ? <span className="sc-eq-voyant" data-ton="info" aria-hidden /> : c.maintenant.genre === 'absent' ? <Moon size={14} strokeWidth={1.8} aria-hidden /> : <span className="sc-eq-voyant" data-ton="succes" aria-hidden />}
        <span className="sc-eq-maintenant__texte">
          <span className="sc-eq-maintenant__titre">{c.maintenant.genre === 'evenement' ? c.maintenant.titre : c.maintenant.genre === 'absent' ? tm('maintenant.absent') : tm('maintenant.disponible')}</span>
          <span className="sc-eq-maintenant__detail">{c.maintenant.genre === 'evenement' ? c.maintenant.detail : c.maintenant.genre === 'disponible' ? tm('maintenant.disponible.detail') : ''}</span>
        </span>
      </div>
      <h3 className="sc-eq-sur-titre">{tm('competences.titre')}</h3>
      {c.competences.length === 0 ? <p className="sc-eq-vide">{tm('competences.aucune')}</p> : <ul className="sc-eq-competences">{c.competences.map((k) => <li key={k}>{k}</li>)}</ul>}
      <div className="sc-eq-charge-tete"><h3 className="sc-eq-sur-titre">{tm('charge.titre')}</h3>{c.charge && <span className="sc-eq-charge__total sc-nombre" data-ton={c.charge.ton}>{tm('charge.total', { h: nombre(c.charge.totalHeures), cap: c.charge.capaciteHeures, n: Math.round(c.charge.part * 100) })}</span>}</div>
      {c.charge ? <Histogramme charge={c.charge} /> : (
        <div className="sc-eq-charge-inconnue"><p>{tm('charge.inconnue')}</p><Bouton variante="secondaire" taille="petit" onClick={actions.relier}>{tm('charge.relier')}</Bouton></div>
      )}
      <footer className="sc-eq-pied">
        <span className="sc-eq-pied__libre"><Clock size={13} strokeWidth={1.8} aria-hidden />{c.libreA ? tm('pied.libreA', { heure: c.libreA }) : tm('pied.libre')}</span>
        {c.enCours != null && <span className="sc-eq-pied__encours">· {tm(c.enCours === 1 ? 'pied.enCours.1' : 'pied.enCours.n', { n: c.enCours })}</span>}
        {!lecture && <Bouton variante="secondaire" taille="petit" icone={<Plus size={12} strokeWidth={2.2} />} onClick={() => actions.confier(c)}>{tm('pied.confier')}</Bouton>}
      </footer>
    </article>
  );
}

const nombre = (n: number): string => String(n).replace('.', ',');

function Histogramme({ charge }: { charge: ChargeSemaine }) {
  const { tm } = useMotsEquipe();
  const max = Math.max(charge.capaciteJour * 1.2, ...charge.jours.map((j) => j.heures));
  return (
    <div className="sc-eq-histo" role="img" aria-label={charge.jours.map((j, i) => tm('charge.barre', { jour: tm(`charge.jour.${JOURS[i]}` as const), h: nombre(j.heures) })).join(', ')}>
      <span className="sc-eq-histo__ligne" style={{ bottom: `${(charge.capaciteJour / max) * 100}%` }}><span className="sc-nombre">{tm('charge.capacite', { n: nombre(charge.capaciteJour) })}</span></span>
      {charge.jours.map((j, i) => (
        <div key={j.jour} className="sc-eq-histo__col" data-etat={j.etat}>
          <span className="sc-eq-histo__zone">
            <span className="sc-eq-histo__barre" data-depasse={j.depasse ? '' : undefined} style={{ height: `${Math.max(j.etat === 'futur' || j.etat === 'absent' ? 8 : 2, (Math.min(j.heures, max) / max) * 100)}%` }} />
          </span>
          <span className="sc-eq-histo__jour">{tm(`charge.jour.${JOURS[i]}` as const)}</span>
        </div>
      ))}
    </div>
  );
}

function Acces({ m, actions }: { m: ModeleEquipe; actions: ActionsEquipe }) {
  const { tm } = useMotsEquipe();
  return (
    <section className="sc-eq-carte sc-eq-acces" aria-label={tm('acces.titre')}>
      <div className="sc-eq-acces__tete"><h2 className="sc-eq-carte__titre">{tm('acces.titre')}</h2><button type="button" className="sc-eq-lien" onClick={actions.membresEtAcces}><KeyRound size={13} strokeWidth={1.9} aria-hidden />{tm('acces.membres')}</button></div>
      {m.acces === null ? <p className="sc-eq-vide">{tm('acces.indisponible')}</p> : (
        <ul className="sc-eq-acces__liste">
          {m.acces.slice(0, 3).map((a) => <li key={a.id}><span className="sc-eq-acces__sq" aria-hidden>{a.initiale}</span><span className="sc-eq-acces__texte"><span className="sc-eq-acces__nom">{a.nom}</span><span className="sc-eq-acces__role">{a.role || tm('acces.invite')}</span></span></li>)}
        </ul>
      )}
    </section>
  );
}

function Suggestion({ m, actions }: { m: ModeleEquipe; actions: ActionsEquipe }) {
  const { tm } = useMotsEquipe();
  const s = m.suggestion;
  return (
    <section className="sc-eq-suggestion" aria-label={tm('suggestion.astuce.titre')}>
      {s ? (
        <SuggestionAjmani
          titre={tm('suggestion.titre', { nom: s.de.prenom })}
          texte={tm('suggestion.texte', { de: s.de.prenom, n: s.partDe, vers: s.vers.prenom, tache: s.tache ? tm('suggestion.tache', { tache: s.tache }) : '' })}
          primaire={{ libelle: tm('suggestion.proposer', { nom: s.vers.prenom }), onClick: () => actions.proposer(s.de.id, s.vers.id) }}
          secondaire={{ libelle: tm('suggestion.non'), onClick: actions.non }}
        />
      ) : (
        <div className="sc-eq-astuce"><span className="sc-eq-astuce__titre">{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
      )}
    </section>
  );
}
