import React, { useMemo, useState } from 'react';
import { useNavigate, useOutlet } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useProfiles } from '../../../../state/ProfilesContext';
import { uid, useCollection, useSync } from '../../../../state/SyncContext';
import { useMembers } from '../../../../state/useMembers';
import { Bouton, Modale, Saisie } from '../../../../socle/ui';
import { usePageCoquille } from '../../../coquille/page';
import { composerCanaux, type CanalAffichable, type MessageAffichable } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueCanaux } from './VueCanaux';

/**
 * MX04 — Canaux, branché sur le poste. Route `/groupes` (substitution de l'écran d'origine). Ce que le poste sait : les groupes
 * (nom, membres) et leurs messages. Ce qu'il ne sait pas n'est pas montré (STATUT §1.27 n° 4) : pas de pastille de non lus (aucune
 * dernière lecture par canal), pas de réactions par icônes (les réactions de l'équipe sont des émojis), pas de fils de réponses ni
 * de résumé d'Ajmani, pas de carte « Urgent » (aucun lien ticket-canal), pas de « en train d'écrire » ni de statut des messages
 * directs (pas de signal). « général » ouvre la messagerie d'équipe (`/team`), qui garde ses fils, ses réactions et ses
 * épingles. Créer un canal et écrire dedans gardent la logique de l'écran d'origine ; « Parcourir les canaux » passe la main à l'écran d'origine
 * (`useOutlet`) : dissoudre un canal, absent de la fiche v4, y reste, avec sa confirmation (décision du CO).
 */
interface GroupeData {
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
}
interface MessageDeGroupeData {
  groupId: string;
  authorEmail: string;
  body: string;
  createdAt: string;
}
const GENERAL = '__general';

export default function PageCanaux() {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const origine = useOutlet();
  const [passee, setPassee] = useState(false);
  const { user, role } = useAuth();
  const { upsert } = useSync();
  const { profileFor } = useProfiles();
  const { membres } = useMembers();
  const groupes = useCollection<GroupeData>('groups');
  const brutsMessages = useCollection<MessageDeGroupeData>('groupMessages');
  const [canalId, setCanalId] = useState<string | null>(null);
  const [texte, setTexte] = useState('');
  const [creation, setCreation] = useState(false);
  const [nom, setNom] = useState('');
  const [choisis, setChoisis] = useState<string[]>([]);
  const maintenant = useMemo(() => new Date().toISOString(), []);
  const moi = user?.email ?? '';
  usePageCoquille({ famille: 'echanger', sousPage: 'canaux', miettes: [{ libelle: tm('titre') }] });

  const nomDe = (email: string) => profileFor(email).name || email;
  const canaux: CanalAffichable[] = useMemo(
    () => [
      { id: GENERAL, nom: 'général', visibilite: 'public', membres: [], lectureAt: undefined, ouvreAilleurs: true },
      ...groupes.map((g) => ({ id: g.id, nom: g.name, visibilite: 'privé' as const, membres: g.members ?? [], lectureAt: undefined })),
    ],
    [groupes],
  );
  const messages: MessageAffichable[] = useMemo(() => brutsMessages.map((m) => ({ id: m.id, canalId: m.groupId, auteurEmail: m.authorEmail, at: m.createdAt, texte: m.body })), [brutsMessages]);

  if (passee && origine) return <>{origine}</>;
  const v = composerCanaux({ langue, maintenant, moi, role: role ?? '', nom: nomDe, canaux, messages, evenements: [], directs: [], frappes: [], canalId, filOuvertId: null, brouillon: texte, avecReactions: false, peutTache: false });
  const envoyer = async () => {
    const corps = texte.trim();
    const cible = v.rail.canaux.find((c) => c.actif);
    if (!corps || !cible || !moi) return;
    setTexte('');
    await upsert('groupMessages', uid('gm'), { groupId: cible.id, authorEmail: moi, body: corps, createdAt: new Date().toISOString() });
  };
  const creer = async () => {
    if (!nom.trim() || !moi) return;
    const id = uid('grp');
    await upsert('groups', id, { name: nom.trim(), members: [...new Set([moi, ...choisis])], createdBy: moi, createdAt: new Date().toISOString() });
    setNom('');
    setChoisis([]);
    setCreation(false);
    setCanalId(id);
  };
  const autres = membres.filter((m) => m.email && m.email !== moi);

  return (
    <>
      <VueCanaux
        {...v}
        etat="normal"
        libelles={libellesDe(tm as never)}
        actions={{
          onCanal: (id) => (id === GENERAL ? navigate('/team') : setCanalId(id)),
          onNouveauCanal: () => setCreation(true),
          onParcourir: origine ? () => setPassee(true) : undefined,
          onValeur: setTexte,
          onEnvoyer: () => void envoyer(),
        }}
      />
      <Modale
        ouverte={creation}
        onFermer={() => setCreation(false)}
        titre={tm('creer.titre')}
        actions={
          <>
            <Bouton variante="secondaire" onClick={() => setCreation(false)}>{tm('creer.annuler')}</Bouton>
            <Bouton variante="primaire" onClick={() => void creer()} disabled={!nom.trim()}>{tm('creer.creer')}</Bouton>
          </>
        }
      >
        <Saisie etiquette={tm('creer.nom')} value={nom} onChange={(e) => setNom(e.target.value)} autoFocus />
        {autres.length > 0 && (
          <fieldset style={{ border: 0, padding: 0, margin: '12px 0 0' }}>
            <legend style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{tm('creer.membres')}</legend>
            {autres.map((m) => (
              <label key={m.email} style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 34 }}>
                <input type="checkbox" checked={choisis.includes(m.email)} onChange={(e) => setChoisis((c) => (e.target.checked ? [...c, m.email] : c.filter((x) => x !== m.email)))} />
                {nomDe(m.email)}
              </label>
            ))}
          </fieldset>
        )}
      </Modale>
    </>
  );
}
