'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Calendar, Network, Plus, ArrowRight } from 'lucide-react'
import { useSearch, useObjectTypes } from '@/lib/hooks'
import { createObject } from '@/lib/db'
import { DynamicIcon } from './icon'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const results = useSearch(query)
  const objectTypes = useObjectTypes()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const quickActions = [
    { id: 'daily', label: 'Go to Daily Notes', icon: Calendar, action: () => router.push('/daily') },
    { id: 'graph', label: 'Open Graph View', icon: Network, action: () => router.push('/graph') },
    ...objectTypes
      .filter((t) => t.id !== 'daily-note')
      .slice(0, 5)
      .map((t) => ({
        id: `new-${t.id}`,
        label: `New ${t.name}`,
        icon: Plus,
        action: async () => {
          const obj = await createObject(t.id, `Untitled ${t.name}`)
          router.push(`/objects/${t.id}/${obj.id}`)
        },
      })),
  ]

  const allItems = query.length >= 2
    ? results.map((obj) => ({
        id: obj.id,
        label: obj.title,
        typeId: obj.typeId,
        action: () => {
          if (obj.typeId === 'daily-note') {
            router.push(`/daily?date=${obj.dailyDate}`)
          } else {
            router.push(`/objects/${obj.typeId}/${obj.id}`)
          }
        },
      }))
    : []

  const items = query.length >= 2 ? allItems : quickActions

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault()
        items[selectedIndex].action()
        onClose()
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [items, selectedIndex, onClose]
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 animate-in slide-in-from-top-2 fade-in duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700">
          <Search size={18} className="shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or jump to..."
            className="h-12 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.length >= 2 && items.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-zinc-400">
              No results found
            </div>
          )}
          {items.map((item, index) => {
            const isSearch = 'typeId' in item
            const objectType = isSearch
              ? objectTypes.find((t) => t.id === (item as { typeId: string }).typeId)
              : null

            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action()
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-accent/10 text-accent'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {isSearch && objectType ? (
                  <DynamicIcon
                    name={objectType.icon}
                    size={16}
                    style={{ color: objectType.color }}
                  />
                ) : !isSearch && 'icon' in item ? (
                  <item.icon size={16} />
                ) : null}
                <span className="truncate">{item.label}</span>
                {index === selectedIndex && (
                  <ArrowRight size={14} className="ml-auto shrink-0 opacity-50" />
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-zinc-200 px-4 py-2 text-[11px] text-zinc-400 dark:border-zinc-700">
          <span>
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 dark:border-zinc-600 dark:bg-zinc-800">
              ↑↓
            </kbd>{' '}
            navigate
          </span>
          <span>
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 dark:border-zinc-600 dark:bg-zinc-800">
              ↵
            </kbd>{' '}
            select
          </span>
          <span>
            <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 dark:border-zinc-600 dark:bg-zinc-800">
              esc
            </kbd>{' '}
            close
          </span>
        </div>
      </div>
    </div>
  )
}
