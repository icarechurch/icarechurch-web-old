import { SendContactMessage } from "./application/SendContactMessage.ts";
import { createGmailSmtpEmailSender } from "./infrastructure/GmailSmtpEmailSender.ts";
import { ContactController } from "./presentation/ContactController.ts";

export function createContactModule(): ContactController {
  return new ContactController(
    new SendContactMessage(createGmailSmtpEmailSender()),
  );
}
