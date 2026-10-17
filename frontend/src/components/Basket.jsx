import { assetUrl } from '../lib/api'
import useSwipe from '../lib/useSwipe'

export default function Basket({ items, onClose }) {
  const total = items.reduce((sum, item) => sum + item.price, 0)
  const swipe = useSwipe({ onDown: onClose || undefined })

  return (
    <div className="basket" {...swipe}>
      {items.length === 0 && <p className="hint">Nothing remembered yet.</p>}

      <ul className="basket-list">
        {items.map((item, i) => (
          <li key={`${item.id}-${i}`}>
            <img src={assetUrl(item.image_url)} alt="" />
            {item.url ? (
              <a className="card-name" href={item.url} target="_blank" rel="noreferrer">
                {item.name}
              </a>
            ) : (
              <span className="card-name">{item.name}</span>
            )}
            <span className="card-price">£{item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <p className="total">
        <span>Total</span>
        <span>£{total.toFixed(2)}</span>
      </p>

      {onClose && (
        <div className="swipe-hint swipe-hint--down">
          <span>swipe down to keep swiping</span>
          <span className="swipe-arrow">↓</span>
        </div>
      )}
    </div>
  )
}
