import { useEffect, useRef, useState } from 'react'
import { computeScore } from '../gameLogic.js'
import { EVENT_POOL } from '../eventSystem.js'
import StatBar from '../components/StatBar.jsx'
import StarRating from '../components/StarRating.jsx'

const GRADE_COLORS = {
  S: '#d69e2e',
  A: '#38a169',
  B: '#3182ce',
  C: '#805ad5',
  D: '#dd6b20',
  F: '#e53e3e',
}

const LS_KEY = 'professorGame_eventCounts'

export default function FinalScoreScreen({ gameState, onPlayAgain }) {
  const { participation, learning, popularity, currentDay, totalDays, wonGame, dayHistory } = gameState
  const { grade, message } = computeScore(wonGame, currentDay, totalDays, participation, learning)
  const gradeColor = GRADE_COLORS[grade]

  const [eventCounts, setEventCounts] = useState({})
  const didUpdate = useRef(false)

  useEffect(() => {
    if (didUpdate.current) return
    didUpdate.current = true

    const stored = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
    const allRecords = dayHistory.flatMap(d => d.choiceRecords || [])
    for (const rec of allRecords) {
      if (!stored[rec.eventId]) stored[rec.eventId] = {}
      const key = String(rec.choiceIndex)
      stored[rec.eventId][key] = (stored[rec.eventId][key] || 0) + 1
    }
    localStorage.setItem(LS_KEY, JSON.stringify(stored))
    setEventCounts(stored)
  }, [])

  const avgEngagement = dayHistory.length > 0
    ? Math.round(dayHistory.reduce((s, d) => s + d.finalEngagementRatio, 0) / dayHistory.length * 100)
    : 0

  const totalEvents = dayHistory.reduce((s, d) => s + d.eventsTriggered.length, 0)

  // All choice records across the whole game, in order
  const allChoiceRecords = dayHistory.flatMap(d => d.choiceRecords || [])

  return (
    <div className="screen screen-finalscore">
      <div className="screen-content">
        <div className="final-header">
          <div className="grade-display" style={{ color: gradeColor, borderColor: gradeColor }}>
            {grade}
          </div>
          <h1>{wonGame ? 'Semester Complete!' : 'Semester Over'}</h1>
          <p className="final-message">{message}</p>
        </div>

        <div className="final-stats">
          <StatBar label="Final Participation" value={participation} color="#38a169" />
          <StatBar label="Final Learning" value={learning} color="#3182ce" />
          <div className="popularity-row">
            <span>Final Popularity</span>
            <StarRating value={popularity} />
          </div>
        </div>

        <div className="final-summary">
          <div className="summary-item">
            <span className="summary-label">Days Played</span>
            <span className="summary-value">{Math.min(currentDay, totalDays)} / {totalDays}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg. Engagement</span>
            <span className="summary-value">{avgEngagement}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Events Encountered</span>
            <span className="summary-value">{totalEvents}</span>
          </div>
        </div>

        {allChoiceRecords.length > 0 && (
          <div className="decisions-section">
            <h3 className="decisions-heading">Your Decisions</h3>
            <p className="decisions-subhead">How your choices compare to all players.</p>
            {allChoiceRecords.map((rec, i) => {
              const eventDef = EVENT_POOL.find(e => e.id === rec.eventId)
              if (!eventDef) return null
              const counts = eventCounts[rec.eventId] || {}
              const total = eventDef.choices.reduce((s, _, ci) => s + (counts[String(ci)] || 0), 0)
              const hasData = total > 0

              return (
                <div key={i} className="decision-card">
                  <div className="decision-event-title">{rec.eventTitle}</div>
                  <div className="decision-choices">
                    {eventDef.choices.map((choice, ci) => {
                      const count = counts[String(ci)] || 0
                      const pct = hasData ? Math.round(count / total * 100) : null
                      const isYours = ci === rec.choiceIndex

                      return (
                        <div key={ci} className={`decision-choice ${isYours ? 'decision-choice-yours' : ''}`}>
                          <div className="decision-choice-header">
                            <span className="decision-choice-label">{choice.label}</span>
                            {isYours && <span className="decision-yours-badge">Your choice</span>}
                            {hasData
                              ? <span className="decision-choice-pct">{pct}%</span>
                              : <span className="decision-choice-pct decision-first">first!</span>
                            }
                          </div>
                          {hasData && (
                            <div className="decision-bar-track">
                              <div
                                className={`decision-bar-fill ${isYours ? 'decision-bar-yours' : ''}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!wonGame && (
          <div className="retry-hint">
            Tip: Invest in audio equipment early — it helps every lecture from day one.
          </div>
        )}

        <button className="btn btn-primary btn-large" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  )
}
