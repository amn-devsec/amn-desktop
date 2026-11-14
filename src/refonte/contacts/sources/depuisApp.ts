import { useMemo } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { useAppointments } from '../../../state/useAppointments';
import { useClients } from '../../../state/useClients';
import { useInvoices } from '../../../state/useInvoices';
import { useMembers } from '../../../state/useMembers';
import { useCollection } from '../../../state/SyncContext';
import type { Avis, Devis, Evenement, Facture, FicheClient, Fournisseur, Prospect } from '../../donnees/types';
import { couleurSante, joursDeRetard, santeClient, statutClient } from '../clients';
import { jourDeInstant, type Jour } from '../commun';
import { DELAIS_PAR_DEFAUT, fideliteDepuis, relancesDepuis } from '../derivees';
import { CHANCES_H06 } from '../interet';
import type { Echange, MembreSource, SourcesContacts } from './types';

/**
 * LES SOURCES DE LOT-02, TIRÉES DE L'APPLICATION — les collections réelles rangées dans la forme de `SourcesContacts`.
 *
 * C'est la seule porte entre l'état de l'application (clients, devis, factures, rendez-vous, prospects, avis,
 * fournisseurs, membres) et les écrans de LOT-02. Elle ne crée rien et n'écrit rien. Ce que l'application ne garde pas
 * (collection d'interlocuteurs, messagerie des clients, partenaires) reste `null` : les écrans disent « non disponible ».
 * Les relances à faire et les comptes de fidélité ne sont pas stockés : ils sont DÉDUITS (`derivees.ts`).
 */

interface ProspectBrut {
  name: string;
  company: string;
  valueCents: number;
  stage: 'contact' | 'qualifie' | 'proposition' | 'gagne' | 'perdu';
  note: string;
  createdAt: string;
}
interface AvisBrut {
  author: string;
  text: string;
  rating: number;
  receivedAt: string;
}
interface FournisseurBrut {
  name: string;
  supplies: string;
  contact: string;
  phone: string;
  email: string;
}

const ETAPE_DE: Record<ProspectBrut['stage'], Prospect['etape']> = { contact: 'nouveau', qualifie: 'contacté', proposition: 'devis envoyé', gagne: 'gagné', perdu: 'perdu' };

const jourDe = (iso: string | undefined): Jour => (iso ? jourDeInstant(iso) : '');

export interface ResultatSources {
  statut: 'chargement' | 'pret';
  sources: SourcesContacts | null;
}

