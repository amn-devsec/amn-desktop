import React, { useMemo, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { useProfiles } from '../../../../state/ProfilesContext';
import { uid, useCollection, useSync } from '../../../../state/SyncContext';
import { useMembers } from '../../../../state/useMembers';
import { usePageCoquille } from '../../../coquille/page';
import { composerAnnonces, type AnnonceAffichable } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueAnnonces } from './VueAnnonces';

/**
 * H14 — Annonces, branché sur le poste. Route `/annonces` (substitution de l'écran d'origine). Ce que le poste sait : le
 * titre, le texte, l'auteur, la date et qui a confirmé (`readBy`, sans l'heure). Ce qu'il ne sait pas n'est pas montré
 * (STATUT §1.27 n° 4 : aucune nouvelle donnée synchronisée sans l'accord de Harun) : ni catégories ni leur carte, ni
 * réactions, ni épingle (« À la une » est la plus récente, sans bordure ambre), ni réponses, ni rappel d'Ajmani, ni
 * « Nouveauté d'AMN Business ». Publier et « J'ai lu » gardent la logique de l'écran d'origine (`upsert`).
 */
interface AnnonceData {
  title: string;
  body: string;
  authorEmail: string;
  createdAt: string;
  readBy: string[];
}

export default function PageAnnonces() {
  const { tm, langue } = useMots();
  const { user } = useAuth();
  const { upsert } = useSync();
  const { profileFor } = useProfiles();
  const { membres } = useMembers();
  const brutes = useCollection<AnnonceData>('announcements');
  const [titre, setTitre] = useState('');
  const [texte, setTexte] = useState('');
  const maintenant = useMemo(() => new Date().toISOString(), []);
  const moi = user?.email ?? '';
  usePageCoquille({ famille: 'echanger', sousPage: 'annonces', miettes: [{ libelle: tm('titre') }] });

  const equipe = useMemo(() => membres.filter((m) => m.email).map((m) => ({ email: m.email, nom: profileFor(m.email).name || m.email })), [membres, profileFor]);
  const annonces: AnnonceAffichable[] = useMemo(
    () =>
      brutes.map((a) => ({
        id: a.id,
        auteurEmail: a.authorEmail,
        auteurNom: profileFor(a.authorEmail).name || a.authorEmail,
        publieeAt: a.createdAt,
        titre: a.title,
        texte: a.body ?? '',
        categorie: '',
        epinglee: false,
        confirmations: (a.readBy ?? []).map((email) => ({ email })),
      })),
    [brutes, profileFor],
  );

  const publier = async () => {
    if (!titre.trim() || !moi) return;
    await upsert('announcements', uid('ann'), { title: titre.trim(), body: texte.trim(), authorEmail: moi, createdAt: new Date().toISOString(), readBy: [moi] });
    setTitre('');
    setTexte('');
  };
  const lire = (id: string) => {
    const a = brutes.find((x) => x.id === id);
    if (a && moi) void upsert('announcements', id, { ...a, readBy: [...new Set([...(a.readBy ?? []), moi])] });
  };

  const v = composerAnnonces({ langue, maintenant, moi, equipe, annonces, avecCategories: false, avecReactions: false, filtre: null, brouillon: { titre, texte, epingler: null } });
  return (
    <VueAnnonces
      {...v}
      etat="normal"
      libelles={libellesDe(tm as never)}
      actions={{
        onJaiLu: lire,
        onBrouillon: (c) => {
          if (c.titre !== undefined) setTitre(c.titre);
          if (c.texte !== undefined) setTexte(c.texte);
        },
        onEnvoyerBrouillon: titre.trim() ? () => void publier() : undefined,
      }}
    />
  );
}
