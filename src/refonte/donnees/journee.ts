/**
 * LES JEUX DE « MA JOURNÉE » AJOUTÉS PAR LOT-01 (STATUT §1.36) — priorités du jour, engagements des défis, utilisateurs
 * connectés par jour, historique de la Boîte à zéro.
 *
 * Les priorités du jour ont la forme de la collection `dailyPriorities` de l'application (`PrioritiesScreen`) : un
 * enregistrement par personne et par jour, jusqu'à trois priorités, chacune avec son instant de clôture. C'est d'elles que
 * vient la série (L01, N01, H04, H25) : « la journée compte à la clôture des priorités du jour ».
 */

import { cle, fabriquer, hasardDe, salaries } from './commun';
import { moi } from './equipe';
import { ajouterJours, compter, estOuvre, instantParis, iso, jourSemaine, type Jour } from './outils';
import type { Contexte, Membre, Tache } from './types';
import type { Defi, EngagementDefi, JourBoiteAZero, JourDeConnexions, JourDePriorites } from './types-suite';

const MIN = 60_000;

/** Les `n` derniers jours ouvrés jusqu'à aujourd'hui compris (le plus ancien d'abord). */
export function derniersJoursOuvres(aujourdhui: Jour, n: number): Jour[] {
  const jours: Jour[] = [];
  let j = aujourdhui;
  while (jours.length < n) {
    if (estOuvre(j)) jours.unshift(j);
    j = ajouterJours(j, -1);
  }
  return jours;
}

/** L'identifiant d'un enregistrement, comme `PrioritiesScreen` le fabrique. */
export const idDePriorites = (email: string, jour: Jour): string => `prio-${email.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${jour}`;

const GENERIQUES = ['Relire le devis en cours', 'Répondre aux messages clients', 'Préparer le point de la semaine', 'Mettre à jour le suivi', 'Appeler un client à rappeler', 'Ranger les documents du jour'] as const;

export function genererPriorites(ctx: Contexte, equipe: readonly Membre[], taches: readonly Tache[]): JourDePriorites[] {
  const h = hasardDe(ctx.graine, 'dailyPriorities');
  const n = compter(ctx.volumes.dailyPriorities, [0, 12, 40, 120]);
  if (n === 0) return [];
  const jours = derniersJoursOuvres(ctx.aujourdhui, n);
  const moiEmail = moi(equipe).email;
  const gens = salaries(equipe);
  const personnes = [gens.find((g) => g.email === moiEmail) ?? gens[0], ...gens.filter((g) => g.email !== moiEmail)].filter((p): p is Membre => p !== undefined).slice(0, compter(ctx.volumes.dailyPriorities, [0, 2, 5, 8]));
  const liste: JourDePriorites[] = [];
  for (const p of personnes) {
    const estMoi = p.email === moiEmail;
    jours.forEach((jour, k) => {
      const depuisFin = jours.length - 1 - k; // 0 = aujourd'hui
      const aujourdhui = depuisFin === 0;
      // « Moi » : six journées bouclées d'affilée avant aujourd'hui (le jalon « Série de 5 » obtenu, le palier de 10 à quatre jours),
      // une journée manquée juste avant (la série n'est pas éternelle), puis un historique varié.
      let sorte: 'bouclee' | 'manquee' | 'pas-jouee';
      if (estMoi && depuisFin >= 1 && depuisFin <= 6) sorte = 'bouclee';
      else if (estMoi && depuisFin === 7) sorte = 'manquee';
      else sorte = h.pondere([['bouclee', 78], ['manquee', 12], ['pas-jouee', 10]] as const);
      if (aujourdhui) sorte = 'manquee'; // la journée d'aujourd'hui n'est pas finie
      if (sorte === 'pas-jouee') return;
      const doubles = taches.filter((t) => t.assigneeEmail === p.email && t.echeance === jour).map((t) => t.title);
      const libelles = [...doubles, ...GENERIQUES.slice((k + p.email.length) % 3)].slice(0, 3);
      const faitsAujourdhui = estMoi ? 2 : h.entier(0, 2);
      const items = libelles.map((label, i) => {
        let doneAt: string | null;
        if (sorte === 'bouclee') doneAt = iso(instantParis(jour, `${String(9 + i * 3).padStart(2, '0')}:${String(10 + ((k * 7 + i * 13) % 45)).padStart(2, '0')}`));
        else if (aujourdhui) doneAt = i < faitsAujourdhui ? iso(Math.min(ctx.maintenant - (20 + i * 25) * MIN, instantParis(jour, `${String(8 + i).padStart(2, '0')}:20`))) : null;
        else if (i < libelles.length - 1) doneAt = iso(instantParis(jour, `${String(10 + i * 3).padStart(2, '0')}:15`));
        // La dernière priorité d'une journée manquée : soit jamais faite, soit rattrapée le lendemain (après la clôture, donc la journée reste manquée).
        else doneAt = (k + p.email.length) % 2 === 0 ? null : iso(instantParis(ajouterJours(jour, estOuvre(ajouterJours(jour, 1)) ? 1 : 3), '09:05'));
        return { id: `${idDePriorites(p.email, jour)}-${i + 1}`, label, doneAt };
      });
      const faits = items.map((i) => i.doneAt).filter((x): x is string => x !== null && Date.parse(x) <= ctx.maintenant).sort();
      liste.push({
        id: idDePriorites(p.email, jour),
        email: p.email,
        day: jour,
        // Une priorité rattrapée « dans le futur » (demain, pour un jour d'aujourd'hui) n'existe pas : seul le passé se lit.
        items: items.map((i) => (i.doneAt !== null && Date.parse(i.doneAt) > ctx.maintenant ? { ...i, doneAt: null } : i)),
        updatedAt: faits.length ? faits[faits.length - 1] : iso(Math.min(ctx.maintenant - 5 * MIN, instantParis(jour, '08:40'))),
      });
    });
  }
  return liste.sort((a, b) => b.day.localeCompare(a.day) || a.email.localeCompare(b.email));
}

