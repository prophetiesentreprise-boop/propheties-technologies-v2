import type { ServiceExpertise } from "./serviceExpertises";

export type ServiceExpertiseDetail = {
  contextTitle: string;
  context: string;
  analysisTitle: string;
  analysisPoints: readonly string[];
  objectiveTitle: string;
  objectivePoints: readonly string[];
};

const expertiseDetails = {
  "reseaux-installations/cablage-informatique-televisuel": {
    contextTitle: "Un câblage qui prépare les usages d’aujourd’hui et de demain",
    context: "Le câblage doit rester fiable bien après la fin du chantier. Nous partons des usages réels — postes de travail, téléphonie, points Wi-Fi, écrans, caméras ou salles de réunion — pour organiser les liaisons et les locaux techniques sans créer de zones fragiles ou difficiles à retrouver.",
    analysisTitle: "Ce que nous cadrons avant la pose",
    analysisPoints: ["Les plans, cheminements, distances et contraintes du bâtiment", "La capacité des baies, prises, panneaux de brassage et liaisons à installer", "Le repérage, les tests et la documentation nécessaires pour exploiter le réseau sereinement"],
    objectiveTitle: "Ce que votre site gagne",
    objectivePoints: ["Des connexions testées, identifiées et plus simples à dépanner", "Une infrastructure propre pour accueillir les extensions futures", "Une documentation utile pour vos équipes et prestataires"],
  },
  "reseaux-installations/wifi-hotspots-portail-captif": {
    contextTitle: "Un Wi-Fi conçu pour les bonnes personnes, aux bons endroits",
    context: "Le réseau sans fil doit répondre à des usages différents : travail interne, salles de réunion, visiteurs, résidents ou clients. Nous étudions la couverture et les flux avant d’installer les bornes, puis séparons les accès afin que l’expérience des visiteurs ne mette pas en difficulté le réseau métier.",
    analysisTitle: "Les questions techniques que nous traitons",
    analysisPoints: ["Les zones à couvrir, les matériaux qui atténuent le signal et les zones de forte affluence", "La séparation des accès collaborateurs, invités, équipements et applications critiques", "Le parcours d’accueil du portail captif, les règles d’accès et la supervision de la qualité"],
    objectiveTitle: "Le résultat recherché",
    objectivePoints: ["Une connexion stable dans les espaces réellement utilisés", "Un accès invité professionnel, encadré et facile à comprendre", "Un réseau Wi-Fi administrable sans interrompre le travail des équipes"],
  },
  "reseaux-installations/telephonie-voip": {
    contextTitle: "Une téléphonie qui améliore vraiment l’accueil et la coordination",
    context: "La téléphonie classique et la VoIP doivent servir le parcours de l’appelant autant que les équipes qui répondent. Nous examinons les numéros existants, les horaires, les transferts, les postes concernés et la qualité du réseau pour définir un standard clair, évolutif et simple à prendre en main.",
    analysisTitle: "Le périmètre d’une installation VoIP bien pensée",
    analysisPoints: ["Les appels entrants, les files d’attente, les messages d’accueil et les règles de débordement", "Les postes fixes, mobiles ou logiciels adaptés aux habitudes de chaque équipe", "La qualité de service du réseau et la continuité des appels entre plusieurs sites ou collaborateurs"],
    objectiveTitle: "Ce que vous obtenez",
    objectivePoints: ["Un accueil téléphonique cohérent avec votre organisation", "Des transferts et des droits d’appel faciles à administrer", "Une solution documentée pour ajouter un poste ou ajuster un scénario"],
  },
  "reseaux-installations/controle-acces-rfid": {
    contextTitle: "Protéger les accès sans rendre les déplacements compliqués",
    context: "Le contrôle d’accès répond à une question simple : qui peut entrer dans quelle zone, à quel moment et avec quel niveau de trace ? Nous organisons les profils, les badges et les règles pour protéger les espaces sensibles tout en respectant le rythme de vos équipes, visiteurs et prestataires.",
    analysisTitle: "Les règles que nous définissons avec vous",
    analysisPoints: ["Les zones à protéger, les horaires et les profils autorisés", "Le choix des lecteurs, badges RFID, portes et équipements compatibles avec le site", "Les procédures d’attribution, de retrait et de suivi des droits d’accès"],
    objectiveTitle: "Un dispositif concret et exploitable",
    objectivePoints: ["Des accès cohérents avec les rôles et les horaires", "Une meilleure traçabilité des passages dans les zones réservées", "Une administration simple lorsqu’un collaborateur arrive ou quitte l’organisation"],
  },
  "cybersecurite/gouvernance-conformite-ssi": {
    contextTitle: "Donner un cadre lisible à la sécurité du système d’information",
    context: "La gouvernance SSI ne consiste pas à empiler des règles. Elle permet à la direction, aux responsables métiers et aux équipes techniques de savoir qui décide, qui applique et comment les sujets de sécurité sont suivis. Nous construisons un cadre proportionné à votre activité et à vos responsabilités.",
    analysisTitle: "Les fondations que nous organisons",
    analysisPoints: ["Les rôles de décision, de contrôle et de gestion des incidents", "Les règles prioritaires sur les accès, les données, les prestataires et les équipements", "Les indicateurs et rendez-vous de suivi adaptés à votre niveau de maturité"],
    objectiveTitle: "Une sécurité mieux pilotée",
    objectivePoints: ["Des responsabilités explicites et partagées", "Des priorités compréhensibles par la direction comme par les équipes", "Une feuille de route SSI réaliste, revue dans le temps"],
  },
  "cybersecurite/cartographie-risques": {
    contextTitle: "Voir les risques importants avant qu’ils ne deviennent des incidents",
    context: "La cartographie des risques relie vos services essentiels, vos données, vos dépendances et les scénarios qui pourraient perturber l’activité. Elle sert à choisir où agir en premier, sans perdre de temps sur des mesures qui ne répondent pas à vos enjeux les plus critiques.",
    analysisTitle: "Notre lecture du risque",
    analysisPoints: ["Les processus, données et applications qui soutiennent réellement votre activité", "Les scénarios plausibles : indisponibilité, fuite, erreur humaine, fraude ou accès non autorisé", "Les protections existantes, les écarts et la priorité des actions de réduction"],
    objectiveTitle: "Une base solide pour décider",
    objectivePoints: ["Une vision partagée des risques à traiter en premier", "Des mesures proportionnées à leur impact et à leur faisabilité", "Un support clair pour arbitrer les investissements de sécurité"],
  },
  "cybersecurite/pca-pra-resilience": {
    contextTitle: "Préparer la continuité avant l’urgence",
    context: "Un PCA ou un PRA doit permettre à l’organisation de reprendre ses activités essentielles, pas seulement de restaurer un serveur. Nous identifions les priorités métier, les dépendances, les sauvegardes et les rôles de chacun afin que la reprise soit connue, testée et améliorable.",
    analysisTitle: "Les scénarios que nous préparons",
    analysisPoints: ["Les services à remettre en route en priorité et les délais acceptables", "Les sauvegardes, ressources alternatives et dépendances nécessaires à la reprise", "Les rôles, communications et étapes de décision lors d’un incident majeur"],
    objectiveTitle: "Une reprise plus maîtrisée",
    objectivePoints: ["Des scénarios compréhensibles et adaptés aux activités critiques", "Des priorités définies avant qu’une panne ne désorganise l’équipe", "Des exercices qui révèlent les points à améliorer"],
  },
  "cybersecurite/sensibilisation-equipes": {
    contextTitle: "Faire de la vigilance un réflexe, pas une contrainte",
    context: "Les incidents commencent souvent par une situation ordinaire : un e-mail pressant, un document partagé, un mot de passe ou une demande inhabituelle. Nos sessions s’appuient sur vos usages pour donner aux équipes des réflexes simples, précis et immédiatement applicables.",
    analysisTitle: "Les situations que nous travaillons",
    analysisPoints: ["Les e-mails suspects, liens, pièces jointes et demandes d’urgence", "Les mots de passe, accès partagés, appareils mobiles et travail à distance", "Les bons réflexes de signalement lorsque quelque chose paraît anormal"],
    objectiveTitle: "Des équipes plus sûres d’elles",
    objectivePoints: ["Des gestes adaptés au quotidien, sans discours anxiogène", "Des supports courts à conserver après l’atelier", "Une capacité renforcée à réagir calmement et à alerter au bon moment"],
  },
  "maintenance-support/support-utilisateurs": {
    contextTitle: "Un support qui rend les incidents visibles et les réponses compréhensibles",
    context: "Les utilisateurs ont besoin d’un interlocuteur qui comprend l’urgence de leur travail. Nous organisons la réception, la qualification et le suivi des demandes afin que les problèmes soient résolus, expliqués et exploités pour prévenir les incidents qui reviennent.",
    analysisTitle: "Notre manière de traiter une demande",
    analysisPoints: ["Le niveau d’urgence, la personne concernée et le service impacté", "Les vérifications nécessaires avant une résolution ou une escalade", "Le suivi des incidents récurrents et les actions préventives associées"],
    objectiveTitle: "Un quotidien plus fluide",
    objectivePoints: ["Des demandes suivies et priorisées avec transparence", "Des utilisateurs accompagnés, sans jargon inutile", "Des incidents récurrents transformés en pistes d’amélioration"],
  },
  "maintenance-support/maintenance-preventive": {
    contextTitle: "Réduire les pannes avant qu’elles ne freinent l’activité",
    context: "La maintenance préventive crée un rythme de contrôle pour les équipements, mises à jour, sauvegardes et alertes qui comptent le plus. Nous ne faisons pas des vérifications pour cocher une case : nous ciblons les fragilités susceptibles d’interrompre vos opérations.",
    analysisTitle: "Les contrôles mis en place",
    analysisPoints: ["L’état des postes, réseaux, systèmes et équipements essentiels", "La réussite des sauvegardes, mises à jour et alertes de sécurité", "Les signaux de vieillissement ou de saturation qui exigent une action"],
    objectiveTitle: "Une exploitation plus sereine",
    objectivePoints: ["Moins d’incidents évitables dans le quotidien", "Des actions préventives tracées et faciles à suivre", "Des décisions de renouvellement mieux anticipées"],
  },
  "maintenance-support/diagnostic-remediation": {
    contextTitle: "Trouver la cause d’un incident pour éviter qu’il revienne",
    context: "Un dépannage rapide est utile, mais une remédiation durable demande de comprendre la source du problème. Nous croisons les symptômes, les journaux, les configurations et les usages afin d’isoler la cause probable, corriger la situation et vérifier le retour à la normale.",
    analysisTitle: "Notre démarche de diagnostic",
    analysisPoints: ["Les symptômes observés, leur fréquence et les utilisateurs ou services touchés", "Les causes possibles côté poste, réseau, logiciel, accès ou configuration", "Les tests de correction et les mesures de prévention pertinentes"],
    objectiveTitle: "Une réponse durable",
    objectivePoints: ["Une cause expliquée sans détour", "Une remise en service vérifiée avec les personnes concernées", "Des recommandations concrètes pour réduire le risque de réapparition"],
  },
  "maintenance-support/suivi-equipements": {
    contextTitle: "Faire de votre parc informatique un actif réellement piloté",
    context: "Sans inventaire fiable, il est difficile de savoir ce qui est protégé, ce qui coûte, ce qui approche de sa fin de vie ou ce qui manque à une équipe. Nous construisons un suivi utile à vos décisions, sans produire une liste technique impossible à maintenir.",
    analysisTitle: "Les informations que nous structurons",
    analysisPoints: ["Les équipements, logiciels, responsables et usages significatifs", "L’âge, l’état, les garanties et les dépendances des éléments sensibles", "Les actions à prévoir : mise à jour, réparation, remplacement ou sécurisation"],
    objectiveTitle: "Une vision plus claire du parc",
    objectivePoints: ["Un inventaire exploitable au quotidien", "Des priorités de renouvellement visibles", "Une meilleure continuité lorsque les équipes ou prestataires changent"],
  },
  "technologie-ia/sites-applications-metier": {
    contextTitle: "Créer un outil digital qui sert un parcours précis",
    context: "Un site ou une application métier doit simplifier une action concrète : informer, demander un devis, gérer une opération, suivre un dossier ou partager une information. Nous partons des utilisateurs et des étapes métier avant de choisir l’interface et les technologies.",
    analysisTitle: "Le projet que nous cadrons ensemble",
    analysisPoints: ["Les utilisateurs, leurs attentes et les parcours à rendre plus simples", "Les données, règles métier, interfaces et niveaux d’accès nécessaires", "Les priorités de lancement et les évolutions à prévoir après la première version"],
    objectiveTitle: "Une solution adaptée à l’usage",
    objectivePoints: ["Une expérience claire pour les équipes comme pour les clients", "Un périmètre de départ réaliste et mesurable", "Une base technique conçue pour évoluer sans tout reconstruire"],
  },
  "technologie-ia/automatisation-processus": {
    contextTitle: "Automatiser ce qui répète, sans perdre le contrôle métier",
    context: "L’automatisation est utile lorsqu’elle enlève des saisies, relances ou vérifications répétitives tout en gardant les bonnes validations humaines. Nous cartographions le processus réel, pas seulement la version théorique, puis concevons un flux lisible et contrôlable.",
    analysisTitle: "Les étapes que nous simplifions",
    analysisPoints: ["Les tâches répétitives, ressaisies, délais d’attente et sources d’erreur", "Les déclencheurs, données et validations indispensables à chaque étape", "Les exceptions qui doivent rester traitées par une personne"],
    objectiveTitle: "Un processus plus efficace",
    objectivePoints: ["Moins de temps perdu sur des opérations manuelles", "Des règles de traitement claires et documentées", "Une visibilité meilleure sur l’avancement et les exceptions"],
  },
  "technologie-ia/integration-intelligence-artificielle": {
    contextTitle: "Employer l’IA là où elle crée une valeur mesurable",
    context: "L’IA est pertinente lorsqu’elle assiste une tâche identifiable : trier, rechercher, résumer, préparer une réponse ou extraire une information. Nous définissons le cas d’usage, les données autorisées, les points de contrôle humain et les critères qui permettent de juger la qualité du résultat.",
    analysisTitle: "Les garde-fous du cas d’usage",
    analysisPoints: ["La tâche exacte à accélérer et la personne qui garde la décision finale", "Les données utilisables, sensibles ou à exclure du processus", "Les tests de qualité, les erreurs possibles et la manière de les corriger"],
    objectiveTitle: "Une IA utile et maîtrisée",
    objectivePoints: ["Un usage concret, compréhensible par les équipes", "Des validations adaptées au niveau de risque", "Une adoption progressive fondée sur des résultats observables"],
  },
  "technologie-ia/architecture-systeme": {
    contextTitle: "Relier vos outils dans une architecture qui reste compréhensible",
    context: "Quand les logiciels, données et équipements se multiplient, les liens implicites deviennent une source de fragilité. Nous clarifions les rôles de chaque composant, les flux de données, les dépendances et les règles d’évolution pour concevoir une architecture réaliste.",
    analysisTitle: "Les éléments que nous mettons à plat",
    analysisPoints: ["Les outils existants, leurs utilisateurs et les données qu’ils échangent", "Les points de dépendance, de sécurité, de performance et de continuité", "L’architecture cible et les étapes nécessaires pour y parvenir"],
    objectiveTitle: "Un système plus cohérent",
    objectivePoints: ["Des choix techniques expliqués et traçables", "Des intégrations qui évitent les doubles saisies inutiles", "Une trajectoire d’évolution qui respecte les contraintes de l’organisation"],
  },
  "formation-it/bureautique-outils-collaboratifs": {
    contextTitle: "Faire gagner du temps avec les outils déjà présents dans l’équipe",
    context: "La productivité ne dépend pas seulement d’un nouvel outil. Elle vient souvent de meilleures habitudes de classement, partage, réunion, coédition et suivi des documents. Nos formations utilisent des cas proches de votre quotidien afin que les acquis soient appliqués dès le retour au poste.",
    analysisTitle: "Les usages que nous travaillons",
    analysisPoints: ["L’organisation des fichiers, droits de partage et recherche d’information", "Les documents, tableaux, présentations et réunions collaboratives", "Les raccourcis et méthodes qui évitent les manipulations répétitives"],
    objectiveTitle: "Des équipes plus autonomes",
    objectivePoints: ["Des méthodes communes pour gagner du temps", "Des fiches pratiques adaptées à vos outils", "Une collaboration plus fluide entre services"],
  },
  "formation-it/bonnes-pratiques-securite": {
    contextTitle: "Transformer les règles de sécurité en gestes simples",
    context: "Les bonnes pratiques de sécurité doivent fonctionner dans une journée réelle : au bureau, en déplacement, depuis un téléphone ou à distance. Nous les relions aux situations rencontrées par vos équipes pour qu’elles deviennent des réflexes plutôt qu’une liste de contraintes abstraites.",
    analysisTitle: "Les réflexes essentiels abordés",
    analysisPoints: ["La gestion des mots de passe, accès et appareils personnels ou professionnels", "La reconnaissance des e-mails, liens et demandes à vérifier", "Le partage de documents, le travail à distance et le signalement d’un doute"],
    objectiveTitle: "Une hygiène numérique applicable",
    objectivePoints: ["Des règles faciles à expliquer entre collègues", "Des situations à risque mieux reconnues", "Des supports de rappel utiles après la formation"],
  },
  "formation-it/prise-en-main-solutions": {
    contextTitle: "Accompagner l’adoption d’un nouvel outil dès les premiers usages",
    context: "Une solution n’apporte sa valeur que lorsqu’elle est adoptée dans les tâches quotidiennes. Nous préparons une prise en main qui tient compte des profils, du niveau initial et des parcours les plus fréquents pour que chacun puisse devenir opérationnel sans dépendre continuellement du support.",
    analysisTitle: "La préparation de la prise en main",
    analysisPoints: ["Les rôles utilisateurs et les actions qu’ils doivent maîtriser en priorité", "Les parcours de démonstration, exercices et données de mise en situation", "Les supports de référence et le relais interne à prévoir après le déploiement"],
    objectiveTitle: "Une adoption plus rapide",
    objectivePoints: ["Des utilisateurs préparés aux tâches essentielles", "Des guides centrés sur les gestes réellement attendus", "Moins de blocages lors du démarrage de la solution"],
  },
  "formation-it/ateliers-equipes": {
    contextTitle: "Concevoir une formation à partir de vos réalités terrain",
    context: "Un atelier est plus utile lorsqu’il respecte les rôles, les outils et les difficultés propres à une équipe. Nous préparons le contenu avec les responsables, sélectionnons des exemples parlants et réservons du temps aux cas concrets apportés par les participants.",
    analysisTitle: "Le format que nous adaptons",
    analysisPoints: ["Le niveau de départ, les rôles et le nombre de participants", "Les situations, documents ou outils utilisés par l’équipe", "Le rythme, les exercices et les supports nécessaires après l’atelier"],
    objectiveTitle: "Une formation directement transposable",
    objectivePoints: ["Des exercices qui parlent aux participants", "Des questions traitées à partir de situations réelles", "Un bilan clair avec des pistes de progression"],
  },
  "solutions-sur-mesure/audit-technique": {
    contextTitle: "Obtenir une lecture fiable avant de décider",
    context: "Un audit technique doit éclairer les décisions, pas produire un rapport difficile à exploiter. Nous observons l’infrastructure, les usages, les incidents et les dépendances pour distinguer ce qui fonctionne, ce qui fragilise l’activité et ce qui mérite une action prioritaire.",
    analysisTitle: "Ce que couvre l’état des lieux",
    analysisPoints: ["Les équipements, logiciels, réseaux, accès et pratiques d’exploitation", "Les risques, faiblesses, coûts cachés et points de dépendance", "Les recommandations classées selon l’urgence, l’impact et la faisabilité"],
    objectiveTitle: "Un diagnostic orienté décision",
    objectivePoints: ["Une vision structurée de l’existant", "Des priorités expliquées plutôt qu’une liste de souhaits", "Une base solide pour lancer un projet ou préparer un budget"],
  },
  "solutions-sur-mesure/cadrage-projet": {
    contextTitle: "Transformer une intention en projet pilotable",
    context: "Avant un achat ou un déploiement, les objectifs, responsabilités et limites du projet doivent être clairs. Nous aidons les parties prenantes à mettre la même définition derrière le besoin, à arbitrer les priorités et à préparer une trajectoire que chacun peut suivre.",
    analysisTitle: "Les décisions que nous aidons à prendre",
    analysisPoints: ["Les objectifs, utilisateurs, contraintes et critères de réussite", "Le périmètre initial, les options à différer et les dépendances à traiter", "Le calendrier, les rôles et les jalons nécessaires pour garder le projet maîtrisé"],
    objectiveTitle: "Un lancement mieux sécurisé",
    objectivePoints: ["Un périmètre partagé entre toutes les parties prenantes", "Des priorités réalistes et documentées", "Une feuille de route utilisable pour consulter, décider et déployer"],
  },
  "solutions-sur-mesure/deploiement-documente": {
    contextTitle: "Mettre en service sans perdre la maîtrise du changement",
    context: "Un déploiement engage des équipements, des utilisateurs, des paramètres et parfois plusieurs prestataires. Nous préparons les séquences, les validations et la remise de documentation afin que la mise en service soit contrôlée et que l’exploitation puisse prendre le relais.",
    analysisTitle: "Les étapes que nous sécurisons",
    analysisPoints: ["Le planning d’intervention, les prérequis et la coordination des parties prenantes", "L’installation, les paramétrages, les migrations éventuelles et les tests", "Le passage de relais, les consignes d’exploitation et les points de suivi"],
    objectiveTitle: "Une mise en service maîtrisée",
    objectivePoints: ["Des étapes visibles et validées au bon moment", "Des tests qui confirment le fonctionnement attendu", "Un dossier de déploiement utile après le départ des intervenants"],
  },
  "solutions-sur-mesure/veille-amelioration-continue": {
    contextTitle: "Faire évoluer l’environnement IT sans courir après chaque nouveauté",
    context: "L’amélioration continue consiste à écouter les retours d’usage, suivre les incidents et sélectionner les évolutions qui servent réellement l’activité. Nous vous aidons à transformer ces informations en décisions périodiques, priorisées et adaptées à vos ressources.",
    analysisTitle: "Les signaux que nous suivons",
    analysisPoints: ["Les retours des équipes, incidents récurrents et irritants opérationnels", "Les évolutions technologiques ou réglementaires pertinentes pour votre contexte", "Les actions d’amélioration, leur coût, leur impact et leur ordre de mise en œuvre"],
    objectiveTitle: "Une trajectoire qui reste utile",
    objectivePoints: ["Des évolutions choisies avec discernement", "Une feuille de route vivante, mise à jour à partir du terrain", "Un environnement IT qui reste aligné sur les priorités de l’organisation"],
  },
} as const satisfies Record<string, ServiceExpertiseDetail>;

