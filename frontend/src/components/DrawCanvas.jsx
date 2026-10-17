import { useEffect, useRef, useState } from 'react'
import { COLOURS, DRAW_TIME_SECONDS } from '../lib/gameRules'

const SIZE = 600

export default function DrawCanvas({ item, swipesAgo, onSubmit }) {
  const canvasRef = useRef(null)
  const painting = useRef(false)
  const submitted = useRef(false)
  const [colour, setColour] = useState(COLOURS[0])
  const [secondsLeft, setSecondsLeft] = useState(DRAW_TIME_SECONDS)

  // Kept in a ref so a parent re-render never restarts the countdown.
  const submitRef = useRef(onSubmit)
  submitRef.current = onSubmit

  const fillWhite = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, SIZE, SIZE)
  }

  useEffect(fillWhite, [])

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!submitted.current) {
        submitted.current = true
        submitRef.current(canvasRef.current.toDataURL('image/png'))
      }
      return
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scale = SIZE / rect.width
    return [(e.clientX - rect.left) * scale, (e.clientY - rect.top) * scale]
  }

  const start = (e) => {
    painting.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(...pos(e))
  }

  const move = (e) => {
    if (!painting.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.strokeStyle = colour
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(...pos(e))
    ctx.stroke()
  }

  const stop = () => {
    painting.current = false
  }

  const done = () => {
    if (submitted.current) return
    submitted.current = true
    onSubmit(canvasRef.current.toDataURL('image/png'))
  }

  return (
    <div className="draw">
      <div className="draw-head">
        <p className="prompt">
          <strong>
            {swipesAgo} swipe{swipesAgo === 1 ? '' : 's'} ago
          </strong>{' '}
          you liked a <strong>{item.type}</strong>. Draw it to keep it.
        </p>
        <span className={`clock ${secondsLeft <= 10 ? 'urgent' : ''}`}>{secondsLeft}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />

      <div className="tools">
        {COLOURS.map((c) => (
          <button
            key={c}
            className={`swatch ${c === colour ? 'on' : ''}`}
            style={{ background: c }}
            aria-label={`colour ${c}`}
            onClick={() => setColour(c)}
          />
        ))}
        <button className="clear" onClick={fillWhite}>
          Clear
        </button>
      </div>

      <button className="primary" onClick={done}>
        Done
      </button>
    </div>
  )
}
