// TypeScript types for Schedule Categories

export interface ScheduleCategory {
  id: string
  name: string
  color: string
  icon?: string
  description?: string
  isDefault: boolean
  displayOrder: number
  scheduleCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CategoryInfo {
  id: string
  name: string
  color: string
  icon?: string
}

export interface CategoryCreate {
  name: string
  color: string
  icon?: string
  description?: string
}

export interface CategoryUpdate extends Partial<CategoryCreate> {}

export interface CategoryOrderRequest {
  categoryId: string
  order: number
}

export interface ScheduleWithCategories {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  allDay: boolean
  color?: string
  location?: string
  categories: CategoryInfo[]
  createdAt: string
  updatedAt: string
}

// Request type for creating/updating schedules with multiple categories
export interface ScheduleRequest {
  title: string
  description?: string
  startTime: string
  endTime?: string
  allDay: boolean
  color?: string
  location?: string
  categoryIds: string[]  // Multiple category IDs
}
