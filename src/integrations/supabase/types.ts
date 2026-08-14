export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      church_info: {
        Row: {
          address: string | null;
          church_name: string | null;
          city: string | null;
          created_at: string;
          email: string | null;
          fallback_stream_url: string | null;
          id: string;
          office_hours: string | null;
          pastor_email: string | null;
          pastor_name: string | null;
          pastor_phone: string | null;
          phone: string | null;
          state: string | null;
          updated_at: string;
          zip: string | null;
        };
        Insert: {
          address?: string | null;
          church_name?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          fallback_stream_url?: string | null;
          id?: string;
          office_hours?: string | null;
          pastor_email?: string | null;
          pastor_name?: string | null;
          pastor_phone?: string | null;
          phone?: string | null;
          state?: string | null;
          updated_at?: string;
          zip?: string | null;
        };
        Update: {
          address?: string | null;
          church_name?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          fallback_stream_url?: string | null;
          id?: string;
          office_hours?: string | null;
          pastor_email?: string | null;
          pastor_name?: string | null;
          pastor_phone?: string | null;
          phone?: string | null;
          state?: string | null;
          updated_at?: string;
          zip?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          created_at: string;
          description: string | null;
          event_date: string;
          event_time: string | null;
          id: string;
          image_url: string | null;
          location: string | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ministries: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          leader: string | null;
          meeting_time: string | null;
          name: string;
          sort_order: number | null;
          category: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          leader?: string | null;
          meeting_time?: string | null;
          name: string;
          sort_order?: number | null;
          category?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          leader?: string | null;
          meeting_time?: string | null;
          name?: string;
          sort_order?: number | null;
          category?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_times: {
        Row: {
          audience: string | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          sort_order: number | null;
          time: string;
          updated_at: string;
        };
        Insert: {
          audience?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          sort_order?: number | null;
          time: string;
          updated_at?: string;
        };
        Update: {
          audience?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          sort_order?: number | null;
          time?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_visits: {
        Row: {
          id: string;
          page_path: string;
          visitor_id: string | null;
          user_agent: string | null;
          ip_address: string | null;
          referrer: string | null;
          session_id: string | null;
          visited_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_path: string;
          visitor_id?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          referrer?: string | null;
          session_id?: string | null;
          visited_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_path?: string;
          visitor_id?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          referrer?: string | null;
          session_id?: string | null;
          visited_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      analytics_daily_stats: {
        Row: {
          id: string;
          date: string;
          page_path: string;
          total_visits: number;
          unique_visitors: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          page_path: string;
          total_visits?: number;
          unique_visitors?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          page_path?: string;
          total_visits?: number;
          unique_visitors?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_overall_stats: {
        Row: {
          id: string;
          total_visits: number;
          unique_visitors: number;
          total_pages_tracked: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          total_visits?: number;
          unique_visitors?: number;
          total_pages_tracked?: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          total_visits?: number;
          unique_visitors?: number;
          total_pages_tracked?: number;
          last_updated?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      sermons: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          speaker: string;
          sermon_date: string;
          video_url: string | null;
          audio_url: string | null;
          scripture_reference: string | null;
          series_name: string | null;
          thumbnail_url: string | null;
          duration_minutes: number | null;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          speaker: string;
          sermon_date: string;
          video_url?: string | null;
          audio_url?: string | null;
          scripture_reference?: string | null;
          series_name?: string | null;
          thumbnail_url?: string | null;
          duration_minutes?: number | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          speaker?: string;
          sermon_date?: string;
          video_url?: string | null;
          audio_url?: string | null;
          scripture_reference?: string | null;
          series_name?: string | null;
          thumbnail_url?: string | null;
          duration_minutes?: number | null;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          image_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pastors: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          title: string | null;
          bio: string | null;
          image_url: string | null;
          facebook_url: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          title?: string | null;
          bio?: string | null;
          image_url?: string | null;
          facebook_url?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          title?: string | null;
          bio?: string | null;
          image_url?: string | null;
          facebook_url?: string | null;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_popup_settings: {
        Row: {
          id: string;
          singleton_key: boolean;
          event_id: string | null;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          singleton_key?: boolean;
          event_id?: string | null;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          singleton_key?: boolean;
          event_id?: string | null;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      giving_settings: {
        Row: {
          id: string;
          gcash_qr_url: string | null;
          donation_platform_name: string;
          donation_platform_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gcash_qr_url?: string | null;
          donation_platform_name?: string;
          donation_platform_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gcash_qr_url?: string | null;
          donation_platform_name?: string;
          donation_platform_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
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
        };
        Insert: {
          id?: string;
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
          created_at?: string;
        };
        Update: {
          id?: string;
          action_type?: string;
          action_description?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          user_id?: string | null;
          user_email?: string | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          page_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_allowed_tabs: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      get_analytics_summary: {
        Args: {
          days_back?: number;
        };
        Returns: {
          total_visits: number;
          unique_visitors: number;
          total_pages: number;
          avg_daily_visits: number;
          top_pages: Json;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user" | "moderator";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const;
