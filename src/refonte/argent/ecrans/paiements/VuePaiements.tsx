import React, { useId, useMemo } from 'react';
import { Link2, RefreshCw, Scale, Settings, Sparkles } from 'lucide-react';
import { PageHead } from '../../../../socle/ui/archetypes';
import { AnneauProgression, BarreProgression, Bouton, Chargement, EtatVide, PastilleEtat, Squelette, type EtatPastille } from '../../../../socle/ui';
import { LiveDot } from '../../../../socle/ui/vivant';
import { formaterEuro, formaterDate, formaterHeure } from '../../../../socle/formats';
import { bilanDuMois, hauteurDeBarre, parMoyen } from '../../paiements';
import { ajouterJours, joursDansMois, lundiDe, moisDe, type Jour, type Mois } from '../../commun';
import { useMots, type CleMotsPaiements } from './mots';
import '../argent.css';
import './paiements.css';

/**
 * MA03 · PAIEMENTS EN LIGNE — la vue de présentation, sans accès aux données.
 *
 * Trois volets (428 / 300 / 340, écart 20) : le flux des paiements, le taux de réussite du mois, les versements et la
 * connexion. Les calculs viennent de `src/refonte/argent/paiements.ts` (taux, frais, par moyen, barres en racine). La
 * page (`PagePaiements`) et l'aperçu (`scripts/apercu/ecrans/MA03.tsx`) lui passent les mêmes formes.
 *
 * Aucune clé, aucun numéro de carte : l'écran ne montre que des états, des totaux et des références de facture.
 */

export type MoyenPaiement = 'carte' | 'virement' | 'prélèvement' | 'chèque' | 'espèces';
export type EtatPaiement = 'réussi' | 'en attente' | 'échoué' | 'remboursé';

export interface PaiementVu {
  id: string;
  /** Instant ISO. */
  date: string;
  clientNom: string;
  moyen: MoyenPaiement;
  montantCents: number;
  fraisCents: number;
  etat: EtatPaiement;
  /** Le numéro de la facture liée, s'il y en a une. */
  facture: string | null;
  /** Le texte d'état donné par le serveur (délai, motif de refus), s'il y en a un. */
  note?: string | null;
}

export interface VersementVu {
  date: Jour;
  montantCents: number;
  prevu: boolean;
}

export interface ConnexionPaiements {
  /** `connecte` : branché et vérifié ; `a-verifier` : branché, dernier test en échec ou ancien ; `non-connecte`. */
  etat: 'connecte' | 'a-verifier' | 'non-connecte';
  /** Instant ISO de la dernière vérification réussie, s'il y en a une. */
  dernierTest: string | null;
}

export interface ActionsPaiements {
  creerLien: () => void;
  reglages: () => void;
  envoyerLien: (paiement: PaiementVu) => void;
  ouvrir: (paiement: PaiementVu) => void;
  reessayer: () => void;
}

export interface VuePaiementsProps {
  statut: 'pret' | 'chargement' | 'erreur';
  connexion: ConnexionPaiements;
  paiements: readonly PaiementVu[];
  /** `null` : les versements ne sont pas lisibles (ni le serveur ni les jeux ne les portent). */
  versements: readonly VersementVu[] | null;
  maintenant: Date;
  /** La dernière mise à jour du flux (instant ISO). */
  majLe: string;
  enLigne: boolean;
  /** Vrai si la personne peut créer et envoyer des liens. */
  peutEcrire: boolean;
  /** Le Comparateur de devis de l'Atelier (F1), s'il est intégré : un lien, rien d'autre (STATUT §1.33 n° 4). */
  comparateur?: { ouvrir: () => void } | null;
  actions: ActionsPaiements;
}

const jourLocal = (iso: string | Date): Jour => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const euros = (cents: number) => formaterEuro(cents / 100);

