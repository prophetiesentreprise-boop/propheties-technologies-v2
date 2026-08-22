import { trpc } from "@/lib/trpc";
import { Loader2, MessageCircleMore, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type Message = { role: "assistant" | "user"; content: string };

const initialMessages: Message[] = [
  { role: "assistant", content: "Bonjour, je suis l’assistant de Propheties Technologies. Comment puis-je vous orienter ?" },
];

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const chat = trpc.ai.chat.useMutation({
    onSuccess: ({ content }) => setMessages((current) => [...current, { role: "assistant", content }]),
    onError: () => {
      setMessages((current) => [...current, { role: "assistant", content: "Je rencontre un souci technique. Pour une demande précise, écrivez-nous via le formulaire de contact." }]);
      toast.error("Le chatbot est momentanément indisponible.");
    },
  });

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || chat.isPending) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    chat.mutate({ messages: next.slice(-10).map(({ role, content: text }) => ({ role: role === "assistant" ? "assistant" as const : "user" as const, content: text })) });
  };
  const submit = (event: FormEvent) => { event.preventDefault(); sendMessage(draft); setDraft(""); };

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && <div className="mb-3 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(11,18,51,.48)]"><div className="flex items-center justify-between bg-[#111B42] px-5 py-4 text-white"><div><p className="font-display text-sm font-bold">Propheties Assistant</p><p className="mt-0.5 text-xs text-cyan-200">Questions sur nos services IT</p></div><button onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Fermer le chatbot"><X size={18} /></button></div><div className="max-h-[325px] space-y-3 overflow-y-auto bg-[#F8FAFF] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto rounded-br-md bg-[#242C90] text-white" : "rounded-bl-md bg-white text-slate-700 shadow-sm"}`}>{message.content}</div>)}{chat.isPending && <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"><Loader2 size={15} className="animate-spin text-[#078FBE]" /> Réponse en préparation…</div>}</div><div className="border-t border-slate-100 bg-white p-4"><div className="mb-3 flex flex-wrap gap-2">{["Quels sont vos services ?", "Comment demander un devis ?", "Proposez-vous des formations IT ?"].map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)} disabled={chat.isPending} className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold text-[#242C90] transition hover:bg-cyan-100 disabled:opacity-50">{prompt}</button>)}</div><form onSubmit={submit} className="flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1500} placeholder="Écrivez votre question…" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#078FBE] focus:ring-4 focus:ring-cyan-100" /><button type="submit" disabled={!draft.trim() || chat.isPending} className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#242C90] text-white transition hover:bg-[#141b70] disabled:opacity-45" aria-label="Envoyer"><Send size={17} /></button></form></div></div>}
      <button onClick={() => setOpen(!open)} className="group flex h-14 items-center gap-3 rounded-full bg-[#18B7E8] px-4 text-[#07123B] shadow-[0_16px_35px_-12px_rgba(24,183,232,.68)] transition duration-200 hover:-translate-y-1 hover:bg-cyan-200 active:scale-[.97]" aria-label={open ? "Fermer le chatbot" : "Ouvrir le chatbot"} aria-expanded={open}><MessageCircleMore size={22} /><span className="hidden pr-1 text-sm font-extrabold sm:inline">Besoin d’aide ?</span></button>
    </div>
  );
}
