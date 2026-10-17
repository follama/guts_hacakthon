import { assetUrl } from '../lib/api'

export default function Basket({ items, onClose }) {
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="basket">
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
        <button className="primary" onClick={onClose}>
          Keep swiping
        </button>
      )}
    </div>
  )
}
