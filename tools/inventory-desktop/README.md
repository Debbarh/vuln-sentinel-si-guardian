# Cyber-Skill Collector — client graphique 0.3.0

Application locale React/shadcn embarquée dans Electron 45.4.1. L’utilisateur n’installe pas Node et ne saisit pas de commandes. Le client utilise le protocole Ed25519 du collecteur existant et la même base Supabase ; aucune base locale métier, aucun serveur GLPI ou Netdisco n’est ajouté.

Cette version ajoute la génération du rapport de cet ordinateur avec GLPI Agent 1.21, déclenchée par un bouton et une confirmation native. Elle conserve l’association, l’examen et la transmission des rapports déjà exportés et les profils SNMP locaux. **La découverte SNMP::Info et la collecte planifiée restent à intégrer.** Les installateurs sont des préversions : un paquet généré ne signifie pas que sa plateforme est qualifiée ou qu’il est signé pour diffusion publique.

## Parcours utilisateur

1. Installer puis ouvrir l’application. Sur macOS, ouvrir le DMG et déplacer Cyber-Skill Collector dans Applications. La préversion utilise une signature ad hoc, sans notarisation Apple ; elle peut demander une autorisation explicite dans les réglages de sécurité. Ne pas désactiver globalement les protections du système.
2. Cliquer **Préparer ce collecteur** : l’identité Ed25519 est créée localement et protégée par le coffre du système.
3. Dans la console Cyber-Skill, l’administrateur avec MFA crée une invitation dans **Veille → Paramètres → Connecteurs → Collecteurs locaux**. Reporter son identifiant et son code temporaire dans l’application.
4. Comparer l’empreinte affichée par l’application et celle de la console, puis approuver l’identité dans la console. Cliquer **Vérifier l’approbation** dans l’application.
5. Cliquer **Inventorier cet ordinateur**, confirmer l’autorisation locale, attendre la génération, puis **Examiner les données** et confirmer la transmission. Il est également possible de sélectionner des rapports JSON GLPI déjà exportés. Les originaux restent inchangés. Les rapports reçus suivent l’inspection et l’import natifs dans la console.
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
- L’inventaire du poste est exécuté à la demande, sous le compte courant, sans élévation ni service. Aucun scan réseau, appel IA, e-mail ou import automatique. Aucun secret SNMP envoyé au serveur. Aucun auto-update ou téléchargement de programme dicté par une politique distante.

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

## Mandat réseau — préversion 0.2.0

Le bouton **Récupérer le mandat** demande le périmètre actuel par le protocole Ed25519 existant. La réponse est liée à l’identité, à l’empreinte de sa clé et au nonce signé de cette demande. La route ne consomme pas une séquence d’import et ne réserve aucun transfert. Une identité inactive, expirée ou une organisation fermée ne reçoit aucun périmètre ; PostgreSQL revérifie ces conditions après la vérification HTTP.

La validité est au plus de cinq minutes, bornée aussi par l’expiration de l’identité. Le mandat est conservé en mémoire uniquement, jamais restauré après redémarrage. Toute tentative de rafraîchissement invalide l’ancien mandat avant la requête. Une expiration, un retour en arrière d’horloge, une suspension avec divergence des horloges, un profil local absent, une désactivation ou une fenêtre horaire fermée empêchent l’autorisation locale des cibles. Une réponse lente n’allonge pas sa validité.

L’interface présente les réseaux, exclusions, horaires, cadence, référence du profil et nombre de cibles calculé sans DNS. Elle indique explicitement que **le moteur n’est pas activé**. Le mandat réseau n’exécute pas SNMP et ne met pas en place de service de planification. La collecte GLPI du poste est distincte : consentement local et identité active requis, sans utilisation du périmètre réseau. Il prépare le contrat d’autorisation à vérifier avant chaque future tâche ; une modification serveur n’annule pas magiquement une réponse déjà reçue, d’où le bail court et la récupération à renouveler avant exécution.

La route nécessite la migration additive `20261122144000_veille_collector_network_mandate.sql` et le contrôleur serveur correspondant. Une ancienne plateforme qui ne possède pas cette route échoue sans réutiliser un mandat en cache. L’association et l’import manuel restent compatibles avec le protocole précédent.


## Génération locale — 0.3.0

Le moteur est téléchargé directement depuis la [publication officielle GLPI 1.21](https://github.com/glpi-project/glpi-agent/releases/tag/1.21), avec SHA-256 compilé dans le client. Seuls GitHub et son hôte de fichiers de publication sont admis lors des redirections HTTPS. Aucun chemin, argument, programme ou URL fourni par le rendu ou la console n’est exécuté. Les archives sont bornées à 64 Mio et revérifiées à chaque utilisation ; chaque exécution part d’une extraction privée neuve. Les paquets supportés sont Windows x64 portable, macOS Apple Silicon PKG extrait sans installation, Linux x86_64 AppImage extrait sans FUSE.

Le programme auxiliaire `src/glpi-runner.pl` est dérivé du [script autonome officiel](https://github.com/glpi-project/glpi-agent/blob/1.21/bin/glpi-inventory), sous GPL-2.0-or-later (source lisible et licence incluses dans le paquet). Il utilise une configuration vide, une cible stdout JSON, aucun scan des répertoires personnels ou profils, aucun identifiant de base de données, et un identifiant stable `cyber-skill-<UUID du collecteur>`. Ne pas cloner une identité de collecteur entre postes. Les informations indisponibles sans élévation restent inconnues ; aucun droit supplémentaire n’est demandé.

L’identité doit être approuvée dans la console par l’administrateur avec MFA. Le statut signé est revérifié avant, toutes les 30 secondes pendant, et après la collecte. Une révocation, une expiration, une indisponibilité ou une annulation empêche la préparation du lot. L’autorisation locale s’ajoute à cette approbation. Aucun nouveau rôle, permission, schéma SQL ou compte n’est ajouté.

Les processus démarrent sans shell et sans variables d’injection héritées. Le délai d’un processus est borné à trois minutes ; stdout est borné à 32 Mio et stderr est drainé sans être journalisé, avec une limite de volume. Annuler arrête l’arbre de processus. Les fichiers temporaires privés sont supprimés à la fin ; un répertoire interrompu est nettoyé à la prochaine collecte. Les octets du rapport transitent en mémoire, sont filtrés puis préparés dans le coffre chiffré existant. Une limite refuse le résultat entier. Le filtrage ne garantit pas l’identification d’un secret placé dans un champ inconnu : l’examen humain avant envoi reste obligatoire.

La qualification réelle de génération est réservée à des runners GitHub jetables explicitement désignés. Elle vérifie le moteur épinglé, un rapport matériel/OS/logiciels, son identifiant stable, le passage par le filtre, l’obligation d’examen et sa transmission signée vers le contrôleur sur fixtures, sans requête client ni import réel. Aucun inventaire de la machine du développeur n’est lancé par cette recette locale. Le test `--version-only` vérifie uniquement le chargement du moteur.
