'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  Search,
  Network,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckSquare,
} from 'lucide-react'
import { useObjectTypes, useCollections } from '@/lib/hooks'
import { DynamicIcon } from './icon'
import { useState } from 'react'

const mainNav = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/daily', icon: Calendar, label: 'Daily Notes' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/graph', icon: Network, label: 'Graph' },
  { href: '/search', icon: Search, label: 'Search' },
]

export function Sidebar({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
  const pathname = usePathname()
  const objectTypes = useObjectTypes()
  const collections = useCollections()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const visibleTypes = objectTypes.filter(
    (t) => t.id !== 'daily-note' && t.id !== 'task'
  )

  return (
    <aside
      className={`flex h-full flex-col border-r border-zinc-200 bg-zinc-50/80 backdrop-blur-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900/80 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white text-xs font-bold">
              L
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Lumora
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-0.5 px-2">
        {mainNav.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                active
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Object Types */}
      {!collapsed && (
        <div className="mt-6 flex flex-col px-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Objects
            </span>
            <Link
              href="/types/new"
              className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            >
              <Plus size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-0.5">
            {visibleTypes.map((type) => {
              const active = pathname === `/objects/${type.id}`
              return (
                <Link
                  key={type.id}
                  href={`/objects/${type.id}`}
                  className={`flex h-8 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                    active
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <DynamicIcon name={type.icon} size={16} style={{ color: type.color }} />
                  <span>{type.name}s</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Collections */}
      {!collapsed && collections.length > 0 && (
        <div className="mt-6 flex flex-col px-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Collections
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="flex h-8 items-center gap-3 rounded-lg px-3 text-sm text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <FolderOpen size={16} />
                <span>{col.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="mt-auto border-t border-zinc-200 p-2 dark:border-zinc-800">
        <Link
          href="/settings"
          className={`flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
            pathname === '/settings'
              ? 'bg-accent/10 text-accent font-medium'
              : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Settings size={18} strokeWidth={1.5} />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
