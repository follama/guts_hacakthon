import { useEffect, useState } from 'react'
import { fetchItems, scoreDrawing } from './lib/api'
import { RESULT_SECONDS, SWIPES_BEFORE_DRAW, pickItems, shuffle } from './lib/gameRules'
import SwipeDeck from './components/SwipeDeck'
import DrawCanvas from './components/DrawCanvas'
import JudgeResult from './components/JudgeResult'
import Basket from './components/Basket'
import SlashGame from './components/SlashGame'
import WelcomePage from './components/WelcomePage'
import Setup from './components/Setup'
import useSwipe from './lib/useSwipe'

// welcome -> setup -> swipe -> draw -> judging -> result -> swipe ..., with basket on demand.
export default function App() {
  const [catalogue, setCatalogue] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [deck, setDeck] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [phase, setPhase] = useState('welcome')
  const [pending, setPending] = useState([])
  const [basket, setBasket] = useState([])
  const [swipeCount, setSwipeCount] = useState(0)
  const [lastDrawAt, setLastDrawAt] = useState(0)
  const [target, setTarget] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchItems()
      .then(setCatalogue)
      .catch((err) => setLoadError(err.message))
  }, [])

  // The deck is built once both the catalogue and the setup answers are in,
  // whichever arrives last.
  useEffect(() => {
    if (catalogue && prefs && deck === null) setDeck(shuffle(pickItems(catalogue, prefs)))
  }, [catalogue, prefs, deck])

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
    setResult({ item, drawing })
    setPhase('judging')
    try {
      const res = await scoreDrawing({ itemId: item.id, drawing })
      if (res.passed) setBasket((b) => [...b, item])
      setResult({ item, drawing, passed: res.passed, judged: res.judged })
    } catch {
      // Backend unreachable: keep the item rather than punish the player.
      setBasket((b) => [...b, item])
      setResult({ item, drawing, passed: true, judged: false })
    }
    setPhase('result')
  }

  // Must be called before any early returns (Rules of Hooks)
  const headerSwipe = useSwipe({ onDown: phase === 'swipe' ? () => setPhase('basket') : undefined })

  if (phase === 'welcome') return <WelcomePage onStart={() => setPhase('setup')} />

  return (
    <main className="app">
      <header {...headerSwipe}>
        <h1>FitSketch</h1>
        {phase === 'swipe' && (
          <div className="basket-hint">
            <span>🛍️</span>
            <span>Basket {basket.length > 0 ? `(${basket.length})` : ''}</span>
            <span className="swipe-arrow" style={{ fontSize: '18px' }}>↓</span>
          </div>
        )}
      </header>

      {phase === 'setup' && (
        <Setup
          onDone={(answers) => {
            setPrefs(answers)
            setPhase('swipe')
          }}
        />
      )}

      {phase !== 'setup' && loadError && <p className="hint">Can&rsquo;t reach the backend: {loadError}</p>}
      {phase !== 'setup' && !loadError && deck === null && <p className="hint">Loading&hellip;</p>}
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
          {(phase === 'judging' || phase === 'result') && (
            <JudgeResult result={result} judging={phase === 'judging'} />
          )}
          {phase === 'basket' && (
            <Basket
              items={basket}
              onClose={deck.length > 0 ? () => setPhase('swipe') : null}
              onRemove={(i) => setBasket((b) => b.filter((_, idx) => idx !== i))}
              onGame={() => setPhase('slash')}
            />
          )}
          {phase === 'slash' && <SlashGame onBack={() => setPhase('basket')} />}
        </>
      )}
    </main>
  )
}
