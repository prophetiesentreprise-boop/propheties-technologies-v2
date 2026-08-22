/**
 * =========================================================================
 * STOCKAGE — Supabase Storage (migré depuis le Forge Server de Manus)
 * =========================================================================
 * Utilise le bucket public "site-images" sur Supabase. Les URLs retournées
 * sont directement publiques et stables (pas besoin de proxy de redirection
 * comme avec /manus-storage/{key} auparavant).
 *
 * Variables d'environnement nécessaires (à définir sur Vercel, jamais dans
 * le code) :
 *   SUPABASE_URL               (ex: https://xxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY  (clé secrète, Project Settings > API > service_role)
 *     -> différente de la clé "anon" utilisée côté site public : celle-ci a
 *        le droit d'écrire dans le stockage, donc ne doit JAMAIS être
 *        exposée côté navigateur.
 * =========================================================================
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { ENV } from "./_core/env";

const BUCKET = "site-images";

function getSupabaseAdminClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error(
      "Stockage non configuré : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.",
    );
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseAdminClient();
  const key = appendHashSuffix(normalizeKey(relKey));

  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

  const { error } = await supabase.storage.from(BUCKET).upload(key, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Échec de l'envoi vers Supabase Storage : ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: publicUrlData.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseAdminClient();
  const key = normalizeKey(relKey);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

// Le bucket est public : les URLs de storageGet() sont déjà valables
// durablement, donc storageGetSignedUrl() n'est plus nécessaire. On la
// garde par compatibilité au cas où du code l'appellerait encore.
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const { url } = await storageGet(relKey);
  return url;
}
