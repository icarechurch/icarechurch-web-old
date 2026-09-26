import { HttpError } from "../../../_shared/errors.ts";
import type { FunctionRequest } from "../../../_shared/request.ts";
import {
  ContactDeliveryError,
  ContactValidationError,
} from "../domain/ContactMessage.ts";
import type { SendContactMessage } from "../application/SendContactMessage.ts";

export type ContactMessageUseCase = Pick<SendContactMessage, "execute">;

export class ContactController {
  constructor(private readonly sendContactMessage: ContactMessageUseCase) {}

  async execute(request: FunctionRequest): Promise<{ sent: true }> {
    if (
      request.resource !== "contact-message" ||
      request.operation !== "send"
    ) {
      throw new HttpError(
        400,
        "INVALID_OPERATION",
        `Unsupported contact operation: ${request.resource}/${request.operation}`,
      );
    }

    try {
      return await this.sendContactMessage.execute(request.input);
    } catch (error) {
      if (error instanceof ContactValidationError) {
        throw new HttpError(
          400,
          "INVALID_CONTACT_MESSAGE",
          "Please check your message and try again",
        );
      }
      if (error instanceof ContactDeliveryError) {
        throw new HttpError(
          502,
          "CONTACT_MESSAGE_SEND_FAILED",
          "Unable to send your message right now",
        );
      }
      throw error;
    }
  }
}
