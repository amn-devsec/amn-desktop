import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import type { EnregistrementClasseur, VersionClasseur } from '../../../../lib/cinquante/ajouts';
import { usePageCoquille } from '../../../coquille/page';
import { composerDocuments, type FichierRange } from './composer';
import { libellesDe, useMots } from './i18n';
import { VueDocuments } from './VueDocuments';

/**
 * H11 — Documents, branché sur le poste. Route `/classeur` (substitution). Le classeur du poste garde des documents
 * à versions (`documentVersions`) : un document, ses versions déposées, sa signature ; c'est ce que l'écran montre.
 * Ce que le poste ne sait pas n'est pas montré (fiche H11, rubrique 8 ; STATUT §1.27 n° 4) : pas d'intercalaires par
 * type, pas de faits relevés par Ajmani, pas de quota d'espace, pas de partage ni de lien (aucune source).
 */
const MOIS = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const date = (iso: string) => `${new Date(iso).getDate()} ${MOIS[new Date(iso).getMonth()]}`;
const octets = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(1).replace('.', ',')} Go` : n >= 1e6 ? `${Math.round(n / 1e6)} Mo` : `${Math.max(1, Math.round(n / 1e3))} Ko`);

export default function PageDocuments() {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const tout = useCollection<EnregistrementClasseur>('documentVersions');
  const [choisi, setChoisi] = useState<string | null>(null);
  const [recherche, setRecherche] = useState('');
  const maintenant = useMemo(() => new Date().toISOString(), []);

  usePageCoquille({ famille: 'ecrire', sousPage: 'binder', miettes: [{ libelle: tm('titre') }] });

  const versions = useMemo(() => tout.filter((x): x is VersionClasseur & { id: string; updatedAt: string } => x.kind === 'version'), [tout]);
  const fichiers = useMemo<FichierRange[]>(
    () =>
      tout.flatMap((d) => {
        if (d.kind !== 'document') return [];
        const vs = versions.filter((v) => v.documentId === d.id).sort((a, b) => b.numero - a.numero);
        const derniere = vs[0];
        return [
          {
            id: d.id,
            nom: d.titre,
            typeMetier: 'Documents',
            tailleOctets: derniere?.octets ?? 0,
            modifieAt: derniere?.deposeLe ?? d.updatedAt,
            archive: false,
            extension: 'DOC',
            sous: [d.signataire, date(derniere?.deposeLe ?? d.updatedAt)].filter(Boolean).join(' · '),
            demande: d.signeeLe ? { etat: 'Signée' as const } : d.envoyeeASignerLe ? { etat: 'Envoyée' as const } : null,
          },
        ];
      }),
    [tout, versions],
  );
  const selection = choisi && fichiers.some((f) => f.id === choisi) ? choisi : (fichiers[0]?.id ?? null);
  const compose = composerDocuments({ langue, maintenant, fichiers, types: ['Documents'], type: 'Documents', selection, recherche, utiliseOctets: 0, quotaOctets: 0, octetsLisibles: octets });
  const f = fichiers.find((x) => x.id === selection) ?? null;
  const vs = versions.filter((v) => v.documentId === selection).sort((a, b) => a.numero - b.numero);
  const derniere = vs[vs.length - 1];
  const doc = tout.find((d) => d.kind === 'document' && d.id === selection);

  return (
    <VueDocuments
      titre={tm('titre')}
      sousTitre={fichiers.length ? tm('sousTitre', { n: fichiers.length }) : tm('sousTitreVide')}
      libelles={libellesDe(tm as never)}
      onTeleverser={() => navigate('/classeur')}
      onglets={compose.onglets}
      ongletActif={compose.ongletActif}
      onOnglet={() => undefined}
      recherche={{ valeur: recherche, onChange: setRecherche }}
      liste={{ ...compose.liste, tri: tm('tri'), onChoisir: setChoisi }}
      detail={
        f
          ? {
              nom: f.nom,
              meta: [vs.length ? `v${vs.length}` : null, octets(f.tailleOctets)].filter(Boolean).join(' · '),
              actions: [{ cle: 'ouvrir', libelle: tm('ouvrir') }],
              pages: [],
              papier: (
                <div className="ec-h11__feuille">
                  <h3>{f.nom}</h3>
                  {(derniere?.paragraphes ?? []).map((p) => (
                    <div key={p.titre} className="ec-h11__article">
                      <span>{p.titre}</span>
                      <strong>{p.texte}</strong>
                    </div>
                  ))}
                </div>
              ),
              faits: null,
              versions: vs.length
                ? {
                    entete: 'Versions',
                    sous: '',
                    items: vs.map((v) => ({ numero: v.numero, quand: date(v.deposeLe), auteur: v.auteur, note: v.auteur.split(/\s+/)[0], actuelle: v === derniere })),
                    signee: doc && doc.kind === 'document' && doc.signeeLe ? { libelle: 'Signé', qui: doc.signataire ?? '' } : null,
                  }
                : null,
            }
          : null
      }
    />
  );
}
