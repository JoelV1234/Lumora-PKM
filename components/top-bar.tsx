'use client'

import { Search, Command } from 'lucide-react'
import { useState } from 'react'

interface TopBarProps {
  title?: string
  onOpenCommandPalette: () => void
}

export function TopBar({ title, onOpenCommandPalette }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-4 flex h-5 items-center gap-0.5 rounded border border-zinc-300 bg-zinc-100 px-1.5 text-[10px] font-medium text-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
            <Command size={10} />K
          </kbd>
        </button>
      </div>
    </header>
  )
}
