/**
 * APERÇU « ME05 » — Base de connaissances, dans l'état de l'image ME05 : la question « Comment annuler une facture ? »,
 * l'article « Faire une facture en 3 minutes » ouvert à l'étape 4. Rendu par la VRAIE vue (`VueConnaissances`), composée
 * par la VRAIE logique (`composerConnaissances`, dont `repondre`) sur des données FICTIVES de bac à sable : titres et
 * textes sont ceux de la maquette et ne vivent qu'ici.
 *
 *   npm run apercu -- ME05
 */
import React from 'react';
import { ApercuBureau } from '../coquille';
import { VueConnaissances } from '../../../src/refonte/ecrire/ecrans/me05/VueConnaissances';
import { composerConnaissances } from '../../../src/refonte/ecrire/ecrans/me05/composer';
import { libellesDe, traduire } from '../../../src/refonte/ecrire/ecrans/me05/i18n';
import type { ArticleMin } from '../../../src/refonte/ecrire/connaissances';

const art = (id: string, titre: string, rubrique: string, etapes: ArticleMin['etapes'] = [], lieA: string[] = []): ArticleMin => ({ id, titre, rubrique, etapes, majLe: '2026-10-29', statut: 'publié', lieA });
const articles: ArticleMin[] = [
  art('a1', 'Faire une facture en 3 minutes', 'Facturation', [
    { titre: 'Ouvre Facturation', texte: 'Appuie sur « Nouvelle facture » et choisis le client : l’adresse et les conditions habituelles se remplissent seules.' },
    { titre: 'Ajoute les lignes', texte: 'Tape le début du nom d’une prestation, le tarif se remplit tout seul.', astuce: 'Astuce. ⌘D duplique la ligne précédente.' },
    { titre: 'Vérifie et envoie', texte: 'Contrôle le total, puis envoie tout de suite ou programme l’envoi à 9 h.' },
    { titre: 'Corrige après l’envoi', texte: 'Une facture envoyée ne se supprime pas : ouvre-la, puis « Plus » et « Émettre un avoir ».' },
  ], ['a2', 'a3', 'a4']),
  art('a2', 'Annuler ou corriger', 'Facturation', [{ titre: 'x', texte: 'x' }]),
  art('a3', 'Relancer un client', 'Facturation', [{ titre: 'x', texte: 'x '.repeat(300) }]),
  art('a4', 'Brancher Stripe', 'Facturation', [{ titre: 'x', texte: 'x '.repeat(500) }]),
  art('a5', 'TVA et taux', 'Facturation'),
  art('a6', 'Acomptes', 'Facturation'),
  art('s1', 'Alerte rouge : que faire', 'Sécurité'),
  art('s2', 'Sauvegarder et restaurer', 'Sécurité'),
];

export default function Apercu() {
  const tm = (c: string, p?: Record<string, string | number>) => traduire('fr', c as never, p);
  const v = composerConnaissances(
    { langue: 'fr', maintenant: '2026-10-30T09:42:00Z', articles, choisi: 'a1', question: 'Comment annuler une facture ?', filtre: '', rubriquesOuvertes: new Set(['Facturation', 'Sécurité']), lecturesDuMois: 214, lecturesDeLArticle: 214, auteur: 'Écrit par Mohamed', etapeCourante: 4, modulesChanges: {} },
    { onOuvrir: () => undefined, onRubrique: () => undefined, onUtile: () => undefined },
  );
  return (
    <ApercuBureau famille="ecrire" sousPage="knowledge" fil={['Écrire et retenir', 'Base de connaissances']} ajmani="Pose une question, Ajmani cherche dans ta base de connaissances">
      <VueConnaissances
        {...v}
        titre="Base de connaissances"
        libelles={libellesDe(tm as never)}
        sousTitre="Ce que l’équipe sait, écrit une fois pour tous · 38 articles, 214 lectures ce mois"
        onNouveau={() => undefined}
        onStatistiques={() => undefined}
        question={{ ...v.question, onChange: () => undefined }}
        filtre={{ valeur: '', onChange: () => undefined }}
        arbre={{ ...v.arbre, pied: { total: '38 articles', aRelire: '3 à relire' } }}
        article={v.article && { ...v.article, suggestion: { texte: 'Cet article répond à 9 questions fréquentes. Je peux l’ajouter au parcours des nouveaux membres.', oui: 'Ajouter', non: 'Plus tard', onOui: () => undefined, onNon: () => undefined } }}
      />
    </ApercuBureau>
  );
}
