export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSenderPort {
  sendEmail(input: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void>;
}
