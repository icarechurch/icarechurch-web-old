import {
  ContactDeliveryError,
  type ContactMessage,
  ContactValidationError,
} from "../domain/ContactMessage.ts";
import type { EmailSender } from "../domain/ports/EmailSender.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const MAX_NAME_LENGTH = 80;
const MAX_PHONE_LENGTH = 40;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 5_000;

export class SendContactMessage {
  constructor(private readonly sender: EmailSender) {}

  async execute(input: unknown): Promise<{ sent: true }> {
    const record = asRecord(input);

    if (typeof record.website === "string" && record.website.trim() !== "") {
      return { sent: true };
    }

    const message = parseContactMessage(record);

    try {
      await this.sender.send(message);
    } catch {
      throw new ContactDeliveryError();
    }

    return { sent: true };
  }
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ContactValidationError("Contact message input is required");
  }

  return input as Record<string, unknown>;
}

function parseContactMessage(record: Record<string, unknown>): ContactMessage {
  const firstName = readRequiredText(record, "firstName", MAX_NAME_LENGTH);
  const lastName = readRequiredText(record, "lastName", MAX_NAME_LENGTH);
  const email = readRequiredText(record, "email", MAX_EMAIL_LENGTH);
  const phone = readOptionalText(record, "phone", MAX_PHONE_LENGTH);
  const subject = readRequiredText(record, "subject", MAX_SUBJECT_LENGTH);
  const message = readRequiredText(record, "message", MAX_MESSAGE_LENGTH);

  if (!EMAIL_PATTERN.test(email)) {
    throw new ContactValidationError("A valid email address is required");
  }

  return { firstName, lastName, email, phone, subject, message };
}

function readRequiredText(
  record: Record<string, unknown>,
  field: string,
  maxLength: number,
): string {
  const value = record[field];
  if (typeof value !== "string") {
    throw new ContactValidationError(`${field} is required`);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw new ContactValidationError(`${field} is required`);
  }
  if (trimmedValue.length > maxLength) {
    throw new ContactValidationError(`${field} is too long`);
  }

  return trimmedValue;
}

function readOptionalText(
  record: Record<string, unknown>,
  field: string,
  maxLength: number,
): string {
  const value = record[field];
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new ContactValidationError(`${field} must be text`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length > maxLength) {
    throw new ContactValidationError(`${field} is too long`);
  }

  return trimmedValue;
}
