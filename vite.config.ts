import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// =============================================================================
// Configuration Vite — nettoyée des outils spécifiques à l'environnement de
// développement Manus (plugin JSX location, runtime Manus, collecteur de logs
// de débogage). Ces outils ne sont utiles que dans le bac à sable Manus et
// n'ont aucun rôle une fois le site déployé sur Vercel — l'un d'eux
// (@builder.io/vite-plugin-jsx-loc) entrait même en conflit avec la version
// de Vite installée et bloquait l'installation des dépendances.
// =============================================================================

const plugins = [react(), tailwindcss()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
  },
});
