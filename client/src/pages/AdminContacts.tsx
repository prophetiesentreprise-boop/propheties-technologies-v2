import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Mail, MessageSquareText, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statuses = ["new", "in_progress", "responded", "closed"] as const;
type InquiryStatus = typeof statuses[number];
type Draft = { status: InquiryStatus; adminNote: string; replyDraft: string };

const statusLabels: Record<InquiryStatus, string> = { new: "Nouveau", in_progress: "En cours de traitement", responded: "Répondu", closed: "Clos" };

export default function AdminContacts() {
  const { user, loading, isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const inquiries = trpc.contact.listAdmin.useQuery(undefined, { enabled: isAdmin });
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const update = trpc.contact.updateAdmin.useMutation({
    onSuccess: () => { utils.contact.listAdmin.invalidate(); utils.dashboard.overview.invalidate(); toast.success("Demande mise à jour."); },
    onError: () => toast.error("Impossible d’enregistrer cette demande."),
  });
  const items = inquiries.data ?? [];

  return <DashboardLayout>{loading ? null : !isAdmin ? <AccessDenied /> : <div className="mx-auto max-w-6xl py-4">
    <section className="rounded-[2rem] bg-[linear-gradient(135deg,#10124B_0%,#1B2E8F_57%,#0AA7D5_170%)] p-7 text-white shadow-[0_22px_48px_-30px_rgba(15,31,93,.62)] sm:p-9"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-cyan-200">Relation client · demandes</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.065em]">Traitez chaque demande avec méthode.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Centralisez le suivi, vos notes internes et la réponse à envoyer au prospect. L’envoi ouvre votre messagerie configurée avec le texte préparé.</p><div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100"><MessageSquareText size={15} /> {items.length} demande{items.length > 1 ? "s" : ""} enregistrée{items.length > 1 ? "s" : ""}</div></section>
    <section className="mt-7 grid gap-5">{inquiries.isLoading ? <p className="text-sm text-slate-500">Chargement des demandes…</p> : items.length ? items.map((inquiry) => {
      const draft = drafts[inquiry.id] ?? { status: inquiry.status, adminNote: inquiry.adminNote ?? "", replyDraft: inquiry.replyDraft ?? "" };
      const setDraft = (change: Partial<Draft>) => setDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, ...change } }));
      const subject = `Suite à votre demande — Propheties Technologies`;
      const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft.replyDraft)}`;
      return <article key={inquiry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl font-bold tracking-[-.05em] text-[#111B42]">{inquiry.name}</h2><span className="rounded-full bg-[#EDF7FC] px-2.5 py-1 text-[10px] font-bold text-[#078FBE]">{statusLabels[draft.status]}</span></div><a href={`mailto:${inquiry.email}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#242C90] hover:underline"><Mail size={15} />{inquiry.email}</a><p className="mt-3 text-sm font-semibold text-[#111B42]">Besoin : <span className="font-normal text-slate-600">{inquiry.service}</span></p></div><p className="text-xs text-slate-400">Reçue le {new Date(inquiry.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</p></div><p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{inquiry.message}</p><div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="grid gap-2"><Label htmlFor={`status-${inquiry.id}`}>Statut de traitement</Label><select id={`status-${inquiry.id}`} value={draft.status} onChange={(event) => setDraft({ status: event.target.value as InquiryStatus })} className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><Label htmlFor={`note-${inquiry.id}`} className="mt-2">Note interne</Label><Textarea id={`note-${inquiry.id}`} value={draft.adminNote} onChange={(event) => setDraft({ adminNote: event.target.value })} placeholder="Actions prévues, rappel, informations utiles à l’équipe…" className="min-h-28" /></div><div className="grid gap-2"><Label htmlFor={`reply-${inquiry.id}`}>Réponse préparée</Label><Textarea id={`reply-${inquiry.id}`} value={draft.replyDraft} onChange={(event) => setDraft({ replyDraft: event.target.value })} placeholder="Bonjour, merci pour votre message…" className="min-h-[172px]" /><p className="text-xs leading-5 text-slate-500">Le bouton d’envoi ouvre votre logiciel e-mail avec ce message. Marquez ensuite la demande comme « Répondu » et enregistrez le suivi.</p></div></div><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => update.mutate({ id: inquiry.id, status: draft.status, adminNote: draft.adminNote || null, replyDraft: draft.replyDraft || null })} disabled={update.isPending} className="rounded-full bg-[#242C90] hover:bg-[#141b70]"><Save size={16} /> Enregistrer le suivi</Button><a href={mailto}><Button type="button" variant="outline" className="rounded-full" disabled={!draft.replyDraft.trim()}><Mail size={16} /> Répondre par e-mail</Button></a></div></article>;
    }) : <EmptyState />}</section>
  </div>}</DashboardLayout>;
}

function EmptyState() { return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><CheckCircle2 className="mx-auto text-[#078FBE]" size={30} /><h2 className="mt-4 font-display text-2xl font-bold text-[#111B42]">Aucune demande à traiter</h2><p className="mt-2 text-sm leading-6 text-slate-600">Les messages issus du formulaire Contact seront visibles ici, avec leur historique de traitement.</p></div>; }
function AccessDenied() { return <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#111B42]">Accès réservé</h1><p className="mt-3 text-sm leading-6 text-slate-600">La gestion des demandes est réservée aux administrateurs.</p></div>; }
