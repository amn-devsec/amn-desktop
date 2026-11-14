# LOT-07 · Outils et réglages — note de préparation (H18, H19, H20, H21)

> Branche `claude/refonte-outils`, partie de `claude/refonte-vivante` @ `8333822`. Rédigée le 14 nov. 2026 par S6, en mode PRÉPARATION : le socle v4 n'est pas fusionné, aucun écran n'est construit.
> Sources : le code du dépôt (relevé du 14 nov., lu sur `refonte-vivante` @ `abe2af1`), `STATUT.md` (§1.22, §1.26, §1.27), la note de LOT-12 (`LOT-12-connecteurs.md`), les jeux fictifs de SIM (`src/refonte/donnees/`).
> **Les fiches v4 de LOT-07 n'ont pas été reçues par cette session.** Tout ce qui dépend d'une fiche (disposition, libellés, valeurs des images) est marqué « attend la fiche ». Rien n'y est deviné.
> Rien dans ce document ne décrit une faiblesse de sécurité ; aucune donnée réelle.

## 1. En bref

- **Fait** : H20, la couture du moteur (`@edition/automatisations`, §1.22 n° 4), et H21, le relevé des tarifs (7 tarifs, §1.26). Détail dans `rapports/S6-outils.md`. Garde : `check:outils` (18 contrôles).
- **Inventorié ici** : H18, H19 et H21, avec l'existant du dépôt, les données fictives, les dépendances et les questions. Le CO a demandé ces trois écrans en premier (message du 14 nov.).
- **Attend** : les fiches v4 du lot (avant toute logique d'écran), puis le socle v4 (avant tout écran).
- **Changement de périmètre noté** : les vues terrain et stock (Métré, Matériel, flotte, stock et prévision) quittent la famille Outils pour Créer et produire (registre `bb54c03`, §1.27 n° 1). Elles ne relèvent plus de F60.

## 2. Tableau récapitulatif

| ID | Écran | Existant le plus proche (route) | Clé du registre (famille `outils`) | Dépend de | État |
|---|---|---|---|---|---|
| H18 | Paramètres | `SettingsScreen` (`/settings`, 1 197 lignes, fichier sensible) | `settings` | socle v4, fiche | inventorié |
| H19 | Membres et accès | `MembersScreen` (`/membres`), `TeamScreen` (`/team`), `AccessLogScreen` (`/tour/journal`), sections de sécurité du compte dans `SettingsScreen` | `members` | socle v4, fiche, amn-api (rôles) | inventorié, questions ouvertes |
| H20 | Automatisations | `AutomationsScreen` (`/outils/automatisations`), `useAutomations`, `AutomationsRunner` | `automations` | socle v4, fiche | couture posée |
| H21 | Connecteurs | aucun écran ; modèle de LOT-12 (`src/refonte/connecteurs/`) ; pièces locales dans `SettingsScreen` | — (à déclarer) | socle v4, fiche, modèle de LOT-12 | tarifs relevés |

## 3. H18 · Paramètres (mixte)

**Existant.** `src/screens/SettingsScreen.tsx`, partagé par les deux éditions, et **fichier sensible** (REGLES : ajouts seulement). Il assemble 23 sections : `ProfileSection`, `AccountSecuritySection`, `PasswordSection`, `MfaSection`, `LangueSection`, `AccentSection`, `MouvementSection`, `AccueilSection`, `RegistreSection`, `NotificationsSection`, `PushSection`, `PresenceSection`, `StartupSection`, `UpdateSection`, `DataSection`, `ModulesSection`, `AbonnementSection`, `ExtensionsSection`, `OllamaSection`, `WhisperSection`, `VeilleSection`, `GuideSection`, `AboutSection`. Plusieurs passent déjà par des coutures internes (`RegistreSection` par `@edition/vivant`, la porte de la coquille par `@edition/socle`).

**Pour l'écran refondu.** Un nouveau composant dans `src/refonte/outils/`, posé par le mécanisme de substitution de LOT-00, qui **réutilise les sections existantes** au lieu de les réécrire. `SettingsScreen` ne change pas : l'édition cliente garde ses réglages à l'identique.

**Données fictives.** `Entreprise` (nom, forme juridique, secteur, coordonnées, identité de facturation invalide par construction) sert aux réglages de l'entreprise.

**Attend la fiche.** Les groupes de réglages et leur ordre, les sections gardées ou déplacées (par exemple vers H19 pour la sécurité du compte, vers H21 pour les modèles locaux), les libellés au tutoiement.

## 4. H19 · Membres et accès (mixte)

**Existant.**
- `MembersScreen` (`/membres`, 386 lignes) : les places de la formule, la place vide dessinée comme les autres, l'ordre propriétaire, administrateurs, puis le reste. Rôles du serveur : `owner`, `admin`, `member`, `guest` (`UserRole`, `src/shared/api.ts`). Une place = un compte actif ou invité qui n'est pas `guest` (même règle que le serveur). Données : `bridge().remote.members.list`.
- `TeamScreen` (`/team`, 1 515 lignes) : le trombinoscope, les mêmes personnes vues au travail.
- `AccessLogScreen` (`/tour/journal`) : le journal des entrées dans l'espace d'une cliente, écrit par le serveur.
- Dans `SettingsScreen` : `AccountSecuritySection`, `PasswordSection`, `MfaSection` (sécurité du compte de la personne).
- `src/auth/roles.ts` : `ADMIN_ROLES = ['owner', 'admin']`, `isAdminRole`.

**Qui attend H19.**
- **LOT-06** (S7) : `DroitsPage { ecrire, publier, enLigne }` (`src/refonte/creer/pagePublique.ts`, `video.ts`). « Publier les changements » ou « Demander la publication » selon le droit de publier.
- **H21** (LOT-12) : `Contexte.peutGerer` de `cycle.ts`, « la personne gère les accès (H19) », qui ouvre ou ferme le branchement d'un connecteur.

**Décision déjà prise** (§1.27 n° 9) : le droit de publier est **distinct** du droit d'écrire. D'ici à H19, seul le rôle dirigeant publie, et les autres passent par « Demander la publication ».

**Données fictives.** `Membre` (`src/refonte/donnees/types.ts`) porte un rôle `Administrateur | Membre | Invité | Partenaire` (ceux de MC04), `doubleAuthentification` et `derniereActiviteAt` (pour H19).

**Principe.** Le serveur reste juge des droits. L'écran montre et propose ; il ne décide pas seul.

**Questions** (§6, n° 2 à 5).

## 5. H21 · Connecteurs (mixte)

**Existant.** Le modèle complet est celui de S9, dans `src/refonte/connecteurs/` : catalogue de 15 catégories, état des prises, baie, cycle en trois clics, coûts, refus nommés et textes. La correspondance avec les besoins de la fiche est le tableau du §4 de `LOT-12-connecteurs.md`. Les pièces locales déjà présentes, à relier sans les refaire : `OllamaSection` (modèles locaux), `WhisperSection`, `PushSection` (notifications), `ExtensionsSection`, l'agenda (`docs/google-agenda.md`).

**Tarifs.** 7 relevés le 14 nov. (`tarifs.ts`). Les autres restent « à relever », avec leur raison (`rapports/S6-outils.md`). L'activation d'un service non relevé reste fermée, comme le veut le modèle.

**Pour l'écran.** H21 passe au cycle le catalogue tarifé (`catalogueTarife()`). Sans cela, le cycle lit le catalogue nu et refuse toute activation, avec le motif « tarif à relever ».

**Attend la fiche.** La baie d'exemple (déjà rejouée par `check:connecteurs`), la disposition, les puces, le badge de la barre latérale.

**Questions** (§6, n° 6 et 7).

## 6. Constats et questions pour le CO

1. **Fiches v4 de LOT-07** : cette session ne les a pas. Il faut le zip du lot (fiches H18 à MO05 et leurs images), comme pour S5 et S7 (§1.27).
2. **Rôles** : les rôles fictifs de MC04 (`Administrateur`, `Membre`, `Invité`, `Partenaire`) ne correspondent pas aux rôles du serveur (`owner`, `admin`, `member`, `guest`). « Partenaire » n'a pas d'équivalent, et « propriétaire » n'a pas d'équivalent fictif. Laquelle des deux listes H19 affiche-t-il ?
3. **« Rôle dirigeant »** (§1.27 n° 9) : c'est le rôle `owner` ?
4. **Où vit le droit de publier ?** Une règle par rôle ne demande rien de plus. Un droit réglable par personne demande un champ côté serveur, donc une demande à amn-api : aucune collection nouvelle sans l'accord de Harun (§1.27 n° 4).
5. **Qui gère les connecteurs** (`peutGerer` de H21) : `owner` seul, ou `owner` et `admin` (`isAdminRole`) ?
6. **Où vivent les prises de H21** (l'état de la baie) : sur le poste, ou côté serveur ? La liste « Demandé à amn-api » de LOT-12 couvre les clés et les autorisations, pas l'état des prises.
7. **Devise des tarifs** et **plafond par transaction** : voir le rapport de S6 (9 services publiés en dollars ; GoCardless plafonné).

## 7. Dépendances

- **Socle v4** (S0, T1) : avant tout écran.
- **Fiches v4** : avant toute logique propre à un écran.
- **S5** (registre) : la déclaration de H21, et les vues terrain et stock déplacées vers Créer (§1.27 n° 1).
- **S9** (en pause) : le modèle des connecteurs, s'il faut une devise ou un plafond.
- **SIM** : les rôles fictifs, si la question n° 2 les change.
- **amn-api** : les rôles et, selon la question n° 4, le droit de publier par personne.
