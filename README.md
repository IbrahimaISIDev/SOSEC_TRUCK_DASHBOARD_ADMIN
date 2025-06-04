# Sosec Truck Admin Dashboard

Dashboard d’administration pour la gestion de flotte de camions, chauffeurs, dépenses, tickets, kilométrage et notifications.

## Sommaire

- [Sosec Truck Admin Dashboard](#sosec-truck-admin-dashboard)
  - [Sommaire](#sommaire)
  - [Présentation](#présentation)
  - [Fonctionnalités](#fonctionnalités)
  - [Architecture du projet](#architecture-du-projet)
  - [Installation](#installation)
    - [Prérequis](#prérequis)
    - [1. Cloner le dépôt](#1-cloner-le-dépôt)
    - [2. Installer les dépendances](#2-installer-les-dépendances)
      - [Backend](#backend)
      - [Frontend](#frontend)
    - [3. Configurer les variables d’environnement](#3-configurer-les-variables-denvironnement)
    - [4. Lancer la base de données et effectuer les migrations](#4-lancer-la-base-de-données-et-effectuer-les-migrations)
    - [5. Démarrer les serveurs](#5-démarrer-les-serveurs)
      - [Backend](#backend-1)
      - [Frontend](#frontend-1)
  - [Scripts disponibles](#scripts-disponibles)
    - [Backend](#backend-2)
    - [Frontend](#frontend-2)
  - [Structure des dossiers](#structure-des-dossiers)
  - [Technologies utilisées](#technologies-utilisées)
  - [Contribuer](#contribuer)
  - [Licence](#licence)

---

## Présentation

Sosec Truck Admin Dashboard est une application web permettant de gérer efficacement une flotte de camions, les chauffeurs associés, les dépenses, tickets, kilométrages, documents et notifications.  
Elle propose une interface moderne (React + Vite) et une API sécurisée (Node.js + Express + TypeScript).

## Fonctionnalités

- Authentification sécurisée (JWT)
- Gestion des camions (CRUD)
- Gestion des chauffeurs (CRUD)
- Gestion des dépenses, tickets, kilométrage
- Notifications automatiques (ex : documents expirés)
- Visualisation et recherche avancée
- Seed et migration de la base de données
- Logs et monitoring

## Architecture du projet

- **frontend/** : Application React (Vite, TypeScript)
- **backend/** : API Node.js/Express (TypeScript)
- **migrations/** : Scripts de migration de la base de données
- **.env** : Fichiers de configuration d’environnement

## Installation

### Prérequis

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL (ou autre SGBD compatible)

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/Sosec_Truck_Admin_Dashboard.git
cd Sosec_Truck_Admin_Dashboard
```

### 2. Installer les dépendances

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Configurer les variables d’environnement

Créez les fichiers `.env` dans `backend/` et `frontend/` à partir des exemples `.env.example` si disponibles.

### 4. Lancer la base de données et effectuer les migrations

```bash
cd backend
npm run migrate
npm run seed
```

### 5. Démarrer les serveurs

#### Backend

```bash
npm run dev
```

#### Frontend

Dans un autre terminal :

```bash
cd frontend
npm run dev
```

L’application sera accessible sur [http://localhost:5173](http://localhost:5173).

---

## Scripts disponibles

### Backend

- `npm run dev` : Démarre le serveur en mode développement
- `npm run build` : Compile le projet TypeScript
- `npm run migrate` : Lance les migrations de la base de données
- `npm run seed` : Remplit la base avec des données de test

### Frontend

- `npm run dev` : Démarre le serveur de développement Vite
- `npm run build` : Build de production
- `npm run preview` : Prévisualisation du build

---

## Structure des dossiers

```
Sosec_Truck_Admin_Dashboard/
│
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── logs/
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env
│
├── README.md
└── ...
```

---

## Technologies utilisées

- **Frontend** : React, TypeScript, Vite, Axios, Material UI
- **Backend** : Node.js, Express, TypeScript, Sequelize/Prisma (ou autre ORM), JWT, Firebase (notifications)
- **Base de données** : PostgreSQL
- **Outils** : ESLint, Prettier, Nodemon, dotenv

---

## Contribuer

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos modifications (`git commit -am 'feat: nouvelle fonctionnalité'`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

## Licence

Ce projet est sous licence MIT.

---

**Contact** : [Votre email ou lien GitHub]