import { useEffect, useRef, useState } from 'react'
import useSwipe from '../lib/useSwipe'

const DURATION = 30
const EMOJIS = ['👗', '👔', '👕', '👖', '🧥', '👒', '👠', '👟', '🧣', '🧤', '👜', '🩱', '🩲', '🧦', '👗']
const ITEM_RADIUS = 38
const SLASH_DIST = 44
const W = 400
const H = 540

let uid = 0

function spawnItem() {
  const x = ITEM_RADIUS + Math.random() * (W - ITEM_RADIUS * 2)
  return {
    id: uid++,
    x,
    y: H + ITEM_RADIUS,
    vx: (Math.random() - 0.5) * 5,
    vy: -(11 + Math.random() * 8),
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    slashed: false,
    alpha: 1,
  }
}

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

export default function SlashGame({ onBack }) {
  const canvasRef = useRef(null)
  const gs = useRef({
    items: [], trail: [], score: 0,
    timeLeft: DURATION, lastSpawn: 0, spawnInterval: 1200, over: false,
  })
  const lastPos = useRef(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [over, setOver] = useState(false)

  const hudSwipe = useSwipe({ onDown: onBack })

  const replay = () => {
    gs.current.items = []
    gs.current.trail = []
    gs.current.score = 0
    gs.current.timeLeft = DURATION
    gs.current.lastSpawn = 0
    gs.current.spawnInterval = 1200
    gs.current.over = false
    lastPos.current = null
    setScore(0)
    setTimeLeft(DURATION)
    setOver(false)
  }

  const overSwipe = useSwipe({ onRight: replay })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const s = gs.current
    let raf

    const loop = (now) => {
      const dt = Math.min((now - (loop.last ?? now)) / 1000, 0.05)
      loop.last = now

      if (!s.over) {
        s.timeLeft -= dt
        if (s.timeLeft <= 0) { s.timeLeft = 0; s.over = true; setOver(true) }
        setTimeLeft(Math.ceil(s.timeLeft))

        if (now - s.lastSpawn > s.spawnInterval) {
          s.items.push(spawnItem())
          s.lastSpawn = now
          s.spawnInterval = Math.max(450, 1200 - (DURATION - s.timeLeft) * 22)
        }
      }

      const GRAV = 22
      s.items = s.items.filter(item => {
        if (item.slashed) { item.alpha -= dt * 4; return item.alpha > 0 }
        item.vy += GRAV * dt
        item.x += item.vx
        item.y += item.vy
        return item.y < H + ITEM_RADIUS * 2
      })

      s.trail = s.trail.filter(p => { p.age += dt; return p.age < 0.18 })

      // ── draw ──────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H)

      // dark gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0d1b2a')
      bg.addColorStop(1, '#112233')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // items
      for (const item of s.items) {
        ctx.save()
        ctx.globalAlpha = item.slashed ? item.alpha : 1
        if (!item.slashed) {
          // glow ring
          const glow = ctx.createRadialGradient(item.x, item.y, ITEM_RADIUS * 0.5, item.x, item.y, ITEM_RADIUS * 1.3)
          glow.addColorStop(0, 'rgba(91,159,194,0.25)')
          glow.addColorStop(1, 'rgba(91,159,194,0)')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(item.x, item.y, ITEM_RADIUS * 1.3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.font = `${ITEM_RADIUS * 1.4}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.emoji, item.x, item.y)
        if (item.slashed) {
          ctx.strokeStyle = `rgba(255,255,255,${item.alpha * 0.9})`
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(item.x - ITEM_RADIUS * 0.8, item.y - ITEM_RADIUS * 0.3)
          ctx.lineTo(item.x + ITEM_RADIUS * 0.8, item.y + ITEM_RADIUS * 0.3)
          ctx.stroke()
        }
        ctx.restore()
      }

      // slash trail
      if (s.trail.length > 1) {
        ctx.save()
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        for (let i = 1; i < s.trail.length; i++) {
          const a = s.trail[i - 1], b = s.trail[i]
          const t = 1 - b.age / 0.18
          ctx.strokeStyle = `rgba(255,255,255,${t * 0.85})`
          ctx.lineWidth = t * 7 + 1
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
        ctx.restore()
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const canvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = W / rect.width, sy = H / rect.height
    const src = e.touches ? e.touches[0] : e
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy, age: 0 }
  }

  const slash = (from, to) => {
    const s = gs.current
    if (!from || s.over) return
    for (const item of s.items) {
      if (item.slashed) continue
      if (segDist(item.x, item.y, from.x, from.y, to.x, to.y) < SLASH_DIST) {
        item.slashed = true
        s.score++
        setScore(s.score)
      }
    }
  }

  const onDown = (e) => {
    e.preventDefault()
    const p = canvasPos(e)
    lastPos.current = p
    gs.current.trail.push(p)
  }
  const onMove = (e) => {
    if (!lastPos.current) return
    e.preventDefault()
    const p = canvasPos(e)
    slash(lastPos.current, p)
    lastPos.current = p
    gs.current.trail.push(p)
  }
  const onUp = () => { lastPos.current = null }

  return (
    <div className="slash-wrap">
      <div className="slash-hud" {...hudSwipe}>
        <span className="slash-score">⚔️ {score}</span>
        <span className="slash-back-strip">↓ Back to Basket</span>
        <span className={`slash-timer ${timeLeft <= 5 ? 'urgent' : ''}`}>{timeLeft}s</span>
      </div>

      <canvas
        ref={canvasRef}
        width={W} height={H}
        className="slash-canvas"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />

      {over && (
        <div className="slash-over" {...overSwipe}>
          <p className="slash-over-title">Time&rsquo;s up!</p>
          <p className="slash-over-score">You slashed {score} item{score !== 1 ? 's' : ''}</p>
          <p>{score >= 15 ? '🔥 Fashion ninja!' : score >= 8 ? '✂️ Not bad!' : '👎 Keep practising'}</p>
          <div className="swipe-hint" style={{ marginTop: 16 }}>
            <span>swipe right to play again</span>
            <span className="swipe-arrow">→</span>
          </div>
        </div>
      )}
    </div>
  )
}
