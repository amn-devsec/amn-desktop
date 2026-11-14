import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../../../state/useClients';
import { useInvoices } from '../../../../state/useInvoices';
import { ajouterJours, jourDe } from '../../commun';
import { TAUX_TVA_PAR_DEFAUT, VALIDITE_JOURS } from '../../devis';
import { lienAtelier } from '../commun/atelier';
import { VueDevis, type DevisVu } from './VueDevis';

/**
 * H07 · DEVIS — la page branchée, montée à la place de `/facturation/devis` (substitution de LOT-04).
 *
 * Elle ouvre le devis le plus récent en cours (brouillon ou envoyé) sur les devis synchronisés (`useClients`). Le
 * devis du dépôt n'a pas encore de lignes (un titre et un montant) : la page montre une seule ligne, reprise de ce
 * montant (HT, au taux par défaut). Elle reste en lecture : modifier des lignes demanderait un champ que le serveur
 * n'a pas. Versions, suivi de lecture et catalogue (MA12) ne sont pas servis : la vue le dit.
 */
export default function PageDevis() {
  const navigate = useNavigate();
  const { clients, quotes } = useClients();
  const { identity } = useInvoices();
  const devis = useMemo(() => [...quotes].filter((q) => q.status === 'draft' || q.status === 'sent').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null, [quotes]);
  const client = devis ? clients.find((c) => c.id === devis.clientId) : undefined;
  const vu: DevisVu | null = devis
    ? {
        numero: `D-${devis.createdAt.slice(0, 4)}-${devis.id}`,
        version: 1,
        clientNom: client?.company || client?.name || '—',
        contact: client?.name ?? null,
        adresse: null,
        objet: devis.title,
        emisLe: devis.sentAt || null,
        validiteJusquau: ajouterJours(jourDe(devis.sentAt || devis.createdAt), VALIDITE_JOURS),
        lignes: [{ id: 'l-1', label: devis.title, quantity: 1, unitPriceCents: Math.round(devis.priceEuro * 100), vatRate: TAUX_TVA_PAR_DEFAUT }],
        ttcPrecedentCents: null,
        vuLe: null,
      }
    : null;
  const echeancier = lienAtelier('echeancier');
  const rien = () => undefined;
  return (
    <VueDevis
      statut={vu ? 'pret' : 'vide'}
      devis={vu}
      emetteur={{ nom: identity.legalName || '—', activite: '' }}
      catalogue={null}
      versions={devis ? [{ n: 1, etat: devis.status === 'draft' ? 'brouillon' : 'envoyee', le: devis.status === 'draft' ? devis.updatedAt : devis.sentAt || devis.updatedAt, lectures: null, ouverte: false }] : []}
      suivi={null}
      enregistreLe={devis?.updatedAt ?? new Date().toISOString()}
      paiementEnLigneBranche={false}
      echeancier={echeancier ? { ouvrir: () => navigate(echeancier.vers) } : null}
      editable={false}
      actions={{ envoyer: rien, apercu: rien, changerLignes: rien, reessayer: rien }}
    />
  );
}
