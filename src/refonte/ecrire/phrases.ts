import { dateFr, type Langue } from './commun';
import type { EtatEnregistrement } from './pages';
import type { Serie } from './serie';
import type { EtatDeLigne } from './documents';
import type { DelaiMoyen, EtatDeDemande } from './signatures';
import { dire, direCompte, type CleEcrire } from './i18n';

/**
 * Les phrases composées par la logique : un seul endroit pour que l'écran n'assemble jamais de texte à la main.
 * Tutoiement partout dans l'interface ; ce qui part chez un client n'est pas produit ici.
 */

const minusculeInitiale = (t: string): string => t.charAt(0).toLowerCase() + t.slice(1);

/** « Belle série · prochain palier : 14 jours, dans 2 jours » ; « La série reprend aujourd'hui » ; « Ta première page t'attend ». */
export function phraseDeSerie(s: Serie, langue: Langue): string {
  if (s.etat === 'aucune') return dire(langue, 'serie.premiere');
  if (s.etat === 'reprise') return dire(langue, 'serie.reprise');
  const palier = s.prochainPalier === null || s.joursAvantPalier === null ? '' : ` · ${minusculeInitiale(direCompte(langue, 'serie.palier', s.joursAvantPalier, { palier: s.prochainPalier }))}`;
  return `${dire(langue, 'serie.belle')}${palier}`;
}

/** Le sous-texte de la série quand rien n'est encore écrit aujourd'hui : « Une ligne aujourd'hui suffit… ». */
export function conseilDuJour(s: Serie, langue: Langue): string | null {
  if (s.ecritAujourdhui) return null;
  return dire(langue, s.etat === 'en-cours' ? 'serie.uneLigne' : 'serie.uneLigneDebut');
}

export function phraseDEnregistrement(e: EtatEnregistrement, langue: Langue, quand?: string): string {
  switch (e.genre) {
    case 'enregistrement':
      return dire(langue, 'enreg.encours');
    case 'enregistree':
      return dire(langue, 'enreg.fait', { n: e.avant });
    case 'modifiee':
      return dire(langue, 'enreg.modifiee', { quand: quand ?? '' });
    case 'non-enregistree':
      return dire(langue, 'enreg.non');
    case 'hors-ligne':
      return dire(langue, 'enreg.horsLigne');
  }
}

const LIGNES: Record<Exclude<EtatDeLigne, null>, CleEcrire> = {
  signe: 'ligne.signe',
  'a-signer': 'ligne.aSigner',
  envoye: 'ligne.envoye',
  'a-renouveler': 'ligne.aRenouveler',
};
export const libelleDeLigne = (e: EtatDeLigne, langue: Langue): string | null => (e === null ? null : dire(langue, LIGNES[e]));

const DEMANDES: Record<EtatDeDemande, CleEcrire> = {
  'À envoyer': 'demande.envoyer',
  Envoyée: 'demande.envoyee',
  Vue: 'demande.vue',
  Signée: 'demande.signee',
  Refusée: 'demande.refusee',
  Expirée: 'demande.expiree',
  Annulée: 'demande.annulee',
};
export const libelleDeDemande = (e: EtatDeDemande, langue: Langue): string => dire(langue, DEMANDES[e]);

/** « 3 demandes attendent une signature · tes devis sont signés en 1,8 jour en moyenne, belle régularité ». */
export function sousTitreDeSignatures(attendent: number, delai: DelaiMoyen, langue: Langue): string {
  const base = direCompte(langue, 'signatures.attendent', attendent);
  if (delai.jours === null) return base;
  const jours = langue === 'fr' ? String(delai.jours).replace('.', ',') : String(delai.jours);
  const moyenne = dire(langue, delai.jours < 2 ? 'signatures.delai.1' : 'signatures.delai.n', { jours });
  return `${base} · ${moyenne}${delai.regulier ? `, ${dire(langue, 'signatures.regularite')}` : ''}`;
}

/** « Cet article date d'avril » : le mois de la dernière mise à jour, en toutes lettres. */
export const moisEnToutesLettres = (jour: string, langue: Langue): string => dateFr(jour, langue, { mois: true });
