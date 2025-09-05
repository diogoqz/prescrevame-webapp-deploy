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
      contatos: {
        Row: {
          remoteJid: string | null
          status: string | null
        }
        Insert: {
          remoteJid?: string | null
          status?: string | null
        }
        Update: {
          remoteJid?: string | null
          status?: string | null
        }
        Relationships: []
      }
      historico: {
        Row: {
          acessos: number | null
          created_at: string
          fonte: string | null
          id: number
          output: string | null
          prompt: string | null
          remotejid: string | null
        }
        Insert: {
          acessos?: number | null
          created_at?: string
          fonte?: string | null
          id?: number
          output?: string | null
          prompt?: string | null
          remotejid?: string | null
        }
        Update: {
          acessos?: number | null
          created_at?: string
          fonte?: string | null
          id?: number
          output?: string | null
          prompt?: string | null
          remotejid?: string | null
        }
        Relationships: []
      }
      image_analysis: {
        Row: {
          created_at: string
          id: string
          image_url: string
          model: string
          prompt: string
          response: string
          temperature: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          model: string
          prompt: string
          response: string
          temperature: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          model?: string
          prompt?: string
          response?: string
          temperature?: number
          user_id?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          id: string
          code: string
          email: string | null
          used: boolean
          used_at: string | null
          created_at: string
          updated_at: string
          invite_type: string
          days_valid: number
          description: string | null
        }
        Insert: {
          id?: string
          code: string
          email?: string | null
          used?: boolean
          used_at?: string | null
          created_at?: string
          updated_at?: string
          invite_type?: string
          days_valid?: number
          description?: string | null
        }
        Update: {
          id?: string
          code?: string
          email?: string | null
          used?: boolean
          used_at?: string | null
          created_at?: string
          updated_at?: string
          invite_type?: string
          days_valid?: number
          description?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          nome: string | null
          status: string
          created_at: string
          updated_at: string
          activated_at: string | null
          expires_at: string | null
          invite_type: string | null
          days_valid: number | null
          cpf: string | null
          whatsapp: string | null
          profissao: string | null
          is_trial: boolean | null
          trial_started_at: string | null
          trial_expires_at: string | null
        }
        Insert: {
          id?: string
          email: string
          nome?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          activated_at?: string | null
          expires_at?: string | null
          invite_type?: string | null
          days_valid?: number | null
          cpf?: string | null
          whatsapp?: string | null
          profissao?: string | null
          is_trial?: boolean | null
          trial_started_at?: string | null
          trial_expires_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          nome?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          activated_at?: string | null
          expires_at?: string | null
          invite_type?: string | null
          days_valid?: number | null
          cpf?: string | null
          whatsapp?: string | null
          profissao?: string | null
          is_trial?: boolean | null
          trial_started_at?: string | null
          trial_expires_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
