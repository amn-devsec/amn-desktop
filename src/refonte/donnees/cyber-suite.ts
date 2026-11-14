/**
 * LES JEUX « CYBER », SUITE — ce que demande LOT-10 (S8) au §6 de sa note de préparation :
 * sous-étapes, journal et équipe de mission (CY02, CY14) ; digest du matin (CY05) ; éléments d'empreinte (CY06) ;
 * playbooks, rôles, journal de communication et preuves d'un incident (CY08) ; contrôles et niveaux de maturité (CY09) ;
 * parcours de formation et historique des campagnes (CY10). Les appareils un par un (CY03) sont dans `cyber.ts`,
 * générés avec leur parc.
 *
 * Mêmes règles que `cyber.ts` : des états, des dates et des comptes. Jamais d'adresse IP, de numéro de téléphone, de nom
 * de personne privée, de procédure technique ni de contenu (preuve, fuite, saisie). Les dates sont du jour de référence
 * Cyber (`ctx.aujourdhuiCyber`, mardi 3 nov. 2026).
 */

import { cle, cycle, hasardDe, salaries } from './commun';
import { ajouterJours, compter, ecartJours, estOuvre, HEURE, JOUR, MINUTE, type Jour } from './outils';
import { derniersJoursOuvres } from './journee';
import { PHASES_MISSION, POINTS_RGPD } from './cyber';
import type { Contexte, Membre } from './types';
import type {
  AccordCyber, AlerteVeille, AppareilParc, CategorieEmpreinte, CommunicationIncident, ConstatCyber, ControleConformite, DocumentCyber, DossierConformite,
  ElementEmpreinte, EntreeJournalMission, HistoriqueCampagne, IncidentGarde, JourDigest, MaturiteConformite, MembreMission, MissionCyber, ModuleFormation,
  CampagneSensibilisation, ParcoursFormation, PhaseMission, PlaybookIncident, PreuveIncident, ReponseIncident, RoleIncident, SousEtapeMission,
  TypeEntreeJournal, TypeIncidentCyber,
} from './types-suite';

/* ---------------------------- Sous-étapes d'une mission (CY02, CY14) ---------------------------- */

/** Trois sous-étapes par phase, dans l'ordre. Des libellés généraux : aucune procédure. */
export const SOUS_ETAPES: Readonly<Record<PhaseMission, readonly string[]>> = {
  Accord: ['Périmètre défini avec le client', 'Accord signé', 'Créneau convenu'],
  Reconnaissance: ['Périmètre confirmé', 'Contacts d’urgence confirmés', 'Inventaire des services'],
  Tests: ['Contrôles préparés', 'Contrôles réalisés', 'Résultats rassemblés'],
  Constats: ['Constats classés par gravité', 'Constats relus', 'Constats présentés au client'],
  Rapport: ['Rapport rédigé', 'Rapport relu', 'Rapport remis au client'],
};

/**
 * Une phase passée est faite en entier ; la phase courante est entamée (jamais finie, sauf mission terminée) ; les suivantes n'ont rien.
 * « Accord signé » dit toujours la vérité de l'accord : une mission en cours dont l'accord attend sa signature le montre.
 */
export function genererSousEtapes(ctx: Contexte, missions: readonly MissionCyber[], accords: readonly AccordCyber[]): SousEtapeMission[] {
  if (compter(ctx.volumes.sousEtapesMission, [0, 1, 1, 1]) === 0) return [];
  const h = hasardDe(ctx.graine, 'sousEtapesMission');
  const liste: SousEtapeMission[] = [];
  for (const m of missions) {
    const courante = PHASES_MISSION.indexOf(m.phase);
    const accord = accords.find((a) => a.id === m.accordId) ?? null;
    PHASES_MISSION.forEach((phase, pi) => {
      const libelles = SOUS_ETAPES[phase];
      const entamees = m.etat === 'Terminée' || pi < courante ? libelles.length : pi === courante ? h.entier(0, libelles.length - 1) : 0;
      libelles.forEach((libelle, k) => {
        const fait = phase === 'Accord' && k === 1 ? Boolean(accord?.signe) : k < entamees;
        liste.push({ id: cle('se', liste.length + 1, 5), missionId: m.id, phase, rang: k + 1, libelle, fait });
      });
    });
  }
  return liste;
}

