import React from 'react';
import { Calendar, Check } from 'lucide-react';
import { Avatar } from '../../../socle/ui';
import { dureeRdv, type FriseRdv, type LigneRdvHub } from './modele';
import { useMotsHub } from './i18n';

/**
 * « PROCHAINS RENDEZ-VOUS » (`AppointmentRail`, fiche F10) — la frise verticale du jour : heure en chasse fixe,
 * nœud (fait = rond blanc coché, prochain = anneau bleu avec halo, à venir = rond bordé), contenu. La ligne du
 * prochain rendez-vous porte un fond bleu et ses étiquettes. Le nœud ne porte jamais seul l'état : « fait » et
 * « dans 18 min » sont écrits.
 */
export interface FriseRdvProps {
  frise: FriseRdv;
  onOuvrir?: (l: LigneRdvHub) => void;
  /** Lignes visibles (4 sur l'image). */
  max?: number;
}

const etiquette = (tm: ReturnType<typeof useMotsHub>['tm'], e: LigneRdvHub['etiquettes'][number]): { texte: string; ton: 'ok' | 'attention' | 'neutre' } => {
  if (e.genre === 'devisEnAttente') return { texte: tm('rdv.etiquette.devis', { numero: e.numero ?? '' }), ton: 'attention' };
  const j = e.jours ?? 0;
  return { texte: tm(j === 0 ? 'rdv.etiquette.dernierEchange.0' : j === 1 ? 'rdv.etiquette.dernierEchange.1' : 'rdv.etiquette.dernierEchange.n', { n: j }), ton: 'neutre' };
};

export function FriseDesRendezVous({ frise, onOuvrir, max = 4 }: FriseRdvProps) {
  const { tm, langue } = useMotsHub();
  return (
    <section className="sc-ct-carte sc-ct-rdv" aria-labelledby="ct-rdv-titre" data-famille="contacts">
      <header className="sc-ct-carte__entete">
        <h2 id="ct-rdv-titre" className="sc-ct-carte__titre">
          {tm('rdv.titre')}
        </h2>
        <span className="sc-ct-carte__sous">{tm('rdv.sousTitre', { n: frise.total })}</span>
      </header>
      {frise.lignes.length === 0 ? (
        <p className="sc-ct-etat" data-etat="vide">
          {tm('rdv.vide')}
        </p>
      ) : (
        <ol className="sc-ct-frise">
          {frise.lignes.slice(0, max).map((l) => (
            <li key={l.id} className="sc-ct-rdv-ligne" data-etat={l.etat}>
              <button type="button" className="sc-ct-rdv-ligne__corps sc-focus" onClick={() => onOuvrir?.(l)}>
                <span className="sc-ct-rdv-ligne__heure sc-mono">{l.heure}</span>
                <span aria-hidden className="sc-ct-noeud" data-etat={l.etat}>
                  {l.etat === 'fait' && <Check size={9} strokeWidth={3} />}
                </span>
                <span className="sc-ct-rdv-ligne__contenu">
                  <span className="sc-ct-rdv-ligne__client">{l.client}</span>
                  <span className="sc-ct-rdv-ligne__sujet">{[l.sujet, l.lieu].filter(Boolean).join(' · ')}</span>
                  {l.etiquettes.length > 0 && (
                    <span className="sc-ct-rdv-ligne__etiquettes">
                      {l.etiquettes.map((e, i) => {
                        const t = etiquette(tm, e);
                        return (
                          <span key={i} className="sc-ct-etiquette" data-ton={t.ton}>
                            <span aria-hidden className="sc-ct-etiquette__point" />
                            {t.texte}
                          </span>
                        );
                      })}
                    </span>
                  )}
                </span>
                <span className="sc-ct-rdv-ligne__droite">
                  <span className="sc-ct-rdv-ligne__etat">{l.etat === 'fait' ? tm('rdv.fait') : l.etat === 'prochain' ? tm('rdv.dans', { n: l.dansMin ?? 0 }) : dureeRdv(l.dureeMin)}</span>
                  {l.responsable && (
                    <span aria-hidden>
                      <Avatar nom={l.responsable.initiales} taille={20} />
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <footer className="sc-ct-rdv__pied">
        <Calendar aria-hidden size={13} strokeWidth={2} />
        {frise.suivant ? (
          <span>
            {tm('rdv.pied', { jour: libelleJour(frise.suivant.jour, frise.suivant.heure, langue), client: frise.suivant.client, sujet: frise.suivant.sujet })}
          </span>
        ) : (
          <span>{tm('rdv.pied.aucun')}</span>
        )}
        {frise.suivant?.responsable && (
          <span aria-hidden className="sc-ct-rdv__avatar">
            <Avatar nom={frise.suivant.responsable.initiales} taille={20} />
          </span>
        )}
      </footer>
    </section>
  );
}

/** « Lun. 2 nov. 9:30 » — le jour d'un rendez-vous à venir, écrit dans la langue de l'application. */
export function libelleJour(jour: string, heure: string, langue: 'fr' | 'en' = 'fr'): string {
  const [a, m, j] = jour.split('-').map(Number);
  const brut = new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(a, m - 1, j, 12)));
  const h = heure.replace(/^0/, '');
  return `${brut.charAt(0).toUpperCase()}${brut.slice(1)} ${h}`;
}

