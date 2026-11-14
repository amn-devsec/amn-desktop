import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code2, Coins, DatabaseBackup, LayoutTemplate, ListChecks, Plug, Rocket, Server, ShieldCheck, Workflow, Zap, Check, X, Minus } from 'lucide-react';
import { ModuleTile, Bouton, AnneauProgression } from '../../socle/ui';
import { formaterEuro } from '../../socle/formats';
import { ROUTE_TOUS_LES_MODULES } from '../navigation/moment';
import { CarteDev, ListeARegarder, PageDev, Point, type TonPoint } from './briques';
import { dateEtHeure, debutDeSemaineParis, hhmm, partiesParis } from './commun';
import { enLigne, etatGlobal, nomCible, planifies as planifiesAVenir, resumeSemaine, type Cible, type Deploiement as DeploiementLogique } from './deploiements';
import { useDonneesDeveloppement } from './donnees';
import { dire, direCompte } from './i18n';
import { compteursDuJour, executionsDuMois, resumeFlux } from './journal';
import { aRegarder, commitsDeLaSemaine, partFaiteSeul, payeDuMois, reussisDeLaSemaine, semainesAvantPlein, texteDuree } from './vues';
import { ROUTES_DEV } from './routes';

/**
 * DEV-ensemble · DÉVELOPPEMENT, VUE D'ENSEMBLE — le 8e hub (`/ensemble/developpement`).
 *
 * Fiche : `docs/refonte/fiches/LOT-11/DEV-ensemble.md` (validée par Harun le 12 nov., sans image). La chaîne de
 * mise en ligne (Code, Déploiements, En ligne, Serveur), « À regarder aujourd'hui », « Ce qui tourne seul », puis
 * les 12 modules de l'espace en 4 groupes. Tout vient des mêmes calculs que les écrans du lot.
 */

const L = 'fr' as const;
/** Un jeton par poste à l'écran (la fiche dit « deux au plus ») : la page tient au-dessus de la barre Ajmani. */
const JETONS_MONTRES = 1;

interface Jeton {
  cle: string;
  ton: TonPoint;
  texte: string;
  droite?: string;
  vers?: string;
}

interface Poste {
  cle: string;
  nom: string;
  chiffre: string;
  libelle: string;
  ton: TonPoint;
  vers: string;
  jetons: Jeton[];
}

