import React, { useMemo, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { useClients } from '../../../../state/useClients';
import { invoiceTotals, useInvoices } from '../../../../state/useInvoices';
import { useAujourdhui } from '../../../coquille/aujourdhui';
import { usePageCoquille } from '../../../coquille/page';
import { bilanDeLaSemaine } from '../../bilan';
import { ajouterJours, jourDeParis, lundiDe, type Jour } from '../../commun';
import { semaineIso } from './semaine';
import { useMots } from './textes';
import { VueBilan, type JourDuRuban, type Reussite } from './VueBilan';

const JOURS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN'];
const NOMS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const court = (j: Jour) => `${Number(j.slice(8))} ${MOIS[Number(j.slice(5, 7)) - 1].slice(0, 4)}.`;

/**
 * H04 · BILAN DE LA SEMAINE — calculé, jamais saisi : `bilanDeLaSemaine` (égale les valeurs attendues de SIM) sur les tâches, les factures
 * payées et les clients du dépôt. La série vient de `useAujourdhui` (règle unique, §1.36). Absents du dépôt : l'échéance d'une tâche
 * (« Ce qui a glissé » reste vide, « à reporter » aussi), la boîte de réception à zéro, les semaines clôturées (les trois semaines
 * précédentes sont CALCULÉES, étiquette « calculées »), Partager et Exporter en PDF (boutons inactifs). « Clôturer » et les trois cases
 * d'« Avant de clôturer » vivent dans le stockage local du poste (réglage de la personne, aucune collection nouvelle, §1.27).
 */
export function BilanRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const { user } = useAuth();
  const aujourdhui = useAujourdhui();
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const email = (user?.email ?? '').toLowerCase();
  const jour = aujourdhui.jour;
  const cleCases = `amn.bilan.${email || 'anonyme'}.${lundiDe(jour)}`;
  const [cases, setCases] = useState<{ relu: boolean; decide: boolean; mot: boolean }>(() => {
    try { return { relu: false, decide: false, mot: false, ...(JSON.parse(window.localStorage.getItem(cleCases) ?? '{}') as object) }; } catch { return { relu: false, decide: false, mot: false }; }
  });
  usePageCoquille({ famille: 'jour', sousPage: 'weekly', miettes: [{ libelle: tm('titre') }] });

  const modele = useMemo(() => {
    const taches = aujourdhui.acces.taches.map((t) => ({ id: t.id, status: t.status ?? 'todo', assigneeEmail: (t.assigneeEmail ?? '').toLowerCase(), echeance: null as Jour | null, faiteAt: t.status === 'done' ? t.updatedAt : null }));
    const payees = invoices.filter((f) => f.status === 'paid' && f.paidAt && f.kind !== 'creditNote');
    const entree = {
      jour, email, taches,
      paiements: payees.map((f) => ({ etat: 'réussi', date: `${f.paidAt.slice(0, 10)}T12:00:00Z`, montantCents: invoiceTotals(f).grossCents })),
      clients: clients.filter((c) => c.createdAt).map((c) => ({ debutLe: jourDeParis(c.createdAt) })),
      factures: invoices.map((f) => ({ status: f.status })),
      serie: { serie: aujourdhui.serie },
    };
    const b = bilanDeLaSemaine(entree);
    const lundi = b.semaine.lundi;
    const rdv = aujourdhui.acces.appointments.filter((a) => a.status !== 'cancelled');
    const ruban: JourDuRuban[] = Array.from({ length: 5 }, (_, i) => {
      const j = ajouterJours(lundi, i);
      const facture = payees.find((f) => f.paidAt.slice(0, 10) === j);
      const rdvsDuJour = rdv.filter((a) => jourDeParis(a.startAt) === j);
      const moment = facture ? { titre: tm('bien.facture', { ref: facture.number }), detail: facture.billTo.name } : rdvsDuJour[0] ? { titre: rdvsDuJour[0].title, detail: tm(rdvsDuJour.length >= 2 ? 'ruban.rdv.n' : 'ruban.rdv.1', { n: rdvsDuJour.length }) } : null;
      return { jour: `${JOURS[i]} ${Number(j.slice(8))}`, faites: b.parJour[i], meilleur: b.meilleurJour === i, moment };
    });
    const reussites: Reussite[] = payees
      .filter((f) => f.paidAt.slice(0, 10) >= lundi && f.paidAt.slice(0, 10) <= b.semaine.dimanche)
      .slice(0, 4)
      .map((f) => ({ titre: tm('bien.facture', { ref: f.number }), detail: tm('bien.facture.detail', { euros: `${Math.round(invoiceTotals(f).grossCents / 100)} €`, client: f.billTo.name }), icone: 'euro' as const }));
    const precedentes = [1, 2, 3].map((k) => {
      const l = ajouterJours(lundi, -7 * k);
      const d = ajouterJours(l, 6);
      const e = bilanDeLaSemaine({ ...entree, jour: l });
      return { s: semaineIso(l), plage: `${Number(l.slice(8))} au ${court(ajouterJours(l, 4))}`, taches: e.tachesFaites.faites, cents: e.encaisse.cents, d };
    }).filter((s) => s.taches > 0 || s.cents > 0);
    const moyenne = precedentes.length ? { taches: precedentes.reduce((s, x) => s + x.taches, 0) / precedentes.length, cents: precedentes.reduce((s, x) => s + x.cents, 0) / precedentes.length } : null;
    const meilleur = b.meilleurJour === null ? null : lundi && ajouterJours(lundi, b.meilleurJour) === jour ? { type: 'aujourdhui' as const } : { type: 'jour' as const, nom: NOMS[b.meilleurJour] };
    const moy4 = precedentes.length ? precedentes.reduce((s, x) => s + x.taches, 0) / precedentes.length : 0;
    const ton = rdv.filter((a) => jourDeParis(a.startAt) >= lundi && jourDeParis(a.startAt) <= b.semaine.dimanche).length > b.tachesFaites.faites ? 'remplie' as const : b.tachesFaites.faites >= moy4 && b.tachesFaites.faites > 0 ? 'solide' as const : 'calme' as const;
    return { b, lundi, ruban, reussites, precedentes, moyenne, meilleur, ton };
  }, [aujourdhui.acces, aujourdhui.serie, invoices, clients, email, jour, tm]);

  const { b } = modele;
  const palierProche = b.jalons.prochainPalier;
  const cocher = (cle: 'relu' | 'decide' | 'mot') => {
    const suivant = { ...cases, [cle]: !cases[cle] };
    setCases(suivant);
    try { window.localStorage.setItem(cleCases, JSON.stringify(suivant)); } catch { /* local seulement */ }
  };
  return (
    <VueBilan
      prenom={(user?.email ?? '').split('@')[0].replace(/^./, (c) => c.toUpperCase()) || '—'}
      semaine={semaineIso(b.semaine.lundi)}
      du={String(Number(b.semaine.lundi.slice(8)))}
      au={court(ajouterJours(b.semaine.lundi, 4))}
      heureDuCalcul={new Date(maintenant).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })}
      ton={modele.ton}
      taches={{ n: b.tachesFaites.faites, ecart: b.tachesFaites.ecartSemainePrecedente, semainePrecedente: b.tachesFaites.faites - b.tachesFaites.ecartSemainePrecedente }}
      encaisse={{ cents: b.encaisse.cents, ecartPct: b.encaisse.ecartPourcent }}
      clients={{ n: b.nouveauxClients.nombre, ecart: b.nouveauxClients.ecartSemainePrecedente }}
      boiteAZero={null}
      meilleurJour={modele.meilleur}
      ruban={modele.ruban}
      reussites={modele.reussites}
      glisse={[]}
      glisseQuand="lundi"
      palier={palierProche === null ? null : { titre: tm('palier.serie', { n: b.jalons.serie, quand: '' }).replace(/, $/, ''), detail: b.jalons.dixFactures ? tm('palier.factures', { n: b.jalons.facturesEnvoyeesOuPayees, quand: '' }).replace(/, $/, '') : null, vers: palierProche, resteJours: b.jalons.joursRestants ?? 0, progression: b.jalons.progression }}
      cloture={cases}
      precedentes={{ semaines: modele.precedentes, cloturees: false, moyenne: modele.moyenne }}
      suggestion={null}
      vide={b.tachesFaites.faites === 0 && b.encaisse.cents === 0 && b.nouveauxClients.nombre === 0}
      onCocher={cocher}
      onCloturer={() => cocher('relu')}
    />
  );
}

export default BilanRefonte;
