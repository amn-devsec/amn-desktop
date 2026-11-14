/**
 * LES JEUX « L'ARGENT » — devis, factures, paiements, dépenses, abonnements,
 * contrats, comptes et mouvements bancaires, enveloppes (lot 04 : G03, H07, H08,
 * MA01, MA03, MA04, MA05, MA06, MA07, MA09, MA10, F30).
 *
 * Les chiffres se RECOUPENT, contrairement aux maquettes (04-ECARTS : 9 640 €
 * ici, 18 420 € là). Une facture payée a un paiement, qui a un mouvement
 * bancaire ; une facture échue non réglée fait un impayé ; un devis accepté a
 * sa facture. Tout en centimes entiers, TTC sauf mention contraire.
 *
 * Aucun numéro de carte, aucun IBAN complet, aucune clé : les paiements ne
 * portent que des totaux et des références inventées.
 */

import { CATEGORIES_DEPENSE, DEPENSES_TYPES, PRESTATIONS } from './fond';
import {
  ajouterJours, arrondir, centimes, compter, debutDeMois, ecartJours, graineDe, hasard, instantParis, iso, lundiDe, tva, type Hasard, type Jour,
} from './outils';
import type {
  Abonnement, CompteBancaire, Contexte, Contrat, Depense, Devis, Enveloppe, Facture, LigneFacturee, FicheClient, Membre, Mouvement, Paiement,
} from './types';
import type { InvoiceLine } from '../../shared/api';

/* ------------------------------ Totaux ------------------------------ */

export interface Totaux {
  htCents: number;
  tvaCents: number;
  ttcCents: number;
}

/** Totaux d'une liste de lignes : la TVA est calculée PAR TAUX sur la somme HT (arrondi au centime), comme H07. */
export function totauxDeLignes(lignes: readonly InvoiceLine[]): Totaux {
  const parTaux = new Map<number, number>();
  let ht = 0;
  for (const l of lignes) {
    const total = Math.round(l.quantity * l.unitPriceCents);
    ht += total;
    parTaux.set(l.vatRate, (parTaux.get(l.vatRate) ?? 0) + total);
  }
  let t = 0;
  for (const [taux, base] of parTaux) t += tva(base, taux);
  return { htCents: ht, tvaCents: t, ttcCents: ht + t };
}

export const totauxDeFacture = (f: Pick<Facture, 'lines'>): Totaux => totauxDeLignes(f.lines);

/** Le statut AFFICHÉ d'une facture (G03, MA04) : « En retard » se déduit, il ne se stocke pas. */
export function statutAffiche(f: Pick<Facture, 'status' | 'dueAt'>, aujourdhui: Jour): 'Brouillon' | 'Envoyée' | 'En retard' | 'Payée' | 'Annulée' {
  if (f.status === 'draft') return 'Brouillon';
  if (f.status === 'cancelled') return 'Annulée';
  if (f.status === 'paid') return 'Payée';
  return f.dueAt < aujourdhui ? 'En retard' : 'Envoyée';
}

/* -------------------------------- Devis -------------------------------- */

/** Les taux de TVA des lignes : surtout 20 %, un peu de 10 % (travaux, restauration) et de 5,5 % (livres, alimentation). */
const tauxDeTva = (h: Hasard): number => h.pondere([[20, 86], [10, 9], [5.5, 5]] as const);

function lignesAleatoires(h: Hasard, nombre: number): LigneFacturee[] {
  const uniques = PRESTATIONS.filter((p) => p[2] === null);
  return h.echantillon(uniques, nombre).map(([libelle, prix], k) => ({
    id: `l-${k + 1}`,
    label: libelle,
    quantity: h.pondere([[1, 7], [2, 2], [3, 1]] as const),
    unitPriceCents: arrondir(centimes(prix * h.choix([0.9, 1, 1, 1.1])), 1000),
    prixGrilleCents: arrondir(centimes(prix), 1000),
    vatRate: tauxDeTva(h),
  }));
}

/**
 * Lignes d'une facture libre (hors devis) : tantôt un petit montant récurrent
 * (maintenance, hébergement : quelques dizaines à quelques centaines d'euros),
 * tantôt une prestation ponctuelle. C'est ce mélange qui donne des factures de
 * 54 € comme de 5 000 €, et des niveaux de fidélité variés.
 */
function lignesFacture(h: Hasard): LigneFacturee[] {
  if (!h.chance(0.45)) return lignesAleatoires(h, h.entier(1, 2));
  const recurrentes = PRESTATIONS.filter((p) => p[2] === 'mois');
  return h.echantillon(recurrentes, h.entier(1, 2)).map(([libelle, prix], k) => ({
    id: `l-${k + 1}`,
    label: libelle,
    quantity: h.pondere([[1, 5], [2, 2], [3, 2], [6, 1]] as const),
    unitPriceCents: centimes(prix),
    prixGrilleCents: centimes(prix),
    vatRate: tauxDeTva(h),
  }));
}

const PALIERS = ['simple', 'standard', 'premium'] as const;

