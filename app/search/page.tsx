'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, X } from 'lucide-react'
import { useSearch, useObjectTypes, useRecentObjects } from '@/lib/hooks'
import { DynamicIcon } from '@/components/icon'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const results = useSearch(query)
  const objectTypes = useObjectTypes()
  const recentObjects = useRecentObjects(20)
  const router = useRouter()

  const filteredResults = typeFilter === 'all'
    ? results
    : results.filter((r) => r.typeId === typeFilter)

  const displayItems = query.length >= 2 ? filteredResults : recentObjects

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Search
      </h1>

      {/* Search Input */}
      <div className="relative mb-4">
        <SearchIcon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search objects..."
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition-colors focus:border-accent dark:border-zinc-700 dark:bg-zinc-900"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="mb-6 flex flex-wrap gap-1">
        <button
          onClick={() => setTypeFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            typeFilter === 'all'
              ? 'bg-accent/10 text-accent'
              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {objectTypes
          .filter((t) => t.id !== 'daily-note')
          .map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === type.id
                  ? 'bg-accent/10 text-accent'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              <DynamicIcon name={type.icon} size={12} style={{ color: type.color }} />
              {type.name}
            </button>
          ))}
      </div>

      {/* Results */}
      {query.length >= 2 && (
        <p className="mb-3 text-xs text-muted">
          {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
        </p>
      )}
      {query.length < 2 && (
        <p className="mb-3 text-xs text-muted">Recent</p>
      )}

      <div className="flex flex-col gap-1">
        {displayItems.map((obj) => {
          const type = objectTypes.find((t) => t.id === obj.typeId)
          return (
            <button
              key={obj.id}
              onClick={() => {
                if (obj.typeId === 'daily-note') {
                  router.push(`/daily?date=${obj.dailyDate}`)
                } else {
                  router.push(`/objects/${obj.typeId}/${obj.id}`)
                }
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              {type && (
                <DynamicIcon
                  name={type.icon}
                  size={16}
                  style={{ color: type.color }}
                  className="shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-100">
                  {obj.title}
                </div>
                {obj.blocks[0]?.content && (
                  <div className="mt-0.5 text-xs text-muted truncate">
                    {obj.blocks[0].content.replace(/<[^>]*>/g, '').slice(0, 80)}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted shrink-0">
                {type?.name}
              </span>
            </button>
          )
        })}
        {query.length >= 2 && filteredResults.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            No results found for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>
    </div>
  )
}
