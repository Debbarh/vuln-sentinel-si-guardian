# Cyber-Skill Collector — client graphique 0.1.0

Application locale React/shadcn embarquée dans Electron 45.4.1. L’utilisateur n’installe pas Node et ne saisit pas de commandes. Le client utilise le protocole Ed25519 du collecteur existant et la même base Supabase ; aucune base locale métier, aucun serveur GLPI ou Netdisco n’est ajouté.

Cette première version couvre l’association, l’examen et la transmission de rapports GLPI déjà produits, ainsi que la préparation de profils SNMP locaux. **La collecte GLPI automatique, la découverte SNMP::Info et leur programmation restent à intégrer.** Les installateurs sont des préversions : un paquet généré ne signifie pas que sa plateforme est qualifiée ou qu’il est signé pour diffusion publique.

## Parcours utilisateur

1. Installer puis ouvrir l’application. Sur macOS, ouvrir le DMG et déplacer Cyber-Skill Collector dans Applications. La préversion utilise une signature ad hoc, sans notarisation Apple ; elle peut demander une autorisation explicite dans les réglages de sécurité. Ne pas désactiver globalement les protections du système.
2. Cliquer **Préparer ce collecteur** : l’identité Ed25519 est créée localement et protégée par le coffre du système.
3. Dans la console Cyber-Skill, l’administrateur avec MFA crée une invitation dans **Veille → Paramètres → Connecteurs → Collecteurs locaux**. Reporter son identifiant et son code temporaire dans l’application.
4. Comparer l’empreinte affichée par l’application et celle de la console, puis approuver l’identité dans la console. Cliquer **Vérifier l’approbation** dans l’application.
5. Sélectionner les rapports JSON GLPI, examiner les données nettoyées, confirmer et transmettre. Les originaux restent inchangés. Les rapports reçus suivent l’inspection et l’import natifs dans la console.
6. Si nécessaire, préparer les profils SNMPv3 authPriv en lecture seule. Leur nom correspond à la référence choisie dans le périmètre réseau de la console ; les mots de passe sont renseignés uniquement sur le collecteur. Leur enregistrement ne lance pas de scan.

Une coupure conserve le lot chiffré avec le même UUID, hash et numéro de séquence. Un nouvel examen est exigé après redémarrage avant transmission. Un accusé perdu peut être retrouvé sans duplication. « Abandonner ce lot » solde un lot non reçu, ou récupère simplement son accusé s’il avait déjà été reçu : aucun rapport déjà présent dans la console n’est supprimé par cette commande.

## Protection et limites

- Interface locale isolée, sandbox, sans accès Node ; aucune page distante, iframe ou fenêtre externe chargée. Réseau interdit au rendu par CSP et par la session Electron. Seul le bouton d’ouverture de la console utilise le navigateur système, vers une adresse fixe.
- IPC limité à des opérations nommées ; origine, fenêtre et frame principale contrôlées. Aucun chemin de fichier, commande, URL d’API ou clé de plateforme transmis par le rendu.
- Sélection des fichiers par boîte de dialogue native. Lecture bornée, refus des liens, contrôle des fichiers ouverts ; au plus 50 rapports / 32 Mio, sans troncature des données. Filtre de secrets et parseur sans perte de grands nombres issus de la plateforme.
- Un seul enregistrement local atomique chiffré pour l’identité, le lot en attente et les profils. Aucune sauvegarde en clair ni repli si le coffre est indisponible. Les codes d’invitation ne sont pas persistés ; les champs de mots de passe sont effacés après la tentative.
- macOS : Keychain via l’API asynchrone safeStorage. Windows : DPAPI via cette API. Sur Linux, le client 45 utilise l’API synchrone avec contrôle explicite du fournisseur (`gnome_libsecret` ou KWallet), et refuse `basic_text` ; migrer ce contrôle avant Electron 46, qui retire l’API synchrone. Un gestionnaire de secrets déverrouillé est nécessaire.
- La protection dépend du compte OS. Windows DPAPI ne protège pas contre une autre application exécutée sous le même compte ; un système compromis n’entre pas dans cette frontière de confiance. Ne pas copier l’enregistrement chiffré entre systèmes ou comptes pour transférer une identité.
- La désinstallation conserve les données chiffrées pour permettre une réinstallation. Pour retirer définitivement un collecteur, révoquer son identité dans la console et supprimer ses profils locaux ; la purge du dossier protégé suit ensuite les procédures du poste.
- Aucun scan, installation d’agent, action sur un équipement, appel IA, e-mail ou import automatique par cette version. Aucun secret SNMP envoyé au serveur. Aucun auto-update ou téléchargement de programme dicté par une politique distante.

