import React from 'react';
import { AlertCircle, CalendarDays, Pencil, Copy, FileText, Globe, Mail, MapPin, Phone, Send, Shield, Wallet } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { AnneauProgression } from '../../../socle/ui/Indicateurs';
import { Avatar, PastilleEtat } from '../../../socle/ui/Pastilles';
import { BlocEtat } from '../../../socle/ui/situations';
import { SousCarte } from '../../../socle/ui/controles';
import { BandePonctualite } from './BandePonctualite';
import { FriseRelation } from './FriseRelation';
import { euros } from '../commun';
import { moisCourt } from '../clients/formats';
import type { ElementOuvert, ModeleFiche } from './modele';
import { useMotsFiche } from './i18n';
import './fiche.css';

/**
 * « FICHE CLIENT » (G04) — le dossier d'un client : mise en page et états, sans accès aux données.
 *
 * Disposition (fiche G04, zone principale de 1108 px) : en-tête (nom, sous-titre, « Écrire à… », « Nouveau devis »,
 * primaire « Nouvelle facture »), colonne d'identité de 300 × 664 à gauche, et à droite la frise « La relation »
 * (792 × 248), « Ce qui est ouvert » (478 × 280) à côté de « L'argent » (300 × 280), puis la bande « Documents » (792 × 108).
 */
export interface ActionsFiche {
  ecrire: () => void;
  devis: () => void;
  facture: () => void;
  /** Un clic sur une ligne de « Ce qui est ouvert ». */
  ouvrirElement: (e: ElementOuvert) => void;
  preparer: (e: ElementOuvert) => void;
  relancer: (e: ElementOuvert) => void;
  envoyer: (e: ElementOuvert) => void;
  voirGarde: () => void;
  mettreSousGarde: () => void;
  ajouterInterlocuteur: () => void;
  ouvrirInterlocuteur: (id: string) => void;
  /** Passe la main à l'écran d'origine (modifier la fiche, notes, historique, sites liés) jusqu'à sa refonte. */
  modifier: () => void;
  retour: () => void;
  reessayer: () => void;
  copier: (valeur: string) => void;
}

export interface VueFicheProps {
  statut: 'pret' | 'chargement' | 'erreur' | 'archive';
  horsLigne?: boolean;
  modele: ModeleFiche | null;
  actions: ActionsFiche;
  /** Le prénom de la personne à qui « Écrire » s'adresse (l'interlocuteur principal), ou `null`. */
  destinataire: string | null;
}

