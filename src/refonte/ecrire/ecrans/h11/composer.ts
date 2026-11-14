import { jourDe, type Instant, type Jour, type Langue } from '../../commun';
import { aRenouvelerBientot, etatDeLigne, intercalaires, jaugeEspace, listeParAnnee, type DemandeLiee, type EtatDeLigne, type FichierMin } from '../../documents';
import { dire, direCompte } from '../../i18n';
import { traduire } from './i18n';
import type { GroupeDoc, LigneDoc, OngletDoc, VueDocumentsProps } from './VueDocuments';

/**
 * H11 — COMPOSER LA VUE de Documents : les intercalaires, la liste du type choisi rangée par année, les états de ligne,
 * l'espace utilisé. Logique pure : les règles viennent de `../../documents.ts`. Le document ouvert (aperçu, faits,
 * versions) est donné par l'appelant, qui connaît le détail du fichier.
 */

export interface FichierRange extends FichierMin {
  extension: string;
  /** La ligne sous le nom : « Menna Conseil · 28 oct. ». */
  sous: string;
  demande?: DemandeLiee | null;
  /** Fin de préavis d'un contrat : « À renouveler » quand elle approche. */
  echeance?: Jour | null;
}

export interface EntreesDocuments {
  langue: Langue;
  maintenant: Instant;
  fichiers: readonly FichierRange[];
  /** Les intercalaires du métier, montrés même vides. */
  types: readonly string[];
  type: string;
  selection: string | null;
  recherche: string;
  utiliseOctets: number;
  quotaOctets: number;
  octetsLisibles: (n: number) => string;
}

const LIGNES: Record<Exclude<EtatDeLigne, null>, { cle: 'ligne.signe' | 'ligne.aSigner' | 'ligne.envoye' | 'ligne.aRenouveler'; ton: 'succes' | 'attention' | 'neutre' }> = {
  signe: { cle: 'ligne.signe', ton: 'succes' },
  'a-signer': { cle: 'ligne.aSigner', ton: 'attention' },
  envoye: { cle: 'ligne.envoye', ton: 'neutre' },
  'a-renouveler': { cle: 'ligne.aRenouveler', ton: 'attention' },
};

export function composerDocuments(e: EntreesDocuments): Pick<VueDocumentsProps, 'sousTitre' | 'onglets' | 'ongletActif' | 'liste'> & { renouveler: number } {
  const aujourdhui = jourDe(e.maintenant);
  const filtres = e.recherche.trim() ? e.fichiers.filter((f) => f.nom.toLowerCase().includes(e.recherche.trim().toLowerCase())) : e.fichiers;
  const inter = intercalaires(e.fichiers, e.types);
  const onglets: OngletDoc[] = inter.visibles.map((i) => ({ cle: i.type, libelle: i.type, compteur: i.compteur }));
  const type = onglets.some((o) => o.cle === e.type) ? e.type : (onglets[0]?.cle ?? e.type);
  const liste = listeParAnnee(filtres, type);
  const parId = new Map(e.fichiers.map((f) => [f.id, f]));
  const renouveler = e.fichiers.filter((f) => f.typeMetier === type && !f.archive && !f.supprimeeLe && aRenouvelerBientot(f.echeance ?? null, aujourdhui)).length;
  const groupes: GroupeDoc[] = liste.groupes.map((g) => ({
    annee: g.annee,
    compteur: g.compteur,
    lignes: g.fichiers.map<LigneDoc>((f) => {
      const r = parId.get(f.id) as FichierRange;
      const ligne = etatDeLigne(r.demande ?? null, r.echeance ?? null, aujourdhui);
      const l = ligne ? LIGNES[ligne] : null;
      return { id: f.id, nom: f.nom, sous: r.sous, extension: r.extension, etat: l ? { libelle: dire(e.langue, l.cle), ton: l.ton } : null, actif: f.id === e.selection };
    }),
  }));
  const compteur = onglets.find((o) => o.cle === type)?.compteur ?? 0;
  const sous = [direCompte(e.langue, 'file.documents', compteur), renouveler > 0 ? direCompte(e.langue, 'ligne.aRenouvelerBientot', renouveler) : null].filter(Boolean).join(' · ');
  const jauge = jaugeEspace(e.utiliseOctets, e.quotaOctets);
  return {
    sousTitre: '',
    onglets,
    ongletActif: type,
    renouveler,
    liste: {
      titre: type,
      sous,
      tri: '',
      groupes,
      autres: liste.autres > 0 ? traduire(e.langue, liste.autres <= 1 ? 'liste.autres.1' : 'liste.autres.n', { n: liste.autres }) : null,
      onChoisir: () => undefined,
      espace: e.quotaOctets > 0 ? { libelle: traduire(e.langue, 'espace.sur', { u: e.octetsLisibles(e.utiliseOctets), q: e.octetsLisibles(e.quotaOctets) }), pourcent: jauge.pourcent, ton: jauge.ton } : null,
    },
  };
}