La signature ad hoc macOS sert aux tests internes. Une identité de signature stable et la qualification de mise à jour sont nécessaires pour une diffusion publique régulière et une continuité fiable des droits Keychain.

## Construction et qualification développeur

Le paquet possède son propre verrou npm. Il se construit sans installer les dépendances de l’application web :

```sh
npm ci --ignore-scripts --prefix tools/inventory-desktop
node tools/inventory-desktop/node_modules/electron/install.js
node scripts/inventory/build-desktop.mjs
npm test --prefix tools/inventory-desktop
node tools/inventory-desktop/node_modules/typescript/bin/tsc -p tools/inventory-desktop/tsconfig.json --noEmit
node scripts/inventory/build-desktop-qa.mjs
node tools/inventory-desktop/qa/check-native.mjs
node tools/inventory-desktop/node_modules/electron-builder/cli.js --projectDir tools/inventory-desktop --publish never
node scripts/inventory/verify-desktop-package.mjs
```

Ces commandes concernent le développeur et les runners CI ; elles ne sont pas le parcours de l’administrateur client.

Les composants/tokens, le logo approuvé, le filtre de rapports, le protocole et le SDK sont des instantanés ciblés du projet existant. Le manifeste `vendor/source-manifest.json` enregistre les empreintes et les quelques adaptations de chemins. `sync-desktop-ui.mjs` les régénère depuis le workspace de la plateforme **à jour et validé** ; il ne doit pas être lancé sur un ancien checkout pour écraser un instantané plus récent. Le contrôleur de recette copie le contrôleur réel avec seulement ses chemins d’import adaptés et une définition de type minimale. Il n’entre pas dans le paquet distribué.

Le workflow `inventory-desktop.yml` teste les PR ciblées sur Windows, macOS et Linux, puis fabrique les préversions. Il n’utilise aucun secret client ni serveur de production, ne publie pas de release et ne fusionne rien. La recette native vérifie le vrai coffre OS, le protocole signé sur fixtures, les grands compteurs, l’exclusion des secrets, les quatre langues/RTL, les deux largeurs, l’absence de réseau dans le rendu et la restauration chiffrée après redémarrage. Une plateforme qui ne passe pas ces contrôles n’obtient pas d’artefact qualifié.

`verify-desktop-package.mjs` contrôle le contenu ASAR, les empreintes des fichiers compilés, les licences et les fuses de production, puis génère les SHA-256 et le reçu de qualification. La recette et ses fichiers temporaires ne sont jamais embarqués. Les changements de ce client n’exigent aucune migration SQL ni modification de permission sur Cyber-Skill.

Les outils de packaging utilisent une surcharge ciblée de minimatch 11.0.9 pour remplacer les versions 7–11.0.0 signalées par npm audit ; les anciennes API 3/5 restent inchangées. Les notices des dépendances effectivement incluses sont générées ; le texte MIT omis du paquet npm react-remove-scroll-bar est conservé depuis son dépôt officiel avec URL de commit et empreinte dans `licenses/supplemental.json`.

Sources : [sécurité Electron](https://www.electronjs.org/docs/latest/tutorial/security), [safeStorage et frontières de confiance](https://www.electronjs.org/docs/latest/api/safe-storage), [packaging electron-builder](https://www.electron.build/configuration/), [SNMP::Info du projet Netdisco](https://github.com/netdisco/snmp-info).
