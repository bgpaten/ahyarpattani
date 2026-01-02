
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          type: 'web' | 'mobile' | 'backend' | 'devops' | 'other'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type?: 'web' | 'mobile' | 'backend' | 'devops' | 'other'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: 'web' | 'mobile' | 'backend' | 'devops' | 'other'
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          description: string | null
          stack: string[] | null
          featured: boolean
          status: 'draft' | 'published'
          thumbnail_url: string | null
          live_url: string | null
          repo_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          description?: string | null
          stack?: string[] | null
          featured?: boolean
          status?: 'draft' | 'published'
          thumbnail_url?: string | null
          live_url?: string | null
          repo_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          description?: string | null
          stack?: string[] | null
          featured?: boolean
          status?: 'draft' | 'published'
          thumbnail_url?: string | null
          live_url?: string | null
          repo_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          project_id: string
          category_id: string
        }
        Insert: {
          project_id: string
          category_id: string
        }
        Update: {
          project_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      project_media: {
        Row: {
          id: string
          project_id: string
          url: string
          type: 'image' | 'video'
          orientation: 'portrait' | 'landscape' | 'square'
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          url: string
          type?: 'image' | 'video'
          orientation?: 'portrait' | 'landscape' | 'square'
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          url?: string
          type?: 'image' | 'video'
          orientation?: 'portrait' | 'landscape' | 'square'
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'viewer'
          created_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'viewer'
          created_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          full_name: string | null
          headline: string | null
          location: string | null
          email: string | null
          phone: string | null
          cv_url: string | null
          socials: Json | null
        }
        Insert: {
          id?: string
          full_name?: string | null
          headline?: string | null
          location?: string | null
          email?: string | null
          phone?: string | null
          cv_url?: string | null
          socials?: Json | null
        }
        Update: {
          id?: string
          full_name?: string | null
          headline?: string | null
          location?: string | null
          email?: string | null
          phone?: string | null
          cv_url?: string | null
          socials?: Json | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
    }
    Functions: {
    }
    Enums: {
    }
  }
}
