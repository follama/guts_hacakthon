import useSwipe from '../lib/useSwipe'

export default function WelcomePage({ onStart }) {
  const swipe = useSwipe({ onUp: onStart })

  return (
    <div className="welcome" {...swipe}>
      <p className="welcome-pre">WELCOME TO</p>

      <img
        className="welcome-logo"
        src="/fs_logo_main.png"
        alt="FitSketch logo"
      />

      <p className="welcome-tagline">swipe it, sketch it, earn it.</p>

      <div className="swipe-hint">
        <span className="swipe-arrow">↑</span>
        <span>swipe up to start</span>
      </div>
    </div>
  )
}
