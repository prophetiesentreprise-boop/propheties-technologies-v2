import { ArrowUpRight, Globe2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "wouter";
import { brandAssets, contactDetails, navItems } from "@/data/siteContent";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { useSiteVisual } from "@/contexts/SiteVisualsContext";

export default function SiteFooter() {
  const description = useSiteContent("footer.description");
  const footerBackground = useSiteVisual("footerBackground");
  return (
    <footer className="relative isolate overflow-hidden bg-[#0B1233] text-white">
      <img src={footerBackground} alt="" className="site-image-bright absolute inset-0 -z-20 size-full object-cover opacity-42" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(11,18,51,.96),rgba(11,18,51,.82),rgba(11,18,51,.68))]" />
      <div className="brand-grid absolute inset-0 -z-10 opacity-15" />
      <div className="container grid gap-12 py-14 md:grid-cols-[1.35fr_.75fr_1fr] md:gap-10">
        <div>
          <div className="flex h-[66px] w-[168px] items-center justify-center rounded-xl bg-white shadow-[0_12px_30px_-18px_rgba(0,0,0,.7)]"><img src={brandAssets.logo} alt="Propheties Technologies" className="size-full object-contain" /></div>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">{description}</p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 font-mono-brand text-xs text-cyan-300 transition-colors hover:text-white">Parlons de votre projet <ArrowUpRight size={15} /></Link>
        </div>
        <div>
          <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-cyan-300">Navigation</p>
          <nav className="mt-5 grid gap-3" aria-label="Navigation pied de page">{navItems.map((item) => <Link key={item.href} href={item.href} className="text-sm text-slate-300 transition-colors hover:text-white">{item.label}</Link>)}</nav>
        </div>
        <div>
          <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-cyan-300">Contact</p>
          <div className="mt-5 grid gap-4 text-sm text-slate-300">
            <a href={`mailto:${contactDetails.email}`} className="flex gap-3 transition-colors hover:text-white"><Mail size={17} className="mt-0.5 shrink-0 text-cyan-300" />{contactDetails.email}</a>
            <a href={`mailto:${contactDetails.directorEmail}`} className="flex gap-3 transition-colors hover:text-white"><Mail size={17} className="mt-0.5 shrink-0 text-cyan-300" />{contactDetails.directorEmail}</a>
            <a href={`mailto:${contactDetails.additionalEmail}`} className="flex gap-3 transition-colors hover:text-white"><Mail size={17} className="mt-0.5 shrink-0 text-cyan-300" />{contactDetails.additionalEmail}</a>
            <a href={contactDetails.phoneHref} className="flex gap-3 transition-colors hover:text-white"><Phone size={17} className="mt-0.5 shrink-0 text-cyan-300" />{contactDetails.phoneLabel}</a>
            <a href={contactDetails.secondaryPhoneHref} className="flex gap-3 transition-colors hover:text-white"><Phone size={17} className="mt-0.5 shrink-0 text-cyan-300" />{contactDetails.secondaryPhoneLabel}</a>
            <a href={contactDetails.whatsappUrl} target="_blank" rel="noreferrer" className="flex gap-3 transition-colors hover:text-white"><MessageCircle size={17} className="mt-0.5 shrink-0 text-cyan-300" />WhatsApp · {contactDetails.secondaryPhoneLabel}</a>
            <p className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-cyan-300" />{contactDetails.address}</p>
            <p className="flex gap-3"><Globe2 size={17} className="mt-0.5 shrink-0 text-cyan-300" />{contactDetails.domain}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="container flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Propheties Technologies.</span><span>Réseaux · Cybersécurité · Technologie · IA</span></div></div>
    </footer>
  );
}
