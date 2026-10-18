import { assetUrl } from '../lib/api'

export default function JudgeResult({ result, judging }) {
  const { item, drawing, passed, judged } = result

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
          <p className={`verdict ${passed ? 'pass' : 'fail'}`}>
            {passed
              ? 'Well done, you seem to remember what the item was. Added to the basket just for you!'
              : "That was super inaccurate, guess you don't want it as much as you seemed like."}
          </p>
          {!judged && <p className="hint">Judge unavailable, so you keep it</p>}
        </>
      )}
    </div>
  )
}