export function genererDevis(ctx: Contexte, clients: readonly FicheClient[]): Devis[] {
  const h = hasard(graineDe(ctx.graine, 'devis'));
  const n = clients.length === 0 ? 0 : compter(ctx.volumes.devis, [0, 6, 40, 260]);
  const liste: Devis[] = [];
  for (let i = 1; i <= n; i += 1) {
    const c = h.choix(clients);
    const age = Math.floor(h.reel() ** 1.6 * 360) + 1; // surtout récent
    const statut = (age <= 10
      ? h.pondere([['draft', 25], ['sent', 60], ['accepted', 10], ['refused', 5]] as const)
      : age <= 45
        ? h.pondere([['draft', 5], ['sent', 25], ['accepted', 50], ['refused', 20]] as const)
        : h.pondere([['draft', 2], ['sent', 6], ['accepted', 62], ['refused', 30]] as const));
    const lignes = lignesAleatoires(h, h.entier(1, 3));
    const t = totauxDeLignes(lignes);
    const creeLe = ajouterJours(ctx.aujourdhui, -age);
    const envoyeLe = statut === 'draft' ? null : ajouterJours(creeLe, h.entier(0, 3));
    const reponseLe = envoyeLe && (statut === 'accepted' || statut === 'refused') ? ajouterJours(envoyeLe, h.entier(1, 20)) : null;
    const reponseOk = reponseLe && reponseLe <= ctx.aujourdhui ? reponseLe : null;
    const statutFinal = statut === 'accepted' || statut === 'refused' ? (reponseOk ? statut : 'sent') : statut;
    const prestation = lignes[0].label;
    liste.push({
      id: i,
      clientId: c.id,
      title: prestation,
      detail: lignes.length > 1 ? `${lignes.length} prestations : ${lignes.map((l) => l.label.toLowerCase()).join(', ')}.` : 'Prestation unique.',
      trackerTier: h.choix(PALIERS),
      priceEuro: t.htCents / 100,
      status: statutFinal,
      paymentStatus: 'unpaid',
      sentAt: envoyeLe ?? undefined,
      createdAt: iso(instantParis(creeLe, '10:00')),
      updatedAt: iso(instantParis(reponseOk ?? envoyeLe ?? creeLe, '15:30')),
      numero: `D-${creeLe.slice(0, 4)}-${String(i).padStart(4, '0')}`,
      clientNom: c.company || c.name,
      lignes,
      validiteJusquau: ajouterJours(envoyeLe ?? creeLe, 30),
      vuAt: statutFinal === 'sent' && h.chance(0.55) ? iso(instantParis(ajouterJours(envoyeLe ?? creeLe, 1), '11:20')) : statutFinal === 'accepted' || statutFinal === 'refused' ? iso(instantParis(ajouterJours(envoyeLe ?? creeLe, 1), '09:40')) : null,
      acceptéLe: statutFinal === 'accepted' ? reponseOk : null,
      refuséLe: statutFinal === 'refused' ? reponseOk : null,
      prestation,
    });
  }
  return liste.sort((a, b) => a.id - b.id);
}

/* ------------------------------- Factures ------------------------------- */

const MOYENS = ['virement', 'carte', 'prélèvement', 'chèque'] as const;

