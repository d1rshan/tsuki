import { env } from "@tsuki/env/api";

type Email = {
  subject: string;
  text: string;
  to: string;
};

export async function sendEmail({ subject, text, to }: Email) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "Tsuki",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      subject,
      text,
      to: [to],
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend failed to send email (${response.status}).`);
  }
}
