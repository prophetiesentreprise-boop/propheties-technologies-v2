import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Clock3, MailPlus, Plus, ShieldCheck, UserMinus, UserPlus, UsersRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user, loading, isOwner } = useAuth();
  const utils = trpc.useUtils();
  const members = trpc.admins.list.useQuery(undefined, { enabled: isOwner, retry: false });
  const invitations = trpc.admins.listInvitations.useQuery(undefined, { enabled: isOwner, retry: false });
  const invitationConfig = trpc.admins.invitationConfig.useQuery(undefined, { enabled: isOwner, retry: false });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const updateRole = trpc.admins.updateRole.useMutation({
    onSuccess: () => {
      utils.admins.list.invalidate();
      utils.dashboard.overview.invalidate();
      toast.success("Rôle mis à jour.");
    },
    onError: () => toast.error("Cette modification n’a pas pu être enregistrée."),
  });
  const invite = trpc.admins.invite.useMutation({
    onSuccess: () => {
      utils.admins.listInvitations.invalidate();
      setInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      toast.success("Invitation envoyée. Le lien est valable 72 heures.");
    },
    onError: (error) => toast.error(error.message),
  });

  const submitInvitation = (event: FormEvent) => {
    event.preventDefault();
    invite.mutate({
      name: inviteName.trim() || null,
      email: inviteEmail,
      origin: window.location.origin,
    });
  };

  if (loading) return <DashboardLayout><div /></DashboardLayout>;

  return (
    <DashboardLayout>
      {!isOwner ? <AccessDenied /> : <div className="mx-auto max-w-6xl py-4">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#10124B_0%,#1B2E8F_57%,#0AA7D5_170%)] p-7 text-white shadow-[0_22px_48px_-30px_rgba(15,31,93,.62)] sm:p-9">
          <p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-cyan-200">Sécurité · accès</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.065em]">Gérez les administrateurs.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Seul le propriétaire du site peut inviter, accorder ou retirer les accès administrateur. Les personnes invitées créent elles-mêmes leur mot de passe, sans compte Manus.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100"><ShieldCheck size={15} /> Gestion réservée au propriétaire</div>
        </section>

        {members.isLoading ? <p className="mt-8 text-sm text-slate-500">Chargement des comptes…</p> : members.isError ? <OwnerOnly /> : <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#EDF7FC] text-[#078FBE]"><UsersRound size={19} /></span>
            <div>
              <p className="font-mono-brand text-[10px] uppercase tracking-[.14em] text-[#078FBE]">Accès de l’équipe</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#111B42]">Attribuer les accès</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Ajoutez un administrateur avec son e-mail : il reçoit une invitation sécurisée et choisit son mot de passe à l’activation.</p>
            </div>
            </div>
            <Button onClick={() => setInviteOpen(true)} className="shrink-0 rounded-full bg-[#18B7E8] font-bold text-[#0B1233] hover:bg-[#08A3D6]"><Plus size={17} /> Ajouter un administrateur</Button>
          </div>
          {!invitationConfig.data?.configured && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><strong>Envoi prêt à activer.</strong> Ajoutez plus tard les paramètres sécurisés d’e-mail pour envoyer les invitations depuis ce bouton.</div>}

          {invitations.data?.some((invitation) => invitation.status === "pending") && <div className="mt-6 rounded-2xl border border-[#BDEAF8] bg-[#F3FBFE] p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#078FBE]"><Clock3 size={14} /> Invitations en attente</p>
            <div className="mt-3 grid gap-2">{invitations.data.filter((invitation) => invitation.status === "pending").map((invitation) => <p key={invitation.id} className="text-sm text-slate-700"><strong>{invitation.name || invitation.email}</strong> <span className="text-slate-500">· expire le {new Date(invitation.expiresAt).toLocaleDateString("fr-FR")}</span></p>)}</div>
          </div>}
          <div className="mt-6 grid gap-3">
            {members.data?.map((member) => {
              const isCurrentUser = member.id === user?.id;
              const memberIsOwner = member.role === "owner";
              const memberIsAdmin = member.role === "admin" || memberIsOwner;
              const roleLabel = memberIsOwner ? "Propriétaire" : memberIsAdmin ? "Administrateur" : "Utilisateur";

              return <article key={member.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-[#111B42]">{member.name || "Compte sans nom"}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${memberIsOwner ? "bg-[#F7EDFD] text-[#9E238C]" : memberIsAdmin ? "bg-[#E7F9F1] text-[#087E59]" : "bg-slate-100 text-slate-600"}`}>{roleLabel}</span>
                    {isCurrentUser && <span className="rounded-full bg-[#EDF7FC] px-2.5 py-1 text-[10px] font-bold text-[#078FBE]">Vous</span>}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{member.email || "E-mail non communiqué"}</p>
                  <p className="mt-1 text-xs text-slate-400">Dernière connexion : {member.lastSignedIn ? new Date(member.lastSignedIn).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "non renseignée"}</p>
                </div>
                {memberIsOwner ? <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#A75CC5]/20 bg-[#F7EDFD] px-3 py-2 text-xs font-bold text-[#9E238C]"><ShieldCheck size={15} /> Compte propriétaire</span> : memberIsAdmin ? <Button variant="outline" onClick={() => { if (window.confirm(`Retirer l’accès administrateur de ${member.name || "ce compte"} ?`)) updateRole.mutate({ id: member.id, role: "user" }); }} disabled={updateRole.isPending} className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"><UserMinus size={16} /> Retirer l’accès</Button> : <Button onClick={() => updateRole.mutate({ id: member.id, role: "admin" })} disabled={updateRole.isPending} className="rounded-full bg-[#242C90] hover:bg-[#141b70]"><UserPlus size={16} /> Donner l’accès admin</Button>}
              </article>;
            })}
          </div>
        </section>}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="rounded-[2rem] sm:max-w-md">
            <DialogHeader><DialogTitle className="font-display text-2xl text-[#111B42]">Inviter un administrateur</DialogTitle><DialogDescription>La personne recevra un lien personnel valable 72 heures pour choisir son mot de passe.</DialogDescription></DialogHeader>
            <form className="mt-3 space-y-5" onSubmit={submitInvitation}>
              <div className="space-y-2"><Label htmlFor="invite-name">Nom et prénom <span className="text-slate-400">(facultatif)</span></Label><Input id="invite-name" value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Ex. Awa Koné" /></div>
              <div className="space-y-2"><Label htmlFor="invite-email">E-mail professionnel</Label><Input id="invite-email" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="nom@entreprise.com" required /></div>
              {!invitationConfig.data?.configured && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">L’e-mail ne pourra être envoyé qu’après l’ajout des paramètres d’envoi sécurisés.</p>}
              <Button type="submit" disabled={invite.isPending || !invitationConfig.data?.configured} className="w-full rounded-full bg-[#18B7E8] font-bold text-[#0B1233] hover:bg-[#08A3D6]"><MailPlus size={16} />{invite.isPending ? "Envoi…" : "Envoyer l’invitation"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>}
    </DashboardLayout>
  );
}

function OwnerOnly() {
  return <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h2 className="font-display text-2xl font-bold text-[#111B42]">Gestion réservée au propriétaire</h2><p className="mt-3 text-sm leading-6 text-slate-600">Votre session ne permet pas encore la gestion des comptes. Rafraîchissez la page après connexion, ou reconnectez-vous avec le compte propriétaire.</p></div>;
}

function AccessDenied() {
  return <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="font-display text-3xl font-bold text-[#111B42]">Accès réservé</h1><p className="mt-3 text-sm leading-6 text-slate-600">La gestion des administrateurs est réservée au propriétaire du site.</p></div>;
}
