import { createOptionsResponse } from "../../_shared/cors.ts";
import { type FunctionRequest, parseRequest } from "../../_shared/request.ts";
import { failFromError, ok } from "../../_shared/responses.ts";
import { createContactModule } from "./index.ts";
import type { ContactController } from "./presentation/ContactController.ts";

export type ContactControllerPort = Pick<ContactController, "execute">;

export const createContactHandler =
  (controller: ContactControllerPort) =>
  async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return createOptionsResponse();
    }

    try {
      const request: FunctionRequest = await parseRequest(req);
      return ok(await controller.execute(request));
    } catch (error) {
      return failFromError(error);
    }
  };

export const handleContactRequest = (req: Request): Promise<Response> =>
  createContactHandler(createContactModule())(req);

if (import.meta.main) {
  Deno.serve(handleContactRequest);
}
