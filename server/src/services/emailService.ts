import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.EMAIL_PORT) || 2525,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const from = process.env.EMAIL_FROM || 'SkillSync <noreply@skillsync.com>';
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'skillsync_mail') {
      console.log(`[Email Service - Dev Mode] Sending email to: ${options.to}`);
      console.log(`[Email Subject]: ${options.subject}`);
      return true;
    }

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });

    console.log(`[Email Service] Message sent: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error(`[Email Service] Failed to send email to ${options.to}:`, error.message);
    return false;
  }
};

