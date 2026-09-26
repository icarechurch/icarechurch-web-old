import {
  ContactDeliveryError,
  type ContactMessage,
} from "../domain/ContactMessage.ts";
import { GmailSmtpEmailSender } from "./GmailSmtpEmailSender.ts";

const message: ContactMessage = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "",
  subject: "Prayer request",
  message: "Please pray for our family.",
};

Deno.test("rejects missing SMTP configuration without connecting", async () => {
  const sender = new GmailSmtpEmailSender({
    username: undefined,
    appPassword: undefined,
    recipient: undefined,
  });

  let error: unknown;
  try {
    await sender.send(message);
  } catch (caught) {
    error = caught;
  }

  if (!(error instanceof ContactDeliveryError)) {
    throw new Error("Missing SMTP configuration must be sanitized");
  }
});
