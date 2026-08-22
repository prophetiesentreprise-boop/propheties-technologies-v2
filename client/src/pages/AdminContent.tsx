import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { contentDefaults, type ContentSlot } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FilePenLine, Globe2, Save, Type } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const contentEntries = Object.entries(contentDefaults) as [ContentSlot, (typeof contentDefaults)[ContentSlot]][];

export default function AdminContent() {
  const { user, loading, isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const [drafts, setDrafts] = useState<Partial<Record<ContentSlot, string>>>({});
  const content = trpc.content.list.useQuery(undefined, { enabled: isAdmin });
  const saved = useMemo(() => new Map((content.data ?? []).map((entry) => [entry.key, entry.value])), [content.data]);
  const update = trpc.content.update.useMutation({
    onSuccess: async () => { await utils.content.list.invalidate(); toast.success("Contenu enregistré."); },
    onError: () => toast.error("Impossible d’enregistrer ce contenu."),
  });
  const groups = Array.from(new Set(contentEntries.map(([, item]) => item.group)));
  const valueFor = (slot: ContentSlot, defaultValue: string) => drafts[slot] ?? saved.get(slot) ?? defaultValue;
  const save = (slot: ContentSlot, value: string) => update.mutate({ key: slot, value });

  return <DashboardLayout>{loading ? null : !isAdmin ? <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#111B42]">Accès réservé</h1><p className="mt-3 text-sm leading-6 text-slate-600">Cet espace est accessible uniquement au propriétaire du site.</p></div> : <div className="mx-auto max-w-6xl py-4"><section className="rounded-[2rem] bg-[linear-gradient(135deg,#10124B_0%,#1B2E8F_57%,#0AA7D5_170%)] p-7 text-white shadow-[0_22px_48px_-30px_rgba(15,31,93,.62)] sm:p-9"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-cyan-200">Back office · contenus</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.065em]">Modifiez les textes sans toucher au code.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">Chaque champ ci-dessous correspond à une zone visible du site : bannière, texte descriptif ou appel à l’action. Les modifications sont publiées dès l’enregistrement.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100"><CheckCircle2 size={15} /> Accès owner actif</span></div><div className="mt-7 grid gap-3 sm:grid-cols-3">{[[Type, contentEntries.length, "zones de texte éditables"], [Globe2, groups.length, "espaces du site"], [FilePenLine, content.data?.length ?? 0, "textes personnalisés"]].map(([Icon, value, label]) => { const IconComponent = Icon as typeof Type; return <div key={label as string} className="rounded-2xl border border-white/15 bg-white/10 p-4"><IconComponent size={18} className="text-cyan-200" /><p className="mt-5 font-display text-3xl font-bold">{value as number}</p><p className="mt-1 text-xs text-slate-200">{label as string}</p></div>})}</div></section><div className="mt-7 grid gap-6">{groups.map((group) => <section key={group} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#F7EDFD] text-[#B92BC3]"><FilePenLine size={19} /></span><div><p className="font-mono-brand text-[10px] uppercase tracking-[.14em] text-[#B92BC3]">Contenus éditables</p><h2 className="font-display text-2xl font-bold tracking-[-.05em] text-[#111B42]">{group}</h2></div></div><div className="mt-6 grid gap-5">{contentEntries.filter(([, item]) => item.group === group).map(([slot, item]) => { const value = valueFor(slot, item.value); const changed = value !== (saved.get(slot) ?? item.value); return <div key={slot} className="rounded-2xl border border-slate-200 bg-[#FBFCFF] p-5"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><p className="font-display text-base font-bold text-[#111B42]">{item.label}</p><p className="mt-1 font-mono-brand text-[10px] text-slate-400">{slot}</p></div>{saved.has(slot) && <span className="w-fit rounded-full bg-[#E7F9F1] px-2.5 py-1 text-[10px] font-bold text-[#087E59]">Personnalisé</span>}</div><Textarea value={value} onChange={(event) => setDrafts((current) => ({ ...current, [slot]: event.target.value }))} className="mt-4 min-h-24 bg-white" /><div className="mt-3 flex justify-end"><Button size="sm" onClick={() => save(slot, value)} disabled={!changed || update.isPending} className="rounded-full bg-[#242C90] hover:bg-[#141b70]"><Save size={15} /> Enregistrer</Button></div></div>})}</div></section>)}</div></div>}</DashboardLayout>;
}
