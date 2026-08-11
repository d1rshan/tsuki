import { env } from "@tsuki/env/email";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

type Email = {
  actionLabel: string;
  actionUrl: string;
  description: string;
  subject: string;
  to: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

function createEmailContent({
  actionLabel,
  actionUrl,
  description,
}: Omit<Email, "subject" | "to">) {
  const safeActionLabel = escapeHtml(actionLabel);
  const safeActionUrl = escapeHtml(actionUrl);
  const safeDescription = escapeHtml(description);

  return {
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#0a0a0a;color:#171717;font-family:Arial,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:8px">
            <tr>
              <td style="padding:32px">
                <p style="margin:0 0 24px;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:#171717">Tsuki</p>
                <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#171717">${safeActionLabel}</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#525252">${safeDescription}</p>
                <a href="${safeActionUrl}" style="display:inline-block;border-radius:6px;background:#171717;padding:12px 18px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none">${safeActionLabel}</a>
                <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#737373">If you did not request this, you can safely ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: `${description}\n\n${actionLabel}: ${actionUrl}\n\nIf you did not request this, you can safely ignore this email.`,
  };
}

export async function sendEmail({ actionLabel, actionUrl, description, subject, to }: Email) {
  const content = createEmailContent({ actionLabel, actionUrl, description });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "Tsuki",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      ...content,
      subject,
      to: [to],
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend failed to send email (${response.status}).`);
  }
}
