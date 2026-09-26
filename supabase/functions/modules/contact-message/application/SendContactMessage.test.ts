import type { ContactMessage } from "../domain/ContactMessage.ts";
import type { EmailSender } from "../domain/ports/EmailSender.ts";
import { SendContactMessage } from "./SendContactMessage.ts";

const validInput = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "+63 900 000 0000",
  subject: "Prayer request",
  message: "Please pray for our family.",
  website: "",
};

const createSender = (failure?: Error) => {
  const sent: ContactMessage[] = [];
  const sender: EmailSender = {
    async send(message) {
      if (failure) throw failure;
      sent.push(message);
    },
  };
  return { sender, sent };
};

Deno.test("sends a trimmed valid contact message", async () => {
  const { sender, sent } = createSender();
  const result = await new SendContactMessage(sender).execute({
    ...validInput,
    firstName: " Ada ",
  });

  if (JSON.stringify(result) !== JSON.stringify({ sent: true })) {
    throw new Error("Expected a successful send result");
  }
  if (sent[0]?.firstName !== "Ada" || sent[0]?.email !== "ada@example.com") {
    throw new Error("Expected normalized contact data");
  }
});

Deno.test("rejects invalid input before calling the sender", async () => {
  const { sender, sent } = createSender();
  let rejected = false;

  try {
    await new SendContactMessage(sender).execute({
      ...validInput,
      email: "not-an-email",
    });
  } catch (error) {
    rejected = error instanceof Error &&
      error.name === "ContactValidationError";
  }

  if (!rejected || sent.length !== 0) {
    throw new Error("Invalid input must be rejected without sending");
  }
});

Deno.test("does not send honeypot submissions", async () => {
  const { sender, sent } = createSender();
  const result = await new SendContactMessage(sender).execute({
    ...validInput,
    website: "automated-value",
  });

  if (
    JSON.stringify(result) !== JSON.stringify({ sent: true }) ||
    sent.length !== 0
  ) {
    throw new Error("Honeypot submissions must be silently ignored");
  }
});

Deno.test("wraps sender failures without exposing provider details", async () => {
  const { sender } = createSender(new Error("SMTP password leaked"));
  let errorName = "";

  try {
    await new SendContactMessage(sender).execute(validInput);
  } catch (error) {
    errorName = error instanceof Error ? error.name : "";
  }

  if (errorName !== "ContactDeliveryError") {
    throw new Error("Sender failures must use the delivery error boundary");
  }
});
