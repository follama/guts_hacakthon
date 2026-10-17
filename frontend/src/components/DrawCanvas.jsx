import { useRef } from 'react'

// Minimal drawing surface.
// TODO: colour picker, brush sizes, 30s countdown (DRAW_TIME_SECONDS), auto-submit on timeout.
export default function DrawCanvas({ onSubmit }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scale = canvasRef.current.width / rect.width
    return [(e.clientX - rect.left) * scale, (e.clientY - rect.top) * scale]
  }

  const start = (e) => {
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(...pos(e))
  }

  const move = (e) => {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineTo(...pos(e))
    ctx.stroke()
  }

  const stop = () => {
    drawing.current = false
  }

  const submit = () => onSubmit(canvasRef.current.toDataURL('image/png'))

  return (
    <div className="panel">
      <h2>Draw it from memory</h2>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerLeave={stop}
      />
      <button onClick={submit}>Submit drawing</button>
    </div>
  )
}
