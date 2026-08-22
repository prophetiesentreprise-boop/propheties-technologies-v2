export const narrationVoiceProfile = {
  voice: "Algieba",
  languageCode: "fr-FR",
  direction:
    "Speak in French with a natural, warm and professional adult male voice. Use a calm, confident conversational pace, with clear diction and subtle pauses. Sound like a trusted technology advisor speaking directly to a business owner.",
} as const;

export const narrationScripts = {
  "/": {
    label: "Accueil",
    audioUrl: "/manus-storage/narration-accueil_2b319306.wav",
    text: "Bienvenue chez Propheties Technologies. Depuis Abidjan, nous concevons, installons et protégeons les environnements numériques des entreprises, hôtels, institutions et administrations. Notre méthode est simple : comprendre votre besoin, concevoir une réponse claire, puis vous accompagner durablement. Réseaux, cybersécurité, maintenance, intelligence artificielle et formation : parlons de la solution la plus utile pour votre activité.",
  },
  "/services": {
    label: "Services",
    audioUrl: "/manus-storage/narration-services_788f7f99.wav",
    text: "Découvrez les expertises de Propheties Technologies. Nous intervenons sur les réseaux et installations, la cybersécurité, la maintenance et le support, les technologies et l’intelligence artificielle, la formation, ainsi que les solutions informatiques sur mesure. Choisissez une expertise pour comprendre notre méthode, les interventions possibles et les résultats recherchés.",
  },
  "/tutoriels": {
    label: "Tutoriels",
    audioUrl: "/manus-storage/narration-tutoriels_ebaa061f.wav",
    text: "Bienvenue dans nos ressources pratiques. Vous trouverez ici des conseils simples pour mieux utiliser vos outils numériques, protéger vos données et gagner en autonomie au quotidien. Chaque tutoriel est conçu pour être clair, utile et accessible, même sans connaissances techniques particulières.",
  },
  "/a-propos": {
    label: "À propos",
    audioUrl: "/manus-storage/narration-a-propos_af21c09c.wav",
    text: "Propheties Technologies est une équipe ivoirienne basée à Abidjan, guidée par une exigence internationale. Nous croyons qu’une technologie n’a de valeur que lorsqu’elle reste fiable, utile et facile à adopter. Notre rôle est de transformer vos besoins numériques en solutions concrètes, adaptées à vos équipes et à vos objectifs.",
  },
  "/contact": {
    label: "Contact",
    audioUrl: "/manus-storage/narration-contact_df328506.wav",
    text: "Parlons de votre projet. Expliquez-nous ce que vous souhaitez rendre plus fiable, plus simple ou mieux protégé. Notre équipe vous répondra pour comprendre votre contexte, cadrer les prochaines étapes et préparer une solution adaptée à votre activité à Abidjan ou partout en Côte d’Ivoire.",
  },
  "/services/reseaux-installations": {
    label: "Réseaux et installations",
    audioUrl: "/manus-storage/narration-reseaux-installations_b7a7f107.wav",
    text: "Réseaux et installations. Nous concevons des fondations connectées, stables et sécurisées pour vos équipes et vos visiteurs. Après analyse de vos usages et de vos espaces, nous dimensionnons, installons, testons et documentons une infrastructure évolutive : câblage, Wi-Fi, téléphonie, contrôle d’accès et solutions d’accueil.",
  },
  "/services/cybersecurite": {
    label: "Cybersécurité",
    audioUrl: "/manus-storage/narration-cybersecurite_c9a02560.wav",
    text: "Cybersécurité. Nous protégeons vos données, vos accès et la continuité de votre activité sans compliquer le travail de vos équipes. Notre approche identifie les risques prioritaires, met en place des protections adaptées, puis aide vos collaborateurs à adopter des gestes simples face aux situations courantes.",
  },
  "/services/maintenance-support": {
    label: "Maintenance et support",
    audioUrl: "/manus-storage/narration-maintenance-support_de6b3f07.wav",
    text: "Maintenance et support. Nous vous accompagnons au quotidien pour prévenir les interruptions et garder votre système d’information opérationnel. La maintenance s’organise autour d’un suivi de proximité, d’actions préventives et d’un support réactif, afin que vos équipes consacrent leur temps à leur activité plutôt qu’aux incidents informatiques.",
  },
  "/services/technologie-ia": {
    label: "Technologie et intelligence artificielle",
    audioUrl: "/manus-storage/narration-technologie-ia_acccffd6.wav",
    text: "Technologie et intelligence artificielle. Nous vous aidons à choisir et déployer les outils qui améliorent réellement vos processus. L’objectif est concret : automatiser ce qui peut l’être, mieux exploiter l’information et faire évoluer vos usages sans ajouter de complexité inutile à vos équipes.",
  },
  "/services/formation": {
    label: "Formation",
    audioUrl: "/manus-storage/narration-formation_cd1ff49e.wav",
    text: "Formation. Un outil ne produit sa valeur que lorsqu’il est bien compris. Nous construisons des sessions accessibles et adaptées à vos usages afin que vos équipes gagnent en autonomie, appliquent de bonnes pratiques de sécurité et utilisent leurs solutions numériques avec confiance.",
  },
  "/services/solutions-sur-mesure": {
    label: "Solutions sur mesure",
    audioUrl: "/manus-storage/narration-solutions-sur-mesure_da8d37b7.wav",
    text: "Solutions sur mesure. Votre besoin ne correspond pas toujours à une offre standard. Nous partons de votre contexte, de vos contraintes et de vos ambitions pour concevoir une réponse cohérente, évolutive et adaptée à vos équipes. Échangeons pour identifier le bon point de départ.",
  },
} as const;

export type NarrationPath = keyof typeof narrationScripts;

export function getNarrationScript(pathname: string) {
  return narrationScripts[pathname as NarrationPath] ?? narrationScripts["/"];
}
