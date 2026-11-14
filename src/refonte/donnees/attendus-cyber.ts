/**
 * LES VALEURS ATTENDUES DES ÉCRANS CALCULÉS DE CYBER (LOT-10, S8) — jour de référence Cyber (mardi 3 nov. 2026).
 *
 * Calculées à partir des jeux, par une écriture indépendante de la logique des écrans : si S8 trouve un autre chiffre,
 * l'un des deux se trompe, et la garde le dira. Les seuils (bandes de score, hors ligne, effectif minimal, délai de 72 h)
 * sont ceux exportés par SIM ; un changement de seuil côté S8 se fait ici aussi, en un endroit.
 */

import { bandeDuScore, etatAccord, HORS_LIGNE_APRES_HEURES, type BandeScore } from './cyber';
import { DELAI_NOTIFICATION_HEURES, EFFECTIF_MINIMUM_EQUIPE, serieDigest } from './cyber-suite';
import { HEURE, MINUTE, type Jour } from './outils';
import type { Monde } from './types';
import type { CategorieEmpreinte, EtatAccord, ReferentielConformite } from './types-suite';

export type MotifDeVerrou = 'aucun accord' | 'accord non signé' | 'accord expiré' | 'hors périmètre' | 'locaux non inclus';

export interface AttendusCyber {
  /** Le jour de référence Cyber. */
  jour: Jour;
  /** CY01, CY02 : pour chaque mission et chaque outil « Accord requis » de sa famille. */
  verrous: { missionId: string; outilId: string; disponible: boolean; motif: MotifDeVerrou | null }[];
  /** CY03 : par client suivi, à partir des appareils un par un. */
  parc: { clientId: number; appareils: number; aJour: number; enRetard: number; horsLigne: number; antivirusActifs: number; sauvegardesCouvertes: number; sauvegardesVerifiees: number; correctifsEnAttente: number; correctifsImportants: number; comptesSansDoubleValidation: number }[];
  /** CY05. `concernent` : alertes qui touchent un logiciel suivi ; `memeEditeur` : les autres, dont l'éditeur est celui d'un logiciel suivi. */
  veille: { parBande: Record<BandeScore, number>; concernent: number; memeEditeur: number; parCategorie: Record<string, number>; serieDigest: number };
  /** CY06 : pour chaque mission de la famille OSINT. `rechercheAutorisee` : accord signé et non expiré (Valide ou Expire bientôt) ; `etatAccord` permet une règle plus stricte. */
  osint: { missionId: string; etatAccord: EtatAccord | null; rechercheAutorisee: boolean; elements: number; parCategorie: Partial<Record<CategorieEmpreinte, number>> }[];
  /** CY08. `restantMinutes` : négatif si le délai est dépassé ; null si la notification n'est pas requise ou déjà faite. */
  incidents: { incidentId: string; echeanceNotificationAt: string; restantMinutes: number | null; notificationFaite: boolean; etapesFaites: number; etapesTotal: number; preuves: number; preuvesVerifiees: number }[];
  /** CY09 : moyenne des niveaux (deux décimales) et part des cases au niveau 3 ou 4 (pourcents entiers), par référentiel et par client. */
  conformite: { parReferentiel: Record<ReferentielConformite, { moyenne: number; partNiveau3Plus: number }>; parClient: { clientId: number; moyenne: number }[] };
  /** CY10 : taux de clic en pourcents (une décimale) ; équipes regroupées (effectif < minimum) ; mini-courbe des 6 simulations. */
  sensibilisation: {
    campagnes: { campagneId: string; tauxClic: number | null; tauxSignalement: number | null }[];
    equipesRegroupees: { clientId: number; equipes: number; effectif: number }[];
    tendance: { clientId: number; tauxClic: number[] }[];
  };
  /** CY14 (et « N entrées » de CY02). */
  missions: { missionId: string; entreesJournal: number; sousEtapesFaites: number; sousEtapesTotal: number; contactUrgence: string | null; joignable: string | null }[];
}

