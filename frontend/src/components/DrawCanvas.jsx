import { useEffect, useRef, useState } from 'react'
import { DRAW_TIME_SECONDS } from '../lib/gameRules'
import useSwipe from '../lib/useSwipe'

const SIZE = 600

// Track: 0-10 = white→light grey, 10-54 = pastels, 54-90 = vivid, 90-100 = dark→black
const TRACK =
  'linear-gradient(to right,' +
  'white 0%,#ccc 10%,' +
  'hsl(0,65%,80%) 11%,hsl(90,65%,80%) 22%,hsl(180,65%,80%) 33%,hsl(270,65%,80%) 44%,hsl(360,65%,80%) 54%,' +
  'hsl(0,85%,45%) 55%,hsl(90,85%,45%) 65%,hsl(180,85%,45%) 73%,hsl(270,85%,45%) 82%,hsl(360,85%,45%) 90%,' +
  '#555 95%,black 100%)'

function sliderColour(v) {
  if (v <= 10) return `hsl(0,0%,${100 - v * 2}%)`
  if (v <= 54) return `hsl(${Math.round(((v - 10) / 44) * 360)},65%,80%)`
  if (v <= 90) return `hsl(${Math.round(((v - 54) / 36) * 360)},85%,45%)`
  return `hsl(0,0%,${Math.round((100 - v) * 4.5)}%)`
}

export default function DrawCanvas({ item, swipesAgo, onSubmit }) {
  const canvasRef = useRef(null)
  const painting = useRef(false)
  const submitted = useRef(false)
  const [val, setVal] = useState(55)
  const colour = sliderColour(val)
  const [secondsLeft, setSecondsLeft] = useState(DRAW_TIME_SECONDS)

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

  const stop = () => { painting.current = false }

  const done = () => {
    if (submitted.current) return
    submitted.current = true
    onSubmit(canvasRef.current.toDataURL('image/png'))
  }

  // Swipe up on the tools strip = submit · swipe down = clear
  const toolsSwipe = useSwipe({ onUp: done, onDown: fillWhite })

  return (
    <div className="draw">
      <div className="draw-head">
        <p className="prompt">
          <strong>{swipesAgo} swipe{swipesAgo === 1 ? '' : 's'} ago</strong>{' '}
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

      <div className="tools-wrap">
        <div className="colour-slider-wrap">
          <span className="colour-dot" style={{ background: colour }} />
          <input
            type="range"
            className="colour-slider"
            min={0}
            max={100}
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            style={{ background: TRACK }}
          />
        </div>
        <div className="draw-swipe-zone" {...toolsSwipe}>
          <span className="draw-hint-up">↑ submit</span>
          <span className="draw-hint-down">↓ clear</span>
        </div>
      </div>
    </div>
  )
}
