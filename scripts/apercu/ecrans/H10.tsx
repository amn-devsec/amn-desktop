/**
 * APERÇU « H10 » — Notes et pages, dans l'état de l'image H10 : la page « Atelier Menna, préparation » ouverte, Mohamed y
 * écrit. Rendu par la VRAIE vue (`VueNotes`), composée par la VRAIE logique (`composerNotes`) sur des données FICTIVES de
 * bac à sable : prénoms, titres et nombres sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- H10
 */
import React from 'react';
import { Check } from 'lucide-react';
import { ApercuBureau } from '../coquille';
import { VueNotes } from '../../../src/refonte/ecrire/ecrans/h10/VueNotes';
import { composerNotes } from '../../../src/refonte/ecrire/ecrans/h10/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/h10/i18n';
import { motsParJour } from '../../../src/refonte/ecrire/serie';

const MAINT = '2026-10-30T09:42:00Z';
const moi = 'aaron@exemple.test';
const base = { clientId: null, blocs: [], auteurEmail: moi, contributeurs: [moi], modifieAt: '2026-10-30T08:00:00Z', modifieParEmail: moi };
const page = (id: string, title: string, espace: 'Clients' | 'Équipe' | 'Modèles' | 'Personnel', plus: object = {}) => ({ ...base, id, title, parentId: null as string | null, espace, favorisDe: [] as string[], ...plus });
const enfants = (parent: string, n: number, espace: 'Clients' | 'Équipe') => Array.from({ length: n }, (_, i) => page(`${parent}-${i}`, `Sous-page ${i + 1}`, espace, { parentId: parent }));

const pages = [
  page('f1', 'Plan de la semaine', 'Équipe', { favorisDe: [moi], parentId: 'x' }),
  page('f2', 'Guide d’accueil', 'Équipe', { favorisDe: [moi], parentId: 'x' }),
  page('c1', 'Menna Conseil', 'Clients'),
  page('p1', 'Atelier Menna, préparation', 'Clients', { parentId: 'c1', blocs: [{ type: 'titre', texte: 'Objectifs' }, { type: 'titre', texte: 'Décision' }, { type: 'titre', texte: 'À préparer' }] }),
  page('p2', 'Notes de l’atelier', 'Clients', { parentId: 'c1' }),
  page('p3', 'Réunion du 28 oct.', 'Clients', { parentId: 'c1' }),
  ...enfants('c1', 3, 'Clients'),
  page('c2', 'Medina Services', 'Clients'),
  ...enfants('c2', 4, 'Clients'),
  page('c3', 'Cabinet Roux', 'Clients'),
  ...enfants('c3', 3, 'Clients'),
  page('e1', 'Réunions', 'Équipe'),
  ...enfants('e1', 12, 'Équipe'),
  page('e2', 'Procédures', 'Équipe'),
  ...enfants('e2', 5, 'Équipe'),
  page('m1', 'Compte rendu', 'Modèles'),
  page('m2', 'Cahier des charges', 'Modèles'),
];
const jours = Array.from({ length: 12 }, (_, i) => `2026-10-${String(19 + i).padStart(2, '0')}`);
const mots = motsParJour(jours.map((j) => ({ jour: j, mots: 120 })));

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerNotes({ langue: 'fr', maintenant: MAINT, moi: { email: moi, prenom: 'Aaron' }, pages: pages as never, pageId: 'p1', recherche: '', mots, clientDe: () => null, vers: () => undefined, onOuvrir: () => undefined, ecritDans: 'Mohamed écrit dans « Objectifs »' }, tm);
  const { pageMeta, planBlocs, ...base0 } = v;
  const base = { ...base0, arbre: { ...base0.arbre, sections: base0.arbre.sections.map((s) => ({ ...s, elements: s.elements.filter((x) => !x.titre.startsWith('Sous-page')) })) } };
  void planBlocs;
  return (
    <ApercuBureau famille="ecrire" sousPage="notes" fil={['Écrire et retenir', 'Notes et pages']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueNotes
        {...base}
        sousTitre="Bonjour Aaron, la page de l’atelier avance bien · Mohamed écrit avec toi en ce moment"
        libelles={libellesDe(tm as never)}
        onNouvellePage={() => undefined}
        onPartager={() => undefined}
        onHistorique={() => undefined}
        droite={{
          ...base.droite,
          plan: { ...base.droite.plan, items: [{ texte: 'Objectifs', niveau: 0, actif: true }, { texte: 'Décision', niveau: 1 }, { texte: 'À préparer', niveau: 0 }] },
          commentaire: { auteur: 'Mohamed', heure: '11:02', texte: 'D’accord pour le module à part. La clé Stripe reste chiffrée côté serveur, jamais dans une note.', pied: 'Répondre · 1 réponse de Riyad' },
          suggestion: { titre: '', texte: 'La dernière tâche n’a pas de date. Je la relie à tes tâches suivies, échéance ven. 6 nov. ?', oui: 'Relier', non: 'Plus tard', onOui: () => undefined, onNon: () => undefined },
          liens: {
            total: '3 pages',
            items: [
              { id: 'l1', titre: 'Fiche client · Menna Conseil', avant: '…le détail est dans ', mot: 'Atelier Menna', apres: ', à relire avant vendredi.' },
              { id: 'l2', titre: 'Compte rendu du 28 oct.', avant: '…décisions reprises dans ', mot: 'Atelier Menna', apres: '.' },
              { id: 'l3', titre: 'Plan de la semaine', avant: '…préparer ', mot: 'Atelier Menna', apres: ' avec Mohamed.' },
            ],
          },
        }}
        page={{
          chemin: ['Clients', 'Menna Conseil'],
          enregistre: 'Enregistré il y a 3 s',
          titre: 'Atelier Menna, préparation',
          proprietes: [
            { cle: 'c', genre: 'client', libelle: 'Menna Conseil', nom: 'Menna Conseil' },
            { cle: 's', genre: 'etat', libelle: 'En cours' },
            { cle: 'd', genre: 'date', libelle: 'Ven. 6 nov., 11:00' },
          ],
          personnes: ['Aaron', 'Mohamed'],
          corps: (
            <>
              <h3>Objectifs</h3>
              <p>Donner à Menna un tableau de bord qu’elle configure elle-même : chiffres Stripe, utilisateurs, et tickets partagés avec l’équipe technique. @Mohamed prépare les connecteurs</p>
              <div className="ec-h10__decision">
                <strong>Décision.</strong> Les tickets vivent dans un module à part.
              </div>
              <h3>À préparer</h3>
              {[
                ['Récupérer les accès Stripe de Menna', 'Mohamed', true],
                ['Lister les chiffres à afficher', 'Aaron', true],
                ['Valider les colonnes du kanban', 'sans date', false],
              ].map(([t, q, f]) => (
                <div key={String(t)} className="ec-h10__tache" data-fait={f ? 'oui' : undefined}>
                  <Check size={14} aria-hidden />
                  <span className="ec-h10__tache-texte">{t}</span>
                  <span className="ec-h10__tache-qui">{q}</span>
                </div>
              ))}
            </>
          ),
        }}
      />
    </ApercuBureau>
  );
}
