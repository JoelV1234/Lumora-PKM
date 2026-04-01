'use client'

import type { PropertyDefinition, PropertyValue } from '@/lib/types'
import { X, Plus } from 'lucide-react'
import { useState } from 'react'

interface PropertyEditorProps {
  definitions: PropertyDefinition[]
  values: Record<string, PropertyValue>
  onChange: (values: Record<string, PropertyValue>) => void
}

export function PropertyEditor({ definitions, values, onChange }: PropertyEditorProps) {
  const updateValue = (propId: string, value: PropertyValue) => {
    onChange({ ...values, [propId]: value })
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      {definitions.map((def) => (
        <div key={def.id} className="flex items-center gap-3">
          <label className="w-28 shrink-0 text-xs font-medium text-muted">
            {def.name}
          </label>
          <div className="flex-1">
            <PropertyInput
              definition={def}
              value={values[def.id]}
              onChange={(v) => updateValue(def.id, v)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function PropertyInput({
  definition,
  value,
  onChange,
}: {
  definition: PropertyDefinition
  value: PropertyValue
  onChange: (v: PropertyValue) => void
}) {
  const [tagInput, setTagInput] = useState('')

  switch (definition.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <input
          type={definition.type === 'email' ? 'email' : definition.type === 'url' ? 'url' : 'text'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={definition.name}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
        />
      )
    case 'multiline':
      return (
        <textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={definition.name}
          rows={3}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800 resize-none"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={(value as number) ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
        />
      )
    case 'date':
      return (
        <input
          type="date"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
        />
      )
    case 'checkbox':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-accent focus:ring-accent"
          />
        </label>
      )
    case 'select':
      return (
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="">Select...</option>
          {definition.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    case 'multiSelect':
    case 'tags':
      const tags = Array.isArray(value) ? (value as string[]) : []
      return (
        <div className="flex flex-wrap items-center gap-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
            >
              {tag}
              <button
                onClick={() => onChange(tags.filter((_, j) => j !== i))}
                className="text-accent/50 hover:text-accent"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <div className="flex items-center">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault()
                  onChange([...tags, tagInput.trim()])
                  setTagInput('')
                }
              }}
              placeholder="Add..."
              className="w-20 bg-transparent px-1 py-0.5 text-xs outline-none"
            />
          </div>
        </div>
      )
    default:
      return (
        <input
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-800"
        />
      )
  }
}
