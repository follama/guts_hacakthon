import useSwipe from '../lib/useSwipe'

export default function TransitionPage({ onContinue }) {
  const swipe = useSwipe({ onUp: onContinue })

  return (
    <div className="transition-page" {...swipe}>
      <div className="swipe-hint">
        <span className="swipe-arrow">↑</span>
        <span>swipe up to start swiping</span>
      </div>
    </div>
  )
}
