import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis, type Jour } from '../../commun';
import type { Phase } from '../../photos';
import { useMots } from './textes';
import { VuePhotos, type DossierVue, type PhotoVue } from './VuePhotos';

interface VoletReel { photo?: string; note?: string }
interface InterventionReelle {
  title: string; clientName: string; address?: string; at: string; closedAt?: string | null;
  volets?: Partial<Record<'avant' | 'pendant' | 'apres', VoletReel>>;
}

const PHASES: ReadonlyArray<readonly ['avant' | 'pendant' | 'apres', Phase]> = [['avant', 'Avant'], ['pendant', 'Pendant'], ['apres', 'Après']];

/**
 * MR10 · PHOTOS DE CHANTIER — branché sur les interventions du dépôt (`interventions`) : une intervention porte AU PLUS une photo par volet
 * (avant, pendant, après), lue en `data:` ; aucun nouvel hébergement de fichiers (STATUT §1.27 n° 7). Un dossier regroupe les interventions
 * d'un même client. La date de la photo est celle de l'intervention, le lieu son adresse (le dépôt n'a ni date ni lieu « à la prise », ni auteur,
 * ni orientation) ; la signature du client, le partage par lien protégé et le rappel interne n'existent pas : « Signature du client » reste
 * à faire, « Partager au client » est inactif, la suggestion « Compléter » est masquée. « Ajouter des photos » ouvre l'intervention.
 */
export function PhotosRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm } = useMots();
  const navigate = useNavigate();
  const interventions = useCollection<InterventionReelle & { id: string }>('interventions');
  const [ouvertId, setOuvertId] = useState<string | null>(null);
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'photosChantier', miettes: [{ libelle: tm('titre') }] });

  const dossiers = useMemo<DossierVue[]>(() => {
    const parClient = new Map<string, (InterventionReelle & { id: string })[]>();
    for (const i of interventions) {
      const cle = (i.clientName || i.title || i.id).trim();
      parClient.set(cle, [...(parClient.get(cle) ?? []), i]);
    }
    return [...parClient.entries()].map(([nom, liste]) => {
      const photos: PhotoVue[] = liste.flatMap((i) => PHASES.flatMap(([cle, phase]) => {
        const v = i.volets?.[cle];
        return v?.photo ? [{ id: `${i.id}-${cle}`, phase, le: jourParis(i.at), lieu: i.address || undefined, src: v.photo.startsWith('data:') ? v.photo : undefined }] : [];
      }));
      const termines = liste.filter((i) => i.closedAt).map((i) => jourParis(i.closedAt as string)).sort();
      const prochain = liste.map((i) => jourParis(i.at)).filter((j) => j >= aujourdhui).sort()[0] ?? null;
      return { id: nom, nom, photos, termineLe: termines.length === liste.length ? termines[termines.length - 1] ?? null : null, debutPrevuLe: prochain as Jour | null, demarre: photos.length > 0 };
    }).sort((a, b) => (b.photos.length > 0 ? 1 : 0) - (a.photos.length > 0 ? 1 : 0) || b.photos.length - a.photos.length || a.nom.localeCompare(b.nom));
  }, [interventions, aujourdhui]);

  return (
    <VuePhotos
      dossiers={dossiers}
      ouvertId={ouvertId}
      onOuvrir={setOuvertId}
      aujourdhui={aujourdhui}
      onAjouter={() => navigate('/interventions')}
      onSignature={() => navigate('/signature')}
      suggestionMasquee
    />
  );
}

export default PhotosRefonte;
