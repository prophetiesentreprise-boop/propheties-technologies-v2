import ServiceCard from "@/components/ServiceCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { useSiteVisual } from "@/contexts/SiteVisualsContext";
import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { services, values } from "@/data/siteContent";

export default function Home() {
  const heroImage = useSiteVisual("homeHero");
  const darkCtaImage = useSiteVisual("homeDarkCta");
  const heroKicker = useSiteContent("home.hero.kicker");
  const heroTitle = useSiteContent("home.hero.title");
  const heroDescription = useSiteContent("home.hero.description");
  const primaryCta = useSiteContent("home.hero.primaryCta");
  const secondaryCta = useSiteContent("home.hero.secondaryCta");
  const methodKicker = useSiteContent("home.method.kicker");
  const methodTitle = useSiteContent("home.method.title");
  const methodDescription = useSiteContent("home.method.description");
  const darkCtaKicker = useSiteContent("home.darkCta.kicker");
  const darkCtaTitle = useSiteContent("home.darkCta.title");
  const darkCtaDescription = useSiteContent("home.darkCta.description");
  const valueImages = [
    useSiteVisual("valueReliability"),
    useSiteVisual("valueConfidentiality"),
    useSiteVisual("valueRigor"),
    useSiteVisual("valueResponsiveness"),
  ];
  return (
    <div className="min-h-screen overflow-hidden bg-[#FBFCFF]">
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[680px] overflow-hidden bg-[#0B1233] text-white lg:min-h-[740px]">
          <div className="site-image-bright absolute inset-0 bg-cover bg-center opacity-100" style={{ backgroundImage: `url('${heroImage}')` }} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,14,48,.94)_0%,rgba(10,17,55,.82)_34%,rgba(10,17,55,.45)_61%,rgba(10,17,55,.18)_100%)]" />
          <div className="brand-grid absolute inset-0 opacity-25" />
          <div className="hero-orb absolute -left-20 top-24 size-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="hero-orb hero-orb-delayed absolute bottom-2 left-[38%] size-64 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="container relative flex min-h-[680px] items-center py-24 lg:min-h-[740px]">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-white/10 px-4 py-2 font-mono-brand text-[10px] font-medium uppercase tracking-[.18em] text-cyan-100 backdrop-blur"><span className="size-1.5 rounded-full bg-cyan-300" /> {heroKicker}</div>
              <h1 className="mt-7 font-display text-[clamp(2.7rem,6.6vw,5.5rem)] font-bold leading-[.97] tracking-[-.075em] text-balance">{heroTitle}</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">{heroDescription}</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#18B7E8] px-6 text-sm font-extrabold text-[#07123B] shadow-[0_16px_35px_-12px_rgba(24,183,232,.55)] transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-200 active:scale-[.97]">{primaryCta} <ArrowRight size={17} /></Link><Link href="/services" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/35 bg-white/8 px-6 text-sm font-bold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:scale-[.97]">{secondaryCta} <ChevronRight size={17} /></Link></div>
              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-200">{["Audit ciblé", "Déploiement documenté", "Support de proximité"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-300" />{item}</span>)}</div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white"><div className="container grid gap-6 py-8 md:grid-cols-3 md:gap-0">{[["01", "Comprendre", "Un diagnostic aligné à votre réalité métier."], ["02", "Concevoir", "Une réponse claire, dimensionnée et évolutive."], ["03", "Accompagner", "Un suivi rigoureux après le déploiement." ]].map(([n, title, text], index) => <div key={n} className={`flex gap-4 ${index ? "md:border-l md:border-slate-200 md:pl-8" : ""}`}><span className="brand-number">{n}</span><div><p className="font-display font-bold text-[#111B42]">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p></div></div>)}</div></section>

        <section className="container py-24 sm:py-28"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div className="max-w-2xl"><p className="eyebrow-kicker">Expertises IT</p><h2 className="mt-4 font-display text-4xl font-bold tracking-[-.065em] text-[#111B42] sm:text-5xl">Des services reliés à vos enjeux, pas à une simple liste technique.</h2></div><Link href="/services" className="inline-flex items-center gap-2 font-bold text-[#242C90] hover:text-[#B92BC3]">Voir toutes les expertises <ArrowRight size={17} /></Link></div><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => <ServiceCard key={service.title} service={service} compact />)}</div></section>

        <section className="relative overflow-hidden bg-[#EEF5FC] py-24 sm:py-28"><div className="subtle-noise absolute inset-0 opacity-50" /><div className="container relative grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="eyebrow-kicker">{methodKicker}</p><h2 className="mt-4 font-display text-4xl font-bold tracking-[-.065em] text-[#111B42] sm:text-5xl">{methodTitle}</h2><p className="mt-6 max-w-lg leading-7 text-slate-600">{methodDescription}</p><Link href="/a-propos" className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#242C90]/20 bg-white px-5 py-3 text-sm font-bold text-[#242C90] transition hover:border-[#242C90]">Notre approche <ArrowRight size={17} /></Link></div><div className="grid gap-4 sm:grid-cols-2">{values.map((value, index) => <article key={value.title} className="relative isolate min-h-[232px] overflow-hidden rounded-3xl border border-white bg-white/88 p-6 shadow-[0_20px_40px_-32px_rgba(15,45,100,.35)] backdrop-blur"><img src={valueImages[index]} alt="" className="site-image-bright absolute inset-0 -z-20 size-full object-cover opacity-36" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,.96),rgba(255,255,255,.78)_58%,rgba(238,248,253,.68))]" /><span className="brand-number">0{index + 1}</span><h3 className="mt-7 font-display text-xl font-bold tracking-[-.045em] text-[#111B42]">{value.title}</h3><p className="mt-3 text-sm leading-6 text-slate-700">{value.text}</p></article>)}</div></div></section>

        <section className="container py-24 sm:py-28"><div className="relative isolate grid gap-10 overflow-hidden rounded-[2rem] bg-[#111B42] px-7 py-10 text-white lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-14 lg:py-16"><img src={darkCtaImage} alt="" className="site-image-bright absolute inset-0 -z-20 size-full object-cover opacity-62" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,18,51,.94),rgba(11,18,51,.74)_55%,rgba(11,18,51,.38))]" /><div><div className="inline-flex size-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200"><ShieldCheck size={24} /></div><p className="mt-6 font-mono-brand text-[10px] uppercase tracking-[.18em] text-cyan-200">{darkCtaKicker}</p><h2 className="mt-3 font-display text-4xl font-bold tracking-[-.06em] sm:text-5xl">{darkCtaTitle}</h2></div><div><p className="leading-7 text-slate-200">{darkCtaDescription}</p><Link href="/contact" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#111B42] transition hover:-translate-y-0.5 hover:bg-cyan-100 active:scale-[.97]">{primaryCta} <ArrowRight size={17} /></Link></div></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
