import React from 'react';
import { Star } from 'lucide-react';
import { CaseACocher } from '../../../socle/ui/Taches';
import { BarreProgression } from '../../../socle/ui/Indicateurs';
import type { ModeleProspects, PointProspect } from './modele';
import { useMotsProspects } from './i18n';
import { moisCourt } from '../clients/formats';

/** « Appels de la semaine » (H06) : les prospects du quadrant prioritaire, une case par appel, une barre, un pied qui encourage. */
export interface AppelsProps {
  modele: ModeleProspects;
  faits: ReadonlySet<string>;
  onCocher: (id: string, fait: boolean) => void;
  /** Pas d'écriture : les cases ne se cochent pas. */
  lecture?: boolean;
}

export function AppelsSemaine({ modele, faits, onCocher, lecture = false }: AppelsProps) {
  const { tm, langue } = useMotsProspects();
  const liste: PointProspect[] = modele.appels.length > 0 ? modele.appels : modele.candidats;
  const faitsIci = liste.filter((p) => faits.has(p.id)).length;
  const sig = modele.signatures;
  const forme = sig.ceMois === 1 ? '1' : 'n';
  const pied = sig.ceMois === 0 ? null
    : sig.fait?.genre === 'meilleur-depuis' ? tm(`appels.signatures.depuis.${forme}` as 'appels.signatures.depuis.n', { n: sig.ceMois, mois: moisCourt(sig.fait.depuis, langue, false) })
    : sig.fait ? tm(`appels.signatures.${sig.fait.genre === 'record' ? 'record' : sig.fait.genre === 'egale-meilleur' ? 'egale' : 'regularite'}.${forme}` as 'appels.signatures.record.n', { n: sig.ceMois })
    : tm(sig.ceMois === 1 ? 'appels.signatures.1' : 'appels.signatures.n', { n: sig.ceMois });
  return (
    <section className="sc-pr-carte sc-pr-appels" aria-label={tm('appels.titre')}>
      <div className="sc-pr-appels__tete">
        <h2 className="sc-pr-carte__titre">{tm('appels.titre')}</h2>
        {liste.length > 0 && <span className="sc-pr-appels__progression sc-nombre">{tm('appels.progression', { fait: faitsIci, total: liste.length })}</span>}
      </div>
      {liste.length > 0 && <BarreProgression valeur={faitsIci / liste.length} ton="info" hauteur={4} libelle={tm('appels.progression', { fait: faitsIci, total: liste.length })} />}
      {modele.appels.length === 0 && modele.candidats.length > 0 && <p className="sc-pr-vide">{tm('appels.vide')}</p>}
      {liste.length === 0 ? (
        <p className="sc-pr-vide">{tm('appels.aucun')}</p>
      ) : (
        <ul className="sc-pr-appels__liste">
          {liste.map((p) => {
            const fait = faits.has(p.id);
            return (
              <li key={p.id} className="sc-pr-appel" data-fait={fait ? '' : undefined}>
                <CaseACocher coche={fait} lecture={lecture} libelle={tm('appels.cocher', { nom: p.nom })} onChange={(v) => onCocher(p.id, v)} />
                <span className="sc-pr-appel__texte"><span className="sc-pr-appel__nom">{p.nom}</span><span className="sc-pr-appel__detail">{p.prochaineAction || p.offre}</span></span>
              </li>
            );
          })}
        </ul>
      )}
      {pied && <p className="sc-pr-appels__pied"><Star size={13} strokeWidth={2} aria-hidden />{pied}</p>}
    </section>
  );
}
