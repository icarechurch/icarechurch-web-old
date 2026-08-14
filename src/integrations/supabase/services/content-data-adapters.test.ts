import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../client";
import { churchInfoService } from "./church-info.service";
import { eventPopupService } from "./event-popup.service";
import { eventsService } from "./events.service";
import { galleryService } from "./gallery.service";
import { givingService } from "./giving.service";
import { ministriesService } from "./ministries.service";
import { pastorsService } from "./pastors.service";
import { sermonsService } from "./sermons.service";
import { serviceTimesService } from "./service-times.service";

vi.mock("../client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const invoke = vi.mocked(supabase.functions.invoke);

describe("content service read adapters", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("lists ministries through content-data", async () => {
    const ministries = [{ id: "ministry-1" }];
    invoke.mockResolvedValue({ data: { data: ministries }, error: null });

    await expect(ministriesService.getAll()).resolves.toEqual(ministries);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "ministries", operation: "list" },
    });
  });

  it("lists events through content-data", async () => {
    const events = [{ id: "event-1" }];
    invoke.mockResolvedValue({ data: { data: events }, error: null });

    await expect(eventsService.getAll()).resolves.toEqual(events);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "events", operation: "list" },
    });
  });

  it("lists service times through content-data", async () => {
    const serviceTimes = [{ id: "service-time-1" }];
    invoke.mockResolvedValue({ data: { data: serviceTimes }, error: null });

    await expect(serviceTimesService.getServiceTimes()).resolves.toEqual(
      serviceTimes,
    );
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "service-times", operation: "list" },
    });
  });

  it("gets church information through content-data", async () => {
    const churchInfo = { id: "church-info-1" };
    invoke.mockResolvedValue({ data: { data: churchInfo }, error: null });

    await expect(churchInfoService.getChurchInfo()).resolves.toEqual(churchInfo);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "church-info", operation: "get" },
    });
  });

  it("lists sermons through content-data", async () => {
    const sermons = [{ id: "sermon-1" }];
    invoke.mockResolvedValue({ data: { data: sermons }, error: null });

    await expect(sermonsService.getAll()).resolves.toEqual(sermons);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "sermons", operation: "list" },
    });
  });

  it("gets the latest sermon through content-data", async () => {
    const sermon = { id: "sermon-1" };
    invoke.mockResolvedValue({ data: { data: sermon }, error: null });

    await expect(sermonsService.getLatest()).resolves.toEqual(sermon);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "sermons", operation: "latest" },
    });
  });

  it("lists gallery images through content-data", async () => {
    const images = [{ id: "image-1" }];
    invoke.mockResolvedValue({ data: { data: images }, error: null });

    await expect(galleryService.getGalleryImages()).resolves.toEqual(images);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "gallery", operation: "list" },
    });
  });

  it("lists pastors through content-data", async () => {
    const pastors = [{ id: "pastor-1" }];
    invoke.mockResolvedValue({ data: { data: pastors }, error: null });

    await expect(pastorsService.getAll()).resolves.toEqual(pastors);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "pastors", operation: "list" },
    });
  });

  it("gets event popup settings through content-data", async () => {
    const settings = { id: "popup-1", is_enabled: true };
    invoke.mockResolvedValue({ data: { data: settings }, error: null });

    await expect(eventPopupService.getSettings()).resolves.toEqual(settings);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "event-popup", operation: "get" },
    });
  });

  it("gets giving settings through content-data", async () => {
    const settings = { id: "giving-1" };
    invoke.mockResolvedValue({ data: { data: settings }, error: null });

    await expect(givingService.getGivingSettings()).resolves.toEqual(settings);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "giving", operation: "get" },
    });
  });
});
