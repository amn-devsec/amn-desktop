import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, BookOpen, FileSignature, FileText, Folder, Layers, Lightbulb, Mic, PenLine, Plus } from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';
import { isModuleEnabled } from '../../../../data/spaces';
import { useProfilesOptionnel } from '../../../../state/ProfilesContext';
import { useCollection } from '../../../../state/SyncContext';
import { useNotes } from '../../../../state/useNotes';
import { usePageCoquille } from '../../../coquille/page';
import { prenomAffichable } from '../../../systeme/demarrage/etapes';
import type { FiltreDePages, PageMin } from '../../pages';
import { motsParJour } from '../../serie';
import { composerHub } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueHub } from './VueHub';

/**
 * F20 — Écrire et retenir, vue d'ensemble : la page, branchée sur le poste. Route `/ensemble/ecrire` (substitution du
 * hub, `substitutions/declarations/ecrire.tsx`). Ce qu'elle montre vient des vraies données ; ce que le poste ne sait
 * pas, elle ne le montre pas (fiche F20, rubrique 8, et STATUT §1.27 n° 4 : aucune collection n'est ajoutée sans
 * l'accord de Harun) :
 *   · les pages sont les notes de l'équipe (`useNotes`) ; un aperçu de page, ce sont les lignes de son texte ;
 *   · pas de présence en direct (§1.29 n° 3) : jamais de curseur ni de « Mohamed écrit » ;
 *   · pas de file de relecture, de souvenir de journal ni de rangement des notes rapides tant que ces sources
 *     n'existent pas : la carte dit « Rien n'attend de relecture » ;
 *   · Archives et Dictée vocale n'ont pas encore d'écran (ME04, point d'entrée à créer) : leurs tuiles ne se montrent pas.
 */

const ROUTES: Record<string, string> = {
  notes: '/notes',
  documents: '/classeur',
  journal: '/journal-de-bord',
  redaction: '/outils/redaction',
  modeles: '/outils/modeles',
  signatures: '/signature',
  connaissances: '/knowledge',
};
const VUES: Record<string, string> = { notes: 'notes', documents: 'binder', journal: 'logbook', redaction: 'writing', modeles: 'templates', signatures: 'esign', connaissances: 'knowledge' };

const ICONES: Record<string, React.ReactNode> = {
  notes: <FileText size={14} />,
  documents: <Folder size={14} />,
  journal: <BookOpen size={14} />,
  redaction: <PenLine size={14} />,
  modeles: <Layers size={14} />,
  signatures: <FileSignature size={14} />,
  archives: <Archive size={14} />,
  connaissances: <Lightbulb size={14} />,
  dictee: <Mic size={14} />,
  nouvellePage: <Plus size={13} />,
};
const NOMS_FR: Record<string, string> = { notes: 'Notes et pages', documents: 'Documents', journal: 'Journal', redaction: 'Rédaction et traduction', modeles: 'Modèles', signatures: 'Signatures', archives: 'Archives', connaissances: 'Base de connaissances', dictee: 'Dictée vocale' };
const NOMS_EN: Record<string, string> = { notes: 'Notes and pages', documents: 'Documents', journal: 'Journal', redaction: 'Writing and translation', modeles: 'Templates', signatures: 'Signatures', archives: 'Archives', connaissances: 'Knowledge base', dictee: 'Voice dictation' };

export default function PageHub() {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { user } = useAuth();
  const profils = useProfilesOptionnel();
  const { notes, createNote } = useNotes();
  const articles = useCollection<{ title?: string }>('knowledge');
  const demandes = useCollection<{ status?: string }>('signatures');
  const [filtre, setFiltre] = useState<FiltreDePages>('toutes');
  const maintenant = useMemo(() => new Date().toISOString(), []);
  const email = user?.email ?? '';
  const prenom = prenomAffichable(profils?.profileFor(email).name, user?.name);

  usePageCoquille({ famille: 'ecrire', sousPage: 'ensemble', miettes: [{ libelle: tm('titre') }], ajmani: tm('ajmani') });

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
  const mots = useMemo(
    () => motsParJour(notes.map((n) => ({ jour: n.updatedAt.slice(0, 10), mots: `${n.title} ${n.body}`.split(/\s+/).filter(Boolean).length }))),
    [notes],
  );
  const ouverts = useMemo(() => new Set(Object.keys(VUES).filter((c) => isModuleEnabled(VUES[c]))), []);
  const noms = langue === 'fr' ? NOMS_FR : NOMS_EN;

  const vue = useMemo(
    () =>
      composerHub(
        {
          langue,
          maintenant,
          moi: { email, prenom },
          prenomDe: (e) => (e === email ? prenom : prenomAffichable(profils?.profileFor(e).name) || e.split('@')[0]),
          pages,
          presences: [],
          filtre,
          mesures: { pages: pages.length, documents: 0, serieJournal: 0, brouillons: 0, modeles: 0, enAttenteDeSignature: demandes.filter((d) => d.status === 'pending' || d.status === 'sent').length, archives: 0, articles: articles.length, lecturesDuMois: 0, dictees: 0 },
          modulesOuverts: ouverts,
          documents: [],
          signaturesActives: ouverts.has('signatures'),
          demandes: [],
          mots,
          journal: [],
          notesRapides: [],
          apercuDe: (p) => ({ cheminDe: [p.espace], liee: null, blocs: p.blocs.slice(0, 6).map((b, i) => ({ type: i === 0 ? ('titre' as const) : ('texte' as const), texte: b.texte })) }),
          routes: ROUTES,
          jourSemaineInitiales: langue === 'fr' ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        },
        tm as never,
        {
          onFiltre: (c) => setFiltre(c as FiltreDePages),
          onOuvrir: () => navigate(ROUTES.notes),
          onNouvellePage: () => {
            const id = createNote('team');
            navigate(ROUTES.notes, { state: { ouvrir: id } });
          },
          onPersonnaliser: () => navigate('/bibliotheque'),
          onRanger: () => undefined,
          onNonRanger: () => undefined,
          icones: ICONES,
          noms,
          libelles: libellesDe(tm as never, ouverts.size),
        },
      ),
    [langue, maintenant, email, prenom, profils, pages, filtre, demandes, articles, ouverts, mots, noms, navigate, createNote, tm],
  );
  return <VueHub {...vue} />;
}
