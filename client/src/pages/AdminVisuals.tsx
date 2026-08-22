import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { visualDefaults, visualSlotLabels, type VisualSlot } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ImagePlus, Images, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const visualSlots = Object.keys(visualDefaults) as VisualSlot[];

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture de fichier impossible"));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

export default function AdminVisuals() {
  const { user, loading, isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const [uploadingSlot, setUploadingSlot] = useState<VisualSlot | null>(null);
  const visuals = trpc.visuals.list.useQuery(undefined, { enabled: isAdmin });
  const upload = trpc.visuals.upload.useMutation({
    onSuccess: async () => {
      await utils.visuals.list.invalidate();
      toast.success("Image enregistrée et appliquée au site.");
    },
    onError: () => toast.error("L’image n’a pas pu être enregistrée. Vérifiez son format ou sa taille."),
    onSettled: () => setUploadingSlot(null),
  });

  const replaceVisual = async (slot: VisualSlot, file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choisissez une image JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L’image doit peser 5 Mo maximum.");
      return;
    }
    setUploadingSlot(slot);
    try {
      upload.mutate({ slot, contentType: file.type as "image/jpeg" | "image/png" | "image/webp", dataBase64: await toBase64(file) });
    } catch {
      setUploadingSlot(null);
      toast.error("Impossible de préparer ce fichier.");
    }
  };

  const overrides = new Map((visuals.data ?? []).map((visual) => [visual.slot as VisualSlot, visual.imageUrl]));
  return <DashboardLayout>{loading ? null : !isAdmin ? <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#111B42]">Accès réservé</h1><p className="mt-3 text-sm leading-6 text-slate-600">Cet espace est accessible uniquement au propriétaire de Propheties Technologies.</p></div> : <div className="mx-auto max-w-6xl py-4"><section className="rounded-[2rem] bg-[linear-gradient(135deg,#11124C,#2836A1_58%,#E836BE_175%)] p-7 text-white shadow-[0_22px_48px_-30px_rgba(15,31,93,.62)] sm:p-9"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-fuchsia-100">Back office · identité visuelle</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.065em]">Vos images, votre univers.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100">Remplacez en toute autonomie les images clés du site. Chaque changement est enregistré et affiché immédiatement sur les pages publiques.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white"><CheckCircle2 size={15} /> Accès owner actif</span></div><div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-slate-100"><Images size={20} className="shrink-0 text-fuchsia-100" /><span>Formats acceptés : JPG, PNG ou WebP · 5 Mo maximum · privilégiez les images larges pour les bannières.</span></div></section><section className="mt-8"><div className="flex items-end justify-between gap-4"><div><p className="font-mono-brand text-[11px] uppercase tracking-[.18em] text-[#B92BC3]">Réglages visuels</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.06em] text-[#111B42]">Images de bannières et services</h2></div><span className="rounded-full bg-[#F7EDFD] px-3 py-2 font-mono-brand text-[10px] font-bold text-[#B92BC3]">{visualSlots.length} emplacements</span></div><div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visualSlots.map((slot) => { const meta = visualSlotLabels[slot]; const image = overrides.get(slot) ?? visualDefaults[slot]; const isCustom = overrides.has(slot); const loadingUpload = uploadingSlot === slot; return <article key={slot} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_35px_-30px_rgba(20,45,110,.48)]"><div className="relative h-40 bg-[#111B42]"><img src={image} alt="" className="size-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,13,48,.55),transparent_65%)]" /><span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 font-mono-brand text-[9px] font-bold ${isCustom ? "bg-fuchsia-100 text-[#A21CAF]" : "bg-white/90 text-[#2A368F]"}`}>{isCustom ? "Image personnalisée" : "Image actuelle"}</span></div><div className="p-5"><h3 className="font-display text-lg font-bold tracking-[-.04em] text-[#111B42]">{meta.label}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">{meta.description}</p><label className="mt-5 block"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => replaceVisual(slot, event.target.files?.[0])} className="sr-only" disabled={Boolean(uploadingSlot)} /><Button type="button" variant="outline" className="w-full rounded-full border-[#242C90]/20 text-[#242C90] hover:bg-[#F4F4FF]" disabled={Boolean(uploadingSlot)} asChild><span>{loadingUpload ? <><Loader2 size={15} className="animate-spin" /> Envoi en cours…</> : <><ImagePlus size={15} /> Remplacer l’image</>}</span></Button></label></div></article>; })}</div></section><section className="mt-8 rounded-3xl border border-[#DCE9F7] bg-[#F2F8FD] p-6"><div className="flex gap-3"><Upload className="mt-0.5 shrink-0 text-[#078FBE]" size={20}/><p className="text-sm leading-6 text-[#34455F]"><strong className="text-[#111B42]">Conseil de cadrage :</strong> utilisez des images horizontales d’au moins 1600 px de large pour les bannières ; pour les cartes de services, choisissez des images avec un sujet identifiable et une zone plus sombre qui facilite la lecture des textes.</p></div></section></div>}</DashboardLayout>;
}
