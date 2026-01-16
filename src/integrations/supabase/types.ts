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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      biodynamic_preparations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          preparation: Database["public"]["Enums"]["preparation_type"]
          price: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          preparation: Database["public"]["Enums"]["preparation_type"]
          price?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          preparation?: Database["public"]["Enums"]["preparation_type"]
          price?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      farmer_profiles: {
        Row: {
          activity_types: Database["public"]["Enums"]["app_role"][]
          approximate_location: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_web: string | null
          created_at: string
          farm_name: string
          id: string
          postal_code: string | null
          preferred_language: string | null
          presentation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_types?: Database["public"]["Enums"]["app_role"][]
          approximate_location?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_web?: string | null
          created_at?: string
          farm_name: string
          id?: string
          postal_code?: string | null
          preferred_language?: string | null
          presentation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_types?: Database["public"]["Enums"]["app_role"][]
          approximate_location?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_web?: string | null
          created_at?: string
          farm_name?: string
          id?: string
          postal_code?: string | null
          preferred_language?: string | null
          presentation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_variations: {
        Row: {
          created_at: string
          id: string
          net_price: number | null
          packaging: string | null
          product_id: string
          unit: Database["public"]["Enums"]["product_unit"] | null
          updated_at: string
          variety: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          net_price?: number | null
          packaging?: string | null
          product_id: string
          unit?: Database["public"]["Enums"]["product_unit"] | null
          updated_at?: string
          variety?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          net_price?: number | null
          packaging?: string | null
          product_id?: string
          unit?: Database["public"]["Enums"]["product_unit"] | null
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          certifications:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          product_type: string | null
          season: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          product_type?: string | null
          season?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          product_type?: string | null
          season?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          last_unit_used: Database["public"]["Enums"]["product_unit"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_unit_used?: Database["public"]["Enums"]["product_unit"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_unit_used?: Database["public"]["Enums"]["product_unit"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_product: { Args: { _product_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "consumidor" | "agricultor" | "ganadero" | "elaborador"
      certification_type: "conciencia" | "ecologica" | "demeter"
      preparation_type:
        | "500"
        | "501"
        | "502"
        | "503"
        | "504"
        | "505"
        | "506"
        | "507"
        | "508"
        | "maria_thun"
      product_unit: "g" | "kg" | "unidad" | "litro" | "docena"
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
    Enums: {
      app_role: ["consumidor", "agricultor", "ganadero", "elaborador"],
      certification_type: ["conciencia", "ecologica", "demeter"],
      preparation_type: [
        "500",
        "501",
        "502",
        "503",
        "504",
        "505",
        "506",
        "507",
        "508",
        "maria_thun",
      ],
      product_unit: ["g", "kg", "unidad", "litro", "docena"],
    },
  },
} as const
