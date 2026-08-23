/**
 * =========================================================================
 * CRÉATION DU COMPTE PROPRIÉTAIRE (OWNER) — À exécuter UNE SEULE FOIS
 * =========================================================================
 * Ce script crée ton compte administrateur principal directement dans la
 * base de données Supabase, sans passer par Manus. Il te donnera ensuite
 * un lien d'accès à coller dans ton navigateur pour te connecter.
 *
 * UTILISATION :
 *   1. Assure-toi que la variable DATABASE_URL est configurée (fichier .env
 *      en local, ou variable d'environnement Vercel).
 *   2. Lance dans le terminal, à la racine du projet :
 *
 *        npx tsx scripts/create-owner.ts "ton-email@exemple.com" "UnMotDePasseTresSolide123!" "Ton nom"
 *
 *   3. Le script affiche une URL du type :
 *        https://tondomaine.com/admin/login?entry=abcdef123...
 *      Ouvre-la, connecte-toi avec ton email + mot de passe. Enregistre
 *      cette URL précieusement (garde-la secrète) : c'est ta porte d'entrée
 *      vers le back-office.
 * =========================================================================
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashAdminPassword, createInvitationToken, hashInvitationToken, normalizeAdminEmail } from "../server/adminCredentials";
import { getDb } from "../server/db";
import { users, adminInvitations } from "../drizzle/schema";

async function main() {
  const [, , rawEmail, password, name] = process.argv;

  if (!rawEmail || !password) {
    console.error("\nUsage : npx tsx scripts/create-owner.ts \"email@exemple.com\" \"MotDePasse\" \"Nom (optionnel)\"\n");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("\nLe mot de passe doit comporter au moins 12 caractères.\n");
    process.exit(1);
  }

  const email = normalizeAdminEmail(rawEmail);
  const db = await getDb();
  if (!db) {
    console.error("\nImpossible de se connecter à la base de données. Vérifie DATABASE_URL.\n");
    process.exit(1);
  }

  const passwordHash = await hashAdminPassword(password);
  const openId = `local_owner_${randomUUID()}`;

  await db.insert(users).values({
    openId,
    name: name || "Propriétaire",
    email,
    loginMethod: "local",
    passwordHash,
    role: "owner",
    lastSignedIn: new Date(),
  });

  const token = createInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // ~100 ans : ce lien ne doit pas expirer

  await db.insert(adminInvitations).values({
    email,
    name: name || "Propriétaire",
    tokenHash,
    invitedBy: null,
    expiresAt,
    status: "accepted",
    acceptedAt: new Date(),
  });

  console.log("\n✅ Compte propriétaire créé avec succès !\n");
  console.log("Ton lien d'accès personnel (à garder secret, ajoute-le à tes favoris) :\n");
  console.log(`   https://TON-DOMAINE/admin/connexion?entry=${token}\n`);
  console.log("Remplace TON-DOMAINE par ton vrai domaine une fois déployé (ex: prophetiestechnologies.com).");
  console.log(`Identifiants de connexion : ${email} / le mot de passe que tu as fourni.\n`);

  process.exit(0);
}

main().catch(error => {
  console.error("\n❌ Erreur lors de la création du compte :", error);
  process.exit(1);
});
