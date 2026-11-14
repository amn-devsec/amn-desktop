/**
 * LES JEUX DÉRIVÉS — relances (MC07) et fidélité (MC02).
 *
 * Ni l'un ni l'autre n'est tiré au hasard : une relance existe PARCE QU'une
 * facture est échue, qu'un devis reste sans réponse, qu'un rendez-vous a été
 * manqué ou qu'un prospect attend. Un client est « Or » PARCE QUE ses factures
 * payées totalisent assez de points. C'est ce qui permet de vérifier qu'un
 * écran calcule, au lieu de recopier.
 */

import { totauxDeFacture, totauxDeLignes } from './argent';
import { ajouterJours, compter, ecartJours, graineDe, hasard, jourDe, type Jour } from './outils';
import type { CompteFidelite, Avis, Contexte, Devis, Evenement, Facture, FicheClient, Prospect, Relance } from './types';

const nomDe = (c: FicheClient): string => c.company || c.name;
const euros = (cents: number): string => `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })} €`;

export function genererRelances(
  ctx: Contexte,
  reglages: { delaiRelanceDevisJours: number; delaiRelanceFactureJours: number; delaiRelanceRendezVousJours: number; delaiRelanceProspectJours: number },
  clients: readonly FicheClient[],
  factures: readonly Facture[],
  devis: readonly Devis[],
  evenements: readonly Evenement[],
  prospects: readonly Prospect[],
): Relance[] {
  const h = hasard(graineDe(ctx.graine, 'relances'));
  const cap = compter(ctx.volumes.relances, [0, 4, 12, 60]);
  const parClient = new Map(clients.map((c) => [c.id, c]));
  const liste: Omit<Relance, 'id'>[] = [];

  const etat = (jours: number, delai: number): { etat: Relance['etat']; nb: number } => {
    // Une relance est « prête » au premier délai ; au-delà d'une semaine, on a déjà relancé une fois.
    if (jours >= delai + 7 && h.chance(0.5)) return { etat: h.chance(0.2) ? 'répondue' : 'envoyée', nb: 1 };
    return { etat: 'prête', nb: 0 };
  };

  for (const f of factures) {
    if (f.status !== 'issued' || f.dueAt >= ctx.aujourdhui) continue;
    const jours = ecartJours(f.dueAt, ctx.aujourdhui);
    if (jours < reglages.delaiRelanceFactureJours) continue;
    const c = parClient.get(f.clientId);
    const e = etat(jours, reglages.delaiRelanceFactureJours);
    const montant = totauxDeFacture(f).ttcCents;
    liste.push({
      clientId: f.clientId, clientNom: c ? nomDe(c) : f.clientNom, motif: 'facture', objetId: f.id, objetLibelle: `Facture ${f.number}`, montantCents: montant,
      departLe: f.dueAt, etat: e.etat, nbEnvoyees: e.nb, derniereEnvoiLe: e.nb ? ctx.aujourdhui : null,
      message: `Bonjour, sauf erreur de notre part, la facture ${f.number} de ${euros(montant)}, échue le ${f.dueAt.split('-').reverse().join('/')}, n’a pas encore été réglée. Pourriez-vous nous confirmer la date de règlement ? Bien cordialement.`,
    });
  }
  for (const d of devis) {
    if (d.status !== 'sent' || !d.sentAt) continue;
    const envoye = d.sentAt.slice(0, 10); // `sentAt` est un jour (voir `Quote.sentAt`)
    const jours = ecartJours(envoye, ctx.aujourdhui);
    if (jours < reglages.delaiRelanceDevisJours) continue;
    const c = parClient.get(d.clientId);
    const e = etat(jours, reglages.delaiRelanceDevisJours);
    const montant = totauxDeLignes(d.lignes).ttcCents;
    liste.push({
      clientId: d.clientId, clientNom: c ? nomDe(c) : d.clientNom, motif: 'devis', objetId: String(d.id), objetLibelle: `Devis ${d.numero}`, montantCents: montant,
      departLe: envoye, etat: e.etat, nbEnvoyees: e.nb, derniereEnvoiLe: e.nb ? ctx.aujourdhui : null,
      message: `Bonjour, nous vous avons adressé le devis ${d.numero} il y a ${jours} jours. Avez-vous eu le temps de le consulter ? Nous restons disponibles pour en discuter.`,
    });
  }
  for (const ev of evenements) {
    if (ev.confirmation !== 'manqué' || ev.systeme) continue;
    const jour = jourDe(Date.parse(ev.startAt));
    const jours = ecartJours(jour, ctx.aujourdhui);
    if (jours < reglages.delaiRelanceRendezVousJours) continue;
    const c = ev.clientId ? parClient.get(ev.clientId) : undefined;
    liste.push({
      clientId: ev.clientId, clientNom: c ? nomDe(c) : ev.clientName || 'Client', motif: 'rendez-vous', objetId: ev.id, objetLibelle: ev.title, montantCents: null,
      departLe: jour, etat: 'prête', nbEnvoyees: 0, derniereEnvoiLe: null,
      message: 'Bonjour, nous n’avons pas pu nous rencontrer comme prévu. Souhaitez-vous que nous convenions d’un nouveau créneau ?',
    });
  }
  for (const p of prospects) {
    if ((p.etape !== 'nouveau' && p.etape !== 'contacté') || p.creeLe > ctx.aujourdhui) continue;
    const jours = ecartJours(p.creeLe, ctx.aujourdhui);
    if (jours < reglages.delaiRelanceProspectJours) continue;
    liste.push({
      clientId: null, clientNom: p.nom, motif: 'prospect', objetId: p.id, objetLibelle: p.offre, montantCents: p.montantCents,
      departLe: p.creeLe, etat: 'prête', nbEnvoyees: 0, derniereEnvoiLe: null,
      message: `Bonjour, suite à notre premier échange, souhaitez-vous que nous précisions notre proposition pour « ${p.offre} » ?`,
    });
  }
  // Proposition de MC07 : un client sans aucune activité depuis un mois.
  for (const c of clients) {
    const dernier = jourDe(Date.parse(c.dernierEchangeAt));
    if (ecartJours(dernier, ctx.aujourdhui) < 30 || c.status === 'paused') continue;
    if (factures.some((f) => f.clientId === c.id && f.issuedAt >= jourDe(Date.parse(c.dernierEchangeAt)))) continue;
    liste.push({
      clientId: c.id, clientNom: nomDe(c), motif: 'inactif', objetId: String(c.id), objetLibelle: 'Client inactif', montantCents: null,
      departLe: dernier, etat: 'prête', nbEnvoyees: 0, derniereEnvoiLe: null,
      message: 'Bonjour, nous n’avons pas échangé depuis un moment. Y a-t-il un projet sur lequel nous pourrions vous aider ?',
    });
  }
  // Tri de MC07 : montant décroissant, puis du plus récent au plus ancien.
  return liste
    .sort((a, b) => (b.montantCents ?? -1) - (a.montantCents ?? -1) || b.departLe.localeCompare(a.departLe))
    .slice(0, cap)
    .map((r, i) => ({ ...r, id: `rl-${String(i + 1).padStart(4, '0')}` }));
}

