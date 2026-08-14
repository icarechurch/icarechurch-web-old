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
export type { GalleryImage } from "./gallery.service";
export { galleryService } from "./gallery.service";
export type { GivingSettings } from "./giving.service";
export { givingService } from "./giving.service";
export { ministriesService } from "./ministries.service";
export { pastorsService } from "./pastors.service";
export type { ProfileData, UpdateProfileParams } from "./profiles.service";
export { profileService } from "./profiles.service";
export { sermonsService } from "./sermons.service";
export type { ServiceTime } from "./service-times.service";
export { serviceTimesService } from "./service-times.service";
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
