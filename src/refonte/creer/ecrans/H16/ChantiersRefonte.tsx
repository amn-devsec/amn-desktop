import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import { chantierDepuisMontage, type MontageReel } from '../../reel';
import type { InterventionEntree } from '../../chantiers';
import { modeleDesChantiers } from './modele';
import { useMots } from './textes';
import { VueChantiers } from './VueChantiers';

interface InterventionReelle { title: string; clientName: string; at: string; closedAt?: string | null }

/**
 * H16 · CHANTIERS — branché sur les « montages » du dépôt (`assemblies`) et sur les interventions (`interventions`).
 * Les étapes se cochent ici (même écriture que l'écran d'origine : `doneAt`). Budget, dépensé et poids d'étape n'existent
 * pas dans le dépôt : la jauge dit « Budget non renseigné » (demande à amn-api, STATUT §1.27 n° 4).
 */
export function ChantiersRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const montages = useCollection<Omit<MontageReel, 'id'> & { updatedAt: string }>('assemblies');
  const visites = useCollection<InterventionReelle>('interventions');
  const [vue, setVue] = useState<'plans' | 'liste' | 'carte'>('plans');
  const [ouvertId, setOuvertId] = useState<string | null>(null);
  const aujourdhui = jourParis(maintenant);
  usePageCoquille({ famille: 'creer', sousPage: 'assembly', miettes: [{ libelle: tm('titre') }] });

  const modele = useMemo(() => {
    const chantiers = montages.map((m) => ({ ...chantierDepuisMontage(m as MontageReel, aujourdhui) }));
    const interventions: InterventionEntree[] = visites
      .filter((v) => !v.closedAt && v.at)
      .map((v) => ({
        id: v.id,
        chantierId: montages.find((m) => m.client === v.clientName)?.id ?? '',
        jour: jourParis(v.at),
        debut: new Date(v.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }),
        libelle: v.title,
      }));
    return modeleDesChantiers({ chantiers, interventions, livraisons: [], aujourdhui, ouvertId, langue });
  }, [montages, visites, aujourdhui, ouvertId, langue]);

  const cocher = (chantierId: string, indice: number) => {
    const m = montages.find((x) => x.id === chantierId);
    if (!m) return;
    const { id, updatedAt: _maj, ...data } = m as typeof m & { id: string };
    void _maj;
    const steps = m.steps.map((s, i) => (i === indice ? { ...s, doneAt: s.doneAt ? null : new Date().toISOString() } : s));
    upsert('assemblies', id, { ...data, steps, updatedAt: new Date().toISOString() });
  };

  return <VueChantiers modele={modele} vue={vue} onVue={setVue} onOuvrir={setOuvertId} onNouveau={() => navigate('/montage?nouveau=1')} onEtape={cocher} />;
}

export default ChantiersRefonte;
