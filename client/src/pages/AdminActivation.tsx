import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function AdminActivation() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const activate = trpc.auth.activateAdminInvitation.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/admin");
    },
    onError: (error) => setFormError(error.message),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^[a-f0-9]{64}$/.test(token)) {
      setFormError("Le lien d’activation est incomplet ou invalide.");
      return;
    }
    if (password !== confirmation) {
      setFormError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setFormError(null);
    activate.mutate({ token, password });
  };

  return <main className="grid min-h-screen place-items-center bg-[#0B1233] px-5 py-12">
    <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-7 shadow-[0_32px_100px_rgba(0,0,0,.34)] sm:p-10">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#E7F9F1] text-[#087E59]"><ShieldCheck size={23} /></span>
      <p className="mt-6 font-mono-brand text-[10px] font-bold uppercase tracking-[.18em] text-[#078FBE]">Invitation sécurisée</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-.055em] text-[#111B42]">Créez vos accès</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Choisissez un mot de passe personnel d’au moins 12 caractères pour activer votre accès administrateur.</p>
      <form className="mt-7 space-y-5" onSubmit={submit}>
        <div className="space-y-2"><Label htmlFor="new-admin-password">Mot de passe</Label><Input id="new-admin-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="confirm-admin-password">Confirmer le mot de passe</Label><Input id="confirm-admin-password" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
        {formError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">{formError}</p>}
        <Button type="submit" className="w-full rounded-full bg-[#18B7E8] font-bold text-[#0B1233] hover:bg-[#08A3D6]" disabled={activate.isPending}>{activate.isPending ? "Activation…" : "Activer mes accès"}</Button>
      </form>
    </section>
  </main>;
}
