import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

import { env } from '../config/env';
import { EmailSenderPort } from './email-sender.port';

@Injectable()
export class SmtpEmailSenderService implements EmailSenderPort {
  private readonly logger = new Logger(SmtpEmailSenderService.name);

  async sendEmail(input: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    if (!env.SMTP_HOST) {
      this.logger.warn(
        `SMTP is not configured. Email for ${input.to}: ${input.subject}\n${input.text}`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
