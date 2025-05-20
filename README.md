# Saraya Tech Portal

## Table of Contents

- [Saraya Tech Portal](#saraya-tech-portal)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
    - [Objectives](#objectives)
    - [Success Metrics](#success-metrics)
  - [Features](#features)
    - [Administrators](#administrators)
    - [Drivers](#drivers)
    - [Integration](#integration)
  - [Architecture](#architecture)
    - [Backend Architecture](#backend-architecture)
    - [Frontend Architecture](#frontend-architecture)
    - [Integration with SOSEC Mobile App](#integration-with-sosec-mobile-app)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [VSCode Configuration](#vscode-configuration)
  - [Usage](#usage)
    - [Running the Application](#running-the-application)
    - [API Endpoints](#api-endpoints)
      - [Authentication](#authentication)
      - [Financials](#financials)
      - [Documents](#documents)
      - [Notifications](#notifications)
      - [Reports](#reports)
      - [Users](#users)
      - [Synchronization](#synchronization)
    - [Frontend Navigation](#frontend-navigation)
  - [Testing](#testing)
    - [Backend Tests](#backend-tests)
    - [Frontend Tests](#frontend-tests)
  - [Security](#security)
  - [Performance](#performance)
  - [Contributing](#contributing)
    - [Guidelines](#guidelines)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)
  - [Contact](#contact)

---

## Project Overview

The **Saraya Tech Portal** is a web-based application developed for Saraya Tech Solutions to streamline financial tracking, document management, user administration, and real-time notifications. It complements the **SOSEC mobile app** used by drivers to scan tickets, log expenses, and track truck maintenance. Administrators can manage all backend operations, while drivers have restricted, read-only access to view their relevant information.

### Objectives

* **Financial Tracking:**

  * US1: Record revenues
  * US2: Record expenses
  * US3: Generate monthly statements
  * US4: Provide period-based summaries
* **Document Management:**

  * US5–US8: Add, associate, sort, download documents, with expiration tracking
* **Notifications:**

  * US9–US12: Generate/configure expiration notifications, read status, visual indicators
* **Reporting:**

  * US13–US15: Export reports, view expense history, analyze expenses by category
* **User Management:**

  * US16–US18: Manage roles, secure authentication, and password reset
* **Mobile Integration:**

  * Sync receipts and tickets from SOSEC via Firebase

### Success Metrics

* **Performance:** <2s page loads; expiration check for 1000 docs in <30s (TR1, 9.1)
* **Engagement:** 90% of documents with expiration dates; 80% of notifications read in 2 days
* **Business Value:** 50% reduction in expired docs; 30% time saved on financial reporting

---

## Features

### Administrators

* Full access to finances, documents, notifications, and users
* Configure and receive expiration alerts
* Export reports in PDF/Excel

### Drivers

* Read-only access to authorized documents and summaries
* Filtered notification view

### Integration

* Real-time sync with SOSEC mobile app (tickets, fuel, expenses)
* Notifications via Firebase Cloud Messaging (FCM)

---

## Architecture

### Backend Architecture

Built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL** using **Sequelize** ORM. Integration with Firebase is handled via Firebase Admin SDK.

```
backend/
├── src/
│   ├── config/         # DB and Firebase configs
│   ├── controllers/    # Route handlers
│   ├── models/         # Sequelize models
│   ├── routes/         # API routing
│   ├── services/       # Business logic
│   ├── middleware/     # JWT, CSRF
│   ├── cron/           # Expiration tasks
│   ├── utils/          # Helper functions
│   ├── __tests__/      # Unit & integration tests
│   └── index.ts        # Entry point
├── .env
├── tsconfig.json
├── jest.config.js
```

**Key Modules:**

* PostgreSQL: Tables for Utilisateur, Revenu, Dépense, Document, etc.
* REST API: Endpoints for core services
* Cron: Daily expiration job
* Security: JWT, CSRF, bcrypt, AES-256

### Frontend Architecture

Built using **React**, **TypeScript**, **Vite**, and **Material-UI** with global state via React Context.

```
frontend/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── styles/
│   ├── assets/
│   ├── __tests__/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── vite.config.ts
```

**Key Modules:**

* Pages: Login, Dashboard, Financials, Documents, etc.
* Components: FinancialForm, DocumentList, ReportGenerator, etc.
* Styling: Material-UI theme

### Integration with SOSEC Mobile App

* **Firestore:** Stores mobile-submitted tickets, receipts
* **Sync:** Backend retrieves Firestore data into PostgreSQL
* **Notifications:** Sent via FCM
* **Security:** Firebase rules enforce user-level access

---

## Prerequisites

* Node.js v18+/20+
* PostgreSQL v14+
* Firebase CLI
* Git
* VSCode
* Chrome/Firefox/Edge

---

## Installation

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
DB_HOST=localhost
DB_USER=saraya_user
DB_PASSWORD=securepassword
DB_NAME=saraya_portal
DB_PORT=5432

FIREBASE_PROJECT_ID=your-firebase-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

JWT_SECRET=your-jwt-secret
```

PostgreSQL setup:

```sql
CREATE DATABASE saraya_portal;
CREATE USER saraya_user WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE saraya_portal TO saraya_user;
```

Build & Run:

```bash
npm run build
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:3000
```

Run:

```bash
npm run dev
```

### VSCode Configuration

Recommended extensions:

* ESLint
* Prettier
* TypeScript Next
* REST Client
* Vitest Explorer

`.vscode/settings.json`

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript", "typescript", "react"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

`.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "envFile": "${workspaceFolder}/backend/.env",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

`.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "npm",
      "script": "dev",
      "path": "backend/",
      "group": "build"
    },
    {
      "label": "Start Frontend",
      "type": "npm",
      "script": "dev",
      "path": "frontend/",
      "group": "build"
    },
    {
      "type": "typescript",
      "tsconfig": "backend/tsconfig.json",
      "problemMatcher": ["$tsc"],
      "group": { "kind": "build", "isDefault": true },
      "label": "tsc: build - tsconfig.json"
    }
  ]
}
```

---

## Usage

### Running the Application

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

* Backend: [http://localhost:3000](http://localhost:3000)
* Frontend: [http://localhost:5173](http://localhost:5173)

### API Endpoints

#### Authentication

* `POST /auth/login`
* `POST /auth/reset-password`

#### Financials

* `POST /revenus`
* `POST /depenses`
* `GET /financials/statements`
* `GET /financials/summary`

#### Documents

* `POST /documents`
* `POST /documents/associate`
* `GET /documents?sort=expiration`
* `GET /documents/:id/download`

#### Notifications

* `GET /notifications`
* `POST /notifications/config`
* `PATCH /notifications/:id/read`

#### Reports

* `GET /reports/export`
* `GET /reports/client/:id`
* `GET /reports/categories`

#### Users

* `POST /users`

#### Synchronization

* `POST /sync`

### Frontend Navigation

* **Login:** Authenticates user (admin/driver)
* **Dashboard:** Displays overview
* **Financials:** View/add income & expenses
* **Documents:** Manage uploads
* **Notifications:** View & mark alerts
* **Reports:** Export & filter reports
* **Users:** Admin-only user management

---

## Testing

### Backend Tests

* Unit: Financial calculations (TR2)
* Integration: Firebase sync validation
* Performance: 1000+ document checks (TR1)

```bash
cd backend
npm test
```

### Frontend Tests

* Unit: Component validation
* E2E (planned): Cypress

```bash
cd frontend
npm test
```

---

## Security

* AES-256 encryption (DS1)
* bcrypt password hashing (12 rounds) (DS2)
* CSRF protection tokens (DS3)
* JWT auth with role control
* Rate limiting
* Firebase rules: driver access restriction

---

## Performance

* Indexed DB fields for fast querying
* Optimized API (<2s)
* Scheduled expiration scan (<30s)
* Frontend: lazy-load & caching

---

## Contributing

1. Fork: `https://github.com/your-username/saraya-tech-portal`
2. Clone: `git clone https://github.com/your-username/saraya-tech-portal.git`
3. Branch: `git checkout -b feature/your-feature`
4. Commit: `git commit -m "feat: Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Pull request on `main`

### Guidelines

* Follow ESLint/Prettier
* Add relevant tests
* Update README if needed

---

## Troubleshooting

* **Backend doesn't start?**

  * Check `.env` and PostgreSQL connection
* **Frontend fails to connect?**

  * Verify `VITE_API_URL`
* **Firebase errors?**

  * Check credentials and rules
* **Tests fail?**

  * Run with `npm test -- --verbose`

---

## License

This project is licensed under the MIT License. See the `LICENSE` file.

---

## Contact

**Maintainer:** \[Ibrahima Sory Diallo]
**Email:** [ibrahima.diallo@saraya.tech](mailto:ibrahima.diallo@saraya.tech)
**GitHub:** [github.com/your-username/saraya-tech-portal](https://github.com/your-username/saraya-tech-portal)
**Issues:** [GitHub Issues](https://github.com/your-username/saraya-tech-portal/issues)

*Last updated: May 20, 2025*
# SOSEC_TRUCK_DASHBOARD_ADMIN
