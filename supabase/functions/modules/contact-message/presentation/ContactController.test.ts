import { HttpError } from "../../../_shared/errors.ts";
import type { FunctionRequest } from "../../../_shared/request.ts";
import {
  ContactDeliveryError,
  ContactValidationError,
} from "../domain/ContactMessage.ts";
import { ContactController } from "./ContactController.ts";

const request = (input: unknown): FunctionRequest => ({
  resource: "contact-message",
  operation: "send",
  input,
});

Deno.test("accepts the contact-message send operation", async () => {
  const controller = new ContactController({
    async execute() {
      return { sent: true };
    },
  });

  const result = await controller.execute(request({}));
  if (JSON.stringify(result) !== JSON.stringify({ sent: true })) {
    throw new Error("Expected the contact send result");
  }
});

Deno.test("rejects unsupported operations", async () => {
  const controller = new ContactController({
    async execute() {
      return { sent: true };
    },
  });

  let error: unknown;
  try {
    await controller.execute({
      resource: "church-info",
      operation: "get",
      input: {},
    });
  } catch (caught) {
    error = caught;
  }

  if (
    !(error instanceof HttpError) ||
    error.code !== "INVALID_OPERATION" ||
    error.status !== 400
  ) {
    throw new Error("Expected a stable unsupported-operation error");
  }
});

Deno.test("sanitizes validation and delivery errors", async () => {
  for (
    const failure of [
      new ContactValidationError("private validation detail"),
      new ContactDeliveryError(),
    ]
  ) {
    const controller = new ContactController({
      async execute() {
        throw failure;
      },
    });

    let error: unknown;
    try {
      await controller.execute(request({}));
    } catch (caught) {
      error = caught;
    }

    if (!(error instanceof HttpError) || error.message.includes("private")) {
      throw new Error("Expected a sanitized HTTP error");
    }
  }
});