export function genererFactures(ctx: Contexte, clients: readonly FicheClient[], devis: Devis[], termeJours: number): Facture[] {
  const h = hasard(graineDe(ctx.graine, 'factures'));
  const cible = clients.length === 0 ? 0 : compter(ctx.volumes.factures, [0, 8, 70, 700]);
  const brutes: Omit<Facture, 'number' | 'id'>[] = [];
  const parId = new Map(clients.map((c) => [c.id, c]));
  // Profil de paiement d'un client : la plupart paient à l'heure, certains en retard, quelques-uns très en retard.
  const profil = new Map<number, 'ponctuel' | 'tardif' | 'lent'>();
  for (const c of clients) profil.set(c.id, h.pondere([['ponctuel', 70], ['tardif', 22], ['lent', 8]] as const));

  const fabriquer = (c: FicheClient, lignes: LigneFacturee[], emisLe: Jour, quoteId: number | null, brouillon: boolean): Omit<Facture, 'number' | 'id'> => {
    const delai = h.pondere([[termeJours, 7], [15, 1], [45, 1], [0, 1]] as const);
    const echeance = ajouterJours(emisLe, delai);
    const p = profil.get(c.id) ?? 'ponctuel';
    const ecart = p === 'ponctuel' ? h.entier(-6, 3) : p === 'tardif' ? h.entier(5, 22) : h.entier(25, 65);
    // On ne paie jamais avant d'avoir reçu la facture : un règlement « en avance » sur une échéance immédiate tombe au plus tôt le jour d'émission.
    const brutPaiement = ajouterJours(echeance, ecart);
    const paiement = brutPaiement < emisLe ? ajouterJours(emisLe, h.entier(0, 2)) : brutPaiement;
    let status: Facture['status'] = brouillon ? 'draft' : paiement <= ctx.aujourdhui ? 'paid' : 'issued';
    let annulee = '';
    if (!brouillon && h.chance(0.02)) {
      status = 'cancelled';
      annulee = h.choix(['Erreur de montant, facture refaite.', 'Doublon d’une facture déjà émise.', 'Prestation annulée par le client.']);
    }
    const creeMs = instantParis(brouillon ? ctx.aujourdhui : emisLe, '09:00');
    return {
      clientId: c.id,
      billTo: { name: c.name, company: c.company, email: c.email, address: c.adresse, vatNumber: '' },
      issuedAt: brouillon ? '' : emisLe,
      dueAt: brouillon ? '' : echeance,
      lines: lignes,
      status,
      paidAt: status === 'paid' ? paiement : '',
      paymentMethod: status === 'paid' ? h.pondere([['virement', 5], ['carte', 3], ['prélèvement', 1.5], ['chèque', 0.8]] as const) : '',
      cancelReason: annulee,
      notes: h.chance(0.15) ? 'Merci de rappeler le numéro de facture dans votre règlement.' : '',
      quoteId,
      kind: 'invoice',
      createdAt: iso(creeMs),
      updatedAt: iso(instantParis(status === 'paid' ? paiement : emisLe, '12:00')),
      clientNom: c.company || c.name,
      responsableEmail: c.responsableEmail,
      soldeCents: 0,
    };
  };

  // 1. Chaque devis accepté (ou presque) donne sa facture.
  for (const d of devis) {
    if (brutes.length >= cible) break;
    if (d.status !== 'accepted' || !d.acceptéLe || !h.chance(0.85)) continue;
    const c = parId.get(d.clientId);
    if (!c) continue;
    const emisLe = ajouterJours(d.acceptéLe, h.entier(1, 12));
    if (emisLe > ctx.aujourdhui) continue;
    brutes.push(fabriquer(c, d.lignes.map((l) => ({ ...l })), emisLe, d.id, false));
  }
  // 2. Le reste du volume : factures libres (abonnements facturés, travaux courants), quelques brouillons.
  while (brutes.length < cible) {
    const c = h.choix(clients);
    const age = Math.floor(h.reel() ** 1.4 * 420) + 1;
    const brouillon = h.chance(0.04);
    brutes.push(fabriquer(c, lignesFacture(h), ajouterJours(ctx.aujourdhui, -age), null, brouillon));
  }

  // Garanties : un écran de factures ne se teste pas s'il lui manque un cas. Quel que soit le tirage, dès que le
  // volume le permet, il existe au moins un impayé, un brouillon et une facture annulée.
  const garantir = (): void => {
    const n = brutes.length;
    const enRetard = (f: Omit<Facture, 'number' | 'id'>) => f.status === 'issued' && f.dueAt < ctx.aujourdhui;
    const manque = Math.max(n >= 6 ? 1 : 0, Math.round(n * 0.09)) - brutes.filter(enRetard).length;
    if (manque > 0) {
      // 1. de préférence une facture réglée il y a peu, redevenue impayée ; 2. sinon n'importe quelle facture réglée plus ancienne ;
      // 3. sinon une facture libre non encore échue, ramenée dans le passé.
      // Les règlements du mois précédent et de ce mois-ci (animerLaSemaine, encaisseAujourdhui) restent réglés.
      const intouchables = debutDeMois(ajouterJours(debutDeMois(ctx.aujourdhui), -1));
      const payees = brutes.filter((f) => f.status === 'paid' && f.paidAt < intouchables && f.dueAt <= ajouterJours(ctx.aujourdhui, -2)).sort((a, b) => b.dueAt.localeCompare(a.dueAt));
      const recentes = payees.filter((f) => f.dueAt >= ajouterJours(ctx.aujourdhui, -45));
      const choisies = [...recentes, ...payees.filter((f) => !recentes.includes(f))].slice(0, manque);
      for (const f of choisies) {
        f.status = 'issued';
        f.paidAt = '';
        f.paymentMethod = '';
      }
      let reste = manque - choisies.length;
      for (const f of brutes.filter((x) => x.status === 'issued' && x.dueAt >= ctx.aujourdhui && x.quoteId === null)) {
        if (reste <= 0) break;
        const delai = ecartJours(f.issuedAt, f.dueAt);
        f.dueAt = ajouterJours(ctx.aujourdhui, -h.entier(3, 20));
        f.issuedAt = ajouterJours(f.dueAt, -delai);
        reste -= 1;
      }
    }
    if (n >= 20 && !brutes.some((f) => f.status === 'draft')) {
      const f = brutes.find((x) => x.quoteId === null && x.status === 'issued' && x.issuedAt >= ajouterJours(ctx.aujourdhui, -10));
      if (f) Object.assign(f, { status: 'draft', issuedAt: '', dueAt: '', paidAt: '', paymentMethod: '' });
    }
    if (n >= 40 && !brutes.some((f) => f.status === 'cancelled')) {
      const f = brutes.find((x) => x.quoteId === null && x.status === 'issued' && x.dueAt >= ctx.aujourdhui);
      if (f) Object.assign(f, { status: 'cancelled', cancelReason: 'Doublon d’une facture déjà émise.' });
    }
  };
  // N01 « L'argent aujourd'hui » : dès qu'il y a de quoi, un règlement est tombé ce matin.
  const encaisseAujourdhui = (): void => {
    if (brutes.length < 8 || brutes.some((f) => f.status === 'paid' && f.paidAt === ctx.aujourdhui)) return;
    const f = brutes.find((x) => x.status === 'issued' && x.quoteId === null && x.dueAt >= ajouterJours(ctx.aujourdhui, -1) && x.issuedAt <= ctx.aujourdhui)
      ?? brutes.find((x) => x.status === 'issued' && x.issuedAt <= ctx.aujourdhui);
    if (f) Object.assign(f, { status: 'paid', paidAt: ctx.aujourdhui, paymentMethod: 'virement' });
  };
  // H04 (« Encaissé, +12 % ») et H25 (« Chiffre d'affaires, +9 % ») comparent la semaine ou le mois à la période d'avant :
  // il faut des règlements dans la semaine en cours ET dans la précédente (deux chacune dès « normal » ; « peu », avec huit factures, en a quand les factures s'y prêtent).
  const animerLaSemaine = (): void => {
    if (brutes.length < 8) return;
    const lundi = lundiDe(ctx.aujourdhui);
    const parSemaine = brutes.length >= 20 ? 2 : 1;
    const jours = [ajouterJours(lundi, 0), ajouterJours(lundi, 2), ajouterJours(lundi, -7 + 1), ajouterJours(lundi, -7 + 3)].filter((j) => j <= ctx.aujourdhui);
    const cette = jours.filter((j) => j >= lundi).slice(0, parSemaine);
    const avant = jours.filter((j) => j < lundi).slice(0, parSemaine);
    // H25 (« +9 % ce mois ») et G08 comparent le mois à la même date du mois d'avant : le mois précédent a ses règlements, tôt dans le mois.
    const debutPrecedent = debutDeMois(ajouterJours(debutDeMois(ctx.aujourdhui), -1));
    const moisPrecedent = [ajouterJours(debutPrecedent, 1), ajouterJours(debutPrecedent, 4)].slice(0, parSemaine);
    for (const j of [...cette, ...avant, ...moisPrecedent]) {
      if (brutes.filter((f) => f.status === 'paid' && f.paidAt === j).length > 0) continue;
      const f = brutes.find((x) => x.status === 'issued' && x.issuedAt !== '' && x.issuedAt <= j && x.quoteId === null);
      if (f) Object.assign(f, { status: 'paid', paidAt: j, paymentMethod: 'virement', updatedAt: iso(instantParis(j, '12:00')) });
    }
  };
  garantir();
  encaisseAujourdhui();
  animerLaSemaine();
  garantir();

  // Numérotation continue, sans trou, dans l'ordre d'émission ; les brouillons n'ont pas de numéro.
  const emises = brutes.filter((f) => f.issuedAt).sort((a, b) => a.issuedAt.localeCompare(b.issuedAt) || a.clientId - b.clientId);
  const suite = new Map<string, number>();
  const numeros = new Map<Omit<Facture, 'number' | 'id'>, string>();
  for (const f of emises) {
    const an = f.issuedAt.slice(0, 4);
    const k = (suite.get(an) ?? 0) + 1;
    suite.set(an, k);
    numeros.set(f, `${an}-${String(k).padStart(4, '0')}`);
  }
  const factures: Facture[] = brutes
    .map((f, i) => ({ ...f, id: `fa-${String(i + 1).padStart(4, '0')}`, number: numeros.get(f) ?? '' }))
    .sort((a, b) => (b.issuedAt || '9999').localeCompare(a.issuedAt || '9999') || b.number.localeCompare(a.number));
  for (const f of factures) {
    if (f.status === 'issued') f.soldeCents = totauxDeFacture(f).ttcCents;
  }

  // Le statut de règlement du devis suit celui de sa facture.
  const parDevis = new Map(factures.filter((f) => f.quoteId !== null).map((f) => [f.quoteId as number, f]));
  for (const d of devis) {
    const f = parDevis.get(d.id);
    if (!f) continue;
    d.paymentStatus = f.status === 'paid' ? 'paid' : f.status === 'issued' ? (f.dueAt < ctx.aujourdhui ? 'late' : 'pending') : 'unpaid';
  }
  return factures;
}

