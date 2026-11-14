import React, { useMemo, useState } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { useCollection, useSync } from '../../../../state/SyncContext';
import { usePageCoquille } from '../../../coquille/page';
import { traduire as traduireLogique } from '../../i18n';
import { useMots } from './textes';
import { VuePage, type SectionVue } from './VuePage';

interface ConfigMiniSite { enabled: boolean; title: string; intro: string; hours: string; address: string; phone: string; email: string; showReviews: boolean; showPortfolio: boolean }
const CONFIG_ID = 'config';

/**
 * MR02 · MA PAGE PUBLIQUE — branchée sur la mini-page du dépôt (`minisite` : une configuration unique). Le dépôt n'a ni
 * sections ordonnées, ni version de travail distincte de la version en ligne, ni compteur de visites : les sections sont
 * DÉDUITES de la configuration (accueil, horaires, contact, avis, réalisations), leur statut dit « En ligne » ou
 * « Brouillon » selon l'interrupteur de la page, et les visites sont « non mesurées » (STATUT §1.27 n° 4).
 * Publier = allumer la page ; seul le dirigeant publie (§1.27 n° 9), les autres « demandent la publication ».
 */
export function PagePubliqueRefonte() {
  const { tm, langue } = useMots();
  const { upsert } = useSync();
  const { role } = useAuth();
  const rows = useCollection<Partial<ConfigMiniSite>>('minisite');
  const config: ConfigMiniSite = { enabled: false, title: '', intro: '', hours: '', address: '', phone: '', email: '', showReviews: true, showPortfolio: true, ...(rows.find((r) => r.id === CONFIG_ID) ?? {}) };
  const [actifId, setActifId] = useState<string | null>(null);
  const [coches, setCoches] = useState<ReadonlySet<string>>(new Set());
  usePageCoquille({ famille: 'creer', sousPage: 'minisite', miettes: [{ libelle: tm('titre') }] });

  const sections = useMemo<SectionVue[]>(() => {
    const ligne = (t: string): string[] => [t].filter(Boolean);
    const v = config.enabled ? 1 : null;
    const liste: SectionVue[] = [
      { id: 'accueil', titre: 'Bandeau d’accueil', versionEnLigne: v, versionTravail: 1, corps: [config.title, ...ligne(config.intro)].filter(Boolean) },
      { id: 'horaires', titre: 'Horaires', versionEnLigne: v, versionTravail: 1, corps: ligne(config.hours) },
      { id: 'contact', titre: 'Contact', versionEnLigne: v, versionTravail: 1, nature: 'formulaire', corps: [config.address, config.phone, config.email].filter(Boolean) },
    ];
    if (config.showReviews) liste.push({ id: 'avis', titre: 'Avis clients', versionEnLigne: v, versionTravail: 1, nature: 'avis' });
    if (config.showPortfolio) liste.push({ id: 'realisations', titre: 'Réalisations', versionEnLigne: v, versionTravail: 1 });
    return liste;
  }, [config.enabled, config.title, config.intro, config.hours, config.address, config.phone, config.email, config.showReviews, config.showPortfolio]);

  return (
    <VuePage
      nomSite={config.title}
      adresse=""
      sections={sections}
      actifId={actifId ?? sections[0]?.id ?? null}
      onChoisir={setActifId}
      droits={{ ecrire: true, publier: role === 'owner', enLigne: typeof navigator === 'undefined' ? true : navigator.onLine }}
      derniere={null}
      visites={null}
      coches={coches}
      onCocher={(id) => setCoches((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
      libelleControle={(motif, titre) => traduireLogique(langue, `page.controle.${motif === 'tester-formulaire' ? 'testerFormulaire' : motif === 'accord-avis' ? 'accordAvis' : motif === 'verifier-tarifs' ? 'verifierTarifs' : 'relire'}` as 'page.controle.relire', { titre })}
      onPublier={() => void upsert('minisite', CONFIG_ID, { ...config, enabled: true })}
    />
  );
}

export default PagePubliqueRefonte;
