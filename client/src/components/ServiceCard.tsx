import { ArrowUpRight, Bot, Compass, GraduationCap, Network, ShieldCheck, Wrench } from "lucide-react";
import type { services } from "@/data/siteContent";
import { useSiteVisual } from "@/contexts/SiteVisualsContext";
import { useSiteContents } from "@/contexts/SiteContentContext";
import { Link } from "wouter";

const icons = { network: Network, shield: ShieldCheck, wrench: Wrench, bot: Bot, graduation: GraduationCap, compass: Compass };

export default function ServiceCard({ service, compact = false }: { service: (typeof services)[number]; compact?: boolean }) {
  const Icon = icons[service.icon];
  const serviceImage = useSiteVisual(service.visualSlot);
  const getContent = useSiteContents();
  const contentKey = `service.${service.slug}`;
  const label = getContent(`${contentKey}.label`);
  const title = getContent(`${contentKey}.title`);
  const description = getContent(`${contentKey}.description`);
  const features = service.features.map((_, index) => getContent(`${contentKey}.feature.${index + 1}`));
  const cardCta = getContent("services.card.cta");
  return (
    <Link href={`/services/${service.slug}`} className="block h-full rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/70">
    <article className="service-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_18px_36px_-30px_rgba(25,45,110,.38)]">
      <img src={serviceImage} alt="" className="site-image-bright absolute inset-0 -z-20 size-full object-cover opacity-28" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(150deg,rgba(255,255,255,.98),rgba(255,255,255,.86)_55%,rgba(237,247,252,.72))]" />
      <div className="relative h-36 overflow-hidden bg-[#111B42]"><img src={serviceImage} alt="" className="site-image-bright size-full object-cover opacity-100 transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,18,51,.26),rgba(11,18,51,.04))]" /><span className="absolute bottom-4 left-5 grid size-11 place-items-center rounded-2xl border border-white/30 bg-white/18 text-white backdrop-blur"><Icon size={21} strokeWidth={1.8} /></span></div>
      <div className="relative flex flex-1 flex-col p-6 sm:p-7"><div className="flex items-start justify-between gap-5"><span className="font-mono-brand text-[10px] uppercase tracking-[.16em] text-[#078FBE]">{label}</span><ArrowUpRight size={18} className="text-[#B92BC3] transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
      <h3 className="mt-7 font-display text-xl font-bold tracking-[-.045em] text-[#111B42]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      {!compact && <ul className="mt-6 grid gap-2 border-t border-slate-100 pt-5">{features.map((feature, index) => <li key={index} className="flex gap-2 text-[13px] leading-5 text-slate-600"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#08A3D6]" />{feature}</li>)}</ul>}
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#242C90] transition-colors group-hover:text-[#B92BC3]">{cardCta} <ArrowUpRight size={16} /></span></div>
    </article>
    </Link>
  );
}
