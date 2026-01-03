export interface Recipe {
  id: string
  title: string
  description: string | null
  category: string
  categoryId: string | null
  tags: string[]
  prepTime: number
  servings: number
  difficulty: string
  ingredients: string[]
  instructions: string[]
  tips: string[]
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
}

export interface Tag {
  id: string
  name: string
}

export interface RecipeFormData {
  title: string
  description: string
  categoryId: string
  prepTime: number
  servings: number
  difficulty: string
  ingredients: string[]
  instructions: string[]
  tips: string[]
  image?: string
}
