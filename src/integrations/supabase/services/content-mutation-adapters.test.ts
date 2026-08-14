import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../client";
import { adminService } from "./admin.service";
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

describe("content service mutation adapters", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("creates a ministry with the existing input", async () => {
    const ministry = { id: "ministry-1", name: "Care" };
    invoke.mockResolvedValue({ data: { data: ministry }, error: null });

    await expect(ministriesService.create(ministry as never)).resolves.toEqual(
      ministry,
    );
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "ministries", operation: "create", input: ministry },
    });
  });

  it("updates an event with the existing payload shape", async () => {
    const event = { id: "event-1", title: "Updated" };
    invoke.mockResolvedValue({ data: { data: event }, error: null });

    await expect(eventsService.update(event as never)).resolves.toEqual(event);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "events", operation: "update", input: event },
    });
  });

  it("deletes a service time by ID", async () => {
    invoke.mockResolvedValue({ data: { data: "service-time-1" }, error: null });

    await expect(serviceTimesService.deleteServiceTime("service-time-1"))
      .resolves.toBe("service-time-1");
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: {
        resource: "service-times",
        operation: "delete",
        input: { id: "service-time-1" },
      },
    });
  });

  it("updates ministry sort order as one input array", async () => {
    const items = [{ id: "ministry-1", sort_order: 2 }];
    invoke.mockResolvedValue({ data: { data: items }, error: null });

    await expect(ministriesService.updateSortOrder(items)).resolves.toEqual(
      items,
    );
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "ministries", operation: "sort", input: items },
    });
  });

  it("creates a service time", async () => {
    const serviceTime = { id: "service-time-1", name: "Sunday" };
    invoke.mockResolvedValue({ data: { data: serviceTime }, error: null });

    await expect(serviceTimesService.create(serviceTime as never)).resolves.toEqual(
      serviceTime,
    );
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: {
        resource: "service-times",
        operation: "create",
        input: serviceTime,
      },
    });
  });

  it("creates and deletes sermon records through content-data", async () => {
    const sermon = { id: "sermon-1", title: "Hope" };
    invoke
      .mockResolvedValueOnce({ data: { data: sermon }, error: null })
      .mockResolvedValueOnce({ data: { data: sermon.id }, error: null });

    await expect(sermonsService.create(sermon as never)).resolves.toEqual(sermon);
    await expect(sermonsService.deleteSermon(sermon.id)).resolves.toBe(sermon.id);
    expect(invoke).toHaveBeenNthCalledWith(1, "content-data", {
      body: { resource: "sermons", operation: "create", input: sermon },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "content-data", {
      body: {
        resource: "sermons",
        operation: "delete",
        input: { id: sermon.id },
      },
    });
  });

  it("creates and deletes a gallery image", async () => {
    const image = { id: "image-1", title: "Worship" };
    invoke
      .mockResolvedValueOnce({ data: { data: image }, error: null })
      .mockResolvedValueOnce({ data: { data: image.id }, error: null });

    await expect(galleryService.create(image as never)).resolves.toEqual(image);
    await expect(galleryService.deleteGalleryImage(image.id)).resolves.toBe(
      image.id,
    );
    expect(invoke).toHaveBeenNthCalledWith(1, "content-data", {
      body: { resource: "gallery", operation: "create", input: image },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "content-data", {
      body: { resource: "gallery", operation: "delete", input: { id: image.id } },
    });
  });

  it("updates pastor sort order", async () => {
    const items = [{ id: "pastor-1", sort_order: 1 }];
    invoke.mockResolvedValue({ data: { data: items }, error: null });

    await expect(pastorsService.updateSortOrder(items)).resolves.toEqual(items);
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "pastors", operation: "sort", input: items },
    });
  });

  it("upserts event popup settings", async () => {
    const settings = { event_id: "event-1", is_enabled: true };
    invoke.mockResolvedValue({ data: { data: settings }, error: null });

    await expect(eventPopupService.upsertSettings(settings)).resolves.toEqual(
      settings,
    );
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: { resource: "event-popup", operation: "upsert", input: settings },
    });
  });

  it("updates giving settings through content-data", async () => {
    const updates = { donation_platform_name: "Give" };
    invoke.mockResolvedValue({ data: { data: null }, error: null });

    await expect(givingService.updateGivingSettings("giving-1", updates))
      .resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: {
        resource: "giving",
        operation: "update",
        input: { id: "giving-1", updates },
      },
    });
  });

  it("keeps the admin giving update service API on content-data", async () => {
    const updates = { donation_platform_name: "Give" };
    invoke.mockResolvedValue({ data: { data: null }, error: null });

    await expect(adminService.updateGivingSettings("giving-1", updates))
      .resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith("content-data", {
      body: {
        resource: "giving",
        operation: "update",
        input: { id: "giving-1", updates },
      },
    });
  });
});
