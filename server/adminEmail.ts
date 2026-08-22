import { ENV } from "./_core/env";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function isAdminInvitationEmailConfigured() {
  return Boolean(ENV.resendApiKey && ENV.resendFromEmail);
}

export async function sendAdminInvitationEmail(input: {
  recipientEmail: string;
  recipientName?: string | null;
  activationUrl: string;
  idempotencyKey: string;
}) {
  if (!isAdminInvitationEmailConfigured()) {
    throw new Error("L’envoi automatique des invitations n’est pas encore configuré. Ajoutez les paramètres RESEND_API_KEY et RESEND_FROM_EMAIL lorsque vous serez prêt.");
  }

  const recipient = input.recipientName ? `Bonjour ${escapeHtml(input.recipientName)},` : "Bonjour,";
  const safeUrl = escapeHtml(input.activationUrl);
  const loginUrl = input.activationUrl.replace(/\/admin\/activation\?token=([a-f0-9]{64})$/, "/admin/connexion?entry=$1");
  const safeLoginUrl = escapeHtml(loginUrl);
  const html = `<main style="font-family:Arial,sans-serif;color:#111B42;max-width:560px;margin:auto;padding:32px"><p>${recipient}</p><p>Vous avez été invité(e) à accéder à l’espace d’administration de <strong>Propheties Technologies</strong>.</p><p><a href="${safeUrl}" style="display:inline-block;background:#18B7E8;color:#0B1233;padding:14px 20px;border-radius:999px;font-weight:700;text-decoration:none">Activer mes accès</a></p><p>Ce lien est personnel et valable 72 heures. Après l’activation, conservez cette adresse pour vous connecter : <a href="${safeLoginUrl}">${safeLoginUrl}</a>.</p><p>Si vous n’attendiez pas cette invitation, vous pouvez ignorer cet e-mail.</p><p style="font-size:12px;color:#64748B">Propheties Technologies · Abidjan</p></main>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Propheties-Technologies-Admin-Invitations/1.0",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from: ENV.resendFromEmail,
      to: [input.recipientEmail],
      subject: "Invitation — Administration Propheties Technologies",
      html,
      text: `${input.recipientName ? `Bonjour ${input.recipientName},\n\n` : "Bonjour,\n\n"}Vous avez été invité(e) à accéder à l’administration de Propheties Technologies. Activez vos accès dans les 72 heures : ${input.activationUrl}\n\nAprès activation, vous pourrez vous connecter ici : ${loginUrl}`,
    }),
  });

  if (!response.ok) {
    throw new Error("L’e-mail d’invitation n’a pas pu être envoyé. Vérifiez la clé Resend et l’adresse d’expédition vérifiée.");
  }
}
