import { useRef, useState } from 'react'
import { assetUrl } from '../lib/api'
import { SWIPE_THRESHOLD } from '../lib/gameRules'

export default function SwipeDeck({ items, onSwipe }) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [flying, setFlying] = useState(null)
  const startX = useRef(0)

  const [top, next] = items
  if (!top) return null

  const down = (e) => {
    if (flying) return
    setDragging(true)
    startX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const move = (e) => {
    if (!dragging) return
    setDx(e.clientX - startX.current)
  }

  const up = () => {
    if (!dragging) return
    setDragging(false)
    if (Math.abs(dx) < SWIPE_THRESHOLD) {
      setDx(0)
      return
    }
    const dir = dx > 0 ? 'right' : 'left'
    setFlying(dir)
    setTimeout(() => {
      setFlying(null)
      setDx(0)
      onSwipe(top, dir)
    }, 220)
  }

  const offset = flying ? (flying === 'right' ? 1 : -1) * window.innerWidth : dx

  return (
    <>
      <div className="deck">
        {next && (
          <article className="card card-behind" key={next.id}>
            <img src={assetUrl(next.image_url)} alt="" draggable="false" />
            <div className="card-info">
              <span className="card-name">{next.name}</span>
              <span className="card-price">£{next.price.toFixed(2)}</span>
            </div>
          </article>
        )}

        <article
          className="card"
          key={top.id}
          style={{
            transform: `translateX(${offset}px) rotate(${offset * 0.04}deg)`,
            transition: dragging ? 'none' : 'transform 0.22s ease-out',
          }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <img src={assetUrl(top.image_url)} alt={top.name} draggable="false" />
          <span className="stamp keep" style={{ opacity: Math.max(0, offset / SWIPE_THRESHOLD) }}>
            KEEP
          </span>
          <span className="stamp nope" style={{ opacity: Math.max(0, -offset / SWIPE_THRESHOLD) }}>
            NOPE
          </span>
          <div className="card-info">
            <span className="card-name">{top.name}</span>
            <span className="card-price">£{top.price.toFixed(2)}</span>
          </div>
        </article>
      </div>

      <p className="hint">Swipe right to add to basket, left to skip</p>
    </>
  )
}
