import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { GetChurchInfo } from "./church-info/application/GetChurchInfo.ts";
import { UpdateChurchInfo } from "./church-info/application/UpdateChurchInfo.ts";
import { SupabaseChurchInfoRepository } from "./church-info/infrastructure/SupabaseChurchInfoRepository.ts";
import { ChurchInfoController } from "./church-info/presentation/ChurchInfoController.ts";
import { EventPopupController } from "./event-popup/presentation/EventPopupController.ts";
import { GetEventPopupSettings } from "./event-popup/application/GetEventPopupSettings.ts";
import { UpsertEventPopupSettings } from "./event-popup/application/UpsertEventPopupSettings.ts";
import { SupabaseEventPopupRepository } from "./event-popup/infrastructure/SupabaseEventPopupRepository.ts";
import { CreateEvent } from "./events/application/CreateEvent.ts";
import { DeleteEvent } from "./events/application/DeleteEvent.ts";
import { ListEvents } from "./events/application/ListEvents.ts";
import { UpdateEvent } from "./events/application/UpdateEvent.ts";
import { SupabaseEventRepository } from "./events/infrastructure/SupabaseEventRepository.ts";
import { EventController } from "./events/presentation/EventController.ts";
import { CreateGalleryImage } from "./gallery/application/CreateGalleryImage.ts";
import { DeleteGalleryImage } from "./gallery/application/DeleteGalleryImage.ts";
import { ListGalleryImages } from "./gallery/application/ListGalleryImages.ts";
import { SupabaseGalleryRepository } from "./gallery/infrastructure/SupabaseGalleryRepository.ts";
import { GalleryController } from "./gallery/presentation/GalleryController.ts";
import { GetGivingSettings } from "./giving/application/GetGivingSettings.ts";
import { UpdateGivingSettings } from "./giving/application/UpdateGivingSettings.ts";
import { SupabaseGivingRepository } from "./giving/infrastructure/SupabaseGivingRepository.ts";
import { GivingController } from "./giving/presentation/GivingController.ts";
import { SupabaseMinistryRepository } from "./ministries/infrastructure/SupabaseMinistryRepository.ts";
import { MinistryController } from "./ministries/presentation/MinistryController.ts";
import { CreatePastor } from "./pastors/application/CreatePastor.ts";
import { DeletePastor } from "./pastors/application/DeletePastor.ts";
import { ListPastors } from "./pastors/application/ListPastors.ts";
import { SortPastors } from "./pastors/application/SortPastors.ts";
import { UpdatePastor } from "./pastors/application/UpdatePastor.ts";
import { SupabasePastorRepository } from "./pastors/infrastructure/SupabasePastorRepository.ts";
import { PastorController } from "./pastors/presentation/PastorController.ts";
import { CreateSermon } from "./sermons/application/CreateSermon.ts";
import { DeleteSermon } from "./sermons/application/DeleteSermon.ts";
import { GetLatestSermon } from "./sermons/application/GetLatestSermon.ts";
import { ListSermons } from "./sermons/application/ListSermons.ts";
import { UpdateSermon } from "./sermons/application/UpdateSermon.ts";
import { SupabaseSermonRepository } from "./sermons/infrastructure/SupabaseSermonRepository.ts";
import { SermonController } from "./sermons/presentation/SermonController.ts";
import { SupabaseServiceTimeRepository } from "./service-times/infrastructure/SupabaseServiceTimeRepository.ts";
import { ServiceTimeController } from "./service-times/presentation/ServiceTimeController.ts";

export type ContentHandler = (input: unknown) => Promise<unknown>;
export type ContentRoutes = Record<
  string,
  Record<string, ContentHandler>
>;

