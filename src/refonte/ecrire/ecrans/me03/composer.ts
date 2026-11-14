import type { Langue } from '../../commun';
import { bibliotheque, extraireVariables, remplir, remplies, tauxDUsage, type VariableDeModele } from '../../modeles';
import { traduire } from './i18n';
import type { CarteModele, VueModelesProps } from './VueModeles';

/**
 * ME03 — COMPOSER LA VUE des Modèles : la galerie (usage du mois, barre relative au plus utilisé), le modèle ouvert et ses
 * variables `{nom}`, la bibliothèque. Logique pure : les règles viennent de `../../modeles.ts`. Une variable sans valeur
 * reste visible : on ne copie jamais un texte à trous sans le dire.
 */

export interface ModeleDuTexte {
  id: string;
  nom: string;
  contenu: string;
  /** Utilisations du mois (« Utilisé 31 fois ce mois »). */
  usages: number;
  /** Source connue de chaque variable (fiche client, automatique…). Absente : « à saisir ». */
  sources?: Readonly<Record<string, VariableDeModele['source']>>;
}
export interface EntreesModeles {
  langue: Langue;
  modeles: readonly ModeleDuTexte[];
  choisi: string | null;
  /** Les valeurs saisies pour les variables du modèle ouvert. */
  valeurs: Readonly<Record<string, string>>;
  /** Modèles recommandés pour le métier, s'ils sont connus : « 24 sur 30 ». */
  recommandes: readonly string[] | null;
}

/** Les largeurs des lignes de la miniature : un dessin de la longueur du contenu, jamais son texte. */
export function lignesDeMiniature(contenu: string): number[] {
  const mots = contenu.split(/\s+/).filter(Boolean).length;
  const n = Math.max(3, Math.min(8, Math.round(mots / 8)));
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? 45 : 70 + ((i * 17) % 30)));
}

export function composerModeles(e: EntreesModeles): Pick<VueModelesProps, 'sousTitre' | 'cartes' | 'bibliotheque'> & { courant: ModeleDuTexte | null; variables: VariableDeModele[]; resultat: string; restantes: number } {
  const l = e.langue;
  const triees = [...e.modeles].sort((a, b) => b.usages - a.usages || a.nom.localeCompare(b.nom, l));
  const plus = triees[0]?.usages ?? 0;
  const courant = e.modeles.find((m) => m.id === e.choisi) ?? triees[0] ?? null;
  const cartes: CarteModele[] = triees.map((m) => ({
    id: m.id,
    nom: m.nom,
    usage: m.usages > 0 ? traduire(l, m.usages <= 1 ? 'usage.1' : 'usage.n', { n: m.usages }) : traduire(l, 'usage.jamais'),
    taux: tauxDUsage(m.usages, plus),
    actif: m.id === courant?.id,
    lignes: lignesDeMiniature(m.contenu),
  }));
  const variables: VariableDeModele[] = courant ? extraireVariables(courant.contenu).map((nom) => ({ nom, source: courant.sources?.[nom] ?? 'à saisir' })) : [];
  const resultat = courant ? remplir(courant.contenu, e.valeurs) : '';
  const restantes = courant ? extraireVariables(resultat).length : 0;
  const biblio = e.recommandes ? bibliotheque(e.modeles.map((m) => m.nom), e.recommandes) : null;
  return {
    sousTitre: e.modeles.length ? traduire(l, 'sousTitre', { n: e.modeles.length }) : traduire(l, 'sousTitreVide'),
    cartes,
    bibliotheque: biblio ? { libelle: `${traduire(l, 'biblio')} ${traduire(l, 'biblio.valeur', { a: biblio.presents, b: biblio.sur })}`, pourcent: biblio.pourcent } : null,
    courant,
    variables,
    resultat,
    restantes,
  };
}

/** L'en-tête du modèle ouvert : « 8 variables · 7 remplies toutes seules, 1 à saisir ». */
export function enTeteDesVariables(langue: Langue, variables: readonly VariableDeModele[]): { entete: string; sous: string } {
  const r = remplies(variables);
  if (variables.length === 0) return { entete: traduire(langue, 'variables.aucune'), sous: '' };
  return { entete: traduire(langue, variables.length <= 1 ? 'variables.entete.1' : 'variables.entete.n', { n: variables.length }), sous: traduire(langue, 'variables.sous', { seules: r.seules, saisir: r.aSaisir }) };
}
