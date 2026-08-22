import ServiceCard from "@/components/ServiceCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { services } from "@/data/siteContent";
import { useSiteVisual } from "@/contexts/SiteVisualsContext";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function Services() {
  const heroImage = useSiteVisual("servicesHero");
  const darkCtaImage = useSiteVisual("servicesDarkCta");
  const heroKicker = useSiteContent("services.hero.kicker");
  const heroTitle = useSiteContent("services.hero.title");
  const heroDescription = useSiteContent("services.hero.description");
  const introKicker = useSiteContent("services.intro.kicker");
  const introDescription = useSiteContent("services.intro.description");
  const darkCtaKicker = useSiteContent("services.darkCta.kicker");
  const darkCtaTitle = useSiteContent("services.darkCta.title");
  const darkCtaDescription = useSiteContent("services.darkCta.description");
  return <div className="min-h-screen bg-[#FBFCFF]"><SiteHeader /><main>
    <section className="relative isolate overflow-hidden bg-[#0B1233] py-24 text-white sm:py-28"><img src={heroImage} alt="" className="site-image-bright absolute inset-0 size-full object-cover opacity-90" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,12,44,.92)_0%,rgba(12,20,63,.68)_43%,rgba(12,20,63,.17)_100%)]" /><div className="brand-grid absolute inset-0 opacity-25" /><div className="container relative max-w-5xl"><p className="font-mono-brand text-[11px] uppercase tracking-[.2em] text-cyan-300">{heroKicker}</p><h1 className="mt-5 font-display text-5xl font-bold tracking-[-.07em] sm:text-6xl">{heroTitle}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100">{heroDescription}</p></div></section>
    <section className="container py-20 sm:py-24"><div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono-brand text-[11px] uppercase tracking-[.2em] text-[#B92BC3]">{introKicker}</p><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{introDescription}</p></div></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => <ServiceCard key={service.title} service={service} />)}</div></section>
    <section className="relative isolate overflow-hidden bg-[#111B42] py-20 text-white"><img src={darkCtaImage} alt="" className="site-image-bright absolute inset-0 -z-20 size-full object-cover opacity-66" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,18,51,.94),rgba(11,18,51,.72)_60%,rgba(11,18,51,.36))]" /><div className="container grid gap-10 lg:grid-cols-2 lg:items-center"><div><p className="font-mono-brand text-[11px] uppercase tracking-[.2em] text-cyan-200">{darkCtaKicker}</p><h2 className="mt-4 font-display text-4xl font-bold tracking-[-.06em]">{darkCtaTitle}</h2></div><div><p className="leading-7 text-slate-200">{darkCtaDescription}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Audit de l’existant", "Priorités clairement posées", "Solution évolutive", "Accompagnement suivi"].map((item) => <span key={item} className="flex items-center gap-2 text-sm font-semibold text-white"><CheckCircle2 size={16} className="text-cyan-300" />{item}</span>)}</div><Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-[#111B42] hover:bg-cyan-100">Demander un devis <ArrowRight size={17} /></Link></div></div></section>
  </main><SiteFooter /></div>;
}