const arrondi = (x: number, decimales: number): number => { const f = 10 ** decimales; return Math.round(x * f) / f; };
const pour100 = (a: number, b: number, decimales = 1): number | null => (b === 0 ? null : arrondi((a / b) * 100, decimales));

export function attendusCyber(m: Monde): AttendusCyber {
  const jour = m.contexte.aujourdhuiCyber;
  const maintenant = m.contexte.maintenantCyber;

  const verrous: AttendusCyber['verrous'] = [];
  for (const mi of m.missions) {
    const accord = m.accords.find((a) => a.id === mi.accordId) ?? null;
    for (const o of m.outilsCyber.filter((x) => x.famille === mi.famille && x.accord === 'Accord requis')) {
      let motif: MotifDeVerrou | null = null;
      if (!accord) motif = 'aucun accord';
      else {
        const etat = etatAccord(accord, jour);
        if (etat === 'En attente') motif = 'accord non signé';
        else if (etat === 'Expiré') motif = 'accord expiré';
        else if (o.cible === 'locaux' && accord.perimetre.locaux.length === 0) motif = 'locaux non inclus';
        else if (o.cible === 'adresse' && accord.perimetre.nbAdresses === 0) motif = 'hors périmètre';
        else if (o.cible === 'domaine' && accord.perimetre.domaines.length === 0) motif = 'hors périmètre';
      }
      verrous.push({ missionId: mi.id, outilId: o.id, disponible: motif === null, motif });
    }
  }

  const parc = m.parcSecurite.map((p) => {
    const mes = m.appareilsParc.filter((a) => a.parcId === p.id);
    const couverts = mes.filter((a) => a.sauvegarde !== null);
    return {
      clientId: p.clientId, appareils: mes.length, aJour: mes.filter((a) => a.correctifsEnAttente === 0).length, enRetard: mes.filter((a) => a.correctifsEnAttente > 0).length,
      horsLigne: mes.filter((a) => maintenant - Date.parse(a.dernierContactAt) > HORS_LIGNE_APRES_HEURES * HEURE).length, antivirusActifs: mes.filter((a) => a.antivirus === 'Actif').length,
      sauvegardesCouvertes: couverts.length, sauvegardesVerifiees: couverts.filter((a) => a.sauvegarde === 'Vérifiée').length,
      correctifsEnAttente: mes.reduce((t, a) => t + a.correctifsEnAttente, 0), correctifsImportants: mes.reduce((t, a) => t + a.correctifsImportants, 0), comptesSansDoubleValidation: p.comptesSansDoubleValidation,
    };
  });

  const parBande: Record<BandeScore, number> = { Critique: 0, Importante: 0, Modérée: 0, Faible: 0 };
  const parCategorie: Record<string, number> = {};
  const editeursSuivis = new Set(m.logicielsClients.map((l) => l.editeur));
  for (const a of m.alertesVeille) { parBande[bandeDuScore(a.scorePublie)]++; parCategorie[a.categorie] = (parCategorie[a.categorie] ?? 0) + 1; }
  const veille: AttendusCyber['veille'] = {
    parBande, parCategorie,
    concernent: m.alertesVeille.filter((a) => a.logicielsConcernes.length > 0).length,
    memeEditeur: m.alertesVeille.filter((a) => a.logicielsConcernes.length === 0 && editeursSuivis.has(a.editeur)).length,
    serieDigest: serieDigest(m.digestVeille, jour),
  };

  const osint = m.missions.filter((mi) => mi.famille === 'OSINT').map((mi) => {
    const accord = m.accords.find((a) => a.id === mi.accordId) ?? null;
    const els = m.elementsEmpreinte.filter((e) => e.missionId === mi.id);
    const parCat: Partial<Record<CategorieEmpreinte, number>> = {};
    for (const e of els) parCat[e.categorie] = (parCat[e.categorie] ?? 0) + 1;
    const etat = accord ? etatAccord(accord, jour) : null;
    return { missionId: mi.id, etatAccord: etat, rechercheAutorisee: etat === 'Valide' || etat === 'Expire bientôt', elements: els.length, parCategorie: parCat };
  });

  const incidents = m.reponsesIncident.map((r) => {
    const echeance = Date.parse(r.detecteAt) + DELAI_NOTIFICATION_HEURES * HEURE;
    const playbook = m.playbooksIncident.find((p) => p.id === r.playbookId);
    const preuves = m.preuvesIncident.filter((p) => p.incidentId === r.incidentId);
    return {
      incidentId: r.incidentId, echeanceNotificationAt: new Date(echeance).toISOString(),
      restantMinutes: r.notification === 'Requise' && r.notifieAt === null ? Math.round((echeance - maintenant) / MINUTE) : null,
      notificationFaite: r.notifieAt !== null, etapesFaites: r.etapesFaites.length, etapesTotal: playbook?.etapes.length ?? 0,
      preuves: preuves.length, preuvesVerifiees: preuves.filter((p) => p.empreinteVerifiee).length,
    };
  });

  const controleDe = new Map(m.controlesConformite.map((c) => [c.id, c]));
  const referentiels: ReferentielConformite[] = ['RGPD', 'Sécurité de base', 'NIS2'];
  const parReferentiel = Object.fromEntries(referentiels.map((r) => {
    const cases = m.maturiteConformite.filter((c) => controleDe.get(c.controleId)?.referentiel === r);
    return [r, { moyenne: cases.length ? arrondi(cases.reduce((t, c) => t + c.niveau, 0) / cases.length, 2) : 0, partNiveau3Plus: cases.length ? Math.round((cases.filter((c) => c.niveau >= 3).length / cases.length) * 100) : 0 }];
  })) as AttendusCyber['conformite']['parReferentiel'];
  const clientsConf = [...new Set(m.maturiteConformite.map((c) => c.clientId))];
  const parClient = clientsConf.map((clientId) => { const cs = m.maturiteConformite.filter((c) => c.clientId === clientId); return { clientId, moyenne: arrondi(cs.reduce((t, c) => t + c.niveau, 0) / cs.length, 2) }; });

  const campagnes = m.campagnes.map((c) => ({ campagneId: c.id, tauxClic: c.type === 'Simulation' ? pour100(c.cliques, c.envoyes) : null, tauxSignalement: c.type === 'Simulation' ? pour100(c.signales, c.envoyes) : null }));
  const equipesRegroupees = [...new Set(m.parcoursFormation.map((p) => p.clientId))].map((clientId) => {
    const petites = m.parcoursFormation.filter((p) => p.clientId === clientId && p.effectif < EFFECTIF_MINIMUM_EQUIPE);
    return { clientId, equipes: petites.length, effectif: petites.reduce((t, p) => t + p.effectif, 0) };
  });
  const tendance = [...new Set(m.historiqueCampagnes.map((h) => h.clientId))].map((clientId) => ({
    clientId, tauxClic: m.historiqueCampagnes.filter((h) => h.clientId === clientId).sort((a, b) => a.rang - b.rang).map((h) => pour100(h.cliques, h.envoyes) ?? 0),
  }));

  const missions = m.missions.map((mi) => {
    const etapes = m.sousEtapesMission.filter((s) => s.missionId === mi.id);
    const urgence = m.equipeMission.find((e) => e.missionId === mi.id && e.contactUrgence) ?? null;
    return {
      missionId: mi.id, entreesJournal: m.journalMission.filter((e) => e.missionId === mi.id).length, sousEtapesFaites: etapes.filter((s) => s.fait).length, sousEtapesTotal: etapes.length,
      contactUrgence: urgence?.membreEmail ?? null, joignable: urgence?.joignable ?? null,
    };
  });

  return { jour, verrous, parc, veille, osint, incidents, conformite: { parReferentiel, parClient }, sensibilisation: { campagnes, equipesRegroupees, tendance }, missions };
}
