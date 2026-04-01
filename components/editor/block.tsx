'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { Block } from '@/lib/types'
import { Check } from 'lucide-react'

interface BlockComponentProps {
  block: Block
  focused: boolean
  spellCheck?: boolean
  onUpdate: (updates: Partial<Block>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onFocus: () => void
}

export function BlockComponent({
  block,
  focused,
  spellCheck = true,
  onUpdate,
  onKeyDown,
  onFocus,
}: BlockComponentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const blockIdRef = useRef(block.id)
  const blockTypeRef = useRef(block.type)

  // Only set innerHTML when the block id or type changes (not on every content update)
  useEffect(() => {
    if (!ref.current) return
    if (blockIdRef.current !== block.id || blockTypeRef.current !== block.type) {
      ref.current.innerHTML = block.content
      blockIdRef.current = block.id
      blockTypeRef.current = block.type
    }
  }, [block.id, block.type, block.content])

  // Set innerHTML on initial mount
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== block.content) {
      ref.current.innerHTML = block.content
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Focus management
  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus()
      // Place cursor at end
      const sel = window.getSelection()
      if (sel) {
        const range = document.createRange()
        range.selectNodeContents(ref.current)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }, [focused])

  const updateEmptyState = useCallback(() => {
    if (ref.current) {
      const text = ref.current.textContent?.trim() ?? ''
      ref.current.classList.toggle('is-empty', text === '')
    }
  }, [])

  const handleInput = useCallback(() => {
    if (ref.current) {
      onUpdate({ content: ref.current.innerHTML })
      updateEmptyState()
    }
  }, [onUpdate, updateEmptyState])

  // Set empty state on mount and after type change
  useEffect(() => {
    updateEmptyState()
  }, [block.type, updateEmptyState])

  const placeholder = getPlaceholder(block.type)
  const className = getBlockClassName(block.type)

  if (block.type === 'divider') {
    return (
      <div className="py-3">
        <hr className="border-zinc-200 dark:border-zinc-700" />
      </div>
    )
  }

  if (block.type === 'todo') {
    const isDone = block.properties?.checked === 'true'
    return (
      <div className="flex items-start gap-2 py-0.5">
        <button
          onClick={() =>
            onUpdate({
              properties: {
                ...block.properties,
                checked: isDone ? 'false' : 'true',
              },
            })
          }
          className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
            isDone
              ? 'border-accent bg-accent text-white'
              : 'border-zinc-300 hover:border-accent dark:border-zinc-600'
          }`}
        >
          {isDone && <Check size={10} strokeWidth={3} />}
        </button>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          spellCheck={spellCheck}
          data-placeholder={placeholder}
          className={`${className} flex-1 min-w-0 ${isDone ? 'text-muted line-through' : ''}`}
          onInput={handleInput}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
        />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={spellCheck}
      data-placeholder={placeholder}
      className={className}
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    />
  )
}

function getPlaceholder(type: string): string {
  switch (type) {
    case 'heading1':
      return 'Heading 1'
    case 'heading2':
      return 'Heading 2'
    case 'heading3':
      return 'Heading 3'
    case 'quote':
      return 'Quote'
    case 'code':
      return 'Code'
    case 'todo':
      return 'To-do'
    case 'callout':
      return 'Callout'
    default:
      return "Type '/' for commands..."
  }
}

function getBlockClassName(type: string): string {
  const base = 'outline-none py-0.5 leading-relaxed w-full'
  switch (type) {
    case 'heading1':
      return `${base} text-2xl font-bold text-zinc-900 dark:text-zinc-100 py-1`
    case 'heading2':
      return `${base} text-xl font-semibold text-zinc-900 dark:text-zinc-100 py-1`
    case 'heading3':
      return `${base} text-lg font-semibold text-zinc-900 dark:text-zinc-100 py-0.5`
    case 'bulletList':
      return `${base} pl-4 before:content-['•'] before:absolute before:-ml-4 before:text-zinc-400 relative`
    case 'numberedList':
      return `${base} pl-4`
    case 'quote':
      return `${base} pl-4 border-l-2 border-accent/50 italic text-muted`
    case 'code':
      return `${base} font-mono text-sm bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-3`
    case 'callout':
      return `${base} bg-accent/5 border border-accent/20 rounded-lg px-4 py-3`
    default:
      return `${base} text-zinc-700 dark:text-zinc-300`
  }
}
