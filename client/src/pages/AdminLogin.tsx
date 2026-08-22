import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { KeyRound, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import NotFound from "./NotFound";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const entry = new URLSearchParams(window.location.search).get("entry") ?? "";
  const hasValidEntryShape = /^[a-f0-9]{64}$/.test(entry);
  const access = trpc.auth.canAccessAdminLogin.useQuery({ entry }, { enabled: hasValidEntryShape, retry: false });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = trpc.auth.localLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/admin");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password, entry });
  };

  if (!hasValidEntryShape || access.isLoading) return <main className="min-h-screen bg-[#FBFCFF]" aria-busy="true" />;
  if (access.isError || !access.data?.allowed) return <NotFound />;

  return <main className="grid min-h-screen place-items-center bg-[#0B1233] px-5 py-12">
    <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-7 shadow-[0_32px_100px_rgba(0,0,0,.34)] sm:p-10">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#E8F9FE] text-[#078FBE]"><LockKeyhole size={22} /></span>
      <p className="mt-6 font-mono-brand text-[10px] font-bold uppercase tracking-[.18em] text-[#078FBE]">Espace privé</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-.055em] text-[#111B42]">Administration</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Cet accès est réservé aux administrateurs activés par Propheties Technologies.</p>
      <form className="mt-7 space-y-5" onSubmit={submit}>
        <div className="space-y-2"><Label htmlFor="admin-email">E-mail professionnel</Label><Input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="admin-password">Mot de passe</Label><Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        {login.isError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">E-mail ou mot de passe incorrect.</p>}
        <Button type="submit" className="w-full rounded-full bg-[#18B7E8] font-bold text-[#0B1233] hover:bg-[#08A3D6]" disabled={login.isPending}><KeyRound size={16} />{login.isPending ? "Connexion…" : "Accéder au back office"}</Button>
      </form>
      <p className="mt-6 text-xs leading-5 text-slate-500">Vous n’avez pas reçu d’invitation ? Contactez le propriétaire du site.</p>
    </section>
  </main>;
}