/** Le moment est un paramètre : la page le lit à l'horloge, un test ou un aperçu le fige. */
export function useSourcesContacts(maintenant: number): ResultatSources {
  const { user } = useAuth();
  const { clients, quotes } = useClients();
  const { invoices } = useInvoices();
  const { appointments } = useAppointments();
  const { membres, prets } = useMembers();
  const prospectsBruts = useCollection<ProspectBrut>('prospects');
  const avisBruts = useCollection<AvisBrut>('reviews');
  const fournisseursBruts = useCollection<FournisseurBrut>('suppliers');

  const sources = useMemo<SourcesContacts>(() => {
    const aujourdhui = jourDeInstant(maintenant);
    const clientParId = new Map(clients.map((c) => [c.id, c]));

    const factures: Facture[] = invoices.map((i) => ({ ...i, clientNom: i.billTo?.name ?? '', responsableEmail: '', soldeCents: 0 }));
    const devis: Devis[] = quotes.map((q) => ({
      ...q,
      numero: `D-${q.id}`,
      clientNom: clientParId.get(q.clientId)?.company || clientParId.get(q.clientId)?.name || '',
      lignes: [{ id: 'l1', label: q.title, quantity: 1, unitPriceCents: Math.round(q.priceEuro * 100), vatRate: 0 }],
      validiteJusquau: '',
      vuAt: null,
      acceptéLe: q.status === 'accepted' ? jourDe(q.updatedAt) : null,
      refuséLe: q.status === 'refused' ? jourDe(q.updatedAt) : null,
      prestation: '',
    }));
    const evenements: Evenement[] = appointments.map((a) => ({
      ...a,
      type: 'rendez-vous client',
      endAt: new Date(Date.parse(a.startAt) + a.durationMin * 60_000).toISOString(),
      participants: [],
      famille: 'contacts' as never,
      factureId: null,
      confirmation: 'confirmé',
      mode: 'salle',
      systeme: false,
    })) as unknown as Evenement[];
    const avis: Avis[] = avisBruts.map((r) => ({
      id: r.id,
      clientId: 0,
      clientNom: r.author,
      noteSur5: Math.min(5, Math.max(0, Number(r.rating) || 0)),
      recommandation: null,
      texte: r.text,
      date: jourDe(r.receivedAt),
      themes: [],
      sentiment: r.rating >= 4 ? 'positif' : r.rating === 3 ? 'neutre' : 'négatif',
      canal: 'message',
    }));
    const prospects: Prospect[] = prospectsBruts.map((p) => {
      const etape = ETAPE_DE[p.stage] ?? 'nouveau';
      return {
        id: p.id,
        nom: p.company || p.name,
        contactNom: p.name,
        offre: p.note,
        montantCents: p.valueCents > 0 ? p.valueCents : null,
        recurrence: null,
        etape,
        probabilite: etape === 'gagné' ? 100 : etape === 'perdu' ? 0 : (CHANCES_H06 as Record<string, number>)[etape] ?? 20,
        responsableEmail: '',
        prochaineAction: '',
        prochaineActionLe: null,
        urgent: false,
        checklist: { faites: 0, total: 0 },
        creeLe: jourDe(p.createdAt),
        signeLe: etape === 'gagné' ? jourDe(p.updatedAt) : null,
        perduLe: etape === 'perdu' ? jourDe(p.updatedAt) : null,
        clientId: null,
        raisonPerte: null,
      };
    });
    const fournisseurs: Fournisseur[] = fournisseursBruts.map((f) => ({
      id: f.id,
      nom: f.name,
      categorie: f.supplies,
      contactNom: f.contact,
      email: f.email,
      telephone: f.phone,
      adresse: '',
      delaiAnnonceJours: 0,
      note: '',
      negociationLe: null,
      francoCents: null,
      fraisDePortCents: 0,
    }));

    // Le dernier échange : le plus récent des rendez-vous passés, des événements de la fiche, des factures émises.
    const echanges: Echange[] = [
      ...appointments.filter((a) => a.clientId != null && Date.parse(a.startAt) <= maintenant).map((a) => ({ clientId: a.clientId as number, at: a.startAt })),
      ...clients.flatMap((c) => c.events.map((e) => ({ clientId: c.id, at: e.date }))),
      ...invoices.filter((i) => i.issuedAt).map((i) => ({ clientId: i.clientId, at: `${i.issuedAt}T12:00:00.000Z` })),
    ];
    const dernierParClient = new Map<number, string>();
    for (const e of echanges) if (!dernierParClient.has(e.clientId) || e.at > (dernierParClient.get(e.clientId) as string)) dernierParClient.set(e.clientId, e.at);

    const base = clients.map((c) => ({
      ...c,
      secteur: '',
      ville: '',
      adresse: '',
      siteWeb: '',
      responsableEmail: '',
      debutLe: jourDe(c.createdAt),
      dernierEchangeAt: dernierParClient.get(c.id) ?? c.updatedAt ?? c.createdAt,
      sante: 0,
      statutAffiche: 'Actif' as const,
      nature: 'organisation' as const,
      tags: [] as string[],
    }));
    const fiches: FicheClient[] = base.map((c) => {
      const sante = santeClient(c, { factures, devis, avis }, aujourdhui);
      const fiche = { ...c, sante };
      return { ...fiche, statutAffiche: statutClient(fiche, joursDeRetard(factures, c.id, aujourdhui), aujourdhui) };
    });
    void couleurSante;

    const equipe: MembreSource[] = membres.map((m, i) => {
      const local = (m.email.split('@')[0] ?? '').split(/[._-]/)[0] ?? '';
      const prenom = local.charAt(0).toUpperCase() + local.slice(1);
      return { id: m.id, prenom, nom: '', nomComplet: prenom, initiales: (prenom[0] ?? '?').toUpperCase(), email: m.email, teinte: i % 8, statut: 'hors ligne' as const };
    });
    const prenomMoi = (user?.name ?? '').trim().split(/\s+/)[0] ?? '';

    const avisSimples = avis.filter((a) => a.date).map((a) => ({ clientId: a.clientId, date: a.date }));
    const relances = relancesDepuis({ aujourdhui, clients: fiches, factures, devis, evenements, prospects }, DELAIS_PAR_DEFAUT);
    return {
      maintenant,
      aujourdhui,
      moi: { prenom: prenomMoi || user?.email.split('@')[0] || '', email: user?.email ?? '' },
      clients: fiches,
      devis,
      factures,
      avis,
      evenements,
      prospects,
      relances,
      fidelite: fideliteDepuis({ aujourdhui, clients: fiches, factures, avis: avisSimples }),
      fournisseurs,
      partenaires: null,
      equipe,
      presence: false,
      interlocuteurs: null,
      attentes: null,
      echanges,
    };
  }, [maintenant, user, clients, quotes, invoices, appointments, membres, prospectsBruts, avisBruts, fournisseursBruts]);

  return { statut: prets ? 'pret' : 'chargement', sources: prets ? sources : null };
}
