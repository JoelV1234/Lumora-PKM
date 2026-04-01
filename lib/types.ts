export interface ObjectType {
  id: string
  name: string
  icon: string
  color: string
  builtIn: boolean
  properties: PropertyDefinition[]
  createdAt: string
  updatedAt: string
}

export interface PropertyDefinition {
  id: string
  name: string
  type: PropertyType
  options?: string[]
  required?: boolean
}

export type PropertyType =
  | 'text'
  | 'multiline'
  | 'date'
  | 'dateRange'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'multiSelect'
  | 'relation'
  | 'url'
  | 'email'
  | 'tags'

export interface LumoraObject {
  id: string
  typeId: string
  title: string
  properties: Record<string, PropertyValue>
  blocks: Block[]
  createdAt: string
  updatedAt: string
  dailyDate?: string
}

export type PropertyValue = string | number | boolean | string[] | null | {
  start: string
  end: string
}

export interface Block {
  id: string
  type: BlockType
  content: string
  properties?: Record<string, string>
}

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'todo'
  | 'quote'
  | 'divider'
  | 'image'
  | 'code'
  | 'callout'

export interface Link {
  id: string
  sourceId: string
  targetId: string
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  icon: string
  viewType: ViewType
  filters: CollectionFilter[]
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  createdAt: string
  updatedAt: string
}

export type ViewType = 'list' | 'table' | 'gallery' | 'calendar' | 'kanban'

export interface CollectionFilter {
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'isEmpty' | 'isNotEmpty'
  value: string
}
