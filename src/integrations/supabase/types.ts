export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      circle_invitations: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          invitee_id: string
          inviter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_invitations_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_messages: {
        Row: {
          circle_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          circle_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_messages_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          is_private: boolean
          location: string | null
          member_count: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_private?: boolean
          location?: string | null
          member_count?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_private?: boolean
          location?: string | null
          member_count?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_requests: {
        Row: {
          created_at: string
          id: string
          location: string | null
          message: string | null
          proposed_datetime: string | null
          requested_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          message?: string | null
          proposed_datetime?: string | null
          requested_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          message?: string | null
          proposed_datetime?: string | null
          requested_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_results: {
        Row: {
          completed_at: string
          created_at: string
          duration_minutes: number | null
          id: string
          match_request_id: string
          player1_score: string | null
          player2_score: string | null
          score: string | null
          status: string | null
          submitted_at: string | null
          submitted_by_id: string | null
          verified_at: string | null
          verified_by_id: string | null
          winner_id: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          match_request_id: string
          player1_score?: string | null
          player2_score?: string | null
          score?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by_id?: string | null
          verified_at?: string | null
          verified_by_id?: string | null
          winner_id?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          match_request_id?: string
          player1_score?: string | null
          player2_score?: string | null
          score?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by_id?: string | null
          verified_at?: string | null
          verified_by_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_match_request_id_fkey"
            columns: ["match_request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_ratings: {
        Row: {
          created_at: string
          id: string
          match_result_id: string
          notes: string | null
          rated_player_id: string
          rater_id: string
          skill_assessment: string
          sportsmanship_rating: number | null
          would_play_again: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_result_id: string
          notes?: string | null
          rated_player_id: string
          rater_id: string
          skill_assessment: string
          sportsmanship_rating?: number | null
          would_play_again?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          match_result_id?: string
          notes?: string | null
          rated_player_id?: string
          rater_id?: string
          skill_assessment?: string
          sportsmanship_rating?: number | null
          would_play_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "player_ratings_match_result_id_fkey"
            columns: ["match_result_id"]
            isOneToOne: false
            referencedRelation: "match_results"
            referencedColumns: ["id"]
          },
        ]
      }
      player_recommendations: {
        Row: {
          created_at: string
          expires_at: string
          factors_matched: string[] | null
          id: string
          reasoning: string | null
          recommendation_score: number | null
          recommended_player_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          factors_matched?: string[] | null
          id?: string
          reasoning?: string | null
          recommendation_score?: number | null
          recommended_player_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          factors_matched?: string[] | null
          id?: string
          reasoning?: string | null
          recommendation_score?: number | null
          recommended_player_id?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      rating_history: {
        Row: {
          created_at: string
          id: string
          new_rating: number
          old_rating: number
          player_id: string
          reason: string
          triggered_by_rating_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_rating: number
          old_rating: number
          player_id: string
          reason: string
          triggered_by_rating_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_rating?: number
          old_rating?: number
          player_id?: string
          reason?: string
          triggered_by_rating_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rating_history_triggered_by_rating_id_fkey"
            columns: ["triggered_by_rating_id"]
            isOneToOne: false
            referencedRelation: "player_ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_contacts: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          is_primary: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      safety_shares: {
        Row: {
          estimated_duration_minutes: number | null
          id: string
          location_shared: boolean | null
          match_request_id: string
          opponent_info_shared: boolean | null
          safety_contact_id: string
          shared_at: string
          user_id: string
        }
        Insert: {
          estimated_duration_minutes?: number | null
          id?: string
          location_shared?: boolean | null
          match_request_id: string
          opponent_info_shared?: boolean | null
          safety_contact_id: string
          shared_at?: string
          user_id: string
        }
        Update: {
          estimated_duration_minutes?: number | null
          id?: string
          location_shared?: boolean | null
          match_request_id?: string
          opponent_info_shared?: boolean | null
          safety_contact_id?: string
          shared_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_shares_match_request_id_fkey"
            columns: ["match_request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_shares_safety_contact_id_fkey"
            columns: ["safety_contact_id"]
            isOneToOne: false
            referencedRelation: "safety_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessment_streaks: {
        Row: {
          assessment_type: string
          consecutive_count: number | null
          created_at: string
          id: string
          last_assessment_date: string | null
          player_id: string
          updated_at: string
        }
        Insert: {
          assessment_type: string
          consecutive_count?: number | null
          created_at?: string
          id?: string
          last_assessment_date?: string | null
          player_id: string
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          consecutive_count?: number | null
          created_at?: string
          id?: string
          last_assessment_date?: string | null
          player_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_preferred: boolean | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_preferred?: boolean | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_preferred?: boolean | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          availability_notes: string | null
          bio: string | null
          created_at: string
          current_rating: number | null
          full_name: string | null
          google_calendar_connected: boolean | null
          google_calendar_token: string | null
          id: string
          is_active: boolean | null
          location: string | null
          playing_style: string | null
          preferred_location: string | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          availability_notes?: string | null
          bio?: string | null
          created_at?: string
          current_rating?: number | null
          full_name?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_token?: string | null
          id: string
          is_active?: boolean | null
          location?: string | null
          playing_style?: string | null
          preferred_location?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          availability_notes?: string | null
          bio?: string | null
          created_at?: string
          current_rating?: number | null
          full_name?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_token?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          playing_style?: string | null
          preferred_location?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_head_to_head_stats: {
        Args: { player1_id: string; player2_id: string }
        Returns: Json
      }
      get_player_stats: {
        Args: { player_id: string }
        Returns: Json
      }
      get_unread_message_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      mark_messages_as_read: {
        Args: { sender_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
