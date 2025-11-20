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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          address: Json | null
          archived: boolean | null
          billing_email: string | null
          created_at: string | null
          id: string
          limits: Json | null
          name: string
          owner_id: string | null
          phone: string | null
          plan: string | null
          settings: Json | null
          status: string | null
          subdomain: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string | null
          usage: Json | null
        }
        Insert: {
          address?: Json | null
          archived?: boolean | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          limits?: Json | null
          name: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          settings?: Json | null
          status?: string | null
          subdomain?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          usage?: Json | null
        }
        Update: {
          address?: Json | null
          archived?: boolean | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          limits?: Json | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          settings?: Json | null
          status?: string | null
          subdomain?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          usage?: Json | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          lead_id: string | null
          metadata: Json | null
          outcome: string | null
          scheduled_at: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          outcome?: string | null
          scheduled_at?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          outcome?: string | null
          scheduled_at?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          account_id: string
          created_at: string | null
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          account_id: string
          actions: Json
          archived: boolean | null
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_execution: string | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          actions?: Json
          archived?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_execution?: string | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          actions?: Json
          archived?: boolean | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_execution?: string | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          account_id: string
          all_day: boolean | null
          attendees: string[] | null
          check_in_at: string | null
          check_in_location: Json | null
          check_out_at: string | null
          check_out_notes: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          lead_id: string | null
          location: string | null
          meeting_url: string | null
          metadata: Json | null
          property_id: string | null
          reminder_minutes: number | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          all_day?: boolean | null
          attendees?: string[] | null
          check_in_at?: string | null
          check_in_location?: Json | null
          check_out_at?: string | null
          check_out_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          meeting_url?: string | null
          metadata?: Json | null
          property_id?: string | null
          reminder_minutes?: number | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          all_day?: boolean | null
          attendees?: string[] | null
          check_in_at?: string | null
          check_in_location?: Json | null
          check_out_at?: string | null
          check_out_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          meeting_url?: string | null
          metadata?: Json | null
          property_id?: string | null
          reminder_minutes?: number | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          active: boolean | null
          app: string | null
          bot_message: string | null
          chat_id: number | null
          conversation_id: string | null
          created_at: string
          id: number
          media_url: string | null
          message_type: string | null
          metadata: Json | null
          phone: string | null
          status: string | null
          user_id: string | null
          user_message: string | null
          user_name: string | null
        }
        Insert: {
          active?: boolean | null
          app?: string | null
          bot_message?: string | null
          chat_id?: number | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          media_url?: string | null
          message_type?: string | null
          metadata?: Json | null
          phone?: string | null
          status?: string | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Update: {
          active?: boolean | null
          app?: string | null
          bot_message?: string | null
          chat_id?: number | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          media_url?: string | null
          message_type?: string | null
          metadata?: Json | null
          phone?: string | null
          status?: string | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          account_id: string | null
          app: string | null
          conversation_id: string | null
          created_at: string
          id: number
          lead_id: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          app?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          lead_id?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          app?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: number
          lead_id?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_analytics: {
        Row: {
          account_id: string | null
          analyzed_at: string | null
          average_sentiment: number | null
          chat_id: number
          critical_moments_count: number | null
          id: string
          metadata: Json | null
          sentiment_data: Json | null
          sentiment_trend: string | null
        }
        Insert: {
          account_id?: string | null
          analyzed_at?: string | null
          average_sentiment?: number | null
          chat_id: number
          critical_moments_count?: number | null
          id?: string
          metadata?: Json | null
          sentiment_data?: Json | null
          sentiment_trend?: string | null
        }
        Update: {
          account_id?: string | null
          analyzed_at?: string | null
          average_sentiment?: number | null
          chat_id?: number
          critical_moments_count?: number | null
          id?: string
          metadata?: Json | null
          sentiment_data?: Json | null
          sentiment_trend?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analytics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_analytics_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          account_id: string | null
          content: string | null
          created_at: string | null
          document_type: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          content?: string | null
          created_at?: string | null
          document_type?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          content?: string | null
          created_at?: string | null
          document_type?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          account_id: string
          archived: boolean | null
          created_at: string | null
          file_size: number | null
          file_type: string | null
          folder: string | null
          id: string
          is_public: boolean | null
          lead_id: string | null
          metadata: Json | null
          mime_type: string | null
          name: string
          original_name: string
          property_id: string | null
          related_to_id: string | null
          related_to_type: string | null
          storage_path: string
          storage_url: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          account_id: string
          archived?: boolean | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          is_public?: boolean | null
          lead_id?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name: string
          original_name: string
          property_id?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          storage_path: string
          storage_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          account_id?: string
          archived?: boolean | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          is_public?: boolean | null
          lead_id?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          original_name?: string
          property_id?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          storage_path?: string
          storage_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_integrations: {
        Row: {
          account_id: string
          client_id: string | null
          client_secret: string | null
          conversion_action_id: string | null
          created_at: string | null
          customer_id: string | null
          developer_token: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          settings: Json | null
          total_leads_converted: number | null
          total_leads_received: number | null
          updated_at: string | null
          webhook_secret: string
          webhook_url: string
        }
        Insert: {
          account_id: string
          client_id?: string | null
          client_secret?: string | null
          conversion_action_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          developer_token?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          settings?: Json | null
          total_leads_converted?: number | null
          total_leads_received?: number | null
          updated_at?: string | null
          webhook_secret: string
          webhook_url: string
        }
        Update: {
          account_id?: string
          client_id?: string | null
          client_secret?: string | null
          conversion_action_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          developer_token?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          settings?: Json | null
          total_leads_converted?: number | null
          total_leads_received?: number | null
          updated_at?: string | null
          webhook_secret?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_integrations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_leads: {
        Row: {
          account_id: string
          ad_group_id: string | null
          ad_group_name: string | null
          campaign_id: string | null
          campaign_name: string | null
          created_at: string | null
          creative_id: string | null
          email: string | null
          form_data: Json | null
          gclid: string | null
          id: string
          integration_id: string
          lead_id: string | null
          name: string | null
          phone: string | null
          processed_at: string | null
          status: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          account_id: string
          ad_group_id?: string | null
          ad_group_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string | null
          creative_id?: string | null
          email?: string | null
          form_data?: Json | null
          gclid?: string | null
          id?: string
          integration_id: string
          lead_id?: string | null
          name?: string | null
          phone?: string | null
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          account_id?: string
          ad_group_id?: string | null
          ad_group_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string | null
          creative_id?: string | null
          email?: string | null
          form_data?: Json | null
          gclid?: string | null
          id?: string
          integration_id?: string
          lead_id?: string | null
          name?: string | null
          phone?: string | null
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_leads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_ads_leads_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "google_ads_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_ads_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_webhook_logs: {
        Row: {
          account_id: string
          body: Json | null
          created_at: string | null
          error_message: string | null
          headers: Json | null
          id: string
          integration_id: string | null
          method: string
          processed: boolean | null
          query_params: Json | null
          response_body: Json | null
          status_code: number | null
        }
        Insert: {
          account_id: string
          body?: Json | null
          created_at?: string | null
          error_message?: string | null
          headers?: Json | null
          id?: string
          integration_id?: string | null
          method: string
          processed?: boolean | null
          query_params?: Json | null
          response_body?: Json | null
          status_code?: number | null
        }
        Update: {
          account_id?: string
          body?: Json | null
          created_at?: string | null
          error_message?: string | null
          headers?: Json | null
          id?: string
          integration_id?: string | null
          method?: string
          processed?: boolean | null
          query_params?: Json | null
          response_body?: Json | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_webhook_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_ads_webhook_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "google_ads_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          account_id: string
          aceita_financiamento: boolean | null
          aceita_permuta: boolean | null
          andar: number | null
          archived: boolean | null
          area_construida: number | null
          area_terreno: number | null
          bairro: string | null
          banheiros: number | null
          caracteristicas: Json | null
          cep: string | null
          cidade: string | null
          codigo_referencia: string | null
          comissao_percentual: number | null
          complemento: string | null
          condominio_mensal: number | null
          created_at: string | null
          descricao: string | null
          documentacao_ok: boolean | null
          estado: string | null
          foto: string | null
          galeria_fotos: string[] | null
          garagem: boolean | null
          id: string
          iptu_mensal: number | null
          lat: string | null
          loc_venda: string | null
          long: string | null
          m2: number | null
          meta_descricao: string | null
          meta_titulo: string | null
          numero: string | null
          proprietario_email: string | null
          proprietario_id: string | null
          proprietario_nome: string | null
          proprietario_telefone: string | null
          quartos: number | null
          rua: string | null
          site: string | null
          status: string | null
          suites: number | null
          tipo: string | null
          titulo: string | null
          tour_virtual_url: string | null
          updated_at: string | null
          vagas_garagem: number | null
          valor: number | null
          video_url: string | null
        }
        Insert: {
          account_id: string
          aceita_financiamento?: boolean | null
          aceita_permuta?: boolean | null
          andar?: number | null
          archived?: boolean | null
          area_construida?: number | null
          area_terreno?: number | null
          bairro?: string | null
          banheiros?: number | null
          caracteristicas?: Json | null
          cep?: string | null
          cidade?: string | null
          codigo_referencia?: string | null
          comissao_percentual?: number | null
          complemento?: string | null
          condominio_mensal?: number | null
          created_at?: string | null
          descricao?: string | null
          documentacao_ok?: boolean | null
          estado?: string | null
          foto?: string | null
          galeria_fotos?: string[] | null
          garagem?: boolean | null
          id?: string
          iptu_mensal?: number | null
          lat?: string | null
          loc_venda?: string | null
          long?: string | null
          m2?: number | null
          meta_descricao?: string | null
          meta_titulo?: string | null
          numero?: string | null
          proprietario_email?: string | null
          proprietario_id?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          quartos?: number | null
          rua?: string | null
          site?: string | null
          status?: string | null
          suites?: number | null
          tipo?: string | null
          titulo?: string | null
          tour_virtual_url?: string | null
          updated_at?: string | null
          vagas_garagem?: number | null
          valor?: number | null
          video_url?: string | null
        }
        Update: {
          account_id?: string
          aceita_financiamento?: boolean | null
          aceita_permuta?: boolean | null
          andar?: number | null
          archived?: boolean | null
          area_construida?: number | null
          area_terreno?: number | null
          bairro?: string | null
          banheiros?: number | null
          caracteristicas?: Json | null
          cep?: string | null
          cidade?: string | null
          codigo_referencia?: string | null
          comissao_percentual?: number | null
          complemento?: string | null
          condominio_mensal?: number | null
          created_at?: string | null
          descricao?: string | null
          documentacao_ok?: boolean | null
          estado?: string | null
          foto?: string | null
          galeria_fotos?: string[] | null
          garagem?: boolean | null
          id?: string
          iptu_mensal?: number | null
          lat?: string | null
          loc_venda?: string | null
          long?: string | null
          m2?: number | null
          meta_descricao?: string | null
          meta_titulo?: string | null
          numero?: string | null
          proprietario_email?: string | null
          proprietario_id?: string | null
          proprietario_nome?: string | null
          proprietario_telefone?: string | null
          quartos?: number | null
          rua?: string | null
          site?: string | null
          status?: string | null
          suites?: number | null
          tipo?: string | null
          titulo?: string | null
          tour_virtual_url?: string | null
          updated_at?: string | null
          vagas_garagem?: number | null
          valor?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          account_id: string
          archived: boolean | null
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          company: string | null
          conversion_probability: number | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          interactions_count: number | null
          interest_type: string | null
          is_hot_lead: boolean | null
          is_qualified: boolean | null
          last_contact: string | null
          lost_reason: string | null
          name: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          phone: string
          preferred_contact: string | null
          property_preferences: Json | null
          property_types: string[] | null
          score: number | null
          source: string
          stage: Database["public"]["Enums"]["lead_stage"]
          state: string | null
          status: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          archived?: boolean | null
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          company?: string | null
          conversion_probability?: number | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          interactions_count?: number | null
          interest_type?: string | null
          is_hot_lead?: boolean | null
          is_qualified?: boolean | null
          last_contact?: string | null
          lost_reason?: string | null
          name: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          phone: string
          preferred_contact?: string | null
          property_preferences?: Json | null
          property_types?: string[] | null
          score?: number | null
          source: string
          stage: Database["public"]["Enums"]["lead_stage"]
          state?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          archived?: boolean | null
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          company?: string | null
          conversion_probability?: number | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          interactions_count?: number | null
          interest_type?: string | null
          is_hot_lead?: boolean | null
          is_qualified?: boolean | null
          last_contact?: string | null
          lost_reason?: string | null
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          phone?: string
          preferred_contact?: string | null
          property_preferences?: Json | null
          property_types?: string[] | null
          score?: number | null
          source?: string
          stage?: Database["public"]["Enums"]["lead_stage"]
          state?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ads_integrations: {
        Row: {
          access_token: string | null
          account_id: string
          app_id: string | null
          app_secret: string | null
          created_at: string | null
          form_id: string | null
          id: string
          instagram_account_id: string | null
          is_active: boolean | null
          last_sync_at: string | null
          page_id: string | null
          settings: Json | null
          total_leads_converted: number | null
          total_leads_received: number | null
          updated_at: string | null
          verify_token: string
          webhook_secret: string
          webhook_url: string
        }
        Insert: {
          access_token?: string | null
          account_id: string
          app_id?: string | null
          app_secret?: string | null
          created_at?: string | null
          form_id?: string | null
          id?: string
          instagram_account_id?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          page_id?: string | null
          settings?: Json | null
          total_leads_converted?: number | null
          total_leads_received?: number | null
          updated_at?: string | null
          verify_token: string
          webhook_secret: string
          webhook_url: string
        }
        Update: {
          access_token?: string | null
          account_id?: string
          app_id?: string | null
          app_secret?: string | null
          created_at?: string | null
          form_id?: string | null
          id?: string
          instagram_account_id?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          page_id?: string | null
          settings?: Json | null
          total_leads_converted?: number | null
          total_leads_received?: number | null
          updated_at?: string | null
          verify_token?: string
          webhook_secret?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ads_integrations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ads_leads: {
        Row: {
          account_id: string
          ad_id: string | null
          ad_name: string | null
          adset_id: string | null
          adset_name: string | null
          campaign_id: string | null
          campaign_name: string | null
          created_at: string | null
          created_time: string | null
          email: string | null
          form_data: Json | null
          form_id: string | null
          form_name: string | null
          id: string
          integration_id: string
          lead_id: string | null
          leadgen_id: string | null
          name: string | null
          page_id: string | null
          phone: string | null
          platform: string | null
          processed_at: string | null
          status: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          account_id: string
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string | null
          created_time?: string | null
          email?: string | null
          form_data?: Json | null
          form_id?: string | null
          form_name?: string | null
          id?: string
          integration_id: string
          lead_id?: string | null
          leadgen_id?: string | null
          name?: string | null
          page_id?: string | null
          phone?: string | null
          platform?: string | null
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          account_id?: string
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string | null
          created_time?: string | null
          email?: string | null
          form_data?: Json | null
          form_id?: string | null
          form_name?: string | null
          id?: string
          integration_id?: string
          lead_id?: string | null
          leadgen_id?: string | null
          name?: string | null
          page_id?: string | null
          phone?: string | null
          platform?: string | null
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_ads_leads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ads_leads_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "meta_ads_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ads_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ads_webhook_logs: {
        Row: {
          account_id: string
          body: Json | null
          created_at: string | null
          error_message: string | null
          headers: Json | null
          id: string
          integration_id: string | null
          method: string
          processed: boolean | null
          query_params: Json | null
          response_body: Json | null
          status_code: number | null
        }
        Insert: {
          account_id: string
          body?: Json | null
          created_at?: string | null
          error_message?: string | null
          headers?: Json | null
          id?: string
          integration_id?: string | null
          method: string
          processed?: boolean | null
          query_params?: Json | null
          response_body?: Json | null
          status_code?: number | null
        }
        Update: {
          account_id?: string
          body?: Json | null
          created_at?: string | null
          error_message?: string | null
          headers?: Json | null
          id?: string
          integration_id?: string | null
          method?: string
          processed?: boolean | null
          query_params?: Json | null
          response_body?: Json | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_ads_webhook_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ads_webhook_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "meta_ads_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          account_id: string
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          account_id: string
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      olx_zap_integrations: {
        Row: {
          account_id: string
          client_api_key: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_lead_received_at: string | null
          total_leads_received: number | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          account_id: string
          client_api_key?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_lead_received_at?: string | null
          total_leads_received?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          account_id?: string
          client_api_key?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_lead_received_at?: string | null
          total_leads_received?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "olx_zap_integrations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      olx_zap_leads: {
        Row: {
          account_id: string
          client_listing_id: string | null
          created_at: string | null
          ddd: string | null
          email: string | null
          id: string
          imovel_id: string | null
          lead_id: string | null
          lead_origin: string | null
          message: string | null
          name: string
          origin_lead_id: string
          origin_listing_id: string | null
          phone: string | null
          phone_number: string | null
          processed_at: string | null
          processing_error: string | null
          raw_payload: Json | null
          status: string | null
          temperature: string | null
          timestamp: string
          transaction_type: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          client_listing_id?: string | null
          created_at?: string | null
          ddd?: string | null
          email?: string | null
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          lead_origin?: string | null
          message?: string | null
          name: string
          origin_lead_id: string
          origin_listing_id?: string | null
          phone?: string | null
          phone_number?: string | null
          processed_at?: string | null
          processing_error?: string | null
          raw_payload?: Json | null
          status?: string | null
          temperature?: string | null
          timestamp: string
          transaction_type?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          client_listing_id?: string | null
          created_at?: string | null
          ddd?: string | null
          email?: string | null
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          lead_origin?: string | null
          message?: string | null
          name?: string
          origin_lead_id?: string
          origin_listing_id?: string | null
          phone?: string | null
          phone_number?: string | null
          processed_at?: string | null
          processing_error?: string | null
          raw_payload?: Json | null
          status?: string | null
          temperature?: string | null
          timestamp?: string
          transaction_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "olx_zap_leads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "olx_zap_leads_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "olx_zap_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      olx_zap_webhook_logs: {
        Row: {
          account_id: string | null
          created_at: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          olx_zap_lead_id: string | null
          origin_lead_id: string | null
          processing_time_ms: number | null
          request_body: Json | null
          request_headers: Json | null
          request_ip: string | null
          request_method: string | null
          response_body: Json | null
          response_status: number | null
          user_agent: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          olx_zap_lead_id?: string | null
          origin_lead_id?: string | null
          processing_time_ms?: number | null
          request_body?: Json | null
          request_headers?: Json | null
          request_ip?: string | null
          request_method?: string | null
          response_body?: Json | null
          response_status?: number | null
          user_agent?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          olx_zap_lead_id?: string | null
          origin_lead_id?: string | null
          processing_time_ms?: number | null
          request_body?: Json | null
          request_headers?: Json | null
          request_ip?: string | null
          request_method?: string | null
          response_body?: Json | null
          response_status?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "olx_zap_webhook_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "olx_zap_webhook_logs_olx_zap_lead_id_fkey"
            columns: ["olx_zap_lead_id"]
            isOneToOne: false
            referencedRelation: "olx_zap_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          account_id: string
          category: string
          created_at: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          account_id: string
          category: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          account_id?: string
          category?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      tasks: {
        Row: {
          account_id: string
          archived: boolean | null
          assigned_to: string | null
          checklist: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          priority: string | null
          property_id: string | null
          related_to_id: string | null
          related_to_type: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          archived?: boolean | null
          assigned_to?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          property_id?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          archived?: boolean | null
          assigned_to?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          property_id?: string | null
          related_to_id?: string | null
          related_to_type?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          account_id: string
          archived: boolean | null
          created_at: string | null
          description: string | null
          goals: Json | null
          id: string
          member_ids: string[] | null
          name: string
          stats: Json | null
          team_lead_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          archived?: boolean | null
          created_at?: string | null
          description?: string | null
          goals?: Json | null
          id?: string
          member_ids?: string[] | null
          name: string
          stats?: Json | null
          team_lead_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          archived?: boolean | null
          created_at?: string | null
          description?: string | null
          goals?: Json | null
          id?: string
          member_ids?: string[] | null
          name?: string
          stats?: Json | null
          team_lead_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_id: string
          address: Json | null
          archived: boolean | null
          avatar: string | null
          commission_percentage: number | null
          cpf: string | null
          created_at: string | null
          creci: string | null
          department: string | null
          email: string
          emergency_contact: Json | null
          goals: Json | null
          hire_date: string | null
          id: string
          last_login: string | null
          manager_id: string | null
          name: string
          permissions: Json | null
          phone: string | null
          position: string | null
          preferences: Json | null
          role: string
          stats: Json | null
          status: string
          team_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          address?: Json | null
          archived?: boolean | null
          avatar?: string | null
          commission_percentage?: number | null
          cpf?: string | null
          created_at?: string | null
          creci?: string | null
          department?: string | null
          email: string
          emergency_contact?: Json | null
          goals?: Json | null
          hire_date?: string | null
          id?: string
          last_login?: string | null
          manager_id?: string | null
          name: string
          permissions?: Json | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          role?: string
          stats?: Json | null
          status?: string
          team_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          address?: Json | null
          archived?: boolean | null
          avatar?: string | null
          commission_percentage?: number | null
          cpf?: string | null
          created_at?: string | null
          creci?: string | null
          department?: string | null
          email?: string
          emergency_contact?: Json | null
          goals?: Json | null
          hire_date?: string | null
          id?: string
          last_login?: string | null
          manager_id?: string | null
          name?: string
          permissions?: Json | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          role?: string
          stats?: Json | null
          status?: string
          team_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_account_id: { Args: never; Returns: string }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      user_has_permission: {
        Args: { required_role: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      lead_stage:
        | "lead_novo"
        | "qualificacao"
        | "apresentacao"
        | "visita_agendada"
        | "proposta"
        | "documentacao"
        | "fechamento"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      lead_stage: [
        "lead_novo",
        "qualificacao",
        "apresentacao",
        "visita_agendada",
        "proposta",
        "documentacao",
        "fechamento",
      ],
    },
  },
} as const
