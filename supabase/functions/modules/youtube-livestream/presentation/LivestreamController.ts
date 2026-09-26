import { HttpError } from "../../../_shared/errors.ts";
import type { FunctionRequest } from "../../../_shared/request.ts";
import {
  GetActiveLivestream,
  LivestreamProviderError,
} from "../application/GetActiveLivestream.ts";
import type { LivestreamResponse } from "../domain/Livestream.ts";

const YOUTUBE_LOOKUP_ERROR = new HttpError(
  502,
  "YOUTUBE_LOOKUP_FAILED",
  "Unable to check for a live stream",
);

export class LivestreamController {
  constructor(private readonly getActiveLivestream: GetActiveLivestream) {}

  async execute(request: FunctionRequest): Promise<LivestreamResponse> {
    if (
      request.resource !== "livestream" || request.operation !== "get-active"
    ) {
      throw new HttpError(
        400,
        "INVALID_OPERATION",
        `Unsupported livestream operation: ${request.resource}/${request.operation}`,
      );
    }

    try {
      return await this.getActiveLivestream.execute();
    } catch (error) {
      if (error instanceof LivestreamProviderError) {
        throw YOUTUBE_LOOKUP_ERROR;
      }
      throw error;
    }
  }
}
