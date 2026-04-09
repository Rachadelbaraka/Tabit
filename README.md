# Tabit

Tabit est une application web moderne de suivi d’habitudes avec journal quotidien, calendrier de progression, statistiques et mode hors ligne local. Le design vise un rendu SaaS premium, minimaliste et fluide, en français, sur mobile comme sur desktop.

## Fonctionnalités

- authentification par email et mot de passe
- tableau de bord avec complétion du jour, série actuelle et aperçu du journal
- page du jour pour cocher, ajouter, modifier, supprimer et réordonner les habitudes
- journal quotidien avec sauvegarde automatique locale
- sélection d’humeur
- calendrier mensuel avec progression visuelle et détail par jour
- statistiques sur 7 jours et 30 jours
- thème clair, sombre ou système
- export et import des données en JSON
- fallback local hors ligne avec resynchronisation du snapshot dès que le backend revient

## Stack

- Next.js 15 avec App Router
- TypeScript
- Prisma + SQLite pour la persistance backend
- stockage local navigateur pour la continuité hors ligne
- next-themes pour le thème
- lucide-react pour les icônes

## Structure

- app: pages, layout global et route handlers API
- components: shell, provider global, cartes et composants réutilisables
- lib: types, utilitaires, API client, auth, accès base et sérialisation du snapshot
- prisma: schéma SQLite

## Lancement local

1. Installer les dépendances:

```bash
npm install
```

2. Créer le fichier d’environnement:

```bash
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env
```

3. Générer Prisma puis créer la base:

```bash
npm run prisma:generate
npx prisma db push
```

4. Démarrer l’application:

```bash
npm run dev
```

## API

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/session
- POST /api/auth/logout
- GET /api/snapshot
- PUT /api/snapshot
- GET /api/export
- POST /api/import
- GET /api/stats

## Notes produit

Le frontend charge d’abord les données locales pour garantir une expérience immédiate. Si le backend répond, le snapshot utilisateur est récupéré puis synchronisé. En cas d’indisponibilité API, l’application continue à fonctionner avec les dernières données locales et conserve les modifications avant une resynchronisation ultérieure.