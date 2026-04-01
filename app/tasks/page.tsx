'use client'

import { useRouter } from 'next/navigation'
import { Plus, CheckSquare } from 'lucide-react'
import { useObjects } from '@/lib/hooks'
import { createObject, updateObject } from '@/lib/db'
import { useState } from 'react'

type TaskFilter = 'all' | 'today' | 'upcoming'

export default function TasksPage() {
  const router = useRouter()
  const tasks = useObjects('task')
  const [filter, setFilter] = useState<TaskFilter>('all')

  const today = new Date().toISOString().split('T')[0]

  const filtered = tasks.filter((t) => {
    if (t.properties.done) return false
    if (filter === 'today') {
      return t.properties.dueDate === today
    }
    if (filter === 'upcoming') {
      return t.properties.dueDate && (t.properties.dueDate as string) >= today
    }
    return true
  })

  const completedTasks = tasks.filter((t) => t.properties.done)

  const handleCreate = async () => {
    const obj = await createObject('task', 'Untitled Task')
    router.push(`/objects/task/${obj.id}`)
  }

  const handleToggle = async (id: string, done: boolean) => {
    await updateObject(id, {
      properties: {
        ...tasks.find((t) => t.id === id)?.properties,
        done: !done,
      },
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare size={24} className="text-green-500" />
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Tasks
          </h1>
        </div>
        <button
          onClick={handleCreate}
          className="flex h-8 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
        {(['all', 'today', 'upcoming'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-1">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            No tasks to show
          </div>
        )}
        {filtered.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <button
              onClick={() => handleToggle(task.id, !!task.properties.done)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-zinc-300 transition-colors hover:border-accent dark:border-zinc-600"
            />
            <button
              onClick={() => router.push(`/objects/task/${task.id}`)}
              className="flex-1 text-left text-sm text-zinc-700 dark:text-zinc-300"
            >
              {task.title}
            </button>
            {task.properties.priority && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  task.properties.priority === 'High'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : task.properties.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {String(task.properties.priority)}
              </span>
            )}
            {task.properties.dueDate && (
              <span className="text-xs text-muted">
                {String(task.properties.dueDate)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Completed */}
      {completedTasks.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-muted hover:text-zinc-600 dark:hover:text-zinc-300">
            Completed ({completedTasks.length})
          </summary>
          <div className="mt-2 flex flex-col gap-1">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <button
                  onClick={() => handleToggle(task.id, true)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-accent bg-accent text-white"
                >
                  <CheckSquare size={10} />
                </button>
                <span className="text-sm text-muted line-through">
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
