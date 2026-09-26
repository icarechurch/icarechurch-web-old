import { invokeFunction } from "@/infrastructure/supabase/functions";
import type {
  ContactMessageInput,
  ContactMessageResponse,
} from "../model/contact.types";

export const contactApi = {
  sendMessage(
    input: ContactMessageInput,
  ): Promise<ContactMessageResponse> {
    return invokeFunction<ContactMessageResponse>("contact-message", {
      resource: "contact-message",
      operation: "send",
      input,
    });
  },
};
