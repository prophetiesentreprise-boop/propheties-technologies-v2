/**
 * =========================================================================
 * GÉNÉRATION DE LA NARRATION AUDIO — Voix humaine via ElevenLabs
 * =========================================================================
 * Remplace les 11 fichiers audio manquants par de vrais enregistrements
 * générés avec une voix IA très proche d'une voix humaine réelle (bien
 * au-dessus de la qualité "robotique" des voix de synthèse classiques).
 *
 * CE DONT TU AS BESOIN AVANT DE LANCER CE SCRIPT :
 *
 *   1. Un compte sur elevenlabs.io (un plan gratuit existe, avec un quota
 *      de caractères limité par mois ; largement suffisant pour ces 11
 *      textes qui totalisent environ 2400 caractères).
 *
 *   2. Une clé API : elevenlabs.io > Profil > API Keys > Create.
 *
 *   3. Une voix d'homme française : elevenlabs.io > Voice Library, filtre
 *      Language = French, Gender = Male. Écoute les échantillons, choisis
 *      celle qui te plaît (voix chaleureuse, professionnelle, naturelle —
 *      c'est exactement le ton déjà défini dans narrationScripts.ts).
 *      Clique "Add to my voices", puis copie son "Voice ID" (visible dans
 *      Voice Library ou dans My Voices).
 *
 *   4. Dans le fichier .env à la racine du projet (le même que pour
 *      DATABASE_URL), ajoute ces 4 lignes :
 *
 *        ELEVENLABS_API_KEY=ta_cle_ici
 *        ELEVENLABS_VOICE_ID=l_id_de_la_voix_choisie
 *        SUPABASE_URL=https://ntcvnxqunikhbizipowi.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=ta_cle_secrete_service_role
 *
 * UTILISATION :
 *
 *   npx tsx scripts/generate-narration.ts
 *
 * Le script va :
 *   - Générer les 11 fichiers audio (un appel par page)
 *   - Les héberger sur Supabase Storage (bucket "site-audio", créé
 *     automatiquement s'il n'existe pas)
 *   - Mettre à jour automatiquement narrationScripts.ts avec les nouvelles
 *     adresses audio — tu n'as rien à modifier à la main
 * =========================================================================
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_FILE = path.resolve(__dirname, "../client/src/data/narrationScripts.ts");
const BUCKET = "site-audio";

async function ensureBucket(supabase: ReturnType<typeof createClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some(b => b.name === BUCKET)) {
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
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
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

  const fileContent = readFileSync(SCRIPTS_FILE, "utf-8");

  // Extraction simple des entrées { chemin, label, texte } depuis le fichier source.
  const entryRegex = /"([^"]+)":\s*\{\s*label:\s*"([^"]+)",\s*audioUrl:\s*"([^"]+)",\s*text:\s*"([^"]+)"/g;
  const entries: { key: string; label: string; oldUrl: string; text: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(fileContent)) !== null) {
    entries.push({ key: match[1], label: match[2], oldUrl: match[3], text: match[4] });
  }

  if (entries.length === 0) {
    console.error("\n❌ Aucune entrée de narration trouvée dans narrationScripts.ts. Le format du fichier a peut-être changé.\n");
    process.exit(1);
  }

  console.log(`\n${entries.length} scripts trouvés. Génération en cours...\n`);

  let updatedContent = fileContent;

  for (const entry of entries) {
    process.stdout.write(`  → ${entry.label}... `);
    try {
      const audioBuffer = await generateAudio(apiKey, voiceId, entry.text);
      const fileName = `narration-${entry.key.replace(/^\//, "").replace(/\//g, "-") || "accueil"}.mp3`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      updatedContent = updatedContent.replace(entry.oldUrl, publicUrlData.publicUrl);

      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`    Erreur pour "${entry.label}" :`, err instanceof Error ? err.message : err);
    }
  }

  writeFileSync(SCRIPTS_FILE, updatedContent, "utf-8");
  console.log(`\n✅ Terminé ! narrationScripts.ts mis à jour avec les nouvelles adresses audio.\n`);
  console.log("N'oublie pas de commiter et redéployer (git add, commit, push) pour que le site public utilise la nouvelle narration.\n");
}

main().catch(error => {
  console.error("\n❌ Erreur :", error);
  process.exit(1);
});
