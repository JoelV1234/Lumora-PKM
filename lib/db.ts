import Dexie, { type EntityTable } from 'dexie'
import type { LumoraObject, ObjectType, Link, Collection, PropertyValue } from './types'

const db = new Dexie('lumora') as Dexie & {
  objects: EntityTable<LumoraObject, 'id'>
  objectTypes: EntityTable<ObjectType, 'id'>
  links: EntityTable<Link, 'id'>
  collections: EntityTable<Collection, 'id'>
}

db.version(1).stores({
  objects: 'id, typeId, title, dailyDate, createdAt, updatedAt',
  objectTypes: 'id, name, builtIn',
  links: 'id, sourceId, targetId',
  collections: 'id, name',
})

export { db }

export const DEFAULT_OBJECT_TYPES: Omit<ObjectType, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'note',
    name: 'Note',
    icon: 'FileText',
    color: '#6366f1',
    builtIn: true,
    properties: [
      { id: 'tags', name: 'Tags', type: 'tags' },
    ],
  },
  {
    id: 'daily-note',
    name: 'Daily Note',
    icon: 'Calendar',
    color: '#8b5cf6',
    builtIn: true,
    properties: [],
  },
  {
    id: 'person',
    name: 'Person',
    icon: 'User',
    color: '#ec4899',
    builtIn: true,
    properties: [
      { id: 'email', name: 'Email', type: 'email' },
      { id: 'role', name: 'Role', type: 'text' },
      { id: 'company', name: 'Company', type: 'text' },
    ],
  },
  {
    id: 'book',
    name: 'Book',
    icon: 'BookOpen',
    color: '#f59e0b',
    builtIn: true,
    properties: [
      { id: 'author', name: 'Author', type: 'text' },
      { id: 'status', name: 'Status', type: 'select', options: ['To Read', 'Reading', 'Finished'] },
      { id: 'rating', name: 'Rating', type: 'number' },
    ],
  },
  {
    id: 'project',
    name: 'Project',
    icon: 'FolderKanban',
    color: '#14b8a6',
    builtIn: true,
    properties: [
      { id: 'status', name: 'Status', type: 'select', options: ['Active', 'On Hold', 'Completed', 'Archived'] },
      { id: 'deadline', name: 'Deadline', type: 'date' },
    ],
  },
  {
    id: 'meeting',
    name: 'Meeting',
    icon: 'Users',
    color: '#06b6d4',
    builtIn: true,
    properties: [
      { id: 'date', name: 'Date', type: 'date' },
      { id: 'attendees', name: 'Attendees', type: 'relation' },
    ],
  },
  {
    id: 'task',
    name: 'Task',
    icon: 'CheckSquare',
    color: '#22c55e',
    builtIn: true,
    properties: [
      { id: 'status', name: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'] },
      { id: 'priority', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
      { id: 'dueDate', name: 'Due Date', type: 'date' },
      { id: 'done', name: 'Done', type: 'checkbox' },
    ],
  },
  {
    id: 'event',
    name: 'Event',
    icon: 'CalendarDays',
    color: '#a855f7',
    builtIn: true,
    properties: [
      { id: 'dateRange', name: 'Date Range', type: 'dateRange' },
      { id: 'location', name: 'Location', type: 'text' },
    ],
  },
  {
    id: 'highlight',
    name: 'Highlight',
    icon: 'Highlighter',
    color: '#eab308',
    builtIn: true,
    properties: [
      { id: 'source', name: 'Source', type: 'url' },
    ],
  },
  {
    id: 'image',
    name: 'Image',
    icon: 'Image',
    color: '#f97316',
    builtIn: true,
    properties: [
      { id: 'url', name: 'URL', type: 'url' },
      { id: 'alt', name: 'Alt Text', type: 'text' },
    ],
  },
  {
    id: 'link',
    name: 'Link',
    icon: 'Link',
    color: '#3b82f6',
    builtIn: true,
    properties: [
      { id: 'url', name: 'URL', type: 'url' },
      { id: 'description', name: 'Description', type: 'multiline' },
    ],
  },
  {
    id: 'idea',
    name: 'Idea',
    icon: 'Lightbulb',
    color: '#facc15',
    builtIn: true,
    properties: [
      { id: 'tags', name: 'Tags', type: 'tags' },
    ],
  },
]

export async function initializeDatabase() {
  const count = await db.objectTypes.count()
  if (count === 0) {
    const now = new Date().toISOString()
    await db.objectTypes.bulkAdd(
      DEFAULT_OBJECT_TYPES.map((t) => ({
        ...t,
        createdAt: now,
        updatedAt: now,
      }))
    )
  }
}

export async function getOrCreateDailyNote(date: string): Promise<LumoraObject> {
  const existing = await db.objects.where('dailyDate').equals(date).first()
  if (existing) return existing

  const now = new Date().toISOString()
  const d = new Date(date)
  const title = d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const note: LumoraObject = {
    id: `daily-${date}`,
    typeId: 'daily-note',
    title,
    properties: {},
    blocks: [{ id: crypto.randomUUID(), type: 'paragraph', content: '' }],
    createdAt: now,
    updatedAt: now,
    dailyDate: date,
  }

  await db.objects.add(note)
  return note
}

export async function createObject(
  typeId: string,
  title: string,
  properties: Record<string, PropertyValue> = {}
): Promise<LumoraObject> {
  const now = new Date().toISOString()
  const obj: LumoraObject = {
    id: crypto.randomUUID(),
    typeId,
    title,
    properties,
    blocks: [{ id: crypto.randomUUID(), type: 'paragraph', content: '' }],
    createdAt: now,
    updatedAt: now,
  }
  await db.objects.add(obj)
  return obj
}

export async function updateObject(id: string, updates: Partial<LumoraObject>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.objects.update(id, { ...updates, updatedAt: new Date().toISOString() } as any)
}

export async function deleteObject(id: string) {
  await db.objects.delete(id)
  await db.links.where('sourceId').equals(id).delete()
  await db.links.where('targetId').equals(id).delete()
}

export async function createLink(sourceId: string, targetId: string) {
  const existing = await db.links
    .where('sourceId')
    .equals(sourceId)
    .filter((l) => l.targetId === targetId)
    .first()
  if (existing) return existing

  const link: Link = {
    id: crypto.randomUUID(),
    sourceId,
    targetId,
    createdAt: new Date().toISOString(),
  }
  await db.links.add(link)
  return link
}

export async function getBacklinks(objectId: string) {
  const incoming = await db.links.where('targetId').equals(objectId).toArray()
  const outgoing = await db.links.where('sourceId').equals(objectId).toArray()
  const linkedIds = [
    ...incoming.map((l) => l.sourceId),
    ...outgoing.map((l) => l.targetId),
  ]
  return db.objects.where('id').anyOf(linkedIds).toArray()
}

export async function searchObjects(query: string) {
  const lower = query.toLowerCase()
  return db.objects
    .filter((obj) => {
      if (obj.title.toLowerCase().includes(lower)) return true
      return obj.blocks.some((b) => b.content.toLowerCase().includes(lower))
    })
    .limit(50)
    .toArray()
}
