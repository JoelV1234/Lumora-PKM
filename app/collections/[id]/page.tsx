'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { LayoutList, LayoutGrid, Table, Calendar, Columns, Settings, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'
import { useObjectTypes } from '@/lib/hooks'
import { DynamicIcon } from '@/components/icon'
import type { Collection, ViewType, LumoraObject } from '@/lib/types'

export default function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const objectTypes = useObjectTypes()

  const collection = useLiveQuery(() => db.collections.get(id), [id])
  const allObjects = useLiveQuery(() => db.objects.toArray(), []) ?? []

  if (!collection) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted">Collection not found</p>
      </div>
    )
  }

  const filtered = allObjects.filter((obj) => {
    for (const filter of collection.filters) {
      const value = filter.field === 'typeId' ? obj.typeId : String(obj.properties[filter.field] ?? '')
      switch (filter.operator) {
        case 'equals':
          if (value !== filter.value) return false
          break
        case 'contains':
          if (!value.toLowerCase().includes(filter.value.toLowerCase())) return false
          break
        case 'isEmpty':
          if (value) return false
          break
        case 'isNotEmpty':
          if (!value) return false
          break
      }
    }
    return true
  })

  const handleViewChange = async (viewType: ViewType) => {
    await db.collections.update(id, { viewType, updatedAt: new Date().toISOString() })
  }

  const handleDelete = async () => {
    if (confirm('Delete this collection?')) {
      await db.collections.delete(id)
      router.push('/')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {collection.name}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
            {([
              { mode: 'list' as ViewType, icon: LayoutList },
              { mode: 'gallery' as ViewType, icon: LayoutGrid },
              { mode: 'table' as ViewType, icon: Table },
              { mode: 'kanban' as ViewType, icon: Columns },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => handleViewChange(mode)}
                className={`flex h-8 w-8 items-center justify-center transition-colors ${
                  collection.viewType === mode
                    ? 'bg-accent/10 text-accent'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Render view */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted">
          No objects match this collection&apos;s filters
        </div>
      ) : collection.viewType === 'gallery' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((obj) => {
            const type = objectTypes.find((t) => t.id === obj.typeId)
            return (
              <button
                key={obj.id}
                onClick={() => router.push(`/objects/${obj.typeId}/${obj.id}`)}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-accent/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {type && (
                  <DynamicIcon name={type.icon} size={20} style={{ color: type.color }} className="mb-2" />
                )}
                <div className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-100">
                  {obj.title}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((obj) => {
            const type = objectTypes.find((t) => t.id === obj.typeId)
            return (
              <button
                key={obj.id}
                onClick={() => router.push(`/objects/${obj.typeId}/${obj.id}`)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {type && (
                  <DynamicIcon name={type.icon} size={16} style={{ color: type.color }} />
                )}
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {obj.title}
                </span>
                <span className="ml-auto text-xs text-muted">
                  {new Date(obj.updatedAt).toLocaleDateString()}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