/* ------------------------------- Journal de mission (CY02, CY14) ------------------------------- */

export function genererJournalMission(
  ctx: Contexte,
  equipe: readonly Membre[],
  missions: readonly MissionCyber[],
  accords: readonly AccordCyber[],
  constats: readonly ConstatCyber[],
  documents: readonly DocumentCyber[],
): EntreeJournalMission[] {
  if (compter(ctx.volumes.journalMission, [0, 1, 1, 1]) === 0) return [];
  const h = hasardDe(ctx.graine, 'journalMission');
  const gens = salaries(equipe);
  const liste: EntreeJournalMission[] = [];
  const poser = (m: MissionCyber, le: Jour, type: TypeEntreeJournal, resume: string, auteur?: string | null) => {
    const borne = le < m.debutLe ? m.debutLe : le > ctx.aujourdhui ? ctx.aujourdhui : le;
    liste.push({ id: '', missionId: m.id, le: borne, type, resume, parEmail: auteur === undefined ? (h.chance(0.7) ? m.responsableEmail : h.choix(gens).email) : auteur });
  };
  for (const m of missions) {
    if (m.etat === 'À préparer' || m.debutLe > ctx.aujourdhui) continue; // pas commencée : pas d'entrée
    const accord = accords.find((a) => a.id === m.accordId) ?? null;
    poser(m, m.debutLe, 'Accord', accord?.signe ? 'Accord signé reçu et classé.' : 'Accord envoyé au client pour signature.', m.responsableEmail);
    const courante = PHASES_MISSION.indexOf(m.phase);
    const jours = Math.max(1, ecartJours(m.debutLe, ctx.aujourdhui));
    for (let pi = 1; pi <= courante; pi++) poser(m, ajouterJours(m.debutLe, Math.floor((jours * pi) / (courante + 1))), 'Phase', `Passage à la phase « ${PHASES_MISSION[pi]} ».`);
    for (const c of constats.filter((x) => x.missionId === m.id)) poser(m, c.creeLe, 'Constat', `Constat ajouté, gravité ${c.gravite.toLowerCase()}.`);
    for (const d of documents.filter((x) => x.missionId === m.id && x.type !== 'Accord')) poser(m, d.modifieLe, 'Document', `Document ajouté : ${d.type.toLowerCase()}.`, d.auteurEmail);
    for (let k = h.entier(0, 2); k > 0; k--) poser(m, ajouterJours(m.debutLe, h.entier(1, jours)), 'Contact', h.choix(['Point d’étape avec le client.', 'Échange avec le contact du client.', 'Précisions demandées au client.']));
    if (m.etat === 'Terminée') poser(m, m.echeanceLe, 'Note', 'Mission clôturée.', m.responsableEmail);
  }
  liste.sort((a, b) => b.le.localeCompare(a.le) || a.missionId.localeCompare(b.missionId) || a.resume.localeCompare(b.resume));
  liste.forEach((e, i) => { e.id = cle('jm', i + 1, 5); });
  return liste;
}

/* ---------------------------- Équipe et joignabilité d'une mission (CY14) ---------------------------- */

export const CRENEAU_BUREAU = '8 h – 19 h';

