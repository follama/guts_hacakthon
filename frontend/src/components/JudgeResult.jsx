export default function JudgeResult({ result }) {
  if (!result) return <div className="panel muted">No drawing judged yet.</div>
  return (
    <div className="panel">
      <h2>{result.score}/100</h2>
      <p>&ldquo;{result.roast}&rdquo;</p>
      <p>{result.passed ? 'Added to basket' : 'Item vanished'}</p>
    </div>
  )
}
