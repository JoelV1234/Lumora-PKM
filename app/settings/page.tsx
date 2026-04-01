'use client'

import { useState } from 'react'
import {
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  Plus,
  X,
  Zap,
  Keyboard,
  RotateCcw,
  Upload,
  ChevronRight,
  Type,
  Palette,
  SlidersHorizontal,
  PenTool,
  Calendar,
  Navigation,
} from 'lucide-react'
import { useSettings, DEFAULT_SETTINGS, type Macro, type AppSettings } from '@/lib/settings'
import { db } from '@/lib/db'

type SettingsTab = 'appearance' | 'editor' | 'macros' | 'shortcuts' | 'daily' | 'navigation' | 'data'

const TABS: { id: SettingsTab; label: string; icon: typeof Palette }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'editor', label: 'Editor', icon: PenTool },
  { id: 'macros', label: 'Macros', icon: Zap },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'daily', label: 'Daily Notes', icon: Calendar },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'data', label: 'Data', icon: SlidersHorizontal },
]

export default function SettingsPage() {
  const { settings, updateSettings, addMacro, updateMacro, removeMacro, updateShortcut, resetSettings } = useSettings()
  const [tab, setTab] = useState<SettingsTab>('appearance')
  const [exporting, setExporting] = useState(false)

  return (
    <div className="flex h-full">
      {/* Sidebar tabs */}
      <nav className="w-52 shrink-0 border-r border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h1 className="mb-4 px-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <div className="flex flex-col gap-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                tab === id
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            onClick={() => {
              if (confirm('Reset all settings to defaults?')) resetSettings()
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <RotateCcw size={16} />
            Reset All
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-8 py-8">
          {tab === 'appearance' && <AppearanceSettings />}
          {tab === 'editor' && <EditorSettings />}
          {tab === 'macros' && <MacrosSettings />}
          {tab === 'shortcuts' && <ShortcutsSettings />}
          {tab === 'daily' && <DailySettings />}
          {tab === 'navigation' && <NavigationSettings />}
          {tab === 'data' && <DataSettings />}
        </div>
      </div>
    </div>
  )
}

// ── Appearance ─────────────────────────────────────────────────────

function AppearanceSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <>
      <SectionHeader title="Appearance" description="Customize how Lumora looks and feels." />

      <SettingsCard>
        <SettingsLabel label="Theme" description="Choose between light, dark, or match your system." />
        <div className="flex gap-2">
          {([
            { value: 'light' as const, icon: Sun, label: 'Light' },
            { value: 'dark' as const, icon: Moon, label: 'Dark' },
            { value: 'system' as const, icon: Monitor, label: 'System' },
          ]).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value })}
              className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                settings.theme === value
                  ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent/20'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard>
        <SettingsLabel label="Accent Color" description="Primary color used across the interface." />
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'indigo' as const, color: '#6366f1', label: 'Indigo' },
            { value: 'teal' as const, color: '#14b8a6', label: 'Teal' },
            { value: 'emerald' as const, color: '#10b981', label: 'Emerald' },
            { value: 'rose' as const, color: '#f43f5e', label: 'Rose' },
            { value: 'amber' as const, color: '#f59e0b', label: 'Amber' },
            { value: 'cyan' as const, color: '#06b6d4', label: 'Cyan' },
          ]).map(({ value, color, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ accent: value })}
              className={`flex items-center gap-2.5 rounded-lg border p-3 text-sm transition-all ${
                settings.accent === value
                  ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard>
        <SettingsLabel label="Font Size" description="Adjust the base font size for the entire app." />
        <div className="flex gap-2">
          {([
            { value: 'small' as const, label: 'Small', sample: 'Aa' },
            { value: 'default' as const, label: 'Default', sample: 'Aa' },
            { value: 'large' as const, label: 'Large', sample: 'Aa' },
          ]).map(({ value, label, sample }) => (
            <button
              key={value}
              onClick={() => updateSettings({ fontSize: value })}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                settings.fontSize === value
                  ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent/20'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              <span className={`font-semibold ${value === 'small' ? 'text-xs' : value === 'large' ? 'text-lg' : 'text-sm'}`}>
                {sample}
              </span>
              <span className="text-[11px]">{label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>
    </>
  )
}

// ── Editor ─────────────────────────────────────────────────────────

function EditorSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <>
      <SectionHeader title="Editor" description="Configure the writing and editing experience." />

      <SettingsCard>
        <SettingsLabel label="Editor Width" description="Maximum width of the content area." />
        <div className="flex gap-2">
          {([
            { value: 'narrow' as const, label: 'Narrow', desc: '640px' },
            { value: 'default' as const, label: 'Default', desc: '768px' },
            { value: 'wide' as const, label: 'Wide', desc: '960px' },
            { value: 'full' as const, label: 'Full', desc: '100%' },
          ]).map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => updateSettings({ editorWidth: value })}
              className={`flex flex-1 flex-col items-center rounded-lg border p-2.5 text-xs transition-all ${
                settings.editorWidth === value
                  ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent/20'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              <span className="font-medium">{label}</span>
              <span className="text-[10px] opacity-60">{desc}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard>
        <Toggle
          label="Slash Commands"
          description='Type "/" on an empty line to open the block menu.'
          checked={settings.slashCommands}
          onChange={(v) => updateSettings({ slashCommands: v })}
        />
      </SettingsCard>

      <SettingsCard>
        <Toggle
          label="Markdown Shortcuts"
          description='Type "#", "##", "-", "[]", ">", etc. followed by space to convert blocks.'
          checked={settings.markdownShortcuts}
          onChange={(v) => updateSettings({ markdownShortcuts: v })}
        />
      </SettingsCard>

      <SettingsCard>
        <Toggle
          label="Spell Check"
          description="Enable browser spell checking in the editor."
          checked={settings.spellCheck}
          onChange={(v) => updateSettings({ spellCheck: v })}
        />
      </SettingsCard>

      <SettingsCard>
        <Toggle
          label="Block Controls"
          description="Show the + and drag handle on hover."
          checked={settings.showBlockControls}
          onChange={(v) => updateSettings({ showBlockControls: v })}
        />
      </SettingsCard>

      <SettingsCard>
        <Toggle
          label="Typewriter Mode"
          description="Keep the active line centered vertically while typing."
          checked={settings.typewriterMode}
          onChange={(v) => updateSettings({ typewriterMode: v })}
        />
      </SettingsCard>

      <SettingsCard>
        <SettingsLabel label="Auto-save Delay" description="How quickly changes are saved. 0 = instant." />
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={settings.autoSaveInterval}
            onChange={(e) => updateSettings({ autoSaveInterval: Number(e.target.value) })}
            className="flex-1 accent-accent"
          />
          <span className="w-16 text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
            {settings.autoSaveInterval === 0 ? 'Instant' : `${settings.autoSaveInterval}s`}
          </span>
        </div>
      </SettingsCard>
    </>
  )
}

