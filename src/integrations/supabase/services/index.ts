// Service layer exports
// Import these directly from specific service files for best performance
// Example: import { profileService } from '@/domains/auth/api/profile.api'

export type { AdminUserProfile } from "@/domains/auth/model/users.types";
export { adminService } from "@/domains/auth/api/users.api";
export type { UserRole, UserRoleData } from "@/domains/auth/api/auth.api";
export { authService } from "@/domains/auth/api/auth.api";
export type { ChurchInfo } from "@/domains/church-info/model/church-info.types";
export { churchInfoApi } from "@/domains/church-info/api/church-info.api";
export type { EventPopupSettings } from "@/domains/event-popup/model/event-popup.types";
export { eventPopupApi } from "@/domains/event-popup/api/event-popup.api";
export { eventsService } from "@/domains/events/api/events.api";
export type { GalleryImage } from "@/domains/gallery/model/gallery.types";
export { galleryApi } from "@/domains/gallery/api/gallery.api";
export type { GivingSettings } from "@/domains/giving/model/giving.types";
export { givingService } from "@/domains/giving/api/giving.api";
export { ministriesService } from "./ministries.service";
export { pastorsApi } from "@/domains/pastors/api/pastors.api";
export type { ProfileData, UpdateProfileParams } from "@/domains/auth/model/profile.types";
export { profileService } from "@/domains/auth/api/profile.api";
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
} from "@/domains/auth/model/users.types";
export { usersService } from "@/domains/auth/model/users.types";
