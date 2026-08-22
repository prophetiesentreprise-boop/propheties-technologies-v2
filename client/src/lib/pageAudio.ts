const pageAudioTitles: Record<string, string> = {
  "/": "la page d’accueil",
  "/services": "la page Services",
  "/tutoriels": "la page Tutoriels",
  "/a-propos": "la présentation de Propheties Technologies",
  "/contact": "la page Contact",
};

export function getPageAudioTitle(pathname: string) {
  if (pathname.startsWith("/services/")) return "la présentation de ce service";
  return pageAudioTitles[pathname] ?? "cette page";
}

export function getAudioUnavailableMessage() {
  return "La lecture vocale n’est pas disponible dans ce navigateur. Essayez depuis un navigateur récent sur téléphone ou ordinateur.";
}

export function getReadablePageText(value: string, maxLength = 3600) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const shortened = normalized.slice(0, maxLength);
  const sentenceEnd = Math.max(shortened.lastIndexOf(". "), shortened.lastIndexOf("! "), shortened.lastIndexOf("? "));
  return `${(sentenceEnd > maxLength * 0.6 ? shortened.slice(0, sentenceEnd + 1) : shortened).trim()} Fin de l’extrait.`;
}
