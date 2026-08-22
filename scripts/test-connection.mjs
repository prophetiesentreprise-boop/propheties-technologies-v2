import "dotenv/config";
import postgres from "postgres";

console.log("Test de connexion à la base de données...\n");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL est vide ou absent du fichier .env");
  process.exit(1);
}

// Affiche l'URL en masquant le mot de passe, pour vérifier qu'elle est bien lue
const masked = url.replace(/:([^:@]+)@/, ":****@");
console.log("URL utilisée :", masked);
console.log("");

const sql = postgres(url, { connect_timeout: 10 });

try {
  const result = await sql`select current_database(), current_user, now()`;
  console.log("✅ Connexion réussie !");
  console.log(result[0]);
} catch (err) {
  console.error("❌ Échec de connexion :");
  console.error(err);
} finally {
  await sql.end({ timeout: 1 });
  process.exit(0);
}