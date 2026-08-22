# Vérification de l’accès audio des pages publiques

L’en-tête public comporte un bouton **Écouter** qui lance la narration associée à la page. Lorsqu’une lecture est active, les commandes de pause, reprise et arrêt deviennent disponibles. Les QR codes et les éléments de parcours associés ont été retirés.

## Narrations naturelles

Le bouton **Écouter** utilise désormais des enregistrements français naturels, avec une voix masculine, chaleureuse et professionnelle, au lieu de la synthèse vocale native. Onze fichiers audio couvrent les pages principales et les six services.

## Preuves automatisées

La suite de tests vérifie l’association d’une narration à chaque page, les libellés accessibles du contrôle, ainsi que les interactions de lecture, pause, reprise, arrêt et signalement d’erreur. Le contrôle TypeScript a été exécuté sans erreur et la suite contient **46 tests automatisés passants**. Ces tests valident le comportement applicatif mais ne se substituent pas à une écoute humaine du rendu sonore.

## Contrôles de disponibilité et de rendu

Après le redémarrage de l’environnement, les onze URLs du registre ont été interrogées en suivant les redirections du stockage. Elles ont toutes répondu avec le statut **HTTP 200**, le type **audio/wav** et une taille non nulle. Le bouton d’écoute a également été vérifié visuellement sur l’accueil en format ordinateur (**1280 × 720**) et mobile (**375 × 812**) : il est directement accessible dans l’en-tête sur les deux formats, sans QR code.

Le script navigateur `scripts/verify-audio-controls.mjs` contrôle désormais le chargement et les interactions du lecteur sur ordinateur (**1280 × 720**) et mobile (**375 × 812**). Dans les deux vues, la narration de l’accueil atteint l’état média `readyState: 3`, expose une durée valide de **31,24 secondes** et exécute successivement la lecture, la pause, la reprise et l’arrêt. Cette vérification complète les tests d’interface et le contrôle HTTP des onze fichiers.

Le propriétaire a confirmé que le rendu de la voix masculine naturelle lui convient. Une écoute manuelle complète sur chaque appareil cible reste recommandée si une validation exhaustive sur des modèles de téléphones spécifiques est souhaitée avant une campagne de communication.
