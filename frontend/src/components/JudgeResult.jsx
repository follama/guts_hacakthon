import { useRef } from 'react'
import { assetUrl } from '../lib/api'

const PASS_MSGS = [
  'Well done, you seem to remember what the item was. Added to the basket just for you!',
  'Not bad at all! Clearly you have an eye for fashion. It\'s yours.',
  'Okay okay, we see you! That\'s going straight in the basket.',
  'Your memory is lowkey impressive. Added!',
  'That\'s close enough — item secured!',
  'You actually remembered it! Into the basket it goes.',
]

const FAIL_MSGS = [
  "That was super inaccurate, guess you don't want it as much as you seemed like.",
  "Hmm… that could have been anything. Better luck next time.",
  "Were you even looking? That one's gone.",
  "Bold attempt, but no. The item has been lost to the void.",
  "Your memory said no. So I say no. Moving on.",
  "That looked nothing like it. No item for you!",
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function JudgeResult({ result, judging }) {
  const { item, drawing, passed, judged } = result
  const msgRef = useRef(null)
  if (msgRef.current === null && !judging) {
    msgRef.current = pick(passed ? PASS_MSGS : FAIL_MSGS)
  }

  return (
    <div className="result">
      <div className="compare">
        <figure>
          <img src={drawing} alt="Your drawing" />
          <figcaption>Yours</figcaption>
        </figure>
        <figure>
          <img src={assetUrl(item.image_url)} alt={item.name} />
          <figcaption>Real</figcaption>
        </figure>
      </div>

      {judging ? (
        <p className="verdict">Judging&hellip;</p>
      ) : (
        <>
          <p className={`verdict ${passed ? 'pass' : 'fail'}`}>{msgRef.current}</p>
          {!judged && <p className="hint">Judge unavailable, so you keep it</p>}
        </>
      )}
    </div>
  )
}
