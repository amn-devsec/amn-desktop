import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modale, Saisie } from '../../../../socle/ui';
import { compteur, kmPointes, type TourneeFlotte, type Vehicule } from '../../../../lib/cinquante/ajouts';
import { uid, useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { ajouterJours, jourParis, type Jour } from '../../commun';
import { bilanDuMois, etatDuVehicule, type EcheanceEntree } from '../../flotte';
import { useMots } from './textes';
import { VueFlotte, type VehiculeVue } from './VueFlotte';

type VehiculeReel = Vehicule & { id: string };
type TourneeReelle = TourneeFlotte & { id: string };

/**
 * MR09 · FLOTTE — branchée sur les véhicules du dépôt (`vehicles`) et sur les tournées pointées (`deliveryRounds`) : le compteur est le
 * kilométrage de départ plus les kilomètres des arrêts pointés, le rythme des 30 derniers jours date les échéances au kilomètre.
 * Absents du dépôt (STATUT §1.27 n° 4) : l'énergie (thermique par défaut), le niveau de carburant ou de charge (« Aucun plein
 * enregistré »), l'autonomie, le conducteur et le lieu du garage. « En tournée » : une tournée du jour avec ce véhicule n'est pas
 * finie. Aucun suivi de position. « Avant le prochain trajet » reste local à l'écran (pas d'écriture dans Tâches sans collection).
 */
export function FlotteRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const brutes = useCollection<VehiculeReel>('vehicles');
  const tournees = useCollection<TourneeReelle>('deliveryRounds');
  const [coches, setCoches] = useState<ReadonlySet<string>>(new Set());
  const [masquee, setMasquee] = useState(false);
  const [ouverte, setOuverte] = useState(false);
  const [nom, setNom] = useState('');
  const [plaque, setPlaque] = useState('');
  const [km, setKm] = useState('');
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'fleet', miettes: [{ libelle: tm('titre') }] });

  const { vehicules, bilan } = useMemo(() => {
    const flotte = brutes.filter((v) => v.kind === 'vehicule');
    const kmDuJour = (t: TourneeFlotte) => kmPointes(t);
    const il7 = ajouterJours(aujourdhui, -7);
    const il30 = ajouterJours(aujourdhui, -30);
    const vues: VehiculeVue[] = flotte.map((v) => {
      const siennes = tournees.filter((t) => t.vehiculeId === v.id);
      const enCours = siennes.some((t) => t.day === aujourdhui && t.stops.length > 0 && t.stops.some((a) => !a.doneAt));
      const echeances: EcheanceEntree[] = v.echeances.map((e) => ({
        nom: e.nom, nature: e.nature, intervalle: e.intervalle, dernierKm: e.dernierKm ?? null, dernierLe: e.dernierLe ? e.dernierLe.slice(0, 10) : null, rendezVous: Boolean(e.rendezVous), feminin: e.feminin,
      }));
      return {
        id: v.id, nom: v.nom, plaque: v.immatriculation, energie: 'thermique', etat: etatDuVehicule('Disponible', enCours),
        niveauPct: null, autonomiePleineKm: null, km: compteur(v, tournees).km,
        kmSemaine: Math.round(siennes.filter((t) => t.day >= il7).reduce((s, t) => s + kmDuJour(t), 0)),
        kmSur30Jours: siennes.filter((t) => t.day >= il30).reduce((s, t) => s + kmDuJour(t), 0), echeances,
      };
    });
    const parJour = new Map<Jour, { jour: Jour; km: number; carburantCents: number }>();
    const ligne = (j: Jour) => { let l = parJour.get(j); if (!l) { l = { jour: j, km: 0, carburantCents: 0 }; parJour.set(j, l); } return l; };
    for (const v of flotte) {
      for (const t of tournees.filter((x) => x.vehiculeId === v.id)) ligne(t.day).km += kmDuJour(t);
      for (const c of v.couts) if (c.nature === 'carburant') ligne(c.le.slice(0, 10)).carburantCents += c.montantCents;
    }
    const b = bilanDuMois([...parJour.values()], aujourdhui);
    return { vehicules: vues, bilan: { kmDuMois: Math.round(b.kmDuMois), variationCarburantPct: b.variationCarburantPct } };
  }, [brutes, tournees, aujourdhui]);

  const creer = () => {
    const compteurDepart = Math.max(0, Math.round(Number(km.replace(/\s/g, '').replace(',', '.')) || 0));
    const fiche: Vehicule = { kind: 'vehicule', nom: nom.trim(), ...(plaque.trim() ? { immatriculation: plaque.trim().toUpperCase() } : {}), kmDepart: compteurDepart, departLe: new Date(maintenant).toISOString(), echeances: [], couts: [] };
    void upsert('vehicles', uid('veh'), { ...fiche });
    setOuverte(false); setNom(''); setPlaque(''); setKm('');
  };

  return (
    <>
      <VueFlotte
        vehicules={vehicules}
        aujourdhui={aujourdhui}
        bilan={bilan}
        coches={coches}
        onCocher={(id) => setCoches((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
        onAjouter={() => setOuverte(true)}
        onCarnets={() => navigate('/classeur')}
        onNon={() => setMasquee(true)}
        suggestionMasquee={masquee}
      />
      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={tm('nouvelle.titre')}
        famille="creer"
        actions={<><button type="button" className="cr-bouton-verre" onClick={() => setOuverte(false)}>{tm('nouvelle.annuler')}</button><button type="button" className="cr-bouton-plein" disabled={nom.trim() === ''} onClick={creer}>{tm('nouvelle.creer')}</button></>}
      >
        <div className="cr-fl-formulaire">
          <Saisie etiquette={tm('nouvelle.nom')} value={nom} onChange={(e) => setNom(e.target.value)} autoFocus />
          <Saisie etiquette={tm('nouvelle.plaque')} value={plaque} onChange={(e) => setPlaque(e.target.value)} />
          <Saisie etiquette={tm('nouvelle.compteur')} suffixe="km" inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} />
        </div>
      </Modale>
    </>
  );
}

export default FlotteRefonte;