export function genererEquipeMission(ctx: Contexte, equipe: readonly Membre[], missions: readonly MissionCyber[], accords: readonly AccordCyber[]): MembreMission[] {
  if (compter(ctx.volumes.equipeMission, [0, 1, 1, 1]) === 0) return [];
  const h = hasardDe(ctx.graine, 'equipeMission');
  const gens = salaries(equipe);
  const liste: MembreMission[] = [];
  for (const m of missions) {
    const accord = accords.find((a) => a.id === m.accordId) ?? null;
    const autres = h.echantillon(gens.filter((g) => g.email !== m.responsableEmail), Math.min(h.entier(0, 2), Math.max(0, gens.length - 1)));
    const membres: { email: string; role: MembreMission['role'] }[] = [
      { email: m.responsableEmail, role: 'Responsable' },
      ...autres.map((g, k) => ({ email: g.email, role: (k === 0 ? 'Intervenant' : 'Relecteur') as MembreMission['role'] })),
    ];
    // Un seul contact d'urgence par mission : le responsable s'il est seul, sinon l'un des intervenants.
    const urgence = membres.length === 1 ? 0 : h.entier(0, membres.length - 1);
    membres.forEach((mm, k) => {
      liste.push({ id: cle('em', liste.length + 1, 5), missionId: m.id, membreEmail: mm.email, role: mm.role, contactUrgence: k === urgence, joignable: k === urgence ? accord?.creneau ?? CRENEAU_BUREAU : CRENEAU_BUREAU });
    });
  }
  return liste;
}

/* ---------------------------------- Digest du matin (CY05) ---------------------------------- */

/**
 * Un digest par jour ouvré. `nouvelles` = les alertes publiées ce jour-là. Aujourd'hui est lu ; une série d'au moins six
 * jours précède un jour manqué, puis l'historique varie.
 */
export function genererDigest(ctx: Contexte, alertes: readonly AlerteVeille[]): JourDigest[] {
  const n = compter(ctx.volumes.digestVeille, [0, 7, 22, 45]);
  if (n === 0) return [];
  const h = hasardDe(ctx.graine, 'digestVeille');
  const serie = 6 + h.entier(0, 3);
  return derniersJoursOuvres(ctx.aujourdhui, n).map((jour, k, tous) => {
    const depuisFin = tous.length - 1 - k;
    const lu = depuisFin < serie ? true : depuisFin === serie ? false : h.chance(0.65);
    return { id: cle('dv', k + 1, 3), jour, nouvelles: alertes.filter((a) => a.publieeLe === jour).length, lu };
  });
}

/**
 * La série du digest : les jours ouvrés lus d'affilée, en remontant depuis aujourd'hui. Un digest du jour pas encore lu ne casse pas
 * la série (et ne compte pas) ; le premier digest manqué avant aujourd'hui l'arrête. Les week-ends n'ont pas de digest.
 */
export function serieDigest(digests: readonly JourDigest[], aujourdhui: Jour): number {
  const jours = [...digests].filter((d) => d.jour <= aujourdhui && estOuvre(d.jour)).sort((a, b) => b.jour.localeCompare(a.jour));
  let serie = 0;
  for (const d of jours) {
    if (d.lu) serie++;
    else if (d.jour === aujourdhui) continue;
    else break;
  }
  return serie;
}

/* ---------------------------- Empreinte publique de l'organisation (CY06) ---------------------------- */

/** Sept catégories. Aucune ne vise une personne privée. À ajuster avec la fiche CY06 : c'est une proposition de SIM, pas un texte de la fiche. */
export const CATEGORIES_EMPREINTE: readonly CategorieEmpreinte[] = ['Noms de domaine', 'Sites publics', 'Registres officiels', 'Mandataires', 'Présence en ligne', 'Documents publics', 'Hébergement déclaré'];
const SOURCES_EMPREINTE: Readonly<Record<CategorieEmpreinte, ElementEmpreinte['source']>> = {
  'Noms de domaine': 'Site de l’organisation', 'Sites publics': 'Site de l’organisation', 'Registres officiels': 'Registre public', Mandataires: 'Registre public',
  'Présence en ligne': 'Archives publiques', 'Documents publics': 'Annonces légales', 'Hébergement déclaré': 'Site de l’organisation',
};
const VARIANTES_EMPREINTE: Readonly<Record<Exclude<CategorieEmpreinte, 'Noms de domaine'>, readonly string[]>> = {
  'Sites publics': ['Page d’accueil', 'Page de contact', 'Page des mentions légales', 'Page de réservation', 'Page des tarifs'],
  'Registres officiels': ['Fiche d’immatriculation de l’organisation', 'Dernier dépôt de comptes'],
  Mandataires: ['2 dirigeants inscrits (noms non repris)', '1 mandataire inscrit (nom non repris)'],
  'Présence en ligne': ['Page officielle de l’organisation (plateforme n° 1)', 'Page officielle de l’organisation (plateforme n° 2)'],
  'Documents publics': ['Plaquette de présentation en ligne', 'Appel d’offres publié', 'Offre d’emploi publiée'],
  'Hébergement déclaré': ['Hébergeur indiqué dans les mentions légales'],
};

