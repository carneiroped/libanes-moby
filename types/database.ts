export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InterestLevel = 'baixo' | 'médio' | 'alto' | 'muito_alto'

export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string
          user_id: string | null
          user_name: string | null
          user_message: string | null
          bot_message: string | null
          phone: string | null
          conversation_id: string | null
          timestamp: string | null
          app: string | null
          active: boolean | null
          message_type: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_name?: string | null
          user_message?: string | null
          bot_message?: string | null
          phone?: string | null
          conversation_id?: string | null
          timestamp?: string | null
          app?: string | null
          active?: boolean | null
          message_type?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          user_name?: string | null
          user_message?: string | null
          bot_message?: string | null
          phone?: string | null
          conversation_id?: string | null
          timestamp?: string | null
          app?: string | null
          active?: boolean | null
          message_type?: string | null
        }
        Relationships: []
      }
      api_credentials: {
        Row: {
          id: string
          service: string
          name: string
          credentials: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service: string
          name: string
          credentials: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service?: string
          name?: string
          credentials?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          id: string
          phone: string
          conversation_id: string | null
          updated_at: string | null
          app: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          phone: string
          conversation_id?: string | null
          updated_at?: string | null
          app?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          phone?: string
          conversation_id?: string | null
          updated_at?: string | null
          app?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          content: string | null
          metadata: Json | null
          embedding: unknown | null
          created_at: string | null
        }
        Insert: {
          id?: string
          content?: string | null
          metadata?: Json | null
          embedding?: unknown | null
          created_at?: string | null
        }
        Update: {
          id?: string
          content?: string | null
          metadata?: Json | null
          embedding?: unknown | null
          created_at?: string | null
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          id: string
          descricao: string | null
          bairro: string | null
          cidade: string | null
          lat: number | null
          long: number | null
          m2: number | null
          quartos: number | null
          garagem: number | null
          foto: string | null
          valor: number | null
          created_at: string | null
          updated_at: string | null
          banheiros: number | null
          loc_venda: string | null
        }
        Insert: {
          id?: string
          descricao?: string | null
          bairro?: string | null
          cidade?: string | null
          lat?: number | null
          long?: number | null
          m2?: number | null
          quartos?: number | null
          garagem?: number | null
          foto?: string | null
          valor?: number | null
          created_at?: string | null
          updated_at?: string | null
          banheiros?: number | null
          loc_venda?: string | null
        }
        Update: {
          id?: string
          descricao?: string | null
          bairro?: string | null
          cidade?: string | null
          lat?: number | null
          long?: number | null
          m2?: number | null
          quartos?: number | null
          garagem?: number | null
          foto?: string | null
          valor?: number | null
          created_at?: string | null
          updated_at?: string | null
          banheiros?: number | null
          loc_venda?: string | null
        }
        Relationships: []
      }
      lead_stages: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          sort_order: number
          created_at: string | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          color: string
          sort_order: number
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          sort_order?: number
          created_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          contact_name: string
          phone_number: string
          email: string
          interest_level: string
          stage_id: string | null
          assigned_to: string | null
          lead_source: string
          budget_min: number | null
          budget_max: number | null
          preferred_areas: string[] | null
          property_type: string[] | null
          bedrooms: number | null
          last_contact_date: string | null
          chat_id: string | null
          notes: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          contact_name: string
          phone_number: string
          email: string
          interest_level?: string
          stage_id?: string | null
          assigned_to?: string | null
          lead_source?: string
          budget_min?: number | null
          budget_max?: number | null
          preferred_areas?: string[] | null
          property_type?: string[] | null
          bedrooms?: number | null
          last_contact_date?: string | null
          chat_id?: string | null
          notes?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          contact_name?: string
          phone_number?: string
          email?: string
          interest_level?: string
          stage_id?: string | null
          assigned_to?: string | null
          lead_source?: string
          budget_min?: number | null
          budget_max?: number | null
          preferred_areas?: string[] | null
          property_type?: string[] | null
          bedrooms?: number | null
          last_contact_date?: string | null
          chat_id?: string | null
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "lead_stages"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          content: string
          created_at: string
          created_by: string | null
          is_pinned: boolean
        }
        Insert: {
          id?: string
          lead_id: string
          content: string
          created_at?: string
          created_by?: string | null
          is_pinned?: boolean
        }
        Update: {
          id?: string
          lead_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          is_pinned?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_followups: {
        Row: {
          id: string
          lead_id: string
          title: string
          description: string | null
          due_date: string
          created_at: string
          created_by: string | null
          assigned_to: string | null
          is_completed: boolean
          completed_at: string | null
          priority: string
        }
        Insert: {
          id?: string
          lead_id: string
          title: string
          description?: string | null
          due_date: string
          created_at?: string
          created_by?: string | null
          assigned_to?: string | null
          is_completed?: boolean
          completed_at?: string | null
          priority?: string
        }
        Update: {
          id?: string
          lead_id?: string
          title?: string
          description?: string | null
          due_date?: string
          created_at?: string
          created_by?: string | null
          assigned_to?: string | null
          is_completed?: boolean
          completed_at?: string | null
          priority?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_stage_history: {
        Row: {
          id: string
          lead_id: string
          from_stage_id: string | null
          to_stage_id: string
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          from_stage_id?: string | null
          to_stage_id: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          from_stage_id?: string | null
          to_stage_id?: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_stage_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "lead_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "lead_stages"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          transaction_type: string
          lead_id: string | null
          property_id: string | null
          sale_value: number | null
          commission_value: number | null
          commission_percentage: number | null
          signed_at: string | null
          start_date: string | null
          end_date: string | null
          contract_number: string | null
          contract_file_url: string | null
          payment_method: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          transaction_type: string
          lead_id?: string | null
          property_id?: string | null
          sale_value?: number | null
          commission_value?: number | null
          commission_percentage?: number | null
          signed_at?: string | null
          start_date?: string | null
          end_date?: string | null
          contract_number?: string | null
          contract_file_url?: string | null
          payment_method?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          transaction_type?: string
          lead_id?: string | null
          property_id?: string | null
          sale_value?: number | null
          commission_value?: number | null
          commission_percentage?: number | null
          signed_at?: string | null
          start_date?: string | null
          end_date?: string | null
          contract_number?: string | null
          contract_file_url?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          avatar_url: string | null
          role: string
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          avatar_url?: string | null
          role?: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          role?: string
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      moby_chats: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moby_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      moby_chat_messages: {
        Row: {
          id: string
          chat_id: string
          role: string
          content: string
          timestamp: string
          tokens_used: number | null
        }
        Insert: {
          id?: string
          chat_id: string
          role: string
          content: string
          timestamp?: string
          tokens_used?: number | null
        }
        Update: {
          id?: string
          chat_id?: string
          role?: string
          content?: string
          timestamp?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moby_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "moby_chats"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_interactions: {
        Row: {
          id: string
          lead_id: string
          interaction_type: string
          user_id: string | null
          description: string | null
          duration_minutes: number | null
          outcome: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          interaction_type: string
          user_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          outcome?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          interaction_type?: string
          user_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          outcome?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_property_visits: {
        Row: {
          id: string
          lead_id: string
          property_id: string
          user_id: string | null
          visit_date: string | null
          feedback: string | null
          interest_level: InterestLevel
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          property_id: string
          user_id?: string | null
          visit_date?: string | null
          feedback?: string | null
          interest_level?: InterestLevel
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          property_id?: string
          user_id?: string | null
          visit_date?: string | null
          feedback?: string | null
          interest_level?: InterestLevel
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_property_visits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_property_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_property_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // Tabelas planejadas para futuras implementações comentadas abaixo
      /*
      moby_site_chats: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      moby_site_chat_messages: {
        Row: {
          id: string
          chat_id: string
          role: string
          content: string
          timestamp: string
          tokens_used: number | null
        }
        Insert: {
          id?: string
          chat_id: string
          role: string
          content: string
          timestamp?: string
          tokens_used?: number | null
        }
        Update: {
          id?: string
          chat_id?: string
          role?: string
          content?: string
          timestamp?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moby_site_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "moby_site_chats"
            referencedColumns: ["id"]
          }
        ]
      }
      moby_site_knowledge_base: {
        Row: {
          id: string
          title: string
          content: string
          category: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      */
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_lead_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      },
      generate_sales_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      },
      get_average_sale_value: {
        Args: Record<PropertyKey, never>
        Returns: Json
      },
      match_documents: {
        Args: {
          query_embedding: unknown
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
        }[]
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