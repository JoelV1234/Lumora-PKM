'use client'

import { use, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Link as LinkIcon, ChevronRight } from 'lucide-react'
import { useObject, useObjectType, useBacklinks, useObjectTypes } from '@/lib/hooks'
import { updateObject, deleteObject } from '@/lib/db'
import { useSettings } from '@/lib/settings'
import { BlockEditor } from '@/components/editor/block-editor'
import { PropertyEditor } from '@/components/property-editor'
import { BacklinksPanel } from '@/components/backlinks-panel'
import { DynamicIcon } from '@/components/icon'
import type { Block, PropertyValue } from '@/lib/types'

const EDITOR_WIDTH_MAP = {
  narrow: 'max-w-xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
}

export default function ObjectPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type: typeId, id } = use(params)
  const router = useRouter()
  const { settings } = useSettings()
  const obj = useObject(id)
  const objectType = useObjectType(typeId)
  const backlinks = useBacklinks(id)
  const [showBacklinks, setShowBacklinks] = useState(true)

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (obj) updateObject(obj.id, { title: e.target.value })
    },
    [obj]
  )

  const handleBlocksChange = useCallback(
    (blocks: Block[]) => {
      if (obj) updateObject(obj.id, { blocks })
    },
    [obj]
  )

  const handlePropertiesChange = useCallback(
    (properties: Record<string, PropertyValue>) => {
      if (obj) updateObject(obj.id, { properties })
    },
    [obj]
  )

  const handleDelete = async () => {
    if (!obj) return
    if (confirm('Delete this object? This cannot be undone.')) {
      await deleteObject(obj.id)
      router.push(`/objects/${typeId}`)
    }
  }

  if (!obj || !objectType) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`mx-auto ${EDITOR_WIDTH_MAP[settings.editorWidth]} px-6 py-10`}>
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted">
            <button
              onClick={() => router.push(`/objects/${typeId}`)}
              className="flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <DynamicIcon
                name={objectType.icon}
                size={14}
                style={{ color: objectType.color }}
              />
              {objectType.name}s
            </button>
            <ChevronRight size={12} />
            <span className="text-zinc-900 dark:text-zinc-100 truncate">
              {obj.title}
            </span>
          </div>

          {/* Title */}
          <input
            value={obj.title}
            onChange={handleTitleChange}
            className="mb-2 w-full bg-transparent text-3xl font-bold text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            placeholder="Untitled"
          />

          {/* Properties */}
          {objectType.properties.length > 0 && (
            <div className="mb-8">
              <PropertyEditor
                definitions={objectType.properties}
                values={obj.properties}
                onChange={handlePropertiesChange}
              />
            </div>
          )}

          {/* Editor */}
          <div className="min-h-[50vh]">
            <BlockEditor blocks={obj.blocks} onChange={handleBlocksChange} />
          </div>

          {/* Actions */}
          <div className="mt-12 flex items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={14} />
              Delete
            </button>
            <span className="text-xs text-muted">
              Created {new Date(obj.createdAt).toLocaleDateString()} · Updated{' '}
              {new Date(obj.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Backlinks Panel */}
      {showBacklinks && backlinks.length > 0 && (
        <BacklinksPanel
          backlinks={backlinks}
          onClose={() => setShowBacklinks(false)}
        />
      )}

      {/* Toggle backlinks */}
      {!showBacklinks && backlinks.length > 0 && (
        <button
          onClick={() => setShowBacklinks(true)}
          className="fixed right-4 top-20 flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <LinkIcon size={12} />
          {backlinks.length} links
        </button>
      )}
    </div>
  )
}
