export const narrationVoiceProfile = {
  voice: "Algieba",
  languageCode: "fr-FR",
  direction:
    "Speak in French with a natural, warm and professional adult male voice. Use a calm, confident conversational pace, with clear diction and subtle pauses. Sound like a trusted technology advisor speaking directly to a business owner.",
} as const;

export const narrationScripts = {
  "/": {
    label: "Accueil",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-accueil.wav",
    text: "Bienvenue chez Propheties Technologies. Depuis Abidjan, nous concevons, installons et protégeons les environnements numériques des entreprises, hôtels, institutions et administrations. Notre méthode est simple : comprendre votre besoin, concevoir une réponse claire, puis vous accompagner durablement. Réseaux, cybersécurité, maintenance, intelligence artificielle et formation : parlons de la solution la plus utile pour votre activité.",
  },
  "/services": {
    label: "Services",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-services.wav",
    text: "Découvrez les expertises de Propheties Technologies. Nous intervenons sur les réseaux et installations, la cybersécurité, la maintenance et le support, les technologies et l’intelligence artificielle, la formation, ainsi que les solutions informatiques sur mesure. Choisissez une expertise pour comprendre notre méthode, les interventions possibles et les résultats recherchés.",
  },
  "/tutoriels": {
    label: "Tutoriels",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-tutoriels.wav",
    text: "Bienvenue dans nos ressources pratiques. Vous trouverez ici des conseils simples pour mieux utiliser vos outils numériques, protéger vos données et gagner en autonomie au quotidien. Chaque tutoriel est conçu pour être clair, utile et accessible, même sans connaissances techniques particulières.",
  },
  "/a-propos": {
    label: "À propos",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-a-propos.wav",
    text: "Propheties Technologies est une équipe ivoirienne basée à Abidjan, guidée par une exigence internationale. Nous croyons qu’une technologie n’a de valeur que lorsqu’elle reste fiable, utile et facile à adopter. Notre rôle est de transformer vos besoins numériques en solutions concrètes, adaptées à vos équipes et à vos objectifs.",
  },
  "/contact": {
    label: "Contact",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-contact.wav",
    text: "Parlons de votre projet. Expliquez-nous ce que vous souhaitez rendre plus fiable, plus simple ou mieux protégé. Notre équipe vous répondra pour comprendre votre contexte, cadrer les prochaines étapes et préparer une solution adaptée à votre activité à Abidjan ou partout en Côte d’Ivoire.",
  },
  "/services/reseaux-installations": {
    label: "Réseaux et installations",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-reseaux-installations.wav",
    text: "Réseaux et installations. Nous concevons des fondations connectées, stables et sécurisées pour vos équipes et vos visiteurs. Après analyse de vos usages et de vos espaces, nous dimensionnons, installons, testons et documentons une infrastructure évolutive : câblage, Wi-Fi, téléphonie, contrôle d’accès et solutions d’accueil.",
  },
  "/services/cybersecurite": {
    label: "Cybersécurité",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-cybersecurite.wav",
    text: "Cybersécurité. Nous protégeons vos données, vos accès et la continuité de votre activité sans compliquer le travail de vos équipes. Notre approche identifie les risques prioritaires, met en place des protections adaptées, puis aide vos collaborateurs à adopter des gestes simples face aux situations courantes.",
  },
  "/services/maintenance-support": {
    label: "Maintenance et support",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-maintenance-support.wav",
    text: "Maintenance et support. Nous vous accompagnons au quotidien pour prévenir les interruptions et garder votre système d’information opérationnel. La maintenance s’organise autour d’un suivi de proximité, d’actions préventives et d’un support réactif, afin que vos équipes consacrent leur temps à leur activité plutôt qu’aux incidents informatiques.",
  },
  "/services/technologie-ia": {
    label: "Technologie et intelligence artificielle",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-technologie-ia.wav",
    text: "Technologie et intelligence artificielle. Nous vous aidons à choisir et déployer les outils qui améliorent réellement vos processus. L’objectif est concret : automatiser ce qui peut l’être, mieux exploiter l’information et faire évoluer vos usages sans ajouter de complexité inutile à vos équipes.",
  },
  "/services/formation": {
    label: "Formation",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-formation.wav",
    text: "Formation. Un outil ne produit sa valeur que lorsqu’il est bien compris. Nous construisons des sessions accessibles et adaptées à vos usages afin que vos équipes gagnent en autonomie, appliquent de bonnes pratiques de sécurité et utilisent leurs solutions numériques avec confiance.",
  },
  "/services/solutions-sur-mesure": {
    label: "Solutions sur mesure",
    audioUrl: "https://ntcvnxqunikhbizipowi.supabase.co/storage/v1/object/public/site-audio/narration-solutions-sur-mesure.wav",
    text: "Solutions sur mesure. Votre besoin ne correspond pas toujours à une offre standard. Nous partons de votre contexte, de vos contraintes et de vos ambitions pour concevoir une réponse cohérente, évolutive et adaptée à vos équipes. Échangeons pour identifier le bon point de départ.",
  },
} as const;

export type NarrationPath = keyof typeof narrationScripts;

export function getNarrationScript(pathname: string) {
  return narrationScripts[pathname as NarrationPath] ?? narrationScripts["/"];
}
