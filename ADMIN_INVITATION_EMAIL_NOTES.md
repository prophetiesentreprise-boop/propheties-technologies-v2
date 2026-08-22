# Envoi des invitations administrateur

Le système utilise l’API transactionnelle de Resend lorsque les variables `RESEND_API_KEY` et `RESEND_FROM_EMAIL` sont renseignées. L’appel prévu est un `POST` vers `https://api.resend.com/emails`, authentifié par l’en-tête `Authorization: Bearer …`, avec les champs `from`, `to`, `subject`, `html` et `text`. Une clé d’idempotence est également envoyée afin d’éviter des invitations dupliquées.

Le message contient un lien d’activation de 72 heures, puis une adresse personnelle de connexion. Cette dernière inclut un secret aléatoire, vérifié côté serveur et associé au compte invité ; l’écran de connexion ne s’affiche donc pas lorsqu’une personne tape simplement une adresse `/admin` ou `/admin/connexion`.

Référence officielle : [Resend — Send Email](https://resend.com/docs/api-reference/emails/send-email).

## Vérifications locales

- Les routes `/admin` et `/admin/connexion` reçoivent l’en-tête `X-Robots-Tag: noindex, nofollow, noarchive`.
- Le dashboard ne s’affiche qu’avec une session disposant du rôle administrateur ou propriétaire.
- L’écran de connexion local nécessite en plus le secret individuel inclus dans l’e-mail envoyé après activation ; une adresse de connexion saisie sans ce secret n’affiche aucun formulaire.
- La vérification visuelle locale confirme qu’une visite de `/admin/connexion` sans secret reste vide et qu’un secret non reconnu conduit à une page 404 générique, sans révéler de formulaire d’administration.
- Les réponses `auth.me` et la liste d’invitations excluent les hash de mots de passe et les hash de jetons.
