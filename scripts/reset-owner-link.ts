/**
 * =========================================================================
 * RÉGÉNÉRER TON LIEN D'ACCÈS ADMIN — si tu as perdu l'ancien
 * =========================================================================
 * Ne recrée PAS ton compte (garde le même mot de passe) — génère
 * simplement un nouveau lien de connexion valide.
 *
 * UTILISATION :
 *   npx tsx scripts/reset-owner-link.ts "ton-email@exemple.com"
 * =========================================================================
 */
import "dotenv/config";
import { createInvitationToken, hashInvitationToken, normalizeAdminEmail } from "../server/adminCredentials";
import { getDb } from "../server/db";
import { adminInvitations, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const [, , rawEmail] = process.argv;
  if (!rawEmail) {
    console.error("\nUsage : npx tsx scripts/reset-owner-link.ts \"email@exemple.com\"\n");
    process.exit(1);
  }

  const email = normalizeAdminEmail(rawEmail);
  const db = await getDb();
  if (!db) {
    console.error("\nImpossible de se connecter à la base de données. Vérifie DATABASE_URL.\n");
    process.exit(1);
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length === 0) {
    console.error(`\nAucun compte trouvé avec l'email ${email}.\n`);
    process.exit(1);
  }

  const token = createInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);

  await db.insert(adminInvitations).values({
    email,
    name: existingUser[0].name,
    tokenHash,
    invitedBy: null,
    expiresAt,
    status: "accepted",
    acceptedAt: new Date(),
  }).onConflictDoUpdate({
    target: adminInvitations.email,
    set: { tokenHash, expiresAt, status: "accepted", acceptedAt: new Date(), updatedAt: new Date() },
  });

  console.log("\n✅ Nouveau lien généré !\n");
  console.log(`   https://www.prophetiestechnologies.com/admin/connexion?entry=${token}\n`);
  console.log(`Identifiants : ${email} / ton mot de passe habituel (inchangé).\n`);

  process.exit(0);
}

main().catch(error => {
  console.error("\n❌ Erreur :", error);
  process.exit(1);
});
