import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import {
  ContactDeliveryError,
  type ContactMessage,
} from "../domain/ContactMessage.ts";
import type { EmailSender } from "../domain/ports/EmailSender.ts";

export type GmailSmtpConfiguration = {
  username: string | undefined;
  appPassword: string | undefined;
  recipient: string | undefined;
};

export class GmailSmtpEmailSender implements EmailSender {
  constructor(private readonly configuration: GmailSmtpConfiguration) {}

  async send(message: ContactMessage): Promise<void> {
    const { appPassword, recipient, username } = this.configuration;
    if (!appPassword || !recipient || !username) {
      throw new ContactDeliveryError();
    }

    let client: SMTPClient | undefined;
    try {
      client = new SMTPClient({
        connection: {
          hostname: "smtp.gmail.com",
          port: 465,
          tls: true,
          auth: {
            username,
            password: appPassword,
          },
        },
      });

      await client.send({
        from: username,
        to: recipient,
        replyTo: message.email,
        subject: `[Website Contact] ${message.subject}`,
        content: [
          `Name: ${message.firstName} ${message.lastName}`,
          `Email: ${message.email}`,
          `Phone: ${message.phone || "Not provided"}`,
          "",
          message.message,
        ].join("\n"),
      });
    } catch {
      throw new ContactDeliveryError();
    } finally {
      if (client) {
        try {
          await client.close();
        } catch {
          // The send result is already handled without exposing SMTP details.
        }
      }
    }
  }
}

export function createGmailSmtpEmailSender(): GmailSmtpEmailSender {
  return new GmailSmtpEmailSender({
    username: Deno.env.get("GMAIL_SMTP_USERNAME"),
    appPassword: Deno.env.get("GMAIL_SMTP_APP_PASSWORD"),
    recipient: Deno.env.get("CONTACT_RECIPIENT_EMAIL"),
  });
}