// ── Macros ──────────────────────────────────────────────────────────

function MacrosSettings() {
  const { settings, addMacro, updateMacro, removeMacro } = useSettings()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTrigger, setNewTrigger] = useState('')
  const [newContent, setNewContent] = useState('')

  const handleAdd = () => {
    if (!newName.trim() || !newTrigger.trim() || !newContent.trim()) return
    addMacro({ name: newName.trim(), trigger: newTrigger.trim(), content: newContent.trim(), enabled: true })
    setNewName('')
    setNewTrigger('')
    setNewContent('')
    setShowNew(false)
  }

  return (
    <>
      <SectionHeader
        title="Macros"
        description="Create text shortcuts that expand when you type a trigger word followed by space."
      />

      <div className="mb-4 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
        <strong className="text-accent">How macros work:</strong>{' '}
        Type the trigger text (e.g. <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-700">/sig</code>) in the editor. When you press{' '}
        <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium dark:border-zinc-600 dark:bg-zinc-700">Space</kbd>{' '}
        or{' '}
        <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium dark:border-zinc-600 dark:bg-zinc-700">Tab</kbd>
        , it will be replaced with the macro content.
      </div>

      {settings.macros.length === 0 && !showNew && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <Zap size={28} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">No macros yet</p>
          <p className="mb-4 text-xs text-muted">Create your first macro to speed up repetitive typing.</p>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            <Plus size={16} />
            Create Macro
          </button>
        </div>
      )}

      {/* Existing macros */}
      {settings.macros.map((macro) => (
        <SettingsCard key={macro.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{macro.name}</span>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-accent dark:bg-zinc-800">
                  {macro.trigger}
                </code>
              </div>
              <p className="mt-1 text-xs text-muted line-clamp-2">{macro.content}</p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleSmall
                checked={macro.enabled}
                onChange={(v) => updateMacro(macro.id, { enabled: v })}
              />
              <button
                onClick={() => removeMacro(macro.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </SettingsCard>
      ))}

      {/* New macro form */}
      {showNew && (
        <SettingsCard>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted">Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. My Signature"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
              <div className="w-32">
                <label className="mb-1 block text-xs font-medium text-muted">Trigger</label>
                <input
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="e.g. /sig"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="The text that will replace the trigger..."
                rows={3}
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || !newTrigger.trim() || !newContent.trim()}
                className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
              >
                Add Macro
              </button>
            </div>
          </div>
        </SettingsCard>
      )}

      {settings.macros.length > 0 && !showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2.5 text-sm text-muted transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
        >
          <Plus size={14} />
          Add macro
        </button>
      )}
    </>
  )
}