export function createContentModule(client: SupabaseClient): ContentRoutes {
  const ministryController = createMinistryController(client);
  const eventController = createEventController(client);
  const serviceTimeController = createServiceTimeController(client);
  const churchInfoController = createChurchInfoController(client);
  const sermonController = createSermonController(client);
  const galleryController = createGalleryController(client);
  const pastorController = createPastorController(client);
  const eventPopupController = createEventPopupController(client);
  const givingController = createGivingController(client);

  return {
    ministries: {
      list: () => ministryController.list(),
      create: (input) => ministryController.create(input),
      update: (input) => ministryController.update(asRecordWithId(input)),
      delete: (input) => ministryController.delete(asIdInput(input)),
      sort: (input) => ministryController.sort(asSortItems(input)),
    },
    events: {
      list: () => eventController.list(),
      create: (input) => eventController.create(input),
      update: (input) => eventController.update(asRecordWithId(input)),
      delete: (input) => eventController.delete(asIdInput(input)),
    },
    "service-times": {
      list: () => serviceTimeController.list(),
      create: (input) => serviceTimeController.create(input),
      update: (input) => serviceTimeController.update(asRecordWithId(input)),
      delete: (input) => serviceTimeController.delete(asIdInput(input)),
      sort: (input) => serviceTimeController.sort(asSortItems(input)),
    },
    "church-info": {
      get: () => churchInfoController.get(),
      update: (input) => churchInfoController.update(asRecordWithId(input)),
    },
    sermons: {
      list: () => sermonController.list(),
      latest: () => sermonController.latest(),
      create: (input) => sermonController.create(input),
      update: (input) => sermonController.update(asRecordWithId(input)),
      delete: (input) => sermonController.delete(asIdInput(input)),
    },
    gallery: {
      list: () => galleryController.list(),
      create: (input) => galleryController.create(input),
      delete: (input) => galleryController.delete(asIdInput(input)),
    },
    pastors: {
      list: () => pastorController.list(),
      create: (input) => pastorController.create(input),
      update: (input) => pastorController.update(asRecordWithId(input)),
      delete: (input) => pastorController.delete(asIdInput(input)),
      sort: (input) => pastorController.sort(asSortItems(input)),
    },
    "event-popup": {
      get: () => eventPopupController.get(),
      upsert: (input) => eventPopupController.upsert(input as never),
    },
    giving: {
      get: () => givingController.get(),
      update: (input) => givingController.update(input as never),
    },
  };
}

function createMinistryController(client: SupabaseClient): MinistryController {
  const repository = new SupabaseMinistryRepository(client);
  return new MinistryController(repository);
}

function createEventController(client: SupabaseClient): EventController {
  const repository = new SupabaseEventRepository(client);
  return new EventController(
    new ListEvents(repository),
    new CreateEvent(repository),
    new UpdateEvent(repository),
    new DeleteEvent(repository),
  );
}

function createServiceTimeController(
  client: SupabaseClient,
): ServiceTimeController {
  return new ServiceTimeController(new SupabaseServiceTimeRepository(client));
}

function createChurchInfoController(
  client: SupabaseClient,
): ChurchInfoController {
  const repository = new SupabaseChurchInfoRepository(client);
  return new ChurchInfoController(
    new GetChurchInfo(repository),
    new UpdateChurchInfo(repository),
  );
}

function createSermonController(client: SupabaseClient): SermonController {
  const repository = new SupabaseSermonRepository(client);
  return new SermonController(
    new ListSermons(repository),
    new GetLatestSermon(repository),
    new CreateSermon(repository),
    new UpdateSermon(repository),
    new DeleteSermon(repository),
  );
}

function createGalleryController(client: SupabaseClient): GalleryController {
  const repository = new SupabaseGalleryRepository(client);
  return new GalleryController(
    new ListGalleryImages(repository),
    new CreateGalleryImage(repository),
    new DeleteGalleryImage(repository),
  );
}

function createPastorController(client: SupabaseClient): PastorController {
  const repository = new SupabasePastorRepository(client);
  return new PastorController(
    new ListPastors(repository),
    new CreatePastor(repository),
    new UpdatePastor(repository),
    new DeletePastor(repository),
    new SortPastors(repository),
  );
}

function createEventPopupController(
  client: SupabaseClient,
): EventPopupController {
  const repository = new SupabaseEventPopupRepository(client);
  return new EventPopupController(
    new GetEventPopupSettings(repository),
    new UpsertEventPopupSettings(repository),
  );
}

function createGivingController(client: SupabaseClient): GivingController {
  const repository = new SupabaseGivingRepository(client);
  return new GivingController(
    new GetGivingSettings(repository),
    new UpdateGivingSettings(repository),
  );
}

function asIdInput(input: unknown): { id: string } {
  return input as { id: string };
}

function asRecordWithId(
  input: unknown,
): { id: string } & Record<string, unknown> {
  return input as { id: string } & Record<string, unknown>;
}

function asSortItems(
  input: unknown,
): Array<{ id: string; sort_order: number }> {
  return input as Array<{ id: string; sort_order: number }>;
}
