import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection } from '../../../../state/SyncContext';
import { invoiceTotals, isOverdue, netDueCents, useInvoices } from '../../../../state/useInvoices';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { usePageCoquille } from '../../../coquille/page';
import { ajouterJours, debutDeMois, ecartPourcent, jourDeParis } from '../../commun';
import type { Widget } from '../../grille';
import { useMots } from './textes';
import { VueTableauDeBord, type DonneesTableau, type EtatBrouillon } from './VueTableauDeBord';

interface TicketReel { client: string; subject: string; status: string; openedAt: string; resolvedAt: string | null }

/** La disposition de départ : celle de la fiche H25 (six colonnes, rangées de 116 px). */
export const DISPOSITION_PAR_DEFAUT: Widget[] = [
  { id: 'ca-1', contenu: 'ca', type: 'courbe', colonne: 1, rangee: 1, largeur: 3, hauteur: 2, source: 'AMN' },
  { id: 'objectif-1', contenu: 'objectif', type: 'jauge', colonne: 4, rangee: 1, largeur: 2, hauteur: 2, source: 'AMN' },
  { id: 'taches-1', contenu: 'taches', type: 'anneau', colonne: 6, rangee: 1, largeur: 1, hauteur: 1 },
  { id: 'agenda-1', contenu: 'agenda', type: 'agenda', colonne: 6, rangee: 2, largeur: 1, hauteur: 1 },
  { id: 'tickets-1', contenu: 'tickets', type: 'liste', colonne: 1, rangee: 3, largeur: 2, hauteur: 2, source: 'AMN' },
  { id: 'utilisateurs-1', contenu: 'utilisateurs', type: 'barres', colonne: 3, rangee: 3, largeur: 2, hauteur: 1 },
  { id: 'note-1', contenu: 'note', type: 'note', colonne: 5, rangee: 3, largeur: 2, hauteur: 1, source: 'Libre' },
  { id: 'factures-1', contenu: 'factures', type: 'liste', colonne: 3, rangee: 4, largeur: 4, hauteur: 1, source: 'AMN' },
  { id: 'activite-1', contenu: 'activite', type: 'liste', colonne: 4, rangee: 5, largeur: 3, hauteur: 1, source: 'AMN' },
];

