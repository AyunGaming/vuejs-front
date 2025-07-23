# Vue.js Frontend Application

Ce projet est une application frontend développée avec Vue.js, TypeScript et Vite.

## Prérequis

- Node.js (version 18.x ou supérieure)
- npm (inclus avec Node.js)

## Installation

1. Clonez ce dépôt sur votre machine locale :
   ```bash
   git clone <url-du-dépôt>
   cd vuejs-front
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

## Démarrage du serveur de développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:5173](http://localhost:5173) (ou un autre port si le 5173 est déjà utilisé).

## Compilation pour la production

Pour construire l'application pour la production :

```bash
npm run build
```

Les fichiers compilés seront disponibles dans le dossier `dist`.

## Prévisualisation de la version de production

Pour prévisualiser la version de production :

```bash
npm run preview
```

## Structure du projet

```
vuejs-front/
├── public/             # Fichiers statiques
├── src/
│   ├── assets/         # Images et ressources
│   ├── components/     # Composants Vue réutilisables
│   ├── layouts/        # Layouts de l'application
│   ├── router/         # Configuration des routes
│   ├── store/          # Gestion d'état avec Pinia
│   ├── views/          # Pages de l'application
│   ├── App.vue         # Composant racine
│   └── main.ts         # Point d'entrée
├── index.html          # Template HTML
└── vite.config.ts      # Configuration de Vite
```

## Technologies utilisées

- Vue.js 3 - Framework JavaScript progressif
- TypeScript - Typage statique pour JavaScript
- Vue Router - Routage officiel pour Vue.js
- Pinia - Gestion d'état pour Vue.js
- Vite - Outil de build ultra-rapide
- Tailwind CSS - Framework CSS utilitaire

## Fonctionnalités

- Système d'authentification
- Gestion des produits
- Gestion des utilisateurs
- Panier d'achats
- Interface responsive

## Notes de développement

- L'application utilise Vue 3 avec la syntaxe `<script setup>` pour les composants.
- Pinia est utilisé avec le plugin `pinia-plugin-persistedstate` pour la persistance des données.
- Les requêtes API sont gérées avec Axios.
