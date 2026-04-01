'use client'

import { useRouter } from 'next/navigation'
import { X, Link as LinkIcon } from 'lucide-react'
import { useObjectTypes } from '@/lib/hooks'
import { DynamicIcon } from './icon'
import type { LumoraObject } from '@/lib/types'

interface BacklinksPanelProps {
  backlinks: LumoraObject[]
  onClose: () => void
}

export function BacklinksPanel({ backlinks, onClose }: BacklinksPanelProps) {
  const router = useRouter()
  const objectTypes = useObjectTypes()

  return (
    <div className="w-72 shrink-0 border-l border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <LinkIcon size={14} className="text-accent" />
          Linked Objects
          <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
            {backlinks.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-2">
        {backlinks.map((obj) => {
          const type = objectTypes.find((t) => t.id === obj.typeId)
          return (
            <button
              key={obj.id}
              onClick={() => {
                if (obj.typeId === 'daily-note') {
                  router.push(`/daily?date=${obj.dailyDate}`)
                } else {
                  router.push(`/objects/${obj.typeId}/${obj.id}`)
                }
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
            >
              {type && (
                <DynamicIcon
                  name={type.icon}
                  size={14}
                  style={{ color: type.color }}
                  className="shrink-0"
                />
              )}
              <span className="truncate text-zinc-700 dark:text-zinc-300">
                {obj.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
