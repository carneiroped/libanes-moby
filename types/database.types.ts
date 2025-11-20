export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          address: Json | null
          ai_credits_used_month: number | null
          billing_cycle: string | null
          billing_email: string | null
          business_hours: Json | null
          cache_version: number | null
          cnpj: string | null
          created_at: string | null
          creci: string | null
          current_leads_month: number | null
          current_properties: number | null
          current_users: number | null
          customization: Json | null
          email: string
          features: Json | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          max_ai_credits_month: number | null
          max_leads_month: number | null
          max_properties: number | null
          max_users: number | null
          name: string
          next_billing_date: string | null
          phone: string
          plan: Database["public"]["Enums"]["account_plan"] | null
          settings: Json | null
          slug: string
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: Json | null
          ai_credits_used_month?: number | null
          billing_cycle?: string | null
          billing_email?: string | null
          business_hours?: Json | null
          cache_version?: number | null
          cnpj?: string | null
          created_at?: string | null
          creci?: string | null
          current_leads_month?: number | null
          current_properties?: number | null
          current_users?: number | null
          customization?: Json | null
          email: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          max_ai_credits_month?: number | null
          max_leads_month?: number | null
          max_properties?: number | null
          max_users?: number | null
          name: string
          next_billing_date?: string | null
          phone: string
          plan?: Database["public"]["Enums"]["account_plan"] | null
          settings?: Json | null
          slug: string
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: Json | null
          ai_credits_used_month?: number | null
          billing_cycle?: string | null
          billing_email?: string | null
          business_hours?: Json | null
          cache_version?: number | null
          cnpj?: string | null
          created_at?: string | null
          creci?: string | null
          current_leads_month?: number | null
          current_properties?: number | null
          current_users?: number | null
          customization?: Json | null
          email?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          max_ai_credits_month?: number | null
          max_leads_month?: number | null
          max_properties?: number | null
          max_users?: number | null
          name?: string
          next_billing_date?: string | null
          phone?: string
          plan?: Database["public"]["Enums"]["account_plan"] | null
          settings?: Json | null
          slug?: string
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          account_id: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type?: string
          user_id?: string
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
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      activities_2025_01: {
        Row: {
          account_id: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      activities_2025_02: {
        Row: {
          account_id: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      activities_2025_03: {
        Row: {
          account_id: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      activities_2025_04: {
        Row: {
          account_id: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      activities_2025_05: {
        Row: {
          account_id: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      activities_2025_06: {
        Row: {
          account_id: string
          created_at: string
          description: string
          entity_id: string
          entity_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
          property_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description: string
          entity_id: string
          entity_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          property_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      automations: {
        Row: {
          account_id: string
          actions: Json
          conditions: Json
          created_at: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          priority: number | null
          trigger: Json
        }
        Insert: {
          account_id: string
          actions?: Json
          conditions?: Json
          created_at?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          priority?: number | null
          trigger: Json
        }
        Update: {
          account_id?: string
          actions?: Json
          conditions?: Json
          created_at?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          priority?: number | null
          trigger?: Json
        }
        Relationships: [
          {
            foreignKeyName: "automations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_messages: {
        Row: {
          campaign_id: string
          channel: string
          content: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message_template_id: string | null
          opened_at: string | null
          recipient_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          channel: string
          content: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_template_id?: string | null
          opened_at?: string | null
          recipient_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          channel?: string
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_template_id?: string | null
          opened_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_messages_message_template_id_fkey"
            columns: ["message_template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "campaign_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          lead_id: string
          messages_sent: number | null
          metrics: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id: string
          messages_sent?: number | null
          metrics?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string
          messages_sent?: number | null
          metrics?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          account_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          frequency_control: Json
          id: string
          messages: Json
          metrics: Json
          name: string
          schedule: Json
          start_date: string | null
          status: string
          target_audience: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency_control?: Json
          id?: string
          messages?: Json
          metrics?: Json
          name: string
          schedule?: Json
          start_date?: string | null
          status?: string
          target_audience?: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency_control?: Json
          id?: string
          messages?: Json
          metrics?: Json
          name?: string
          schedule?: Json
          start_date?: string | null
          status?: string
          target_audience?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          account_id: string
          active: boolean | null
          ai_processed: boolean | null
          app: string | null
          attachments: Json | null
          bot_message: string | null
          chat_id: string
          content: string | null
          conversation_id: string | null
          created_at: string | null
          delivered_at: string | null
          entities: Json | null
          external_id: string | null
          id: string
          intent: string | null
          is_from_lead: boolean
          is_read: boolean | null
          media_url: string | null
          message_type: string | null
          phone: string | null
          read_at: string | null
          sender_name: string | null
          sentiment: string | null
          transcription: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          user_message: string | null
          user_name: string | null
        }
        Insert: {
          account_id: string
          active?: boolean | null
          ai_processed?: boolean | null
          app?: string | null
          attachments?: Json | null
          bot_message?: string | null
          chat_id: string
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          entities?: Json | null
          external_id?: string | null
          id?: string
          intent?: string | null
          is_from_lead: boolean
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          phone?: string | null
          read_at?: string | null
          sender_name?: string | null
          sentiment?: string | null
          transcription?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Update: {
          account_id?: string
          active?: boolean | null
          ai_processed?: boolean | null
          app?: string | null
          attachments?: Json | null
          bot_message?: string | null
          chat_id?: string
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          entities?: Json | null
          external_id?: string | null
          id?: string
          intent?: string | null
          is_from_lead?: boolean
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          phone?: string | null
          read_at?: string | null
          sender_name?: string | null
          sentiment?: string | null
          transcription?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_message?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_transfers: {
        Row: {
          accepted_at: string | null
          account_id: string
          chat_id: string
          created_at: string | null
          from_user_id: string | null
          id: string
          reason: string | null
          status: string | null
          to_user_id: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          chat_id: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          to_user_id: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          chat_id?: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          reason?: string | null
          status?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_transfers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_transfers_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_transfers_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_transfers_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          account_id: string
          app: string | null
          assignee_id: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          channel_chat_id: string
          context_data: Json | null
          conversation_id: string | null
          created_at: string | null
          id: string
          is_bot: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          lead_id: string | null
          memory_data: Json | null
          message_count: number | null
          phone: string | null
          phone_number: string | null
          resolved_at: string | null
          response_time_avg: number | null
          sentiment_avg: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["chat_status"] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          app?: string | null
          assignee_id?: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          channel_chat_id: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_bot?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          lead_id?: string | null
          memory_data?: Json | null
          message_count?: number | null
          phone?: string | null
          phone_number?: string | null
          resolved_at?: string | null
          response_time_avg?: number | null
          sentiment_avg?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["chat_status"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          app?: string | null
          assignee_id?: string | null
          channel?: Database["public"]["Enums"]["message_channel"]
          channel_chat_id?: string
          context_data?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_bot?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          lead_id?: string | null
          memory_data?: Json | null
          message_count?: number | null
          phone?: string | null
          phone_number?: string | null
          resolved_at?: string | null
          response_time_avg?: number | null
          sentiment_avg?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["chat_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          account_id: string
          clauses: Json
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          legal_review: boolean | null
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          sections: Json
          type: string
          updated_at: string
          variables: Json
        }
        Insert: {
          account_id: string
          clauses?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          legal_review?: boolean | null
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sections?: Json
          type: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          account_id?: string
          clauses?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          legal_review?: boolean | null
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sections?: Json
          type?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_consents: {
        Row: {
          account_id: string | null
          consent_evidence: Json | null
          consent_type: string
          created_at: string | null
          data_categories: string[] | null
          email: string
          expires_at: string | null
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: unknown | null
          lead_id: string | null
          legal_basis: string
          purpose: string
          retention_period: string | null
          third_parties: string[] | null
          updated_at: string | null
          user_agent: string | null
          withdrawn_at: string | null
        }
        Insert: {
          account_id?: string | null
          consent_evidence?: Json | null
          consent_type: string
          created_at?: string | null
          data_categories?: string[] | null
          email: string
          expires_at?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          lead_id?: string | null
          legal_basis: string
          purpose: string
          retention_period?: string | null
          third_parties?: string[] | null
          updated_at?: string | null
          user_agent?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          account_id?: string | null
          consent_evidence?: Json | null
          consent_type?: string
          created_at?: string | null
          data_categories?: string[] | null
          email?: string
          expires_at?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          lead_id?: string | null
          legal_basis?: string
          purpose?: string
          retention_period?: string | null
          third_parties?: string[] | null
          updated_at?: string | null
          user_agent?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_consents_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_consents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_consents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      document_downloads: {
        Row: {
          account_id: string | null
          created_at: string | null
          document_id: number | null
          downloaded_at: string | null
          id: number
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          document_id?: number | null
          downloaded_at?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          document_id?: number | null
          downloaded_at?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_downloads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_downloads_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_downloads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_files: {
        Row: {
          account_id: string
          category: string
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          file_name: string
          file_size: number
          file_url: string
          id: string
          metadata: Json | null
          mime_type: string
          previous_version_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          account_id: string
          category: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          file_name: string
          file_size: number
          file_url: string
          id?: string
          metadata?: Json | null
          mime_type: string
          previous_version_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          account_id?: string
          category?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          metadata?: Json | null
          mime_type?: string
          previous_version_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_document_files_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signatures: {
        Row: {
          certificate_data: Json | null
          document_id: string
          id: string
          ip_address: string
          location: Json | null
          signature_data: Json
          signature_type: string
          signed_at: string | null
          signer_cpf: string
          signer_email: string
          signer_name: string
          signer_role: string
          user_agent: string
        }
        Insert: {
          certificate_data?: Json | null
          document_id: string
          id?: string
          ip_address: string
          location?: Json | null
          signature_data: Json
          signature_type: string
          signed_at?: string | null
          signer_cpf: string
          signer_email: string
          signer_name: string
          signer_role: string
          user_agent: string
        }
        Update: {
          certificate_data?: Json | null
          document_id?: string
          id?: string
          ip_address?: string
          location?: Json | null
          signature_data?: Json
          signature_type?: string
          signed_at?: string | null
          signer_cpf?: string
          signer_email?: string
          signer_name?: string
          signer_role?: string
          user_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_document_signatures_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_files"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          account_id: string
          category: string
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          required_fields: Json
          type: string
          updated_at: string | null
          variables: string[] | null
          version: number | null
        }
        Insert: {
          account_id: string
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          required_fields?: Json
          type: string
          updated_at?: string | null
          variables?: string[] | null
          version?: number | null
        }
        Update: {
          account_id?: string
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          required_fields?: Json
          type?: string
          updated_at?: string | null
          variables?: string[] | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_document_templates_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          account_id: string | null
          azure_blob_name: string | null
          azure_container: string | null
          category: string | null
          content: string | null
          created_at: string
          description: string | null
          embedding: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: number
          is_public: boolean | null
          metadata: Json | null
          storage_path: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          account_id?: string | null
          azure_blob_name?: string | null
          azure_container?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: number
          is_public?: boolean | null
          metadata?: Json | null
          storage_path?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          account_id?: string | null
          azure_blob_name?: string | null
          azure_container?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: number
          is_public?: boolean | null
          metadata?: Json | null
          storage_path?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          account_id: string | null
          created_at: string | null
          error_id: string | null
          error_message: string | null
          error_stack: string | null
          error_type: string | null
          execution_id: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          node_id: string | null
          node_name: string | null
          severity: string | null
          workflow_id: string | null
          workflow_name: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          error_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          error_type?: string | null
          execution_id?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          node_id?: string | null
          node_name?: string | null
          severity?: string | null
          workflow_id?: string | null
          workflow_name?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          error_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          error_type?: string | null
          execution_id?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          node_id?: string | null
          node_name?: string | null
          severity?: string | null
          workflow_id?: string | null
          workflow_name?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          account_id: string
          all_day: boolean | null
          cancelled_at: string | null
          check_in_at: string | null
          check_in_location: unknown | null
          check_out_at: string | null
          check_out_notes: string | null
          contract_id: string | null
          created_at: string
          description: string | null
          end_at: string
          id: string
          lead_id: string | null
          location: Json | null
          meeting_url: string | null
          notifications_sent: Json | null
          owner_id: string
          property_id: string | null
          reminder_minutes: number[] | null
          start_at: string
          status: string | null
          timezone: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          all_day?: boolean | null
          cancelled_at?: string | null
          check_in_at?: string | null
          check_in_location?: unknown | null
          check_out_at?: string | null
          check_out_notes?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string | null
          end_at: string
          id?: string
          lead_id?: string | null
          location?: Json | null
          meeting_url?: string | null
          notifications_sent?: Json | null
          owner_id: string
          property_id?: string | null
          reminder_minutes?: number[] | null
          start_at: string
          status?: string | null
          timezone?: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          all_day?: boolean | null
          cancelled_at?: string | null
          check_in_at?: string | null
          check_in_location?: unknown | null
          check_out_at?: string | null
          check_out_notes?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string
          id?: string
          lead_id?: string | null
          location?: Json | null
          meeting_url?: string | null
          notifications_sent?: Json | null
          owner_id?: string
          property_id?: string | null
          reminder_minutes?: number[] | null
          start_at?: string
          status?: string | null
          timezone?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          account_id: string
          config: Json
          created_at: string
          credentials: Json | null
          id: string
          is_active: boolean
          name: string
          type: string
        }
        Insert: {
          account_id: string
          config?: Json
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean
          name: string
          type: string
        }
        Update: {
          account_id?: string
          config?: Json
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_property_interests: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          interaction_data: Json | null
          is_favorite: boolean | null
          last_viewed_at: string | null
          lead_id: string
          notes: string | null
          property_id: string
          score: number | null
          time_spent: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          is_favorite?: boolean | null
          last_viewed_at?: string | null
          lead_id: string
          notes?: string | null
          property_id: string
          score?: number | null
          time_spent?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          is_favorite?: boolean | null
          last_viewed_at?: string | null
          lead_id?: string
          notes?: string | null
          property_id?: string
          score?: number | null
          time_spent?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_property_interests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_property_interests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_property_interests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_property_interests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          account_id: string
          ai_profile: Json | null
          ai_score: number | null
          assignee_id: string | null
          best_contact_time: string[] | null
          birth_date: string | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          cnpj_search_prefix: string | null
          company: string | null
          conversion_probability: number | null
          converted_at: string | null
          cpf_cnpj: string | null
          cpf_search_prefix: string | null
          created_at: string | null
          custom_fields: Json | null
          desired_features: Json | null
          desired_locations: Json | null
          do_not_disturb: boolean | null
          email: string | null
          encrypted_cnpj: Json | null
          encrypted_cpf: Json | null
          id: string
          income_range: string | null
          last_activity_at: string | null
          last_contact_at: string | null
          metadata: Json | null
          name: string
          neighborhood: string | null
          notes: string | null
          phone: string
          pipeline_id: string | null
          preferred_channel:
            | Database["public"]["Enums"]["message_channel"]
            | null
          profession: string | null
          property_types: Database["public"]["Enums"]["property_type"][] | null
          score: number | null
          scoring_factors: Json | null
          source: string | null
          source_details: Json | null
          stage: Database["public"]["Enums"]["lead_stage"] | null
          stage_id: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: string[] | null
          temperature: string | null
          total_interactions: number | null
          updated_at: string | null
          utm_data: Json | null
          whatsapp: string | null
        }
        Insert: {
          account_id: string
          ai_profile?: Json | null
          ai_score?: number | null
          assignee_id?: string | null
          best_contact_time?: string[] | null
          birth_date?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          cnpj_search_prefix?: string | null
          company?: string | null
          conversion_probability?: number | null
          converted_at?: string | null
          cpf_cnpj?: string | null
          cpf_search_prefix?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          desired_features?: Json | null
          desired_locations?: Json | null
          do_not_disturb?: boolean | null
          email?: string | null
          encrypted_cnpj?: Json | null
          encrypted_cpf?: Json | null
          id?: string
          income_range?: string | null
          last_activity_at?: string | null
          last_contact_at?: string | null
          metadata?: Json | null
          name: string
          neighborhood?: string | null
          notes?: string | null
          phone: string
          pipeline_id?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          profession?: string | null
          property_types?: Database["public"]["Enums"]["property_type"][] | null
          score?: number | null
          scoring_factors?: Json | null
          source?: string | null
          source_details?: Json | null
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          stage_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          temperature?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          utm_data?: Json | null
          whatsapp?: string | null
        }
        Update: {
          account_id?: string
          ai_profile?: Json | null
          ai_score?: number | null
          assignee_id?: string | null
          best_contact_time?: string[] | null
          birth_date?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          cnpj_search_prefix?: string | null
          company?: string | null
          conversion_probability?: number | null
          converted_at?: string | null
          cpf_cnpj?: string | null
          cpf_search_prefix?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          desired_features?: Json | null
          desired_locations?: Json | null
          do_not_disturb?: boolean | null
          email?: string | null
          encrypted_cnpj?: Json | null
          encrypted_cpf?: Json | null
          id?: string
          income_range?: string | null
          last_activity_at?: string | null
          last_contact_at?: string | null
          metadata?: Json | null
          name?: string
          neighborhood?: string | null
          notes?: string | null
          phone?: string
          pipeline_id?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          profession?: string | null
          property_types?: Database["public"]["Enums"]["property_type"][] | null
          score?: number | null
          scoring_factors?: Json | null
          source?: string | null
          source_details?: Json | null
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          stage_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          temperature?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          utm_data?: Json | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_log: {
        Row: {
          created_at: string | null
          execution_time: unknown | null
          id: number
          job_name: string | null
          result: Json | null
        }
        Insert: {
          created_at?: string | null
          execution_time?: unknown | null
          id?: number
          job_name?: string | null
          result?: Json | null
        }
        Update: {
          created_at?: string | null
          execution_time?: unknown | null
          id?: number
          job_name?: string | null
          result?: Json | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          account_id: string
          category: string
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          account_id: string
          category: string
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          account_id?: string
          category?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          account_id: string | null
          content: string
          created_at: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          priority: string | null
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          account_id: string
          actions: Json | null
          color: string | null
          id: string
          name: string
          order_index: number
          pipeline_id: string
          probability: number | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          actions?: Json | null
          color?: string | null
          id?: string
          name: string
          order_index: number
          pipeline_id: string
          probability?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          actions?: Json | null
          color?: string | null
          id?: string
          name?: string
          order_index?: number
          pipeline_id?: string
          probability?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          account_id: string
          automations: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          automations?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          automations?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_integrations: {
        Row: {
          account_id: string
          account_name: string
          active_listings: number
          api_key: string | null
          created_at: string
          credentials: Json
          id: string
          is_active: boolean
          last_error: string | null
          last_sync_at: string | null
          mapping_rules: Json
          portal: string
          sync_config: Json
          sync_status: string | null
          total_leads: number
          total_listings: number
          updated_at: string | null
        }
        Insert: {
          account_id: string
          account_name: string
          active_listings?: number
          api_key?: string | null
          created_at?: string
          credentials?: Json
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          mapping_rules?: Json
          portal: string
          sync_config?: Json
          sync_status?: string | null
          total_leads?: number
          total_listings?: number
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          account_name?: string
          active_listings?: number
          api_key?: string | null
          created_at?: string
          credentials?: Json
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          mapping_rules?: Json
          portal?: string
          sync_config?: Json
          sync_status?: string | null
          total_leads?: number
          total_listings?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_integrations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_leads: {
        Row: {
          account_id: string
          id: string
          imported_at: string
          integration_id: string
          lead_id: string
          listing_id: string | null
          portal_lead_id: string
          portal_name: string
          raw_data: Json
          updated_at: string | null
        }
        Insert: {
          account_id: string
          id?: string
          imported_at?: string
          integration_id: string
          lead_id: string
          listing_id?: string | null
          portal_lead_id: string
          portal_name: string
          raw_data: Json
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          id?: string
          imported_at?: string
          integration_id?: string
          lead_id?: string
          listing_id?: string | null
          portal_lead_id?: string
          portal_name?: string
          raw_data?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_leads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_leads_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "portal_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_listings: {
        Row: {
          account_id: string
          clicks: number
          expires_at: string | null
          id: string
          integration_id: string
          last_sync_at: string
          leads: number
          portal_listing_id: string
          portal_url: string
          property_id: string
          published_at: string
          status: string
          sync_errors: Json | null
          updated_at: string | null
          views: number
        }
        Insert: {
          account_id: string
          clicks?: number
          expires_at?: string | null
          id?: string
          integration_id: string
          last_sync_at: string
          leads?: number
          portal_listing_id: string
          portal_url: string
          property_id: string
          published_at: string
          status: string
          sync_errors?: Json | null
          updated_at?: string | null
          views?: number
        }
        Update: {
          account_id?: string
          clicks?: number
          expires_at?: string | null
          id?: string
          integration_id?: string
          last_sync_at?: string
          leads?: number
          portal_listing_id?: string
          portal_url?: string
          property_id?: string
          published_at?: string
          status?: string
          sync_errors?: Json | null
          updated_at?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "portal_listings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_listings_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "portal_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          account_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          justification: string | null
          lead_id: string | null
          processed_at: string | null
          processed_by: string | null
          request_data: Json | null
          request_type: string
          response_data: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          justification?: string | null
          lead_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_data?: Json | null
          request_type: string
          response_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          justification?: string | null
          lead_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_data?: Json | null
          request_type?: string
          response_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "privacy_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "privacy_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          account_id: string
          address: Json
          amenities: Json | null
          bathrooms: number | null
          bedrooms: number | null
          built_area: number | null
          city: string | null
          code: string
          commission: number | null
          condo_fee: number | null
          conversion_rate: number | null
          created_at: string | null
          description: string | null
          favorite_count: number | null
          features: Json | null
          floor: number | null
          id: string
          images: Json | null
          inquiry_count: number | null
          iptu: number | null
          land_area: number | null
          latitude: number | null
          location: unknown | null
          longitude: number | null
          marketing_texts: Json | null
          meta_description: string | null
          meta_title: string | null
          neighborhood: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          parking_spaces: number | null
          price_confidence: number | null
          pricing_options: Json | null
          published_at: string | null
          purpose: Database["public"]["Enums"]["property_purpose"] | null
          rent_price: number | null
          sale_price: number | null
          search_embeddings: Json | null
          site: string | null
          slug: string | null
          sold_at: string | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"] | null
          suggested_price: number | null
          suites: number | null
          target_audience: Json | null
          title: string
          total_area: number | null
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string | null
          videos: Json | null
          view_count: number | null
          virtual_tour_url: string | null
        }
        Insert: {
          account_id: string
          address: Json
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string | null
          code: string
          commission?: number | null
          condo_fee?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          favorite_count?: number | null
          features?: Json | null
          floor?: number | null
          id?: string
          images?: Json | null
          inquiry_count?: number | null
          iptu?: number | null
          land_area?: number | null
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          marketing_texts?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_spaces?: number | null
          price_confidence?: number | null
          pricing_options?: Json | null
          published_at?: string | null
          purpose?: Database["public"]["Enums"]["property_purpose"] | null
          rent_price?: number | null
          sale_price?: number | null
          search_embeddings?: Json | null
          site?: string | null
          slug?: string | null
          sold_at?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          suggested_price?: number | null
          suites?: number | null
          target_audience?: Json | null
          title: string
          total_area?: number | null
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string | null
          videos?: Json | null
          view_count?: number | null
          virtual_tour_url?: string | null
        }
        Update: {
          account_id?: string
          address?: Json
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          built_area?: number | null
          city?: string | null
          code?: string
          commission?: number | null
          condo_fee?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          favorite_count?: number | null
          features?: Json | null
          floor?: number | null
          id?: string
          images?: Json | null
          inquiry_count?: number | null
          iptu?: number | null
          land_area?: number | null
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          marketing_texts?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          neighborhood?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_spaces?: number | null
          price_confidence?: number | null
          pricing_options?: Json | null
          published_at?: string | null
          purpose?: Database["public"]["Enums"]["property_purpose"] | null
          rent_price?: number | null
          sale_price?: number | null
          search_embeddings?: Json | null
          site?: string | null
          slug?: string | null
          sold_at?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"] | null
          suggested_price?: number | null
          suites?: number | null
          target_audience?: Json | null
          title?: string
          total_area?: number | null
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string | null
          videos?: Json | null
          view_count?: number | null
          virtual_tour_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          account_id: string
          completed_at: string | null
          contract_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          owner_id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          owner_id: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          owner_id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
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
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          is_leader: boolean | null
          joined_at: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_leader?: boolean | null
          joined_at?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_leader?: boolean | null
          joined_at?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          account_id: string
          created_at: string | null
          description: string | null
          goals: Json | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          description?: string | null
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          description?: string | null
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_webhook_messages: {
        Row: {
          account_id: string
          content: string | null
          created_at: string | null
          id: string
          phone: string
          processed: boolean | null
          raw_data: Json | null
          sender_name: string | null
        }
        Insert: {
          account_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          phone: string
          processed?: boolean | null
          raw_data?: Json | null
          sender_name?: string | null
        }
        Update: {
          account_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          phone?: string
          processed?: boolean | null
          raw_data?: Json | null
          sender_name?: string | null
        }
        Relationships: []
      }
      user_mfa: {
        Row: {
          account_id: string | null
          backup_codes_encrypted: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          secret_encrypted: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          backup_codes_encrypted?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          secret_encrypted: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          backup_codes_encrypted?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          secret_encrypted?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_mfa_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_mfa_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_id: string
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          creci: string | null
          device_tokens: string[] | null
          email: string
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          metadata: Json | null
          name: string
          notification_prefs: Json | null
          permissions: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          creci?: string | null
          device_tokens?: string[] | null
          email: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          metadata?: Json | null
          name: string
          notification_prefs?: Json | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          creci?: string | null
          device_tokens?: string[] | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          metadata?: Json | null
          name?: string
          notification_prefs?: Json | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_integrations: {
        Row: {
          account_id: string
          config: Json
          created_at: string
          id: string
          instance_id: string | null
          is_active: boolean
          last_sync_at: string | null
          name: string
          phone_number: string
          type: string
          updated_at: string | null
          webhook_secret: string
          webhook_url: string
        }
        Insert: {
          account_id: string
          config?: Json
          created_at?: string
          id?: string
          instance_id?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          name: string
          phone_number: string
          type: string
          updated_at?: string | null
          webhook_secret: string
          webhook_url: string
        }
        Update: {
          account_id?: string
          config?: Json
          created_at?: string
          id?: string
          instance_id?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          name?: string
          phone_number?: string
          type?: string
          updated_at?: string | null
          webhook_secret?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_integrations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      knowledge_base_view: {
        Row: {
          account_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string | null
          is_active: boolean | null
          metadata: Json | null
          source: string | null
          source_url: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          account_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          source?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          account_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          source?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_secure: {
        Row: {
          account_id: string | null
          ai_profile: Json | null
          ai_score: number | null
          assignee_id: string | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          cnpj_search_prefix: string | null
          conversion_probability: number | null
          cpf_cnpj: string | null
          cpf_search_prefix: string | null
          created_at: string | null
          email: string | null
          encrypted_cnpj: Json | null
          encrypted_cpf: Json | null
          id: string | null
          last_contact_at: string | null
          name: string | null
          neighborhood: string | null
          notes: string | null
          phone: string | null
          pipeline_id: string | null
          property_types: Database["public"]["Enums"]["property_type"][] | null
          score: number | null
          source: string | null
          stage_id: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: string[] | null
          temperature: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          account_id?: string | null
          ai_profile?: Json | null
          ai_score?: number | null
          assignee_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          cnpj_search_prefix?: string | null
          conversion_probability?: number | null
          cpf_cnpj?: never
          cpf_search_prefix?: string | null
          created_at?: string | null
          email?: string | null
          encrypted_cnpj?: Json | null
          encrypted_cpf?: Json | null
          id?: string | null
          last_contact_at?: string | null
          name?: string | null
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_id?: string | null
          property_types?: Database["public"]["Enums"]["property_type"][] | null
          score?: number | null
          source?: string | null
          stage_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          temperature?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          account_id?: string | null
          ai_profile?: Json | null
          ai_score?: number | null
          assignee_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          cnpj_search_prefix?: string | null
          conversion_probability?: number | null
          cpf_cnpj?: never
          cpf_search_prefix?: string | null
          created_at?: string | null
          email?: string | null
          encrypted_cnpj?: Json | null
          encrypted_cpf?: Json | null
          id?: string | null
          last_contact_at?: string | null
          name?: string | null
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_id?: string | null
          property_types?: Database["public"]["Enums"]["property_type"][] | null
          score?: number | null
          source?: string | null
          stage_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          temperature?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      archive_old_chats: {
        Args: { p_days_old?: number }
        Returns: number
      }
      auto_update_event_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_avg_response_time: {
        Args: { account_uuid: string }
        Returns: string
      }
      calculate_event_duration: {
        Args: { p_start_at: string; p_end_at: string }
        Returns: unknown
      }
      check_event_conflicts: {
        Args: {
          p_owner_id: string
          p_start_at: string
          p_end_at: string
          p_exclude_event_id?: string
        }
        Returns: {
          conflicting_event_id: string
          title: string
          start_at: string
          end_at: string
        }[]
      }
      check_user_access: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_duplicate_embeddings: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_ai_sessions: {
        Args: { p_days_old?: number }
        Returns: number
      }
      create_temp_messages_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      daily_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      debug_property_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          info: string
          value: string
        }[]
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      execute_automation: {
        Args: { p_automation_id: string; p_context?: Json }
        Returns: Json
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_connection_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          database: string
          active_connections: number
          idle_connections: number
          idle_in_transaction: number
          total_connections: number
          max_connections: number
        }[]
      }
      get_current_account_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_events_by_period: {
        Args: {
          p_account_id: string
          p_start_date: string
          p_end_date: string
          p_owner_id?: string
        }
        Returns: {
          id: string
          type: Database["public"]["Enums"]["event_type"]
          title: string
          start_at: string
          end_at: string
          status: string
          lead_name: string
          property_title: string
        }[]
      }
      get_lead_stats: {
        Args: Record<PropertyKey, never> | { p_account_id: string }
        Returns: Json
      }
      get_overdue_tasks: {
        Args: { p_account_id: string; p_owner_id?: string }
        Returns: {
          id: string
          title: string
          due_date: string
          days_overdue: number
          priority: string
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_slow_queries: {
        Args: { p_duration_ms?: number }
        Returns: {
          query_start: string
          duration: unknown
          state: string
          query: string
          wait_event_type: string
          wait_event: string
        }[]
      }
      get_table_sizes: {
        Args: Record<PropertyKey, never>
        Returns: {
          schema_name: string
          table_name: string
          total_size: string
          table_size: string
          indexes_size: string
          rows_estimate: number
        }[]
      }
      get_tasks_summary: {
        Args: { p_account_id: string; p_owner_id?: string }
        Returns: {
          status: string
          priority: string
          count: number
        }[]
      }
      get_trigger_status: {
        Args: { p_table_name: string }
        Returns: Json
      }
      get_unread_counts: {
        Args: { chat_ids: string[]; target_account_id: string }
        Returns: {
          chat_id: string
          unread_count: number
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_sensitive_data_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      insert_lead_direct: {
        Args: {
          p_account_id: string
          p_name: string
          p_phone: string
          p_source?: string
          p_status?: string
        }
        Returns: string
      }
      insert_seehaus_lot: {
        Args: {
          p_code: string
          p_area: number
          p_frente: number
          p_fundos: number
          p_direita: number
          p_esquerda: number
          p_tipo: string
          p_tem_deck: boolean
          p_preco_vista: number
          p_preco_72x: number
          p_entrada_72x: number
          p_mensal_72x: number
          p_preco_25_75: number
          p_entrada_25_75: number
          p_mensal_24x: number
          p_saldo_75: number
        }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      log_activity: {
        Args: {
          p_type: string
          p_entity_type: string
          p_entity_id: string
          p_description: string
          p_metadata?: Json
          p_lead_id?: string
          p_property_id?: string
        }
        Returns: string
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      maintenance_reindex: {
        Args: { p_schema?: string }
        Returns: undefined
      }
      maintenance_reindex_fragmented: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_name: string
          table_name: string
          bloat_percent: number
          status: string
        }[]
      }
      maintenance_vacuum_analyze: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          status: string
          duration: unknown
        }[]
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_by_account: {
        Args: {
          p_account_id: string
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_knowledge_base: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          p_account_id?: string
        }
        Returns: {
          id: string
          account_id: string
          title: string
          content: string
          category: string
          tags: string[]
          source: string
          source_url: string
          metadata: Json
          similarity: number
        }[]
      }
      merge_duplicate_leads: {
        Args: { keep_lead_id: string; merge_lead_ids: string[] }
        Returns: Json
      }
      move_lead_to_stage: {
        Args: { p_lead_id: string; p_stage_id: string; p_score?: number }
        Returns: Json
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_message_template: {
        Args: { p_template_id: string; p_variables?: Json }
        Returns: string
      }
      process_temp_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          error_count: number
          errors: Json
        }[]
      }
      search_chats: {
        Args: {
          p_account_id: string
          p_search_text?: string
          p_status?: Database["public"]["Enums"]["chat_status"]
          p_channel?: Database["public"]["Enums"]["message_channel"]
          p_is_bot?: boolean
          p_assignee_id?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          lead_name: string
          phone_number: string
          channel: Database["public"]["Enums"]["message_channel"]
          status: Database["public"]["Enums"]["chat_status"]
          is_bot: boolean
          last_message_preview: string
          last_message_at: string
          message_count: number
          assignee_name: string
        }[]
      }
      search_knowledge: {
        Args: {
          search_query?: string
          search_category?: string
          search_tags?: string[]
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          source: string
          metadata: Json
        }[]
      }
      search_lead_by_phone_fuzzy: {
        Args: { p_account_id: string; p_phone: string; p_threshold?: number }
        Returns: {
          id: string
          name: string
          phone: string
          whatsapp: string
          similarity: number
        }[]
      }
      search_leads: {
        Args: {
          p_account_id: string
          p_search_text?: string
          p_status?: Database["public"]["Enums"]["lead_status"][]
          p_assignee_id?: string
          p_pipeline_id?: string
          p_stage_id?: string
          p_temperature?: string[]
          p_tags?: string[]
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          name: string
          email: string
          phone: string
          status: Database["public"]["Enums"]["lead_status"]
          temperature: string
          ai_score: number
          assignee_name: string
          stage_name: string
          created_at: string
          last_contact_at: string
        }[]
      }
      search_properties: {
        Args: {
          p_account_id: string
          p_search_text?: string
          p_type?: Database["public"]["Enums"]["property_type"][]
          p_purpose?: Database["public"]["Enums"]["property_purpose"]
          p_status?: Database["public"]["Enums"]["property_status"]
          p_price_min?: number
          p_price_max?: number
          p_bedrooms_min?: number
          p_bathrooms_min?: number
          p_parking_min?: number
          p_area_min?: number
          p_city?: string
          p_neighborhood?: string
          p_amenities?: string[]
          p_limit?: number
          p_offset?: number
          p_order_by?: string
        }
        Returns: {
          id: string
          code: string
          title: string
          type: Database["public"]["Enums"]["property_type"]
          purpose: Database["public"]["Enums"]["property_purpose"]
          status: Database["public"]["Enums"]["property_status"]
          city: string
          neighborhood: string
          bedrooms: number
          bathrooms: number
          parking_spaces: number
          total_area: number
          sale_price: number
          rent_price: number
          images: Json
          created_at: string
          similarity: number
        }[]
      }
      search_properties_nearby: {
        Args: {
          p_account_id: string
          p_latitude: number
          p_longitude: number
          p_radius_meters?: number
          p_limit?: number
        }
        Returns: {
          id: string
          title: string
          distance_meters: number
          latitude: number
          longitude: number
        }[]
      }
      set_config: {
        Args: { p_name: string; p_value: string }
        Returns: undefined
      }
      set_current_account_id: {
        Args: { account_id: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      system_health_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: Json
        }[]
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_invoice_overdue_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_property_safe: {
        Args: { p_property_id: string; p_account_id: string; p_data: Json }
        Returns: Json
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
      vault_delete_secret: {
        Args: { secret_name: string }
        Returns: boolean
      }
      vault_get_secret: {
        Args: { secret_name: string }
        Returns: Json
      }
      vault_list_secrets: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          description: string
          updated_at: string
        }[]
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      account_plan: "trial" | "starter" | "professional" | "enterprise"
      chat_status:
        | "active"
        | "waiting_agent"
        | "transferred"
        | "resolved"
        | "archived"
      contract_status:
        | "draft"
        | "pending_signatures"
        | "active"
        | "completed"
        | "cancelled"
      contract_type: "sale" | "rent" | "management" | "partnership"
      document_type:
        | "contract"
        | "proposal"
        | "receipt"
        | "report"
        | "legal"
        | "other"
      event_type:
        | "property_visit"
        | "meeting"
        | "contract_signing"
        | "call"
        | "task"
        | "follow_up"
      invoice_status: "pending" | "paid" | "overdue" | "cancelled"
      lead_stage:
        | "lead_novo"
        | "qualificacao"
        | "apresentacao"
        | "visita_agendada"
        | "proposta"
        | "documentacao"
        | "fechamento"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "visiting"
        | "negotiating"
        | "converted"
        | "lost"
      message_channel:
        | "whatsapp_official"
        | "whatsapp_evolution"
        | "instagram"
        | "facebook"
        | "webchat"
        | "email"
        | "sms"
      property_purpose: "sale" | "rent" | "both"
      property_status:
        | "available"
        | "reserved"
        | "sold"
        | "rented"
        | "unavailable"
      property_type:
        | "apartment"
        | "house"
        | "land"
        | "commercial"
        | "rural"
        | "development"
      sync_status: "pending" | "syncing" | "synced" | "failed"
      user_role: "admin" | "manager" | "agent" | "assistant"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
      account_plan: ["trial", "starter", "professional", "enterprise"],
      chat_status: [
        "active",
        "waiting_agent",
        "transferred",
        "resolved",
        "archived",
      ],
      contract_status: [
        "draft",
        "pending_signatures",
        "active",
        "completed",
        "cancelled",
      ],
      contract_type: ["sale", "rent", "management", "partnership"],
      document_type: [
        "contract",
        "proposal",
        "receipt",
        "report",
        "legal",
        "other",
      ],
      event_type: [
        "property_visit",
        "meeting",
        "contract_signing",
        "call",
        "task",
        "follow_up",
      ],
      invoice_status: ["pending", "paid", "overdue", "cancelled"],
      lead_stage: [
        "lead_novo",
        "qualificacao",
        "apresentacao",
        "visita_agendada",
        "proposta",
        "documentacao",
        "fechamento",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "visiting",
        "negotiating",
        "converted",
        "lost",
      ],
      message_channel: [
        "whatsapp_official",
        "whatsapp_evolution",
        "instagram",
        "facebook",
        "webchat",
        "email",
        "sms",
      ],
      property_purpose: ["sale", "rent", "both"],
      property_status: [
        "available",
        "reserved",
        "sold",
        "rented",
        "unavailable",
      ],
      property_type: [
        "apartment",
        "house",
        "land",
        "commercial",
        "rural",
        "development",
      ],
      sync_status: ["pending", "syncing", "synced", "failed"],
      user_role: ["admin", "manager", "agent", "assistant"],
    },
  },
} as const
