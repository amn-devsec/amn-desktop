import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import { chantierDepuisMontage, type MontageReel } from '../../reel';
import type { InterventionEntree, LivraisonChantier } from '../../chantiers';
import { modeleDesChantiers } from './modele';
import { useMots } from './textes';
import { VueChantiers } from './VueChantiers';

interface InterventionReelle { title: string; clientName: string; at: string; closedAt?: string | null }
interface TourneeReelle { day: string; stops: { label: string; address?: string; doneAt: string | null }[] }

/**
 * H16 · CHANTIERS — branché sur les « montages » du dépôt (`assemblies`) et sur les interventions (`interventions`).
 * Les étapes se cochent ici (même écriture que l'écran d'origine : `doneAt`). Budget, dépensé et poids d'étape n'existent
 * pas dans le dépôt : la jauge vide dit « Budget non renseigné » (demande à amn-api, STATUT §1.27 n° 4).
 * Suggestion « Risque de retard » : règle réelle, une livraison non faite d'une tournée (`deliveryRounds`, arrêt qui cite le client du
 * chantier) tombe après la prochaine intervention du chantier ; « Voir la tournée » ouvre les tournées, rien n'est envoyé au client.
 */
export function ChantiersRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const montages = useCollection<Omit<MontageReel, 'id'> & { updatedAt: string }>('assemblies');
  const visites = useCollection<InterventionReelle>('interventions');
  const tournees = useCollection<TourneeReelle>('deliveryRounds');
  const [masquee, setMasquee] = useState(false);
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
    const livraisons: LivraisonChantier[] = montages.flatMap((m) => tournees
      .filter((t) => t.day >= aujourdhui)
      .flatMap((t) => t.stops
        .filter((a) => !a.doneAt && m.client && `${a.label} ${a.address ?? ''}`.toLowerCase().includes(m.client.toLowerCase()))
        .map((a) => ({ chantierId: m.id, jour: t.day, libelle: a.label }))));
    return modeleDesChantiers({ chantiers, interventions, livraisons, aujourdhui, ouvertId, langue });
  }, [montages, visites, tournees, aujourdhui, ouvertId, langue]);

  const cocher = (chantierId: string, indice: number) => {
    const m = montages.find((x) => x.id === chantierId);
    if (!m) return;
    const { id, updatedAt: _maj, ...data } = m as typeof m & { id: string };
    void _maj;
    const steps = m.steps.map((s, i) => (i === indice ? { ...s, doneAt: s.doneAt ? null : new Date().toISOString() } : s));
    upsert('assemblies', id, { ...data, steps, updatedAt: new Date().toISOString() });
  };

  return <VueChantiers modele={modele} vue={vue} onVue={setVue} onOuvrir={setOuvertId} onNouveau={() => navigate('/montage?nouveau=1')} onEtape={cocher} onDecaler={() => navigate('/tournees')} onIgnorer={() => setMasquee(true)} suggestionMasquee={masquee} />;
}

export default ChantiersRefonte;
