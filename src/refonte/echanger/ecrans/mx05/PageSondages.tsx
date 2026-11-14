import React, { useMemo, useState } from 'react';
import { useOutlet } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { isAdminRole } from '../../../../auth/roles';
import { useProfiles } from '../../../../state/ProfilesContext';
import { uid, useCollection, useSync } from '../../../../state/SyncContext';
import { useMembers } from '../../../../state/useMembers';
import { usePageCoquille } from '../../../coquille/page';
import { composerSondages, type SondageAffichable } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueSondages } from './VueSondages';

/**
 * MX05 — Sondages, branché sur le poste. Route `/sondages` (substitution de l'écran d'origine). Ce que le poste sait : la
 * question, les options, qui a voté quoi (sans l'heure), le caractère anonyme, la clôture, l'équipe comme destinataires. Ce
 * qu'il ne sait pas n'est pas montré (STATUT §1.27 n° 4) : pas de « Votes en direct » (aucune heure de vote), pas de type de
 * réponse autre qu'un choix, de clients, de visibilité des résultats, de date de clôture, de brouillon d'Ajmani ni de lien de
 * partage. « Tous les sondages » passe la main à l'écran d'origine (`useOutlet`) : la suppression d'un sondage, absente
 * de la fiche v4, y reste, avec sa confirmation (décision du CO). Créer, voter (une barre se clique tant qu'on n'a pas voté) et clore gardent la logique de l'écran d'origine.
 */
interface SondageData {
  question: string;
  options: string[];
  votes: Record<string, number>;
  createdBy: string;
  createdAt: string;
  closedAt: string | null;
  anonymous: boolean;
}

export default function PageSondages() {
  const { tm, langue } = useMots();
  const { user, role } = useAuth();
  const { upsert } = useSync();
  const { profileFor } = useProfiles();
  const { membres } = useMembers();
  const brutes = useCollection<SondageData>('polls');
  const origine = useOutlet();
  const [passee, setPassee] = useState(false);
  const [choisiId, setChoisiId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [anonyme, setAnonyme] = useState(false);
  const maintenant = useMemo(() => new Date().toISOString(), []);
  const moi = user?.email ?? '';
  usePageCoquille({ famille: 'echanger', sousPage: 'sondages', miettes: [{ libelle: tm('titre') }] });

  const nom = (email: string) => profileFor(email).name || email;
  const sondages: SondageAffichable[] = useMemo(
    () =>
      brutes.map((s) => ({
        id: s.id,
        question: s.question,
        type: 'un-choix' as const,
        options: s.options.map((libelle, i) => ({ id: String(i), libelle, votes: 0 })),
        anonyme: s.anonymous,
        destinataires: Math.max(membres.length, Object.keys(s.votes ?? {}).length),
        // Le poste garde qui a voté quoi, pas l'heure : `at` n'est jamais affiché (« Votes en direct » est masqué).
        votes: Object.entries(s.votes ?? {}).map(([email, idx]) => ({ email, optionId: String(idx), at: s.createdAt })),
        etat: s.closedAt ? ('termine' as const) : ('en-cours' as const),
        creeAt: s.createdAt,
        clotureAt: s.closedAt,
        heuresConnues: false,
      })),
    [brutes, membres.length],
  );

  const envoyer = async () => {
    const choix = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || choix.length < 2 || !moi) return;
    await upsert('polls', uid('poll'), { question: question.trim(), options: choix, votes: {}, createdBy: moi, createdAt: new Date().toISOString(), closedAt: null, anonymous: anonyme });
    setQuestion('');
    setOptions(['', '']);
    setAnonyme(false);
  };
  const brut = (id: string) => brutes.find((s) => s.id === id);
  const voter = (id: string, optionId: string) => {
    const s = brut(id);
    if (s && moi) void upsert('polls', id, { ...s, votes: { ...(s.votes ?? {}), [moi]: Number(optionId) } });
  };
  const clore = (id: string) => {
    const s = brut(id);
    if (s) void upsert('polls', id, { ...s, closedAt: new Date().toISOString() });
  };

  if (passee && origine) return <>{origine}</>;
  const v = composerSondages({ langue, maintenant, moi, nom, sondages, choisiId, editeur: { question, options, anonyme, ajmani: null, extras: null }, actions: { onVoter: voter } });
  return (
    <VueSondages
      {...v}
      etat="normal"
      libelles={libellesDe(tm as never)}
      actions={{
        onPuce: setChoisiId,
        onTous: origine ? () => setPassee(true) : undefined,
        onAutre: setChoisiId,
        onClore: v.resultat && v.resultat.peutClore && (brut(v.resultat.id)?.createdBy === moi || isAdminRole(role)) ? () => clore(v.resultat?.id ?? '') : undefined,
        onQuestion: setQuestion,
        onOption: (i, val) => setOptions((o) => o.map((x, j) => (j === i ? val : x))),
        onRetirerOption: (i) => setOptions((o) => (o.length > 2 ? o.filter((_, j) => j !== i) : o.map((x, j) => (j === i ? '' : x)))),
        onAjouterOption: () => setOptions((o) => [...o, '']),
        onAnonyme: setAnonyme,
        onEnvoyer: () => void envoyer(),
      }}
    />
  );
}
