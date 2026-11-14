import React from 'react';
import { Clock3 } from 'lucide-react';
import type { LigneAttente } from './modele';
import { dureeAttente } from './modele';
import { useMotsHub, type CleHub } from './i18n';

/**
 * « ILS ATTENDENT UNE RÉPONSE » (`WaitingQueue`, fiche F10) — la file des clients dont le dernier message n'a pas de
 * réponse : initiales (30 px), nom, extrait, attente en chasse fixe, canal, et une BARRE D'ATTENTE de 2 px en pied de ligne
 * (attente ÷ 4 h, orange au-delà de 2 h). L'attente est aussi écrite : la barre ne porte jamais seule.
 */
export interface FileAttenteProps {
  file: { lignes: LigneAttente[]; total: number } | null;
  /** « Réponse médiane 11 min, 4 de mieux qu'en septembre » : sans historique des réponses, la phrase est omise. */
  mediane?: { minutes: number; deltaMin: number | null } | null;
  onOuvrir?: (l: LigneAttente) => void;
  /** Lignes visibles (4 sur l'image). */
  max?: number;
}

export function FileAttente({ file, mediane = null, onOuvrir, max = 4 }: FileAttenteProps) {
  const { tm } = useMotsHub();
  return (
    <section className="sc-ct-carte sc-ct-attentes" aria-labelledby="ct-attentes-titre" data-famille="contacts">
      <header className="sc-ct-carte__entete sc-ct-carte__entete--colonne">
        <div className="sc-ct-carte__ligne">
          <h2 id="ct-attentes-titre" className="sc-ct-carte__titre">
            {tm('attentes.titre')}
          </h2>
          {file && file.total > 0 && <span className="sc-ct-carte__droite">{tm(file.total === 1 ? 'attentes.compte.1' : 'attentes.compte.n', { n: file.total })}</span>}
        </div>
        {file && file.total > 0 && <p className="sc-ct-carte__sous sc-ct-carte__sous--bloc">{tm('attentes.sousTitre')}</p>}
      </header>
      {file == null ? (
        <p className="sc-ct-etat" data-etat="indisponible">
          {tm('attentes.indisponible')}
        </p>
      ) : file.total === 0 ? (
        <p className="sc-ct-etat" data-etat="vide">
          {tm('attentes.vide')}
        </p>
      ) : (
        <ul className="sc-ct-attentes__liste">
          {file.lignes.slice(0, max).map((l, i) => (
            <li key={`${l.nom}-${i}`} className="sc-ct-attente" data-ton={l.ton}>
              <button type="button" className="sc-ct-attente__ligne sc-focus" onClick={() => onOuvrir?.(l)}>
                <span aria-hidden className="sc-ct-attente__initiales">
                  {l.initiales}
                </span>
                <span className="sc-ct-attente__textes">
                  <span className="sc-ct-attente__nom">{l.nom}</span>
                  <span className="sc-ct-attente__extrait">{l.extrait}</span>
                </span>
                <span className="sc-ct-attente__droite">
                  <span className="sc-ct-attente__duree sc-mono">{dureeAttente(l.attenteMin)}</span>
                  <span className="sc-ct-attente__canal">{tm(`canal.${l.canal}` as CleHub)}</span>
                </span>
                <span aria-hidden className="sc-ct-attente__barre" style={{ ['--sc-ct-barre' as string]: l.barre }} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {mediane && (
        <p className="sc-ct-attentes__pied">
          <Clock3 aria-hidden size={13} strokeWidth={2} />
          <span>
            {tm('attentes.mediane', { n: mediane.minutes })}
            {mediane.deltaMin != null && mediane.deltaMin > 0 ? `, ${tm('attentes.mediane.mieux', { n: mediane.deltaMin })}` : ''}
          </span>
        </p>
      )}
    </section>
  );
}
