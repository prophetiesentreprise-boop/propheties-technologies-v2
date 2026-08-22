# Vérification du suivi de fréquentation

Dernière vérification : 15 août 2026.

La page publique d’accueil puis la page **Services** ont été consultées après le redémarrage du serveur. Les deux parcours ont rendu les contenus attendus sans affichage d’erreur côté interface. La table Drizzle associée au suivi est nommée `siteVisits` (camelCase), avec les colonnes `id`, `visitorId`, `path` et `createdAt`, ainsi que les index sur `createdAt` et `visitorId`.

La confusion initiale venait d’une requête vers `site_visits`, nom qui ne correspond pas au schéma réellement déployé. Les compteurs du tableau de bord s’appuient désormais sur `siteVisits` et peuvent être contrôlés par une visite publique suivie d’une requête SQL sur cette table.
