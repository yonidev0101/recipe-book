export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          category_id: string | null
          prep_time: number
          servings: number
          difficulty: string
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category_id?: string | null
          prep_time: number
          servings: number
          difficulty: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category_id?: string | null
          prep_time?: number
          servings?: number
          difficulty?: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      recipe_tags: {
        Row: {
          recipe_id: string
          tag_id: string
        }
        Insert: {
          recipe_id: string
          tag_id: string
        }
        Update: {
          recipe_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          id: string
          recipe_id: string
          text: string
          order_num: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          text: string
          order_num: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          text?: string
          order_num?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      instructions: {
        Row: {
          id: string
          recipe_id: string
          text: string
          order_num: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          text: string
          order_num: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          text?: string
          order_num?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          id: string
          recipe_id: string
          text: string
          order_num: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          text: string
          order_num: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          text?: string
          order_num?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tips_recipe_id_fkey"
            columns: ["recipe_id"]
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          id: string
          recipe_id: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
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
  }
}
