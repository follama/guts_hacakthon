// TODO: compute from game state. regretSaved = total price of items that failed judging.
export default function EndScreen({ remembered = [], basketTotal = 0, regretSaved = 0 }) {
  return (
    <div className="panel">
      <h2>Session over</h2>
      <p>Items remembered: {remembered.length}</p>
      <p>Basket total: £{basketTotal.toFixed(2)}</p>
      <p>Regret saved: £{regretSaved.toFixed(2)}</p>
    </div>
  )
}
