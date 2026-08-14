// Service layer exports
// Import these directly from specific service files for best performance
// Example: import { profileService } from '@/integrations/supabase/services/profiles.service'

export type { AdminUserProfile } from "./admin.service";
export { adminService } from "./admin.service";
export type { UserRole, UserRoleData } from "@/domains/auth/api/auth.api";
export { authService } from "@/domains/auth/api/auth.api";
export type { ChurchInfo } from "./church-info.service";
export { churchInfoService } from "./church-info.service";
export type { EventPopupSettings } from "./event-popup.service";
export { eventPopupService } from "./event-popup.service";
export { eventsService } from "@/domains/events/api/events.api";
export type { GalleryImage } from "@/domains/gallery/model/gallery.types";
export { galleryApi } from "@/domains/gallery/api/gallery.api";
export type { GivingSettings } from "@/domains/giving/model/giving.types";
export { givingService } from "@/domains/giving/api/giving.api";
export { ministriesService } from "./ministries.service";
export { pastorsService } from "./pastors.service";
export type { ProfileData, UpdateProfileParams } from "./profiles.service";
export { profileService } from "./profiles.service";
export { sermonsApi } from "@/domains/sermons/api/sermons.api";
export type { ServiceTime } from "@/domains/service-times/model/service-times.types";
export { serviceTimesApi } from "@/domains/service-times/api/service-times.api";
export type {
  UploadImageParams,
  UploadImageResult,
} from "@/infrastructure/supabase/storage";
export { storageService } from "@/infrastructure/supabase/storage";
export type {
  CreateUserRoleParams,
  DeleteUserParams,
  UpdateUserRoleParams,
} from "./users.service";
export { usersService } from "./users.service";
