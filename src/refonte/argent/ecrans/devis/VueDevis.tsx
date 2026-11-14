import React, { useEffect, useId, useMemo, useState } from 'react';
import { Eye, Plus, Send, Undo2, PenLine } from 'lucide-react';
import { PageHead } from '../../../../socle/ui/archetypes';
import { BoiteRecherche, Bouton, EtatVide, Interrupteur, PastilleEtat } from '../../../../socle/ui';
import { LiveDot } from '../../../../socle/ui/vivant';
import { formaterDate, formaterEuro, formaterHeure, formaterNombre } from '../../../../socle/formats';
import { totauxDocument, DELAI_PAR_DEFAUT_JOURS, type Ligne } from '../../facturation';
import { acompte, chercherPrestation, ecartDeVersion, VALIDITE_JOURS, TAUX_TVA_PAR_DEFAUT } from '../../devis';
import { useMots } from './mots';
import '../argent.css';
import './devis.css';

/**
 * H07 · DEVIS — la vue de présentation : catalogue et versions à gauche, la page du devis sur son plan de travail au
 * centre (éditable en place), suivi de lecture et options à droite. Totaux, TVA (ligne par ligne, STATUT §1.29 n° 1),
 * acompte et écart de version viennent de `src/refonte/argent/{facturation,devis}.ts`.
 *
 * Ce qui est DANS la page du devis part chez le client (clés `client.`) ; le reste tutoie.
 */

export interface PrestationVue {
  id: string;
  nom: string;
  prixCents: number;
  unite: string;
  etat: string;
  tauxTva?: number;
}

export interface VersionVue {
  n: number;
  etat: 'brouillon' | 'envoyee';
  /** Instant ISO de la dernière modification (brouillon) ou de l'envoi. */
  le: string;
  /** Le nombre de lectures mesurées, ou `null` sans mesure. */
  lectures: number | null;
  /** Ouverte au moins une fois par le client (connu même sans mesure de lecture). */
  ouverte: boolean;
}

export interface SuiviLecture {
  version: number;
  ouvertures: number;
  lectureSec: number;
  derniere: string;
  sections: readonly { nom: string; sec: number }[];
}

export interface DevisVu {
  numero: string;
  version: number;
  clientNom: string;
  contact: string | null;
  adresse: string | null;
  objet: string;
  emisLe: string | null;
  validiteJusquau: string;
  lignes: readonly Ligne[];
  /** Le TTC de la version précédente (écart affiché s'il n'est pas nul). */
  ttcPrecedentCents: number | null;
  /** Instant ISO de l'ouverture par le client, s'il est connu (sans le détail du suivi). */
  vuLe: string | null;
}

export interface ActionsDevis {
  envoyer: () => void;
  apercu: () => void;
  changerLignes: (lignes: Ligne[]) => void;
  reessayer: () => void;
}

export interface VueDevisProps {
  statut: 'pret' | 'chargement' | 'erreur' | 'vide';
  devis: DevisVu | null;
  emetteur: { nom: string; activite: string };
  /** `null` : le catalogue n'est pas lisible. */
  catalogue: readonly PrestationVue[] | null;
  versions: readonly VersionVue[];
  /** `null` : aucune mesure de lecture. */
  suivi: SuiviLecture | null;
  enregistreLe: string;
  paiementEnLigneBranche: boolean;
  /** Le module « Paiement en plusieurs fois » de l'Atelier (F1), s'il est intégré (STATUT §1.33 n° 4). */
  echeancier?: { ouvrir: () => void } | null;
  editable: boolean;
  actions: ActionsDevis;
}

