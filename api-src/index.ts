/**
 * =========================================================================
 * POINT D'ENTRÉE VERCEL — API (tRPC)
 * =========================================================================
 * Ce fichier remplace server/_core/index.ts UNIQUEMENT pour le déploiement
 * Vercel. Contrairement au serveur original qui écoute en continu sur un
 * port (app.listen), une fonction serverless Vercel s'exécute à la demande
 * pour chaque requête, sans "écouter" de port.
 *
 * server/_core/index.ts reste utilisé pour le développement local
 * (npm run dev) et n'a pas besoin d'être modifié.
 * =========================================================================
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
