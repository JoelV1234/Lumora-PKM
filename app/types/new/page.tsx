'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { DynamicIcon } from '@/components/icon'
import type { PropertyDefinition, PropertyType } from '@/lib/types'

const ICON_OPTIONS = [
  'FileText', 'Star', 'Heart', 'Bookmark', 'Flag', 'Tag',
  'Folder', 'Package', 'Box', 'Globe', 'Map', 'Compass',
  'Music', 'Film', 'Camera', 'Mic', 'Award', 'Zap',
  'Coffee', 'Briefcase', 'Target', 'Puzzle', 'Layers', 'Database',
]

const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#f59e0b', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
]

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'multiline', label: 'Multi-line Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select' },
  { value: 'multiSelect', label: 'Multi-select' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'tags', label: 'Tags' },
]

export default function NewTypePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('FileText')
  const [color, setColor] = useState('#6366f1')
  const [properties, setProperties] = useState<PropertyDefinition[]>([])

  const addProperty = () => {
    setProperties([
      ...properties,
      { id: crypto.randomUUID(), name: '', type: 'text' },
    ])
  }

  const updateProperty = (index: number, updates: Partial<PropertyDefinition>) => {
    setProperties(
      properties.map((p, i) => (i === index ? { ...p, ...updates } : p))
    )
  }

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!name.trim()) return
    const id = name.toLowerCase().replace(/\s+/g, '-')
    const now = new Date().toISOString()

    await db.objectTypes.add({
      id,
      name: name.trim(),
      icon,
      color,
      builtIn: false,
      properties: properties.filter((p) => p.name.trim()),
      createdAt: now,
      updatedAt: now,
    })

    router.push(`/objects/${id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-muted hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <h1 className="mb-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        New Object Type
      </h1>

      {/* Name */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium text-muted">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Recipe, Movie, Article..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {/* Icon */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium text-muted">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((i) => (
            <button
              key={i}
              onClick={() => setIcon(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                icon === i
                  ? 'border-accent bg-accent/10'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700'
              }`}
            >
              <DynamicIcon name={i} size={18} style={{ color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium text-muted">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full transition-transform ${
                color === c ? 'scale-110 ring-2 ring-accent ring-offset-2 dark:ring-offset-zinc-950' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Properties */}
      <div className="mb-8">
        <label className="mb-2 block text-xs font-medium text-muted">
          Properties
        </label>
        <div className="flex flex-col gap-2">
          {properties.map((prop, i) => (
            <div
              key={prop.id}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <input
                value={prop.name}
                onChange={(e) => updateProperty(i, { name: e.target.value })}
                placeholder="Property name"
                className="flex-1 bg-transparent px-2 py-1 text-sm outline-none"
              />
              <select
                value={prop.type}
                onChange={(e) =>
                  updateProperty(i, { type: e.target.value as PropertyType })
                }
                className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeProperty(i)}
                className="text-zinc-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addProperty}
            className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-muted transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:hover:border-zinc-500"
          >
            <Plus size={14} />
            Add property
          </button>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Object Type
      </button>
    </div>
  )
}
