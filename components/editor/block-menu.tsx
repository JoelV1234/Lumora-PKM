'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BlockType } from '@/lib/types'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  MessageSquare,
} from 'lucide-react'

interface BlockMenuProps {
  position: { top: number; left: number }
  onSelect: (type: BlockType) => void
  onClose: () => void
}

const menuItems: { type: BlockType; label: string; icon: typeof Type; description: string }[] = [
  { type: 'paragraph', label: 'Text', icon: Type, description: 'Plain text' },
  { type: 'heading1', label: 'Heading 1', icon: Heading1, description: 'Large heading' },
  { type: 'heading2', label: 'Heading 2', icon: Heading2, description: 'Medium heading' },
  { type: 'heading3', label: 'Heading 3', icon: Heading3, description: 'Small heading' },
  { type: 'bulletList', label: 'Bullet List', icon: List, description: 'Unordered list' },
  { type: 'numberedList', label: 'Numbered List', icon: ListOrdered, description: 'Ordered list' },
  { type: 'todo', label: 'To-do', icon: CheckSquare, description: 'Checkbox item' },
  { type: 'quote', label: 'Quote', icon: Quote, description: 'Block quote' },
  { type: 'code', label: 'Code', icon: Code, description: 'Code block' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Horizontal line' },
  { type: 'callout', label: 'Callout', icon: MessageSquare, description: 'Highlighted block' },
]

export function BlockMenu({ position, onSelect, onClose }: BlockMenuProps) {
  const [selected, setSelected] = useState(0)
  const [filter, setFilter] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = menuItems.filter(
    (item) =>
      item.label.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase())
  )

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 30)
  }, [])

  const handleSelect = useCallback(
    (type: BlockType) => {
      onSelect(type)
    },
    [onSelect]
  )

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((i) => Math.min(i + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        if (filtered[selected]) handleSelect(filtered[selected].type)
      }
    },
    [filtered, selected, handleSelect, onClose]
  )

  useEffect(() => {
    setSelected(0)
  }, [filter])

  return (
    <div
      ref={ref}
      style={{ top: position.top, left: position.left }}
      className="absolute z-20 w-64 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 animate-slide-up"
    >
      <input
        ref={inputRef}
        placeholder="Filter blocks..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-1 w-full rounded-lg bg-zinc-50 px-3 py-1.5 text-sm outline-none dark:bg-zinc-800"
      />
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-xs text-muted">No matching blocks</div>
        )}
        {filtered.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.type}
              onClick={() => handleSelect(item.type)}
              onMouseEnter={() => setSelected(index)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                index === selected
                  ? 'bg-accent/10 text-accent'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <div className="min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted">{item.description}</div>
              </div>
            </button>
          )
        })}
      </div>
      <div className="border-t border-zinc-100 px-3 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800">
        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 dark:border-zinc-700 dark:bg-zinc-800">↑↓</kbd> navigate{' '}
        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 dark:border-zinc-700 dark:bg-zinc-800">↵</kbd> select{' '}
        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 dark:border-zinc-700 dark:bg-zinc-800">esc</kbd> close
      </div>
    </div>
  )
}
