import { useRef } from 'react'

export default function useSwipe({ onUp, onDown, onLeft, onRight, threshold = 50 } = {}) {
  const start = useRef(null)

  const begin = (x, y) => { start.current = { x, y } }
  const end = (x, y) => {
    if (!start.current) return
    const dx = x - start.current.x
    const dy = y - start.current.y
    start.current = null
    if (Math.abs(dy) >= Math.abs(dx)) {
      if (dy < -threshold && onUp)    onUp()
      if (dy >  threshold && onDown)  onDown()
    } else {
      if (dx >  threshold && onRight) onRight()
      if (dx < -threshold && onLeft)  onLeft()
    }
  }

  return {
    onTouchStart: (e) => begin(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd:   (e) => end(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
    onMouseDown:  (e) => begin(e.clientX, e.clientY),
    onMouseUp:    (e) => end(e.clientX, e.clientY),
  }
}
