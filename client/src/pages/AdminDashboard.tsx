import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BarChart3, ClipboardCheck, FileText, LayoutDashboard, MessageSquareText, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";

const numberFormatter = new Intl.NumberFormat("fr-FR");

export default function AdminDashboard() {
  const { user, loading, isAdmin, isOwner } = useAuth();
  const overview = trpc.dashboard.overview.useQuery(undefined, { enabled: isAdmin });
  const data = overview.data;

  return <DashboardLayout>{loading ? null : !isAdmin ? <AccessDenied /> : <div className="mx-auto max-w-7xl py-4">
    <section className="rounded-[2rem] bg-[linear-gradient(135deg,#10124B_0%,#1B2E8F_58%,#0AA7D5_170%)] p-7 text-white shadow-[0_22px_48px_-30px_rgba(15,31,93,.62)] sm:p-9">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-cyan-200">Back office · pilotage</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.065em] sm:text-5xl">Votre activité en un regard.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Suivez les demandes reçues, les contenus publiés et l’organisation des accès du site depuis un espace unique.</p>
          <p className="mt-3 inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-cyan-100">Fréquentation affichée : aujourd’hui et 30 derniers jours</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100"><ShieldCheck size={15} /> {isOwner ? "Accès propriétaire actif" : "Accès administrateur actif"}</div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BarChart3} value={data?.visitorsToday ?? 0} label="visiteurs aujourd’hui" tone="cyan" />
        <Metric icon={BarChart3} value={data?.pageViewsToday ?? 0} label="pages vues aujourd’hui" tone="violet" />
        <Metric icon={BarChart3} value={data?.uniqueVisitorsLast30Days ?? 0} label="visiteurs sur 30 jours" tone="cyan" />
        <Metric icon={BarChart3} value={data?.pageViewsLast30Days ?? 0} label="pages vues sur 30 jours" tone="violet" />
        <Metric icon={MessageSquareText} value={data?.totalInquiries ?? 0} label="demandes reçues" tone="cyan" />
        <Metric icon={ClipboardCheck} value={data?.pendingInquiries ?? 0} label="à traiter" tone="violet" />
        <Metric icon={FileText} value={data?.totalTutorials ?? 0} label="tutoriels enregistrés" tone="cyan" />
        <Metric icon={UsersRound} value={data?.totalAdmins ?? 0} label="administrateurs" tone="violet" />
      </div>
    </section>

    <section className="mt-6 grid gap-3 md:grid-cols-3">
      <QuickLink href="/admin/demandes" eyebrow="Priorité" title="Traiter les demandes" description="Qualifier les besoins, conserver une note et préparer une réponse." icon={MessageSquareText} />
      <QuickLink href="/admin/tutoriels" eyebrow="Contenus" title="Gérer les tutoriels" description="Préparer, publier ou ajuster vos vidéos pédagogiques." icon={FileText} />
      <QuickLink href="/admin/administrateurs" eyebrow="Accès" title="Gérer l’équipe admin" description="Accorder ou retirer les accès aux comptes déjà connectés." icon={UsersRound} />
    </section>

    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-mono-brand text-[10px] uppercase tracking-[.16em] text-[#078FBE]">Demandes récentes</p><h2 className="mt-2 font-display text-2xl font-bold tracking-[-.05em] text-[#111B42]">Les derniers messages reçus</h2></div>
        <Link href="/admin/demandes"><Button variant="outline" className="w-fit rounded-full">Voir toutes les demandes <ArrowRight size={16} /></Button></Link>
      </div>
      {overview.isLoading ? <p className="mt-6 text-sm text-slate-500">Chargement des indicateurs…</p> : data?.recentInquiries.length ? <div className="mt-6 grid gap-3">{data.recentInquiries.map((inquiry) => <article key={inquiry.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-[#111B42]">{inquiry.name}</p><StatusBadge status={inquiry.status} /></div><p className="mt-1 text-sm text-slate-600">{inquiry.service} · {inquiry.email}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{inquiry.message}</p></div><p className="shrink-0 text-xs text-slate-400">{new Date(inquiry.createdAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</p></article>)}</div> : <EmptyState />}
    </section>
  </div>}</DashboardLayout>;
}

function Metric({ icon: Icon, value, label, tone }: { icon: typeof LayoutDashboard; value: number; label: string; tone: "cyan" | "violet" }) {
  const color = tone === "cyan" ? "text-cyan-200" : "text-fuchsia-200";
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><Icon size={18} className={color} /><p className="mt-5 font-display text-3xl font-bold">{numberFormatter.format(value)}</p><p className="mt-1 text-xs text-slate-200">{label}</p></div>;
}

function QuickLink({ href, eyebrow, title, description, icon: Icon }: { href: string; eyebrow: string; title: string; description: string; icon: typeof LayoutDashboard }) {
  return <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#242C90]/25"><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#EDF7FC] text-[#078FBE]"><Icon size={19} /></span><ArrowRight size={18} className="text-[#B92BC3] transition group-hover:translate-x-1" /></div><p className="mt-5 font-mono-brand text-[10px] uppercase tracking-[.14em] text-[#078FBE]">{eyebrow}</p><h2 className="mt-2 font-display text-xl font-bold text-[#111B42]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></Link>;
}

function StatusBadge({ status }: { status: "new" | "in_progress" | "responded" | "closed" }) {
  const config = { new: ["Nouveau", "bg-sky-50 text-sky-700"], in_progress: ["En cours", "bg-amber-50 text-amber-700"], responded: ["Répondu", "bg-emerald-50 text-emerald-700"], closed: ["Clos", "bg-slate-100 text-slate-600"] } as const;
  const [label, className] = config[status];
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${className}`}>{label}</span>;
}

function EmptyState() { return <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-6 text-slate-500">Aucune demande n’a encore été reçue. Les nouveaux messages envoyés depuis la page Contact apparaîtront ici.</div>; }
function AccessDenied() { return <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#111B42]">Accès réservé</h1><p className="mt-3 text-sm leading-6 text-slate-600">Ce tableau de bord est accessible uniquement aux administrateurs de Propheties Technologies.</p></div>; }
