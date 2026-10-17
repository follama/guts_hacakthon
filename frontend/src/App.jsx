import { useEffect, useState } from 'react'
import { fetchItems, scoreDrawing } from './lib/api'
import { RESULT_SECONDS, SWIPES_BEFORE_DRAW, shuffle } from './lib/gameRules'
import SwipeDeck from './components/SwipeDeck'
import DrawCanvas from './components/DrawCanvas'
import JudgeResult from './components/JudgeResult'
import Basket from './components/Basket'

// swipe -> draw -> judging -> result -> swipe ..., with basket on demand.
export default function App() {
  const [deck, setDeck] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [phase, setPhase] = useState('swipe')
  const [pending, setPending] = useState([])
  const [basket, setBasket] = useState([])
  const [swipeCount, setSwipeCount] = useState(0)
  const [lastDrawAt, setLastDrawAt] = useState(0)
  const [target, setTarget] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchItems()
      .then((items) => setDeck(shuffle(items)))
      .catch((err) => setLoadError(err.message))
  }, [])

  const emptyCatalogue = deck !== null && deck.length === 0 && swipeCount === 0

  const startDraw = () => {
    const [next, ...rest] = pending
    setTarget({ item: next.item, swipesAgo: swipeCount - next.swipeIndex + 1 })
    setPending(rest)
    setLastDrawAt(swipeCount)
    setPhase('draw')
  }

  // A drawing round every few swipes, and again for anything still pending
  // once the deck runs out.
  useEffect(() => {
    if (phase !== 'swipe' || deck === null || emptyCatalogue) return
    const deckEmpty = deck.length === 0
    const due = deckEmpty || swipeCount - lastDrawAt >= SWIPES_BEFORE_DRAW
    if (pending.length > 0 && due) startDraw()
    else if (deckEmpty) setPhase('basket')
  }, [phase, deck, pending, swipeCount, lastDrawAt, emptyCatalogue])

  useEffect(() => {
    if (phase !== 'result') return
    const id = setTimeout(() => setPhase('swipe'), RESULT_SECONDS * 1000)
    return () => clearTimeout(id)
  }, [phase])

  const handleSwipe = (item, dir) => {
    const index = swipeCount + 1
    setSwipeCount(index)
    setDeck((d) => d.slice(1))
    if (dir === 'right') setPending((p) => [...p, { item, swipeIndex: index }])
  }

  const handleSubmitDrawing = async (drawing) => {
    const { item } = target
    setPhase('judging')
    try {
      const res = await scoreDrawing({ itemId: item.id, drawing })
      if (res.passed) setBasket((b) => [...b, item])
      setResult({ item, drawing, passed: res.passed })
    } catch (err) {
      setResult({ item, drawing, passed: false, error: err.message })
    }
    setPhase('result')
  }

  return (
    <main className="app">
      <header>
        <h1>FitSketch</h1>
        <button className="basket-btn" disabled={phase !== 'swipe'} onClick={() => setPhase('basket')}>
          Basket {basket.length}
        </button>
      </header>

      {loadError && <p className="hint">Can&rsquo;t reach the backend: {loadError}</p>}
      {!loadError && deck === null && <p className="hint">Loading&hellip;</p>}
      {emptyCatalogue && (
        <p className="hint">
          No items yet. Put photos in <code>backend/catalogue/images/</code> and list them in{' '}
          <code>backend/catalogue/items.json</code>.
        </p>
      )}

      {deck !== null && !emptyCatalogue && (
        <>
          {phase === 'swipe' && <SwipeDeck items={deck} onSwipe={handleSwipe} />}
          {phase === 'draw' && (
            <DrawCanvas item={target.item} swipesAgo={target.swipesAgo} onSubmit={handleSubmitDrawing} />
          )}
          {phase === 'judging' && <p className="hint">Judging&hellip;</p>}
          {phase === 'result' && <JudgeResult result={result} />}
          {phase === 'basket' && (
            <Basket items={basket} onClose={deck.length > 0 ? () => setPhase('swipe') : null} />
          )}
        </>
      )}
    </main>
  )
}
