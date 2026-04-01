'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize, Filter } from 'lucide-react'
import { useObjects, useAllLinks, useObjectTypes } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import type { LumoraObject, ObjectType, Link } from '@/lib/types'

interface GraphNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  label: string
  typeId: string
  color: string
  icon: string
}

interface GraphEdge {
  source: string
  target: string
}

export default function GraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const objects = useObjects()
  const links = useAllLinks()
  const objectTypes = useObjectTypes()
  const router = useRouter()

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const nodesRef = useRef<GraphNode[]>([])
  const edgesRef = useRef<GraphEdge[]>([])
  const animRef = useRef<number>(0)

  // Build graph data
  useEffect(() => {
    const typeMap = new Map(objectTypes.map((t) => [t.id, t]))
    const filteredObjects =
      filterType === 'all'
        ? objects
        : objects.filter((o) => o.typeId === filterType)

    const objectIds = new Set(filteredObjects.map((o) => o.id))
    const w = canvasRef.current?.width ?? 800
    const h = canvasRef.current?.height ?? 600

    nodesRef.current = filteredObjects.map((obj, i) => {
      const existing = nodesRef.current.find((n) => n.id === obj.id)
      const type = typeMap.get(obj.typeId)
      return {
        id: obj.id,
        x: existing?.x ?? w / 2 + (Math.random() - 0.5) * 400,
        y: existing?.y ?? h / 2 + (Math.random() - 0.5) * 400,
        vx: 0,
        vy: 0,
        label: obj.title,
        typeId: obj.typeId,
        color: type?.color ?? '#6366f1',
        icon: type?.icon ?? 'FileText',
      }
    })

    edgesRef.current = links
      .filter((l) => objectIds.has(l.sourceId) && objectIds.has(l.targetId))
      .map((l) => ({ source: l.sourceId, target: l.targetId }))
  }, [objects, links, objectTypes, filterType])

  // Force simulation + render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? 800
      canvas.height = canvas.parentElement?.clientHeight ?? 600
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const w = canvas.width
      const h = canvas.height

      // Force simulation
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 500 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          nodes[i].vx -= fx
          nodes[i].vy -= fy
          nodes[j].vx += fx
          nodes[j].vy += fy
        }
      }

      const nodeMap = new Map(nodes.map((n) => [n.id, n]))
      for (const edge of edges) {
        const s = nodeMap.get(edge.source)
        const t = nodeMap.get(edge.target)
        if (!s || !t) continue
        const dx = t.x - s.x
        const dy = t.y - s.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (dist - 150) * 0.005
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        s.vx += fx
        s.vy += fy
        t.vx -= fx
        t.vy -= fy
      }

      // Center gravity
      for (const node of nodes) {
        node.vx += (w / 2 - node.x) * 0.001
        node.vy += (h / 2 - node.y) * 0.001
        node.vx *= 0.9
        node.vy *= 0.9
        node.x += node.vx
        node.y += node.vy
      }

      // Render
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.translate(pan.x, pan.y)
      ctx.scale(zoom, zoom)

      // Edges
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--border')
        .trim() || '#e4e4e7'
      ctx.lineWidth = 1
      for (const edge of edges) {
        const s = nodeMap.get(edge.source)
        const t = nodeMap.get(edge.target)
        if (!s || !t) continue
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)
        ctx.stroke()
      }

      // Nodes
      for (const node of nodes) {
        const isHovered = hoveredNode === node.id
        const radius = isHovered ? 8 : 6

        // Glow
        if (isHovered) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, 16, 0, Math.PI * 2)
          ctx.fillStyle = node.color + '20'
          ctx.fill()
        }

        // Circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // Label
        ctx.font = `${isHovered ? '12' : '10'}px system-ui`
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--foreground')
          .trim() || '#09090b'
        ctx.textAlign = 'center'
        ctx.fillText(
          node.label.length > 20 ? node.label.slice(0, 20) + '...' : node.label,
          node.x,
          node.y + radius + 14
        )
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [zoom, pan, hoveredNode])

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left - pan.x) / zoom
      const my = (e.clientY - rect.top - pan.y) / zoom

      if (dragging) {
        setPan({
          x: pan.x + (e.clientX - dragStart.x),
          y: pan.y + (e.clientY - dragStart.y),
        })
        setDragStart({ x: e.clientX, y: e.clientY })
        return
      }

      let found: string | null = null
      for (const node of nodesRef.current) {
        const dx = mx - node.x
        const dy = my - node.y
        if (dx * dx + dy * dy < 100) {
          found = node.id
          break
        }
      }
      setHoveredNode(found)
      canvas.style.cursor = found ? 'pointer' : 'grab'
    },
    [zoom, pan, dragging, dragStart]
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!hoveredNode) return
      const node = nodesRef.current.find((n) => n.id === hoveredNode)
      if (!node) return
      if (node.typeId === 'daily-note') {
        router.push('/daily')
      } else {
        router.push(`/objects/${node.typeId}/${node.id}`)
      }
    },
    [hoveredNode, router]
  )

  return (
    <div className="relative flex h-full flex-col">
      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z / 1.2, 0.3))}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => {
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Maximize size={16} />
          </button>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 rounded-lg border border-zinc-200 bg-white/90 px-3 text-sm shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90"
        >
          <option value="all">All types</option>
          {objectTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}s
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-3 rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/90">
        {objectTypes
          .filter((t) => filterType === 'all' || t.id === filterType)
          .slice(0, 8)
          .map((t) => (
            <div key={t.id} className="flex items-center gap-1.5 text-xs text-muted">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              {t.name}
            </div>
          ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1"
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
        onMouseDown={(e) => {
          if (!hoveredNode) {
            setDragging(true)
            setDragStart({ x: e.clientX, y: e.clientY })
          }
        }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onWheel={(e) => {
          e.preventDefault()
          const factor = e.deltaY > 0 ? 0.95 : 1.05
          setZoom((z) => Math.max(0.3, Math.min(3, z * factor)))
        }}
      />

      {objects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted">
            Create some objects and link them to see the graph
          </p>
        </div>
      )}
    </div>
  )
}
