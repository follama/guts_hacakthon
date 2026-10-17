import { useEffect, useState } from 'react'
import { checkHealth, scoreDrawing } from './lib/api'
import SwipeDeck from './components/SwipeDeck'
import DrawCanvas from './components/DrawCanvas'
import JudgeResult from './components/JudgeResult'
import EndScreen from './components/EndScreen'

const SCREENS = ['swipe', 'draw', 'result', 'end']

// Flow: swipe -> draw -> result -> back to swipe ... -> end
// The nav buttons are a dev aid for jumping between screens; remove once the game loop exists.
export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [screen, setScreen] = useState('swipe')
  const [result, setResult] = useState(null)

  useEffect(() => {
    checkHealth()
      .then((data) => setBackendStatus(data.status))
      .catch((err) => setBackendStatus(`unreachable (${err.message})`))
  }, [])

  // Temporary: scores against a dummy item to prove the frontend/backend round trip.
  const handleSubmit = async (drawing) => {
    try {
      const res = await scoreDrawing({
        itemId: 'test-item',
        itemImageUrl: 'https://example.com/item.jpg',
        drawing,
      })
      setResult(res)
      setScreen('result')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <main className="app">
      <header>
        <h1>FitSketch</h1>
        <p className="muted">Backend: {backendStatus}</p>
        <nav>
          {SCREENS.map((s) => (
            <button key={s} className={screen === s ? 'active' : ''} onClick={() => setScreen(s)}>
              {s}
            </button>
          ))}
        </nav>
      </header>

      {screen === 'swipe' && <SwipeDeck />}
      {screen === 'draw' && <DrawCanvas onSubmit={handleSubmit} />}
      {screen === 'result' && <JudgeResult result={result} />}
      {screen === 'end' && <EndScreen />}
    </main>
  )
}