/** L07 : l'engagement écrit de chaque participant d'un défi ; une personne sur quatre n'a pas encore écrit le sien. */
export function genererEngagements(ctx: Contexte, defis: readonly Defi[]): EngagementDefi[] {
  const h = hasardDe(ctx.graine, 'engagementsDefis');
  const textes = ['Je relance les factures en retard chaque lundi.', 'Je réponds aux messages des clients avant midi.', 'Je note chaque soir ce qui a bien marché.', 'Je prépare les devis la veille.', 'Je vérifie les sauvegardes le vendredi.'] as const;
  const liste: Omit<EngagementDefi, 'id'>[] = [];
  for (const d of defis) {
    d.participants.forEach((email, k) => {
      if (h.chance(0.25)) return;
      liste.push({ defiId: d.id, email, texte: textes[(k + d.titre.length) % textes.length], le: [d.debutLe, ajouterJours(ctx.aujourdhui, -1)].sort().at(-1) as Jour });
    });
  }
  return liste.map((e, i) => ({ ...e, id: cle('eg', i + 1) }));
}

/** G08 : les utilisateurs connectés par jour, côté client. Moins le week-end ; aujourd'hui est en cours. */
export function genererConnexions(ctx: Contexte): JourDeConnexions[] {
  const h = hasardDe(ctx.graine, 'utilisateursConnectes');
  const n = compter(ctx.volumes.utilisateursConnectes, [0, 7, 30, 30]);
  return fabriquer(n, (k) => {
    const jour = ajouterJours(ctx.aujourdhui, -(n - k));
    const semaine = jourSemaine(jour) <= 5 ? 1 : 0.4;
    const part = jour === ctx.aujourdhui ? 0.55 : 1;
    return { id: cle('uc', k, 3), jour, connectes: Math.round((h.entier(150, 260) * semaine) * part) };
  });
}

/** N01, H04 : la Boîte à zéro. Zéro atteint aujourd'hui et les deux jours ouvrés d'avant (« 3 jours, série en cours »), un historique varié avant. */
export function genererBoiteAZero(ctx: Contexte): JourBoiteAZero[] {
  const h = hasardDe(ctx.graine, 'boiteAZero');
  const n = compter(ctx.volumes.boiteAZero, [0, 7, 30, 60]);
  if (n === 0) return [];
  const jours = derniersJoursOuvres(ctx.aujourdhui, n);
  return jours.map((jour, k) => {
    const depuisFin = jours.length - 1 - k;
    const zero = depuisFin <= 2 ? true : depuisFin === 3 ? false : h.chance(0.55);
    // Aujourd'hui : zéro atteint ce matin, puis quelques messages arrivés depuis ; les autres jours : le compte de fin de journée.
    const aTraiter = depuisFin === 0 ? h.entier(0, 3) : zero ? 0 : h.entier(1, 14);
    return { id: cle('bz', k + 1, 3), jour, aTraiter, zeroAtteint: zero };
  });
}