export function genererFidelite(ctx: Contexte, clients: readonly FicheClient[], factures: readonly Facture[], avis: readonly Avis[] = []): CompteFidelite[] {
  const h = hasard(graineDe(ctx.graine, 'fidelite'));
  const cap = compter(ctx.volumes.fidelite, [0, 5, 20, 120]);
  const depuis: Jour = `${Number(ctx.aujourdhui.slice(0, 4)) - 1}${ctx.aujourdhui.slice(4)}`;
  const dans = (j: Jour): boolean => j >= depuis && j <= ctx.aujourdhui;
  const comptes: CompteFidelite[] = [];
  for (const c of clients) {
    const payees = factures.filter((f) => f.clientId === c.id && f.status === 'paid' && dans(f.paidAt));
    const sesAvis = avis.filter((a) => a.clientId === c.id && dans(a.date));
    // MC02 : un client qui en a recommandé un autre (un client sur sept, dans l'année) ; le tirage est propre à chaque client.
    const recommandations: Jour[] = h.chance(0.14) ? [ajouterJours(ctx.aujourdhui, -h.entier(3, 330))] : [];
    if (payees.length === 0 && sesAvis.length === 0 && recommandations.length === 0) continue;
    // Les règles de la fiche : 1 € payé = 1 point (TTC, arrondi à l'euro inférieur), un avis = 50, une recommandation = 200 ;
    // Bronze dès 0, Argent dès 800, Or dès 1 800.
    const points = payees.reduce((s, f) => s + Math.floor(totauxDeFacture(f).ttcCents / 100), 0) + sesAvis.length * 50 + recommandations.length * 200;
    const niveau: CompteFidelite['niveau'] = points >= 1800 ? 'Or' : points >= 800 ? 'Argent' : 'Bronze';
    const derniere = [...payees.map((f) => f.paidAt), ...sesAvis.map((a) => a.date), ...recommandations].sort().pop() as Jour;
    const avantages: CompteFidelite['avantages'] = [];
    if (niveau !== 'Bronze') {
      avantages.push({ id: `av-${c.id}-1`, libelle: 'Remise de 5 % sur la prochaine prestation', valeurCents: 5000, statut: 'Offert', le: derniere });
      if (h.chance(0.5)) avantages.push({ id: `av-${c.id}-2`, libelle: 'Heure de conseil offerte', valeurCents: 9000, statut: h.choix(['Utilisé', 'Expiré'] as const), le: derniere });
    }
    comptes.push({ clientId: c.id, clientNom: nomDe(c), points, niveau, derniereActiviteLe: derniere, recommandations, avantages });
  }
  // Un échantillon représentatif (pas les `cap` plus gros comptes, qui seraient tous « Or »), classé par points.
  const melanges = h.melanger(comptes);
  // Chaque palier est représenté dès que les clients le permettent : on met d'abord un compte de chaque niveau.
  const garantis = (['Or', 'Argent', 'Bronze'] as const).map((n) => melanges.find((x) => x.niveau === n)).filter((x): x is CompteFidelite => x !== undefined);
  const choisis = [...garantis, ...melanges.filter((x) => !garantis.includes(x))].slice(0, cap);
  return choisis.sort((a, b) => b.points - a.points);
}