export function genererEmpreinte(ctx: Contexte, missions: readonly MissionCyber[], accords: readonly AccordCyber[]): ElementEmpreinte[] {
  const h = hasardDe(ctx.graine, 'elementsEmpreinte');
  const n = compter(ctx.volumes.elementsEmpreinte, [0, 6, 24, 70]);
  const cibles = missions.filter((m) => m.famille === 'OSINT' && m.etat !== 'À préparer' && accords.some((a) => a.id === m.accordId && a.signe));
  if (n === 0 || cibles.length === 0) return [];
  const vus = new Map<string, number>();
  const liste: ElementEmpreinte[] = [];
  for (let i = 0; i < n; i++) {
    const m = cibles[i % cibles.length];
    const accord = accords.find((a) => a.id === m.accordId) as AccordCyber;
    const categorie = CATEGORIES_EMPREINTE[Math.floor(i / cibles.length) % CATEGORIES_EMPREINTE.length];
    const variantes = categorie === 'Noms de domaine' ? accord.perimetre.domaines : VARIANTES_EMPREINTE[categorie];
    const cleVue = `${m.id}|${categorie}`;
    const occ = vus.get(cleVue) ?? 0;
    vus.set(cleVue, occ + 1);
    const base = variantes[occ % variantes.length];
    const plancher = [m.debutLe, ajouterJours(ctx.aujourdhui, -29)].sort()[1];
    liste.push({
      id: cle('ee', i + 1), missionId: m.id, categorie, valeur: occ >= variantes.length ? `${base} (n° ${Math.floor(occ / variantes.length) + 1})` : base,
      source: SOURCES_EMPREINTE[categorie], decouvertLe: ajouterJours(plancher, h.entier(0, Math.max(0, ecartJours(plancher, ctx.aujourdhui)))),
      niveau: categorie === 'Mandataires' || categorie === 'Hébergement déclaré' ? h.pondere([['Moyen', 3], ['Élevé', 1]] as const) : h.pondere([['Faible', 5], ['Moyen', 3], ['Élevé', 1]] as const),
      etat: h.pondere([['Nouveau', 3], ['Confirmé', 4], ['À vérifier', 2], ['Écarté', 1]] as const),
    });
  }
  return liste.sort((a, b) => b.decouvertLe.localeCompare(a.decouvertLe) || a.id.localeCompare(b.id));
}

/* --------------------------------- Réponse à incident (CY08) --------------------------------- */

