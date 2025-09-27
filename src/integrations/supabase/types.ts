export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          lesson_id: string | null
          name: string
          requirements: Json | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          lesson_id?: string | null
          name: string
          requirements?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          lesson_id?: string | null
          name?: string
          requirements?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          last_accessed_at: string
          lesson_id: string
          progress_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          last_accessed_at?: string
          lesson_id: string
          progress_percentage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          last_accessed_at?: string
          lesson_id?: string
          progress_percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_videos: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          last_watched_at: string | null
          lesson_id: string
          updated_at: string
          user_id: string
          video_position: number | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          last_watched_at?: string | null
          lesson_id: string
          updated_at?: string
          user_id: string
          video_position?: number | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          last_watched_at?: string | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
          video_position?: number | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          category: string
          content: Json
          created_at: string
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          is_published: boolean
          order_index: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: Json
          created_at?: string
          description: string
          difficulty: string
          duration_minutes?: number
          id?: string
          is_published?: boolean
          order_index?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          is_published?: boolean
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_submissions: {
        Row: {
          created_at: string
          id: string
          mission_id: string
          points_awarded: number | null
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          submission_data: Json | null
          submission_files: string[] | null
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mission_id: string
          points_awarded?: number | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submission_data?: Json | null
          submission_files?: string[] | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mission_id?: string
          points_awarded?: number | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submission_data?: Json | null
          submission_files?: string[] | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_submissions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          estimated_time: string
          id: string
          instructions: string
          is_active: boolean
          lesson_id: string | null
          points: number
          requirements: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          estimated_time: string
          id?: string
          instructions: string
          is_active?: boolean
          lesson_id?: string | null
          points?: number
          requirements?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          estimated_time?: string
          id?: string
          instructions?: string
          is_active?: boolean
          lesson_id?: string | null
          points?: number
          requirements?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: string[] | null
          completed_lessons: number
          completed_missions: number
          created_at: string
          display_name: string | null
          eco_points: number
          gender: string | null
          id: string
          last_activity_date: string | null
          level: number
          organization_name: string | null
          region_country: string | null
          region_district: string | null
          region_state: string | null
          role: string
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[] | null
          completed_lessons?: number
          completed_missions?: number
          created_at?: string
          display_name?: string | null
          eco_points?: number
          gender?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number
          organization_name?: string | null
          region_country?: string | null
          region_district?: string | null
          region_state?: string | null
          role?: string
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          badges?: string[] | null
          completed_lessons?: number
          completed_missions?: number
          created_at?: string
          display_name?: string | null
          eco_points?: number
          gender?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number
          organization_name?: string | null
          region_country?: string | null
          region_district?: string | null
          region_state?: string | null
          role?: string
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      organization_leaderboard: {
        Row: {
          avg_eco_points: number | null
          organization_name: string | null
          region_country: string | null
          region_district: string | null
          region_state: string | null
          student_count: number | null
          total_eco_points: number | null
          total_lessons_completed: number | null
          total_missions_completed: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
