import { assetUrl } from '../lib/api'

export default function JudgeResult({ result }) {
  const { item, drawing, passed, error } = result

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

      <p className={`verdict ${passed ? 'pass' : 'fail'}`}>{passed ? 'Pass' : 'Fail'}</p>
      {error && <p className="hint">Judge unreachable: {error}</p>}
    </div>
  )
}
