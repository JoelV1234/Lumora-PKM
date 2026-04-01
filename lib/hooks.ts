'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { LumoraObject, ObjectType } from './types'

export function useObjectTypes() {
  return useLiveQuery(() => db.objectTypes.toArray()) ?? []
}

export function useObjectType(id: string) {
  return useLiveQuery(() => db.objectTypes.get(id), [id])
}

export function useObjects(typeId?: string) {
  return (
    useLiveQuery(() => {
      if (typeId) return db.objects.where('typeId').equals(typeId).reverse().sortBy('updatedAt')
      return db.objects.reverse().sortBy('updatedAt')
    }, [typeId]) ?? []
  )
}

export function useObject(id: string | undefined) {
  return useLiveQuery(() => (id ? db.objects.get(id) : undefined), [id])
}

export function useRecentObjects(limit = 10) {
  return (
    useLiveQuery(async () => {
      const all = await db.objects.reverse().sortBy('updatedAt')
      return all.filter((o) => o.typeId !== 'daily-note').slice(0, limit)
    }, [limit]) ?? []
  )
}

export function useBacklinks(objectId: string | undefined) {
  return (
    useLiveQuery(async () => {
      if (!objectId) return []
      const incoming = await db.links.where('targetId').equals(objectId).toArray()
      const outgoing = await db.links.where('sourceId').equals(objectId).toArray()
      const linkedIds = [
        ...incoming.map((l) => l.sourceId),
        ...outgoing.map((l) => l.targetId),
      ]
      if (linkedIds.length === 0) return []
      return db.objects.where('id').anyOf(linkedIds).toArray()
    }, [objectId]) ?? []
  )
}

export function useAllLinks() {
  return useLiveQuery(() => db.links.toArray()) ?? []
}

export function useDailyNote(date: string) {
  return useLiveQuery(
    () => db.objects.where('dailyDate').equals(date).first(),
    [date]
  )
}

export function useCollections() {
  return useLiveQuery(() => db.collections.toArray()) ?? []
}

export function useSearch(query: string) {
  return (
    useLiveQuery(async () => {
      if (!query || query.length < 2) return []
      const lower = query.toLowerCase()
      return db.objects
        .filter((obj) => {
          if (obj.title.toLowerCase().includes(lower)) return true
          return obj.blocks.some((b) => b.content.toLowerCase().includes(lower))
        })
        .limit(20)
        .toArray()
    }, [query]) ?? []
  )
}