function duree(de: Date, a: Date, langue: 'fr' | 'en'): string {
  const s = Math.max(0, Math.round((a.getTime() - de.getTime()) / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  return langue === 'en' ? `${h} h` : `${h} h`;
}

const TON_ETAT: Record<EtatPaiement, EtatPastille> = { réussi: 'succes', 'en attente': 'attention', échoué: 'critique', remboursé: 'neutre' };
/** Le moyen « en mots » : les badges complètent la référence, ils ne la remplacent pas. */
const MOYENS: readonly MoyenPaiement[] = ['carte', 'virement', 'prélèvement', 'chèque', 'espèces'];

/** Le libellé de temps d'un événement : l'heure le jour même, « Hier », puis « 28 oct. ». */
function quand(iso: string, aujourdhui: Jour, tm: (c: CleMotsPaiements) => string, locale: string): string {
  const j = jourLocal(iso);
  if (j === aujourdhui) return formaterHeure(iso, locale);
  if (j === ajouterJours(aujourdhui, -1)) return tm('flux.hier');
  return formaterDate(iso, { day: 'numeric', month: 'short' }, locale);
}

export function VuePaiements({ statut, connexion, paiements, versements, maintenant, majLe, enLigne, peutEcrire, comparateur = null, actions }: VuePaiementsProps) {
  const { tm, langue } = useMots();
  const locale = langue === 'en' ? 'en-GB' : 'fr-FR';
  const id = useId();
  const aujourdhui = jourLocal(maintenant);
  const mois: Mois = moisDe(aujourdhui);
  const nomMois = formaterDate(`${mois}-15T12:00:00`, { month: 'long' }, locale);
  const nomMoisAn = formaterDate(`${mois}-15T12:00:00`, { month: 'long', year: 'numeric' }, locale);

  const flux = useMemo(() => [...paiements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50), [paiements]);
  const lus = useMemo(() => paiements.map((p) => ({ ...p, date: jourLocal(p.date) })), [paiements]);
  const bilan = useMemo(() => bilanDuMois(lus, mois), [lus, mois]);
  const moyens = useMemo(() => {
    const l = parMoyen(lus, mois);
    return MOYENS.flatMap((m) => l.filter((x) => x.moyen === m));
  }, [lus, mois]);
  const echec = flux.find((p) => p.etat === 'échoué' && jourLocal(p.date).startsWith(mois));

  const sousTitre =
    connexion.etat === 'non-connecte' ? tm('page.sousTitre.nonConnecte') : connexion.etat === 'a-verifier' ? tm('page.sousTitre.aVerifier') : tm('page.sousTitre.connecte');

  return (
    <div className="ar-ecran ar-paie" data-famille="argent">
      <PageHead
        className="ar-entete"
        titre={tm('page.titre')}
        sousTitre={sousTitre}
        secondaires={[
          ...(comparateur ? [{ libelle: tm('page.comparateur'), icone: <Scale aria-hidden size={14} />, onClick: comparateur.ouvrir }] : []),
          { libelle: tm('page.reglages'), icone: <Settings aria-hidden size={14} />, onClick: actions.reglages },
        ]}
        primaire={peutEcrire && connexion.etat !== 'non-connecte' ? { libelle: tm('page.creerLien'), icone: <Link2 aria-hidden size={14} />, onClick: actions.creerLien, disabled: !enLigne } : undefined}
      />

      {connexion.etat === 'non-connecte' ? (
        <section className="ar-carte ar-paie__non-connecte" aria-label={tm('nonConnecte.titre')}>
          <EtatVide
            titre={tm('nonConnecte.titre')}
            texte={tm('nonConnecte.texte')}
            action={
              <Bouton variante="secondaire" icone={<Settings aria-hidden size={14} />} onClick={actions.reglages}>
                {tm('page.reglages')}
              </Bouton>
            }
          />
        </section>
      ) : (
        <div className="ar-paie__corps" data-mvt="cascade">
          <Flux
            id={`${id}-flux`}
            statut={statut}
            flux={flux}
            aujourdhui={aujourdhui}
            maintenant={maintenant}
            majLe={majLe}
            enLigne={enLigne}
            enPause={connexion.etat === 'a-verifier'}
            echec={echec ?? null}
            peutEcrire={peutEcrire}
            actions={actions}
            locale={locale}
          />

          <section className="ar-carte ar-paie__taux" aria-labelledby={`${id}-taux`}>
            <header className="ar-carte__entete">
              <h2 id={`${id}-taux`} className="ar-carte__titre">
                {tm('taux.titre')}
              </h2>
              <span className="ar-carte__aside">{nomMois}</span>
            </header>
            {statut === 'chargement' ? (
              <Chargement libelle={tm('taux.titre')} className="ar-paie__taux-chargement">
                <Squelette largeur={168} hauteur={168} rayon="50%" />
              </Chargement>
            ) : (
              <>
                <div className="ar-paie__anneau">
                  <AnneauProgression
                    valeur={bilan.tauxReussite === null ? 0 : bilan.tauxReussite / 100}
                    libelle={tm('taux.anneau')}
                    texte={bilan.tauxReussite === null ? '--' : `${bilan.tauxReussite} %`}
                    taille={168}
                    epaisseur={13}
                    ton={bilan.tauxReussite === null ? 'neutre' : 'succes'}
                  >
                    <span className="ar-paie__anneau-valeur">{bilan.tauxReussite === null ? '--' : `${bilan.tauxReussite} %`}</span>
                    <span className="ar-paie__anneau-legende">{tm('taux.centre')}</span>
                  </AnneauProgression>
                </div>
                <dl className="ar-paie__compteurs">
                  <div>
                    <dt>{tm('taux.reussis')}</dt>
                    <dd className="ar-montant">{bilan.reussis}</dd>
                  </div>
                  <div>
                    <dt>{tm('taux.enAttente')}</dt>
                    <dd className="ar-montant ar-attention">{bilan.enAttente}</dd>
                  </div>
                  <div>
                    <dt>{tm('taux.echoues')}</dt>
                    <dd className="ar-montant ar-critique">{bilan.echoues}</dd>
                  </div>
                </dl>
                <ul className="ar-paie__moyens">
                  {moyens.map((m) => (
                    <li key={m.moyen} className="ar-paie__moyen">
                      <span className="ar-paie__moyen-ligne">
                        <span className="ar-moyen">{tm(`badge.${m.moyen}` as CleMotsPaiements)}</span>
                        <span className="ar-paie__moyen-nom">{tm('taux.parMoyen', { moyen: capitale(tm(`moyen.${m.moyen}` as CleMotsPaiements)), n: m.total })}</span>
                        <span className="ar-paie__moyen-taux ar-montant">{m.taux === null ? '--' : `${m.taux} %`}</span>
                      </span>
                      <BarreProgression
                        valeur={(m.taux ?? 0) / 100}
                        ton={m.taux === 100 ? 'succes' : 'attention'}
                        hauteur={5}
                        libelle={tm('taux.parMoyen', { moyen: tm(`moyen.${m.moyen}` as CleMotsPaiements), n: m.total })}
                        texte={m.taux === null ? '--' : `${m.taux} %`}
                      />
                    </li>
                  ))}
                </ul>
                <Jours paiements={lus} mois={mois} aujourdhui={aujourdhui} titre={tm('taux.jours', { mois: nomMois })} aide={tm('taux.joursAide')} />
                <dl className="ar-paie__totaux">
                  <div>
                    <dt>{tm('taux.encaisse')}</dt>
                    <dd className="ar-montant ar-paie__encaisse">{euros(bilan.encaisseCents)}</dd>
                  </div>
                  <div>
                    <dt>{tm('taux.frais')}</dt>
                    <dd className="ar-montant ar-doux">
                      {euros(bilan.fraisCents)} · {bilan.partFrais === null ? '--' : `${String(bilan.partFrais).replace('.', langue === 'en' ? '.' : ',')} %`}
                    </dd>
                  </div>
                </dl>
              </>
            )}
          </section>

          <div className="ar-paie__droite">
            <Versements id={`${id}-versements`} versements={versements} mois={mois} aujourdhui={aujourdhui} nomMoisAn={nomMoisAn} nomMois={nomMois} locale={locale} />
            <section className="ar-carte ar-paie__connexion" aria-labelledby={`${id}-connexion`}>
              <header className="ar-carte__entete">
                <h2 id={`${id}-connexion`} className="ar-carte__titre">
                  {tm('connexion.titre')}
                </h2>
                <LiveDot ton={connexion.etat === 'connecte' ? 'ok' : 'attention'} libelle={connexion.etat === 'connecte' ? tm('flux.direct') : tm('flux.pause')} onde={false} />
              </header>
              <dl className="ar-paie__kv">
                <div>
                  <dt>{tm('connexion.cle')}</dt>
                  <dd>{tm('connexion.cleValeur')}</dd>
                </div>
                <div>
                  <dt>{tm('connexion.visible')}</dt>
                  <dd className="ar-succes">{tm('connexion.visibleValeur')}</dd>
                </div>
                <div>
                  <dt>{tm('connexion.test')}</dt>
                  <dd className={connexion.etat === 'a-verifier' ? 'ar-attention' : undefined}>
                    {connexion.dernierTest ? tm('connexion.testValeur', { duree: duree(new Date(connexion.dernierTest), maintenant, langue) }) : tm('connexion.testInconnu')}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

const capitale = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ── Le flux ── */

function Flux({
  id,
  statut,
  flux,
  aujourdhui,
  maintenant,
  majLe,
  enLigne,
  enPause,
  echec,
  peutEcrire,
  actions,
  locale,
}: {
  id: string;
  statut: VuePaiementsProps['statut'];
  flux: readonly PaiementVu[];
  aujourdhui: Jour;
  maintenant: Date;
  majLe: string;
  enLigne: boolean;
  enPause: boolean;
  echec: PaiementVu | null;
  peutEcrire: boolean;
  actions: ActionsPaiements;
  locale: string;
}) {
  const { tm, langue } = useMots();
  const indicateur = !enLigne ? tm('flux.horsLigne') : enPause ? tm('flux.pause') : tm('flux.direct');
  // L'événement le plus récent porte le halo pendant 10 minutes.
  const recent = flux[0] && maintenant.getTime() - new Date(flux[0].date).getTime() < 10 * 60_000 ? flux[0].id : null;
  return (
    <section className="ar-carte ar-paie__flux" aria-labelledby={id}>
      <header className="ar-carte__entete">
        <h2 id={id} className="ar-carte__titre ar-paie__flux-titre">
          {tm('flux.titre')}
          <span className="ar-paie__direct" data-actif={enLigne && !enPause ? 'oui' : 'non'}>
            <LiveDot ton={enLigne && !enPause ? 'ok' : 'attention'} libelle={indicateur} onde={enLigne && !enPause} taille={6} />
            {indicateur}
          </span>
        </h2>
        <span className="ar-carte__aside">{tm('flux.maj', { duree: duree(new Date(majLe), maintenant, langue) })}</span>
      </header>
      <div className="ar-paie__fil">
        {statut === 'chargement' ? (
          <Chargement libelle={tm('flux.titre')} className="ar-paie__fil-chargement">
            {Array.from({ length: 6 }, (_, i) => (
              <Squelette key={i} hauteur={52} rayon={10} />
            ))}
          </Chargement>
        ) : statut === 'erreur' ? (
          <div role="alert" className="ar-paie__erreur">
            <span>{tm('flux.erreur')}</span>
            <Bouton variante="secondaire" taille="petit" icone={<RefreshCw aria-hidden size={14} />} onClick={actions.reessayer}>
              {tm('flux.reessayer')}
            </Bouton>
          </div>
        ) : flux.length === 0 ? (
          <EtatVide titre={tm('flux.vide.titre')} texte={tm('flux.vide.texte')} action={null} />
        ) : (
          <ol className="ar-paie__evenements">
            {flux.map((p) => (
              <li key={p.id} className="ar-paie__evt" data-etat={p.etat} data-recent={p.id === recent ? 'oui' : undefined}>
                <button type="button" className="ar-paie__evt-bouton" onClick={() => actions.ouvrir(p)}>
                  <time className="ar-paie__evt-heure ar-montant" dateTime={p.date}>
                    {quand(p.date, aujourdhui, tm, locale)}
                  </time>
                  <span aria-hidden className="ar-paie__evt-noeud" />
                  <span className="ar-paie__evt-corps">
                    <span className="ar-paie__evt-ligne">
                      <span className="ar-paie__evt-client">{p.clientNom}</span>
                      <span className="ar-moyen" aria-hidden>
                        {tm(`badge.${p.moyen}` as CleMotsPaiements)}
                      </span>
                    </span>
                    <span className="ar-paie__evt-ref ar-montant">
                      {p.facture ? `${p.facture} · ` : ''}
                      {tm(`moyen.${p.moyen}` as CleMotsPaiements)}
                    </span>
                    {p.note && <span className="ar-paie__evt-note">{p.note}</span>}
                  </span>
                  <span className="ar-paie__evt-droite">
                    <span className="ar-paie__evt-montant ar-montant" data-barre={p.etat === 'échoué' ? 'oui' : undefined}>
                      {euros(p.montantCents)}
                    </span>
                    <PastilleEtat etat={TON_ETAT[p.etat]}>{tm(`etat.${p.etat}` as CleMotsPaiements)}</PastilleEtat>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      <footer className="ar-paie__pied">
        {echec ? (
          <div className="ar-paie__suggestion">
            <Sparkles aria-hidden size={15} className="ar-paie__suggestion-icone" />
            <p>{tm('flux.suggestion', { client: echec.clientNom })}</p>
            {peutEcrire && (
              <button type="button" className="ar-paie__suggestion-bouton" onClick={() => actions.envoyerLien(echec)} disabled={!enLigne}>
                {tm('flux.envoyerLien')}
              </button>
            )}
          </div>
        ) : (
          <p className="ar-paie__aucun-echec">{tm('flux.aucunEchec')}</p>
        )}
      </footer>
    </section>
  );
}

/* ── Les barres par jour (échelle en racine, MA03) ── */

function Jours({ paiements, mois, aujourdhui, titre, aide }: { paiements: readonly { date: string; montantCents: number; etat: string }[]; mois: Mois; aujourdhui: Jour; titre: string; aide: string }) {
  const [a, m] = mois.split('-').map(Number);
  const n = joursDansMois(a, m);
  const jours = Array.from({ length: n }, (_, i) => {
    const j = `${mois}-${String(i + 1).padStart(2, '0')}`;
    const du = paiements.filter((p) => p.date === j);
    return { j, n: i + 1, valeur: du.filter((p) => p.etat === 'réussi').reduce((s, p) => s + p.montantCents, 0), echec: du.some((p) => p.etat === 'échoué') };
  });
  const max = Math.max(0, ...jours.map((x) => x.valeur));
  return (
    <div className="ar-paie__jours">
      <p className="ar-paie__jours-titre">
        <span>{titre}</span>
        <span className="ar-discret">{aide}</span>
      </p>
      <div className="ar-paie__barres" aria-hidden>
        {jours.map((x) => (
          <span
            key={x.j}
            className="ar-paie__barre"
            data-ton={x.j === aujourdhui ? 'aujourdhui' : x.echec ? 'echec' : undefined}
            data-mvt="pousse"
            style={{ height: Math.max(x.valeur > 0 || x.echec ? 3 : 0, hauteurDeBarre(x.valeur || (x.echec ? max * 0.3 : 0), max)), ['--sc-mvt-rang' as string]: x.n }}
          />
        ))}
      </div>
      <div className="ar-paie__axe ar-montant" aria-hidden>
        {[1, 10, 20, n].map((k) => (
          <span key={k} style={{ left: `${((k - 0.5) / n) * 100}%` }}>
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Les versements ── */

function Versements({ id, versements, mois, aujourdhui, nomMoisAn, nomMois, locale }: { id: string; versements: readonly VersementVu[] | null; mois: Mois; aujourdhui: Jour; nomMoisAn: string; nomMois: string; locale: string }) {
  const { tm } = useMots();
  const debut = lundiDe(`${mois}-01`);
  const cases = Array.from({ length: 42 }, (_, i) => ajouterJours(debut, i));
  const par = new Map((versements ?? []).map((v) => [v.date, v]));
  const verse = (versements ?? []).filter((v) => !v.prevu && v.date.startsWith(mois)).reduce((s, v) => s + v.montantCents, 0);
  const prochain = (versements ?? []).filter((v) => v.prevu && v.date >= aujourdhui).sort((x, y) => x.date.localeCompare(y.date))[0];
  const entetes: CleMotsPaiements[] = ['jours.L', 'jours.Ma', 'jours.Me', 'jours.J', 'jours.V', 'jours.S', 'jours.D'];
  return (
    <section className="ar-carte ar-paie__versements" aria-labelledby={id}>
      <header className="ar-carte__entete">
        <h2 id={id} className="ar-carte__titre">
          {tm('versements.titre')}
        </h2>
        <span className="ar-carte__aside">{nomMoisAn}</span>
      </header>
      <div className="ar-paie__calendrier" role="grid" aria-label={nomMoisAn}>
        <div role="row" className="ar-paie__cal-entetes">
          {entetes.map((c, i) => (
            <span key={i} role="columnheader">
              {tm(c)}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, s) => (
          <div role="row" key={s} className="ar-paie__cal-semaine">
            {cases.slice(s * 7, s * 7 + 7).map((j) => {
              const v = par.get(j);
              return (
                <span
                  key={j}
                  role="gridcell"
                  className="ar-paie__case"
                  data-hors={j.startsWith(mois) ? undefined : 'oui'}
                  data-verse={v && !v.prevu ? 'oui' : undefined}
                  data-prevu={v?.prevu ? 'oui' : undefined}
                  data-aujourdhui={j === aujourdhui ? 'oui' : undefined}
                >
                  <span className="ar-paie__case-jour">{Number(j.slice(8))}</span>
                  {v && <span className="ar-paie__case-montant ar-montant">{formaterEuro(v.montantCents / 100).replace(/\s?€$/, '')}</span>}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ar-paie__recap">
        <div className="ar-paie__boite">
          <span className="ar-paie__boite-titre">{tm('versements.verse', { mois: nomMois.toUpperCase() })}</span>
          <span className="ar-paie__boite-valeur ar-montant">{versements === null ? '--' : euros(verse)}</span>
        </div>
        <div className="ar-paie__boite" data-prevu="oui">
          <span className="ar-paie__boite-titre">{prochain ? formaterDate(`${prochain.date}T12:00:00`, { weekday: 'short', day: 'numeric', month: 'short' }, locale).toUpperCase() : tm('versements.prochain')}</span>
          <span className="ar-paie__boite-valeur ar-montant">{prochain ? euros(prochain.montantCents) : '--'}</span>
        </div>
      </div>
      <p className="ar-paie__legende">
        <span data-cle="verse">{tm('versements.legendeVerse')}</span>
        <span data-cle="prevu">{tm('versements.legendePrevu')}</span>
        <span data-cle="aujourdhui">{tm('versements.legendeAujourdhui')}</span>
      </p>
      {versements === null && <p className="ar-paie__indispo">{tm('versements.indisponible')}</p>}
    </section>
  );
}
