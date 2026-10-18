import { useState } from 'react'
import SwipeDeck from './SwipeDeck'

const CARDS = [
  { id: 'gender', emoji: '♂️ ♀️', title: 'Male or female?', left: 'Male', right: 'Female' },
  { id: 'casual', emoji: '👕', title: 'Casual', left: 'skip', right: 'like' },
  { id: 'sportswear', emoji: '🏃', title: 'Sportswear', left: 'skip', right: 'like' },
  { id: 'party', emoji: '🎉', title: 'Party', left: 'skip', right: 'like' },
  { id: 'pyjamas', emoji: '😴', title: 'Pyjamas', left: 'skip', right: 'like' },
]

function SetupFace({ item }) {
  return (
    <div className="setup-face">
      <span className="setup-emoji">{item.emoji}</span>
      <span className="setup-title">{item.title}</span>
      <span className="setup-sides">
        <span>&larr; {item.left}</span>
        <span>{item.right} &rarr;</span>
      </span>
    </div>
  )
}

const stamps = (card) => ({ left: card.left.toUpperCase(), right: card.right.toUpperCase() })

export default function Setup({ onDone }) {
  const [step, setStep] = useState(0)
  const [gender, setGender] = useState(null)
  const [styles, setStyles] = useState([])

  const handleSwipe = (card, dir) => {
    const nextGender = card.id === 'gender' ? (dir === 'left' ? 'male' : 'female') : gender
    const nextStyles = card.id !== 'gender' && dir === 'right' ? [...styles, card.id] : styles
    if (step === CARDS.length - 1) {
      onDone({ gender: nextGender, styles: nextStyles })
      return
    }
    setGender(nextGender)
    setStyles(nextStyles)
    setStep(step + 1)
  }

  const onGender = step === 0

  return (
    <div className="setup">
      {!onGender && <h2 className="setup-heading">Choose styles you like</h2>}
      <SwipeDeck
        items={CARDS.slice(step)}
        onSwipe={handleSwipe}
        Face={SetupFace}
        stamps={stamps}
        hint={onGender ? 'Swipe left for male, right for female' : 'Swipe right to like, left to skip'}
      />
    </div>
  )
}