const ETAPES_PLAYBOOK: Readonly<Record<TypeIncidentCyber, readonly (readonly [string, RoleIncident])[]>> = {
  'Compte compromis': [
    ['Alerter le client et confirmer le périmètre', 'Contact client'], ['Faire changer les accès du compte concerné', 'Technique'], ['Vérifier les autres comptes liés', 'Technique'],
    ['Rassembler et protéger les preuves', 'Technique'], ['Évaluer les données personnelles concernées', 'Pilote'], ['Préparer la notification si elle est requise', 'Communication'],
    ['Rédiger le compte rendu', 'Pilote'],
  ],
  'Message suspect': [
    ['Confirmer le signalement avec la personne', 'Contact client'], ['Mettre le message de côté pour l’analyse', 'Technique'], ['Prévenir l’équipe concernée', 'Communication'],
    ['Vérifier si quelqu’un a répondu', 'Contact client'], ['Rassembler les preuves', 'Technique'], ['Rédiger le compte rendu', 'Pilote'],
  ],
  'Service indisponible': [
    ['Informer le client de la situation', 'Contact client'], ['Identifier le service touché', 'Technique'], ['Rétablir le service ou activer le plan de repli', 'Technique'],
    ['Vérifier les sauvegardes', 'Technique'], ['Tenir le client au courant', 'Communication'], ['Rédiger le compte rendu', 'Pilote'],
  ],
};
const TYPES_INCIDENT: readonly TypeIncidentCyber[] = ['Compte compromis', 'Message suspect', 'Service indisponible'];
export const ROLES_INCIDENT: readonly RoleIncident[] = ['Pilote', 'Technique', 'Communication', 'Contact client'];
/** Le délai de notification à l'autorité de contrôle, en heures, à partir de la détection (CY08). */
export const DELAI_NOTIFICATION_HEURES = 72;

export function genererPlaybooks(ctx: Contexte): PlaybookIncident[] {
  const n = compter(ctx.volumes.playbooksIncident, [0, 1, 3, 3]);
  return TYPES_INCIDENT.slice(0, n).map((type, i) => ({
    id: cle('pb', i + 1, 3), type, titre: `Playbook « ${type.toLowerCase()} »`,
    etapes: ETAPES_PLAYBOOK[type].map(([libelle, role], k) => ({ rang: k + 1, libelle, role })),
  }));
}

const DONNEES_POSSIBLES = ['Identifiants de comptes', 'Adresses de messagerie', 'Données de clients', 'Coordonnées professionnelles'] as const;
const NATURES_PREUVE = ['Journal', 'Capture d’écran', 'Message', 'Copie de configuration'] as const;
const EN_COURS: readonly IncidentGarde['etape'][] = ['Détecté', 'Pris en charge', 'En traitement'];

export interface SuiviIncidents { reponses: ReponseIncident[]; communications: CommunicationIncident[]; preuves: PreuveIncident[] }

/**
 * Le suivi Cyber de chaque incident de La Garde. Le premier incident (en traitement) est un « compte compromis » détecté 26 h 15 min avant
 * le jour de référence Cyber, avec des données personnelles : le chronomètre de 72 h tourne, la notification n'est pas faite.
 * Les dates sont de l'horloge Cyber ; celles de `IncidentGarde` restent de l'horloge de La Garde (30 oct.) et ne servent pas au chronomètre.
 */
