import { useEffect, useRef, useState } from 'react'
import { SWIPES_BEFORE_DRAW, SECONDS_BEFORE_DRAW, randomInt } from '../lib/gameRules'

// Fires after a random number of swipes OR a random timer, whichever comes first.
// TODO: call reset() after each drawing round; decide which pending item gets drawn.
export function useDrawTrigger(swipeCount, enabled = true) {
  const [triggered, setTriggered] = useState(false)
  const target = useRef(null)

  const reset = () => {
    target.current = {
      swipes: swipeCount + randomInt(SWIPES_BEFORE_DRAW.min, SWIPES_BEFORE_DRAW.max),
      seconds: randomInt(SECONDS_BEFORE_DRAW.min, SECONDS_BEFORE_DRAW.max),
    }
    setTriggered(false)
  }

  useEffect(() => {
    if (enabled && !target.current) reset()
  }, [enabled])

  useEffect(() => {
    if (enabled && target.current && swipeCount >= target.current.swipes) setTriggered(true)
  }, [swipeCount, enabled])

  useEffect(() => {
    if (!enabled || triggered || !target.current) return
    const id = setTimeout(() => setTriggered(true), target.current.seconds * 1000)
    return () => clearTimeout(id)
  }, [enabled, triggered])

  return { triggered, reset }
}
