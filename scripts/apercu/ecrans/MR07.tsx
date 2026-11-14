/**
 * APERÇU « MR07 » — Créer · Commandes (v4), sur les commandes FICTIVES de SIM. Les échéances (heure comprise), les 58 livrées
 * du mois et le suivi détaillé sont posés ici (le jeu n'en a pas assez).
 *
 *   npm run apercu -- MR07
 */
import React, { useState } from 'react';
import { construireMonde } from '../../../src/refonte/donnees';
import { VueCommandes, type CommandeVue } from '../../../src/refonte/creer/ecrans/MR07/VueCommandes';
import { compter } from '../../../src/refonte/creer/commandes';
import { ApercuBureau } from '../coquille';

const monde = construireMonde();
const jour = monde.contexte.aujourdhui;
const statuts = ['new', 'new', 'new', 'new', 'preparing', 'preparing', 'preparing', 'preparing', 'shipped', 'shipped', 'shipped'];
const heures = ['16:00', '17:00', '17:00', '17:00', null, null, null, null, null, null, null];
const brutes = monde.commandes.slice(0, 11);
const encours: CommandeVue[] = brutes.map((c, i) => ({
  id: c.id, numero: c.numero, client: c.clientNom, statut: statuts[i], remise: 'Colis', creeLe: jour, creeAt: i === 0 ? '2026-10-30T09:38:00Z' : '2026-10-29T10:00:00Z',
  echeanceLe: i < 4 ? jour : i < 8 ? '2026-10-31' : null, echeanceHeure: heures[i], urgente: i === 0 || i === 4, paiementEnLigne: true, paye: true,
  contenu: c.lignes.length === 1 ? c.lignes[0].libelle : `${c.lignes.length} articles`, montantCents: c.lignes.reduce((s, l) => s + l.quantite * l.prixCents, 0),
  adresse: '18 rue du Palais, Paris 8e', details: { recue: 'Auj. 09:12 · sur la boutique', payee: 'Auj. 09:14 · carte bancaire', preparation: 'Riyad vérifie les articles', expediee: 'prévue à 16:00 avec le Kangoo', livree: 'demain avant 12:00, avec pose' },
  lignes: i === 4 ? c.lignes.slice(0, 1).map((l) => ({ nom: l.libelle, detail: `${l.quantite} · pose comprise`, montantHtCents: l.prixCents })) : [],
}));
const livrees: CommandeVue[] = Array.from({ length: 58 }, (_, i) => ({ id: `l${i}`, numero: `#9${i}`, client: '—', statut: 'delivered', creeLe: jour, livreeLe: `2026-10-${String(1 + (i % 29)).padStart(2, '0')}`, contenu: '', montantCents: 0 }));
const commandes = [...encours, ...livrees];

export default function Apercu() {
  const [choisie, setChoisie] = useState<string | null>(encours[4]?.id ?? null);
  const k = compter(commandes, jour, Date.parse('2026-10-30T09:42:00Z'));
  return (
    <ApercuBureau famille="creer" sousPage="orders" fil={['Créer et produire', 'Commandes']}>
      <VueCommandes commandes={commandes} compteurs={k} recordMensuel={52} aujourdhui={jour} choisieId={choisie} onChoisir={setChoisie} onSuivante={() => undefined} onRetour={() => undefined}
        suggestion="Deux livraisons sont dans le même quartier. Je les regroupe et te fais gagner 40 minutes." />
    </ApercuBureau>
  );
}