export function genererSuiviIncidents(ctx: Contexte, equipe: readonly Membre[], incidents: readonly IncidentGarde[], playbooks: readonly PlaybookIncident[]): SuiviIncidents {
  const vide: SuiviIncidents = { reponses: [], communications: [], preuves: [] };
  if (playbooks.length === 0) return vide;
  const h = hasardDe(ctx.graine, 'reponsesIncident');
  const gens = salaries(equipe);
  const types = cycle(h, TYPES_INCIDENT.filter((t) => playbooks.some((p) => p.type === t)), incidents.length);
  const suivi: SuiviIncidents = { reponses: [], communications: [], preuves: [] };
  incidents.forEach((inc, i) => {
    const actif = EN_COURS.includes(inc.etape);
    const playbook = i === 0 ? playbooks[0] : playbooks.find((p) => p.type === types[i]) ?? playbooks[0];
    const total = playbook.etapes.length;
    const detecte = actif
      ? ctx.maintenant - (i === 0 ? 26 * HEURE + 15 * MINUTE : h.entier(2, 50) * HEURE)
      : ctx.maintenant - h.entier(4, 40) * JOUR;
    const faites = inc.etape === 'Détecté' ? 0 : inc.etape === 'Pris en charge' ? 1 : inc.etape === 'En traitement' ? (i === 0 ? 4 : h.entier(2, 4)) : inc.etape === 'Résolu' ? total - 1 : total;
    const notification: ReponseIncident['notification'] = inc.donneesPersonnelles === 'oui' ? 'Requise' : inc.donneesPersonnelles === 'non' ? 'Non requise' : 'À évaluer';
    const notifieAt = notification === 'Requise' && !(i === 0) && (!actif || h.chance(0.4)) ? Math.min(ctx.maintenant - MINUTE, detecte + h.entier(5, DELAI_NOTIFICATION_HEURES - 2) * HEURE) : null;
    const attribue = inc.etape !== 'Détecté';
    const reponse: ReponseIncident = {
      id: cle('ri', i + 1, 3), incidentId: inc.id, playbookId: playbook.id, detecteAt: new Date(detecte).toISOString(),
      etapesFaites: Array.from({ length: faites }, (_, k) => k + 1),
      roles: ROLES_INCIDENT.map((role) => ({ role, membreEmail: !attribue ? null : role === 'Pilote' ? inc.responsableEmail ?? h.choix(gens).email : h.choix(gens).email })),
      notification, notifieAt: notifieAt === null ? null : new Date(notifieAt).toISOString(),
      donneesConcernees: inc.donneesPersonnelles === 'oui' ? h.echantillon(DONNEES_POSSIBLES, h.entier(1, 2)) : [],
    };
    suivi.reponses.push(reponse);
    const pilote = reponse.roles.find((r) => r.role === 'Pilote')?.membreEmail ?? null;
    const apres = (ms: number) => detecte + ms;
    const trace: Omit<CommunicationIncident, 'id' | 'incidentId'>[] = [
      { at: new Date(apres(10 * MINUTE)).toISOString(), sens: 'Interne', canal: 'Message', resume: 'Incident signalé à l’équipe.', parEmail: pilote },
      ...(faites >= 1 ? [{ at: new Date(apres(35 * MINUTE)).toISOString(), sens: 'Client' as const, canal: 'Appel' as const, resume: 'Client prévenu de la situation.', parEmail: pilote }] : []),
      ...(faites >= 3 ? [{ at: new Date(apres(3 * HEURE)).toISOString(), sens: 'Interne' as const, canal: 'Réunion' as const, resume: 'Point de situation avec le pilote de crise.', parEmail: pilote }] : []),
      ...(notifieAt !== null ? [{ at: new Date(notifieAt).toISOString(), sens: 'Autorité' as const, canal: 'Courriel' as const, resume: 'Notification transmise à l’autorité de contrôle.', parEmail: pilote }] : []),
      ...(faites === total ? [{ at: new Date(apres(2 * JOUR)).toISOString(), sens: 'Client' as const, canal: 'Courriel' as const, resume: 'Compte rendu envoyé au client.', parEmail: pilote }] : []),
    ];
    trace.filter((t) => Date.parse(t.at) <= ctx.maintenant).forEach((t) => suivi.communications.push({ id: cle('ci', suivi.communications.length + 1, 4), incidentId: inc.id, ...t }));
    const nbPreuves = inc.etape === 'Détecté' ? 0 : Math.min(4, 1 + faites);
    for (let k = 0; k < nbPreuves; k++) {
      const ajoutee = apres((45 * (k + 1) + 20) * MINUTE);
      if (ajoutee > ctx.maintenant) break;
      const nature = NATURES_PREUVE[(i + k) % NATURES_PREUVE.length];
      suivi.preuves.push({ id: cle('pi', suivi.preuves.length + 1, 4), incidentId: inc.id, nom: `Pièce ${k + 1} — ${nature.toLowerCase()}`, nature, empreinteVerifiee: k < nbPreuves - 1 || h.chance(0.5), ajouteeAt: new Date(ajoutee).toISOString(), parEmail: pilote });
    }
  });
  return suivi;
}

/* ---------------------------------- Conformité (CY09) ---------------------------------- */

