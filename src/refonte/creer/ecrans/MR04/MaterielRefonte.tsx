import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import { useMots } from './textes';
import { VueMateriel, type EquipementVue, type MouvementVue } from './VueMateriel';

interface RessourceReelle { name: string; kind: string; createdAt?: string }
interface PretReel { resourceId: string; startAt: string; endAt: string; purpose: string; byEmail: string }

/**
 * MR04 · MATÉRIEL — branché sur les ressources et les prêts du dépôt (`resources`, `resourceBookings`). Un équipement est
 * « En prêt » quand un prêt est en cours (la personne est celle du prêt), « Disponible » sinon. L'état, le numéro de série,
 * l'entretien et la valeur n'existent pas dans le dépôt : « non disponible » (STATUT §1.27 n° 4). Rien n'est supposé.
 */
export function MaterielRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ressources = useCollection<RessourceReelle>('resources');
  const prets = useCollection<PretReel>('resourceBookings');
  const [faits, setFaits] = useState<ReadonlySet<string>>(new Set());
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'equipment', miettes: [{ libelle: tm('titre') }] });

  const { equipements, mouvements } = useMemo(() => {
    const eq: EquipementVue[] = ressources.map((r) => {
      const pret = prets.find((b) => b.resourceId === r.id && Date.parse(b.startAt) <= maintenant && Date.parse(b.endAt) >= maintenant);
      const nom = pret ? pret.byEmail.split('@')[0].replace(/^./, (c) => c.toUpperCase()) : '';
      return {
        id: r.id, nom: r.name, numero: r.id.slice(-6).toUpperCase(), categorie: r.kind, etat: '—',
        affectation: pret ? { type: 'personne', libelle: nom, depuisLe: jourParis(pret.startAt), retourPrevuLe: jourParis(pret.endAt) } : { type: 'lieu', libelle: '—' },
      };
    });
    const mv: MouvementVue[] = prets
      .filter((b) => jourParis(b.startAt) === aujourdhui)
      .map((b) => ({ id: `${b.resourceId}-${b.startAt}`, heure: new Date(b.startAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }), qui: b.byEmail, texte: `${b.byEmail.split('@')[0]} · ${b.purpose}`, icone: 'pret' as const }));
    return { equipements: eq, mouvements: mv };
  }, [ressources, prets, maintenant, aujourdhui]);

  return (
    <VueMateriel
      equipements={equipements}
      aujourdhui={aujourdhui}
      utilisateur={user?.email?.split('@')[0] ?? ''}
      mouvements={mouvements}
      faitsDuMois={faits}
      onCocher={(id) => setFaits((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
      onAjouter={() => navigate('/materiel?nouveau=1')}
    />
  );
}

export default MaterielRefonte;
