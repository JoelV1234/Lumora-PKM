'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getOrCreateDailyNote, updateObject } from '@/lib/db'
import { useDailyNote } from '@/lib/hooks'
import { useSettings } from '@/lib/settings'
import { BlockEditor } from '@/components/editor/block-editor'
import type { Block } from '@/lib/types'

const EDITOR_WIDTH_MAP = {
  narrow: 'max-w-xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
}

function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}

function formatDateTitle(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function DailyNotesPage() {
  const { settings } = useSettings()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const dateKey = formatDateKey(currentDate)
  const dailyNote = useDailyNote(dateKey)

  useEffect(() => {
    getOrCreateDailyNote(dateKey)
  }, [dateKey])

  const goToday = () => setCurrentDate(new Date())
  const goPrev = () => {
    setCurrentDate((d) => {
      const prev = new Date(d)
      prev.setDate(prev.getDate() - 1)
      return prev
    })
  }
  const goNext = () => {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      return next
    })
  }

  const handleBlocksChange = useCallback(
    (blocks: Block[]) => {
      if (dailyNote) {
        updateObject(dailyNote.id, { blocks })
      }
    },
    [dailyNote]
  )

  const isToday = formatDateKey(new Date()) === dateKey

  return (
    <div className={`mx-auto ${EDITOR_WIDTH_MAP[settings.editorWidth]} px-6 py-10`}>
      {/* Date Navigation */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={goPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatDateTitle(currentDate)}
          </h1>
          {isToday && (
            <span className="mt-0.5 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              Today
            </span>
          )}
        </div>

        <button
          onClick={goNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {!isToday && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={goToday}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Back to today
          </button>
        </div>
      )}

      {/* Editor */}
      {dailyNote && (
        <div className="min-h-[60vh]">
          <BlockEditor blocks={dailyNote.blocks} onChange={handleBlocksChange} />
        </div>
      )}
    </div>
  )
}
