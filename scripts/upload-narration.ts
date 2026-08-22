/**
 * =========================================================================
 * ENVOI DE LA NARRATION AUDIO (déjà enregistrée) VERS SUPABASE
 * =========================================================================
 * Utilise ce script si tu as déjà des fichiers audio de narration prêts
 * (par exemple fournis par Manus) plutôt que d'en générer via ElevenLabs.
 *
 * Les 11 fichiers doivent se trouver dans le dossier narration-source/
 * à la racine du projet, avec exactement ces noms :
 *
 *   narration-accueil.wav
 *   narration-services.wav
 *   narration-tutoriels.wav
 *   narration-a-propos.wav
 *   narration-contact.wav
 *   narration-reseaux-installations.wav
 *   narration-cybersecurite.wav
 *   narration-maintenance-support.wav
 *   narration-technologie-ia.wav
 *   narration-formation.wav
 *   narration-solutions-sur-mesure.wav
 *
 * (ces 11 fichiers sont déjà inclus dans ce zip, prêts à l'emploi)
 *
 * PRÉREQUIS dans ton fichier .env :
 *   SUPABASE_URL=https://ton-projet.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=ta_cle_secrete
 *
 * UTILISATION :
 *   npx tsx scripts/upload-narration.ts
 * =========================================================================
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_FILE = path.resolve(__dirname, "../client/src/data/narrationScripts.ts");
const SOURCE_DIR = path.resolve(__dirname, "../narration-source");
const BUCKET = "site-audio";

const FILES = [
  "narration-accueil.wav",
  "narration-services.wav",
  "narration-tutoriels.wav",
  "narration-a-propos.wav",
  "narration-contact.wav",
  "narration-reseaux-installations.wav",
  "narration-cybersecurite.wav",
  "narration-maintenance-support.wav",
  "narration-technologie-ia.wav",
  "narration-formation.wav",
  "narration-solutions-sur-mesure.wav",
];

async function ensureBucket(supabase: ReturnType<typeof createClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some(b => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Impossible de créer le bucket "${BUCKET}" : ${error.message}`);
    console.log(`✓ Bucket "${BUCKET}" créé.`);
  }
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("\n❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env\n");
    process.exit(1);
  }

  const missing = FILES.filter(f => !existsSync(path.join(SOURCE_DIR, f)));
  if (missing.length > 0) {
    console.error(`\n❌ Fichiers manquants dans narration-source/ :\n  - ${missing.join("\n  - ")}\n`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  await ensureBucket(supabase);

  let fileContent = readFileSync(SCRIPTS_FILE, "utf-8");
  const entryRegex = /"([^"]+)":\s*\{\s*label:\s*"([^"]+)",\s*audioUrl:\s*"([^"]+)"/g;
  const entries: { key: string; label: string; oldUrl: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(fileContent)) !== null) {
    entries.push({ key: match[1], label: match[2], oldUrl: match[3] });
  }

  console.log(`\nEnvoi de ${entries.length} fichiers audio vers Supabase...\n`);

  for (const entry of entries) {
    const segments = entry.key.split("/").filter(Boolean);
    const fileName = `narration-${segments.pop() || "accueil"}.wav`;
    const filePath = path.join(SOURCE_DIR, fileName);
    process.stdout.write(`  → ${entry.label} (${fileName})... `);

    try {
      const audioBuffer = readFileSync(filePath);
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, audioBuffer, {
        contentType: "audio/wav",
        upsert: true,
      });
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      fileContent = fileContent.replace(entry.oldUrl, publicUrlData.publicUrl);
      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`    Erreur :`, err instanceof Error ? err.message : err);
    }
  }

  writeFileSync(SCRIPTS_FILE, fileContent, "utf-8");
  console.log(`\n✅ Terminé ! narrationScripts.ts mis à jour avec les adresses Supabase.\n`);
  console.log("N'oublie pas de commiter et redéployer (git add, commit, push) pour publier.\n");
}

main().catch(error => {
  console.error("\n❌ Erreur :", error);
  process.exit(1);
});
