import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CircuitSignature } from '../../../../lib/cinquante/juridique';
import { useCollection } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { composerSignatures, type DemandeAffichee } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueSignatures } from './VueSignatures';

/**
 * H12 — Signatures, branché sur le poste. Route `/signature-a-distance` (substitution) : les circuits de signature à
 * distance (`signatureCircuits`) : un document, un client, des signataires dans l'ordre. Ce que le poste ne sait pas
 * n'est pas montré (fiche H12, rubrique 8 ; STATUT §1.27 n° 4) : pas de pose de champs sur la page (aucune donnée de
 * positions), pas d'heure d'ouverture par signataire (seulement un nombre d'ouvertures), pas de relance préparée ni
 * d'empreinte détaillée, pas de personne « en copie ».
 */
export default function PageSignatures() {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const circuits = useCollection<CircuitSignature>('signatureCircuits');
  const [choisie, setChoisie] = useState<string | null>(null);
  const maintenant = useMemo(() => new Date().toISOString(), []);

  usePageCoquille({ famille: 'ecrire', sousPage: 'remoteSign', miettes: [{ libelle: tm('titre') }] });

  const demandes = useMemo<DemandeAffichee[]>(
    () =>
      circuits
        .filter((c) => c.kind === 'circuit')
        .sort((a, b) => b.envoyeLe.localeCompare(a.envoyeLe))
        .map((c) => ({
          id: c.id,
          titre: c.document,
          client: c.client,
          envoyeAt: c.envoyeLe,
          devis: false,
          relancesEnvoyees: (c.relances ?? []).map((r) => r.le),
          signataires: c.signataires.map((s, i) => ({
            id: `${c.id}-${i}`,
            ordre: i + 1,
            role: 'signataire' as const,
            statut: s.signeLe ? ('Signé' as const) : (s.ouvertures ?? 0) > 0 ? ('Ouvert' as const) : ('En attente' as const),
            envoyeAt: i === 0 ? c.envoyeLe : (c.signataires[i - 1].signeLe ?? null),
            ouvertAt: null,
            signeAt: s.signeLe ?? null,
            nom: s.nom,
            fonction: s.role,
          })),
        })),
    [circuits],
  );
  const id = choisie && demandes.some((d) => d.id === choisie) ? choisie : (demandes[0]?.id ?? null);
  const v = composerSignatures({ langue, maintenant, demandes, choisie: id, relanceActive: true });

  return (
    <VueSignatures
      titre={tm('titre')}
      sousTitre={v.sousTitre}
      libelles={libellesDe(tm as never)}
      onEnvoyer={() => navigate('/signature-a-distance')}
      tickets={v.tickets}
      onChoisir={setChoisie}
      editeur={null}
      circuit={v.circuit}
      relance={null}
      preuve={null}
    />
  );
}