/* -------------------------------- Avoirs -------------------------------- */

/**
 * Les avoirs (G03, H07, MA04) : des factures de nature `creditNote`, `AV-AAAA-NNNN`, qui réduisent une facture d'origine.
 * Sur une facture réglée, un avoir total ou partiel est un crédit à rembourser ou à reporter ; sur une facture encore due, un
 * avoir PARTIEL (jamais total : la facture reste due) baisse le reste dû, et `soldeCents` le dit.
 */
export function genererAvoirs(ctx: Contexte, factures: Facture[], paiements: readonly Paiement[] = []): Facture[] {
  const h = hasard(graineDe(ctx.graine, 'avoirs'));
  const eligibles = factures.filter((f) => (f.status === 'paid' || f.status === 'issued') && f.issuedAt !== '' && f.issuedAt <= ajouterJours(ctx.aujourdhui, -5) && (f.kind ?? 'invoice') === 'invoice' && !paiements.some((p) => p.factureId === f.id && p.etat === 'réussi'));
  const n = Math.min(compter(ctx.volumes.avoirs, [0, 1, 4, 30]), eligibles.length);
  if (n === 0) return [];
  // Un tiers sur des factures encore dues (avoir partiel), le reste sur des factures réglées.
  const dues = h.melanger(eligibles.filter((f) => f.status === 'issued'));
  const reglees = h.melanger(eligibles.filter((f) => f.status === 'paid'));
  const nDues = n >= 3 ? Math.min(dues.length, Math.ceil(n / 3)) : 0;
  const cibles = [...dues.slice(0, nDues), ...reglees.slice(0, n - nDues)];
  if (cibles.length < n) cibles.push(...[...dues.slice(nDues), ...reglees.slice(n - nDues)].slice(0, n - cibles.length));
  const bruts = cibles.map((f) => {
    const partiel = f.status === 'issued' || h.chance(0.4);
    const emis = [ajouterJours(f.issuedAt, 3 + h.entier(0, 25)), ctx.aujourdhui].sort()[0];
    return { f, partiel, emis };
  });
  const parAn = new Map<string, number>();
  const ordonnes = [...bruts].sort((a, b) => a.emis.localeCompare(b.emis) || a.f.id.localeCompare(b.f.id));
  const avoirs = ordonnes.map(({ f, partiel, emis }, i): Facture => {
    const an = emis.slice(0, 4);
    const k = (parAn.get(an) ?? 0) + 1;
    parAn.set(an, k);
    const lines = f.lines.map((l, j) => ({ ...l, id: `av-l-${i + 1}-${j + 1}`, quantity: partiel ? Math.max(0.5, Math.round((l.quantity / 2) * 100) / 100) : l.quantity }));
    const avoir: Facture = {
      ...f,
      id: `av-${String(i + 1).padStart(4, '0')}`,
      number: `AV-${an}-${String(k).padStart(4, '0')}`,
      issuedAt: emis,
      dueAt: emis,
      lines,
      status: 'issued',
      paidAt: '',
      paymentMethod: '',
      cancelReason: '',
      notes: `Avoir sur la facture ${f.number}.`,
      quoteId: null,
      kind: 'creditNote',
      creditNoteFor: f.id,
      createdAt: iso(instantParis(emis, '10:00')),
      updatedAt: iso(instantParis(emis, '10:00')),
      soldeCents: 0,
    };
    return avoir;
  });
  // Le reste dû d'une facture encore due baisse de ce que ses avoirs ont repris (jamais sous zéro).
  for (const f of factures) {
    if (f.status !== 'issued') continue;
    const repris = avoirs.filter((a) => a.creditNoteFor === f.id).reduce((s, a) => s + totauxDeFacture(a).ttcCents, 0);
    const regle = paiements.filter((p) => p.factureId === f.id && p.etat === 'réussi').reduce((s, p) => s + p.montantCents, 0);
    f.soldeCents = Math.max(0, totauxDeFacture(f).ttcCents - repris - regle);
  }
  return avoirs.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt) || b.number.localeCompare(a.number));
}

/* ------------------------------- Paiements ------------------------------- */

