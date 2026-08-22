# Hébergement et accès au back office

## Hébergement actuel

Le site est actuellement publié sur l’hébergement managé **Manus**, en mode **Autoscale**. L’adresse publique fournie est :

```text
https://proptech-e9dxv8bc.manus.space
```

Le domaine souhaité `prophetiestechnologies.com` a été confirmé dans le contenu du site. Pour qu’il devienne l’adresse publique du site, il reste à le connecter dans **Paramètres → Domaines** et à appliquer les enregistrements DNS proposés chez le registraire du domaine.

## Back office owner

Le back office est protégé : connectez-vous d’abord avec le compte Manus propriétaire du projet. Vous pourrez ensuite accéder aux rubriques suivantes :

| Besoin | Adresse |
|---|---|
| Tutoriels et vidéos | `/admin` |
| Images et arrière-plans | `/admin/visuels` |
| Textes, titres et appels à l’action | `/admin/contenus` |

Par exemple, depuis le site en ligne, ouvrez `https://proptech-e9dxv8bc.manus.space/admin`. Un visiteur non propriétaire ne peut pas modifier ces contenus.

## Utilisation hors Manus

Le code est exécutable localement selon `LOCAL_SETUP.md`. Les espaces owner demandent toutefois une configuration OAuth, une base de données et des variables d’environnement propres à votre infrastructure. Les visuels servis depuis `/manus-storage/` devront également être transférés vers un stockage auquel votre nouvel hébergement donne accès.
