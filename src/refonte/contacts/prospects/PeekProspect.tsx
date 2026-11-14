import React from 'react';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { SousCarte } from '../../../socle/ui/controles';
import { PastilleEtat } from '../../../socle/ui/Pastilles';
import { euros } from '../commun';
import type { PointProspect, SignalProspect } from './modele';
import { useMotsProspects } from './i18n';

/** `ProspectPeek` (H06) : la fiche du point survolé ou sélectionné — montant, intérêt, trois signaux, prochaine étape, trois boutons. */
export interface PeekProps {
  point: PointProspect | null;
  fige: boolean;
  onAppeler: (id: string) => void;
  onEcrire: (id: string) => void;
  onOuvrir: (id: string) => void;
}

export function PeekProspect({ point, fige, onAppeler, onEcrire, onOuvrir }: PeekProps) {
  const { tm, langue } = useMotsProspects();
  return (
    <section className="sc-pr-carte sc-pr-peek" aria-live="polite" aria-label={tm(fige ? 'peek.selectionne' : 'peek.survole')}>
      <div className="sc-pr-peek__tete">
        <span className="sc-pr-peek__sur-titre">{tm(fige ? 'peek.selectionne' : 'peek.survole')}</span>
        {point && <PastilleEtat etat="info">{tm(`etape.${point.etape}` as const)}</PastilleEtat>}
      </div>
      {!point ? (
        <p className="sc-pr-vide sc-pr-peek__rien">{tm('peek.rien')}</p>
      ) : (
        <>
          <div className="sc-pr-peek__id">
            <span className="sc-pr-peek__initiale" aria-hidden>{point.initiale}</span>
            <div className="sc-pr-peek__texte">
              <span className="sc-pr-peek__nom">{point.nom}</span>
              <span className="sc-pr-peek__sous">{[point.offre, point.responsable ? tm('peek.suivi', { nom: point.responsable.nom.split(' ')[0] }) : ''].filter(Boolean).join(' · ')}</span>
            </div>
          </div>
          <div className="sc-pr-peek__chiffres">
            <SousCarte><span className="sc-pr-peek__etiquette">{tm('peek.montant')}</span><span className="sc-pr-peek__valeur sc-nombre">{euros(point.montantCents, langue)}</span></SousCarte>
            <SousCarte><span className="sc-pr-peek__etiquette">{tm('peek.interet')}</span><span className="sc-pr-peek__valeur sc-nombre">{point.interet}<span className="sc-pr-peek__sur">{tm('peek.interet.sur', { libelle: tm(`peek.libelle.${point.libelle}` as const) })}</span></span></SousCarte>
          </div>
          <span className="sc-pr-sur-titre">{tm('peek.signaux')}</span>
          {point.signaux.length === 0 ? (
            <p className="sc-pr-vide">{point.estime ? tm('peek.signaux.estime') : tm('peek.signaux.aucun')}</p>
          ) : (
            <ul className="sc-pr-signaux">
              {point.signaux.slice(0, 3).map((s, i) => <LigneSignal key={`${s.genre}-${i}`} s={s} />)}
            </ul>
          )}
          <div className="sc-pr-peek__prochaine">
            <span className="sc-pr-peek__etiquette">{tm('peek.prochaine')}</span>
            <span className="sc-pr-peek__action">{point.prochaineAction || tm('peek.prochaine.aucune')}</span>
          </div>
          <div className="sc-pr-peek__boutons">
            <Bouton variante="primaire" taille="petit" icone={<Phone size={13} strokeWidth={2} />} onClick={() => onAppeler(point.id)}>{tm('peek.appeler')}</Bouton>
            <Bouton variante="secondaire" taille="petit" icone={<Mail size={13} strokeWidth={2} />} onClick={() => onEcrire(point.id)}>{tm('peek.ecrire')}</Bouton>
            <Bouton variante="secondaire" taille="petit" icone={<ArrowRight size={13} strokeWidth={2} />} onClick={() => onOuvrir(point.id)}>{tm('peek.ouvrir')}</Bouton>
          </div>
        </>
      )}
    </section>
  );
}

function LigneSignal({ s }: { s: SignalProspect }) {
  const { tm } = useMotsProspects();
  const texte = s.genre === 'lectures' ? tm(s.n === 1 ? 'signal.lectures.1' : 'signal.lectures.n', { n: s.n }) : tm(`signal.${s.genre}` as const);
  const quand = s.ilYaMin < 60 ? tm('signal.il.y.a.min', { n: s.ilYaMin }) : s.ilYaMin < 1440 ? tm('signal.il.y.a.h', { n: Math.round(s.ilYaMin / 60) }) : tm('signal.il.y.a.j', { n: Math.round(s.ilYaMin / 1440) });
  return (
    <li className="sc-pr-signal">
      <span className="sc-pr-signal__point" data-vif={s.ilYaMin < 15 ? '' : undefined} aria-hidden />
      <span className="sc-pr-signal__texte">{texte}</span>
      <span className="sc-pr-signal__quand">{quand}</span>
    </li>
  );
}
