'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system'
export type Accent = 'indigo' | 'teal' | 'emerald' | 'rose' | 'amber' | 'cyan'
export type FontSize = 'small' | 'default' | 'large'
export type EditorWidth = 'narrow' | 'default' | 'wide' | 'full'

export interface Macro {
  id: string
  name: string
  trigger: string
  content: string
  enabled: boolean
}

export interface KeyboardShortcut {
  id: string
  label: string
  keys: string
  action: string
  enabled: boolean
}

export interface AppSettings {
  // Appearance
  theme: Theme
  accent: Accent
  fontSize: FontSize
  sidebarCollapsed: boolean
  showLineNumbers: boolean

  // Editor
  editorWidth: EditorWidth
  slashCommands: boolean
  markdownShortcuts: boolean
  spellCheck: boolean
  autoSaveInterval: number // seconds, 0 = instant
  showBlockControls: boolean
  typewriterMode: boolean

  // Daily Notes
  dailyNoteTemplate: string
  weekStartsOn: 'sunday' | 'monday'

  // Navigation
  startPage: 'home' | 'daily' | 'search'
  commandPalette: boolean

  // Macros
  macros: Macro[]

  // Keyboard shortcuts
  shortcuts: KeyboardShortcut[]
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { id: 'cmd-palette', label: 'Command Palette', keys: 'Ctrl+K', action: 'openCommandPalette', enabled: true },
  { id: 'new-note', label: 'New Note', keys: 'Ctrl+N', action: 'newNote', enabled: true },
  { id: 'daily-note', label: 'Go to Daily Note', keys: 'Ctrl+D', action: 'goDaily', enabled: true },
  { id: 'search', label: 'Search', keys: 'Ctrl+Shift+F', action: 'goSearch', enabled: true },
  { id: 'graph', label: 'Graph View', keys: 'Ctrl+G', action: 'goGraph', enabled: true },
  { id: 'bold', label: 'Bold', keys: 'Ctrl+B', action: 'bold', enabled: true },
  { id: 'italic', label: 'Italic', keys: 'Ctrl+I', action: 'italic', enabled: true },
  { id: 'strikethrough', label: 'Strikethrough', keys: 'Ctrl+Shift+S', action: 'strikethrough', enabled: true },
]

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  accent: 'indigo',
  fontSize: 'default',
  sidebarCollapsed: false,
  showLineNumbers: false,

  editorWidth: 'default',
  slashCommands: true,
  markdownShortcuts: true,
  spellCheck: true,
  autoSaveInterval: 0,
  showBlockControls: true,
  typewriterMode: false,

  dailyNoteTemplate: '',
  weekStartsOn: 'monday',

  startPage: 'home',
  commandPalette: true,

  macros: [],
  shortcuts: DEFAULT_SHORTCUTS,
}

const STORAGE_KEY = 'lumora-settings'

// ── Context ────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
  addMacro: (macro: Omit<Macro, 'id'>) => void
  updateMacro: (id: string, patch: Partial<Macro>) => void
  removeMacro: (id: string) => void
  updateShortcut: (id: string, patch: Partial<KeyboardShortcut>) => void
  resetSettings: () => void
  resolvedTheme: 'light' | 'dark'
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  addMacro: () => {},
  updateMacro: () => {},
  removeMacro: () => {},
  updateShortcut: () => {},
  resetSettings: () => {},
  resolvedTheme: 'light',
})

export function useSettings() {
  return useContext(SettingsContext)
}

// ── Provider ───────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          // Ensure shortcuts always have the defaults as base
          shortcuts: DEFAULT_SHORTCUTS.map((ds) => {
            const saved = parsed.shortcuts?.find((s: KeyboardShortcut) => s.id === ds.id)
            return saved ? { ...ds, ...saved } : ds
          }),
        }))
      }
    } catch {}
    setLoaded(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }
  }, [settings, loaded])

  // Theme side-effects
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      const resolved = settings.theme === 'system' ? (mq.matches ? 'dark' : 'light') : settings.theme
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [settings.theme])

  // Accent side-effect
  useEffect(() => {
    document.documentElement.dataset.accent = settings.accent
  }, [settings.accent])

  // Font size side-effect
  useEffect(() => {
    document.documentElement.dataset.fontSize = settings.fontSize
  }, [settings.fontSize])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const addMacro = useCallback((macro: Omit<Macro, 'id'>) => {
    setSettings((prev) => ({
      ...prev,
      macros: [...prev.macros, { ...macro, id: crypto.randomUUID() }],
    }))
  }, [])

  const updateMacro = useCallback((id: string, patch: Partial<Macro>) => {
    setSettings((prev) => ({
      ...prev,
      macros: prev.macros.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [])

  const removeMacro = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      macros: prev.macros.filter((m) => m.id !== id),
    }))
  }, [])

  const updateShortcut = useCallback((id: string, patch: Partial<KeyboardShortcut>) => {
    setSettings((prev) => ({
      ...prev,
      shortcuts: prev.shortcuts.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        addMacro,
        updateMacro,
        removeMacro,
        updateShortcut,
        resetSettings,
        resolvedTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
