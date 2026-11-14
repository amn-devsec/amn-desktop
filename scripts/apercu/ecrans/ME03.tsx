/**
 * APERÇU « ME03 » — Modèles, dans l'état de l'image ME03 : la galerie (Devis standard ouvert) et ses variables. Rendu par
 * la VRAIE vue (`VueModeles`), composée par la VRAIE logique (`composerModeles`) sur des données FICTIVES de bac à
 * sable : noms, nombres et textes sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- ME03
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueModeles, texteAvecPuces } from '../../../src/refonte/ecrire/ecrans/me03/VueModeles';
import { composerModeles, enTeteDesVariables, type ModeleDuTexte } from '../../../src/refonte/ecrire/ecrans/me03/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/me03/i18n';

const devis = 'DEVIS {Numéro}\nAMN DevSec\n\nPour {Client}\n{Adresse du client}\n\n{Prestation} · 1 · {Prix}\nDéplacement et installation · 1 · 120 €\nTotal HT {Total HT}\n\nDélai : {Délai} · paiement à 30 jours\nAcompte de 30 % à la commande, solde à la livraison.\n\nBon pour accord {Signature du client}';
const modeles: ModeleDuTexte[] = [
  { id: 'm1', nom: 'Devis standard', contenu: devis, usages: 31, sources: { 'Numéro': 'suite des devis', Client: 'fiche client', 'Adresse du client': 'fiche client', Prestation: 'catalogue', Prix: 'catalogue', 'Total HT': 'calculé', 'Délai': 'à saisir', 'Signature du client': 'signature électronique' } },
  { id: 'm2', nom: 'E-mail de relance', contenu: 'Bonjour {prénom}, ' + 'mot '.repeat(60), usages: 24 },
  { id: 'm3', nom: 'Contrat de maintenance', contenu: 'Article 1 ' + 'mot '.repeat(40), usages: 6 },
  { id: 'm4', nom: 'Compte rendu de réunion', contenu: 'Décisions ' + 'mot '.repeat(50), usages: 9 },
  { id: 'm5', nom: 'Bon de livraison', contenu: 'Bon ' + 'mot '.repeat(45), usages: 12 },
];

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const valeurs = { 'Numéro': 'D-2026-118', Client: 'Menna Conseil' };
  const v = composerModeles({ langue: 'fr', modeles, choisi: 'm1', valeurs: {}, recommandes: null });
  void valeurs;
  const tete = enTeteDesVariables('fr', v.variables);
  return (
    <ApercuBureau famille="ecrire" sousPage="templates" fil={['Écrire et retenir', 'Modèles']} ajmani="Demande à Ajmani, ou dis ce que tu veux faire">
      <VueModeles
        titre="Modèles"
        sousTitre="Ne repars jamais d’une page blanche · 24 modèles prêts, les variables se remplissent seules"
        libelles={libellesDe(tm as never)}
        onCreer={() => undefined}
        onImporter={() => undefined}
        filtres={[{ cle: 'tous', libelle: 'Tous', compteur: 24 }, { cle: 'devis', libelle: 'Devis' }, { cle: 'mails', libelle: 'E-mails' }, { cle: 'contrats', libelle: 'Contrats' }, { cle: 'reunions', libelle: 'Réunions' }]}
        filtre="tous"
        onFiltre={() => undefined}
        bibliotheque={{ libelle: 'Ta bibliothèque 24 sur 30', pourcent: 80 }}
        cartes={v.cartes}
        onChoisir={() => undefined}
        proposition={{ titre: 'Ajmani propose', texte: 'Tu écris le même message après chaque intervention. Je crée le modèle à partir de tes 5 derniers.', creer: 'Créer', non: 'Non', onCreer: () => undefined, onNon: () => undefined }}
        detail={{
          nom: 'Devis standard',
          sous: 'Utilisé 31 fois ce mois, par Aaron et Mohamed',
          onModifier: () => undefined,
          papier: <div>{texteAvecPuces(v.resultat)}</div>,
          variables: { entete: '8 variables', sous: '7 remplies toutes seules, 1 à saisir' , items: v.variables.map((x) => ({ nom: x.nom, source: x.source, etat: x.source === 'à saisir' ? ('saisir' as const) : ('auto' as const) })) },
          utiliser: { libelle: 'Utiliser ce modèle', onClick: () => undefined },
          dupliquer: { libelle: 'Dupliquer', onClick: () => undefined },
        }}
      />
      <span hidden>{tete.entete}</span>
    </ApercuBureau>
  );
}