export default function VueDEnsemble() {
  const d = useDonneesDeveloppement();
  const aller = useNavigate();
  const branche = d.source === 'exemple';
  const m = d.maintenant;

  const vue = useMemo(() => {
    const deps = d.deploiements as unknown as DeploiementLogique[];
    const semaine = resumeSemaine(deps, m, L);
    const enLigneMaintenant = enLigne(deps, m, L);
    const aVenir = planifiesAVenir(d.planifies.map((p) => ({ id: p.id, depot: p.depot, quoi: p.quoi, cible: p.cible, a: p.prevuA })), m, L).aVenir;
    const echecs = d.depots.filter((x) => x.tests.etat === 'echec');
    const enMarche = d.services.filter((s) => s.etat === 'en marche').length;
    const regarder = aRegarder({ depots: d.depots, deploiements: deps, services: d.services, ouverts: d.ticketsOuverts, bloquants: d.ticketsBloquants, maintenant: m }, L);
    const dernier = [...deps].filter((x) => +new Date(x.lanceA) <= m).sort((a, b) => +new Date(b.lanceA) - +new Date(a.lanceA))[0];
    const srv = d.serveur;
    const disquePct = srv ? Math.round((srv.disqueUtiliseGo / srv.disqueTotalGo) * 100) : null;
    const plein = srv ? semainesAvantPlein(srv.disqueTotalGo, srv.disqueUtiliseGo, srv.croissanceDisqueGoParSemaine) : null;
    const { reussis, total } = reussisDeLaSemaine(deps, debutDeSemaineParis(m), m);
    return { semaine, enLigneMaintenant, aVenir, echecs, enMarche, regarder, dernier, srv, disquePct, plein, reussis, total };
  }, [d, m]);

  const tonDeploiement = (x: DeploiementLogique | undefined): TonPoint => {
    if (!x) return 'neutre';
    const e = etatGlobal(x);
    return e === 'reussi' ? 'succes' : e === 'echec' ? 'critique' : e === 'en-cours' ? 'info' : 'neutre';
  };

  const postes: Poste[] = [
    {
      cle: 'code',
      nom: dire(L, 'ens.poste.code'),
      chiffre: branche ? String(d.depots.length) : '—',
      libelle: dire(L, 'ens.lib.code'),
      ton: !branche ? 'neutre' : vue.echecs.length ? 'attention' : 'succes',
      vers: ROUTES_DEV.projets,
      jetons: branche
        ? [
            ...(vue.echecs[0] ? [{ cle: 'echec', ton: 'attention' as const, texte: `${vue.echecs[0].nom} · ${direCompte(L, 'depot.testsEchec', Math.max(1, vue.echecs[0].tests.echecs))}`, vers: ROUTES_DEV.projets }] : []),
            { cle: 'commits', ton: 'info' as const, texte: dire(L, 'ens.commitsSemaine', { n: commitsDeLaSemaine(d.depots) }), vers: ROUTES_DEV.projets },
          ].slice(0, 2)
        : [],
    },
    {
      cle: 'deploiements',
      nom: dire(L, 'ens.poste.deploiements'),
      chiffre: branche ? String(vue.semaine.total) : '—',
      libelle: dire(L, 'ens.lib.deploiements'),
      ton: !branche ? 'neutre' : vue.semaine.echecs ? 'critique' : 'succes',
      vers: ROUTES_DEV.deploiements,
      jetons: branche
        ? [
            ...(vue.dernier
              ? [{ cle: 'dernier', ton: tonDeploiement(vue.dernier), texte: `${dire(L, 'deploiement.vers', { depot: vue.dernier.depot, cible: nomCible(vue.dernier.cible as Cible, L) })}`, vers: ROUTES_DEV.deploiements }]
              : []),
            ...(vue.aVenir.length
              ? [{ cle: 'planifies', ton: 'info' as const, texte: direCompte(L, 'ens.planifies', vue.aVenir.length, { quand: dateEtHeure(vue.aVenir[0].a, L) }), vers: ROUTES_DEV.deploiements }]
              : []),
          ]
        : [],
    },
    {
      cle: 'enLigne',
      nom: dire(L, 'ens.poste.enLigne'),
      chiffre: branche ? String(vue.enLigneMaintenant.length) : '—',
      libelle: dire(L, 'ens.lib.enLigne'),
      ton: !branche ? 'neutre' : 'succes',
      vers: ROUTES_DEV.deploiements,
      jetons: vue.enLigneMaintenant.slice(0, 2).map((x) => ({ cle: `${x.depot}:${x.cible}`, ton: 'succes' as const, texte: `${x.depot} · ${nomCible(x.cible, L)}`, droite: x.age, vers: ROUTES_DEV.deploiements })),
    },
    {
      cle: 'serveur',
      nom: dire(L, 'ens.poste.serveur'),
      chiffre: vue.srv && d.services.length ? dire(L, 'ens.m.services', { a: vue.enMarche, t: d.services.length }) : '—',
      libelle: dire(L, 'ens.lib.serveur'),
      ton: !vue.srv ? 'neutre' : vue.enMarche < d.services.length ? 'attention' : 'succes',
      vers: ROUTES_DEV.serveur,
      jetons: vue.srv
        ? [
            ...(vue.disquePct !== null
              ? [{ cle: 'disque', ton: 'info' as const, texte: vue.plein !== null ? dire(L, 'ens.disque', { p: vue.disquePct, duree: texteDuree(vue.plein, L) }) : `${vue.disquePct} %` }]
              : []),
            ...(vue.srv.sauvegardes.derniereCopieAt
              ? [
                  {
                    cle: 'copie',
                    ton: (vue.srv.sauvegardes.derniereCopieReussie ? 'succes' : 'critique') as TonPoint,
                    texte: dire(L, 'ens.copie', {
                      heure: hhmm(partiesParis(vue.srv.sauvegardes.derniereCopieAt).minutes),
                      etat: dire(L, vue.srv.sauvegardes.derniereCopieReussie ? 'ens.copieReussie' : 'ens.copieEchouee'),
                    }),
                  },
                ]
              : []),
          ].map((j) => ({ ...j, vers: ROUTES_DEV.serveur }))
        : [],
    },
  ];

  const flux = resumeFlux(d.automatisations, L);
  const execMois = executionsDuMois(d.executions, m);
  const part = partFaiteSeul(d.connecteurs);
  const paye = payeDuMois(d.connecteurs);
  const echecsTests = vue.echecs.length;
  const totalTickets = d.ticketsOuverts.size;
  const dernierCopie = vue.srv?.sauvegardes;

  const sous = !branche
    ? dire(L, 'ens.nonBranche')
    : [
    direCompte(L, 'projets.suivis', d.depots.length),
    echecsTests ? direCompte(L, 'projets.echecs', echecsTests) : dire(L, 'projets.toutVert'),
    !vue.srv ? dire(L, 'ens.serveurABrancher') : vue.enMarche < d.services.length ? dire(L, 'ens.serveurAttention') : dire(L, 'ens.serveurBien'),
      ].join(' · ');

  const groupes: { cle: string; nom: string; tuiles: { nom: string; icone: React.ReactNode; vers: string; sous?: string }[] }[] = [
    {
      cle: 'construire',
      nom: dire(L, 'ens.groupe.construire'),
      tuiles: [
        { nom: dire(L, 'ens.module.projets'), icone: <Code2 size={14} />, vers: ROUTES_DEV.projets, sous: branche ? (echecsTests ? direCompte(L, 'ens.m.echecs', echecsTests) : dire(L, 'ens.m.vert')) : dire(L, 'ens.m.aBrancher') },
        { nom: dire(L, 'ens.module.modeles'), icone: <LayoutTemplate size={14} />, vers: ROUTES_DEV.modeles },
        { nom: dire(L, 'ens.module.tickets'), icone: <ListChecks size={14} />, vers: '/tasks', sous: branche ? direCompte(L, 'regarder.ouverts', totalTickets) : undefined },
        { nom: dire(L, 'ens.module.connaissances'), icone: <BookOpen size={14} />, vers: '/knowledge' },
      ],
    },
    {
      cle: 'mettreEnLigne',
      nom: dire(L, 'ens.groupe.mettreEnLigne'),
      tuiles: [
        { nom: dire(L, 'ens.module.deploiements'), icone: <Rocket size={14} />, vers: ROUTES_DEV.deploiements, sous: branche ? direCompte(L, 'ens.m.planifies', vue.aVenir.length) : dire(L, 'ens.m.aBrancher') },
        { nom: dire(L, 'ens.module.serveur'), icone: <Server size={14} />, vers: ROUTES_DEV.serveur, sous: vue.srv ? dire(L, 'ens.m.services', { a: vue.enMarche, t: d.services.length }) : dire(L, 'ens.m.aBrancher') },
        {
          nom: dire(L, 'ens.module.sauvegardes'),
          icone: <DatabaseBackup size={14} />,
          vers: '/outils/donnees',
          sous: dernierCopie?.derniereCopieAt ? dire(L, dernierCopie.derniereCopieReussie ? 'ens.copieReussie' : 'ens.copieEchouee') : undefined,
        },
      ],
    },
    {
      cle: 'automatiser',
      nom: dire(L, 'ens.groupe.automatiser'),
      tuiles: [
        { nom: dire(L, 'ens.module.editeur'), icone: <Workflow size={14} />, vers: ROUTES_DEV.editeur, sous: d.automatisations.length ? dire(L, 'ens.m.actifs', { a: flux.actifs, t: flux.total }) : undefined },
        { nom: dire(L, 'ens.module.automatisations'), icone: <Zap size={14} />, vers: '/outils/automatisations', sous: d.executions.length ? dire(L, 'ens.m.aujourdhui', { n: compteursDuJour(d.executions, m).tout }) : undefined },
        { nom: dire(L, 'ens.module.connecteurs'), icone: <Plug size={14} />, vers: '/settings' },
      ],
    },
    {
      cle: 'payer',
      nom: dire(L, 'ens.groupe.payer'),
      tuiles: [
        { nom: dire(L, 'ens.module.couts'), icone: <Coins size={14} />, vers: ROUTES_DEV.couts, sous: d.connecteurs.length ? dire(L, 'ens.m.payeSur', { paye: formaterEuro(paye / 100) }) : undefined },
        { nom: dire(L, 'ens.module.coffre'), icone: <ShieldCheck size={14} />, vers: '/vault' },
      ],
    },
  ];

  const iconeNoeud = (ton: TonPoint) => (ton === 'succes' ? <Check size={14} strokeWidth={2.5} /> : ton === 'critique' ? <X size={14} strokeWidth={2.5} /> : <Minus size={14} strokeWidth={2.5} />);

  return (
    <PageDev
      titre={dire(L, 'ens.titre')}
      sousTitre={sous}
      source={d.source}
      secondaires={[{ libelle: dire(L, 'ens.personnaliser'), onClick: () => undefined, disabled: true, infobulle: dire(L, 'ens.personnaliser') }]}
      primaire={{ libelle: dire(L, 'deps.deployer'), icone: <Rocket size={15} />, onClick: () => aller(ROUTES_DEV.deploiements), disabled: !branche }}
    >
      <CarteDev
        className="dv-ens-chaine"
        titre={
          <>
            {dire(L, 'ens.chaine')} <span className="dv-ens-chaine__sous">{dire(L, 'ens.chaineSous')}</span>
          </>
        }
        droite={branche ? dire(L, 'ens.pied', { r: vue.reussis, n: vue.total }) : dire(L, 'ens.aBrancher')}
        rang={0}
      >
        <div className="dv-ens-postes">
          <span aria-hidden className="dv-ens-tapis" />
          {postes.map((p) => (
            <div key={p.cle} className="dv-ens-poste">
              <span className="dv-ens-noeud" data-ton={p.ton} aria-hidden>
                {iconeNoeud(p.ton)}
              </span>
              <button type="button" className="dv-ens-poste__nom" onClick={() => aller(p.vers)}>
                {p.nom}
              </button>
              <span className="dv-ens-poste__chiffre">{p.chiffre}</span>
              <span className="dv-ens-poste__lib">{p.libelle}</span>
              {p.jetons.length === 0 && (
                <span className="dv-ens-jeton" data-vide="">
                  <span className="dv-ens-jeton__texte">{dire(L, 'ens.aBrancher')}</span>
                </span>
              )}
              {p.jetons.slice(0, JETONS_MONTRES).map((j) => (
                <button key={j.cle} type="button" className="dv-ens-jeton" onClick={() => j.vers && aller(j.vers)}>
                  <Point ton={j.ton} />
                  <span className="dv-ens-jeton__texte">{j.texte}</span>
                  {j.droite && <span className="dv-mono dv-t4">{j.droite}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </CarteDev>

      <div className="dv-ens-milieu">
        <CarteDev titre={dire(L, 'regarder.titre')} droite={vue.regarder.length ? direCompte(L, 'commun.points', vue.regarder.length) : undefined} rang={1}>
          <ListeARegarder
            libelleOuvrir={dire(L, 'commun.ouvrir')}
            vide={dire(L, 'regarder.vide')}
            points={vue.regarder.slice(0, 3).map((r) => ({
              cle: r.cle,
              ton: r.ton,
              nom: r.nom,
              texte: r.texte,
              ouvrir: () => aller(r.vers.ecran === 'tickets' ? '/tasks' : ROUTES_DEV[r.vers.ecran]),
            }))}
          />
        </CarteDev>
        <CarteDev titre={dire(L, 'ens.toutSeul')} rang={2}>
          <div className="dv-ens-seul">
            <button type="button" className="dv-ens-seul__bloc" onClick={() => aller(ROUTES_DEV.editeur)}>
              <AnneauProgression valeur={flux.total ? flux.actifs / flux.total : 0} libelle={flux.texte} taille={56} epaisseur={5} ton="info" />
              <span>
                <span className="dv-ens-seul__grand">
                  {dire(L, 'ens.flux', { a: flux.actifs, t: flux.total })}
                </span>
                <span className="dv-ens-seul__petit">{direCompte(L, 'flux.executionsMois', execMois)}</span>
              </span>
            </button>
            <button type="button" className="dv-ens-seul__bloc" onClick={() => aller(ROUTES_DEV.couts)}>
              <span>
                <span className="dv-ens-seul__grand">
                  {part === null ? '—' : dire(L, 'ens.partLocale', { p: part })}
                </span>
                <span className="dv-ens-seul__petit">{d.connecteurs.length ? dire(L, 'ens.paye', { paye: formaterEuro(paye / 100) }) : dire(L, 'ens.aBrancher')}</span>
              </span>
            </button>
          </div>
        </CarteDev>
      </div>

      <CarteDev
        className="dv-ens-modules"
        titre={dire(L, 'ens.modules')}
        droite={
          <Bouton variante="discret" taille="petit" onClick={() => aller(ROUTE_TOUS_LES_MODULES)}>
            {dire(L, 'ens.tousModules')}
          </Bouton>
        }
        rang={3}
      >
        <div className="dv-ens-groupes">
          {groupes.map((g) => (
            <div key={g.cle} className="dv-ens-groupe">
              <h3 className="dv-ens-groupe__nom">{g.nom}</h3>
              {g.tuiles.map((t) => (
                <ModuleTile key={t.nom} nom={t.nom} icone={t.icone} sousTexte={t.sous} vers={t.vers} famille="outils" />
              ))}
            </div>
          ))}
        </div>
      </CarteDev>
    </PageDev>
  );
}
