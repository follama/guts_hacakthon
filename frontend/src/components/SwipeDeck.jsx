import { useRef, useState } from 'react'
import { assetUrl } from '../lib/api'
import { SWIPE_THRESHOLD } from '../lib/gameRules'

function ProductFace({ item }) {
  return (
    <>
      <img src={assetUrl(item.image_url)} alt={item.name} draggable="false" />
      <div className="card-info">
        <span className="card-name">{item.name}</span>
        <span className="card-price">£{item.price.toFixed(2)}</span>
      </div>
    </>
  )
}

const KEEP_NOPE = { left: 'NOPE', right: 'KEEP' }

export default function SwipeDeck({
  items,
  onSwipe,
  Face = ProductFace,
  stamps = () => KEEP_NOPE,
  hint = 'Swipe right to add to basket, left to skip',
}) {
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
  const label = stamps(top)

  return (
    <>
      <div className="deck">
        {next && (
          <article className="card card-behind" key={next.id}>
            <Face item={next} />
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
          <Face item={top} />
          <span className="stamp keep" style={{ opacity: Math.max(0, offset / SWIPE_THRESHOLD) }}>
            {label.right}
          </span>
          <span className="stamp nope" style={{ opacity: Math.max(0, -offset / SWIPE_THRESHOLD) }}>
            {label.left}
          </span>
        </article>
      </div>

      <p className="hint">{hint}</p>
    </>
  )
}
