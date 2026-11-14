# LOT-12 · Connecteurs et autonomie — note de préparation

> Branche `claude/refonte-connecteurs`, partie de `claude/refonte-vivante` @ `50a58c4`. Rédigée le 12 nov. 2026 par S9, en MODE PRÉPARATION (socle v4 non fusionné : aucun écran visuel).
> Sources : `PLAN-10NOV.md` §4, `STATUT.md` §1.13 et §1.14, `REGLES.md` ; dossier v4 (hors dépôt) : `07-ESPACE-DEV.md`, fiche H21, images `H21-connecteurs`, `DEV-couts`, `DEV-editeur`.
> Rien ici ne décrit une faiblesse de sécurité ; aucune donnée réelle ; aucune clé.

## 1. En bref

- **Livré** : `src/refonte/connecteurs/` (le modèle et les moteurs locaux, purs, sans React ni réseau) et `scripts/check-connecteurs.ts` (`npm run check:connecteurs`, **103 contrôles**, ajouté à `editions.yml`).
- **Aucun écran** : H21 reste à LOT-07 (S6), DEV-couts et DEV-editeur à LOT-11 (S8). Ils lisent ce module.
- **Local d'abord** : chacune des 14 catégories du §4 a une version locale ; un connecteur arrêté rend la main au local (`modeDeCategorie`), l'écran reste utilisable.
- **Jamais deviné** : aucun tarif n'est écrit. Tous les services sont « à relever » ; tant qu'un tarif n'est pas relevé (source https + date), le connecteur **ne peut pas s'activer**. Le relevé se fait dans `tarifs.ts`, au moment de construire H21.
- **Ce qui dépend d'amn-api** est listé (§7), avec le repli local de chaque point. Rien n'est contourné.

## 2. Fichiers

| Fichier | Rôle |
|---|---|
| `types.ts` | Les formes : catégorie, option, tarif, prise, état, coût accepté, consommation, journal. Aucun champ de secret. |
| `catalogue.ts` | Les 14 catégories du §4, leur version locale (disponibilité, fichiers existants, attentes envers amn-api) et leurs options. |
| `tarifs.ts` | Les relevés (vide au 12 nov.), leur contrôle, la fraîcheur (frais ≤ 90 j, ancien ≤ 365 j, périmé au-delà). |
| `cycle.ts` | Activer, autoriser, arrêter, reconnecter ; `PARCOURS` (3 clics au plus) ; `modeEffectif`, `modeDeCategorie` ; `defautsDePrise`. |
| `baie.ts` | Les règles de H21 : état de prise, santé, badge, puces, droits accordés, dernière erreur, « il y a ». |
| `couts.ts` | Les règles de DEV-couts : part locale, payé, plafond (80 % puis arrêt), coût d'un tarif, « si tout passait par des API », projection, six mois, pastilles. |
| `flux.ts` | Le format des blocs Quand / Si / Alors (DEV-editeur), mode Local ou API par bloc, validation, essai. |
| `automatisations.ts` | Le flux rangé dans une règle du moteur H20 (branches Sinon et Puis), conversion dans les deux sens, plan d'exécution pour le moteur étendu. |
| `moteurs/` | `temps` (heure de Paris), `planificateur` (+ plages calmes), `courriels`, `relances`, `rappels`, `tri`, `rapports`, `sauvegardes`. |
| `amnApi.ts` | La liste « Demandé à amn-api ». |
| `demandes.ts` | « Demander un connecteur » pour un outil hors catalogue (Notion). |
| `reglages.ts` | Les valeurs de départ des moteurs, réunies et modifiables. |
| `adaptateurs.ts` | Le jeu `connecteurs` de SIM traduit en prises. |
| `i18n.ts`, `langue.ts` | Les textes (fr typé contre en) et le crochet `useConnecteursLangue` (seul fichier qui touche à React). |

## 3. Le modèle

**Une prise = une option d'une catégorie** (comme sur H21 : Vercel et Render sont deux prises « Hébergement »). Deux natures d'option :

