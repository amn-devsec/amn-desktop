import React from 'react';
import { AlertCircle, Settings2, UserPlus } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { CarteChaleur } from './CarteChaleur';
import { CarteModules } from './CarteModules';
import { FileAttente } from './FileAttente';
import { FriseDesRendezVous } from './FriseRdv';
import type { LigneAttente, LigneRdvHub, ModeleHub, SuggestionAppel } from './modele';
import { useMotsHub } from './i18n';
import './hub.css';
import '../cibles.css';

/**
 * LA VUE D'ENSEMBLE « MES CONTACTS ET CLIENTS » (F10) — la mise en page et les états, sans accès aux données.
 *
 * Tout ce qu'elle affiche lui est donné (`ModeleHub`, construit par `modeleHub` depuis les sources) et tout ce qu'elle
 * déclenche passe par `actions` : c'est ce qui permet de la rendre sans application (aperçu, contrôle) et de la
 * brancher sur les collections réelles (`PageHub`).
 *
 * Disposition (fiche rubrique 3, coordonnées de la zone principale 1108 px) : en-tête de page (h1, sous-titre, deux
 * boutons dont UN primaire, « Nouveau client »), puis deux colonnes : 726 px à gauche (« Chaleur des relations » 300,
 * « Les modules » 350) et 368 px à droite (« Ils attendent une réponse » 300, « Prochains rendez-vous » 350). Écart 14.
 */
export interface ActionsHub {
  nouveauClient: () => void;
  personnaliser: () => void;
  ouvrirClient: (clientId: number) => void;
  preparerAppel: (s: SuggestionAppel) => void;
  plusTard: (s: SuggestionAppel) => void;
  ouvrirAttente: (l: LigneAttente) => void;
  ouvrirRdv: (l: LigneRdvHub) => void;
  reessayer: () => void;
}

export interface VueHubProps {
  statut: 'pret' | 'chargement' | 'erreur';
  modele: ModeleHub;
  actions: ActionsHub;
  versTousLesModules: string;
  /** « Réponse médiane… » : absent tant que les délais de réponse ne sont pas connus. */
  mediane?: { minutes: number; deltaMin: number | null } | null;
}

export function VueHub({ statut, modele, actions, versTousLesModules, mediane = null }: VueHubProps) {
  const { tm } = useMotsHub();
  const premier = modele.frise.lignes.find((l) => l.etat === 'prochain');
  const attente = modele.attentes?.total ?? null;

  const morceaux: string[] = [
    tm(modele.chaleur.parBande.chaleureuse >= modele.chaleur.total / 2 ? 'sousTitre.chaud' : 'sousTitre.entretenir', { salut: tm(`salut.${modele.salutation}` as const), prenom: modele.prenom }),
  ];
  if (attente != null && attente > 0) morceaux.push(tm(attente === 1 ? 'sousTitre.attentes.1' : 'sousTitre.attentes.n', { n: attente }) + (premier ? `, ${tm('sousTitre.rdv', { nom: premier.client, heure: premier.heure })}` : ''));
  else if (premier) morceaux.push(tm('sousTitre.rdv', { nom: premier.client, heure: premier.heure }));

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={morceaux.join(' · ')}
        secondaires={[{ libelle: tm('action.personnaliser'), onClick: actions.personnaliser, icone: <Settings2 size={14} strokeWidth={2} /> }]}
        primaire={{ libelle: tm('action.nouveauClient'), onClick: actions.nouveauClient, icone: <UserPlus size={14} strokeWidth={2} /> }}
        className="sc-ct-hub__entete"
      />
      {statut === 'erreur' ? (
        <BlocEtat
          icone={<AlertCircle size={20} strokeWidth={1.7} />}
          ton="attention"
          annonce="alert"
          titre={tm('etat.erreur')}
          actions={
            <Bouton variante="secondaire" onClick={actions.reessayer}>
              {tm('etat.reessayer')}
            </Bouton>
          }
        />
      ) : statut === 'chargement' ? (
        <p className="sc-ct-etat" data-etat="chargement" role="status">
          {tm('etat.chargement')}
        </p>
      ) : (
        <div className="sc-ct-hub">
          <div className="sc-ct-hub__gauche">
            <CarteChaleur chaleur={modele.chaleur} suggestion={modele.suggestion} onOuvrirClient={actions.ouvrirClient} onPreparerAppel={actions.preparerAppel} onPlusTard={actions.plusTard} />
            <CarteModules groupes={modele.groupes} versTous={versTousLesModules} />
          </div>
          <div className="sc-ct-hub__droite">
            <FileAttente file={modele.attentes} mediane={mediane} onOuvrir={actions.ouvrirAttente} />
            <FriseDesRendezVous frise={modele.frise} onOuvrir={actions.ouvrirRdv} />
          </div>
        </div>
      )}
    </Page>
  );
}