// ── Shortcuts ──────────────────────────────────────────────────────

function ShortcutsSettings() {
  const { settings, updateShortcut } = useSettings()
  const [editing, setEditing] = useState<string | null>(null)
  const [capturedKeys, setCapturedKeys] = useState('')

  const handleCapture = (id: string, e: React.KeyboardEvent) => {
    e.preventDefault()
    const parts: string[] = []
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
    if (e.altKey) parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key)
    }
    if (parts.length > 1) {
      const combo = parts.join('+')
      setCapturedKeys(combo)
      updateShortcut(id, { keys: combo })
      setEditing(null)
    }
  }

  return (
    <>
      <SectionHeader
        title="Keyboard Shortcuts"
        description="Customize key bindings. Click a shortcut to rebind it."
      />

      {settings.shortcuts.map((shortcut) => (
        <SettingsCard key={shortcut.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ToggleSmall
                checked={shortcut.enabled}
                onChange={(v) => updateShortcut(shortcut.id, { enabled: v })}
              />
              <span className="text-sm text-zinc-900 dark:text-zinc-100">{shortcut.label}</span>
            </div>
            {editing === shortcut.id ? (
              <input
                autoFocus
                placeholder="Press keys..."
                className="w-36 rounded-lg border border-accent bg-accent/5 px-3 py-1.5 text-center text-xs font-mono outline-none"
                onKeyDown={(e) => handleCapture(shortcut.id, e)}
                onBlur={() => setEditing(null)}
                readOnly
              />
            ) : (
              <button
                onClick={() => setEditing(shortcut.id)}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-mono text-zinc-600 transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {shortcut.keys}
              </button>
            )}
          </div>
        </SettingsCard>
      ))}
    </>
  )
}

// ── Daily Notes ────────────────────────────────────────────────────

function DailySettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <>
      <SectionHeader title="Daily Notes" description="Configure your daily note behavior." />

      <SettingsCard>
        <SettingsLabel label="Week Starts On" description="Choose the first day of the week for calendar views." />
        <div className="flex gap-2">
          {(['sunday', 'monday'] as const).map((d) => (
            <button
              key={d}
              onClick={() => updateSettings({ weekStartsOn: d })}
              className={`flex-1 rounded-lg border p-2.5 text-sm capitalize transition-all ${
                settings.weekStartsOn === d
                  ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent/20'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard>
        <SettingsLabel label="Daily Note Template" description="Default content for new daily notes. Leave blank for an empty note." />
        <textarea
          value={settings.dailyNoteTemplate}
          onChange={(e) => updateSettings({ dailyNoteTemplate: e.target.value })}
          placeholder={"e.g.\n## Morning\n\n## Tasks\n- [ ] \n\n## Notes"}
          rows={6}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
        />
      </SettingsCard>
    </>
  )
}

// ── Navigation ─────────────────────────────────────────────────────

function NavigationSettings() {
  const { settings, updateSettings } = useSettings()

  return (
    <>
      <SectionHeader title="Navigation" description="Control how you move around the app." />

      <SettingsCard>
        <SettingsLabel label="Start Page" description="What to show when the app first opens." />
        <div className="flex gap-2">
          {([
            { value: 'home' as const, label: 'Home' },
            { value: 'daily' as const, label: 'Daily Note' },
            { value: 'search' as const, label: 'Search' },
          ]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ startPage: value })}
              className={`flex-1 rounded-lg border p-2.5 text-sm transition-all ${
                settings.startPage === value
                  ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent/20'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard>
        <Toggle
          label="Command Palette"
          description="Enable the Ctrl+K command palette for quick navigation."
          checked={settings.commandPalette}
          onChange={(v) => updateSettings({ commandPalette: v })}
        />
      </SettingsCard>

      <SettingsCard>
        <Toggle
          label="Collapse Sidebar by Default"
          description="Start with the sidebar collapsed."
          checked={settings.sidebarCollapsed}
          onChange={(v) => updateSettings({ sidebarCollapsed: v })}
        />
      </SettingsCard>
    </>
  )
}

// ── Data ───────────────────────────────────────────────────────────

function DataSettings() {
  const [exporting, setExporting] = useState(false)

  const handleExportJSON = async () => {
    setExporting(true)
    try {
      const objects = await db.objects.toArray()
      const objectTypes = await db.objectTypes.toArray()
      const links = await db.links.toArray()
      const collections = await db.collections.toArray()
      const settingsRaw = localStorage.getItem('lumora-settings')

      const data = {
        objects,
        objectTypes,
        links,
        collections,
        settings: settingsRaw ? JSON.parse(settingsRaw) : null,
        exportedAt: new Date().toISOString(),
      }
      downloadFile(
        JSON.stringify(data, null, 2),
        `lumora-export-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      )
    } finally {
      setExporting(false)
    }
  }

  const handleExportMarkdown = async () => {
    setExporting(true)
    try {
      const objects = await db.objects.toArray()
      const lines: string[] = []
      for (const obj of objects) {
        lines.push(`# ${obj.title}\n`)
        for (const block of obj.blocks) {
          const text = block.content.replace(/<[^>]*>/g, '')
          switch (block.type) {
            case 'heading1': lines.push(`## ${text}`); break
            case 'heading2': lines.push(`### ${text}`); break
            case 'heading3': lines.push(`#### ${text}`); break
            case 'bulletList': lines.push(`- ${text}`); break
            case 'numberedList': lines.push(`1. ${text}`); break
            case 'todo': lines.push(`- [${block.properties?.checked === 'true' ? 'x' : ' '}] ${text}`); break
            case 'quote': lines.push(`> ${text}`); break
            case 'code': lines.push(`\`\`\`\n${text}\n\`\`\``); break
            case 'divider': lines.push('---'); break
            default: lines.push(text)
          }
        }
        lines.push('\n---\n')
      }
      downloadFile(
        lines.join('\n'),
        `lumora-export-${new Date().toISOString().split('T')[0]}.md`,
        'text/markdown'
      )
    } finally {
      setExporting(false)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.objectTypes) await db.objectTypes.bulkPut(data.objectTypes)
        if (data.objects) await db.objects.bulkPut(data.objects)
        if (data.links) await db.links.bulkPut(data.links)
        if (data.collections) await db.collections.bulkPut(data.collections)
        if (data.settings) localStorage.setItem('lumora-settings', JSON.stringify(data.settings))
        alert('Import complete! Refreshing...')
        window.location.reload()
      } catch {
        alert('Failed to import. Make sure it\'s a valid Lumora export file.')
      }
    }
    input.click()
  }

  const handleClearAll = async () => {
    if (confirm('Are you sure? This will delete ALL your data and cannot be undone.')) {
      if (confirm('Really? This is irreversible.')) {
        await db.objects.clear()
        await db.links.clear()
        await db.collections.clear()
        localStorage.removeItem('lumora-settings')
        window.location.reload()
      }
    }
  }

  return (
    <>
      <SectionHeader title="Data" description="Export, import, or delete your data." />

      <SettingsCard>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleExportJSON}
            disabled={exporting}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Download size={16} className="text-accent" />
            <div className="text-left">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">Export as JSON</div>
              <div className="text-xs text-muted">Full backup of all data and settings</div>
            </div>
          </button>

          <button
            onClick={handleExportMarkdown}
            disabled={exporting}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Download size={16} className="text-accent" />
            <div className="text-left">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">Export as Markdown</div>
              <div className="text-xs text-muted">All objects as a single Markdown file</div>
            </div>
          </button>

          <button
            onClick={handleImport}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <Upload size={16} className="text-accent" />
            <div className="text-left">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">Import from JSON</div>
              <div className="text-xs text-muted">Restore from a previous export</div>
            </div>
          </button>
        </div>
      </SettingsCard>

      <SettingsCard>
        <button
          onClick={handleClearAll}
          className="flex w-full items-center gap-3 rounded-lg border border-red-200 px-4 py-3 text-sm transition-colors hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
        >
          <Trash2 size={16} className="text-red-500" />
          <div className="text-left">
            <div className="font-medium text-red-600 dark:text-red-400">Delete all data</div>
            <div className="text-xs text-muted">Permanently remove all objects, settings, and links</div>
          </div>
        </button>
      </SettingsCard>

      {/* About */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <strong>Lumora</strong> — A calm, fast, and joyful second brain.
        </p>
        <p className="mt-1 text-xs text-muted">
          Open source. No AI. No payments. No tracking. Your data stays on your device.
        </p>
      </div>
    </>
  )
}

// ── Shared Components ──────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  )
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  )
}

function SettingsLabel({ label, description }: { label: string; description: string }) {
  return (
    <div className="mb-3">
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
      <div className="text-xs text-muted">{description}</div>
    </div>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
        <div className="text-xs text-muted">{description}</div>
      </div>
      <ToggleSmall checked={checked} onChange={onChange} />
    </div>
  )
}

function ToggleSmall({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-zinc-300 dark:bg-zinc-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
