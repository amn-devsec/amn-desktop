import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { engagementDe, type BrouillonRedaction } from '../../../../lib/cinquante/ajouts';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { composerRedaction, type BrouillonDuTexte } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueRedaction } from './VueRedaction';

/**
 * ME02 — Rédaction et traduction, branché sur le poste. Route `/outils/redaction` (substitution). Le poste garde des
 * brouillons à corrections (`writingDrafts`) : le texte de la personne, ce qu'Ajmani retire (barré) ou ajoute (souligné),
 * chaque correction avec sa raison. Accepter ou ignorer une correction se fait ICI et s'enregistre ; un engagement
 * (geste commercial, date, prix) reste en attention jusqu'à la décision. Ce que le poste ne sait pas n'est pas montré
 * (fiche ME02, rubrique 8 ; STATUT §1.27 n° 4) : ni ton, ni longueur, ni langue choisis, pas de destinataire ni de pièce
 * jointe, pas de vérification de date au planning, pas de traduction ; et le bouton « Envoyer » reste inactif : « l'assistant
 * ne publie jamais » (l'envoi est le geste de la personne, depuis l'écran qui envoie).
 */
type B = BrouillonRedaction & { id: string; updatedAt: string };

export default function PageRedaction() {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { upsert } = useSync();
  const tout = useCollection<BrouillonRedaction>('writingDrafts');
  const [choisi, setChoisi] = useState<string | null>(null);

  usePageCoquille({ famille: 'ecrire', sousPage: 'writing', miettes: [{ libelle: tm('titre') }] });

  const brouillons = useMemo(() => tout.filter((x): x is B => x.kind === 'brouillon').sort((a, b) => b.creeLe.localeCompare(a.creeLe)), [tout]);
  const entrees = useMemo<BrouillonDuTexte[]>(
    () =>
      brouillons.map((b) => ({
        id: b.id,
        titre: b.titre,
        source: b.source ? { surtitre: b.source.surtitre, texte: b.source.texte } : null,
        publie: !!b.publieeLe,
        morceaux: b.morceaux.map((m) => (m.type === 'texte' ? { type: 'texte' as const, texte: m.texte } : { type: 'correction' as const, retire: m.retire, ajoute: m.ajoute, raison: m.raison, explication: m.explication, valeur: m.valeur, decision: m.decision, engagement: engagementDe(m.ajoute) !== null })),
      })),
    [brouillons],
  );

  const v = composerRedaction(
    { langue, brouillons: entrees, choisi, longueur: 'moyen', enregistreA: null },
    {
      onChoisir: setChoisi,
      onDecider: (i, decision) => {
        const b = brouillons.find((x) => x.id === (choisi ?? brouillons[0]?.id));
        if (!b) return;
        const { id: _id, updatedAt: _maj, ...donnees } = b;
        void _id;
        void _maj;
        void upsert('writingDrafts', b.id, { ...donnees, morceaux: b.morceaux.map((m, k) => (k === i && m.type === 'correction' ? { ...m, decision } : m)) });
      },
    },
  );
  const { courant, ...base } = v;
  void courant;
  return (
    <VueRedaction
      {...base}
      titre={tm('titre')}
      sousTitre={tm('sousTitre')}
      libelles={libellesDe(tm as never)}
      onNouveau={() => navigate('/outils/redaction')}
      onOnglet={setChoisi}
      mode={{ valeur: 'rediger', options: [{ cle: 'rediger', libelle: tm('mode.rediger') }, { cle: 'traduire', libelle: tm('mode.traduire') }], onChange: () => undefined }}
      reglages={null}
    />
  );
}