export function VueFiche({ statut, horsLigne = false, modele, actions, destinataire }: VueFicheProps) {
  const { tm, langue } = useMotsFiche();
  if (statut === 'chargement') {
    return <Page><div className="sc-fc" aria-busy="true" aria-label={tm('etat.chargement')}><div className="sc-fc-squelette sc-fc-colonne" /><div className="sc-fc-droite"><div className="sc-fc-squelette sc-fc-frise" /><div className="sc-fc-milieu"><div className="sc-fc-squelette" /><div className="sc-fc-squelette" /></div></div></div></Page>;
  }
  if (statut === 'erreur' || statut === 'archive' || !modele) {
    const archive = statut === 'archive';
    return (
      <Page>
        <BlocEtat
          icone={<AlertCircle size={20} strokeWidth={1.7} />}
          ton="attention"
          annonce="alert"
          titre={archive ? tm('etat.archive') : tm('etat.erreur')}
          actions={archive ? <Bouton variante="secondaire" onClick={actions.retour}>{tm('etat.retour')}</Bouton> : <Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>}
        />
      </Page>
    );
  }

  const m = modele;
  const trait = m.sousTitre.trait ? `, ${tm(`sousTitre.trait.${m.sousTitre.trait}` as const)}` : '';
  const rdv = m.sousTitre.rdv ? ` · ${destinataire ? tm('sousTitre.rdv', { nom: destinataire, heure: m.sousTitre.rdv.heure }) : tm('sousTitre.rdvSansNom', { heure: m.sousTitre.rdv.heure })}` : '';
  const sousTitre = m.sansHistorique ? '' : `${tm(m.sousTitre.mois === 1 ? 'sousTitre.relation.1' : 'sousTitre.relation.n', { n: m.sousTitre.mois })}${trait}${rdv}`;

  return (
    <Page>
      <PageHead
        titre={m.nom}
        sousTitre={sousTitre || undefined}
        secondaires={[
          { libelle: destinataire ? tm('action.ecrire', { nom: destinataire }) : tm('action.ecrireAuClient'), onClick: actions.ecrire, icone: <Mail size={14} strokeWidth={2} /> },
          { libelle: tm('action.devis'), onClick: actions.devis, icone: <FileText size={14} strokeWidth={2} /> },
        ]}
        primaire={{ libelle: tm('action.facture'), onClick: actions.facture, icone: <Wallet size={14} strokeWidth={2} /> }}
        className="sc-fc__entete"
      />
      {horsLigne && <p className="sc-fc__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      <div className="sc-fc">
        <Colonne m={m} actions={actions} />
        <div className="sc-fc-droite">
          <section className="sc-fc-carte sc-fc-frise-carte" aria-label={tm('relation.titre')}>
            {m.sansHistorique ? (
              <div className="sc-fc-frise"><h2 className="sc-fc-carte__titre">{tm('relation.titre')}</h2><p className="sc-fc-vide">{tm('relation.vide')}</p></div>
            ) : (
              <FriseRelation relation={m.relation} langue={langue} />
            )}
          </section>
          <div className="sc-fc-milieu">
            <Ouvert m={m} actions={actions} />
            <Argent m={m} />
          </div>
          <Documents m={m} />
        </div>
      </div>
    </Page>
  );
}

function Colonne({ m, actions }: { m: ModeleFiche; actions: ActionsFiche }) {
  const { tm, langue } = useMotsFiche();
  const ton = m.couleur === 'vert' ? 'succes' : m.couleur === 'orange' ? 'attention' : 'critique';
  const coordonnees: { cle: string; valeur: string; icone: React.ReactNode }[] = [
    { cle: 'email', valeur: m.coordonnees.email, icone: <Mail size={14} strokeWidth={1.8} /> },
    { cle: 'tel', valeur: m.coordonnees.telephone, icone: <Phone size={14} strokeWidth={1.8} /> },
    { cle: 'site', valeur: m.coordonnees.site, icone: <Globe size={14} strokeWidth={1.8} /> },
    { cle: 'adresse', valeur: m.coordonnees.adresse, icone: <MapPin size={14} strokeWidth={1.8} /> },
  ].filter((c) => c.valeur);
  const phrase = m.facteurs.length
    ? `${m.facteurs.map((f, i) => { const t = tm(`sante.${f}` as const); return i === 0 ? t.charAt(0).toUpperCase() + t.slice(1) : t; }).join(', ')}.`
    : tm('sante.aucun');
  return (
    <aside className="sc-fc-colonne sc-fc-carte" aria-label={m.nom}>
      <div className="sc-fc-id">
        <span className="sc-fc-id__initiale" aria-hidden>{m.initiale}</span>
        <div className="sc-fc-id__texte">
          <span className="sc-fc-id__activite">{m.activite || m.nom}</span>
          <span className="sc-fc-id__ville">{m.ville}</span>
        </div>
        <button type="button" className="sc-fc-id__modifier" aria-label={tm('action.modifier')} title={tm('action.modifier')} onClick={actions.modifier}><Pencil size={14} strokeWidth={1.9} /></button>
      </div>
      <div className="sc-fc-pastilles">
        {m.palier && <span className="sc-fc-pastille" data-palier={m.palier}><span className="sc-fc-pastille__point" aria-hidden />{tm('identite.palier', { palier: m.palier })}</span>}
        <span className="sc-fc-pastille">{tm('identite.depuis', { mois: moisCourt(m.depuis, langue, true) })}</span>
      </div>
      <SousCarte className="sc-fc-sante">
        <AnneauProgression valeur={m.sante / 100} libelle={tm('sante.score', { n: m.sante })} ton={ton} taille={52} epaisseur={5} piste="anneau">
          <span className="sc-nombre sc-fc-sante__note">{m.sante}</span>
        </AnneauProgression>
        <div className="sc-fc-sante__texte">
          <span className="sc-fc-sante__libelle">{tm(`sante.${m.libelleSante}` as const)}</span>
          <span className="sc-fc-sante__phrase">{phrase}</span>
        </div>
      </SousCarte>
      <ul className="sc-fc-coordonnees" aria-label={tm('coordonnees.libelle')}>
        {coordonnees.map((c) => (
          <li key={c.cle}>
            <span className="sc-fc-coordonnees__icone" aria-hidden>{c.icone}</span>
            <span className="sc-fc-coordonnees__valeur">{c.valeur}</span>
            {(c.cle === 'email' || c.cle === 'tel') && (
              <button type="button" className="sc-fc-coordonnees__copier" aria-label={tm('coordonnees.copier', { valeur: c.valeur })} onClick={() => actions.copier(c.valeur)}><Copy size={12} strokeWidth={2} /></button>
            )}
          </li>
        ))}
      </ul>
      <div className="sc-fc-interlocuteurs">
        <span className="sc-fc-sur-titre">{tm('interlocuteurs.titre')}</span>
        {m.interlocuteurs === null ? (
          <p className="sc-fc-vide">{tm('interlocuteurs.indisponible')}</p>
        ) : m.interlocuteurs.length === 0 ? (
          <div className="sc-fc-vide">
            <p>{tm('interlocuteurs.aucun.texte')}</p>
            <Bouton variante="secondaire" taille="petit" onClick={actions.ajouterInterlocuteur}>{tm('interlocuteurs.aucun.action')}</Bouton>
          </div>
        ) : (
          <ul className="sc-fc-interlocuteurs__liste">
            {m.interlocuteurs.slice(0, 2).map((i) => (
              <li key={i.id}>
                <button type="button" className="sc-fc-interlocuteur" onClick={() => actions.ouvrirInterlocuteur(i.id)}>
                  <Avatar nom={i.nom} taille={30} />
                  <span className="sc-fc-interlocuteur__texte"><span className="sc-fc-interlocuteur__nom">{i.nom}</span><span className="sc-fc-interlocuteur__fonction">{i.fonction}</span></span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {m.suivieePar.length > 0 && (
          <p className="sc-fc-suivie">
            <span className="sc-fc-suivie__avatars" aria-hidden>{m.suivieePar.slice(0, 3).map((r) => <Avatar key={r.email} nom={r.nom} taille={20} />)}</span>
            {tm('suivie.par', { noms: m.suivieePar.map((r) => r.nom.split(' ')[0]).join(langue === 'fr' ? ' et ' : ' and ') })}
          </p>
        )}
      </div>
      <SousCarte className="sc-fc-garde" >
        {m.garde ? (
          <>
            <div className="sc-fc-garde__tete"><Shield size={14} strokeWidth={1.9} aria-hidden /><span className="sc-fc-garde__titre">{tm('garde.titre')}</span></div>
            <p className="sc-fc-garde__texte">{tm(m.garde.sites === 1 ? 'garde.sites.1' : 'garde.sites.n', { n: m.garde.sites })}</p>
            <Bouton variante="secondaire" taille="petit" onClick={actions.voirGarde}>{tm('garde.voir')}</Bouton>
          </>
        ) : (
          <div className="sc-fc-garde__aucune">
            <p className="sc-fc-garde__texte">{tm('garde.aucune.titre')}</p>
            <Bouton variante="secondaire" taille="petit" onClick={actions.mettreSousGarde}>{tm('garde.aucune.action')}</Bouton>
          </div>
        )}
      </SousCarte>
    </aside>
  );
}

function Ouvert({ m, actions }: { m: ModeleFiche; actions: ActionsFiche }) {
  const { tm, langue } = useMotsFiche();
  const montant = (c: unknown) => euros(Number(c), langue);
  const phrases = (e: ElementOuvert): { titre: string; detail: string } => {
    const d = e.detail;
    if (e.genre === 'rdv') return { titre: e.titre, detail: tm(d.aujourdhui === 1 ? 'ouvert.rdv.aujourdhui' : 'ouvert.rdv.jour', { heure: String(d.heure), jour: String(d.jour).slice(8, 10) + '/' + String(d.jour).slice(5, 7), mode: tm(`ouvert.mode.${String(d.mode)}` as 'ouvert.mode.visio') }) };
    if (e.genre === 'devis') return { titre: tm('ouvert.devis', { numero: e.numero, titre: e.titre }), detail: tm(`ouvert.devis.detail.${e.etat ?? 'envoye'}` as 'ouvert.devis.detail.vu', { montant: montant(d.cents), jours: Number(d.jours) }) };
    if (e.genre === 'factureRetard') return { titre: tm('ouvert.facture.retard', { numero: e.numero, jour: jourCourt(String(d.jour), langue) }), detail: tm('ouvert.facture.retard.detail', { montant: montant(d.cents), jours: Number(d.jours) }) };
    if (e.genre === 'factureEmise') return { titre: tm('ouvert.facture.emise', { numero: e.numero, jour: jourCourt(String(d.jour), langue) }), detail: tm('ouvert.facture.emise.detail', { montant: montant(d.cents) }) };
    return { titre: tm('ouvert.facture.brouillon', { numero: e.numero }), detail: tm('ouvert.facture.brouillon.detail', { montant: montant(d.cents) }) };
  };
  const icone = (e: ElementOuvert) => (e.genre === 'rdv' ? <CalendarDays size={15} strokeWidth={1.8} /> : e.genre === 'devis' ? <FileText size={15} strokeWidth={1.8} /> : <span className="sc-fc-euro">€</span>);
  return (
    <section className="sc-fc-carte sc-fc-ouvert" aria-label={tm('ouvert.titre')}>
      <div className="sc-fc-carte__tete">
        <h2 className="sc-fc-carte__titre">{tm('ouvert.titre')}</h2>
        {m.ouvert.length > 0 && <span className="sc-fc-carte__compte sc-nombre">{tm(m.ouvert.length === 1 ? 'ouvert.compte.1' : 'ouvert.compte.n', { n: m.ouvert.length })}</span>}
      </div>
      {m.ouvert.length === 0 ? (
        <div className="sc-fc-vide sc-fc-vide--centre">
          <p>{tm('ouvert.rien.titre')}</p>
          <Bouton variante="secondaire" taille="petit" onClick={actions.devis}>{tm('ouvert.rien.action')}</Bouton>
        </div>
      ) : (
        <ul className="sc-fc-ouvert__liste">
          {m.ouvert.slice(0, 5).map((e) => {
            const p = phrases(e);
            return (
              <li key={e.cle} className="sc-fc-ligne" data-genre={e.genre}>
                <button type="button" className="sc-fc-ligne__corps" onClick={() => actions.ouvrirElement(e)}>
                  <span className="sc-fc-ligne__tuile" data-genre={e.genre} aria-hidden>{icone(e)}</span>
                  <span className="sc-fc-ligne__texte"><span className="sc-fc-ligne__titre">{p.titre}</span><span className="sc-fc-ligne__detail">{e.genre === 'rdv' && e.detail.aujourdhui === 1 && <span className="sc-fc-ligne__voyant" aria-hidden />}{p.detail}</span></span>
                </button>
                {e.genre === 'rdv' && <Bouton variante="secondaire" taille="petit" onClick={() => actions.preparer(e)}>{tm('ouvert.action.preparer')}</Bouton>}
                {e.genre === 'factureRetard' && <Bouton variante="secondaire" taille="petit" icone={<Send size={12} strokeWidth={2} />} onClick={() => actions.relancer(e)}>{tm('ouvert.action.relancer')}</Bouton>}
                {e.genre === 'factureBrouillon' && <Bouton variante="secondaire" taille="petit" icone={<Send size={12} strokeWidth={2} />} onClick={() => actions.envoyer(e)}>{tm('ouvert.action.envoyer')}</Bouton>}
                {e.genre === 'devis' && e.etat && <PastilleEtat etat={e.etat === 'brouillon' ? 'neutre' : 'info'}>{tm(`ouvert.pastille.${e.etat}` as const)}</PastilleEtat>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function jourCourt(jour: string, langue: 'fr' | 'en'): string {
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${jour}T12:00:00Z`));
}

function Argent({ m }: { m: ModeleFiche }) {
  const { tm, langue } = useMotsFiche();
  const a = m.argent;
  const moy = a.moyenneJours;
  const phrase = moy == null ? tm('argent.ponctualite.aucune')
    : moy < 0 ? tm(-moy === 1 ? 'argent.ponctualite.avance.1' : 'argent.ponctualite.avance.n', { n: -moy })
    : moy === 0 ? tm('argent.ponctualite.heure')
    : tm(moy === 1 ? 'argent.ponctualite.retard.1' : 'argent.ponctualite.retard.n', { n: moy });
  return (
    <section className="sc-fc-carte sc-fc-argent" aria-label={tm('argent.titre')}>
      <div className="sc-fc-carte__tete"><h2 className="sc-fc-carte__titre">{tm('argent.titre')}</h2><span className="sc-fc-carte__compte">{tm('argent.periode')}</span></div>
      <div className="sc-fc-argent__total">
        <span className="sc-fc-argent__montant sc-nombre">{euros(a.factureCents, langue)}</span>
        {a.deltaPourcent != null && <span className="sc-fc-argent__delta sc-nombre" data-sens={a.deltaPourcent >= 0 ? 'hausse' : 'baisse'}>{tm('argent.delta', { signe: a.deltaPourcent >= 0 ? '+' : '−', n: Math.abs(a.deltaPourcent) })}</span>}
      </div>
      <p className="sc-fc-argent__sous">{a.enAttenteCents > 0 ? tm('argent.facture.attente', { montant: euros(a.enAttenteCents, langue) }) : tm('argent.facture')}</p>
      <p className="sc-fc-argent__phrase">{phrase}</p>
      {a.ponctualite.length > 0 && (
        <>
          <BandePonctualite points={a.ponctualite} />
          <div className="sc-fc-argent__axe"><span>{tm('argent.axe.avant')}</span><span>{tm('argent.axe.echeance')}</span><span>{tm('argent.axe.apres')}</span></div>
        </>
      )}
      <dl className="sc-fc-argent__lignes">
        <div><dt>{tm('argent.panier')}</dt><dd className="sc-nombre">{a.panierCents == null ? '—' : euros(a.panierCents, langue)}</dd></div>
        <div><dt>{tm('argent.prochaine')}</dt><dd className="sc-nombre">{a.prochaine ? tm('argent.prochaine.prete', { montant: euros(a.prochaine.cents, langue) }) : tm('argent.prochaine.aucune')}</dd></div>
      </dl>
    </section>
  );
}

function Documents({ m }: { m: ModeleFiche }) {
  const { tm } = useMotsFiche();
  return (
    <section className="sc-fc-carte sc-fc-documents" aria-label={tm('documents.titre')}>
      <div className="sc-fc-carte__tete">
        <h2 className="sc-fc-carte__titre">{tm('documents.titre')}</h2>
        {m.documents && <span className="sc-fc-carte__compte sc-nombre">{tm('documents.compte', { n: m.documents.total })}</span>}
      </div>
      {m.documents === null ? <p className="sc-fc-vide">{tm('documents.indisponible')}</p> : null}
    </section>
  );
}
