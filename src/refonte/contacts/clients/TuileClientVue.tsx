import React from 'react';
import { AnneauProgression } from '../../../socle/ui/Indicateurs';
import { Avatar } from '../../../socle/ui/Pastilles';
import { formaterEuro } from '../../../socle/ui/graphiques';
import type { TuileClient } from './modele';
import { moisCourt } from './formats';
import { useMotsClients } from './i18n';
import { SparkArea } from './SparkArea';

const TON = { vert: 'succes', orange: 'attention', rouge: 'critique' } as const;

/** La phrase de « prochaine chose », dans la langue courante. */
export function usePhraseProchaine(): (t: TuileClient) => string {
  const { tm, langue } = useMotsClients();
  return (t) => {
    const p = t.prochaine;
    const params = { ...p.params } as Record<string, string | number>;
    if (p.genre === 'depuis') params.mois = moisCourt(String(p.params.mois), langue, p.params.annee === 1);
    return tm(`prochaine.${p.genre}` as const, params);
  };
}

export function PhraseEchange({ t }: { t: TuileClient }) {
  const { tm } = useMotsClients();
  return <>{tm(`echange.${t.echange.genre}` as const, { n: t.echange.n })}</>;
}

export function PastilleStatut({ t }: { t: TuileClient }) {
  const { tm } = useMotsClients();
  return (
    <span className="sc-cl-statut" data-statut={t.statut}>
      <span className="sc-cl-statut__point" aria-hidden />
      {tm(`statut.${t.statut}` as const)}
    </span>
  );
}

/**
 * Une tuile de la mosaïque (fiche H05, 267 × 173) : initiale, nom et « secteur · ville », anneau de santé de 40 px,
 * « Facturé sur 12 mois » avec sa courbe, responsable et dernier échange, pastille de statut, « prochaine chose ».
 * Un filet de 2 px en haut pour « Impayé » et « À relancer » ; un bord éclairci pour un rendez-vous aujourd'hui.
 */
export function TuileClientVue({ t, onOuvrir }: { t: TuileClient; onOuvrir: (id: number) => void }) {
  const { tm } = useMotsClients();
  const phrase = usePhraseProchaine();
  return (
    <button
      type="button"
      className="sc-cl-tuile"
      data-statut={t.statut}
      data-rdv={t.rdvDuJour ? '' : undefined}
      onClick={() => onOuvrir(t.id)}
      aria-label={tm('carte.ouvrir', { nom: t.nom })}
    >
      <span className="sc-cl-tuile__haut">
        <span className="sc-cl-tuile__initiale" aria-hidden>{t.initiale}</span>
        <span className="sc-cl-tuile__identite">
          <span className="sc-cl-tuile__nom">{t.nom}</span>
          <span className="sc-cl-tuile__sous">{t.sousTitre}</span>
        </span>
        <span className="sc-cl-tuile__anneau" data-sante={t.couleur}>
          <AnneauProgression valeur={t.sante / 100} libelle={tm('carte.sante', { n: t.sante })} ton={TON[t.couleur]} taille={40} epaisseur={4} piste="anneau">
            <span className="sc-nombre">{t.sante}</span>
          </AnneauProgression>
        </span>
      </span>
      <span className="sc-cl-tuile__chiffre">
        <span className="sc-cl-tuile__montant">
          <span className="sc-cl-tuile__etiquette">{tm('carte.facture')}</span>
          <span className="sc-cl-tuile__valeur sc-nombre">{formaterEuro(t.factureCents / 100)}</span>
        </span>
        <SparkArea valeurs={t.courbe} couleur={t.couleur} />
      </span>
      <span className="sc-cl-tuile__ligne">
        {t.responsable && <Avatar nom={t.responsable.nom} taille={20} />}
        <span className="sc-cl-tuile__echange"><PhraseEchange t={t} /></span>
        {t.statut !== 'Actif' && <PastilleStatut t={t} />}
      </span>
      <span className="sc-cl-tuile__prochaine" data-genre={t.prochaine.genre} data-ton={t.aTraiter ? t.statut : undefined}>
        {t.prochaine.genre === 'retard' || t.prochaine.genre === 'rdv' ? <span className="sc-cl-tuile__voyant" aria-hidden /> : null}
        {phrase(t)}
      </span>
    </button>
  );
}
