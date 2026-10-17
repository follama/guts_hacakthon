// Placeholder: clothing cards and swipe gestures are not implemented yet.
// Expected props: items, onSwipeRight(item), onSwipeLeft(item), frozen
export default function SwipeDeck({ frozen = false }) {
  return (
    <div className="panel">
      <h2>Swipe deck</h2>
      <p className="muted">Clothing cards go here.{frozen ? ' (frozen for drawing)' : ''}</p>
    </div>
  )
}
