import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { useProfilesOptionnel } from '../../../../state/ProfilesContext';
import { useNotes } from '../../../../state/useNotes';
import { usePageCoquille } from '../../../coquille/page';
import { prenomAffichable } from '../../../systeme/demarrage/etapes';
import type { PageMin } from '../../pages';
import { motsParJour } from '../../serie';
import { composerNotes } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueNotes } from './VueNotes';

/**
 * H10 — Notes et pages, branché sur le poste. Les pages sont les notes (`useNotes`) : titre et texte, enregistrés au fil
 * de la frappe. Ce que le poste n'a pas n'est pas montré (fiche H10, rubrique 8 ; STATUT §1.27 n° 4, §1.29 n° 3) : pas de
 * blocs ni de menu « / », pas de commentaires ni de suggestions d'Ajmani, pas de présence en direct, pas de dossiers
 * de clients. Route : `/notes`, la route d'origine (substitution).
 */
export default function PageNotes() {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { id: idUrl } = useParams();
  const { user } = useAuth();
  const profils = useProfilesOptionnel();
  const { notes, createNote, updateNote } = useNotes();
  const email = user?.email ?? '';
  const prenom = prenomAffichable(profils?.profileFor(email).name, user?.name);
  const [recherche, setRecherche] = useState('');
  const [choisie, setChoisie] = useState<string | null>(idUrl ?? null);
  const maintenant = useMemo(() => new Date().toISOString(), []);

  usePageCoquille({ famille: 'ecrire', sousPage: 'notes', miettes: [{ libelle: tm('titre') }] });

  const pages = useMemo<PageMin[]>(
    () =>
      notes.map((n) => ({
        id: n.id,
        title: n.title,
        parentId: null,
        espace: n.scope === 'personal' ? ('Personnel' as const) : ('Équipe' as const),
        clientId: null,
        blocs: n.body.split('\n').filter((l) => l.trim()).map((texte) => ({ type: 'texte' as const, texte })),
        auteurEmail: n.authorEmail,
        contributeurs: [n.authorEmail],
        modifieAt: n.updatedAt,
        modifieParEmail: n.authorEmail,
        favorisDe: n.pinned ? [email] : [],
      })),
    [notes, email],
  );
  const mots = useMemo(() => motsParJour(notes.map((n) => ({ jour: n.updatedAt.slice(0, 10), mots: `${n.title} ${n.body}`.split(/\s+/).filter(Boolean).length }))), [notes]);
  const pageId = choisie && notes.some((n) => n.id === choisie) ? choisie : (notes[0]?.id ?? null);
  const note = notes.find((n) => n.id === pageId) ?? null;

  // Enregistrement une seconde après la dernière frappe (H10 §8).
  const [titre, setTitre] = useState('');
  const [corps, setCorps] = useState('');
  const [etat, setEtat] = useState<'rien' | 'attente' | 'ok'>('rien');
  const dernier = useRef<number | null>(null);
  useEffect(() => {
    setTitre(note?.title ?? '');
    setCorps(note?.body ?? '');
    setEtat('rien');
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!note || etat !== 'attente') return undefined;
    const t = window.setTimeout(() => {
      updateNote(note.id, { title: titre, body: corps });
      dernier.current = Date.now();
      setEtat('ok');
    }, 1000);
    return () => window.clearTimeout(t);
  }, [note, etat, titre, corps, updateNote]);

  const vue = composerNotes(
    {
      langue,
      maintenant,
      moi: { email, prenom },
      pages,
      pageId,
      recherche,
      mots,
      clientDe: () => null,
      vers: () => undefined,
      onOuvrir: (p) => setChoisie(p.id),
      ecritDans: null,
    },
    tm as never,
  );
  const { pageMeta, planBlocs, ...base } = vue;
  void planBlocs;
  return (
    <VueNotes
      {...base}
      libelles={libellesDe(tm as never)}
      arbre={{ ...base.arbre, onRecherche: setRecherche }}
      onNouvellePage={() => {
        const id = createNote('team');
        setChoisie(id);
        navigate('/notes');
      }}
      page={
        note && pageMeta
          ? {
              chemin: pageMeta.chemin,
              enregistre: etat === 'attente' ? tm('enregistrement') : etat === 'ok' ? tm('enregistre', { n: 0 }) : null,
              titre: (
                <input
                  className="ec-h10__titre-saisie"
                  value={titre}
                  placeholder={tm('titrePlaceholder')}
                  aria-label={tm('titrePlaceholder')}
                  onChange={(e) => {
                    setTitre(e.target.value);
                    setEtat('attente');
                  }}
                />
              ),
              proprietes: [],
              personnes: [],
              corps: (
                <textarea
                  value={corps}
                  placeholder={tm('corpsPlaceholder')}
                  aria-label={tm('corpsPlaceholder')}
                  onChange={(e) => {
                    setCorps(e.target.value);
                    setEtat('attente');
                  }}
                />
              ),
            }
          : null
      }
    />
  );
}
