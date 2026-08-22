import { Menu, MessageCircle, PhoneCall, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { brandAssets, contactDetails, navItems } from "@/data/siteContent";
import { useAuth } from "@/_core/hooks/useAuth";
import PageAudioControl from "@/components/PageAudioControl";

function Brand() {
  return (
    <Link href="/" className="group flex h-[66px] w-[168px] items-center justify-center rounded-lg bg-white" aria-label="Propheties Technologies — Accueil">
      <img src={brandAssets.logo} alt="Propheties Technologies" className="size-full object-contain transition duration-300 group-hover:opacity-90" />
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const isOwner = isAdmin;
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/88 backdrop-blur-xl">
      <div className="container flex h-[92px] items-center justify-between gap-5">
        <Brand />
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Navigation principale">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="font-display text-[16px] font-bold tracking-[-.02em] text-slate-700 transition-colors hover:text-[#B92BC3]">{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 xl:flex"><PageAudioControl />{isOwner && <Link href="/admin" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#18B7E8]/30 bg-[#EEF9FE] px-3.5 text-[12px] font-extrabold text-[#087EAD] transition hover:-translate-y-0.5 hover:bg-[#DCF4FD]"><ShieldCheck size={16} /> Gestion admin</Link>}<a href={contactDetails.phoneHref} className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full border border-[#242C90]/15 bg-[#F3F4FF] px-4 text-[13px] font-extrabold text-[#242C90] transition hover:-translate-y-0.5 hover:border-[#242C90]/35" aria-label={`Appeler le ${contactDetails.phoneLabel}`}><PhoneCall size={16} />{contactDetails.phoneLabel}</a><a href={contactDetails.whatsappUrl} target="_blank" rel="noreferrer" className="grid size-12 place-items-center rounded-full bg-[#DFF7EC] text-[#078455] transition hover:-translate-y-0.5 hover:bg-[#C7F0DE]" aria-label="Écrire sur WhatsApp"><MessageCircle size={19} /></a><Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-full bg-[#242C90] px-5 text-[13px] font-extrabold text-white shadow-[0_14px_26px_-16px_rgba(36,44,144,.95)] transition hover:-translate-y-0.5 hover:bg-[#141b70] active:scale-[.97]">Demander un devis</Link></div>
        <div className="flex items-center gap-2 xl:hidden">
          <PageAudioControl />
          <button onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-[#111B42]" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 xl:hidden">
          <nav className="container grid gap-1" aria-label="Navigation mobile">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">{item.label}</Link>)}
            {isOwner && <Link href="/admin" onClick={closeMenu} className="mt-1 inline-flex items-center gap-2 rounded-xl bg-[#EEF9FE] px-4 py-3 text-sm font-bold text-[#087EAD]"><ShieldCheck size={16} /> Gestion admin</Link>}
            <div className="mt-3 grid grid-cols-2 gap-3"><a href={contactDetails.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#242C90]/15 bg-[#F3F4FF] px-3 py-3 text-xs font-bold text-[#242C90]"><PhoneCall size={15} /> Appeler</a><a href={contactDetails.whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DFF7EC] px-3 py-3 text-xs font-bold text-[#087E59]"><MessageCircle size={15} /> WhatsApp</a></div>
            <Link href="/contact" onClick={closeMenu} className="mt-3 rounded-xl bg-[#242C90] px-4 py-3 text-center text-sm font-bold text-white">Demander un devis</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
