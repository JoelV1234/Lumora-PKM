'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Plus, Clock, FileText, ArrowRight } from 'lucide-react'
import { useRecentObjects, useObjectTypes, useObjects } from '@/lib/hooks'
import { createObject, getOrCreateDailyNote } from '@/lib/db'
import { DynamicIcon } from '@/components/icon'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HomePage() {
  const router = useRouter()
  const recentObjects = useRecentObjects(8)
  const objectTypes = useObjectTypes()
  const tasks = useObjects('task')
  const openTasks = tasks.filter((t) => !t.properties.done)

  const today = new Date().toISOString().split('T')[0]

  const handleGoToDaily = async () => {
    await getOrCreateDailyNote(today)
    router.push('/daily')
  }

  const handleNewObject = async (typeId: string) => {
    const type = objectTypes.find((t) => t.id === typeId)
    const obj = await createObject(typeId, `Untitled ${type?.name ?? 'Object'}`)
    router.push(`/objects/${typeId}/${obj.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Good {getGreeting()}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={handleGoToDaily}
          className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-accent/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-accent/30"
        >
          <Calendar size={22} className="text-accent" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Daily Note
          </span>
        </button>
        {objectTypes
          .filter((t) => !['daily-note', 'task'].includes(t.id))
          .slice(0, 3)
          .map((type) => (
            <button
              key={type.id}
              onClick={() => handleNewObject(type.id)}
              className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-accent/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-accent/30"
            >
              <DynamicIcon
                name={type.icon}
                size={22}
                style={{ color: type.color }}
              />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                New {type.name}
              </span>
            </button>
          ))}
      </div>

      {/* Open Tasks */}
      {openTasks.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Open Tasks
            </h2>
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {openTasks.slice(0, 5).map((task) => (
              <button
                key={task.id}
                onClick={() => router.push(`/objects/task/${task.id}`)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="h-4 w-4 rounded border-2 border-zinc-300 dark:border-zinc-600" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  {task.title}
                </span>
                {task.properties.priority && (
                  <span
                    className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${
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
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent Objects */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Clock size={14} className="text-muted" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recently Updated
          </h2>
        </div>
        {recentObjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
            <FileText size={32} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-muted">
              No objects yet. Create your first note or open today&apos;s daily note to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {recentObjects.map((obj) => {
              const type = objectTypes.find((t) => t.id === obj.typeId)
              return (
                <button
                  key={obj.id}
                  onClick={() => router.push(`/objects/${obj.typeId}/${obj.id}`)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {type && (
                    <DynamicIcon
                      name={type.icon}
                      size={16}
                      style={{ color: type.color }}
                    />
                  )}
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {obj.title}
                  </span>
                  <span className="ml-auto text-xs text-muted">
                    {formatDate(obj.updatedAt)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