export function genererPaiements(ctx: Contexte, factures: readonly Facture[]): Paiement[] {
  const h = hasard(graineDe(ctx.graine, 'paiements'));
  const cap = compter(ctx.volumes.paiements, [0, 6, 50, 600]);
  const liste: Paiement[] = [];
  let k = 0;
  const ref = () => `PAY-${String(h.entier(100000, 999999))}`;
  const payees = factures.filter((f) => f.status === 'paid').sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  for (const f of payees) {
    const montant = totauxDeFacture(f).ttcCents;
    const moyen = (MOYENS.includes(f.paymentMethod as (typeof MOYENS)[number]) ? f.paymentMethod : 'virement') as Paiement['moyen'];
    const frais = moyen === 'carte' ? Math.round(montant * 0.014) + 25 : 0;
    // Une tentative par carte sur dix échoue d'abord, avant le paiement qui aboutit.
    if (moyen === 'carte' && h.chance(0.1)) {
      k += 1;
      liste.push({ id: `pay-${String(k).padStart(4, '0')}`, factureId: f.id, clientId: f.clientId, clientNom: f.clientNom, moyen, montantCents: montant, fraisCents: 0, etat: 'échoué', date: iso(instantParis(ajouterJours(f.paidAt, -1), '16:12')), reference: ref() });
    }
    k += 1;
    liste.push({
      id: `pay-${String(k).padStart(4, '0')}`,
      factureId: f.id,
      clientId: f.clientId,
      clientNom: f.clientNom,
      moyen,
      montantCents: montant,
      fraisCents: frais,
      etat: h.chance(0.015) ? 'remboursé' : 'réussi',
      date: iso(Math.min(instantParis(f.paidAt, `${String(h.entier(8, 17)).padStart(2, '0')}:${String(h.entier(0, 59)).padStart(2, '0')}`), ctx.maintenant - h.entier(10, 120) * 60_000)),
      reference: ref(),
    });
  }
  // Quelques virements annoncés mais pas encore arrivés, sur des factures encore dues.
  for (const f of factures.filter((x) => x.status === 'issued' && x.dueAt >= ajouterJours(ctx.aujourdhui, -2)).slice(0, 3)) {
    k += 1;
    liste.push({ id: `pay-${String(k).padStart(4, '0')}`, factureId: f.id, clientId: f.clientId, clientNom: f.clientNom, moyen: 'virement', montantCents: totauxDeFacture(f).ttcCents, fraisCents: 0, etat: 'en attente', date: iso(instantParis(ajouterJours(ctx.aujourdhui, -1), '17:45')), reference: ref() });
  }
  const base = liste.sort((a, b) => b.date.localeCompare(a.date)).slice(0, cap);
  // Des règlements partiels (G03, MA03) : une facture encore due dont le client a déjà versé une partie. Ils s'ajoutent hors plafond,
  // pour que le reste dû (`soldeCents`) corresponde toujours aux règlements présents.
  const enAttente = new Set(base.filter((p) => p.etat === 'en attente').map((p) => p.factureId));
  const eligibles = factures.filter((f) => f.status === 'issued' && f.issuedAt !== '' && f.issuedAt <= ajouterJours(ctx.aujourdhui, -3) && !enAttente.has(f.id));
  const nPartiels = Math.min(eligibles.length, compter(ctx.volumes.paiements, [0, 1, 4, 30]));
  const partiels: Paiement[] = [];
  h.melanger(eligibles).slice(0, nPartiels).forEach((f) => {
    const ttc = totauxDeFacture(f).ttcCents;
    const montant = Math.max(100, Math.round((ttc * (0.3 + h.entier(0, 3) * 0.1)) / 100) * 100);
    if (montant >= ttc) return;
    const jour = [ajouterJours(f.issuedAt, 2 + h.entier(0, 20)), ajouterJours(ctx.aujourdhui, -1)].sort()[0];
    k += 1;
    partiels.push({ id: `pay-${String(k).padStart(4, '0')}`, factureId: f.id, clientId: f.clientId, clientNom: f.clientNom, moyen: 'virement', montantCents: montant, fraisCents: 0, etat: 'réussi', date: iso(Math.min(instantParis(jour, '10:30'), ctx.maintenant - 60 * 60_000)), reference: ref() });
    f.soldeCents = Math.max(0, f.soldeCents - montant);
  });
  return [...base, ...partiels].sort((a, b) => b.date.localeCompare(a.date));
}

/* ------------------------------- Dépenses ------------------------------- */

export function genererDepenses(ctx: Contexte, equipe: readonly Membre[]): Depense[] {
  const h = hasard(graineDe(ctx.graine, 'depenses'));
  const n = compter(ctx.volumes.depenses, [0, 10, 60, 700]);
  const auteurs = equipe.filter((m) => m.role !== 'Partenaire');
  const liste: Depense[] = [];
  for (let i = 1; i <= n; i += 1) {
    const [libelle, fournisseur, categorie, moyen] = h.choix(DEPENSES_TYPES);
    const age = Math.floor(h.reel() ** 1.15 * 365);
    const jour = ajouterJours(ctx.aujourdhui, -age);
    const montant = arrondir(centimes(moyen * h.choix([0.6, 0.85, 1, 1, 1.2, 1.7, 2.6])), 10);
    const taux = categorie === 'deplacement' && h.chance(0.3) ? 10 : categorie === 'autre' && h.chance(0.4) ? 5.5 : 20;
    const recent = age <= 30;
    const justifie = h.chance(recent ? 0.55 : 0.93);
    const noteDeFrais = h.chance(0.25);
    const auteur = h.choix(auteurs);
    liste.push({
      id: `d-${String(i).padStart(4, '0')}`,
      amountCents: montant,
      category: categorie,
      spentAt: jour,
      note: libelle,
      photoDataUrl: '',
      createdAt: iso(instantParis(jour, '18:00')),
      updatedAt: iso(instantParis(jour, '18:00')),
      libelle,
      fournisseur,
      tvaCents: Math.round((montant * taux) / (100 + taux)),
      moyenPaiement: noteDeFrais ? 'carte' : h.choix(['carte', 'carte', 'virement', 'prélèvement'] as const),
      justificatif: justifie ? { statut: 'justifié', fichier: `justificatif-${String(i).padStart(4, '0')}.pdf` } : { statut: 'à justifier', fichier: null },
      auteurEmail: auteur.email,
      noteDeFrais,
      remboursee: noteDeFrais && age > 30 ? h.chance(0.95) : false,
    });
  }
  return liste.sort((a, b) => b.spentAt.localeCompare(a.spentAt));
}

