/**
 * =========================================================================
 * GÉNÉRATION COMPLÈTE DE LA NARRATION AUDIO — Voix humaine (ElevenLabs)
 * =========================================================================
 * Génère un vrai fichier audio pour LES 36 PAGES (les 11 pages
 * principales + les 25 pages de sous-expertises), avec la correction
 * phonétique nécessaire pour que "Propheties" se prononce "Prophéties"
 * (comme le mot français "prophéties") plutôt que d'être lu tel quel.
 *
 * PRÉREQUIS dans ton fichier .env :
 *   ELEVENLABS_API_KEY=...
 *   ELEVENLABS_VOICE_ID=...
 *   SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * UTILISATION :
 *   npx tsx scripts/generate-narration.ts
 *
 * Le script :
 *   - Génère l'audio des 11 pages principales (narrationScripts.ts)
 *   - Génère l'audio des 25 pages de sous-expertises (serviceExpertises.ts)
 *   - Héberge chaque fichier sur Supabase Storage (bucket "site-audio")
 *   - Met à jour narrationScripts.ts (11 pages) et
 *     expertiseNarrationAudio.ts (25 pages) automatiquement
 * =========================================================================
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { narrationScripts } from "../client/src/data/narrationScripts";
import { serviceExpertises } from "../client/src/data/serviceExpertises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NARRATION_SCRIPTS_FILE = path.resolve(__dirname, "../client/src/data/narrationScripts.ts");
const EXPERTISE_AUDIO_FILE = path.resolve(__dirname, "../client/src/data/expertiseNarrationAudio.ts");
const BUCKET = "site-audio";

// Correction phonétique : "Propheties" (orthographe de la marque) doit se
// prononcer comme "Prophéties" en français, pas être lu lettre à lettre.
// On ne change que le texte ENVOYÉ à la synthèse vocale — jamais le nom
// affiché sur le site.
function applyPhoneticFixes(text: string): string {
  return text.replace(/Propheties/g, "Prophéties");
}

async function ensureBucket(supabase: ReturnType<typeof createClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Impossible de créer le bucket "${BUCKET}" : ${error.message}`);
    console.log(`✓ Bucket "${BUCKET}" créé.`);
  }
}

async function generateAudio(apiKey: string, voiceId: string, text: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: applyPhoneticFixes(text),
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Erreur ElevenLabs (${res.status}) : ${errText}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !voiceId) {
    console.error("\n❌ ELEVENLABS_API_KEY et ELEVENLABS_VOICE_ID sont requis dans .env\n");
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseKey) {
    console.error("\n❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env\n");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  await ensureBucket(supabase);

  // ---- 1) Les 11 pages principales -------------------------------------
  const staticEntries = Object.entries(narrationScripts) as [string, { label: string; audioUrl: string; text: string }][];
  let narrationFileContent = readFileSync(NARRATION_SCRIPTS_FILE, "utf-8");

  console.log(`\n${staticEntries.length} pages principales à générer...\n`);
  for (const [key, entry] of staticEntries) {
    const fileName = `narration-${key.replace(/^\//, "").replace(/\//g, "-") || "accueil"}.mp3`;
    process.stdout.write(`  → ${entry.label}... `);
    try {
      const audioBuffer = await generateAudio(apiKey, voiceId, entry.text);
      const { error } = await supabase.storage.from(BUCKET).upload(fileName, audioBuffer, { contentType: "audio/mpeg", upsert: true });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      narrationFileContent = narrationFileContent.replace(entry.audioUrl, data.publicUrl);
      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`    Erreur :`, err instanceof Error ? err.message : err);
    }
  }
  writeFileSync(NARRATION_SCRIPTS_FILE, narrationFileContent, "utf-8");

  // ---- 2) Les 25 pages de sous-expertises -------------------------------
  console.log(`\n${serviceExpertises.length} pages de sous-expertises à générer...\n`);
  const expertiseAudioMap: Record<string, string> = {};

  for (const expertise of serviceExpertises) {
    const routePath = `/services/${expertise.serviceSlug}/${expertise.slug}`;
    const text = `${expertise.title}. ${expertise.summary} ${expertise.intro}`;
    const fileName = `narration-service-${expertise.serviceSlug}-${expertise.slug}.mp3`;
    process.stdout.write(`  → ${expertise.title}... `);
    try {
      const audioBuffer = await generateAudio(apiKey, voiceId, text);
      const { error } = await supabase.storage.from(BUCKET).upload(fileName, audioBuffer, { contentType: "audio/mpeg", upsert: true });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      expertiseAudioMap[routePath] = data.publicUrl;
      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`    Erreur :`, err instanceof Error ? err.message : err);
    }
  }

  const expertiseFileContent = `// Ce fichier est généré/mis à jour automatiquement par
// \`pnpm run generate-narration\` — ne le modifie pas à la main.
// Il associe chaque page de sous-expertise (/services/:service/:expertise)
// à l'adresse de son fichier audio (voix humaine ElevenLabs).
export const expertiseNarrationAudio: Record<string, string> = ${JSON.stringify(expertiseAudioMap, null, 2)};
`;
  writeFileSync(EXPERTISE_AUDIO_FILE, expertiseFileContent, "utf-8");

  console.log(`\n✅ Terminé ! ${staticEntries.length + Object.keys(expertiseAudioMap).length} fichiers audio générés et connectés.\n`);
  console.log("N'oublie pas de commiter et redéployer (git add, commit, push) pour publier.\n");
}

main().catch((error) => {
  console.error("\n❌ Erreur :", error);
  process.exit(1);
});