const euros = (cents: number, decimales?: number) => formaterEuro(cents / 100, decimales === undefined ? {} : { decimales });
const nombre = (cents: number) => formaterNombre(cents / 100, { decimales: 2, decimalesMin: 2 });
const minutes = (sec: number, langue: string) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} s`;
  return langue === 'en' ? `${m} min ${String(s).padStart(2, '0')}` : `${m} min ${String(s).padStart(2, '0')}`;
};

export function VueDevis({ statut, devis, emetteur, catalogue, versions, suivi, enregistreLe, paiementEnLigneBranche, echeancier = null, editable, actions }: VueDevisProps) {
  const { tm, langue } = useMots();
  const locale = langue === 'en' ? 'en-GB' : 'fr-FR';
  const id = useId();
  const [lignes, setLignes] = useState<Ligne[]>(() => [...(devis?.lignes ?? [])]);
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const [options, setOptions] = useState({ acompte: true, signature: true, rappel: true, paiement: false });
  useEffect(() => setLignes([...(devis?.lignes ?? [])]), [devis]);

  const totaux = useMemo(() => totauxDocument(lignes), [lignes]);
  const pctAcompte = 30;
  const montantAcompte = acompte(totaux.ttcCents, pctAcompte);
  const ecart = devis?.ttcPrecedentCents == null ? null : ecartDeVersion(totaux.ttcCents, devis.ttcPrecedentCents);
  const prixInitial = useMemo(() => new Map((devis?.lignes ?? []).map((l, i) => [l.id ?? String(i), l.unitPriceCents])), [devis]);
  const maxSec = Math.max(1, ...(suivi?.sections.map((s) => s.sec) ?? [0]));
  const parLigne = new Map((suivi?.sections ?? []).map((s) => [s.nom, s.sec]));

  const changer = (suivantes: Ligne[]) => {
    setLignes(suivantes);
    actions.changerLignes(suivantes);
  };
  const ajouter = (p: PrestationVue) =>
    changer([...lignes, { id: `l-${Date.now().toString(36)}`, label: p.nom, quantity: 1, unitPriceCents: p.prixCents, vatRate: p.tauxTva ?? TAUX_TVA_PAR_DEFAUT }]);

  const visibles = useMemo(() => {
    if (!catalogue) return null;
    const actives = catalogue.filter((p) => p.etat === 'active');
    if (!recherche.trim()) return actives;
    const une = chercherPrestation(recherche, actives);
    const q = recherche.trim().toLowerCase();
    return actives.filter((p) => p === une || p.nom.toLowerCase().includes(q));
  }, [catalogue, recherche]);

  if (statut !== 'pret' || !devis) {
    return (
      <div className="ar-ecran ar-devis" data-famille="argent">
        <PageHead className="ar-entete" titre={tm('page.fil')} />
        <section className="ar-carte ar-devis__etat">
          {statut === 'erreur' ? (
            <EtatVide titre={tm('erreur')} texte={tm('aValider')} action={<Bouton onClick={actions.reessayer}>{tm('reessayer')}</Bouton>} />
          ) : (
            <EtatVide titre={tm('vide.titre')} texte={tm('vide.texte')} action={null} />
          )}
        </section>
      </div>
    );
  }

  const brouillon = versions.find((v) => v.etat === 'brouillon');
  const precedente = [...versions].filter((v) => v.etat === 'envoyee').sort((a, b) => b.n - a.n)[0];
  const sousTitre = precedente?.lectures ? tm('page.sousTitreLu', { client: devis.clientNom, n: precedente.lectures }) : tm('page.sousTitre', { client: devis.clientNom });
  const titre = tm('page.titre', { numero: devis.numero });
  const tva = totaux.parTaux;

  return (
    <div className="ar-ecran ar-devis" data-famille="argent">
      <PageHead
        className="ar-entete"
        titre={titre}
        sousTitre={sousTitre}
        extra={
          brouillon && devis.version > 1 ? (
            <span className="ar-devis__pastille">
              <PastilleEtat etat="info">{tm('page.version', { n: devis.version })}</PastilleEtat>
            </span>
          ) : undefined
        }
        secondaires={[{ libelle: tm('page.apercu'), icone: <Eye aria-hidden size={14} />, onClick: actions.apercu }]}
        primaire={editable ? { libelle: devis.version > 1 ? tm('page.envoyer', { n: devis.version }) : tm('page.envoyerUnique'), icone: <Send aria-hidden size={14} />, onClick: actions.envoyer } : undefined}
      />

      <div className="ar-devis__corps" data-mvt="cascade">
        <div className="ar-devis__gauche">
          <section className="ar-carte ar-devis__catalogue" aria-labelledby={`${id}-cat`}>
            <header className="ar-carte__entete">
              <h2 id={`${id}-cat`} className="ar-carte__titre">
                {tm('catalogue.titre')}
              </h2>
              {catalogue && <span className="ar-carte__aside ar-montant">{catalogue.filter((p) => p.etat === 'active').length}</span>}
            </header>
            {visibles === null ? (
              <p className="ar-devis__indispo">{tm('catalogue.indisponible')}</p>
            ) : (
              <>
                <div className="ar-devis__recherche">
                  <BoiteRecherche valeur={recherche} onChange={setRecherche} libelle={tm('catalogue.recherche')} placeholder={tm('catalogue.recherche')} />
                </div>
                <ul className="ar-devis__prestations">
                  {visibles.length === 0 && <li className="ar-devis__indispo">{tm('catalogue.aucun')}</li>}
                  {visibles.map((p) => (
                    <li key={p.id} className="ar-devis__prestation">
                      <span className="ar-devis__prestation-texte">
                        <span className="ar-devis__prestation-nom">{p.nom}</span>
                        <span className="ar-devis__prestation-prix">
                          {euros(p.prixCents)} · {p.unite}
                        </span>
                      </span>
                      {editable && (
                        <button type="button" className="ar-devis__plus" aria-label={tm('catalogue.ajouter', { nom: p.nom })} onClick={() => ajouter(p)}>
                          <Plus aria-hidden size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="ar-devis__catalogue-pied">{tm('catalogue.pied')}</p>
              </>
            )}
          </section>

          <section className="ar-carte ar-devis__versions" aria-labelledby={`${id}-ver`}>
            <header className="ar-carte__entete">
              <h2 id={`${id}-ver`} className="ar-carte__titre">
                {tm('versions.titre')}
              </h2>
            </header>
            <ul className="ar-devis__liste-versions">
              {[...versions].sort((a, b) => b.n - a.n).map((v) => (
                <li key={v.n} className="ar-devis__version" data-active={v.n === devis.version ? 'oui' : undefined}>
                  <span className="ar-devis__version-n ar-montant">v{v.n}</span>
                  <span className="ar-devis__version-texte">
                    <span>{v.etat === 'brouillon' ? tm('versions.brouillon') : tm('versions.envoyee', { date: formaterDate(v.le, { day: 'numeric', month: 'short' }, locale) })}</span>
                    <span className="ar-discret">
                      {v.etat === 'brouillon' ? tm('versions.enCours', { heure: formaterHeure(v.le, locale) }) : v.lectures ? tm('versions.lue', { n: v.lectures }) : v.ouverte ? tm('versions.ouverte') : tm('versions.nonLue')}
                    </span>
                  </span>
                  {v.etat === 'brouillon' && <LiveDot libelle={tm('versions.brouillon')} onde={false} taille={6} />}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="ar-devis__bureau" aria-label={tm('page.titre', { numero: devis.numero })}>
          <div className="ar-devis__barre">
            <span className="ar-devis__enregistre">
              <LiveDot libelle={tm('bureau.enregistre', { heure: formaterHeure(enregistreLe, locale) })} onde={false} taille={6} />
              {tm('bureau.enregistre', { heure: formaterHeure(enregistreLe, locale) })}
            </span>
            {suivi && <span className="ar-devis__legende-marge">{tm('bureau.marge')}</span>}
          </div>
          <article className="ar-devis__page">
            <header className="ar-devis__page-tete">
              <span className="ar-devis__marque">
                <span aria-hidden className="ar-devis__logo">
                  {emetteur.nom.charAt(0)}
                </span>
                <span>
                  <span className="ar-devis__marque-nom">{emetteur.nom}</span>
                  <span className="ar-devis__marque-activite">{emetteur.activite}</span>
                </span>
              </span>
              <span className="ar-devis__numero">
                <span className="ar-devis__mention">{tm('client.devis')}</span>
                <span className="ar-montant">
                  {devis.numero} · v{devis.version}
                </span>
              </span>
            </header>
            <div className="ar-devis__client">
              <div>
                <span className="ar-devis__mention-doux">{tm('client.pour')}</span>
                <strong>{devis.clientNom}</strong>
                {devis.contact && <span>{devis.contact}</span>}
                {devis.adresse && <span>{devis.adresse}</span>}
              </div>
              <div className="ar-devis__dates">
                {devis.emisLe && <span>{tm('client.emis', { date: formaterDate(devis.emisLe, { day: 'numeric', month: 'short', year: 'numeric' }, locale) })}</span>}
                <span>{tm('client.valable', { date: formaterDate(`${devis.validiteJusquau}T12:00:00`, { day: 'numeric', month: 'short' }, locale) })}</span>
              </div>
            </div>
            <h3 className="ar-devis__objet">{devis.objet}</h3>
            <table className="ar-devis__tableau">
              <thead>
                <tr>
                  <th scope="col">{tm('tableau.designation')}</th>
                  <th scope="col">{tm('tableau.qte')}</th>
                  <th scope="col">{tm('tableau.prix')}</th>
                  <th scope="col">{tm('tableau.total')}</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, i) => {
                  const cle = l.id ?? String(i);
                  const initial = prixInitial.get(cle);
                  const change = initial !== undefined && initial !== l.unitPriceCents;
                  const sec = parLigne.get(l.label ?? '');
                  const total = totauxDocument([l]).htCents;
                  return (
                    <tr key={cle} data-edition={enEdition === cle ? 'oui' : undefined}>
                      <td>
                        {sec !== undefined && <span aria-hidden className="ar-devis__marge" style={{ opacity: 0.15 + 0.75 * (sec / maxSec) }} />}
                        {l.label}
                      </td>
                      <td className="ar-montant">{formaterNombre(l.quantity)}</td>
                      <td className="ar-montant">
                        {change && initial !== undefined && <span className="ar-devis__ancien">{nombre(initial)}</span>}
                        {editable && enEdition === cle ? (
                          <input
                            className="ar-devis__champ ar-montant"
                            autoFocus
                            inputMode="decimal"
                            aria-label={`${tm('tableau.prix')} · ${l.label}`}
                            defaultValue={nombre(l.unitPriceCents)}
                            onBlur={(e) => {
                              const v = Math.round(Number(e.currentTarget.value.replace(/[\s\u202f\u00a0]/g, '').replace(',', '.')) * 100);
                              if (Number.isFinite(v) && v >= 0) changer(lignes.map((x, k) => (k === i ? { ...x, unitPriceCents: v } : x)));
                              setEnEdition(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
                            }}
                          />
                        ) : (
                          <button type="button" className="ar-devis__cellule" disabled={!editable} onClick={() => setEnEdition(cle)}>
                            {nombre(l.unitPriceCents)}
                          </button>
                        )}
                      </td>
                      <td className="ar-montant">
                        <span className="ar-devis__total" data-change={change ? 'oui' : undefined}>
                          {nombre(total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {editable && (
              <button type="button" className="ar-devis__ajouter" onClick={() => document.querySelector<HTMLInputElement>('.ar-devis__recherche input')?.focus()}>
                <Plus aria-hidden size={13} />
                {tm('tableau.ajouter')}
              </button>
            )}
            <div className="ar-devis__bas">
              <div className="ar-devis__conditions">
                <p>{tm('client.conditions.paiement', { jours: DELAI_PAR_DEFAUT_JOURS })}</p>
                {options.acompte && <p>{tm('client.conditions.acompte', { pct: pctAcompte, montant: euros(montantAcompte, 2) })}</p>}
                <p>{tm('client.conditions.validite', { jours: VALIDITE_JOURS })}</p>
              </div>
              <dl className="ar-devis__totaux">
                <div>
                  <dt>{tm('totaux.sousTotal')}</dt>
                  <dd className="ar-montant">{euros(totaux.htCents, 2)}</dd>
                </div>
                {tva.map((t) => (
                  <div key={t.taux}>
                    <dt>{tm('totaux.tva', { taux: formaterNombre(t.taux) })}</dt>
                    <dd className="ar-montant">{euros(t.tvaCents, 2)}</dd>
                  </div>
                ))}
                <div className="ar-devis__ttc">
                  <dt>{tm('totaux.ttc')}</dt>
                  <dd className="ar-montant">{euros(totaux.ttcCents, 2)}</dd>
                </div>
                {ecart !== null && (
                  <div className="ar-devis__ecart">
                    <Undo2 aria-hidden size={12} />
                    {tm('totaux.ecart', { montant: `${ecart > 0 ? '+' : '−'}${euros(Math.abs(ecart), 2)}`, n: devis.version - 1 })}
                  </div>
                )}
              </dl>
            </div>
            <footer className="ar-devis__accord">
              <PenLine aria-hidden size={12} />
              {tm('client.accord', { contact: devis.contact ?? devis.clientNom })}
            </footer>
          </article>
        </section>

        <div className="ar-devis__droite">
          <section className="ar-carte ar-devis__suivi" aria-labelledby={`${id}-suivi`}>
            <header className="ar-carte__entete">
              <h2 id={`${id}-suivi`} className="ar-carte__titre">
                {tm('suivi.titre')}
              </h2>
              {suivi && <span className="ar-carte__aside">{tm('suivi.version', { n: suivi.version })}</span>}
            </header>
            {suivi ? (
              <>
                <dl className="ar-devis__chiffres">
                  <div>
                    <dt>{tm('suivi.ouvertures')}</dt>
                    <dd>{suivi.ouvertures}</dd>
                  </div>
                  <div>
                    <dt>{tm('suivi.lecture')}</dt>
                    <dd>{minutes(suivi.lectureSec, langue)}</dd>
                  </div>
                  <div>
                    <dt>{tm('suivi.derniere')}</dt>
                    <dd>{formaterDate(suivi.derniere, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }, locale)}</dd>
                  </div>
                </dl>
                <ul className="ar-devis__sections">
                  {[...suivi.sections].sort((a, b) => b.sec - a.sec).map((s) => (
                    <li key={s.nom}>
                      <span>{s.nom}</span>
                      <span aria-hidden className="ar-devis__section-barre">
                        <span style={{ width: `${(s.sec / maxSec) * 100}%` }} />
                      </span>
                      <span className="ar-montant ar-discret">{minutes(s.sec, langue)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="ar-devis__suivi-vide">
                {devis.vuLe && <p className="ar-devis__vu">{tm('suivi.vu', { date: formaterDate(devis.vuLe, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }, locale) })}</p>}
                <p className="ar-devis__indispo">{tm('suivi.indisponible')}</p>
              </div>
            )}
          </section>

          <section className="ar-carte ar-devis__options" aria-labelledby={`${id}-opt`}>
            <header className="ar-carte__entete">
              <h2 id={`${id}-opt`} className="ar-carte__titre">
                {tm('options.titre')}
              </h2>
            </header>
            <ul className="ar-devis__liste-options">
              <Option titre={tm('options.acompte', { pct: pctAcompte })} detail={tm('options.acompteDetail', { montant: euros(montantAcompte, 2) })} actif={options.acompte} onChange={(v) => setOptions({ ...options, acompte: v })} disabled={!editable} />
              <Option titre={tm('options.signature')} detail={tm('options.signatureDetail', { contact: devis.contact ?? devis.clientNom })} actif={options.signature} onChange={(v) => setOptions({ ...options, signature: v })} disabled={!editable} />
              <Option titre={tm('options.rappel')} detail={tm('options.rappelDetail')} actif={options.rappel} onChange={(v) => setOptions({ ...options, rappel: v })} disabled={!editable} />
              <Option
                titre={tm('options.paiement')}
                detail={paiementEnLigneBranche ? tm('options.paiementDetail') : tm('options.paiementABrancher')}
                actif={options.paiement && paiementEnLigneBranche}
                onChange={(v) => setOptions({ ...options, paiement: v })}
                disabled={!editable || !paiementEnLigneBranche}
              />
              {echeancier && (
                <li className="ar-devis__option">
                  <button type="button" className="ar-devis__lien" onClick={echeancier.ouvrir}>
                    <span>{tm('options.echeancier')}</span>
                    <span className="ar-discret">{tm('options.echeancierDetail')}</span>
                  </button>
                </li>
              )}
            </ul>
          </section>
          <p className="ar-mention ar-devis__mention-comptable">{tm('aValider')}</p>
        </div>
      </div>
    </div>
  );
}

function Option({ titre, detail, actif, onChange, disabled }: { titre: string; detail: string; actif: boolean; onChange: (v: boolean) => void; disabled: boolean }) {
  return (
    <li className="ar-devis__option">
      <span className="ar-devis__option-texte">
        <span>{titre}</span>
        <span className="ar-discret">{detail}</span>
      </span>
      <Interrupteur actif={actif} onChange={onChange} libelle={titre} disabled={disabled} />
    </li>
  );
}
