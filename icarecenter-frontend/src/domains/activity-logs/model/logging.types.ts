// TypeScript types for the logging database

export interface ActivityLog {
  id: string;
  action_type: string;
  action_description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  user_email: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  page_path: string | null;
  created_at: string;
}

export interface ActivityLogInsert {
  action_type: string;
  action_description?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  user_id?: string | null;
  user_email?: string | null;
  metadata?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  page_path?: string | null;
}

export interface LoggingDatabase {
  public: {
    Tables: {
      activity_logs: {
        Row: ActivityLog;
        Insert: ActivityLogInsert;
        Update: Partial<ActivityLogInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Action type constants for consistent logging
export const LOG_ACTION_TYPES = {
  // Page visits
  PAGE_VISIT: "page_visit",

  // Authentication
  LOGIN: "login",
  LOGOUT: "logout",
  PASSWORD_CHANGE: "password_change",

  // Events
  CREATE_EVENT: "create_event",
  UPDATE_EVENT: "update_event",
  DELETE_EVENT: "delete_event",

  // Ministries
  CREATE_MINISTRY: "create_ministry",
  UPDATE_MINISTRY: "update_ministry",
  DELETE_MINISTRY: "delete_ministry",

  // Sermons
  CREATE_SERMON: "create_sermon",
  UPDATE_SERMON: "update_sermon",
  DELETE_SERMON: "delete_sermon",

  // Gallery
  UPLOAD_IMAGE: "upload_image",
  DELETE_IMAGE: "delete_image",

  // Users
  CREATE_USER: "create_user",
  UPDATE_USER_ROLE: "update_user_role",
  DELETE_USER: "delete_user",

  // Church Info
  UPDATE_CHURCH_INFO: "update_church_info",

  // Pastors
  CREATE_PASTOR: "create_pastor",
  UPDATE_PASTOR: "update_pastor",
  DELETE_PASTOR: "delete_pastor",

  // Service Times
  CREATE_SERVICE_TIME: "create_service_time",
  UPDATE_SERVICE_TIME: "update_service_time",
  DELETE_SERVICE_TIME: "delete_service_time",

  // Giving
  UPDATE_GIVING_INFO: "update_giving_info",

  // Logs management
  CLEAR_LOGS: "clear_logs",
  EXPORT_LOGS: "export_logs",
} as const;

export type LogActionType =
  (typeof LOG_ACTION_TYPES)[keyof typeof LOG_ACTION_TYPES];