- `service` : externe, facultatif, au tarif relevé (Stripe, Brevo…) ; connecté, il fait passer la catégorie en mode **externe** ;
- `chez-nous` : une brique à nous qu'il faut tout de même brancher (boîte de l'équipe en IMAP et SMTP, passerelle SMS Android, forge, ntfy, CalDAV, stockage et serveur maison). **0 € par construction**, et la catégorie reste en mode **local**. C'est ainsi que la prise « Passerelle SMS » de H21 entre dans le modèle.

**État** (partout où il compte) : `connecte`, `a-connecter` (motif : libre, autorisation en attente, à reconnecter, erreur), `arrete` (motif : à la main, plafond). H21 en tire ses sept états d'affichage (`etatDePrise`).

**Parcours** (`PARCOURS`, vérifié) :

| Geste | Clics | Détail |
|---|---|---|
| Activer | 3 | « Brancher » (le coût s'affiche : tarif, source, date, HT ou non) → « Activer » (avec un plafond mensuel) → autorisation chez le service |
| Arrêter | 2 | « Débrancher » → « Confirmer ». Les données restent, le coût accepté est oublié (une réactivation le remontre). |
| Reconnecter | 2 | « Reconnecter » → autorisation. Le coût déjà accepté n'est pas redemandé. |

Refus nommés (et traduits) : tarif à relever, tarif périmé, droit interdit, sans droit de gérer (H19), hors ligne, déjà actif, plafond invalide.

**Plafond** : un plafond par prise (accepté à l'activation) et un plafond global (DEV-couts). « Prévenir à 80 % » ; au plafond, `arretsDusAuPlafond` arrête les prises payantes et le local reprend.

**Banque** : lecture seule, toujours ; la catégorie interdit `ajout`, `ecriture`, `envoi` (vérifié).

### Catalogue (14 catégories dans l'ordre du plan, puis « Événements reçus »)

| Catégorie | Version locale | Dispo. | Déjà dans le dépôt | Chez nous | Services (tous « à relever ») |
|---|---|---|---|---|---|
| Messagerie | boîte de l'équipe, envois préparés | partielle | `lib/relances.ts`, `RemindersScreen`, `useMessageTemplates`, `lib/fileEnvoi.ts` | boîte de l'équipe (IMAP, SMTP) | Brevo, Mailjet, Postmark, Resend, Gmail (lecture) |
| Agenda | agenda intégré, ICS | partielle | `useAppointments`, `lib/calendar.ts`, `docs/google-agenda.md` | CalDAV | Google Agenda, Microsoft 365 |
| Paiement | virement, lien et QR, suivi manuel | partielle | `useInvoices`, `lib/qr.ts` | — | Stripe, Mollie, SumUp, GoCardless |
| Banque | import de relevés (CSV, OFX, CAMT.053) | à construire | — | — | agrégateur DSP2 (lecture seule) |
| Stockage | poste, sauvegardes chiffrées | partielle | `lib/backup.ts`, `lib/backupInspect.ts` | stockage serveur | S3 (UE), Google Drive, Dropbox |
| Hébergement | notre serveur | à construire | `lib/siteStatus.ts` | serveur maison | Vercel, Render, Netlify |
| Code | Git local, forge | à construire | — | forge (Forgejo, Gitea) | GitHub, GitLab |
| Notifications | système, Web Push | prête | `lib/webPush.ts` | ntfy | notification mobile, Slack |
| SMS | téléphone de l'équipe | à construire | — | passerelle SMS | OVHcloud, Brevo SMS, Twilio |
| WhatsApp | message préparé, `wa.me` | à construire | — | — | WhatsApp Business Platform |
| Téléphonie | appel dans l'application | prête | `CallContext`, `lib/serveursIce.ts` | — | ligne SIP |
| Signature | signature simple | prête | `SignatureScreen`, `SignatureDistanceScreen` | — | Yousign, Docusign |
| Assistant | modèles locaux | prête | `OllamaSection`, `preload.exclusive.internal.ts` | — | API d'un modèle en ligne |
| Comptabilité | export FEC | prête | `lib/fec.ts` | — | logiciel comptable en ligne |
| Événements reçus (hors §4, décision du CO §1.22) | événements reçus par notre serveur | à construire | — | Webhooks | — |

La garde vérifie que chaque fichier cité existe : si l'un bouge, elle le dit.

## 4. Pour H21 (S6, LOT-07)

| Besoin de la fiche | Fonction |
|---|---|
| États des prises (voyant + texte) | `etatDePrise` ; textes `prise.*` |
| « 7 sur 8 en forme » (libres exclues) | `santeDeLaBaie` |
| Badge de la barre latérale | `badge` (à reconnecter + en erreur, 0 = masqué) |
| Une seule synchro animée | `priseAnimee` |
| Puces Toutes / Branchées / À reconnecter / Libres | `comptesDesPuces`, `correspondALaPuce` |
| Droits accordés (3 groupes) | `droitsAccordes`, `groupeDeDroits` |
| Dernière erreur | `derniereErreur` |
| « il y a N min », « hier », date | `depuis` (veille au calendrier, changement d'heure compris) |
| Brancher, Débrancher, Reconnecter | `preparerActivation`, `activer`, `autorisationRecue`, `arreter`, `demanderReconnexion` |
| Numérotation fixe | `baieInitiale`, `prochainePrise`, `numeroDePrise` |

La baie d'exemple de la fiche (8 branchées dont Gmail à reconnecter, 2 libres ; droits 4 / 2 / 2) est rejouée par la garde.

**Écarts à trancher** (voir §9) : Notion et Webhooks, prises d'exemple de H21, n'ont pas de catégorie au §4 ; l'état « arrêté » n'a pas de dessin dans H21.

## 5. Pour DEV-couts et DEV-editeur (S8, LOT-11)

**DEV-couts** : `partLocale` (« 82 % fait seul »), `payeCeMois`, `etatPlafond` (« 14 € sur 40 € », prévenir à 80 %), `arretsDusAuPlafond` (« tout s'arrête »), `economise` et `siToutEnApi` (« 82 € économisés », « coûterait environ 96 € » : **`null` tant qu'un tarif de référence manque**, la ligne ne s'affiche alors pas), `projectionFinDeMois` et `partDuForfait` (« 72 % de ton forfait »), `sixDerniersMois`, `pastille` (Local, Payant, Service gratuit, À brancher). Les compteurs viennent d'amn-api (§7).

**DEV-editeur** : un flux s'écrit `{ quand, si, alors[], sinon[] }` ; le premier bloc d'une branche s'affiche ALORS ou SINON, les suivants PUIS (`roleAffiche`). Chaque bloc a un mode `local` ou `api` ; `modeEffectifBloc` repasse en local quand le service est arrêté (un flux ne casse jamais), `basculerFlux` répond à « Tu peux changer à tout moment », `essayer` donne le résultat de « Tester » sans rien faire, `defautsDuFlux` nomme ce qui manque. Le flux de la maquette (« Demande de devis par courriel ») est valide et rejoué.

**Pas de moteur à part** (décision du CO) : un flux s'enregistre comme une règle du moteur d'automatisation existant (H20). Voir §5 bis.

## 5 bis. Branches Sinon et Puis dans le moteur H20 (`automatisations.ts`)

**Format.** Une règle de la collection `automations` reste une `AutomationData`, avec un champ facultatif en plus :

```
{ trigger, action, enabled, assigneeEmail, createdAt }        ← l'existant, inchangé
+ flux?: { format: 2, nom, etat, quand, si, alors[], sinon[] }  ← l'extension
```

`alors[0]` est le bloc ALORS, les suivants sont des PUIS ; `sinon[0]` est SINON, les suivants des PUIS. Chaque bloc garde son mode `local` ou `api`. Aucun bloc ne porte d'accès (une boîte « contact@ », un modèle, un dossier).

**Convertible dans les deux sens, sans perte** (vérifié) :
- `depuisAutomation(id, nomParDefaut, regle)` lit toute règle, ancienne ou étendue ;
- `versAutomation(flux, createdAt, nomParDefaut)` écrit la règle. Si l'ancienne forme suffit à redonner exactement le flux, elle est écrite **telle quelle** : une règle existante relue puis réécrite revient à l'identique (10 cas sur 10), rien à migrer. Sinon, `flux` est ajouté (nom choisi, réglage d'étape, bloc en API, PUIS, SI, SINON, brouillon : tous relus à l'identique après passage par JSON) ;
- un flux actif invalide ne s'enregistre pas ; un brouillon, si.

**Sans danger pour le moteur actuel, avant son extension.** La règle garde son vrai `trigger` seulement si le moteur actuel exécute **tout** le flux (déclencheur existant, une action « tâche » ou « journal », en local, sans SI). Sinon `trigger` vaut `'flux'`, et le moteur actuel n'en fait rien (`sourcesPour` rend `[]`) au lieu d'exécuter un ALORS en ignorant son SI. La garde le vérifie sur le **vrai** `useAutomations.ts` du dépôt, chargé avec React et la synchronisation remplacés par des bouchons.

**Identifiants des étapes** (`idDEtape`) : le premier ALORS garde l'identifiant historique `auto-<règle>-<source>` ; puis `-p1`, `-p2`… ; SINON `-sinon`, puis `-sinon-p1`… Ajouter un PUIS à une règle qui tourne ne refait pas ce qu'elle a déjà fait.

**Ce que le moteur étendu appelle** : `planDExecution(regleId, flux, sourceId, evenement, { instances })` rend les étapes de la branche choisie, dans l'ordre, avec leur identifiant et leur mode réel (un bloc API dont le service est arrêté passe en local). `evenementDepuisSource` fait d'une `Source` de `sourcesPour` l'événement que lit le SI. `defautsDeLAutomation` signale une règle abîmée.

**Pour S6 (intégration à H20) :**
1. `useAutomations` et `AutomationsRunner` sont aussi montés par l'édition cliente (`BusinessLayout`). **Décidé (§1.22)** : une couture `@edition/*`, le `.business` garde le comportement actuel à l'identique, le `.internal` branche `automatisations.ts` ; S6 la pose dans LOT-07.
2. Élargir le type `trigger` à `'flux'` ; pour une règle `'flux'`, H20 affiche `flux.nom` au lieu du libellé du déclencheur.
3. Les nouvelles actions (créer le contact, répondre, classer, prévenir…) écrivent ailleurs que `tasks` et `logbook` : `useAutomationsParRegle` devra les compter.
4. `Source` n'a ni montant ni expéditeur : un SI « montant » ou « expéditeur connu » sur un déclencheur existant attend ces champs.

## 6. Les moteurs locaux

| Moteur | Sur l'existant | Règles (valeurs par défaut : propositions) |
|---|---|---|
| Courriels | `lib/fileEnvoi.ts`, `useMessageTemplates` | identifiant déterministe ; jamais une variable `{nom}` laissée ; désinscription ; même modèle au même destinataire au plus une fois en 7 jours ; plage clients lun.–ven. 09:00–18:00, fiche MC07 (sinon différé) ; 30 par heure au plus ; canal : un clic par la messagerie du poste (`mailto:`), sans clic par amn-api une fois la boîte branchée, API seulement si connectée |
| Relances | `lib/relances.ts` (paliers 7 / 21 / 45 j) | ni payée, ni en litige, ni pas échue ; fiche MC07 (§1.31) : 5 jours entre deux relances d'une facture (réglable de 3 à 14), 3 relances au plus par facture puis suivi à la main (`relancesAuPlafond`), une relance au plus par client sur 7 jours glissants, ses factures dues regroupées dans la même relance ; mise en demeure et dernier avis attendent toujours une personne ; textes : les clés `relances.message*` existantes (vouvoiement, vérifié) |
| Rappels | `useAppointments` | client la veille (avancé au dernier moment calme d'avant si la veille tombe hors plage), équipe une heure avant ; rien pour un rendez-vous passé ou annulé |
| Tri | — | mots repérés sans accents ni casse, mot entier, pluriel simple ; règles par priorité ; contact connu → Clients ; sinon À lire |
| Rapports | `useReports` | semaine close (lun.–dim.) ou mois clos, en heure de Paris, une fois par période |
| Sauvegardes | `lib/backup.ts` | une par jour ; due après 24 h, en retard après 36 h ; rotation 7 jours, 4 semaines, 6 mois |
| Planificateur | `AutomationsRunner` (même principe) | heure de Paris, changements d'heure compris ; poste fermé, une seule exécution rattrapée à la réouverture ; identifiant `<planification>-<jour>` |

Tous sont rejoués par la garde, et sur les jeux fictifs de SIM aux quatre volumes (une relance proposée par facture « En retard », ni plus ni moins).

## 7. Demandé à amn-api

Même liste dans `amnApi.ts`. Rien de ceci n'est contourné dans ce dépôt.

| Priorité | Brique | Attendu | Repli local en attendant |
|---|---|---|---|
| 1 | Clés des connecteurs | recevoir, garder chiffrées et renouveler les clés ; ne renvoyer qu'un état | tout reste en local ; aucune clé saisie dans l'application |
| 1 | Retour d'autorisation | le 3e clic du parcours, et la reconnexion | la prise reste « à connecter » |
| 1 | Envoi SMTP | envoyer depuis la boîte de l'équipe, avec un état par envoi | courriel prêt, envoyé en un clic |
| 1 | Tâches planifiées | exécuter rapports, relances, rappels, sauvegardes poste fermé, même identifiant | planificateur local, rattrapage à la réouverture |
| 2 | Consommation et plafond | compter par connecteur et par mois ; couper au plafond poste fermé | sans payant actif, rien à couper |
| 2 | Lecture IMAP | déclencher flux et tri sur courriel reçu, poste fermé | tri des messages déjà présents |
| 2 | Événements reçus | paiement reçu, signature faite | paiement pointé à la main |
| 2 | Sauvegarde nocturne | chiffrée, hors du poste, essai de restauration | export depuis le poste |
| 3 | CalDAV | agenda de l'équipe sur les téléphones | agenda intégré |
| 3 | Passerelle SMS | relais vers le téléphone de l'équipe | SMS envoyé à la main |
| 3 | État du serveur | quand le serveur maison existera (LOT-13, reporté) | rien d'affiché |

## 8. Relever un tarif (au moment de construire H21)

1. Ouvrir la page publique de tarifs du service.
2. Ajouter une entrée à `RELEVES` (`tarifs.ts`) : formule, montants en centimes, unité, inclus, **source** (adresse https de la page), **date**, HT ou non.
3. `npm run check:connecteurs` : la garde refuse une source non https, une date future, un montant négatif, une formule incomplète, une option inconnue ou une brique « chez nous ».
4. Au-delà de 90 jours, l'écran invite à revérifier ; au-delà de 365 jours, l'activation est refusée jusqu'au nouveau relevé.

## 9. Décisions du CO (STATUT §1.22), appliquées

| # | Question | Décision | Dans le modèle |
|---|---|---|---|
| 1 | Notion et Webhooks | Webhooks = brique « événements reçus » d'amn-api, prise « chez nous » ; Notion par « Demander un connecteur » | catégorie `evenements` (hors §4, en 15e position) avec l'option `webhooks` ; `demandes.ts` (`OUTILS_A_DEMANDER`, `demanderUnConnecteur` : lecture seule, une demande par outil et par jour) |
| 2 | Prise arrêtée | même dessin que libre, « arrêtée le … » | `dessinDePrise`, `texteDEtat` (clé `prise.arretee-le`) |
| 3 | Valeurs par défaut | adoptées comme valeurs de départ, modifiables ; pour les relances, la fiche MC07 l'emporte (§1.31) : 5 j (3 à 14), 09:00–18:00, 3 par facture, 1 par client sur 7 jours glissants | `reglages.ts` : `VALEURS_DE_DEPART`, `avecValeursDeDepart`, `defautsDesReglages` ; chaque moteur prend la valeur réglée en paramètre |
| 4 | Moteur de H20 | couture `@edition/*`, jumeau `.business` à l'identique, posée par S6 dans LOT-07 | rien à changer ici : `automatisations.ts` est pur, le `.internal` l'importe |
| 5 | Section LOT-12 au §7 | oui, courte | faite |

Les modèles de sites ajoutés restent sur le poste ; leur partage attend le serveur (LOT-13). Rien à faire dans ce lot.

## 10. Gardes

`typecheck`, `typecheck:business`, `lint`, `check:donnees`, `check:connecteurs` (103), plus `check:accueils`, `check:socle`, `check:moments` : verts (détail dans `docs/refonte/rapports/S9-connecteurs.md`).