/* ------------------------------ Abonnements ------------------------------ */

/** Prochain prélèvement : le prochain jour `jour` du mois strictement après aujourd'hui. */
function prochainPrelevement(aujourdhui: Jour, jour: number): Jour {
  const [a, m] = aujourdhui.split('-').map(Number);
  const essai = (an: number, mois: number): Jour => `${an}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
  const ce = essai(a, m);
  if (ce > aujourdhui) return ce;
  return m === 12 ? essai(a + 1, 1) : essai(a, m + 1);
}

const PLANS = PRESTATIONS.filter((p) => p[2] === 'mois');

export function genererAbonnements(ctx: Contexte, clients: readonly FicheClient[]): Abonnement[] {
  const h = hasard(graineDe(ctx.graine, 'abonnements'));
  const n = clients.length === 0 ? 0 : Math.min(compter(ctx.volumes.abonnements, [0, 3, 14, 90]), clients.length);
  // G08 : le revenu récurrent bouge d'un mois à l'autre parce que des clients récents s'abonnent.
  const recents = clients.filter((c) => c.debutLe >= ajouterJours(ctx.aujourdhui, -30)).sort((a, b) => b.debutLe.localeCompare(a.debutLe)).slice(0, Math.min(3, Math.floor(n / 3)));
  const echantillon = h.echantillon(clients, n);
  const choisis = [...recents, ...echantillon.filter((c) => !recents.includes(c))].slice(0, n);
  return choisis.map((c, i) => {
    const [plan, prix] = h.choix(PLANS);
    const jour = h.entier(1, 28);
    const tire = h.pondere([['Actif', 80], ['Paiement échoué', 8], ['En pause', 6], ['Résilié', 6]] as const);
    const recent = recents.includes(c);
    const etat = recent ? 'Actif' : tire;
    const resilie = etat === 'Résilié' ? ajouterJours(ctx.aujourdhui, -h.entier(5, 120)) : null;
    const remise = h.chance(0.2) ? 0.9 : 1;
    return {
      id: `ab-${String(i + 1).padStart(3, '0')}`,
      clientId: c.id,
      clientNom: c.company || c.name,
      plan,
      montantMensuelCents: Math.round(centimes(prix) * remise),
      depuis: recent ? [ajouterJours(c.debutLe, h.entier(0, 3)), ctx.aujourdhui].sort()[0] : ajouterJours(ctx.aujourdhui, -h.entier(20, 700)),
      jourPrelevement: jour,
      prochainPrelevementLe: etat === 'Résilié' || etat === 'En pause' ? null : prochainPrelevement(ctx.aujourdhui, jour),
      etat,
      resilieLe: resilie,
    };
  });
}

/* ------------------------------- Contrats ------------------------------- */

export function genererContrats(ctx: Contexte, clients: readonly FicheClient[]): Contrat[] {
  const h = hasard(graineDe(ctx.graine, 'contrats'));
  const n = clients.length === 0 ? 0 : Math.min(compter(ctx.volumes.contrats, [0, 3, 12, 70]), clients.length);
  return h.echantillon(clients, n).map((c, i) => {
    const periode = h.pondere([['Annuel', 5], ['Trimestriel', 2], ['Mensuel', 3]] as const);
    const parAn = h.choix([1400, 1800, 2400, 3200]);
    const valeur = periode === 'Annuel' ? centimes(parAn) : periode === 'Trimestriel' ? centimes(parAn / 4) : centimes(parAn / 12);
    const debutLe = ajouterJours(ctx.aujourdhui, -h.entier(30, 900));
    const duree = periode === 'Annuel' ? 365 : periode === 'Trimestriel' ? 91 : 30;
    // Échéance = prochain anniversaire de la période à venir.
    let echeance = ajouterJours(debutLe, duree);
    while (echeance < ajouterJours(ctx.aujourdhui, -h.entier(0, 40)) && h.chance(0.8)) echeance = ajouterJours(echeance, duree);
    const reste = ecartJours(ctx.aujourdhui, echeance);
    const etat: Contrat['etat'] = h.chance(0.06) ? 'Résilié' : reste < 0 ? 'Expiré' : reste <= 60 ? 'À renouveler' : 'En cours';
    return {
      id: `co-${String(i + 1).padStart(3, '0')}`,
      nom: `${h.choix(['Supervision', 'Maintenance', 'Assistance', 'Accompagnement'])} ${periode.toLowerCase().replace('annuel', 'annuelle').replace('mensuel', 'mensuelle').replace('trimestriel', 'trimestrielle')}`,
      clientId: c.id,
      clientNom: c.company || c.name,
      periode,
      valeurParPeriodeCents: valeur,
      debutLe,
      echeanceLe: echeance,
      reconduction: h.chance(0.7) ? 'tacite' : 'manuelle',
      etat,
    };
  });
}

/* ---------------------- Comptes et mouvements bancaires ---------------------- */

export function genererComptes(ctx: Contexte): CompteBancaire[] {
  const h = hasard(graineDe(ctx.graine, 'comptes'));
  const n = compter(ctx.volumes.comptes, [0, 1, 2, 3]);
  const modeles: readonly (readonly [string, number])[] = [['Compte courant', 0], ['Compte d’épargne', 1], ['Compte carte', 2]];
  return modeles.slice(0, n).map(([nom], i) => ({
    id: `cb-${i + 1}`,
    nom,
    etablissement: 'Banque Exemple',
    ibanFin: String(h.entier(1000, 9999)),
    soldeCents: 0,
    synchroniseLe: iso(ctx.maintenant - h.entier(10, 50) * 60_000),
    accesLectureSeule: true,
    historique: [],
  }));
}

export function genererMouvements(
  ctx: Contexte,
  comptes: CompteBancaire[],
  paiements: readonly Paiement[],
  depenses: readonly Depense[],
  abonnements: readonly Abonnement[],
  factures: readonly Facture[],
  /** Net mensuel des bulletins de paie (MA11), pour que les prélèvements « Salaires » s'y recoupent. */
  salairesMensuelsCents: number | null = null,
  /** Les échéances fiscales (MA08) : celles à payer deviennent des sorties prévues (H09, MA07 « À venir »). */
  echeances: readonly { intitule: string; echeanceLe: Jour; montantCents: number | null; paiement: string }[] = [],
): Mouvement[] {
  const h = hasard(graineDe(ctx.graine, 'mouvements'));
  if (comptes.length === 0) return [];
  const principal = comptes[0];
  const liste: Omit<Mouvement, 'id' | 'echue'>[] = [];
  const il = ajouterJours(ctx.aujourdhui, -150);

  for (const p of paiements) {
    if (p.etat !== 'réussi' || p.date.slice(0, 10) < il) continue;
    liste.push({ compteId: principal.id, libelle: `Règlement ${p.clientNom}`, nature: 'Encaissement', categorie: 'Ventes', date: jourDeIso(p.date), montantCents: p.montantCents - p.fraisCents, reel: true, rapprochement: h.chance(0.88) ? 'rapproché' : 'à vérifier', lien: { type: 'paiement', id: p.id }, recurrent: false });
  }
  for (const d of depenses) {
    if (d.spentAt < il || d.noteDeFrais) continue;
    liste.push({ compteId: principal.id, libelle: d.fournisseur, nature: 'Paiement', categorie: libelleCategorie(d.category), date: d.spentAt, montantCents: -d.amountCents, reel: true, rapprochement: d.justificatif.statut === 'justifié' ? 'rapproché' : 'à vérifier', lien: { type: 'depense', id: d.id }, recurrent: false });
  }
  // Charges fixes : un loyer et des salaires mensuels, un abonnement logiciel.
  const fixes: readonly (readonly [string, string, number, number])[] = [['Loyer du local', 'Locaux', -120_000, 3], ['Salaires', 'Personnel', -(salairesMensuelsCents ?? 480_000), 28], ['Assurance professionnelle', 'Assurances', -9_600, 12]];
  for (let mois = 5; mois >= 0; mois -= 1) {
    for (const [libelle, categorie, montant, jour] of fixes) {
      const [a, m] = ajouterJours(ctx.aujourdhui, -30 * mois).split('-').map(Number);
      const date = `${a}-${String(m).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
      if (date <= ctx.aujourdhui && date >= il) liste.push({ compteId: principal.id, libelle, nature: 'Prélèvement', categorie, date, montantCents: montant, reel: true, rapprochement: h.chance(0.7) ? 'rapproché' : 'à vérifier', lien: { type: 'manuel', id: null }, recurrent: true });
    }
  }
  for (const ab of abonnements) {
    if (ab.etat !== 'Actif' && ab.etat !== 'Paiement échoué') continue;
    for (let mois = 3; mois >= 1; mois -= 1) {
      const [a, m] = ajouterJours(ctx.aujourdhui, -30 * mois).split('-').map(Number);
      const date = `${a}-${String(m).padStart(2, '0')}-${String(ab.jourPrelevement).padStart(2, '0')}`;
      if (date <= ctx.aujourdhui && date >= ab.depuis) liste.push({ compteId: principal.id, libelle: `Abonnement ${ab.clientNom}`, nature: 'Prélèvement', categorie: 'Ventes', date, montantCents: ab.montantMensuelCents, reel: true, rapprochement: 'rapproché', lien: { type: 'abonnement', id: ab.id }, recurrent: true });
    }
  }

  // Le prévisionnel (MA07) : encaissements attendus des factures dues, charges fixes du mois prochain.
  for (const f of factures) {
    if (f.status !== 'issued') continue;
    const attendu = f.dueAt < ctx.aujourdhui ? ajouterJours(ctx.aujourdhui, h.entier(2, 14)) : ajouterJours(f.dueAt, h.entier(0, 8));
    liste.push({ compteId: principal.id, libelle: `Encaissement attendu ${f.clientNom}`, nature: 'Encaissement attendu', categorie: 'Ventes', date: attendu, montantCents: f.soldeCents > 0 ? f.soldeCents : totauxDeFacture(f).ttcCents, reel: false, rapprochement: 'sans objet', lien: { type: 'facture', id: f.id }, recurrent: false });
  }
  for (const [libelle, categorie, montant, jour] of fixes) {
    // Quatre mois : de quoi couvrir l'horizon de 90 jours de H09 (prévisions de trésorerie).
    for (let k = 1; k <= 4; k += 1) {
      const [a, m] = ajouterJours(ctx.aujourdhui, 30 * k).split('-').map(Number);
      const date = `${a}-${String(m).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
      if (date > ctx.aujourdhui) liste.push({ compteId: principal.id, libelle, nature: 'Prélèvement', categorie, date, montantCents: montant, reel: false, rapprochement: 'sans objet', lien: { type: 'manuel', id: null }, recurrent: true });
    }
  }

  // Les prélèvements des abonnements actifs (revenu récurrent) et les impôts et la TVA à payer : les deux sources que H09 ajoute aux factures.
  for (const ab of abonnements) {
    if (ab.etat !== 'Actif') continue;
    for (let k = 0; k < 5; k += 1) {
      const [a, m] = ajouterJours(ctx.aujourdhui, 30 * k).split('-').map(Number);
      const date = `${a}-${String(m).padStart(2, '0')}-${String(ab.jourPrelevement).padStart(2, '0')}`;
      if (date > ctx.aujourdhui && date <= ajouterJours(ctx.aujourdhui, 125)) liste.push({ compteId: principal.id, libelle: `Abonnement ${ab.clientNom}`, nature: 'Prélèvement', categorie: 'Ventes', date, montantCents: ab.montantMensuelCents, reel: false, rapprochement: 'sans objet', lien: { type: 'abonnement', id: ab.id }, recurrent: true });
    }
  }
  for (const e of echeances) {
    if (e.paiement !== 'À payer' || e.montantCents === null || e.montantCents <= 0 || e.echeanceLe <= ctx.aujourdhui) continue;
    liste.push({ compteId: principal.id, libelle: e.intitule, nature: 'Paiement', categorie: 'Impôts et taxes', date: e.echeanceLe, montantCents: -e.montantCents, reel: false, rapprochement: 'sans objet', lien: { type: 'manuel', id: null }, recurrent: false });
  }

  const cap = compter(ctx.volumes.mouvements, [0, 14, 80, 600]);
  const reels = liste.filter((m) => m.reel).sort((a, b) => b.date.localeCompare(a.date)).slice(0, cap);
  // Les prévus couvrent quatre mois (l'horizon de 90 jours de H09) : leur plafond suit.
  const prevus = liste.filter((m) => !m.reel).sort((a, b) => a.date.localeCompare(b.date)).slice(0, Math.ceil(cap * 1.6));
  // Un encaissement attendu est « échu » quand la facture qu'il attend l'est déjà (H09, MA07).
  const echues = new Set(factures.filter((f) => f.status === 'issued' && f.dueAt < ctx.aujourdhui).map((f) => f.id));
  const tous: Mouvement[] = [...reels, ...prevus]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((m, i) => ({ ...m, id: `mv-${String(i + 1).padStart(4, '0')}`, echue: !m.reel && m.nature === 'Encaissement attendu' && m.lien.type === 'facture' && echues.has(m.lien.id ?? '') }));

  // Soldes : le compte principal vaut la cible, ses mouvements réels y mènent ; les autres comptes sont des montants fixes.
  const cible = centimes(h.entier(14, 38) * 1000 + h.entier(0, 99) * 10);
  principal.soldeCents = cible;
  for (const c of comptes.slice(1)) c.soldeCents = centimes(h.entier(2, 60) * 1000 + h.entier(0, 99) * 10);
  // L'historique de chaque compte : le solde d'aujourd'hui, puis on retire jour après jour ce que les mouvements réels ont apporté.
  for (const c of comptes) {
    const parJour = new Map<Jour, number>();
    for (const m of tous) if (m.reel && m.compteId === c.id) parJour.set(m.date, (parJour.get(m.date) ?? 0) + m.montantCents);
    let solde = c.soldeCents;
    const serie: { jour: Jour; soldeCents: number }[] = [];
    for (let k = 0; k < 90; k += 1) {
      const jour = ajouterJours(ctx.aujourdhui, -k);
      serie.push({ jour, soldeCents: solde });
      solde -= parJour.get(jour) ?? 0;
    }
    c.historique = serie.reverse();
  }
  return tous;
}

const jourDeIso = (d: string): Jour => d.slice(0, 10);
const libelleCategorie = (cle: string): string => CATEGORIES_DEPENSE.find(([k]) => k === cle)?.[1] ?? 'Autre';

/* ------------------------------- Enveloppes ------------------------------- */

const ENVELOPPES: readonly (readonly [string, string, string, string])[] = [
  ['Fournitures', 'Papeterie, consommables, petit matériel.', 'fournitures', 'box'],
  ['Déplacements', 'Trains, carburant, parkings.', 'deplacement', 'car'],
  ['Matériel', 'Ordinateurs, écrans, accessoires.', 'materiel', 'laptop'],
  ['Prestataires et logiciels', 'Abonnements, impression, assurances.', 'prestataire', 'tool'],
  ['Divers', 'Repas d’affaires et imprévus.', 'autre', 'tag'],
];

/** Une enveloppe par catégorie de dépense ; le prévu vaut 1,25 × la moyenne mensuelle réelle de la catégorie (arrondi aux 50 €). */
export function genererEnveloppes(ctx: Contexte, equipe: readonly Membre[], depenses: readonly Depense[]): Enveloppe[] {
  const h = hasard(graineDe(ctx.graine, 'enveloppes'));
  const n = compter(ctx.volumes.enveloppes, [0, 2, 5, 5]);
  const responsables = equipe.filter((m) => m.role === 'Administrateur' || m.role === 'Membre');
  const mois = ctx.aujourdhui.slice(0, 7);
  const depuis = ajouterJours(ctx.aujourdhui, -180);
  // Les six derniers mois, le mois courant en dernier.
  const moisPrecedents: string[] = [mois];
  for (let k = 1; k < 6; k += 1) moisPrecedents.unshift(ajouterJours(`${moisPrecedents[0]}-01`, -1).slice(0, 7));
  return ENVELOPPES.slice(0, n).map(([nom, description, categorie, icone], i) => {
    const total = depenses.filter((d) => d.category === categorie && d.spentAt >= depuis).reduce((s, d) => s + d.amountCents, 0);
    const moyenne = total / 6;
    return {
      id: `en-${i + 1}`,
      nom,
      description,
      icone,
      prevuCents: Math.max(5_000, Math.round((moyenne * 1.25) / 5_000) * 5_000),
      responsables: h.echantillon(responsables, Math.min(responsables.length, h.entier(1, 2))).map((m) => m.email),
      categories: [categorie],
      mois,
      historique: moisPrecedents.map((m) => ({ mois: m, depenseCents: depenses.filter((d) => d.category === categorie && d.spentAt.startsWith(m)).reduce((s, d) => s + d.amountCents, 0) })),
    };
  });
}
