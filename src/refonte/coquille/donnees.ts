import { useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useLangue, libelleNav } from '../../i18n';
import { useAttention } from '../../state/useAttention';
import { useRegards } from '../../state/RegardsContext';
import { useProfilesOptionnel } from '../../state/ProfilesContext';
import { useNavAlleges } from '../../state/useNavAlleges';
import { useNavFavorites } from '../../state/useNavFavorites';
import { toutesLesSections } from '../../data/spaces';
import type { NavItem } from '../../data/navigation';
import { cheminLePlusPrecis } from '../../lib/cheminCourant';
import type { AttentionItem } from '../../lib/attention';
import { traduireSocle } from '../../socle/i18n';
import { familleDeCouleur, type FamilleCouleur } from '../../socle/familles';
import type { FamilleLaterale, ModuleLateral, MiettePain, PersonneEnLigne, SignalLateral } from '../../socle/coquille';
import { REGISTRE_MODULES, vueDuRegistre } from '../modules/registre';
import type { Libelle } from '../modules/declarer';
import { construireFil } from './fil';
import { routeEnsemble } from '../systeme/ensemble';
import { choisirEpingles, choisirLesVisibles, placesDeModules } from './visibles';
import { lignesDeveloppement } from './sousListeDeveloppement';
import { libelleDuLieu } from './lieu';
import { libellePageSysteme, motsPagesSysteme, pageSysteme } from './pagesSysteme';
import { useCompteursDeclares, useSignauxDeclares } from './compteurs';
import type { PageCoquille } from './page';

/**
 * CE QUE LA COQUILLE SAIT — lu dans les accès existants, rien d'inventé.
 * ═════════════════════════════════════════════════════════════════════
 *
 * Les familles viennent du REGISTRE de S5 (`src/refonte/modules/`) : une entrée
 * par module, regroupant ses vues. Seules celles que l'organisation a ouvertes
 * et que la personne n'a pas allégées apparaissent (le catalogue de
 * `toutesLesSections()` le sait déjà). La famille où l'on est montre au plus
 * cinq lignes (§0.1) — « Vue d'ensemble » comprise —, l'entrée courante toujours.
 *
 * Les compteurs (« ce qui attend », par adresse) sont DÉCLARÉS par les lots
 * (`src/refonte/compteurs/<famille>.ts`, ramassés par `compteurs.ts`) : ceux
 * de Ma journée (activité non vue, agenda, tâches, relances, priorités) en sont
 * la première déclaration. Un compteur à zéro ne s'affiche pas.
 *
 * Les ÉPINGLÉS sont les favoris de la personne (`useNavFavorites`, sur ce poste :
 * ceux qu'elle épingle depuis Tous les modules), rangés à leur entrée du
 * registre, sans le module ouvert. CYBER (toujours là) mène aux écrans du bureau
 * Cyber (`/cyber`) ; son compteur est déclaré par `compteurs/cyber.ts` (les
 * alertes ouvertes du SOC), absent tant que la source n'a pas répondu.
 *
 * Le fil d'Ariane et la famille dépliée d'une page hors registre viennent de ce
 * qu'elle dit d'elle (`page.ts`, `pagesSysteme.ts`) ; ceux d'une page du
 * registre, du registre. Jamais d'un segment d'adresse.
 */
export interface DonneesCoquille {
  familles: FamilleLaterale[];
  /** Développement (LOT-11) : toujours là, en dernier dans ESPACE, avec ses deux signaux déclarés. */
  developpement: FamilleLaterale;
  /** La huitième famille, ou `null` quand l'organisation n'a aucun de ses modules. */
  garde: FamilleLaterale | null;
  /** Cyber : toujours là. */
  cyber: FamilleLaterale;
  /** Les modules épinglés par la personne, sans le module ouvert. */
  epingles: ModuleLateral[];
  /** On est sur « Tous les modules ». */
  tousLesModulesActif: boolean;
  /** Le texte de la barre Ajmani que l'écran a donné, s'il en a donné un. */
  texteAjmani?: string;
  nombreModules: number;
  enLigne: PersonneEnLigne[];
  presenceMontree: boolean;
  fil: MiettePain[];
  attention: AttentionItem[];
  attentionEvaluee: boolean;
  /** Les modules ouverts à l'organisation et non allégés. */
  catalogue: NavItem[];
  /** Ce qui attend, par adresse de module (la source des pastilles de la barre latérale). */
  compteurs: Record<string, number>;
  /** La famille dont la coquille pose les couleurs (v4, `--fam-a` / `--fam-b`) : Cyber, la famille active, sinon Système. */
  familleCouleur: FamilleCouleur;
}


