import { createOptionsResponse } from "../../_shared/cors.ts";
import { type FunctionRequest, parseRequest } from "../../_shared/request.ts";
import { failFromError, ok } from "../../_shared/responses.ts";
import { createLivestreamModule } from "./index.ts";
import type { LivestreamController } from "./presentation/LivestreamController.ts";

export type LivestreamControllerPort = Pick<LivestreamController, "execute">;

export const createLivestreamHandler =
  (controller: LivestreamControllerPort) =>
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

export const handleLivestreamRequest = (req: Request): Promise<Response> =>
  createLivestreamHandler(createLivestreamModule())(req);

if (import.meta.main) {
  Deno.serve(handleLivestreamRequest);
}
