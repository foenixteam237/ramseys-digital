import nodemailer, { type Transporter } from 'nodemailer';

// Compte Gmail utilise pour l'envoi (adresse complete) et mot de passe
// d'application Google (16 caracteres, genere apres activation de la 2FA).
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export function getSiteUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(`GMAIL_USER/GMAIL_APP_PASSWORD absents : email "${subject}" à ${to} non envoyé.`);
    return;
  }

  const fromName = process.env.EMAIL_FROM_NAME || 'Ramseys Digital';

  try {
    await mailer.sendMail({
      from: `"${fromName}" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('sendEmail error:', error instanceof Error ? error.message : error);
  }
}

function emailLayout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; background:#0a0a0a; padding:32px; color:#ffffff;">
      <div style="max-width:480px; margin:0 auto; background:#1b1b1d; border:1px solid #2a2a2d; border-radius:16px; padding:32px;">
        <p style="color:#d61f26; font-size:12px; letter-spacing:2px; text-transform:uppercase; margin:0 0 16px;">Ramseys Digital</p>
        <h1 style="font-size:20px; margin:0 0 16px; color:#ffffff;">${title}</h1>
        ${bodyHtml}
      </div>
    </div>
  `;
}

export function buildVerificationEmail(verifyUrl: string): { subject: string; html: string } {
  return {
    subject: 'Confirmez votre adresse email',
    html: emailLayout(
      'Confirmez votre adresse email',
      `
        <p style="color:#cccccc; font-size:14px; line-height:1.6;">
          Merci de vous être inscrit sur le blog Ramseys Digital. Cliquez sur le lien ci-dessous pour confirmer votre adresse email :
        </p>
        <p style="margin:24px 0;">
          <a href="${verifyUrl}" style="background:#d61f26; color:#ffffff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
            Confirmer mon email
          </a>
        </p>
        <p style="color:#777777; font-size:12px;">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
      `,
    ),
  };
}

export function buildNewPostEmail(postTitle: string, postExcerpt: string, postUrl: string): { subject: string; html: string } {
  return {
    subject: `Nouvel article : ${postTitle}`,
    html: emailLayout(
      'Un nouvel article vient d’être publié',
      `
        <h2 style="color:#ffffff; font-size:18px; margin:0 0 8px;">${postTitle}</h2>
        <p style="color:#cccccc; font-size:14px; line-height:1.6;">${postExcerpt}</p>
        <p style="margin:24px 0;">
          <a href="${postUrl}" style="background:#d61f26; color:#ffffff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
            Lire l'article
          </a>
        </p>
      `,
    ),
  };
}