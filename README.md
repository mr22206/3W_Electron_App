# Station Météo Embarquée

Ce projet est une application de station météo embarquée développée avec React et Electron. Il permet de collecter des données de capteurs, de les convertir en fichiers CSV et de les visualiser dans une interface utilisateur.

![Capture d'écran de l'application](path/to/image/main_screenshot.png) <!-- Remplacez par le chemin de votre image -->

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Scripts disponibles](#scripts-disponibles)
- [Contributions](#contributions)
- [Licence](#licence)

## Fonctionnalités

Cette application de station météo embarquée offre plusieurs fonctionnalités clés :

- **Collecte de données de capteurs** :
  - **Humidité** : Mesure du taux d'humidité ambiant, exprimé en pourcentage.
  - **Température** : Mesure de la température ambiante, exprimée en degrés Celsius.
  - **Altitude** : Mesure de l'altitude par rapport au niveau de la mer, exprimée en mètres.
  - **Latitude et Longitude** : Coordonnées géographiques permettant de localiser la station météo.
  - **Luminosité** : Mesure de l'intensité lumineuse, exprimée en lux.

  ![Illustration des capteurs](path/to/image/sensors.png) <!-- Remplacez par le chemin de votre image -->

- **Conversion des fichiers binaires en fichiers CSV** :
  - Les données collectées par les capteurs sont stockées dans un format binaire. L'application permet de convertir ces fichiers binaires en fichiers CSV, facilitant ainsi l'analyse et la visualisation des données à l'aide d'outils comme Excel ou Google Sheets.

  ![Illustration de la conversion CSV](path/to/image/csv_conversion.png) <!-- Remplacez par le chemin de votre image -->

- **Interface utilisateur pour le débogage et le téléversement des données** :
  - Une interface conviviale permet aux utilisateurs de déboguer et de téléverser les données sur des dispositifs externes, comme des microcontrôleurs (par exemple, Arduino). Les utilisateurs peuvent suivre l'état du processus de téléversement grâce à des messages de statut en temps réel.

  ![Capture d'écran de l'interface utilisateur](path/to/image/ui_interface.png) <!-- Remplacez par le chemin de votre image -->

- **Récupération des données à partir de fichiers binaires** :
  - L'application permet aux utilisateurs de sélectionner des fichiers binaires existants pour les convertir en CSV, facilitant ainsi la récupération et l'analyse des données historiques.

- **Notifications et messages d'état** :
  - L'application fournit des notifications et des messages d'état tout au long des processus de collecte, de conversion et de téléversement, assurant une transparence totale sur les opérations en cours.

- **Support multiplateforme** :
  - Grâce à Electron, l'application peut être exécutée sur différentes plateformes (Windows, macOS, Linux), offrant ainsi une flexibilité d'utilisation pour les utilisateurs.

- **Personnalisation des paramètres de capteurs** :
  - Les utilisateurs peuvent configurer les paramètres des capteurs, tels que la fréquence de collecte des données, pour répondre à des besoins spécifiques.

Ces fonctionnalités font de cette application un outil puissant pour la collecte et l'analyse des données météorologiques, adapté tant aux amateurs qu'aux professionnels.

## Technologies utilisées

Ce projet utilise plusieurs technologies modernes pour assurer une performance optimale et une expérience utilisateur fluide :

- **React** :
  - Une bibliothèque JavaScript populaire pour la construction d'interfaces utilisateur. React permet de créer des composants réutilisables et de gérer l'état de l'application de manière efficace.

  ![Logo de React](path/to/image/react_logo.png) <!-- Remplacez par le chemin de votre image -->

- **Electron** :
  - Un framework permettant de créer des applications de bureau multiplateformes en utilisant des technologies web (HTML, CSS, JavaScript).

  ![Logo d'Electron](path/to/image/electron_logo.png) <!-- Remplacez par le chemin de votre image -->

- **C** :
  - Un langage de programmation de bas niveau utilisé pour la gestion des données des capteurs et la conversion des fichiers.

- **Node.js** :
  - Un environnement d'exécution JavaScript côté serveur qui permet d'exécuter des scripts JavaScript en dehors d'un navigateur.

- **npm (Node Package Manager)** :
  - Un gestionnaire de paquets pour JavaScript qui permet d'installer et de gérer les dépendances du projet.

- **HTML/CSS** :
  - Les technologies de base pour la création de pages web.

- **Git** :
  - Un système de contrôle de version distribué qui permet de suivre les modifications apportées au code source.

- **Jest et Testing Library** :
  - Des outils de test pour JavaScript qui permettent d'écrire et d'exécuter des tests unitaires et d'intégration.

Ces technologies combinées permettent de créer une application robuste, performante et facile à utiliser, adaptée aux besoins des utilisateurs souhaitant collecter et analyser des données météorologiques.

## Installation

Pour installer et exécuter l'application de station météo embarquée, suivez les étapes ci-dessous :

### Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

- **Node.js** : Téléchargez et installez la dernière version de Node.js depuis [nodejs.org](https://nodejs.org/).
- **npm** : npm est généralement inclus avec Node.js. Vous pouvez vérifier son installation en exécutant `npm -v` dans votre terminal.
- **Git** : Si vous n'avez pas encore Git, téléchargez-le depuis [git-scm.com](https://git-scm.com/).

### Étapes d'installation

1. **Clonez le dépôt** :

   Ouvrez votre terminal et exécutez la commande suivante pour cloner le dépôt du projet :

   ```bash
   git clone https://github.com/votre-utilisateur/station-meteo-embarquée.git
   cd station-meteo-embarquée
   ```

   ![Capture d'écran du terminal](path/to/image/terminal_screenshot.png) <!-- Remplacez par le chemin de votre image -->

2. **Installez les dépendances** :

   Une fois dans le répertoire du projet, exécutez la commande suivante pour installer toutes les dépendances nécessaires :

   ```bash
   npm install
   ```

   ![Capture d'écran de l'installation des dépendances](path/to/image/npm_install.png) <!-- Remplacez par le chemin de votre image -->

3. **Compilez le projet** :

   Pour préparer l'application pour la production, exécutez la commande suivante :

   ```bash
   npm run build
   ```

4. **Générez l'application Electron** :

   Pour créer un exécutable de votre application de bureau, exécutez la commande suivante :

   ```bash
   npm run package
   ```

5. **Démarrez l'application** :

   Pour exécuter l'application en mode développement, utilisez la commande suivante :

   ```bash
   npm run electron-dev
   ```

   ![Capture d'écran de l'application en mode développement](path/to/image/electron_dev.png) <!-- Remplacez par le chemin de votre image -->

6. **Accédez à l'application** :

   Une fois l'application lancée, vous pouvez interagir avec elle via l'interface utilisateur. Si vous exécutez l'application en mode développement, ouvrez votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000) pour accéder à l'application.

### Remarques

- Assurez-vous que toutes les dépendances sont à jour en exécutant `npm update` régulièrement.
- Pour des instructions spécifiques sur le déploiement de l'application sur différentes plateformes, consultez la documentation d'Electron et de `electron-builder`.

Avec ces étapes, vous serez en mesure d'installer et d'exécuter l'application de station météo embarquée sur votre machine.

## Utilisation

L'application de station météo embarquée permet aux utilisateurs de collecter, visualiser et analyser des données météorologiques à partir de capteurs. Voici comment utiliser les principales fonctionnalités de l'application :

### Démarrage de l'application

1. **Lancer l'application** :
   - Pour exécuter l'application, ouvrez votre terminal et naviguez jusqu'au répertoire du projet, puis exécutez la commande suivante :

   ```bash
   npm start
   ```

   - Cela lancera l'application en mode développement. Vous pouvez accéder à l'interface utilisateur via votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000).

   ![Capture d'écran de l'application au démarrage](path/to/image/startup_screenshot.png) <!-- Remplacez par le chemin de votre image -->

### Interface utilisateur

L'interface utilisateur est divisée en plusieurs sections, chacune offrant des fonctionnalités spécifiques :

1. **Section de Débogage et Téléversement** :
   - Cette section permet aux utilisateurs de déboguer et de téléverser des données sur des dispositifs externes, comme des microcontrôleurs (par exemple, Arduino).
   - Cliquez sur le bouton "Lancer" pour démarrer le processus de débogage et de téléversement. Vous verrez des messages de statut indiquant l'état du processus en temps réel.

   ![Capture d'écran de la section de débogage et téléversement](path/to/image/debug_upload_section.png) <!-- Remplacez par le chemin de votre image -->

2. **Section de Récupération des Données** :
   - Cette section permet aux utilisateurs de sélectionner des fichiers binaires existants pour les convertir en fichiers CSV.
   - Cliquez sur le bouton "Sélectionner un fichier" pour ouvrir un dialogue de sélection de fichier. Une fois le fichier sélectionné, vous pouvez cliquer sur "Convertir en CSV" pour lancer le processus de conversion.
   - Des messages de statut vous informeront de l'état de la conversion, y compris les erreurs potentielles.

   ![Capture d'écran de la section de récupération des données](path/to/image/data_recovery_section.png) <!-- Remplacez par le chemin de votre image -->

### Notifications et Messages d'État

- L'application fournit des notifications et des messages d'état tout au long des processus de collecte, de conversion et de téléversement. Cela permet aux utilisateurs de suivre facilement les opérations en cours et d'être informés de tout problème éventuel.

   ![Exemple de notifications et messages d'état](path/to/image/status_notifications.png) <!-- Remplacez par le chemin de votre image -->

### Accès aux Données

- Une fois les données converties en fichiers CSV, vous pouvez les ouvrir avec des outils d'analyse de données tels qu'Excel ou Google Sheets pour une analyse plus approfondie.

   ![Exemple de fichier CSV ouvert dans Excel](path/to/image/csv_in_excel.png) <!-- Remplacez par le chemin de votre image -->

### Remarques

- Assurez-vous que tous les capteurs sont correctement connectés et configurés avant de tenter de collecter des données.
- Pour toute question ou problème, consultez la documentation ou soumettez une demande d'assistance.

Avec ces instructions, vous serez en mesure d'utiliser efficacement l'application de station météo embarquée pour collecter et analyser des données météorologiques.

## Scripts disponibles

Dans le répertoire du projet, vous pouvez exécuter les scripts suivants :

### `npm start`

Lance l'application en mode développement. Ouvrez [http://localhost:3000](http://localhost:3000) pour la visualiser dans votre navigateur.

### `npm test`

Lance le test runner en mode interactif.

### `npm run build`

Construit l'application pour la production dans le dossier `build`.

### `npm run eject`

Éjecte la configuration de l'application, vous permettant de personnaliser les configurations de build.

## Contributions

Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage (pull request) pour toute amélioration ou correction de bogue.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
