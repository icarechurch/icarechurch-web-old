import type { ContactMessage } from "../ContactMessage.ts";

export interface EmailSender {
  send(message: ContactMessage): Promise<void>;
}
