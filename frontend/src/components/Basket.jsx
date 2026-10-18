import { assetUrl } from '../lib/api'
import useSwipe from '../lib/useSwipe'

function BasketItem({ item, onRemove }) {
  const swipe = useSwipe({
    onLeft: onRemove,
    onRight: item.url ? () => window.open(item.url, '_blank', 'noreferrer') : undefined,
  })
  return (
    <li {...swipe} className="basket-item">
      <img src={assetUrl(item.image_url)} alt="" />
      <span className="card-name">{item.name}</span>
      <span className="card-price">£{item.price.toFixed(2)}</span>
    </li>
  )
}

export default function Basket({ items, onClose, onRemove, onGame }) {
  const total = items.reduce((sum, item) => sum + item.price, 0)
  const closeSwipe = useSwipe({ onDown: onClose || undefined })
  const gameSwipe = useSwipe({ onUp: onGame || undefined })

  return (
    <div className="basket" {...closeSwipe}>
      {items.length === 0 && <p className="hint">Nothing remembered yet.</p>}

      <ul className="basket-list">
        {items.map((item, i) => (
          <BasketItem key={`${item.id}-${i}`} item={item} onRemove={() => onRemove(i)} />
        ))}
      </ul>

      {items.length > 0 && (
        <>
          <p className="total">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </p>
          <p className="basket-remove-hint">← remove · shop →</p>
        </>
      )}

      <div className="basket-nav" {...gameSwipe}>
        <div className="swipe-hint">
          <span className="swipe-arrow">↑</span>
          <span>FitSlash Mini Game</span>
        </div>
        {onClose && (
          <div className="swipe-hint swipe-hint--down">
            <span>Swipe Down to Keep FitSketching</span>
            <span className="swipe-arrow">↓</span>
          </div>
        )}
      </div>
    </div>
  )
}
