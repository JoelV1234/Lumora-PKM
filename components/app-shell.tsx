'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { CommandPalette } from './command-palette'
import { useSettings } from '@/lib/settings'
import { createObject } from '@/lib/db'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const { settings } = useSettings()
  const router = useRouter()

  const handleGlobalShortcuts = useCallback(
    async (e: KeyboardEvent) => {
      const ctrl = e.metaKey || e.ctrlKey

      for (const shortcut of settings.shortcuts) {
        if (!shortcut.enabled) continue

        const parts = shortcut.keys.split('+')
        const needsCtrl = parts.includes('Ctrl')
        const needsShift = parts.includes('Shift')
        const needsAlt = parts.includes('Alt')
        const key = parts.filter((p) => !['Ctrl', 'Shift', 'Alt'].includes(p))[0]

        if (!key) continue
        const match =
          ctrl === needsCtrl &&
          e.shiftKey === needsShift &&
          e.altKey === needsAlt &&
          e.key.toUpperCase() === key.toUpperCase()

        if (!match) continue

        // Don't handle text-formatting shortcuts (bold, italic, etc) at app level
        if (['bold', 'italic', 'strikethrough'].includes(shortcut.action)) continue

        e.preventDefault()

        switch (shortcut.action) {
          case 'openCommandPalette':
            if (settings.commandPalette) setCommandPaletteOpen((prev) => !prev)
            break
          case 'newNote': {
            const obj = await createObject('note', 'Untitled Note')
            router.push(`/objects/note/${obj.id}`)
            break
          }
          case 'goDaily':
            router.push('/daily')
            break
          case 'goSearch':
            router.push('/search')
            break
          case 'goGraph':
            router.push('/graph')
            break
        }
        return
      }
    },
    [settings.shortcuts, settings.commandPalette, router]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalShortcuts)
    return () => window.removeEventListener('keydown', handleGlobalShortcuts)
  }, [handleGlobalShortcuts])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar defaultCollapsed={settings.sidebarCollapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onOpenCommandPalette={() => {
          if (settings.commandPalette) setCommandPaletteOpen(true)
        }} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {settings.commandPalette && (
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}
    </div>
  )
}