const lire = <T,>(cle: string, defaut: T): T => {
  try {
    const brut = window.localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
};
const ecrire = (cle: string, valeur: unknown): boolean => {
  try {
    window.localStorage.setItem(cle, JSON.stringify(valeur));
    return true;
  } catch {
    return false;
  }
};

/**
 * H25 · MON TABLEAU DE BORD — widgets lus dans les modules d'origine (factures, tâches du jour, rendez-vous, tickets), jamais dans
 * une copie. La DISPOSITION (types, places, tailles) est un réglage de la personne : elle vit dans le stockage local du poste
 * (brouillon + version publiée), aucune collection nouvelle (STATUT §1.27 : pas de collection sans l'accord de Harun) ; elle ne
 * contient aucune donnée ni clé. Absents du dépôt : l'objectif du mois (réglage), les utilisateurs actifs (API d'une application
 * suivie), la priorité « urgent » d'un ticket ; leurs widgets disent « Source non connectée » (§1.10 règle A1 : pas de faux chiffre).
 */
export function TableauDeBordRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const { user } = useAuth();
  const aujourdhui = useAujourdhui();
  const { invoices } = useInvoices();
  const tickets = useCollection<TicketReel & { id: string }>('tickets');
  const email = user?.email ?? 'anonyme';
  const cleBrouillon = `amn.tableau.${email}.brouillon`;
  const clePublie = `amn.tableau.${email}.publie`;
  const cleNote = `amn.tableau.${email}.note`;
  const [publie, setPublie] = useState<Widget[]>(() => lire(clePublie, DISPOSITION_PAR_DEFAUT));
  const [brouillon, setBrouillon] = useState<Widget[]>(() => lire(cleBrouillon, lire(clePublie, DISPOSITION_PAR_DEFAUT)));
  const [edition, setEdition] = useState(false);
  const [apercu, setApercu] = useState(false);
  const [etat, setEtat] = useState<EtatBrouillon>('enregistre');
  const [selection, setSelection] = useState<string | null>(null);
  const [retire, setRetire] = useState<{ nom: string; avant: Widget[] } | null>(null);
  const [note, setNote] = useState(() => lire<string>(cleNote, ''));
  const minuterie = useRef<number | null>(null);
  usePageCoquille({ famille: 'jour', sousPage: 'dashboard', miettes: [{ libelle: tm('titre') }] });

  const changer = useCallback((suivant: Widget[]) => {
    setBrouillon((avant) => {
      if (suivant.length < avant.length) setRetire({ nom: tm('retire'), avant });
      return suivant;
    });
    setEtat('enregistrement');
    if (minuterie.current !== null) window.clearTimeout(minuterie.current);
    minuterie.current = window.setTimeout(() => setEtat(ecrire(cleBrouillon, suivant) ? 'enregistre' : 'hors-ligne'), 600);
  }, [cleBrouillon, tm]);
  useEffect(() => () => { if (minuterie.current !== null) window.clearTimeout(minuterie.current); }, []);
  useEffect(() => {
    if (!retire) return undefined;
    const t = window.setTimeout(() => setRetire(null), 6000);
    return () => window.clearTimeout(t);
  }, [retire]);

  const jour = aujourdhui.jour;
  const donnees = useMemo<DonneesTableau>(() => {
    const mois = jour.slice(0, 7);
    const quantieme = Number(jour.slice(8));
    const moisPrecedent = ajouterJours(debutDeMois(jour), -1).slice(0, 7);
    const payees = invoices.filter((f) => f.status === 'paid' && f.paidAt && f.kind !== 'creditNote');
    const encaisseA = (prefixe: string) => payees
      .filter((f) => f.paidAt.startsWith(prefixe) && Number(f.paidAt.slice(8, 10)) <= quantieme)
      .reduce((s, f) => s + invoiceTotals(f).grossCents, 0);
    let cumul = 0;
    const courbe = Array.from({ length: 30 }, (_, i) => {
      const j = ajouterJours(jour, i - 29);
      cumul += payees.filter((f) => f.paidAt.slice(0, 10) === j).reduce((s, f) => s + invoiceTotals(f).grossCents, 0);
      return { etiquette: j.slice(8) + '/' + j.slice(5, 7), valeur: cumul };
    });
    const dues = invoices
      .filter((f) => f.status === 'issued' && f.kind !== 'creditNote' && netDueCents(f, invoices) > 0)
      .map((f) => ({ f, retard: isOverdue(f, jour, invoices), cents: netDueCents(f, invoices) }))
      .sort((a, b) => Number(b.retard) - Number(a.retard) || (a.f.dueAt || '').localeCompare(b.f.dueAt || ''));
    const ouverts = tickets.filter((t) => !t.resolvedAt).sort((a, b) => a.openedAt.localeCompare(b.openedAt));
    const activite = [
      ...payees.map((f) => ({ texte: tm('activite.facture', { ref: f.number }), quand: f.paidAt.slice(0, 10), ton: 'succes' as const, at: f.paidAt })),
      ...tickets.filter((t) => t.resolvedAt).map((t) => ({ texte: t.subject, quand: t.resolvedAt as string, ton: 'info' as const, at: t.resolvedAt as string })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3);
    const ca = encaisseA(mois);
    return {
      ca: payees.length === 0 && invoices.length === 0 ? null : { cents: ca, ecartPct: ecartPourcent(ca, encaisseA(moisPrecedent)), courbe },
      objectif: null,
      taches: { faites: aujourdhui.faites, total: aujourdhui.total, serie: aujourdhui.serie },
      agenda: aujourdhui.prochainRdv ? { heure: aujourdhui.prochainRdv.debut, delai: '', titre: aujourdhui.prochainRdv.titre } : null,
      tickets: {
        visibles: ouverts.slice(0, 4).map((t) => ({ id: t.id, titre: t.subject, client: t.client, delai: jourDeParis(t.openedAt) })),
        urgents: 0,
        ouverts: ouverts.length,
      },
      utilisateurs: null,
      factures: dues.slice(0, 6).map(({ f, retard, cents }) => ({
        ref: f.number, client: f.billTo.name, cents,
        echeance: retard ? { type: 'retard' as const } : { type: 'dans' as const, jours: Math.max(0, Math.round((Date.parse(f.dueAt) - Date.parse(jour)) / 86_400_000)) },
      })),
      activite: activite.map(({ texte, quand, ton }) => ({ texte, quand, ton })),
      note,
      gardeEnOrdre: true,
    };
  }, [invoices, tickets, jour, aujourdhui.faites, aujourdhui.total, aujourdhui.serie, aujourdhui.prochainRdv, note, tm]);
  void maintenant;

  const differe = JSON.stringify(brouillon) !== JSON.stringify(publie);
  return (
    <VueTableauDeBord
      widgets={edition ? brouillon : publie}
      donnees={donnees}
      modeEdition={edition}
      apercu={apercu}
      etat={etat}
      selectionId={selection}
      retire={retire?.nom ?? null}
      differe={differe}
      onChange={changer}
      onSelection={setSelection}
      onModifier={() => { setBrouillon(lire(cleBrouillon, publie)); setEdition(true); }}
      onTerminer={() => { setPublie(brouillon); ecrire(clePublie, brouillon); ecrire(cleBrouillon, brouillon); setEdition(false); setApercu(false); setSelection(null); }}
      onAnnuler={() => { setBrouillon(publie); ecrire(cleBrouillon, publie); setEdition(false); setApercu(false); setSelection(null); setEtat('enregistre'); }}
      onApercu={setApercu}
      onDefaire={() => { if (retire) changer(retire.avant); setRetire(null); }}
      onNote={(t) => { setNote(t); ecrire(cleNote, t); }}
    />
  );
}

export default TableauDeBordRefonte;