/** Dix contrôles : les cinq points du dossier RGPD, trois de sécurité de base, deux de NIS2. La liste « à valider par un conseiller » est ici, en donnée. */
export const CONTROLES: readonly (readonly [ControleConformite['referentiel'], string, boolean, readonly string[]])[] = [
  ['RGPD', POINTS_RGPD[0], false, ['Registre des traitements', 'Date de dernière revue']],
  ['RGPD', POINTS_RGPD[1], false, ['Page publiée']],
  ['RGPD', POINTS_RGPD[2], true, ['Tableau des durées']],
  ['RGPD', POINTS_RGPD[3], false, ['Procédure écrite', 'Registre des demandes']],
  ['RGPD', POINTS_RGPD[4], false, ['Liste des sous-traitants', 'Contrats signés']],
  ['Sécurité de base', 'Sauvegardes testées', false, ['Compte rendu du dernier test']],
  ['Sécurité de base', 'Seconde validation sur les accès sensibles', false, ['Liste des accès concernés']],
  ['Sécurité de base', 'Mises à jour appliquées', false, ['État des correctifs']],
  ['NIS2', 'Gestion des incidents documentée', true, ['Procédure d’incident', 'Compte rendu d’exercice']],
  ['NIS2', 'Responsabilités de sécurité désignées', true, ['Note de désignation']],
];

export function genererControlesConformite(ctx: Contexte): ControleConformite[] {
  if (compter(ctx.volumes.controlesConformite, [0, 10, 10, 10]) === 0) return [];
  return CONTROLES.map(([referentiel, libelle, aValiderParConseiller, preuvesAttendues], i) => ({ id: cle('cc', i + 1, 3), referentiel, libelle, aValiderParConseiller, preuvesAttendues: [...preuvesAttendues] }));
}

/**
 * La matrice : un dossier RGPD par client, dix cases par dossier. Les cinq cases RGPD disent la même chose que les points du dossier
 * (point rempli → niveau 3 ou 4 ; sinon 0 à 2, et 0 sans date de revue) ; les autres suivent le profil du client.
 */
export function genererMaturite(ctx: Contexte, dossiers: readonly DossierConformite[], controles: readonly ControleConformite[]): MaturiteConformite[] {
  if (controles.length === 0) return [];
  const h = hasardDe(ctx.graine, 'maturiteConformite');
  const liste: MaturiteConformite[] = [];
  for (const d of dossiers) {
    const profil = d.points.filter((p) => p.ok).length / d.points.length;
    controles.forEach((c, k) => {
      let niveau: MaturiteConformite['niveau'];
      if (k < 5) niveau = d.points[k].ok ? (h.chance(0.6) ? 4 : 3) : k === 0 ? 0 : (h.entier(0, 2) as MaturiteConformite['niveau']);
      else niveau = Math.max(0, Math.min(4, Math.round(profil * 4 + h.entier(-1, 1)))) as MaturiteConformite['niveau'];
      const attendues = c.preuvesAttendues;
      const jointes = niveau === 0 ? [] : niveau === 4 ? attendues : niveau === 3 ? (attendues.length > 1 && h.chance(0.5) ? attendues.slice(0, -1) : attendues) : attendues.slice(0, h.entier(0, attendues.length - 1));
      liste.push({
        id: cle('mc', liste.length + 1, 4), clientId: d.clientId, controleId: c.id, niveau, preuvesJointes: [...jointes],
        revueLe: niveau === 0 ? null : k === 0 ? d.registreRevuLe : ajouterJours(ctx.aujourdhui, -h.entier(10, 400)),
      });
    });
  }
  return liste;
}

/* ------------------------------ Sensibilisation (CY10) ------------------------------ */

export const MODULES: readonly (readonly [string, number])[] = [
  ['Reconnaître un message suspect', 10], ['Mots de passe et seconde validation', 12], ['Poste de travail et appareils', 8], ['Les données de vos clients', 10], ['Que faire en cas de doute', 6],
];
/** En dessous de cet effectif, une équipe est regroupée à l'affichage (CY10) : jamais de résultat qui désigne quelqu'un. */
export const EFFECTIF_MINIMUM_EQUIPE = 5;

