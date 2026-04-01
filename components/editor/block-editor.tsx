'use client'

import { useState, useCallback, useRef } from 'react'
import type { Block, BlockType } from '@/lib/types'
import { useSettings } from '@/lib/settings'
import { BlockComponent } from './block'
import { BlockMenu } from './block-menu'
import { GripVertical, Plus } from 'lucide-react'

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

function getTextContent(el: HTMLElement | null): string {
  if (!el) return ''
  return el.textContent?.trim() ?? ''
}

const MARKDOWN_SHORTCUTS: { pattern: RegExp; type: BlockType }[] = [
  { pattern: /^#\s$/, type: 'heading1' },
  { pattern: /^##\s$/, type: 'heading2' },
  { pattern: /^###\s$/, type: 'heading3' },
  { pattern: /^[-*]\s$/, type: 'bulletList' },
  { pattern: /^1[.)]\s$/, type: 'numberedList' },
  { pattern: /^\[]\s$/, type: 'todo' },
  { pattern: /^>\s$/, type: 'quote' },
  { pattern: /^```$/, type: 'code' },
  { pattern: /^---$/, type: 'divider' },
]

const EDITOR_WIDTH_MAP = {
  narrow: 'max-w-xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const { settings } = useSettings()
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuBlockIndex, setMenuBlockIndex] = useState(0)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const updateBlock = useCallback(
    (id: string, updates: Partial<Block>) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
    },
    [blocks, onChange]
  )

  const addBlock = useCallback(
    (afterIndex: number, type: BlockType = 'paragraph') => {
      const newBlock: Block = {
        id: crypto.randomUUID(),
        type,
        content: '',
      }
      const next = [...blocks]
      next.splice(afterIndex + 1, 0, newBlock)
      onChange(next)
      setTimeout(() => setFocusedBlockId(newBlock.id), 20)
    },
    [blocks, onChange]
  )

  const removeBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return
      const index = blocks.findIndex((b) => b.id === id)
      const prevId = index > 0 ? blocks[index - 1].id : null
      onChange(blocks.filter((b) => b.id !== id))
      if (prevId) {
        setTimeout(() => setFocusedBlockId(prevId), 20)
      }
    },
    [blocks, onChange]
  )

  const handleKeyDown = useCallback(
    (blockId: string, e: React.KeyboardEvent) => {
      const index = blocks.findIndex((b) => b.id === blockId)
      const block = blocks[index]
      const target = e.currentTarget as HTMLElement
      const textContent = getTextContent(target)

      // Enter: split or create new block
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (textContent === '' && block.type !== 'paragraph') {
          updateBlock(blockId, { type: 'paragraph', content: '' })
          return
        }
        const newType = block.type === 'todo' ? 'todo' : 'paragraph'
        addBlock(index, newType)
        return
      }

      // Backspace on empty block
      if (e.key === 'Backspace' && textContent === '') {
        e.preventDefault()
        if (block.type !== 'paragraph') {
          updateBlock(blockId, { type: 'paragraph', content: '' })
        } else {
          removeBlock(blockId)
        }
        return
      }

      // Arrow up at start
      if (e.key === 'ArrowUp' && index > 0) {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const preRange = document.createRange()
          preRange.selectNodeContents(target)
          preRange.setEnd(range.startContainer, range.startOffset)
          if (preRange.toString().length === 0) {
            e.preventDefault()
            setFocusedBlockId(blocks[index - 1].id)
          }
        }
      }

      // Arrow down at end
      if (e.key === 'ArrowDown' && index < blocks.length - 1) {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const postRange = document.createRange()
          postRange.selectNodeContents(target)
          postRange.setStart(range.endContainer, range.endOffset)
          if (postRange.toString().length === 0) {
            e.preventDefault()
            setFocusedBlockId(blocks[index + 1].id)
          }
        }
      }

      // Slash commands (if enabled)
      if (e.key === '/' && textContent === '' && settings.slashCommands) {
        e.preventDefault()
        setMenuBlockIndex(index)
        const rect = target.getBoundingClientRect()
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (containerRect) {
          setMenuPosition({
            top: rect.bottom - containerRect.top + 4,
            left: rect.left - containerRect.left,
          })
        }
        setMenuOpen(true)
        return
      }

      // Macro expansion on Space or Tab
      if ((e.key === ' ' || e.key === 'Tab') && settings.macros.length > 0) {
        const raw = target.textContent ?? ''
        for (const macro of settings.macros) {
          if (macro.enabled && raw === macro.trigger) {
            e.preventDefault()
            target.innerHTML = macro.content
            updateBlock(blockId, { content: macro.content })
            // Place cursor at end
            const sel = window.getSelection()
            if (sel) {
              const range = document.createRange()
              range.selectNodeContents(target)
              range.collapse(false)
              sel.removeAllRanges()
              sel.addRange(range)
            }
            return
          }
        }
      }

      // Markdown shortcuts on Space (if enabled)
      if (e.key === ' ' && block.type === 'paragraph' && settings.markdownShortcuts) {
        const currentText = target.textContent ?? ''
        const withSpace = currentText + ' '
        for (const shortcut of MARKDOWN_SHORTCUTS) {
          if (shortcut.pattern.test(withSpace)) {
            e.preventDefault()
            target.innerHTML = ''
            updateBlock(blockId, { type: shortcut.type, content: '' })
            setTimeout(() => setFocusedBlockId(blockId), 20)
            return
          }
        }
      }

      // Tab — prevent losing focus
      if (e.key === 'Tab') {
        e.preventDefault()
      }
    },
    [blocks, addBlock, removeBlock, updateBlock, settings.slashCommands, settings.markdownShortcuts, settings.macros]
  )

  const handleMenuSelect = useCallback(
    (type: BlockType) => {
      const block = blocks[menuBlockIndex]
      if (block) {
        updateBlock(block.id, { type, content: '' })
        setTimeout(() => setFocusedBlockId(block.id), 20)
      }
      setMenuOpen(false)
    },
    [blocks, menuBlockIndex, updateBlock]
  )

  const moveBlock = useCallback(
    (fromIndex: number, toIndex: number) => {
      const next = [...blocks]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      onChange(next)
    },
    [blocks, onChange]
  )

  return (
    <div ref={containerRef} className="block-editor relative">
      {blocks.map((block, index) => (
        <div key={block.id} className="group relative flex items-start">
          {/* Block controls — hidden if disabled in settings */}
          {settings.showBlockControls && (
            <div className="flex shrink-0 items-center gap-0.5 pt-1 pr-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => addBlock(index - 1)}
                className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                title="Add block"
              >
                <Plus size={14} />
              </button>
              <button
                className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                title="Drag to reorder"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(index))
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                  if (!isNaN(fromIndex)) moveBlock(fromIndex, index)
                }}
              >
                <GripVertical size={14} />
              </button>
            </div>
          )}

          {/* Block content */}
          <div className="flex-1 min-w-0">
            <BlockComponent
              block={block}
              focused={focusedBlockId === block.id}
              spellCheck={settings.spellCheck}
              onUpdate={(updates) => updateBlock(block.id, updates)}
              onKeyDown={(e) => handleKeyDown(block.id, e)}
              onFocus={() => setFocusedBlockId(block.id)}
            />
          </div>
        </div>
      ))}

      {menuOpen && (
        <BlockMenu
          position={menuPosition}
          onSelect={handleMenuSelect}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  )
}
