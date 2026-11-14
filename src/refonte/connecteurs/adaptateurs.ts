import { CATALOGUE } from './catalogue';
import type { CategorieId, ConnecteurInstance } from './types';
import type { Connecteur as ConnecteurFictif } from '../donnees/types-suite';

/**
 * LE PONT AVEC LES JEUX FICTIFS DE SIM (`src/refonte/donnees/`, H21).
 *
 * Le jeu `connecteurs` de SIM est antérieur à ce modèle : des noms génériques
 * (« Paiement en ligne », « Courrier »…), quatre états, des droits en texte
 * libre, aucune clé. On le traduit en prises, pour essayer la baie et les
 * coûts sur des volumes vide, peu, normal et beaucoup.
 *
 * Le jeu ne porte pas de coût accepté : ses prises connectées sont des
 * exemples d'écran, pas le résultat du parcours d'activation. Les invariants
 * du parcours (`defautsDePrise`) se vérifient sur le cycle, pas sur ce jeu.
 */

const CORRESPONDANCE: Record<string, { categorie: CategorieId; optionId: string }> = {
  'Paiement en ligne': { categorie: 'paiement', optionId: 'stripe' },
  Banque: { categorie: 'banque', optionId: 'agregateur-dsp2' },
  'Agenda externe': { categorie: 'agenda', optionId: 'google-agenda' },
  Courrier: { categorie: 'messagerie', optionId: 'boite-equipe' },
  'Stockage en ligne': { categorie: 'stockage', optionId: 's3-ue' },
  Comptabilité: { categorie: 'comptabilite', optionId: 'logiciel-comptable' },
  'Signature électronique': { categorie: 'signature', optionId: 'yousign' },
  'Messagerie instantanée': { categorie: 'notifications', optionId: 'slack' },
};

export function correspondanceFictive(nom: string): { categorie: CategorieId; optionId: string } | null {
  return CORRESPONDANCE[nom.replace(/\s*\(\d+\)$/, '')] ?? null;
}

export function depuisFictifs(fictifs: readonly ConnecteurFictif[]): ConnecteurInstance[] {
  const r: ConnecteurInstance[] = [];
  fictifs.forEach((f, k) => {
    const c = correspondanceFictive(f.nom);
    if (!c) return;
    const opt = CATALOGUE.find((x) => x.id === c.categorie)?.options.find((o) => o.id === c.optionId);
    const at = f.derniereSynchroAt ? Date.parse(f.derniereSynchroAt) : null;
    const base = { categorie: c.categorie, prise: k + 1, optionId: c.optionId, coutAccepte: null, synchroEnCours: false, widgets: f.widgets, changeAt: null } as const;
    switch (f.etat) {
      case 'Connecté':
        r.push({ ...base, etat: 'connecte', motif: null, droits: opt?.droits ?? [], derniereSynchroAt: at, erreur: null });
        break;
      case 'Non connecté':
        r.push({ ...base, etat: 'a-connecter', motif: 'libre', droits: [], derniereSynchroAt: null, erreur: null });
        break;
      case 'À renouveler':
        r.push({ ...base, etat: 'a-connecter', motif: 'a-reconnecter', droits: opt?.droits ?? [], derniereSynchroAt: at, erreur: { at: at ?? 0, message: 'erreur.autorisation-expiree', enAttente: 0 } });
        break;
      case 'Erreur':
        r.push({ ...base, etat: 'a-connecter', motif: 'erreur', droits: opt?.droits ?? [], derniereSynchroAt: at, erreur: { at: at ?? 0, message: 'erreur.service-indisponible', enAttente: 0 } });
        break;
    }
  });
  return r;
}