export function genererModules(ctx: Contexte): ModuleFormation[] {
  if (compter(ctx.volumes.modulesFormation, [0, 5, 5, 5]) === 0) return [];
  return MODULES.map(([titre, dureeMin], i) => ({ id: cle('mf', i + 1, 3), rang: i + 1, titre, dureeMin }));
}

/** L'avancement des ÉQUIPES des clients qui ont une campagne, dans le parcours de cinq modules. */
export function genererParcours(ctx: Contexte, campagnes: readonly CampagneSensibilisation[], modules: readonly ModuleFormation[]): ParcoursFormation[] {
  if (modules.length === 0 || compter(ctx.volumes.parcoursFormation, [0, 1, 1, 1]) === 0) return [];
  const h = hasardDe(ctx.graine, 'parcoursFormation');
  const parEquipe = new Map<string, { clientId: number; equipe: string; plusGrosEnvoi: number }>();
  for (const c of campagnes) {
    for (const e of c.parEquipe) {
      const cleE = `${c.clientId}|${e.equipe}`;
      const vu = parEquipe.get(cleE);
      parEquipe.set(cleE, { clientId: c.clientId, equipe: e.equipe, plusGrosEnvoi: Math.max(vu?.plusGrosEnvoi ?? 0, e.envoyes) });
    }
  }
  return [...parEquipe.values()].sort((a, b) => a.clientId - b.clientId || a.equipe.localeCompare(b.equipe)).map((e, i) => {
    const termines = h.entier(0, modules.length);
    return {
      id: cle('pf', i + 1), clientId: e.clientId, equipe: e.equipe, effectif: Math.max(e.plusGrosEnvoi, e.equipe === 'Direction' ? h.entier(3, 4) : h.entier(3, 18)), modulesTermines: termines,
      avancementSuivantPourcent: termines < modules.length ? h.entier(0, 90) : 0,
      prochainQuizLe: termines < modules.length ? ajouterJours(ctx.aujourdhuiCyber, h.entier(3, 40)) : null,
    };
  });
}

/**
 * Les six dernières simulations de chaque client qui en a une, du plus ancien au plus récent : des totaux, avec un taux de clic qui
 * baisse en moyenne (les équipes progressent) sans que ce soit régulier.
 */
export function genererHistorique(ctx: Contexte, campagnes: readonly CampagneSensibilisation[]): HistoriqueCampagne[] {
  if (compter(ctx.volumes.historiqueCampagnes, [0, 1, 1, 1]) === 0) return [];
  const h = hasardDe(ctx.graine, 'historiqueCampagnes');
  const clients = [...new Set(campagnes.filter((c) => c.type === 'Simulation').map((c) => c.clientId))].sort((a, b) => a - b);
  const liste: HistoriqueCampagne[] = [];
  for (const clientId of clients) {
    const depart = 0.32 + h.reel() * 0.08;
    for (let rang = 1; rang <= 6; rang++) {
      const envoyes = h.entier(20, 45);
      const taux = Math.max(0.03, depart - (rang - 1) * 0.04 + (h.reel() - 0.5) * 0.06);
      const cliques = Math.min(envoyes, Math.round(envoyes * taux));
      liste.push({
        id: cle('hc', liste.length + 1), clientId, rang, le: ajouterJours(ctx.aujourdhuiCyber, -(6 - rang) * 30 - h.entier(30, 40)), envoyes, cliques,
        signales: Math.min(envoyes - cliques, Math.round(envoyes * (0.1 + rang * 0.05 + (h.reel() - 0.5) * 0.06))),
      });
    }
  }
  return liste;
}

/** Utilitaire des gardes : les appareils d'un client. */
export const appareilsDe = (appareils: readonly AppareilParc[], clientId: number): AppareilParc[] => appareils.filter((a) => a.clientId === clientId);