/** L'identifiant de Développement au registre (LOT-11) : sa famille de couleurs, sa vue d'ensemble. */
export const ID_DEVELOPPEMENT = 'developpement';

/** Où mène Cyber : l'accueil du bureau Cyber (ses écrans vivent dans la coquille de son bureau). */
export const ROUTE_CYBER = '/cyber';

export function useDonneesCoquille(pathname: string, pageDeclaree: PageCoquille | null): DonneesCoquille {
  const { langue } = useLangue();
  const { user } = useAuth();
  const moi = (user?.email ?? '').toLowerCase();
  const alleges = useNavAlleges();
  const { favorites } = useNavFavorites();
  const { autres, montree } = useRegards();
  const profils = useProfilesOptionnel();
  const { items: attention, checkedAt } = useAttention();
  /* ── Les compteurs, par adresse : ce que les lots déclarent ── */
  const compteurs = useCompteursDeclares();
  // Cyber : `null` tant que rien n'est déclaré (la source n'a pas répondu), jamais un zéro inventé.
  const alertesCyber = Object.hasOwn(compteurs, ROUTE_CYBER) ? compteurs[ROUTE_CYBER] : null;
  // Développement : ses deux signaux, `null` tant que son lot n'a rien déclaré (jamais un zéro inventé).
  const { deploiementsEnCours, testsEnEchec } = useSignauxDeclares();

  const nomDe = useCallback(
    (e: string) => {
      const p = profils?.profileFor(e);
      return p?.name?.trim() || e.split('@')[0];
    },
    [profils],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const catalogue = useMemo(() => toutesLesSections().flatMap((s) => s.items), [alleges]);
  const cheminCourant = useMemo(() => cheminLePlusPrecis(pathname, catalogue), [pathname, catalogue]);

  return useMemo(() => {
    const dire = (l: Libelle) => l[langue];
    const ts = (cle: Parameters<typeof traduireSocle>[1], params?: Record<string, string | number>) => traduireSocle(langue, cle, params);

    /* ── Ce que la page dit d'elle : déclaré par la page, sinon la table des pages système ── */
    const page = pageDeclaree ?? pageSysteme(pathname, motsPagesSysteme(langue));
    // `undefined` : la page ne dit rien de sa famille (le registre décide) ; `null` : aucune famille dépliée.
    const famillePage = page && page.famille !== undefined ? page.famille : undefined;
    const sousPage = page?.sousPage ?? null;
    const parPage = famillePage !== undefined;

    /* ── Les familles, d'après le registre ── */
    const ouverts = new Map(catalogue.map((i) => [i.key, i]));
    const parEntree = new Map<string, ModuleLateral>();
    // Les mêmes, avec leur niveau : la sous-liste « Développement » reprend des vues d'autres familles (§1.19 n° 1).
    const parEntreeNiveau = new Map<string, ModuleLateral & { avance: boolean; niveau: string }>();
    const toutes = REGISTRE_MODULES.familles.map((famille) => {
      const entrees = famille.entrees
        .map((entree) => ({ entree, vues: entree.vues.flatMap((v) => ouverts.get(v.id) ?? []) }))
        .filter((e) => e.vues.length > 0);
      const modules: (ModuleLateral & { avance: boolean; niveau: string })[] = entrees.map(({ entree, vues }) => {
        const badge = vues.reduce((n, v) => n + (compteurs[v.to] ?? 0), 0);
        const courant = parPage ? famillePage === famille.id && sousPage === entree.id : vues.some((v) => v.to === cheminCourant);
        const m = {
          cle: entree.id,
          libelle: entree.nom ? dire(entree.nom) : libelleNav(vues[0]),
          vers: vues[0].to,
          badge,
          courant,
          famille: famille.id,
          avance: entree.niveau === 'avance',
          niveau: entree.niveau,
        };
        parEntree.set(entree.id, { cle: m.cle, libelle: m.libelle, vers: m.vers, badge: m.badge, courant: m.courant, famille: m.famille });
        parEntreeNiveau.set(entree.id, m);
        return m;
      });
      /* La première ligne : « Vue d'ensemble », sauf pour Ma journée (son Accueil en tient lieu). Quand la vue
         d'ensemble EST l'adresse d'un module de la famille (la salle de La Garde), ce module n'est pas listé deux fois. */
      const versEnsemble = famille.id === 'jour' ? null : routeEnsemble(famille.id);
      const sansDoublon = modules.filter((m) => m.vers !== versEnsemble);
      const montres = choisirLesVisibles(sansDoublon, placesDeModules(Boolean(versEnsemble)));
      const ensembleCourant = parPage ? famillePage === famille.id && sousPage === 'ensemble' : cheminCourant === versEnsemble || pathname === versEnsemble;
      const ensemble: ModuleLateral | undefined = versEnsemble ? { cle: `ensemble-${famille.id}`, libelle: '', vers: versEnsemble, badge: 0, courant: ensembleCourant } : undefined;
      const active = parPage ? famillePage === famille.id : modules.some((m) => m.courant) || Boolean(ensemble?.courant);
      return {
        entrees: entrees.length,
        /* Tous les modules de la famille, avant le choix des cinq lignes (la sous-liste « Développement » les range). */
        tous: sansDoublon,
        lateral: {
          cle: famille.id,
          nom: dire(famille.nom),
          famille: famille.teinte,
          modules: montres.map((m) => ({ cle: m.cle, libelle: m.libelle, vers: m.vers, badge: m.badge, courant: m.courant })),
          badge: montres.reduce((n, m) => n + m.badge, 0),
          active,
          ensemble,
          autres: sansDoublon.length - montres.length,
        } satisfies FamilleLaterale,
        amnSeulement: famille.amnSeulement,
        nomCourt: famille.amnSeulement ? ts('coquille.garde.court') : dire(famille.nom),
      };
    });
    const familles = toutes.filter((f) => !f.amnSeulement && f.lateral.cle !== ID_DEVELOPPEMENT && f.lateral.modules.length > 0).map((f) => f.lateral);

    /* ── Développement : toujours là, juste au-dessus de SURVEILLANCE, déplié sur ses écrans ──
       Ses modules viennent du registre quand LOT-11 y déclare la famille `developpement` ; d'ici là, sa vue
       d'ensemble seule (`/ensemble/developpement`, que LOT-11 remplace par substitution). */
    const signaux: SignalLateral[] = [
      ...(deploiementsEnCours ? [{ cle: 'deploiements', n: deploiementsEnCours, ton: 'info' as const, enCours: true, libelle: ts('coquille.developpement.deploiements', { n: deploiementsEnCours }) }] : []),
      ...(testsEnEchec ? [{ cle: 'tests', n: testsEnEchec, ton: 'critique' as const, libelle: ts('coquille.developpement.tests', { n: testsEnEchec }) }] : []),
    ];
    const devRegistre = toutes.find((f) => f.lateral.cle === ID_DEVELOPPEMENT);
    const versDev = routeEnsemble(ID_DEVELOPPEMENT);
    const devEnsembleCourant = parPage ? famillePage === ID_DEVELOPPEMENT && sousPage === 'ensemble' : pathname === versDev;
    /* Ses lignes : ses modules (LOT-11) et les vues reprises d'autres familles, dans l'ordre de l'image. Une vue
       reprise n'est jamais « courante » par sa famille d'origine (une seule ligne allumée dans la barre) ; elle
       l'est quand la page se déclare dans Développement avec elle pour sous-page. */
    const propresDev = devRegistre?.tous ?? [];
    const reprise = (cleVue: string) => {
      const v = vueDuRegistre(cleVue);
      const m = v ? parEntreeNiveau.get(v.entree) : undefined;
      if (!m || m.famille === ID_DEVELOPPEMENT) return undefined;
      return { ...m, courant: parPage && famillePage === ID_DEVELOPPEMENT && sousPage === m.cle };
    };
    const lignesDev = lignesDeveloppement(propresDev, reprise);
    const montresDev = choisirLesVisibles(lignesDev, placesDeModules(true));
    const developpement: FamilleLaterale = {
      cle: ID_DEVELOPPEMENT,
      nom: ts('coquille.developpement'),
      famille: 'outils',
      modules: montresDev.map((m) => ({ cle: m.cle, libelle: m.libelle, vers: m.vers, badge: m.badge, courant: m.courant })),
      badge: montresDev.reduce((n, m) => n + m.badge, 0),
      active: parPage ? famillePage === ID_DEVELOPPEMENT : propresDev.some((m) => m.courant) || devEnsembleCourant,
      ensemble: { cle: `ensemble-${ID_DEVELOPPEMENT}`, libelle: '', vers: versDev, badge: 0, courant: devEnsembleCourant },
      autres: lignesDev.length - montresDev.length,
      signaux,
    };
    const gardeTrouvee = toutes.find((f) => f.amnSeulement && f.lateral.modules.length > 0);
    // « La Garde » en barre latérale (§0.1) : le nom court, jamais tronqué (écart C6).
    const gardeFam = gardeTrouvee ? { ...gardeTrouvee.lateral, nom: gardeTrouvee.nomCourt } : null;
    const nombreModules = toutes.reduce((n, f) => n + f.entrees, 0);

    /* ── Cyber : toujours là ── */
    const surCyber = pathname === ROUTE_CYBER || pathname.startsWith(`${ROUTE_CYBER}/`);
    const cyber: FamilleLaterale = {
      cle: 'cyber',
      nom: ts('coquille.cyber'),
      famille: 'outils',
      modules: [],
      badge: 0,
      active: surCyber,
      vers: ROUTE_CYBER,
      compteur: alertesCyber,
      compteurAide: alertesCyber ? ts('coquille.cyber.alertes', { n: alertesCyber }) : undefined,
    };

    /* ── Les épinglés : les favoris de la personne, rangés à leur entrée ── */
    const epingles = choisirEpingles(favorites, (cle) => {
      const v = vueDuRegistre(cle);
      return v ? parEntree.get(v.entree) : undefined;
    });

    /* ── Qui est en ligne, et où (le libellé du module, jamais l'adresse) ── */
    const lieu = (chemin: string) => libelleDuLieu(chemin, catalogue, (c) => libellePageSysteme(c, langue));
    const enLigne: PersonneEnLigne[] = montree
      ? [
          { cle: moi || 'moi', nom: nomDe(moi), lieu: lieu(pathname) },
          ...autres.filter((r) => !r.parti).map((r) => ({ cle: r.email, nom: nomDe(r.email), lieu: lieu(r.module) })),
        ]
      : [];

    /* ── Le fil d'Ariane : « Famille / Page » ── */
    const familleActive = toutes.find((f) => f.lateral.active);
    const courant = catalogue.find((i) => i.to === cheminCourant);
    const nomFamille = (id: string | null | undefined) => (id === ID_DEVELOPPEMENT ? developpement.nom : id ? toutes.find((f) => f.lateral.cle === id)?.nomCourt ?? null : null);
    const fil = construireFil(
      page
        ? { page: { famille: nomFamille(page.famille), miettes: page.miettes }, espace: ts('coquille.section.espace') }
        : {
            famille: familleActive?.nomCourt ?? (developpement.active ? developpement.nom : null),
            module: courant ? libelleNav(courant) : (familleActive?.lateral.ensemble?.courant ?? developpement.ensemble?.courant) ? ts('coquille.ensemble') : null,
            espace: ts('coquille.section.espace'),
          },
    );

    return {
      familleCouleur: familleDeCouleur(surCyber, developpement.active ? ID_DEVELOPPEMENT : familleActive?.lateral.cle ?? page?.famille),
      familles,
      developpement,
      garde: gardeFam,
      cyber,
      epingles,
      tousLesModulesActif: Boolean(page?.tousLesModules),
      texteAjmani: page?.ajmani,
      nombreModules,
      enLigne,
      presenceMontree: montree,
      fil,
      attention,
      attentionEvaluee: checkedAt !== null,
      catalogue,
      compteurs,
    };
  }, [langue, catalogue, cheminCourant, compteurs, moi, autres, montree, nomDe, pathname, attention, checkedAt, pageDeclaree, favorites, alertesCyber, deploiementsEnCours, testsEnEchec]);
}
