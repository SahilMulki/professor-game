import { useState } from 'react'
import { evaluateTextResponse } from '../claudeApi.js'

function effectLabel(key) {
  const names = { participation: 'Participation', learning: 'Learning', popularity: 'Popularity' }
  return names[key] || key
}

function ChoiceMode({ event, onChoose }) {
  return (
    <>
      <p className="event-prompt">How do you respond?</p>
      <div className="event-choices">
        {event.choices.map((choice, i) => (
          <button
            key={i}
            className="choice-btn"
            onClick={() => onChoose(event, choice)}
          >
            <span className="choice-label">{choice.label}</span>
            <span className="choice-desc">{choice.description}</span>
            <span className="choice-effects">
              {Object.keys(choice.effects || {}).length === 0
                ? <span className="effect-tag effect-neutral">No effect</span>
                : Object.entries(choice.effects).map(([key, val]) => {
                    if (key === 'disableAudio') return <span key={key} className="effect-tag effect-bad">Audio disabled</span>
                    if (typeof val !== 'number') return null
                    return (
                      <span key={key} className={`effect-tag ${val > 0 ? 'effect-good' : 'effect-bad'}`}>
                        {val > 0 ? '+' : ''}{val} {effectLabel(key)}
                      </span>
                    )
                  })
              }
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

function TextMode({ event, onTextResolved }) {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [result, setResult] = useState(null)

  async function handleSubmit() {
    if (!response.trim()) return
    setLoading(true)
    try {
      const deltas = await evaluateTextResponse(event.id, event.description, response.trim())
      setResult(deltas)
      setFeedback(deltas.feedback)
    } catch {
      setResult({ participationDelta: 2, learningDelta: 2, popularityDelta: 1, hiddenImpactDelta: 0, quality: 'good', reasoning: '', feedback: 'The class responded positively.' })
      setFeedback('The class responded positively.')
    } finally {
      setLoading(false)
    }
  }

  function handleConfirm() {
    if (result) onTextResolved(event, result, result.quality, response.trim())
  }

  return (
    <>
      <p className="event-prompt">{event.textPrompt}</p>
      {!feedback ? (
        <>
          <textarea
            className="text-response-input"
            placeholder="Type the players' response here..."
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={4}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !response.trim()}
          >
            {loading ? 'Evaluating…' : 'Submit Response'}
          </button>
          {loading && <p className="text-response-loading">Claude is evaluating the response…</p>}
        </>
      ) : (
        <div className="text-response-result">
          <div className={`text-response-quality quality-${result.quality}`}>
            {result.quality === 'excellent' ? '⭐ Excellent' : result.quality === 'good' ? '✓ Good' : '✗ Poor'}
          </div>
          {result.reasoning && (
            <p className="text-response-reasoning">{result.reasoning}</p>
          )}
          <p className="text-response-feedback">{feedback}</p>
          <div className="text-response-effects">
            {result.participationDelta !== 0 && (
              <span className={`effect-tag ${result.participationDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                {result.participationDelta > 0 ? '+' : ''}{result.participationDelta} Participation
              </span>
            )}
            {result.learningDelta !== 0 && (
              <span className={`effect-tag ${result.learningDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                {result.learningDelta > 0 ? '+' : ''}{result.learningDelta} Learning
              </span>
            )}
            {result.popularityDelta !== 0 && (
              <span className={`effect-tag ${result.popularityDelta > 0 ? 'effect-good' : 'effect-bad'}`}>
                {result.popularityDelta > 0 ? '+' : ''}{result.popularityDelta} Popularity
              </span>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Continue
          </button>
        </div>
      )}
    </>
  )
}

export default function EventOverlay({ event, onChoose, onTextResolved }) {
  if (!event) return null

  const isText = event.responseType === 'text'

  return (
    <div className="event-overlay">
      <div className={`event-card ${isText ? 'event-text-card' : 'event-choice-card'}`}>
        {event.rolledDiceTotal && (
          <div className="dice-roll-badge">🎲 Rolled a {event.rolledDiceTotal}</div>
        )}
        <div className="event-title">{event.title}</div>
        <p className="event-desc">{event.description}</p>

        {isText
          ? <TextMode event={event} onTextResolved={onTextResolved} />
          : <ChoiceMode event={event} onChoose={onChoose} />
        }
      </div>
    </div>
  )
}
