'use client'

import { useEffect, useRef } from 'react'

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  pulse: number
}

type Packet = {
  from: number
  to: number
  progress: number
  speed: number
}

function readForegroundRGB(): { r: number; g: number; b: number } {
  if (typeof window === 'undefined') return { r: 245, g: 245, b: 244 }
  const hex = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return { r: 245, g: 245, b: 244 }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  }
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const colorRef = useRef({ r: 245, g: 245, b: 244 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    colorRef.current = readForegroundRGB()

    // Suit le thème actif (clair/sombre) sans redémarrer l'animation
    const observer = new MutationObserver(() => {
      colorRef.current = readForegroundRGB()
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let packets: Packet[] = []
    let animationId = 0
    const CONNECT_DIST = 150

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(Math.floor((width * height) / 9000), 220)
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.6 + 0.6,
        pulse: Math.random() * Math.PI * 2,
      }))
      packets = []
    }

    const spawnPacket = () => {
      if (nodes.length < 2 || packets.length > 24) return
      const from = Math.floor(Math.random() * nodes.length)
      let best = -1
      let bestDist = Number.POSITIVE_INFINITY
      for (let i = 0; i < nodes.length; i++) {
        if (i === from) continue
        const dx = nodes[i].x - nodes[from].x
        const dy = nodes[i].y - nodes[from].y
        const d = dx * dx + dy * dy
        if (d < bestDist && d < CONNECT_DIST * CONNECT_DIST * 4) {
          bestDist = d
          best = i
        }
      }
      if (best >= 0) {
        packets.push({ from, to: best, progress: 0, speed: 0.008 + Math.random() * 0.012 })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const mouse = mouseRef.current
      const { r, g, b } = colorRef.current

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        n.pulse += 0.02

        // Gentle attraction to mouse
        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180 && dist > 0.001) {
          n.x += (dx / dist) * 0.25
          n.y += (dy / dist) * 0.25
        }

        if (n.x < -20) n.x = width + 20
        if (n.x > width + 20) n.x = -20
        if (n.y < -20) n.y = height + 20
        if (n.y > height + 20) n.y = -20
      }

      // Connections
      ctx.lineWidth = 0.9
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.4
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        const glow = 0.5 + Math.sin(n.pulse) * 0.3
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.55 * glow + 0.3})`
        ctx.fill()
      }

      // Traffic packets
      if (Math.random() < 0.08) spawnPacket()
      packets = packets.filter((p) => p.progress <= 1)
      for (const p of packets) {
        p.progress += p.speed
        const a = nodes[p.from]
        const b2 = nodes[p.to]
        if (!a || !b2) continue
        const x = a.x + (b2.x - a.x) * p.progress
        const y = a.y + (b2.y - a.y) * p.progress
        ctx.beginPath()
        ctx.arc(x, y, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Mouse halo
      if (mouse.x > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220)
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.06)`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(mouse.x - 220, mouse.y - 220, 440, 440)
      }

      animationId = requestAnimationFrame(draw)
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseout', onMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseout', onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}

