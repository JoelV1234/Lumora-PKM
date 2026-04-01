'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, LayoutList, LayoutGrid, Table } from 'lucide-react'
import { useObjects, useObjectType } from '@/lib/hooks'
import { createObject } from '@/lib/db'
import { DynamicIcon } from '@/components/icon'
import { useState } from 'react'

type ViewMode = 'list' | 'gallery' | 'table'

export default function ObjectTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type: typeId } = use(params)
  const router = useRouter()
  const objectType = useObjectType(typeId)
  const objects = useObjects(typeId)
  const [view, setView] = useState<ViewMode>('list')

  const handleCreate = async () => {
    if (!objectType) return
    const obj = await createObject(typeId, `Untitled ${objectType.name}`)
    router.push(`/objects/${typeId}/${obj.id}`)
  }

  if (!objectType) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DynamicIcon
            name={objectType.icon}
            size={24}
            style={{ color: objectType.color }}
          />
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {objectType.name}s
          </h1>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {objects.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggles */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
            {([
              { mode: 'list' as const, icon: LayoutList },
              { mode: 'gallery' as const, icon: LayoutGrid },
              { mode: 'table' as const, icon: Table },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`flex h-8 w-8 items-center justify-center transition-colors ${
                  view === mode
                    ? 'bg-accent/10 text-accent'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button
            onClick={handleCreate}
            className="flex h-8 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      {/* Content */}
      {objects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <DynamicIcon
            name={objectType.icon}
            size={40}
            className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600"
          />
          <p className="mb-4 text-sm text-muted">
            No {objectType.name.toLowerCase()}s yet
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            <Plus size={16} />
            Create your first {objectType.name.toLowerCase()}
          </button>
        </div>
      ) : view === 'list' ? (
        <ListView objects={objects} typeId={typeId} objectType={objectType} />
      ) : view === 'gallery' ? (
        <GalleryView objects={objects} typeId={typeId} objectType={objectType} />
      ) : (
        <TableView objects={objects} typeId={typeId} objectType={objectType} />
      )}
    </div>
  )
}

import type { LumoraObject, ObjectType } from '@/lib/types'

function ListView({
  objects,
  typeId,
  objectType,
}: {
  objects: LumoraObject[]
  typeId: string
  objectType: ObjectType
}) {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-1">
      {objects.map((obj) => (
        <button
          key={obj.id}
          onClick={() => router.push(`/objects/${typeId}/${obj.id}`)}
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <DynamicIcon
            name={objectType.icon}
            size={16}
            style={{ color: objectType.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-100">
              {obj.title}
            </div>
            {obj.blocks[0]?.content && (
              <div className="mt-0.5 text-xs text-muted truncate">
                {stripHtml(obj.blocks[0].content).slice(0, 100)}
              </div>
            )}
          </div>
          <span className="text-xs text-muted shrink-0">
            {new Date(obj.updatedAt).toLocaleDateString()}
          </span>
        </button>
      ))}
    </div>
  )
}

function GalleryView({
  objects,
  typeId,
  objectType,
}: {
  objects: LumoraObject[]
  typeId: string
  objectType: ObjectType
}) {
  const router = useRouter()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {objects.map((obj) => (
        <button
          key={obj.id}
          onClick={() => router.push(`/objects/${typeId}/${obj.id}`)}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-accent/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-accent/30"
        >
          <DynamicIcon
            name={objectType.icon}
            size={20}
            style={{ color: objectType.color }}
            className="mb-3"
          />
          <div className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-100">
            {obj.title}
          </div>
          {obj.blocks[0]?.content && (
            <div className="mt-1 text-xs text-muted line-clamp-2">
              {stripHtml(obj.blocks[0].content).slice(0, 80)}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

function TableView({
  objects,
  typeId,
  objectType,
}: {
  objects: LumoraObject[]
  typeId: string
  objectType: ObjectType
}) {
  const router = useRouter()
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <th className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">
              Name
            </th>
            {objectType.properties.slice(0, 3).map((prop) => (
              <th
                key={prop.id}
                className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400"
              >
                {prop.name}
              </th>
            ))}
            <th className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {objects.map((obj) => (
            <tr
              key={obj.id}
              onClick={() => router.push(`/objects/${typeId}/${obj.id}`)}
              className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                {obj.title}
              </td>
              {objectType.properties.slice(0, 3).map((prop) => (
                <td
                  key={prop.id}
                  className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400"
                >
                  {obj.properties[prop.id] != null
                    ? String(obj.properties[prop.id])
                    : '—'}
                </td>
              ))}
              <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                {new Date(obj.updatedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '')
}
