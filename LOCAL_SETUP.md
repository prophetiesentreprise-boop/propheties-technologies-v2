# Lancer Propheties Technologies en local

## Prérequis

Installez **Node.js 22 LTS** et **pnpm 10**. Décompressez ensuite l’archive dans le dossier de votre choix, puis ouvrez un terminal dans le dossier `propheties-technologies`.

## Installation et démarrage

```bash
pnpm install
pnpm dev
```

Le site sera alors accessible sur `http://localhost:3000`.

## Vérifications et build de production

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

## Variables d’environnement nécessaires

Le fichier `.env` n’est volontairement pas inclus dans l’archive. Créez-le à la racine et renseignez vos propres valeurs pour :

```env
DATABASE_URL=
VITE_APP_ID=
JWT_SECRET=
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

Ces informations servent respectivement à la base de données, à l’authentification owner et aux services hébergés. Ne les publiez jamais dans un dépôt public.

## Points spécifiques hors hébergement Manus

Les images dont l’URL commence par `/manus-storage/` et le système d’authentification Manus sont configurés pour l’hébergement actuel. Pour un déploiement externe, remplacez les images par vos propres URL de stockage, configurez une base MySQL/TiDB, appliquez les migrations Drizzle et paramétrez un fournisseur d’authentification compatible.

## Back office

En environnement Manus, connectez-vous avec le compte propriétaire, puis ouvrez :

- `/admin` pour les tutoriels ;
- `/admin/visuels` pour les images ;
- `/admin/contenus` pour les textes.

En local, ces espaces demandent la configuration OAuth ci-dessus et un utilisateur autorisé comme owner.
