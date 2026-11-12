# LOT-12 · Connecteurs et autonomie — note de préparation

> Branche `claude/refonte-connecteurs`, partie de `claude/refonte-vivante` @ `50a58c4`. Rédigée le 12 nov. 2026 par S9, en MODE PRÉPARATION (socle v4 non fusionné : aucun écran visuel).
> Sources : `PLAN-10NOV.md` §4, `STATUT.md` §1.13 et §1.14, `REGLES.md` ; dossier v4 (hors dépôt) : `07-ESPACE-DEV.md`, fiche H21, images `H21-connecteurs`, `DEV-couts`, `DEV-editeur`.
> Rien ici ne décrit une faiblesse de sécurité ; aucune donnée réelle ; aucune clé.

## 1. En bref

- **Livré** : `src/refonte/connecteurs/` (le modèle et les moteurs locaux, purs, sans React ni réseau) et `scripts/check-connecteurs.ts` (`npm run check:connecteurs`, **85 contrôles**, ajouté à `editions.yml`).
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
| `flux.ts` | Le format des blocs Quand / Si / Alors (DEV-editeur), mode Local ou API par bloc, validation, essai, pont avec `useAutomations`. |
| `moteurs/` | `temps` (heure de Paris), `planificateur` (+ plages calmes), `courriels`, `relances`, `rappels`, `tri`, `rapports`, `sauvegardes`. |
| `amnApi.ts` | La liste « Demandé à amn-api ». |
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

### Catalogue (14 catégories, ordre du plan)

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

**Pont avec l'existant** : `depuisAutomation` lit chaque automatisation de `useAutomations` en flux, et `versAutomation` rend un flux simple exécutable dès aujourd'hui par `AutomationsRunner` (aller-retour vérifié sur les 5 déclencheurs × 2 actions).

## 6. Les moteurs locaux

| Moteur | Sur l'existant | Règles (valeurs par défaut : propositions) |
|---|---|---|
| Courriels | `lib/fileEnvoi.ts`, `useMessageTemplates` | identifiant déterministe ; jamais une variable `{nom}` laissée ; désinscription ; même modèle au même destinataire au plus une fois en 7 jours ; plage clients lun.–ven. 08:00–19:00 (sinon différé) ; 30 par heure au plus ; canal : un clic par la messagerie du poste (`mailto:`), sans clic par amn-api une fois la boîte branchée, API seulement si connectée |
| Relances | `lib/relances.ts` (paliers 7 / 21 / 45 j) | ni payée, ni en litige, ni pas échue ; 7 jours entre deux relances ; mise en demeure et dernier avis attendent toujours une personne ; textes : les clés `relances.message*` existantes (vouvoiement, vérifié) |
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

## 9. Questions au CO

1. **Notion et Webhooks** (prises d'exemple de H21) n'ont pas de catégorie au §4. Proposition : Webhooks = la brique « événements reçus » d'amn-api, affichée comme prise « chez nous » ; Notion = « Demander un connecteur » tant que le §4 ne l'ajoute pas.
2. **Prise arrêtée** : H21 dessine « libre » mais pas « arrêtée ». Proposition : même dessin que libre, avec « arrêtée le … » à la place de « libre, à brancher ».
3. **Valeurs par défaut** à valider par Harun : plage clients (lun.–ven. 08:00–19:00), plage équipe (07:30–21:00), 7 jours entre relances, 30 courriels par heure, rotation 7 / 4 / 6, seuil de suggestion à 70 % du forfait.
4. **Section LOT-12 dans `STATUT.md` § 7** : elle n'existe pas (le lot n'a pas d'écran). Je n'y ai pas touché ; au CO de dire s'il en faut une.

## 10. Gardes

`typecheck`, `typecheck:business`, `lint`, `check:donnees`, `check:connecteurs` (85), plus `check:accueils`, `check:socle`, `check:moments` : verts (détail dans `docs/refonte/rapports/S9-connecteurs.md`).
