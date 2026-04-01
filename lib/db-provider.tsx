'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { initializeDatabase } from './db'

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initializeDatabase().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-zinc-400">Loading Lumora...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