export function getServiceExpertiseDetail(expertise: ServiceExpertise): ServiceExpertiseDetail {
  const key = `${expertise.serviceSlug}/${expertise.slug}`;
  const detail = expertiseDetails[key as keyof typeof expertiseDetails];
  if (!detail) throw new Error(`Contenu détaillé introuvable pour ${key}`);
  return detail;
}

export const serviceExpertiseDetailContentDefaults = Object.fromEntries(
  Object.entries(expertiseDetails).flatMap(([compoundKey, detail]) => {
    const [serviceSlug, expertiseSlug] = compoundKey.split("/");
    const key = `expertise.${serviceSlug}.${expertiseSlug}`;
    const group = `Sous-expertise · ${expertiseSlug.replaceAll("-", " ")} · Page approfondie`;
    return [
      [`${key}.contextTitle`, { group, label: "Titre du contexte approfondi", value: detail.contextTitle }],
      [`${key}.context`, { group, label: "Contexte approfondi", value: detail.context }],
      [`${key}.analysisTitle`, { group, label: "Titre de l’analyse", value: detail.analysisTitle }],
      ...detail.analysisPoints.map((value, index) => [`${key}.analysis.${index + 1}`, { group, label: `Point d’analyse ${index + 1}`, value }]),
      [`${key}.objectiveTitle`, { group, label: "Titre des résultats", value: detail.objectiveTitle }],
      ...detail.objectivePoints.map((value, index) => [`${key}.objective.${index + 1}`, { group, label: `Résultat attendu ${index + 1}`, value }]),
    ];
  }),
) as Record<string, { group: string; label: string; value: string }>;
